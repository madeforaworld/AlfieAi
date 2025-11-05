import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { ProjectDetail } from './components/ProjectDetail';
import { TrendsAnalytics } from './components/TrendsAnalytics';
import { AlertsPage } from './components/AlertsPage';
import { CompareArchitects } from './components/CompareArchitects';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleProjectSelect = (id: string) => {
    setSelectedProjectId(id);
    setCurrentView('project-detail');
  };

  const handleBackToDashboard = () => {
    setSelectedProjectId(null);
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />

      {currentView === 'dashboard' && (
        <DashboardView onProjectSelect={handleProjectSelect} />
      )}

      {currentView === 'project-detail' && selectedProjectId && (
        <ProjectDetail projectId={selectedProjectId} onBack={handleBackToDashboard} />
      )}

      {currentView === 'insights' && (
        <TrendsAnalytics />
      )}

      {currentView === 'alerts' && (
        <AlertsPage />
      )}

      {currentView === 'compare' && (
        <CompareArchitects />
      )}

      {currentView === 'account' && (
        <div className="h-[calc(100vh-73px)] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl mb-2">Account Settings</h2>
            <p className="text-gray-600">Account management features coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
}
