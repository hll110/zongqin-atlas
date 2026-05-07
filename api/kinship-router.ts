import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { kinshipRelations, kinshipQueries } from "@db/schema";
import { eq, like, and, or, sql } from "drizzle-orm";

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
      const q = input.query.toLowerCase().trim();
      
      // Parse natural language query
      const parseResult = parseNaturalQuery(q);
      
      // Search based on parsed result
      let results: typeof kinshipRelations.$inferSelect[] = [];
      
      if (parseResult.keywords.length > 0) {
        const conditions = parseResult.keywords.map(k => 
          or(
            like(kinshipRelations.relationPath, `%${k}%`),
            like(kinshipRelations.formalTitle, `%${k}%`),
            like(kinshipRelations.informalTitle, `%${k}%`),
            like(kinshipRelations.description, `%${k}%`)
          )!
        );
        
        results = await db.select().from(kinshipRelations)
          .where(or(...conditions))
          .limit(5);
      }
      
      // Log query
      await db.insert(kinshipQueries).values({
        queryText: input.query,
        parsedPath: parseResult.keywords,
        resultIds: results.map(r => r.id),
        queryType: "natural",
        createdAt: new Date(),
      });
      
      return {
        parsed: parseResult,
        results,
        explanation: generateExplanation(parseResult, results[0]),
      };
    }),
});

// Natural language parser
function parseNaturalQuery(query: string) {
  const keywords: string[] = [];
  let gender: "male" | "female" | "unisex" = "unisex";
  let fromPerspective: "self" | "wife" | "husband" = "self";
  
  // Extract gender hints
  if (query.includes("男") || query.includes("公的") || query.includes("公的")) gender = "male";
  if (query.includes("女") || query.includes("母的") || query.includes("母的")) gender = "female";
  
  // Extract perspective
  if (query.includes("我老婆") || query.includes("妻子") || query.includes("媳妇")) fromPerspective = "wife";
  if (query.includes("我老公") || query.includes("丈夫") || query.includes("先生")) fromPerspective = "husband";
  
  // Extract relation keywords
  const relationPatterns = [
    { pattern: /爸爸|父亲|爹/, keyword: "父亲" },
    { pattern: /妈妈|母亲|娘/, keyword: "母亲" },
    { pattern: /哥哥|兄/, keyword: "哥哥" },
    { pattern: /弟弟|弟/, keyword: "弟弟" },
    { pattern: /姐姐|姐/, keyword: "姐姐" },
    { pattern: /妹妹|妹/, keyword: "妹妹" },
    { pattern: /爷爷|祖父/, keyword: "祖父" },
    { pattern: /奶奶|祖母/, keyword: "祖母" },
    { pattern: /外公|外祖父/, keyword: "外祖父" },
    { pattern: /外婆|外祖母/, keyword: "外祖母" },
    { pattern: /伯伯|伯父/, keyword: "伯父" },
    { pattern: /叔叔|叔父/, keyword: "叔父" },
    { pattern: /姑姑|姑母/, keyword: "姑母" },
    { pattern: /舅舅|舅父/, keyword: "舅父" },
    { pattern: /舅妈|舅母/, keyword: "舅母" },
    { pattern: /姨妈|姨母/, keyword: "姨母" },
    { pattern: /姨夫|姨父|姨丈/, keyword: "姨丈" },
    { pattern: /姑父|姑丈/, keyword: "姑丈" },
    { pattern: /大伯/, keyword: "大伯" },
    { pattern: /小叔/, keyword: "小叔" },
    { pattern: /大姑/, keyword: "大姑" },
    { pattern: /小姑/, keyword: "小姑" },
    { pattern: /大舅/, keyword: "大舅" },
    { pattern: /小舅/, keyword: "小舅" },
    { pattern: /大姨/, keyword: "大姨" },
    { pattern: /小姨/, keyword: "小姨" },
    { pattern: /老公|丈夫/, keyword: "丈夫" },
    { pattern: /老婆|妻子/, keyword: "妻子" },
    { pattern: /公公/, keyword: "公公" },
    { pattern: /婆婆/, keyword: "婆婆" },
    { pattern: /岳父/, keyword: "岳父" },
    { pattern: /岳母/, keyword: "岳母" },
    { pattern: /大伯子/, keyword: "大伯子" },
    { pattern: /小叔子/, keyword: "小叔子" },
    { pattern: /大姑子/, keyword: "大姑子" },
    { pattern: /小姑子/, keyword: "小姑子" },
    { pattern: /大舅子/, keyword: "大舅子" },
    { pattern: /小舅子/, keyword: "小舅子" },
    { pattern: /大姨子/, keyword: "大姨子" },
    { pattern: /小姨子/, keyword: "小姨子" },
    { pattern: /侄子/, keyword: "侄子" },
    { pattern: /侄女/, keyword: "侄女" },
    { pattern: /外甥/, keyword: "外甥" },
    { pattern: /外甥女/, keyword: "外甥女" },
    { pattern: /孙子/, keyword: "孙子" },
    { pattern: /孙女/, keyword: "孙女" },
    { pattern: /外孙/, keyword: "外孙" },
    { pattern: /外孙女/, keyword: "外孙女" },
    { pattern: /堂哥|堂兄/, keyword: "堂兄" },
    { pattern: /堂弟/, keyword: "堂弟" },
    { pattern: /堂姐/, keyword: "堂姐" },
    { pattern: /堂妹/, keyword: "堂妹" },
    { pattern: /表哥|表兄/, keyword: "表兄" },
    { pattern: /表弟/, keyword: "表弟" },
    { pattern: /表姐/, keyword: "表姐" },
    { pattern: /表妹/, keyword: "表妹" },
    { pattern: /嫂子/, keyword: "嫂子" },
    { pattern: /弟媳/, keyword: "弟媳" },
    { pattern: /姐夫/, keyword: "姐夫" },
    { pattern: /妹夫/, keyword: "妹夫" },
    { pattern: /儿媳|儿媳妇/, keyword: "儿媳" },
    { pattern: /女婿/, keyword: "女婿" },
    { pattern: /亲家公/, keyword: "亲家公" },
    { pattern: /亲家母/, keyword: "亲家母" },
    { pattern: /太爷爷/, keyword: "太爷爷" },
    { pattern: /太奶奶/, keyword: "太奶奶" },
    { pattern: /伯祖父/, keyword: "伯祖父" },
    { pattern: /叔祖父/, keyword: "叔祖父" },
    { pattern: /姑祖母/, keyword: "姑祖母" },
    { pattern: /舅祖父/, keyword: "舅祖父" },
    { pattern: /姨祖母/, keyword: "姨祖母" },
    { pattern: /堂嫂/, keyword: "堂嫂" },
    { pattern: /堂姐夫/, keyword: "堂姐夫" },
    { pattern: /表嫂/, keyword: "表嫂" },
    { pattern: /表姐夫/, keyword: "表姐夫" },
    { pattern: /曾孙/, keyword: "曾孙" },
    { pattern: /曾孙女/, keyword: "曾孙女" },
    { pattern: /玄孙/, keyword: "玄孙" },
  ];
  
  for (const { pattern, keyword } of relationPatterns) {
    if (pattern.test(query)) {
      keywords.push(keyword);
    }
  }
  
  // Remove duplicates while preserving order
  const uniqueKeywords = [...new Set(keywords)];
  
  return {
    originalQuery: query,
    keywords: uniqueKeywords,
    gender,
    fromPerspective,
    relationshipChain: uniqueKeywords,
  };
}

function generateExplanation(
  parsed: ReturnType<typeof parseNaturalQuery>,
  result?: typeof kinshipRelations.$inferSelect
) {
  if (!result) {
    return `抱歉，我无法理解"${parsed.originalQuery}"这个关系。请尝试用更简单的描述，如"爸爸的哥哥"、"妻子的弟弟"等。`;
  }
  
  const parts: string[] = [];
  parts.push(`您查询的是："${parsed.originalQuery}"`);
  parts.push(`关系链：${result.relationPath}`);
  parts.push(`标准称呼：${result.formalTitle}（书面语）、${result.informalTitle}（口语）`);
  if (result.northernTitle !== result.southernTitle) {
    parts.push(`地域差异：北方叫"${result.northernTitle}"，南方叫"${result.southernTitle}"`);
  }
  if (result.usageNotes) {
    parts.push(`备注：${result.usageNotes}`);
  }
  
  return parts.join("\n");
}
