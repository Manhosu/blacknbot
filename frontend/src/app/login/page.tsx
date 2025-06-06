'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Eye, EyeOff, X, Monitor } from "lucide-react"
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Validação de email
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  // Validação do formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'E-mail inválido'
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Limpar erro do campo ao começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.senha,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ email: 'E-mail ou senha incorretos' })
        } else if (error.message.includes('Email not confirmed')) {
          setErrors({ email: 'Por favor, confirme seu e-mail antes de fazer login' })
        } else if (error.message.includes('Too many requests')) {
          setErrors({ email: 'Muitas tentativas. Aguarde alguns minutos.' })
        } else {
          setErrors({ email: 'Erro na autenticação. Tente novamente.' })
        }
        return
      }

      if (data.user) {
        // Redirecionar para o dashboard
        router.push('/dashboard')
      }

    } catch (error) {
      console.error('Erro no login:', error)
      setErrors({ email: 'Erro interno. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-white relative overflow-hidden">
      {/* Enhanced Background Effects - Same as homepage */}
      <div className="absolute inset-0">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900" />
        
        {/* Animated mesh gradient */}
        <div className="absolute inset-0 opacity-60">
          <div 
            className="absolute top-0 left-0 w-full h-full"
            style={{
              background: `
                radial-gradient(ellipse 800px 600px at 50% 0%, rgba(85, 119, 170, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse 600px 400px at 80% 100%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                radial-gradient(ellipse 400px 300px at 20% 100%, rgba(245, 158, 11, 0.08) 0%, transparent 50%)
              `
            }}
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20 animate-float"
              style={{
                left: `${(i * 7 + 10) % 90}%`,
                top: `${(i * 11 + 15) % 80}%`,
                width: `${(i % 3) + 2}px`,
                height: `${(i % 3) + 2}px`,
                backgroundColor: ['#5577AA', '#10B981', '#F59E0B'][i % 3],
                animationDelay: `${(i * 2) % 15}s`,
                animationDuration: `${15 + (i % 10)}s`
              }}
            />
          ))}
        </div>

        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(85, 119, 170, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(85, 119, 170, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: `translate(${scrollY * 0.1}px, ${scrollY * 0.1}px)`
          }}
        />

        {/* Dynamic light effects */}
        <div 
          className="absolute inset-0"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        >
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-2xl animate-pulse-soft" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-accent-emerald/8 rounded-full blur-2xl animate-float" />
        </div>
      </div>

      {/* Header Navigation */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-500 bg-dark-900/80 backdrop-blur-xl border-b border-primary-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 via-accent-emerald to-accent-gold rounded-2xl flex items-center justify-center">
                <Monitor className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-black text-white">
                BLACKINBOT
              </span>
            </div>
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-primary-300 hover:text-primary-200 transition-colors duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-md">
          
          {/* Hero Text */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{
              color: '#ffffff',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
            }}>
              Bem-vindo de volta
            </h1>
            <p className="text-xl text-gray-200 mb-8" style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
            }}>
              Acesse sua conta para continuar monetizando
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-dark-700/30 backdrop-blur-xl rounded-2xl p-8 border border-dark-600/30 hover:bg-dark-600/40 transition-all duration-300">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* E-mail */}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-3">
                  E-mail
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="seu@email.com"
                  className={`bg-dark-800/50 border-dark-600/50 text-white placeholder-gray-400 h-12 rounded-xl backdrop-blur-sm transition-all duration-300 focus:border-primary-500 focus:ring-primary-500/20 ${
                    errors.email ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-3">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.senha}
                    onChange={(e) => handleInputChange('senha', e.target.value)}
                    placeholder="Sua senha"
                    className={`bg-dark-800/50 border-dark-600/50 text-white placeholder-gray-400 h-12 rounded-xl backdrop-blur-sm transition-all duration-300 focus:border-primary-500 focus:ring-primary-500/20 pr-12 ${
                      errors.senha ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-300 transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.senha && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {errors.senha}
                  </p>
                )}
              </div>

              {/* Botão de Login */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-primary-600 via-accent-emerald to-accent-gold text-white border border-primary-400/20 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-primary-500/30 relative overflow-hidden group font-semibold text-lg mt-8"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">Entrar</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-gold to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </>
                )}
              </Button>

              {/* Links */}
              <div className="space-y-4 mt-6">
                <div className="text-center">
                  <p className="text-gray-300">
                    Não tem uma conta?{' '}
                    <Link href="/cadastro" className="text-primary-300 hover:text-primary-200 font-semibold transition-colors duration-300">
                      Criar conta
                    </Link>
                  </p>
                </div>

                <div className="text-center">
                  <Link href="/recuperar-senha" className="text-sm text-gray-400 hover:text-primary-300 transition-colors duration-300">
                    Esqueceu sua senha?
                  </Link>
                </div>
              </div>
            </form>
          </div>

          {/* Trust indicators */}
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              🔒 Seus dados estão seguros conosco
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 