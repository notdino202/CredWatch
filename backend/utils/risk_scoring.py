"""
Risk Scoring module for CredWatch.
Evaluates threat level of credentials based on external API results.
"""

def score_email_risk(breach_count: int, exposed_categories: list[str]) -> str:
    """
    Score email exposure risk.
    - 0 breaches -> "Safe"
    - 1-2 breaches, none exposing passwords or financial data -> "Moderate"
    - 3+ breaches, OR any breach exposing passwords or financial data -> "High"
    """
    if breach_count == 0:
        return "Safe"
        
    high_risk_keywords = ["password", "credit card", "bank", "financial"]
    has_high_risk_category = False
    
    for category in exposed_categories:
        cat_lower = category.lower()
        if any(kw in cat_lower for kw in high_risk_keywords):
            has_high_risk_category = True
            break
            
    if breach_count >= 3 or has_high_risk_category:
        return "High"
    
    return "Moderate"


def score_password_risk(times_seen: int) -> str:
    """
    Score password exposure risk based on Pwned Passwords count.
    - 0 -> "Safe"
    - 1-100 -> "Weak"
    - 100+ -> "Highly Compromised"
    """
    if times_seen == 0:
        return "Safe"
    elif times_seen <= 100:
        return "Weak"
    
    return "Highly Compromised"
