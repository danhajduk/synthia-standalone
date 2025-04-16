# This file allows the 'routers' directory to be treated as a Python package.

# Import submodules from the 'routers' package
from . import system, gmail, openai_routes

# Define the public API of the 'routers' package
__all__ = ["system", "gmail", "openai_routes"]
