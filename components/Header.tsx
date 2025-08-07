
import React from 'react';
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
        badge = { text: 'Gros-Islet Guru', color: 'yellow', icon: starIcon };
    } else if (totalVotes >= 3) {
        badge = { text: 'Local Champion', color: 'gray', icon: shieldIcon };
    } else {
        badge = { text: 'Community Voter', color: 'orange', icon: heartIcon };
    }

    const colorClasses: { [key: string]: string } = {
        yellow: 'bg-yellow-100 text-yellow-800',
        gray: 'bg-gray-200 text-gray-800',
        orange: 'bg-orange-100 text-orange-800',
    };
    
    const iconColorClasses: { [key: string]: string } = {
        yellow: 'text-yellow-500',
        gray: 'text-gray-500',
        orange: 'text-orange-500',
    }

    return (
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${colorClasses[badge.color]}`} title={`${totalVotes} vote${totalVotes > 1 ? 's' : ''} cast!`}>
            <svg className={`w-5 h-5 ${iconColorClasses[badge.color]}`} fill="currentColor" viewBox="0 0 24 24">
                <path d={badge.icon} />
            </svg>
            <span className="hidden sm:inline">{badge.text}</span>
        </div>
    );
};

const Header: React.FC = () => {
  const { language, setLanguage, t, isAuthenticated, logout } = useAppContext();

  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-tropical-green-light text-tropical-green-dark'
        : 'text-charcoal-gray hover:bg-sandy-beige'
    }`;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <NavLink to={ROUTES.HOME}><Logo /></NavLink>
          </div>
          <nav className="hidden md:flex items-center space-x-4">
            <NavLink to={ROUTES.HOME} className={navLinkClass}>{t('home')}</NavLink>
            <NavLink to={ROUTES.DIRECTORY} className={navLinkClass}>{t('directory')}</NavLink>
            <NavLink to={ROUTES.EVENTS} className={navLinkClass}>{t('events')}</NavLink>
            <NavLink to={ROUTES.NEWS} className={navLinkClass}>{t('news')}</NavLink>
            <NavLink to={ROUTES.ITINERARY_PLANNER} className={navLinkClass}>{t('itineraryPlanner')}</NavLink>
            {isAuthenticated && <NavLink to={ROUTES.DASHBOARD} className={navLinkClass}>{t('dashboard')}</NavLink>}
          </nav>
          <div className="flex items-center space-x-4">
            <VoterBadge />
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="appearance-none bg-sandy-beige border border-gray-300 text-charcoal-gray text-sm rounded-lg focus:ring-ocean-blue focus:border-ocean-blue block w-full pl-3 pr-8 py-2 transition"
                aria-label="Language switcher"
              >
                <option value={Language.EN}>EN</option>
                <option value={Language.FR}>FR</option>
                <option value={Language.KW}>KW</option>
              </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-charcoal-gray">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            {isAuthenticated ? (
               <button onClick={logout} className="px-4 py-2 bg-sunset-orange text-white rounded-md hover:bg-opacity-90 transition-colors text-sm font-medium">{t('logout')}</button>
            ) : (
              <NavLink to={ROUTES.AUTH} className="px-4 py-2 bg-ocean-blue text-white rounded-md hover:bg-opacity-90 transition-colors text-sm font-medium">{t('ownerLogin')}</NavLink>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
