

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ROUTES } from '../constants';
import { UpdatableBusinessData } from '../types';
import Spinner from '../components/Spinner';

const DashboardPage: React.FC = () => {
  const { t, isAuthenticated, currentUser, businesses, updateBusiness, events, addEvent, deleteEvent } = useAppContext();
  const navigate = useNavigate();
  
  const userBusiness = businesses.find(b => b.ownerId === currentUser?.id);
  const userEvents = events.filter(e => e.businessId === userBusiness?.id);
  
  const [profileData, setProfileData] = useState<UpdatableBusinessData>({ name: '', description: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  
  const [newEventData, setNewEventData] = useState({ title: '', date: '', time: '', description: '' });
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.AUTH);
    } else if (userBusiness) {
      setProfileData({
        name: userBusiness.name,
        description: userBusiness.description,
      });
    }
  }, [isAuthenticated, navigate, userBusiness]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userBusiness) return;
    setIsSavingProfile(true);
    setError('');
    try {
      await updateBusiness(userBusiness.id, profileData);
      setIsProfileSaved(true);
      setTimeout(() => setIsProfileSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };
  
  const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setNewEventData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddEvent = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!userBusiness) return;
      setIsAddingEvent(true);
      setError('');
      
      const { title, date, time, description } = newEventData;
      
      try {
          await addEvent({ title, date, time, description, businessId: userBusiness.id });
          setNewEventData({ title: '', date: '', time: '', description: '' }); // Clear form
      } catch (err: any) {
          setError(err.message || 'Failed to add event.');
      } finally {
          setIsAddingEvent(false);
      }
  };

  const handleDeleteEvent = async (eventId: string) => {
      if (window.confirm('Are you sure you want to delete this event?')) {
        setError('');
        try {
            await deleteEvent(eventId);
        } catch (err: any) {
            setError(err.message || 'Failed to delete event.');
        }
      }
  }

  if (!isAuthenticated || !currentUser) return null;

  return (
    <div className="bg-sandy-beige min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-charcoal-gray">{t('businessDashboard')}</h1>
          <p className="mt-2 text-lg text-gray-600 font-noto-sans">Welcome back, <span className="font-bold text-tropical-green">{currentUser.email}</span>!</p>
        </div>
        
        {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-md mb-6">{error}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-tropical-green border-b-2 border-tropical-green pb-2 mb-6">{t('manageProfile')}</h2>
            {userBusiness ? (
              <form className="space-y-4" onSubmit={handleSaveProfile}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('businessName')}</label>
                  <input type="text" id="name" name="name" value={profileData.name} onChange={handleProfileChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tropical-green focus:border-tropical-green" />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('businessDescription')}</label>
                  <textarea id="description" name="description" rows={4} value={profileData.description} onChange={handleProfileChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tropical-green focus:border-tropical-green"></textarea>
                </div>
                <div className="text-right flex items-center justify-end space-x-4">
                  {isProfileSaved && <p className="text-sm text-green-600 font-semibold transition-opacity duration-300">✓ {t('profileSaved')}</p>}
                  <button type="submit" disabled={isSavingProfile} className="px-6 py-2 bg-ocean-blue text-white rounded-md hover:bg-opacity-90 transition-colors disabled:bg-gray-400">
                    {isSavingProfile ? <Spinner /> : t('saveProfile')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">You haven't registered a business yet.</p>
                <button onClick={() => navigate(ROUTES.REGISTER_BUSINESS)} className="mt-4 px-6 py-2 bg-sunset-orange text-white rounded-md hover:bg-opacity-90 transition-colors">
                  Register Your Business Now
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-sunset-orange border-b-2 border-sunset-orange pb-2 mb-6">{t('manageEvents')}</h2>
            {userBusiness ? (<>
                <form className="space-y-4 mb-8" onSubmit={handleAddEvent}>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">{t('eventName')}</label>
                        <input type="text" name="title" id="title" placeholder="e.g., Live Jazz Night" required value={newEventData.title} onChange={handleEventFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sunset-orange focus:border-sunset-orange" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label htmlFor="date" className="block text-sm font-medium text-gray-700">{t('eventDateTime')}</label>
                           <input type="date" name="date" id="date" required value={newEventData.date} onChange={handleEventFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sunset-orange focus:border-sunset-orange" />
                       </div>
                       <div>
                           <label htmlFor="time" className="sr-only">Time</label>
                           <input type="time" name="time" id="time" required value={newEventData.time} onChange={handleEventFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sunset-orange focus:border-sunset-orange mt-6" />
                       </div>
                    </div>
                     <div>
                        <label htmlFor="eventDescription" className="block text-sm font-medium text-gray-700">{t('eventDescription')}</label>
                        <textarea name="description" id="eventDescription" rows={3} required value={newEventData.description} onChange={handleEventFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sunset-orange focus:border-sunset-orange"></textarea>
                    </div>
                    <div className="text-right">
                        <button type="submit" disabled={isAddingEvent} className="px-6 py-2 bg-sunset-orange text-white rounded-md hover:bg-opacity-90 transition-colors disabled:bg-gray-400">{isAddingEvent ? <Spinner /> : t('addEvent')}</button>
                    </div>
                </form>

                <h3 className="text-xl font-semibold text-charcoal-gray mb-4 pt-4 border-t">{t('currentEvents')}</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {userEvents.length > 0 ? userEvents.map(event => (
                        <div key={event.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <div>
                                <p className="font-semibold">{event.title}</p>
                                <p className="text-xs text-gray-500">{event.date} @ {event.time}</p>
                            </div>
                            <div>
                                <button onClick={() => handleDeleteEvent(event.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                            </div>
                        </div>
                    )) : <p className="text-gray-500 text-sm italic">No events created yet.</p>}
                </div>
            </>) : <p className="text-gray-500 text-sm italic text-center">Please register your business to manage events.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
