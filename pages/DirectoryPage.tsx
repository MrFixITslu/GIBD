import React, { useState, useMemo } from 'react';
import { Business, BusinessCategory } from '../types';
import BusinessCard from '../components/BusinessCard';
import { useAppContext } from '../context/AppContext';
import RegisterBusinessCTA from '../components/RegisterBusinessCTA';

const DirectoryPage: React.FC = () => {
  const { t, businesses } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | 'all'>('all');

  const filteredBusinesses = useMemo(() => {
    return businesses.filter(business => {
      const matchesCategory = selectedCategory === 'all' || business.category === selectedCategory;
      const matchesSearch =
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory, businesses]);
  
  const categories = Object.values(BusinessCategory);

  return (
    <div className="bg-sandy-beige min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-charcoal-gray">{t('directory')}</h1>
          <p className="mt-2 text-lg text-gray-600 font-noto-sans">{t('heroSubtitle')}</p>
        </div>

        {/* Register Business CTA */}
        <RegisterBusinessCTA />

        {/* Search and Filter Controls */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8 sticky top-20 z-40">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="search" className="sr-only">{t('searchPlaceholder')}</label>
              <input
                type="text"
                id="search"
                placeholder={t('searchPlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-blue focus:border-ocean-blue transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="category" className="sr-only">{t('filterByCategory')}</label>
              <select
                id="category"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-ocean-blue focus:border-ocean-blue transition"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as BusinessCategory | 'all')}
              >
                <option value="all">{t('allCategories')}</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Business Grid */}
        {filteredBusinesses.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBusinesses.map(business => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">No businesses found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectoryPage;