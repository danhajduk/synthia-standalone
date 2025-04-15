# This file allows the 'routers' directory to be treated as a Python package.

from . import system, gmail, openai_routes

__all__ = ["system", "gmail", "openai_routes"]
