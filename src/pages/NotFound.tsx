import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { TreePine, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <TreePine className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold heading-serif mb-4">404</h1>
        <p className="text-muted-foreground mb-6">此页面不存在，如同断了线的风筝</p>
        <Link to="/">
          <Button className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Button>
        </Link>
      </div>
    </div>
  )
}
