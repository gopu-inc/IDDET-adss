import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const shopifyStoresTable = pgTable("iddet_ads_shopify_stores", {
  id: text("id").primaryKey(),
  storeDomain: text("store_domain").notNull().unique(),
  storeName: text("store_name"),
  accessToken: text("access_token"),
  status: text("status").notNull().default("needs_setup"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productsTable = pgTable("iddet_ads_products", {
  id: text("id").primaryKey(),
  shopDomain: text("shop_domain").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("active"),
  adStatus: text("ad_status").notNull().default("not_started"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const iddetAccountsTable = pgTable(
  "iddet_ads_accounts",
  {
    id: text("id").primaryKey(),
    shopDomain: text("shop_domain").notNull(),
    username: text("username").notNull(),
    avatarUrl: text("avatar_url").notNull(),
    accessToken: text("access_token"),
    connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    shopUsernameUnique: uniqueIndex("iddet_ads_accounts_shop_username_idx").on(
      table.shopDomain,
      table.username,
    ),
  }),
);

export const iddetCommunitiesTable = pgTable("iddet_ads_communities", {
  id: text("id").primaryKey(),
  shopDomain: text("shop_domain").notNull(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  memberCount: integer("member_count").notNull().default(0),
  isMember: boolean("is_member").notNull().default(true),
});

export const adDraftsTable = pgTable("iddet_ads_drafts", {
  id: text("id").primaryKey(),
  shopDomain: text("shop_domain").notNull(),
  productId: text("product_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  accountId: text("account_id").notNull(),
  communityId: text("community_id").notNull(),
  status: text("status").notNull().default("draft"),
  remoteActfileId: text("remote_actfile_id"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const activitiesTable = pgTable("iddet_ads_activities", {
  id: text("id").primaryKey(),
  shopDomain: text("shop_domain").notNull(),
  type: text("type").notNull(),
  label: text("label").notNull(),
  detail: text("detail").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertShopifyStoreSchema = createInsertSchema(shopifyStoresTable).omit({
  createdAt: true,
  updatedAt: true,
});
export const insertProductSchema = createInsertSchema(productsTable).omit({
  createdAt: true,
});
export const insertIddetAccountSchema = createInsertSchema(iddetAccountsTable).omit({
  connectedAt: true,
});
export const insertIddetCommunitySchema = createInsertSchema(iddetCommunitiesTable);
export const insertAdDraftSchema = createInsertSchema(adDraftsTable).omit({
  createdAt: true,
  publishedAt: true,
});
export const insertActivitySchema = createInsertSchema(activitiesTable).omit({
  createdAt: true,
});

export type InsertShopifyStore = z.infer<typeof insertShopifyStoreSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertIddetAccount = z.infer<typeof insertIddetAccountSchema>;
export type InsertIddetCommunity = z.infer<typeof insertIddetCommunitySchema>;
export type InsertAdDraft = z.infer<typeof insertAdDraftSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;