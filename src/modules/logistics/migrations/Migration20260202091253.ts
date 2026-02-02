import { Migration } from '@mikro-orm/migrations';

export class Migration20260202091253 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "carriers_config" ("id" text not null, "carrier_id" text not null, "logistics_product" jsonb not null, "vat_no" text null, "eori_no" text null, "ioss_no" text null, "mid" text null, "sender_cn" jsonb not null, "sender_en" jsonb not null, "details" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "carriers_config_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_carriers_config_carrier_id" ON "carriers_config" (carrier_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_carriers_config_deleted_at" ON "carriers_config" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "customs-declaration" ("id" text not null, "name_en" text not null, "name_cn" text not null, "unit_price" numeric not null, "unit_weight" integer not null, "quantity" numeric not null, "currency" text not null default 'USD', "raw_unit_price" jsonb not null, "raw_quantity" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customs-declaration_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customs-declaration_deleted_at" ON "customs-declaration" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "carriers_config" cascade;`);

    this.addSql(`drop table if exists "customs-declaration" cascade;`);
  }

}
