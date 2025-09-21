'use client'

import { useState } from 'react'
import HealthScreen from './components/HealthScreen'
import ChatScreen from './components/ChatScreen'
import DiscoverScreen from './components/DiscoverScreen'

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
      
      <div className="h-[815px] w-[375px] bg-khaki-50 flex flex-col overflow-hidden rounded-[16px]">
        <img 
          src="/images/statusbar.svg" 
          className="w-full top-0 left-0"
        />
        {/* Navigation buttons - custom for each screen */}
        <div className="h-[52px] items-center px-[12px] flex flex-row justify-between">
          {/* Left side button */}
          <div className="w-[40px] h-[40px] flex items-center justify-center">
            {currentScreen === 0 ? (
              /* Back button for Health screen */
              <button 
                onClick={goBack}
                className="text-gray-800 flex items-center justify-center"
              >
                <i className="fas fa-arrow-left text-xl"></i>
              </button>
            ) : currentScreen === 1 ? (
              /* Avatar button for Chat screen */
              <div onClick={() => navigateTo(0)}>
                <img 
                  src="/images/Avatar.svg" 
                  className="w-full h-full"
                  alt="Profile"
                />
              </div>
            ) : (
              /* Back button for Discover screen */
              <button 
                onClick={goBack}
                className="text-gray-800 flex items-center justify-center"
              >
                <i className="fas fa-arrow-left text-xl"></i>
              </button>
            )}
          </div>
          
          {/* Title */}
          {/* <div className="flex-1 text-center text-gray-800 font-semibold">
            {screens[currentScreen].name}
          </div> */}
          
          {/* Right side button */}
          <div className="w-[40px] h-[40px] flex items-center justify-center">
            {currentScreen === 0 ? (
              /* No button for Health screen */
              <div></div>
            ) : currentScreen === 1 ? (
              /* Discover button for Chat screen */
              <button 
                onClick={() => navigateTo(2)}
                className="text-gray-800 flex items-center justify-center"
              >
                <div className="w-[40px] h-[40px]">
                  <img 
                    src="/images/Actions.svg" 
                    className="w-full h-full"
                  />
                </div>
              </button>
            ) : (
              /* No button for Discover screen */
              <div></div>
            )}
          </div>
        </div>
        
        {/* Screen content */}
        <div className="flex-1 overflow-hidden">
          {screens[currentScreen].component}
        </div>

        <div className="self-stretch h-6 relative">
          <div className="w-32 h-[5px] left-[121px] top-[13px] absolute bg-gray-800 rounded-[100px]"></div>
        </div>
      </div>
    </div>
  )
}
