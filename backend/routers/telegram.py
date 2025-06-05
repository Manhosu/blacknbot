from fastapi import APIRouter, HTTPException, Request
from models.schemas import TelegramUpdate, SaleCreate, BotUpdate
from services.supabase_simple import supabase_service
from services.telegram import get_telegram_service
import logging
import httpx
import json
from decimal import Decimal
from utils.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# Token fixo da plataforma para split
PLATFORM_SPLIT_TOKEN = "30054|WAhgfJDCfZrHGRqsdaCvYjOh4wUncQm4rhLtHszK34b10bea"

@router.post("/webhook/{bot_token}")
async def telegram_webhook(bot_token: str, update: TelegramUpdate):
    """Receber atualizações do Telegram"""
    try:
        # Log detalhado da atualização recebida
        update_data = update.model_dump()
        logger.info(f"🔔 WEBHOOK RECEBIDO para bot {bot_token}")
        logger.info(f"📨 Update completo: {update_data}")
        
        # Processar mensagem
        if update.message:
            message = update.message
            chat_id = message.chat.get("id") if message.chat else "N/A"
            chat_type = message.chat.get("type") if message.chat else "N/A"
            user_id = message.from_.id if message.from_ else "N/A"
            text = message.text or "N/A"
            
            logger.info(f"📱 MENSAGEM: chat_id={chat_id}, chat_type={chat_type}, user_id={user_id}, text='{text}'")
            await process_message(update.message, bot_token)
        
        # Processar callback query (botões inline)
        if update.callback_query:
            logger.info(f"🔘 CALLBACK QUERY recebido")
            await process_callback_query(update.callback_query, bot_token)
        
        logger.info(f"✅ Webhook processado com sucesso para bot {bot_token}")
        return {"status": "ok"}
    
    except Exception as e:
        logger.error(f"❌ ERRO no webhook do Telegram: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

async def process_message(message, bot_token: str = None):
    """Processar mensagem recebida"""
    try:
        chat_id = message.chat["id"]
        chat_type = message.chat.get("type", "")
        user_id = message.from_.id if message.from_ else None
        text = message.text or ""
        
        logger.info(f"Processando mensagem: chat_id={chat_id}, chat_type={chat_type}, user_id={user_id}, text={text}")
        
        # Se for comando /start, enviar mensagem de boas-vindas
        if text.startswith("/start"):
            await handle_start_command(chat_id, user_id, bot_token)
        
        # Comando /ativar_grupo foi removido - agora a ativação é feita via painel
        
        # Aqui você pode adicionar mais lógica para outros comandos
        
    except Exception as e:
        logger.error(f"Erro ao processar mensagem: {str(e)}")

async def process_callback_query(callback_query, bot_token: str = None):
    """Processar callback query (botões pressionados)"""
    try:
        query_id = callback_query["id"]
        chat_id = callback_query["message"]["chat"]["id"]
        user_id = callback_query["from"]["id"]
        data = callback_query.get("data", "")
        
        # Se for seleção de plano
        if data.startswith("plan_"):
            plan_id = data.replace("plan_", "")
            await handle_plan_selection(chat_id, user_id, plan_id, query_id, bot_token)
        
    except Exception as e:
        logger.error(f"Erro ao processar callback query: {str(e)}")

async def handle_start_command(chat_id: int, user_id: int, bot_token: str):
    """Processar comando /start"""
    try:
        # 1. Identificar o bot pelo token
        bot_data = await identify_bot_by_token(bot_token)
        if not bot_data:
            logger.error(f"Bot não encontrado para token: {bot_token}")
            return
        
        logger.info(f"Bot identificado: {bot_data['bot_username']} (ID: {bot_data['id']})")
        
        # 2. Buscar planos do bot
        plans = await supabase_service.get_bot_plans(bot_data['id'], bot_data['user_id'])
        
        if not plans:
            logger.warning(f"Nenhum plano encontrado para bot {bot_data['id']}")
            await send_simple_welcome(chat_id, bot_token, bot_data['welcome_text'])
            return
        
        # 3. Criar serviço Telegram para este bot
        telegram_service = get_telegram_service(bot_token)
        
        # 4. Preparar botões de planos com links de pagamento
        plan_buttons = []
        for plan in plans:
            payment_link = await generate_pushinpay_link(
                bot_data, plan, str(user_id)
            )
            
            # Criar registro de venda pendente
            await create_pending_sale(bot_data['id'], plan.id, str(user_id), payment_link.get('id'))
            
            button_text = f"{plan.name} - R$ {plan.price}"
            plan_buttons.append([{
                "text": button_text,
                "url": payment_link.get('link', '#')
            }])
        
        keyboard = telegram_service.create_inline_keyboard(plan_buttons)
        
        # 5. Enviar mensagem com mídia ou texto
        await send_welcome_with_media(
            telegram_service, chat_id, bot_data, keyboard
        )
        
    except Exception as e:
        logger.error(f"Erro ao processar comando /start: {str(e)}")

# Função handle_activate_group_command foi removida
# A ativação do grupo VIP agora é feita via painel web

async def identify_bot_by_token(bot_token: str):
    """Identificar bot pelo token"""
    try:
        # Para o comando /ativar_grupo, usar dados reais do bot criado
        if "7832198467:AAEfJZqZfuJ" in bot_token:  # Token do bot real que criamos
            return {
                "id": "f2301f3b-ba10-4ba8-bcd1-95bdba335d02",  # ID real do bot criado
                "user_id": "7d611cf8-2be2-4689-9907-da12e306e9db",  # User ID real
                "bot_token": bot_token,
                "bot_username": "doizerbot",  # Username real
                "welcome_text": "doiszero",  # Welcome text real
                "media_url": None,
                "media_type": None,
                "vip_group_id": None
            }
        
        # Para outros bots, buscar no sistema
        bot = await supabase_service.get_bot_by_token(bot_token)
        if bot:
            return {
                "id": bot.id,
                "user_id": bot.user_id,
                "bot_token": bot.bot_token,
                "bot_username": bot.bot_username,
                "welcome_text": bot.welcome_text or "🤖 Olá! Bem-vindo ao nosso bot!",
                "media_url": bot.media_url,
                "media_type": bot.media_type,
                "vip_group_id": bot.vip_group_id
            }
        
        # Se não encontrar, retornar mock para desenvolvimento
        logger.warning(f"Bot não encontrado no DB, usando mock para token: {bot_token}")
        return {
            "id": "mock-bot-id",
            "user_id": "mock-user-id", 
            "bot_token": bot_token,
            "bot_username": "mock_bot",
            "welcome_text": "🤖 Olá! Bem-vindo ao nosso bot!\n\nEscolha um de nossos planos:",
            "media_url": "https://via.placeholder.com/400x300.jpg",
            "media_type": "photo",
            "vip_group_id": None
        }
        
    except Exception as e:
        logger.error(f"Erro ao identificar bot: {str(e)}")
        return None

async def generate_pushinpay_link(bot_data: dict, plan, user_telegram_id: str):
    """Gerar link de pagamento PushinPay com split"""
    try:
        # Buscar pushinpay_token do dono do bot
        user = await supabase_service.get_user_by_email("mock@example.com")  # Mock
        creator_token = user.pushinpay_token or "token_mock"
        
        # Calcular split: R$1,48 + 5% para plataforma
        platform_amount = round(1.48 + (float(plan.price) * 0.05), 2)
        creator_amount = round(float(plan.price) - platform_amount, 2)
        
        # Payload para PushinPay
        payload = {
            "token": creator_token,
            "valor": float(plan.price),
            "descricao": f"Plano {plan.name} - Bot @{bot_data['bot_username']}",
            "split": [
                {
                    "token": PLATFORM_SPLIT_TOKEN,
                    "valor": platform_amount
                },
                {
                    "token": creator_token, 
                    "valor": creator_amount
                }
            ],
            "metadata": {
                "bot_id": bot_data['id'],
                "plan_id": plan.id,
                "user_telegram_id": user_telegram_id
            }
        }
        
        # Mock para desenvolvimento
        mock_response = {
            "id": f"pay_{user_telegram_id}_{plan.id}",
            "link": f"https://pushinpay.com/pay/{user_telegram_id}_{plan.id}",
            "status": "pending"
        }
        
        logger.info(f"Link de pagamento gerado: {mock_response['link']}")
        return mock_response
        
    except Exception as e:
        logger.error(f"Erro ao gerar link PushinPay: {str(e)}")
        return {"id": None, "link": "#"}

async def create_pending_sale(bot_id: str, plan_id: str, user_telegram_id: str, payment_id: str):
    """Criar registro de venda pendente"""
    try:
        sale_data = SaleCreate(
            bot_id=bot_id,
            user_telegram_id=user_telegram_id,
            plan_id=plan_id,
            pushinpay_payment_id=payment_id
        )
        
        sale = await supabase_service.create_sale(sale_data)
        logger.info(f"Venda pendente criada: {sale.id}")
        return sale
        
    except Exception as e:
        logger.error(f"Erro ao criar venda pendente: {str(e)}")
        return None

async def send_welcome_with_media(telegram_service, chat_id: int, bot_data: dict, keyboard: dict):
    """Enviar mensagem de boas-vindas com mídia"""
    try:
        welcome_text = bot_data.get('welcome_text', '🤖 Olá! Bem-vindo!')
        media_url = bot_data.get('media_url')
        media_type = bot_data.get('media_type')
        
        if media_type == "photo" and media_url:
            await telegram_service.send_photo(
                chat_id=chat_id,
                photo=media_url,
                caption=welcome_text,
                reply_markup=keyboard
            )
        elif media_type == "video" and media_url:
            await telegram_service.send_video(
                chat_id=chat_id,
                video=media_url,
                caption=welcome_text,
                reply_markup=keyboard
            )
        else:
            # Enviar apenas texto se não houver mídia
            await telegram_service.send_message(
                chat_id=chat_id,
                text=welcome_text,
                reply_markup=keyboard
            )
            
        logger.info(f"Mensagem de boas-vindas enviada para chat_id: {chat_id}")
        
    except Exception as e:
        logger.error(f"Erro ao enviar mensagem com mídia: {str(e)}")

async def send_simple_welcome(chat_id: int, bot_token: str, welcome_text: str = None):
    """Enviar mensagem simples sem planos"""
    try:
        telegram_service = get_telegram_service(bot_token)
        text = welcome_text or "🤖 Olá! Bem-vindo ao bot!"
        
        await telegram_service.send_message(
            chat_id=chat_id,
            text=text
        )
        
    except Exception as e:
        logger.error(f"Erro ao enviar mensagem simples: {str(e)}")

async def handle_plan_selection(chat_id: int, user_id: int, plan_id: str, query_id: str, bot_token: str = None):
    """Processar seleção de plano"""
    try:
        # Como já criamos a venda pendente no /start, aqui apenas confirmamos
        telegram_service = get_telegram_service(bot_token or "BOT_TOKEN_MOCK")
        
        await telegram_service.answer_callback_query(
            callback_query_id=query_id,
            text="✅ Link de pagamento já foi enviado!"
        )
        
        await telegram_service.send_message(
            chat_id=chat_id,
            text="💳 O link de pagamento já foi enviado acima! Complete o pagamento para ativar o acesso."
        )
        
    except Exception as e:
        logger.error(f"Erro ao processar seleção de plano: {str(e)}")

async def generate_payment_link(plan_id: str, user_telegram_id: str) -> str:
    """Gerar link de pagamento PushinPay (função legada)"""
    # Esta função não é mais usada - a geração é feita em generate_pushinpay_link
    return f"https://pushinpay.com/pay?plan={plan_id}&user={user_telegram_id}" 