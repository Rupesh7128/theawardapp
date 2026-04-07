import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { db } from './lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
import AwardsDirectory from './pages/AwardsDirectory';
import Navbar from './components/Navbar';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-[#666666]">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  return <>{children}</>;
}

function CustomDomainApp({ domain }: { domain: string }) {
  const [awardId, setAwardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function resolveDomain() {
      try {
        const q = query(collection(db, 'awards'), where('customDomain', '==', domain));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setAwardId(snap.docs[0].id);
        }
      } catch (e) {
        console.error('Error resolving custom domain:', e);
      } finally {
        setLoading(false);
      }
    }
    resolveDomain();
  }, [domain]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!awardId) return <div className="min-h-screen flex items-center justify-center">Award not found for this domain.</div>;

  return (
    <Router>
      <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans selection:bg-[#111111] selection:text-white">
        <Routes>
          <Route path="/" element={<PublicAward customAwardId={awardId} />} />
          <Route path="/category/:categoryId" element={<PublicCategory customAwardId={awardId} />} />
          <Route path="/nominee/:nomineeId" element={<PublicNominee customAwardId={awardId} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default function App() {
  const hostname = window.location.hostname;
  const isCustomDomain = 
    !['localhost', '127.0.0.1'].includes(hostname) && 
    !hostname.includes('theawardsapp.com') && 
    !hostname.includes('web.app') && 
    !hostname.includes('firebaseapp.com') &&
    !hostname.startsWith('192.168.') &&
    !hostname.startsWith('10.');

  if (isCustomDomain) {
    return (
      <AuthProvider>
        <CustomDomainApp domain={hostname} />
      </AuthProvider>
    );
  }

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
              
              {/* Directory */}
              <Route path="/directory" element={<AwardsDirectory />} />

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
