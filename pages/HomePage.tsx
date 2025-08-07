
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
    <div className="bg-sandy-beige min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative bg-cover bg-center h-[60vh] text-white flex items-center justify-center"
        style={{ backgroundImage: "url('https://picsum.photos/seed/st-lucia-pitons-view/1600/900')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative text-center z-10 px-4">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight" style={{ fontFamily: "'Roboto', sans-serif" }}>
            {t('welcome')} <span className="text-tropical-green-light">{t('appName')}</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl font-noto-sans">{t('heroSubtitle')}</p>
          <Link 
            to={ROUTES.DIRECTORY} 
            className="mt-8 inline-block bg-sunset-orange text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-opacity-90 transition-transform transform hover:scale-105"
          >
            {t('explore')}
          </Link>
        </div>
      </section>

      {/* Featured Businesses Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-charcoal-gray">{t('featuredBusinesses')}</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredBusinesses.map(business => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </div>
      </section>

       {/* Community Choice Section */}
      <section className="py-16 bg-sandy-beige">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-charcoal-gray">{t('communityChoice')}</h2>
            <div className="mt-12 max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold text-center text-ocean-blue">{t('topBusinesses')}</h3>
                <ol className="mt-6 space-y-4">
                    {topVotedBusinesses.map((business, index) => (
                        <li key={business.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 transition-shadow hover:shadow-md">
                           <div className="flex items-center">
                                <span className={`text-2xl font-bold w-10 text-center ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-500'}`}>#{index+1}</span>
                                <Link to={`/business/${business.id}`} className="ml-4 font-semibold text-charcoal-gray hover:text-tropical-green">{business.name}</Link>
                           </div>
                           <div className="text-sm font-bold text-gray-600">{business.votes} votes</div>
                        </li>
                    ))}
                </ol>
                <div className="text-center mt-8">
                    <Link to={ROUTES.DIRECTORY} className="bg-tropical-green text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors">
                        {t('voteNow')}
                    </Link>
                </div>
            </div>
        </div>
      </section>

      {/* Register Business CTA */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <RegisterBusinessCTA />
      </div>


      {/* Upcoming Events Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-charcoal-gray">{t('upcomingEvents')}</h2>
          <div className="mt-12 max-w-4xl mx-auto space-y-8">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to={ROUTES.EVENTS} className="text-ocean-blue font-semibold hover:underline">
              View all events &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;