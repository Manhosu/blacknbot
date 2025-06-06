'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { Bot, AlertTriangle, CheckCircle, Loader2, ExternalLink, Plus, Trash2, ArrowRight, ArrowLeft, MessageCircle, Settings, Rocket, User, Key, Shield, Upload, Image, Video, X } from 'lucide-react'

interface PushinPayValidation {
  isValid: boolean
  isLoading: boolean
  error: string | null
}

interface BotValidation {
  isValid: boolean
  isLoading: boolean
  error: string | null
  botInfo: any
}

export default function CreateBotPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const supabase = createClient()

  // Estados do wizard
  const [currentStep, setCurrentStep] = useState(0) // 0: intro step1, 1: step1, 2: intro step2, 3: step2, 4: intro step3, 5: step3
  const [showInstructions, setShowInstructions] = useState(true)

  // Estados do formulário
  const [botToken, setBotToken] = useState('')
  const [botName, setBotName] = useState('')
  const [botDescription, setBotDescription] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [plans, setPlans] = useState([{ name: '', price: '', duration_days: 30 }])
  const [isCreating, setIsCreating] = useState(false)
  
  // Estados da mídia
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [planErrors, setPlanErrors] = useState<{[key: number]: string}>({})

  // Estados de validação
  const [pushinPayValidation, setPushinPayValidation] = useState<PushinPayValidation>({
    isValid: false,
    isLoading: true,
    error: null
  })
  
  const [botValidation, setBotValidation] = useState<BotValidation>({
    isValid: false,
    isLoading: false,
    error: null,
    botInfo: null
  })

  // Validar token PushinPay na inicialização
  useEffect(() => {
    if (user) {
      validatePushinPayToken()
    }
  }, [user])

  // Validar bot token quando mudar
  useEffect(() => {
    if (botToken.trim()) {
      validateBotToken(botToken)
    } else {
      setBotValidation({
        isValid: false,
        isLoading: false,
        error: null,
        botInfo: null
      })
    }
  }, [botToken])

  const validatePushinPayToken = async () => {
    setPushinPayValidation(prev => ({ ...prev, isLoading: true }))
    
    try {
      // Verificar se o usuário está autenticado primeiro
      const { data: { user: currentUser }, error: authErr } = await supabase.auth.getUser()
      
      if (authErr || !currentUser) {
        setPushinPayValidation({
          isValid: false,
          isLoading: false,
          error: 'Usuário não está logado'
        })
        return
      }

      // Buscar token do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('pushinpay_token')
        .eq('id', currentUser.id)
        .single()

      if (userError || !userData?.pushinpay_token) {
        // Agora exigindo PushinPay obrigatoriamente
        setPushinPayValidation({
          isValid: false,
          isLoading: false,
          error: 'Token PushinPay não configurado'
        })
        return
      }

      // Fazer uma requisição básica para validar o token
      const response = await fetch('/api/validate-pushinpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: userData.pushinpay_token
        })
      })

      if (response.ok) {
        setPushinPayValidation({
          isValid: true,
          isLoading: false,
          error: null
        })
      } else {
        setPushinPayValidation({
          isValid: false,
          isLoading: false,
          error: 'Token PushinPay inválido'
        })
      }
    } catch (error) {
      console.error('Erro ao validar PushinPay:', error)
      setPushinPayValidation({
        isValid: false,
        isLoading: false,
        error: 'Erro ao validar token PushinPay'
      })
    }
  }

  const validateBotToken = async (token: string) => {
    setBotValidation(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Validar token via API do Telegram
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`)
      const data = await response.json()

      if (response.ok && data.ok) {
        setBotValidation({
          isValid: true,
          isLoading: false,
          error: null,
          botInfo: data.result
        })
        
        // Auto-preencher o nome se não estiver preenchido
        if (!botName && data.result.first_name) {
          setBotName(data.result.first_name)
        }
      } else {
        setBotValidation({
          isValid: false,
          isLoading: false,
          error: 'Token do bot inválido. Verifique se você copiou corretamente do @BotFather.',
          botInfo: null
        })
      }
    } catch (error) {
      setBotValidation({
        isValid: false,
        isLoading: false,
        error: 'Erro ao validar token do bot. Verifique sua conexão.',
        botInfo: null
      })
    }
  }

  const addPlan = () => {
    setPlans([...plans, { name: '', price: '', duration_days: 30 }])
  }

  const removePlan = (index: number) => {
    if (plans.length > 1) {
      setPlans(plans.filter((_, i) => i !== index))
    }
  }

  const validatePlanPrice = (price: string): string | null => {
    const numPrice = parseFloat(price)
    const MIN_PRICE = 4.90
    
    if (isNaN(numPrice) || numPrice < MIN_PRICE) {
      return `⚠️ O valor mínimo para o plano é R$${MIN_PRICE.toFixed(2)}. Insira um valor maior.`
    }
    
    return null
  }

  const updatePlan = (index: number, field: string, value: string | number) => {
    const updatedPlans = [...plans]
    updatedPlans[index] = { ...updatedPlans[index], [field]: value }
    setPlans(updatedPlans)
    
    // Validar preço se o campo alterado for 'price'
    if (field === 'price') {
      const newErrors = { ...planErrors }
      const error = validatePlanPrice(value as string)
      
      if (error) {
        newErrors[index] = error
      } else {
        delete newErrors[index]
      }
      
      setPlanErrors(newErrors)
    }
  }

  // Funções para mídia
  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Verificar tipo de arquivo
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    
    if (!isImage && !isVideo) {
      alert('❌ Formato não suportado. Envie apenas imagens (JPG, PNG, GIF) ou vídeos (MP4, MOV).')
      event.target.value = '' // Limpar o input
      return
    }

    // Validar tipos específicos de arquivo
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime']
    
    if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
      alert('⚠️ Tipo de arquivo não suportado. Use apenas: JPG, PNG, GIF, MP4, MOV.')
      event.target.value = '' // Limpar o input
      return
    }

    // Verificar tamanho do arquivo - novos limites: 10MB para imagens, 25MB para vídeos
    const maxSizeImage = 10 * 1024 * 1024 // 10MB para imagens
    const maxSizeVideo = 25 * 1024 * 1024 // 25MB para vídeos (reduzido de 50MB)
    const maxSize = isImage ? maxSizeImage : maxSizeVideo
    
    if (file.size > maxSize) {
      const fileType = isImage ? 'imagem' : 'vídeo'
      const maxSizeText = isImage ? '10MB' : '25MB'
      alert(`⚠️ O arquivo enviado é muito grande. Limite de ${fileType}: ${maxSizeText}.`)
      event.target.value = '' // Limpar o input
      return
    }

    setMediaFile(file)
    setMediaType(isImage ? 'photo' : 'video')
    
    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeMedia = () => {
    setMediaFile(null)
    setMediaType(null)
    setMediaPreview(null)
  }

  const uploadMediaToSupabase = async (file: File): Promise<string | null> => {
    try {
      setIsUploadingMedia(true)
      
      // Validar tamanho do arquivo
      const maxSize = file.type.startsWith('video/') ? 25 * 1024 * 1024 : 10 * 1024 * 1024
      if (file.size > maxSize) {
        const fileType = file.type.startsWith('video/') ? 'vídeo' : 'imagem'
        const maxSizeText = file.type.startsWith('video/') ? '25MB' : '10MB'
        throw new Error(`⚠️ O arquivo enviado é muito grande. Limite de ${fileType}: ${maxSizeText}.`)
      }

      // Validar tipo de arquivo
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime']
      
      if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
        throw new Error('⚠️ Tipo de arquivo não suportado. Use apenas: JPG, PNG, GIF, MP4, MOV.')
      }
      
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop()
      const fileName = `bot-media-${Date.now()}.${fileExt}`
      
      console.log(`Iniciando upload: ${fileName} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
      
      // Upload para o storage do Supabase (usar bucket welcome_media que já existe)
      const { data, error } = await supabase.storage
        .from('welcome_media')
        .upload(fileName, file, {
          upsert: false,
          cacheControl: '3600'
        })

      if (error) {
        console.error('Erro no upload:', error)
        throw new Error(`Erro ao fazer upload do arquivo: ${error.message}`)
      }

      // Obter URL pública
      const { data: publicData } = supabase.storage
        .from('welcome_media')
        .getPublicUrl(fileName)

      console.log(`Upload concluído: ${publicData.publicUrl}`)
      return publicData.publicUrl
    } catch (error) {
      console.error('Erro no upload da mídia:', error)
      alert(error instanceof Error ? error.message : 'Erro ao fazer upload da mídia')
      return null
    } finally {
      setIsUploadingMedia(false)
    }
  }

  const validateForm = () => {
    if (!welcomeMessage.trim()) {
      return "❌ Você precisa configurar a mensagem de boas-vindas para criar o bot."
    }

    if (!mediaFile) {
      return "❌ Você precisa fazer upload de uma imagem ou vídeo de boas-vindas para criar o bot."
    }

    // Verificar se há erros de validação de preço
    if (Object.keys(planErrors).length > 0) {
      return "❌ Corrija os erros nos valores dos planos antes de continuar."
    }

    const validPlans = plans.filter(plan => 
      plan.name.trim() && plan.price.trim() && parseFloat(plan.price) >= 4.90
    )

    if (validPlans.length === 0) {
      return "❌ Você precisa configurar ao menos um plano para criar o bot com valor mínimo de R$4,90."
    }

    return null
  }

  // Funções de navegação do wizard
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
      setShowInstructions(true)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setShowInstructions(true)
    }
  }

  const skipInstructions = () => {
    setShowInstructions(false)
  }

  // Validações por etapa
  const validateStep1 = () => {
    return botValidation.isValid && botToken.trim() !== ''
  }

  const validateStep2 = () => {
    const validPlans = plans.filter(plan => 
      plan.name.trim() && plan.price.trim() && parseFloat(plan.price) >= 4.90
    )
    return welcomeMessage.trim() !== '' && validPlans.length > 0 && mediaFile !== null && Object.keys(planErrors).length === 0
  }

  const handleCreateBot = async () => {
    if (!botValidation.isValid || !pushinPayValidation.isValid) {
      return
    }

    const validationError = validateForm()
    if (validationError) {
      alert(validationError)
      return
    }

    setIsCreating(true)

    try {
      // Obter o usuário atual do Supabase diretamente
      const { data: { user: currentUser }, error: authError1 } = await supabase.auth.getUser()
      
      if (authError1 || !currentUser) {
        throw new Error('Usuário não está logado ou sessão expirou')
      }

      // Upload da mídia se houver
      let mediaUrl: string | null = null
      if (mediaFile) {
        mediaUrl = await uploadMediaToSupabase(mediaFile)
        if (!mediaUrl) {
          alert('❌ Erro ao fazer upload da mídia. Tente novamente.')
          return
        }
      }

      // Dados básicos obrigatórios
      const botData = {
        user_id: currentUser.id,
        bot_token: botToken,
        bot_username: botValidation.botInfo.username,
        name: botName || botValidation.botInfo.first_name || 'Bot sem nome',
        description: botDescription || '',
        welcome_text: welcomeMessage,
        media_url: mediaUrl,
        media_type: mediaType
      }

      console.log('Tentando criar bot com dados:', botData)
      console.log('User ID:', user?.id)

      // Primeiro, vamos testar se conseguimos fazer uma consulta na tabela
      const { data: testQuery, error: testError } = await supabase
        .from('bots')
        .select('*')
        .limit(1)

      if (testError) {
        console.error('Erro ao acessar tabela bots:', testError)
        throw new Error(`Problema ao acessar tabela: ${testError.message}`)
      }

      console.log('Estrutura da tabela bots:', testQuery)

      // Verificar novamente se o usuário está autenticado antes de inserir
      const { data: { user: authUser }, error: authError2 } = await supabase.auth.getUser()
      
      if (authError2 || !authUser) {
        throw new Error('Sessão expirada. Faça login novamente.')
      }

      // Atualizar o user_id para garantir que está correto
      botData.user_id = authUser.id

      const { data, error } = await supabase
        .from('bots')
        .insert([botData])
        .select()
        .single()

      if (error) {
        console.error('Erro do Supabase:', error)
        throw error
      }

      console.log('Bot criado com sucesso:', data)

      // Criar planos para o bot
      const validPlans = plans.filter(plan => 
        plan.name.trim() && plan.price.trim() && parseFloat(plan.price) > 0
      )

      for (const plan of validPlans) {
        try {
          const { error: planError } = await supabase
            .from('plans')
            .insert([{
              bot_id: data.id,
              name: plan.name,
              price: parseFloat(plan.price),
              duration_days: plan.duration_days
            }])

          if (planError) {
            console.error('Erro ao criar plano:', planError)
            // Continua criando outros planos mesmo se um falhar
          }
        } catch (error) {
          console.error('Erro ao inserir plano:', error)
        }
      }

      // Redirecionar para a página individual do bot
      alert('Bot e planos criados com sucesso! Redirecionando para configuração...')
      setTimeout(() => {
        router.push(`/dashboard/bots/${data.id}`)
      }, 1000)

    } catch (error: any) {
      console.error('Erro detalhado ao criar bot:', error)
      
      let errorMessage = 'Erro ao criar bot. '
      
      if (error.message) {
        errorMessage += `Motivo: ${error.message}`
      }
      
      if (error.details) {
        errorMessage += ` | Detalhes: ${error.details}`
      }

      if (error.hint) {
        errorMessage += ` | Sugestão: ${error.hint}`
      }
      
      alert(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  // Renderizar aviso de PushinPay se não estiver válido
  if (pushinPayValidation.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Verificando configurações...</p>
        </div>
      </div>
    )
  }

  if (!pushinPayValidation.isValid) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Bot className="mr-3 h-8 w-8 text-blue-500" />
            Criar Novo Bot
          </h1>
          <p className="text-gray-400 mt-2">
            Crie seu bot do Telegram de forma simples e segura
          </p>
        </div>

        <Card className="bg-orange-900/20 border-orange-700">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Configuração Necessária
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-orange-300">
              ⚠️ Para criar um bot, primeiro você precisa cadastrar e validar sua chave do PushinPay.
            </p>
            <Button 
              onClick={() => router.push('/dashboard/pushinpay')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Configurar PushinPay
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Wizard de criação do bot
  const renderWizardContent = () => {
    // Etapa 0: Introdução à Etapa 1
    if (currentStep === 0 && showInstructions) {
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <div className="mb-6">
              <User className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">
                Etapa 1 de 3: Identificação do Bot
              </h1>
              <p className="text-gray-400">
                Vamos começar configurando as informações básicas do seu bot
              </p>
            </div>
          </div>

          <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Key className="mr-2 h-5 w-5 text-blue-400" />
                O que você precisa fazer nesta etapa:
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">1</div>
                  <div>
                    <h4 className="text-white font-medium">Obter Token do Bot</h4>
                    <p className="text-gray-300 text-sm">Abra o Telegram, procure por @BotFather e digite /newbot</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">2</div>
                  <div>
                    <h4 className="text-white font-medium">Configurar Nome</h4>
                    <p className="text-gray-300 text-sm">Escolha um nome amigável para identificar seu bot no painel</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">3</div>
                  <div>
                    <h4 className="text-white font-medium">Validação Automática</h4>
                    <p className="text-gray-300 text-sm">O sistema validará automaticamente se o token está correto</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button 
              onClick={skipInstructions}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Começar Etapa 1
            </Button>
          </div>
        </div>
      )
    }

    // Etapa 1: Formulário de nome e token
    if (currentStep === 0 && !showInstructions) {
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header com progresso */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <User className="mr-3 h-6 w-6 text-blue-500" />
                Etapa 1: Identificação do Bot
              </h1>
              <Badge variant="outline" className="border-blue-600 text-blue-400">
                1 de 3
              </Badge>
            </div>
            
            {/* Barra de progresso */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: '33%'}}></div>
            </div>
          </div>

          {/* Status PushinPay */}
          <Card className="bg-green-900/20 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center text-green-400">
                <CheckCircle className="mr-2 h-5 w-5" />
                <span>Token PushinPay válido</span>
              </div>
            </CardContent>
          </Card>

          {/* Formulário */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Informações do Bot</CardTitle>
              <CardDescription className="text-gray-400">
                Configure o token e nome do seu bot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Token do Bot */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Token do Bot <span className="text-red-400">*</span>
                </label>
                <Input
                  type="password"
                  placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-500">
                  Acesse @BotFather no Telegram para obter seu token
                </p>
                
                {/* Status da validação do bot */}
                {botValidation.isLoading && (
                  <div className="flex items-center text-blue-400">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Validando token...</span>
                  </div>
                )}
                
                {botValidation.error && (
                  <div className="flex items-center text-red-400">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    <span className="text-sm">{botValidation.error}</span>
                  </div>
                )}
                
                {botValidation.isValid && botValidation.botInfo && (
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
                    <div className="flex items-center text-green-400 mb-2">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      <span>Token válido</span>
                    </div>
                    <div className="text-sm text-gray-300">
                      <p><strong>Nome:</strong> {botValidation.botInfo.first_name}</p>
                      <p><strong>Username:</strong> @{botValidation.botInfo.username}</p>
                      <p><strong>ID:</strong> {botValidation.botInfo.id}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Nome do Bot */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Nome do Bot (Opcional)
                </label>
                <Input
                  type="text"
                  placeholder="Nome para identificação interna"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Descrição (Opcional)
                </label>
                <Textarea
                  placeholder="Descreva o propósito do seu bot..."
                  value={botDescription}
                  onChange={(e) => setBotDescription(e.target.value)}
                  rows={3}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Navegação */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/bots')}
              className="border-gray-600 text-gray-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button 
              onClick={nextStep}
              disabled={!validateStep1()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
            >
              Próxima Etapa
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )
    }

    // Etapa 1: Introdução à Etapa 2
    if (currentStep === 1 && showInstructions) {
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <div className="mb-6">
              <MessageCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">
                Etapa 2 de 3: Personalização
              </h1>
              <p className="text-gray-400">
                Configure a mensagem de boas-vindas e os planos do seu bot
              </p>
            </div>
          </div>

          <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MessageCircle className="mr-2 h-5 w-5 text-green-400" />
                O que você precisa fazer nesta etapa:
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">1</div>
                  <div>
                    <h4 className="text-white font-medium">Mensagem de Boas-vindas</h4>
                    <p className="text-gray-300 text-sm">Escreva a mensagem que os usuários verão ao digitar /start</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">2</div>
                  <div>
                    <h4 className="text-white font-medium">Criar Planos</h4>
                    <p className="text-gray-300 text-sm">Configure pelo menos um plano com nome, preço e duração</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">3</div>
                  <div>
                    <h4 className="text-white font-medium">Múltiplos Planos</h4>
                    <p className="text-gray-300 text-sm">Adicione quantos planos quiser para dar opções aos clientes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">4</div>
                  <div>
                    <h4 className="text-white font-medium">Mídia Opcional</h4>
                    <p className="text-gray-300 text-sm">Adicione imagem (10MB) ou vídeo (50MB) à mensagem de boas-vindas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={prevStep}
              className="border-gray-600 text-gray-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button 
              onClick={skipInstructions}
              className="bg-green-600 hover:bg-green-700 px-8 py-3"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Começar Etapa 2
            </Button>
          </div>
        </div>
      )
    }

    // Etapa 2: Formulário de mensagem e planos
    if (currentStep === 1 && !showInstructions) {
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header com progresso */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <MessageCircle className="mr-3 h-6 w-6 text-green-500" />
                Etapa 2: Personalização
              </h1>
              <Badge variant="outline" className="border-green-600 text-green-400">
                2 de 3
              </Badge>
            </div>
            
            {/* Barra de progresso */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{width: '66%'}}></div>
            </div>
          </div>

          {/* Formulário */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Personalização do Bot</CardTitle>
              <CardDescription className="text-gray-400">
                Configure a mensagem de boas-vindas e os planos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mensagem de Boas-vindas */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Mensagem de Boas-vindas <span className="text-red-400">*</span>
                </label>
                <Textarea
                  placeholder="Olá! 👋 Bem-vindo ao nosso bot premium! Aqui você encontra..."
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  rows={4}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-500">
                  Esta mensagem será enviada quando alguém digitar /start no seu bot
                </p>
              </div>

              {/* Mídia da Mensagem (Opcional) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Mídia da Mensagem (Opcional)
                </label>
                
                {!mediaFile ? (
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-2">Adicione uma imagem ou vídeo à sua mensagem</p>
                    <p className="text-xs text-gray-500 mb-4">
                      <strong>Limites:</strong> Imagens até 10MB (JPG, PNG, GIF) • Vídeos até 50MB (MP4, MOV)
                    </p>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                      id="media-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('media-upload')?.click()}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Escolher Arquivo
                    </Button>
                  </div>
                ) : (
                  <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {mediaType === 'photo' ? (
                          <Image className="h-5 w-5 text-blue-400" />
                        ) : (
                          <Video className="h-5 w-5 text-green-400" />
                        )}
                        <span className="text-gray-300 font-medium">
                          {mediaType === 'photo' ? 'Imagem' : 'Vídeo'} selecionada
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeMedia}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {mediaPreview && (
                      <div className="mb-3">
                        {mediaType === 'photo' ? (
                          <img
                            src={mediaPreview}
                            alt="Preview"
                            className="max-w-full h-32 object-cover rounded-lg"
                          />
                        ) : (
                          <video
                            src={mediaPreview}
                            className="max-w-full h-32 object-cover rounded-lg"
                            controls
                          />
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-400">
                      <p><strong>Nome:</strong> {mediaFile.name}</p>
                      <p><strong>Tamanho:</strong> {(mediaFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  A mídia será enviada junto com sua mensagem de boas-vindas no Telegram
                </p>
              </div>

              {/* Planos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Planos <span className="text-red-400">*</span>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPlan}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Adicionar Plano
                  </Button>
                </div>
                
                {plans.map((plan, index) => (
                  <div key={index} className="bg-gray-800 border border-gray-600 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-300">Plano {index + 1}</h4>
                      {plans.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlan(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400">Nome do Plano</label>
                        <Input
                          placeholder="ex: Básico, Premium..."
                          value={plan.name}
                          onChange={(e) => updatePlan(index, 'name', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs text-gray-400">Preço (R$) - mín. R$4,90</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="4.90"
                          placeholder="4.90"
                          value={plan.price}
                          onChange={(e) => updatePlan(index, 'price', e.target.value)}
                          className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                            planErrors[index] ? 'border-red-500 bg-red-900/20' : ''
                          }`}
                        />
                        {planErrors[index] && (
                          <p className="text-red-400 text-xs mt-1">{planErrors[index]}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-400">Duração (dias)</label>
                      <Input
                        type="number"
                        placeholder="30"
                        value={plan.duration_days}
                        onChange={(e) => updatePlan(index, 'duration_days', parseInt(e.target.value) || 30)}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                  </div>
                ))}
                
                <p className="text-xs text-gray-500">
                  Configure pelo menos um plano para o seu bot. Valor mínimo: R$4,90 por plano.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Navegação */}
          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => {
                setCurrentStep(0)
                setShowInstructions(false)
              }}
              className="border-gray-600 text-gray-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Etapa Anterior
            </Button>
            <Button 
              onClick={nextStep}
              disabled={!validateStep2()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
            >
              Próxima Etapa
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )
    }

    // Etapa 2: Introdução à Etapa 3
    if (currentStep === 2 && showInstructions) {
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <div className="mb-6">
              <Rocket className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">
                Etapa 3 de 3: Finalização
              </h1>
              <p className="text-gray-400">
                Últimos ajustes e ativação do seu bot
              </p>
            </div>
          </div>

          <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Rocket className="mr-2 h-5 w-5 text-purple-400" />
                O que acontecerá nesta etapa:
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">1</div>
                  <div>
                    <h4 className="text-white font-medium">Revisão Final</h4>
                    <p className="text-gray-300 text-sm">Confirme todas as configurações do seu bot</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">2</div>
                  <div>
                    <h4 className="text-white font-medium">Criação no Sistema</h4>
                    <p className="text-gray-300 text-sm">O bot será registrado e configurado automaticamente</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">3</div>
                  <div>
                    <h4 className="text-white font-medium">Bot Pronto!</h4>
                    <p className="text-gray-300 text-sm">Seu bot estará pronto para receber usuários e vendas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={prevStep}
              className="border-gray-600 text-gray-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button 
              onClick={skipInstructions}
              className="bg-purple-600 hover:bg-purple-700 px-8 py-3"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Finalizar Bot
            </Button>
          </div>
        </div>
      )
    }

    // Etapa 3: Finalização
    if (currentStep === 2 && !showInstructions) {
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header com progresso */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <Rocket className="mr-3 h-6 w-6 text-purple-500" />
                Etapa 3: Finalização
              </h1>
              <Badge variant="outline" className="border-purple-600 text-purple-400">
                3 de 3
              </Badge>
            </div>
            
            {/* Barra de progresso */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{width: '100%'}}></div>
            </div>
          </div>

          {/* Resumo */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Resumo do Bot</CardTitle>
              <CardDescription className="text-gray-400">
                Confirme as configurações antes de criar o bot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informações do bot */}
              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <h4 className="text-white font-medium">Informações Básicas</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Nome:</span>
                    <p className="text-white">{botName || botValidation.botInfo?.first_name || 'Não definido'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Username:</span>
                    <p className="text-white">@{botValidation.botInfo?.username}</p>
                  </div>
                </div>
                {botDescription && (
                  <div>
                    <span className="text-gray-400">Descrição:</span>
                    <p className="text-white">{botDescription}</p>
                  </div>
                )}
              </div>

              {/* Mensagem de boas-vindas */}
              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <h4 className="text-white font-medium">Mensagem de Boas-vindas</h4>
                <div className="bg-gray-700 rounded p-3">
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{welcomeMessage}</p>
                </div>
                
                {/* Mídia anexada */}
                {mediaFile && mediaPreview && (
                  <div className="mt-3">
                    <p className="text-gray-400 text-xs mb-2">Mídia anexada:</p>
                    <div className="bg-gray-600 rounded p-2">
                      <div className="flex items-center space-x-2 mb-2">
                        {mediaType === 'photo' ? (
                          <Image className="h-4 w-4 text-blue-400" />
                        ) : (
                          <Video className="h-4 w-4 text-green-400" />
                        )}
                        <span className="text-gray-300 text-xs">
                          {mediaFile.name} ({(mediaFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      {mediaType === 'photo' ? (
                        <img
                          src={mediaPreview}
                          alt="Preview"
                          className="max-w-full h-20 object-cover rounded"
                        />
                      ) : (
                        <video
                          src={mediaPreview}
                          className="max-w-full h-20 object-cover rounded"
                          controls
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Planos */}
              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <h4 className="text-white font-medium">Planos Configurados</h4>
                <div className="space-y-2">
                  {plans.filter(p => p.name.trim() && p.price.trim()).map((plan, index) => (
                    <div key={index} className="bg-gray-700 rounded p-3 flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{plan.name}</p>
                        <p className="text-gray-400 text-sm">{plan.duration_days} dias</p>
                      </div>
                      <div className="text-green-400 font-bold">
                        R$ {parseFloat(plan.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navegação */}
          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => {
                setCurrentStep(1)
                setShowInstructions(false)
              }}
              className="border-gray-600 text-gray-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Etapa Anterior
            </Button>
            <Button 
              onClick={handleCreateBot}
              disabled={isCreating}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-8"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando Bot...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Criar Bot
                </>
              )}
            </Button>
          </div>
        </div>
      )
    }

    return null
  }

  return renderWizardContent()
}