from lxml import etree
from risk_rules import classify_permissions
from policy_map import get_policy_issues
from verdict_engine import generate_verdict
import json
from datetime import datetime


def parse_manifest(manifest_path: str) -> dict:
    tree = etree.parse(manifest_path)
    root = tree.getroot()

    ns = {"android": "http://schemas.android.com/apk/res/android"}

    package_name = root.get("package", "unknown")
    app_element = root.find(".//application", ns)
    label = "Unknown App"
    if app_element is not None:
        label = app_element.get("{http://schemas.android.com/apk/res/android}label", "Unknown App")

    permissions = []
    for perm in root.findall("uses-permission"):
        name = perm.get("{http://schemas.android.com/apk/res/android}name")
        if name:
            permissions.append(name)

    services = []
    for svc in root.findall(".//service", ns):
        svc_name = svc.get("{http://schemas.android.com/apk/res/android}name", "")
        enabled = svc.get("{http://schemas.android.com/apk/res/android}enabled", "true")
        services.append({"name": svc_name, "enabled": enabled})

    receivers = []
    for rcv in root.findall(".//receiver", ns):
        rcv_name = rcv.get("{http://schemas.android.com/apk/res/android}name", "")
        receivers.append({"name": rcv_name})

    return {
        "package_name": package_name,
        "app_label": label,
        "permissions": permissions,
        "services": services,
        "receivers": receivers
    }


def analyze_app(manifest_path: str) -> dict:
    manifest_data = parse_manifest(manifest_path)

    risk_report = classify_permissions(manifest_data["permissions"])

    policy_issues = get_policy_issues(manifest_data["permissions"])

    verdict = generate_verdict(policy_issues)

    suspicious_services = []
    high_perms = [r for r in risk_report if r["risk"] == "HIGH"]
    if manifest_data["services"] and high_perms:
        suspicious_services = manifest_data["services"]

    report = {
        "meta": {
            "analyzed_at": datetime.now(tz=None).isoformat(),
            "manifest_path": manifest_path
        },
        "app_info": {
            "package_name": manifest_data["package_name"],
            "app_label": manifest_data["app_label"]
        },
        "permissions": manifest_data["permissions"],
        "risk_report": risk_report,
        "policy_issues": policy_issues,
        "suspicious_services": suspicious_services,
        "verdict": verdict
    }

    return report


if __name__ == "__main__":
    import sys
    path = sys.argv[1] if len(sys.argv) > 1 else "AndroidManifest.xml"
    report = analyze_app(path)
    print(json.dumps(report, indent=2))