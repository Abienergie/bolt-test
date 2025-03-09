import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ClientProvider } from './contexts/client';
import { FinancialSettingsProvider } from './contexts/FinancialSettingsContext';
import Layout from './components/Layout';
import Header from './components/Header';
import SolarForm from './components/SolarForm';
import ProjectionFinanciere from './pages/ProjectionFinanciere';
import EligibilityForm from './pages/EligibilityForm';
import Report from './pages/Report';
import SubscriptionTerms from './pages/SubscriptionTerms';
import ExitTerms from './pages/ExitTerms';
import AbieLink from './pages/AbieLink';
import EnedisCallback from './pages/EnedisCallback';
import Agency from './pages/Agency';
import Settings from './pages/Settings';
import TestIcoll from './pages/TestIcoll';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/LoginForm';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <Router>
      <ClientProvider>
        <FinancialSettingsProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <Layout>
              <Routes>
                <Route path="/" element={<SolarForm />} />
                <Route 
                  path="/projection" 
                  element={
                    <ProtectedRoute>
                      <ProjectionFinanciere />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/eligibilite" 
                  element={
                    <ProtectedRoute>
                      <EligibilityForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/rapport" 
                  element={
                    <ProtectedRoute>
                      <Report />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/modalites-abonnement" element={<SubscriptionTerms />} />
                <Route path="/modalites-sortie" element={<ExitTerms />} />
                <Route path="/abie-link" element={<AbieLink />} />
                <Route path="/oauth/callback" element={<EnedisCallback />} />
                <Route path="/agence" element={<Agency />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/test-icoll" element={<TestIcoll />} />
              </Routes>
            </Layout>
          </div>
        </FinancialSettingsProvider>
      </ClientProvider>
    </Router>
  );
}