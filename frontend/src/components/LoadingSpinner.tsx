'use client'

import { useState, useEffect } from 'react'

export default function LoadingSpinner() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 relative overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient background */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 90% 10%, rgba(251, 191, 36, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 10% 90%, rgba(6, 182, 212, 0.2) 0%, transparent 50%)
            `,
          }}
        />
        
        {/* Floating particles - only render on client with predefined values */}
        {mounted && (
          <>
            {/* Predefined particles to avoid hydration mismatch */}
            <div className="absolute rounded-full opacity-30 animate-pulse" style={{left: '10%', top: '20%', width: '2px', height: '2px', backgroundColor: 'rgba(139, 92, 246, 0.5)', animationDelay: '0.5s', animationDuration: '3s'}} />
            <div className="absolute rounded-full opacity-30 animate-pulse" style={{left: '80%', top: '60%', width: '3px', height: '3px', backgroundColor: 'rgba(168, 85, 247, 0.5)', animationDelay: '1s', animationDuration: '4s'}} />
            <div className="absolute rounded-full opacity-30 animate-pulse" style={{left: '30%', top: '80%', width: '1px', height: '1px', backgroundColor: 'rgba(16, 185, 129, 0.5)', animationDelay: '1.5s', animationDuration: '2.5s'}} />
            <div className="absolute rounded-full opacity-30 animate-pulse" style={{left: '70%', top: '30%', width: '4px', height: '4px', backgroundColor: 'rgba(251, 191, 36, 0.5)', animationDelay: '0.8s', animationDuration: '3.5s'}} />
            <div className="absolute rounded-full opacity-30 animate-pulse" style={{left: '50%', top: '10%', width: '2px', height: '2px', backgroundColor: 'rgba(139, 92, 246, 0.5)', animationDelay: '0.2s', animationDuration: '4s'}} />
            <div className="absolute rounded-full opacity-30 animate-pulse" style={{left: '90%', top: '70%', width: '3px', height: '3px', backgroundColor: 'rgba(16, 185, 129, 0.5)', animationDelay: '1.2s', animationDuration: '2s'}} />
            <div className="absolute rounded-full opacity-30 animate-pulse" style={{left: '20%', top: '50%', width: '1px', height: '1px', backgroundColor: 'rgba(168, 85, 247, 0.5)', animationDelay: '0.7s', animationDuration: '3s'}} />
            <div className="absolute rounded-full opacity-30 animate-pulse" style={{left: '60%', top: '90%', width: '2px', height: '2px', backgroundColor: 'rgba(251, 191, 36, 0.5)', animationDelay: '1.8s', animationDuration: '2.8s'}} />
          </>
        )}
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Loading Content */}
      <div className="relative z-10 text-center">
        {/* Animated spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-500/20 rounded-full animate-spin">
            <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
          </div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-accent-emerald/20 rounded-full animate-ping"></div>
        </div>
        
        {/* Loading text */}
        <div className="mt-6">
          <h3 className="text-xl font-bold text-white mb-2 animate-pulse" style={{
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
          }}>
            Carregando...
          </h3>
          <p className="text-gray-300 animate-pulse" style={{
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
          }}>
            Preparando seu painel
          </p>
        </div>

        {/* Loading dots animation */}
        <div className="flex justify-center mt-4 space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 