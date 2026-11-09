/*
  Warnings:

  - You are about to drop the `traing_plans` table. If the table is not empty, all the data it contains will be lost.

*/
-- -- DropTable
-- DROP TABLE "traing_plans";

-- -- CreateTable
-- CREATE TABLE "training_plans" (
--     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
--     "user_id" UUID NOT NULL,
--     "plan_json" JSONB NOT NULL,
--     "plan_text" TEXT NOT NULL,
--     "version" INTEGER NOT NULL DEFAULT 1,

--     CONSTRAINT "training_plans_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateIndex
-- CREATE INDEX "indx_training_plans_user_id" ON "training_plans"("user_id");

ALTER TABLE "traing_plans" RENAME TO "training_plans";

