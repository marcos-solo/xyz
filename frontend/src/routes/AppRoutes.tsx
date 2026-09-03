import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../layouts/AppLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboards/pages/DashboardPage';
import { UsersListPage } from '../features/users/pages/UsersListPage';
import { RolesListPage } from '../features/roles/pages/RolesListPage';
import { StudentsListPage } from '../features/students/pages/StudentsListPage';
import { StaffListPage } from '../features/staff/pages/StaffListPage';
import { BranchesListPage } from '../features/organization/pages/BranchesListPage';
import { DepartmentsListPage } from '../features/organization/pages/DepartmentsListPage';
import { PositionsListPage } from '../features/organization/pages/PositionsListPage';
import { CoursesListPage } from '../features/courses/pages/CoursesListPage';
import { CurriculumBuilderPage } from '../features/courses/pages/CurriculumBuilderPage';
import { BatchesListPage } from '../features/batches/pages/BatchesListPage';
import { EnrollmentsListPage } from '../features/enrollments/pages/EnrollmentsListPage';
import { ClassTimetablePage } from '../features/classes/pages/ClassTimetablePage';
import { AssessmentsListPage } from '../features/assessments/pages/AssessmentsListPage';
import { QuizRunnerPage } from '../features/assessments/pages/QuizRunnerPage';
import { GradebookPage } from '../features/assessments/pages/GradebookPage';
import { CertificatesListPage } from '../features/certificates/pages/CertificatesListPage';
import { PublicVerifyPage } from '../features/certificates/pages/PublicVerifyPage';
import { ReportsCenterPage } from '../features/reports/pages/ReportsCenterPage';
import { AnnouncementsPage } from '../features/system/pages/AnnouncementsPage';
import { AuditLogsPage } from '../features/system/pages/AuditLogsPage';
import { SystemSettingsPage } from '../features/system/pages/SystemSettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-xs text-slate-500 font-medium">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify/:code" element={<PublicVerifyPage />} />

      {/* Authenticated routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Organization */}
        <Route path="/branches" element={<BranchesListPage />} />
        <Route path="/departments" element={<DepartmentsListPage />} />
        <Route path="/positions" element={<PositionsListPage />} />

        {/* People */}
        <Route path="/users" element={<UsersListPage />} />
        <Route path="/roles" element={<RolesListPage />} />
        <Route path="/students" element={<StudentsListPage />} />
        <Route path="/staff" element={<StaffListPage />} />

        {/* Academics & Batches */}
        <Route path="/courses" element={<CoursesListPage />} />
        <Route path="/courses/:uuid/curriculum" element={<CurriculumBuilderPage />} />
        <Route path="/batches" element={<BatchesListPage />} />
        <Route path="/batches/:batchUuid/gradebook" element={<GradebookPage />} />
        <Route path="/enrollments" element={<EnrollmentsListPage />} />

        {/* Operations */}
        <Route path="/classes" element={<ClassTimetablePage />} />
        <Route path="/timetable" element={<ClassTimetablePage />} />
        <Route path="/assessments" element={<AssessmentsListPage />} />
        <Route path="/assessments/:uuid/take" element={<QuizRunnerPage />} />
        <Route path="/certificates" element={<CertificatesListPage />} />

        {/* Student shortcuts */}
        <Route path="/my-courses" element={<CoursesListPage />} />
        <Route path="/my-assessments" element={<AssessmentsListPage />} />
        <Route path="/my-certificates" element={<CertificatesListPage />} />

        {/* System & Reports */}
        <Route path="/reports" element={<ReportsCenterPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
        <Route path="/settings" element={<SystemSettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
