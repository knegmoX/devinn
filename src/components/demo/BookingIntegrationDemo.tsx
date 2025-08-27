'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plane, 
  Hotel, 
  Clock, 
  MapPin, 
  Star, 
  Wifi, 
  Car, 
  Coffee,
  CheckCircle,
  ExternalLink,
  Users,
  Calendar
} from 'lucide-react';

interface BookingIntegrationDemoProps {
  onComplete: () => void;
}

interface FlightOption {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    time: string;
    airport: string;
    city: string;
  };
  arrival: {
    time: string;
    airport: string;
    city: string;
  };
  duration: string;
  price: number;
  aircraft: string;
  stops: number;
}

interface HotelOption {
  id: string;
  name: string;
  rating: number;
  price: number;
  location: string;
  distance: string;
  amenities: string[];
  image: string;
  reviews: number;
  highlights: string[];
}

const DEMO_FLIGHTS: FlightOption[] = [
  {
    id: 'flight-1',
    airline: '东方航空',
    flightNumber: 'MU287',
    departure: {
      time: '09:15',
      airport: 'PVG',
      city: '上海浦东'
    },
    arrival: {
      time: '12:30',
      airport: 'OKA',
      city: '冲绳那霸'
    },
    duration: '2小时15分',
    price: 1850,
    aircraft: 'A321',
    stops: 0
  },
  {
    id: 'flight-2',
    airline: '春秋航空',
    flightNumber: '9C8589',
    departure: {
      time: '14:20',
      airport: 'PVG',
      city: '上海浦东'
    },
    arrival: {
      time: '17:45',
      airport: 'OKA',
      city: '冲绳那霸'
    },
    duration: '2小时25分',
    price: 1299,
    aircraft: 'A320',
    stops: 0
  },
  {
    id: 'flight-3',
    airline: '全日空',
    flightNumber: 'NH919',
    departure: {
      time: '11:30',
      airport: 'PVG',
      city: '上海浦东'
    },
    arrival: {
      time: '14:55',
      airport: 'OKA',
      city: '冲绳那霸'
    },
    duration: '2小时25分',
    price: 2180,
    aircraft: 'B737',
    stops: 0
  }
];

const DEMO_HOTELS: HotelOption[] = [
  {
    id: 'hotel-1',
    name: '那霸美居酒店',
    rating: 4.6,
    price: 850,
    location: '那霸市中心',
    distance: '距离国际通 0.2km',
    amenities: ['免费WiFi', '健身房', '餐厅', '24小时前台'],
    image: '/api/placeholder/300/200',
    reviews: 2847,
    highlights: ['位置便利', '服务优质', '房间干净']
  },
  {
    id: 'hotel-2',
    name: '冲绳凯悦酒店',
    rating: 4.8,
    price: 1200,
    location: '那霸市',
    distance: '距离机场 8km',
    amenities: ['免费WiFi', '游泳池', '健身房', '餐厅', '停车场'],
    image: '/api/placeholder/300/200',
    reviews: 1923,
    highlights: ['豪华设施', '海景房', '早餐丰富']
  },
  {
    id: 'hotel-3',
    name: '那霸东急REI酒店',
    rating: 4.4,
    price: 680,
    location: '那霸新都心',
    distance: '距离DFS 0.5km',
    amenities: ['免费WiFi', '餐厅', '洗衣服务'],
    image: '/api/placeholder/300/200',
    reviews: 3156,
    highlights: ['性价比高', '交通便利', '购物方便']
  }
];

const SEARCH_STEPS = [
  { id: 1, name: '搜索航班', description: '查询上海-冲绳航班信息' },
  { id: 2, name: '筛选航班', description: '根据时间和价格筛选' },
  { id: 3, name: '搜索酒店', description: '查询那霸地区酒店' },
  { id: 4, name: '匹配推荐', description: '智能匹配最佳组合' }
];

export default function BookingIntegrationDemo({ onComplete }: BookingIntegrationDemoProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchComplete, setSearchComplete] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);

  useEffect(() => {
    if (isSearching && currentStep < SEARCH_STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setProgress(prev => prev + 25);
        
        if (currentStep === SEARCH_STEPS.length - 1) {
          setSearchComplete(true);
          setIsSearching(false);
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isSearching, currentStep]);

  const startSearch = () => {
    setIsSearching(true);
    setCurrentStep(0);
    setProgress(0);
    setSearchComplete(false);
  };

  const handleFlightSelect = (flightId: string) => {
    setSelectedFlight(flightId);
  };

  const handleHotelSelect = (hotelId: string) => {
    setSelectedHotel(hotelId);
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-gray-900">航班酒店搜索集成</h3>
        <p className="text-gray-600">
          AI将根据您的旅行计划，智能搜索并推荐最适合的航班和酒店选项
        </p>
        
        {!isSearching && !searchComplete && (
          <Button onClick={startSearch} size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Plane className="w-5 h-5 mr-2" />
            开始搜索航班酒店
          </Button>
        )}
      </div>

      {/* Search Progress */}
      {(isSearching || searchComplete) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>搜索进度</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} className="w-full" />
            
            <div className="space-y-2">
              {SEARCH_STEPS.map((step, index) => (
                <div 
                  key={step.id}
                  className={`flex items-center space-x-3 p-2 rounded ${
                    index < currentStep 
                      ? 'bg-green-50 text-green-700' 
                      : index === currentStep && isSearching
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-500'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      index === currentStep && isSearching 
                        ? 'border-blue-600 bg-blue-600' 
                        : 'border-gray-300'
                    }`} />
                  )}
                  <div>
                    <div className="font-medium">{step.name}</div>
                    <div className="text-sm opacity-75">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchComplete && (
        <div className="space-y-6">
          {/* Flight Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plane className="w-5 h-5 text-blue-600" />
                <span>推荐航班</span>
                <Badge variant="secondary">{DEMO_FLIGHTS.length} 个选项</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DEMO_FLIGHTS.map((flight) => (
                  <div 
                    key={flight.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedFlight === flight.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleFlightSelect(flight.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="font-semibold text-lg">{flight.airline}</div>
                          <Badge variant="outline">{flight.flightNumber}</Badge>
                          <Badge variant="outline">{flight.aircraft}</Badge>
                          {flight.stops === 0 && (
                            <Badge className="bg-green-100 text-green-700">直飞</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <div>
                              <div className="font-medium text-gray-900">{flight.departure.time}</div>
                              <div>{flight.departure.city}</div>
                              <div className="text-xs">{flight.departure.airport}</div>
                            </div>
                            <div className="flex-1 text-center">
                              <div className="text-xs text-gray-500">{flight.duration}</div>
                              <div className="border-t border-gray-300 my-1"></div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{flight.arrival.time}</div>
                              <div>{flight.arrival.city}</div>
                              <div className="text-xs">{flight.arrival.airport}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">¥{flight.price}</div>
                        <div className="text-sm text-gray-500">每人</div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open('#', '_blank');
                          }}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          预订
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hotel Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Hotel className="w-5 h-5 text-blue-600" />
                <span>推荐酒店</span>
                <Badge variant="secondary">{DEMO_HOTELS.length} 个选项</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-1">
                {DEMO_HOTELS.map((hotel) => (
                  <div 
                    key={hotel.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedHotel === hotel.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleHotelSelect(hotel.id)}
                  >
                    <div className="flex space-x-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Hotel className="w-8 h-8 text-gray-400" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-lg">{hotel.name}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="ml-1">{hotel.rating}</span>
                              </div>
                              <span>•</span>
                              <span>{hotel.reviews} 条评价</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">¥{hotel.price}</div>
                            <div className="text-sm text-gray-500">每晚</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{hotel.location}</span>
                          <span>•</span>
                          <span>{hotel.distance}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          {hotel.amenities.slice(0, 4).map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-2">
                            {hotel.highlights.map((highlight, index) => (
                              <Badge key={index} className="bg-green-100 text-green-700 text-xs">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open('#', '_blank');
                            }}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            预订
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {(selectedFlight || selectedHotel) && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">选择总结</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedFlight && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Plane className="w-4 h-4 text-green-600" />
                        <span>已选择航班:</span>
                        <span className="font-medium">
                          {DEMO_FLIGHTS.find(f => f.id === selectedFlight)?.airline} 
                          {DEMO_FLIGHTS.find(f => f.id === selectedFlight)?.flightNumber}
                        </span>
                      </div>
                      <span className="font-bold text-green-700">
                        ¥{DEMO_FLIGHTS.find(f => f.id === selectedFlight)?.price}
                      </span>
                    </div>
                  )}
                  
                  {selectedHotel && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Hotel className="w-4 h-4 text-green-600" />
                        <span>已选择酒店:</span>
                        <span className="font-medium">
                          {DEMO_HOTELS.find(h => h.id === selectedHotel)?.name}
                        </span>
                      </div>
                      <span className="font-bold text-green-700">
                        ¥{DEMO_HOTELS.find(h => h.id === selectedHotel)?.price}/晚
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Complete Button */}
          <div className="text-center">
            <Button 
              onClick={handleComplete}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              完成航班酒店搜索
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
