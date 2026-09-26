from astrapy import DataAPIClient
from config import settings

_client: DataAPIClient | None = None


def get_collection(name: str | None = None):
    global _client
    if _client is None:
        _client = DataAPIClient(settings.astra_db_application_token)
    db = _client.get_database_by_api_endpoint(
        settings.astra_db_api_endpoint,
        namespace=settings.astra_db_keyspace,
    )
    return db.get_collection(name or settings.astra_db_collection)
