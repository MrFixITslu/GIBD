

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Business, Event } from '../types';
import { ROUTES } from '../constants';
import { useAppContext } from '../context/AppContext';
import MapView from '../components/MapView';

const BusinessDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { businesses, events, voteForBusiness, hasVotedFor } = useAppContext();
  
  const business: Business | undefined = businesses.find(b => b.id === id);
  const relatedEvents: Event[] = events.filter(e => e.businessId === id);

  if (!business) {
    return (
      <div className="container mx-auto text-center py-20">
        <h1 className="text-2xl font-bold">Business not found</h1>
        <Link to={ROUTES.DIRECTORY} className="text-ocean-blue hover:underline mt-4 inline-block">
          &larr; Back to Directory
        </Link>
      </div>
    );
  }

  const handleVote = () => {
    if (id) {
      voteForBusiness(id);
    }
  };

  const hasVoted = id ? hasVotedFor(id) : false;

  return (
    <div className="bg-sandy-beige min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Image Carousel */}
          <div className="grid grid-cols-1 md:grid-cols-2">
              <img src={business.images[0]} alt={business.name} className="w-full h-96 object-cover"/>
              <img src={business.images[1]} alt={business.name} className="w-full h-96 object-cover hidden md:block"/>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <p className="text-ocean-blue font-bold">{business.category}</p>
                <h1 className="text-4xl font-bold text-charcoal-gray mt-2">{business.name}</h1>
                
                <div className="flex items-center mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-6 h-6 ${i < Math.round(business.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.367-2.447a1 1 0 00-1.175 0l-3.367 2.447c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
                    </svg>
                  ))}
                  <span className="text-gray-600 text-lg ml-2">{business.rating.toFixed(1)} / 5.0</span>
                </div>

                <p className="mt-6 text-lg text-gray-700 font-noto-sans leading-relaxed">{business.description}</p>
                
                {business.offers && (
                  <div className="mt-6 bg-green-100 border-l-4 border-tropical-green text-green-800 p-4 rounded-r-lg">
                    <p className="font-bold">{business.offers}</p>
                  </div>
                )}
                
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-charcoal-gray">Tags</h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {business.tags.map(tag => (
                      <span key={tag} className="bg-gray-200 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>

                {relatedEvents.length > 0 && (
                   <div className="mt-12">
                     <h3 className="text-2xl font-bold text-charcoal-gray">Upcoming Events at {business.name}</h3>
                     <div className="mt-4 space-y-4">
                        {relatedEvents.map(event => (
                            <div key={event.id} className="bg-sandy-beige p-4 rounded-lg">
                                <p className="font-bold text-tropical-green">{event.title}</p>
                                <p className="text-sm text-gray-700">{event.date} at {event.time}</p>
                                <p className="text-sm mt-1">{event.description}</p>
                            </div>
                        ))}
                     </div>
                   </div>
                )}
              </div>

              {/* Sidebar Info */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <h3 className="text-xl font-bold text-charcoal-gray border-b pb-2">Information</h3>
                  <div className="space-y-4 mt-4 text-gray-800">
                    <p><strong>Phone:</strong> {business.contact.phone}</p>
                    <p><strong>Email:</strong> {business.contact.email}</p>
                    {business.contact.website && <p><strong>Website:</strong> <a href={`https://${business.contact.website}`} target="_blank" rel="noreferrer" className="text-ocean-blue hover:underline">{business.contact.website}</a></p>}
                    <p><strong>Location:</strong> {business.location}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg border mt-6">
                   <h3 className="text-xl font-bold text-charcoal-gray border-b pb-2">Hours</h3>
                   <ul className="space-y-1 mt-4 text-gray-800">
                    {Object.entries(business.hours).map(([day, hours]) => (
                        <li key={day} className="flex justify-between">
                            <span>{day}</span>
                            <span>{hours}</span>
                        </li>
                    ))}
                   </ul>
                </div>
                {business.coordinates && (
                  <div className="bg-gray-50 p-6 rounded-lg border mt-6">
                    <h3 className="text-xl font-bold text-charcoal-gray border-b pb-4 mb-4">Location on Map</h3>
                    <MapView lat={business.coordinates.lat} lng={business.coordinates.lng} />
                  </div>
                )}
                {/* Community Voting Box */}
                <div className="bg-green-50 p-6 rounded-lg border border-tropical-green mt-6 text-center">
                    <h3 className="text-xl font-bold text-charcoal-gray">Community Love</h3>
                    <p className="text-5xl font-bold text-tropical-green my-3">{business.votes}</p>
                    <p className="text-gray-600 mb-4">Total Votes</p>
                    <button
                        onClick={handleVote}
                        disabled={hasVoted}
                        className="w-full px-6 py-3 bg-tropical-green text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        aria-live="polite"
                    >
                        {hasVoted ? 'Thank you for voting!' : 'Cast Your Vote'}
                    </button>
                    {hasVoted && <p className="text-xs text-gray-500 mt-2">You can vote for each business once per session.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetailPage;