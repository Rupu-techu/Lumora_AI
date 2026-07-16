from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── App ───────────────────────────────────────────────────────────────────
    app_env: str = "development"
    app_name: str = "Lumora AI"
    app_version: str = "0.2.0"
    app_secret_key: str = "dev-secret-change-me"
    app_cors_origins: str = "http://localhost:3000"

    # ── JWT ───────────────────────────────────────────────────────────────────
    jwt_secret: str = "jwt-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60
    jwt_refresh_expire_days: int = 30

    # ── MongoDB ───────────────────────────────────────────────────────────────
    # Canonical env-var names: MONGODB_URI / DATABASE_NAME
    # Legacy names MONGODB_URL / MONGODB_DB are also accepted; the validator
    # below falls back to them when the canonical keys are not set.
    mongodb_uri: str = "mongodb://localhost:27017"   # env: MONGODB_URI
    database_name: str = "lumora"                    # env: DATABASE_NAME

    # Legacy keys — pydantic-settings reads MONGODB_URL → mongodb_url, etc.
    # Kept as optional fields so extra="ignore" doesn't swallow them before
    # the validator can copy their values across.
    mongodb_url: str = ""   # env: MONGODB_URL (legacy)
    mongodb_db: str = ""    # env: MONGODB_DB  (legacy)

    # ── IBM Watsonx / Granite ─────────────────────────────────────────────────
    watsonx_api_key: str = ""
    watsonx_project_id: str = ""
    watsonx_url: str = "https://us-south.ml.cloud.ibm.com"
    watsonx_default_model: str = "ibm/granite-13b-instruct-v2"
    watsonx_max_tokens_default: int = 512
    watsonx_temperature_default: float = 0.7

    # ── AI feature flags ──────────────────────────────────────────────────────
    ai_enabled: bool = True
    ai_mock_when_unconfigured: bool = True   # return stub when no API key set

    # ── Pagination ────────────────────────────────────────────────────────────
    default_page_size: int = 20
    max_page_size: int = 100

    # ── Rate limiting ─────────────────────────────────────────────────────────
    rate_limit_default: str = "60/minute"
    rate_limit_ai: str = "20/minute"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # ── Validators ────────────────────────────────────────────────────────────

    @model_validator(mode="after")
    def _apply_legacy_mongo_aliases(self) -> "Settings":
        """Fall back to legacy MONGODB_URL / MONGODB_DB when the canonical
        MONGODB_URI / DATABASE_NAME keys are not explicitly set."""
        if self.mongodb_url and self.mongodb_uri == "mongodb://localhost:27017":
            self.mongodb_uri = self.mongodb_url
        if self.mongodb_db and self.database_name == "lumora":
            self.database_name = self.mongodb_db
        return self

    # ── Properties ────────────────────────────────────────────────────────────

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.app_cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def watsonx_configured(self) -> bool:
        return bool(self.watsonx_api_key and self.watsonx_project_id)


@lru_cache
def get_settings() -> Settings:
    return Settings()
