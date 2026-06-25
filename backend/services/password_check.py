"""
Service module for checking password exposure using Pwned Passwords API.
Implements privacy-preserving k-anonymity checks.
"""
import hashlib
import requests

API_URL = "https://api.pwnedpasswords.com/range"

def check_password_exposure(password: str) -> dict:
    """
    Check if a password has been exposed in leaks via k-anonymity SHA-1.
    Only the first 5 characters of the SHA-1 hash are sent to the external API.
    The remaining 35 characters are matched locally.
    
    Raises ValueError for validation issues.
    Raises RuntimeError for API errors or timeout issues.
    """
    if not isinstance(password, str) or not password:
        raise ValueError("Password cannot be empty.")
        
    # Step 1: Compute SHA-1 hash of the UTF-8 bytes
    sha1 = hashlib.sha1(password.encode("utf-8")).hexdigest().upper()
    
    # Step 2: Split hash into 5-char prefix and 35-char suffix
    prefix = sha1[:5]
    suffix = sha1[5:]
    
    headers = {
        "User-Agent": "CredWatch-SecurityTool/1.0"
    }
    
    # Step 3: Request the hash range prefix from the Pwned Passwords API
    try:
        response = requests.get(
            f"{API_URL}/{prefix}",
            headers=headers,
            timeout=8
        )
    except requests.exceptions.Timeout:
        raise RuntimeError("Connection timed out while contacting the password database. Please try again.")
    except requests.exceptions.RequestException:
        raise RuntimeError("Network error: Could not reach the password database. Please try again.")
        
    if response.status_code == 200:
        # Step 4: Parse response text to match the suffix locally
        lines = response.text.splitlines()
        times_seen = 0
        
        for line in lines:
            parts = line.strip().split(":")
            if len(parts) == 2:
                resp_suffix, count_str = parts
                if resp_suffix.upper() == suffix:
                    try:
                        times_seen = int(count_str)
                    except ValueError:
                        times_seen = 0
                    break
                    
        return {
            "times_seen": times_seen,
            "is_exposed": times_seen > 0
        }
        
    elif response.status_code == 429:
        raise RuntimeError("Rate limit exceeded on password database. Please wait a moment and try again.")
    else:
        raise RuntimeError(f"Password database returned an unexpected error (HTTP status code {response.status_code}).")
