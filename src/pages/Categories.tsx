import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/providers/trpc'
import { 
  Users, 
  UserCircle, 
  Heart, 
  Link2, 
  GitBranch,
} from 'lucide-react'

const CATEGORIES = [
  { 
    id: 'paternal' as const, 
    label: '父系亲属', 
    icon: Users,
    desc: '父亲一方的亲属关系，包括祖父、祖母、伯父、叔父、姑母、堂兄弟姐妹等',
    color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
    accent: 'bg-red-500',
  },
  { 
    id: 'maternal' as const, 
    label: '母系亲属', 
    icon: UserCircle,
    desc: '母亲一方的亲属关系，包括外祖父、外祖母、舅父、姨母、表兄弟姐妹等',
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    accent: 'bg-blue-500',
  },
  { 
    id: 'spouse' as const, 
    label: '夫妻亲属', 
    icon: Heart,
    desc: '配偶及其直系亲属，包括公公、婆婆、岳父、岳母、大伯子、小叔子等',
    color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
    accent: 'bg-purple-500',
  },
  { 
    id: 'affinity' as const, 
    label: '姻亲', 
    icon: Link2,
    desc: '通过婚姻关系产生的亲属，包括嫂子、弟媳、姐夫、妹夫、儿媳、女婿等',
    color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
    accent: 'bg-orange-500',
  },
  { 
    id: 'collateral' as const, 
    label: '旁系亲属', 
    icon: GitBranch,
    desc: '扩展的亲属关系，包括伯祖父、叔祖父、堂伯父、堂叔父等更远支的亲属',
    color: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800',
    accent: 'bg-slate-500',
  },
]

const GENERATIONS = [
  { id: 'ancestor' as const, label: '祖辈' },
  { id: 'elder' as const, label: '父辈' },
  { id: 'peer' as const, label: '平辈' },
  { id: 'junior' as const, label: '子辈' },
  { id: 'descendant' as const, label: '孙辈' },
]

export default function Categories() {
  const [activeCategory, setActiveCategory] = useState<string>('paternal')
  const [activeGeneration, setActiveGeneration] = useState<string | null>(null)

  const categoryQuery = trpc.kinship.getByCategory.useQuery({
    category: activeCategory as 'paternal' | 'maternal' | 'spouse' | 'affinity' | 'collateral',
    generationLevel: activeGeneration as 'ancestor' | 'elder' | 'peer' | 'junior' | 'descendant' | undefined,
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold heading-serif mb-2">
            亲属分类图谱
          </h1>
          <p className="text-muted-foreground">
            按父系、母系、夫妻、姻亲、旁系五大模块浏览所有亲属称谓
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setActiveGeneration(null); }}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  isActive
                    ? `${cat.color} border-current shadow-md`
                    : 'bg-card border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg ${isActive ? cat.accent : 'bg-muted'} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                <h3 className="font-semibold text-sm">{cat.label}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cat.desc}</p>
              </button>
            )
          })}
        </div>

        {/* Generation Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveGeneration(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeGeneration === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            全部辈分
          </button>
          {GENERATIONS.map(gen => (
            <button
              key={gen.id}
              onClick={() => setActiveGeneration(gen.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeGeneration === gen.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {gen.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {categoryQuery.isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {categoryQuery.data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryQuery.data.map((item, index) => (
              <Card
                key={item.id}
                className="card-hover overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg heading-serif">{item.formalTitle}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{item.relationPath}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge variant="outline" className="text-xs">
                        {item.generationLevel === 'ancestor' && '祖辈'}
                        {item.generationLevel === 'elder' && '父辈'}
                        {item.generationLevel === 'peer' && '平辈'}
                        {item.generationLevel === 'junior' && '子辈'}
                        {item.generationLevel === 'descendant' && '孙辈'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.gender === 'male' && '男'}
                        {item.gender === 'female' && '女'}
                        {item.gender === 'unisex' && '通用'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">书面</p>
                      <p className="text-sm font-medium">{item.formalTitle}</p>
                    </div>
                    <div className="text-center p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">口语</p>
                      <p className="text-sm font-medium">{item.informalTitle}</p>
                    </div>
                    <div className="text-center p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">北方</p>
                      <p className="text-sm font-medium">{item.northernTitle}</p>
                    </div>
                  </div>
                  {item.southernTitle && item.southernTitle !== item.northernTitle && (
                    <div className="text-center p-2 rounded bg-amber-50 dark:bg-amber-900/20">
                      <p className="text-xs text-amber-600 dark:text-amber-300">南方叫法：{item.southernTitle}</p>
                    </div>
                  )}
                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {categoryQuery.data?.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">该分类下暂无数据</p>
          </div>
        )}
      </div>
    </div>
  )
}
