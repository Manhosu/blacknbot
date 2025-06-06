'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { RefreshCw, Send, Search, MessageSquare, AlertTriangle, CheckCircle, Clock, Users, Shield, Crown, Calendar, Trash2, Settings } from 'lucide-react'

interface Sale {
  id: string
  user_telegram_id: string
  status: 'pending' | 'paid' | 'cancelled' | 'expired'
  created_at: string
  updated_at: string
  plans: {
    name: string
    price: number
    duration_days: number
  }
}

interface Bot {
  id: string
  name: string
  username: string
  telegram_chat_id?: string
  vip_chat_id?: string
  vip_type?: string
  vip_name?: string
}

interface TelegramGroup {
  id: string
  name: string
  telegram_chat_id: string
  type: 'group' | 'channel'
  member_count: number
  is_active: boolean
  created_at: string
}

interface GroupMember {
  user_telegram_id: string
  first_name?: string
  last_name?: string
  username?: string
  status: 'creator' | 'administrator' | 'member' | 'restricted' | 'left' | 'kicked'
  joined_at: string
  subscription_status: 'paid' | 'expiring_soon' | 'about_to_expire' | 'expired' | 'no_subscription'
  last_payment_date?: string
  days_until_expiry?: number
  latest_sale?: Sale
}

interface RemarketingData {
  user_telegram_id: string
  latest_sale: Sale
  status: 'paid' | 'expiring_soon' | 'about_to_expire' | 'expired'
  days_until_expiry?: number
  last_payment_date: string
}

export default function RemarketingPage() {
  const [bot, setBot] = useState<Bot | null>(null)
  const [users, setUsers] = useState<RemarketingData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<RemarketingData[]>([])
  const [groups, setGroups] = useState<TelegramGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<TelegramGroup | null>(null)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [memberSearchTerm, setMemberSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [memberStatusFilter, setMemberStatusFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState('members')
  const [remarketingSettings, setRemarketingSettings] = useState({
    beforeExpiryMessage: '🚨 Sua assinatura expira em {days} dia(s)!\n\nRenove agora para não perder o acesso ao conteúdo VIP.',
    expiredMessage: '⚠️ Sua assinatura expirou.\n\nRenove agora para voltar a ter acesso ao conteúdo exclusivo!',
    autoRemoveAfterDays: 2,
    enableAutoRemove: true
  })
  const { user } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadBotAndUsers()
      loadGroups()
    }
  }, [user])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, statusFilter])

  useEffect(() => {
    filterMembers()
  }, [groupMembers, memberSearchTerm, memberStatusFilter])

  useEffect(() => {
    if (selectedGroup) {
      loadGroupMembers(selectedGroup.telegram_chat_id)
    }
  }, [selectedGroup])

  const loadBotAndUsers = async () => {
    setLoading(true)
    try {
      if (!user?.id) {
        console.warn('Usuário não encontrado ou não autenticado')
        setBot(null)
        setUsers([])
        return
      }

      // Carregar bot do usuário (usar primeira consulta para verificar se existem bots)
      const { data: botsData, error: botsError } = await supabase
        .from('bots')
        .select('id, bot_username, vip_chat_id, vip_type, vip_name')
        .eq('user_id', user.id)
        .limit(1)

      if (botsError) {
        console.error('Erro ao carregar bots:', botsError)
        setBot(null)
        setUsers([])
        return
      }

      if (!botsData || botsData.length === 0) {
        console.warn('Nenhum bot encontrado para este usuário')
        setBot(null)
        setUsers([])
        return
      }

      const botData = botsData[0]
      const botFormatted = {
        id: botData.id,
        name: botData.bot_username || 'Bot',
        username: botData.bot_username || '',
        telegram_chat_id: botData.vip_chat_id || undefined
      }
      
      setBot(botFormatted)
      
      // Carregar vendas pagas do bot
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select(`
          id,
          user_telegram_id,
          status,
          created_at,
          updated_at,
          plans (
            name,
            price,
            duration_days
          )
        `)
        .eq('bot_id', botData.id)
        .eq('status', 'paid')
        .order('created_at', { ascending: false })

      if (salesError) {
        console.error('Erro ao carregar vendas:', salesError)
        setUsers([])
        return
      }
      
      // Converter dados do Supabase para o formato esperado
      const convertedSalesData: Sale[] = (salesData || []).map(sale => ({
        id: sale.id,
        user_telegram_id: sale.user_telegram_id,
        status: sale.status,
        created_at: sale.created_at,
        updated_at: sale.updated_at,
        plans: Array.isArray(sale.plans) ? sale.plans[0] : sale.plans
      })).filter(sale => sale.plans) // Filtrar vendas sem planos
      
      const processedUsers = processSalesData(convertedSalesData)
      setUsers(processedUsers)
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setBot(null)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const loadGroups = async () => {
    try {
      if (!bot?.id) {
        console.warn('Bot não encontrado ou ID inválido')
        setGroups([])
        return
      }

      // Primeiro, verificar se a tabela telegram_groups existe
      // Se não existir, usar dados do próprio bot
      const { data: groupsData, error: groupsError } = await supabase
        .from('bots')
        .select('id, bot_username, vip_chat_id, vip_type, vip_name')
        .eq('id', bot.id)
        .single()

      if (groupsError) {
        console.error('Erro ao carregar dados do bot:', groupsError)
        setGroups([])
        return
      }

      // Se o bot tem um grupo/canal VIP configurado, adicionar à lista
      const groups: TelegramGroup[] = []
      if (groupsData.vip_chat_id && groupsData.vip_name) {
        groups.push({
          id: `bot_${groupsData.id}`,
          name: groupsData.vip_name,
          telegram_chat_id: groupsData.vip_chat_id,
          type: groupsData.vip_type === 'channel' ? 'channel' : 'group',
          member_count: 0, // Será atualizado quando carregar membros
          is_active: true,
          created_at: new Date().toISOString()
        })
      }
      
      setGroups(groups)
    } catch (error) {
      console.error('Erro ao carregar grupos:', error)
      setGroups([])
    }
  }

  const loadGroupMembers = async (groupChatId: string) => {
    setLoadingMembers(true)
    try {
      if (!bot?.id) {
        console.warn('Bot não encontrado para carregar membros')
        setGroupMembers([])
        return
      }

      // Para desenvolvimento, vamos carregar membros baseado nas vendas
      // Em produção, isso seria substituído pela API do Telegram
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select(`
          user_telegram_id,
          status,
          created_at,
          updated_at,
          plans (
            name,
            price,
            duration_days
          )
        `)
        .eq('bot_id', bot.id)
        .order('created_at', { ascending: false })

      if (salesError) {
        console.error('Erro ao carregar vendas:', salesError)
        setGroupMembers([])
        return
      }

      // Criar membros simulados baseados nas vendas
      const mockMembers = (salesData || []).map(sale => ({
        user: {
          id: parseInt(sale.user_telegram_id),
          first_name: `User${sale.user_telegram_id.slice(-3)}`,
          last_name: '',
          username: `user${sale.user_telegram_id.slice(-3)}`,
        },
        status: 'member',
        joined_at: sale.created_at
      }))

      // Processar membros com dados de assinatura
      const processedMembers = await processGroupMembers(mockMembers)
      setGroupMembers(processedMembers)
    } catch (error) {
      console.error('Erro ao carregar membros:', error)
      setGroupMembers([])
      // Removido alert para não interromper a experiência do usuário
    } finally {
      setLoadingMembers(false)
    }
  }

  const processGroupMembers = async (telegramMembers: any[]): Promise<GroupMember[]> => {
    const memberMap = new Map<string, GroupMember>()
    
    // Processar cada membro
    for (const member of telegramMembers) {
      const userId = member.user.id.toString()
      
      // Buscar dados de assinatura do usuário
      const { data: salesData } = await supabase
        .from('sales')
        .select(`
          *,
          plans (
            name,
            price,
            duration_days
          )
        `)
        .eq('bot_id', bot?.id)
        .eq('user_telegram_id', userId)
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(1)

      const latestSale = salesData?.[0]
      let subscriptionStatus: GroupMember['subscription_status'] = 'no_subscription'
      let daysUntilExpiry: number | undefined
      let lastPaymentDate: string | undefined

      if (latestSale) {
        const paymentDate = new Date(latestSale.updated_at)
        const expiryDate = new Date(paymentDate.getTime() + (latestSale.plans.duration_days * 24 * 60 * 60 * 1000))
        const now = new Date()
        daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        lastPaymentDate = latestSale.updated_at

        if (daysUntilExpiry > 3) {
          subscriptionStatus = 'paid'
        } else if (daysUntilExpiry > 0) {
          subscriptionStatus = daysUntilExpiry === 1 ? 'about_to_expire' : 'expiring_soon'
        } else {
          subscriptionStatus = 'expired'
        }
      }

      memberMap.set(userId, {
        user_telegram_id: userId,
        first_name: member.user.first_name,
        last_name: member.user.last_name,
        username: member.user.username,
        status: member.status,
        joined_at: member.joined_at || new Date().toISOString(),
        subscription_status: subscriptionStatus,
        last_payment_date: lastPaymentDate,
        days_until_expiry: daysUntilExpiry,
        latest_sale: latestSale
      })
    }

    return Array.from(memberMap.values()).sort((a, b) => {
      // Ordenar: admin primeiro, depois por status de assinatura
      if (a.status === 'creator' && b.status !== 'creator') return -1
      if (b.status === 'creator' && a.status !== 'creator') return 1
      if (a.status === 'administrator' && b.status !== 'administrator') return -1
      if (b.status === 'administrator' && a.status !== 'administrator') return 1
      
      // Depois por status de assinatura
      const statusOrder = { expired: 0, about_to_expire: 1, expiring_soon: 2, paid: 3, no_subscription: 4 }
      return statusOrder[a.subscription_status] - statusOrder[b.subscription_status]
    })
  }

  const processSalesData = (salesData: Sale[]): RemarketingData[] => {
    const userMap = new Map<string, Sale>()
    
    // Pegar a venda mais recente de cada usuário
    salesData.forEach(sale => {
      const existing = userMap.get(sale.user_telegram_id)
      if (!existing || new Date(sale.created_at) > new Date(existing.created_at)) {
        userMap.set(sale.user_telegram_id, sale)
      }
    })

    const now = new Date()
    const users: RemarketingData[] = []

    userMap.forEach(sale => {
      const paymentDate = new Date(sale.updated_at)
      const expiryDate = new Date(paymentDate.getTime() + (sale.plans.duration_days * 24 * 60 * 60 * 1000))
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))

      let status: RemarketingData['status']
      if (daysUntilExpiry > 3) {
        status = 'paid'
      } else if (daysUntilExpiry > 0) {
        status = daysUntilExpiry === 1 ? 'about_to_expire' : 'expiring_soon'
      } else {
        status = 'expired'
      }

      users.push({
        user_telegram_id: sale.user_telegram_id,
        latest_sale: sale,
        status,
        days_until_expiry: daysUntilExpiry,
        last_payment_date: sale.updated_at
      })
    })

    return users.sort((a, b) => {
      // Priorizar usuários que estão expirando ou expirados
      if (a.status === 'expired' && b.status !== 'expired') return -1
      if (b.status === 'expired' && a.status !== 'expired') return 1
      if (a.status === 'about_to_expire' && b.status !== 'about_to_expire') return -1
      if (b.status === 'about_to_expire' && a.status !== 'about_to_expire') return 1
      if (a.status === 'expiring_soon' && b.status !== 'expiring_soon') return -1
      if (b.status === 'expiring_soon' && a.status !== 'expiring_soon') return 1
      
      return new Date(b.last_payment_date).getTime() - new Date(a.last_payment_date).getTime()
    })
  }

  const filterUsers = () => {
    let filtered = users

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.user_telegram_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.latest_sale.plans.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  const filterMembers = () => {
    let filtered = groupMembers

    // Filtrar por termo de busca
    if (memberSearchTerm) {
      filtered = filtered.filter(member =>
        member.user_telegram_id.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
        member.first_name?.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
        member.last_name?.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
        member.username?.toLowerCase().includes(memberSearchTerm.toLowerCase())
      )
    }

    // Filtrar por status
    if (memberStatusFilter !== 'all') {
      filtered = filtered.filter(member => member.subscription_status === memberStatusFilter)
    }

    setFilteredMembers(filtered)
  }

  const getStatusBadge = (userData: RemarketingData) => {
    const configs = {
      paid: { variant: 'default' as const, label: 'Ativo', icon: CheckCircle },
      expiring_soon: { variant: 'secondary' as const, label: `Expira em ${userData.days_until_expiry} dias`, icon: Clock },
      about_to_expire: { variant: 'destructive' as const, label: 'Expira amanhã', icon: AlertTriangle },
      expired: { variant: 'outline' as const, label: `Expirado há ${Math.abs(userData.days_until_expiry || 0)} dias`, icon: AlertTriangle }
    }
    
    const config = configs[userData.status]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getMemberStatusBadge = (member: GroupMember) => {
    const configs = {
      paid: { variant: 'default' as const, label: 'Ativo', icon: CheckCircle, color: 'text-green-400' },
      expiring_soon: { variant: 'secondary' as const, label: `Expira em ${member.days_until_expiry} dias`, icon: Clock, color: 'text-orange-400' },
      about_to_expire: { variant: 'destructive' as const, label: 'Expira amanhã', icon: AlertTriangle, color: 'text-red-400' },
      expired: { variant: 'outline' as const, label: `Expirado há ${Math.abs(member.days_until_expiry || 0)} dias`, icon: AlertTriangle, color: 'text-gray-400' },
      no_subscription: { variant: 'outline' as const, label: 'Sem assinatura', icon: AlertTriangle, color: 'text-gray-500' }
    }
    
    const config = configs[member.subscription_status]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getMemberRoleBadge = (status: string) => {
    const configs = {
      creator: { label: 'Criador', icon: Crown, color: 'bg-yellow-600' },
      administrator: { label: 'Admin', icon: Shield, color: 'bg-blue-600' },
      member: { label: 'Membro', icon: Users, color: 'bg-gray-600' },
      restricted: { label: 'Restrito', icon: AlertTriangle, color: 'bg-red-600' },
      left: { label: 'Saiu', icon: AlertTriangle, color: 'bg-gray-500' },
      kicked: { label: 'Removido', icon: Trash2, color: 'bg-red-700' }
    }
    
    const config = configs[status as keyof typeof configs] || configs.member
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const handleRemoveMember = async (member: GroupMember) => {
    if (!confirm(`Tem certeza que deseja remover ${member.first_name || member.user_telegram_id} do grupo?`)) {
      return
    }

    try {
      // Simulação para desenvolvimento - em produção seria uma chamada real para a API
      console.log('Simulando remoção de membro:', {
        bot_id: bot?.id,
        chat_id: selectedGroup?.telegram_chat_id,
        user_id: member.user_telegram_id
      })

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Remover o membro da lista local (simulação)
      setGroupMembers(prev => prev.filter(m => m.user_telegram_id !== member.user_telegram_id))
      
      console.log('Membro removido com sucesso (simulação)')
    } catch (error) {
      console.error('Erro ao remover membro:', error)
    }
  }

  const handleSendRemarketingToMember = async (member: GroupMember) => {
    const message = member.subscription_status === 'about_to_expire' 
      ? remarketingSettings.beforeExpiryMessage.replace('{days}', '1')
      : member.subscription_status === 'expired'
      ? remarketingSettings.expiredMessage
      : 'Renovar assinatura para continuar no grupo'

    try {
      // Simulação para desenvolvimento - em produção seria uma chamada real para a API
      console.log('Simulando envio de mensagem de remarketing:', {
        bot_id: bot?.id,
        user_telegram_id: member.user_telegram_id,
        message: message
      })

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800))

      console.log('Mensagem de remarketing enviada com sucesso (simulação)')
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  const processAutomaticRemarketing = async () => {
    // Esta função será chamada automaticamente pelo backend
    // Aqui apenas mostramos como seria implementada
    const membersToProcess = groupMembers.filter(member => 
      member.subscription_status === 'about_to_expire' || 
      member.subscription_status === 'expired'
    )

    for (const member of membersToProcess) {
      // Verificar se deve enviar mensagem ou remover
      if (member.subscription_status === 'expired' && 
          member.days_until_expiry && 
          Math.abs(member.days_until_expiry) >= remarketingSettings.autoRemoveAfterDays &&
          remarketingSettings.enableAutoRemove) {
        await handleRemoveMember(member)
      } else {
        await handleSendRemarketingToMember(member)
      }
    }
  }

  const handleSendMessage = async () => {
    if (!selectedUser || !message.trim()) {
      console.warn('Selecione um usuário e digite uma mensagem')
      return
    }

    setSending(true)
    try {
      // Simulação para desenvolvimento - em produção seria uma chamada real para a API
      console.log('Simulando envio de mensagem individual:', {
        bot_id: bot?.id,
        user_telegram_id: selectedUser,
        message: message
      })

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1200))

      console.log('Mensagem enviada com sucesso (simulação)')
      setMessage('')
      setSelectedUser(null)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setSending(false)
    }
  }

  const getAutomaticRemarketingMessage = (userData: RemarketingData) => {
    const { status, latest_sale } = userData
    const planName = latest_sale.plans.name
    
    switch (status) {
      case 'about_to_expire':
        return `🚨 Sua assinatura do ${planName} expira amanhã!\n\nRenove agora para não perder o acesso ao conteúdo VIP.`
      case 'expired':
        return `⚠️ Sua assinatura do ${planName} expirou.\n\nRenove agora para voltar a ter acesso ao conteúdo exclusivo!`
      default:
        return `👋 Olá! Que tal renovar sua assinatura do ${planName}?\n\nContinue aproveitando nosso conteúdo exclusivo!`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Remarketing Avançado</h1>
        <p className="text-gray-400 mt-2">
          Gerencie campanhas de remarketing para usuários com assinatura vencendo ou vencida. Sistema automático com remoção inteligente.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
          <TabsTrigger value="members" className="text-white data-[state=active]:bg-blue-600">
            <Users className="mr-2 h-4 w-4" />
            Membros dos Grupos
          </TabsTrigger>
          <TabsTrigger value="individual" className="text-white data-[state=active]:bg-blue-600">
            <MessageSquare className="mr-2 h-4 w-4" />
            Remarketing Individual
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-white data-[state=active]:bg-blue-600">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          {/* Seleção de Grupo */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Selecionar Grupo ou Canal
              </CardTitle>
              <CardDescription className="text-gray-400">
                Escolha um grupo ou canal para gerenciar os membros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <Card 
                    key={group.id}
                    className={`cursor-pointer transition-all ${selectedGroup?.id === group.id 
                      ? 'border-blue-500 bg-blue-900/20' 
                      : 'border-gray-600 hover:border-gray-500 bg-gray-700'
                    }`}
                    onClick={() => setSelectedGroup(group)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-white">{group.name}</h3>
                          <p className="text-sm text-gray-400">{group.type === 'group' ? 'Grupo' : 'Canal'}</p>
                          <p className="text-sm text-gray-500">{group.member_count} membros</p>
                        </div>
                        <Badge variant={group.is_active ? 'default' : 'secondary'}>
                          {group.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {groups.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  Nenhum grupo ou canal encontrado. Configure seus grupos primeiro.
                </div>
              )}
            </CardContent>
          </Card>

          {selectedGroup && (
            <>
              {/* Estatísticas dos Membros */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total</p>
                        <p className="text-2xl font-bold text-white">{filteredMembers.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Ativos</p>
                        <p className="text-2xl font-bold text-green-400">
                          {filteredMembers.filter(m => m.subscription_status === 'paid').length}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Expirando</p>
                        <p className="text-2xl font-bold text-orange-400">
                          {filteredMembers.filter(m => m.subscription_status === 'expiring_soon').length}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Críticos</p>
                        <p className="text-2xl font-bold text-red-400">
                          {filteredMembers.filter(m => m.subscription_status === 'about_to_expire').length}
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Expirados</p>
                        <p className="text-2xl font-bold text-gray-400">
                          {filteredMembers.filter(m => m.subscription_status === 'expired').length}
                        </p>
                      </div>
                      <RefreshCw className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de Membros */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Membros do {selectedGroup.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    Gerencie os membros do grupo e suas assinaturas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Buscar por nome, username ou ID..."
                          value={memberSearchTerm}
                          onChange={(e) => setMemberSearchTerm(e.target.value)}
                          className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        />
                      </div>
                    </div>
                    <div className="sm:w-48">
                      <select
                        value={memberStatusFilter}
                        onChange={(e) => setMemberStatusFilter(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-gray-600 bg-gray-700 text-white text-sm"
                      >
                        <option value="all">Todos os Status</option>
                        <option value="expired">Expirados</option>
                        <option value="about_to_expire">Expira amanhã</option>
                        <option value="expiring_soon">Expirando</option>
                        <option value="paid">Ativos</option>
                        <option value="no_subscription">Sem assinatura</option>
                      </select>
                    </div>
                    <Button onClick={() => selectedGroup && loadGroupMembers(selectedGroup.telegram_chat_id)} disabled={loadingMembers}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${loadingMembers ? 'animate-spin' : ''}`} />
                      Atualizar
                    </Button>
                  </div>

                  {loadingMembers ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2 text-gray-400">Carregando membros...</span>
                    </div>
                  ) : filteredMembers.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      {groupMembers.length === 0 ? 'Nenhum membro encontrado.' : 'Nenhum membro encontrado com os filtros aplicados.'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Membro</TableHead>
                            <TableHead>Função</TableHead>
                            <TableHead>Status da Assinatura</TableHead>
                            <TableHead>Último Pagamento</TableHead>
                            <TableHead>Entrada no Grupo</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMembers.map((member) => (
                            <TableRow key={member.user_telegram_id}>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium text-white">
                                    {member.first_name || 'Sem nome'} {member.last_name || ''}
                                  </span>
                                  <span className="text-sm text-gray-400">
                                    @{member.username || 'sem username'}
                                  </span>
                                  <span className="text-xs text-gray-500 font-mono">
                                    ID: {member.user_telegram_id}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getMemberRoleBadge(member.status)}
                              </TableCell>
                              <TableCell>
                                {getMemberStatusBadge(member)}
                              </TableCell>
                              <TableCell>
                                {member.last_payment_date ? formatDate(member.last_payment_date) : 'Nunca'}
                              </TableCell>
                              <TableCell>
                                {formatDate(member.joined_at)}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {(member.subscription_status === 'about_to_expire' || 
                                    member.subscription_status === 'expired') && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSendRemarketingToMember(member)}
                                      className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
                                    >
                                      <MessageSquare className="h-3 w-3 mr-1" />
                                      Remarketing
                                    </Button>
                                  )}
                                  {member.status !== 'creator' && member.status !== 'administrator' && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleRemoveMember(member)}
                                      className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Remover
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Ativos</p>
                <p className="text-2xl font-bold text-green-400">
                  {users.filter(u => u.status === 'paid').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Expirando</p>
                <p className="text-2xl font-bold text-orange-400">
                  {users.filter(u => u.status === 'expiring_soon').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Críticos</p>
                <p className="text-2xl font-bold text-red-400">
                  {users.filter(u => u.status === 'about_to_expire').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Expirados</p>
                <p className="text-2xl font-bold text-gray-400">
                  {users.filter(u => u.status === 'expired').length}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Envio de mensagem manual */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <MessageSquare className="mr-2 h-5 w-5" />
            Envio Manual de Mensagem
          </CardTitle>
          <CardDescription className="text-gray-400">
            Envie uma mensagem personalizada para um usuário específico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              ID do Usuário no Telegram
            </label>
            <Input
              placeholder="Digite o ID do usuário..."
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Mensagem
            </label>
            <Textarea
              placeholder="Digite sua mensagem personalizada..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          <Button onClick={handleSendMessage} disabled={sending || !selectedUser || !message.trim()} className="bg-blue-600 hover:bg-blue-700">
            <Send className="mr-2 h-4 w-4" />
            {sending ? 'Enviando...' : 'Enviar Mensagem'}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de usuários */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por ID do usuário ou plano..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-600 bg-gray-700 text-white text-sm"
              >
                <option value="all">Todos os Status</option>
                <option value="expired">Expirados</option>
                <option value="about_to_expire">Expira amanhã</option>
                <option value="expiring_soon">Expirando</option>
                <option value="paid">Ativos</option>
              </select>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {users.length === 0 ? 'Nenhum usuário encontrado.' : 'Nenhum usuário encontrado com os filtros aplicados.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Pagamento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((userData) => (
                    <TableRow key={userData.user_telegram_id}>
                      <TableCell className="font-mono text-sm">
                        {userData.user_telegram_id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{userData.latest_sale.plans.name}</p>
                          <p className="text-sm text-gray-500">
                            {userData.latest_sale.plans.duration_days} dias
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(userData)}
                      </TableCell>
                      <TableCell>
                        {formatDate(userData.last_payment_date)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(userData.user_telegram_id)
                            setMessage(getAutomaticRemarketingMessage(userData))
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Remarketing
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Configurações de Remarketing */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Configurações do Remarketing Automático
              </CardTitle>
              <CardDescription className="text-gray-400">
                Configure as mensagens e regras do sistema automático
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Mensagem antes do vencimento (use {'{days}'} para dias restantes)
                </label>
                <Textarea
                  value={remarketingSettings.beforeExpiryMessage}
                  onChange={(e) => setRemarketingSettings(prev => ({ ...prev, beforeExpiryMessage: e.target.value }))}
                  rows={3}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Mensagem após vencimento
                </label>
                <Textarea
                  value={remarketingSettings.expiredMessage}
                  onChange={(e) => setRemarketingSettings(prev => ({ ...prev, expiredMessage: e.target.value }))}
                  rows={3}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Remover automaticamente após (dias)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={remarketingSettings.autoRemoveAfterDays}
                    onChange={(e) => setRemarketingSettings(prev => ({ ...prev, autoRemoveAfterDays: parseInt(e.target.value) }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <input
                    type="checkbox"
                    id="enableAutoRemove"
                    checked={remarketingSettings.enableAutoRemove}
                    onChange={(e) => setRemarketingSettings(prev => ({ ...prev, enableAutoRemove: e.target.checked }))}
                    className="rounded border-gray-600 bg-gray-700"
                  />
                  <label htmlFor="enableAutoRemove" className="text-sm text-gray-300">
                    Habilitar remoção automática
                  </label>
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium text-white mb-2">Como funciona o sistema automático:</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>1 dia antes do vencimento:</strong> Envia mensagem de aviso</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>1 dia após vencimento:</strong> Envia mensagem de cobrança</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>{remarketingSettings.autoRemoveAfterDays} dias após vencimento:</strong> {remarketingSettings.enableAutoRemove ? 'Remove automaticamente do grupo' : 'Envia lembrete final'}</p>
                  </div>
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700">
                <Settings className="mr-2 h-4 w-4" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>

          {/* Logs do Sistema */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Logs do Sistema Automático</CardTitle>
              <CardDescription className="text-gray-400">
                Últimas ações realizadas pelo sistema de remarketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-gray-700 p-3 rounded border-l-4 border-green-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-white">Mensagem de remarketing enviada</p>
                      <p className="text-xs text-gray-400">Usuário: @exemplo_user - Grupo: VIP Gold</p>
                    </div>
                    <span className="text-xs text-gray-500">há 2 horas</span>
                  </div>
                </div>
                
                <div className="bg-gray-700 p-3 rounded border-l-4 border-red-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-white">Membro removido automaticamente</p>
                      <p className="text-xs text-gray-400">Usuário: @outro_user - Grupo: VIP Silver</p>
                    </div>
                    <span className="text-xs text-gray-500">há 5 horas</span>
                  </div>
                </div>

                <div className="bg-gray-700 p-3 rounded border-l-4 border-blue-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-white">Aviso de vencimento enviado</p>
                      <p className="text-xs text-gray-400">Usuário: @usuario_vip - Grupo: VIP Platinum</p>
                    </div>
                    <span className="text-xs text-gray-500">há 1 dia</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center py-4">
                <Button variant="outline" className="text-gray-400 border-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  Ver Histórico Completo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 