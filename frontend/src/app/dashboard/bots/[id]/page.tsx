'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Bot, 
  ArrowLeft, 
  Settings, 
  BarChart3, 
  Users, 
  CreditCard, 
  Copy,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Play,
  Pause,
  MessageSquare,
  Save,
  Edit
} from "lucide-react"
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface BotData {
  id: string
  bot_token: string
  bot_username: string
  welcome_text: string
  media_url: string | null
  media_type: 'photo' | 'video' | null
  vip_chat_id: string | null
  vip_group_id: string | null
  vip_type: 'group' | 'channel' | null
  vip_name: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface PlanData {
  id: string
  name: string
  price: number
  duration_days: number
  created_at: string
}

interface SaleData {
  id: string
  user_telegram_id: string
  status: string
  amount_received: number | null
  created_at: string
}

interface BotStats {
  plansCount: number
  salesCount: number
  totalRevenue: number
  activePlans: number
  recentSales: any[]
}

export default function BotDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuthStore()
  const botId = params.id as string
  const supabase = createClient()
  
  const [bot, setBot] = useState<BotData | null>(null)
  const [plans, setPlans] = useState<PlanData[]>([])
  const [sales, setSales] = useState<SaleData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedText, setCopiedText] = useState('')
  const [stats, setStats] = useState<BotStats>({
    plansCount: 0,
    salesCount: 0,
    totalRevenue: 0,
    activePlans: 0,
    recentSales: []
  })
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    bot_username: '',
    vip_chat_id: '',
    vip_group_id: ''
  })
  const [chatInput, setChatInput] = useState('')
  const [chatType, setChatType] = useState<'group' | 'channel'>('group')
  const [activatingChat, setActivatingChat] = useState(false)

  useEffect(() => {
    if (user && botId) {
      loadBotData()
    }
  }, [user, botId])

  // Verificar periodicamente se o chat VIP foi configurado (apenas se não estiver configurado)
  useEffect(() => {
    if (!bot?.vip_chat_id) {
      const interval = setInterval(() => {
        loadBotData()
      }, 10000) // Verificar a cada 10 segundos

      return () => clearInterval(interval)
    }
  }, [bot?.vip_chat_id])

  const loadBotData = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      
      // Buscar dados do bot
      console.log('Carregando bot com ID:', botId)
      const { data: botData, error: botError } = await supabase
        .from('bots')
        .select('*')
        .eq('id', botId)
        .single()
      
      console.log('Resposta do bot:', { botData, botError })

      if (botError) throw botError
      if (!botData) throw new Error('Bot não encontrado')

      setBot(botData)
      setEditData({
        bot_username: botData.bot_username,
        vip_chat_id: botData.vip_chat_id || '',
        vip_group_id: botData.vip_group_id || ''
      })
      
      // Definir o tipo de chat baseado nos dados existentes
      if (botData.vip_type) {
        setChatType(botData.vip_type as 'group' | 'channel')
      }

      // Buscar planos
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .eq('bot_id', botId)
        .order('created_at', { ascending: false })

      if (plansError) throw plansError
      setPlans(plansData || [])

      // Buscar vendas
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('bot_id', botId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (salesError) throw salesError
      setSales(salesData || [])

      await loadStats(botData.id)
    } catch (error: any) {
      console.error('Erro ao carregar dados do bot:', error)
      setError('Erro ao carregar dados do bot. Verifique se você tem acesso a este bot.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async (botId: string) => {
    const supabase = createClient()
    try {
      // Carregar estatísticas
      const [plansResult, salesResult] = await Promise.all([
        supabase.from('plans').select('*').eq('bot_id', botId),
        supabase.from('sales').select('*, plans(name, price)').eq('bot_id', botId).order('created_at', { ascending: false }).limit(10)
      ])

      const plans = plansResult.data || []
      const sales = salesResult.data || []

      const totalRevenue = sales
        .filter(sale => sale.status === 'paid')
        .reduce((sum, sale) => sum + (sale.plans?.price || 0), 0)

      const activePlans = sales.filter(sale => 
        sale.status === 'paid' && 
        new Date(sale.created_at).getTime() + (30 * 24 * 60 * 60 * 1000) > Date.now()
      ).length

      setStats({
        plansCount: plans.length,
        salesCount: sales.length,
        totalRevenue,
        activePlans,
        recentSales: sales.slice(0, 5)
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(label)
      setTimeout(() => setCopiedText(''), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  const getTotalRevenue = () => {
    return sales
      .filter(sale => sale.status === 'paid')
      .reduce((total, sale) => total + (sale.amount_received || 0), 0)
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'paid': { label: 'Pago', className: 'bg-green-900 text-green-300' },
      'pending': { label: 'Pendente', className: 'bg-yellow-900 text-yellow-300' },
      'cancelled': { label: 'Cancelado', className: 'bg-red-900 text-red-300' },
      'expired': { label: 'Expirado', className: 'bg-gray-700 text-gray-300' }
    }
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || 
      { label: status, className: 'bg-gray-700 text-gray-300' }
    
    return (
      <Badge className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    )
  }

  const toggleBotStatus = async () => {
    if (!bot) return

    setSaving(true)
    try {
      const newStatus = !bot.is_active
      
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('bots')
        .update({ is_active: newStatus })
        .eq('id', bot.id)

      if (error) throw error

      // Atualizar o estado local
      setBot(prev => prev ? { ...prev, is_active: newStatus } : null)
      
      // Forçar reload dos dados para garantir sincronização
      await loadBotData()
      
      // Usar toast ao invés de alert
      toast.success(`Bot ${bot.is_active ? 'desativado' : 'ativado'} com sucesso!`)
    } catch (error) {
      console.error('Erro ao alterar status do bot:', error)
      toast.error('Erro ao alterar status do bot.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!bot) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('bots')
        .update({
          bot_username: editData.bot_username,
          vip_group_id: editData.vip_group_id || null
        })
        .eq('id', bot.id)

      if (error) throw error

      setBot(prev => prev ? {
        ...prev,
        bot_username: editData.bot_username,
        vip_group_id: editData.vip_group_id || null
      } : null)
      
      setIsEditing(false)
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações.')
    } finally {
      setSaving(false)
    }
  }

  const extractChatId = (input: string): string => {
    const trimmed = input.trim()
    
    // Se já é um ID numérico
    if (/^-?\d+$/.test(trimmed)) {
      return trimmed
    }
    
    // Link público: https://t.me/grupovip ou https://t.me/canal
    if (trimmed.includes('t.me/') && !trimmed.includes('+')) {
      const match = trimmed.match(/t\.me\/([^/?]+)/)
      return match ? `@${match[1]}` : trimmed
    }
    
    // Link privado: https://t.me/+codigo ou t.me/joinchat/codigo
    if (trimmed.includes('t.me/+') || trimmed.includes('joinchat/')) {
      return trimmed // Manter o link completo para links privados
    }
    
    // Username direto
    if (trimmed.startsWith('@')) {
      return trimmed
    }
    
    return `@${trimmed}`
  }

  const handleActivateChat = async () => {
    if (!chatInput.trim()) {
      setError(`Insira o link ou ID do ${chatType === 'group' ? 'grupo' : 'canal'}`)
      return
    }

    setActivatingChat(true)
    setError('')

    try {
      // Usar sessão do Supabase para autenticação
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Usuário não autenticado')
      }

      const chatId = extractChatId(chatInput)

      const response = await fetch(`/api/dashboard/bots/${botId}/activate-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_input: chatInput,
          chat_id: chatId,
          chat_type: chatType
        })
      })

      const data = await response.json()

      if (response.ok) {
        setChatInput('')
        await loadBotData() // Recarregar dados do bot
        
        let successMessage = data.message || 'Chat VIP ativado com sucesso!'
        
        // Verificar se houve auto-correção do tipo
        if (data.actualType && data.actualType !== chatType) {
          const correctedType = data.actualType === 'channel' ? 'Canal' : 'Grupo'
          const originalType = chatType === 'channel' ? 'Canal' : 'Grupo'
          successMessage += `\n\n🔄 Tipo corrigido automaticamente: ${originalType} → ${correctedType}`
        }
        
        if (data.messageSent) {
          successMessage += '\n📨 Mensagem de confirmação enviada!'
          toast.success(successMessage)
        } else {
          successMessage += '\n⚠️ Mensagem não pôde ser enviada (verifique permissões)'
          toast.success(successMessage)
        }
      } else {
        throw new Error(data.detail || data.error || `Erro ao ativar ${chatType === 'group' ? 'grupo' : 'canal'}`)
      }
    } catch (error: any) {
      console.error('Erro ao ativar chat:', error)
      const chatTypeText = chatType === 'group' ? 'grupo' : 'canal'
      const errorMessage = error.message || `⚠️ Erro ao ativar ${chatTypeText}. Verifique se o bot é administrador.`
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setActivatingChat(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando dados do bot...</p>
        </div>
      </div>
    )
  }

  if (error || !bot) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => router.push('/dashboard/bots')} className="bg-blue-600 hover:bg-blue-700">
            Voltar para Meus Bots
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/bots">
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Bot className="mr-3 h-8 w-8 text-blue-500" />
              @{bot.bot_username}
            </h1>
            <p className="text-gray-400 mt-1">
              Gerencie as configurações e monitore a performance do seu bot
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={bot.is_active ? "default" : "secondary"} className={
            bot.is_active ? "bg-green-600 text-white" : "bg-gray-600 text-gray-300"
          }>
            {bot.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
          <Button
            onClick={toggleBotStatus}
            disabled={saving}
            variant={bot.is_active ? "destructive" : "default"}
          >
            {bot.is_active ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                {saving ? 'Desativando...' : 'Desativar Bot'}
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                {saving ? 'Ativando...' : 'Ativar Bot'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Planos Criados</p>
                <p className="text-2xl font-bold text-white">{stats.plansCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Vendas</p>
                <p className="text-2xl font-bold text-white">{stats.salesCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Assinantes Ativos</p>
                <p className="text-2xl font-bold text-white">{stats.activePlans}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 text-yellow-500 flex items-center justify-center text-lg font-bold">
                R$
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Receita Total</p>
                <p className="text-2xl font-bold text-white">{formatPrice(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aviso de Ativação do Chat VIP */}
      {!bot.vip_chat_id && (
        <Card className="bg-orange-900/20 border-orange-600">
          <CardHeader>
            <CardTitle className="text-orange-300 flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              Ative seu Bot para Começar a Receber Pagamentos
            </CardTitle>
            <CardDescription className="text-orange-200">
              Configure o grupo ou canal VIP para que os usuários pagantes sejam adicionados automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-orange-800/20 p-4 rounded-lg border border-orange-600">
              <h4 className="font-medium text-orange-200 mb-3">📋 Instruções de Ativação:</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-orange-100">Crie um grupo ou canal no Telegram</p>
                    <p className="text-sm text-orange-200">
                      Crie um novo grupo/canal ou use um existente que será o VIP
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-orange-100">Adicione o bot como administrador</p>
                    <p className="text-sm text-orange-200">
                      Adicione <code className="bg-orange-700 px-1 rounded text-orange-100">@{bot.bot_username}</code> ao grupo/canal e promova como administrador
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-orange-100">Ativar o grupo/canal via painel</p>
                    <p className="text-sm text-orange-200">
                      Cole o link ou ID do grupo/canal no formulário abaixo e clique em "Ativar"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulário de Ativação */}
            <div className="bg-gray-800/20 p-4 rounded-lg border border-gray-600">
              <h4 className="font-medium text-gray-200 mb-3">🔗 Ativar Chat VIP:</h4>
              
              <div className="space-y-4">
                {/* Seletor de Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Chat:
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="chatType"
                        value="group"
                        checked={chatType === 'group'}
                        onChange={(e) => setChatType(e.target.value as 'group' | 'channel')}
                        className="mr-2 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                        disabled={activatingChat}
                      />
                      <span className="text-gray-300">📱 Grupo</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="chatType"
                        value="channel"
                        checked={chatType === 'channel'}
                        onChange={(e) => setChatType(e.target.value as 'group' | 'channel')}
                        className="mr-2 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                        disabled={activatingChat}
                      />
                      <span className="text-gray-300">📢 Canal</span>
                    </label>
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {chatType === 'group' 
                      ? 'Grupos permitem discussões entre membros'
                      : 'Canais são ideais para transmitir informações'
                    }
                  </div>
                </div>

                {/* Input do Chat */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Link ou ID do {chatType === 'group' ? 'Grupo' : 'Canal'} VIP:
                  </label>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={chatType === 'group' 
                      ? "https://t.me/meugrupo ou @meugrupo"
                      : "https://t.me/meucanal ou @meucanal"
                    }
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={activatingChat}
                  />
                  <div className="mt-2 text-xs text-gray-400 space-y-1">
                    <div><strong>Formatos aceitos:</strong></div>
                    <div>• Link: https://t.me/{chatType === 'group' ? 'nomegrupo' : 'nomecanal'}</div>
                    <div>• Username: @{chatType === 'group' ? 'nomegrupo' : 'nomecanal'}</div>
                    <div>• ID: -100XXXXXXXXXX (apenas se você souber o ID exato)</div>
                    
                    <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-600 rounded text-yellow-200">
                      <div className="text-xs font-medium">⚠️ Passo a passo:</div>
                      <div className="text-xs">1. Crie um {chatType === 'group' ? 'grupo' : 'canal'} no Telegram</div>
                      <div className="text-xs">2. Adicione @{bot?.bot_username} ao {chatType === 'group' ? 'grupo' : 'canal'}</div>
                      <div className="text-xs">3. Promova o bot como administrador (com permissão para convidar)</div>
                      <div className="text-xs">4. Copie o link do {chatType === 'group' ? 'grupo' : 'canal'} e cole aqui</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleActivateChat}
                  disabled={activatingChat || !chatInput.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  {activatingChat ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verificando...
                    </div>
                  ) : (
                    `Ativar ${chatType === 'group' ? 'Grupo' : 'Canal'} VIP`
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-600">
              <h4 className="font-medium text-blue-200 mb-2 flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Após a ativação, você poderá:
              </h4>
              <ul className="text-sm text-blue-200 space-y-1">
                <li>• Personalizar a mensagem de boas-vindas do /start</li>
                <li>• Criar e gerenciar planos de assinatura</li>
                <li>• Receber pagamentos automaticamente</li>
                <li>• Adicionar usuários pagantes ao grupo/canal VIP automaticamente</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat VIP Ativado */}
      {bot.vip_chat_id && (
        <Card className="bg-green-900/20 border-green-600">
          <CardHeader>
            <CardTitle className="text-green-300 flex items-center">
              <CheckCircle className="mr-2 h-5 w-5" />
              {bot.vip_type === 'channel' ? '📢 Canal' : '📱 Grupo'} VIP Ativado
            </CardTitle>
            <CardDescription className="text-green-200">
              Seu bot está configurado e pronto para receber pagamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div>
                  <p className="text-green-200">
                    <strong>Tipo:</strong> <span className="text-green-100">{bot.vip_type === 'channel' ? 'Canal' : 'Grupo'}</span>
                  </p>
                  <p className="text-green-200">
                    <strong>ID:</strong> <code className="bg-green-700/50 px-2 py-1 rounded">{bot.vip_chat_id}</code>
                  </p>
                  {bot.vip_name && (
                    <p className="text-green-200">
                      <strong>Nome:</strong> <span className="text-green-100">{bot.vip_name}</span>
                    </p>
                  )}
                </div>
                <p className="text-sm text-green-300">
                  Usuários pagantes serão adicionados automaticamente a este {bot.vip_type === 'channel' ? 'canal' : 'grupo'}
                </p>
              </div>
              <Badge className="bg-green-600 text-white">
                Ativo
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configurações do Bot */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Configurações do Bot</CardTitle>
              <CardDescription className="text-gray-400">
                Configure as informações básicas do seu bot
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Edit className="mr-2 h-4 w-4" />
              {isEditing ? 'Cancelar' : 'Editar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">
                Username do Bot
              </label>
              {isEditing ? (
                <Input
                  value={editData.bot_username}
                  onChange={(e) => setEditData(prev => ({ ...prev, bot_username: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="username_do_bot"
                />
              ) : (
                <p className="text-gray-400 bg-gray-800 p-3 rounded border border-gray-600">
                  @{bot.bot_username}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">
                ID do Chat VIP
              </label>
              {isEditing ? (
                <Input
                  value={editData.vip_chat_id}
                  onChange={(e) => setEditData(prev => ({ ...prev, vip_chat_id: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="-1001234567890"
                />
              ) : (
                <p className="text-gray-400 bg-gray-800 p-3 rounded border border-gray-600">
                  {bot.vip_chat_id || 'Não configurado'}
                </p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex space-x-2 pt-4">
              <Button onClick={handleSaveChanges} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ações Rápidas */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Ações Rápidas</CardTitle>
            <CardDescription className="text-gray-400">
              Configure seu bot rapidamente
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            {/* Só liberado após ativação do grupo VIP */}
            {bot.vip_group_id ? (
              <>
                <Link href="/dashboard/bots/welcome">
                  <Button variant="outline" className="w-full justify-start bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700">
                    <MessageSquare className="mr-3 h-5 w-5" />
                    Configurar Mensagem de Boas-vindas
                  </Button>
                </Link>
                
                <Link href="/dashboard/bots/plans">
                  <Button variant="outline" className="w-full justify-start bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700">
                    <CreditCard className="mr-3 h-5 w-5" />
                    Gerenciar Planos de Assinatura
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button 
                  disabled 
                  variant="outline" 
                  className="w-full justify-start bg-gray-800/50 border-gray-600 text-gray-500 cursor-not-allowed"
                  title="Ative o grupo VIP primeiro"
                >
                  <MessageSquare className="mr-3 h-5 w-5" />
                  Configurar Mensagem de Boas-vindas
                  <AlertCircle className="ml-auto h-4 w-4" />
                </Button>
                
                <Button 
                  disabled 
                  variant="outline" 
                  className="w-full justify-start bg-gray-800/50 border-gray-600 text-gray-500 cursor-not-allowed"
                  title="Ative o grupo VIP primeiro"
                >
                  <CreditCard className="mr-3 h-5 w-5" />
                  Gerenciar Planos de Assinatura
                  <AlertCircle className="ml-auto h-4 w-4" />
                </Button>
              </>
            )}

            {/* Sempre disponível */}
            <Link href="/dashboard/sales">
              <Button variant="outline" className="w-full justify-start bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700">
                <BarChart3 className="mr-3 h-5 w-5" />
                Ver Relatório de Vendas
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Vendas Recentes */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Vendas Recentes</CardTitle>
            <CardDescription className="text-gray-400">
              Últimas 5 vendas deste bot
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentSales.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhuma venda ainda</p>
            ) : (
              <div className="space-y-3">
                {stats.recentSales.map((sale, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700">
                    <div>
                      <p className="text-white text-sm font-medium">
                        {sale.plans?.name || 'Plano removido'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {formatDate(sale.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        {formatPrice(sale.plans?.price || 0)}
                      </p>
                      <Badge 
                        variant={sale.status === 'paid' ? 'default' : 'secondary'}
                        className={`text-xs ${
                          sale.status === 'paid' 
                            ? 'bg-green-600 text-white' 
                            : sale.status === 'pending'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {sale.status === 'paid' ? 'Pago' : 
                         sale.status === 'pending' ? 'Pendente' : 
                         sale.status === 'cancelled' ? 'Cancelado' : 'Expirado'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 