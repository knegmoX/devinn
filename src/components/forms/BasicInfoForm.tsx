'use client'

import { UseFormReturn, FieldErrors } from 'react-hook-form'
import { Upload, MapPin, FileText, Image } from 'lucide-react'
import { CreateNoteFormData } from '@/lib/validations'

interface BasicInfoFormProps {
  form: UseFormReturn<CreateNoteFormData>
  errors: FieldErrors<CreateNoteFormData>
}

export function BasicInfoForm({ form, errors }: BasicInfoFormProps) {
  const { register, watch, setValue } = form
  const coverImage = watch('coverImage')

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 这里应该上传到云存储，暂时使用本地URL
      const imageUrl = URL.createObjectURL(file)
      setValue('coverImage', imageUrl)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">基本信息</h2>
        <p className="text-gray-600">告诉我们你的旅行计划的基本信息</p>
      </div>

      {/* 计划标题 */}
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          计划标题 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            {...register('title')}
            type="text"
            id="title"
            placeholder="例如：我的五日东京探索之旅"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* 目的地 */}
      <div className="space-y-2">
        <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
          目的地 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            {...register('destination')}
            type="text"
            id="destination"
            placeholder="例如：东京, 日本"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.destination ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.destination && (
          <p className="text-sm text-red-600">{errors.destination.message}</p>
        )}
      </div>

      {/* 封面图片 */}
      <div className="space-y-2">
        <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">
          封面图片 <span className="text-gray-400">(可选)</span>
        </label>
        
        {coverImage ? (
          <div className="relative">
            <img
              src={coverImage}
              alt="封面预览"
              className="w-full h-48 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={() => setValue('coverImage', '')}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              id="coverImageFile"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <label
              htmlFor="coverImageFile"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-600">点击上传封面图片</span>
              <span className="text-xs text-gray-400">支持 JPG、PNG 格式</span>
            </label>
          </div>
        )}
        
        {/* 或者输入图片链接 */}
        <div className="relative">
          <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            {...register('coverImage')}
            type="url"
            placeholder="或者输入图片链接"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.coverImage ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.coverImage && (
          <p className="text-sm text-red-600">{errors.coverImage.message}</p>
        )}
      </div>

      {/* 描述 */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          简短描述 <span className="text-gray-400">(可选)</span>
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={4}
          placeholder="简单描述一下你的旅行计划，比如想要体验什么，有什么特殊要求等..."
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
        <p className="text-xs text-gray-500">
          {watch('description')?.length || 0}/500 字符
        </p>
      </div>

      {/* 提示信息 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">💡</span>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 mb-1">小贴士</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 标题要简洁明了，方便后续查找</li>
              <li>• 目的地可以是城市、国家或具体地区</li>
              <li>• 封面图片会让你的计划更有吸引力</li>
              <li>• 描述可以包含你的期待和特殊需求</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
