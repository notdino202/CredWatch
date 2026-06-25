"""
Service module for checking email breaches using XposedOrNot API.
"""
import re
import requests

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
API_URL = "https://api.xposedornot.com/v1/breach-analytics"

def check_email_breaches(email: str) -> dict:
    """
    Check if an email has appeared in known breaches via XposedOrNot API.
    Raises ValueError for validation issues.
    Raises RuntimeError for API errors or timeout issues.
    """
    if not isinstance(email, str) or not email.strip():
        raise ValueError("Email address cannot be empty.")
        
    email = email.strip()
    if not EMAIL_REGEX.match(email):
        raise ValueError("Invalid email address format.")
        
    headers = {
        "User-Agent": "CredWatch-SecurityTool/1.0"
    }
    
    try:
        response = requests.get(
            f"{API_URL}?email={email}",
            headers=headers,
            timeout=8
        )
    except requests.exceptions.Timeout:
        raise RuntimeError("Connection timed out while contacting the breach database. Please try again.")
    except requests.exceptions.RequestException:
        raise RuntimeError("Network error: Could not reach the breach database. Please try again.")
        
    if response.status_code == 200:
        try:
            data = response.json()
        except ValueError:
            raise RuntimeError("Received invalid JSON response from the breach database.")
            
        exposed_breaches_dict = data.get("ExposedBreaches")
        if not exposed_breaches_dict or not isinstance(exposed_breaches_dict, dict):
            return {
                "email": email,
                "breach_count": 0,
                "breaches": [],
                "is_breached": False
            }
            
        exposed_breaches = exposed_breaches_dict.get("breaches_details")
        if not exposed_breaches or not isinstance(exposed_breaches, list):
            return {
                "email": email,
                "breach_count": 0,
                "breaches": [],
                "is_breached": False
            }
            
        breaches = []
        for breach in exposed_breaches:
            xposed_data_str = breach.get("xposed_data", "")
            exposed_data = [cat.strip() for cat in xposed_data_str.split(";")] if xposed_data_str else []
            
            breaches.append({
                "name": breach.get("breach", "Unknown Breach"),
                "date": breach.get("xposed_date", "Unknown"),
                "exposed_data": exposed_data
            })
            
        return {
            "email": email,
            "breach_count": len(breaches),
            "breaches": breaches,
            "is_breached": True
        }
        
    elif response.status_code == 404:
        # XposedOrNot returns 404 if the query is invalid or not matched.
        # However, for valid non-breached emails, it returns 200 with null ExposedBreaches.
        # Therefore, 404 typically indicates invalid email or query error.
        raise RuntimeError("The breach lookup API could not verify this email (404 Not Found).")
    elif response.status_code == 429:
        raise RuntimeError("Rate limit exceeded on breach database. Please wait a moment and try again.")
    else:
        raise RuntimeError(f"Breach database returned an unexpected error (HTTP status code {response.status_code}).")
