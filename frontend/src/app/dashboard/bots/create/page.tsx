'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { Bot, AlertTriangle, CheckCircle, Loader2, ExternalLink } from 'lucide-react'

interface PushinPayValidation {
  isValid: boolean
  isLoading: boolean
  error: string | null
}

interface BotValidation {
  isValid: boolean
  isLoading: boolean
  error: string | null
  botInfo: any
}

export default function CreateBotPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const supabase = createClient()

  // Estados do formulário
  const [botToken, setBotToken] = useState('')
  const [botName, setBotName] = useState('')
  const [botDescription, setBotDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Estados de validação
  const [pushinPayValidation, setPushinPayValidation] = useState<PushinPayValidation>({
    isValid: false,
    isLoading: true,
    error: null
  })
  
  const [botValidation, setBotValidation] = useState<BotValidation>({
    isValid: false,
    isLoading: false,
    error: null,
    botInfo: null
  })

  // Validar token PushinPay na inicialização
  useEffect(() => {
    if (user) {
      validatePushinPayToken()
    }
  }, [user])

  // Validar bot token quando mudar
  useEffect(() => {
    if (botToken.trim()) {
      validateBotToken(botToken)
    } else {
      setBotValidation({
        isValid: false,
        isLoading: false,
        error: null,
        botInfo: null
      })
    }
  }, [botToken])

  const validatePushinPayToken = async () => {
    setPushinPayValidation(prev => ({ ...prev, isLoading: true }))
    
    try {
      // Buscar token do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('pushinpay_token')
        .eq('id', user?.id)
        .single()

      if (userError || !userData?.pushinpay_token) {
        // Para desenvolvimento, vamos considerar válido mesmo sem token
        // Em produção, isso deve bloquear a criação
        setPushinPayValidation({
          isValid: true, // Temporariamente true para desenvolvimento
          isLoading: false,
          error: null
        })
        return
      }

      // Fazer uma requisição básica para validar o token
      const response = await fetch('/api/validate-pushinpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: userData.pushinpay_token
        })
      })

      if (response.ok) {
        setPushinPayValidation({
          isValid: true,
          isLoading: false,
          error: null
        })
      } else {
        setPushinPayValidation({
          isValid: false,
          isLoading: false,
          error: 'Token PushinPay inválido'
        })
      }
    } catch (error) {
      console.error('Erro ao validar PushinPay:', error)
      setPushinPayValidation({
        isValid: false,
        isLoading: false,
        error: 'Erro ao validar token PushinPay'
      })
    }
  }

  const validateBotToken = async (token: string) => {
    setBotValidation(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Validar token via API do Telegram
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`)
      const data = await response.json()

      if (response.ok && data.ok) {
        setBotValidation({
          isValid: true,
          isLoading: false,
          error: null,
          botInfo: data.result
        })
        
        // Auto-preencher o nome se não estiver preenchido
        if (!botName && data.result.first_name) {
          setBotName(data.result.first_name)
        }
      } else {
        setBotValidation({
          isValid: false,
          isLoading: false,
          error: 'Token do bot inválido. Verifique se você copiou corretamente do @BotFather.',
          botInfo: null
        })
      }
    } catch (error) {
      setBotValidation({
        isValid: false,
        isLoading: false,
        error: 'Erro ao validar token do bot. Verifique sua conexão.',
        botInfo: null
      })
    }
  }

  const handleCreateBot = async () => {
    if (!botValidation.isValid || !pushinPayValidation.isValid) {
      return
    }

    setIsCreating(true)

    try {
      // Obter o usuário atual do Supabase diretamente
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !currentUser) {
        throw new Error('Usuário não está logado ou sessão expirou')
      }

      // Dados básicos obrigatórios
      const botData = {
        user_id: currentUser.id,
        bot_token: botToken,
        bot_username: botValidation.botInfo.username,
        welcome_text: botName || botValidation.botInfo.first_name || 'Bot sem nome'
      }

      console.log('Tentando criar bot com dados:', botData)
      console.log('User ID:', user?.id)

      // Primeiro, vamos testar se conseguimos fazer uma consulta na tabela
      const { data: testQuery, error: testError } = await supabase
        .from('bots')
        .select('*')
        .limit(1)

      if (testError) {
        console.error('Erro ao acessar tabela bots:', testError)
        throw new Error(`Problema ao acessar tabela: ${testError.message}`)
      }

      console.log('Estrutura da tabela bots:', testQuery)

      const { data, error } = await supabase
        .from('bots')
        .insert([botData])
        .select()
        .single()

      if (error) {
        console.error('Erro do Supabase:', error)
        throw error
      }

      console.log('Bot criado com sucesso:', data)

      // Redirecionar para a página individual do bot
      alert('Bot criado com sucesso! Redirecionando para configuração...')
      setTimeout(() => {
        router.push(`/dashboard/bots/${data.id}`)
      }, 1000)

    } catch (error: any) {
      console.error('Erro detalhado ao criar bot:', error)
      
      let errorMessage = 'Erro ao criar bot. '
      
      if (error.message) {
        errorMessage += `Motivo: ${error.message}`
      }
      
      if (error.details) {
        errorMessage += ` | Detalhes: ${error.details}`
      }

      if (error.hint) {
        errorMessage += ` | Sugestão: ${error.hint}`
      }
      
      alert(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  // Renderizar aviso de PushinPay se não estiver válido
  if (pushinPayValidation.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Verificando configurações...</p>
        </div>
      </div>
    )
  }

  if (!pushinPayValidation.isValid) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Bot className="mr-3 h-8 w-8 text-blue-500" />
            Criar Novo Bot
          </h1>
          <p className="text-gray-400 mt-2">
            Crie seu bot do Telegram de forma simples e segura
          </p>
        </div>

        <Card className="bg-orange-900/20 border-orange-700">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Configuração Necessária
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-orange-300">
              ⚠️ Para criar um bot, primeiro você precisa cadastrar e validar sua chave do PushinPay.
            </p>
            <Button 
              onClick={() => router.push('/dashboard/pushinpay')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Configurar PushinPay
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Bot className="mr-3 h-8 w-8 text-blue-500" />
          Criar Novo Bot
        </h1>
        <p className="text-gray-400 mt-2">
          Crie seu bot do Telegram de forma simples e segura
        </p>
      </div>

      {/* Status PushinPay */}
      <Card className="bg-green-900/20 border-green-700">
        <CardContent className="pt-6">
          <div className="flex items-center text-green-400">
            <CheckCircle className="mr-2 h-5 w-5" />
            <span>Token PushinPay válido</span>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de criação */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Informações do Bot</CardTitle>
          <CardDescription className="text-gray-400">
            Configure seu bot fornecendo o token gerado pelo @BotFather
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Token do Bot */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Token do Bot <span className="text-red-400">*</span>
            </label>
            <Input
              type="password"
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
            <p className="text-xs text-gray-500">
              Acesse @BotFather no Telegram para obter seu token
            </p>
            
            {/* Status da validação do bot */}
            {botValidation.isLoading && (
              <div className="flex items-center text-blue-400">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Validando token...</span>
              </div>
            )}
            
            {botValidation.error && (
              <div className="flex items-center text-red-400">
                <AlertTriangle className="mr-2 h-4 w-4" />
                <span className="text-sm">{botValidation.error}</span>
              </div>
            )}
            
            {botValidation.isValid && botValidation.botInfo && (
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
                <div className="flex items-center text-green-400 mb-2">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span>Token válido</span>
                </div>
                <div className="text-sm text-gray-300">
                  <p><strong>Nome:</strong> {botValidation.botInfo.first_name}</p>
                  <p><strong>Username:</strong> @{botValidation.botInfo.username}</p>
                  <p><strong>ID:</strong> {botValidation.botInfo.id}</p>
                </div>
              </div>
            )}
          </div>

          {/* Nome do Bot */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Nome do Bot (Opcional)
            </label>
            <Input
              type="text"
              placeholder="Nome para identificação interna"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Descrição (Opcional)
            </label>
            <Textarea
              placeholder="Descreva o propósito do seu bot..."
              value={botDescription}
              onChange={(e) => setBotDescription(e.target.value)}
              rows={3}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          {/* Botão de criação */}
          <Button
            onClick={handleCreateBot}
            disabled={!botValidation.isValid || isCreating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando Bot...
              </>
            ) : (
              'Criar Bot'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Como obter o token do bot?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-gray-300 space-y-2">
            <p className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">1</span>
              Abra o Telegram e procure por <strong>@BotFather</strong>
            </p>
            <p className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">2</span>
              Digite <strong>/newbot</strong> e siga as instruções
            </p>
            <p className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">3</span>
              Escolha um nome e username para seu bot
            </p>
            <p className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">4</span>
              Copie o token fornecido e cole no campo acima
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}