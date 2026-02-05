import os
import sys
import tempfile
import requests

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import AnalysisReport
from .serializers import ReportSerializer

# Add analyzer and rag to path
BASE_DIR = os.path.dirname(__file__)
sys.path.insert(0, os.path.join(BASE_DIR, "..", "..", "analyzer"))
sys.path.insert(0, os.path.join(BASE_DIR, "..", "..", "rag"))

from manifest_parser import analyze_app
from retriever import build_context


OLLAMA_URL = os.environ.get(
    "OLLAMA_URL", "http://localhost:11434/api/generate"
)
OLLAMA_MODEL = os.environ.get(
    "OLLAMA_MODEL", "play-reviewer"
)


class AnalyzeView(APIView):
    def post(self, request):
        manifest_file = request.FILES.get("manifest")

        if not manifest_file:
            return Response(
                {"error": "No manifest file uploaded."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Save uploaded file to a temp location
        with tempfile.NamedTemporaryFile(
            suffix=".xml", delete=False, mode="wb"
        ) as tmp:
            for chunk in manifest_file.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        try:
            # Step 1: Run analyzer
            report = analyze_app(tmp_path)

            # Step 2: Get RAG context
            rag_context = build_context(report["permissions"])

            # Step 3: Generate reviewer comment
            reviewer_comment = self._generate_comment(
                report, rag_context
            )

            # Step 4: Save to database
            db_report = AnalysisReport.objects.create(
                package_name=report["app_info"]["package_name"],
                app_label=report["app_info"]["app_label"],
                permissions=report["permissions"],
                risk_report=report["risk_report"],
                policy_issues=report["policy_issues"],
                suspicious_services=report["suspicious_services"],
                verdict=report["verdict"]["verdict"],
                rejection_probability=report["verdict"][
                    "rejection_probability"
                ],
                confidence=report["verdict"]["confidence"],
                reasons=report["verdict"]["reasons"],
                remediations=report["verdict"]["remediations"],
                reviewer_comment=reviewer_comment,
            )

            # Step 5: Return response
            serializer = ReportSerializer(db_report)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        finally:
            os.unlink(tmp_path)

    def _generate_comment(
        self, report: dict, rag_context: str
    ) -> str:
        verdict = report["verdict"]

        issues_text = "\n".join(
            f"• {issue['permission']} "
            f"({issue['severity']}): "
            f"{issue['rejection_reason']}"
            for issue in report["policy_issues"]
        )

        if verdict["verdict"] == "REJECTED":
            prompt = f"""
Write a professional Google Play rejection comment for this app.

App: {report['app_info']['package_name']}
Violations found:
{issues_text}

Write 2–3 paragraphs explaining why the app is rejected and what
the developer needs to fix. Be specific and actionable.
Do not include tables, code, or disclaimers.
""".strip()

        elif verdict["verdict"] == "WARNING":
            prompt = f"""
Write a professional Google Play warning comment for this app.

App: {report['app_info']['package_name']}
Issues to address:
{issues_text}

Write 2 paragraphs explaining the concerns and suggesting improvements.
Be helpful and specific.
""".strip()

        else:  # APPROVED
            prompt = f"""
Write a brief approval comment for this app.

App: {report['app_info']['package_name']}
No major violations detected.

Write 1–2 sentences confirming approval.
""".strip()

        try:
            response = requests.post(
                OLLAMA_URL,
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.85,
                    },
                },
                timeout=120,
            )
            return response.json().get("response", "")

        except Exception as e:
            return f"[LLM unavailable: {str(e)}]"


class ReportListView(APIView):
    def get(self, request):
        reports = AnalysisReport.objects.all()
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data)


class ReportDetailView(APIView):
    """
    GET /api/reports/{id}/    → Retrieve a single report
    DELETE /api/reports/{id}/ → Delete a report
    """

    def get(self, request, report_id):
        try:
            report = AnalysisReport.objects.get(pk=report_id)
        except AnalysisReport.DoesNotExist:
            return Response(
                {"error": "Report not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ReportSerializer(report)
        return Response(serializer.data)

    def delete(self, request, report_id):
        try:
            report = AnalysisReport.objects.get(pk=report_id)
            report.delete()
            return Response(
                {"message": "Report deleted successfully."},
                status=status.HTTP_200_OK,
            )
        except AnalysisReport.DoesNotExist:
            return Response(
                {"error": "Report not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
