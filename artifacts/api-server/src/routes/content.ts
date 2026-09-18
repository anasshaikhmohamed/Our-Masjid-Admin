import { Router, type IRouter } from "express";
import { supabaseGet } from "../lib/supabase";

const contentRouter: IRouter = Router();

type PublicProject = {
  id: string;
  title: string;
  short_description: string | null;
  full_description: string | null;
  target_amount: number;
  raised_amount: number;
  status: string;
  featured: boolean;
  category: { name: string } | null;
  masjid: {
    id: string;
    name: string;
    location: string;
    city: string;
    is_urgent: boolean;
    image_url: string | null;
  } | null;
};

type PublicMasjid = {
  id: string;
  name: string;
  location: string;
  city: string;
  description: string | null;
  image_url: string | null;
  is_urgent: boolean;
  is_featured: boolean;
};

type HomeSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  action_type: string | null;
  action_id: string | null;
};

const publicProjectSelect =
  "id,title,short_description,full_description,target_amount,raised_amount,status,featured,category:categories(name),masjid:masjids(id,name,location,city,is_urgent,image_url)";

contentRouter.get("/content/projects", async (req, res) => {
  try {
    const projects = await supabaseGet<PublicProject[]>(
      `/rest/v1/projects?select=${encodeURIComponent(publicProjectSelect)}&published=eq.true&status=neq.hidden&order=featured.desc,created_at.desc`,
    );
    res.json(projects);
  } catch (error) {
    req.log.error({ err: error }, "Unable to read published projects");
    res.status(503).json({ message: "Published project content is temporarily unavailable." });
  }
});

contentRouter.get("/content/masjids", async (req, res) => {
  try {
    const masjids = await supabaseGet<PublicMasjid[]>(
      "/rest/v1/masjids?select=id,name,location,city,description,image_url,is_urgent,is_featured&published=eq.true&status=neq.hidden&order=is_featured.desc,created_at.desc",
    );
    res.json(masjids);
  } catch (error) {
    req.log.error({ err: error }, "Unable to read published Masjids");
    res.status(503).json({ message: "Published Masjid content is temporarily unavailable." });
  }
});

contentRouter.get("/content/home-slides", async (req, res) => {
  try {
    const slides = await supabaseGet<HomeSlide[]>(
      "/rest/v1/home_slides?select=id,title,subtitle,image_url,action_type,action_id&published=eq.true&order=sort_order.asc",
    );
    res.json(slides);
  } catch (error) {
    req.log.error({ err: error }, "Unable to read published home slides");
    res.status(503).json({ message: "Home content is temporarily unavailable." });
  }
});

export default contentRouter;