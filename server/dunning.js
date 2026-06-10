import { unpublishSite } from "./deploy.js";
import { sendSiteUnpublishedEmail } from "./email.js";

const GRACE_PERIOD_DAYS = 7;
const CHECK_INTERVAL = 60 * 60 * 1000; // every hour

/**
 * Starts a recurring check for past-due accounts whose grace period has expired.
 * After 7 days of failed payment, unpublishes all their sites.
 */
export function startGracePeriodChecker(supabase) {
  async function check() {
    try {
      const cutoff = new Date(Date.now() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString();

      // Find users who have been past_due longer than the grace period
      const { data: expiredUsers } = await supabase
        .from("profiles")
        .select("id")
        .eq("plan_status", "past_due")
        .lt("past_due_since", cutoff);

      if (!expiredUsers?.length) return;

      for (const user of expiredUsers) {
        // Get their published sites
        const { data: sites } = await supabase
          .from("sites")
          .select("id, cloudflare_project_id")
          .eq("user_id", user.id)
          .eq("status", "published");

        if (sites?.length) {
          for (const site of sites) {
            if (site.cloudflare_project_id) {
              try {
                await unpublishSite(site.cloudflare_project_id);
              } catch (err) {
                console.error(`Failed to unpublish site ${site.id}:`, err);
              }
            }
          }

          await supabase
            .from("sites")
            .update({ status: "unpublished" })
            .eq("user_id", user.id)
            .eq("status", "published");
        }

        // Downgrade to free
        await supabase
          .from("profiles")
          .update({
            plan: "free",
            plan_status: "expired",
            monthly_credits: 0,
            past_due_since: null,
          })
          .eq("id", user.id);

        // Send unpublished email
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", user.id)
          .single();

        if (profile?.email && sites?.length) {
          sendSiteUnpublishedEmail(profile.email, `${sites.length} site${sites.length > 1 ? "s" : ""}`).catch(() => {});
        }

        console.log(`Grace period expired for user ${user.id} — ${sites?.length || 0} sites unpublished`);
      }
    } catch (err) {
      console.error("Grace period check error:", err);
    }
  }

  // Run immediately on startup, then every hour
  check();
  setInterval(check, CHECK_INTERVAL);
  console.log(`Grace period checker: running every ${CHECK_INTERVAL / 60000} minutes (${GRACE_PERIOD_DAYS}-day grace)`);
}
