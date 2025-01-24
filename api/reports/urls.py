# api/reports/urls.py

from django.urls import path
from .views import ReportsView, DynamicFilterView, TableStructureView

urlpatterns = [
    path('reports/', ReportsView.as_view(), name='reports'),
    path('dinamic-filter/', DynamicFilterView.as_view(), name='dinamic-filter'),
    path('tables/', TableStructureView.as_view(), name='tables'),
]