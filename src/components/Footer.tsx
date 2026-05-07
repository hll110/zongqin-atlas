import { TreePine, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-primary" />
            <span className="font-semibold heading-serif">中华宗亲称谓图谱</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            传承千年礼仪文化，明晰血脉亲缘关系
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>用</span>
            <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
            <span>守护传统</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
