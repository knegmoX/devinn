'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  CheckCircle, 
  Calendar,
  Clock,
  Users,
  Star,
  Loader2,
  Sparkles,
  Route,
  Camera,
  Utensils,
  Plane,
  Hotel,
  Navigation
} from 'lucide-react';

interface TravelPlanDemoProps {
  onComplete: () => void;
}

interface DayPlan {
  day: number;
  date: string;
  theme: string;
  activities: Activity[];
  transportation: string;
  estimatedCost: string;
}

interface Activity {
  id: string;
  name: string;
  type: 'attraction' | 'restaurant' | 'hotel' | 'transport';
  time: string;
  duration: string;
  location: string;
  description: string;
  cost: string;
  rating: number;
  tips: string[];
}

export default function TravelPlanDemo({ onComplete }: TravelPlanDemoProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<DayPlan[]>([]);

  const demoTravelPlan: DayPlan[] = [
    {
      day: 1,
      date: '10月5日',
      theme: '抵达冲绳，初探那霸',
      activities: [
        {
          id: '1-1',
          name: '那霸机场抵达',
          type: 'transport',
          time: '12:30',
          duration: '1小时',
          location: '那霸机场',
          description: '从上海浦东机场抵达那霸机场，办理入境手续',
          cost: '¥1,850',
          rating: 4.5,
          tips: ['提前办理网上值机', '准备好护照和签证', '可在机场兑换日元']
        },
        {
          id: '1-2',
          name: '酒店入住',
          type: 'hotel',
          time: '14:00',
          duration: '30分钟',
          location: '那霸美居酒店',
          description: '位置便利的四星级酒店，距离国际通步行5分钟',
          cost: '¥850/晚',
          rating: 4.6,
          tips: ['可以寄存行李', '前台有中文服务', '提供免费WiFi']
        },
        {
          id: '1-3',
          name: '国际通漫步',
          type: 'attraction',
          time: '15:30',
          duration: '2小时',
          location: '国际通商业街',
          description: '冲绳最繁华的商业街，体验当地文化和购物',
          cost: '¥200',
          rating: 4.3,
          tips: ['可以买到特色纪念品', '有很多当地小吃', '晚上更加热闹']
        },
        {
          id: '1-4',
          name: '暖暮拉面',
          type: 'restaurant',
          time: '18:00',
          duration: '1小时',
          location: '国际通暖暮拉面店',
          description: '冲绳知名拉面店，品尝正宗冲绳拉面',
          cost: '¥150/人',
          rating: 4.7,
          tips: ['可能需要排队', '推荐冲绳面条', '有中文菜单']
        }
      ],
      transportation: '机场巴士 + 步行',
      estimatedCost: '¥3,050'
    },
    {
      day: 2,
      date: '10月6日',
      theme: '海洋探索之旅',
      activities: [
        {
          id: '2-1',
          name: '美丽海水族馆',
          type: 'attraction',
          time: '09:00',
          duration: '4小时',
          location: '海洋博公园',
          description: '世界级水族馆，观看鲸鲨和海豚表演',
          cost: '¥180/人',
          rating: 4.8,
          tips: ['建议提前购票', '可以看到鲸鲨', '有海豚表演时间表']
        },
        {
          id: '2-2',
          name: '海洋博公园',
          type: 'attraction',
          time: '13:30',
          duration: '2小时',
          location: '海洋博公园',
          description: '在公园内漫步，享受海景和自然风光',
          cost: '免费',
          rating: 4.5,
          tips: ['可以野餐', '有免费停车场', '适合拍照']
        },
        {
          id: '2-3',
          name: '翡翠海滩',
          type: 'attraction',
          time: '16:00',
          duration: '2小时',
          location: '翡翠海滩',
          description: '在美丽的海滩上放松，享受亲子时光',
          cost: '免费',
          rating: 4.6,
          tips: ['带好防晒用品', '可以游泳', '有淋浴设施']
        }
      ],
      transportation: '租车自驾',
      estimatedCost: '¥800'
    },
    {
      day: 3,
      date: '10月7日',
      theme: '文化体验日',
      activities: [
        {
          id: '3-1',
          name: '首里城',
          type: 'attraction',
          time: '09:30',
          duration: '2.5小时',
          location: '首里城公园',
          description: '琉球王国的历史遗迹，了解冲绳文化',
          cost: '¥25/人',
          rating: 4.4,
          tips: ['有中文导览', '可以穿琉球服装拍照', '注意开放时间']
        },
        {
          id: '3-2',
          name: '琉球村',
          type: 'attraction',
          time: '14:00',
          duration: '3小时',
          location: '琉球村',
          description: '体验传统琉球文化，观看民俗表演',
          cost: '¥120/人',
          rating: 4.5,
          tips: ['有传统表演', '可以体验手工艺', '适合亲子活动']
        },
        {
          id: '3-3',
          name: '冲绳料理体验',
          type: 'restaurant',
          time: '18:30',
          duration: '1.5小时',
          location: '传统料理店',
          description: '品尝正宗冲绳料理，如海葡萄、苦瓜炒蛋等',
          cost: '¥300/人',
          rating: 4.6,
          tips: ['可以尝试泡盛酒', '有素食选项', '建议预约']
        }
      ],
      transportation: '租车自驾',
      estimatedCost: '¥1,200'
    }
  ];

  const generationPhases = [
    '分析用户偏好和需求...',
    '整合提取的内容信息...',
    '生成个性化行程安排...',
    '优化路线和时间安排...',
    '添加实用建议和贴士...',
    '完成旅行计划生成...'
  ];

  const startGeneration = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setCurrentPhase(generationPhases[0]);

    // Simulate AI generation process
    generationPhases.forEach((phase, index) => {
      setTimeout(() => {
        setCurrentPhase(phase);
        
        // Update progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 20;
          setGenerationProgress((index * 100 + progress) / generationPhases.length);
          
          if (progress >= 100) {
            clearInterval(progressInterval);
            
            if (index === generationPhases.length - 1) {
              setTimeout(() => {
                setGeneratedPlan(demoTravelPlan);
                setIsCompleted(true);
                setIsGenerating(false);
              }, 500);
            }
          }
        }, 200);
      }, index * 1500);
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

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'attraction': return <Camera className="w-4 h-4" />;
      case 'restaurant': return <Utensils className="w-4 h-4" />;
      case 'hotel': return <Hotel className="w-4 h-4" />;
      case 'transport': return <Plane className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'attraction': return 'text-blue-600 bg-blue-100';
      case 'restaurant': return 'text-orange-600 bg-orange-100';
      case 'hotel': return 'text-purple-600 bg-purple-100';
      case 'transport': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Introduction */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-indigo-800">
            <Route className="w-5 h-5" />
            <span>AI旅行计划生成演示</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-indigo-700 mb-4">
            这个演示展示了AI如何基于提取的内容和用户需求，生成个性化的结构化旅行计划，包括详细的行程安排、时间规划和实用建议。
          </p>
          <Button 
            onClick={startGeneration} 
            disabled={isGenerating || isCompleted}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                AI生成中...
              </>
            ) : isCompleted ? (
              '生成完成'
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                开始生成旅行计划
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generation Progress */}
      {isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle>AI生成进度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                <span className="text-sm font-medium">{currentPhase}</span>
              </div>
              <Progress value={generationProgress} className="h-3" />
              <p className="text-sm text-gray-600">
                {Math.round(generationProgress)}% 完成
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Travel Plan */}
      {generatedPlan.length > 0 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Navigation className="w-5 h-5 text-indigo-600" />
                <span>生成的旅行计划</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold">总天数</div>
                  <div className="text-2xl font-bold text-blue-600">{generatedPlan.length}天</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold">总景点</div>
                  <div className="text-2xl font-bold text-green-600">
                    {generatedPlan.reduce((total, day) => 
                      total + day.activities.filter(a => a.type === 'attraction').length, 0
                    )}个
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Utensils className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="font-semibold">预估费用</div>
                  <div className="text-2xl font-bold text-orange-600">
                    ¥{generatedPlan.reduce((total, day) => 
                      total + parseInt(day.estimatedCost.replace(/[¥,]/g, '')), 0
                    ).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Plans */}
          {generatedPlan.map((day, dayIndex) => (
            <Card key={day.day}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                      {day.day}
                    </div>
                    <div>
                      <div className="font-semibold">第{day.day}天 - {day.date}</div>
                      <div className="text-sm text-gray-600">{day.theme}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {day.estimatedCost}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {day.activities.map((activity, actIndex) => (
                    <div key={activity.id} className="flex space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center">
                        <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="text-xs font-medium mt-1">{activity.time}</div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{activity.name}</h4>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm ml-1">{activity.rating}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">{activity.cost}</Badge>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {activity.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {activity.duration}
                          </div>
                        </div>
                        
                        {activity.tips.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs font-medium text-gray-700 mb-1">💡 实用贴士：</div>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {activity.tips.map((tip, tipIndex) => (
                                <li key={tipIndex}>• {tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-sm text-gray-600">
                      <Navigation className="w-4 h-4 mr-2" />
                      <span className="font-medium">交通方式：</span>
                      <span className="ml-1">{day.transportation}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Complete Button */}
      {isCompleted && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleComplete}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            完成旅行计划
          </Button>
        </div>
      )}
    </div>
  );
}
