import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import CreateAwardWizard from './pages/CreateAwardWizard';
import ManageAward from './pages/ManageAward';
import PublicAward from './pages/PublicAward';
import PublicCategory from './pages/PublicCategory';
import PublicNominee from './pages/PublicNominee';
import SuperAdmin from './pages/SuperAdmin';
import UseCaseSaaS from './pages/UseCaseSaaS';
import UseCaseRealEstate from './pages/UseCaseRealEstate';
import UseCaseMarketing from './pages/UseCaseMarketing';
import Navbar from './components/Navbar';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-[#666666]">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans selection:bg-[#111111] selection:text-white">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/dashboard/create" element={<PrivateRoute><CreateAwardWizard /></PrivateRoute>} />
              <Route path="/dashboard/award/:id" element={<PrivateRoute><ManageAward /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute><SuperAdmin /></PrivateRoute>} />
              
              {/* Use Case Pages */}
              <Route path="/use-cases/saas" element={<UseCaseSaaS />} />
              <Route path="/use-cases/real-estate" element={<UseCaseRealEstate />} />
              <Route path="/use-cases/marketing" element={<UseCaseMarketing />} />

              {/* Public Award Pages */}
              <Route path="/award/:id" element={<PublicAward />} />
              <Route path="/award/:id/category/:categoryId" element={<PublicCategory />} />
              <Route path="/award/:id/nominee/:nomineeId" element={<PublicNominee />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
