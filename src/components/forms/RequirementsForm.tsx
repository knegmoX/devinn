'use client'

import React from 'react'
import { UseFormReturn, FieldErrors, Controller } from 'react-hook-form'
import { 
  CreateNoteFormData,
  travelStyleOptions,
  interestOptions,
  dietaryOptions,
  accessibilityOptions
} from '@/lib/validations'

interface RequirementsFormProps {
  form: UseFormReturn<CreateNoteFormData>
  errors: FieldErrors<CreateNoteFormData>
}

export function RequirementsForm({
  form,
  errors
}: RequirementsFormProps) {
  const { control, watch, setValue } = form
  const watchedValues = watch('requirements') || {}

  // 获取明天的日期作为最小日期
  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  // 切换选项的辅助函数
  const toggleOption = (
    field: 'travelStyle' | 'interests' | 'dietaryRestrictions' | 'accessibility',
    value: string
  ) => {
    const currentValues = watchedValues[field] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value]
    
    setValue(`requirements.${field}`, newValues, { shouldValidate: true })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">旅行需求</h2>
        <p className="text-gray-600">告诉我们您的旅行偏好，我们将为您生成个性化的旅行计划</p>
      </div>

      {/* 基本信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">基本信息</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 旅行天数 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              旅行天数 <span className="text-red-500">*</span>
            </label>
            <Controller
              name="requirements.duration"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  min="1"
                  max="30"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.requirements?.duration ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入旅行天数"
                />
              )}
            />
            {errors.requirements?.duration && (
              <p className="mt-1 text-sm text-red-600">
                {errors.requirements.duration.message}
              </p>
            )}
          </div>

          {/* 旅行人数 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              旅行人数 <span className="text-red-500">*</span>
            </label>
            <Controller
              name="requirements.travelers"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  min="1"
                  max="20"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.requirements?.travelers ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入旅行人数"
                />
              )}
            />
            {errors.requirements?.travelers && (
              <p className="mt-1 text-sm text-red-600">
                {errors.requirements.travelers.message}
              </p>
            )}
          </div>

          {/* 预算 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              预算 (元)
            </label>
            <Controller
              name="requirements.budget"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  min="0"
                  max="1000000"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.requirements?.budget ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入预算（可选）"
                />
              )}
            />
            {errors.requirements?.budget && (
              <p className="mt-1 text-sm text-red-600">
                {errors.requirements.budget.message}
              </p>
            )}
          </div>

          {/* 出发日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              出发日期 <span className="text-red-500">*</span>
            </label>
            <Controller
              name="requirements.startDate"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  min={getTomorrowDate()}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.requirements?.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              )}
            />
            {errors.requirements?.startDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.requirements.startDate.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 旅行风格 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">旅行风格 <span className="text-red-500">*</span></h3>
        <p className="text-sm text-gray-600">选择您喜欢的旅行风格（至少选择1个，最多5个）</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {travelStyleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleOption('travelStyle', option.value)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                watchedValues.travelStyle?.includes(option.value)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{option.icon}</div>
              <div className="text-sm font-medium">{option.label}</div>
            </button>
          ))}
        </div>
        
        {errors.requirements?.travelStyle && (
          <p className="text-sm text-red-600">
            {errors.requirements.travelStyle.message}
          </p>
        )}
      </div>

      {/* 兴趣标签 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">兴趣标签</h3>
        <p className="text-sm text-gray-600">选择您感兴趣的活动类型（最多10个）</p>
        
        <div className="space-y-3">
          {['culture', 'entertainment', 'food', 'outdoor', 'shopping'].map((category) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                {category === 'culture' && '文化'}
                {category === 'entertainment' && '娱乐'}
                {category === 'food' && '美食'}
                {category === 'outdoor' && '户外'}
                {category === 'shopping' && '购物'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {interestOptions
                  .filter(option => option.category === category)
                  .map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleOption('interests', option.value)}
                      className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                        watchedValues.interests?.includes(option.value)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
        
        {errors.requirements?.interests && (
          <p className="text-sm text-red-600">
            {errors.requirements.interests.message}
          </p>
        )}
      </div>

      {/* 饮食限制 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">饮食限制</h3>
        <p className="text-sm text-gray-600">如有特殊饮食需求，请选择（最多5个）</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {dietaryOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleOption('dietaryRestrictions', option.value)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                watchedValues.dietaryRestrictions?.includes(option.value)
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xl mb-1">{option.icon}</div>
              <div className="text-sm font-medium">{option.label}</div>
            </button>
          ))}
        </div>
        
        {errors.requirements?.dietaryRestrictions && (
          <p className="text-sm text-red-600">
            {errors.requirements.dietaryRestrictions.message}
          </p>
        )}
      </div>

      {/* 无障碍需求 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">无障碍需求</h3>
        <p className="text-sm text-gray-600">如有无障碍需求，请选择（最多5个）</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {accessibilityOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleOption('accessibility', option.value)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                watchedValues.accessibility?.includes(option.value)
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xl mb-1">{option.icon}</div>
              <div className="text-sm font-medium">{option.label}</div>
            </button>
          ))}
        </div>
        
        {errors.requirements?.accessibility && (
          <p className="text-sm text-red-600">
            {errors.requirements.accessibility.message}
          </p>
        )}
      </div>

      {/* 其他需求 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">其他需求</h3>
        <Controller
          name="requirements.freeText"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.requirements?.freeText ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="请描述您的其他特殊需求或偏好..."
            />
          )}
        />
        {errors.requirements?.freeText && (
          <p className="mt-1 text-sm text-red-600">
            {errors.requirements.freeText.message}
          </p>
        )}
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
            <h4 className="text-sm font-medium text-blue-900 mb-1">个性化建议</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 选择更多旅行风格和兴趣，AI 会生成更精准的计划</li>
              <li>• 如有特殊饮食或无障碍需求，请务必选择</li>
              <li>• 在其他需求中可以描述具体的期望和偏好</li>
              <li>• 预算信息有助于推荐合适价位的酒店和餐厅</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
