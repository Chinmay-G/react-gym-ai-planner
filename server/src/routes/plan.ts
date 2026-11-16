import { Router, type Request, type Response } from "express";
import { log } from "node:console";
import { prisma } from "../lib/prisma";
import { generateTrainingPlan } from "../lib/ai";

export const planRouter = Router();

planRouter.post("/generate", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const profile = await prisma.user_profiles.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      return res
        .status(400)
        .json({ error: "User profile not found. Complete  onboarding first." });
    }

    const latestPlan = await prisma.training_plans.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      select: { version: true },
    });

    const nextVersion = latestPlan ? latestPlan.version + 1 : 1;

    let planJson;

    try {
      planJson = await generateTrainingPlan(profile);
    } catch (err) {
      console.log("AI genration failed: ", err);
      res.status(500).json({
        error: "Failed to generate training plan. Please try again.",
        details: err instanceof Error ? err?.message : "Unknown error",
      });
    }

    const planText = JSON.stringify(planJson, null, 2);

    const newPlan = await prisma.training_plans.create({
      data: {
        user_id: userId,
        plan_json: planJson as any,
        plan_text: planText,
        version: nextVersion,
      },
    });
  } catch (err) {
    console.log("Error genrating plan: ", err);
    res.status(500).json({ error: "Failed to generate plan" });
  }
});


planRouter.get("/current", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const plan = await prisma.training_plans.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });

    if (!plan) {
      return res.status(404).json({ error: "No plan found" });
    }

    res.json({
      id: plan.id,
      userId: plan.user_id,
      planJson: plan.plan_json,
      planText: plan.plan_text,
      createdAt: plan.created_at,
    });
  } catch (err) {
    console.log("Error genrating plan: ", err);
    res.status(500).json({ error: "Failed to fetch plan" });
  }
});
