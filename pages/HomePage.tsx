
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ROUTES } from '../constants';
import BusinessCard from '../components/BusinessCard';
import EventCard from '../components/EventCard';
import RegisterBusinessCTA from '../components/RegisterBusinessCTA';


const HomePage: React.FC = () => {
  const { t, businesses, events } = useAppContext();
  const featuredBusinesses = businesses.slice(0, 3);
  const upcomingEvents = events.slice(0, 2);
  const topVotedBusinesses = [...businesses].sort((a, b) => b.votes - a.votes).slice(0, 3);

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative bg-cover bg-center h-[70vh] text-white flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: "url('https://picsum.photos/seed/st-lucia-pitons-view/1600/900')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60"></div>
        <div className="relative text-center z-10 px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
            {t('welcome')} <span className="text-primary-200 bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent" style={{ backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>{t('appName')}</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl lg:text-2xl text-neutral-100 leading-relaxed max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to={ROUTES.DIRECTORY} 
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl text-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/30 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {t('explore')}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Businesses Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">


          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">{t('featuredBusinesses')}</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Discover the best local businesses that make Gros-Islet special
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredBusinesses.map(business => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </div>
      </section>

       {/* Community Choice Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">{t('communityChoice')}</h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                See which businesses our community loves the most
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-8 py-6">
                  <h3 className="text-2xl font-bold text-center text-white">{t('topBusinesses')}</h3>
                </div>
                <div className="p-8">
                  <ol className="space-y-4">
                    {topVotedBusinesses.map((business, index) => (
                      <li key={business.id} className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-all duration-200 hover:shadow-md">
                        <div className="flex items-center">
                          <span className={`text-2xl font-bold w-12 text-center ${
                            index === 0 ? 'text-warning-500' : 
                            index === 1 ? 'text-neutral-400' : 
                            'text-secondary-500'
                          }`}>
                            #{index+1}
                          </span>
                          <Link 
                            to={`/business/${business.id}`} 
                            className="ml-4 font-semibold text-neutral-900 hover:text-primary-700 transition-colors"
                          >
                            {business.name}
                          </Link>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-neutral-600">{business.votes} votes</span>
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <div className="text-center mt-8">
                    <Link 
                      to={ROUTES.DIRECTORY} 
                      className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/30 transition-all duration-200 shadow-lg"
                    >
                      {t('voteNow')}
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* Register Business CTA */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <RegisterBusinessCTA />
      </div>


      {/* Upcoming Events Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">{t('upcomingEvents')}</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Don't miss out on the latest events happening in Gros-Islet
            </p>
          </div>
          <div className="max-w-4xl mx-auto space-y-6">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link 
              to={ROUTES.EVENTS} 
              className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors group"
            >
              View all events
              <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;