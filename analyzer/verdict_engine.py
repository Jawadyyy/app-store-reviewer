def calculate_probability(high_count: int, medium_count: int) -> float:
    prob = 0.0

    if high_count > 0:
        prob = 0.70 + (0.15 * min(high_count - 1, 2))
    elif medium_count > 0:
        prob = 0.40 + (0.08 * min(medium_count - 1, 3))

    return min(round(prob, 2), 0.95)


def generate_verdict(policy_issues: list) -> dict:
    high = [p for p in policy_issues if p["severity"] == "HIGH"]
    medium = [p for p in policy_issues if p["severity"] == "MEDIUM"]

    rejection_prob = calculate_probability(len(high), len(medium))

    reasons = [p["rejection_reason"] for p in policy_issues if p["rejection_reason"]]
    remediations = [
        {"permission": p["permission"], "fix": p["remediation"]}
        for p in policy_issues
        if p["remediation"]
    ]

    if high:
        verdict = "REJECTED"
        confidence = "HIGH"
    elif medium:
        verdict = "WARNING"
        confidence = "MEDIUM"
    else:
        verdict = "APPROVED"
        confidence = "HIGH"
        rejection_prob = 0.05

    return {
        "verdict": verdict,
        "rejection_probability": rejection_prob,
        "reasons": reasons,
        "remediations": remediations,
        "confidence": confidence
    }