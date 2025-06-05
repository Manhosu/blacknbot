'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { RefreshCw, Send, Search, MessageSquare, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

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
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const { user } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadBotAndUsers()
    }
  }, [user])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, statusFilter])

  const loadBotAndUsers = async () => {
    setLoading(true)
    try {
      // Carregar bot do usuário
      const { data: botData, error: botError } = await supabase
        .from('bots')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      if (botError && botError.code !== 'PGRST116') {
        throw botError
      }

      if (botData) {
        setBot(botData)
        
        // Carregar vendas pagas do bot
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select(`
            *,
            plans (
              name,
              price,
              duration_days
            )
          `)
          .eq('bot_id', botData.id)
          .eq('status', 'paid')
          .order('created_at', { ascending: false })

        if (salesError) throw salesError
        
        const processedUsers = processSalesData(salesData || [])
        setUsers(processedUsers)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
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

  const handleSendMessage = async () => {
    if (!selectedUser || !message.trim()) {
      alert('Selecione um usuário e digite uma mensagem')
      return
    }

    setSending(true)
    try {
      // Aqui seria feita a chamada para a API do backend para enviar a mensagem
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/remarketing/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bot_id: bot?.id,
          user_telegram_id: selectedUser,
          message: message
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem')
      }

      alert('Mensagem enviada com sucesso!')
      setMessage('')
      setSelectedUser(null)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      alert('Erro ao enviar mensagem. Tente novamente.')
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
        <h1 className="text-3xl font-bold text-white">Remarketing</h1>
        <p className="text-gray-400 mt-2">
          Gerencie campanhas de remarketing para usuários com assinatura vencendo ou vencida.
        </p>
      </div>

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

      {/* Informações sobre remarketing automático */}
      <Card>
        <CardHeader>
          <CardTitle>Remarketing Automático</CardTitle>
          <CardDescription>
            Como funciona o sistema automatizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>1 dia antes do vencimento:</strong> Enviamos automaticamente um lembrete para o usuário renovar a assinatura
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>1 dia após o vencimento:</strong> Enviamos uma mensagem informando que a assinatura expirou e oferecendo renovação
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Remarketing manual:</strong> Use esta tela para enviar mensagens personalizadas a qualquer momento
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 