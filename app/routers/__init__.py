"""
This package contains all API routers for the application.
"""

from . import system, openai_routes
from .gmail import (
    router as fetch_router,  # Correct import for fetch router
    list_router,
    stats_router,
    classify_router,
    reputation_router
)

__all__ = [
    "system",
    "openai_routes",
    "fetch_router",
    "list_router",
    "stats_router",
    "classify_router",
    "reputation_router"
]
