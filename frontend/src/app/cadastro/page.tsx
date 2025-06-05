'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, ArrowLeft, Eye, EyeOff, CheckCircle, X } from "lucide-react"
import { createClient } from '@/lib/supabase'

export default function CadastroPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    cpf: '',
    senha: '',
    confirmarSenha: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Máscara para telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return value
  }

  // Máscara para CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return value
  }

  // Validação de CPF
  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '')
    if (numbers.length !== 11) return false
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numbers)) return false
    
    // Validação do primeiro dígito verificador
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i)
    }
    let remainder = sum % 11
    let digit1 = remainder < 2 ? 0 : 11 - remainder
    
    if (parseInt(numbers[9]) !== digit1) return false
    
    // Validação do segundo dígito verificador
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i)
    }
    remainder = sum % 11
    let digit2 = remainder < 2 ? 0 : 11 - remainder
    
    return parseInt(numbers[10]) === digit2
  }

  // Validação de email
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  // Validação do formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres'
    }

    if (!formData.telefone) {
      newErrors.telefone = 'Telefone é obrigatório'
    } else if (formData.telefone.replace(/\D/g, '').length < 10) {
      newErrors.telefone = 'Telefone deve ter pelo menos 10 dígitos'
    }

    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'E-mail inválido'
    }

    if (!formData.cpf) {
      newErrors.cpf = 'CPF é obrigatório'
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido'
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória'
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres'
    }

    if (!formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Confirmação de senha é obrigatória'
    } else if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não conferem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value

    if (field === 'telefone') {
      formattedValue = formatPhone(value)
    } else if (field === 'cpf') {
      formattedValue = formatCPF(value)
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }))

    // Limpar erro do campo ao começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
        options: {
          data: {
            nome: formData.nome,
            telefone: formData.telefone.replace(/\D/g, ''),
            cpf: formData.cpf.replace(/\D/g, '')
          }
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setErrors({ email: 'Este e-mail já está cadastrado' })
        } else if (authError.message.includes('Password should be at least')) {
          setErrors({ senha: 'Senha deve ter pelo menos 6 caracteres' })
        } else {
          setErrors({ email: 'Erro no cadastro. Tente novamente.' })
        }
        return
      }

      if (authData.user) {
        // 2. Inserir dados extras na tabela users
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: formData.email,
            nome: formData.nome,
            telefone: formData.telefone.replace(/\D/g, ''),
            cpf: formData.cpf.replace(/\D/g, ''),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (dbError) {
          console.error('Erro ao salvar dados do usuário:', dbError)
          // Mesmo com erro no banco, o usuário foi criado no auth
          // Então vamos redirecioná-lo para o dashboard
        }

        // 3. Redirecionar para o dashboard
        router.push('/dashboard')
      }

    } catch (error) {
      console.error('Erro no cadastro:', error)
      setErrors({ email: 'Erro interno. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6 text-blue-400 hover:text-blue-300">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para início</span>
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bot className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold">BlackinBot</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Criar Conta</h1>
          <p className="text-gray-400">
            Preencha seus dados para começar a usar a plataforma
          </p>
        </div>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Dados Pessoais</CardTitle>
            <CardDescription className="text-gray-400">
              Todas as informações são obrigatórias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome Completo */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Completo *
                </label>
                <Input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Seu nome completo"
                  className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 ${
                    errors.nome ? 'border-red-500' : ''
                  }`}
                />
                {errors.nome && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {errors.nome}
                  </p>
                )}
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telefone *
                </label>
                <Input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 ${
                    errors.telefone ? 'border-red-500' : ''
                  }`}
                />
                {errors.telefone && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {errors.telefone}
                  </p>
                )}
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-mail *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="seu@email.com"
                  className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* CPF */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CPF *
                </label>
                <Input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  placeholder="000.000.000-00"
                  className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 ${
                    errors.cpf ? 'border-red-500' : ''
                  }`}
                />
                {errors.cpf && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {errors.cpf}
                  </p>
                )}
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Senha *
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.senha}
                    onChange={(e) => handleInputChange('senha', e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 pr-10 ${
                      errors.senha ? 'border-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.senha && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {errors.senha}
                  </p>
                )}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmarSenha}
                    onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                    placeholder="Digite a senha novamente"
                    className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 pr-10 ${
                      errors.confirmarSenha ? 'border-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmarSenha && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {errors.confirmarSenha}
                  </p>
                )}
                {formData.senha && formData.confirmarSenha && formData.senha === formData.confirmarSenha && (
                  <p className="text-green-400 text-sm mt-1 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Senhas conferem
                  </p>
                )}
              </div>

              {/* Botão de Cadastro */}
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando conta...
                  </div>
                ) : (
                  'Criar Conta'
                )}
              </Button>

              {/* Link para Login */}
              <div className="text-center mt-4">
                <p className="text-gray-400">
                  Já tem uma conta?{' '}
                  <Link href="/login" className="text-blue-400 hover:text-blue-300">
                    Fazer login
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}