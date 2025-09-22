'use client'

import { motion, PanInfo, useAnimation } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'

interface SwipeableScreenContainerProps {
  children: ReactNode[]
  currentIndex: number
  onIndexChange: (index: number) => void
  className?: string
}

export default function SwipeableScreenContainer({ 
  children, 
  currentIndex, 
  onIndexChange, 
  className = '' 
}: SwipeableScreenContainerProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [previousIndex, setPreviousIndex] = useState(currentIndex)

  // Screen width for calculations
  const screenWidth = 375 // Fixed width of the mobile container
  
  // Parallax speed ratio - chat moves slower than other screens
  const parallaxRatio = 0.3

  // Individual screen controls
  const healthControls = useAnimation()
  const chatControls = useAnimation()
  const discoverControls = useAnimation()

  // Calculate positions for each screen with parallax effect
  const getScreenPositions = (index: number, offset: number = 0) => {
    switch (index) {
      case 0: // Health screen active
        return {
          health: offset,
          chat: offset * parallaxRatio + screenWidth,
          discover: offset + screenWidth
        }
      case 1: // Chat screen active (center)
        return {
          health: offset - screenWidth,
          chat: offset * parallaxRatio,
          discover: offset + screenWidth
        }
      case 2: // Discover screen active
        return {
          health: offset - screenWidth,
          chat: offset * parallaxRatio - screenWidth,
          discover: offset
        }
      default:
        return { health: 0, chat: 0, discover: screenWidth }
    }
  }

  // Calculate final positions without offset for smooth transitions
  const getFinalPositions = (index: number) => {
    switch (index) {
      case 0: // Health screen active
        return {
          health: 0,
          chat: screenWidth * parallaxRatio, // Chat moves left when Health is active
          discover: screenWidth
        }
      case 1: // Chat screen active (center)
        return {
          health: screenWidth,
          chat: 0, // Chat stays centered when active
          discover: screenWidth
        }
      case 2: // Discover screen active
        return {
          health: screenWidth,
          chat: -screenWidth * parallaxRatio, // Chat moves right when Discover is active
          discover: 0
        }
      default:
        return { health: 0, chat: 0, discover: screenWidth }
    }
  }

  // Animate to the current screen (only for button clicks, not drag transitions)
  useEffect(() => {
    if (!isDragging && currentIndex !== previousIndex) {
      const finalPositions = getFinalPositions(currentIndex)
      const transition = {
        type: 'spring' as const,
        stiffness: 400,
        damping: 35,
        mass: 0.6
      }

      // Determine animation direction based on index change
      const isMovingLeft = currentIndex < previousIndex // Going to Health from Chat
      const isMovingRight = currentIndex > previousIndex // Going to Discover from Chat

      // Set initial positions for screens that are sliding in
      if (isMovingLeft && currentIndex === 0) {
        // Health sliding in from left
        healthControls.set({ x: -screenWidth })
      } else if (isMovingRight && currentIndex === 2) {
        // Discover sliding in from right
        discoverControls.set({ x: screenWidth })
      }

      // Add a small delay to avoid conflicts with drag end animations
      setTimeout(() => {
        healthControls.start({ x: finalPositions.health, transition })
        chatControls.start({ x: finalPositions.chat, transition })
        discoverControls.start({ x: finalPositions.discover, transition })
        
        setPreviousIndex(currentIndex)
      }, 50)
    }
  }, [currentIndex, healthControls, chatControls, discoverControls, isDragging, previousIndex])

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isDragging) return
    
    const offset = info.offset.x
    setDragOffset(offset)
    
    // Apply real-time parallax during drag
    const positions = getScreenPositions(currentIndex, offset)
    
    healthControls.set({ x: positions.health })
    chatControls.set({ x: positions.chat })
    discoverControls.set({ x: positions.discover })
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    setDragOffset(0)

    const threshold = screenWidth * 0.2
    const velocity = Math.abs(info.velocity.x)
    const offset = info.offset.x

    let newIndex = currentIndex

    if (Math.abs(offset) > threshold || velocity > 300) {
      if (offset > 0) {
        newIndex = Math.max(0, currentIndex - 1)
      } else {
        newIndex = Math.min(children.length - 1, currentIndex + 1)
      }
    }

    // If we're changing screens, animate directly from current drag position
    if (newIndex !== currentIndex) {
      const finalPositions = getFinalPositions(newIndex)
      const transition = {
        type: 'spring' as const,
        stiffness: 400,
        damping: 35,
        mass: 0.6
      }

      healthControls.start({ x: finalPositions.health, transition })
      chatControls.start({ x: finalPositions.chat, transition })
      discoverControls.start({ x: finalPositions.discover, transition })
    }

    onIndexChange(newIndex)
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Health Screen - z-index 30 */}
      <motion.div
        className="absolute inset-0"
        style={{ 
          zIndex: 30,
          display: currentIndex === 0 || (isDragging && currentIndex === 1 && dragOffset > 0) ? 'block' : 'none'
        }}
        animate={healthControls}
        initial={{ x: currentIndex === 0 ? 0 : -screenWidth }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      >
        {children[0]}
      </motion.div>

      {/* Chat Screen - z-index 10 (behind others) */}
      <motion.div
        className="absolute inset-0"
        style={{ zIndex: 10 }}
        animate={chatControls}
        initial={{ x: 0 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      >
        {children[1]}
      </motion.div>

      {/* Fixed darkening overlay - stays in viewport */}
      <motion.div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{ 
          zIndex: 20
        }}
        animate={{
          opacity: (() => {
            if (isDragging && currentIndex === 1) {
              // Simple linear progression: 0 to 0.4 based on drag distance
              const progress = Math.min(1, Math.abs(dragOffset) / (screenWidth * 0.5))
              return progress * 0.2
            } else if (currentIndex !== 1) {
              return 0.2
            }
            return 0
          })()
        }}
        transition={{
          opacity: { 
            duration: isDragging ? 0 : 0.2,
            ease: "easeOut"
          }
        }}
      />

      {/* Discover Screen - z-index 30 */}
      <motion.div
        className="absolute inset-0"
        style={{ 
          zIndex: 30,
          display: currentIndex === 2 || (isDragging && currentIndex === 1 && dragOffset < 0) ? 'block' : 'none'
        }}
        animate={discoverControls}
        initial={{ x: currentIndex === 2 ? 0 : screenWidth }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      >
        {children[2]}
      </motion.div>
    </div>
  )
}
