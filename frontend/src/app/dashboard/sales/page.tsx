'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { BarChart3, Search, Filter, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react'

interface Sale {
  id: string
  user_telegram_id: string
  status: 'pending' | 'paid' | 'cancelled' | 'expired'
  pushinpay_payment_id: string | null
  amount_received: number | null
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

interface Stats {
  total_sales: number
  total_revenue: number
  pending_sales: number
  paid_sales: number
}

export default function SalesPage() {
  const [bot, setBot] = useState<Bot | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [stats, setStats] = useState<Stats>({
    total_sales: 0,
    total_revenue: 0,
    pending_sales: 0,
    paid_sales: 0
  })
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { user } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadBotAndSales()
    }
  }, [user])

  useEffect(() => {
    filterSales()
  }, [sales, searchTerm, statusFilter])

  const loadBotAndSales = async () => {
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
        
        // Carregar vendas do bot
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
          .order('created_at', { ascending: false })

        if (salesError) throw salesError
        
        const salesWithPlans = salesData || []
        setSales(salesWithPlans)
        calculateStats(salesWithPlans)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (salesData: Sale[]) => {
    const stats = {
      total_sales: salesData.length,
      total_revenue: salesData
        .filter(sale => sale.status === 'paid' && sale.amount_received)
        .reduce((sum, sale) => sum + (sale.amount_received || 0), 0),
      pending_sales: salesData.filter(sale => sale.status === 'pending').length,
      paid_sales: salesData.filter(sale => sale.status === 'paid').length
    }
    setStats(stats)
  }

  const filterSales = () => {
    let filtered = sales

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.user_telegram_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.pushinpay_payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.plans.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sale => sale.status === statusFilter)
    }

    setFilteredSales(filtered)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, label: 'Pendente' },
      paid: { variant: 'default' as const, label: 'Pago' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelado' },
      expired: { variant: 'outline' as const, label: 'Expirado' }
    }
    
    const config = variants[status as keyof typeof variants] || variants.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
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
        <h1 className="text-3xl font-bold text-white">Vendas</h1>
        <p className="text-gray-400 mt-2">
          Acompanhe todas as vendas e pagamentos do seu bot.
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total de Vendas</p>
                <p className="text-2xl font-bold text-white">{stats.total_sales}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Receita Total</p>
                <p className="text-2xl font-bold text-white">{formatPrice(stats.total_revenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Vendas Pagas</p>
                <p className="text-2xl font-bold text-white">{stats.paid_sales}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Pendentes</p>
                <p className="text-2xl font-bold text-white">{stats.pending_sales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por ID do usuário, pagamento ou plano..."
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
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="cancelled">Cancelado</option>
                <option value="expired">Expirado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de vendas */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Histórico de Vendas</CardTitle>
          <CardDescription className="text-gray-400">
            {filteredSales.length} venda(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {sales.length === 0 ? 'Nenhuma venda registrada ainda.' : 'Nenhuma venda encontrada com os filtros aplicados.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>ID Pagamento</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono text-sm">
                        {sale.user_telegram_id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sale.plans.name}</p>
                          <p className="text-sm text-gray-500">
                            {sale.plans.duration_days} dias
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatPrice(sale.plans.price)}</p>
                          {sale.amount_received && sale.amount_received !== sale.plans.price && (
                            <p className="text-sm text-green-600">
                              Recebido: {formatPrice(sale.amount_received)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(sale.status)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {sale.pushinpay_payment_id || '-'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{formatDate(sale.created_at)}</p>
                          {sale.updated_at !== sale.created_at && (
                            <p className="text-xs text-gray-500">
                              Atualizado: {formatDate(sale.updated_at)}
                            </p>
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
    </div>
  )
} 