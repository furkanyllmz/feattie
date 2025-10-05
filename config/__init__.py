"""Configuration management for Shopify RAG."""
from pathlib import Path
import yaml
from typing import Dict, Any


class Config:
    """Configuration manager."""

    def __init__(self, config_path: str = "config/config.yaml"):
        """Load configuration from YAML file."""
        self.config_path = Path(config_path)
        self._config = self._load_config()

    def _load_config(self) -> Dict[str, Any]:
        """Load YAML configuration."""
        if not self.config_path.exists():
            raise FileNotFoundError(f"Config file not found: {self.config_path}")

        with open(self.config_path, 'r') as f:
            return yaml.safe_load(f)

    def get(self, *keys, default=None):
        """Get nested configuration value."""
        value = self._config
        for key in keys:
            if isinstance(value, dict):
                value = value.get(key, default)
            else:
                return default
        return value

    @property
    def embedding_provider(self) -> str:
        """Get embedding provider (openai or local)."""
        return self.get('embedding', 'provider', default='openai')

    @property
    def openai_embedding_model(self) -> str:
        """Get OpenAI embedding model."""
        return self.get('embedding', 'openai', 'model', default='text-embedding-3-large')

    @property
    def local_embedding_model(self) -> str:
        """Get local embedding model."""
        return self.get('embedding', 'local', 'model', default='intfloat/multilingual-e5-large')

    @property
    def llm_model(self) -> str:
        """Get LLM model."""
        return self.get('llm', 'model', default='gpt-4o-mini')

    @property
    def api_host(self) -> str:
        """Get API host."""
        return self.get('api', 'host', default='0.0.0.0')

    @property
    def api_port(self) -> int:
        """Get API port."""
        return self.get('api', 'port', default=8000)

    @property
    def products_rag_path(self) -> str:
        """Get products RAG path."""
        return self.get('data', 'products_rag', default='./out/products_rag.jsonl')


# Global config instance
_config = None


def get_config(config_path: str = "config/config.yaml") -> Config:
    """Get global config instance."""
    global _config
    if _config is None:
        _config = Config(config_path)
    return _config
