"""
conftest.py — pytest configuration for Contribution Graph tests

Sets CG_SERVER_SECRET before any module imports that might trigger
the "Short-code generation will use empty secret" warning.
"""
import os

# Must be set BEFORE any module that imports db.identity loads
os.environ.setdefault("CG_SERVER_SECRET", "test-secret-for-testing-only")
