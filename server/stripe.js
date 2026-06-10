import Stripe from "stripe";
import { Router } from "express";
import { unpublishSite } from "./deploy.js";
import { sendPaymentReceiptEmail, sendPaymentFailedEmail } from "./email.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  credits_10: process.env.STRIPE_PRICE_CREDITS_10,
  credits_25: process.env.STRIPE_PRICE_CREDITS_25,
  credits_50: process.env.STRIPE_PRICE_CREDITS_50,
};

const CREDIT_AMOUNTS = {
  [process.env.STRIPE_PRICE_CREDITS_10]: 10,
  [process.env.STRIPE_PRICE_CREDITS_25]: 25,
  [process.env.STRIPE_PRICE_CREDITS_50]: 50,
};

const PLAN_CREDITS = {
  [process.env.STRIPE_PRICE_STARTER]: 10,
  [process.env.STRIPE_PRICE_PRO]: 25,
};

export function createStripeRoutes(supabase) {
  const router = Router();

  /**
   * POST /api/stripe/checkout
   * Creates a Stripe Checkout session for subscriptions or credit packs.
   *
   * Body: { priceKey: "starter"|"pro"|"credits_10"|"credits_25"|"credits_50", userId }
   */
  router.post("/checkout", async (req, res) => {
    const { priceKey, userId } = req.body;

    const priceId = PRICES[priceKey];
    if (!priceId) {
      return res.status(400).json({ error: "Invalid price key" });
    }
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const isSubscription = priceKey === "starter" || priceKey === "pro";

    try {
      // Find or create Stripe customer linked to this user
      const customerId = await getOrCreateCustomer(supabase, stripe, userId);

      const sessionParams = {
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: isSubscription ? "subscription" : "payment",
        success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard?checkout=success`,
        cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/pricing?checkout=cancelled`,
        metadata: { userId, priceKey },
      };

      if (isSubscription) {
        sessionParams.subscription_data = { metadata: { userId, priceKey } };
      } else {
        sessionParams.payment_intent_data = { metadata: { userId, priceKey } };
      }

      const session = await stripe.checkout.sessions.create(sessionParams);
      res.json({ url: session.url });
    } catch (err) {
      console.error("Checkout error:", err);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  /**
   * POST /api/stripe/portal
   * Creates a Stripe Customer Portal session for managing subscriptions.
   */
  router.post("/portal", async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", userId)
        .single();

      if (!profile?.stripe_customer_id) {
        return res.status(400).json({ error: "No Stripe customer found" });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard`,
      });

      res.json({ url: session.url });
    } catch (err) {
      console.error("Portal error:", err);
      res.status(500).json({ error: "Failed to create portal session" });
    }
  });

  return router;
}

/**
 * Stripe webhook handler — needs raw body, so it's registered separately.
 */
export function createWebhookHandler(supabase) {
  return async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case "checkout.session.completed":
          await handleCheckoutCompleted(supabase, event.data.object);
          break;

        case "customer.subscription.updated":
          await handleSubscriptionUpdated(supabase, event.data.object);
          break;

        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(supabase, event.data.object);
          break;

        case "invoice.payment_failed":
          await handlePaymentFailed(supabase, event.data.object);
          break;

        case "invoice.paid":
          await handleInvoicePaid(supabase, event.data.object);
          break;
      }
    } catch (err) {
      console.error(`Webhook handler error for ${event.type}:`, err);
    }

    res.json({ received: true });
  };
}

// ─── Webhook Handlers ───

async function handleCheckoutCompleted(supabase, session) {
  const userId = session.metadata?.userId;
  const priceKey = session.metadata?.priceKey;
  if (!userId) return;

  if (session.mode === "payment") {
    // Credit pack purchase — add credits
    const priceId = session.line_items
      ? session.line_items.data[0]?.price?.id
      : null;

    // Look up credits from priceKey since line_items may not be expanded
    const creditMap = { credits_10: 10, credits_25: 25, credits_50: 50 };
    const credits = creditMap[priceKey] || 0;

    if (credits > 0) {
      await supabase.rpc("add_credits", {
        p_user_id: userId,
        p_amount: credits,
        p_type: "purchase",
        p_to_purchased: true,
        p_description: `Purchased ${credits} credit pack`,
      });
      console.log(`Added ${credits} purchased credits for user ${userId}`);
    }
  }

  if (session.mode === "subscription") {
    // Subscription — update plan in profiles
    const plan = priceKey === "pro" ? "pro" : "starter";
    const monthlyCredits = plan === "pro" ? 25 : 10;

    await supabase
      .from("profiles")
      .update({
        plan,
        monthly_credits: monthlyCredits,
        stripe_subscription_id: session.subscription,
      })
      .eq("id", userId);

    console.log(`User ${userId} subscribed to ${plan}`);
  }
}

async function handleSubscriptionUpdated(supabase, subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const priceId = subscription.items?.data[0]?.price?.id;
  const plan = priceId === PRICES.pro ? "pro" : "starter";
  const monthlyCredits = plan === "pro" ? 25 : 10;

  const updates = {
    plan,
    monthly_credits: monthlyCredits,
    stripe_subscription_id: subscription.id,
  };

  if (subscription.status === "past_due" || subscription.status === "unpaid") {
    updates.plan_status = "past_due";
  } else if (subscription.status === "active") {
    updates.plan_status = "active";
  }

  await supabase.from("profiles").update(updates).eq("id", userId);
  console.log(`Subscription updated for user ${userId}: ${plan} (${subscription.status})`);
}

async function handleSubscriptionDeleted(supabase, subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await supabase
    .from("profiles")
    .update({
      plan: "free",
      monthly_credits: 0,
      plan_status: "cancelled",
      stripe_subscription_id: null,
    })
    .eq("id", userId);

  // Unpublish all sites on Cloudflare + DB
  const { data: sites } = await supabase
    .from("sites")
    .select("id, cloudflare_project_id")
    .eq("user_id", userId)
    .eq("status", "published");

  if (sites?.length) {
    for (const site of sites) {
      if (site.cloudflare_project_id) {
        try { await unpublishSite(site.cloudflare_project_id); } catch {}
      }
    }
    await supabase
      .from("sites")
      .update({ status: "unpublished" })
      .eq("user_id", userId)
      .eq("status", "published");
  }

  console.log(`Subscription cancelled for user ${userId} — ${sites?.length || 0} sites unpublished`);
}

async function handlePaymentFailed(supabase, invoice) {
  const customerId = invoice.customer;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (profile) {
    await supabase
      .from("profiles")
      .update({
        plan_status: "past_due",
        past_due_since: new Date().toISOString(),
      })
      .eq("id", profile.id);

    // Send payment failed email
    const { data: fullProfile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", profile.id)
      .single();

    if (fullProfile?.email) {
      sendPaymentFailedEmail(fullProfile.email, 7).catch((err) =>
        console.error("Failed to send payment failed email:", err)
      );
    }

    console.log(`Payment failed for user ${profile.id}`);
  }
}

async function handleInvoicePaid(supabase, invoice) {
  // Monthly renewal — reset monthly credits
  if (invoice.billing_reason === "subscription_cycle") {
    const customerId = invoice.customer;
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const priceId = subscription.items?.data[0]?.price?.id;
    const monthlyCredits = priceId === PRICES.pro ? 25 : 10;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (profile) {
      await supabase
        .from("profiles")
        .update({
          monthly_credits: monthlyCredits,
          plan_status: "active",
          past_due_since: null,
        })
        .eq("id", profile.id);

      // Send payment receipt
      const { data: emailProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", profile.id)
        .single();

      if (emailProfile?.email) {
        const amount = `$${(invoice.amount_paid / 100).toFixed(2)}`;
        const plan = priceId === PRICES.pro ? "Pro" : "Starter";
        sendPaymentReceiptEmail(
          emailProfile.email,
          amount,
          `${plan} plan — monthly subscription`,
          new Date(invoice.created * 1000).toLocaleDateString()
        ).catch((err) => console.error("Failed to send receipt:", err));
      }

      console.log(`Monthly credits reset to ${monthlyCredits} for user ${profile.id}`);
    }
  }
}

// ─── Helpers ───

async function getOrCreateCustomer(supabase, stripe, userId) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", userId)
    .single();

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  // Get email from auth
  const { data: { user } } = await supabase.auth.admin.getUserById(userId);

  const customer = await stripe.customers.create({
    email: user?.email || profile?.email,
    metadata: { userId },
  });

  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  return customer.id;
}
