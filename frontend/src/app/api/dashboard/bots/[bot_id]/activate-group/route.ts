import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bot_id: string }> }
) {
  const { bot_id } = await params
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { group_input, group_id } = await request.json()

    if (!group_input || !group_id) {
      return NextResponse.json({ error: 'Dados do grupo não fornecidos' }, { status: 400 })
    }

    // Verificar autenticação com Supabase
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Verificar se o bot pertence ao usuário
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('*')
      .eq('id', bot_id)
      .eq('user_id', user.id)
      .single()

    if (botError || !bot) {
      return NextResponse.json({ error: 'Bot não encontrado' }, { status: 404 })
    }

    // Validar grupo com API do Telegram
    try {
      const telegramResponse = await fetch(`https://api.telegram.org/bot${bot.bot_token}/getChat?chat_id=${group_id}`)
      const telegramData = await telegramResponse.json()
      
      if (!telegramData.ok) {
        return NextResponse.json({ 
          error: 'Bot não tem acesso ao grupo ou grupo não encontrado' 
        }, { status: 400 })
      }

      // Verificar se o bot é administrador
      const adminResponse = await fetch(`https://api.telegram.org/bot${bot.bot_token}/getChatAdministrators?chat_id=${group_id}`)
      const adminData = await adminResponse.json()
      
      if (adminData.ok) {
        const botInfo = await fetch(`https://api.telegram.org/bot${bot.bot_token}/getMe`)
        const botInfoData = await botInfo.json()
        
        if (botInfoData.ok) {
          const botId = botInfoData.result.id
          const isAdmin = adminData.result.some((admin: any) => admin.user.id === botId)
          
          if (!isAdmin) {
            return NextResponse.json({ 
              error: 'Bot precisa ser administrador do grupo para funcionar corretamente' 
            }, { status: 400 })
          }
        }
      }
    } catch (error) {
      console.error('Erro ao validar grupo:', error)
      return NextResponse.json({ 
        error: 'Erro ao validar acesso ao grupo' 
      }, { status: 400 })
    }

    // Atualizar o grupo VIP diretamente no Supabase
    const { data: updatedBot, error: updateError } = await supabase
      .from('bots')
      .update({ vip_group_id: group_id })
      .eq('id', bot_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar bot:', updateError)
      return NextResponse.json({ error: 'Erro ao ativar grupo' }, { status: 500 })
    }

    // Enviar mensagem de confirmação no grupo
    let messageSent = false
    try {
      const messageText = `🎉 *Bot Ativado com Sucesso!*

✅ O bot @${bot.bot_username} foi integrado a este grupo VIP!

🔹 *Funcionalidades ativas:*
• Adição automática de usuários pagantes
• Remoção automática quando pagamento expira
• Sistema de vendas integrado

💡 *O que isso significa:*
Agora quando alguém comprar um plano do seu bot, será automaticamente adicionado neste grupo!

🚀 *Próximos passos:*
1. Configure seus planos no painel
2. Divulgue seus produtos
3. Receba pagamentos automaticamente

---
_Powered by BlackinBot 🤖_`

      const sendMessageUrl = `https://api.telegram.org/bot${bot.bot_token}/sendMessage`
      const messageResponse = await fetch(sendMessageUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: group_id,
          text: messageText,
          parse_mode: 'Markdown'
        })
      })

      const messageData = await messageResponse.json()
      messageSent = messageData.ok
      
      if (messageSent) {
        console.log('✅ Mensagem de ativação enviada no grupo com sucesso')
      } else {
        console.log('⚠️ Erro ao enviar mensagem no grupo:', messageData.description)
      }
      
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem no grupo:', error)
      // Não falhar a ativação se a mensagem não for enviada
    }

    return NextResponse.json({ 
      message: 'Grupo VIP ativado com sucesso!',
      bot: updatedBot,
      messageSent: messageSent
    })
  } catch (error) {
    console.error('Erro na API de ativação de grupo:', error)
    return NextResponse.json(
      { detail: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
} 