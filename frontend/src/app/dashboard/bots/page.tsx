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
import { DeleteBotModal } from '@/components/ui/delete-bot-modal'

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [botToDelete, setBotToDelete] = useState<{id: string, username: string} | null>(null)
  const [isVisible, setIsVisible] = useState({
    header: false,
    actions: false,
    content: false
  })

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible({
        header: true,
        actions: true,
        content: true
      })
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (user) {
      loadBots()
    }
  }, [user])

  // Recarregar dados quando a página voltar ao foco
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        loadBots()
      }
    }

    window.addEventListener('focus', handleFocus)
    
    // Também recarregar quando voltar para a página
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        loadBots()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user])

  const loadBots = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      
      console.log('Carregando bots para usuário:', user?.id)
      
      // Buscar bots do usuário com cache refresh
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

  const handleDeleteBot = (botId: string, botUsername: string) => {
    setBotToDelete({ id: botId, username: botUsername })
    setDeleteModalOpen(true)
  }

  const confirmDeleteBot = async () => {
    if (!botToDelete) return

    setDeletingBotId(botToDelete.id)
    
    try {
      const supabase = createClient()
      
      // Primeiro, deletar dados relacionados
      toast.loading('Removendo dados relacionados...', { id: 'delete-bot' })
      
      // Deletar vendas
      await supabase
        .from('sales')
        .delete()
        .eq('bot_id', botToDelete.id)
      
      // Deletar planos
      await supabase
        .from('plans')
        .delete()
        .eq('bot_id', botToDelete.id)
      
      // Finalmente, deletar o bot
      toast.loading('Excluindo bot...', { id: 'delete-bot' })
      
      const { error: deleteError } = await supabase
        .from('bots')
        .delete()
        .eq('id', botToDelete.id)
      
      if (deleteError) throw deleteError
      
      // Remover da lista local
      setBots(prevBots => prevBots.filter(bot => bot.id !== botToDelete.id))
      
      toast.success(`✅ Bot @${botToDelete.username} excluído com sucesso!`, { id: 'delete-bot' })
      
      // Fechar modal
      setDeleteModalOpen(false)
      setBotToDelete(null)
      
    } catch (error: any) {
      console.error('Erro ao excluir bot:', error)
      toast.error('❌ Erro ao excluir bot. Tente novamente.', { id: 'delete-bot' })
    } finally {
      setDeletingBotId(null)
    }
  }

  const closeDeleteModal = () => {
    if (!deletingBotId) {
      setDeleteModalOpen(false)
      setBotToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando seus bots...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button 
            onClick={loadBots} 
            className="bg-gradient-to-r from-primary-600 to-accent-emerald hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header com animação */}
      <div 
        className={`flex items-center justify-between transition-all duration-700 ease-out ${
          isVisible.header ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
        }`}
      >
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center" style={{
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
          }}>
            <Bot className="mr-3 h-8 w-8 text-primary-400" />
            Meus Bots
          </h1>
          <p className="text-gray-300 mt-2" style={{
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
          }}>
            Gerencie todos os seus bots do Telegram
          </p>
        </div>
        <Button 
          onClick={handleCreateBot}
          className={`bg-gradient-to-r from-primary-600 via-accent-emerald to-accent-gold text-white border border-primary-400/20 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-primary-500/30 relative overflow-hidden group font-semibold transform ${
            isVisible.header ? 'translate-x-0' : 'translate-x-10'
          }`}
        >
          <span className="relative z-10 flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Criar Novo Bot
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-accent-gold to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      </div>

      {/* Ações Rápidas com animação */}
      {bots.length > 0 && (
        <div 
          className={`bg-dark-700/30 backdrop-blur-xl rounded-2xl p-6 border border-dark-600/30 hover:bg-dark-600/40 transition-all duration-500 ${
            isVisible.actions ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-95'
          }`}
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Ações Rápidas</h3>
            <p className="text-gray-300">Configure seu bot rapidamente</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: '/dashboard/bots/welcome', icon: MessageSquare, title: 'Mensagem de Boas-vindas' },
              { href: '/dashboard/bots/plans', icon: CreditCard, title: 'Gerenciar Planos' },
              { href: '/dashboard/sales', icon: BarChart3, title: 'Ver Vendas' }
            ].map((action, index) => (
              <Link key={action.href} href={action.href}>
                <Button 
                  variant="outline" 
                  className={`w-full h-20 bg-dark-800/50 border-dark-600/50 text-gray-300 hover:bg-dark-700/50 hover:text-primary-300 hover:border-primary-500/50 transition-all duration-300 backdrop-blur-sm hover:scale-105 transform ${
                    isVisible.actions ? 'translate-y-0' : 'translate-y-3'
                  }`}
                  style={{ 
                    transitionDelay: `${index * 100}ms` 
                  }}
                >
                  <div className="flex flex-col items-center">
                    <action.icon className="h-6 w-6 mb-2" />
                    <span className="text-sm">{action.title}</span>
                  </div>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Bots com animação */}
      <div 
        className={`transition-all duration-700 ease-out ${
          isVisible.content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {bots.length === 0 ? (
          <div className="bg-dark-700/30 backdrop-blur-xl rounded-2xl p-12 border border-dark-600/30 hover:bg-dark-600/40 transition-all duration-300 text-center">
            <Bot className="mx-auto h-16 w-16 text-gray-500 mb-4 animate-pulse" />
            <h3 className="text-2xl font-bold text-white mb-2" style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
            }}>
              Nenhum bot criado ainda
            </h3>
            <p className="text-gray-300 mb-6" style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
            }}>
              Crie seu primeiro bot para começar a monetizar seus grupos do Telegram
            </p>
            <Button 
              onClick={handleCreateBot}
              className="bg-gradient-to-r from-primary-600 via-accent-emerald to-accent-gold text-white border border-primary-400/20 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-primary-500/30 relative overflow-hidden group font-semibold"
            >
              <span className="relative z-10 flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Bot
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent-gold to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bots.map((bot, index) => (
              <div 
                key={bot.id} 
                className={`bg-dark-700/30 backdrop-blur-xl rounded-2xl p-6 border border-dark-600/30 hover:bg-dark-600/40 hover:border-primary-500/50 transition-all duration-500 cursor-pointer group hover:scale-105 hover:shadow-xl hover:shadow-primary-500/20 transform ${
                  isVisible.content ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                }`}
                style={{ 
                  transitionDelay: `${index * 100}ms` 
                }}
                onClick={() => handleBotClick(bot.id)}
              >
                <div className="mb-4">
                  <h3 className="text-white flex items-center text-lg font-bold mb-2 group-hover:text-primary-300 transition-colors duration-300">
                    <Bot className="mr-2 h-5 w-5 text-primary-400 group-hover:text-primary-300 transition-colors duration-300 group-hover:rotate-12" />
                    @{bot.bot_username}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Criado em {formatDate(bot.created_at)}
                  </p>
                </div>
                <div>
                  <div className="space-y-4">
                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Status:</span>
                      <span className={`text-sm px-3 py-1 rounded-full transition-all duration-300 ${
                        bot.is_active 
                          ? 'bg-green-900/50 text-green-300 border border-green-500/50' 
                          : 'bg-red-900/50 text-red-300 border border-red-500/50'
                      }`}>
                        {bot.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center bg-dark-800/30 rounded-xl p-3 backdrop-blur-sm transition-all duration-300 group-hover:bg-dark-700/50">
                        <div className="text-2xl font-bold text-primary-400 group-hover:scale-110 transition-transform duration-300">
                          {bot.plans_count}
                        </div>
                        <div className="text-xs text-gray-400">Planos</div>
                      </div>
                      <div className="text-center bg-dark-800/30 rounded-xl p-3 backdrop-blur-sm transition-all duration-300 group-hover:bg-dark-700/50">
                        <div className="text-2xl font-bold text-accent-emerald group-hover:scale-110 transition-transform duration-300">
                          {bot.sales_count}
                        </div>
                        <div className="text-xs text-gray-400">Vendas</div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex space-x-2 pt-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 bg-dark-800/50 border-dark-600/50 text-gray-300 hover:bg-dark-700/50 hover:text-primary-300 hover:border-primary-500/50 transition-all duration-300 backdrop-blur-sm hover:scale-105"
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
                        className="flex-1 bg-dark-800/50 border-dark-600/50 text-gray-300 hover:bg-dark-700/50 hover:text-primary-300 hover:border-primary-500/50 transition-all duration-300 backdrop-blur-sm hover:scale-105"
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
                        className="bg-red-900/20 border-red-600/50 text-red-400 hover:bg-red-900/40 hover:border-red-500 transition-all duration-300 backdrop-blur-sm hover:scale-105"
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <DeleteBotModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteBot}
        botUsername={botToDelete?.username || ''}
        isDeleting={!!deletingBotId}
      />
    </div>
  )
} 