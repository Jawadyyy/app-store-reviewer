from django.db import models
from django.utils import timezone


class AnalysisReport(models.Model):
    class Verdict(models.TextChoices):
        REJECTED = "REJECTED", "Rejected"
        WARNING = "WARNING", "Warning"
        APPROVED = "APPROVED", "Approved"

    # App info
    package_name = models.CharField(max_length=255)
    app_label = models.CharField(max_length=255, blank=True)

    # Analysis results (stored as JSON)
    permissions = models.JSONField(default=list)
    risk_report = models.JSONField(default=list)
    policy_issues = models.JSONField(default=list)
    suspicious_services = models.JSONField(default=list)

    # Verdict
    verdict = models.CharField(max_length=20, choices=Verdict.choices)
    rejection_probability = models.FloatField(default=0.0)
    confidence = models.CharField(max_length=10, default="LOW")
    reasons = models.JSONField(default=list)
    remediations = models.JSONField(default=list)

    # LLM-generated comment
    reviewer_comment = models.TextField(blank=True, default="")

    # Metadata
    created_at = models.DateTimeField(default=timezone.now)
    manifest_file = models.FileField(upload_to="manifests/", null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.package_name} — {self.verdict} ({self.created_at.date()})"