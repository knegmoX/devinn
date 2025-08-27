'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  CheckCircle, 
  Clock,
  ExternalLink,
  Image,
  Video,
  FileText,
  MapPin,
  Star,
  Users,
  Loader2
} from 'lucide-react';

interface ContentExtractionDemoProps {
  onComplete: () => void;
}

interface ExtractionProgress {
  platform: string;
  status: 'pending' | 'extracting' | 'completed' | 'error';
  progress: number;
  icon: React.ComponentType<any>;
  color: string;
}

interface ExtractedContent {
  platform: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  mediaType: 'image' | 'video' | 'text';
  extractedInfo: {
    locations: string[];
    activities: string[];
    tips: string[];
  };
}

export default function ContentExtractionDemo({ onComplete }: ContentExtractionDemoProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const [extractionProgress, setExtractionProgress] = useState<ExtractionProgress[]>([
    { platform: '小红书', status: 'pending', progress: 0, icon: Image, color: 'text-pink-600' },
    { platform: 'B站', status: 'pending', progress: 0, icon: Video, color: 'text-blue-600' },
    { platform: '抖音', status: 'pending', progress: 0, icon: Video, color: 'text-purple-600' },
  ]);

  const [extractedContent, setExtractedContent] = useState<ExtractedContent[]>([]);

  const demoContent: ExtractedContent[] = [
    {
      platform: '小红书',
      title: '冲绳美食攻略 | 必吃的10家当地餐厅',
      description: '详细介绍了冲绳当地特色美食，包括海葡萄、冲绳面条、黑糖等特色料理...',
      author: '旅行美食家小王',
      tags: ['美食', '冲绳', '日本料理', '当地特色'],
      mediaType: 'image',
      extractedInfo: {
        locations: ['那霸国际通', '首里城', '美国村', '万座毛'],
        activities: ['品尝海葡萄', '冲绳面条制作体验', '参观泡盛酒厂'],
        tips: ['建议提前预约热门餐厅', '尝试当地特色黑糖制品', '注意营业时间']
      }
    },
    {
      platform: 'B站',
      title: '冲绳亲子游VLOG | 5天4夜完整攻略',
      description: '记录了一家三口在冲绳的完整旅行过程，包含详细的行程安排和实用建议...',
      author: '亲子旅行达人',
      tags: ['亲子游', '冲绳', 'VLOG', '家庭旅行'],
      mediaType: 'video',
      extractedInfo: {
        locations: ['美丽海水族馆', '冲绳世界', '残波岬', '琉球村'],
        activities: ['观看海豚表演', '体验琉球文化', '海滩游玩', '购买纪念品'],
        tips: ['带好防晒用品', '提前购买水族馆门票', '准备适合小朋友的零食']
      }
    },
    {
      platform: '抖音',
      title: '冲绳海洋博公园超详细攻略',
      description: '15秒快速了解海洋博公园的必看景点和游玩路线...',
      author: '旅行小贴士',
      tags: ['海洋博公园', '水族馆', '冲绳', '攻略'],
      mediaType: 'video',
      extractedInfo: {
        locations: ['美丽海水族馆', '海豚剧场', '翡翠海滩'],
        activities: ['观看鲸鲨', '海豚表演', '海滩漫步'],
        tips: ['建议游玩时间4-6小时', '可以带食物进入', '有免费停车场']
      }
    }
  ];

  const startExtraction = () => {
    setIsExtracting(true);
    
    // Simulate extraction process
    const extractionSteps = [
      { delay: 500, stepIndex: 0 },
      { delay: 1500, stepIndex: 1 },
      { delay: 2500, stepIndex: 2 },
    ];

    extractionSteps.forEach(({ delay, stepIndex }) => {
      setTimeout(() => {
        setExtractionProgress(prev => 
          prev.map((item, index) => 
            index === stepIndex 
              ? { ...item, status: 'extracting' as const }
              : item
          )
        );
        
        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 20;
          setExtractionProgress(prev => 
            prev.map((item, index) => 
              index === stepIndex 
                ? { ...item, progress }
                : item
            )
          );
          
          if (progress >= 100) {
            clearInterval(progressInterval);
            setExtractionProgress(prev => 
              prev.map((item, index) => 
                index === stepIndex 
                  ? { ...item, status: 'completed' as const, progress: 100 }
                  : item
              )
            );
            
            // Add extracted content
            setExtractedContent(prev => [...prev, demoContent[stepIndex]]);
            
            if (stepIndex === extractionSteps.length - 1) {
              setTimeout(() => {
                setIsCompleted(true);
                setIsExtracting(false);
              }, 500);
            }
          }
        }, 200);
      }, delay);
    });
  };

  const handleComplete = () => {
    if (!isCompleted) {
      setIsCompleted(true);
    }
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Demo Introduction */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <Search className="w-5 h-5" />
            <span>内容提取演示</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700 mb-4">
            这个演示展示了AI如何从不同平台提取旅行相关内容，包括小红书图文、B站视频和抖音短视频的智能解析。
          </p>
          <Button 
            onClick={startExtraction} 
            disabled={isExtracting || isCompleted}
            className="bg-green-600 hover:bg-green-700"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                正在提取...
              </>
            ) : isCompleted ? (
              '提取完成'
            ) : (
              '开始内容提取'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Extraction Progress */}
      <Card>
        <CardHeader>
          <CardTitle>提取进度</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {extractionProgress.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.platform} className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    item.status === 'completed' ? 'bg-green-100' :
                    item.status === 'extracting' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    {item.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : item.status === 'extracting' ? (
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    ) : (
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{item.platform}</span>
                      <span className="text-sm text-gray-500">
                        {item.status === 'completed' ? '完成' :
                         item.status === 'extracting' ? '提取中...' :
                         '等待中'}
                      </span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Extracted Content */}
      {extractedContent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>提取结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {extractedContent.map((content, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">{content.platform}</Badge>
                        <Badge variant="outline">
                          {content.mediaType === 'image' ? '图文' : 
                           content.mediaType === 'video' ? '视频' : '文本'}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-lg mb-1">{content.title}</h4>
                      <p className="text-gray-600 text-sm mb-2">{content.description}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{content.author}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {content.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t">
                    <div>
                      <h5 className="font-medium text-sm mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-blue-600" />
                        提取地点
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {content.extractedInfo.locations.map((location, locIndex) => (
                          <li key={locIndex}>• {location}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm mb-2 flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-600" />
                        推荐活动
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {content.extractedInfo.activities.map((activity, actIndex) => (
                          <li key={actIndex}>• {activity}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm mb-2 flex items-center">
                        <FileText className="w-4 h-4 mr-1 text-green-600" />
                        实用建议
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {content.extractedInfo.tips.map((tip, tipIndex) => (
                          <li key={tipIndex}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Button */}
      {isCompleted && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleComplete}
            className="px-8 py-3 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            完成内容提取
          </Button>
        </div>
      )}
    </div>
  );
}
