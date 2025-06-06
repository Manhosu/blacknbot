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

    // Validar grupo/canal com API do Telegram
    try {
      const telegramResponse = await fetch(`https://api.telegram.org/bot${bot.bot_token}/getChat?chat_id=${group_id}`)
      const telegramData = await telegramResponse.json()
      
      if (!telegramData.ok) {
        let errorMessage = 'Bot não tem acesso ao grupo/canal ou grupo/canal não encontrado'
        
        // Adicionar informações específicas do erro
        if (telegramData.description) {
          if (telegramData.description.includes('chat not found')) {
            errorMessage = 'Grupo/canal não encontrado. Verifique se o link/ID está correto.'
          } else if (telegramData.description.includes('bot is not a member')) {
            errorMessage = 'Bot não é membro do grupo/canal. Adicione o bot primeiro.'
          } else if (telegramData.description.includes('Forbidden')) {
            errorMessage = 'Bot não tem permissão para acessar este grupo/canal.'
          }
        }
        
        return NextResponse.json({ 
          error: errorMessage,
          telegram_error: telegramData.description
        }, { status: 400 })
      }

      // Verificar se é um tipo de chat válido (grupo, supergrupo ou canal)
      const chatType = telegramData.result?.type
      if (!['group', 'supergroup', 'channel'].includes(chatType)) {
        return NextResponse.json({ 
          error: `Tipo de chat inválido: ${chatType}. Apenas grupos, supergrupos e canais são suportados.` 
        }, { status: 400 })
      }

      // Verificar se o bot é administrador (necessário para grupos e canais)
      const adminResponse = await fetch(`https://api.telegram.org/bot${bot.bot_token}/getChatAdministrators?chat_id=${group_id}`)
      const adminData = await adminResponse.json()
      
      if (adminData.ok) {
        const botInfo = await fetch(`https://api.telegram.org/bot${bot.bot_token}/getMe`)
        const botInfoData = await botInfo.json()
        
        if (botInfoData.ok) {
          const botTelegramId = botInfoData.result.id
          const isAdmin = adminData.result.some((admin: any) => admin.user.id === botTelegramId)
          
          if (!isAdmin) {
            const chatTypeText = chatType === 'channel' ? 'canal' : 'grupo'
            return NextResponse.json({ 
              error: `Bot precisa ser administrador do ${chatTypeText} para funcionar corretamente. Adicione o bot como administrador com permissões para convidar usuários.` 
            }, { status: 400 })
          }
          
          // Para canais, verificar se o bot tem permissão para convidar usuários
          if (chatType === 'channel') {
            const botAdmin = adminData.result.find((admin: any) => admin.user.id === botTelegramId)
            if (botAdmin && !botAdmin.can_invite_users) {
              return NextResponse.json({ 
                error: 'Bot precisa ter permissão para convidar usuários no canal. Verifique as configurações de administrador.' 
              }, { status: 400 })
            }
          }
        }
      } else {
        // Se não conseguir verificar administradores, pode ser um erro de permissão
        return NextResponse.json({ 
          error: 'Não foi possível verificar permissões do bot. Certifique-se de que o bot é administrador.' 
        }, { status: 400 })
      }
    } catch (error) {
      console.error('Erro ao validar grupo/canal:', error)
      return NextResponse.json({ 
        error: 'Erro ao validar acesso ao grupo/canal' 
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
      return NextResponse.json({ error: 'Erro ao ativar grupo/canal' }, { status: 500 })
    }

    // Enviar mensagem de confirmação no grupo
    let messageSent = false
    try {
      const messageText = `🎉 *Bot Ativado com Sucesso!*

✅ O bot @${bot.bot_username} foi integrado a este grupo/canal VIP!

🔹 *Funcionalidades ativas:*
• Adição automática de usuários pagantes
• Remoção automática quando pagamento expira
• Sistema de vendas integrado

💡 *O que isso significa:*
Agora quando alguém comprar um plano do seu bot, será automaticamente adicionado neste grupo/canal!

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
        console.log('✅ Mensagem de ativação enviada no grupo/canal com sucesso')
      } else {
        console.log('⚠️ Erro ao enviar mensagem no grupo/canal:', messageData.description)
      }
      
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem no grupo/canal:', error)
      // Não falhar a ativação se a mensagem não for enviada
    }

    return NextResponse.json({ 
      message: 'Grupo/Canal VIP ativado com sucesso!',
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