import { Router, type IRouter } from "express";
import { requireAdminBearer } from "../middlewares/admin-auth";
import { supabaseGet, supabaseRequest } from "../lib/supabase";

const adminRouter: IRouter = Router();
adminRouter.use(requireAdminBearer);

const bearerFor = (res: Parameters<typeof requireAdminBearer>[1]) =>
  res.locals.supabaseBearer as string;

function assertUuid(value: string) {
  if (!/^[0-9a-f-]{36}$/i.test(value)) throw new Error("Invalid entity id.");
}

function writableMasjid(body: Record<string, unknown>) {
  const allowed = [
    "name",
    "location",
    "city",
    "description",
    "image_url",
    "target_amount",
    "status",
    "is_urgent",
    "is_featured",
    "category_id",
    "published",
  ];
  return Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
}

function writableProject(body: Record<string, unknown>) {
  const allowed = [
    "title",
    "masjid_id",
    "category_id",
    "short_description",
    "full_description",
    "target_amount",
    "status",
    "published",
    "featured",
  ];
  return Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
}

async function handleProxyError(req: Parameters<typeof requireAdminBearer>[0], res: Parameters<typeof requireAdminBearer>[1], action: string, error: unknown) {
  req.log.error({ err: error }, action);
  res.status(502).json({ message: "Supabase operation failed." });
}

adminRouter.get("/admin/dashboard", async (req, res) => {
  try {
    const bearer = bearerFor(res);
    const [masjids, projects, donations] = await Promise.all([
      supabaseGet<Array<{ status: string; is_urgent: boolean; is_featured: boolean }>>(
        "/rest/v1/masjids?select=status,is_urgent,is_featured&limit=1000",
        bearer,
      ),
      supabaseGet<Array<{ status: string; target_amount: number; raised_amount: number }>>(
        "/rest/v1/projects?select=status,target_amount,raised_amount&limit=1000",
        bearer,
      ),
      supabaseGet<Array<{ status: string; created_at: string }>>(
        "/rest/v1/donation_intents?select=status,created_at&order=created_at.desc&limit=10",
        bearer,
      ),
    ]);

    res.json({
      masjids: {
        total: masjids.length,
        active: masjids.filter((item) => item.status === "active").length,
        urgent: masjids.filter((item) => item.is_urgent).length,
        featured: masjids.filter((item) => item.is_featured).length,
      },
      projects: {
        ongoing: projects.filter((item) => item.status === "ongoing").length,
        completed: projects.filter((item) => item.status === "completed").length,
        targetAmount: projects.reduce((sum, item) => sum + Number(item.target_amount), 0),
        raisedAmount: projects.reduce((sum, item) => sum + Number(item.raised_amount), 0),
      },
      recentDonations: donations,
    });
  } catch (error) {
    await handleProxyError(req, res, "Unable to load admin dashboard", error);
  }
});

adminRouter.post("/admin/masjids", async (req, res) => {
  try {
    const result = await supabaseRequest("/rest/v1/masjids", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(writableMasjid(req.body as Record<string, unknown>)),
    }, bearerFor(res));
    res.status(201).json(result.data);
  } catch (error) {
    await handleProxyError(req, res, "Unable to create Masjid", error);
  }
});

adminRouter.patch("/admin/masjids/:id", async (req, res) => {
  try {
    assertUuid(req.params.id);
    const result = await supabaseRequest(`/rest/v1/masjids?id=eq.${req.params.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(writableMasjid(req.body as Record<string, unknown>)),
    }, bearerFor(res));
    res.json(result.data);
  } catch (error) {
    await handleProxyError(req, res, "Unable to update Masjid", error);
  }
});

adminRouter.delete("/admin/masjids/:id", async (req, res) => {
  try {
    assertUuid(req.params.id);
    await supabaseRequest(`/rest/v1/masjids?id=eq.${req.params.id}`, { method: "DELETE" }, bearerFor(res));
    res.status(204).send();
  } catch (error) {
    await handleProxyError(req, res, "Unable to delete Masjid", error);
  }
});

adminRouter.post("/admin/projects", async (req, res) => {
  try {
    const result = await supabaseRequest("/rest/v1/projects", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(writableProject(req.body as Record<string, unknown>)),
    }, bearerFor(res));
    res.status(201).json(result.data);
  } catch (error) {
    await handleProxyError(req, res, "Unable to create project", error);
  }
});

adminRouter.patch("/admin/projects/:id", async (req, res) => {
  try {
    assertUuid(req.params.id);
    const result = await supabaseRequest(`/rest/v1/projects?id=eq.${req.params.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(writableProject(req.body as Record<string, unknown>)),
    }, bearerFor(res));
    res.json(result.data);
  } catch (error) {
    await handleProxyError(req, res, "Unable to update project", error);
  }
});

export default adminRouter;