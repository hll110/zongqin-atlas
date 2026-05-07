import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Info,
  Search,
  X
} from 'lucide-react'
import { trpc } from '@/providers/trpc'

interface TreeNode {
  id: string
  label: string
  title: string
  x: number
  y: number
  generation: number
  category: string
  gender: string
  relations?: TreeNode[]
}

interface TreeEdge {
  from: string
  to: string
  label?: string
}

const TREE_DATA: TreeNode = {
  id: 'self',
  label: '我',
  title: '自己',
  x: 400,
  y: 400,
  generation: 0,
  category: 'self',
  gender: 'unisex',
  relations: [
    // 父辈
    {
      id: 'father',
      label: '父',
      title: '父亲',
      x: 300,
      y: 300,
      generation: -1,
      category: 'paternal',
      gender: 'male',
      relations: [
        {
          id: 'grandfather-p',
          label: '祖',
          title: '祖父',
          x: 250,
          y: 200,
          generation: -2,
          category: 'paternal',
          gender: 'male',
          relations: [
            { id: 'great-grandfather-p', label: '高祖', title: '高祖父', x: 200, y: 100, generation: -3, category: 'paternal', gender: 'male' },
            { id: 'great-grandmother-p', label: '高祖母', title: '高祖母', x: 300, y: 100, generation: -3, category: 'paternal', gender: 'female' },
          ]
        },
        {
          id: 'grandmother-p',
          label: '祖母',
          title: '祖母',
          x: 350,
          y: 200,
          generation: -2,
          category: 'paternal',
          gender: 'female',
        },
        {
          id: 'uncle1',
          label: '伯',
          title: '伯父',
          x: 150,
          y: 300,
          generation: -1,
          category: 'paternal',
          gender: 'male',
        },
        {
          id: 'uncle2',
          label: '叔',
          title: '叔父',
          x: 450,
          y: 300,
          generation: -1,
          category: 'paternal',
          gender: 'male',
        },
        {
          id: 'aunt-p',
          label: '姑',
          title: '姑母',
          x: 550,
          y: 300,
          generation: -1,
          category: 'paternal',
          gender: 'female',
        },
      ]
    },
    {
      id: 'mother',
      label: '母',
      title: '母亲',
      x: 500,
      y: 300,
      generation: -1,
      category: 'maternal',
      gender: 'female',
      relations: [
        {
          id: 'grandfather-m',
          label: '外祖',
          title: '外祖父',
          x: 450,
          y: 200,
          generation: -2,
          category: 'maternal',
          gender: 'male',
          relations: [
            { id: 'great-grandfather-m', label: '外高', title: '外高祖父', x: 400, y: 100, generation: -3, category: 'maternal', gender: 'male' },
            { id: 'great-grandmother-m', label: '外高祖母', title: '外高祖母', x: 500, y: 100, generation: -3, category: 'maternal', gender: 'female' },
          ]
        },
        {
          id: 'grandmother-m',
          label: '外祖母',
          title: '外祖母',
          x: 550,
          y: 200,
          generation: -2,
          category: 'maternal',
          gender: 'female',
        },
        {
          id: 'uncle-m',
          label: '舅',
          title: '舅父',
          x: 650,
          y: 300,
          generation: -1,
          category: 'maternal',
          gender: 'male',
        },
        {
          id: 'aunt-m',
          label: '姨',
          title: '姨母',
          x: 750,
          y: 300,
          generation: -1,
          category: 'maternal',
          gender: 'female',
        },
      ]
    },
    // 配偶
    {
      id: 'spouse-m',
      label: '夫',
      title: '丈夫',
      x: 500,
      y: 400,
      generation: 0,
      category: 'spouse',
      gender: 'male',
    },
    {
      id: 'spouse-f',
      label: '妻',
      title: '妻子',
      x: 300,
      y: 400,
      generation: 0,
      category: 'spouse',
      gender: 'female',
    },
    // 平辈
    {
      id: 'brother1',
      label: '兄',
      title: '哥哥',
      x: 200,
      y: 400,
      generation: 0,
      category: 'paternal',
      gender: 'male',
    },
    {
      id: 'brother2',
      label: '弟',
      title: '弟弟',
      x: 600,
      y: 400,
      generation: 0,
      category: 'paternal',
      gender: 'male',
    },
    {
      id: 'sister1',
      label: '姐',
      title: '姐姐',
      x: 100,
      y: 400,
      generation: 0,
      category: 'paternal',
      gender: 'female',
    },
    {
      id: 'sister2',
      label: '妹',
      title: '妹妹',
      x: 700,
      y: 400,
      generation: 0,
      category: 'paternal',
      gender: 'female',
    },
    // 子辈
    {
      id: 'son',
      label: '子',
      title: '儿子',
      x: 350,
      y: 500,
      generation: 1,
      category: 'paternal',
      gender: 'male',
    },
    {
      id: 'daughter',
      label: '女',
      title: '女儿',
      x: 450,
      y: 500,
      generation: 1,
      category: 'paternal',
      gender: 'female',
    },
    // 孙辈
    {
      id: 'grandson',
      label: '孙',
      title: '孙子',
      x: 350,
      y: 600,
      generation: 2,
      category: 'paternal',
      gender: 'male',
    },
    {
      id: 'granddaughter',
      label: '孙女',
      title: '孙女',
      x: 450,
      y: 600,
      generation: 2,
      category: 'paternal',
      gender: 'female',
    },
  ]
}

function getAllNodes(node: TreeNode): TreeNode[] {
  const nodes = [node]
  if (node.relations) {
    for (const child of node.relations) {
      nodes.push(...getAllNodes(child))
    }
  }
  return nodes
}

function getAllEdges(node: TreeNode): TreeEdge[] {
  const edges: TreeEdge[] = []
  if (node.relations) {
    for (const child of node.relations) {
      edges.push({ from: node.id, to: child.id, label: child.category === 'spouse' ? '配偶' : '亲缘' })
      edges.push(...getAllEdges(child))
    }
  }
  return edges
}

const CATEGORY_COLORS: Record<string, { bg: string; stroke: string; text: string }> = {
  paternal: { bg: '#fef2f2', stroke: '#dc2626', text: '#991b1b' },
  maternal: { bg: '#eff6ff', stroke: '#2563eb', text: '#1e40af' },
  spouse: { bg: '#fdf4ff', stroke: '#9333ea', text: '#6b21a8' },
  affinity: { bg: '#fff7ed', stroke: '#ea580c', text: '#9a3412' },
  self: { bg: '#f0fdf4', stroke: '#16a34a', text: '#166534' },
  collateral: { bg: '#f8fafc', stroke: '#64748b', text: '#475569' },
}

const GENERATION_LABELS: Record<number, string> = {
  '-3': '高祖辈',
  '-2': '祖辈',
  '-1': '父辈',
  0: '平辈',
  1: '子辈',
  2: '孙辈',
}

export default function GenealogyTree() {
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const nodes = getAllNodes(TREE_DATA)
  const edges = getAllEdges(TREE_DATA)

  const { data: dbResults } = trpc.kinship.search.useQuery(
    { query: searchTerm, limit: 10 },
    { enabled: searchTerm.length > 0 }
  )

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(prev => Math.max(0.3, Math.min(3, prev * delta)))
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsDragging(true)
      setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y })
    }
  }, [translate])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setTranslate({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - translate.x,
        y: e.touches[0].clientY - translate.y,
      })
    }
  }, [translate])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      e.preventDefault()
      setTranslate({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      })
    }
  }, [isDragging, dragStart])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const resetView = () => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }

  const filteredNodes = categoryFilter
    ? nodes.filter(n => n.category === categoryFilter || n.id === 'self')
    : nodes

  const isNodeVisible = (nodeId: string) => {
    if (!categoryFilter) return true
    return filteredNodes.some(n => n.id === nodeId)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold heading-serif">可视化族谱图谱</h1>
              <p className="text-sm text-muted-foreground">拖拽移动，滚轮缩放，点击节点查看详情</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索亲属..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-48"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { id: null, label: '全部', color: 'bg-muted text-muted-foreground' },
              { id: 'paternal', label: '父系', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
              { id: 'maternal', label: '母系', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
              { id: 'spouse', label: '配偶', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
              { id: 'affinity', label: '姻亲', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
            ].map(cat => (
              <button
                key={cat.id || 'all'}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  categoryFilter === cat.id
                    ? 'ring-2 ring-primary ring-offset-2'
                    : 'hover:opacity-80'
                } ${cat.color}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Tree */}
      <div
        ref={containerRef}
        className="relative w-full h-[calc(100vh-12rem)] overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox="0 0 800 700"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
            <filter id="ink-filter">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
            </filter>
          </defs>

          <g transform={`translate(${translate.x}, ${translate.y}) scale(${scale})`}>
            {/* Generation labels */}
            {Object.entries(GENERATION_LABELS).map(([gen, label]) => (
              <text
                key={gen}
                x={20}
                y={parseInt(gen) * 100 + 100 + 5}
                className="text-xs fill-muted-foreground opacity-50"
                style={{ fontSize: '10px' }}
              >
                {label}
              </text>
            ))}

            {/* Edges */}
            {edges.map((edge, i) => {
              const fromNode = nodes.find(n => n.id === edge.from)
              const toNode = nodes.find(n => n.id === edge.to)
              if (!fromNode || !toNode) return null
              if (!isNodeVisible(fromNode.id) || !isNodeVisible(toNode.id)) return null

              const isHighlighted = hoveredNode === fromNode.id || hoveredNode === toNode.id

              return (
                <line
                  key={`${edge.from}-${edge.to}-${i}`}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={isHighlighted ? '#9D2933' : '#d1d5db'}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  opacity={isHighlighted ? 1 : 0.6}
                  className="transition-all duration-300"
                />
              )
            })}

            {/* Nodes */}
            {filteredNodes.map(node => {
              const colors = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.collateral
              const isHovered = hoveredNode === node.id
              const isSelf = node.id === 'self'

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(node)}
                  style={{ transition: 'all 0.3s ease' }}
                >
                  <circle
                    r={isSelf ? 28 : isHovered ? 26 : 24}
                    fill={isSelf ? '#9D2933' : isHovered ? colors.bg : '#ffffff'}
                    stroke={isSelf ? '#7a1f27' : colors.stroke}
                    strokeWidth={isSelf ? 3 : isHovered ? 2.5 : 2}
                    filter="url(#node-shadow)"
                    className="transition-all duration-300"
                  />
                  <text
                    textAnchor="middle"
                    dy="0.3em"
                    fill={isSelf ? '#ffffff' : colors.text}
                    fontSize={isSelf ? 14 : 13}
                    fontWeight={isSelf ? 'bold' : 'normal'}
                    className="select-none pointer-events-none"
                  >
                    {node.label}
                  </text>
                  {isHovered && (
                    <g>
                      <rect
                        x={-40}
                        y={-55}
                        width={80}
                        height={22}
                        rx={4}
                        fill="rgba(0,0,0,0.75)"
                      />
                      <text
                        textAnchor="middle"
                        y={-40}
                        fill="white"
                        fontSize={10}
                        className="select-none pointer-events-none"
                      >
                        {node.title}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {/* Controls */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setScale(prev => Math.min(3, prev * 1.2))}
          className="shadow-lg"
          aria-label="放大"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setScale(prev => Math.max(0.3, prev / 1.2))}
          className="shadow-lg"
          aria-label="缩小"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={resetView}
          className="shadow-lg"
          aria-label="重置视图"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Node Detail Panel */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl border border-border shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold heading-serif">{selectedNode.title}</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">关系：</span>
                <span className="text-sm font-medium">{selectedNode.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">类别：</span>
                <span className="text-sm font-medium">
                  {selectedNode.category === 'paternal' && '父系亲属'}
                  {selectedNode.category === 'maternal' && '母系亲属'}
                  {selectedNode.category === 'spouse' && '夫妻亲属'}
                  {selectedNode.category === 'affinity' && '姻亲'}
                  {selectedNode.category === 'self' && '自己'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">辈分：</span>
                <span className="text-sm font-medium">{GENERATION_LABELS[selectedNode.generation]}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">性别：</span>
                <span className="text-sm font-medium">
                  {selectedNode.gender === 'male' ? '男性' : selectedNode.gender === 'female' ? '女性' : '不限'}
                </span>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => setSelectedNode(null)}
              >
                <Info className="w-4 h-4" />
                了解更多
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={() => setSelectedNode(null)}
              >
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchTerm && dbResults && dbResults.length > 0 && (
        <div className="fixed top-32 left-4 right-4 sm:left-auto sm:right-8 sm:w-80 z-40">
          <div className="bg-card rounded-xl border border-border shadow-xl p-4 max-h-80 overflow-y-auto">
            <h3 className="text-sm font-semibold mb-3">搜索结果</h3>
            <div className="space-y-2">
              {dbResults.map(result => (
                <div
                  key={result.id}
                  className="p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => {
                    setSearchTerm('')
                  }}
                >
                  <div className="font-medium text-sm">{result.formalTitle}</div>
                  <div className="text-xs text-muted-foreground">{result.relationPath}</div>
                  <div className="text-xs text-primary mt-1">
                    口语：{result.informalTitle} | 北方：{result.northernTitle} | 南方：{result.southernTitle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
