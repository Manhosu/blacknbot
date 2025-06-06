'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ClientOnly from '@/components/ClientOnly'
import {
  RocketLaunchIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  PlayIcon,
  ArrowRightIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState({
    'hero-title': false,
    'hero-subtitle': false,
    'hero-buttons': false,
    'hero-stats': false,
    'features-title': false,
    'features-grid': false,
    'cta-section': false
  })

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const features = [
    {
      icon: <CurrencyDollarIcon className="w-8 h-8" />,
      title: 'Pagamentos Integrados',
      description: 'Receba pagamentos automaticamente e monetize seus grupos com facilidade',
      gradient: 'from-accent-gold to-accent-orange'
    },
    {
      icon: <UsersIcon className="w-8 h-8" />,
      title: 'Gestão de Membros',
      description: 'Adicione e remova usuários automaticamente dos grupos VIP',
      gradient: 'from-accent-purple to-primary-600'
    },
    {
      icon: <ChartBarIcon className="w-8 h-8" />,
      title: 'Analytics de Vendas',
      description: 'Acompanhe suas vendas e ganhos em tempo real com relatórios detalhados',
      gradient: 'from-primary-600 to-accent-emerald'
    },
    {
      icon: <CogIcon className="w-8 h-8" />,
      title: 'Customização Total',
      description: 'Personalize mensagens, planos e toda experiência do usuário',
      gradient: 'from-accent-emerald to-primary-500'
    },
    {
      icon: <RocketLaunchIcon className="w-8 h-8" />,
      title: 'Setup Rápido',
      description: 'Configure seu bot em minutos sem conhecimento técnico',
      gradient: 'from-primary-500 to-accent-purple'
    }
  ]

  const stats = [
    { label: 'Bots Criados', value: '1,200+', icon: <RocketLaunchIcon className="w-6 h-6" /> },
    { label: 'Vendas Processadas', value: 'R$ 2.5M+', icon: <CurrencyDollarIcon className="w-6 h-6" /> },
    { label: 'Usuários Ativos', value: '50K+', icon: <UsersIcon className="w-6 h-6" /> },
    { label: 'Uptime', value: '99.9%', icon: <ShieldCheckIcon className="w-6 h-6" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-dark text-white relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900" />
        
        {/* Animated mesh gradient */}
        <div className="absolute inset-0 opacity-60">
          <div 
            className="absolute top-0 left-0 w-full h-full"
            style={{
              background: `
                radial-gradient(ellipse 800px 600px at 50% 0%, rgba(85, 119, 170, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse 600px 400px at 80% 100%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                radial-gradient(ellipse 400px 300px at 20% 100%, rgba(245, 158, 11, 0.08) 0%, transparent 50%)
              `
            }}
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20 animate-float"
              style={{
                left: `${(i * 7 + 10) % 90}%`,
                top: `${(i * 11 + 15) % 80}%`,
                width: `${(i % 3) + 2}px`,
                height: `${(i % 3) + 2}px`,
                backgroundColor: ['#5577AA', '#10B981', '#F59E0B'][i % 3],
                animationDelay: `${(i * 2) % 15}s`,
                animationDuration: `${15 + (i % 10)}s`
              }}
            />
          ))}
        </div>

        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(85, 119, 170, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(85, 119, 170, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: `translate(${scrollY * 0.1}px, ${scrollY * 0.1}px)`
          }}
        />

        {/* Dynamic light effects */}
        <div 
          className="absolute inset-0"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        >
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-2xl animate-pulse-soft" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-accent-emerald/8 rounded-full blur-2xl animate-float" />
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-accent-gold/6 rounded-full blur-2xl" 
               style={{ animationDelay: '2s' }} />
        </div>

        {/* Parallax layers */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            transform: `translateY(${scrollY * 0.2}px)`,
            backgroundImage: `radial-gradient(2px 2px at 40px 60px, rgba(85, 119, 170, 0.3), transparent),
                             radial-gradient(2px 2px at 90px 30px, rgba(16, 185, 129, 0.2), transparent),
                             radial-gradient(1px 1px at 160px 80px, rgba(245, 158, 11, 0.3), transparent)`,
            backgroundSize: '200px 200px'
          }}
        />
      </div>
      
      <div className="relative z-10">
        {/* Header/Navbar */}
        <nav 
          className="fixed top-0 w-full z-50 transition-all duration-500"
          style={{
            backgroundColor: `rgba(10, 10, 11, ${Math.min(scrollY / 80, 0.95)})`,
            backdropFilter: `blur(${Math.min(scrollY / 8, 24)}px)`,
            borderBottom: `1px solid rgba(85, 119, 170, ${Math.min(scrollY / 150, 0.2)})`,
            boxShadow: scrollY > 50 ? '0 8px 32px rgba(0, 0, 0, 0.5)' : 'none'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
                              <div className="flex items-center space-x-4">
                <div 
                  className="w-14 h-14 bg-gradient-to-br from-primary-500 via-accent-emerald to-accent-gold rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg animate-glow-pulse"
                  style={{
                    transform: `rotate(${scrollY * 0.05}deg)`,
                    boxShadow: '0 0 30px rgba(85, 119, 170, 0.4), 0 0 60px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  <CommandLineIcon className="w-8 h-8 text-white" />
                </div>
                <span 
                  className="text-3xl font-black tracking-tight text-white"
                  style={{
                    background: 'linear-gradient(90deg, #ffffff 0%, #10b981 50%, #f59e0b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  BLACKINBOT
                </span>
          </div>
              
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login" 
                  className="px-6 py-2.5 text-sm bg-transparent text-dark-200 border border-primary-500/30 hover:bg-primary-500/10 hover:border-primary-400 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                >
                Entrar
            </Link>
                <Link 
                  href="/cadastro" 
                  className="px-6 py-2.5 text-sm bg-gradient-to-r from-primary-600 to-accent-emerald text-white border border-primary-400/20 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-primary-500/30 relative overflow-hidden group"
                >
                  <span className="relative z-10">Começar Agora</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-emerald to-accent-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>
        </div>
          </div>
        </nav>

      {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 pt-20 relative">
          {/* Hero background glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[800px] h-[400px] bg-gradient-to-r from-primary-500/5 via-accent-emerald/5 to-accent-gold/5 rounded-full blur-3xl" />
          </div>
          
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <div 
              data-animate 
              id="hero-title"
              className={`transition-all duration-1000 ease-out ${
                isVisible['hero-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-500/20 to-accent-emerald/20 border border-primary-500/30 text-sm text-primary-300 mb-8 backdrop-blur-sm">
                  <CommandLineIcon className="w-4 h-4 mr-2" />
                  Sistema Completo de Monetização
                </span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
                <span 
                  className="block mb-4 text-white font-black"
                  style={{
                    color: '#ffffff',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
                  }}
                >
                  Monetize seus
                </span>
                <span 
                  className="block relative font-black text-emerald-400"
                  style={{
                    background: 'linear-gradient(90deg, #10b981 0%, #f59e0b 70%, #ef4444 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 1px 2px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <span className="typing-animation inline-block">
                    Grupos do Telegram
                  </span>
                </span>
          </h1>
            </div>
            
            <div 
              data-animate 
              id="hero-subtitle"
              className={`transition-all duration-1000 ease-out delay-300 ${
                isVisible['hero-subtitle'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <p className="text-xl md:text-2xl text-white mb-12 max-w-4xl mx-auto leading-relaxed font-medium" style={{
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
              }}>
                Plataforma completa para criar, gerenciar e monetizar bots do Telegram.<br/>
                <span className="text-emerald-300 font-bold" style={{
                  textShadow: '0 0 20px rgba(16, 185, 129, 0.4), 0 2px 4px rgba(0, 0, 0, 0.8)'
                }}>Sistema de pagamentos integrado e dashboard profissional.</span>
              </p>
            </div>
            
            <div 
              data-animate 
              id="hero-buttons"
              className={`transition-all duration-1000 ease-out delay-500 ${
                isVisible['hero-buttons'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Link 
                  href="/cadastro" 
                  className="w-full sm:w-auto px-8 py-4 text-lg bg-gradient-to-r from-primary-600 via-accent-emerald to-accent-gold text-white border border-primary-400/20 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 hover:scale-105 hover:shadow-primary-500/30 relative overflow-hidden group font-semibold"
                >
                  <PlayIcon className="w-6 h-6" />
                  <span className="relative z-10">Começar Gratuitamente</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-gold to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
                <Link 
                  href="#features" 
                  className="w-full sm:w-auto px-8 py-4 text-lg bg-dark-700/50 text-dark-100 border border-primary-500/30 hover:bg-primary-500/10 hover:border-primary-400 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 hover:scale-105 scroll-smooth backdrop-blur-sm font-medium"
                >
                  Ver Recursos
                  <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>

            {/* Stats */}
            <div 
              data-animate 
              id="hero-stats"
              className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto transition-all duration-1000 ease-out delay-700 ${
                isVisible['hero-stats'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              {stats.map((stat, index) => (
                <div 
                  key={stat.label} 
                  className={`text-center transition-all duration-1000 ease-out ${
                    isVisible['hero-stats'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                  }`}
                  style={{ 
                    transitionDelay: `${700 + index * 100}ms`
                  }}
                >
                  <div className="bg-dark-700/30 backdrop-blur-xl rounded-2xl p-6 border border-dark-600/30 hover:bg-dark-600/40 transition-all duration-300 hover:scale-105">
                    <div className="flex justify-center mb-3 text-primary-400">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {stat.value}
          </div>
                    <div className="text-dark-300 text-sm">
                      {stat.label}
        </div>
                  </div>
                </div>
              ))}
                  </div>
                </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div 
              data-animate 
              id="features-title"
              className={`text-center mb-16 transition-all duration-1000 ease-out ${
                isVisible['features-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-400 to-accent-emerald bg-clip-text text-transparent mb-6">
                Recursos Poderosos
              </h2>
              <p className="text-xl text-dark-300 max-w-3xl mx-auto">
                Tudo que você precisa para criar e monetizar bots profissionais do Telegram
                    </p>
                  </div>

            <div 
              data-animate 
              id="features-grid"
              className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto transition-all duration-1000 ease-out ${
                isVisible['features-grid'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              {features.map((feature, index) => (
                <div 
                  key={feature.title} 
                  className="bg-dark-700/30 backdrop-blur-xl rounded-2xl p-6 border border-dark-600/30 h-full hover:bg-dark-600/40 transition-all duration-500 group hover:scale-105 hover:shadow-xl min-h-[200px] flex flex-col"
                  style={{ 
                    transitionDelay: `${index * 80}ms`,
                  }}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-primary-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-dark-300 leading-relaxed group-hover:text-dark-200 transition-colors duration-300 flex-grow">
                    {feature.description}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div 
              data-animate 
              id="cta-section"
              className={`bg-dark-700/30 backdrop-blur-xl rounded-3xl p-12 text-center border border-dark-600/30 relative overflow-hidden transition-all duration-1000 ease-out ${
                isVisible['cta-section'] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
              }`}
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-accent-emerald/10 rounded-3xl" />
              
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-400 to-accent-emerald bg-clip-text text-transparent mb-6">
                  Pronto para Começar?
                </h2>
                
                <p className="text-xl text-dark-300 mb-10 max-w-2xl mx-auto">
                  Junte-se a milhares de empreendedores que já estão monetizando 
                  seus grupos do Telegram com nossa plataforma.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link 
                    href="/cadastro" 
                    className="w-full sm:w-auto px-8 py-4 text-lg bg-gradient-to-r from-accent-emerald to-accent-gold text-white border border-accent-emerald/20 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
                  >
                    <RocketLaunchIcon className="w-5 h-5" />
                    Criar Conta Grátis
                  </Link>
                  <Link 
                    href="/login" 
                    className="w-full sm:w-auto px-8 py-4 text-lg bg-transparent text-dark-200 border border-dark-600 hover:bg-dark-700/30 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
                  >
                    Já tenho conta
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                </div>
          </div>
        </div>
        </div>
      </section>

      {/* Footer */}
        <footer className="py-12 px-4 border-t border-dark-600/30">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-emerald rounded-lg flex items-center justify-center">
                <CommandLineIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-emerald bg-clip-text text-transparent">
                BLACKINBOT
              </span>
          </div>
            <p className="text-dark-400 text-sm">
            © 2024 BlackinBot. Todos os direitos reservados.
          </p>
        </div>
      </footer>
      </div>
    </div>
  )
}
