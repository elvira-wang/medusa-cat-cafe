import { Migration } from '@mikro-orm/migrations';

export class Migration20260130065022 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "message" drop constraint if exists "message_target_type_check";`);

    this.addSql(`alter table if exists "message" add constraint "message_target_type_check" check("target_type" in ('revoket', 'aaa'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "message" drop constraint if exists "message_target_type_check";`);

    this.addSql(`alter table if exists "message" add constraint "message_target_type_check" check("target_type" in ('aa', 'aaa'));`);
  }

}
