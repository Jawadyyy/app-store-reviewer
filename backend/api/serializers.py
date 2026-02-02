from rest_framework import serializers
from .models import AnalysisReport


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisReport
        fields = "__all__"