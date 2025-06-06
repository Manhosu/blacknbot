'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ModernLayoutProps {
  children: React.ReactNode
  showParticles?: boolean
  className?: string
}

export default function ModernLayout({ 
  children, 
  showParticles = false,
  className = '' 
}: ModernLayoutProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Render sem animações durante a hidratação
  if (!mounted) {
    return (
      <div className={`min-h-screen bg-gradient-dark ${className}`}>
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen relative overflow-hidden bg-gradient-dark ${className}`}>
      {/* Grid de fundo sutil - estático */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(85, 119, 170, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(85, 119, 170, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Gradientes radiais de fundo - estáticos */}
      <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-accent-emerald/5 rounded-full blur-3xl pointer-events-none" />

      {/* Conteúdo principal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  )
}

// Componente para seções animadas
interface AnimatedSectionProps {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
}

export function AnimatedSection({ 
  children, 
  delay = 0, 
  direction = 'up',
  className = '' 
}: AnimatedSectionProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const directions = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 }
  }

  if (!mounted) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        ...directions[direction]
      }}
      whileInView={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Componente para cards modernos
interface ModernCardProps {
  children: React.ReactNode
  hover?: boolean
  glow?: boolean
  className?: string
  onClick?: () => void
}

export function ModernCard({ 
  children, 
  hover = true, 
  glow = false,
  className = '',
  onClick 
}: ModernCardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className={`
          glass rounded-2xl p-6 border border-glass-border
          ${className}
        `}
        onClick={onClick}
      >
        {children}
      </div>
    )
  }

  return (
    <motion.div
      whileHover={hover ? { 
        y: -4, 
        scale: 1.02,
        boxShadow: glow ? 
          "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(85, 119, 170, 0.3)" :
          "0 20px 40px rgba(0, 0, 0, 0.4)"
      } : {}}
      whileTap={{ scale: 0.98 }}
      className={`
        glass rounded-2xl p-6 border border-glass-border
        transition-all duration-300 cursor-pointer
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

// Componente para botões modernos
interface ModernButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export function ModernButton({ 
  children, 
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  type = 'button'
}: ModernButtonProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white border-primary-400/20',
    secondary: 'bg-dark-700/50 text-dark-100 border-dark-500 hover:bg-dark-600/50',
    accent: 'bg-gradient-to-r from-accent-emerald to-accent-gold text-white border-accent-emerald/20',
    ghost: 'bg-transparent text-dark-200 border-transparent hover:bg-dark-700/30'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  if (!mounted) {
    return (
      <button
        className={`
          relative overflow-hidden rounded-xl font-medium
          border transition-all duration-300 ease-out
          ${variants[variant]}
          ${sizes[size]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-lg'}
          ${className}
        `}
        onClick={disabled ? undefined : onClick}
        disabled={disabled || loading}
        type={type}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
          )}
          {children}
        </span>
      </button>
    )
  }

  return (
    <motion.button
      whileHover={{ 
        scale: disabled ? 1 : 1.05,
        y: disabled ? 0 : -2
      }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        relative overflow-hidden rounded-xl font-medium
        border transition-all duration-300 ease-out
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-lg hover:shadow-glow'}
        ${className}
      `}
      onClick={disabled ? undefined : onClick}
      disabled={disabled || loading}
      type={type}
    >
      {/* Efeito de brilho ao hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      {/* Conteúdo do botão */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
        )}
        {children}
      </span>
    </motion.button>
  )
}

// Componente para inputs modernos
interface ModernInputProps {
  label?: string
  placeholder?: string
  type?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  icon?: React.ReactNode
  className?: string
}

export function ModernInput({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  icon,
  className = ''
}: ModernInputProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-dark-200">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400">
              {icon}
            </div>
          )}
          
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`
              input-modern
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-accent-red focus:border-accent-red focus:ring-accent-red/20' : ''}
            `}
          />
        </div>
        
        {error && (
          <p className="text-sm text-accent-red">
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-dark-200">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400">
            {icon}
          </div>
        )}
        
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            input-modern
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-accent-red focus:border-accent-red focus:ring-accent-red/20' : ''}
          `}
        />
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-accent-red"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
} 