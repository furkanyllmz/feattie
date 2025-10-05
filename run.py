"""Main entry point for running the API server."""
import uvicorn
from config import get_config

if __name__ == "__main__":
    config = get_config()

    uvicorn.run(
        "src.api.server:app",
        host=config.api_host,
        port=config.api_port,
        reload=config.get('api', 'reload', default=False),
        workers=config.get('api', 'workers', default=1)
    )
