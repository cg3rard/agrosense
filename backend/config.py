from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    astra_db_application_token: str
    astra_db_api_endpoint: str
    astra_db_keyspace: str = "agrosense"
    astra_db_collection: str = "transactions"
    langflow_api_url: str
    langflow_api_key: str = ""


settings = Settings()
