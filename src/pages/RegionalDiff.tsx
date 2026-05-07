import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { trpc } from '@/providers/trpc'
import { 
  MapPin, 
  ArrowRightLeft,
  Search,
  Globe
} from 'lucide-react'

const REGION_COMPARISONS = [
  {
    relation: "父亲的哥哥",
    northern: "大爷",
    southern: "伯伯 / 阿伯",
    standard: "伯父",
    notes: "北方多用'大爷'，南方多用'伯伯'或'阿伯'",
  },
  {
    relation: "父亲的弟弟",
    northern: "叔叔",
    southern: "阿叔 / 叔叔",
    standard: "叔父",
    notes: "北方称'叔叔'，粤语区常称'阿叔'",
  },
  {
    relation: "父亲的姐妹",
    northern: "姑姑",
    southern: "阿姑 / 姑姑",
    standard: "姑母",
    notes: "北方多用'姑姑'，南方部分地区用'阿姑'",
  },
  {
    relation: "母亲的兄弟",
    northern: "舅舅",
    southern: "阿舅 / 舅舅",
    standard: "舅父",
    notes: "普遍称'舅舅'，粤语区称'阿舅'",
  },
  {
    relation: "母亲的姐妹",
    northern: "姨妈",
    southern: "阿姨 / 姨妈",
    standard: "姨母",
    notes: "北方多用'姨妈'，上海等地常用'阿姨'",
  },
  {
    relation: "祖父",
    northern: "爷爷",
    southern: "阿爷 / 爷爷",
    standard: "祖父",
    notes: "北方多用'爷爷'，粤语区称'阿爷'",
  },
  {
    relation: "祖母",
    northern: "奶奶",
    southern: "阿嬷 / 奶奶",
    standard: "祖母",
    notes: "北方多用'奶奶'，闽南地区称'阿嬷'",
  },
  {
    relation: "外祖父",
    northern: "姥爷",
    southern: "外公 / 姥爷",
    standard: "外祖父",
    notes: "东北、华北多称'姥爷'，南方多称'外公'",
  },
  {
    relation: "外祖母",
    northern: "姥姥",
    southern: "外婆 / 姥姥",
    standard: "外祖母",
    notes: "东北、华北多称'姥姥'，南方多称'外婆'",
  },
  {
    relation: "丈夫",
    northern: "老公",
    southern: "先生 / 老公",
    standard: "丈夫",
    notes: "普遍称'老公'，部分南方地区也用'先生'",
  },
  {
    relation: "妻子",
    northern: "老婆",
    southern: "太太 / 老婆",
    standard: "妻子",
    notes: "普遍称'老婆'，港澳地区常用'太太'",
  },
  {
    relation: "伯父的妻子",
    northern: "大娘 / 大妈",
    southern: "伯母 / 阿姆",
    standard: "伯母",
    notes: "北方多用'大娘'，南方多用'伯母'",
  },
  {
    relation: "叔父的妻子",
    northern: "婶婶",
    southern: "阿婶 / 婶婶",
    standard: "婶母",
    notes: "北方多用'婶婶'，粤语区称'阿婶'",
  },
  {
    relation: "舅父的妻子",
    northern: "舅妈",
    southern: "舅母 / 妗子",
    standard: "舅母",
    notes: "北方多用'舅妈'，潮汕地区称'妗子'",
  },
  {
    relation: "姨母的丈夫",
    northern: "姨父",
    southern: "姨丈 / 姨父",
    standard: "姨丈",
    notes: "北方多用'姨父'，南方多用'姨丈'",
  },
  {
    relation: "姑母的丈夫",
    northern: "姑父",
    southern: "姑丈 / 姑父",
    standard: "姑丈",
    notes: "北方多用'姑父'，南方多用'姑丈'",
  },
]

const DIALECT_REGIONS = [
  {
    region: "粤语区（广东、香港）",
    features: [
      "祖父称'阿爷'或'爷爷'",
      "祖母称'阿嫲'或'嫲嫲'",
      "父亲称'老豆'",
      "母亲称'老母'或'妈咪'",
      "伯父称'大伯'",
      "叔父称'阿叔'或'叔叔'",
      "舅父称'舅父'",
      "姑姑称'姑妈'",
      "丈夫的父亲称'老爷'",
      "丈夫的母亲称'奶奶'",
    ]
  },
  {
    region: "闽南语区（福建、台湾）",
    features: [
      "祖父称'阿公'",
      "祖母称'阿嫲'",
      "父亲称'老父'或'阿爸'",
      "母亲称'老母'或'阿母'",
      "哥哥称'阿兄'",
      "弟弟称'小弟'",
      "姐姐称'阿姊'",
      "妹妹称'小妹'",
    ]
  },
  {
    region: "吴语区（上海、江浙）",
    features: [
      "祖父称'阿爷'",
      "祖母称'阿娘'或'好婆'",
      "父亲称'阿爸'或'爹爹'",
      "母亲称'姆妈'或'娘'",
      "伯父称'大伯伯'",
      "舅舅称'娘舅'",
      "姑姑称'孃孃'",
      "外婆称'唔奶'",
    ]
  },
  {
    region: "西南官话区（四川、重庆）",
    features: [
      "父亲称'老汉儿'",
      "母亲称'老妈子'或'娘'",
      "祖父称'爷爷'",
      "祖母称'婆婆'",
      "伯父称'大爸'或'大爷'",
      "姑姑称'嬢嬢'",
      "丈夫称'男人家'",
      "妻子称'婆娘'",
    ]
  },
  {
    region: "东北官话区",
    features: [
      "父亲称'爹'或'老爸'",
      "母亲称'妈'或'老妈'",
      "祖父称'老爷子'",
      "祖母称'老太太'",
      "伯父称'大爷'",
      "伯母称'大娘'",
      "最小的叔叔称'老叔'",
      "外祖父称'姥爷'",
      "外祖母称'姥姥'",
    ]
  },
  {
    region: "湘语区（湖南）",
    features: [
      "父亲称'爷老子'或'爹爹'",
      "母亲称'娘老子'或'姆妈'",
      "祖父称'爹爹'",
      "祖母称'娭毑'",
      "伯父称'大伯伯'",
      "姑姑称'姑妈'",
    ]
  },
]

export default function RegionalDiff() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  const { data: searchResults } = trpc.kinship.search.useQuery(
    { query: searchTerm, limit: 10 },
    { enabled: searchTerm.length > 0 }
  )

  const filteredComparisons = searchTerm
    ? REGION_COMPARISONS.filter(c => 
        c.relation.includes(searchTerm) || 
        c.northern.includes(searchTerm) || 
        c.southern.includes(searchTerm)
      )
    : REGION_COMPARISONS

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold heading-serif">
              南北地域称呼差异
            </h1>
          </div>
          <p className="text-muted-foreground">
            对比北方、南方及普通话标准叫法，深入了解不同地域的称谓文化
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="搜索亲属关系..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {/* Comparison Table */}
        <Card className="mb-8 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
              南北称呼对照表
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">关系</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-600" />
                        北方叫法
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        南方叫法
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">标准称谓</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold hidden sm:table-cell">说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredComparisons.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium">{item.relation}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant="secondary" className="bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                          {item.northern}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                          {item.southern}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-primary">{item.standard}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Dialect Regions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold heading-serif mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            方言区特色称谓
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DIALECT_REGIONS.map((region, index) => (
              <Card
                key={index}
                className={`card-hover cursor-pointer ${selectedRegion === region.region ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedRegion(selectedRegion === region.region ? null : region.region)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{region.region}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {region.features.slice(0, selectedRegion === region.region ? undefined : 4).map((feature, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {selectedRegion !== region.region && region.features.length > 4 && (
                      <li className="text-sm text-primary text-center pt-1">
                        +{region.features.length - 4} 更多...
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {searchResults && searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold heading-serif mb-4">数据库相关结果</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map(result => (
                <Card key={result.id} className="card-hover">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{result.formalTitle}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">关系路径：</span>
                      <span>{result.relationPath}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded bg-sky-50 dark:bg-sky-900/20 text-center">
                        <p className="text-xs text-sky-600 dark:text-sky-300">北方</p>
                        <p className="text-sm font-medium">{result.northernTitle}</p>
                      </div>
                      <div className="p-2 rounded bg-amber-50 dark:bg-amber-900/20 text-center">
                        <p className="text-xs text-amber-600 dark:text-amber-300">南方</p>
                        <p className="text-sm font-medium">{result.southernTitle}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
