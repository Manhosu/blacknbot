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

interface BotValidation {
  isValid: boolean
  isLoading: boolean
  error: string | null
  botInfo: any
}

export default function CreateBotPageFixed() {
  const router = useRouter()
  const { user } = useAuthStore()
  const supabase = createClient()

  // Estados do formulário
  const [botToken, setBotToken] = useState('')
  const [botName, setBotName] = useState('')
  const [botDescription, setBotDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Estados de validação
  const [botValidation, setBotValidation] = useState<BotValidation>({
    isValid: false,
    isLoading: false,
    error: null,
    botInfo: null
  })

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
    if (!botValidation.isValid) {
      return
    }

    setIsCreating(true)

    try {
      // Obter o usuário atual do Supabase diretamente
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !currentUser) {
        throw new Error('Usuário não está logado ou sessão expirou')
      }

      console.log('🔍 User do Zustand:', user)
      console.log('🔍 User do Supabase:', currentUser)

      // Verificar se o user_id existe na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('id', currentUser.id)
        .single()

      if (userError || !userData) {
        throw new Error('Usuário não encontrado na tabela users')
      }

      console.log('🔍 User data:', userData)

      // Dados mínimos obrigatórios
      const botData = {
        user_id: currentUser.id, // Usar o ID correto do Supabase Auth
        bot_token: botToken,
        bot_username: botValidation.botInfo.username,
        welcome_text: botName || botValidation.botInfo.first_name || 'Mensagem de boas-vindas'
      }

      console.log('🔍 Criando bot com dados:', botData)

      const { data, error } = await supabase
        .from('bots')
        .insert([botData])
        .select()
        .single()

      if (error) {
        console.error('❌ Erro Supabase:', error)
        throw error
      }

      console.log('✅ Bot criado:', data)

      alert('✅ Bot criado com sucesso!')
      router.push('/dashboard/bots')

    } catch (error: any) {
      console.error('❌ Erro completo:', error)
      
      let msg = '❌ Erro ao criar bot:\n\n'
      if (error.message) msg += `📋 ${error.message}\n`
      if (error.code) msg += `🔢 Código: ${error.code}\n`
      if (error.details) msg += `📝 ${error.details}\n`
      if (error.hint) msg += `💡 ${error.hint}\n`
      
      alert(msg)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Bot className="mr-3 h-8 w-8 text-blue-500" />
          Criar Novo Bot (Versão Corrigida)
        </h1>
        <p className="text-gray-400 mt-2">
          Versão simplificada para debug
        </p>
      </div>

      {/* Debug Info */}
      <Card className="bg-blue-900/20 border-blue-700">
        <CardContent className="pt-6">
          <div className="text-blue-300 text-sm space-y-1">
            <p><strong>User ID (Zustand):</strong> {user?.id || 'Não logado'}</p>
            <p><strong>User Email (Zustand):</strong> {user?.email || 'N/A'}</p>
            <p><strong>Bot Token Valid:</strong> {botValidation.isValid ? 'Sim' : 'Não'}</p>
            <p><strong>RLS Status:</strong> <span className="text-orange-400">DESABILITADO (DEV)</span></p>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de criação */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Informações do Bot</CardTitle>
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

          {/* Botão de criação */}
          <Button
            onClick={handleCreateBot}
            disabled={!botValidation.isValid || isCreating || !user?.id}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando Bot...
              </>
            ) : (
              'Criar Bot (Versão Simplificada)'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Voltar */}
      <Button
        onClick={() => router.push('/dashboard/bots')}
        variant="outline"
        className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
      >
        ← Voltar para Bots
      </Button>
    </div>
  )
} 