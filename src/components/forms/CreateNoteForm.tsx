'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BasicInfoForm } from './BasicInfoForm'
import { LinkInputForm } from './LinkInputForm'
import { RequirementsForm } from './RequirementsForm'
import { 
  createNoteSchema, 
  defaultFormValues,
  type CreateNoteFormData 
} from '@/lib/validations'

interface CreateNoteFormProps {
  currentStep: 'basic' | 'content' | 'requirements'
  formData: Partial<CreateNoteFormData>
  onDataChange: (data: Partial<CreateNoteFormData>) => void
  onSubmit: (data: CreateNoteFormData) => void
  isLoading: boolean
}

export function CreateNoteForm({
  currentStep,
  formData,
  onDataChange,
  onSubmit,
  isLoading
}: CreateNoteFormProps) {
  const form = useForm<CreateNoteFormData>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      ...defaultFormValues,
      ...formData
    } as CreateNoteFormData,
    mode: 'onChange'
  })

  const { handleSubmit, watch, formState: { errors } } = form

  // 监听表单数据变化
  useEffect(() => {
    const subscription = watch((value) => {
      onDataChange(value as Partial<CreateNoteFormData>)
    })
    return () => subscription.unsubscribe()
  }, [watch, onDataChange])

  // 当外部数据变化时更新表单 - 只在初始化时执行
  useEffect(() => {
    form.reset({
      ...defaultFormValues,
      ...formData
    } as CreateNoteFormData)
  }, []) // 移除依赖，只在组件挂载时执行一次

  const handleFormSubmit = (data: CreateNoteFormData) => {
    onSubmit(data)
  }

  return (
    <form 
      id="create-note-form"
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
    >
      {currentStep === 'basic' && (
        <BasicInfoForm 
          form={form}
          errors={errors}
        />
      )}
      
      {currentStep === 'content' && (
        <LinkInputForm 
          form={form}
          errors={errors}
        />
      )}
      
      {currentStep === 'requirements' && (
        <RequirementsForm 
          form={form}
          errors={errors}
        />
      )}
      
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">正在处理...</span>
        </div>
      )}
    </form>
  )
}
