import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { 
  TreePine, 
  Search, 
  Grid3X3, 
  MapPin, 
  BookOpen, 
  ChevronRight,
  Users,
  ArrowRight
} from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { useEffect, useState } from 'react'

const features = [
  {
    title: '可视化族谱图谱',
    desc: '可拖拽、可缩放的交互式族谱树，支持父系/母系/姻亲切换，节点hover高亮、连线平滑动画',
    icon: TreePine,
    path: '/tree',
    color: 'bg-primary/10 text-primary',
  },
  {
    title: '智能称呼查询',
    desc: '输入自然语言如"我爸爸的哥哥"，自动输出标准称呼、关系说明、辈分信息',
    icon: Search,
    path: '/query',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    title: '分类图谱浏览',
    desc: '父系亲属、母系亲属、夫妻亲属、姻亲四大模块，按辈分层次清晰展示',
    icon: Grid3X3,
    path: '/categories',
    color: 'bg-amber-500/10 text-amber-600',
  },
  {
    title: '南北地域差异',
    desc: '北方/南方/普通话传统叫法对比，深入了解不同地域的称谓习惯',
    icon: MapPin,
    path: '/regional',
    color: 'bg-sky-500/10 text-sky-600',
  },
  {
    title: '亲属关系速查表',
    desc: '一键截图保存常用亲属关系对照表，随时随地快速查阅',
    icon: BookOpen,
    path: '/quickref',
    color: 'bg-rose-500/10 text-rose-600',
  },
]

export default function Home() {
  const statsQuery = trpc.kinship.getStats.useQuery()
  const [animatedStats, setAnimatedStats] = useState({ total: 0, categories: 0 })

  useEffect(() => {
    if (statsQuery.data) {
      const total = statsQuery.data.total
      const categories = statsQuery.data.byCategory.length
      // Animate numbers
      let current = 0
      const interval = setInterval(() => {
        current += Math.ceil(total / 20)
        if (current >= total) {
          current = total
          clearInterval(interval)
        }
        setAnimatedStats({ total: current, categories })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [statsQuery.data])

  return (
    <div className="min-h-screen paper-texture">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-32 sm:pb-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Users className="w-4 h-4" />
              <span>已收录 {animatedStats.total}+ 条亲属称谓</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold heading-serif text-foreground mb-6 leading-tight">
              中华宗亲
              <span className="text-primary">称谓图谱</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              传承千年礼仪文化，明晰血脉亲缘关系。<br className="hidden sm:block" />
              可视化族谱、智能查询、地域差异对比，一站式解决称呼难题。
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/query">
                <Button size="lg" className="gap-2 ripple text-base px-8">
                  <Search className="w-5 h-5" />
                  智能查询
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/tree">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                  <TreePine className="w-5 h-5" />
                  族谱图谱
                </Button>
              </Link>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="mt-16 flex items-center justify-center gap-8 text-muted-foreground/40">
            <div className="hidden sm:block w-24 h-px bg-border" />
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-primary/40" />
              <span>父系亲属</span>
              <span className="w-2 h-2 rounded-full bg-secondary/40 ml-2" />
              <span>母系亲属</span>
              <span className="w-2 h-2 rounded-full bg-amber-500/40 ml-2" />
              <span>夫妻姻亲</span>
            </div>
            <div className="hidden sm:block w-24 h-px bg-border" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl font-bold heading-serif mb-4">
              五大核心功能
            </h2>
            <p className="text-muted-foreground">
              从可视化族谱到AI智能问答，全方位覆盖您的亲属称谓需求
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Link
                  key={feature.path}
                  to={feature.path}
                  className="group relative p-6 rounded-xl bg-card border border-border card-hover animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                  <div className="mt-4 flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>立即使用</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              )
            })}

            {/* Stats Card */}
            <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary heading-serif">
                    {animatedStats.total}+
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">收录称谓</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary heading-serif">
                    {animatedStats.categories}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">分类模块</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600 heading-serif">5</div>
                  <div className="text-sm text-muted-foreground mt-1">辈分层次</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-sky-600 heading-serif">3</div>
                  <div className="text-sm text-muted-foreground mt-1">地域对比</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold heading-serif mb-6">
              如何称呼TA？一句话搞定
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 sm:p-8 text-left">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium">输入关系描述</p>
                    <p className="text-sm text-muted-foreground">例如："我是女生，该怎么称呼爸爸的弟弟的儿子？"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium">AI智能解析</p>
                    <p className="text-sm text-muted-foreground">系统自动解析关系链，计算正确称谓</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium">查看完整结果</p>
                    <p className="text-sm text-muted-foreground">标准称呼 + 关系说明 + 辈分信息 + 地域差异</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link to="/query">
                  <Button className="gap-2 ripple">
                    <Search className="w-4 h-4" />
                    试试智能查询
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
