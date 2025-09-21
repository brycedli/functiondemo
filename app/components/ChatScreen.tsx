'use client'

import { useState } from 'react'
import ActionPlanCard from './ActionPlanCard'
import HealthSearchCard from './HealthSearchCard'

interface Message {
  role: 'user' | 'assistant'
  content: string
  actionPlan?: {
    steps: string[]
    timestamp: string
  }
  healthSearch?: {
    query: string
    foundItems: string[]
  }
}

interface ChatScreenProps {
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  onActionPlanCreated: (plan: string) => void
}

export default function ChatScreen({ messages, setMessages, onActionPlanCreated }: ChatScreenProps) {
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
        content: 'Searching your health data...',
        healthSearch: {
          query: searchData.query,
          foundItems: searchData.foundItems
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
      if (actionData.actionPlan) {
        const steps = actionData.actionPlan.split('\n').filter((step: string) => step.trim())
        setMessages(prev => prev.map((msg, index) => 
          index === prev.length - 1 
            ? { 
                ...msg, 
                actionPlan: {
                  steps: steps,
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
    <div className="h-full w-full bg-black flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-white text-2xl font-bold">AI Health Chat</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div className={`max-w-md ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
              {message.healthSearch && (
                <HealthSearchCard 
                  searchQuery={message.healthSearch.query}
                  foundItems={message.healthSearch.foundItems}
                />
              )}
              <div
                className={`p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-white'
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
        ))}
        
      </div>
      
      <div className="p-4 border-t border-gray-800">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about your health..."
            className="flex-1 bg-gray-800 text-white p-3 rounded-lg border-none outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
