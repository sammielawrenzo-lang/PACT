import {sqliteTable,text,integer,index} from "drizzle-orm/sqlite-core";
export const pacts=sqliteTable("pacts",{id:text("id").primaryKey(),ownerId:text("owner_id").notNull(),data:text("data").notNull(),version:integer("version").notNull().default(1),updatedAt:text("updated_at").notNull()},t=>[index("pacts_owner_idx").on(t.ownerId)]);
