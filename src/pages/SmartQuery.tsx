import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/providers/trpc'
import { 
  Search, 
  Send, 
  Sparkles, 
  BookOpen, 
  MapPin, 
  User,
  Clock
} from 'lucide-react'

const EXAMPLE_QUERIES = [
  "我是女生，该怎么称呼爸爸的弟弟的儿子？",
  "妻子的姐姐的丈夫叫什么？",
  "我该怎么称呼妈妈的哥哥？",
  "老公的弟弟的老婆我应该叫什么？",
  "爸爸的爸爸的哥哥怎么称呼？",
  "我女儿的丈夫的父母我怎么称呼？",
]

export default function SmartQuery() {
  const [query, setQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const naturalQuery = trpc.kinship.naturalQuery.useMutation()

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>AI 智能解析</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold heading-serif mb-3">
            亲属称呼智能查询
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            用自然语言描述关系，AI自动解析并输出标准称呼、关系说明和辈分信息
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Box */}
        <div className="relative mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="例如：我是女生，该怎么称呼爸爸的弟弟的儿子？"
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
              className="gap-2 ripple"
            >
              {naturalQuery.isPending ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              查询
            </Button>
          </div>
        </div>

        {/* Example Queries */}
        {!hasSearched && (
          <div className="mb-8 animate-fade-in">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              试试这些例子
            </h3>
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

        {/* Results */}
        {naturalQuery.isPending && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground">正在解析关系...</p>
          </div>
        )}

        {result && result.results.length > 0 && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Parsed Info */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">关系链解析</p>
                    <p className="font-medium mt-1">
                      {result.parsed.keywords.join(' → ')}
                    </p>
                    {result.explanation && (
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
                        {result.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Cards */}
            {result.results.map((item) => (
              <Card key={item.id} className="card-hover overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl heading-serif">{item.formalTitle}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.generationLevel === 'ancestor' && '祖辈'}
                        {item.generationLevel === 'elder' && '父辈'}
                        {item.generationLevel === 'peer' && '平辈'}
                        {item.generationLevel === 'junior' && '子辈'}
                        {item.generationLevel === 'descendant' && '孙辈'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.category === 'paternal' && '父系'}
                        {item.category === 'maternal' && '母系'}
                        {item.category === 'spouse' && '配偶'}
                        {item.category === 'affinity' && '姻亲'}
                        {item.category === 'collateral' && '旁系'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <BookOpen className="w-4 h-4" />
                        <span>书面语</span>
                      </div>
                      <p className="font-semibold text-lg">{item.formalTitle}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <User className="w-4 h-4" />
                        <span>口语</span>
                      </div>
                      <p className="font-semibold text-lg">{item.informalTitle}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <MapPin className="w-4 h-4" />
                        <span>地域差异</span>
                      </div>
                      <p className="text-sm">
                        <span className="text-sky-600 font-medium">北：{item.northernTitle}</span>
                        <span className="mx-1">|</span>
                        <span className="text-amber-600 font-medium">南：{item.southernTitle}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">关系路径：{item.relationPath}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    )}
                    {item.usageNotes && (
                      <p className="text-sm text-primary mt-1">{item.usageNotes}</p>
                    )}
                  </div>

                  {item.otherVariants && item.otherVariants.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-muted-foreground">其他叫法：</span>
                      {item.otherVariants.map((variant, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {variant}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {result && result.results.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">未找到匹配结果</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              抱歉，暂时无法理解这个关系描述。请尝试用更简单的表达，如"爸爸的哥哥"、"妻子的弟弟"等。
            </p>
            <div className="mt-6">
              <Button variant="outline" onClick={() => { setQuery(''); setHasSearched(false); }}>
                重新查询
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
