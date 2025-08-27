'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { CreateNoteForm } from '@/components/forms/CreateNoteForm'
import { useAppStore } from '@/stores/useAppStore'
import { type CreateNoteFormData, defaultFormValues } from '@/lib/validations'
import { type TravelNote, type ContentLink } from '@/types'

const steps = [
  { id: 'basic', title: '基本信息', description: '设置旅行计划的基本信息' },
  { id: 'content', title: '内容链接', description: '添加旅行灵感和攻略链接' },
  { id: 'requirements', title: '旅行需求', description: '设置个人偏好和需求' }
] as const

type StepId = typeof steps[number]['id']

export default function CreateNotePage() {
  const router = useRouter()
  const { addNote } = useAppStore()
  
  const [currentStep, setCurrentStep] = useState<StepId>('basic')
  const [formData, setFormData] = useState<Partial<CreateNoteFormData>>(defaultFormValues)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  const handleDataChange = useCallback((data: Partial<CreateNoteFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }, [])

  const handleNext = () => {
    if (!isLastStep) {
      const nextStep = steps[currentStepIndex + 1]
      setCurrentStep(nextStep.id)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      const prevStep = steps[currentStepIndex - 1]
      setCurrentStep(prevStep.id)
    }
  }

  const handleSubmit = async (data: CreateNoteFormData) => {
    setIsSubmitting(true)
    
    try {
      // 创建新的旅行笔记
      const newNote: TravelNote = {
        id: `note_${Date.now()}`,
        title: data.title,
        destination: data.destination,
        coverImage: data.coverImage,
        description: data.description,
        contentLinks: data.contentLinks.map((url, index) => ({
          id: `link_${Date.now()}_${index}`,
          url,
          platform: 'XIAOHONGSHU' as const, // 这里应该根据URL检测平台
          status: 'PENDING' as const,
          addedAt: new Date(),
          noteId: `note_${Date.now()}`
        })) as ContentLink[],
        requirements: data.requirements,
        status: 'DRAFT' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user_1' // 临时用户ID
      }

      // 添加到状态管理
      addNote(newNote)

      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 跳转到笔记详情页面
      router.push(`/notes/${newNote.id}`)
      
    } catch (error) {
      console.error('创建旅行计划失败:', error)
      // TODO: 显示错误提示
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回</span>
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900">创建旅行计划</h1>
            
            <div className="w-16" /> {/* 占位符保持居中 */}
          </div>
        </div>
      </div>

      {/* 步骤指示器 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <nav aria-label="Progress">
              <ol className="flex items-center justify-center space-x-8">
                {steps.map((step, index) => {
                  const isCurrent = step.id === currentStep
                  const isCompleted = index < currentStepIndex
                  
                  return (
                    <li key={step.id} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                            isCompleted
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : isCurrent
                              ? 'border-blue-600 text-blue-600'
                              : 'border-gray-300 text-gray-400'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div className="mt-2 text-center">
                          <p
                            className={`text-sm font-medium ${
                              isCurrent ? 'text-blue-600' : 'text-gray-500'
                            }`}
                          >
                            {step.title}
                          </p>
                          <p className="text-xs text-gray-400 hidden sm:block">
                            {step.description}
                          </p>
                        </div>
                      </div>
                      
                      {index < steps.length - 1 && (
                        <div
                          className={`w-16 h-0.5 ml-8 ${
                            isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        />
                      )}
                    </li>
                  )
                })}
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8">
          <CreateNoteForm
            currentStep={currentStep}
            formData={formData}
            onDataChange={handleDataChange}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
          
          {/* 导航按钮 */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>上一步</span>
            </button>
            
            {!isLastStep ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>下一步</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                form="create-note-form"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{isSubmitting ? '生成中...' : '生成旅行计划'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
