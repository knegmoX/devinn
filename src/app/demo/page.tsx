'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  PlayCircle, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  FileText,
  Search,
  Plane,
  Hotel,
  MapPin
} from 'lucide-react';
import CreateNoteDemo from '@/components/demo/CreateNoteDemo';
import ContentExtractionDemo from '@/components/demo/ContentExtractionDemo';
import TravelPlanDemo from '@/components/demo/TravelPlanDemo';
import BookingIntegrationDemo from '@/components/demo/BookingIntegrationDemo';
import CompleteExperienceDemo from '@/components/demo/CompleteExperienceDemo';

// Demo step definitions
const DEMO_STEPS = [
  {
    id: 1,
    title: '创建旅行笔记',
    description: '用户输入旅行基本信息和内容链接',
    icon: FileText,
    component: 'CreateNoteDemo',
    estimatedTime: '2分钟'
  },
  {
    id: 2,
    title: 'AI内容分析',
    description: 'AI分析小红书和B站内容，提取旅行信息',
    icon: Search,
    component: 'ContentAnalysisDemo',
    estimatedTime: '1分钟'
  },
  {
    id: 3,
    title: '生成旅行计划',
    description: 'AI生成结构化的动态旅行文档',
    icon: MapPin,
    component: 'TravelPlanDemo',
    estimatedTime: '2分钟'
  },
  {
    id: 4,
    title: '航班酒店搜索',
    description: '集成搜索航班和酒店选项',
    icon: Plane,
    component: 'FlightHotelDemo',
    estimatedTime: '3分钟'
  },
  {
    id: 5,
    title: '完整体验',
    description: '查看完整的旅行计划和预订选项',
    icon: Hotel,
    component: 'CompleteExperienceDemo',
    estimatedTime: '2分钟'
  }
];

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const handleNextStep = () => {
    if (currentStep < DEMO_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const startDemo = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  const currentStepData = DEMO_STEPS[currentStep];
  const progress = ((completedSteps.length) / DEMO_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI笔记DevInn 集成演示
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            体验完整的AI驱动旅行规划流程
          </p>
          
          {!isPlaying ? (
            <Button 
              onClick={startDemo}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              开始演示
            </Button>
          ) : (
            <div className="space-y-4">
              <Progress value={progress} className="w-full max-w-md mx-auto" />
              <p className="text-sm text-gray-600">
                已完成 {completedSteps.length} / {DEMO_STEPS.length} 步骤
              </p>
            </div>
          )}
        </div>

        {isPlaying && (
          <>
            {/* Step Navigation */}
            <div className="mb-8">
              <div className="flex justify-center space-x-4 overflow-x-auto pb-4">
                {DEMO_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = completedSteps.includes(step.id);
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => handleStepClick(index)}
                      className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all min-w-[120px] ${
                        isActive 
                          ? 'border-blue-500 bg-blue-50' 
                          : isCompleted
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className={`p-2 rounded-full mb-2 ${
                        isActive 
                          ? 'bg-blue-500 text-white' 
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-center">
                        {step.title}
                      </span>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {step.estimatedTime}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Step Content */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {React.createElement(currentStepData.icon, { className: "w-6 h-6 text-blue-600" })}
                  <span>步骤 {currentStep + 1}: {currentStepData.title}</span>
                </CardTitle>
                <p className="text-gray-600">{currentStepData.description}</p>
              </CardHeader>
              <CardContent>
                {/* Dynamic component rendering based on current step */}
                <DemoStepContent 
                  step={currentStepData}
                  onComplete={() => handleStepComplete(currentStepData.id)}
                />
              </CardContent>
            </Card>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center">
              <Button
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                上一步
              </Button>

              <div className="text-sm text-gray-600">
                {currentStep + 1} / {DEMO_STEPS.length}
              </div>

              <Button
                onClick={handleNextStep}
                disabled={currentStep === DEMO_STEPS.length - 1}
              >
                下一步
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Demo step content component
function DemoStepContent({ 
  step, 
  onComplete 
}: { 
  step: typeof DEMO_STEPS[0]; 
  onComplete: () => void;
}) {
  switch (step.component) {
    case 'CreateNoteDemo':
      return <CreateNoteDemo onComplete={onComplete} />;
    case 'ContentAnalysisDemo':
      return <ContentExtractionDemo onComplete={onComplete} />;
    case 'TravelPlanDemo':
      return <TravelPlanDemo onComplete={onComplete} />;
    case 'FlightHotelDemo':
      return <BookingIntegrationDemo onComplete={onComplete} />;
    case 'CompleteExperienceDemo':
      return <CompleteExperienceDemo onComplete={onComplete} />;
    default:
      return <div>演示内容加载中...</div>;
  }
}
