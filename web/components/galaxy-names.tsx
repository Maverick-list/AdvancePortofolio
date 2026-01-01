'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface GalaxyNamesProps {
  names: string[]
}

export function GalaxyNames({ names }: GalaxyNamesProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="relative w-full h-[600px] overflow-hidden bg-gradient-to-b from-org-green-900 via-org-blue-900 to-black">
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <motion.h1
          className="text-6xl md:text-8xl font-bold text-white text-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          Geunaseh Jeumala
        </motion.h1>
      </div>
      
      <div className="absolute inset-0">
        {names.map((name, index) => {
          const randomX = Math.random() * 100
          const randomY = Math.random() * 100
          const randomDelay = Math.random() * 2
          const randomDuration = 20 + Math.random() * 10
          const randomSize = 0.6 + Math.random() * 0.8
          const randomOpacity = 0.3 + Math.random() * 0.5

          return (
            <motion.div
              key={index}
              className="absolute text-white font-medium cursor-pointer hover:text-org-blue-300 transition-colors"
              style={{
                left: `${randomX}%`,
                top: `${randomY}%`,
                fontSize: `${randomSize}rem`,
                opacity: randomOpacity,
              }}
              initial={{ 
                opacity: 0,
                scale: 0,
              }}
              animate={{
                opacity: randomOpacity,
                scale: 1,
                x: [0, Math.random() * 50 - 25, 0],
                y: [0, Math.random() * 50 - 25, 0],
              }}
              transition={{
                duration: randomDuration,
                delay: randomDelay,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              whileHover={{
                scale: 1.5,
                opacity: 1,
                zIndex: 50,
                transition: { duration: 0.3 },
              }}
            >
              {name}
            </motion.div>
          )
        })}
      </div>

      {/* Stars background */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  )
}
