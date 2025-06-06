import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

/**
 * API para ativação de chat VIP (grupos ou canais)
 * 
 * Funcionalidades:
 * - Auto-detecção do tipo de chat (grupo/supergrupo/canal)
 * - Auto-correção se o usuário selecionou o tipo errado
 * - Validação de permissões específicas para cada tipo
 * - Mensagens de erro detalhadas e amigáveis
 * 
 * Tipos suportados:
 * - Groups: grupos normais do Telegram
 * - Supergroups: grupos grandes (tratados como grupos)
 * - Channels: canais de transmissão
 */
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
    const { chat_input, chat_id, chat_type } = await request.json()

    if (!chat_input || !chat_id || !chat_type) {
      return NextResponse.json({ error: 'Dados do chat não fornecidos' }, { status: 400 })
    }

    if (!['group', 'channel'].includes(chat_type)) {
      return NextResponse.json({ error: 'Tipo de chat inválido' }, { status: 400 })
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

    // Validar chat com API do Telegram
    try {
      console.log(`🔍 Validando chat ${chat_id} como tipo: ${chat_type}`)
      console.log(`🤖 Bot token: ${bot.bot_token.substring(0, 20)}...`)
      
      // Para canais, primeiro tentar getChat direto
      // Para grupos, também usar getChat (que funciona para ambos)
      const telegramResponse = await fetch(`https://api.telegram.org/bot${bot.bot_token}/getChat?chat_id=${chat_id}`)
      const telegramData = await telegramResponse.json()
      
      console.log(`📡 Resposta do Telegram:`, telegramData)
      
      // Se getChat falhar, tentar abordagem alternativa para grupos
      if (!telegramData.ok && chat_type === 'group') {
        console.log(`🔄 getChat falhou para grupo, tentando getChatMember...`)
        
        // Para grupos, tentar getChatMember para ver se o bot está no grupo
        const memberResponse = await fetch(`https://api.telegram.org/bot${bot.bot_token}/getChatMember?chat_id=${chat_id}&user_id=${bot.bot_token.split(':')[0]}`)
        const memberData = await memberResponse.json()
        
        console.log(`👤 Resposta getChatMember:`, memberData)
        
        if (memberData.ok) {
          // Se conseguiu verificar o membro, o grupo existe, mas pode não ter permissão para getChat
          console.log(`✅ Bot está no grupo, mas getChat falhou - pode ser questão de permissões`)
          return NextResponse.json({ 
            error: `❌ Bot está no grupo mas não tem permissões suficientes. Promova o bot a administrador com todas as permissões necessárias.`,
            telegram_error: telegramData.description,
            member_status: memberData.result?.status
          }, { status: 400 })
        }
      }
      
      if (!telegramData.ok) {
        let errorMessage = 'Chat não encontrado ou bot não tem acesso'
        
        // Mensagens específicas baseadas no tipo esperado
        const expectedType = chat_type === 'channel' ? 'canal' : 'grupo'
        
        // Adicionar informações específicas do erro
        if (telegramData.description) {
          if (telegramData.description.includes('chat not found')) {
            errorMessage = `❌ ${expectedType.charAt(0).toUpperCase() + expectedType.slice(1)} não encontrado. 

🔍 **Possíveis causas:**
• O ID/link está incorreto
• O ${expectedType} não existe
• O bot não foi adicionado ao ${expectedType}

📋 **Como corrigir:**
1. Verifique se o ID está correto (formato: -100XXXXXXXXXX)
2. Adicione o bot ao ${expectedType} primeiro
3. Promova o bot como administrador
4. Tente novamente

💡 **Dica:** Use o link do ${expectedType} (https://t.me/nome) em vez do ID se possível.`
          } else if (telegramData.description.includes('bot is not a member')) {
            errorMessage = `❌ Bot não é membro deste ${expectedType}. Adicione o bot primeiro ao ${expectedType} e tente novamente.`
          } else if (telegramData.description.includes('Forbidden')) {
            errorMessage = `❌ Bot não tem permissão para acessar este ${expectedType}. Verifique as configurações de privacidade do ${expectedType}.`
          } else if (telegramData.description.includes('Bad Request')) {
            errorMessage = `❌ ${expectedType.charAt(0).toUpperCase() + expectedType.slice(1)} inválido ou inacessível. Verifique se o bot foi adicionado ao ${expectedType} como administrador.`
          } else {
            errorMessage = `❌ Erro do Telegram: ${telegramData.description}`
          }
        }
        
        console.log(`❌ Erro na validação do chat: ${telegramData.description}`)
        console.log(`📋 Tipo esperado: ${expectedType}, Chat ID: ${chat_id}`)
        
        // Adicionar informações de debug
        const debugInfo = {
          bot_username: bot.bot_username,
          chat_id: chat_id,
          expected_type: expectedType,
          telegram_error: telegramData.description,
          suggested_steps: [
            `1. Crie um ${expectedType} no Telegram`,
            `2. Adicione @${bot.bot_username} ao ${expectedType}`,
            `3. Promova o bot como administrador`,
            `4. Use o link (https://t.me/nome) em vez do ID`
          ]
        }
        
        return NextResponse.json({ 
          error: errorMessage,
          debug: debugInfo
        }, { status: 400 })
      }

      // Obter informações do chat
      const actualChatType = telegramData.result?.type
      const chatName = telegramData.result?.title || telegramData.result?.username || 'Chat sem nome'
      
      console.log(`📋 Chat encontrado - Tipo real: ${actualChatType}, Nome: ${chatName}`)

      // Verificar se é um tipo de chat suportado
      if (!['group', 'supergroup', 'channel'].includes(actualChatType)) {
        return NextResponse.json({ 
          error: `❌ Tipo de chat não suportado: ${actualChatType}. Apenas grupos, supergrupos e canais são aceitos.` 
        }, { status: 400 })
      }

      // Auto-corrigir o tipo se necessário
      let finalChatType = chat_type
      if (actualChatType === 'supergroup' || actualChatType === 'group') {
        finalChatType = 'group'
        if (chat_type === 'channel') {
          console.log(`🔄 Auto-corrigindo: usuário selecionou canal, mas é um ${actualChatType}`)
        }
      } else if (actualChatType === 'channel') {
        finalChatType = 'channel'
        if (chat_type === 'group') {
          console.log(`🔄 Auto-corrigindo: usuário selecionou grupo, mas é um canal`)
        }
      }

      console.log(`✅ Tipo final determinado: ${finalChatType} (tipo real: ${actualChatType})`)

      // Verificar se o bot é administrador (necessário para grupos e canais)
      console.log(`🔐 Verificando permissões de administrador...`)
      
      const adminResponse = await fetch(`https://api.telegram.org/bot${bot.bot_token}/getChatAdministrators?chat_id=${chat_id}`)
      const adminData = await adminResponse.json()
      
      if (adminData.ok) {
        const botInfo = await fetch(`https://api.telegram.org/bot${bot.bot_token}/getMe`)
        const botInfoData = await botInfo.json()
        
        if (botInfoData.ok) {
          const botTelegramId = botInfoData.result.id
          const isAdmin = adminData.result.some((admin: any) => admin.user.id === botTelegramId)
          
          console.log(`🤖 Bot ID: ${botTelegramId}, É admin: ${isAdmin}`)
          
          if (!isAdmin) {
            const chatTypeText = finalChatType === 'channel' ? 'canal' : 'grupo'
            return NextResponse.json({ 
              error: `❌ O bot precisa ser administrador do ${chatTypeText} para funcionar corretamente. Adicione o bot como administrador com permissões para convidar usuários.` 
            }, { status: 400 })
          }
          
          // Para canais, verificar se o bot tem permissão para convidar usuários
          if (finalChatType === 'channel') {
            const botAdmin = adminData.result.find((admin: any) => admin.user.id === botTelegramId)
            if (botAdmin && !botAdmin.can_invite_users) {
              return NextResponse.json({ 
                error: '❌ Bot precisa ter permissão para convidar usuários no canal. Verifique as configurações de administrador.' 
              }, { status: 400 })
            }
            console.log(`✅ Bot tem permissão para convidar usuários no canal`)
          }
          
          console.log(`✅ Permissões de administrador verificadas com sucesso`)
        }
      } else {
        // Para canais públicos, pode não conseguir listar administradores
        if (finalChatType === 'channel') {
          console.log(`⚠️ Não foi possível verificar administradores do canal (pode ser público), continuando...`)
        } else {
          console.log(`❌ Erro ao verificar administradores: ${adminData.description}`)
          return NextResponse.json({ 
            error: '❌ Não foi possível verificar permissões do bot. Certifique-se de que o bot é administrador.' 
          }, { status: 400 })
        }
      }

      // Atualizar o chat VIP diretamente no Supabase
      console.log(`💾 Salvando no banco: chat_id=${chat_id}, tipo=${finalChatType}, nome=${chatName}`)
      
      const { data: updatedBot, error: updateError } = await supabase
        .from('bots')
        .update({ 
          vip_chat_id: chat_id,
          vip_type: finalChatType,
          vip_name: chatName
        })
        .eq('id', bot_id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Erro ao atualizar bot:', updateError)
        return NextResponse.json({ error: `❌ Erro ao ativar ${finalChatType === 'channel' ? 'canal' : 'grupo'}` }, { status: 500 })
      }
      
      console.log(`✅ Bot atualizado com sucesso no banco de dados`)

      // Enviar mensagem de confirmação no chat
      let messageSent = false
      try {
        const chatTypeText = finalChatType === 'channel' ? 'canal' : 'grupo'
        const chatIcon = finalChatType === 'channel' ? '📢' : '📱'
        
        console.log(`📤 Enviando mensagem de confirmação no ${chatTypeText}...`)
        
        const messageText = `🎉 *Bot Ativado com Sucesso!*

✅ O bot @${bot.bot_username} foi integrado a este ${chatIcon} ${chatTypeText} VIP!

🔹 *Funcionalidades ativas:*
• Adição automática de usuários pagantes
• Remoção automática quando pagamento expira
• Sistema de vendas integrado

💡 *O que isso significa:*
Agora quando alguém comprar um plano do seu bot, será automaticamente adicionado neste ${chatTypeText}!

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
            chat_id: chat_id,
            text: messageText,
            parse_mode: 'Markdown'
          })
        })

        const messageData = await messageResponse.json()
        messageSent = messageData.ok
        
        if (messageSent) {
          console.log(`✅ Mensagem de ativação enviada no ${chatTypeText} com sucesso`)
        } else {
          console.log(`⚠️ Erro ao enviar mensagem no ${chatTypeText}:`, messageData.description)
        }
        
      } catch (error) {
        console.error(`❌ Erro ao enviar mensagem no ${finalChatType === 'channel' ? 'canal' : 'grupo'}:`, error)
        // Não falhar a ativação se a mensagem não for enviada
      }

      return NextResponse.json({ 
        message: `✅ ${finalChatType === 'channel' ? '📢 Canal' : '📱 Grupo'} VIP ativado com sucesso!`,
        bot: updatedBot,
        messageSent: messageSent,
        chatName: chatName,
        actualType: finalChatType,
        detectedType: actualChatType
      })

    } catch (error) {
      console.error('❌ Erro ao validar chat:', error)
      return NextResponse.json({ 
        error: `❌ Erro ao validar acesso ao chat. Verifique se o link/ID está correto e tente novamente.` 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Erro na API de ativação de chat:', error)
    return NextResponse.json(
      { detail: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
} 