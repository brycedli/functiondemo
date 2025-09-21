'use client'

import { useState } from 'react'
import HealthScreen from './components/HealthScreen'
import ChatScreen from './components/ChatScreen'
import ActionPlansScreen from './components/ActionPlansScreen'

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

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState(1) // 0: Health, 1: Chat, 2: Action Plans
  const [actionPlans, setActionPlans] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const screens = [
    { name: 'Health', component: <HealthScreen key="health" /> },
    { name: 'Chat', component: <ChatScreen key="chat" messages={messages} setMessages={setMessages} onActionPlanCreated={(plan) => setActionPlans(prev => [...prev, plan])} /> },
    { name: 'Actions', component: <ActionPlansScreen key="actions" actionPlans={actionPlans} /> }
  ]

  return (
    <div className="h-screen w-screen bg-black flex flex-col">
      {/* Navigation buttons */}
      <div className="flex border-b border-gray-800">
        {screens.map((screen, index) => (
          <button
            key={index}
            onClick={() => setCurrentScreen(index)}
            className={`flex-1 py-4 text-center font-medium ${
              index === currentScreen 
                ? 'text-white bg-gray-800' 
                : 'text-gray-400 bg-black hover:bg-gray-900'
            }`}
          >
            {screen.name}
          </button>
        ))}
      </div>
      
      {/* Screen content */}
      <div className="flex-1">
        {screens[currentScreen].component}
      </div>
    </div>
  )
}
