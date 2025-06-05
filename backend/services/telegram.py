import httpx
import re
from typing import Dict, Any, Optional
from utils.config import settings

class TelegramService:
    def __init__(self, bot_token: str = None):
        self.bot_token = bot_token or settings.telegram_bot_token
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}"
    
    async def send_message(
        self, 
        chat_id: int, 
        text: str, 
        reply_markup: Optional[Dict] = None,
        parse_mode: str = "HTML"
    ) -> Dict[str, Any]:
        """Enviar mensagem via Telegram Bot API"""
        url = f"{self.base_url}/sendMessage"
        
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": parse_mode
        }
        
        if reply_markup:
            payload["reply_markup"] = reply_markup
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            return response.json()
    
    async def send_photo(
        self,
        chat_id: int,
        photo: str,
        caption: Optional[str] = None,
        reply_markup: Optional[Dict] = None,
        parse_mode: str = "HTML"
    ) -> Dict[str, Any]:
        """Enviar foto via Telegram Bot API"""
        url = f"{self.base_url}/sendPhoto"
        
        payload = {
            "chat_id": chat_id,
            "photo": photo,
            "parse_mode": parse_mode
        }
        
        if caption:
            payload["caption"] = caption
        
        if reply_markup:
            payload["reply_markup"] = reply_markup
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            return response.json()
    
    async def send_video(
        self,
        chat_id: int,
        video: str,
        caption: Optional[str] = None,
        reply_markup: Optional[Dict] = None,
        parse_mode: str = "HTML"
    ) -> Dict[str, Any]:
        """Enviar vídeo via Telegram Bot API"""
        url = f"{self.base_url}/sendVideo"
        
        payload = {
            "chat_id": chat_id,
            "video": video,
            "parse_mode": parse_mode
        }
        
        if caption:
            payload["caption"] = caption
        
        if reply_markup:
            payload["reply_markup"] = reply_markup
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            return response.json()
    
    async def answer_callback_query(
        self,
        callback_query_id: str,
        text: Optional[str] = None,
        show_alert: bool = False
    ) -> Dict[str, Any]:
        """Responder callback query"""
        url = f"{self.base_url}/answerCallbackQuery"
        
        payload = {
            "callback_query_id": callback_query_id,
            "show_alert": show_alert
        }
        
        if text:
            payload["text"] = text
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            return response.json()
    
    async def set_webhook(self, webhook_url: str) -> Dict[str, Any]:
        """Configurar webhook do bot"""
        url = f"{self.base_url}/setWebhook"
        
        payload = {
            "url": webhook_url
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            return response.json()
    
    async def get_bot_info(self) -> Dict[str, Any]:
        """Obter informações do bot"""
        url = f"{self.base_url}/getMe"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            return response.json()
    
    async def add_chat_member(
        self,
        chat_id: str,
        user_id: int
    ) -> Dict[str, Any]:
        """Adicionar usuário ao grupo"""
        url = f"{self.base_url}/addChatMember"
        
        payload = {
            "chat_id": chat_id,
            "user_id": user_id
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            return response.json()
    
    async def kick_chat_member(
        self,
        chat_id: str,
        user_id: int,
        until_date: Optional[int] = None
    ) -> Dict[str, Any]:
        """Remover usuário do grupo"""
        url = f"{self.base_url}/kickChatMember"
        
        payload = {
            "chat_id": chat_id,
            "user_id": user_id
        }
        
        if until_date:
            payload["until_date"] = until_date
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            return response.json()
    
    async def unban_chat_member(
        self,
        chat_id: str,
        user_id: int
    ) -> Dict[str, Any]:
        """Desbanir usuário (permitir entrada novamente)"""
        url = f"{self.base_url}/unbanChatMember"
        
        payload = {
            "chat_id": chat_id,
            "user_id": user_id,
            "only_if_banned": True
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            return response.json()
    
    def create_inline_keyboard(self, buttons: list) -> Dict[str, Any]:
        """Criar teclado inline"""
        return {
            "inline_keyboard": buttons
        }
    
    def create_payment_keyboard(self, payment_url: str) -> Dict[str, Any]:
        """Criar teclado com botão de pagamento"""
        return self.create_inline_keyboard([
            [{"text": "💳 Pagar Agora", "url": payment_url}]
        ])
    
    def create_plans_keyboard(self, plans: list) -> Dict[str, Any]:
        """Criar teclado com planos disponíveis"""
        buttons = []
        for plan in plans:
            button_text = f"{plan['name']} - R$ {plan['price']}"
            callback_data = f"plan_{plan['id']}"
            buttons.append([{"text": button_text, "callback_data": callback_data}])
        
        return self.create_inline_keyboard(buttons)
    
    async def get_chat(self, chat_id: str) -> Dict[str, Any]:
        """Obter informações do chat/grupo"""
        url = f"{self.base_url}/getChat"
        
        payload = {
            "chat_id": chat_id
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            return response.json()
    
    async def get_chat_administrators(self, chat_id: str) -> Dict[str, Any]:
        """Obter administradores do chat/grupo"""
        url = f"{self.base_url}/getChatAdministrators"
        
        payload = {
            "chat_id": chat_id
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            return response.json()
    
    async def get_me(self) -> Dict[str, Any]:
        """Obter informações do bot"""
        url = f"{self.base_url}/getMe"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url)
            return response.json()

def extract_group_id_from_link(group_link: str) -> str:
    """
    Extrair group_id de link do Telegram
    
    Formatos suportados:
    - https://t.me/joinchat/AAAA...
    - https://t.me/+AAAA...  
    - https://t.me/grupo_publico
    - @grupo_publico
    - -1001234567890 (chat_id direto)
    """
    # Se já é um chat_id (número negativo)
    if group_link.startswith('-') and group_link[1:].isdigit():
        return group_link
    
    # Se é um username/handle (@grupo ou grupo)
    if group_link.startswith('@'):
        return group_link
    elif not group_link.startswith('http') and group_link.isalnum():
        return f"@{group_link}"
    
    # Links t.me/joinchat/
    joinchat_pattern = r'https://t\.me/joinchat/([A-Za-z0-9_-]+)'
    match = re.search(joinchat_pattern, group_link)
    if match:
        return group_link  # Retorna o link completo
    
    # Links t.me/+
    plus_pattern = r'https://t\.me/\+([A-Za-z0-9_-]+)'
    match = re.search(plus_pattern, group_link)
    if match:
        return group_link  # Retorna o link completo
    
    # Links t.me/username
    username_pattern = r'https://t\.me/([A-Za-z0-9_]+)'
    match = re.search(username_pattern, group_link)
    if match:
        return f"@{match.group(1)}"
    
    # Se não conseguiu extrair, retorna como está
    return group_link

# Função helper para criar instância com token específico
def get_telegram_service(bot_token: str) -> TelegramService:
    """Criar instância do TelegramService com token específico"""
    return TelegramService(bot_token) 