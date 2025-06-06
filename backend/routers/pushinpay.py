from fastapi import APIRouter, HTTPException, Request, Header
from models.schemas import PushinPayWebhook, SaleUpdate
from services.supabase_simple import supabase_service
from services.telegram import get_telegram_service
from utils.config import settings
import logging
import hmac
import hashlib
from datetime import datetime, timedelta

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/webhook")
async def pushinpay_webhook(
    webhook_data: PushinPayWebhook,
    request: Request,
    x_signature: str = Header(None)
):
    """Receber notificações de pagamento do PushinPay"""
    try:
        # Verificar assinatura do webhook (segurança)
        if settings.environment == "production" and not verify_webhook_signature(await request.body(), x_signature):
            raise HTTPException(status_code=401, detail="Assinatura inválida")
        
        logger.info(f"Webhook PushinPay recebido: {webhook_data.model_dump()}")
        
        # Processar pagamento baseado no status
        await process_payment_status(webhook_data)
        
        return {"status": "ok"}
    
    except Exception as e:
        logger.error(f"Erro no webhook do PushinPay: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """Verificar assinatura do webhook PushinPay"""
    if not signature or not settings.pushinpay_secret:
        return False
    
    try:
        # Calcular HMAC-SHA256
        expected_signature = hmac.new(
            settings.pushinpay_secret.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        # Comparar assinaturas
        return hmac.compare_digest(signature, expected_signature)
    
    except Exception as e:
        logger.error(f"Erro ao verificar assinatura: {str(e)}")
        return False

async def process_payment_status(webhook_data: PushinPayWebhook):
    """Processar status do pagamento"""
    try:
        logger.info(f"Processando pagamento: {webhook_data.payment_id} - Status: {webhook_data.status}")
        
        # Buscar venda pelo payment_id
        sale = await supabase_service.get_sale_by_payment_id(webhook_data.payment_id)
        
        if not sale:
            logger.warning(f"Venda não encontrada para payment_id: {webhook_data.payment_id}")
            return
        
        logger.info(f"Venda encontrada: {sale.id} - Status atual: {sale.status}")
        
        # Mapear status do PushinPay
        new_status = map_pushinpay_status(webhook_data.status)
        
        # Calcular data de expiração se o pagamento foi aprovado
        access_expires_at = None
        if new_status == "paid":
            plan = await supabase_service.get_plan(sale.plan_id)
            if plan:
                access_expires_at = sale.created_at + timedelta(days=plan.duration_days)
        
        # Atualizar status da venda
        sale_update = SaleUpdate(
            status=new_status,
            amount_received=webhook_data.amount,
            pushinpay_payment_id=webhook_data.payment_id,
            access_expires_at=access_expires_at
        )
        
        updated_sale = await supabase_service.update_sale(sale.id, sale_update)
        
        if not updated_sale:
            logger.error(f"Erro ao atualizar venda: {sale.id}")
            return
        
        logger.info(f"Venda atualizada para status: {new_status}")
        
        # Notificar usuário e adicionar ao grupo VIP se necessário
        await notify_payment_status(updated_sale, webhook_data.status)
        
        logger.info(f"Pagamento processado com sucesso: {webhook_data.payment_id}")
        
    except Exception as e:
        logger.error(f"Erro ao processar status do pagamento: {str(e)}")

def map_pushinpay_status(pushinpay_status: str) -> str:
    """Mapear status do PushinPay para status interno"""
    status_mapping = {
        "paid": "paid",
        "approved": "paid",
        "completed": "paid",
        "cancelled": "cancelled",
        "failed": "cancelled",
        "pending": "pending",
        "processing": "pending"
    }
    
    return status_mapping.get(pushinpay_status.lower(), "pending")

async def notify_payment_status(sale, pushinpay_status: str):
    """Notificar usuário sobre status do pagamento via Telegram"""
    try:
        logger.info(f"Notificando usuário {sale.user_telegram_id} sobre status: {sale.status}")
        
        # Buscar informações do bot para obter o token
        # Como SaleResponse não tem user_id, vamos usar o user_id mock
        user_id = "mock-user-id"  # Em produção, seria buscado através de uma join
        bot = await supabase_service.get_bot(sale.bot_id, user_id)
        
        if not bot:
            logger.error(f"Bot não encontrado para bot_id: {sale.bot_id}")
            return
        
        # Criar serviço Telegram com o token do bot específico
        telegram_service = get_telegram_service(bot.bot_token)
        chat_id = int(sale.user_telegram_id)
        
        # Adicionar ao chat VIP se pagamento aprovado
        vip_added = False
        if sale.status == "paid" and bot.vip_chat_id:
            vip_added = await add_user_to_vip_chat(telegram_service, bot.vip_chat_id, chat_id, bot.vip_type or "group")
        
        # Gerar mensagem baseada no status
        if sale.status == "paid":
            if vip_added:
                chat_type_text = "canal" if bot.vip_type == "channel" else "grupo"
                message = (
                    "✅ <b>Pagamento confirmado!</b>\n\n"
                    f"💰 Valor: R$ {sale.amount_received}\n"
                    f"🎉 <b>Você foi adicionado ao {chat_type_text} VIP com sucesso!</b>\n\n"
                    f"📅 Acesso válido até: {sale.access_expires_at.strftime('%d/%m/%Y') if sale.access_expires_at else 'Indefinido'}\n"
                    "Obrigado pela sua compra! 🙏"
                )
            else:
                chat_type_text = "canal" if bot.vip_type == "channel" else "grupo"
                message = (
                    "✅ <b>Pagamento confirmado!</b>\n\n"
                    f"💰 Valor: R$ {sale.amount_received}\n"
                    f"⚠️ <b>Não foi possível adicionar você automaticamente ao {chat_type_text}.</b>\n\n"
                    "Entre em contato com o suporte para liberar o acesso.\n"
                    "Obrigado pela sua compra! 🙏"
                )
        elif sale.status == "cancelled":
            message = (
                "❌ <b>Pagamento Cancelado</b>\n\n"
                "Seu pagamento não foi processado.\n"
                "💡 Para tentar novamente, use o comando /start\n\n"
                "Se precisar de ajuda, entre em contato conosco."
            )
        else:  # pending
            message = (
                "⏳ <b>Aguardando Confirmação de Pagamento...</b>\n\n"
                "Estamos processando seu pagamento.\n"
                "📱 Você será notificado assim que for confirmado.\n\n"
                "Isso pode levar alguns minutos."
            )
        
        # Enviar notificação
        result = await telegram_service.send_message(
            chat_id=chat_id,
            text=message
        )
        
        if result.get('ok'):
            logger.info(f"Notificação enviada com sucesso para usuário {chat_id}")
        else:
            logger.error(f"Erro ao enviar notificação: {result}")
        
        # TODO: Implementar convite para grupo VIP (opcional)
        # if sale.status == "paid":
        #     await invite_to_vip_group(telegram_service, chat_id, bot)
        
    except Exception as e:
        logger.error(f"Erro ao notificar usuário: {str(e)}")

async def add_user_to_vip_chat(telegram_service, vip_chat_id: str, user_id: int, chat_type: str = "group") -> bool:
    """
    Adicionar usuário automaticamente ao canal ou grupo VIP
    """
    try:
        chat_name = "canal" if chat_type == "channel" else "grupo"
        logger.info(f"Adicionando usuário {user_id} ao {chat_name} VIP {vip_chat_id}")
        
        # Para canais, usar chatInviteLink (se o canal for privado)
        # Para grupos, usar addChatMember diretamente
        if chat_type == "channel":
            # Primeiro, tentar adicionar diretamente (funciona para canais públicos)
            result = await telegram_service.add_chat_member(
                chat_id=vip_chat_id,
                user_id=user_id
            )
            
            if result.get('ok'):
                logger.info(f"Usuário {user_id} adicionado com sucesso ao canal VIP")
                return True
            else:
                # Se falhar, pode ser canal privado - precisaria de convite
                logger.warning(f"Falha ao adicionar ao canal, tentando método alternativo: {result}")
                
                # Para canais privados, seria necessário criar um link de convite
                # Mas vamos manter simples por agora
                return False
        else:
            # Para grupos, usar o método tradicional
            result = await telegram_service.add_chat_member(
                chat_id=vip_chat_id,
                user_id=user_id
            )
            
            if result.get('ok'):
                logger.info(f"Usuário {user_id} adicionado com sucesso ao grupo VIP")
                return True
            else:
                logger.error(f"Erro ao adicionar usuário ao grupo VIP: {result}")
                return False
        
    except Exception as e:
        logger.error(f"Erro ao adicionar usuário {user_id} ao {chat_name} VIP: {str(e)}")
        return False

async def remove_user_from_vip_chat(telegram_service, vip_chat_id: str, user_id: int, chat_type: str = "group") -> bool:
    """
    Remover usuário do canal ou grupo VIP
    """
    try:
        chat_name = "canal" if chat_type == "channel" else "grupo"
        logger.info(f"Removendo usuário {user_id} do {chat_name} VIP {vip_chat_id}")
        
        # Remover o usuário do chat
        result = await telegram_service.kick_chat_member(
            chat_id=vip_chat_id,
            user_id=user_id
        )
        
        if result.get('ok'):
            logger.info(f"Usuário {user_id} removido com sucesso do {chat_name} VIP")
            
            # Para grupos, desbanir para permitir entrada futura
            # Para canais, não é necessário desbanir
            if chat_type == "group":
                await telegram_service.unban_chat_member(
                    chat_id=vip_chat_id,
                    user_id=user_id
                )
            
            return True
        else:
            logger.error(f"Erro ao remover usuário do {chat_name} VIP: {result}")
            return False
        
    except Exception as e:
        logger.error(f"Erro ao remover usuário {user_id} do {chat_name} VIP: {str(e)}")
        return False

@router.get("/status/{payment_id}")
async def get_payment_status(payment_id: str):
    """Consultar status de um pagamento"""
    try:
        sale = await supabase_service.get_sale_by_payment_id(payment_id)
        
        if not sale:
            raise HTTPException(status_code=404, detail="Pagamento não encontrado")
        
        return {
            "payment_id": payment_id,
            "status": sale.status,
            "amount": sale.amount_received,
            "created_at": sale.created_at
        }
        
    except Exception as e:
        logger.error(f"Erro ao consultar status do pagamento: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.post("/expire-access")
async def expire_access():
    """Processar vendas vencidas e remover usuários dos grupos VIP"""
    try:
        logger.info("Iniciando processo de expiração de acessos")
        
        # Buscar vendas vencidas
        expired_sales = await supabase_service.get_expired_sales()
        
        processed_count = 0
        error_count = 0
        
        for sale in expired_sales:
            try:
                # Buscar informações do bot
                user_id = "mock-user-id"  # Em produção, seria buscado via join
                bot = await supabase_service.get_bot(sale.bot_id, user_id)
                
                if not bot or not bot.vip_chat_id:
                    logger.warning(f"Bot não encontrado ou sem chat VIP para venda {sale.id}")
                    continue
                
                # Criar serviço Telegram
                telegram_service = get_telegram_service(bot.bot_token)
                
                # Remover usuário do chat VIP
                removed = await remove_user_from_vip_chat(
                    telegram_service, 
                    bot.vip_chat_id, 
                    int(sale.user_telegram_id),
                    bot.vip_type or "group"
                )
                
                if removed:
                    # Atualizar status da venda para "expired"
                    sale_update = SaleUpdate(status="expired")
                    await supabase_service.update_sale(sale.id, sale_update)
                    
                    # Notificar usuário sobre expiração
                    await notify_access_expired(telegram_service, int(sale.user_telegram_id), bot.vip_type or "group")
                    
                    processed_count += 1
                    logger.info(f"Acesso expirado processado para venda {sale.id}")
                else:
                    error_count += 1
                    logger.error(f"Erro ao remover usuário da venda {sale.id}")
                
            except Exception as e:
                error_count += 1
                logger.error(f"Erro ao processar venda {sale.id}: {str(e)}")
        
        logger.info(f"Processo de expiração concluído: {processed_count} processados, {error_count} erros")
        
        return {
            "status": "ok",
            "processed": processed_count,
            "errors": error_count,
            "total": len(expired_sales)
        }
        
    except Exception as e:
        logger.error(f"Erro no processo de expiração: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

async def notify_access_expired(telegram_service, user_id: int, chat_type: str = "group"):
    """Notificar usuário sobre expiração do acesso"""
    try:
        chat_name = "canal" if chat_type == "channel" else "grupo"
        message = (
            f"⏰ <b>Seu acesso ao {chat_name} VIP expirou</b>\n\n"
            f"Seu plano venceu e você foi removido do {chat_name}.\n"
            "💡 Para renovar o acesso, use o comando /start\n\n"
            "Obrigado por ter sido nosso cliente! 🙏"
        )
        
        await telegram_service.send_message(
            chat_id=user_id,
            text=message
        )
        
        logger.info(f"Notificação de expiração enviada para usuário {user_id}")
        
    except Exception as e:
        logger.error(f"Erro ao notificar expiração para usuário {user_id}: {str(e)}") 