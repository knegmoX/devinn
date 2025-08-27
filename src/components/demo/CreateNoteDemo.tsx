'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Link, 
  Users, 
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle,
  Plus,
  X
} from 'lucide-react';

interface CreateNoteDemoProps {
  onComplete: () => void;
}

export default function CreateNoteDemo({ onComplete }: CreateNoteDemoProps) {
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    duration: '',
    travelers: '',
    budget: '',
    requirements: '',
    links: ['']
  });
  
  const [isCompleted, setIsCompleted] = useState(false);

  const demoData = {
    title: '冲绳五日家庭游',
    destination: '冲绳，日本',
    duration: '5天4夜',
    travelers: '2大人1小孩',
    budget: '15000-20000元',
    requirements: '希望体验当地文化，品尝特色美食，适合亲子的景点和活动。对海洋主题特别感兴趣，想去美丽海水族馆。希望住宿干净舒适，交通便利。',
    links: [
      'https://www.xiaohongshu.com/explore/冲绳美食攻略',
      'https://www.bilibili.com/video/冲绳亲子游vlog',
      'https://www.xiaohongshu.com/explore/冲绳海洋博公园'
    ]
  };

  const handleAutoFill = () => {
    setFormData(demoData);
    setTimeout(() => {
      setIsCompleted(true);
    }, 1000);
  };

  const handleComplete = () => {
    if (!isCompleted) {
      setIsCompleted(true);
    }
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, '']
    }));
  };

  const updateLink = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => i === index ? value : link)
    }));
  };

  const removeLink = (index: number) => {
    if (formData.links.length > 1) {
      setFormData(prev => ({
        ...prev,
        links: prev.links.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Introduction */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <FileText className="w-5 h-5" />
            <span>创建旅行笔记演示</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 mb-4">
            这个演示展示了用户如何创建一个新的旅行笔记，输入基本信息、旅行需求和相关内容链接。
          </p>
          <Button onClick={handleAutoFill} className="bg-blue-600 hover:bg-blue-700">
            自动填充演示数据
          </Button>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>创建新的旅行笔记</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">基本信息</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">旅行标题</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="例如：冲绳五日家庭游"
                />
              </div>
              
              <div>
                <Label htmlFor="destination">目的地</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="destination"
                    value={formData.destination}
                    onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="例如：冲绳，日本"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="duration">旅行时长</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="例如：5天4夜"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="travelers">旅行人数</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="travelers"
                    value={formData.travelers}
                    onChange={(e) => setFormData(prev => ({ ...prev, travelers: e.target.value }))}
                    placeholder="例如：2大人1小孩"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="budget">预算范围</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="例如：15000-20000元"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Travel Requirements */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">旅行需求</h3>
            </div>
            
            <div>
              <Label htmlFor="requirements">详细需求描述</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                placeholder="描述您的旅行偏好、特殊需求、感兴趣的活动等..."
                rows={4}
              />
            </div>
          </div>

          {/* Content Links */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Link className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">内容链接</h3>
            </div>
            
            <div className="space-y-3">
              {formData.links.map((link, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={link}
                    onChange={(e) => updateLink(index, e.target.value)}
                    placeholder="粘贴小红书、B站、抖音或马蜂窝链接..."
                    className="flex-1"
                  />
                  {formData.links.length > 1 && (
                    <Button
                      onClick={() => removeLink(index)}
                      variant="outline"
                      size="icon"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                onClick={addLink}
                variant="outline"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加更多链接
              </Button>
            </div>
          </div>

          {/* Platform Support Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">支持的平台</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">小红书</Badge>
              <Badge variant="outline">B站</Badge>
              <Badge variant="outline">抖音</Badge>
              <Badge variant="outline">马蜂窝</Badge>
            </div>
          </div>

          {/* Complete Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleComplete}
              className={`px-8 py-3 ${
                isCompleted 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={!formData.title || !formData.destination}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  已完成
                </>
              ) : (
                '完成创建'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
