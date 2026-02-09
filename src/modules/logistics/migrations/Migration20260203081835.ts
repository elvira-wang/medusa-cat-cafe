import { Migration } from '@mikro-orm/migrations';

export class Migration20260203081835 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "carriers_config" drop constraint if exists "carriers_config_carrier_id_logistics_product_code_unique";`);
    this.addSql(`create table if not exists "carriers_config" ("id" text not null, "carrier_id" text not null, "logistics_product_code" text not null, "vat_no" text null, "eori_no" text null, "ioss_no" text null, "mid" text null, "sender_cn" jsonb not null, "sender_en" jsonb not null, "details" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "carriers_config_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_carriers_config_carrier_id" ON "carriers_config" (carrier_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_carriers_config_logistics_product_code" ON "carriers_config" (logistics_product_code) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_carriers_config_deleted_at" ON "carriers_config" (deleted_at) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_carriers_config_carrier_id_logistics_product_code_unique" ON "carriers_config" (carrier_id, logistics_product_code) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "customs_declaration" ("id" text not null, "name_en" text not null, "name_cn" text not null, "unit_price" numeric not null, "unit_weight" integer not null, "quantity" numeric not null, "currency" text not null default 'USD', "raw_unit_price" jsonb not null, "raw_quantity" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customs_declaration_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customs_declaration_deleted_at" ON "customs_declaration" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "carriers_config" cascade;`);

    this.addSql(`drop table if exists "customs_declaration" cascade;`);
  }

}
