from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime
from decimal import Decimal

# Esquemas para User
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    pushinpay_token: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    pushinpay_token: Optional[str]
    created_at: datetime
    updated_at: datetime

# Esquemas para Bot
class BotCreate(BaseModel):
    bot_token: str
    bot_username: str
    name: Optional[str] = None
    description: Optional[str] = None
    welcome_text: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[Literal["photo", "video"]] = None

class BotUpdate(BaseModel):
    bot_username: Optional[str] = None
    welcome_text: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[Literal["photo", "video"]] = None
    vip_chat_id: Optional[str] = None
    vip_type: Optional[Literal["group", "channel"]] = None
    vip_name: Optional[str] = None

class BotResponse(BaseModel):
    id: str
    user_id: str
    bot_token: str
    bot_username: str
    name: Optional[str]
    description: Optional[str]
    welcome_text: Optional[str]
    media_url: Optional[str]
    media_type: Optional[str]
    vip_chat_id: Optional[str] = None  # ID do chat VIP (grupo ou canal)
    vip_type: Optional[Literal["group", "channel"]] = None  # Tipo do chat VIP
    vip_name: Optional[str] = None  # Nome do chat VIP
    is_active: Optional[bool] = True
    created_at: datetime
    updated_at: datetime

# Esquemas para Plan
class PlanCreate(BaseModel):
    bot_id: str
    name: str
    price: Decimal = Field(..., ge=4.90, description="Preço mínimo de R$4,90")
    duration_days: int

class PlanUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=4.90, description="Preço mínimo de R$4,90")
    duration_days: Optional[int] = None

class PlanResponse(BaseModel):
    id: str
    bot_id: str
    name: str
    price: Decimal
    duration_days: int
    created_at: datetime
    updated_at: datetime

# Esquemas para Sale
class SaleCreate(BaseModel):
    bot_id: str
    user_telegram_id: str
    plan_id: str
    pushinpay_payment_id: Optional[str] = None

class SaleUpdate(BaseModel):
    status: Optional[Literal["pending", "paid", "cancelled", "expired"]] = None
    pushinpay_payment_id: Optional[str] = None
    amount_received: Optional[Decimal] = None
    access_expires_at: Optional[datetime] = None

class SaleResponse(BaseModel):
    id: str
    bot_id: str
    user_telegram_id: str
    plan_id: str
    status: str
    pushinpay_payment_id: Optional[str]
    amount_received: Optional[Decimal]
    access_expires_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

# Esquemas para Telegram Webhook
class TelegramUser(BaseModel):
    id: int
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None

class TelegramMessage(BaseModel):
    message_id: int
    text: Optional[str] = None
    from_: Optional[TelegramUser] = None
    chat: dict

class TelegramUpdate(BaseModel):
    update_id: int
    message: Optional[TelegramMessage] = None
    callback_query: Optional[dict] = None

# Esquemas para PushinPay Webhook
class PushinPayWebhook(BaseModel):
    payment_id: str
    status: str
    amount: Decimal
    metadata: Optional[dict] = None

# Esquemas para Mensagem de Boas-vindas
class WelcomeMessageUpdate(BaseModel):
    bot_id: str
    welcome_text: str
    media_url: Optional[str] = None
    media_type: Optional[Literal["photo", "video"]] = None

# Esquema para Auth
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class BotActivationRequest(BaseModel):
    vip_group_link: str  # Link ou ID do grupo VIP

# Esquema para ativação de canal/grupo via painel
class VipChatActivation(BaseModel):
    chat_type: Literal["group", "channel"]
    chat_identifier: str  # Link ou ID do chat
    
class VipChatValidationResponse(BaseModel):
    success: bool
    message: str
    chat_id: Optional[str] = None
    chat_title: Optional[str] = None
    chat_type: Optional[str] = None 