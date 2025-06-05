from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    jwt_secret: str
    telegram_bot_token: str = ""
    pushinpay_secret: str = ""
    environment: str = "development"
    
    class Config:
        env_file = ".env"

settings = Settings() 