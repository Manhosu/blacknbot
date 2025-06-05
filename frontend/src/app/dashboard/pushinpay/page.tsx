'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { Key, Save, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

interface User {
  id: string
  pushinpay_token: string | null
}

export default function PushinPayPage() {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { user: authUser } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    if (authUser) {
      loadUserData()
    }
  }, [authUser])

  const loadUserData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, pushinpay_token')
        .eq('id', authUser?.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setUser(data)
        setToken(data.pushinpay_token || '')
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveToken = async () => {
    if (!authUser) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ pushinpay_token: token })
        .eq('id', authUser.id)

      if (error) throw error

      setUser(prev => prev ? { ...prev, pushinpay_token: token } : null)
      alert('Token PushinPay salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar token:', error)
      alert('Erro ao salvar token. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const isTokenConfigured = user?.pushinpay_token && user.pushinpay_token.length > 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">PushinPay</h1>
        <p className="text-gray-400 mt-2">
          Configure seu token pessoal do PushinPay para receber pagamentos.
        </p>
      </div>

      {/* Status */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Key className="mr-2 h-5 w-5" />
            Status da Integração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            {isTokenConfigured ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-400" />
                <div>
                  <p className="font-medium text-green-300">Token Configurado</p>
                  <p className="text-sm text-green-400">
                    Seu bot está pronto para receber pagamentos via PushinPay
                  </p>
                </div>
                <Badge variant="default" className="ml-auto bg-green-600">
                  Ativo
                </Badge>
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-orange-400" />
                <div>
                  <p className="font-medium text-orange-300">Token Não Configurado</p>
                  <p className="text-sm text-orange-400">
                    Configure seu token para começar a receber pagamentos
                  </p>
                </div>
                <Badge variant="secondary" className="ml-auto bg-orange-600">
                  Pendente
                </Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuração do Token */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Token PushinPay</CardTitle>
          <CardDescription className="text-gray-400">
            Cole aqui seu token pessoal do PushinPay para integração com pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Token de API
            </label>
            <Input
              type="password"
              placeholder="Cole seu token do PushinPay aqui..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="font-mono bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              Seu token será criptografado e armazenado com segurança
            </p>
          </div>

          <Button onClick={handleSaveToken} disabled={saving || !token.trim()} className="bg-blue-600 hover:bg-blue-700">
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Token'}
          </Button>
        </CardContent>
      </Card>

      {/* Como obter o token */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Como obter seu token PushinPay?</CardTitle>
          <CardDescription className="text-gray-400">
            Siga os passos abaixo para configurar sua integração
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium text-white">Acesse o PushinPay</p>
                <p className="text-sm text-gray-400">
                  Faça login na sua conta do PushinPay
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium text-white">Vá para Configurações</p>
                <p className="text-sm text-gray-400">
                  Navegue até a seção de API ou Integrações
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium text-white">Copie seu Token</p>
                <p className="text-sm text-gray-400">
                  Copie o token de API e cole no campo acima
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <Button variant="outline" asChild className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <a 
                  href="https://pushinpay.com.br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Acessar PushinPay
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações importantes */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300">
                <strong className="text-white">Comissão da Plataforma:</strong> R$ 1,48 + 5% sobre cada venda será destinado à manutenção da plataforma
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300">
                <strong className="text-white">Segurança:</strong> Seu token é criptografado e nunca é exposto publicamente
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300">
                <strong className="text-white">Pagamentos:</strong> Os pagamentos são processados diretamente pelo PushinPay
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 