HIGH_RISK = {
    "android.permission.SEND_SMS",
    "android.permission.READ_SMS",
    "android.permission.RECEIVE_SMS",
    "android.permission.CALL_PHONE",
    "android.permission.READ_CALL_LOG",
    "android.permission.WRITE_CALL_LOG",
    "android.permission.READ_CONTACTS",
    "android.permission.WRITE_CONTACTS",
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.WRITE_EXTERNAL_STORAGE",
}

MEDIUM_RISK = {
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.ACCESS_BACKGROUND_LOCATION",
    "android.permission.RECORD_AUDIO",
    "android.permission.CAMERA",
    "android.permission.READ_PHONE_STATE",
    "android.permission.BLUETOOTH_SCAN",
    "android.permission.BLUETOOTH_CONNECT",
}

LOW_RISK = {
    "android.permission.INTERNET",
    "android.permission.ACCESS_NETWORK_STATE",
    "android.permission.WAKE_LOCK",
    "android.permission.VIBRATE",
    "android.permission.RECEIVE_BOOT_COMPLETED",
}


def classify_permissions(permissions: list) -> list:
    result = []

    for perm in permissions:
        if perm in HIGH_RISK:
            level = "HIGH"
        elif perm in MEDIUM_RISK:
            level = "MEDIUM"
        elif perm in LOW_RISK:
            level = "LOW"
        else:
            level = "UNKNOWN"

        result.append({
            "permission": perm,
            "risk": level
        })

    return result