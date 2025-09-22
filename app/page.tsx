'use client'

import { useState } from 'react'
import HealthScreen from './components/HealthScreen'
import ChatScreen from './components/ChatScreen'
import DiscoverScreen from './components/DiscoverScreen'
import SwipeableScreenContainer from './components/SwipeableScreenContainer'

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
  // 0: Health, 1: Chat, 2: Discover
  const [currentScreen, setCurrentScreen] = useState(1)
  const [previousScreen, setPreviousScreen] = useState(1)
  const [messages, setMessages] = useState<Message[]>([])

  // Function to navigate between screens
  const navigateTo = (screenIndex: number) => {
    setPreviousScreen(currentScreen)
    setCurrentScreen(screenIndex)
  }

  // Handle swipe navigation
  const handleSwipeNavigation = (newIndex: number) => {
    setPreviousScreen(currentScreen)
    setCurrentScreen(newIndex)
  }

  // Function to go back to previous screen
  const goBack = () => {
    setCurrentScreen(previousScreen)
  }

  const screens = [
    { name: 'Health', component: <HealthScreen key="health" /> },
    { name: 'Chat', component: <ChatScreen key="chat" messages={messages} setMessages={setMessages} onActionPlanCreated={(plan) => {}} /> },
    { name: 'Discover', component: <DiscoverScreen key="discover" /> }
  ]

  return (
    <div className="h-screen w-screen bg-khaki-150 flex justify-center items-center">
      
      <div className="h-[815px] w-[375px] bg-khaki-50 flex flex-col overflow-hidden rounded-[32px] relative">
        {/* Status bar - positioned above everything with highest z-index */}
        <div className="absolute top-0 left-0 w-full z-[999] pointer-events-none">
          <img 
            src="/images/statusbar.svg" 
            className="w-full"
          />
        </div>
        
        {/* Screen content */}
        <SwipeableScreenContainer
          currentIndex={currentScreen}
          onIndexChange={handleSwipeNavigation}
          className="flex-1"
        >
          <HealthScreen key="health" onNavigateToChat={() => navigateTo(1)} />
          <ChatScreen 
            key="chat" 
            messages={messages} 
            setMessages={setMessages} 
            onActionPlanCreated={(plan) => {}} 
            onNavigateToHealth={() => navigateTo(0)}
            onNavigateToDiscover={() => navigateTo(2)}
          />
          <DiscoverScreen key="discover" onNavigateToChat={() => navigateTo(1)} />
        </SwipeableScreenContainer>

        <div className="self-stretch h-6 absolute z-[999] bottom-0 left-0">
          <div className="w-32 h-[5px] left-[121px] top-[13px] absolute bg-gray-800 rounded-[100px]"></div>
        </div>
      </div>
    </div>
  )
}
