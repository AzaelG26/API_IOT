import { pgTable, uuid, varchar, boolean, foreignKey, unique, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	username: varchar({ length: 100 }).notNull(),
	phone: varchar({ length: 15 }).notNull(),
	email: varchar({ length: 100 }).notNull(),
	password: varchar({ length: 100 }).notNull(),
	status: boolean().default(true),
});

export const vaults = pgTable("vaults", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	nickname: varchar({ length: 50 }).notNull(),
	status: boolean().default(true),
	userId: uuid("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "fk_id_user"
		}).onDelete("cascade"),
]);

export const nfc_keys = pgTable("nfc_keys", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tagId: varchar("tag_id", { length: 20 }).notNull(),
}, (table) => [
	unique("nfc_keys_tag_id_key").on(table.tagId),
]);

export const vaults_configurations = pgTable("vaults_configurations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	pin: integer().notNull(),
	nfcKeyId: uuid("nfc_key_id"),
}, (table) => [
	foreignKey({
			columns: [table.nfcKeyId],
			foreignColumns: [nfc_keys.id],
			name: "fk_nfc_keys"
		}),
]);
