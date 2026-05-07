import { useRef, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  Table,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

const REFERENCE_TABLES = [
  {
    title: "父系亲属速查",
    category: "paternal" as const,
    rows: [
      { relation: "父亲的父亲", formal: "祖父", informal: "爷爷", northern: "爷爷", southern: "阿爷" },
      { relation: "父亲的母亲", formal: "祖母", informal: "奶奶", northern: "奶奶", southern: "阿嬷" },
      { relation: "父亲的哥哥", formal: "伯父", informal: "伯伯", northern: "大爷", southern: "伯伯" },
      { relation: "父亲的弟弟", formal: "叔父", informal: "叔叔", northern: "叔叔", southern: "叔叔" },
      { relation: "父亲的姐姐", formal: "姑母", informal: "姑姑", northern: "姑姑", southern: "阿姑" },
      { relation: "父亲的妹妹", formal: "姑母", informal: "姑姑", northern: "姑姑", southern: "阿姑" },
      { relation: "伯父的妻子", formal: "伯母", informal: "伯母", northern: "大娘", southern: "伯母" },
      { relation: "叔父的妻子", formal: "婶母", informal: "婶婶", northern: "婶婶", southern: "婶婶" },
      { relation: "姑母的丈夫", formal: "姑丈", informal: "姑父", northern: "姑父", southern: "姑丈" },
      { relation: "哥哥", formal: "兄", informal: "哥哥", northern: "哥哥", southern: "哥哥" },
      { relation: "弟弟", formal: "弟", informal: "弟弟", northern: "弟弟", southern: "弟弟" },
      { relation: "姐姐", formal: "姐", informal: "姐姐", northern: "姐姐", southern: "姐姐" },
      { relation: "妹妹", formal: "妹", informal: "妹妹", northern: "妹妹", southern: "妹妹" },
      { relation: "兄弟的儿子", formal: "侄子", informal: "侄子", northern: "侄子", southern: "侄" },
      { relation: "兄弟的女儿", formal: "侄女", informal: "侄女", northern: "侄女", southern: "侄女" },
      { relation: "姐妹的儿子", formal: "外甥", informal: "外甥", northern: "外甥", southern: "外甥" },
      { relation: "姐妹的女儿", formal: "外甥女", informal: "外甥女", northern: "外甥女", southern: "外甥女" },
    ]
  },
  {
    title: "母系亲属速查",
    category: "maternal" as const,
    rows: [
      { relation: "母亲的父亲", formal: "外祖父", informal: "外公", northern: "姥爷", southern: "外公" },
      { relation: "母亲的母亲", formal: "外祖母", informal: "外婆", northern: "姥姥", southern: "外婆" },
      { relation: "母亲的哥哥", formal: "舅父", informal: "舅舅", northern: "舅舅", southern: "阿舅" },
      { relation: "母亲的弟弟", formal: "舅父", informal: "舅舅", northern: "舅舅", southern: "阿舅" },
      { relation: "母亲的姐姐", formal: "姨母", informal: "姨妈", northern: "姨妈", southern: "姨妈" },
      { relation: "母亲的妹妹", formal: "姨母", informal: "姨妈", northern: "小姨", southern: "小姨" },
      { relation: "舅父的妻子", formal: "舅母", informal: "舅妈", northern: "舅妈", southern: "舅母" },
      { relation: "姨母的丈夫", formal: "姨丈", informal: "姨父", northern: "姨父", southern: "姨丈" },
      { relation: "舅父的儿子(年长)", formal: "表兄", informal: "表哥", northern: "表哥", southern: "表兄" },
      { relation: "舅父的儿子(年幼)", formal: "表弟", informal: "表弟", northern: "表弟", southern: "表弟" },
      { relation: "姨母的儿子(年长)", formal: "表兄", informal: "表哥", northern: "表哥", southern: "表兄" },
      { relation: "姨母的儿子(年幼)", formal: "表弟", informal: "表弟", northern: "表弟", southern: "表弟" },
    ]
  },
  {
    title: "夫妻亲属速查",
    category: "spouse" as const,
    rows: [
      { relation: "丈夫", formal: "丈夫", informal: "老公", northern: "老公", southern: "老公" },
      { relation: "妻子", formal: "妻子", informal: "老婆", northern: "老婆", southern: "老婆" },
      { relation: "丈夫的父亲", formal: "公公", informal: "公公", northern: "公公", southern: "家公" },
      { relation: "丈夫的母亲", formal: "婆婆", informal: "婆婆", northern: "婆婆", southern: "家婆" },
      { relation: "妻子的父亲", formal: "岳父", informal: "岳父", northern: "岳父", southern: "丈人" },
      { relation: "妻子的母亲", formal: "岳母", informal: "岳母", northern: "岳母", southern: "丈母娘" },
      { relation: "丈夫的哥哥", formal: "大伯子", informal: "大伯", northern: "大伯", southern: "大伯" },
      { relation: "丈夫的弟弟", formal: "小叔子", informal: "小叔", northern: "小叔", southern: "小叔" },
      { relation: "丈夫的姐姐", formal: "大姑子", informal: "大姑", northern: "大姑", southern: "大姑" },
      { relation: "丈夫的妹妹", formal: "小姑子", informal: "小姑", northern: "小姑", southern: "小姑" },
      { relation: "妻子的哥哥", formal: "大舅子", informal: "大舅哥", northern: "大舅哥", southern: "大舅" },
      { relation: "妻子的弟弟", formal: "小舅子", informal: "小舅子", northern: "小舅子", southern: "小舅" },
      { relation: "妻子的姐姐", formal: "大姨子", informal: "大姨姐", northern: "大姨姐", southern: "大姨" },
      { relation: "妻子的妹妹", formal: "小姨子", informal: "小姨子", northern: "小姨子", southern: "小姨" },
    ]
  },
  {
    title: "姻亲速查",
    category: "affinity" as const,
    rows: [
      { relation: "哥哥的妻子", formal: "嫂子", informal: "嫂子", northern: "嫂子", southern: "阿嫂" },
      { relation: "弟弟的妻子", formal: "弟媳", informal: "弟媳", northern: "弟妹", southern: "弟媳" },
      { relation: "姐姐的丈夫", formal: "姐夫", informal: "姐夫", northern: "姐夫", southern: "姐夫" },
      { relation: "妹妹的丈夫", formal: "妹夫", informal: "妹夫", northern: "妹夫", southern: "妹夫" },
      { relation: "儿子的妻子", formal: "儿媳", informal: "儿媳妇", northern: "儿媳妇", southern: "新妇" },
      { relation: "女儿的丈夫", formal: "女婿", informal: "女婿", northern: "女婿", southern: "女婿" },
      { relation: "侄子的妻子", formal: "侄媳", informal: "侄媳妇", northern: "侄媳妇", southern: "侄媳" },
      { relation: "侄女的丈夫", formal: "侄女婿", informal: "侄女婿", northern: "侄女婿", southern: "侄女婿" },
      { relation: "堂兄的妻子", formal: "堂嫂", informal: "堂嫂", northern: "堂嫂", southern: "堂嫂" },
      { relation: "堂弟的妻子", formal: "堂弟媳", informal: "堂弟媳", northern: "堂弟媳", southern: "堂弟媳" },
      { relation: "表兄的妻子", formal: "表嫂", informal: "表嫂", northern: "表嫂", southern: "表嫂" },
      { relation: "表弟的妻子", formal: "表弟媳", informal: "表弟媳", northern: "表弟媳", southern: "表弟媳" },
      { relation: "亲家公", formal: "亲家公", informal: "亲家公", northern: "亲家公", southern: "亲家" },
      { relation: "亲家母", formal: "亲家母", informal: "亲家母", northern: "亲家母", southern: "亲家" },
    ]
  },
]

export default function QuickRef() {
  const captureRef = useRef<HTMLDivElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [expandedTables, setExpandedTables] = useState<Record<number, boolean>>({ 0: true })
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const toggleTable = (index: number) => {
    setExpandedTables(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const handleCapture = useCallback(async () => {
    if (!captureRef.current) return
    setIsCapturing(true)
    
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#F5F0E6',
        scale: 2,
        logging: false,
        useCORS: true,
      })
      
      const link = document.createElement('a')
      link.download = `宗亲称谓速查表_${new Date().toLocaleDateString()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Screenshot failed:', err)
      alert('截图保存失败，请重试')
    } finally {
      setIsCapturing(false)
    }
  }, [])

  const filteredTables = selectedCategory
    ? REFERENCE_TABLES.filter(t => t.category === selectedCategory)
    : REFERENCE_TABLES

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold heading-serif mb-2">
                亲属关系速查表
              </h1>
              <p className="text-muted-foreground">
                常用亲属称谓对照表，支持截图保存到本地
              </p>
            </div>
            <Button
              onClick={handleCapture}
              disabled={isCapturing}
              className="gap-2 ripple"
            >
              <Camera className="w-4 h-4" />
              {isCapturing ? '生成中...' : '截图保存'}
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              全部
            </button>
            {REFERENCE_TABLES.map(table => (
              <button
                key={table.category}
                onClick={() => setSelectedCategory(table.category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === table.category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {table.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Capture Area */}
      <div ref={captureRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Watermark for capture */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold heading-serif text-primary">
            中华宗亲称谓速查表
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            生成时间：{new Date().toLocaleString('zh-CN')}
          </p>
        </div>

        <div className="space-y-6">
          {filteredTables.map((table, tableIndex) => (
            <Card key={table.category} className="overflow-hidden">
              <CardHeader 
                className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleTable(tableIndex)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Table className="w-5 h-5 text-primary" />
                    {table.title}
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    {expandedTables[tableIndex] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              {expandedTables[tableIndex] && (
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold">关系</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold">书面语</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold">口语</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold">北方</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold">南方</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {table.rows.map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-4 py-2 text-sm">{row.relation}</td>
                            <td className="px-4 py-2 text-sm font-medium text-primary">{row.formal}</td>
                            <td className="px-4 py-2 text-sm">{row.informal}</td>
                            <td className="px-4 py-2 text-sm">
                              <Badge variant="outline" className="text-xs bg-sky-50 text-sky-700">
                                {row.northern}
                              </Badge>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">
                                {row.southern}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Footer for capture */}
        <div className="mt-8 pt-4 border-t border-border text-center text-xs text-muted-foreground">
          <p>中华宗亲称谓图谱 | 传承千年礼仪文化</p>
          <p className="mt-1">数据仅供参考，各地习俗可能存在差异</p>
        </div>
      </div>
    </div>
  )
}
