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
  const [isVisible, setIsVisible] = useState({
    header: false,
    stats: false,
    filters: false,
    table: false
  })
  const { user } = useAuthStore()
  const supabase = createClient()

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible({
        header: true,
        stats: true,
        filters: true,
        table: true
      })
    }, 100)

    return () => clearTimeout(timer)
  }, [])

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando vendas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header com animação */}
      <div 
        className={`transition-all duration-700 ease-out ${
          isVisible.header ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
        }`}
      >
        <h1 className="text-4xl font-bold text-white flex items-center" style={{
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
        }}>
          <BarChart3 className="mr-3 h-8 w-8 text-primary-400" />
          Vendas
        </h1>
        <p className="text-gray-300 mt-2" style={{
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
        }}>
          Acompanhe todas as vendas e pagamentos do seu bot
        </p>
      </div>

      {/* Estatísticas com animação */}
      <div 
        className={`grid grid-cols-1 md:grid-cols-4 gap-6 transition-all duration-700 ease-out ${
          isVisible.stats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {[
          {
            icon: BarChart3,
            title: 'Total de Vendas',
            value: stats.total_sales,
            color: 'text-blue-400',
            delay: '0ms'
          },
          {
            icon: DollarSign,
            title: 'Receita Total',
            value: formatPrice(stats.total_revenue),
            color: 'text-green-400',
            delay: '100ms'
          },
          {
            icon: TrendingUp,
            title: 'Vendas Pagas',
            value: stats.paid_sales,
            color: 'text-accent-emerald',
            delay: '200ms'
          },
          {
            icon: Users,
            title: 'Vendas Pendentes',
            value: stats.pending_sales,
            color: 'text-yellow-400',
            delay: '300ms'
          }
        ].map((stat, index) => (
          <div
            key={stat.title}
            className={`bg-dark-700/30 backdrop-blur-xl rounded-2xl p-6 border border-dark-600/30 hover:bg-dark-600/40 hover:border-primary-500/50 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/20 transform ${
              isVisible.stats ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
            }`}
            style={{ 
              transitionDelay: stat.delay 
            }}
          >
            <div className="flex items-center">
              <stat.icon className={`h-8 w-8 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros com animação */}
      <div 
        className={`bg-dark-700/30 backdrop-blur-xl rounded-2xl p-6 border border-dark-600/30 hover:bg-dark-600/40 transition-all duration-500 ${
          isVisible.filters ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-95'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por ID, nome do plano..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-dark-800/50 border-dark-600/50 text-white placeholder-gray-400 focus:border-primary-500 focus:bg-dark-700/50 transition-all duration-300"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-dark-800/50 border border-dark-600/50 text-white rounded-lg px-3 py-2 focus:border-primary-500 focus:bg-dark-700/50 transition-all duration-300"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="cancelled">Cancelado</option>
              <option value="expired">Expirado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de vendas com animação */}
      <div 
        className={`bg-dark-700/30 backdrop-blur-xl rounded-2xl border border-dark-600/30 hover:bg-dark-600/40 transition-all duration-700 ease-out ${
          isVisible.table ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="p-6 border-b border-dark-600/30">
          <h3 className="text-xl font-bold text-white">Lista de Vendas</h3>
          <p className="text-gray-300">Total: {filteredSales.length} vendas</p>
        </div>
        
        {filteredSales.length === 0 ? (
          <div className="p-12 text-center">
            <BarChart3 className="mx-auto h-16 w-16 text-gray-500 mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhuma venda encontrada</h3>
            <p className="text-gray-300">
              {sales.length === 0 
                ? 'Você ainda não possui vendas registradas.'
                : 'Nenhuma venda corresponde aos filtros aplicados.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-dark-600/30 hover:bg-dark-700/30">
                  <TableHead className="text-gray-300">ID Telegram</TableHead>
                  <TableHead className="text-gray-300">Plano</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Valor</TableHead>
                  <TableHead className="text-gray-300">Data</TableHead>
                  <TableHead className="text-gray-300">Pagamento ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale, index) => (
                  <TableRow 
                    key={sale.id} 
                    className={`border-dark-600/30 hover:bg-dark-700/50 transition-all duration-300 ${
                      isVisible.table ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ 
                      transitionDelay: `${index * 50}ms` 
                    }}
                  >
                    <TableCell className="text-white font-mono text-sm">
                      {sale.user_telegram_id}
                    </TableCell>
                    <TableCell className="text-white">
                      <div>
                        <div className="font-medium">{sale.plans.name}</div>
                        <div className="text-sm text-gray-400">
                          {sale.plans.duration_days} dias
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(sale.status)}
                    </TableCell>
                    <TableCell className="text-white">
                      {sale.amount_received 
                        ? formatPrice(sale.amount_received)
                        : formatPrice(sale.plans.price)
                      }
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {formatDate(sale.created_at)}
                    </TableCell>
                    <TableCell className="text-gray-400 font-mono text-sm">
                      {sale.pushinpay_payment_id || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
} 