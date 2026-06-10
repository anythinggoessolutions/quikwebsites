const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CF_API_BASE = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/pages/projects`;

const headers = {
  Authorization: `Bearer ${CF_API_TOKEN}`,
};

/**
 * Create a Cloudflare Pages project for a site.
 * Project name becomes the subdomain: {name}.quikwebsites.com
 */
export async function createProject(slug) {
  const res = await fetch(CF_API_BASE, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: slug,
      production_branch: "main",
    }),
  });

  const data = await res.json();
  if (!data.success) {
    const msg = data.errors?.[0]?.message || "Failed to create project";
    throw new Error(msg);
  }

  return data.result;
}

/**
 * Deploy HTML to a Cloudflare Pages project using direct upload.
 * Returns the deployment URL.
 */
export async function deploySite(projectName, html) {
  // Step 1: Create a deployment and get an upload URL
  const createRes = await fetch(
    `${CF_API_BASE}/${projectName}/deployments`,
    {
      method: "POST",
      headers,
      body: createDeploymentForm(html),
    }
  );

  const data = await createRes.json();
  if (!data.success) {
    const msg = data.errors?.[0]?.message || "Deployment failed";
    throw new Error(msg);
  }

  return {
    id: data.result.id,
    url: data.result.url,
    subdomain: `${projectName}.pages.dev`,
  };
}

/**
 * Delete a deployment to effectively unpublish a site.
 * We don't delete the project — just roll back so nothing is served.
 */
export async function unpublishSite(projectName) {
  // Get the latest production deployment
  const res = await fetch(
    `${CF_API_BASE}/${projectName}/deployments?env=production`,
    { headers }
  );

  const data = await res.json();
  if (!data.success || !data.result?.length) return;

  // Delete the production deployment
  const deploymentId = data.result[0].id;
  await fetch(
    `${CF_API_BASE}/${projectName}/deployments/${deploymentId}`,
    { method: "DELETE", headers }
  );
}

/**
 * Check if a project name (slug) is available.
 */
export async function isSlugAvailable(slug) {
  const res = await fetch(`${CF_API_BASE}/${slug}`, { headers });
  return res.status === 404;
}

/**
 * Build a FormData body with index.html for Cloudflare Pages direct upload.
 */
function createDeploymentForm(html) {
  const form = new FormData();
  const file = new Blob([html], { type: "text/html" });
  form.append("index.html", file, "index.html");
  return form;
}

/**
 * Generate a URL-safe slug from a business name.
 * "Bella's Kitchen" → "bellas-kitchen"
 */
export function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 63);
}
