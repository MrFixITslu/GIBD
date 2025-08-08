
import React from 'react';
import { Business } from '../types';
import Card, { CardImage, CardBody } from './ui/Card';

interface BusinessCardProps {
  business: Business;
}

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg className={`w-4 h-4 ${filled ? 'text-warning-400' : 'text-neutral-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.367-2.447a1 1 0 00-1.175 0l-3.367 2.447c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
    </svg>
);

const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  return (
    <Card href={`/business/${business.id}`} interactive elevation="md" className="group">
      <CardImage 
        src={business.images[0] || '/placeholder-business.jpg'} 
        alt={business.name}
        aspectRatio="video"
        className="group-hover:scale-105 transition-transform duration-300"
      />
      <CardBody className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            {business.category}
          </span>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} filled={i < Math.round(business.rating)} />
            ))}
            <span className="text-sm text-neutral-600 ml-1 font-medium">
              {business.rating.toFixed(1)}
            </span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-neutral-900 truncate group-hover:text-primary-700 transition-colors">
          {business.name}
        </h3>
        
        <p className="text-sm text-neutral-600 leading-relaxed overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {business.description}
        </p>
        
        {business.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {business.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700"
              >
                {tag}
              </span>
            ))}
            {business.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-500">
                +{business.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default BusinessCard;
