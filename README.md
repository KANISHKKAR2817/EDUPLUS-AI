# EduPulse AI — Intelligent Student Performance Analysis & Early Intervention System

> **“Arrear vantha piragu kavalai pattu enna labam? Modhallaye therinja, pass aaga prepare pannalam!”**
>
> *(Why worry after getting arrears? If identified early, students can prepare and pass!)*

EduPulse AI is a secure, explainable, database-backed web application built for an inter-college hackathon. It connects multi-modal academic signals—**attendance records**, **continuous assessment performance**, **lab assignment completion**, and **learning progress trends**—into an auditable early intervention workflow for college faculty and students.

---

## 🌟 Core Engineering Principles (Hackathon Rules Implemented)

1. **RULE #01 — Auditable Multi-Signal Student Risk Score:**
   - Transparent, configurable 4-factor scoring formula:
     $$\text{Risk Score} = 0.25 \times \text{Attendance Concern} + 0.35 \times \text{Assessment Concern} + 0.20 \times \text{Assignment Concern} + 0.20 \times \text{Trend Concern}$$
   - Bands: **Low concern (0–29)**, **Moderate concern (30–59)**, **High concern (60–79)**, **Urgent review recommended (80–100)**.
   - Interactive explanation panel: *"Why is this student flagged?"* displaying real stored numbers rather than generic text.
   - Live recalculation persisted in SQLite with historical snapshots.
2. **RULE #02 — Queryable Academic Knowledge Graph:**
   - Real relational entities and traversable relationships:
     - `Student` $\rightarrow$ `ENROLLED_IN` $\rightarrow$ `Course`
     - `Course` $\rightarrow$ `CONTAINS` $\rightarrow$ `Concept`
     - `Assessment` $\rightarrow$ `ASSESSES` $\rightarrow$ `Concept`
     - `Question` $\rightarrow$ `TESTS` $\rightarrow$ `Concept`
     - `Student` $\rightarrow$ `STRUGGLES_WITH` $\rightarrow$ `Concept`
     - `Intervention` $\rightarrow$ `TARGETS` $\rightarrow$ `Concept`
     - `Student` $\rightarrow$ `RECEIVES` $\rightarrow$ `Intervention`
   - Interactive SVG canvas with category filtering, search, and a slide-out entity/relationship inspector drawer.
3. **RULE #03 — Explainable Risk Predictions:**
   - Global model explanation page showcasing component weights, risk-band definitions, and cohort distribution.
   - Individual explanation panels distinguishing observed evidence facts from potential hypotheses.
4. **RULE #04 — Concept-Level Weakness & Targeted Interventions:**
   - Maps continuous assessment questions directly to syllabus concepts (e.g., *Java Arrays & Indexing*, *Linked Lists*, *Relational Normalization*).
   - Detects concept gaps $\rightarrow$ Explains evidence $\rightarrow$ Recommends targeted action $\rightarrow$ Assigns follow-up task $\rightarrow$ Evaluates post-quiz evidence $\rightarrow$ Verifies improvement!
5. **RULE #05 — Bias Reduction & False-Alarm Management:**
   - No sensitive personal attributes (caste, income, disability, gender) are included in the scoring model.
   - Human-in-the-loop: Teachers can confirm, edit, or dismiss alerts with documented justification and optional student-provided context.
6. **RULE #06 — Secure Records & Teacher Drill-Down:**
   - Passwords hashed with **bcrypt**.
   - Server-side role-based access control (RBAC) via **JWT tokens**. Students can only access their own records.
   - Real-time immutable **Audit Trail** capturing logins, grade approvals, recalculations, and alert modifications.

---

## 🛠️ Technology Stack

- **Frontend:**
  - React 19 + TypeScript + Vite
  - Tailwind CSS (Dark navy `#060f1e` & teal `#0d9488`/emerald `#10b981` palette)
  - Lucide React icons
  - Recharts (Analytics and cohort distribution)
  - Interactive SVG Academic Knowledge Graph
- **Backend:**
  - Python 3.12 + FastAPI
  - SQLAlchemy 2.0 ORM + SQLite
  - Pydantic v2 schemas & request validation
  - Passlib + bcrypt + python-jose (JWT)
  - PyPDF & python-docx for text extraction
  - Pytest automated test suite
- **AI & Analytics:**
  - Google Gemini API (`gemini-2.5-flash`)
  - **Graceful Deterministic Educational Fallback:** If `GEMINI_API_KEY` is omitted or unavailable, EduPulse seamlessly runs on its built-in rule-based academic engine without crashing.

---

## 👥 Demo Personas & Credentials

All demo accounts use password: `Password123!`

| Persona | Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Dr. Kavitha Raman** | Teacher / Faculty | `dr.kavitha` | `Password123!` | Department Head view; cohort risk oversight, alert reviews, and grade approvals. |
| **Prof. Ramesh Sundaram** | Teacher / Faculty | `prof.ramesh` | `Password123!` | Assistant Professor view for DBMS & Discrete Mathematics. |
| **Arun Kumar** | Student (Flagged) | `arun.kumar` | `Password123!` | Flagged student with Java Arrays weakness; completes follow-up quiz. |
| **Deepa Sundaram** | Student (Top Performer) | `deepa.s` | `Password123!` | Low-concern student (94% attendance, high marks). |
| **System Administrator** | Administrator | `admin` | `Password123!` | System stats, CSV batch import, and one-click dataset reset. |

> **Pro-tip:** The login screen and top navbar feature a **One-Click Demo Switcher** for instant live presentation switching.

---

## 🚀 Getting Started & Local Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
python -m pip install -r requirements.txt

# Seed synthetic cohort (35 students, 4 courses, 14 concepts, initial assessments)
python seed.py

# Run FastAPI backend server (runs on port 8000)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies (already installed if in repo)
npm install

# Start Vite development server (runs on port 5173)
npm run dev -- --host 127.0.0.1 --port 5173
```
Open your browser to: [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 🧪 Running Automated Tests

Run the backend test suite:
```bash
# From workspace root
python -m pytest backend/tests -v
```
All tests verify:
- Health check and SQLite connectivity
- Authentication, JWT generation, and password hashing
- Auditable risk engine mathematical weights sum to 1.0
- Cohort risk band classification
- Real Academic Knowledge Graph node/edge traversals

---

## 🎬 End-to-End Live Hackathon Demonstration Guide

Follow this 12-step path during judge presentations:

1. **Open Login Portal:** Go to `http://127.0.0.1:5173/login`. Note the Tamil early intervention message banner and demo personas.
2. **Faculty Sign-In:** Click **"Dr. Kavitha Raman"** (Teacher View).
3. **Inspect Cohort Overview:** View the 35 students, risk band distribution chart, and the student spotlight card highlighting Arun Kumar.
4. **Inspect "Why Flagged?":** On Arun Kumar's row, click **"Why?"** to open the auditable explanation modal. Observe the exact factor contributions (+35.0 pts Assessment Concern, +12.0 pts Assignment Concern, etc.).
5. **Drill Down into Student:** Click **"Drill Down"** to open `/students/1`. View Arun's course-wise attendance (68%, declining) and his 0/30 score on Java Arrays. Click **"Recalculate Score"** to demonstrate live calculation.
6. **Traverse Academic Knowledge Graph:** Click **"Academic Knowledge Graph"** in the sidebar. Select the `CS201: Java Programming` course and click on `Java Arrays & Indexing` to see its connected examination questions and interventions.
7. **Switch to Student Persona:** Click **"Switch Demo Role"** in the top-right navbar $\rightarrow$ select **"Arun Kumar"**.
8. **Student Learning Hub:** Note the supportive, encouraging tone. View the active task: *"Targeted Practice: Java Arrays & Memory Indexing"* (Baseline Accuracy: **0.0%**).
9. **Complete Follow-up Quiz:** Click **"Attempt Follow-up Quiz"**. Answer the 5 practice questions and click **"Submit Quiz & Record Evidence"**.
10. **Verify Improvement:** View the verified evidence modal showing:
    - Baseline: **0.0%**
    - Follow-Up Score: **100.0%**
    - Delta: **+100.0%**
    - Outcome: **IMPROVED**
11. **Faculty Alert Review:** Switch back to Dr. Kavitha $\rightarrow$ open Arun's profile $\rightarrow$ click **"False-Alarm Review"** $\rightarrow$ select *"Confirm Alert"* $\rightarrow$ enter *"Java Arrays follow-up completed with 100% score"* $\rightarrow$ save decision.
12. **Audit Trail Verification:** Navigate to **"Reports & Audit Logs"** (`/reports`). Inspect the real-time institutional activity log capturing the exact sequence of events, and click **"Export Cohort CSV"** to download the report.

---

## 🔑 Gemini API Key Configuration (Optional)

EduPulse AI includes live Gemini API integration (`gemini-2.5-flash`). To enable live external calls:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Set your API key:
   ```env
   GEMINI_API_KEY="AIzaSyYourActualGeminiKey"
   ```
3. If no key is set, EduPulse automatically runs on its deterministic educational fallback engine without breaking any feature!

---

## 📜 Ethical Disclaimer

EduPulse AI risk scores are demonstrative decision-support estimates to guide early mentoring and student support. They do **not** replace professional faculty judgment and do **not** claim to predict university examination outcomes with certainty.
