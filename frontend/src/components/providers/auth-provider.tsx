'use client'

import { createContext, useContext, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'

const AuthContext = createContext({})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    // Verificar sessão inicial
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Erro ao obter sessão:', error)
        }
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Erro na autenticação:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setUser(session?.user ?? null)
        } catch (error) {
          console.error('Erro no state change:', error)
          setUser(null)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setLoading, supabase])

  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 