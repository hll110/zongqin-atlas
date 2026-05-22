/**
 * 亲属称谓智能查询引擎（Web API / 可复用逻辑）
 */

export type KinshipGender = "male" | "female" | "unisex";
export type QueryPerspective = "self" | "wife" | "husband";
export type MatchConfidence = "high" | "medium" | "low";

export interface KinshipRecord {
  id?: number;
  relationPath: string;
  relationshipChain?: string[] | null;
  category: string;
  generationLevel: string;
  gender: KinshipGender;
  formalTitle: string;
  informalTitle?: string | null;
  northernTitle?: string | null;
  southernTitle?: string | null;
  description?: string | null;
  usageNotes?: string | null;
  otherVariants?: string[] | null;
  isCommon?: number | null;
}

export interface QueryMeta {
  originalQuery: string;
  relationPath: string | null;
  segments: string[];
  gender: KinshipGender;
  perspective: QueryPerspective;
  selfGender: KinshipGender;
  confidence: MatchConfidence;
  queryIntent: "address" | "lookup";
}

export interface NaturalQueryResult {
  parsed: {
    originalQuery: string;
    keywords: string[];
    relationshipChain: string[];
    relationPath: string | null;
    gender: KinshipGender;
    fromPerspective: QueryPerspective;
    selfGender: KinshipGender;
    confidence: MatchConfidence;
    queryIntent: "address" | "lookup";
  };
  results: KinshipRecord[];
  explanation: string;
  topResult: KinshipRecord | null;
  suggestions: string[];
}

/** 按模式长度降序，优先匹配长词 */
const SEGMENT_RULES: Array<[RegExp, string]> = [
  [/^(堂哥|堂兄)/, "堂兄"],
  [/^(堂弟)/, "堂弟"],
  [/^(堂姐)/, "堂姐"],
  [/^(堂妹)/, "堂妹"],
  [/^(表哥|表兄)/, "表兄"],
  [/^(表弟)/, "表弟"],
  [/^(表姐)/, "表姐"],
  [/^(表妹)/, "表妹"],
  [/^(大伯子)/, "大伯子"],
  [/^(小叔子)/, "小叔子"],
  [/^(大姑子)/, "大姑子"],
  [/^(小姑子)/, "小姑子"],
  [/^(大舅子|大舅哥)/, "大舅子"],
  [/^(小舅子)/, "小舅子"],
  [/^(大姨子)/, "大姨子"],
  [/^(小姨子)/, "小姨子"],
  [/^(外孙女)/, "外孙女"],
  [/^(外孙)/, "外孙"],
  [/^(儿媳妇|儿媳)/, "儿媳"],
  [/^(女婿)/, "女婿"],
  [/^(外甥女)/, "外甥女"],
  [/^(外甥)/, "外甥"],
  [/^(侄女)/, "侄女"],
  [/^(侄子|侄儿)/, "侄子"],
  [/^(亲家母)/, "亲家母"],
  [/^(亲家公)/, "亲家公"],
  [/^(外祖母|外婆|姥姥)/, "外祖母"],
  [/^(外祖父|外公|姥爷)/, "外祖父"],
  [/^(祖母|奶奶)/, "祖母"],
  [/^(祖父|爷爷)/, "祖父"],
  [/^(岳父|丈人)/, "岳父"],
  [/^(岳母|丈母娘)/, "岳母"],
  [/^(公公)/, "公公"],
  [/^(婆婆)/, "婆婆"],
  [/^(伯伯|伯父|大爷|大伯)/, "伯父"],
  [/^(叔叔|叔父|阿叔)/, "叔父"],
  [/^(姑姑|姑母|姑妈)/, "姑母"],
  [/^(舅舅|舅父|阿舅)/, "舅父"],
  [/^(舅妈|舅母)/, "舅母"],
  [/^(姨妈|姨母|阿姨)/, "姨母"],
  [/^(爸爸|父亲|爹|爸|老爸)/, "父亲"],
  [/^(妈妈|母亲|娘|妈|老妈)/, "母亲"],
  [/^(哥哥|兄长|大哥|哥)/, "哥哥"],
  [/^(弟弟|弟)/, "弟弟"],
  [/^(姐姐|姐)/, "姐姐"],
  [/^(妹妹|妹)/, "妹妹"],
  [/^(儿子|子)/, "儿子"],
  [/^(女儿|女)/, "女儿"],
  [/^(丈夫|老公|先生)/, "丈夫"],
  [/^(妻子|老婆|媳妇|太太)/, "妻子"],
];

const NOISE_PATTERN =
  /我(是|的)?|该怎么称呼|叫什么|怎么叫|如何称呼|怎么称呼|应该叫|要叫|称呼|什么|谁|？|\?|。|，|,|呢|啊|呀/g;

const PATH_ALIASES: Record<string, string[]> = {
  "父亲的弟弟": ["叔父", "父亲的弟弟"],
  "父亲的哥哥": ["伯父", "父亲的哥哥"],
  "母亲的弟弟": ["舅父", "母亲的弟弟"],
  "母亲的哥哥": ["舅父", "母亲的哥哥"],
  "母亲的姐妹": ["姨母", "母亲的姐妹"],
  "父亲的姐妹": ["姑母", "父亲的姐妹"],
};

export function normalizeQuery(query: string): string {
  return query.replace(NOISE_PATTERN, "").trim();
}

export function mapSegment(part: string): string | null {
  const trimmed = part.trim();
  if (!trimmed) return null;
  for (const [pattern, value] of SEGMENT_RULES) {
    if (value && pattern.test(trimmed)) return value;
    if (!value && pattern.test(trimmed)) {
      const inner = trimmed.replace(/的$/, "");
      return mapSegment(inner);
    }
  }
  return trimmed;
}

/** 从左到右扫描提取关系词（支持无「的」连接） */
export function extractSegments(query: string): string[] {
  let text = normalizeQuery(query);
  if (!text) return [];

  if (/的/.test(text)) {
    return text
      .split(/的/)
      .map((p) => mapSegment(p))
      .filter((p): p is string => Boolean(p));
  }

  const segments: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let matched = false;
    for (const [pattern, value] of SEGMENT_RULES) {
      if (!value) continue;
      const m = remaining.match(pattern);
      if (m && m.index === 0) {
        segments.push(value);
        remaining = remaining.slice(m[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) remaining = remaining.slice(1);
  }

  return segments;
}

export function buildRelationPath(query: string): string | null {
  const segments = extractSegments(query);
  if (!segments.length) return null;
  return segments.join("的");
}

export function parseQueryMeta(query: string): QueryMeta {
  const segments = extractSegments(query);
  const relationPath = segments.length ? segments.join("的") : null;

  let selfGender: KinshipGender = "unisex";
  if (/我是女生|我是女性|本姑娘|我当女的/.test(query)) selfGender = "female";
  if (/我是男生|我是男性|本人男/.test(query)) selfGender = "male";

  let gender: KinshipGender = "unisex";
  if (/女|妹|姐|婆|岳母|媳妇|老婆|妻子|女儿|孙女|阿姨/.test(query))
    gender = "female";
  if (/男|哥|弟|公|岳父|老公|丈夫|儿子|孙子/.test(query)) gender = "male";

  let perspective: QueryPerspective = "self";
  if (/老婆|妻子|媳妇|岳母|岳父|大姨子|小姨子|大舅子|小舅子|儿媳|女婿/.test(query))
    perspective = "wife";
  if (/老公|丈夫|公公|婆婆|大伯子|小叔子/.test(query))
    perspective = "husband";

  const queryIntent = /怎么称呼|叫什么|怎么叫|如何称呼|应该叫|我该怎么称呼/.test(
    query,
  )
    ? "address"
    : "lookup";

  let confidence: MatchConfidence = "low";
  if (segments.length >= 3) confidence = "high";
  else if (segments.length >= 2) confidence = "medium";
  else if (segments.length === 1) confidence = "medium";

  return {
    originalQuery: query,
    relationPath,
    segments,
    gender,
    perspective,
    selfGender,
    confidence,
    queryIntent,
  };
}

function chainsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

function chainContainsInOrder(chain: string[], segments: string[]): boolean {
  let idx = 0;
  for (const seg of segments) {
    const pos = chain.indexOf(seg, idx);
    if (pos === -1) return false;
    idx = pos + 1;
  }
  return true;
}

export function matchByRelationshipChain(
  relations: KinshipRecord[],
  segments: string[],
): KinshipRecord[] {
  if (!segments.length) return [];

  const exact = relations.filter((r) => {
    const chain = r.relationshipChain ?? [];
    return chainsEqual(chain, segments);
  });
  if (exact.length) return exact;

  const suffix = relations.filter((r) => {
    const chain = r.relationshipChain ?? [];
    if (chain.length < segments.length) return false;
    const tail = chain.slice(chain.length - segments.length);
    return chainsEqual(tail, segments);
  });
  if (suffix.length) return suffix;

  const ordered = relations.filter((r) =>
    chainContainsInOrder(r.relationshipChain ?? [], segments),
  );
  return ordered;
}

export function matchByRelationPath(
  relations: KinshipRecord[],
  path: string,
): KinshipRecord[] {
  if (!path) return [];

  const exact = relations.filter((r) => r.relationPath === path);
  if (exact.length) return exact;

  const aliases = PATH_ALIASES[path] ?? [];
  for (const alias of aliases) {
    const hit = relations.filter(
      (r) => r.relationPath.includes(alias) || r.formalTitle === alias,
    );
    if (hit.length) return hit.slice(0, 8);
  }

  const startsWith = relations.filter((r) => r.relationPath.startsWith(path));
  if (startsWith.length) return startsWith.slice(0, 8);

  const contains = relations.filter((r) => r.relationPath.includes(path));
  if (contains.length) return contains.slice(0, 8);

  const segments = path.split("的");
  const ordered = relations.filter((item) => {
    let idx = 0;
    const rp = item.relationPath;
    for (const seg of segments) {
      const pos = rp.indexOf(seg, idx);
      if (pos === -1) return false;
      idx = pos + seg.length;
    }
    return true;
  });

  return ordered.slice(0, 8);
}

export function rankResults(
  relations: KinshipRecord[],
  query: string,
  meta: QueryMeta,
): KinshipRecord[] {
  const q = normalizeQuery(query);
  const path = meta.relationPath;
  const segments = meta.segments;

  const scored = relations
    .map((item) => {
      let score = 0;
      const chain = item.relationshipChain ?? [];

      if (segments.length && chainsEqual(chain, segments)) score += 150;
      else if (segments.length && chainContainsInOrder(chain, segments))
        score += 120;

      if (path && item.relationPath === path) score += 100;
      else if (path && item.relationPath.startsWith(path)) score += 85;
      else if (path && item.relationPath.includes(path)) score += 65;

      if (item.relationPath.includes(q)) score += 40;
      if (item.formalTitle.includes(q)) score += 35;
      if (item.informalTitle?.includes(q)) score += 30;
      if (item.description?.includes(q)) score += 15;

      if (meta.gender !== "unisex" && item.gender === meta.gender) score += 12;
      if (meta.gender !== "unisex" && item.gender === "unisex") score += 4;
      if (item.isCommon) score += 5;

      if (segments.includes("弟弟") && item.relationPath.includes("叔")) score += 18;
      if (segments.includes("哥哥") && item.relationPath.includes("伯")) score += 18;
      if (segments.includes("姐姐") && item.relationPath.includes("姑")) score += 10;
      if (segments.includes("妹妹") && item.relationPath.includes("姑")) score += 10;

      return { item, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const out: KinshipRecord[] = [];
  for (const { item } of scored) {
    const key = item.relationPath;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function searchKinshipRelations(
  relations: KinshipRecord[],
  query: string,
): KinshipRecord[] {
  const meta = parseQueryMeta(query);
  const merged: KinshipRecord[] = [];
  const seen = new Set<string>();

  const push = (list: KinshipRecord[]) => {
    for (const item of list) {
      if (seen.has(item.relationPath)) continue;
      seen.add(item.relationPath);
      merged.push(item);
    }
  };

  if (meta.segments.length) {
    push(matchByRelationshipChain(relations, meta.segments));
  }
  if (meta.relationPath) {
    push(matchByRelationPath(relations, meta.relationPath));
  }

  if (merged.length) return rankResults(merged, query, meta).slice(0, 12);

  const q = normalizeQuery(query);
  const candidates = relations.filter(
    (item) =>
      item.relationPath.includes(q) ||
      item.formalTitle.includes(q) ||
      item.informalTitle?.includes(q) ||
      item.northernTitle?.includes(q) ||
      item.southernTitle?.includes(q) ||
      item.description?.includes(q),
  );

  return rankResults(candidates, query, meta).slice(0, 12);
}

export function buildSuggestions(
  relations: KinshipRecord[],
  meta: QueryMeta,
): string[] {
  if (meta.segments.length >= 2) {
    const partial = meta.segments.slice(0, -1).join("的");
    const hits = matchByRelationPath(relations, partial);
    if (hits[0]) return [`${partial} → ${hits[0].formalTitle}`, "爸爸的哥哥", "妈妈的弟弟"];
  }
  return ["爸爸的哥哥", "妈妈的弟弟", "妻子的弟弟", "老公的哥哥"];
}

export function generateSmartExplanation(
  meta: QueryMeta,
  result?: KinshipRecord | null,
): string {
  if (!result) {
    if (meta.relationPath) {
      return `已解析关系链「${meta.relationPath}」，但库中暂无完全匹配项。建议尝试更常见的说法，如「爸爸的哥哥」「妈妈的弟弟」。`;
    }
    return `暂未理解「${meta.originalQuery}」。请用「的」连接亲属，例如「爸爸的弟弟的儿子」；也支持连说，如「妻子弟弟」。`;
  }

  const lines: string[] = [];
  if (meta.queryIntent === "address") {
    lines.push(
      meta.selfGender === "female"
        ? "从您的视角（女性）来看："
        : meta.selfGender === "male"
          ? "从您的视角（男性）来看："
          : "建议您这样称呼：",
    );
  }

  lines.push(`关系：${result.relationPath}`);
  lines.push(`称呼：${result.formalTitle}（书面）· ${result.informalTitle ?? result.formalTitle}（口语）`);

  if (
    result.northernTitle &&
    result.southernTitle &&
    result.northernTitle !== result.southernTitle
  ) {
    lines.push(`南北：北方「${result.northernTitle}」· 南方「${result.southernTitle}」`);
  }
  if (result.usageNotes) lines.push(`备注：${result.usageNotes}`);
  return lines.join("\n");
}

export function runNaturalQuery(
  relations: KinshipRecord[],
  query: string,
): NaturalQueryResult {
  const meta = parseQueryMeta(query);
  const results = searchKinshipRelations(relations, query);
  const topResult = results[0] ?? null;

  if (topResult && meta.segments.length >= 2) meta.confidence = "high";
  else if (topResult && meta.segments.length === 1) meta.confidence = "medium";

  return {
    parsed: {
      originalQuery: query,
      keywords: meta.segments,
      relationshipChain: meta.segments,
      relationPath: meta.relationPath,
      gender: meta.gender,
      fromPerspective: meta.perspective,
      selfGender: meta.selfGender,
      confidence: meta.confidence,
      queryIntent: meta.queryIntent,
    },
    results,
    explanation: generateSmartExplanation(meta, topResult),
    topResult,
    suggestions: results.length ? [] : buildSuggestions(relations, meta),
  };
}
