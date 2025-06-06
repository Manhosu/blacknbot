'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DeleteBotModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  botUsername: string
  isDeleting?: boolean
}

export function DeleteBotModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  botUsername, 
  isDeleting = false 
}: DeleteBotModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setConfirmText('')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const isConfirmValid = confirmText === 'EXCLUIR'

  const handleConfirm = () => {
    if (isConfirmValid && !isDeleting) {
      onConfirm()
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isDeleting) {
      onClose()
    }
    if (e.key === 'Enter' && isConfirmValid && !isDeleting) {
      onConfirm()
    }
  }

  if (!mounted || !isOpen) return null

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative bg-dark-800 rounded-2xl border border-dark-600/50 shadow-2xl w-full max-w-md transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Confirmar Exclusão
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              Tem certeza que deseja excluir o bot{' '}
              <span className="text-red-400 font-mono">@{botUsername}</span>?
            </h3>
          </div>

          {/* Warning */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-red-300 font-medium">
                  Esta ação é IRREVERSÍVEL e irá:
                </p>
                <ul className="text-red-200 text-sm space-y-1">
                  <li>• Remover o bot permanentemente</li>
                  <li>• Excluir todos os planos criados</li>
                  <li>• Excluir histórico de vendas</li>
                  <li>• Cancelar todas as assinaturas ativas</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Digite <span className="text-red-400 font-mono font-bold">EXCLUIR</span> para confirmar:
            </label>
            <Input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Digite EXCLUIR para confirmar"
              disabled={isDeleting}
              className="bg-dark-700/50 border-dark-600/50 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20 font-mono"
              autoFocus
            />
            {confirmText && confirmText !== 'EXCLUIR' && (
              <p className="text-red-400 text-xs">
                Você deve digitar exatamente "EXCLUIR" (em maiúsculas)
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-dark-600/30 bg-dark-800/50 rounded-b-2xl">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="bg-transparent border-dark-600/50 text-gray-300 hover:bg-dark-700/50 hover:border-gray-500 transition-colors"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isConfirmValid || isDeleting}
            className={`transition-all duration-300 ${
              isConfirmValid 
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed border-gray-600'
            }`}
          >
            {isDeleting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Excluindo...</span>
              </div>
            ) : (
              'Confirmar Exclusão'
            )}
          </Button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
} 