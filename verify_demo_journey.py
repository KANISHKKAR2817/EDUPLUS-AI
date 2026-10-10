import httpx
import json

BASE_URL = "http://127.0.0.1:8000/api"

def run_verification():
    print("=" * 60)
    print("EDUPULSE AI — END-TO-END DEMONSTRATION VERIFICATION")
    print("=" * 60)

    # 1. Teacher Authentication
    print("\n[Step 1] Logging in as Faculty (Dr. Kavitha Raman)...")
    res = httpx.post(f"{BASE_URL}/auth/login", json={"username": "dr.kavitha", "password": "Password123!"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    teacher_token = res.json()["access_token"]
    teacher_headers = {"Authorization": f"Bearer {teacher_token}"}
    print("  -> Authenticated successfully! Role: teacher")

    # 2. Inspect Cohort Overview & Risk Bands
    print("\n[Step 2] Fetching Cohort Overview and Risk Distribution...")
    res = httpx.get(f"{BASE_URL}/reports/cohort-summary", headers=teacher_headers)
    assert res.status_code == 200
    cohort = res.json()
    print(f"  -> Total Students: {cohort['total_students']}")
    print(f"  -> Average Risk Score: {cohort['average_risk_score']}")
    print(f"  -> Band Distribution: {cohort['band_distribution']}")

    # 3. Inspect Arun Kumar (Flagged Student) Risk Breakdown
    print("\n[Step 3] Inspecting Flagged Student (Arun Kumar, 22CS101)...")
    res = httpx.get(f"{BASE_URL}/students/1/why-flagged", headers=teacher_headers)
    assert res.status_code == 200
    why = res.json()
    print(f"  -> Overall Risk Score: {why['overall_score']} / 100 ({why['band']})")
    print("  -> Key Drivers Identified:")
    for d in why["key_drivers"]:
        print(f"     * {d}")
    print("  -> Formula Contributions:")
    for c in why["contributing_factors"]:
        print(f"     * {c['name']}: {c['raw_metric']} -> Concern {c['concern_score']} -> Contribution: +{c['weighted_contribution']} pts")

    # 4. Recalculate Risk Score
    print("\n[Step 4] Triggering Live Recalculation of Risk Score...")
    res = httpx.post(f"{BASE_URL}/students/1/recalculate-risk", headers=teacher_headers)
    assert res.status_code == 200
    recalc = res.json()
    print(f"  -> Recalculated Score: {recalc['overall_score']} ({recalc['band']})")

    # 5. Query Academic Knowledge Graph
    print("\n[Step 5] Querying Academic Knowledge Graph for CS201 (Java)...")
    res = httpx.get(f"{BASE_URL}/graph?course_id=1", headers=teacher_headers)
    assert res.status_code == 200
    graph = res.json()
    print(f"  -> Knowledge Graph Nodes: {len(graph['nodes'])}, Edges: {len(graph['edges'])}")
    labels = {e['label'] for e in graph['edges']}
    print(f"  -> Traversed Relationships: {labels}")

    # 6. Student Login (Arun Kumar)
    print("\n[Step 6] Switching Persona: Logging in as Student (Arun Kumar)...")
    res = httpx.post(f"{BASE_URL}/auth/login", json={"username": "arun.kumar", "password": "Password123!"})
    assert res.status_code == 200
    student_token = res.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print("  -> Student authenticated! Role: student")

    # 7. Student Completes Follow-Up Assessment
    print("\n[Step 7] Student Completes 5-Question Follow-Up Assessment on Java Arrays...")
    # Student scores 5/5 (100%)
    res = httpx.post(f"{BASE_URL}/interventions/1/submit-followup?correct_count=5&total_count=5", headers=student_headers)
    assert res.status_code == 200
    followup = res.json()
    print(f"  -> Baseline Accuracy: {followup['baseline_accuracy']}%")
    print(f"  -> Follow-Up Post-Quiz Accuracy: {followup['follow_up_accuracy']}%")
    print(f"  -> Measured Improvement Delta: +{followup['delta']}%")
    print(f"  -> Verified Intervention Outcome: {followup['outcome'].upper()}")

    # 8. Teacher False-Alarm / Review Decision
    print("\n[Step 8] Faculty Reviews and Logs Alert Assessment...")
    res = httpx.post(f"{BASE_URL}/interventions/review-alert", headers=teacher_headers, json={
        "student_id": 1,
        "action": "confirmed",
        "reason": "Targeted Java Arrays follow-up completed successfully. Concept weakness resolved.",
        "student_context": "Arun attended faculty consultation hours and scored 100% on follow-up quiz."
    })
    assert res.status_code == 200
    print(f"  -> Faculty Decision Logged: {res.json()['action'].upper()} - Reason: {res.json()['reason']}")

    # 9. Verify Immutable Audit Trail
    print("\n[Step 9] Inspecting Institutional Audit Trail...")
    res = httpx.get(f"{BASE_URL}/reports/audit-logs?limit=5", headers=teacher_headers)
    assert res.status_code == 200
    logs = res.json()
    print(f"  -> Last {len(logs)} Audit Trail Events:")
    for l in logs:
        print(f"     [{l['timestamp'][:19]}] {l['actor_name']} ({l['actor_role']}): {l['action']} -> {l['details']}")

    # 10. AI Learning Tutor Test
    print("\n[Step 10] Testing AI Learning Assistant with Grounded Query...")
    res = httpx.post(f"{BASE_URL}/ai/chat", headers=student_headers, json={
        "message": "Explain Java Arrays and ArrayIndexOutOfBoundsException simply.",
        "student_id": 1,
        "course_id": 1
    })
    assert res.status_code == 200
    ai_data = res.json()
    print(f"  -> Live Gemini Mode: {ai_data['is_live_gemini']}")
    print(f"  -> Grounded Context: {ai_data['source_context']}")
    print(f"  -> AI Response Snippet: {ai_data['response'][:160]}...")

    print("\n" + "=" * 60)
    print("ALL 10 DEMONSTRATION WORKFLOW STEPS VERIFIED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_verification()
