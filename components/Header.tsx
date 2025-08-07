
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Language } from '../types';
import { ROUTES } from '../constants';

const Logo = () => (
  <div className="flex items-center space-x-2">
    {/* Using a placeholder SVG for the logo as per PRD description */}
    <svg className="w-10 h-10 text-tropical-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
    </svg>
    <span className="text-xl font-bold text-charcoal-gray hidden md:block">Gros-Islet</span>
  </div>
);

const VoterBadge: React.FC = () => {
    const { totalVotes } = useAppContext();

    if (totalVotes === 0) return null;

    let badge;
    const starIcon = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.367-2.447a1 1 0 00-1.175 0l-3.367 2.447c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z";
    const shieldIcon = "M9 12.75L11.25 15L15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
    const heartIcon = "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z";

    if (totalVotes >= 5) {
        badge = { text: 'Gros-Islet Guru', color: 'warning', icon: starIcon };
    } else if (totalVotes >= 3) {
        badge = { text: 'Local Champion', color: 'neutral', icon: shieldIcon };
    } else {
        badge = { text: 'Community Voter', color: 'secondary', icon: heartIcon };
    }

    const colorClasses: { [key: string]: string } = {
        warning: 'bg-warning-100 text-warning-800 border border-warning-200',
        neutral: 'bg-neutral-100 text-neutral-800 border border-neutral-200',
        secondary: 'bg-secondary-100 text-secondary-800 border border-secondary-200',
    };
    
    const iconColorClasses: { [key: string]: string } = {
        warning: 'text-warning-600',
        neutral: 'text-neutral-600',
        secondary: 'text-secondary-600',
    }

    return (
        <div 
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${colorClasses[badge.color]}`} 
            title={`${totalVotes} vote${totalVotes > 1 ? 's' : ''} cast!`}
            role="status"
            aria-label={`${totalVotes} votes cast`}
        >
            <svg className={`w-4 h-4 ${iconColorClasses[badge.color]}`} fill="currentColor" viewBox="0 0 24 24">
                <path d={badge.icon} />
            </svg>
            <span className="hidden sm:inline">{badge.text}</span>
        </div>
    );
};

const Header: React.FC = () => {
  const { language, setLanguage, t, isAuthenticated, logout } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-200'
        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `block px-4 py-3 text-base font-medium transition-colors ${
      isActive
        ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
        : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
    }`;

  return (
    <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink to={ROUTES.HOME} className="flex items-center space-x-2">
              <Logo />
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <NavLink to={ROUTES.HOME} className={navLinkClass}>{t('home')}</NavLink>
            <NavLink to={ROUTES.DIRECTORY} className={navLinkClass}>{t('directory')}</NavLink>
            <NavLink to={ROUTES.EVENTS} className={navLinkClass}>{t('events')}</NavLink>
            <NavLink to={ROUTES.NEWS} className={navLinkClass}>{t('news')}</NavLink>
            <NavLink to={ROUTES.ITINERARY_PLANNER} className={navLinkClass}>{t('itineraryPlanner')}</NavLink>
            {isAuthenticated && <NavLink to={ROUTES.DASHBOARD} className={navLinkClass}>{t('dashboard')}</NavLink>}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <VoterBadge />
            
            {/* Language Selector */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="appearance-none bg-neutral-50 border border-neutral-300 text-neutral-700 text-sm rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block w-full pl-3 pr-8 py-2 transition-all duration-200"
                aria-label="Language switcher"
              >
                <option value={Language.EN}>EN</option>
                <option value={Language.FR}>FR</option>
                <option value={Language.KW}>KW</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            {/* Auth Button */}
            {isAuthenticated ? (
              <button 
                onClick={logout} 
                className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
              >
                {t('logout')}
              </button>
            ) : (
              <NavLink 
                to={ROUTES.AUTH} 
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
              >
                {t('ownerLogin')}
              </NavLink>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen ? 'true' : 'false'}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-neutral-200">
              <NavLink to={ROUTES.HOME} className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                {t('home')}
              </NavLink>
              <NavLink to={ROUTES.DIRECTORY} className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                {t('directory')}
              </NavLink>
              <NavLink to={ROUTES.EVENTS} className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                {t('events')}
              </NavLink>
              <NavLink to={ROUTES.NEWS} className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                {t('news')}
              </NavLink>
              <NavLink to={ROUTES.ITINERARY_PLANNER} className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                {t('itineraryPlanner')}
              </NavLink>
              {isAuthenticated && (
                <NavLink to={ROUTES.DASHBOARD} className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                  {t('dashboard')}
                </NavLink>
              )}
              
              {/* Mobile Actions */}
              <div className="pt-4 pb-3 border-t border-neutral-200">
                <div className="flex items-center justify-between px-4 py-2">
                  <VoterBadge />
                  
                  {/* Mobile Language Selector */}
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="appearance-none bg-neutral-50 border border-neutral-300 text-neutral-700 text-sm rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block w-32 pl-3 pr-8 py-2 transition-all duration-200"
                    aria-label="Language switcher"
                  >
                    <option value={Language.EN}>EN</option>
                    <option value={Language.FR}>FR</option>
                    <option value={Language.KW}>KW</option>
                  </select>
                </div>
                
                {/* Mobile Auth Button */}
                <div className="px-4 pt-2">
                  {isAuthenticated ? (
                    <button 
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }} 
                      className="w-full px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
                    >
                      {t('logout')}
                    </button>
                  ) : (
                    <NavLink 
                      to={ROUTES.AUTH} 
                      className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('ownerLogin')}
                    </NavLink>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
