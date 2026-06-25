"""
CredWatch - Flask Main Application.
Serves frontend static assets and exposes API endpoints for credential checks.
"""
import os
import sys

# Ensure backend directory is in python search path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from services.email_check import check_email_breaches
from services.password_check import check_password_exposure
from utils.risk_scoring import score_email_risk, score_password_risk

# Get absolute paths to robustly target frontend/dist directory for React+Vite output
current_dir = os.path.dirname(os.path.abspath(__file__))
frontend_dir = os.path.abspath(os.path.join(current_dir, "..", "frontend", "dist"))

app = Flask(__name__, static_folder=frontend_dir, static_url_path="")
CORS(app)  # Allow cross-origin requests for local API access (e.g. from file:// index.html)

@app.route("/")
def serve_index():
    """Serve the index.html file from the static folder."""
    return send_from_directory(app.static_folder, "index.html")

@app.route("/api/health", methods=["GET"])
def health_check():
    """Verify that the service is running and accessible."""
    return jsonify({"status": "ok"}), 200

@app.route("/api/check-email", methods=["POST"])
def api_check_email():
    """
    Accepts JSON body {"email": "..."} and returns the breach analysis.
    """
    try:
        body = request.get_json(silent=True)
        if not body or "email" not in body:
            return jsonify({
                "success": False,
                "data": None,
                "error": "Request body must contain an 'email' field."
            }), 400
            
        email = body.get("email")
        
        # Call service to fetch data from API
        result = check_email_breaches(email)
        
        # Extract categories and compute the risk score
        exposed_categories = []
        for breach in result.get("breaches", []):
            exposed_categories.extend(breach.get("exposed_data", []))
            
        # Deduplicate categories
        exposed_categories = list(set(exposed_categories))
        
        # Add risk score to the results
        result["risk_level"] = score_email_risk(result["breach_count"], exposed_categories)
        result["exposed_categories"] = exposed_categories
        
        return jsonify({
            "success": True,
            "data": result,
            "error": None
        }), 200
        
    except ValueError as e:
        # Catch validation errors from the service
        return jsonify({
            "success": False,
            "data": None,
            "error": str(e)
        }), 400
    except Exception as e:
        # Catch unexpected errors, log details server-side, and return a clean 500 error
        print(f"Unexpected error in /api/check-email: {e}", file=sys.stderr)
        return jsonify({
            "success": False,
            "data": None,
            "error": "An unexpected error occurred. Please try again later."
        }), 500

@app.route("/api/check-password", methods=["POST"])
def api_check_password():
    """
    Accepts JSON body {"password": "..."} and returns the password risk evaluation.
    """
    try:
        body = request.get_json(silent=True)
        if not body or "password" not in body:
            return jsonify({
                "success": False,
                "data": None,
                "error": "Request body must contain a 'password' field."
            }), 400
            
        password = body.get("password")
        
        # Call service to perform k-anonymity check
        result = check_password_exposure(password)
        
        # Add risk score to the result
        result["risk_level"] = score_password_risk(result["times_seen"])
        
        return jsonify({
            "success": True,
            "data": result,
            "error": None
        }), 200
        
    except ValueError as e:
        # Catch validation errors from the service
        return jsonify({
            "success": False,
            "data": None,
            "error": str(e)
        }), 400
    except Exception as e:
        # Catch unexpected errors, log details server-side, and return a clean 500 error
        print(f"Unexpected error in /api/check-password: {e}", file=sys.stderr)
        return jsonify({
            "success": False,
            "data": None,
            "error": "An unexpected error occurred. Please try again later."
        }), 500

if __name__ == "__main__":
    # debug=True for development (student demo environment)
    # Added comment noting this must be False in production
    app.run(host="127.0.0.1", port=5000, debug=True)
