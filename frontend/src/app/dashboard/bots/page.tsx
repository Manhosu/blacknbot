'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Plus, Settings, BarChart3, Users, Calendar, Play, Pause, MessageSquare, CreditCard, Trash2 } from "lucide-react"
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface BotData {
  id: string
  bot_username: string
  welcome_text: string
  media_url: string | null
  media_type: 'photo' | 'video' | null
  vip_group_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  plans_count?: number
  sales_count?: number
}

export default function BotsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [bots, setBots] = useState<BotData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingBotId, setDeletingBotId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadBots()
    }
  }, [user])

  const loadBots = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      
      console.log('Carregando bots para usuário:', user?.id)
      
      // Buscar bots do usuário - removendo o filtro user_id direto para evitar problemas com RLS
      const { data: botsData, error: botsError } = await supabase
        .from('bots')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Resposta dos bots:', { botsData, botsError })

      if (botsError) {
        console.error('Erro na query de bots:', botsError)
        throw botsError
      }

      // Se não há bots, definir array vazio
      if (!botsData || botsData.length === 0) {
        setBots([])
        return
      }

      // Para cada bot, buscar contagem de planos e vendas de forma mais simples
      const botsWithCounts = await Promise.all(
        botsData.map(async (bot) => {
          try {
            // Contar planos
            const { count: plansCount } = await supabase
              .from('plans')
              .select('id', { count: 'exact', head: true })
              .eq('bot_id', bot.id)

            // Contar vendas
            const { count: salesCount } = await supabase
              .from('sales')
              .select('id', { count: 'exact', head: true })
              .eq('bot_id', bot.id)

            return {
              ...bot,
              plans_count: plansCount || 0,
              sales_count: salesCount || 0
            }
          } catch (countError) {
            console.error('Erro ao contar para bot', bot.id, countError)
            return {
              ...bot,
              plans_count: 0,
              sales_count: 0
            }
          }
        })
      )

      setBots(botsWithCounts)
    } catch (error: any) {
      console.error('Erro ao carregar bots:', error)
      setError('Erro ao carregar seus bots. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleCreateBot = () => {
    router.push('/dashboard/bots/create')
  }

  const handleBotClick = (botId: string) => {
    router.push(`/dashboard/bots/${botId}`)
  }

  const handleDeleteBot = async (botId: string, botUsername: string) => {
    // Confirmação dupla para evitar exclusões acidentais
    const confirmMessage = `Tem certeza que deseja excluir o bot @${botUsername}?\n\nEsta ação é IRREVERSÍVEL e irá:\n• Remover o bot permanentemente\n• Excluir todos os planos criados\n• Excluir histórico de vendas\n• Cancelar todas as assinaturas ativas\n\nDigite "EXCLUIR" para confirmar:`
    
    const confirmation = prompt(confirmMessage)
    
    if (confirmation !== 'EXCLUIR') {
      return
    }

    setDeletingBotId(botId)
    
    try {
      const supabase = createClient()
      
      // Primeiro, deletar dados relacionados
      toast.loading('Removendo dados relacionados...', { id: 'delete-bot' })
      
      // Deletar vendas
      await supabase
        .from('sales')
        .delete()
        .eq('bot_id', botId)
      
      // Deletar planos
      await supabase
        .from('plans')
        .delete()
        .eq('bot_id', botId)
      
      // Finalmente, deletar o bot
      toast.loading('Excluindo bot...', { id: 'delete-bot' })
      
      const { error: deleteError } = await supabase
        .from('bots')
        .delete()
        .eq('id', botId)
      
      if (deleteError) throw deleteError
      
      // Remover da lista local
      setBots(prevBots => prevBots.filter(bot => bot.id !== botId))
      
      toast.success(`✅ Bot @${botUsername} excluído com sucesso!`, { id: 'delete-bot' })
      
    } catch (error: any) {
      console.error('Erro ao excluir bot:', error)
      toast.error('❌ Erro ao excluir bot. Tente novamente.', { id: 'delete-bot' })
    } finally {
      setDeletingBotId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando seus bots...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={loadBots} className="bg-blue-600 hover:bg-blue-700">
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Bot className="mr-3 h-8 w-8 text-blue-500" />
            Meus Bots
          </h1>
          <p className="text-gray-400 mt-2">
            Gerencie todos os seus bots do Telegram
          </p>
        </div>
        <Button 
          onClick={handleCreateBot}
          className="bg-blue-600 hover:bg-blue-700 flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Criar Novo Bot
        </Button>
      </div>

      {/* Ações Rápidas */}
      {bots.length > 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Ações Rápidas</CardTitle>
            <CardDescription className="text-gray-400">
              Configure seu bot rapidamente
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/dashboard/bots/welcome">
              <Button variant="outline" className="w-full h-20 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700">
                <div className="flex flex-col items-center">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  <span className="text-sm">Mensagem de Boas-vindas</span>
                </div>
              </Button>
            </Link>
            
            <Link href="/dashboard/bots/plans">
              <Button variant="outline" className="w-full h-20 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700">
                <div className="flex flex-col items-center">
                  <CreditCard className="h-6 w-6 mb-2" />
                  <span className="text-sm">Gerenciar Planos</span>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/sales">
              <Button variant="outline" className="w-full h-20 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700">
                <div className="flex flex-col items-center">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span className="text-sm">Ver Vendas</span>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Lista de Bots */}
      {bots.length === 0 ? (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-12 text-center">
            <Bot className="mx-auto h-16 w-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum bot criado ainda
            </h3>
            <p className="text-gray-400 mb-6">
              Crie seu primeiro bot para começar a monetizar seus grupos do Telegram
            </p>
            <Button 
              onClick={handleCreateBot}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Bot
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <Card 
              key={bot.id} 
              className="bg-gray-900 border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => handleBotClick(bot.id)}
            >
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bot className="mr-2 h-5 w-5 text-blue-500" />
                  @{bot.bot_username}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Criado em {formatDate(bot.created_at)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Status:</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      bot.is_active 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-red-900 text-red-300'
                    }`}>
                      {bot.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {bot.plans_count}
                      </div>
                      <div className="text-xs text-gray-500">Planos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {bot.sales_count}
                      </div>
                      <div className="text-xs text-gray-500">Vendas</div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex space-x-2 pt-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push('/dashboard/bots/welcome')
                      }}
                    >
                      <MessageSquare className="mr-1 h-3 w-3" />
                      Boas-vindas
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push('/dashboard/bots/plans')
                      }}
                    >
                      <CreditCard className="mr-1 h-3 w-3" />
                      Planos
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-red-600 text-red-400 hover:bg-red-900/20 hover:border-red-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteBot(bot.id, bot.bot_username)
                      }}
                      disabled={deletingBotId === bot.id}
                    >
                      {deletingBotId === bot.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-400"></div>
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 