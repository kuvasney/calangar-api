-- CreateTable
CREATE TABLE "project_step_schedules" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "product_step_id" INTEGER NOT NULL,
    "planned_start_date" TIMESTAMP(3) NOT NULL,
    "planned_end_date" TIMESTAMP(3) NOT NULL,
    "actual_start_date" TIMESTAMP(3),
    "actual_end_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_step_schedules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_step_schedules" ADD CONSTRAINT "project_step_schedules_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_step_schedules" ADD CONSTRAINT "project_step_schedules_product_step_id_fkey" FOREIGN KEY ("product_step_id") REFERENCES "product_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
