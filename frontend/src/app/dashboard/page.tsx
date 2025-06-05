'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (!isRedirecting) {
      setIsRedirecting(true)
      // Pequeno delay para evitar problemas de hidratação
      setTimeout(() => {
        router.push('/dashboard/bots')
      }, 100)
    }
  }, [router, isRedirecting])

  return (
    <div className="flex items-center justify-center min-h-[400px] bg-gray-950 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecionando...</p>
      </div>
    </div>
  )
} 