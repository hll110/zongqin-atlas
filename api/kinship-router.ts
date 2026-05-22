import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { kinshipRelations, kinshipQueries } from "@db/schema";
import { eq, like, and, or, sql } from "drizzle-orm";
import { runNaturalQuery } from "../lib/kinship-intelligence";

export const kinshipRouter = createRouter({
  // List all relations with optional filters
  list: publicQuery
    .input(
      z.object({
        category: z.enum(["paternal", "maternal", "spouse", "affinity", "collateral"]).optional(),
        generationLevel: z.enum(["ancestor", "elder", "peer", "junior", "descendant"]).optional(),
        gender: z.enum(["male", "female", "unisex"]).optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const filters = [];
      
      if (input?.category) filters.push(eq(kinshipRelations.category, input.category));
      if (input?.generationLevel) filters.push(eq(kinshipRelations.generationLevel, input.generationLevel));
      if (input?.gender) filters.push(eq(kinshipRelations.gender, input.gender));
      if (input?.search) {
        const searchTerm = `%${input.search}%`;
        filters.push(
          or(
            like(kinshipRelations.relationPath, searchTerm),
            like(kinshipRelations.formalTitle, searchTerm),
            like(kinshipRelations.informalTitle, searchTerm),
            like(kinshipRelations.northernTitle, searchTerm),
            like(kinshipRelations.southernTitle, searchTerm)
          )!
        );
      }
      
      const whereClause = filters.length > 0 ? and(...filters) : undefined;
      
      const [data, countResult] = await Promise.all([
        db.select().from(kinshipRelations)
          .where(whereClause)
          .limit(input?.limit || 50)
          .offset(input?.offset || 0)
          .orderBy(kinshipRelations.id),
        db.select({ count: sql<number>`count(*)` }).from(kinshipRelations)
          .where(whereClause)
      ]);
      
      return {
        data,
        total: countResult[0]?.count || 0,
      };
    }),

  // Get single relation by ID
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(kinshipRelations)
        .where(eq(kinshipRelations.id, input.id))
        .limit(1);
      return result[0] || null;
    }),

  // Search by relation path (exact or partial)
  search: publicQuery
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(20).default(10),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const searchTerm = `%${input.query}%`;
      
      const results = await db.select().from(kinshipRelations)
        .where(
          or(
            like(kinshipRelations.relationPath, searchTerm),
            like(kinshipRelations.formalTitle, searchTerm),
            like(kinshipRelations.informalTitle, searchTerm),
            like(kinshipRelations.northernTitle, searchTerm),
            like(kinshipRelations.southernTitle, searchTerm),
            like(kinshipRelations.description, searchTerm)
          )!
        )
        .limit(input.limit)
        .orderBy(kinshipRelations.isCommon);
      
      return results;
    }),

  // Get regional variations for a specific relation
  getRegionalVariations: publicQuery
    .input(z.object({ relationPath: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db.select().from(kinshipRelations)
        .where(like(kinshipRelations.relationPath, `%${input.relationPath}%`))
        .limit(10);
      
      return results.map(r => ({
        relationPath: r.relationPath,
        formal: r.formalTitle,
        informal: r.informalTitle,
        northern: r.northernTitle,
        southern: r.southernTitle,
        other: r.otherVariants,
      }));
    }),

  // Get relations by category
  getByCategory: publicQuery
    .input(z.object({
      category: z.enum(["paternal", "maternal", "spouse", "affinity", "collateral"]),
      generationLevel: z.enum(["ancestor", "elder", "peer", "junior", "descendant"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const filters = [eq(kinshipRelations.category, input.category)];
      if (input.generationLevel) {
        filters.push(eq(kinshipRelations.generationLevel, input.generationLevel));
      }
      
      const results = await db.select().from(kinshipRelations)
        .where(and(...filters))
        .orderBy(kinshipRelations.generationLevel, kinshipRelations.id);
      
      return results;
    }),

  // Get statistics
  getStats: publicQuery.query(async () => {
    const db = getDb();
    const [total, byCategory, byGeneration] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(kinshipRelations),
      db.select({
        category: kinshipRelations.category,
        count: sql<number>`count(*)`,
      }).from(kinshipRelations).groupBy(kinshipRelations.category),
      db.select({
        generation: kinshipRelations.generationLevel,
        count: sql<number>`count(*)`,
      }).from(kinshipRelations).groupBy(kinshipRelations.generationLevel),
    ]);
    
    return {
      total: total[0]?.count || 0,
      byCategory,
      byGeneration,
    };
  }),

  // Natural language query (AI-style)
  naturalQuery: publicQuery
    .input(z.object({ query: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const allRelations = await db.select().from(kinshipRelations);
      const result = runNaturalQuery(allRelations, input.query.trim());

      await db.insert(kinshipQueries).values({
        queryText: input.query,
        parsedPath: result.parsed.relationshipChain,
        resultIds: result.results.map((r) => r.id).filter((id): id is number => id != null),
        queryType: "natural",
        createdAt: new Date(),
      });

      return {
        parsed: result.parsed,
        results: result.results.slice(0, 8),
        explanation: result.explanation,
        suggestions: result.suggestions,
      };
    }),
});
