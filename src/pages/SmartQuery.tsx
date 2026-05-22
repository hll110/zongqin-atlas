import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/providers/trpc'
import { extractSegments, buildRelationPath } from '../../lib/kinship-intelligence'
import {
  Search,
  Send,
  Sparkles,
  MapPin,
  User,
  Clock,
  ChevronRight,
} from 'lucide-react'

const EXAMPLE_QUERIES = [
  "爸爸的弟弟的儿子",
  "我是女生，怎么称呼妈妈的哥哥？",
  "妻子的姐姐的丈夫叫什么？",
  "老公的弟弟的老婆",
  "爷爷的弟弟怎么称呼？",
]

const CONFIDENCE_LABEL: Record<string, string> = {
  high: '高匹配',
  medium: '中匹配',
  low: '关键词',
}

const GEN_LABEL: Record<string, string> = {
  ancestor: '祖辈',
  elder: '父辈',
  peer: '平辈',
  junior: '子辈',
  descendant: '孙辈',
}

const CAT_LABEL: Record<string, string> = {
  paternal: '父系',
  maternal: '母系',
  spouse: '配偶',
  affinity: '姻亲',
  collateral: '旁系',
}

export default function SmartQuery() {
  const [query, setQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const naturalQuery = trpc.kinship.naturalQuery.useMutation()

  const previewSegments = useMemo(
    () => (query.trim() ? extractSegments(query) : []),
    [query],
  )
  const previewPath = useMemo(
    () => (query.trim() ? buildRelationPath(query) : null),
    [query],
  )

  const handleSearch = () => {
    if (!query.trim()) return
    setHasSearched(true)
    naturalQuery.mutate({ query: query.trim() })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleExampleClick = (q: string) => {
    setQuery(q)
    setHasSearched(true)
    naturalQuery.mutate({ query: q })
  }

  const result = naturalQuery.data
  const top = result?.results[0]
  const others = result?.results.slice(1) ?? []
  const parsed = result?.parsed as {
    relationPath?: string | null
    keywords?: string[]
    confidence?: string
  } | undefined

  const displayChain =
    parsed?.relationPath || parsed?.keywords?.join(' → ') || previewPath

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>关系链智能解析</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold heading-serif mb-3">
            亲属称呼智能查询
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            支持「爸爸的弟弟的儿子」或「妻子弟弟」等自然表达，自动匹配标准称谓与南北差异
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="例如：爸爸的弟弟的儿子怎么称呼？"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 h-14 text-base"
              />
            </div>
            <Button
              size="lg"
              onClick={handleSearch}
              disabled={naturalQuery.isPending || !query.trim()}
              className="gap-2 shrink-0"
            >
              {naturalQuery.isPending ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              解析
            </Button>
          </div>
        </div>

        {previewSegments.length > 0 && !hasSearched && (
          <Card className="mb-6 border-secondary/30 bg-secondary/5">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">识别关系链</p>
              <div className="flex flex-wrap items-center gap-1 text-sm font-medium">
                {previewSegments.map((seg, i) => (
                  <span key={i} className="inline-flex items-center gap-1">
                    <span className="text-secondary">{seg}</span>
                    {i < previewSegments.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    )}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!hasSearched && (
          <div className="mb-8 animate-fade-in">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">试试这些例子</h3>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(q)}
                  className="px-4 py-2 rounded-full bg-muted text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {naturalQuery.isPending && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground">正在解析关系链…</p>
          </div>
        )}

        {result && result.results.length > 0 && !naturalQuery.isPending && (
          <div className="space-y-6 animate-fade-in-up">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">关系链</p>
                    <p className="font-medium mt-1">{displayChain}</p>
                  </div>
                  {parsed?.confidence && (
                    <Badge variant="outline" className="shrink-0">
                      {CONFIDENCE_LABEL[parsed.confidence] ?? parsed.confidence}
                    </Badge>
                  )}
                </div>
                {result.explanation && (
                  <p className="text-sm text-muted-foreground mt-3 whitespace-pre-line border-t border-primary/10 pt-3">
                    {result.explanation}
                  </p>
                )}
              </CardContent>
            </Card>

            {top && (
              <Card className="overflow-hidden border-2 border-primary/30 shadow-md">
                <CardHeader className="pb-2 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary">最佳匹配</Badge>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {GEN_LABEL[top.generationLevel] ?? top.generationLevel}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {CAT_LABEL[top.category] ?? top.category}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-3xl heading-serif pt-2">
                    {top.formalTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-lg text-muted-foreground">
                    口语：<span className="font-semibold text-foreground">{top.informalTitle}</span>
                  </p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-sky-600 font-medium">北：{top.northernTitle}</span>
                    <span className="text-amber-600 font-medium">南：{top.southernTitle}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">关系路径：{top.relationPath}</p>
                  {top.usageNotes && (
                    <p className="text-sm text-primary">{top.usageNotes}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {others.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  其他相关称谓（{others.length}）
                </h3>
                <div className="space-y-4">
                  {others.map((item) => (
                    <Card key={item.id} className="card-hover">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg heading-serif">
                            {item.formalTitle}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {GEN_LABEL[item.generationLevel]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          <div className="p-2 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-1 text-muted-foreground mb-1">
                              <User className="w-3 h-3" />
                              口语
                            </div>
                            <p className="font-medium">{item.informalTitle}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-1 text-muted-foreground mb-1">
                              <MapPin className="w-3 h-3" />
                              北方
                            </div>
                            <p className="font-medium text-sky-600">{item.northernTitle}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-1 text-muted-foreground mb-1">
                              <MapPin className="w-3 h-3" />
                              南方
                            </div>
                            <p className="font-medium text-amber-600">{item.southernTitle}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{item.relationPath}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {result && result.results.length === 0 && !naturalQuery.isPending && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">未找到精确匹配</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              {result.explanation || '请尝试更常见的说法，如「爸爸的哥哥」「妈妈的弟弟」。'}
            </p>
            {'suggestions' in result && Array.isArray((result as { suggestions?: string[] }).suggestions) && (
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {((result as { suggestions: string[] }).suggestions).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleExampleClick(s)}
                    className="px-3 py-1.5 rounded-full bg-muted text-sm hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <Button variant="outline" onClick={() => { setQuery(''); setHasSearched(false); }}>
              重新查询
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
