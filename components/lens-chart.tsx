'use client';

import { useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import { ComposedChart, Bar, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Legend, Tooltip } from 'recharts';
import { Lens, LensCategory } from '@/types/lens';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';

interface LensChartProps {
  lenses: Lens[];
}

const CATEGORY_COLORS: Record<LensCategory, string> = {
  '単焦点': '#3b82f6',
  'ズーム': '#10b981', 
  'マクロ': '#f59e0b'
};

interface ChartData {
  name: string;
  category: LensCategory;
  minFocal: number | null;
  maxFocal: number | null;
  focalLength: number | null;
  rangeWidth: number;
  manufacturer: string;
  aperture: string;
  index: number;
}

export function LensChart({ lenses }: LensChartProps) {
  const [selectedLenses, setSelectedLenses] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const { theme } = useTheme();
  const chartRef = useRef<HTMLDivElement>(null);
  
  const handleLensSelection = (lensId: string) => {
    setSelectedLenses(prev => 
      prev.includes(lensId) 
        ? prev.filter(id => id !== lensId)
        : [...prev, lensId]
    );
  };

  const filteredLenses = selectedLenses.length > 0 
    ? lenses.filter(lens => selectedLenses.includes(lens.id))
    : lenses;

  const validLenses = filteredLenses.filter(lens => 
    lens && 
    typeof lens.focalLengthMin === 'number' && 
    typeof lens.focalLengthMax === 'number' && 
    !isNaN(lens.focalLengthMin) && 
    !isNaN(lens.focalLengthMax) &&
    lens.focalLengthMin > 0 &&
    lens.focalLengthMax > 0
  );

  // レンズ種別、最低焦点距離の順でソート
  const sortedLenses = validLenses.sort((a, b) => {
    // まずカテゴリでソート
    if (a.category !== b.category) {
      const categoryOrder = { '単焦点': 1, 'ズーム': 2, 'マクロ': 3 };
      return categoryOrder[a.category] - categoryOrder[b.category];
    }
    // 同じカテゴリ内では最低焦点距離でソート
    return a.focalLengthMin - b.focalLengthMin;
  });

  const zoomLenses = sortedLenses.filter(lens => lens.focalLengthMin !== lens.focalLengthMax);
  const primeLenses = sortedLenses.filter(lens => lens.focalLengthMin === lens.focalLengthMax);

  const chartData: ChartData[] = sortedLenses.map((lens, index) => ({
    name: lens.name || 'Unknown',
    category: lens.category,
    minFocal: lens.focalLengthMin !== lens.focalLengthMax ? Math.round(lens.focalLengthMin) : null,
    maxFocal: lens.focalLengthMin !== lens.focalLengthMax ? Math.round(lens.focalLengthMax) : null,
    focalLength: lens.focalLengthMin === lens.focalLengthMax ? Math.round(lens.focalLengthMin) : null,
    rangeWidth: lens.focalLengthMin !== lens.focalLengthMax ? Math.round(lens.focalLengthMax - lens.focalLengthMin) : 0,
    manufacturer: lens.manufacturer || 'Unknown',
    aperture: lens.aperture || 'Unknown',
    index: index
  }));

  const captureChart = async () => {
    if (!chartRef.current) return;
    
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `lens-chart-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('スクリーンショット撮影に失敗しました:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const shareToTwitter = async () => {
    if (!chartRef.current) return;
    
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const file = new File([blob], 'lens-chart.png', { type: 'image/png' });
        
        // Web Share API対応の場合（主にモバイル）
        if (navigator.share && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'レンズ比較チャート',
              text: '#LensChart',
              files: [file]
            });
            return;
          } catch (error) {
            console.error('Web Share APIでのシェアに失敗:', error);
          }
        }
        
        // クリップボードAPIを試す（モダンブラウザ）
        if (navigator.clipboard && 'write' in navigator.clipboard) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob
              })
            ]);
            
            // クリップボードに画像をコピー後、Twitterを開く
            const tweetText = encodeURIComponent('#LensChart');
            const twitterURL = `https://twitter.com/intent/tweet?text=${tweetText}`;
            window.open(twitterURL, '_blank');
            
            // 成功メッセージ表示
            alert('画像をクリップボードにコピーしました！\nTwitterの投稿画面で Ctrl+V (Mac: Cmd+V) で貼り付けてください。');
            return;
          } catch (error) {
            console.error('クリップボードへのコピーに失敗:', error);
          }
        }
        
        // フォールバック: 画像ダウンロード + Twitter投稿画面を開く
        const downloadLink = document.createElement('a');
        downloadLink.download = 'lens-chart.png';
        downloadLink.href = canvas.toDataURL();
        downloadLink.click();
        
        const tweetText = encodeURIComponent('#LensChart');
        const twitterURL = `https://twitter.com/intent/tweet?text=${tweetText}`;
        
        // 少し遅延を入れてからTwitterを開く
        setTimeout(() => {
          window.open(twitterURL, '_blank');
          alert('画像をダウンロードしました！\nTwitterの投稿画面で画像を添付してください。');
        }, 1000);
        
      });
    } catch (error) {
      console.error('スクリーンショット撮影に失敗しました:', error);
      alert('スクリーンショットの撮影に失敗しました。');
    } finally {
      setIsCapturing(false);
    }
  };

  const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{ payload: ChartData }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="font-semibold text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">{data.manufacturer}</p>
          <p className="text-sm text-foreground">カテゴリ: {data.category}</p>
          <p className="text-sm text-foreground">
            焦点距離: {data.focalLength 
              ? `${data.focalLength}mm` 
              : data.minFocal && data.maxFocal
              ? `${data.minFocal}-${data.maxFocal}mm`
              : 'Unknown'}
          </p>
          <p className="text-sm text-foreground">絞り: {data.aperture}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">レンズ焦点距離比較チャート</h2>
          <div className="flex gap-2">
            <Button
              onClick={captureChart}
              disabled={isCapturing}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {isCapturing ? '保存中...' : 'PNG保存'}
            </Button>
            <Button
              onClick={shareToTwitter}
              disabled={isCapturing}
              variant="outline"
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              {isCapturing ? '準備中...' : 'X (Twitter) でシェア'}
            </Button>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">表示するレンズを選択:</h3>
          <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <Checkbox 
                id="select-all"
                checked={selectedLenses.length === 0}
                onCheckedChange={() => setSelectedLenses([])}
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                全てのレンズを表示
              </label>
            </div>
            {lenses.map((lens) => (
              <div key={lens.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={lens.id}
                  checked={selectedLenses.includes(lens.id)}
                  onCheckedChange={() => handleLensSelection(lens.id)}
                />
                <label htmlFor={lens.id} className="text-sm cursor-pointer flex-1">
                  <span className="font-medium">{lens.name}</span>
                  <span className="text-muted-foreground ml-1">({lens.manufacturer})</span>
                  <span className="text-xs text-muted-foreground ml-2">{lens.category}</span>
                </label>
              </div>
            ))}
          </div>
          {selectedLenses.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {selectedLenses.length}個のレンズを表示中
            </p>
          )}
        </div>
        <div ref={chartRef} className="h-96 w-full">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              表示するレンズがありません
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                width={800}
                height={400}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 10, fill: theme === 'dark' ? '#f3f4f6' : '#374151' }}
                  interval={0}
                />
                <YAxis 
                  tickFormatter={(value) => `${value}mm`}
                  domain={[0, 'dataMax + 50']}
                  tick={{ fill: theme === 'dark' ? '#f3f4f6' : '#374151' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {zoomLenses.length > 0 && (
                  <Bar 
                    dataKey="minFocal" 
                    stackId="zoom-range"
                    fill="transparent"
                    legendType="none"
                  />
                )}
                {zoomLenses.length > 0 && (
                  <Bar 
                    dataKey="rangeWidth" 
                    stackId="zoom-range"
                    legendType="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`range-${index}`} 
                        fill={entry.minFocal !== null ? CATEGORY_COLORS[entry.category] : 'transparent'} 
                        stroke={entry.minFocal !== null ? CATEGORY_COLORS[entry.category] : 'transparent'}
                        strokeWidth={1}
                      />
                    ))}
                  </Bar>
                )}
                {primeLenses.length > 0 && (
                  <Scatter 
                    dataKey="focalLength" 
                    fill="#8884d8"
                    legendType="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`prime-${index}`} 
                        fill={entry.focalLength ? CATEGORY_COLORS[entry.category] : 'transparent'} 
                      />
                    ))}
                  </Scatter>
                )}
              </ComposedChart>
          </ResponsiveContainer>
          )}
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">カテゴリ凡例</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
              <div key={category} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-sm">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}