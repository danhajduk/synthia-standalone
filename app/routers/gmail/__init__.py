"""
This package contains routers for Gmail-related functionality.
"""

from fastapi import APIRouter
from .fetch import router as fetch_router
from .list import router as list_router
from .stats import router as stats_router
from .classify import router as classify_router
from .reputation import router as reputation_router

# Combine all Gmail-related routers into a single router
router = APIRouter()
router.include_router(fetch_router)
router.include_router(list_router)
router.include_router(stats_router)
router.include_router(classify_router)
router.include_router(reputation_router)

__all__ = ["router"]
