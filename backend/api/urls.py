from django.urls import path
from . import views

urlpatterns = [
    path("analyze/", views.AnalyzeView.as_view(), name="analyze"),
    path("reports/", views.ReportListView.as_view(), name="report-list"),
    path("reports/<int:report_id>/", views.ReportDetailView.as_view(), name="report-detail"),
]