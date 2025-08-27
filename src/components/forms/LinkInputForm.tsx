'use client'

import { useState } from 'react'
import { UseFormReturn, FieldErrors } from 'react-hook-form'
import { Plus, X, Link, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'
import { CreateNoteFormData, extractPlatformFromUrl } from '@/lib/validations'

interface LinkInputFormProps {
  form: UseFormReturn<CreateNoteFormData>
  errors: FieldErrors<CreateNoteFormData>
}

const platformInfo = {
  XIAOHONGSHU: { name: '小红书', color: 'bg-red-500', icon: '📱' },
  BILIBILI: { name: 'B站', color: 'bg-blue-500', icon: '📺' },
  DOUYIN: { name: '抖音', color: 'bg-black', icon: '🎵' },
  MAFENGWO: { name: '马蜂窝', color: 'bg-yellow-500', icon: '🐝' }
}

export function LinkInputForm({ form, errors }: LinkInputFormProps) {
  const { register, watch, setValue } = form
  const [newLink, setNewLink] = useState('')
  const [linkError, setLinkError] = useState('')
  
  const contentLinks = watch('contentLinks') || []

  const validateLink = (url: string): boolean => {
    try {
      new URL(url)
      const platform = extractPlatformFromUrl(url)
      return platform !== null
    } catch {
      return false
    }
  }

  const addLink = () => {
    if (!newLink.trim()) {
      setLinkError('请输入链接')
      return
    }

    if (!validateLink(newLink)) {
      setLinkError('请输入有效的小红书、B站、抖音或马蜂窝链接')
      return
    }

    if (contentLinks.includes(newLink)) {
      setLinkError('该链接已存在')
      return
    }

    if (contentLinks.length >= 10) {
      setLinkError('最多只能添加10个链接')
      return
    }

    const updatedLinks = [...contentLinks, newLink]
    setValue('contentLinks', updatedLinks)
    setNewLink('')
    setLinkError('')
  }

  const removeLink = (index: number) => {
    const updatedLinks = contentLinks.filter((_, i) => i !== index)
    setValue('contentLinks', updatedLinks)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addLink()
    }
  }

  const getPlatformInfo = (url: string) => {
    const platform = extractPlatformFromUrl(url)
    return platform ? platformInfo[platform as keyof typeof platformInfo] : null
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">内容链接</h2>
        <p className="text-gray-600">添加你收集的旅行灵感和攻略链接</p>
      </div>

      {/* 支持的平台 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">支持的平台</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(platformInfo).map(([key, info]) => (
            <div key={key} className="flex items-center space-x-2">
              <span className="text-lg">{info.icon}</span>
              <span className="text-sm text-gray-600">{info.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 添加链接 */}
      <div className="space-y-2">
        <label htmlFor="newLink" className="block text-sm font-medium text-gray-700">
          添加内容链接
        </label>
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="url"
              id="newLink"
              value={newLink}
              onChange={(e) => {
                setNewLink(e.target.value)
                setLinkError('')
              }}
              onKeyPress={handleKeyPress}
              placeholder="粘贴小红书、B站、抖音或马蜂窝的链接"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                linkError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          <button
            type="button"
            onClick={addLink}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">添加</span>
          </button>
        </div>
        {linkError && (
          <p className="text-sm text-red-600">{linkError}</p>
        )}
      </div>

      {/* 已添加的链接列表 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            已添加的链接 ({contentLinks.length}/10)
          </label>
          {contentLinks.length === 0 && (
            <span className="text-sm text-red-500">至少需要添加一个链接</span>
          )}
        </div>
        
        {contentLinks.length > 0 ? (
          <div className="space-y-3">
            {contentLinks.map((link, index) => {
              const platformInfo = getPlatformInfo(link)
              return (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {platformInfo ? (
                      <div className={`w-8 h-8 ${platformInfo.color} rounded-full flex items-center justify-center text-white text-sm`}>
                        {platformInfo.icon}
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                        <Link className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {platformInfo?.name || '未知平台'}
                      </span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-500 truncate">{link}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => window.open(link, '_blank')}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="打开链接"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="删除链接"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Link className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">还没有添加链接</h3>
            <p className="text-gray-500 mb-4">
              添加你在小红书、B站等平台收集的旅行攻略和灵感
            </p>
            <div className="text-sm text-gray-400">
              <p>💡 建议添加 3-5 个高质量的内容链接</p>
              <p>🎯 包含不同类型的内容（美食、景点、住宿等）</p>
            </div>
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {errors.contentLinks && (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{errors.contentLinks.message}</span>
        </div>
      )}

      {/* 提示信息 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">💡</span>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 mb-1">如何找到好的内容链接？</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 搜索目的地相关的旅行攻略和游记</li>
              <li>• 关注当地美食、景点、住宿推荐</li>
              <li>• 选择点赞和评论较多的优质内容</li>
              <li>• 包含实用信息（价格、地址、营业时间等）</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 隐藏的表单字段 */}
      <input
        type="hidden"
        {...register('contentLinks')}
        value={JSON.stringify(contentLinks)}
      />
    </div>
  )
}
