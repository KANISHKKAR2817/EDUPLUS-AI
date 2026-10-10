import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { LoginPage } from './pages/LoginPage';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentDirectory } from './pages/StudentDirectory';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { KnowledgeGraphPage } from './pages/KnowledgeGraphPage';
import { ConceptWeaknessPage } from './pages/ConceptWeaknessPage';
import { InterventionsPage } from './pages/InterventionsPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { StudyMaterialPage } from './pages/StudyMaterialPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { RiskExplorationPage } from './pages/RiskExplorationPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-mono">Initializing EduPulse Session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'student') {
    return <StudentDashboard />;
  }
  return <TeacherDashboard />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedLayout>
                <DashboardRouter />
              </ProtectedLayout>
            }
          />

          <Route
            path="/students"
            element={
              <ProtectedLayout>
                <StudentDirectory />
              </ProtectedLayout>
            }
          />

          <Route
            path="/students/:id"
            element={
              <ProtectedLayout>
                <StudentProfilePage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/knowledge-graph"
            element={
              <ProtectedLayout>
                <KnowledgeGraphPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/concept-weaknesses"
            element={
              <ProtectedLayout>
                <ConceptWeaknessPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/interventions"
            element={
              <ProtectedLayout>
                <InterventionsPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/my-interventions"
            element={
              <ProtectedLayout>
                <StudentDashboard />
              </ProtectedLayout>
            }
          />

          <Route
            path="/assessments"
            element={
              <ProtectedLayout>
                <AssessmentsPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/assignments"
            element={
              <ProtectedLayout>
                <AssignmentsPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/study-materials"
            element={
              <ProtectedLayout>
                <StudyMaterialPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/ai-tutor"
            element={
              <ProtectedLayout>
                <AIAssistantPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/risk-model"
            element={
              <ProtectedLayout>
                <RiskExplorationPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedLayout>
                <ReportsPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedLayout>
                <SettingsPage />
              </ProtectedLayout>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
