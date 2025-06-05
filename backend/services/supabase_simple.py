from typing import Dict, List, Optional
from models.schemas import (
    UserCreate, UserUpdate, UserResponse,
    BotCreate, BotUpdate, BotResponse,
    PlanCreate, PlanUpdate, PlanResponse,
    SaleCreate, SaleUpdate, SaleResponse
)
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class SupabaseService:
    """Versão simplificada para desenvolvimento"""
    
    def __init__(self):
        self.mock_data = {
            "users": [],
            "bots": [],
            "plans": [],
            "sales": []
        }
    
    # ===== USER METHODS =====
    async def create_user(self, user_data: UserCreate) -> UserResponse:
        """Criar usuário (mock)"""
        user = UserResponse(
            id="mock-user-id",
            email=user_data.email,
            pushinpay_token=None,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        self.mock_data["users"].append(user)
        return user
    
    async def get_user_by_email(self, email: str) -> Optional[UserResponse]:
        """Buscar usuário por email (mock)"""
        for user in self.mock_data["users"]:
            if user.email == email:
                return user
        # Retornar usuário mock para desenvolvimento
        return UserResponse(
            id="mock-user-id",
            email=email,
            pushinpay_token=None,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    
    async def update_user(self, user_id: str, user_data: UserUpdate) -> UserResponse:
        """Atualizar usuário (mock)"""
        return UserResponse(
            id=user_id,
            email="mock@example.com",
            pushinpay_token=user_data.pushinpay_token,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    
    # ===== BOT METHODS =====
    async def create_bot(self, user_id: str, bot_data: BotCreate) -> BotResponse:
        """Criar bot (mock)"""
        bot = BotResponse(
            id="mock-bot-id",
            user_id=user_id,
            bot_token=bot_data.bot_token,
            bot_username=bot_data.bot_username,
            welcome_text=bot_data.welcome_text,
            media_url=bot_data.media_url,
            media_type=bot_data.media_type,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        self.mock_data["bots"].append(bot)
        return bot
    
    async def get_user_bots(self, user_id: str) -> List[BotResponse]:
        """Buscar bots do usuário (mock)"""
        return [bot for bot in self.mock_data["bots"] if bot.user_id == user_id]
    
    async def get_bot(self, bot_id: str, user_id: str) -> Optional[BotResponse]:
        """Buscar bot específico (mock)"""
        for bot in self.mock_data["bots"]:
            if bot.id == bot_id and bot.user_id == user_id:
                return bot
        
        # Retornar bot mock para desenvolvimento
        return BotResponse(
            id=bot_id,
            user_id=user_id,
            bot_token="mock_bot_token_123",
            bot_username="mock_bot",
            welcome_text="Bem-vindo ao bot!",
            media_url="https://via.placeholder.com/400x300.jpg",
            media_type="photo",
            vip_group_id="-1001234567890",  # ID mock do grupo VIP
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    
    async def update_bot(self, bot_id: str, user_id: str, bot_data: BotUpdate) -> BotResponse:
        """Atualizar bot (mock)"""
        return BotResponse(
            id=bot_id,
            user_id=user_id,
            bot_token="mock_token",
            bot_username=bot_data.bot_username or "mock_bot",
            welcome_text=bot_data.welcome_text,
            media_url=bot_data.media_url,
            media_type=bot_data.media_type,
            vip_group_id=bot_data.vip_group_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    
    async def get_bot_by_token(self, bot_token: str) -> Optional[BotResponse]:
        """Buscar bot pelo token (mock)"""
        for bot in self.mock_data["bots"]:
            if bot.bot_token == bot_token:
                return bot
        
        # Retornar bot mock para desenvolvimento
        return BotResponse(
            id="mock-bot-id",
            user_id="mock-user-id",
            bot_token=bot_token,
            bot_username="mock_bot",
            welcome_text="🤖 Olá! Bem-vindo ao nosso bot!",
            media_url="https://via.placeholder.com/400x300.jpg",
            media_type="photo",
            vip_group_id=None,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    
    async def update_bot_vip_group(self, bot_token: str, vip_group_id: str) -> bool:
        """Atualizar vip_group_id do bot especificamente para ativação de grupo"""
        try:
            # Em produção, isso seria uma atualização direta no Supabase
            # UPDATE bots SET vip_group_id = ? WHERE bot_token = ?
            
            # Para mock, apenas loggar a operação
            logger.info(f"Mock: Atualizando bot com token {bot_token} para vip_group_id {vip_group_id}")
            
            # Simular sucesso
            return True
            
        except Exception as e:
            logger.error(f"Erro ao atualizar vip_group_id: {str(e)}")
            return False
    
    # ===== PLAN METHODS =====
    async def create_plan(self, user_id: str, plan_data: PlanCreate) -> PlanResponse:
        """Criar plano (mock)"""
        plan = PlanResponse(
            id="mock-plan-id",
            bot_id=plan_data.bot_id,
            name=plan_data.name,
            price=plan_data.price,
            duration_days=plan_data.duration_days,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        self.mock_data["plans"].append(plan)
        return plan
    
    async def get_bot_plans(self, bot_id: str, user_id: str) -> List[PlanResponse]:
        """Buscar planos de um bot (mock)"""
        return [plan for plan in self.mock_data["plans"] if plan.bot_id == bot_id]
    
    async def get_plan(self, plan_id: str) -> Optional[PlanResponse]:
        """Buscar plano por ID (mock)"""
        for plan in self.mock_data["plans"]:
            if plan.id == plan_id:
                return plan
        
        # Retornar plano mock para desenvolvimento
        return PlanResponse(
            id=plan_id,
            bot_id="mock-bot-id",
            name="Plano VIP",
            price=29.90,
            duration_days=30,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    
    # ===== SALE METHODS =====
    async def create_sale(self, sale_data: SaleCreate) -> SaleResponse:
        """Criar venda (mock)"""
        sale = SaleResponse(
            id="mock-sale-id",
            bot_id=sale_data.bot_id,
            user_telegram_id=sale_data.user_telegram_id,
            plan_id=sale_data.plan_id,
            status="pending",
            pushinpay_payment_id=sale_data.pushinpay_payment_id,
            amount_received=None,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        self.mock_data["sales"].append(sale)
        return sale
    
    async def get_bot_sales(self, bot_id: str, user_id: str) -> List[SaleResponse]:
        """Buscar vendas de um bot (mock)"""
        return [sale for sale in self.mock_data["sales"] if sale.bot_id == bot_id]
    
    async def update_sale(self, sale_id: str, sale_data: SaleUpdate) -> Optional[SaleResponse]:
        """Atualizar venda (mock)"""
        for sale in self.mock_data["sales"]:
            if sale.id == sale_id:
                return SaleResponse(
                    id=sale_id,
                    bot_id=sale.bot_id,
                    user_telegram_id=sale.user_telegram_id,
                    plan_id=sale.plan_id,
                    status=sale_data.status or sale.status,
                    pushinpay_payment_id=sale_data.pushinpay_payment_id or sale.pushinpay_payment_id,
                    amount_received=sale_data.amount_received or sale.amount_received,
                    created_at=sale.created_at,
                    updated_at=datetime.now()
                )
        return None
    
    async def get_sale_by_payment_id(self, payment_id: str) -> Optional[SaleResponse]:
        """Buscar venda por ID do pagamento (mock)"""
        for sale in self.mock_data["sales"]:
            if sale.pushinpay_payment_id == payment_id:
                return sale
        
        # Retornar venda mock para desenvolvimento/teste
        return SaleResponse(
            id="mock-sale-id",
            bot_id="mock-bot-id",
            user_telegram_id="123456789",
            plan_id="mock-plan-id",
            status="pending",
            pushinpay_payment_id=payment_id,
            amount_received=None,
            access_expires_at=None,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    
    async def get_expired_sales(self) -> List[SaleResponse]:
        """Buscar vendas vencidas que precisam ser removidas do grupo (mock)"""
        # Em produção, seria uma query SQL:
        # SELECT * FROM sales 
        # WHERE status = 'paid' 
        # AND access_expires_at < now() - interval '3 days'
        
        # Para mock, retorna lista vazia ou vendas simuladas
        return []

# Instância global do serviço
supabase_service = SupabaseService() 