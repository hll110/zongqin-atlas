import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  json,
  timestamp,
  int,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export const kinshipRelations = mysqlTable("kinship_relations", {
  id: serial("id").primaryKey(),
  relationPath: varchar("relation_path", { length: 500 }).notNull(),
  relationPathEn: varchar("relation_path_en", { length: 500 }),
  category: mysqlEnum("category", [
    "paternal",      // 父系亲属
    "maternal",      // 母系亲属
    "spouse",        // 夫妻亲属
    "affinity",      // 姻亲
    "collateral",    // 旁系亲属
  ]).notNull(),
  generationLevel: mysqlEnum("generation_level", [
    "ancestor",      // 祖辈
    "elder",         // 父辈
    "peer",          // 平辈
    "junior",        // 子辈
    "descendant",    // 孙辈
  ]).notNull(),
  gender: mysqlEnum("gender", ["male", "female", "unisex"]).notNull(),
  formalTitle: varchar("formal_title", { length: 100 }).notNull(),
  informalTitle: varchar("informal_title", { length: 100 }),
  northernTitle: varchar("northern_title", { length: 100 }),
  southernTitle: varchar("southern_title", { length: 100 }),
  otherVariants: json("other_variants").$type<string[]>(),
  description: text("description"),
  relationshipChain: json("relationship_chain").$type<string[]>(),
  usageNotes: text("usage_notes"),
  isCommon: int("is_common", { unsigned: true }).default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const kinshipQueries = mysqlTable("kinship_queries", {
  id: serial("id").primaryKey(),
  queryText: varchar("query_text", { length: 500 }).notNull(),
  parsedPath: json("parsed_path").$type<string[]>(),
  resultIds: json("result_ids").$type<number[]>(),
  userId: int("user_id", { unsigned: true }),
  queryType: mysqlEnum("query_type", ["natural", "structured", "category"]).default("natural"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type KinshipRelation = typeof kinshipRelations.$inferSelect;
export type InsertKinshipRelation = typeof kinshipRelations.$inferInsert;
export type KinshipQuery = typeof kinshipQueries.$inferSelect;
