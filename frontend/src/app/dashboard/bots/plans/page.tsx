'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: number
  duration_days: number
  created_at: string
}

interface Bot {
  id: string
}

export default function PlansPage() {
  const [bot, setBot] = useState<Bot | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)
  const [editingPlan, setEditingPlan] = useState<string | null>(null)
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: '',
    duration_days: ''
  })
  const [editData, setEditData] = useState({
    name: '',
    price: '',
    duration_days: ''
  })
  const { user } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadBotAndPlans()
    }
  }, [user])

  const loadBotAndPlans = async () => {
    setLoading(true)
    try {
      // Carregar bot do usuário
      const { data: botData, error: botError } = await supabase
        .from('bots')
        .select('id')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (botError) {
        console.error('Erro ao carregar bot:', botError)
        return
      }

      if (botData && botData.length > 0) {
        const bot = botData[0]
        setBot(bot)
        
        // Carregar planos do bot
        const { data: plansData, error: plansError } = await supabase
          .from('plans')
          .select('*')
          .eq('bot_id', bot.id)
          .order('created_at', { ascending: false })

        if (plansError) {
          console.error('Erro ao carregar planos:', plansError)
          return
        }
        setPlans(plansData || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlan = async () => {
    if (!bot || !newPlan.name || !newPlan.price || !newPlan.duration_days) {
      alert('Preencha todos os campos')
      return
    }

    try {
      const { error } = await supabase
        .from('plans')
        .insert([{
          bot_id: bot.id,
          name: newPlan.name,
          price: parseFloat(newPlan.price),
          duration_days: parseInt(newPlan.duration_days)
        }])

      if (error) throw error

      setNewPlan({ name: '', price: '', duration_days: '' })
      loadBotAndPlans()
      alert('Plano criado com sucesso!')
    } catch (error) {
      console.error('Erro ao criar plano:', error)
      alert('Erro ao criar plano. Tente novamente.')
    }
  }

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan.id)
    setEditData({
      name: plan.name,
      price: plan.price.toString(),
      duration_days: plan.duration_days.toString()
    })
  }

  const handleSaveEdit = async (planId: string) => {
    if (!editData.name || !editData.price || !editData.duration_days) {
      alert('Preencha todos os campos')
      return
    }

    try {
      const { error } = await supabase
        .from('plans')
        .update({
          name: editData.name,
          price: parseFloat(editData.price),
          duration_days: parseInt(editData.duration_days)
        })
        .eq('id', planId)

      if (error) throw error

      setEditingPlan(null)
      loadBotAndPlans()
      alert('Plano atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar plano:', error)
      alert('Erro ao atualizar plano. Tente novamente.')
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', planId)

      if (error) throw error

      loadBotAndPlans()
      alert('Plano excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir plano:', error)
      alert('Erro ao excluir plano. Tente novamente.')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatDuration = (days: number) => {
    if (days === 1) return '1 dia'
    if (days < 30) return `${days} dias`
    if (days === 30) return '1 mês'
    if (days < 365) return `${Math.round(days / 30)} meses`
    return `${Math.round(days / 365)} anos`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando planos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Planos</h1>
        <p className="text-gray-400 mt-2">
          Gerencie os planos de assinatura do seu bot.
        </p>
      </div>

      {/* Criar novo plano */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Criar Novo Plano</CardTitle>
          <CardDescription className="text-gray-400">
            Adicione um novo plano de assinatura para seu bot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">
                Nome do Plano
              </label>
              <Input
                placeholder="Ex: Plano Mensal"
                value={newPlan.name}
                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">
                Preço (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="29.90"
                value={newPlan.price}
                onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">
                Duração (dias)
              </label>
              <Input
                type="number"
                placeholder="30"
                value={newPlan.duration_days}
                onChange={(e) => setNewPlan({ ...newPlan, duration_days: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreatePlan} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Criar Plano
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de planos */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Planos Existentes</CardTitle>
          <CardDescription className="text-gray-400">
            {plans.length} plano(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Nenhum plano cadastrado ainda.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Nome</TableHead>
                  <TableHead className="text-gray-300">Preço</TableHead>
                  <TableHead className="text-gray-300">Duração</TableHead>
                  <TableHead className="text-gray-300">Criado em</TableHead>
                  <TableHead className="text-gray-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id} className="border-gray-700">
                    <TableCell>
                      {editingPlan === plan.id ? (
                        <Input
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      ) : (
                        <span className="text-white">{plan.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingPlan === plan.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.price}
                          onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      ) : (
                        <span className="text-white">{formatPrice(plan.price)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingPlan === plan.id ? (
                        <Input
                          type="number"
                          value={editData.duration_days}
                          onChange={(e) => setEditData({ ...editData, duration_days: e.target.value })}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      ) : (
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          {formatDuration(plan.duration_days)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {editingPlan === plan.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(plan.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingPlan(null)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-800"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditPlan(plan)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-800"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePlan(plan.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 