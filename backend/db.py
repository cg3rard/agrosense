from astrapy import DataAPIClient
from config import settings

_client: DataAPIClient | None = None


def get_collection():
    global _client
    if _client is None:
        _client = DataAPIClient(settings.astra_db_application_token)
    db = _client.get_database_by_api_endpoint(settings.astra_db_api_endpoint)
    return db.get_collection(
        settings.astra_db_collection,
        keyspace=settings.astra_db_keyspace,
    )
