from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer
from typing import List
from models.schemas import (
    BotCreate, BotUpdate, BotResponse,
    PlanCreate, PlanResponse,
    WelcomeMessageUpdate,
    SaleResponse,
    UserResponse,
    LoginRequest,
    Token,
    BotActivationRequest
)
from services.supabase_simple import supabase_service
from services.telegram import get_telegram_service, extract_group_id_from_link
from utils.auth import get_current_user_email, create_access_token, verify_password
from datetime import timedelta
import logging

router = APIRouter()
logger = logging.getLogger(__name__)
security = HTTPBearer()

# ===== AUTH ENDPOINTS =====
@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest):
    """Login do usuário"""
    try:
        # Buscar usuário por email
        user = await supabase_service.get_user_by_email(login_data.email)
        
        if not user:
            raise HTTPException(status_code=401, detail="Email ou senha incorretos")
        
        # Verificar senha (aqui você precisaria ter a senha hash salva)
        # Por enquanto, vamos simular que a verificação passou
        
        # Criar token de acesso
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user.email},
            expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no login: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/me", response_model=UserResponse)
async def get_current_user(current_user_email: str = Depends(get_current_user_email)):
    """Obter dados do usuário atual"""
    try:
        user = await supabase_service.get_user_by_email(current_user_email)
        
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar usuário: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# ===== BOT ENDPOINTS =====
@router.get("/bots", response_model=List[BotResponse])
async def get_user_bots(current_user_email: str = Depends(get_current_user_email)):
    """Listar bots do usuário"""
    try:
        # Buscar ID do usuário
        user = await supabase_service.get_user_by_email(current_user_email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        bots = await supabase_service.get_user_bots(user.id)
        return bots
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar bots: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.post("/bots", response_model=BotResponse)
async def create_bot(
    bot_data: BotCreate,
    current_user_email: str = Depends(get_current_user_email)
):
    """Criar novo bot"""
    try:
        # Buscar ID do usuário
        user = await supabase_service.get_user_by_email(current_user_email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        bot = await supabase_service.create_bot(user.id, bot_data)
        return bot
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar bot: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/bots/{bot_id}", response_model=BotResponse)
async def get_bot(
    bot_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """Obter bot específico"""
    try:
        # Buscar ID do usuário
        user = await supabase_service.get_user_by_email(current_user_email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        bot = await supabase_service.get_bot(bot_id, user.id)
        
        if not bot:
            raise HTTPException(status_code=404, detail="Bot não encontrado")
        
        return bot
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar bot: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.put("/bots/{bot_id}", response_model=BotResponse)
async def update_bot(
    bot_id: str,
    bot_data: BotUpdate,
    current_user_email: str = Depends(get_current_user_email)
):
    """Atualizar bot"""
    try:
        # Buscar ID do usuário
        user = await supabase_service.get_user_by_email(current_user_email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        bot = await supabase_service.update_bot(bot_id, user.id, bot_data)
        return bot
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar bot: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.post("/bots/{bot_id}/activate-group")
async def activate_group_via_panel(
    bot_id: str,
    group_data: dict,
    current_user_email: str = Depends(get_current_user_email)
):
    """Ativar grupo VIP via painel (nova implementação)"""
    try:
        logger.info(f"🎯 Ativação de grupo via painel: bot_id={bot_id}, user={current_user_email}")
        
        # Buscar ID do usuário
        user = await supabase_service.get_user_by_email(current_user_email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        # Verificar se o bot pertence ao usuário
        bot = await supabase_service.get_bot(bot_id, user.id)
        if not bot:
            raise HTTPException(status_code=404, detail="Bot não encontrado")
        
        # Extrair dados do grupo
        group_input = group_data.get('group_input', '')
        group_id = group_data.get('group_id', '')
        
        if not group_input or not group_id:
            raise HTTPException(status_code=400, detail="Dados do grupo não fornecidos")
        
        logger.info(f"🔍 Validando grupo: input='{group_input}', id='{group_id}'")
        
        # Criar serviço Telegram para este bot
        telegram_service = get_telegram_service(bot.bot_token)
        
        # 1. Tentar obter informações do chat para validar acesso
        chat_info = await telegram_service.get_chat(group_id)
        
        if not chat_info.get("ok"):
            logger.error(f"❌ Erro ao acessar grupo {group_id}: {chat_info}")
            raise HTTPException(
                status_code=400, 
                detail="Bot não tem acesso ao grupo ou grupo não encontrado"
            )
        
        chat_data = chat_info.get("result", {})
        chat_title = chat_data.get("title", "Grupo Desconhecido")
        chat_type = chat_data.get("type", "unknown")
        
        logger.info(f"✅ Chat encontrado: '{chat_title}' (tipo: {chat_type})")
        
        # 2. Verificar se é um grupo/supergrupo
        if chat_type not in ["group", "supergroup"]:
            raise HTTPException(
                status_code=400,
                detail="O chat deve ser um grupo ou supergrupo"
            )
        
        # 3. Verificar se o bot é administrador
        admins_response = await telegram_service.get_chat_administrators(group_id)
        
        if not admins_response.get("ok"):
            logger.error(f"❌ Erro ao obter administradores: {admins_response}")
            raise HTTPException(
                status_code=400,
                detail="Não foi possível verificar permissões do bot no grupo"
            )
        
        # 4. Obter informações do bot para comparar
        bot_info = await telegram_service.get_me()
        if not bot_info.get("ok"):
            logger.error(f"❌ Erro ao obter informações do bot: {bot_info}")
            raise HTTPException(
                status_code=400,
                detail="Erro ao verificar informações do bot"
            )
        
        bot_telegram_id = bot_info["result"]["id"]
        bot_username = bot_info["result"]["username"]
        
        # 5. Verificar se o bot está na lista de administradores
        admins = admins_response.get("result", [])
        is_admin = False
        
        for admin in admins:
            if admin["user"]["id"] == bot_telegram_id:
                is_admin = True
                admin_status = admin.get("status", "unknown")
                logger.info(f"✅ Bot @{bot_username} é admin: status={admin_status}")
                break
        
        if not is_admin:
            logger.warning(f"❌ Bot @{bot_username} não é admin no grupo")
            raise HTTPException(
                status_code=400,
                detail="O bot precisa ser administrador do grupo para ativá-lo"
            )
        
        # 6. Salvar vip_group_id no bot
        try:
            logger.info(f"🔄 Salvando vip_group_id: bot_id={bot_id}, group_id={group_id}")
            
            bot_update = BotUpdate(vip_group_id=group_id)
            updated_bot = await supabase_service.update_bot(bot_id, user.id, bot_update)
            
            logger.info(f"✅ Grupo VIP ativado com sucesso: {group_id}")
            
            return {
                "message": "✅ Grupo VIP ativado com sucesso!",
                "bot": {
                    "id": updated_bot.id,
                    "bot_username": updated_bot.bot_username,
                    "vip_group_id": updated_bot.vip_group_id
                },
                "group_info": {
                    "id": group_id,
                    "title": chat_title,
                    "type": chat_type
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Erro ao salvar vip_group_id: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Erro ao salvar configuração do grupo"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro geral na ativação: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# Endpoint antigo mantido para compatibilidade (será removido em breve)
@router.post("/bots/{bot_id}/activate")
async def activate_bot_legacy(
    bot_id: str,
    activation_data: BotActivationRequest,
    current_user_email: str = Depends(get_current_user_email)
):
    """Ativar bot com grupo VIP (método legado - será removido)"""
    try:
        # Buscar ID do usuário
        user = await supabase_service.get_user_by_email(current_user_email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        # Verificar se o bot pertence ao usuário
        bot = await supabase_service.get_bot(bot_id, user.id)
        if not bot:
            raise HTTPException(status_code=404, detail="Bot não encontrado")
        
        # Extrair group_id do link
        group_id = extract_group_id_from_link(activation_data.vip_group_link)
        
        # Validar permissões do bot no grupo
        telegram_service = get_telegram_service(bot.bot_token)
        
        # Tentar obter informações do chat para validar acesso
        chat_info = await telegram_service.get_chat(group_id)
        
        if not chat_info.get("ok"):
            logger.error(f"Erro ao acessar grupo {group_id}: {chat_info}")
            raise HTTPException(
                status_code=400, 
                detail="Bot não tem acesso ao grupo ou grupo não encontrado"
            )
        
        # Verificar se o bot é administrador
        admins_response = await telegram_service.get_chat_administrators(group_id)
        
        if not admins_response.get("ok"):
            logger.error(f"Erro ao obter administradores: {admins_response}")
            raise HTTPException(
                status_code=400,
                detail="Não foi possível verificar permissões do bot no grupo"
            )
        
        # Verificar se o bot está na lista de administradores
        admins = admins_response.get("result", [])
        bot_username = None
        
        # Obter username do bot através da API
        bot_info = await telegram_service.get_me()
        if bot_info.get("ok"):
            bot_username = bot_info["result"]["username"]
        
        is_admin = False
        if bot_username:
            for admin in admins:
                if admin["user"]["username"] == bot_username:
                    is_admin = True
                    break
        
        if not is_admin:
            raise HTTPException(
                status_code=400,
                detail="Bot não é administrador do grupo. Adicione o bot como administrador com permissões para convidar usuários."
            )
        
        # Atualizar bot com o vip_group_id
        bot_update = BotUpdate(vip_group_id=group_id)
        updated_bot = await supabase_service.update_bot(bot_id, user.id, bot_update)
        
        return {
            "message": "Ativação do bot feita com sucesso",
            "bot": updated_bot,
            "group_info": {
                "title": chat_info["result"].get("title", ""),
                "type": chat_info["result"].get("type", ""),
                "member_count": chat_info["result"].get("member_count", 0)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao ativar bot: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# ===== MESSAGE ENDPOINTS =====
@router.post("/message")
async def update_welcome_message(
    message_data: WelcomeMessageUpdate,
    current_user_email: str = Depends(get_current_user_email)
):
    """Atualizar mensagem de boas-vindas"""
    try:
        # Buscar ID do usuário
        user = await supabase_service.get_user_by_email(current_user_email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        # Verificar se o bot pertence ao usuário
        bot = await supabase_service.get_bot(message_data.bot_id, user.id)
        if not bot:
            raise HTTPException(status_code=404, detail="Bot não encontrado")
        
        # Atualizar mensagem
        bot_update = BotUpdate(
            welcome_text=message_data.welcome_text,
            media_url=message_data.media_url,
            media_type=message_data.media_type
        )
        
        updated_bot = await supabase_service.update_bot(message_data.bot_id, user.id, bot_update)
        
        return {"message": "Mensagem de boas-vindas atualizada com sucesso", "bot": updated_bot}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar mensagem: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# ===== PLAN ENDPOINTS =====
@router.post("/plans", response_model=PlanResponse)
async def create_plan(
    plan_data: PlanCreate,
    current_user_email: str = Depends(get_current_user_email)
):
    """Criar novo plano"""
    try:
        # Buscar ID do usuário
        user = await supabase_service.get_user_by_email(current_user_email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        plan = await supabase_service.create_plan(user.id, plan_data)
        return plan
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar plano: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/bots/{bot_id}/plans", response_model=List[PlanResponse])
async def get_bot_plans(
    bot_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """Listar planos de um bot"""
    try:
        # Buscar ID do usuário
        user = await supabase_service.get_user_by_email(current_user_email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        plans = await supabase_service.get_bot_plans(bot_id, user.id)
        return plans
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar planos: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# ===== SALES ENDPOINTS =====
@router.get("/sales", response_model=List[SaleResponse])
async def get_user_sales(
    bot_id: str = None,
    current_user_email: str = Depends(get_current_user_email)
):
    """Listar vendas do usuário"""
    try:
        # Buscar ID do usuário
        user = await supabase_service.get_user_by_email(current_user_email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        if bot_id:
            # Buscar vendas de um bot específico
            sales = await supabase_service.get_bot_sales(bot_id, user.id)
        else:
            # Buscar vendas de todos os bots do usuário
            user_bots = await supabase_service.get_user_bots(user.id)
            sales = []
            for bot in user_bots:
                bot_sales = await supabase_service.get_bot_sales(bot.id, user.id)
                sales.extend(bot_sales)
        
        return sales
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar vendas: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/bots/{bot_id}/sales", response_model=List[SaleResponse])
async def get_bot_sales(
    bot_id: str,
    current_user_email: str = Depends(get_current_user_email)
):
    """Listar vendas de um bot específico"""
    try:
        # Buscar ID do usuário
        user = await supabase_service.get_user_by_email(current_user_email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        sales = await supabase_service.get_bot_sales(bot_id, user.id)
        return sales
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar vendas do bot: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor") 