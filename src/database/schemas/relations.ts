import { relations } from "drizzle-orm/relations";
import { users, vaults, nfc_keys, vaults_configurations } from "./schema";

export const vaultsRelations = relations(vaults, ({one, many}) => ({
	user: one(users, {
		fields: [vaults.userId],
		references: [users.id]
	}),
	vaultsConfigurations: many(vaults_configurations), // Añadido
}));

export const usersRelations = relations(users, ({many}) => ({
	vaults: many(vaults),
}));

export const vaultsConfigurationsRelations = relations(vaults_configurations, ({one}) => ({
	nfcKey: one(nfc_keys, {
		fields: [vaults_configurations.nfcKeyId],
		references: [nfc_keys.id]
	}),
	vault: one(vaults, {
		fields: [vaults_configurations.vaultId],
		references: [vaults.id],
	}),
}));



export const nfcKeysRelations = relations(nfc_keys, ({many}) => ({
	vaultsConfigurations: many(vaults_configurations),
}));