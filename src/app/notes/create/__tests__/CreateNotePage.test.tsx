import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import CreateNotePage from '../page'
import { useAppStore } from '@/stores/useAppStore'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock the app store
jest.mock('@/stores/useAppStore', () => ({
  useAppStore: jest.fn()
}))

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url')

describe('CreateNotePage', () => {
  const mockPush = jest.fn()
  const mockBack = jest.fn()
  const mockAddNote = jest.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack
    })
    ;(useAppStore as unknown as jest.Mock).mockReturnValue({
      addNote: mockAddNote
    })
  })

  it('renders the create note page with correct initial state', () => {
    render(<CreateNotePage />)
    
    expect(screen.getByText('创建旅行计划')).toBeDefined()
    expect(screen.getAllByText('基本信息')).toHaveLength(2) // One in step indicator, one in form
    expect(screen.getByText('设置旅行计划的基本信息')).toBeDefined()
    
    // Check step indicator
    expect(screen.getByText('1')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
  })

  it('shows the correct step as active', () => {
    render(<CreateNotePage />)
    
    const step1 = screen.getByText('1').closest('div')
    expect(step1?.className).toContain('border-blue-600')
  })

  it('allows navigation between steps', async () => {
    render(<CreateNotePage />)
    
    // Fill basic info
    const titleInput = screen.getByLabelText(/计划标题/)
    const destinationInput = screen.getByLabelText(/目的地/)
    
    await user.type(titleInput, '我的东京之旅')
    await user.type(destinationInput, '东京, 日本')
    
    // Go to next step
    const nextButton = screen.getByText('下一步')
    await user.click(nextButton)
    
    // Should show content links step - check for multiple elements
    expect(screen.getAllByText('内容链接')).toHaveLength(2) // One in step indicator, one in form
  })

  it('handles back navigation', async () => {
    render(<CreateNotePage />)
    
    const backButton = screen.getByText('返回')
    await user.click(backButton)
    
    expect(mockBack).toHaveBeenCalled()
  })

  it('disables navigation buttons appropriately', () => {
    render(<CreateNotePage />)
    
    // First step should have disabled previous button
    const prevButton = screen.getByRole('button', { name: /上一步/ })
    expect(prevButton.getAttribute('disabled')).not.toBeNull()
  })

  it('maintains form data when navigating between steps', async () => {
    render(<CreateNotePage />)
    
    // Fill basic info
    const titleInput = screen.getByLabelText(/计划标题/)
    await user.type(titleInput, '我的测试旅行')
    
    // Go to next step and back
    await user.click(screen.getByText('下一步'))
    expect(screen.getAllByText('内容链接')).toHaveLength(2) // One in step indicator, one in form
    
    await user.click(screen.getByText('上一步'))
    expect(screen.getAllByText('基本信息')).toHaveLength(2) // One in step indicator, one in form
    
    // Check that data is preserved
    expect((screen.getByDisplayValue('我的测试旅行') as HTMLInputElement).value).toBe('我的测试旅行')
  })
})
