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
        {/* Custom navigation menu for each screen */}
        {currentScreen === 0 ? (
          /* Health Menu */
          <div className="self-stretch pl-4 pr-1 py-1 inline-flex justify-between items-center">
            <div className="h-11 flex justify-start items-center gap-2.5">
              <div className="w-11 h-11 p-2.5 inline-flex flex-col justify-center items-center gap-2.5">
                <div className="w-11 h-11 text-center justify-center text-gray-800 text-xl">
                  <i className="fas fa-user-gear"></i>
                </div>
              </div>
            </div>
            <div className="flex-1 self-stretch flex justify-center items-center gap-7">
              <div className="py-0.5 border-b-2 border-gray-800 flex justify-center items-center gap-1">
                <div className="text-center justify-center text-gray-800 text-base font-semibold leading-relaxed">My Data</div>
              </div>
              <div className="py-0.5 border-b-2 border-transparent flex justify-center items-center gap-1">
                <div className="text-center justify-center text-gray-500 text-base font-semibold leading-relaxed">Get Tests</div>
              </div>
            </div>
            <div className="h-11 flex justify-start items-center gap-2.5">
              <button 
                onClick={() => navigateTo(1)}
                className="w-11 h-11 p-2.5 inline-flex flex-col justify-center items-center gap-2.5"
              >
                <div className="w-11 h-11 text-center justify-center text-gray-800 text-xl">
                  <i className="fas fa-arrow-right"></i>
                </div>
              </button>
            </div>
          </div>
        ) : currentScreen === 1 ? (
          /* Chat Menu */
          <div className="h-[52px] items-center px-[12px] flex flex-row justify-between ">
            <div onClick={() => navigateTo(0)} className="w-[40px] h-[40px] cursor-pointer">
              <img 
                src="/images/Avatar.svg" 
                className="w-full h-full"
                alt="Profile"
              />
            </div>
            
            
            
            <button 
              onClick={() => navigateTo(2)}
              className="w-[40px] h-[40px]"
            >
              <img 
                src="/images/Actions.svg" 
                className="w-full h-full"
              />
            </button>
          </div>
        ) : (
          /* Discover Menu */
          <div className="h-[52px] flex items-center px-4 justify-between">
            <button 
              onClick={() => navigateTo(1)}
              className="text-gray-800 flex items-center justify-center"
            >
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            
            <div className="flex-1 self-stretch flex justify-center items-center gap-7">
              <div className="py-0.5 border-b-2 border-gray-800 flex justify-center items-center gap-1">
                <div className="text-center justify-center text-gray-800 text-base font-semibold leading-relaxed">Discover</div>
              </div>
              <div className="py-0.5 border-b-2 border-transparent flex justify-center items-center gap-1">
                <div className="text-center justify-center text-gray-500 text-base font-semibold leading-relaxed">Circles</div>
              </div>
            </div>
            
            <div className="w-8 h-8 bg-khaki-150 rounded-full flex items-center justify-center">
              <i className="fas fa-sliders text-gray-800"></i>
            </div>
          </div>
        )}
        
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
