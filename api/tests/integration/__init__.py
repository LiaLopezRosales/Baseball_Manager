# api/tests/integration/__init__.py
# Gate de la suite de integración: se activa con INTEGRATION_TESTS=1.
# Se re-exporta desde constants.py para que los imports del paquete sigan
# funcionando (from api.tests.integration import INTEGRATION_TESTS).

from .constants import INTEGRATION_TESTS

__all__ = ["INTEGRATION_TESTS"]
