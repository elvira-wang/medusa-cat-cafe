import { Migration } from '@mikro-orm/migrations';

export class Migration20260130064935 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "message" ("id" text not null, "type" text not null, "title" text not null, "content" text not null, "cover_image" text null, "target_type" text check ("target_type" in ('aa', 'aaa')) not null, "target_filter" jsonb null, "scheduled_at" timestamptz null, "expire_at" timestamptz null, "delivered_at" timestamptz null, "status" text check ("status" in ('ccc', 'cccc')) not null, "created_by" text null, "update_by" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "message_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_message_type" ON "message" (type) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_message_scheduled_at" ON "message" (scheduled_at) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_message_expire_at" ON "message" (expire_at) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_message_delivered_at" ON "message" (delivered_at) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_message_status" ON "message" (status) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_message_deleted_at" ON "message" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "message_record" ("id" text not null, "status" text check ("status" in ('unread', 'read', 'revoked')) not null, "message_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "message_record_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_message_record_status" ON "message_record" (status) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_message_record_message_id" ON "message_record" (message_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_message_record_deleted_at" ON "message_record" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "message_record" add constraint "message_record_message_id_foreign" foreign key ("message_id") references "message" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "message_record" drop constraint if exists "message_record_message_id_foreign";`);

    this.addSql(`drop table if exists "message" cascade;`);

    this.addSql(`drop table if exists "message_record" cascade;`);
  }

}
