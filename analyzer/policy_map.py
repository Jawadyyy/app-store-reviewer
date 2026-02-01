POLICY_MAP = {
    # HIGH RISK
    "android.permission.SEND_SMS": {
        "policy": "SMS and Call Log Policy",
        "severity": "HIGH",
        "rejection_reason": (
            "Apps may not send or initiate SMS without explicit user action "
            "on each send. SMS permissions require core functionality justification."
        ),
        "remediation": "Use SMS intent (ACTION_SENDTO) instead of direct send API."
    },
    "android.permission.READ_SMS": {
        "policy": "SMS and Call Log Policy",
        "severity": "HIGH",
        "rejection_reason": (
            "Reading SMS is restricted to default SMS/call apps only. "
            "Third-party apps cannot request this permission."
        ),
        "remediation": "Remove this permission. Use SMS verification APIs instead."
    },
    "android.permission.RECEIVE_SMS": {
        "policy": "SMS and Call Log Policy",
        "severity": "HIGH",
        "rejection_reason": (
            "Receiving SMS is restricted to default SMS apps only. "
            "Third-party apps must not listen for incoming SMS."
        ),
        "remediation": "Remove this permission. Use push notifications instead."
    },
    "android.permission.CALL_PHONE": {
        "policy": "SMS and Call Log Policy",
        "severity": "HIGH",
        "rejection_reason": (
            "Initiating calls must go through user confirmation. "
            "Apps must not auto-dial without visible user trigger."
        ),
        "remediation": "Use ACTION_DIAL intent to let the user confirm."
    },
    "android.permission.READ_CALL_LOG": {
        "policy": "SMS and Call Log Policy",
        "severity": "HIGH",
        "rejection_reason": (
            "Call log access is restricted to default phone apps only. "
            "Third-party apps cannot read call history."
        ),
        "remediation": "Remove this permission. It is not available to third-party apps."
    },
    "android.permission.READ_CONTACTS": {
        "policy": "User Data Policy",
        "severity": "HIGH",
        "rejection_reason": (
            "Contact access must be justified in the app's core functionality "
            "and clearly disclosed in the privacy policy."
        ),
        "remediation": "Disclose contact usage. Only request when feature is used."
    },
    "android.permission.WRITE_CONTACTS": {
        "policy": "User Data Policy",
        "severity": "HIGH",
        "rejection_reason": (
            "Writing contacts requires strong justification tied to core app "
            "functionality. Must be clearly disclosed to users."
        ),
        "remediation": "Justify in store listing. Only modify contacts with explicit user action."
    },

    # MEDIUM RISK
    "android.permission.ACCESS_FINE_LOCATION": {
        "policy": "Location Permissions Policy",
        "severity": "MEDIUM",
        "rejection_reason": (
            "Fine location must be tied to a clear user-facing feature. "
            "Foreground location requires visible indicator."
        ),
        "remediation": "Show location rationale before requesting. Use coarse if fine isn't needed."
    },
    "android.permission.ACCESS_BACKGROUND_LOCATION": {
        "policy": "Location Permissions Policy",
        "severity": "MEDIUM",
        "rejection_reason": (
            "Background location requires strong justification. "
            "Users must first grant foreground location."
        ),
        "remediation": "Request foreground first, then background separately with clear rationale."
    },
    "android.permission.RECORD_AUDIO": {
        "policy": "Microphone and Camera Policy",
        "severity": "MEDIUM",
        "rejection_reason": (
            "Audio recording must only occur during active user engagement. "
            "No background recording allowed."
        ),
        "remediation": "Only record when user explicitly triggers it. Show active indicator."
    },
    "android.permission.CAMERA": {
        "policy": "Microphone and Camera Policy",
        "severity": "MEDIUM",
        "rejection_reason": (
            "Camera access must be tied to a visible, user-initiated action. "
            "Disclose camera usage in privacy policy."
        ),
        "remediation": "Request permission contextually when user triggers camera feature."
    },
    "android.permission.READ_PHONE_STATE": {
        "policy": "Device and Network State Policy",
        "severity": "MEDIUM",
        "rejection_reason": (
            "Reading phone state must be justified by core app functionality. "
            "Usage must be disclosed in the privacy policy."
        ),
        "remediation": "Only request if essential. Disclose usage clearly in store listing."
    },

    # LOW RISK
    "android.permission.INTERNET": {
        "policy": "General",
        "severity": "LOW",
        "rejection_reason": None,
        "remediation": None
    },
    "android.permission.ACCESS_NETWORK_STATE": {
        "policy": "General",
        "severity": "LOW",
        "rejection_reason": None,
        "remediation": None
    },
}


def get_policy_issues(permissions: list) -> list:
    issues = []
    for perm in permissions:
        if perm in POLICY_MAP and POLICY_MAP[perm]["rejection_reason"]:
            issues.append({
                "permission": perm,
                **POLICY_MAP[perm]
            })
    return issues