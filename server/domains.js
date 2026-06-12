import { Router } from "express";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CF_API = "https://api.cloudflare.com/client/v4";

const headers = {
  Authorization: `Bearer ${CF_API_TOKEN}`,
  "Content-Type": "application/json",
};

// ── Name.com reseller (for in-app domain purchasing) ──
const NAMECOM_USERNAME = process.env.NAMECOM_USERNAME;
const NAMECOM_API_TOKEN = process.env.NAMECOM_API_TOKEN;
const NAMECOM_API = "https://api.name.com/v4";
const NAMECOM_AUTH =
  NAMECOM_USERNAME && NAMECOM_API_TOKEN
    ? "Basic " + Buffer.from(`${NAMECOM_USERNAME}:${NAMECOM_API_TOKEN}`).toString("base64")
    : null;

// TLDs we offer when a user just types a brand name (no dot)
const SUGGESTED_TLDS = [".com", ".net", ".org", ".io", ".co", ".ai", ".app"];

// Flat markup added to Name.com's wholesale price before rounding to .99
const MARKUP_PER_TLD = {
  default: 7,
  ".ai": 8,
  ".io": 8,
  ".dev": 6,
  ".app": 6,
};

function applyMarkup(wholesale, tld) {
  if (!wholesale) return null;
  const markup = MARKUP_PER_TLD[tld] ?? MARKUP_PER_TLD.default;
  // markup + round up to nearest .99
  return Math.floor(wholesale + markup) + 0.99;
}

const GOOGLE_WORKSPACE_MX = [
  { name: "@", content: "ASPMX.L.GOOGLE.COM", priority: 1 },
  { name: "@", content: "ALT1.ASPMX.L.GOOGLE.COM", priority: 5 },
  { name: "@", content: "ALT2.ASPMX.L.GOOGLE.COM", priority: 5 },
  { name: "@", content: "ALT3.ASPMX.L.GOOGLE.COM", priority: 10 },
  { name: "@", content: "ALT4.ASPMX.L.GOOGLE.COM", priority: 10 },
];

export function createDomainRoutes(supabase) {
  const router = Router();

  /**
   * POST /api/domains/search
   * Check availability and pricing across multiple TLDs via Name.com.
   *
   * Body: { query }
   *   "myrestaurant"           → checks each SUGGESTED_TLDS
   *   "myrestaurant.com"       → checks only that exact domain
   *   "myrestaurant.com .io"   → checks each provided domain
   */
  router.post("/search", async (req, res) => {
    const { query } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Missing query" });
    }
    if (!NAMECOM_AUTH) {
      return res.status(503).json({ error: "Domain registrar not configured" });
    }

    // Normalize input → list of fully-qualified candidates
    const cleaned = query.trim().toLowerCase().replace(/[^a-z0-9.\- ]/g, "");
    if (!cleaned) return res.status(400).json({ error: "Invalid search term" });

    const candidates = cleaned.includes(".")
      ? cleaned.split(/\s+/).filter(Boolean)
      : SUGGESTED_TLDS.map((tld) => cleaned + tld);

    try {
      const r = await fetch(`${NAMECOM_API}/domains:checkAvailability`, {
        method: "POST",
        headers: { Authorization: NAMECOM_AUTH, "Content-Type": "application/json" },
        body: JSON.stringify({ domainNames: candidates }),
      });
      if (!r.ok) {
        const text = await r.text();
        console.error("Name.com search error:", r.status, text);
        return res.status(502).json({ error: "Search failed" });
      }
      const data = await r.json();

      const results = (data.results || []).map((row) => ({
        domain: row.domainName,
        tld: "." + row.tld,
        available: row.purchasable === true,
        premium: row.premium === true,
        retailPrice: applyMarkup(row.purchasePrice, "." + row.tld),
        renewalRetail: applyMarkup(row.renewalPrice, "." + row.tld),
      }));

      // .com first, then the rest in user-supplied order
      results.sort((a, b) => {
        if (a.tld === ".com" && b.tld !== ".com") return -1;
        if (b.tld === ".com" && a.tld !== ".com") return 1;
        return 0;
      });

      res.json({ query: cleaned, results });
    } catch (err) {
      console.error("Domain search error:", err);
      res.status(500).json({ error: "Search failed" });
    }
  });

  /**
   * POST /api/domains/connect
   * Creates a Cloudflare DNS zone for the domain, adds CNAME + MX records,
   * and returns nameservers for the user to set at their registrar.
   *
   * Body: { siteId, userId, domain }
   */
  router.post("/connect", async (req, res) => {
    const { siteId, userId, domain } = req.body;
    if (!siteId || !userId || !domain) {
      return res.status(400).json({ error: "Missing siteId, userId, or domain" });
    }

    try {
      const { data: site } = await supabase
        .from("sites")
        .select("cloudflare_project_id, status, slug")
        .eq("id", siteId)
        .eq("user_id", userId)
        .single();

      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      if (!site.cloudflare_project_id) {
        return res.status(400).json({ error: "Site must be published first" });
      }

      // 1. Create DNS zone on Cloudflare
      const zoneRes = await fetch(`${CF_API}/zones`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: domain,
          account: { id: CF_ACCOUNT_ID },
          type: "full",
        }),
      });

      const zoneData = await zoneRes.json();

      if (!zoneData.success) {
        const msg = zoneData.errors?.[0]?.message || "Failed to create DNS zone";
        return res.status(400).json({ error: msg });
      }

      const zoneId = zoneData.result.id;
      const nameservers = zoneData.result.name_servers;

      // 2. Add CNAME record pointing domain to the Pages project
      const pagesTarget = `${site.cloudflare_project_id}.pages.dev`;
      await addDnsRecord(zoneId, {
        type: "CNAME",
        name: domain,
        content: pagesTarget,
        proxied: true,
      });

      // www redirect
      await addDnsRecord(zoneId, {
        type: "CNAME",
        name: "www",
        content: pagesTarget,
        proxied: true,
      });

      // 3. Add Google Workspace MX records
      for (const mx of GOOGLE_WORKSPACE_MX) {
        await addDnsRecord(zoneId, {
          type: "MX",
          name: mx.name,
          content: mx.content,
          priority: mx.priority,
        });
      }

      // 4. Add custom domain to the CF Pages project
      const projectName = site.cloudflare_project_id;
      await fetch(
        `${CF_API}/accounts/${CF_ACCOUNT_ID}/pages/projects/${projectName}/domains`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ name: domain }),
        }
      );

      // Also add www
      await fetch(
        `${CF_API}/accounts/${CF_ACCOUNT_ID}/pages/projects/${projectName}/domains`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ name: `www.${domain}` }),
        }
      );

      // 5. Save to DB
      await supabase
        .from("sites")
        .update({
          custom_domain: domain,
          cloudflare_zone_id: zoneId,
        })
        .eq("id", siteId);

      res.json({
        success: true,
        domain,
        nameservers,
        records: {
          cname: `${domain} → ${pagesTarget}`,
          www: `www.${domain} → ${pagesTarget}`,
          mx: "Google Workspace (5 MX records)",
        },
        instructions: `Update your nameservers at your domain registrar to:\n${nameservers.join("\n")}`,
      });
    } catch (err) {
      console.error("Domain connect error:", err);
      res.status(500).json({ error: "Failed to connect domain" });
    }
  });

  /**
   * DELETE /api/domains/disconnect
   * Remove the DNS zone and custom domain from a site.
   * Body: { siteId, userId }
   */
  router.delete("/disconnect", async (req, res) => {
    const { siteId, userId } = req.body;
    if (!siteId || !userId) {
      return res.status(400).json({ error: "Missing siteId or userId" });
    }

    try {
      const { data: site } = await supabase
        .from("sites")
        .select("cloudflare_project_id, custom_domain, cloudflare_zone_id")
        .eq("id", siteId)
        .eq("user_id", userId)
        .single();

      if (!site || !site.custom_domain) {
        return res.status(404).json({ error: "No custom domain found" });
      }

      // Remove custom domain from Pages project
      if (site.cloudflare_project_id) {
        const projectName = site.cloudflare_project_id;
        await fetch(
          `${CF_API}/accounts/${CF_ACCOUNT_ID}/pages/projects/${projectName}/domains/${site.custom_domain}`,
          { method: "DELETE", headers }
        );
        await fetch(
          `${CF_API}/accounts/${CF_ACCOUNT_ID}/pages/projects/${projectName}/domains/www.${site.custom_domain}`,
          { method: "DELETE", headers }
        );
      }

      // Delete the DNS zone
      if (site.cloudflare_zone_id) {
        await fetch(`${CF_API}/zones/${site.cloudflare_zone_id}`, {
          method: "DELETE",
          headers,
        });
      }

      await supabase
        .from("sites")
        .update({ custom_domain: null, cloudflare_zone_id: null })
        .eq("id", siteId);

      res.json({ success: true });
    } catch (err) {
      console.error("Domain disconnect error:", err);
      res.status(500).json({ error: "Failed to disconnect domain" });
    }
  });

  /**
   * GET /api/domains/status?siteId=...&userId=...
   * Check nameserver propagation and SSL status.
   */
  router.get("/status", async (req, res) => {
    const { siteId, userId } = req.query;
    if (!siteId || !userId) {
      return res.status(400).json({ error: "Missing siteId or userId" });
    }

    try {
      const { data: site } = await supabase
        .from("sites")
        .select("custom_domain, cloudflare_zone_id")
        .eq("id", siteId)
        .eq("user_id", userId)
        .single();

      if (!site || !site.cloudflare_zone_id) {
        return res.json({ connected: false });
      }

      const zoneRes = await fetch(
        `${CF_API}/zones/${site.cloudflare_zone_id}`,
        { headers }
      );
      const zoneData = await zoneRes.json();

      if (!zoneData.success) {
        return res.json({ connected: false, domain: site.custom_domain });
      }

      const zone = zoneData.result;

      res.json({
        connected: true,
        domain: site.custom_domain,
        status: zone.status,
        nameservers: zone.name_servers,
        ssl: zone.ssl?.status || "pending",
        active: zone.status === "active",
      });
    } catch (err) {
      console.error("Domain status error:", err);
      res.status(500).json({ error: "Failed to check domain status" });
    }
  });

  return router;
}

async function addDnsRecord(zoneId, record) {
  const res = await fetch(`${CF_API}/zones/${zoneId}/dns_records`, {
    method: "POST",
    headers,
    body: JSON.stringify(record),
  });
  const data = await res.json();
  if (!data.success) {
    console.warn(`DNS record failed: ${record.type} ${record.name}`, data.errors);
  }
  return data;
}
