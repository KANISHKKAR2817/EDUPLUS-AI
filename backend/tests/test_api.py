import pytest
import sys
import os
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "sqlite_connected"

def test_login_flow_and_token():
    # Login as teacher
    response = client.post("/api/auth/login", json={
        "username": "dr.kavitha",
        "password": "Password123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "teacher"
    token = data["access_token"]

    # Access students directory with bearer token
    headers = {"Authorization": f"Bearer {token}"}
    s_response = client.get("/api/students", headers=headers)
    assert s_response.status_code == 200
    students_list = s_response.json()
    assert len(students_list) >= 30, "Should return at least 30 students"

def test_knowledge_graph_endpoint():
    # Get teacher token
    login_res = client.post("/api/auth/login", json={
        "username": "dr.kavitha",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Query graph
    g_response = client.get("/api/graph", headers=headers)
    assert g_response.status_code == 200
    graph = g_response.json()
    assert "nodes" in graph
    assert "edges" in graph
    assert len(graph["nodes"]) > 0
    assert len(graph["edges"]) > 0

    # Verify edge labels include academic relationships
    edge_labels = {e["label"] for e in graph["edges"]}
    assert "ENROLLED_IN" in edge_labels or "CONTAINS" in edge_labels or "ASSESSES" in edge_labels
