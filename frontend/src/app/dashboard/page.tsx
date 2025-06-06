'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Bot, 
  BarChart3, 
  Users, 
  Plus,
  TrendingUp,
  DollarSign,
  MessageSquare,
  Settings,
  ArrowRight
} from 'lucide-react'

export default function DashboardPage() {
  const [isVisible, setIsVisible] = useState({
    header: false,
    welcome: false,
    quickActions: false,
    stats: false,
    recentActivity: false
  })

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible({
        header: true,
        welcome: true,
        quickActions: true,
        stats: true,
        recentActivity: true
      })
    }, 100)

    return () => clearTimeout(timer)
  }, [])

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
          <Bot className="mr-3 h-8 w-8 text-primary-400" />
          Dashboard
        </h1>
        <p className="text-gray-300 mt-2" style={{
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
        }}>
          Bem-vindo ao seu painel de controle
        </p>
      </div>

      {/* Welcome Card com animação */}
      <div 
        className={`bg-dark-700/30 backdrop-blur-xl rounded-2xl p-8 border border-dark-600/30 hover:bg-dark-600/40 transition-all duration-700 ease-out ${
          isVisible.welcome ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-95'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              🚀 Bem-vindo ao BLACKINBOT!
            </h2>
            <p className="text-gray-300">
              Gerencie seus bots do Telegram e monitore suas vendas em tempo real
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-emerald flex items-center justify-center animate-pulse">
              <Bot className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas com animação */}
      <div 
        className={`transition-all duration-700 ease-out ${
          isVisible.quickActions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h3 className="text-xl font-bold text-white mb-6">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Criar Novo Bot',
              description: 'Configure um novo bot',
              icon: Plus,
              href: '/dashboard/bots/create',
              color: 'from-primary-600 to-accent-emerald',
              delay: '0ms'
            },
            {
              title: 'Ver Bots',
              description: 'Gerencie seus bots',
              icon: Bot,
              href: '/dashboard/bots',
              color: 'from-accent-emerald to-accent-gold',
              delay: '100ms'
            },
            {
              title: 'Vendas',
              description: 'Acompanhe suas vendas',
              icon: BarChart3,
              href: '/dashboard/sales',
              color: 'from-accent-gold to-primary-600',
              delay: '200ms'
            },
            {
              title: 'Configurações',
              description: 'Ajuste suas preferências',
              icon: Settings,
              href: '/dashboard/settings',
              color: 'from-primary-600 to-accent-emerald',
              delay: '300ms'
            }
          ].map((action) => (
            <Link key={action.title} href={action.href}>
              <div 
                className={`bg-dark-700/30 backdrop-blur-xl rounded-2xl p-6 border border-dark-600/30 hover:bg-dark-600/40 hover:border-primary-500/50 transition-all duration-500 cursor-pointer group hover:scale-105 hover:shadow-xl hover:shadow-primary-500/20 transform ${
                  isVisible.quickActions ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                }`}
                style={{ 
                  transitionDelay: action.delay 
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-400 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h4 className="text-white font-semibold mb-1 group-hover:text-primary-300 transition-colors duration-300">
                  {action.title}
                </h4>
                <p className="text-gray-400 text-sm">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Estatísticas Resumidas com animação */}
      <div 
        className={`transition-all duration-700 ease-out ${
          isVisible.stats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h3 className="text-xl font-bold text-white mb-6">Estatísticas Gerais</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Total de Bots',
              value: '0',
              icon: Bot,
              color: 'text-blue-400',
              delay: '0ms'
            },
            {
              title: 'Vendas Este Mês',
              value: '0',
              icon: TrendingUp,
              color: 'text-green-400',
              delay: '100ms'
            },
            {
              title: 'Receita Total',
              value: 'R$ 0,00',
              icon: DollarSign,
              color: 'text-yellow-400',
              delay: '200ms'
            }
          ].map((stat) => (
            <div
              key={stat.title}
              className={`bg-dark-700/30 backdrop-blur-xl rounded-2xl p-6 border border-dark-600/30 hover:bg-dark-600/40 hover:border-primary-500/50 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/20 transform ${
                isVisible.stats ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
              }`}
              style={{ 
                transitionDelay: stat.delay 
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <stat.icon className={`h-10 w-10 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Atividade Recente com animação */}
      <div 
        className={`bg-dark-700/30 backdrop-blur-xl rounded-2xl border border-dark-600/30 hover:bg-dark-600/40 transition-all duration-700 ease-out ${
          isVisible.recentActivity ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="p-6 border-b border-dark-600/30">
          <h3 className="text-xl font-bold text-white flex items-center">
            <MessageSquare className="mr-2 h-6 w-6 text-primary-400" />
            Atividade Recente
          </h3>
          <p className="text-gray-300">Últimas ações no seu painel</p>
        </div>
        
        <div className="p-6">
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-16 w-16 text-gray-500 mb-4 animate-pulse" />
            <h4 className="text-lg font-semibold text-white mb-2">Nenhuma atividade ainda</h4>
            <p className="text-gray-400 mb-6">
              Crie seu primeiro bot para começar a ver atividades aqui
            </p>
            <Link href="/dashboard/bots/create">
              <Button className="bg-gradient-to-r from-primary-600 via-accent-emerald to-accent-gold text-white border border-primary-400/20 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-primary-500/30 relative overflow-hidden group font-semibold">
                <span className="relative z-10 flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Bot
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-gold to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 