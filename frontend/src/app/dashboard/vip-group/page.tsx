'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Users, Info, Link as LinkIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Bot {
  id: string
  bot_token: string
  bot_username: string
  vip_chat_id: string | null
  vip_type: 'group' | 'channel' | null
  vip_name: string | null
}

export default function VipGroupPage() {
  const [bots, setBots] = useState<Bot[]>([])
  const [selectedBotId, setSelectedBotId] = useState<string>('')
  const [chatInput, setChatInput] = useState('')
  const [chatType, setChatType] = useState<'group' | 'channel'>('group')
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | '', text: string }>({ type: '', text: '' })

  const supabase = createClient()

  useEffect(() => {
    loadUserBots()
  }, [])

  const loadUserBots = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: botsData, error } = await supabase
        .from('bots')
        .select('id, bot_token, bot_username, vip_chat_id, vip_type, vip_name')
        .eq('user_id', user.id)

      if (error) throw error

      setBots(botsData || [])
      if (botsData && botsData.length > 0) {
        setSelectedBotId(botsData[0].id)
      }
    } catch (error) {
      console.error('Erro ao carregar bots:', error)
    } finally {
      setLoading(false)
    }
  }

  const extractGroupId = (input: string): string | null => {
    const trimmed = input.trim()
    
    // Se já é um ID numérico (começa com -)
    if (trimmed.match(/^-\d+$/)) {
      return trimmed
    }
    
    // Link público: https://t.me/nomeogrupo
    const publicMatch = trimmed.match(/(?:https?:\/\/)?t\.me\/([a-zA-Z0-9_]+)/i)
    if (publicMatch) {
      return `@${publicMatch[1]}`
    }
    
    // Link privado: https://t.me/+codigo ou https://t.me/joinchat/codigo
    const privateMatch = trimmed.match(/(?:https?:\/\/)?t\.me\/(?:\+|joinchat\/)([a-zA-Z0-9_-]+)/i)
    if (privateMatch) {
      return privateMatch[1]
    }
    
    return null
  }

  const validateBotInChat = async (botId: string, chatIdentifier: string, chatType: 'group' | 'channel') => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Sessão não encontrada')
      }

      const response = await fetch(`http://localhost:8000/dashboard/bots/${botId}/validate-vip-group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          chat_type: chatType,
          chat_identifier: chatIdentifier
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.detail || 'Erro na validação')
      }

      return {
        success: data.success,
        chatId: data.group_info.chat_id,
        groupTitle: data.group_info.title,
        message: data.message
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  const handleActivateChat = async () => {
    if (!selectedBotId || !chatInput.trim()) {
      setMessage({ type: 'error', text: `Selecione um bot e insira o link ou ID do ${chatType === 'group' ? 'grupo' : 'canal'}` })
      return
    }

    setActivating(true)
    setMessage({ type: '', text: '' })

    try {
      const selectedBot = bots.find(bot => bot.id === selectedBotId)
      if (!selectedBot) {
        throw new Error('Bot selecionado não encontrado')
      }

      const chatIdentifier = extractGroupId(chatInput)
      if (!chatIdentifier) {
        throw new Error(`Formato do link ou ID do ${chatType === 'group' ? 'grupo' : 'canal'} inválido`)
      }

      // Validar se o bot tem acesso ao chat
      const validation = await validateBotInChat(selectedBotId, chatIdentifier, chatType)
      
      if (!validation.success) {
        throw new Error(validation.error || 'Falha na validação')
      }

      // Atualizar o estado local (o backend já salvou no banco)
      setBots(prev => prev.map(bot => 
        bot.id === selectedBotId 
          ? { 
              ...bot, 
              vip_chat_id: validation.chatId, 
              vip_type: chatType,
              vip_name: validation.groupTitle 
            }
          : bot
      ))

      setMessage({ 
        type: 'success', 
        text: validation.message || `✅ ${chatType === 'group' ? 'Grupo' : 'Canal'} VIP "${validation.groupTitle}" ativado com sucesso!` 
      })
      setChatInput('')

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `⚠️ ${error instanceof Error ? error.message : `Erro ao ativar ${chatType === 'group' ? 'grupo' : 'canal'} VIP`}` 
      })
    } finally {
      setActivating(false)
    }
  }

  const selectedBot = bots.find(bot => bot.id === selectedBotId)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Configurar Canal ou Grupo VIP</h1>
        <p className="text-gray-400 mt-2">
          Configure o canal ou grupo VIP onde os usuários que comprarem seus planos serão adicionados automaticamente.
        </p>
      </div>

      {bots.length === 0 ? (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Nenhum bot encontrado</h3>
                             <p className="text-gray-400 mb-4">
                 Você precisa criar um bot primeiro para configurar o canal ou grupo VIP.
               </p>
              <Button onClick={() => window.location.href = '/dashboard/bots/create'}>
                Criar Primeiro Bot
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuração */}
          <Card className="bg-gray-900 border-gray-700">
                         <CardHeader>
               <CardTitle className="text-white">Ativar Canal ou Grupo VIP</CardTitle>
               <CardDescription className="text-gray-400">
                 Para ativar seu {chatType === 'group' ? 'grupo' : 'canal'} VIP, adicione seu bot ao {chatType === 'group' ? 'grupo como administrador' : 'canal com permissões de administrador'}.
                 Depois, cole o link ou o ID do {chatType === 'group' ? 'grupo' : 'canal'} abaixo:
               </CardDescription>
             </CardHeader>
            <CardContent className="space-y-4">
              {/* Seleção do Bot */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Selecionar Bot
                </label>
                <select
                  value={selectedBotId}
                  onChange={(e) => setSelectedBotId(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white"
                >
                  {bots.map(bot => (
                    <option key={bot.id} value={bot.id}>
                      @{bot.bot_username}
                    </option>
                  ))}
                </select>
                             </div>

               {/* Seleção do Tipo de Chat */}
               <div>
                 <label className="text-sm font-medium text-gray-300 mb-2 block">
                   Tipo de Chat VIP
                 </label>
                 <div className="flex space-x-4">
                   <label className="flex items-center space-x-2">
                     <input
                       type="radio"
                       name="chatType"
                       value="group"
                       checked={chatType === 'group'}
                       onChange={(e) => setChatType(e.target.value as 'group' | 'channel')}
                       className="text-blue-500"
                     />
                     <span className="text-gray-300">Grupo</span>
                   </label>
                   <label className="flex items-center space-x-2">
                     <input
                       type="radio"
                       name="chatType"
                       value="channel"
                       checked={chatType === 'channel'}
                       onChange={(e) => setChatType(e.target.value as 'group' | 'channel')}
                       className="text-blue-500"
                     />
                     <span className="text-gray-300">Canal</span>
                   </label>
                 </div>
               </div>

               {/* Input do Chat */}
               <div>
                                 <label className="text-sm font-medium text-gray-300 mb-2 block">
                   Link ou ID do {chatType === 'group' ? 'Grupo' : 'Canal'}
                 </label>
                 <Input
                   type="text"
                   placeholder={chatType === 'group' ? 'https://t.me/seugrupovip ou -1001234567890' : 'https://t.me/seucanal ou @seucanal'}
                   value={chatInput}
                   onChange={(e) => setChatInput(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
                                 <div className="flex items-center mt-2 text-xs text-gray-400">
                   <Info className="h-3 w-3 mr-1" />
                   <span>Como encontrar o ID do {chatType === 'group' ? 'grupo' : 'canal'}?</span>
                 </div>
              </div>

              {/* Mensagem de Status */}
              {message.text && (
                <Alert className={`${
                  message.type === 'success' 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-red-500 bg-red-500/10'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <AlertDescription className={`${
                    message.type === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

                             <Button 
                 onClick={handleActivateChat} 
                 disabled={activating || !selectedBotId || !chatInput.trim()}
                 className="w-full"
               >
                 <Users className="mr-2 h-4 w-4" />
                 {activating ? 'Ativando...' : `Ativar ${chatType === 'group' ? 'Grupo' : 'Canal'}`}
               </Button>
            </CardContent>
          </Card>

          {/* Status Atual */}
                     <Card className="bg-gray-900 border-gray-700">
             <CardHeader>
               <CardTitle className="text-white">Status do Chat VIP</CardTitle>
               <CardDescription className="text-gray-400">
                 Informações sobre o canal ou grupo VIP configurado
               </CardDescription>
             </CardHeader>
            <CardContent>
              {selectedBot ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Bot Selecionado</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">@{selectedBot.bot_username}</Badge>
                    </div>
                  </div>

                                     <div>
                     <h3 className="text-sm font-medium text-gray-300 mb-2">Status do Chat VIP</h3>
                     {selectedBot.vip_chat_id ? (
                       <div>
                         <div className="flex items-center space-x-2">
                           <CheckCircle className="h-4 w-4 text-green-500" />
                           <span className="text-green-400">Ativo</span>
                           <Badge variant="outline" className="text-xs">
                             {selectedBot.vip_type === 'group' ? 'Grupo' : 'Canal'}
                           </Badge>
                           <Badge variant="outline" className="text-xs">
                             ID: {selectedBot.vip_chat_id}
                           </Badge>
                         </div>
                         {selectedBot.vip_name && (
                           <div className="mt-1">
                             <span className="text-sm text-gray-300">
                               Nome: {selectedBot.vip_name}
                             </span>
                           </div>
                         )}
                       </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <span className="text-yellow-400">Não configurado</span>
                      </div>
                    )}
                  </div>

                                     {selectedBot.vip_chat_id && (
                     <div className="bg-gray-800 rounded-lg p-3">
                       <p className="text-sm text-gray-300">
                         <strong>Como funciona:</strong><br />
                         Quando um usuário comprar um plano através do seu bot, ele será automaticamente adicionado ao {selectedBot.vip_type === 'group' ? 'grupo' : 'canal'} VIP configurado.
                       </p>
                     </div>
                   )}
                </div>
              ) : (
                <p className="text-gray-400">Selecione um bot para ver o status</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Informações de Ajuda */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Como configurar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-300">
                         <div>
               <h4 className="font-medium text-white mb-2">📋 Passos para configuração:</h4>
               <ol className="list-decimal list-inside space-y-1 ml-4">
                 <li>Crie um {chatType === 'group' ? 'grupo' : 'canal'} no Telegram</li>
                 <li>Adicione seu bot ao {chatType === 'group' ? 'grupo' : 'canal'}</li>
                 <li>Promova o bot para administrador{chatType === 'channel' ? ' com permissões de adicionar membros' : ''}</li>
                 <li>Copie o link ou encontre o ID do {chatType === 'group' ? 'grupo' : 'canal'}</li>
                 <li>Cole aqui e clique em "Ativar {chatType === 'group' ? 'Grupo' : 'Canal'}"</li>
               </ol>
             </div>
            
                         <div>
               <h4 className="font-medium text-white mb-2">🔗 Tipos de link aceitos:</h4>
               <ul className="space-y-1 ml-4">
                 <li><strong>Link público:</strong> https://t.me/{chatType === 'group' ? 'seugrupovip' : 'seucanal'}</li>
                 <li><strong>Link privado:</strong> https://t.me/+ABC123xyz</li>
                 <li><strong>ID numérico:</strong> -1001234567890</li>
                 {chatType === 'channel' && (
                   <li><strong>Username:</strong> @seucanal</li>
                 )}
               </ul>
             </div>

                         <div>
               <h4 className="font-medium text-white mb-2">❓ Como encontrar o ID do {chatType === 'group' ? 'grupo' : 'canal'}:</h4>
               <p className="ml-4">
                 Adicione o bot <Badge variant="outline">@userinfobot</Badge> ao seu {chatType === 'group' ? 'grupo' : 'canal'} e ele mostrará o ID automaticamente.
               </p>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}