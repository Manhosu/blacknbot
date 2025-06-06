'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { createClient } from '@/lib/supabase'
import { 
  Monitor, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  Home,
  PlusCircle,
  MessageSquare,
  CreditCard,
  DollarSign,
  Bot,
  Menu,
  Target
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { setUser, setLoading } = useAuthStore()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      setLoading(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Erro no logout:', error)
        return
      }
      
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Erro no logout:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home
    },
    {
      name: 'Meus Bots',
      href: '/dashboard/bots',
      icon: Bot,
      submenu: [
        {
          name: 'Criar Bot',
          href: '/dashboard/bots/create',
          icon: PlusCircle
        },
        {
          name: 'Boas-vindas',
          href: '/dashboard/bots/welcome',
          icon: MessageSquare
        },
        {
          name: 'Planos',
          href: '/dashboard/bots/plans',
          icon: CreditCard
        }
      ]
    },
    {
      name: 'Vendas',
      href: '/dashboard/sales',
      icon: BarChart3
    },
    {
      name: 'Remarketing',
      href: '/dashboard/remarketing',
      icon: Target
    },
    {
      name: 'Clientes',
      href: '/dashboard/customers',
      icon: Users
    },
    {
      name: 'Configurações',
      href: '/dashboard/settings',
      icon: Settings
    }
  ]

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className={`flex flex-col h-screen bg-dark-800/20 backdrop-blur-xl border-r border-dark-600/30 transition-all duration-500 ease-out relative group ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-700/40 via-dark-800/30 to-dark-900/40 backdrop-blur-xl" />
      
      {/* Header */}
      <div className="relative z-10 p-6 border-b border-dark-600/30">
        <div className="flex items-center justify-between">
          {/* Logo section */}
          <div className={`flex items-center transition-all duration-500 ${
            isCollapsed ? 'opacity-0 scale-90 w-0 overflow-hidden' : 'opacity-100 scale-100'
          }`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-emerald flex items-center justify-center mr-3 transform transition-transform duration-500 hover:scale-110">
              <Monitor className="h-5 w-5 text-white" />
            </div>
            <div className="text-lg font-bold bg-gradient-to-r from-primary-400 via-accent-emerald to-accent-gold bg-clip-text text-transparent whitespace-nowrap">
              BLACKINBOT
            </div>
          </div>

          {/* Collapsed logo - shown only when collapsed */}
          {isCollapsed && (
            <div className="absolute left-4 flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-emerald transform transition-all duration-500 hover:scale-110">
              <Monitor className="h-5 w-5 text-white" />
            </div>
          )}
          
          {/* Toggle button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={`text-gray-400 hover:text-white hover:bg-dark-700/50 transition-all duration-300 hover:scale-110 flex-shrink-0 ${
              isCollapsed ? 'ml-auto' : ''
            }`}
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {isCollapsed ? (
              <Menu className="h-4 w-4 transition-transform duration-300" />
            ) : (
              <ChevronLeft className="h-4 w-4 transition-transform duration-300" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => {
          const isActive = isActiveRoute(item.href)
          const Icon = item.icon
          
          return (
            <div 
              key={item.name}
              className={`transition-all duration-500 ease-out transform ${
                hoveredItem === item.name ? 'scale-105' : 'scale-100'
              }`}
              style={{ 
                transitionDelay: `${index * 100}ms` 
              }}
            >
              <Link href={item.href}>
                <div
                  className={`flex items-center w-full p-3 rounded-xl transition-all duration-300 group/item cursor-pointer relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600/20 to-accent-emerald/20 text-primary-300 border border-primary-500/30 shadow-lg shadow-primary-500/20'
                      : 'text-gray-300 hover:bg-dark-700/50 hover:text-primary-300 border border-transparent'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  title={isCollapsed ? item.name : ''}
                >
                  {/* Hover effect background */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-primary-600/10 via-accent-emerald/10 to-accent-gold/10 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 rounded-xl`} />
                  
                  <Icon className={`h-5 w-5 transition-all duration-300 relative z-10 flex-shrink-0 ${
                    isActive 
                      ? 'text-primary-400 scale-110' 
                      : 'text-gray-400 group-hover/item:text-primary-400 group-hover/item:scale-110'
                  }`} />
                  
                  <span className={`ml-3 font-medium transition-all duration-500 relative z-10 whitespace-nowrap ${
                    isCollapsed ? 'opacity-0 translate-x-2 w-0 overflow-hidden' : 'opacity-100 translate-x-0'
                  } ${
                    isActive 
                      ? 'text-primary-300' 
                      : 'group-hover/item:text-primary-300'
                  }`}>
                    {item.name}
                  </span>

                  {/* Active indicator */}
                  {isActive && !isCollapsed && (
                    <div className="absolute right-2 w-2 h-2 rounded-full bg-gradient-to-r from-primary-400 to-accent-emerald animate-pulse" />
                  )}

                  {/* Active indicator for collapsed state */}
                  {isActive && isCollapsed && (
                    <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 rounded-full bg-gradient-to-b from-primary-400 to-accent-emerald" />
                  )}
                </div>
              </Link>

              {/* Submenu - only show when not collapsed */}
              {item.submenu && isActive && !isCollapsed && (
                <div className="ml-6 mt-2 space-y-1 animate-in slide-in-from-left duration-300">
                  {item.submenu.map((subitem, subIndex) => {
                    const SubIcon = subitem.icon
                    const isSubActive = pathname === subitem.href
                    
                    return (
                      <Link key={subitem.name} href={subitem.href}>
                        <div 
                          className={`flex items-center p-2 rounded-lg transition-all duration-300 group/subitem ${
                            isSubActive
                              ? 'bg-primary-600/20 text-primary-300 border-l-2 border-primary-400'
                              : 'text-gray-400 hover:bg-dark-700/30 hover:text-primary-300 border-l-2 border-transparent hover:border-primary-400/50'
                          }`}
                          style={{ 
                            transitionDelay: `${subIndex * 50}ms` 
                          }}
                        >
                          <SubIcon className={`h-4 w-4 transition-all duration-300 ${
                            isSubActive 
                              ? 'text-primary-400' 
                              : 'text-gray-500 group-hover/subitem:text-primary-400'
                          }`} />
                          <span className={`ml-2 text-sm transition-colors duration-300 ${
                            isSubActive 
                              ? 'text-primary-300' 
                              : 'group-hover/subitem:text-primary-300'
                          }`}>
                            {subitem.name}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer/Logout */}
      <div className="relative z-10 p-4 border-t border-dark-600/30">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={`w-full ${isCollapsed ? 'justify-center px-3' : 'justify-start'} text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-all duration-300 rounded-xl group hover:scale-105`}
          title={isCollapsed ? 'Sair' : ''}
        >
          <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 flex-shrink-0" />
          <span className={`ml-3 transition-all duration-500 whitespace-nowrap ${
            isCollapsed ? 'opacity-0 translate-x-2 w-0 overflow-hidden' : 'opacity-100 translate-x-0'
          }`}>
            Sair
          </span>
        </Button>
      </div>

      {/* Floating particles for visual effect - only render on client with predefined positions */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            {left: '20%', top: '30%', width: '2px', height: '2px', color: 'rgba(139, 92, 246, 0.5)', delay: '0.5s', duration: '3.5s'},
            {left: '80%', top: '70%', width: '3px', height: '3px', color: 'rgba(168, 85, 247, 0.5)', delay: '1.2s', duration: '4s'},
            {left: '40%', top: '80%', width: '1px', height: '1px', color: 'rgba(16, 185, 129, 0.5)', delay: '1.8s', duration: '2.5s'},
            {left: '70%', top: '20%', width: '2px', height: '2px', color: 'rgba(139, 92, 246, 0.5)', delay: '0.8s', duration: '3.2s'},
            {left: '10%', top: '60%', width: '3px', height: '3px', color: 'rgba(168, 85, 247, 0.5)', delay: '1.5s', duration: '2.8s'},
            {left: '90%', top: '40%', width: '1px', height: '1px', color: 'rgba(16, 185, 129, 0.5)', delay: '0.3s', duration: '4.2s'}
          ].map((particle, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20 animate-pulse"
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.width,
                height: particle.height,
                backgroundColor: particle.color,
                animationDelay: particle.delay,
                animationDuration: particle.duration
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
} 