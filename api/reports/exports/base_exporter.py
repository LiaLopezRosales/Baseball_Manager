# api/reports/exports/base_exporter.py

from abc import ABC, abstractmethod

class BaseExporter(ABC):
    @abstractmethod
    def export(self, data):
        pass