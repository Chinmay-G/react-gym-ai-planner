-- CreateTable
CREATE TABLE "traing_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "plan_json" JSONB NOT NULL,
    "plan_text" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "traing_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "indx_training_plans_user_id" ON "traing_plans"("user_id");
