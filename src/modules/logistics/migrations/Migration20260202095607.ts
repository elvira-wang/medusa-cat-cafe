import { Migration } from '@mikro-orm/migrations';

export class Migration20260202095607 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "customs_declaration" ("id" text not null, "name_en" text not null, "name_cn" text not null, "unit_price" numeric not null, "unit_weight" integer not null, "quantity" numeric not null, "currency" text not null default 'USD', "raw_unit_price" jsonb not null, "raw_quantity" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customs_declaration_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customs_declaration_deleted_at" ON "customs_declaration" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`drop table if exists "customs-declaration" cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table if not exists "customs-declaration" ("id" text not null, "name_en" text not null, "name_cn" text not null, "unit_price" numeric not null, "unit_weight" integer not null, "quantity" numeric not null, "currency" text not null default 'USD', "raw_unit_price" jsonb not null, "raw_quantity" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customs-declaration_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customs-declaration_deleted_at" ON "customs-declaration" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`drop table if exists "customs_declaration" cascade;`);
  }

}
