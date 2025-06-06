'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { Upload, Image, Video, Save } from 'lucide-react'

interface Bot {
  id: string
  welcome_text: string
  media_url: string | null
  media_type: 'photo' | 'video' | null
  bot_token: string
  bot_username: string
}

export default function WelcomePage() {
  const [bot, setBot] = useState<Bot | null>(null)
  const [welcomeText, setWelcomeText] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { user } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadBot()
    }
  }, [user])

  const loadBot = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bots')
        .select('id, welcome_text, media_url, media_type, bot_token, bot_username')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Erro ao carregar bot:', error)
        return
      }

      if (data && data.length > 0) {
        const botData = data[0]
        setBot(botData)
        setWelcomeText(botData.welcome_text || '')
        setMediaPreview(botData.media_url)
      }
    } catch (error) {
      console.error('Erro ao carregar bot:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamanho do arquivo
      const maxSize = file.type.startsWith('video/') ? 25 * 1024 * 1024 : 10 * 1024 * 1024 // 25MB para vídeo, 10MB para imagem
      const fileType = file.type.startsWith('video/') ? 'vídeo' : 'imagem'
      const maxSizeText = file.type.startsWith('video/') ? '25MB' : '10MB'
      
      if (file.size > maxSize) {
        alert(`⚠️ O arquivo enviado é muito grande. Limite de ${fileType}: ${maxSizeText}.`)
        e.target.value = '' // Limpar o input
        return
      }

      // Validar tipo de arquivo
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime']
      
      if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
        alert('⚠️ Tipo de arquivo não suportado. Use apenas: JPG, PNG, GIF, MP4, MOV.')
        e.target.value = '' // Limpar o input
        return
      }
      
      setMediaFile(file)
      const url = URL.createObjectURL(file)
      setMediaPreview(url)
    }
  }

  const uploadMedia = async (file: File): Promise<string> => {
    setUploading(true)
    try {
      // Validar novamente o tamanho e tipo
      const maxSize = file.type.startsWith('video/') ? 25 * 1024 * 1024 : 10 * 1024 * 1024
      if (file.size > maxSize) {
        const fileType = file.type.startsWith('video/') ? 'vídeo' : 'imagem'
        const maxSizeText = file.type.startsWith('video/') ? '25MB' : '10MB'
        throw new Error(`⚠️ O arquivo enviado é muito grande. Limite de ${fileType}: ${maxSizeText}.`)
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`

      console.log(`Iniciando upload: ${fileName} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

      const { error: uploadError } = await supabase.storage
        .from('welcome_media')
        .upload(fileName, file, {
          upsert: false, // Não sobrescrever arquivos existentes
          cacheControl: '3600' // Cache por 1 hora
        })

      if (uploadError) {
        console.error('Erro no upload:', uploadError)
        throw new Error(`Erro ao fazer upload do arquivo: ${uploadError.message}`)
      }

      const { data } = supabase.storage
        .from('welcome_media')
        .getPublicUrl(fileName)

      console.log(`Upload concluído: ${data.publicUrl}`)
      return data.publicUrl
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      let mediaUrl = bot?.media_url
      let mediaType = bot?.media_type

      // Upload nova mídia se selecionada
      if (mediaFile) {
        mediaUrl = await uploadMedia(mediaFile)
        mediaType = mediaFile.type.startsWith('video/') ? 'video' : 'photo'
      }

      const botData = {
        user_id: user.id,
        welcome_text: welcomeText,
        media_url: mediaUrl,
        media_type: mediaType,
        // Campos obrigatórios para criação
        bot_token: bot?.bot_token || '',
        bot_username: bot?.bot_username || '',
      }

      if (bot) {
        // Atualizar bot existente
        const { error } = await supabase
          .from('bots')
          .update(botData)
          .eq('id', bot.id)

        if (error) throw error
      } else {
        // Criar novo bot
        const { data, error } = await supabase
          .from('bots')
          .insert([botData])
          .select()
          .single()

        if (error) throw error
        setBot(data)
        
        // Redirecionar para a página individual do bot após criação
        alert('Bot criado com sucesso! Redirecionando para configuração...')
        setTimeout(() => {
          window.location.href = `/dashboard/bots/${data.id}`
        }, 1000)
        return
      }

      alert('Mensagem de boas-vindas salva com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar. Tente novamente.'
      alert(errorMessage)
    } finally {
      setSaving(false)
    }
  }

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
        <h1 className="text-3xl font-bold text-white">Mensagem de Boas-Vindas</h1>
        <p className="text-gray-400 mt-2">
          Configure a mensagem e mídia que será enviada quando alguém iniciar uma conversa com seu bot.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuração */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Configurar Mensagem</CardTitle>
            <CardDescription className="text-gray-400">
              Defina o texto e mídia da mensagem de boas-vindas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Texto da Mensagem
              </label>
              <Textarea
                placeholder="Digite a mensagem de boas-vindas..."
                value={welcomeText}
                onChange={(e) => setWelcomeText(e.target.value)}
                rows={6}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Mídia (Opcional)
              </label>
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="mb-2 bg-gray-800 border-gray-600 text-white"
              />
              <p className="text-xs text-gray-400">
                Formatos aceitos: JPG, PNG, GIF (até 10MB), MP4, MOV (até 25MB)
              </p>
              
              {mediaFile && (
                <div className="mt-2 p-2 bg-gray-800 rounded border border-gray-600">
                  <p className="text-xs text-gray-300">
                    <strong>Arquivo selecionado:</strong> {mediaFile.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Tamanho: {(mediaFile.size / 1024 / 1024).toFixed(2)}MB | 
                    Tipo: {mediaFile.type.startsWith('video/') ? 'Vídeo' : 'Imagem'}
                  </p>
                </div>
              )}
            </div>

            <Button onClick={handleSave} disabled={saving || uploading} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {uploading ? 'Fazendo upload...' : saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Preview da Mensagem</CardTitle>
            <CardDescription className="text-gray-400">
              Veja como ficará a mensagem no Telegram
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              {/* Preview da mídia */}
              {mediaPreview && (
                <div className="relative">
                  {mediaFile?.type.startsWith('video/') || bot?.media_type === 'video' ? (
                    <div className="flex items-center justify-center bg-gray-700 rounded-lg h-48">
                      <Video className="h-12 w-12 text-gray-400" />
                      <span className="ml-2 text-gray-300">Vídeo</span>
                    </div>
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                  <Badge variant="secondary" className="absolute top-2 right-2">
                    {mediaFile?.type.startsWith('video/') || bot?.media_type === 'video' ? 'Vídeo' : 'Foto'}
                  </Badge>
                </div>
              )}

              {/* Preview do texto */}
              {welcomeText ? (
                <div className="bg-gray-700 rounded-lg p-3 shadow-sm">
                  <p className="text-sm whitespace-pre-wrap text-white">{welcomeText}</p>
                </div>
              ) : (
                <div className="bg-gray-700 rounded-lg p-3 shadow-sm text-gray-400 text-sm">
                  Digite uma mensagem para ver o preview...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 