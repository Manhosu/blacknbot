import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      )
    }

    // Fazer uma requisição básica para validar o token PushinPay
    // Para desenvolvimento, vamos fazer uma validação simples
    // Em produção, você deve fazer a validação real com a API do PushinPay
    
    // Se o token tem pelo menos 10 caracteres, consideramos válido (para desenvolvimento)
    if (token.length >= 10) {
      return NextResponse.json({ valid: true })
    } else {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }
    
    // Para produção, descomente e ajuste a validação real:
    /*
    const response = await fetch('https://api.pushinpay.com.br/api/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      return NextResponse.json({ valid: true })
    } else {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }
    */
  } catch (error) {
    console.error('Erro ao validar PushinPay:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 