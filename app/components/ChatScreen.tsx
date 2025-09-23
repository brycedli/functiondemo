'use client'

import { useState } from 'react'
import ActionPlanCard from './ActionPlanCard'
import HealthSearchCard from './HealthSearchCard'
import AnalysisCard from './AnalysisCard'

interface AnalysisStep {
  id: string
  title: string
  icon: string
  status: 'loading' | 'completed' | 'pending'
  data?: {
    title: string
    items: Array<{
      icon: string
      title: string
      count?: string
      url?: string
    }>
    summary?: string
  }
}

interface MessagePart {
  type: 'text' | 'health_search' | 'action_plan' | 'analysis'
  content?: string
  healthSearch?: {
    query: string
    foundItems: string[]
    summaries?: string[]
  }
  actionPlan?: {
    steps: {
      text: string;
      icon?: string;
    }[]
    timestamp: string
  }
  analysis?: {
    steps: AnalysisStep[]
    response?: string
    isStreaming?: boolean
  }
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  parts?: MessagePart[]  // New: ordered parts for streaming
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
  analysis?: {
    steps: AnalysisStep[]
    response?: string
    isStreaming?: boolean
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

    const originalInput = input
    setInput('')
    
    // The AI will now automatically decide whether to use analysis based on the context

    const userMessage: Message = { role: 'user', content: originalInput }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Prepare conversation history for the API
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // Create initial assistant message for streaming
      const assistantMessage: Message = {
        role: 'assistant',
        content: ''
      }
      setMessages(prev => [...prev, assistantMessage])

      // Use streaming chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: originalInput,
          conversationHistory: conversationHistory
        })
      })

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let currentMessage = {
        role: 'assistant' as const,
        content: '',
        parts: [] as MessagePart[],
        healthSearch: undefined as any,
        actionPlan: undefined as any,
        analysis: undefined as any
      }
      let currentTextContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              switch (data.type) {
                case 'text':
                  // Accumulate text content
                  currentTextContent += data.content
                  currentMessage.content += data.content
                  
                  // Update the last text part or create a new one
                  const lastPart = currentMessage.parts[currentMessage.parts.length - 1]
                  if (lastPart && lastPart.type === 'text') {
                    lastPart.content = currentTextContent
                  } else {
                    currentMessage.parts.push({
                      type: 'text',
                      content: currentTextContent
                    })
                  }
                  
                  setMessages(prev => prev.map((msg, index) =>
                    index === prev.length - 1
                      ? { ...msg, content: currentMessage.content, parts: [...currentMessage.parts] }
                      : msg
                  ))
                  break

                case 'function_start':
                  // Don't add any text for function calls - let the UI components handle it
                  
                  // Update or create text part
                  const lastTextPart = currentMessage.parts[currentMessage.parts.length - 1]
                  if (lastTextPart && lastTextPart.type === 'text') {
                    lastTextPart.content = currentTextContent
                  } else {
                    currentMessage.parts.push({
                      type: 'text',
                      content: currentTextContent
                    })
                  }
                  
                  setMessages(prev => prev.map((msg, index) =>
                    index === prev.length - 1
                      ? { ...msg, content: currentMessage.content, parts: [...currentMessage.parts] }
                      : msg
                  ))
                  break

                case 'health_search':
                  // Generate summaries from health data
                  const summaries = []
                  if (data.data && data.data.data) {
                    for (const [category, values] of Object.entries(data.data.data)) {
                      if (values && typeof values === 'object') {
                        const categoryName = category.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                        const valueEntries = Object.entries(values)
                        if (valueEntries.length > 0) {
                          const summary = `${categoryName}: ${valueEntries.slice(0, 3).map(([key, val]) => 
                            `${key} ${val}`
                          ).join(', ')}`
                          summaries.push(summary)
                        }
                      }
                    }
                  }
                  
                  const healthSearchData = {
                    query: data.query,
                    foundItems: data.foundItems,
                    summaries: summaries
                  }
                  
                  currentMessage.parts.push({
                    type: 'health_search',
                    healthSearch: healthSearchData
                  })
                  currentMessage.healthSearch = healthSearchData
                  currentTextContent = '' // Reset text accumulator
                  
                  setMessages(prev => prev.map((msg, index) =>
                    index === prev.length - 1
                      ? { 
                          ...msg, 
                          content: currentMessage.content,
                          parts: [...currentMessage.parts],
                          healthSearch: healthSearchData 
                        }
                      : msg
                  ))
                  break

                case 'analysis_step_start':
                  // Initialize or update analysis with new step
                  if (!currentMessage.analysis) {
                    currentMessage.analysis = {
                      steps: [],
                      isStreaming: true
                    }
                    currentMessage.parts.push({
                      type: 'analysis',
                      analysis: currentMessage.analysis
                    })
                  }
                  
                  // Add or update step as loading
                  const existingStepIndex = currentMessage.analysis.steps.findIndex((s: AnalysisStep) => s.id === data.step.id)
                  if (existingStepIndex >= 0) {
                    currentMessage.analysis.steps[existingStepIndex] = data.step
                  } else {
                    currentMessage.analysis.steps.push(data.step)
                  }
                  
                  setMessages(prev => prev.map((msg, index) =>
                    index === prev.length - 1
                      ? { 
                          ...msg, 
                          analysis: { ...currentMessage.analysis },
                          parts: currentMessage.parts.map(part => 
                            part.type === 'analysis' 
                              ? { ...part, analysis: { ...currentMessage.analysis } }
                              : part
                          )
                        }
                      : msg
                  ))
                  break

                case 'analysis_step_complete':
                  // Update step as completed
                  if (currentMessage.analysis) {
                    const stepIndex = currentMessage.analysis.steps.findIndex((s: AnalysisStep) => s.id === data.step.id)
                    if (stepIndex >= 0) {
                      currentMessage.analysis.steps[stepIndex] = data.step
                    } else {
                      currentMessage.analysis.steps.push(data.step)
                    }
                    
                    setMessages(prev => prev.map((msg, index) =>
                      index === prev.length - 1
                        ? { 
                            ...msg, 
                            analysis: { ...currentMessage.analysis },
                            parts: currentMessage.parts.map(part => 
                              part.type === 'analysis' 
                                ? { ...part, analysis: { ...currentMessage.analysis } }
                                : part
                            )
                          }
                        : msg
                    ))
                  }
                  break

                case 'analysis_complete':
                  // Analysis completed - stop streaming indicator
                  if (currentMessage.analysis) {
                    currentMessage.analysis.isStreaming = false
                    
                    setMessages(prev => prev.map((msg, index) =>
                      index === prev.length - 1
                        ? { 
                            ...msg, 
                            analysis: { ...currentMessage.analysis },
                            parts: currentMessage.parts.map(part => 
                              part.type === 'analysis' 
                                ? { ...part, analysis: { ...currentMessage.analysis } }
                                : part
                            )
                          }
                        : msg
                    ))
                  }
                  break

                case 'action_plan':
                  // Add action plan as a new part
                  const actionPlan = data.actionPlan
                  const actionPlanData = {
                    steps: typeof actionPlan === 'string' 
                      ? actionPlan.split('\n').map((step: string) => ({
                          text: step.replace(/^\d+\.\s*/, ''), // Remove numbering
                          icon: '✓'
                        }))
                      : actionPlan.steps || actionPlan.split('\n').map((step: string) => ({
                          text: step.replace(/^\d+\.\s*/, ''),
                          icon: '✓'
                        })),
                    timestamp: new Date().toLocaleTimeString()
                  }
                  
                  currentMessage.parts.push({
                    type: 'action_plan',
                    actionPlan: actionPlanData
                  })
                  currentMessage.actionPlan = actionPlanData
                  currentTextContent = '' // Reset text accumulator
                  
                  setMessages(prev => prev.map((msg, index) =>
                    index === prev.length - 1
                      ? { 
                          ...msg, 
                          content: currentMessage.content,
                          parts: [...currentMessage.parts],
                          actionPlan: actionPlanData 
                        }
                      : msg
                  ))
                  
                  // Trigger action plan callback
                  if (actionPlan) {
                    onActionPlanCreated(typeof actionPlan === 'string' ? actionPlan : actionPlan.formatted)
                  }
                  break

                case 'complete':
                  // Streaming complete
                  break

                case 'error':
                  throw new Error(data.message)
              }
            } catch (parseError) {
              console.error('Error parsing stream data:', parseError)
            }
          }
        }
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
                {message.role === 'user' ? (
                  // User messages - simple text only
                  <div className="p-3 bg-khaki-150 rounded-[16px] text-gray-800 letter-spacing-[-1%] line-height-[26px] font-size-[16px]">
                    {message.content}
                  </div>
                ) : message.parts && message.parts.length > 0 ? (
                  // Assistant messages with ordered parts - render in streaming order
                  message.parts.map((part, partIndex) => {
                    switch (part.type) {
                      case 'text':
                        return (
                          <div
                            key={partIndex}
                            className="bg-transparent rounded-[16px] text-gray-800 letter-spacing-[-1%] line-height-[26px] font-size-[16px]"
                          >
                            {part.content}
                          </div>
                        )
                      case 'health_search':
                        return part.healthSearch ? (
                          <HealthSearchCard
                            key={partIndex}
                            searchQuery={part.healthSearch.query}
                            foundItems={part.healthSearch.foundItems}
                            summaries={part.healthSearch.summaries}
                          />
                        ) : null
                      case 'action_plan':
                        return part.actionPlan ? (
                          <ActionPlanCard
                            key={partIndex}
                            steps={part.actionPlan.steps}
                            timestamp={part.actionPlan.timestamp}
                          />
                        ) : null
                      case 'analysis':
                        return part.analysis ? (
                          <AnalysisCard
                            key={partIndex}
                            steps={part.analysis.steps}
                            response={part.analysis.response}
                            isStreaming={part.analysis.isStreaming}
                          />
                        ) : null
                      default:
                        return null
                    }
                  })
                ) : (
                  // Fallback for messages without parts (backward compatibility)
                  <>
                    {message.healthSearch && (
                      <HealthSearchCard
                        searchQuery={message.healthSearch.query}
                        foundItems={message.healthSearch.foundItems}
                        summaries={message.healthSearch.summaries}
                      />
                    )}
                    <div className="bg-transparent rounded-[16px] text-gray-800 letter-spacing-[-1%] line-height-[26px] font-size-[16px]">
                      {message.content}
                    </div>
                    {message.actionPlan && (
                      <ActionPlanCard
                        steps={message.actionPlan.steps}
                        timestamp={message.actionPlan.timestamp}
                      />
                    )}
                    {message.analysis && (
                      <AnalysisCard
                        steps={message.analysis.steps}
                        response={message.analysis.response}
                        isStreaming={message.analysis.isStreaming}
                      />
                    )}
                  </>
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
