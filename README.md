# CredWatch — Privacy-Preserving Exposure Checker

A privacy-preserving credential exposure checker designed to determine whether an email or password has appeared in known data breaches without ever transmitting sensitive user data in plaintext.

This project was built to satisfy the requirements for a BTech CSE mini-project, emphasizing correctness, visual clarity, privacy architecture, and local execution.

---

## 1. Core Architecture

CredWatch consists of two primary security modules:

### A. Email Breach Analyzer
- **API Provider**: XposedOrNot (no API key required).
- **Functionality**: Performs breach analysis checks on email addresses.
- **Privacy Model**: Validates formatting locally first and queries the service over standard secure channels.

### B. Password Exposure Checker (k-Anonymity Model)
- **API Provider**: Pwned Passwords API (no API key required).
- **Privacy Model**: Uses the cryptographic concept of **k-anonymity** to check passwords without risking exposure:
  1. The password is hashed using SHA-1 locally in the Python backend.
  2. The hash is split: the first 5 characters (e.g. `5BAA6`) represent the **prefix**, and the remaining 35 characters are the **suffix**.
  3. Only the 5-character prefix is sent over the network to the external API.
  4. The external database returns a list of all leaked hashes matching that prefix, along with their leak counts.
  5. The application performs a local search against the list to match the remaining suffix.
  6. Neither the local server logs, the ISP, nor the external API provider ever receives your actual password or full hash.

---

## 2. Directory Structure

```
CredWatch/
├── backend/
│   ├── app.py                     # Flask web app and API router
│   ├── services/
│   │   ├── __init__.py
│   │   ├── email_check.py         # XposedOrNot email breach service
│   │   └── password_check.py      # Pwned Passwords k-anonymity service
│   ├── utils/
│   │   ├── __init__.py
│   │   └── risk_scoring.py        # Threat level scoring algorithms
│   └── requirements.txt           # Pinned project dependencies
├── frontend/
│   ├── index.html                 # Core HTML5 dashboard view
│   ├── css/
│   │   └── style.css              # Custom responsive dark-theme styles
│   └── js/
│       └── main.js                # Form capture, validation, and DOM updates
├── README.md                      # Setup and documentation manual
└── .gitignore                     # Git build exclusions
```

---

## 3. Setup and Installation

### Step 1: Clone or Navigate to the Directory
Ensure you are in the project root directory where `README.md` is located.

```bash
cd c:\Users\Admin\Documents\CredWatch
```

### Step 2: Create a Virtual Environment
Create a clean Python environment to install dependencies:

```bash
# On Windows
python -m venv venv
```

### Step 3: Activate the Virtual Environment
Activate the environment to start the server:

```powershell
# On Windows PowerShell
.\venv\Scripts\Activate.ps1

# On Windows CMD
.\venv\Scripts\activate.bat
```

### Step 4: Install Dependencies
Install Flask and standard packages from the requirements list:

```bash
pip install -r backend/requirements.txt
```

---

## 4. How to Run the Application

Start the Flask server from the terminal:

```bash
python backend/app.py
```

The application will start, serving the frontend and API at:
👉 **[http://127.0.0.1:5000/](http://127.0.0.1:5000/)**

Open this address in your web browser to explore the dashboard.

---

## 5. Security & Privacy Constraints

- **No Persistence**: There is no database or disk file saving credential searches. All information processed remains entirely session-only and client-side or in short-lived memory transactions.
- **Plaintext Protection**: The full plaintext password or complete SHA-1 hash is never written to log lines, terminal windows, or error messages.
