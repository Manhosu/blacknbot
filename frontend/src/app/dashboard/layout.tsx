'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, setUser, setLoading } = useAuthStore()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [key, setKey] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erro ao verificar sessão:', error)
          setUser(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [setUser, setLoading])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Trigger entrance animation
  useEffect(() => {
    if (user && !loading) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [user, loading])

  // Reset animation on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setKey(prev => prev + 1)
      setIsVisible(false)
      
      setTimeout(() => {
        setIsVisible(true)
      }, 50)
    }

    // Listen for navigation events
    const handlePopState = () => handleRouteChange()
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient background */}
        <div 
          className="absolute inset-0 opacity-40 transition-transform duration-20000 ease-linear"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 90% 10%, rgba(251, 191, 36, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 10% 90%, rgba(6, 182, 212, 0.2) 0%, transparent 50%)
            `,
            transform: `translateY(${isVisible ? '0' : '10px'})`,
          }}
        />
        
        {/* Floating particles - only render on client with predefined positions */}
        {mounted && (
          <>
            {/* Predefined particles to avoid hydration mismatch */}
            {[
              {left: '15%', top: '25%', width: '2px', height: '2px', color: 'rgba(139, 92, 246, 0.5)', delay: '0.3s', duration: '3.5s'},
              {left: '85%', top: '65%', width: '3px', height: '3px', color: 'rgba(168, 85, 247, 0.5)', delay: '1.2s', duration: '4.2s'},
              {left: '35%', top: '85%', width: '1px', height: '1px', color: 'rgba(16, 185, 129, 0.5)', delay: '1.8s', duration: '2.8s'},
              {left: '75%', top: '35%', width: '4px', height: '4px', color: 'rgba(251, 191, 36, 0.5)', delay: '0.9s', duration: '3.8s'},
              {left: '55%', top: '15%', width: '2px', height: '2px', color: 'rgba(139, 92, 246, 0.5)', delay: '0.5s', duration: '4.1s'},
              {left: '95%', top: '75%', width: '3px', height: '3px', color: 'rgba(16, 185, 129, 0.5)', delay: '1.5s', duration: '2.5s'},
              {left: '25%', top: '55%', width: '1px', height: '1px', color: 'rgba(168, 85, 247, 0.5)', delay: '0.8s', duration: '3.2s'},
              {left: '65%', top: '95%', width: '2px', height: '2px', color: 'rgba(251, 191, 36, 0.5)', delay: '2.1s', duration: '3.0s'},
              {left: '5%', top: '45%', width: '3px', height: '3px', color: 'rgba(139, 92, 246, 0.5)', delay: '0.2s', duration: '4.5s'},
              {left: '45%', top: '5%', width: '1px', height: '1px', color: 'rgba(16, 185, 129, 0.5)', delay: '1.7s', duration: '2.2s'}
            ].map((particle, i) => (
              <div
                key={i}
                className={`absolute rounded-full transition-all duration-1000 ease-out animate-pulse ${
                  isVisible ? 'opacity-30' : 'opacity-0'
                }`}
                style={{
                  left: particle.left,
                  top: particle.top,
                  width: particle.width,
                  height: particle.height,
                  backgroundColor: particle.color,
                  animationDelay: particle.delay,
                  animationDuration: particle.duration,
                  transform: `translateY(${isVisible ? '0' : '20px'})`,
                  transitionDelay: `${i * 50}ms`
                }}
              />
            ))}
          </>
        )}
        
        {/* Grid pattern */}
        <div 
          className={`absolute inset-0 opacity-5 transition-all duration-1000 ${
            isVisible ? 'scale-100' : 'scale-95'
          }`}
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Light effects */}
        <div 
          className={`absolute inset-0 opacity-20 transition-all duration-1500 ${
            isVisible ? 'scale-100 rotate-0' : 'scale-110 rotate-1'
          }`}
          style={{
            background: `
              conic-gradient(from 180deg at 50% 50%, 
                rgba(139, 92, 246, 0.1) 0deg,
                rgba(168, 85, 247, 0.1) 120deg,
                rgba(16, 185, 129, 0.1) 240deg,
                rgba(139, 92, 246, 0.1) 360deg
              )
            `,
          }}
        />
      </div>

      <div className="relative z-10 flex">
        {/* Sidebar with animation */}
        <div 
          className={`transition-all duration-700 ease-out ${
            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
          }`}
        >
          <Sidebar />
        </div>
        
        {/* Main content with animation */}
        <div className="flex-1 flex flex-col min-h-screen">
          <main 
            key={key}
            className={`flex-1 p-8 transition-all duration-700 ease-out ${
              isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-10 opacity-0 scale-95'
            }`}
            style={{
              transitionDelay: '200ms'
            }}
          >
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
} 