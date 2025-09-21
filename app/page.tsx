'use client'

import { useState } from 'react'
import HealthScreen from './components/HealthScreen'
import ChatScreen from './components/ChatScreen'
import ActionPlansScreen from './components/ActionPlansScreen'

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

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState(1) // 0: Health, 1: Chat, 2: Action Plans
  const [actionPlans, setActionPlans] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const screens = [
    { name: 'Health', component: 
      <HealthScreen 
        key="health" 
        onChatClick={() => setCurrentScreen(1)}
        onActionsClick={() => setCurrentScreen(2)}
      /> 
    },
    { name: 'Chat', component: 
      <ChatScreen 
        key="chat" 
        messages={messages} 
        setMessages={setMessages} 
        onActionPlanCreated={(plan) => setActionPlans(prev => [...prev, plan])} 
        onAvatarClick={() => setCurrentScreen(0)} 
        onActionsClick={() => setCurrentScreen(2)} 
      /> 
    },
    { name: 'Actions', component: 
      <ActionPlansScreen 
        key="actions" 
        actionPlans={actionPlans}
        onChatClick={() => setCurrentScreen(1)}
        onHealthClick={() => setCurrentScreen(0)}
      /> 
    }
  ]

  return (
    <div className="h-screen w-screen bg-khaki-150 flex justify-center items-center">
      
      <div className="h-[815px] w-[375px] bg-khaki-50 flex flex-col overflow-hidden rounded-[16px]">
        <img 
          src="/images/statusbar.svg" 
          className="w-full top-0 left-0"
        />
        
        {/* Screen content */}
        <div className="flex-1 overflow-hidden">
          {screens[currentScreen].component}
        </div>


        <div className="self-stretch h-6 inline-flex flex-col justify-start items-center gap-2">
          <div className="w-32 flex-1 relative">
            <div className="w-32 h-[5px] left-0 top-[11px] absolute bg-gray-800 rounded-[100px]"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
