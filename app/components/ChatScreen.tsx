'use client'

import { useState } from 'react'
import ActionPlanCard from './ActionPlanCard'
import HealthSearchCard from './HealthSearchCard'

interface Message {
  role: 'user' | 'assistant'
  content: string
  actionPlan?: {
    steps: {
      text: string;
      icon?: string;
    }[]
    timestamp: string
  }
  healthSearch?: {
    query: string
    foundItems: string[]
    summaries?: string[]
  }
}

interface ChatScreenProps {
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  onActionPlanCreated: (plan: string) => void
  onNavigateToHealth?: () => void
  onNavigateToDiscover?: () => void
}

export default function ChatScreen({ messages, setMessages, onActionPlanCreated, onNavigateToHealth, onNavigateToDiscover }: ChatScreenProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    const originalInput = input
    setInput('')
    setIsLoading(true)

    try {
      // Step 1: Search health data
      const searchResponse = await fetch('/api/search-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: originalInput })
      })
      const searchData = await searchResponse.json()

      // Add search result message
      const searchMessage: Message = {
        role: 'assistant',
        content: '',
        healthSearch: {
          query: searchData.query,
          foundItems: searchData.foundItems,
          summaries: searchData.healthSummaries || []
        }
      }
      setMessages(prev => [...prev, searchMessage])

      // Step 2: Get analysis
      const analysisResponse = await fetch('/api/analyze-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: originalInput,
          healthData: searchData.healthData
        })
      })
      const analysisData = await analysisResponse.json()

      // Update the message with analysis
      setMessages(prev => prev.map((msg, index) =>
        index === prev.length - 1
          ? { ...msg, content: analysisData.response }
          : msg
      ))

      // Step 3: Create action plan
      const actionResponse = await fetch('/api/create-action-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: originalInput,
          healthData: searchData.healthData,
          analysis: analysisData.response
        })
      })
      const actionData = await actionResponse.json()

      // Add action plan to the message
      if (actionData.actionPlan && actionData.steps) {
        setMessages(prev => prev.map((msg, index) =>
          index === prev.length - 1
            ? {
              ...msg,
              actionPlan: {
                steps: actionData.steps,
                timestamp: new Date().toLocaleTimeString()
              }
            }
            : msg
        ))
        onActionPlanCreated(actionData.actionPlan)
      }

    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error processing your request.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full w-full bg-khaki-50 flex flex-col pt-[54px] pb-[24px]" style={{ minHeight: 0 }}>
      {/* Chat Navigation Menu */}
      <div className="h-[52px] items-center px-[12px] flex flex-row justify-between">
        <div onClick={onNavigateToHealth} className="w-[40px] h-[40px] cursor-pointer">
          <img 
            src="/images/Avatar.svg" 
            className="w-full h-full"
            alt="Profile"
          />
        </div>
        
        <button 
          onClick={onNavigateToDiscover}
          className="w-[40px] h-[40px]"
        >
          <img 
            src="/images/Actions.svg" 
            className="w-full h-full"
          />
        </button>
      </div>
      {/* Messages area - scrollable */}
      <div className="flex-1 flex flex-col overflow-y-auto p-4 gap-4" style={{ minHeight: 0 }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            {/* Empty state SVG placeholder */}
            <div className="mb-4">
              {/* You can upload your own SVG to the public/images directory */}
              <img 
                src="/images/empty-chat.svg" 
                alt="Empty chat" 
                className="w-full h-full"
              />
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div className={`flex flex-col gap-4 ${message.role === 'user' ? 'ml-auto max-w-[308px]' : 'mr-auto'}`}>
                {message.healthSearch && (
                  <HealthSearchCard
                    searchQuery={message.healthSearch.query}
                    foundItems={message.healthSearch.foundItems}
                    summaries={message.healthSearch.summaries}
                  />
                )}
                <div
                  className={`rounded-[16px] text-gray-800 letter-spacing-[-1%] line-height-[26px] font-size-[16px] ${message.role === 'user'
                      ? 'p-3 bg-khaki-150'
                      : 'bg-transparent'
                    }`}
                >
                  {message.content}
                </div>
                {message.actionPlan && (
                  <ActionPlanCard
                    steps={message.actionPlan.steps}
                    timestamp={message.actionPlan.timestamp}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Suggestion chips - only shown when no messages exist */}
      {messages.length === 0 && (
        <div className="px-2 pb-2 flex-shrink-0">
          <div className="self-stretch px-2 inline-flex justify-start items-center gap-2">
            {[
              { title: 'Explain my', subtitle: 'latest lab results' },
              { title: 'Optimize my', subtitle: 'nutrition and meals' },
              { title: 'Create a', subtitle: 'cardiovascular report' }
            ].map((suggestion, index) => (
              <div 
                key={index}
                onClick={() => {
                  const message = `${suggestion.title} ${suggestion.subtitle}`
                  setInput(message)
                  // Auto-send the message
                  setTimeout(() => {
                    if (!isLoading) {
                      sendMessage()
                    }
                  }, 100)
                }}
                className="px-3 py-2 bg-khaki-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-khaki-150 inline-flex flex-col justify-center items-start cursor-pointer hover:bg-khaki-100 transition-colors flex-shrink-0"
              >
                <div className="self-stretch justify-start text-gray-800 text-sm font-semibold leading-snug">{suggestion.title}</div>
                <div className="self-stretch justify-start text-gray-800 text-sm font-normal leading-snug">{suggestion.subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input area - fixed height */}
      <div className="pb-2 px-2 flex-shrink-0">
        <div className="self-stretch pl-1 pr-1.5 py-1 bg-khaki-100 rounded-2xl  outline outline-1 outline-offset-[-1px] outline-khaki-150 inline-flex flex-col justify-start items-start gap-2 overflow-hidden w-full">
          <div className="self-stretch flex-1 px-1 flex flex-col justify-center items-start gap-1 w-full">
            <div className="self-stretch pl-1 pt-2 pb-1 inline-flex justify-start items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask anything..."
                className="flex-1 bg-transparent text-gray-800 border-none outline-none text-base font-normal leading-relaxed"
              />
            </div>
            <div className="self-stretch py-0.5 inline-flex justify-between items-center">
              <div className="flex justify-start items-center gap-2">
                <div className="w-8 h-8 bg-khaki-150 rounded-[999px] inline-flex flex-col justify-center items-center gap-2">
                  <div className="w-6 h-6 text-center justify-center text-gray-800 text-base">
                    <i className="fas fa-plus"></i>
                  </div>
                </div>
                <div className="w-8 h-8 bg-khaki-150 rounded-[999px] inline-flex flex-col justify-center items-center gap-2">
                  <div className="w-6 h-6 text-center justify-center text-gray-800 text-base">
                    <i className="fas fa-ellipsis"></i>
                  </div>
                </div>
              </div>
              <button
                onClick={sendMessage}
                disabled={isLoading}
                className={`w-8 h-8 pb-px ${input.trim() ? 'bg-orange-500' : 'bg-gray-800'} rounded-[100px] inline-flex flex-col justify-center items-center gap-2 disabled:opacity-50`}
                aria-label="Send message"
              >
                <div className="w-5 h-5 text-center justify-center text-khaki-50 text-base">
                  {input.trim() ? (
                    <i className="fas fa-paper-plane"></i>
                  ) : (
                    <i className="fas fa-microphone"></i>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
