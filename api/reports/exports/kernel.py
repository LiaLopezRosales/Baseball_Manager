# api/reports/exports/kernel.py

import importlib
import os
from .base_exporter import BaseExporter

class ExporterKernel:
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
                        self.plugins[cls.get_file_extension(cls)] = cls()

    def get_exporter(self, format) -> BaseExporter:
        if format in self.plugins:
            return self.plugins[format]
        else:
            raise ValueError(f'Export format {format} not supported')