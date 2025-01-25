# api/reports/exports/kernel.py

import importlib
import os
from .base_exporter import BaseExporter

class ReportExporterKernel:
    def __init__(self):
        self.plugins = {}

    def load_plugins(self):
        plugin_dir = os.path.dirname(__file__)
        for filename in os.listdir(plugin_dir):
            if filename.endswith('_exporter.py') and filename != 'base_exporter.py':
                module_name = f'api.reports.exports.{filename[:-3]}'
                module = importlib.import_module(module_name)
                for attr in dir(module):
                    cls = getattr(module, attr)
                    if isinstance(cls, type) and issubclass(cls, BaseExporter) and cls is not BaseExporter:
                        self.plugins[cls.__name__] = cls()

    def export(self, format, data):
        if format in self.plugins:
            return self.plugins[format].export(data)
        else:
            raise ValueError(f'Export format {format} not supported')