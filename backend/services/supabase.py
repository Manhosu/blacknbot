try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("Supabase não disponível - executando em modo desenvolvimento")

from utils.config import settings
from typing import Dict, List, Optional
from models.schemas import (
    UserCreate, UserUpdate, UserResponse,
    BotCreate, BotUpdate, BotResponse,
    PlanCreate, PlanUpdate, PlanResponse,
    SaleCreate, SaleUpdate, SaleResponse
)

class SupabaseService:
    def __init__(self):
        self.supabase = None
        
    def get_client(self):
        if not SUPABASE_AVAILABLE:
            return None
            
        if self.supabase is None:
            try:
                self.supabase = create_client(
                    settings.supabase_url,
                    settings.supabase_service_role_key
                )
            except Exception as e:
                print(f"Erro ao conectar com Supabase: {e}")
                self.supabase = None
        return self.supabase
    
    # ===== USER METHODS =====
    async def create_user(self, user_data: UserCreate) -> UserResponse:
        """Criar usuário no Supabase Auth"""
        try:
            client = self.get_client()
            if not client:
                raise Exception("Cliente Supabase não disponível")
            # Criar usuário no auth
            auth_response = client.auth.admin.create_user({
                "email": user_data.email,
                "password": user_data.password,
                "email_confirm": True
            })
            
            if auth_response.user:
                return UserResponse(
                    id=auth_response.user.id,
                    email=auth_response.user.email,
                    pushinpay_token=None,
                    created_at=auth_response.user.created_at,
                    updated_at=auth_response.user.updated_at or auth_response.user.created_at
                )
            else:
                raise Exception("Erro ao criar usuário")
        except Exception as e:
            raise Exception(f"Erro ao criar usuário: {str(e)}")
    
    async def get_user_by_email(self, email: str) -> Optional[UserResponse]:
        """Buscar usuário por email"""
        try:
            response = self.supabase.table("users").select("*").eq("email", email).execute()
            if response.data:
                user_data = response.data[0]
                return UserResponse(**user_data)
            return None
        except Exception as e:
            print(f"Erro ao buscar usuário: {str(e)}")
            return None
    
    async def update_user(self, user_id: str, user_data: UserUpdate) -> UserResponse:
        """Atualizar dados do usuário"""
        try:
            update_data = user_data.model_dump(exclude_unset=True)
            response = self.supabase.table("users").update(update_data).eq("id", user_id).execute()
            if response.data:
                return UserResponse(**response.data[0])
            else:
                raise Exception("Usuário não encontrado")
        except Exception as e:
            raise Exception(f"Erro ao atualizar usuário: {str(e)}")
    
    # ===== BOT METHODS =====
    async def create_bot(self, user_id: str, bot_data: BotCreate) -> BotResponse:
        """Criar bot"""
        try:
            bot_dict = bot_data.model_dump()
            bot_dict["user_id"] = user_id
            
            response = self.supabase.table("bots").insert(bot_dict).execute()
            if response.data:
                return BotResponse(**response.data[0])
            else:
                raise Exception("Erro ao criar bot")
        except Exception as e:
            raise Exception(f"Erro ao criar bot: {str(e)}")
    
    async def get_user_bots(self, user_id: str) -> List[BotResponse]:
        """Buscar bots do usuário"""
        try:
            response = self.supabase.table("bots").select("*").eq("user_id", user_id).execute()
            return [BotResponse(**bot) for bot in response.data]
        except Exception as e:
            print(f"Erro ao buscar bots: {str(e)}")
            return []
    
    async def get_bot(self, bot_id: str, user_id: str) -> Optional[BotResponse]:
        """Buscar bot específico do usuário"""
        try:
            response = self.supabase.table("bots").select("*").eq("id", bot_id).eq("user_id", user_id).execute()
            if response.data:
                return BotResponse(**response.data[0])
            return None
        except Exception as e:
            print(f"Erro ao buscar bot: {str(e)}")
            return None
    
    async def update_bot(self, bot_id: str, user_id: str, bot_data: BotUpdate) -> BotResponse:
        """Atualizar bot"""
        try:
            update_data = bot_data.model_dump(exclude_unset=True)
            response = self.supabase.table("bots").update(update_data).eq("id", bot_id).eq("user_id", user_id).execute()
            if response.data:
                return BotResponse(**response.data[0])
            else:
                raise Exception("Bot não encontrado")
        except Exception as e:
            raise Exception(f"Erro ao atualizar bot: {str(e)}")
    
    # ===== PLAN METHODS =====
    async def create_plan(self, user_id: str, plan_data: PlanCreate) -> PlanResponse:
        """Criar plano"""
        try:
            # Verificar se o bot pertence ao usuário
            bot = await self.get_bot(plan_data.bot_id, user_id)
            if not bot:
                raise Exception("Bot não encontrado")
            
            plan_dict = plan_data.model_dump()
            response = self.supabase.table("plans").insert(plan_dict).execute()
            if response.data:
                return PlanResponse(**response.data[0])
            else:
                raise Exception("Erro ao criar plano")
        except Exception as e:
            raise Exception(f"Erro ao criar plano: {str(e)}")
    
    async def get_bot_plans(self, bot_id: str, user_id: str) -> List[PlanResponse]:
        """Buscar planos de um bot"""
        try:
            # Verificar se o bot pertence ao usuário
            bot = await self.get_bot(bot_id, user_id)
            if not bot:
                return []
            
            response = self.supabase.table("plans").select("*").eq("bot_id", bot_id).execute()
            return [PlanResponse(**plan) for plan in response.data]
        except Exception as e:
            print(f"Erro ao buscar planos: {str(e)}")
            return []
    
    # ===== SALE METHODS =====
    async def create_sale(self, sale_data: SaleCreate) -> SaleResponse:
        """Criar venda"""
        try:
            sale_dict = sale_data.model_dump()
            response = self.supabase.table("sales").insert(sale_dict).execute()
            if response.data:
                return SaleResponse(**response.data[0])
            else:
                raise Exception("Erro ao criar venda")
        except Exception as e:
            raise Exception(f"Erro ao criar venda: {str(e)}")
    
    async def get_bot_sales(self, bot_id: str, user_id: str) -> List[SaleResponse]:
        """Buscar vendas de um bot"""
        try:
            # Verificar se o bot pertence ao usuário
            bot = await self.get_bot(bot_id, user_id)
            if not bot:
                return []
            
            response = self.supabase.table("sales").select("*").eq("bot_id", bot_id).execute()
            return [SaleResponse(**sale) for sale in response.data]
        except Exception as e:
            print(f"Erro ao buscar vendas: {str(e)}")
            return []
    
    async def update_sale(self, sale_id: str, sale_data: SaleUpdate) -> Optional[SaleResponse]:
        """Atualizar venda"""
        try:
            update_data = sale_data.model_dump(exclude_unset=True)
            response = self.supabase.table("sales").update(update_data).eq("id", sale_id).execute()
            if response.data:
                return SaleResponse(**response.data[0])
            return None
        except Exception as e:
            print(f"Erro ao atualizar venda: {str(e)}")
            return None
    
    async def get_sale_by_payment_id(self, payment_id: str) -> Optional[SaleResponse]:
        """Buscar venda por ID do pagamento"""
        try:
            response = self.supabase.table("sales").select("*").eq("pushinpay_payment_id", payment_id).execute()
            if response.data:
                return SaleResponse(**response.data[0])
            return None
        except Exception as e:
            print(f"Erro ao buscar venda por payment_id: {str(e)}")
            return None

# Instância global do serviço
supabase_service = SupabaseService() 