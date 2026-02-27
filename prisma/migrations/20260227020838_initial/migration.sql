-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "building_code" TEXT NOT NULL,
    "address" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/Vancouver',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'technician',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "avatar_url" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "facility_asset_id" TEXT NOT NULL,
    "asset_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "manufacturer" TEXT,
    "model" TEXT,
    "serial_number" TEXT,
    "year_installed" INTEGER,
    "company_code" TEXT NOT NULL,
    "building_code" TEXT NOT NULL,
    "department_code" TEXT NOT NULL,
    "system_type" TEXT NOT NULL,
    "unit_type" TEXT NOT NULL,
    "dependency_code" TEXT NOT NULL,
    "dependency_group" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'operational',
    "location_notes" TEXT,
    "floor_plan_x" DOUBLE PRECISION,
    "floor_plan_y" DOUBLE PRECISION,
    "floor_plan_zone" TEXT,
    "current_meter_value" DOUBLE PRECISION,
    "meter_unit" TEXT,
    "last_meter_update" TIMESTAMP(3),
    "purchase_price" DOUBLE PRECISION,
    "purchase_date" TIMESTAMP(3),
    "purchase_invoice_number" TEXT,
    "expected_life_years" INTEGER,
    "replacement_cost" DOUBLE PRECISION,
    "salvage_value" DOUBLE PRECISION,
    "warranty_title" TEXT,
    "warranty_expiration_date" TIMESTAMP(3),
    "warranty_vendor" TEXT,
    "date_of_manufacture" TIMESTAMP(3),
    "date_placed_in_service" TIMESTAMP(3),
    "date_removed" TIMESTAMP(3),
    "out_of_service_begin" TIMESTAMP(3),
    "out_of_service_end" TIMESTAMP(3),
    "current_condition" TEXT,
    "condition_date" TIMESTAMP(3),
    "estimated_replace_date" TIMESTAMP(3),
    "assessment_note" TEXT,
    "safety_note" TEXT,
    "training_note" TEXT,
    "shutdown_procedure_note" TEXT,
    "loto_procedure_note" TEXT,
    "emergency_note" TEXT,
    "assigned_to_id" TEXT,
    "emergency_contact_id" TEXT,
    "tag_number" TEXT,
    "rfid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_dependencies" (
    "id" TEXT NOT NULL,
    "dependent_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "asset_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "work_order_number" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'corrective',
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "failure_code" TEXT,
    "cause_code" TEXT,
    "remedy" TEXT,
    "requested_by_id" TEXT NOT NULL,
    "assigned_to_id" TEXT,
    "due_date" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "estimated_hours" DOUBLE PRECISION,
    "actual_hours" DOUBLE PRECISION,
    "pm_schedule_id" TEXT,
    "origin_type" TEXT,
    "originated_date" TIMESTAMP(3),
    "originator_id" TEXT,
    "assigned_date" TIMESTAMP(3),
    "completed_datetime" TIMESTAMP(3),
    "action_taken" TEXT,
    "root_cause" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_comments" (
    "id" TEXT NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_order_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_photos" (
    "id" TEXT NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "uploaded_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_order_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_parts" (
    "id" TEXT NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "part_id" TEXT NOT NULL,
    "quantity_used" INTEGER NOT NULL,
    "unit_cost" DOUBLE PRECISION,

    CONSTRAINT "work_order_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labor_entries" (
    "id" TEXT NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "date" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "labor_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_schedules" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "instructions" TEXT,
    "frequency" TEXT NOT NULL DEFAULT 'monthly',
    "interval_value" INTEGER,
    "meter_interval" INTEGER,
    "estimated_hours" DOUBLE PRECISION,
    "assigned_to_id" TEXT,
    "last_completed_at" TIMESTAMP(3),
    "next_due_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "pm_type" TEXT,
    "expected_completion_days" INTEGER,
    "expected_completion_hours" DOUBLE PRECISION,
    "wo_creation_time" TEXT,
    "default_wo_status" TEXT,
    "default_problem_code" TEXT,
    "default_cause_code" TEXT,
    "end_condition" TEXT,
    "end_occurrences" INTEGER,
    "end_date" TIMESTAMP(3),
    "skip_if_open" BOOLEAN NOT NULL DEFAULT false,
    "required_parts" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "part_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "manufacturer" TEXT,
    "vendor" TEXT,
    "vendor_part_number" TEXT,
    "unit_of_measure" TEXT NOT NULL DEFAULT 'ea',
    "unit_cost" DOUBLE PRECISION,
    "quantity_on_hand" INTEGER NOT NULL DEFAULT 0,
    "quantity_reserved" INTEGER NOT NULL DEFAULT 0,
    "reorder_point" INTEGER,
    "reorder_quantity" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'in_stock',
    "location" TEXT,
    "alternate_part_number" TEXT,
    "manufacturer_barcode" TEXT,
    "par_quantity" INTEGER,
    "min_level" INTEGER,
    "max_level" INTEGER,
    "quantity_on_back_order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "part_reservations" (
    "id" TEXT NOT NULL,
    "part_id" TEXT NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "quantity_reserved" INTEGER NOT NULL,
    "reserved_by_id" TEXT NOT NULL,
    "reserved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "part_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_parts" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "part_id" TEXT NOT NULL,

    CONSTRAINT "asset_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config_items" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "color" TEXT,
    "extra" JSONB,

    CONSTRAINT "config_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "floor_plans" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image_url" TEXT,
    "svg_data" TEXT,
    "width" INTEGER NOT NULL DEFAULT 0,
    "height" INTEGER NOT NULL DEFAULT 0,
    "scale" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "floor_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "floor_plan_zones" (
    "id" TEXT NOT NULL,
    "floor_plan_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "polygon_points" JSONB NOT NULL,

    CONSTRAINT "floor_plan_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crews" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lead_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crew_members" (
    "id" TEXT NOT NULL,
    "crew_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "crew_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "departments_facility_id_code_key" ON "departments"("facility_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "assets_facility_asset_id_key" ON "assets"("facility_asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "assets_asset_number_key" ON "assets"("asset_number");

-- CreateIndex
CREATE UNIQUE INDEX "asset_dependencies_dependent_id_provider_id_type_key" ON "asset_dependencies"("dependent_id", "provider_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_work_order_number_key" ON "work_orders"("work_order_number");

-- CreateIndex
CREATE UNIQUE INDEX "parts_organization_id_part_number_key" ON "parts"("organization_id", "part_number");

-- CreateIndex
CREATE UNIQUE INDEX "asset_parts_asset_id_part_id_key" ON "asset_parts"("asset_id", "part_id");

-- CreateIndex
CREATE UNIQUE INDEX "config_items_organization_id_category_key_key" ON "config_items"("organization_id", "category", "key");

-- CreateIndex
CREATE UNIQUE INDEX "crew_members_crew_id_user_id_key" ON "crew_members"("crew_id", "user_id");

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_emergency_contact_id_fkey" FOREIGN KEY ("emergency_contact_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_dependencies" ADD CONSTRAINT "asset_dependencies_dependent_id_fkey" FOREIGN KEY ("dependent_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_dependencies" ADD CONSTRAINT "asset_dependencies_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_pm_schedule_id_fkey" FOREIGN KEY ("pm_schedule_id") REFERENCES "pm_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_comments" ADD CONSTRAINT "work_order_comments_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_comments" ADD CONSTRAINT "work_order_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_photos" ADD CONSTRAINT "work_order_photos_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_photos" ADD CONSTRAINT "work_order_photos_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_parts" ADD CONSTRAINT "work_order_parts_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_parts" ADD CONSTRAINT "work_order_parts_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labor_entries" ADD CONSTRAINT "labor_entries_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labor_entries" ADD CONSTRAINT "labor_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_schedules" ADD CONSTRAINT "pm_schedules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_schedules" ADD CONSTRAINT "pm_schedules_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_schedules" ADD CONSTRAINT "pm_schedules_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts" ADD CONSTRAINT "parts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_reservations" ADD CONSTRAINT "part_reservations_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_reservations" ADD CONSTRAINT "part_reservations_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_reservations" ADD CONSTRAINT "part_reservations_reserved_by_id_fkey" FOREIGN KEY ("reserved_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_parts" ADD CONSTRAINT "asset_parts_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_parts" ADD CONSTRAINT "asset_parts_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_items" ADD CONSTRAINT "config_items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "floor_plans" ADD CONSTRAINT "floor_plans_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "floor_plans" ADD CONSTRAINT "floor_plans_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "floor_plan_zones" ADD CONSTRAINT "floor_plan_zones_floor_plan_id_fkey" FOREIGN KEY ("floor_plan_id") REFERENCES "floor_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crews" ADD CONSTRAINT "crews_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crew_members" ADD CONSTRAINT "crew_members_crew_id_fkey" FOREIGN KEY ("crew_id") REFERENCES "crews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crew_members" ADD CONSTRAINT "crew_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
