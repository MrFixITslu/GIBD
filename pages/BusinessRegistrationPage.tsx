import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Business, BusinessCategory } from '../types';
import { ROUTES } from '../constants';
import Spinner from '../components/Spinner';

const BusinessRegistrationPage: React.FC = () => {
  const { t, addBusiness, register } = useAppContext();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    category: BusinessCategory.RESTAURANT,
    description: '',
    phone: '',
    email: '',
    website: '',
    location: '',
    hours: '',
    tags: '',
  });
  const [authData, setAuthData] = useState({
    userEmail: '',
    password: '',
    confirmPassword: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuthData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
         setImageFile(null);
         setImagePreview(null);
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (authData.password !== authData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (authData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }

    setIsLoading(true);
    
    try {
      // 1. Register the user, which also logs them in and sets the token
      await register(authData.userEmail, authData.password);

      // 2. Prepare the business data
      const newBusinessData: Omit<Business, 'id' | 'rating' | 'votes' | 'ownerId'> = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        contact: {
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
        },
        location: formData.location,
        coordinates: undefined, // Let backend handle geocoding if needed
        hours: { 'Mon-Sun': formData.hours || 'Not specified' },
        images: [imagePreview || 'https://picsum.photos/seed/new-business-default/800/600', 'https://picsum.photos/seed/new-business-placeholder/800/600'],
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      // 3. Add the business (the token is handled by AppContext/api.ts)
      await addBusiness(newBusinessData);
      
      // 4. Redirect to the dashboard
      navigate(ROUTES.DASHBOARD);

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during registration.');
      setIsLoading(false);
    }
  };


  return (
    <div className="bg-sandy-beige min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-charcoal-gray">{t('registerYourBusiness')}</h1>
            <p className="mt-2 text-lg text-gray-600 font-noto-sans">{t('growWithUs')}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <fieldset className="border-t-2 border-sunset-orange pt-6">
                <legend className="text-xl font-bold text-charcoal-gray px-2">{t('createOwnerAccount')}</legend>
                <div className="space-y-6 mt-4">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                             <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700">{t('email')}</label>
                            <input type="email" name="userEmail" id="userEmail" required value={authData.userEmail} onChange={handleAuthChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sunset-orange focus:border-sunset-orange" />
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="password"className="block text-sm font-medium text-gray-700">{t('password')}</label>
                            <input type="password" name="password" id="password" required value={authData.password} onChange={handleAuthChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sunset-orange focus:border-sunset-orange" />
                        </div>
                         <div className="md:col-span-1">
                            <label htmlFor="confirmPassword"className="block text-sm font-medium text-gray-700">{t('confirmPassword')}</label>
                            <input type="password" name="confirmPassword" id="confirmPassword" required value={authData.confirmPassword} onChange={handleAuthChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sunset-orange focus:border-sunset-orange" />
                        </div>
                    </div>
                </div>
            </fieldset>

            <fieldset className="border-t-2 border-tropical-green pt-6">
                <legend className="text-xl font-bold text-charcoal-gray px-2">Business Details</legend>
                 <div className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('businessName')}</label>
                            <input type="text" name="name" id="name" required value={formData.name} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tropical-green focus:border-tropical-green" />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">{t('businessCategory')}</label>
                            <select name="category" id="category" required value={formData.category} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-tropical-green focus:border-tropical-green">
                                {Object.values(BusinessCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('businessDescription')}</label>
                        <textarea name="description" id="description" rows={4} required value={formData.description} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tropical-green focus:border-tropical-green"></textarea>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t('contactPhone')}</label>
                            <input type="tel" name="phone" id="phone" required value={formData.phone} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tropical-green focus:border-tropical-green" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('contactEmail')}</label>
                            <input type="email" name="email" id="email" required value={formData.email} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tropical-green focus:border-tropical-green" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700">{t('website')}</label>
                            <input type="url" name="website" id="website" placeholder="https://example.com" value={formData.website} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tropical-green focus:border-tropical-green" />
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">{t('locationAddress')}</label>
                            <input type="text" name="location" id="location" required value={formData.location} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tropical-green focus:border-tropical-green" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('businessLogo')}</label>
                        <div className="mt-2 flex items-center space-x-6">
                            <span className="inline-block h-24 w-24 rounded-lg overflow-hidden bg-gray-100 ring-2 ring-offset-2 ring-sandy-beige">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Business Logo Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <svg className="h-12 w-12 text-gray-300" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                            </span>
                            <label htmlFor="file-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tropical-green">
                                <span>{imagePreview ? t('changeImage') : t('uploadImage')}</span>
                                <input id="file-upload" name="image" type="file" className="sr-only" accept="image/png, image/jpeg" onChange={handleImageChange} />
                            </label>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">{t('tags')}</label>
                        <input type="text" name="tags" id="tags" placeholder="e.g. live music, family friendly" required value={formData.tags} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tropical-green focus:border-tropical-green" />
                    </div>
                    </div>
                </div>
            </fieldset>

            {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
            
            <div className="text-center pt-4">
              <button type="submit" disabled={isLoading} className="w-full md:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sunset-orange hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sunset-orange disabled:bg-gray-400">
                {isLoading ? <Spinner /> : t('submitRegistration')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessRegistrationPage;