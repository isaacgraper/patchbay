from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    patchbay_host: str = "0.0.0.0"
    patchbay_port: int = 4333
    database_url: str = "sqlite+aiosqlite:///./patchbay.db"
    allowed_origins: list[str] = ["http://localhost:5173"]

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def split_origins(cls, value: str | list[str]) -> str | list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


settings = Settings()
