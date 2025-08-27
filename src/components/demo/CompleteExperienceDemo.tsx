'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  MapPin, 
  Calendar, 
  Users, 
  Plane, 
  Hotel, 
  Camera,
  Heart,
  Share2,
  Download,
  Star,
  Clock,
  DollarSign,
  MessageCircle
} from 'lucide-react';

interface CompleteExperienceDemoProps {
  onComplete: () => void;
}

const DEMO_SUMMARY = {
  title: '冲绳五日家庭游',
  duration: '5天4晚',
  dates: '2024年10月5日 - 10月10日',
  travelers: '2大1小',
  totalBudget: 12800,
  highlights: [
    '美丽海水族馆观赏鲸鲨',
    '首里城历史文化体验', 
    '国际通购物美食',
    '万座毛绝美海景',
    '传统冲绳料理品尝'
  ]
};

const BOOKING_SUMMARY = {
  flight: {
    outbound: '东方航空 MU287 - 上海浦东 09:15 → 冲绳那霸 12:30',
    return: '东方航空 MU288 - 冲绳那霸 13:30 → 上海浦东 16:45',
    price: 3700
  },
  hotel: {
    name: '那霸美居酒店',
    nights: 4,
    pricePerNight: 850,
    totalPrice: 3400
  }
};

const ITINERARY_PREVIEW = [
  {
    day: 1,
    title: '抵达那霸',
    activities: ['机场接机', '酒店入住', '国际通晚餐'],
    highlight: '暖暮拉面'
  },
  {
    day: 2,
    title: '北部探索',
    activities: ['美丽海水族馆', '万座毛', '古宇利岛'],
    highlight: '鲸鲨观赏'
  },
  {
    day: 3,
    title: '文化体验',
    activities: ['首里城', '识名园', '传统工艺体验'],
    highlight: '琉球文化'
  },
  {
    day: 4,
    title: '海滩休闲',
    activities: ['残波岬', '美国村', '日落海滩'],
    highlight: '冲绳日落'
  },
  {
    day: 5,
    title: '购物返程',
    activities: ['DFS免税店', '机场送机', '返回上海'],
    highlight: '特产采购'
  }
];

export default function CompleteExperienceDemo({ onComplete }: CompleteExperienceDemoProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentView, setCurrentView] = useState<'overview' | 'itinerary' | 'bookings'>('overview');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleComplete = () => {
    onComplete();
  };

  const handleShare = () => {
    // Simulate sharing functionality
    alert('旅行计划已复制到剪贴板！');
  };

  const handleDownload = () => {
    // Simulate download functionality
    alert('旅行计划PDF已开始下载！');
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className={`text-center space-y-4 transition-all duration-1000 ${
        showAnimation ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
      }`}>
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <h3 className="text-3xl font-bold text-gray-900">🎉 旅行计划生成完成！</h3>
        <p className="text-xl text-gray-600">
          您的专属冲绳旅行计划已准备就绪
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center space-x-4">
        <Button
          variant={currentView === 'overview' ? 'default' : 'outline'}
          onClick={() => setCurrentView('overview')}
          className="flex items-center space-x-2"
        >
          <MapPin className="w-4 h-4" />
          <span>行程概览</span>
        </Button>
        <Button
          variant={currentView === 'itinerary' ? 'default' : 'outline'}
          onClick={() => setCurrentView('itinerary')}
          className="flex items-center space-x-2"
        >
          <Calendar className="w-4 h-4" />
          <span>详细行程</span>
        </Button>
        <Button
          variant={currentView === 'bookings' ? 'default' : 'outline'}
          onClick={() => setCurrentView('bookings')}
          className="flex items-center space-x-2"
        >
          <Plane className="w-4 h-4" />
          <span>预订信息</span>
        </Button>
      </div>

      {/* Overview Tab */}
      {currentView === 'overview' && (
        <div className="space-y-6">
          {/* Trip Summary Card */}
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <MapPin className="w-6 h-6" />
                <span>{DEMO_SUMMARY.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">出行时间</div>
                  <div className="font-semibold">{DEMO_SUMMARY.duration}</div>
                </div>
                <div className="text-center">
                  <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">出行人数</div>
                  <div className="font-semibold">{DEMO_SUMMARY.travelers}</div>
                </div>
                <div className="text-center">
                  <DollarSign className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">预算总计</div>
                  <div className="font-semibold">¥{DEMO_SUMMARY.totalBudget.toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <Star className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">精选景点</div>
                  <div className="font-semibold">12个</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">行程亮点</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {DEMO_SUMMARY.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Camera className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">15+</div>
                <div className="text-sm text-gray-600">必拍景点</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">8家</div>
                <div className="text-sm text-gray-600">特色餐厅</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">5天</div>
                <div className="text-sm text-gray-600">完美行程</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Itinerary Tab */}
      {currentView === 'itinerary' && (
        <div className="space-y-4">
          <h4 className="text-xl font-bold text-gray-900 text-center">详细行程安排</h4>
          {ITINERARY_PREVIEW.map((day, index) => (
            <Card key={day.day} className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h5 className="text-lg font-semibold text-gray-900">
                      第{day.day}天: {day.title}
                    </h5>
                    <Badge className="bg-blue-100 text-blue-700 mt-1">
                      {day.highlight}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Day {day.day}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {day.activities.map((activity, actIndex) => (
                    <div key={actIndex} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700">{activity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bookings Tab */}
      {currentView === 'bookings' && (
        <div className="space-y-6">
          <h4 className="text-xl font-bold text-gray-900 text-center">预订信息总览</h4>
          
          {/* Flight Booking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plane className="w-5 h-5 text-blue-600" />
                <span>航班预订</span>
                <Badge className="bg-green-100 text-green-700">已选择</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="font-medium text-gray-900">去程航班</div>
                  <div className="text-sm text-gray-600">{BOOKING_SUMMARY.flight.outbound}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">返程航班</div>
                  <div className="text-sm text-gray-600">{BOOKING_SUMMARY.flight.return}</div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">航班总价</span>
                  <span className="text-xl font-bold text-blue-600">
                    ¥{BOOKING_SUMMARY.flight.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hotel Booking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Hotel className="w-5 h-5 text-blue-600" />
                <span>酒店预订</span>
                <Badge className="bg-green-100 text-green-700">已选择</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="font-medium text-gray-900">{BOOKING_SUMMARY.hotel.name}</div>
                  <div className="text-sm text-gray-600">
                    {BOOKING_SUMMARY.hotel.nights}晚 × ¥{BOOKING_SUMMARY.hotel.pricePerNight}/晚
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">酒店总价</span>
                  <span className="text-xl font-bold text-blue-600">
                    ¥{BOOKING_SUMMARY.hotel.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Summary */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-semibold text-green-800">预订总计</div>
                  <div className="text-sm text-green-600">航班 + 酒店</div>
                </div>
                <div className="text-3xl font-bold text-green-700">
                  ¥{(BOOKING_SUMMARY.flight.price + BOOKING_SUMMARY.hotel.totalPrice).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button 
          onClick={handleShare}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Share2 className="w-4 h-4" />
          <span>分享行程</span>
        </Button>
        
        <Button 
          onClick={handleDownload}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>下载PDF</span>
        </Button>
        
        <Button 
          onClick={handleComplete}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          完成演示体验
        </Button>
      </div>

      {/* Feedback Section */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-6 text-center">
          <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h4 className="font-semibold text-purple-800 mb-2">体验反馈</h4>
          <p className="text-sm text-purple-600 mb-4">
            感谢您体验AI笔记DevInn！您的反馈对我们非常重要。
          </p>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className="w-6 h-6 text-yellow-400 fill-current cursor-pointer hover:scale-110 transition-transform" 
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
