"""Test config: pastikan modul backend (flat layout) bisa diimpor."""

import os
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

# Nilai dummy agar config.Settings dapat diinisialisasi tanpa .env asli.
os.environ.setdefault("ASTRA_DB_APPLICATION_TOKEN", "test-token")
os.environ.setdefault("ASTRA_DB_API_ENDPOINT", "https://example.invalid")
os.environ.setdefault("LANGFLOW_API_URL", "http://localhost:7860/api/v1/run/test")
