import { TreePine } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <TreePine className="w-12 h-12 text-primary animate-pulse" />
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
      </div>
      <p className="text-muted-foreground animate-pulse">正在加载...</p>
    </div>
  )
}
