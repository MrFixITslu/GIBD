
import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { ROUTES } from './constants';

import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Spinner from './components/Spinner';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const DirectoryPage = lazy(() => import('./pages/DirectoryPage'));
const BusinessDetailPage = lazy(() => import('./pages/BusinessDetailPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const ItineraryPlannerPage = lazy(() => import('./pages/ItineraryPlannerPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const BusinessRegistrationPage = lazy(() => import('./pages/BusinessRegistrationPage'));

const AppContent: React.FC = () => {
  const { isLoading, appError } = useAppContext();

  if (isLoading) {
    return <div className="flex-grow flex items-center justify-center"><Spinner /></div>;
  }

  if (appError) {
     return <div className="flex-grow flex items-center justify-center p-4">
       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
         <strong className="font-bold">Connection Error!</strong>
         <span className="block sm:inline"> {appError}</span>
       </div>
     </div>;
  }

  return (
    <Suspense fallback={<div className="flex-grow flex items-center justify-center"><Spinner /></div>}>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.DIRECTORY} element={<DirectoryPage />} />
        <Route path={ROUTES.BUSINESS_DETAIL} element={<BusinessDetailPage />} />
        <Route path={ROUTES.EVENTS} element={<EventsPage />} />
        <Route path={ROUTES.NEWS} element={<NewsPage />} />
        <Route path={ROUTES.ITINERARY_PLANNER} element={<ItineraryPlannerPage />} />
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.AUTH} element={<AuthPage />} />
        <Route path={ROUTES.REGISTER_BUSINESS} element={<BusinessRegistrationPage />} />
      </Routes>
    </Suspense>
  );
};


function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <HashRouter>
          <div className="flex flex-col min-h-screen bg-neutral-50">
            {/* Skip Link for Accessibility */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            
            <Header />
            <main id="main-content" className="flex-grow flex flex-col">
              <AppContent />
            </main>
            <Footer />
          </div>
        </HashRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
