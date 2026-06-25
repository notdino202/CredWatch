# CredWatch — Build Specification for Agent

## 1. Project Overview

**Name:** CredWatch
**Tagline:** A privacy-preserving credential exposure checker that tells users if their email or password has appeared in known data breaches — without ever transmitting sensitive data in plaintext.

**Context:** This is a BTech CSE 1st/2nd year mini-project, built solo over 1-2 weeks. It must be fully functional, demo-ready, and explainable in a viva. Prioritize correctness and clarity over cleverness. Code should be clean and commented enough that the student (non-author) can read and explain every part.

**Two core features:**
1. Email breach check (via XposedOrNot API)
2. Password exposure check (via Pwned Passwords API, using k-anonymity)

No API keys are required for either feature. No user data should be persisted to disk or a database — everything is session-only, in-memory, client-side state.

---

## 2. Tech Stack

- **Backend:** Python 3, Flask
- **Frontend:** Plain HTML5, CSS3, vanilla JavaScript (no frameworks, no build step)
- **HTTP client (backend → external APIs):** `requests`
- **Hashing:** Python's built-in `hashlib` (SHA-1)
- **No database.** No persistent storage of any kind.

---

## 3. File Structure

```
credwatch/
├── backend/
│   ├── app.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── email_check.py
│   │   └── password_check.py
│   ├── utils/
│   │   ├── __init__.py
│   │   └── risk_scoring.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
├── README.md
└── .gitignore
```

---

## 4. Backend Requirements

### 4.1 `app.py`

- Initialize Flask app.
- Enable CORS for local development (frontend will be served separately or via Flask's static folder — pick one approach and document it in the README; serving frontend via Flask's `static_folder` pointed at `../frontend` is the simplest and preferred approach for a student demo, avoiding CORS entirely).
- Define routes:
  - `GET /api/health` → returns `{"status": "ok"}`, HTTP 200. Used to verify server is alive.
  - `POST /api/check-email` → accepts JSON body `{"email": "..."}`, returns breach analysis (see 4.2).
  - `POST /api/check-password` → accepts JSON body `{"password": "..."}`, returns exposure analysis (see 4.3).
- Run with `debug=True` for development (note in code comment that this must be `False` in any real deployment).
- All routes must return JSON with a consistent shape: `{"success": true/false, "data": {...} or null, "error": "message" or null}`.

### 4.2 `services/email_check.py`

**Purpose:** Wraps the XposedOrNot API to check if an email has appeared in known breaches.

**Endpoint to call:**
```
GET https://api.xposedornot.com/v1/breach-analytics?email={email}
```
No API key needed. Respect their stated rate limit of 2 requests/second and 100 requests/day per IP — implement basic timeout (5-10 seconds) and graceful error handling, not active rate-limiting (a student demo won't hit the cap, but the code should not crash if it does — a 429 response should be caught and surfaced as a clean error message).

**Function to implement:** `check_email_breaches(email: str) -> dict`

Logic:
1. Validate the email is a non-empty string and matches a basic email regex pattern (e.g. `^[^@\s]+@[^@\s]+\.[^@\s]+$`). If invalid, raise a `ValueError` with a clear message — let `app.py` catch this and return a 400 response.
2. Call the XposedOrNot endpoint with a reasonable timeout (e.g. `timeout=8`).
3. Handle these cases explicitly:
   - HTTP 200 with breach data found → parse breach names, count, and exposed data types/categories from the response. (**Agent must fetch and inspect the live API response shape before writing the parser** — do not assume field names; XposedOrNot's response structure should be confirmed by making a real test call during development, e.g. testing with a known-breached test email, and the parsing logic should be written to match whatever the actual JSON keys are.)
   - HTTP 200 but no breaches found → this likely returns a different response shape (e.g. a "not found" message rather than an empty breach array) — handle this as a distinct, valid "Safe" case, not an error.
   - Non-200 status (e.g. 404, 429, 500) → catch and return a structured error, do not let exceptions propagate raw to the user.
   - Request timeout / connection error → catch `requests.exceptions.RequestException`, return a structured error like `{"error": "Could not reach breach database. Please try again."}`.
4. Return a dict shaped like:
```python
{
    "email": email,
    "breach_count": int,
    "breaches": [
        {"name": str, "date": str_or_none, "exposed_data": [str, ...]},
        ...
    ],
    "is_breached": bool
}
```

### 4.3 `services/password_check.py`

**Purpose:** Implements the k-anonymity password check using the Pwned Passwords API. This is the centerpiece feature — the implementation must be correct and the code should be well-commented since this is the main viva talking point.

**Endpoint to call:**
```
GET https://api.pwnedpasswords.com/range/{first_5_hash_chars}
```
No API key needed. Response is `text/plain`, not JSON — each line is formatted as `SUFFIX:COUNT` (suffix in uppercase hex, no colon-separated whitespace).

**Function to implement:** `check_password_exposure(password: str) -> dict`

Logic, step by step (implement exactly in this order, and comment each step clearly — this sequence IS the k-anonymity model and should be legible as such in the code):

1. Reject empty/non-string input early with a `ValueError`.
2. Encode the password to UTF-8 bytes.
3. Compute the SHA-1 hash of those bytes using `hashlib.sha1(...).hexdigest()`.
4. Convert the hex digest to uppercase (API requires uppercase).
5. Split into `prefix = hash[:5]` and `suffix = hash[5:]`.
6. Make a GET request to `https://api.pwnedpasswords.com/range/{prefix}` with a timeout (e.g. `timeout=8`). **Critically: only the 5-character prefix is ever sent over the network. The full hash and the plaintext password must never appear in any outgoing request, log line, or error message.**
7. Parse the plaintext response: split into lines, split each line on `:`, build a dict or list of `(suffix, count)` pairs.
8. Compare the local `suffix` against every returned suffix (case-sensitive exact match, both already uppercase).
9. If a match is found, return that line's count. If no match after checking all lines, the password has not been found in the breach corpus → count is 0.
10. Handle non-200 responses and request exceptions the same defensive way as in `email_check.py`.

Return a dict shaped like:
```python
{
    "times_seen": int,
    "is_exposed": bool   # True if times_seen > 0
}
```

**Do not** return or log the plaintext password or the full hash anywhere, including in error messages — only the prefix may appear in logs if logging is added.

### 4.4 `utils/risk_scoring.py`

**Purpose:** Pure functions, no API calls, no side effects — takes already-parsed data and returns a risk level string. Keep this separate from the API logic so it's independently testable and easy to explain.

**Function 1:** `score_email_risk(breach_count: int, exposed_categories: list[str]) -> str`
- 0 breaches → `"Safe"`
- 1-2 breaches, and none expose passwords or financial data → `"Moderate"`
- 3+ breaches, OR any single breach exposes passwords or financial/financial-adjacent data (e.g. categories containing "password", "credit card", "bank", "financial") → `"High"`

**Function 2:** `score_password_risk(times_seen: int) -> str`
- 0 → `"Safe"`
- 1-100 → `"Weak"`
- 100+ → `"Highly Compromised"`

Both functions should be deterministic, take primitives/simple structures as input, and have no dependency on Flask, requests, or any I/O. (This separation of concerns is intentional and worth highlighting in the project report — agent should preserve this boundary, not merge scoring logic into the service files.)

### 4.5 Error handling in `app.py`

Wrap each route handler's core logic in try/except:
- Catch `ValueError` (validation errors from the service functions) → return HTTP 400 with the error message.
- Catch any other unexpected exception → return HTTP 500 with a generic message (`"An unexpected error occurred."`) — do not leak stack traces or internal details to the client. Log the real exception server-side (print is fine for a student project; no need for a logging framework).

### 4.6 `requirements.txt`
Pin at minimum: `flask`, `requests`. Agent should run `pip freeze` after setup and commit the actual resolved versions.

---

## 5. Frontend Requirements

### 5.1 `index.html`

Single-page dashboard with two clearly separated sections/cards:

**Section A — Email Breach Check**
- Text input for email
- Button: "Check Email"
- Results area: shows risk badge (color-coded), breach count, and a list of breach names with exposed data types if breached; a clear "No breaches found" state if safe.

**Section B — Password Exposure Check**
- Password-type input (masked) for password
- Button: "Check Password"
- Results area: shows risk badge, times-seen count, and a short explanatory line.

**Section C — How This Works (explainer panel)**
- A collapsible or always-visible panel explaining, in plain language, that the password is never sent over the network — only a partial hash. This is for viva/demo value. Agent should write 3-4 sentences here explaining k-anonymity in accessible language, not just a placeholder.

Include a loading state (e.g. "Checking..." text or simple CSS spinner) shown while a request is in flight, and disable the button during the request to prevent double-submits.

Include basic client-side validation feedback (empty input, malformed email) before even calling the backend.

### 5.2 `css/style.css`

- Dark theme (security-tool aesthetic: dark background, accent color for highlights — e.g. a cyan or green accent on near-black background).
- Color-coded risk badges: green for Safe, yellow/amber for Moderate/Weak, red for High/Highly Compromised.
- Clean, readable typography. Responsive enough to look fine on a laptop screen during a viva (does not need full mobile responsiveness).
- No external CSS frameworks required — plain CSS is sufficient and preferred for a project this size.

### 5.3 `js/main.js`

- Two event listeners, one per button (or one per form `submit` if using `<form>` elements — if so, must call `preventDefault()`).
- Each handler:
  1. Reads input value, does basic client-side validation, shows an inline error if invalid and returns early without calling the backend.
  2. Shows loading state, disables button.
  3. Calls the relevant backend endpoint via `fetch()` with `method: 'POST'`, JSON body, `Content-Type: application/json` header.
  4. On success, parses JSON response and renders the risk badge + details into the results area.
  5. On failure (network error or `success: false` in response), shows a clear, non-technical error message to the user.
  6. Re-enables button, clears loading state, in both success and failure paths (use `finally`).
- No password value should ever be `console.log`'d or stored in any variable beyond what's needed for the immediate fetch call.

---

## 6. Things the Agent Must Verify, Not Assume

These are the parts most likely to break or differ from expectation — verify against the live APIs during implementation, don't guess:

1. **XposedOrNot's actual response JSON structure** for both the "breach found" and "no breach found" cases. Make real test calls (e.g. with a known-exposed test email such as one used in their own public documentation/examples) before writing the parser.
2. **XposedOrNot's behavior on invalid/malformed email input** — confirm whether it 400s or just returns empty/no-result data.
3. **Pwned Passwords API response format** — confirm it's truly plaintext `SUFFIX:COUNT` per line (it is, per current public documentation, but verify with a live test call against a known-common password like `password` before trusting it; do not hardcode the expected hash anywhere except as a one-off manual verification step, since this is also useful as a unit test).
4. Confirm current rate limit behavior/headers for both APIs in case error-handling needs adjustment.

---

## 7. Explicit Non-Goals (Do Not Build)

- No actual dark web / Tor / .onion scraping of any kind.
- No persistent database or file-based storage of checked emails or passwords.
- No user accounts, login, or sessions beyond the current browser tab's in-memory state.
- No paid API tiers (HIBP's paid email lookup is explicitly out of scope — XposedOrNot is the email-check provider).
- No third-party frontend frameworks (React, Vue, etc.) — plain HTML/CSS/JS only, per the chosen stack.

---

## 8. Deliverables Checklist

- [ ] Working Flask backend with all 3 routes functioning against live APIs
- [ ] Working frontend dashboard, served via Flask static folder, fully wired to backend
- [ ] `requirements.txt` with pinned, resolved versions
- [ ] `README.md` with setup/run instructions (venv creation, install, run command, how to access the dashboard locally)
- [ ] `.gitignore` excluding `venv/`, `__pycache__/`, `.env` if added later
- [ ] Manual end-to-end test: at least one known-breached email/password and one clean email/password, confirming correct risk levels render in the UI
