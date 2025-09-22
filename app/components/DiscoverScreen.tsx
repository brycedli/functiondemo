'use client'

import { useState } from 'react'
import CategoryTag from './CategoryTag'
import ContentCard from './ContentCard'

interface DiscoverScreenProps {
  onNavigateToChat?: () => void
}



// Mock data for content cards
const mockContent = [
  {
    id: 1,
    type: 'image' as const,
    title: 'Huberman explains how modern diet and toxic exposures are wreaking havoc on hormones—for both men and women',
    category: 'News & Studies',
    imageUrl: '/images/Huberman.png'
  },
  {
    id: 2,
    type: 'image' as const,
    title: 'How MRI scans are finding cancer early',
    category: 'News & Studies',
    imageUrl: '/images/Quote.png'
  },
  {
    id: 3,
    type: 'image' as const,
    title: 'Low-weight strength training, yoga and stretches for you',
    category: 'Activity & Exercise',
    imageUrl: '/images/Training.png'
  },
  {
    id: 4,
    type: 'image' as const,
    title: 'Your Brain Has a Check Engine Light',
    category: 'News & Studies',
    imageUrl: '/images/Brain.png'
  },
  {
    id: 5,
    type: 'image' as const,
    title: 'How to Help Your Body Eliminate Toxins',
    category: 'Stress & Mindfulness',
    imageUrl: '/images/Flower.png'
  },
  {
    id: 6,
    type: 'image' as const,
    title: 'Is fasting messing with your hormones?',
    category: 'Nutrition',
    imageUrl: '/images/List.png'
  },
  {
    id: 7,
    type: 'image' as const,
    title: 'Almond Mint Coconut Smoothie',
    category: 'Nutrition',
    imageUrl: '/images/Smoothie.png'
  },
  {
    id: 8,
    type: 'image' as const,
    title: 'Garlic Butter Cod & Green Beans',
    category: 'Nutrition',
    imageUrl: '/images/Cod.png'
  }
]

const categories = [
  { label: 'For You', icon: '', isDefault: true },
  { label: 'Popular', icon: 'fas fa-arrow-trend-up' },
  { label: 'Movement', icon: 'fas fa-running' },
  { label: 'Nutrition', icon: 'fas fa-utensils' },
  { label: 'Supplements', icon: 'fas fa-pills' },
  { label: 'Stress & Mindfulness', icon: 'fas fa-spa' },
  { label: 'News & Studies', icon: 'fas fa-flask' }
]

export default function DiscoverScreen({ onNavigateToChat }: DiscoverScreenProps) {
  const [activeCategory, setActiveCategory] = useState('For You')
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set())

  const handleLike = (id: number) => {
    setLikedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <div className="h-full w-full bg-khaki-50 flex flex-col pt-[54px] pb-[24px] rounded-l-[32px]">
      {/* Discover Navigation Menu */}
      <div className="h-[52px] flex items-center px-4 justify-between">
        <button
          onClick={onNavigateToChat}
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

        <div className="w-8 h-8 rounded-full flex items-center justify-center">
          <i className="fas fa-sliders text-gray-800"></i>
        </div>
      </div>



      {/* Content Cards Section */}
      <div className="overflow-y-auto pt-4 pb-6 space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-4">
          {/* For You tag with avatar */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setActiveCategory('For You')}
              className={`
                h-8 pl-1.5 pr-3 py-2 rounded-full border flex justify-center items-center gap-1.5 whitespace-nowrap
                ${activeCategory === 'For You'
                  ? 'bg-gray-800 border-khaki-150 text-khaki-50'
                  : 'bg-khaki-100 border-transparent text-gray-600 hover:bg-khaki-150'
                }
                transition-colors duration-200
              `}
            >
              <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src="/images/AvatarOnly.svg" 
                  className="w-full h-full"
                  alt="Profile"
                />
              </div>
              <span className="text-sm font-normal leading-snug">For You</span>
            </button>
          </div>

          {/* Other category tags */}
          {categories.slice(1).map((category) => (
            <div key={category.label} className="flex-shrink-0">
              <CategoryTag
                label={category.label}
                icon={category.icon}
                isActive={activeCategory === category.label}
                onClick={() => setActiveCategory(category.label)}
              />
            </div>
          ))}
        </div>
        <div className="flex-1 px-4 ">
          {/* Category Filter Section */}

          <div className="flex flex-col gap-3">
            {mockContent.map((item) => (
              <ContentCard
                key={item.id}
                type={item.type}
                title={item.title}
                category={item.category}
                imageUrl={item.imageUrl}
                quote={item.quote}
                gradientColors={item.gradientColors}
                isLiked={likedItems.has(item.id)}
                onLike={() => handleLike(item.id)}
                onMore={() => console.log('More options for:', item.title)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
