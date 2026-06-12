import { MONTHLY_CREDITS } from "./stripe.js";

const CHECK_INTERVAL = 60 * 60 * 1000; // every hour

/**
 * Monthly credit reset for ANNUAL subscribers.
 *
 * Monthly subscribers get their credits reset by the Stripe invoice.paid
 * webhook each billing cycle. Annual subscribers only generate one invoice
 * per year, so this checker resets their credits every month based on
 * profiles.credits_reset_at.
 */
export function startCreditResetChecker(supabase) {
  async function check() {
    try {
      const now = new Date().toISOString();

      const { data: due } = await supabase
        .from("profiles")
        .select("id, plan")
        .eq("plan_interval", "annual")
        .eq("plan_status", "active")
        .in("plan", ["starter", "pro"])
        .lte("credits_reset_at", now);

      if (!due?.length) return;

      for (const profile of due) {
        const credits = MONTHLY_CREDITS[profile.plan];
        if (!credits) continue;

        const next = new Date();
        next.setMonth(next.getMonth() + 1);

        await supabase
          .from("profiles")
          .update({
            monthly_credits: credits,
            credits_reset_at: next.toISOString(),
          })
          .eq("id", profile.id);

        console.log(`Monthly credits reset to ${credits} for annual subscriber ${profile.id}`);
      }
    } catch (err) {
      console.error("Credit reset check error:", err);
    }
  }

  check();
  setInterval(check, CHECK_INTERVAL);
  console.log("Annual-plan credit reset checker: running hourly");
}
