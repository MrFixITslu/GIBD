
import React from 'react';
import { Link } from 'react-router-dom';
import { Business } from '../types';

interface BusinessCardProps {
  business: Business;
}

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.367-2.447a1 1 0 00-1.175 0l-3.367 2.447c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
    </svg>
);


const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out">
      <Link to={`/business/${business.id}`} className="block">
        <img className="w-full h-48 object-cover" src={business.images[0]} alt={business.name} />
        <div className="p-4">
          <p className="text-sm text-ocean-blue font-semibold">{business.category}</p>
          <h3 className="text-lg font-bold text-charcoal-gray mt-1 truncate">{business.name}</h3>
          <p className="text-gray-600 text-sm mt-2 h-10 overflow-hidden">{business.description}</p>
          <div className="flex items-center mt-4">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} filled={i < Math.round(business.rating)} />
            ))}
            <span className="text-gray-600 text-sm ml-2">{business.rating.toFixed(1)}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default BusinessCard;
