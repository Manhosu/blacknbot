'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, ArrowLeft, X, CheckCircle } from "lucide-react"
import { createClient } from '@/lib/supabase'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Validação de email
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('E-mail é obrigatório')
      return
    }

    if (!validateEmail(email)) {
      setError('E-mail inválido')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)

    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error)
      setError('Erro interno. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/login" className="inline-flex items-center space-x-2 mb-6 text-blue-400 hover:text-blue-300">
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para login</span>
            </Link>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Bot className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold">BlackinBot</span>
            </div>
          </div>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h1 className="text-xl font-bold text-white mb-2">E-mail Enviado!</h1>
                <p className="text-gray-400 mb-4">
                  Enviamos um link para redefinir sua senha para <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                </p>
                <Link href="/login">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Voltar para Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/login" className="inline-flex items-center space-x-2 mb-6 text-blue-400 hover:text-blue-300">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para login</span>
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bot className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold">BlackinBot</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Recuperar Senha</h1>
          <p className="text-gray-400">
            Digite seu e-mail para receber o link de recuperação
          </p>
        </div>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Redefinir Senha</CardTitle>
            <CardDescription className="text-gray-400">
              Enviaremos um e-mail com as instruções
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* E-mail */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-mail
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  placeholder="seu@email.com"
                  className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 ${
                    error ? 'border-red-500' : ''
                  }`}
                />
                {error && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {error}
                  </p>
                )}
              </div>

              {/* Botão de Enviar */}
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </div>
                ) : (
                  'Enviar Link de Recuperação'
                )}
              </Button>

              {/* Link para Login */}
              <div className="text-center mt-4">
                <p className="text-gray-400">
                  Lembrou da senha?{' '}
                  <Link href="/login" className="text-blue-400 hover:text-blue-300">
                    Fazer login
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 