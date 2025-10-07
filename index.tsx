import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { Search, Star, MapPin, Calendar, Phone, Mail, Globe, Clock, Filter, Plus, User, Building, Award, Heart, Share2, Menu, X, BookOpen, Camera, Newspaper, Archive, ChevronRight, Wrench, Upload, Edit, BedDouble, Car, Wifi, Zap, Wind, Flag, LogIn, Sparkles, Bell, LayoutGrid, List, MessageSquare, Users, Briefcase, Info, Facebook, Instagram, Twitter, Send, LayoutDashboard, Map, BarChart2, Trash2, ChevronsUpDown, Check, AlertCircle } from 'lucide-react';
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';

declare var L: any;
declare var pannellum: any;

// --- TYPE DEFINITIONS ---
interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

interface LoyaltyProgram {
  enabled: boolean;
  offer?: string;
  goal?: number;
}

interface Socials {
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
}

interface BaseItem {
  id: number;
  name?: string;
  title?: string;
  description?: string;
  image?: string;
  images?: string[];
  favorited: boolean;
  verified?: boolean;
  rating?: number;
  reviewCount?: number;
  reviews?: Review[];
  bookingEnabled?: boolean;
  latitude?: number;
  longitude?: number;
}

interface Business extends BaseItem {
  name: string;
  category: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string;
  location: string;
  hours: string;
  featured: boolean;
  tags: string[];
  ownerId: number | null;
  tourImage: string | null;
  loyaltyProgram: LoyaltyProgram;
  socials: Socials;
}

interface Event extends BaseItem {
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  organizer: string;
  attendees: number;
  featured: boolean;
  type: 'event';
}

interface HistoricalContent extends BaseItem {
  title: string;
  type: 'history';
  category: string;
  era: string;
  sortYear: number;
  content: string;
  author: string;
  dateAdded: string;
  sources: string[];
  relatedBusinesses: number[];
  tags: string[];
}

interface News extends BaseItem {
  type: 'alert' | 'article';
  title: string;
  category: string;
  date: string;
  summary: string;
  content: string;
  author: string;
  source: string;
  tags: string[];
  relatedBusinesses: number[];
}

interface SkilledWorker extends BaseItem {
  name: string;
  skill: string;
  experience: number;
  phone: string;
  email: string | null;
  availability: string;
  location: string;
  type: 'worker';
}

interface Accommodation extends BaseItem {
  name: string;
  type: string;
  location: string;
  pricePerNight: number;
  amenities: string[];
  tourImage: string | null;
}

interface Taxi extends BaseItem {
  driverName: string;
  vehicleType: string;
  plateNumber: string;
  phone: string;
  description: string;
}

interface CommunityForum {
  id: number;
  title: string;
  author: string;
  date: string;
  content: string;
  replies: {
    id: number;
    author: string;
    date: string;
    content: string;
  }[];
}

interface Booking {
  id: number;
  type: string;
  itemId: number;
  itemName: string;
  date: string;
  time: string;
  details: string;
}

interface User {
  id: number;
  username: string;
  pin: string;
  type: 'owner' | 'user' | 'admin';
  email: string;
  favorites: { id: number; type: string; }[];
  loyalty: { [key: number]: { progress: number } };
  bookings: Booking[];
}

interface AppData {
  businesses: Business[];
  events: Event[];
  historicalContent: HistoricalContent[];
  news: News[];
  skilledWorkers: SkilledWorker[];
  accommodations: Accommodation[];
  taxis: Taxi[];
  communityForums: CommunityForum[];
}

interface AddFormData {
  name?: string;
  description?: string;
  image?: string;
  category?: string;
  phone?: string;
  address?: string;
  hours?: string;
  tags?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  loyaltyEnabled?: boolean;
  loyaltyOffer?: string;
  loyaltyGoal?: number | string;
  skill?: string;
  experience?: number | string;
  availability?: string;
  location?: string;
  type?: string;
  pricePerNight?: number | string;
  amenities?: string;
  driverName?: string;
  vehicleType?: string;
  plateNumber?: string;
}

interface RecsResponse {
  grosIslet: { id: number; name: string; reason: string; }[];
  stLucia: { id: number; name: string; location: string; reason: string; }[];
}

// Mock data
const initialBusinesses: Business[] = [
  { id: 1, name: "Mama's Kitchen", category: "Restaurant", description: "Authentic St. Lucian cuisine with the best callaloo soup in Gros-Islet", rating: 4.5, reviewCount: 2, phone: "+1-758-452-1234", email: "mamas@example.com", website: "https://www.mamaskitchen.lc", address: "Bay Street, Gros-Islet", location: "Gros-Islet", hours: "Mon-Sat 11AM-10PM", featured: true, verified: true, image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop", tags: ["Local Favorite", "Family Owned", "Authentic"], favorited: false, ownerId: 1, tourImage: null, loyaltyProgram: { enabled: true, offer: "Buy 5 meals, get 1 free!", goal: 5 }, bookingEnabled: true, socials: { facebook: 'https://facebook.com/mamaskitchenslu', instagram: 'https://instagram.com/mamaskitchenslu', twitter: null }, reviews: [
    { id: 101, author: 'Jane Doe', rating: 5, comment: 'Absolutely amazing food! The callaloo soup is a must-try. Felt like a home-cooked meal.', date: '2025-09-10' },
    { id: 102, author: 'Mark T.', rating: 4, comment: 'Great local spot with a friendly atmosphere. Portions are generous. A bit of a wait on Friday nights, but worth it.', date: '2025-09-08' },
  ], latitude: 14.0775, longitude: -60.9525},
  { id: 2, name: "Island Auto Repair", category: "Automotive", description: "Reliable car service and repairs. 20+ years serving the community", rating: 5.0, reviewCount: 1, phone: "+1-758-452-5678", email: "repair@islandauto.lc", website: null, address: "Industrial Road, Gros-Islet", location: "Gros-Islet", hours: "Mon-Fri 8AM-6PM, Sat 8AM-2PM", featured: false, verified: true, image: "https://images.unsplash.com/photo-1599493356649-50b435271926?w=400&h=300&fit=crop", tags: ["Certified", "Local Expert"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: 'https://facebook.com/islandautorepair', instagram: null, twitter: null }, reviews: [
    { id: 201, author: 'Chris G.', rating: 5, comment: 'Fixed my car quickly and for a fair price. Very professional and trustworthy service.', date: '2025-08-20' }
  ], latitude: 14.0720, longitude: -60.9510},
  { id: 3, name: "Sunset Beach Resort", category: "Tourism", description: "Beachfront accommodation with stunning views of Rodney Bay", rating: 4.7, reviewCount: 3, phone: "+1-758-452-9999", email: "info@sunsetbeach.lc", website: "https://www.sunsetbeach.lc", address: "Reduit Beach, Gros-Islet", location: "Gros-Islet", hours: "24/7 Reception", featured: true, verified: true, image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop", tags: ["Premium", "Beachfront", "Tourist Favorite"], favorited: false, ownerId: null, tourImage: "https://pannellum.org/images/cerro-toco-01.jpg", loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: 'https://facebook.com/sunsetbeachresort', instagram: 'https://instagram.com/sunsetbeachresort', twitter: 'https://twitter.com/sunsetbeachslu' }, reviews: [
    { id: 301, author: 'Samantha V.', rating: 5, comment: 'Paradise on earth! The views are breathtaking and the staff is incredibly welcoming. Can\'t wait to come back.', date: '2025-09-05' },
    { id: 302, author: 'David L.', rating: 5, comment: 'Top-notch resort. The rooms are beautiful, clean, and modern. Loved the beachfront access.', date: '2025-09-02' },
    { id: 303, author: 'Angela M.', rating: 4, comment: 'A wonderful stay. The food at the restaurant was a bit pricey, but the quality was excellent. The beach is perfect.', date: '2025-08-28' },
  ], latitude: 14.0758, longitude: -60.9520},
  { id: 4, name: "Pigeon Island National Landmark", category: "Tourism", description: "A 44-acre islet and historic park with military ruins, hiking trails, and two beaches.", rating: 4.7, reviewCount: 580, phone: "+1-758-452-5005", email: "info@slunatrust.org", website: "www.slunatrust.org/pigeon-island", address: "Pigeon Island Causeway, Gros-Islet", location: "Gros-Islet", hours: "Daily 9:30AM-5:00PM", featured: true, verified: true, image: "https://images.unsplash.com/photo-1620027814495-20a2a4b8686c?w=400&h=300&fit=crop", tags: ["Historic Site", "Hiking", "Beach", "Must-See"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: null, instagram: null, twitter: null }, reviews: [], latitude: 14.090, longitude: -60.963 },
  { id: 5, name: "Reduit Beach", category: "Tourism", description: "One of St. Lucia's longest and most popular beaches, with a golden sand, calm waters, and numerous water sports.", rating: 4.8, reviewCount: 720, phone: null, email: null, website: null, address: "Reduit Beach Avenue, Rodney Bay", location: "Gros-Islet", hours: "Open 24/7", featured: true, verified: true, image: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=400&h=300&fit=crop", tags: ["Popular Beach", "Water Sports", "Family Friendly"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: null, instagram: null, twitter: null }, reviews: [], latitude: 14.076, longitude: -60.952 },
  { id: 6, name: "Massy Stores Supermarket", category: "Shopping", description: "Large, modern supermarket offering a wide selection of groceries, fresh produce, local products, and household items.", rating: 4.4, reviewCount: 150, phone: "+1-758-457-2000", email: "rodneybay@massystores.com", website: "www.massystores.com/lc", address: "Baywalk Shopping Mall, Rodney Bay", location: "Gros-Islet", hours: "Mon-Sat 8AM-9PM, Sun 9AM-2PM", featured: false, verified: true, image: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=400&h=300&fit=crop", tags: ["Groceries", "Bakery", "Pharmacy Inside"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: null, instagram: null, twitter: null }, reviews: [], latitude: 14.074, longitude: -60.950 },
  { id: 7, name: "Gros-Islet Polyclinic", category: "Health", description: "Public health facility providing general medical services, emergency care, and specialized clinics to the community.", rating: 4.2, reviewCount: 45, phone: "+1-758-450-9600", email: null, website: null, address: "Gros-Islet Highway, Gros-Islet", location: "Gros-Islet", hours: "Mon-Fri 8AM-4:30PM (Emergency 24/7)", featured: false, verified: true, image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=300&fit=crop", tags: ["Public Health", "Emergency Care", "Clinic"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: null, instagram: null, twitter: null }, reviews: [], latitude: 14.078, longitude: -60.951 },
  { id: 8, name: "M&C Pharmacy", category: "Health", description: "Well-stocked pharmacy offering prescription medications, over-the-counter drugs, personal care items, and health advice.", rating: 4.5, reviewCount: 62, phone: "+1-758-457-3155", email: "pharmacy.baywalk@mandcgroup.com", website: "www.mandcgroup.com", address: "Baywalk Shopping Mall, Rodney Bay", location: "Gros-Islet", hours: "Mon-Sat 9AM-7PM", featured: false, verified: true, image: "https://images.unsplash.com/photo-1576671081833-0935a4a98938?w=400&h=300&fit=crop", tags: ["Prescriptions", "Health & Wellness", "Personal Care"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: null, instagram: null, twitter: null }, reviews: [], latitude: 14.0741, longitude: -60.9501 },
  { id: 9, name: "Gros Islet Infant School", category: "Education", description: "Nurturing young minds through play-based learning and early childhood education.", rating: 4.7, reviewCount: 35, phone: "+1-758-450-8651", email: "gi.infant@education.gov.lc", website: null, address: "Marie Therese Street, Gros-Islet", location: "Gros-Islet", hours: "Mon-Fri 8:30AM-2:30PM", featured: false, verified: true, image: "https://images.unsplash.com/photo-1580582932707-520aed93a94d?w=400&h=300&fit=crop", tags: ["Early Childhood", "Public School", "Infant"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: null, instagram: null, twitter: null }, reviews: [], latitude: 14.079, longitude: -60.954 },
  { id: 10, name: "Gros Islet Primary School", category: "Education", description: "Providing quality primary education to the children of Gros-Islet for over 50 years.", rating: 4.6, reviewCount: 58, phone: "+1-758-450-8650", email: "gi.primary@education.gov.lc", website: null, address: "Marie Therese Street, Gros-Islet", location: "Gros-Islet", hours: "Mon-Fri 8:30AM-3:00PM", featured: true, verified: true, image: "https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=400&h=300&fit=crop", tags: ["Primary Education", "Public School", "Community"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: null, instagram: null, twitter: null }, reviews: [], latitude: 14.0791, longitude: -60.9541 },
  { id: 11, name: "Dame Pearlette Louisy Primary", category: "Education", description: "A modern primary school focused on holistic development and academic excellence.", rating: 4.8, reviewCount: 42, phone: "+1-758-450-1234", email: "dpl.primary@education.gov.lc", website: null, address: "Union, Gros-Islet", location: "Gros-Islet", hours: "Mon-Fri 8:30AM-3:00PM", featured: false, verified: true, image: "https://images.unsplash.com/photo-1607595339324-c7b5724e53b4?w=400&h=300&fit=crop", tags: ["Primary Education", "Public School", "Academic Excellence"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: null, instagram: null, twitter: null }, reviews: [], latitude: 14.060, longitude: -60.955 },
  { id: 12, name: "The Montessori School St. Lucia", category: "Education", description: "Private school offering a child-centered educational approach based on Montessori principles.", rating: 4.9, reviewCount: 25, phone: "+1-758-452-8533", email: "info@montessoristlucia.com", website: "www.montessoristlucia.com", address: "Rodney Heights, Gros-Islet", location: "Gros-Islet", hours: "Mon-Fri 8:00AM-3:30PM", featured: false, verified: true, image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop", tags: ["Private School", "Montessori", "Early & Primary"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: null, instagram: null, twitter: null }, reviews: [], latitude: 14.070, longitude: -60.945 },
  { id: 13, name: "Gros-Islet Roman Catholic Church", category: "Community", description: "A historic and central place of worship and community gathering in the heart of Gros-Islet.", rating: 4.6, reviewCount: 75, phone: "+1-758-450-8652", email: null, website: null, address: "Church Street, Gros-Islet", location: "Gros-Islet", hours: "Mass on Sundays 8AM & 10AM", featured: false, verified: true, image: "https://images.unsplash.com/photo-1508349937151-22b68b72d5b1?w=400&h=300&fit=crop", tags: ["Worship", "Community Center", "Historic"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: null, instagram: null, twitter: null }, reviews: [], latitude: 14.078, longitude: -60.953 },
  { id: 14, name: "Darren Sammy Cricket Ground", category: "Sports & Rec", description: "The premier cricket venue in St. Lucia, hosting international and regional matches. Also known as Beausejour Cricket Ground.", rating: 4.8, reviewCount: 320, phone: null, email: null, website: null, address: "Beausejour, Gros-Islet", location: "Gros-Islet", hours: "Varies by event schedule", featured: true, verified: true, image: "https://images.unsplash.com/photo-1599587122399-59842217181b?w=400&h=300&fit=crop", tags: ["Cricket", "International Matches", "Events Venue"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: null, instagram: null, twitter: null }, reviews: [], latitude: 14.083, longitude: -60.948 },
  { id: 15, name: "Rodney Bay Yacht Club", category: "Sports & Rec", description: "A vibrant club for sailing enthusiasts, offering races, regattas, and social events.", rating: 4.7, reviewCount: 95, phone: "+1-758-452-8350", email: "info@rbyc.org", website: "www.rbyc.org", address: "Rodney Bay Marina, Gros-Islet", location: "Gros-Islet", hours: "Varies", featured: false, verified: true, image: "https://images.unsplash.com/photo-1567899378494-47b22a2f94a2?w=400&h=300&fit=crop", tags: ["Sailing", "Marina", "Social Events"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: null, instagram: null, twitter: null }, reviews: [], latitude: 14.075, longitude: -60.948 },
  { id: 16, name: "Verge Restaurant and Bar", category: "Nightlife", description: "A popular spot on the Rodney Bay strip for late-night drinks, music, and dancing.", rating: 4.5, reviewCount: 180, phone: "+1-758-452-8374", email: null, website: null, address: "Reduit Beach Ave, Rodney Bay", location: "Gros-Islet", hours: "Daily 6PM-Late", featured: true, verified: true, image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop", tags: ["Live Music", "DJs", "Cocktails"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: true, socials: { facebook: null, instagram: null, twitter: null }, reviews: [], latitude: 14.0751, longitude: -60.9511 },
  { id: 17, name: "Gros-Islet Youth Development Council", category: "Community", description: "A non-profit organization focused on empowering the youth of Gros-Islet through sports, education, and mentorship programs.", rating: 4.9, reviewCount: 30, phone: null, email: "giyouth@gmail.com", website: null, address: "Community Centre, Gros-Islet", location: "Gros-Islet", hours: "Varies", featured: false, verified: false, image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop", tags: ["Youth Program", "Non-Profit", "Empowerment"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: null, instagram: null, twitter: null }, reviews: [], latitude: 14.078, longitude: -60.952 },
  { id: 18, name: "Ultra Lounge", category: "Nightlife", description: "Modern and stylish nightclub offering a premium experience with VIP sections and international DJs.", rating: 4.3, reviewCount: 110, phone: "+1-758-458-2000", email: null, website: null, address: "Baywalk Shopping Mall, Rodney Bay", location: "Gros-Islet", hours: "Fri-Sat 10PM-4AM", featured: false, verified: true, image: "https://images.unsplash.com/photo-1578736641330-3155e606b377?w=400&h=300&fit=crop", tags: ["VIP", "Modern", "Late Night"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: null, instagram: null, twitter: null }, reviews: [], latitude: 14.0742, longitude: -60.9502 },
  { id: 19, name: "The Naked Fisherman", category: "Restaurant", description: "Barefoot luxury dining on the beach. Fresh seafood, grilled specialties, and stunning sunset views at Cap Maison.", rating: 4.8, reviewCount: 2, phone: "+1-758-457-8653", email: "reservations@capmaison.com", website: "https://www.capmaison.com/dining", address: "Cap Maison Resort, Smugglers Cove Drive", location: "Gros-Islet", hours: "Daily 12PM-10PM", featured: true, verified: true, image: "https://images.unsplash.com/photo-1559329022-13735359254f?w=400&h=300&fit=crop", tags: ["Fine Dining", "Beachfront", "Seafood", "Romantic"], favorited: false, ownerId: null, tourImage: "https://pannellum.org/images/alma.jpg", loyaltyProgram: { enabled: false }, bookingEnabled: true, socials: { facebook: null, instagram: 'https://instagram.com/capmaison', twitter: null }, reviews: [
    { id: 401, author: 'Emily R.', rating: 5, comment: 'An unforgettable dining experience. The location is breathtaking and the food was exquisite. The grilled fish was perfect.', date: '2025-09-11' },
    { id: 402, author: 'James P.', rating: 4, comment: 'Absolutely beautiful setting. It is pricey, but worth it for a special occasion. Service was impeccable.', date: '2025-09-07' }
  ], latitude: 14.095, longitude: -60.950 },
  { id: 20, name: "Coconutz", category: "Nightlife", description: "Lively bar with daily happy hours, sports on TV, and a mix of locals and tourists. Famous for their rum punch.", rating: 4.4, reviewCount: 1, phone: "+1-758-452-0712", email: null, website: null, address: "Reduit Beach Ave, Rodney Bay", location: "Gros-Islet", hours: "Daily 11AM-Late", featured: false, verified: true, image: "https://images.unsplash.com/photo-1563480164872-5b9381355069?w=400&h=300&fit=crop", tags: ["Bar", "Happy Hour", "Sports", "Casual"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: true, offer: "Get your 10th rum punch on us!", goal: 10 }, bookingEnabled: false, socials: { facebook: null, instagram: null, twitter: null }, reviews: [
    { id: 501, author: 'Mike S.', rating: 4, comment: 'Fun place to hang out and watch a game. Drinks are strong and reasonably priced. Gets very busy on weekends.', date: '2025-09-09' }
  ], latitude: 14.0752, longitude: -60.9512 },
  { id: 21, name: "Island Mix Art Emporium", category: "Shopping", description: "A vibrant gallery and shop showcasing the best of St. Lucian art, craft, and fashion. Perfect for unique souvenirs.", rating: 4.9, reviewCount: 1, phone: "+1-758-452-0712", email: "islandmix@candw.lc", website: null, address: "Rodney Bay Marina, Gros-Islet", location: "Gros-Islet", hours: "Mon-Sat 9AM-5PM", featured: false, verified: true, image: "https://images.unsplash.com/photo-1510021239246-17c3c5520894?w=400&h=300&fit=crop", tags: ["Art Gallery", "Local Crafts", "Souvenirs", "Fashion"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: null, instagram: null, twitter: null }, reviews: [
    { id: 601, author: 'Sarah L.', rating: 5, comment: 'A treasure trove of beautiful, authentic St. Lucian art. The owner was so friendly and knowledgeable. I found the perfect gifts here.', date: '2025-09-06' }
  ], latitude: 14.0753, longitude: -60.9483 },
  { id: 22, name: "Baywalk Shopping Mall", category: "Shopping", description: "The premier shopping destination in St. Lucia, featuring a wide range of international and local stores, a supermarket, cinema, and dining options.", rating: 4.5, reviewCount: 1, phone: "+1-758-452-8888", email: "info@baywalkslu.com", website: "www.baywalkslu.com", address: "Rodney Bay, Gros-Islet", location: "Gros-Islet", hours: "Mon-Sat 9AM-7PM", featured: true, verified: true, image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&h=300&fit=crop", tags: ["Shopping Mall", "Retail", "Cinema", "Food Court"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: 'https://facebook.com/baywalkshoppingmall', instagram: 'https://instagram.com/baywalkshoppingmall', twitter: null }, reviews: [
    { id: 701, author: 'David K.', rating: 4, comment: 'A modern, clean mall with a great selection of stores. The food court has good options and it\'s fully air-conditioned which is a huge plus.', date: '2025-09-10' }
  ], latitude: 14.074, longitude: -60.950 },
  { id: 23, name: "Sulphur Springs Park", category: "Tourism", location: "Soufrière", description: "The Caribbean's only drive-in volcano. Experience the mud baths and see the steaming fumaroles.", rating: 4.6, reviewCount: 2100, phone: "+1-758-459-7565", email: "info@sulphursprings.lc", website: "www.sulphursprings.lc", address: "Sulphur Springs Access Rd, Soufrière", hours: "Daily 9AM-5PM", featured: true, verified: true, image: "https://images.unsplash.com/photo-1599529398835-f48d3c54c303?w=400&h=300&fit=crop", tags: ["Must-See", "Volcano", "Mud Bath", "Natural Wonder"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: null, instagram: null, twitter: null }, reviews: [], latitude: 13.834, longitude: -61.050 },
  { id: 24, name: "The Pitons", category: "Tourism", location: "Soufrière", description: "Two majestic volcanic spires, Gros Piton and Petit Piton, are a UNESCO World Heritage site. Hiking tours available.", rating: 4.9, reviewCount: 3500, phone: null, email: null, website: null, address: "Between Soufrière and Choiseul", hours: "Open 24/7 (Tours recommended during daytime)", featured: true, verified: true, image: "https://images.unsplash.com/photo-1579892211942-7a72d7315147?w=400&h=300&fit=crop", tags: ["UNESCO", "Hiking", "Iconic Landmark", "Scenery"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: null, instagram: null, twitter: null }, reviews: [], latitude: 13.805, longitude: -61.066 },
  { id: 25, name: "Dasheene Restaurant at Ladera", category: "Restaurant", location: "Soufrière", description: "Award-winning cuisine with an unforgettable, open-air view of the Pitons between its peaks.", rating: 4.8, reviewCount: 450, phone: "+1-758-459-6623", email: "reservations@ladera.com", website: "www.ladera.com/dining/dasheene", address: "Ladera Resort, Soufrière", hours: "Daily 7AM-10PM", featured: true, verified: true, image: "https://images.unsplash.com/photo-1505275350444-8363bb5e4844?w=400&h=300&fit=crop", tags: ["Fine Dining", "Romantic", "Stunning Views", "Luxury"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: true, socials: { facebook: null, instagram: null, twitter: null }, reviews: [], latitude: 13.820, longitude: -61.069 },
  { id: 26, name: "Castries Market", category: "Shopping", location: "Castries", description: "A bustling and historic market, offering fresh produce, spices, local crafts, and a taste of St. Lucian daily life.", rating: 4.5, reviewCount: 880, phone: null, email: null, website: null, address: "Jeremie Street, Castries", hours: "Mon-Sat 6AM-5PM", featured: false, verified: true, image: "https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?w=400&h=300&fit=crop", tags: ["Local Culture", "Market", "Souvenirs", "Fresh Produce"], favorited: false, ownerId: null, tourImage: null, loyaltyProgram: { enabled: false }, bookingEnabled: false, socials: { facebook: null, instagram: null, twitter: null }, reviews: [], latitude: 14.011, longitude: -60.989 },
];

const initialEvents: Event[] = [
  { id: 1001, title: "Gros-Islet Friday Night Street Party", date: "2025-09-12", time: "19:00", location: "Gros-Islet", latitude: 14.0775, longitude: -60.9525, category: "Culture", description: "Weekly street party with local food, music, and dancing", organizer: "Gros-Islet Tourism Board", attendees: 450, image: "https://images.unsplash.com/photo-1514525253161-7a4med19cd819?w=400&h=300&fit=crop", featured: true, favorited: false, type: 'event' },
  { id: 1002, title: "Local Farmers Market", date: "2025-09-14", time: "06:00", location: "Gros-Islet", latitude: 14.0768, longitude: -60.9530, category: "Market", description: "Fresh local produce, spices, and handmade crafts", organizer: "Gros-Islet Farmers Association", attendees: 120, image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop", featured: false, favorited: false, type: 'event' }
];

const initialHistoricalContent: HistoricalContent[] = [
  { id: 2001, title: "The Origins of Gros-Islet's Friday Night Street Festival", type: "history", category: "Culture & Tradition", era: "1980s-Present", sortYear: 1980, description: "How a small community gathering became the Caribbean's most famous street party", content: "The Friday Night Street Festival began in the 1980s as a small community gathering where locals would come together after the week's work. What started as friends sharing food and playing dominoes has evolved into one of the Caribbean's most vibrant cultural experiences...", images: ["https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=400&fit=crop"], author: "Marie-Claire Joseph", dateAdded: "2025-001-15", sources: ["Gros-Islet Cultural Heritage Foundation", "St. Lucia Tourism Authority Archives"], relatedBusinesses: [1], tags: ["Street Festival", "Cultural Heritage", "Tourism", "Community"], favorited: false },
  { id: 2002, title: "The Fishing Heritage of Gros-Islet Bay", type: "history", category: "Maritime Heritage", era: "1700s-Present", sortYear: 1700, description: "From Amerindian fishing grounds to modern marina - the evolution of our bay", content: "Long before European settlement, the Kalinago people recognized Gros-Islet Bay as prime fishing waters. The natural harbor provided shelter for their canoes and abundant marine life. Today's Rodney Bay Marina stands where generations of fishermen launched their boats at dawn...", images: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop"], author: "Captain John Baptiste", dateAdded: "2025-01-10", sources: ["Kalinago Heritage Research", "Maritime Museum of St. Lucia"], relatedBusinesses: [], tags: ["Fishing", "Kalinago", "Maritime", "Traditional"], favorited: false },
  { id: 2003, title: "Fort Rodney and the Battle of the Saints", type: "history", category: "Military History", era: "1778-1782", sortYear: 1778, description: "The strategic importance of Pigeon Island and its role in the famous naval battle.", content: "In the late 18th century, the British fortified Pigeon Island, building Fort Rodney. Its vantage point over the St. Lucia channel was crucial. From here, Admiral Rodney monitored the French fleet in Martinique, leading to the decisive British victory at the Battle of the Saints in 1782...", images: ["https://images.unsplash.com/photo-1579524177038-50e3323c6f05?w=500&h=400&fit=crop"], author: "Dr. Allen Fins", dateAdded: "2025-02-01", sources: ["National Trust Archives"], relatedBusinesses: [4], tags: ["Military", "History", "Pigeon Island", "Naval Battle"], favorited: false }
];

const initialNews: News[] = [
  { id: 3003, type: 'alert', title: "Road Closure Notice: Rodney Bay Main Road", category: "Community Alert", date: "2025-09-11", summary: "The main road through Rodney Bay will be closed for repaving from 10 PM Friday to 5 AM Monday.", content: "The Ministry of Infrastructure wishes to advise the public of a full road closure along the Rodney Bay main road, from the Baywalk Mall roundabout to the Coco Palm hotel entrance. The closure is scheduled for this weekend to facilitate urgent road resurfacing. Motorists are advised to use the back roads via Monchy. We apologize for any inconvenience caused.", author: "Ministry of Infrastructure", source: "Gov.lc", image: "https://images.unsplash.com/photo-1568814387121-e621f2405e3d?w=500&h=400&fit=crop", tags: ["Road Closure", "Traffic", "Community"], relatedBusinesses: [22], favorited: false },
  { id: 3001, type: 'article', title: "New Sustainable Tourism Initiative Launched in Gros-Islet", category: "Environment", date: "2025-09-03", summary: "Local businesses partner with environmental groups to create eco-friendly tourism experiences", content: "A groundbreaking partnership between Gros-Islet business owners and environmental organizations has launched the 'Green Gros-Islet' initiative...", author: "Sarah Thompson", source: "St. Lucia News Online", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=400&fit=crop", tags: ["Sustainability", "Tourism", "Environment"], relatedBusinesses: [3], favorited: false },
  { id: 3002, type: 'article', title: "Friday Night Street Festival Wins Caribbean Cultural Award", category: "Culture", date: "2025-08-28", summary: "Recognition for preserving and promoting authentic Caribbean culture", content: "The weekly Friday Night Street Festival has been awarded the Caribbean Tourism Organization's Cultural Preservation Award for 2025...", author: "Michael Richards", source: "Caribbean Beat Magazine", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=400&fit=crop", tags: ["Award", "Culture", "Tourism"], relatedBusinesses: [1], favorited: false }
];

const initialSkilledWorkers: SkilledWorker[] = [
    { id: 4001, name: "John Baptiste", skill: "Plumbing", description: "Expert plumbing services for residential and commercial properties. No job too small.", experience: 15, phone: "+1-758-555-0101", email: "john.b@example.com", availability: "Mon-Sat, 8am-5pm", location: "Gros-Islet", image: "https://images.unsplash.com/photo-1574857416393-21c60010188b?w=400&h=300&fit=crop", favorited: false, verified: true, type: 'worker', rating: 4.8, reviewCount: 2, bookingEnabled: true, reviews: [
      { id: 400101, author: 'Alex R.', rating: 5, comment: 'John was a lifesaver! He fixed our burst pipe on a Sunday morning. Professional, fast, and very fair pricing. Highly recommend.', date: '2025-09-10' },
      { id: 400102, author: 'Samantha V.', rating: 4, comment: 'Good, solid work. Arrived on time and completed the job as discussed. Would hire again.', date: '2025-09-02' },
    ]},
    { id: 4002, name: "Maria Charles", skill: "Electrical", description: "Certified electrician for installations, repairs, and safety checks. Reliable and efficient.", experience: 10, phone: "+1-758-555-0102", email: "maria.c@example.com", availability: "By Appointment", location: "Gros-Islet & North", image: "https://images.unsplash.com/photo-1489278353717-7a69a7b393de?w=400&h=300&fit=crop", favorited: false, verified: true, type: 'worker', rating: 5.0, reviewCount: 1, bookingEnabled: true, reviews: [
      { id: 400201, author: 'David L.', rating: 5, comment: 'Maria rewired our entire kitchen. She was meticulous, clean, and explained everything clearly. Fantastic job!', date: '2025-09-05' },
    ]},
    { id: 4003, name: "David Joseph", skill: "Carpentry", description: "Custom furniture, roofing, and general carpentry. High-quality craftsmanship.", experience: 20, phone: "+1-758-555-0103", email: "david.j@example.com", availability: "Mon-Fri, 7am-4pm", location: "Gros-Islet", image: "https://images.unsplash.com/photo-1572996908505-83584555ae37?w=400&h=300&fit=crop", favorited: false, verified: false, type: 'worker', rating: 0, reviewCount: 0, bookingEnabled: false, reviews: [] },
];

const initialAccommodations: Accommodation[] = [
  { id: 5001, name: "The Landings Resort and Spa", type: "Hotel", location: "Gros-Islet", description: "Luxurious all-suite resort with a private marina on Rodney Bay.", pricePerNight: 450, rating: 4.9, reviewCount: 312, amenities: ["Pool", "Spa", "Beachfront", "WiFi", "Gym"], image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop", favorited: false, verified: true, tourImage: "https://pannellum.org/images/bma-1.jpg", bookingEnabled: true, latitude: 14.088, longitude: -60.958 },
  { id: 5002, name: "Cap Maison Resort & Spa", type: "Hotel", location: "Gros-Islet", description: "An elegant boutique hotel with stunning sea views and a rooftop pool.", pricePerNight: 550, rating: 4.9, reviewCount: 250, amenities: ["Pool", "Restaurant", "Spa", "Private Beach"], image: "https://images.unsplash.com/photo-1542314831-068cd1dbb5eb?w=400&h=300&fit=crop", favorited: false, verified: true, tourImage: null, bookingEnabled: true, latitude: 14.095, longitude: -60.950 },
  { id: 5003, name: "Tropical Paradise Villa", type: "Airbnb", location: "Gros-Islet", description: "A beautiful 2-bedroom villa with a private pool and garden, perfect for a quiet getaway.", pricePerNight: 200, rating: 4.8, reviewCount: 88, amenities: ["Private Pool", "Kitchen", "WiFi", "Air Conditioning"], image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop", favorited: false, verified: false, tourImage: null, bookingEnabled: true, latitude: 14.072, longitude: -60.948 },
];

const initialTaxis: Taxi[] = [
  { id: 6001, driverName: "Peter's Island Tours", vehicleType: "Van (7-seater)", plateNumber: "TX1234", phone: "+1-758-555-0201", description: "Reliable airport transfers and island tours. Air-conditioned and comfortable.", rating: 4.9, reviewCount: 76, image: "https://images.unsplash.com/photo-1617092496033-1eb5d414a32b?w=400&h=300&fit=crop", favorited: false, verified: true },
  { id: 6002, driverName: "Lucian Vybz Taxi", vehicleType: "Sedan (4-seater)", plateNumber: "TX5678", phone: "+1-758-555-0202", description: "Friendly and professional service for local trips and excursions.", rating: 4.8, reviewCount: 52, image: "https://images.unsplash.com/photo-1559923832-68cf90a187f4?w=400&h=300&fit=crop", favorited: false, verified: false },
];

const initialForums: CommunityForum[] = [
    { id: 7001, title: "Best place to get fresh fish?", author: 'Chris G.', date: '2025-09-10', content: "Hey everyone, just moved to the area. Where do the locals go to buy fresh fish right off the boat?", replies: [
        { id: 700101, author: 'Jane Doe', date: '2025-09-10', content: 'Welcome! Definitely head down to the Gros-Islet jetty around 6 AM or in the late afternoon around 4 PM. That\'s when the fishermen usually come in.' },
        { id: 700102, author: 'Mark T.', date: '2025-09-11', content: 'I agree with Jane. If you miss the boats, there\'s a small fish market right there on the waterfront that has good stuff too.' },
    ]},
    { id: 7002, title: "Any recommendations for a reliable babysitter?", author: 'Samantha V.', date: '2025-09-08', content: "My husband and I are hoping to have a date night this Friday. Does anyone know a trustworthy babysitter in the Rodney Bay area?", replies: []}
];

// --- Mock API Service ---
// Simulates network latency and API calls for data fetching and mutations.
const mockApi = {
    fetchData: (): Promise<AppData> => new Promise(resolve => setTimeout(() => resolve({
        businesses: initialBusinesses,
        events: initialEvents,
        historicalContent: initialHistoricalContent,
        news: initialNews,
        skilledWorkers: initialSkilledWorkers,
        accommodations: initialAccommodations,
        taxis: initialTaxis,
        communityForums: initialForums,
    }), 800)),
    // Mutations return data to simulate a successful API response
    addItem: (item: any) => new Promise(resolve => setTimeout(() => resolve(item), 300)),
    updateItem: (item: any) => new Promise(resolve => setTimeout(() => resolve(item), 300)),
    submitReview: (review: any) => new Promise(resolve => setTimeout(() => resolve(review), 300)),
    postReply: (reply: any) => new Promise(resolve => setTimeout(() => resolve(reply), 300)),
    createThread: (thread: any) => new Promise(resolve => setTimeout(() => resolve(thread), 300)),
    toggleFavorite: (id: number, type: string) => new Promise(resolve => setTimeout(() => resolve({ success: true, id, type }), 200)),
    claimBusiness: (businessId: number, userId: number) => new Promise(resolve => setTimeout(() => resolve({ success: true, businessId, userId }), 300)),
    updateLoyalty: (businessId: number, action: string) => new Promise(resolve => setTimeout(() => resolve({ success: true, businessId, action }), 200)),
    createBooking: (booking: any) => new Promise(resolve => setTimeout(() => resolve(booking), 300)),
    cancelBooking: (bookingId: number) => new Promise(resolve => setTimeout(() => resolve({ success: true, bookingId }), 300)),
};


const businessCategories = ["All", "Restaurant", "Tourism", "Nightlife", "Shopping", "Health", "Education", "Community", "Sports & Rec", "Automotive"];
const workerSkills = ["All", "Plumbing", "Electrical", "Carpentry", "Masonry", "Landscaping", "Painting"];
const staysCategories = ["All", "Accommodations", "Taxis"];

// Generic Modal Component
const Modal = ({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-transform duration-300 animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

// 360 Tour Modal Component
const TourModal = ({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-black rounded-3xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] overflow-hidden relative transform transition-transform duration-300 animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const TourViewer = ({ imageUrl, title, onClose }: { imageUrl: string, title: string, onClose: () => void }) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let viewer: any;
    if (viewerRef.current && imageUrl) {
      viewer = pannellum.viewer(viewerRef.current, {
        "type": "equirectangular",
        "panorama": imageUrl,
        "autoLoad": true,
        "showControls": true,
        "title": title
      });
    }
    return () => {
      if (viewer) {
        viewer.destroy();
      }
    };
  }, [imageUrl, title]);

  return (
    <div className="w-full h-full relative bg-black">
      <div ref={viewerRef} className="w-full h-full"></div>
      <button onClick={onClose} aria-label="Close 360 tour view" className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 z-10 transition-colors">
        <X className="w-6 h-6" />
      </button>
    </div>
  );
};


// Detail View Components
const BusinessDetail = ({ item, onClose, onClaim, onEdit, user, onReviewSubmit, onTourView, onLoyaltyAction, onNewBooking }: {
    item: Business;
    onClose: () => void;
    onClaim: (id: number) => void;
    onEdit: (item: any) => void;
    user: User | null;
    onReviewSubmit: (id: number, review: { rating: number, comment: string }) => void;
    onTourView: (url: string, title: string) => void;
    onLoyaltyAction: (id: number, action: 'collect' | 'redeem') => void;
    onNewBooking: (booking: Omit<Booking, 'id'>) => void;
}) => {
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [isBookingActive, setIsBookingActive] = useState(false);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('19:00');
    const [partySize, setPartySize] = useState(2);


    const handleReviewSubmitLocal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newRating === 0 || !newComment) {
            toast.error('Please provide a rating and a comment.');
            return;
        }
        await onReviewSubmit(item.id, {
            rating: newRating,
            comment: newComment
        });
        setNewRating(0);
        setNewComment('');
    };
    
    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingDate) {
            toast.error('Please select a date.');
            return;
        }
        const bookingDetails = {
            type: 'business',
            itemId: item.id,
            itemName: item.name,
            date: bookingDate,
            time: bookingTime,
            details: `${partySize} guests`,
        };
        await onNewBooking(bookingDetails);
        setIsBookingActive(false);
    };

    const handleReportReview = (reviewId: number) => {
        toast.success(`Review has been reported. Thank you.`);
    };

    const reviews = item.reviews || [];
    
    const loyaltyProgress = user?.loyalty?.[item.id]?.progress || 0;
    const isLoyaltyGoalReached = item.loyaltyProgram?.enabled && loyaltyProgress >= (item.loyaltyProgram?.goal ?? Infinity);

    return (
        <div>
            <div className="relative">
                <img src={item.image} alt={`Main image for ${item.name}, a ${item.category} in Gros-Islet`} className="w-full h-64 object-cover rounded-t-3xl"/>
                {user?.type === 'owner' && item.ownerId === user.id && (
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-medium">My Business</div>
                )}
            </div>
            <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">{item.name}</h2>
                        <div className="flex items-center mt-2">
                             <Star className="w-5 h-5 text-amber-400 fill-current mr-2" />
                             <span className="text-xl font-bold text-gray-800">{item.rating ? item.rating.toFixed(1) : 'N/A'}</span>
                             <span className="text-sm text-gray-500 ml-2">({item.reviewCount} reviews)</span>
                         </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close detail view"><X className="w-6 h-6 text-gray-600" /></button>
                </div>
                
                {isBookingActive ? (
                    <div className="my-6 p-6 bg-blue-50 rounded-2xl border border-blue-200 animate-fade-in">
                        <h3 className="text-xl font-bold text-blue-800 mb-4">Book a Table</h3>
                        <form onSubmit={handleBookingSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-blue-700 mb-1">Date</label>
                                    <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} required className="w-full px-3 py-2 bg-white rounded-lg border border-blue-200 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-blue-700 mb-1">Party Size</label>
                                    <select value={partySize} onChange={e => setPartySize(Number(e.target.value))} className="w-full px-3 py-2 bg-white rounded-lg border border-blue-200 focus:ring-blue-500 focus:border-blue-500">
                                        {[...Array(8)].map((_, i) => <option key={i+1} value={i+1}>{i+1} guest{i > 0 && 's'}</option>)}
                                    </select>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-blue-700 mb-1">Time</label>
                                <select value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="w-full px-3 py-2 bg-white rounded-lg border border-blue-200 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="18:00">6:00 PM</option>
                                    <option value="19:00">7:00 PM</option>
                                    <option value="20:00">8:00 PM</option>
                                    <option value="21:00">9:00 PM</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={() => setIsBookingActive(false)} className="px-5 py-2 rounded-full text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2 rounded-full text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">Confirm Booking</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <p className="text-gray-700 mb-6">{item.description}</p>
                )}
                
                {item.bookingEnabled && user && !isBookingActive && (
                    <div className="my-6">
                        <button onClick={() => setIsBookingActive(true)} className="w-full bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
                            <Calendar className="w-5 h-5 mr-2" /> Book a Table
                        </button>
                    </div>
                )}
                
                {item.loyaltyProgram?.enabled && user && item.loyaltyProgram.goal && (
                    <div className="my-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border border-blue-200 shadow-sm">
                        <h3 className="text-xl font-bold text-blue-800 mb-3">Loyalty Card</h3>
                        <p className="text-blue-700 font-semibold mb-4">{item.loyaltyProgram.offer}</p>
                        <div className="flex flex-wrap gap-3 mb-4">
                            {[...Array(item.loyaltyProgram.goal)].map((_, i) => (
                                <div key={i} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${i < loyaltyProgress ? 'bg-blue-500 shadow-lg' : 'bg-blue-200'}`}>
                                    <Star className={`w-7 h-7 ${i < loyaltyProgress ? 'text-white' : 'text-blue-400'}`} />
                                </div>
                            ))}
                        </div>
                        <button 
                          onClick={() => onLoyaltyAction(item.id, isLoyaltyGoalReached ? 'redeem' : 'collect')}
                          disabled={isLoyaltyGoalReached && loyaltyProgress % item.loyaltyProgram.goal !== 0}
                          className={`w-full mt-4 px-6 py-3 rounded-full font-medium text-white transition-colors duration-300 flex items-center justify-center ${
                            isLoyaltyGoalReached 
                              ? 'bg-amber-500 hover:bg-amber-600' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                        >
                          {isLoyaltyGoalReached ? <><Award className="w-5 h-5 mr-2" /> Redeem Offer!</> : <><Plus className="w-5 h-5 mr-2" /> Collect Stamp</>}
                        </button>
                    </div>
                )}


                {item.tourImage && (
                    <div className="mb-6">
                        <button 
                            onClick={() => onTourView(item.tourImage!, item.name)} 
                            className="w-full bg-gray-800 text-white px-6 py-3 rounded-full font-medium hover:bg-black transition-colors flex items-center justify-center"
                        >
                            <Camera className="w-5 h-5 mr-2" /> View 360° Tour
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="flex items-center"><MapPin className="w-4 h-4 mr-3 text-gray-400"/> {item.address}</div>
                    <div className="flex items-center"><Clock className="w-4 h-4 mr-3 text-gray-400"/> {item.hours}</div>
                    {item.phone && <div className="flex items-center"><Phone className="w-4 h-4 mr-3 text-gray-400"/> {item.phone}</div>}
                    {item.email && <div className="flex items-center"><Mail className="w-4 h-4 mr-3 text-gray-400"/> {item.email}</div>}
                    {item.website && <div className="flex items-center"><Globe className="w-4 h-4 mr-3 text-gray-400"/> <a href={`https://${item.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{item.website}</a></div>}
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                    {item.tags.map(tag => <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">{tag}</span>)}
                </div>
                
                {item.socials && Object.values(item.socials).some(link => link) && (
                    <div className="pt-6 mt-6 border-t border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow Us</h3>
                        <div className="flex items-center space-x-4">
                            {item.socials.facebook && (
                                <a href={item.socials.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 transition-colors" aria-label="Facebook">
                                    <Facebook className="w-6 h-6" />
                                </a>
                            )}
                            {item.socials.instagram && (
                                <a href={item.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-600 transition-colors" aria-label="Instagram">
                                    <Instagram className="w-6 h-6" />
                                </a>
                            )}
                            {item.socials.twitter && (
                                <a href={item.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-sky-500 transition-colors" aria-label="Twitter">
                                    <Twitter className="w-6 h-6" />
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                <div className="pt-8 mt-6 border-t border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h3>
                    
                    {user && (
                        <form onSubmit={handleReviewSubmitLocal} className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <h4 className="font-semibold text-lg text-gray-800 mb-3">Leave a Review</h4>
                            <div className="flex items-center mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-7 h-7 cursor-pointer transition-colors ${
                                            (hoverRating || newRating) >= star
                                                ? 'text-amber-400 fill-current'
                                                : 'text-gray-300'
                                        }`}
                                        onClick={() => setNewRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                    />
                                ))}
                            </div>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Share your experience..."
                                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 transition-colors"
                                rows={4}
                                required
                            ></textarea>
                            <div className="flex justify-end mt-4">
                                <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors">Submit Review</button>
                            </div>
                        </form>
                    )}

                    <div className="space-y-6">
                        {reviews.length > 0 ? (
                            reviews.map(review => (
                                <div key={review.id} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-800">{review.author}</p>
                                            <p className="text-xs text-gray-500 mb-2">{new Date(review.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mt-2">{review.comment}</p>
                                    <div className="flex justify-end mt-2">
                                        <button onClick={() => handleReportReview(review.id)} className="text-xs text-gray-500 hover:text-red-600 flex items-center transition-colors">
                                            <Flag className="w-3 h-3 mr-1" /> Report
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600 text-center py-4">No reviews yet. Be the first to leave one!</p>
                        )}
                    </div>
                </div>

                {user?.type === 'owner' ? (
                    <div className="pt-8 mt-8 border-t border-gray-100">
                        {item.ownerId === null && (
                            <button onClick={() => onClaim(item.id)} className="w-full bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
                                <Award className="w-4 h-4 mr-2" /> Claim this Business
                            </button>
                        )}
                        {item.ownerId === user.id && (
                            <button onClick={() => onEdit(item)} className="w-full bg-gray-800 text-white px-6 py-3 rounded-full font-medium hover:bg-black transition-colors flex items-center justify-center">
                                <Edit className="w-4 h-4 mr-2" /> Edit Profile
                            </button>
                        )}
                    </div>
                ) : user?.type === 'admin' ? (
                     <div className="pt-8 mt-8 border-t border-gray-100">
                        <button onClick={() => onEdit(item)} className="w-full bg-red-600 text-white px-6 py-3 rounded-full font-medium hover:bg-red-700 transition-colors flex items-center justify-center">
                            <Wrench className="w-4 h-4 mr-2" /> Admin: Edit Listing
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

const WorkerDetail = ({ item, onClose, user, onReviewSubmit, onNewBooking }: {
    item: SkilledWorker;
    onClose: () => void;
    user: User | null;
    onReviewSubmit: (id: number, review: { rating: number, comment: string }) => void;
    onNewBooking: (booking: Omit<Booking, 'id'>) => void;
}) => {
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [isBookingActive, setIsBookingActive] = useState(false);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('09:00');
    const [jobDescription, setJobDescription] = useState('');

    const handleReviewSubmitLocal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newRating === 0 || !newComment) {
            toast.error('Please provide a rating and a comment.');
            return;
        }
        await onReviewSubmit(item.id, {
            rating: newRating,
            comment: newComment
        });
        setNewRating(0);
        setNewComment('');
    };
    
    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingDate || !jobDescription) {
            toast.error('Please select a date and provide a job description.');
            return;
        }
        const bookingDetails = {
            type: 'worker',
            itemId: item.id,
            itemName: item.name,
            date: bookingDate,
            time: bookingTime,
            details: `Job: ${jobDescription}`,
        };
        await onNewBooking(bookingDetails);
        setIsBookingActive(false);
    };

    const handleReportReview = (reviewId: number) => {
        toast.success(`Review has been reported. Thank you.`);
    };

    const reviews = item.reviews || [];

    return (
        <div>
          <img src={item.image} alt={`Profile photo of ${item.name}, a ${item.skill} professional`} className="w-full h-64 object-cover rounded-t-3xl"/>
          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{item.name}</h2>
                <div className="flex items-center mt-2">
                  <Star className="w-5 h-5 text-amber-400 fill-current mr-2" />
                  <span className="text-xl font-bold text-gray-800">{item.rating ? item.rating.toFixed(1) : 'N/A'}</span>
                  <span className="text-sm text-gray-500 ml-2">({item.reviewCount} reviews)</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close detail view"><X className="w-6 h-6 text-gray-600" /></button>
            </div>
            {isBookingActive ? (
                <div className="my-6 p-6 bg-green-50 rounded-2xl border border-green-200 animate-fade-in">
                    <h3 className="text-xl font-bold text-green-800 mb-4">Request Service</h3>
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-green-700 mb-1">Preferred Date</label>
                                <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} required className="w-full px-3 py-2 bg-white rounded-lg border border-green-200 focus:ring-green-500 focus:border-green-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-green-700 mb-1">Preferred Time</label>
                                <select value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="w-full px-3 py-2 bg-white rounded-lg border border-green-200 focus:ring-green-500 focus:border-green-500">
                                    <option value="09:00">Morning (9 AM)</option>
                                    <option value="13:00">Afternoon (1 PM)</option>
                                </select>
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">Brief Job Description</label>
                            <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} required placeholder="e.g., Leaky kitchen sink" className="w-full px-3 py-2 bg-white rounded-lg border border-green-200 focus:ring-green-500 focus:border-green-500" rows={3}></textarea>
                        </div>
                        <div className="flex justify-end space-x-3 pt-2">
                            <button type="button" onClick={() => setIsBookingActive(false)} className="px-5 py-2 rounded-full text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                            <button type="submit" className="px-5 py-2 rounded-full text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">Send Request</button>
                        </div>
                    </form>
                </div>
            ) : (
                 <p className="text-gray-700 mb-6">{item.description}</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
              <div className="flex items-center"><Award className="w-4 h-4 mr-3 text-gray-400"/> {item.experience} years of experience</div>
              <div className="flex items-center"><Clock className="w-4 h-4 mr-3 text-gray-400"/> Availability: {item.availability}</div>
              <div className="flex items-center"><MapPin className="w-4 h-4 mr-3 text-gray-400"/> Serves: {item.location}</div>
              <div className="flex items-center"><Phone className="w-4 h-4 mr-3 text-gray-400"/> {item.phone}</div>
              {item.email && <div className="flex items-center"><Mail className="w-4 h-4 mr-3 text-gray-400"/> {item.email}</div>}
            </div>
            <div className="flex justify-start pt-4 border-t border-gray-100 space-x-4">
                <a href={`tel:${item.phone}`} className="bg-gray-800 text-white px-6 py-3 rounded-full font-medium hover:bg-black transition-colors flex items-center">
                    <Phone className="w-4 h-4 mr-2" /> Call Now
                </a>
                {item.bookingEnabled && user && !isBookingActive && (
                    <button onClick={() => setIsBookingActive(true)} className="bg-green-600 text-white px-6 py-3 rounded-full font-medium hover:bg-green-700 transition-colors flex items-center">
                        <Calendar className="w-4 h-4 mr-2" /> Book Service
                    </button>
                )}
            </div>

            {/* Reviews Section */}
            <div className="pt-8 mt-6 border-t border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h3>
                {user && (
                    <form onSubmit={handleReviewSubmitLocal} className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <h4 className="font-semibold text-lg text-gray-800 mb-3">Leave a Review</h4>
                        <div className="flex items-center mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-7 h-7 cursor-pointer transition-colors ${
                                        (hoverRating || newRating) >= star
                                            ? 'text-amber-400 fill-current'
                                            : 'text-gray-300'
                                    }`}
                                    onClick={() => setNewRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                />
                            ))}
                        </div>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your experience..."
                            className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-200 transition-colors"
                            rows={4}
                            required
                        ></textarea>
                        <div className="flex justify-end mt-4">
                            <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-full font-medium hover:bg-green-700 transition-colors">Submit Review</button>
                        </div>
                    </form>
                )}
                <div className="space-y-6">
                    {reviews.length > 0 ? (
                        reviews.map(review => (
                            <div key={review.id} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-800">{review.author}</p>
                                        <p className="text-xs text-gray-500 mb-2">{new Date(review.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-700 mt-2">{review.comment}</p>
                                <div className="flex justify-end mt-2">
                                    <button onClick={() => handleReportReview(review.id)} className="text-xs text-gray-500 hover:text-red-600 flex items-center transition-colors">
                                        <Flag className="w-3 h-3 mr-1" /> Report
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600 text-center py-4">No reviews yet. Be the first to share your experience!</p>
                    )}
                </div>
            </div>
          </div>
        </div>
    );
};

const AccommodationDetail = ({ item, onClose, onTourView, user, onNewBooking }: {
    item: Accommodation;
    onClose: () => void;
    onTourView: (url: string, title: string) => void;
    user: User | null;
    onNewBooking: (booking: Omit<Booking, 'id'>) => void;
}) => {
    const [isBookingActive, setIsBookingActive] = useState(false);
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    
    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkInDate || !checkOutDate) {
            toast.error('Please select check-in and check-out dates.');
            return;
        }
        if (new Date(checkOutDate) <= new Date(checkInDate)) {
            toast.error('Check-out date must be after the check-in date.');
            return;
        }
        const bookingDetails = {
            type: 'accommodation',
            itemId: item.id,
            itemName: item.name!,
            date: checkInDate,
            time: `until ${checkOutDate}`,
            details: '1 room',
        };
        await onNewBooking(bookingDetails);
        setIsBookingActive(false);
    };

    return (
      <div>
        <img src={item.image} alt={`Photo of ${item.name}, ${item.type} in Gros-Islet`} className="w-full h-64 object-cover rounded-t-3xl"/>
        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{item.name}</h2>
              <p className="text-cyan-600 font-medium">{item.type}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close detail view"><X className="w-6 h-6 text-gray-600" /></button>
          </div>
           {isBookingActive ? (
                <div className="my-6 p-6 bg-cyan-50 rounded-2xl border border-cyan-200 animate-fade-in">
                    <h3 className="text-xl font-bold text-cyan-800 mb-4">Reserve Your Stay</h3>
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-cyan-700 mb-1">Check-in</label>
                                <input type="date" value={checkInDate} onChange={e => setCheckInDate(e.target.value)} required className="w-full px-3 py-2 bg-white rounded-lg border border-cyan-200 focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-cyan-700 mb-1">Check-out</label>
                                <input type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} required className="w-full px-3 py-2 bg-white rounded-lg border border-cyan-200 focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 pt-2">
                            <button type="button" onClick={() => setIsBookingActive(false)} className="px-5 py-2 rounded-full text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                            <button type="submit" className="px-5 py-2 rounded-full text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition-colors">Confirm Reservation</button>
                        </div>
                    </form>
                </div>
            ) : (
                <p className="text-gray-700 mb-6">{item.description}</p>
            )}
          
          {item.tourImage && (
            <div className="mb-6">
                <button 
                    onClick={() => onTourView(item.tourImage!, item.name!)} 
                    className="w-full bg-gray-800 text-white px-6 py-3 rounded-full font-medium hover:bg-black transition-colors flex items-center justify-center"
                >
                    <Camera className="w-5 h-5 mr-2" /> View 360° Tour
                </button>
            </div>
          )}
    
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Amenities</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              {item.amenities.map(amenity => (
                <div key={amenity} className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                    <Zap className="w-4 h-4 mr-2 text-gray-500" /> 
                    <span className="text-gray-700">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
           <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className="text-2xl font-bold text-gray-900">${item.pricePerNight}<span className="text-sm font-normal text-gray-500">/night</span></div>
            {item.bookingEnabled && user && !isBookingActive ? (
                 <button onClick={() => setIsBookingActive(true)} className="bg-cyan-600 text-white px-6 py-3 rounded-full font-medium hover:bg-cyan-700 transition-colors flex items-center">
                    Reserve Now
                 </button>
            ) : (
                 <a href="#" className="bg-gray-400 cursor-not-allowed text-white px-6 py-3 rounded-full font-medium flex items-center">
                    Book Now
                 </a>
            )}
          </div>
        </div>
      </div>
    );
};

const TaxiDetail = ({ item, onClose }: { item: Taxi, onClose: () => void }) => (
  <div>
    <img src={item.image} alt={`Photo of the vehicle for ${item.driverName}`} className="w-full h-64 object-cover rounded-t-3xl"/>
    <div className="p-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{item.driverName}</h2>
          <p className="text-cyan-600 font-medium">{item.vehicleType}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close detail view"><X className="w-6 h-6 text-gray-600" /></button>
      </div>
      <p className="text-gray-700 mb-6">{item.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
        <div className="flex items-center"><Car className="w-4 h-4 mr-3 text-gray-400"/> Plate: {item.plateNumber}</div>
        <div className="flex items-center"><Phone className="w-4 h-4 mr-3 text-gray-400"/> {item.phone}</div>
      </div>
      <div className="flex justify-start pt-4 border-t border-gray-100">
        <a href={`tel:${item.phone}`} className="bg-cyan-600 text-white px-6 py-3 rounded-full font-medium hover:bg-cyan-700 transition-colors flex items-center justify-center w-full">
          <Phone className="w-4 h-4 mr-2" /> Call Now
        </a>
      </div>
    </div>
  </div>
);

// Generic Detail component for Events, News, and Heritage
const ContentDetail = ({ item, onClose, type }: { item: Event | News | HistoricalContent, onClose: () => void, type: string }) => {
  const title = item.title;
  const image = 'image' in item ? item.image : (item.images && item.images[0]);
  const content = 'content' in item ? item.content : item.description;

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (type === 'event' && 'latitude' in item && item.latitude && item.longitude && mapRef.current && !mapInstance.current) {
      const map = L.map(mapRef.current).setView([item.latitude, item.longitude], 16);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      L.marker([item.latitude, item.longitude]).addTo(map)
        .bindPopup(`<b>${item.title}</b><br>${'location' in item ? item.location : ''}`)
        .openPopup();

      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }
    
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [item, type]);

  return (
    <div>
      {image && <img src={image} alt={`Featured image for the article: ${title}`} className="w-full h-64 object-cover rounded-t-3xl"/>}
      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close detail view"><X className="w-6 h-6 text-gray-600" /></button>
        </div>
        {type === 'event' && (
          <div className="space-y-3 text-gray-600 mb-6">
            <div className="flex items-center"><Calendar className="w-4 h-4 mr-3 text-gray-400" /><span>{new Date((item as Event).date).toLocaleDateString()} at {(item as Event).time}</span></div>
            <div className="flex items-center"><MapPin className="w-4 h-4 mr-3 text-gray-400" /><span>{(item as Event).location}</span></div>
            <div className="flex items-center"><User className="w-4 h-4 mr-3 text-gray-400" /><span>{(item as Event).organizer}</span></div>
          </div>
        )}
        
        {type === 'event' && 'latitude' in item && item.latitude && item.longitude && (
          <div className="mb-6">
            <div ref={mapRef} className="h-64 w-full rounded-2xl border border-gray-200 z-0"></div>
          </div>
        )}
        
         <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{content}</p>
        {'summary' in item && item.summary && <p className="mt-4 text-gray-600 italic">{item.summary}</p>}
      </div>
    </div>
  );
};

const LoginModal = ({ isOpen, onClose, onLogin, onRegister, registeredUsers, onPinReset }: {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (credentials: { username: string, pin: string }) => void;
    onRegister: (newUser: { username: string, pin: string, type: string, email: string }) => void;
    registeredUsers: User[];
    onPinReset: (username: string, newPin: string) => void;
}) => {
    const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'reset'
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState('');
    const [email, setEmail] = useState('');
    const [userType, setUserType] = useState('user');

    const [resetStep, setResetStep] = useState('enterEmail'); // 'enterEmail', 'enterCode', 'enterNewPin'
    const [resetEmail, setResetEmail] = useState('');
    const [userToReset, setUserToReset] = useState<User | null>(null);
    const [mockCode, setMockCode] = useState('');
    const [enteredCode, setEnteredCode] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmNewPin, setConfirmNewPin] = useState('');

    const resetLocalState = useCallback(() => {
        setUsername('');
        setPin('');
        setEmail('');
        setUserType('user');
        setResetStep('enterEmail');
        setResetEmail('');
        setUserToReset(null);
        setMockCode('');
        setEnteredCode('');
        setNewPin('');
        setConfirmNewPin('');
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setAuthMode('login');
                resetLocalState();
            }, 300);
        }
    }, [isOpen, resetLocalState]);

    const handleClose = () => {
        onClose();
    };

    const handleModeChange = (newMode: string) => {
        setAuthMode(newMode);
        resetLocalState();
    };

    const handleMainSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            toast.error('PIN must be exactly 4 digits.');
            return;
        }
        if (authMode === 'login') {
            onLogin({ username, pin });
        } else { // register
            onRegister({ username, pin, type: userType, email });
        }
    };

    const handleResetRequest = (e: React.FormEvent) => {
        e.preventDefault();
        const userFound = registeredUsers.find(u => u.email.toLowerCase() === resetEmail.toLowerCase());
        if (userFound) {
            setUserToReset(userFound);
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setMockCode(code);
            toast.success(`For demonstration, your code is: ${code}`);
            setResetStep('enterCode');
        } else {
            toast.error('No account found with that email address.');
        }
    };

    const handleCodeVerification = (e: React.FormEvent) => {
        e.preventDefault();
        if (enteredCode === mockCode) {
            setResetStep('enterNewPin');
        } else {
            toast.error('Invalid verification code.');
        }
    };

    const handleNewPinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
            toast.error('New PIN must be exactly 4 digits.');
            return;
        }
        if (newPin !== confirmNewPin) {
            toast.error('PINs do not match.');
            return;
        }
        onPinReset(userToReset!.username, newPin);
        handleModeChange('login');
    };

    const renderResetFlow = () => (
        <div className="mt-6">
            {resetStep === 'enterEmail' && (
                <form onSubmit={handleResetRequest} className="space-y-4">
                    <p className="text-sm text-gray-600">Enter your account's email address and we will send you a verification code to reset your PIN.</p>
                    <div>
                        <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="Email Address" required className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 transition-colors" />
                    </div>
                    <div className="flex justify-between items-center pt-4">
                        <button type="button" onClick={() => handleModeChange('login')} className="text-sm text-blue-600 hover:underline">Back to Login</button>
                        <button type="submit" className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center">Send Code</button>
                    </div>
                </form>
            )}
            {resetStep === 'enterCode' && (
                <form onSubmit={handleCodeVerification} className="space-y-4">
                    <p className="text-sm text-gray-600">A verification code was "sent" to <strong>{userToReset?.email}</strong>. Please enter it below.</p>
                    <div>
                        <input type="text" value={enteredCode} onChange={e => setEnteredCode(e.target.value)} placeholder="6-Digit Code" required maxLength={6} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 transition-colors" />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">Verify Code</button>
                    </div>
                </form>
            )}
            {resetStep === 'enterNewPin' && (
                <form onSubmit={handleNewPinSubmit} className="space-y-4">
                    <p className="text-sm text-gray-600">Create a new 4-digit PIN for <strong>{userToReset?.username}</strong>.</p>
                    <div>
                        <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="New 4-Digit PIN" required maxLength={4} pattern="\d{4}" title="PIN must be 4 digits" className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 transition-colors" />
                    </div>
                    <div>
                        <input type="password" value={confirmNewPin} onChange={e => setConfirmNewPin(e.target.value)} placeholder="Confirm New PIN" required maxLength={4} pattern="\d{4}" title="PIN must be 4 digits" className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 transition-colors" />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">Set New PIN</button>
                    </div>
                </form>
            )}
        </div>
    );
    
    const titles: { [key: string]: string } = {
        login: 'Sign In',
        register: 'Create Profile',
        reset: 'Reset PIN'
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{titles[authMode]}</h2>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close login modal"><X className="w-6 h-6 text-gray-600" /></button>
                </div>

                {authMode === 'reset' ? renderResetFlow() : (
                    <form onSubmit={handleMainSubmit} className="space-y-4">
                        <div>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 transition-colors" />
                        </div>
                        {authMode === 'register' && (
                            <div>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 transition-colors" />
                            </div>
                        )}
                        <div>
                            <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="4-Digit PIN" required maxLength={4} pattern="\d{4}" title="PIN must be 4 digits" className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 transition-colors" />
                        </div>
                        {authMode === 'register' && (
                            <div className="p-1 bg-gray-100 rounded-full flex">
                                <button type="button" onClick={() => setUserType('user')} className={`w-1/2 py-2 rounded-full text-sm font-medium transition-colors ${userType === 'user' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'}`}>Community Member</button>
                                <button type="button" onClick={() => setUserType('owner')} className={`w-1/2 py-2 rounded-full text-sm font-medium transition-colors ${userType === 'owner' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'}`}>Business Owner</button>
                            </div>
                        )}
                        <div className="pt-4 space-y-3">
                            <div className="flex justify-end">
                                <button type="submit" className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center w-full justify-center">
                                    <LogIn className="w-4 h-4 mr-2" /> {authMode === 'login' ? 'Login' : 'Register'}
                                </button>
                            </div>
                             <div className="text-center">
                                {authMode === 'login' ? (
                                    <div className="flex justify-between items-center text-sm">
                                        <button type="button" onClick={() => handleModeChange('reset')} className="text-blue-600 hover:underline">Forgot PIN?</button>
                                        <button type="button" onClick={() => handleModeChange('register')} className="text-blue-600 hover:underline">Don't have a profile? Sign up</button>
                                    </div>
                                ) : (
                                    <button type="button" onClick={() => handleModeChange('login')} className="text-sm text-blue-600 hover:underline">Already have a profile? Log in</button>
                                )}
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
};

const TimelineView = ({ items, onSelectItem }: { items: HistoricalContent[], onSelectItem: (item: any) => void }) => {
  const sortedItems = items.sort((a, b) => a.sortYear - b.sortYear);

  return (
    <div className="relative max-w-4xl mx-auto py-8">
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 transform -translate-x-1/2"></div>
      {sortedItems.map((item, index) => (
        <div key={item.id} className={`relative mb-12`}>
          <div className={`flex items-center ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}>
            <div className={`w-1/2 px-6`}>
              <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300" onClick={() => onSelectItem({type: 'heritage', data: item})}>
                <p className="text-sm font-semibold text-amber-600 mb-1">{item.era}</p>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
              </div>
            </div>
            <div className="w-1/2"></div>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-amber-500 rounded-full border-4 border-white shadow-md"></div>
        </div>
      ))}
    </div>
  );
};

const AddForm = ({ onSubmit, onCancel, initialData = {}, isEditMode = false, activeTab, user, itemTypeForForm }: {
    onSubmit: (data: AddFormData) => void;
    onCancel: () => void;
    initialData?: any;
    isEditMode?: boolean;
    activeTab: string;
    user: User | null;
    itemTypeForForm?: string;
}) => {
    const [formData, setFormData] = useState<AddFormData>({});

    useEffect(() => {
        if (isEditMode && initialData) {
            const data = initialData as any;
            const preparedData: AddFormData = { ...data };
            if (data.loyaltyProgram) {
                preparedData.loyaltyEnabled = data.loyaltyProgram.enabled;
                preparedData.loyaltyOffer = data.loyaltyProgram.offer;
                preparedData.loyaltyGoal = data.loyaltyProgram.goal;
            }
            if (data.socials) {
                preparedData.facebook = data.socials.facebook;
                preparedData.instagram = data.socials.instagram;
                preparedData.twitter = data.socials.twitter;
            }
            if (data.tags && Array.isArray(data.tags)) {
                preparedData.tags = data.tags.join(', ');
            }
            if (data.amenities && Array.isArray(data.amenities)) {
                preparedData.amenities = data.amenities.join(', ');
            }
            setFormData(preparedData);
        }
    }, [initialData, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };
    
    const renderCommonFields = () => (
        <>
            <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Name / Title" required className="w-full p-3 rounded-lg border"/>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} placeholder="Description" required className="w-full p-3 rounded-lg border" rows={4}></textarea>
            <input name="image" value={formData.image || ''} onChange={handleChange} placeholder="Image URL" className="w-full p-3 rounded-lg border"/>
        </>
    );

    const renderBusinessFields = () => (
        <>
            {renderCommonFields()}
            <select name="category" value={formData.category || ''} onChange={handleChange} required className="w-full p-3 rounded-lg border">
                <option value="">Select Category</option>
                {businessCategories.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="Phone" className="w-full p-3 rounded-lg border"/>
            <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Address" className="w-full p-3 rounded-lg border"/>
            <input name="hours" value={formData.hours || ''} onChange={handleChange} placeholder="Hours (e.g., Mon-Fri 9AM-5PM)" className="w-full p-3 rounded-lg border"/>
            <input name="tags" value={formData.tags || ''} onChange={handleChange} placeholder="Tags (comma-separated)" className="w-full p-3 rounded-lg border"/>
            {isEditMode && (user?.type === 'owner' || user?.type === 'admin') && (
                <>
                    <div className="p-4 border rounded-lg space-y-3 bg-gray-50">
                        <h4 className="font-semibold">Social Media Links</h4>
                        <input name="facebook" value={formData.facebook || ''} onChange={handleChange} placeholder="Facebook URL" className="w-full p-3 rounded-lg border"/>
                        <input name="instagram" value={formData.instagram || ''} onChange={handleChange} placeholder="Instagram URL" className="w-full p-3 rounded-lg border"/>
                        <input name="twitter" value={formData.twitter || ''} onChange={handleChange} placeholder="Twitter/X URL" className="w-full p-3 rounded-lg border"/>
                    </div>
                    <div className="p-4 border rounded-lg space-y-3 bg-gray-50">
                        <h4 className="font-semibold">Loyalty Program</h4>
                        <label className="flex items-center gap-2"><input type="checkbox" name="loyaltyEnabled" checked={formData.loyaltyEnabled || false} onChange={handleChange} /> Enable Loyalty Program</label>
                        <input name="loyaltyOffer" value={formData.loyaltyOffer || ''} onChange={handleChange} placeholder="Offer (e.g., Buy 5, get 1 free)" disabled={!formData.loyaltyEnabled} className="w-full p-3 rounded-lg border disabled:bg-gray-200"/>
                        <input type="number" name="loyaltyGoal" value={formData.loyaltyGoal || ''} onChange={handleChange} placeholder="Goal (e.g., 5)" disabled={!formData.loyaltyEnabled} className="w-full p-3 rounded-lg border disabled:bg-gray-200"/>
                    </div>
                </>
            )}
        </>
    );
    
    const renderWorkerFields = () => (
        <>
            {renderCommonFields()}
            <select name="skill" value={formData.skill || ''} onChange={handleChange} required className="w-full p-3 rounded-lg border">
                <option value="">Select Skill</option>
                {workerSkills.filter(c => c !== 'All').map(skill => <option key={skill} value={skill}>{skill}</option>)}
            </select>
            <input type="number" name="experience" value={formData.experience || ''} onChange={handleChange} placeholder="Years of Experience" className="w-full p-3 rounded-lg border"/>
            <input name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="Phone" required className="w-full p-3 rounded-lg border"/>
            <input name="availability" value={formData.availability || ''} onChange={handleChange} placeholder="Availability" className="w-full p-3 rounded-lg border"/>
            <input name="location" value={formData.location || ''} onChange={handleChange} placeholder="Service Area" className="w-full p-3 rounded-lg border"/>
        </>
    );

    const renderAccommodationFields = () => (
        <>
            {renderCommonFields()}
            <input type="number" name="pricePerNight" value={formData.pricePerNight || ''} onChange={handleChange} placeholder="Price Per Night" required className="w-full p-3 rounded-lg border"/>
            <input name="amenities" value={formData.amenities || ''} onChange={handleChange} placeholder="Amenities (comma-separated)" className="w-full p-3 rounded-lg border"/>
        </>
    );
    
    const renderTaxiFields = () => (
         <>
            <input name="driverName" value={formData.driverName || ''} onChange={handleChange} placeholder="Driver or Company Name" required className="w-full p-3 rounded-lg border"/>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} placeholder="Description" required className="w-full p-3 rounded-lg border" rows={4}></textarea>
            <input name="image" value={formData.image || ''} onChange={handleChange} placeholder="Image URL" className="w-full p-3 rounded-lg border"/>
            <input name="vehicleType" value={formData.vehicleType || ''} onChange={handleChange} placeholder="Vehicle Type (e.g., Sedan)" required className="w-full p-3 rounded-lg border"/>
            <input name="plateNumber" value={formData.plateNumber || ''} onChange={handleChange} placeholder="Plate Number" required className="w-full p-3 rounded-lg border"/>
            <input name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="Phone" required className="w-full p-3 rounded-lg border"/>
        </>
    )

    const renderStaysFields = () => (
        <>
          <select name="type" value={formData.type || ''} onChange={handleChange} required className="w-full p-3 rounded-lg border">
              <option value="">Select Listing Type</option>
              <option value="Accommodation">Accommodation</option>
              <option value="Taxi">Taxi Service</option>
          </select>
          {formData.type === 'Accommodation' && renderAccommodationFields()}
          {formData.type === 'Taxi' && renderTaxiFields()}
        </>
    );

    const renderFormContent = () => {
        const formType = itemTypeForForm || activeTab;
        switch(formType) {
            case 'businesses': return renderBusinessFields();
            case 'workers': return renderWorkerFields();
            case 'stays': return renderStaysFields();
            // Other cases can be added if needed
            default: return renderCommonFields();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
            <h2 className="text-2xl font-bold">{isEditMode ? 'Edit Listing' : 'Add New Listing'}</h2>
            {renderFormContent()}
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 rounded-full bg-gray-100 text-gray-800">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-full bg-black text-white">{isEditMode ? 'Save Changes' : 'Add Listing'}</button>
            </div>
        </form>
    );
};

const CommunityView = ({ forums, user, onNewThread, onSelectThread }: {
    forums: CommunityForum[];
    user: User | null;
    onNewThread: (thread: { title: string, content: string }) => void;
    onSelectThread: (thread: CommunityForum) => void;
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onNewThread({ title, content });
        setTitle('');
        setContent('');
        setIsAdding(false);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-end mb-6">
                {user && <button onClick={() => setIsAdding(!isAdding)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2"><Plus className="w-4 h-4"/> Start a Discussion</button>}
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-lg mb-8 space-y-4 animate-fade-in">
                    <h3 className="text-xl font-bold">New Discussion</h3>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What's your question or topic?" required className="w-full p-3 rounded-lg border" />
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Add more details..." required className="w-full p-3 rounded-lg border" rows={5}></textarea>
                    <div className="flex justify-end gap-3"><button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2 rounded-full bg-gray-100">Cancel</button><button type="submit" className="px-5 py-2 rounded-full bg-indigo-600 text-white">Post</button></div>
                </form>
            )}

            <div className="space-y-6">
                {forums.map(thread => (
                    <div key={thread.id} onClick={() => onSelectThread(thread)} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{thread.title}</h4>
                        <p className="text-gray-600 line-clamp-2">{thread.content}</p>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                            <span>By {thread.author} on {new Date(thread.date).toLocaleDateString()}</span>
                            <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4"/> {thread.replies.length} replies</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ThreadView = ({ thread, onClose, user, onNewReply }: {
    thread: CommunityForum;
    onClose: () => void;
    user: User | null;
    onNewReply: (threadId: number, reply: { content: string }) => void;
}) => {
    const [replyContent, setReplyContent] = useState('');
    
    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onNewReply(thread.id, { content: replyContent });
        setReplyContent('');
    };

    return (
        <div>
            <div className="p-8 border-b">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-3xl font-bold text-gray-900">{thread.title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close thread view"><X className="w-6 h-6 text-gray-600" /></button>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{thread.content}</p>
                <p className="text-sm text-gray-500 mt-4">Posted by {thread.author} on {new Date(thread.date).toLocaleDateString()}</p>
            </div>
            <div className="p-8 bg-gray-50/50">
                <h3 className="text-xl font-bold mb-4">{thread.replies.length} Replies</h3>
                <div className="space-y-4 mb-8">
                    {thread.replies.map(reply => (
                        <div key={reply.id} className="p-4 bg-white rounded-xl border">
                            <p className="text-gray-800">{reply.content}</p>
                            <p className="text-xs text-gray-500 mt-2">By {reply.author} on {new Date(reply.date).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
                {user && (
                    <form onSubmit={handleReplySubmit}>
                        <h4 className="font-semibold mb-2">Leave a Reply</h4>
                        <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} required placeholder="Write your reply..." className="w-full p-3 rounded-lg border" rows={4}></textarea>
                        <div className="flex justify-end mt-3">
                            <button type="submit" className="px-6 py-2.5 rounded-full bg-indigo-600 text-white font-medium">Post Reply</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const BookingModal = ({ isOpen, onClose, bookings, onCancelBooking }: {
    isOpen: boolean;
    onClose: () => void;
    bookings: Booking[];
    onCancelBooking: (id: number) => void;
}) => (
    <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close bookings modal"><X className="w-6 h-6 text-gray-600" /></button>
            </div>
            {bookings.length > 0 ? (
                <div className="space-y-4">
                    {bookings.map(booking => (
                        <div key={booking.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-gray-800">{booking.itemName}</p>
                                <p className="text-sm text-gray-600"><Calendar className="w-3 h-3 inline mr-1.5"/> {new Date(booking.date).toLocaleDateString()} @ {booking.time}</p>
                                <p className="text-sm text-gray-600"><Info className="w-3 h-3 inline mr-1.5"/> {booking.details}</p>
                            </div>
                            <button onClick={() => onCancelBooking(booking.id)} className="px-4 py-2 text-sm rounded-full bg-red-100 text-red-700 hover:bg-red-200">Cancel</button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-600 py-8">You have no upcoming bookings.</p>
            )}
        </div>
    </Modal>
);

const ItineraryPlanner = ({ onGenerate, isPlanning, aiError, itinerary }: {
    onGenerate: (criteria: any) => void;
    isPlanning: boolean;
    aiError: string;
    itinerary: any;
}) => {
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [customInterest, setCustomInterest] = useState('');
    const [duration, setDuration] = useState('full-day');
    const [budget, setBudget] = useState('moderate');
    
    const predefinedInterests = ["Beaches", "History", "Foodie", "Adventure", "Nightlife", "Relaxation"];

    const toggleInterest = (interest: string) => {
        setSelectedInterests(prev => 
            prev.includes(interest) 
                ? prev.filter(i => i !== interest) 
                : [...prev, interest]
        );
    };

    const handleAddCustomInterest = () => {
        const trimmedInterest = customInterest.trim();
        if (trimmedInterest && !selectedInterests.find(i => i.toLowerCase() === trimmedInterest.toLowerCase())) {
            setSelectedInterests(prev => [...prev, trimmedInterest]);
            setCustomInterest('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const allInterests = [...selectedInterests];
        const trimmedCustom = customInterest.trim();
        if (trimmedCustom && !allInterests.find(i => i.toLowerCase() === trimmedCustom.toLowerCase())) {
            allInterests.push(trimmedCustom);
        }
        if (allInterests.length === 0) {
            toast.error('Please select or add at least one interest.');
            return;
        }
        onGenerate({ interests: allInterests, duration, budget });
    };

    return (
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-white shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Itinerary Planner</h3>
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select your interests:</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {predefinedInterests.map(interest => (
                            <button
                                type="button"
                                key={interest}
                                onClick={() => toggleInterest(interest)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    selectedInterests.includes(interest) 
                                        ? 'bg-teal-600 text-white shadow' 
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                                }`}
                            >
                                {interest}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            value={customInterest} 
                            onChange={e => setCustomInterest(e.target.value)} 
                            placeholder="Add another interest..." 
                            className="w-full p-3 rounded-lg border"
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomInterest(); } }}
                        />
                        <button type="button" onClick={handleAddCustomInterest} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium">Add</button>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-3 rounded-lg border"><option value="half-day">Half Day</option><option value="full-day">Full Day</option></select>
                    <select value={budget} onChange={e => setBudget(e.target.value)} className="w-full p-3 rounded-lg border"><option value="budget">Budget-Friendly</option><option value="moderate">Moderate</option><option value="luxury">Luxury</option></select>
                 </div>
                 <button type="submit" disabled={isPlanning} className="w-full bg-teal-600 text-white p-3 rounded-full font-semibold hover:bg-teal-700 disabled:bg-gray-400">
                    {isPlanning ? 'Planning Your Day...' : 'Generate Itinerary'}
                 </button>
            </form>
            {aiError && <p className="text-red-600 text-center">{aiError}</p>}
            {itinerary && (
                <div className="mt-6 border-t pt-6 animate-fade-in">
                    <h4 className="text-xl font-bold mb-4">{itinerary.planTitle}</h4>
                    <div className="space-y-4">
                        {itinerary.itinerary.map((step: any, index: number) => (
                            <div key={index} className="p-4 bg-teal-50/50 rounded-xl border border-teal-200">
                                <p className="font-bold text-teal-800">{step.time}: {step.activity}</p>
                                <p className="text-sm text-gray-600 mb-1">{step.location}</p>
                                <p className="text-teal-900">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const RecommendationEngine = ({ onGenerate, recommendations, isGenerating, aiError, onSelectItem }: {
    onGenerate: () => void;
    recommendations: RecsResponse;
    isGenerating: boolean;
    aiError: string;
    onSelectItem: (item: any) => void;
}) => (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-white shadow-lg">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Personalized Recommendations</h3>
        <p className="text-gray-600 mb-6">Based on your favorites, here are a few things we think you'll love. Get new ideas anytime!</p>
        <button onClick={onGenerate} disabled={isGenerating} className="w-full bg-teal-600 text-white p-3 rounded-full font-semibold hover:bg-teal-700 disabled:bg-gray-400 mb-6">
            {isGenerating ? 'Thinking...' : 'Get New Recommendations'}
        </button>
        {aiError && <p className="text-red-600 text-center">{aiError}</p>}
        {(recommendations.grosIslet.length > 0 || recommendations.stLucia.length > 0) && (
            <div className="space-y-6 animate-fade-in">
                {recommendations.grosIslet.length > 0 && (
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">For You in Gros-Islet</h4>
                        <div className="space-y-4 pt-2">
                            {recommendations.grosIslet.map(item => (
                                <div key={item.id} onClick={() => onSelectItem({ type: (item as any).type || 'business', data: item })} className="p-4 bg-teal-50/50 rounded-xl border border-teal-200 cursor-pointer hover:bg-teal-100">
                                    <p className="font-bold text-teal-800">{item.name || (item as any).title}</p>
                                    <p className="text-teal-900">{item.reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {recommendations.stLucia.length > 0 && (
                    <div className="pt-4">
                        <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Explore the Rest of St. Lucia</h4>
                         <div className="space-y-4 pt-2">
                            {recommendations.stLucia.map(item => (
                                <div key={item.id} onClick={() => onSelectItem({ type: (item as any).type || 'business', data: item })} className="p-4 bg-teal-50/50 rounded-xl border border-teal-200 cursor-pointer hover:bg-teal-100">
                                    <p className="font-bold text-teal-800">{item.name || (item as any).title}</p>
                                    <p className="text-sm text-gray-600 mb-1 font-medium">{item.location}</p>
                                    <p className="text-teal-900">{item.reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
);

const FeatureHighlight = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white shadow-sm hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-center w-12 h-12 bg-teal-100 text-teal-600 rounded-full mb-4">
            <Icon className="w-6 h-6" />
        </div>
        <h4 className="text-lg font-bold text-gray-900 mb-2">{title}</h4>
        <p className="text-gray-600 text-sm">{children}</p>
    </div>
);

const FeaturesSection = () => (
    <div className="py-12">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900">Your Complete Guide to Gros-Islet</h2>
            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">From finding the perfect restaurant to connecting with the community, everything you need is right here.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureHighlight icon={Search} title="Discover Local Gems">
                Find the best local businesses, skilled workers, and places to stay. Read reviews and find exactly what you need.
            </FeatureHighlight>
            <FeatureHighlight icon={Sparkles} title="AI-Powered Suggestions">
                Get personalized recommendations for activities and places based on your interests and favorite spots.
            </FeatureHighlight>
            <FeatureHighlight icon={MapPin} title="Plan Your Perfect Day">
                Use our AI Itinerary Planner to create a custom schedule for your trip, from beach hopping to fine dining.
            </FeatureHighlight>
            <FeatureHighlight icon={Users} title="Connect with the Community">
                Join discussions in the community forum. Ask questions, get insider tips, and share your experiences with others.
            </FeatureHighlight>
            <FeatureHighlight icon={Newspaper} title="Stay Up-to-Date">
                Never miss out. Get the latest local news, community alerts, and information on upcoming events.
            </FeatureHighlight>
            <FeatureHighlight icon={Building} title="For Business Owners">
                Claim and manage your business profile for free. Update your information, respond to reviews, and connect with customers.
            </FeatureHighlight>
        </div>
    </div>
);


const ForYouView = ({ user, onLoginClick, onGenerateRecommendations, recommendations, isGenerating, aiError, onGenerateItinerary, generatedItinerary, isPlanning, onSelectItem }: {
    user: User | null;
    onLoginClick: () => void;
    onGenerateRecommendations: () => void;
    recommendations: any;
    isGenerating: boolean;
    aiError: string;
    onGenerateItinerary: (criteria: any) => void;
    generatedItinerary: any;
    isPlanning: boolean;
    onSelectItem: (item: any) => void;
}) => (
    <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {user ? (
                <>
                    <RecommendationEngine 
                        onGenerate={onGenerateRecommendations}
                        recommendations={recommendations}
                        isGenerating={isGenerating}
                        aiError={aiError}
                        onSelectItem={onSelectItem}
                    />
                    <ItineraryPlanner 
                        onGenerate={onGenerateItinerary}
                        isPlanning={isPlanning}
                        aiError={aiError}
                        itinerary={generatedItinerary}
                    />
                </>
            ) : (
                <div className="lg:col-span-2 text-center py-16 bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-white shadow-lg">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">Unlock Your Personalized View</h3>
                    <p className="text-gray-600 mb-6">Log in or create a profile to get AI-powered recommendations and build custom itineraries.</p>
                    <button onClick={onLoginClick} className="bg-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-700">Login to Get Started</button>
                </div>
            )}
        </div>
        <FeaturesSection />
    </div>
);

const Chatbot = ({ isOpen, onClose, messages, onSendMessage, isLoading, onStarterClick }: {
    isOpen: boolean;
    onClose: () => void;
    messages: { role: string, content: string }[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    onStarterClick: (prompt: string) => void;
}) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const starterPrompts = [
        "What's the best local food?",
        "Find a plumber",
        "What's happening this weekend?",
        "Recommend a romantic restaurant"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input.trim());
            setInput('');
        }
    };
    
    const handleStarterClick = (prompt: string) => {
        onStarterClick(prompt);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 w-full max-w-md z-50 animate-fade-in-up">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col h-[70vh]">
                <header className="p-4 border-b flex justify-between items-center bg-gray-50/70 rounded-t-3xl">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center"><Sparkles className="w-5 h-5 text-teal-500 mr-2"/>AI Assistant</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close AI Assistant"><X className="w-5 h-5 text-gray-600"/></button>
                </header>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-sm px-4 py-2.5 rounded-2xl whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-gray-100 text-gray-800 rounded-bl-lg'}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                     {messages.length === 1 && (
                        <div className="pt-4 space-y-2">
                             <p className="text-sm text-gray-500 text-center">Try asking one of these:</p>
                             <div className="grid grid-cols-2 gap-2">
                                {starterPrompts.map(prompt => (
                                    <button key={prompt} onClick={() => handleStarterClick(prompt)} className="text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 p-3 rounded-lg text-left transition-colors">{prompt}</button>
                                ))}
                             </div>
                        </div>
                    )}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-lg">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <footer className="p-4 border-t bg-gray-50/70 rounded-b-3xl">
                    <form onSubmit={handleSend} className="flex items-center gap-3">
                        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask anything..." className="w-full p-3 bg-white rounded-full border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                        <button type="submit" className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-300" disabled={!input.trim() || isLoading} aria-label="Send message">
                            <Send className="w-5 h-5"/>
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};

const OwnerDashboard = ({ user, businesses, onSelectItem, onEditItem }: {
    user: User;
    businesses: Business[];
    onSelectItem: (item: any) => void;
    onEditItem: (item: any) => void;
}) => {
    const myBusinesses = (businesses || []).filter(b => b.ownerId === user.id);

    if (myBusinesses.length === 0) {
        return (
            <div className="text-center py-16 bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-white shadow-lg">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Welcome to your Dashboard</h3>
                <p className="text-gray-600 mb-6">You haven't claimed any businesses yet. Head over to the 'Businesses' tab to find and claim your listing!</p>
            </div>
        );
    }

    const totalReviews = myBusinesses.reduce((sum, b) => sum + (b.reviewCount || 0), 0);
    const totalRatingSum = myBusinesses.reduce((sum, b) => sum + (b.rating || 0) * (b.reviewCount || 0), 0);
    const averageRating = totalReviews > 0 ? totalRatingSum / totalReviews : 0;
    
    const myBusinessIds = myBusinesses.map(b => b.id);
    const myBookings = (user.bookings || []).filter(booking => myBusinessIds.includes(booking.itemId));

    return (
        <div className="space-y-8">
            <h2 className="text-4xl font-extrabold text-gray-900">Owner Dashboard</h2>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
                    <h4 className="text-sm font-medium text-gray-500">Businesses Claimed</h4>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{myBusinesses.length}</p>
                </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <h4 className="text-sm font-medium text-gray-500">Total Reviews</h4>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalReviews}</p>
                </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <h4 className="text-sm font-medium text-gray-500">Overall Rating</h4>
                    <div className="flex items-center mt-1">
                        <p className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
                        <Star className="w-6 h-6 text-amber-400 fill-current ml-2" />
                    </div>
                </div>
            </div>

            {/* My Businesses List */}
            <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">My Businesses</h3>
                <div className="space-y-6">
                    {(myBusinesses || []).map(business => (
                        <div key={business.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
                            <img src={business.image} alt={`Image of ${business.name}, one of your claimed businesses`} className="w-full md:w-48 h-32 object-cover rounded-lg" />
                            <div className="flex-1">
                                <h4 className="text-xl font-bold text-gray-900">{business.name}</h4>
                                <div className="flex items-center mt-1">
                                    <Star className="w-5 h-5 text-amber-400 fill-current mr-1" />
                                    <span className="font-bold text-gray-800">{business.rating?.toFixed(1)}</span>
                                    <span className="text-sm text-gray-500 ml-2">({business.reviewCount} reviews)</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{business.description}</p>
                            </div>
                            <div className="flex flex-col md:flex-row gap-3 self-stretch md:self-center">
                                <button onClick={() => onSelectItem({ type: 'business', data: business })} className="px-5 py-2.5 text-sm rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors w-full md:w-auto">View Profile</button>
                                <button onClick={() => onEditItem(business)} className="px-5 py-2.5 text-sm rounded-full bg-black text-white hover:bg-gray-800 transition-colors w-full md:w-auto">Edit Profile</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Bookings */}
            <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Recent Bookings</h3>
                {myBookings.length > 0 ? (
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="space-y-4">
                            {(myBookings.slice(0, 5) || []).map(booking => (
                                <div key={booking.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-800">{booking.itemName}</p>
                                        <p className="text-sm text-gray-600"><Calendar className="w-3 h-3 inline mr-1.5"/> {new Date(booking.date).toLocaleDateString()} @ {booking.time}</p>
                                        <p className="text-sm text-gray-600"><Info className="w-3 h-3 inline mr-1.5"/> {booking.details}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-600 py-8 bg-white rounded-2xl shadow-sm border border-gray-100">You have no upcoming bookings for your businesses.</p>
                )}
            </div>
        </div>
    );
};

const MapView = ({ businesses, events, accommodations, onSelectItem }: {
    businesses: Business[];
    events: Event[];
    accommodations: Accommodation[];
    onSelectItem: (item: any) => void;
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markersLayer = useRef<any>(null);

    const allItems = useMemo(() => [
        ...businesses.map(b => ({ ...b, itemType: 'business', type: b.category })),
        ...events.map(e => ({ ...e, itemType: 'event', name: e.title, type: e.category })),
        ...accommodations.map(a => ({ ...a, itemType: 'accommodation' }))
    ], [businesses, events, accommodations]);

    const categories = useMemo(() => {
        const cats = new Set(allItems.map(item => item.type).filter(Boolean));
        return ['All', ...Array.from(cats)];
    }, [allItems]);
    
    const [selectedCategories, setSelectedCategories] = useState(['All']);

    const filteredItems = useMemo(() => {
        const itemsWithCoords = allItems.filter(item => item.latitude && item.longitude);
        if (selectedCategories.includes('All')) {
            return itemsWithCoords;
        }
        return itemsWithCoords.filter(item => selectedCategories.includes(item.type));
    }, [allItems, selectedCategories]);

    const categoryColors = useMemo(() => {
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];
        const colorMap: { [key: string]: string } = {};
        let i = 0;
        categories.forEach(cat => {
            if (cat !== 'All') {
                colorMap[cat] = colors[i % colors.length];
                i++;
            }
        });
        return colorMap;
    }, [categories]);

    const createMarkerIcon = (color: string) => L.divIcon({
        html: `<svg viewBox="0 0 24 24" width="32" height="32" fill="${color}" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
        className: 'custom-map-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    useEffect(() => {
        if (mapRef.current && !mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView([14.077, -60.953], 14);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstance.current);
            markersLayer.current = L.layerGroup().addTo(mapInstance.current);
        }
         // Invalidate map size when it becomes visible
        setTimeout(() => {
            mapInstance.current?.invalidateSize();
        }, 100);
    }, []);

    useEffect(() => {
        if (!mapInstance.current || !markersLayer.current) return;
        markersLayer.current.clearLayers();

        filteredItems.forEach(item => {
            const popupContent = `
                <div class="map-popup">
                    <img src="${item.image}" alt="${item.name || item.title}" class="popup-image"/>
                    <h4 class="popup-title">${item.name || item.title}</h4>
                    <p class="popup-category">${item.type}</p>
                    <button class="popup-button" data-id="${item.id}" data-type="${item.itemType}">View Details</button>
                </div>
            `;
            const color = categoryColors[item.type] || '#777777';
            L.marker([item.latitude!, item.longitude!], { icon: createMarkerIcon(color) })
                .addTo(markersLayer.current)
                .bindPopup(popupContent);
        });
    }, [filteredItems, categoryColors]);

    useEffect(() => {
        const mapContainer = mapRef.current;
        if (!mapContainer) return;

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.matches('.popup-button')) {
                const id = parseInt(target.getAttribute('data-id')!, 10);
                const itemType = target.getAttribute('data-type');
                const fullItem = allItems.find(item => item.id === id);
                if (fullItem) {
                    const finalType = 'plateNumber' in fullItem ? 'taxi' : itemType;
                    onSelectItem({ type: finalType, data: fullItem });
                }
            }
        };

        mapContainer.addEventListener('click', handleClick);
        return () => mapContainer.removeEventListener('click', handleClick);
    }, [allItems, onSelectItem]);

    const handleFilterChange = (category: string) => {
        setSelectedCategories(prev => {
            if (category === 'All') return ['All'];
            const withoutAll = prev.filter(c => c !== 'All');
            if (withoutAll.includes(category)) {
                const newCats = withoutAll.filter(c => c !== category);
                return newCats.length === 0 ? ['All'] : newCats;
            } else {
                return [...withoutAll, category];
            }
        });
    };

    return (
        <div className="map-view-container">
            <div className="map-filters">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => handleFilterChange(cat)}
                        className={`px-4 py-2 text-xs md:text-sm font-medium rounded-full transition-colors ${selectedCategories.includes(cat) ? 'bg-blue-600 text-white shadow' : 'bg-white/80 text-gray-700 hover:bg-gray-200'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div ref={mapRef} className="leaflet-map"></div>
        </div>
    );
};

const AdminPage = ({
    user,
    onLogout,
    onSwitchView,
    users,
    businesses,
    workers,
    accommodations,
    taxis,
    events,
    onEditItem,
    onDeleteItem,
    onToggleVerify,
    onUpdateUser,
}: {
    user: User;
    onLogout: () => void;
    onSwitchView: () => void;
    users: User[];
    businesses: Business[];
    workers: SkilledWorker[];
    accommodations: Accommodation[];
    taxis: Taxi[];
    events: Event[];
    onEditItem: (item: any) => void;
    onDeleteItem: (id: number, type: string) => void;
    onToggleVerify: (id: number, type: string) => void;
    onUpdateUser: (id: number, newType: string) => void;
}) => {
    const [activeSection, setActiveSection] = useState('dashboard');

    const sections = {
        dashboard: { title: 'Dashboard', icon: LayoutDashboard },
        analytics: { title: 'Analytics', icon: BarChart2 },
        users: { title: 'User Management', icon: Users },
        businesses: { title: 'Businesses', icon: Building },
        workers: { title: 'Skilled Workers', icon: Wrench },
        accommodations: { title: 'Accommodations', icon: BedDouble },
        taxis: { title: 'Taxis', icon: Car },
        events: { title: 'Events', icon: Calendar },
    };

    const contentData = {
        users: users,
        businesses: businesses,
        workers: workers,
        accommodations: accommodations,
        taxis: taxis,
        events: events,
    };
    
    const renderDashboard = () => <AdminDashboard users={users} businesses={businesses} workers={workers} accommodations={accommodations} taxis={taxis} events={events} />;
    
    const renderAnalytics = () => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Advanced Analytics</h2>
            <p className="text-gray-600">This section will contain more in-depth charts and data reporting features in a future update.</p>
        </div>
    );


    const renderContent = () => {
        switch(activeSection) {
            case 'dashboard': return renderDashboard();
            case 'analytics': return renderAnalytics();
            default:
                if (contentData.hasOwnProperty(activeSection)) {
                    return <AdminDataTable 
                        dataType={activeSection}
                        data={contentData[activeSection as keyof typeof contentData]}
                        onEditItem={onEditItem}
                        onDeleteItem={onDeleteItem}
                        onToggleVerify={onToggleVerify}
                        onUpdateUser={onUpdateUser}
                    />;
                }
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans antialiased text-gray-800">
            <aside className="w-64 flex-shrink-0 bg-white shadow-lg flex flex-col">
                <div className="flex items-center gap-2 px-4 py-4 border-b">
                    <Briefcase className="w-7 h-7 text-blue-600"/>
                    <span className="text-2xl font-bold text-gray-900">Admin Panel</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {Object.entries(sections).map(([key, { title, icon: Icon }]) => (
                        <button
                            key={key}
                            onClick={() => setActiveSection(key)}
                            className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${activeSection === key ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            <Icon className="w-5 h-5" /> {title}
                        </button>
                    ))}
                </nav>
                <div className="p-4 mt-auto border-t">
                     <button onClick={onSwitchView} className="w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 text-gray-700 hover:bg-gray-100">
                        <LayoutGrid className="w-5 h-5" /> View Public Site
                    </button>
                </div>
            </aside>
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10 border-b">
                     <h1 className="text-2xl font-bold text-gray-900">{sections[activeSection as keyof typeof sections].title}</h1>
                     <div className="flex items-center gap-4">
                        <div className="text-right">
                           <p className="font-semibold">{user.username}</p>
                           <p className="text-sm text-gray-500">Administrator</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">{user.username.charAt(0).toUpperCase()}</div>
                        <button onClick={onLogout} className="p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors" aria-label="Logout">
                           <LogIn className="w-5 h-5 transform -scale-x-100" />
                        </button>
                    </div>
                </header>
                <main className="flex-1 p-8 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

// --- START OF ENTERPRISE ADMIN COMPONENTS ---

const AdminDashboard = ({ users, businesses, workers, accommodations, taxis, events }: {
    users: User[];
    businesses: Business[];
    workers: SkilledWorker[];
    accommodations: Accommodation[];
    taxis: Taxi[];
    events: Event[];
}) => {
    const totalUsers = users.length;
    const totalListings = businesses.length + workers.length + accommodations.length + taxis.length + events.length;
    const pendingVerifications = [...businesses, ...workers, ...accommodations, ...taxis]
        .filter(item => item.hasOwnProperty('verified') && !item.verified).length;
    const totalBookings = users.reduce((sum, u) => sum + (u.bookings?.length || 0), 0);

    const contentDistributionData = [
        { name: 'Businesses', count: businesses.length, fill: '#3B82F6' },
        { name: 'Workers', count: workers.length, fill: '#10B981' },
        { name: 'Stays', count: accommodations.length, fill: '#8B5CF6' },
        { name: 'Taxis', count: taxis.length, fill: '#F59E0B' },
        { name: 'Events', count: events.length, fill: '#EF4444' },
    ];
    
    // Create mock user registration data for the chart
    const userRegistrationData = useMemo(() => {
        const dataPoints: { [key: string]: number } = {};
        users.forEach((user, index) => {
            // Simulate dates based on index
            const date = new Date();
            date.setDate(date.getDate() - (users.length - index));
            const month = date.toLocaleString('default', { month: 'short' });
            dataPoints[month] = (dataPoints[month] || 0) + 1;
        });
        return Object.entries(dataPoints).map(([name, users]) => ({ name, users }));
    }, [users]);
    
    const recentUsers = [...users].sort((a,b) => b.id - a.id).slice(0, 5);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 animate-fade-in-up">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-full"><Users className="w-6 h-6"/></div>
                    <div><p className="text-sm font-medium text-gray-500">Total Users</p><p className="text-3xl font-bold text-gray-900 mt-1">{totalUsers}</p></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="bg-green-100 text-green-600 p-3 rounded-full"><Briefcase className="w-6 h-6"/></div>
                    <div><p className="text-sm font-medium text-gray-500">Total Listings</p><p className="text-3xl font-bold text-gray-900 mt-1">{totalListings}</p></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <div className="bg-amber-100 text-amber-600 p-3 rounded-full"><AlertCircle className="w-6 h-6"/></div>
                    <div><p className="text-sm font-medium text-gray-500">Pending Verifications</p><p className="text-3xl font-bold text-gray-900 mt-1">{pendingVerifications}</p></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full"><Calendar className="w-6 h-6"/></div>
                    <div><p className="text-sm font-medium text-gray-500">Total Bookings</p><p className="text-3xl font-bold text-gray-900 mt-1">{totalBookings}</p></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">User Registrations</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={userRegistrationData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                <XAxis dataKey="name" tick={{fontSize: 12}}/>
                                <YAxis allowDecimals={false} tick={{fontSize: 12}} />
                                <Tooltip />
                                <Legend wrapperStyle={{fontSize: "14px"}}/>
                                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Content Distribution</h3>
                     <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={contentDistributionData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tick={{fontSize: 12}} width={80} />
                                <Tooltip />
                                <Bar dataKey="count" barSize={20} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Registrations</h3>
                 <div className="space-y-3">
                    {recentUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-800">{user.username}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs rounded-full capitalize ${user.type === 'admin' ? 'bg-red-100 text-red-800' : user.type === 'owner' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{user.type}</span>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};

const AdminDataTable = ({ dataType, data, onEditItem, onDeleteItem, onToggleVerify, onUpdateUser }: {
    dataType: string;
    data: any[];
    onEditItem: (item: any) => void;
    onDeleteItem: (id: number, type: string) => void;
    onToggleVerify: (id: number, type: string) => void;
    onUpdateUser: (id: number, newType: string) => void;
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const itemsPerPage = 10;

    const isUserTable = dataType === 'users';

    const columns = useMemo(() => {
        if (isUserTable) return [
            { key: 'username', header: 'Username' },
            { key: 'email', header: 'Email' },
            { key: 'type', header: 'Role' },
        ];
        return [
            { key: 'name', header: 'Name' },
            { key: 'category', header: 'Category/Skill' },
            { key: 'verified', header: 'Status' },
        ];
    }, [isUserTable]);

    const filteredData = useMemo(() => {
        let filtered = data.filter(item => {
            const name = item.name || item.title || item.driverName || item.username || '';
            const category = item.category || item.skill || item.type || item.vehicleType || '';
            return name.toLowerCase().includes(searchTerm.toLowerCase()) || category.toLowerCase().includes(searchTerm.toLowerCase());
        });

        if (filter !== 'all') {
            const filterKey = isUserTable ? 'type' : 'verified';
            const filterValue = filter === 'verified' ? true : (filter === 'unverified' ? false : filter);
            filtered = filtered.filter(item => item[filterKey] === filterValue);
        }
        
        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [data, searchTerm, filter, sortConfig]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage]);
    
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const requestSort = (key: string) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedItems(new Set(paginatedData.map(item => item.id)));
        } else {
            setSelectedItems(new Set());
        }
    };

    const handleSelectItem = (id: number) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleBulkDelete = () => {
        if(window.confirm(`Are you sure you want to delete ${selectedItems.size} items?`)){
            selectedItems.forEach(id => onDeleteItem(id, dataType));
            setSelectedItems(new Set());
            toast.success(`${selectedItems.size} items deleted.`);
        }
    };
    
    const handleBulkVerify = () => {
        selectedItems.forEach(id => onToggleVerify(id, dataType));
        setSelectedItems(new Set());
        toast.success(`${selectedItems.size} items' verification status updated.`);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select 
                    value={filter}
                    onChange={e => { setFilter(e.target.value); setCurrentPage(1); }} 
                    className="w-full md:w-auto p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500">
                    <option value="all">All</option>
                    {isUserTable ? (
                        <>
                            <option value="user">User</option>
                            <option value="owner">Owner</option>
                        </>
                    ) : (
                        <>
                            <option value="verified">Verified</option>
                            <option value="unverified">Unverified</option>
                        </>
                    )}
                </select>
            </div>
            {selectedItems.size > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                    <p className="text-sm font-medium text-blue-800">{selectedItems.size} items selected</p>
                    <div className="flex gap-2">
                        {!isUserTable && <button onClick={handleBulkVerify} className="px-3 py-1.5 text-xs rounded-md bg-green-100 text-green-800 hover:bg-green-200">Verify</button>}
                        <button onClick={handleBulkDelete} className="px-3 py-1.5 text-xs rounded-md bg-red-100 text-red-800 hover:bg-red-200">Delete</button>
                    </div>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                        <tr className="border-b">
                             <th className="p-4 w-12"><input type="checkbox" onChange={handleSelectAll} checked={selectedItems.size > 0 && selectedItems.size === paginatedData.length} className="rounded" /></th>
                            {columns.map(col => (
                                <th key={col.key} className="text-left p-4 font-semibold text-gray-600">
                                    <button onClick={() => requestSort(col.key)} className="flex items-center gap-2">
                                        {col.header}
                                        <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                                    </button>
                                </th>
                            ))}
                            <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(item => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="p-4"><input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => handleSelectItem(item.id)} className="rounded" /></td>
                                <td className="p-4 font-medium text-gray-900">{item.name || item.title || item.driverName || item.username}</td>
                                <td className="p-4 text-gray-700">{item.category || item.skill || item.type || item.vehicleType || item.email}</td>
                                <td className="p-4">
                                    {isUserTable ? (
                                        <span className={`px-3 py-1 text-xs rounded-full capitalize font-medium ${item.type === 'admin' ? 'bg-red-100 text-red-800' : item.type === 'owner' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{item.type}</span>
                                    ) : item.hasOwnProperty('verified') ? (
                                        <button onClick={() => onToggleVerify(item.id, dataType)} className={`px-3 py-1 text-xs rounded-full font-medium ${item.verified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                            {item.verified ? 'Verified' : 'Unverified'}
                                        </button>
                                    ) : <span className="text-xs text-gray-400">N/A</span>}
                                </td>
                                <td className="p-4 flex gap-2 items-center">
                                    {isUserTable ? (
                                        item.type !== 'admin' && (
                                            <select value={item.type} onChange={(e) => { if(window.confirm(`Change ${item.username}'s role to ${e.target.value}?`)) onUpdateUser(item.id, e.target.value) }} className="p-2 border rounded-md bg-white text-sm">
                                                <option value="user">User</option>
                                                <option value="owner">Owner</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        )
                                    ) : (
                                        <>
                                            <button onClick={() => onEditItem(item)} className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => { if(window.confirm('Are you sure? This cannot be undone.')) onDeleteItem(item.id, dataType) }} className="p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
                <p>Page {currentPage} of {totalPages}</p>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 border rounded-md disabled:opacity-50">Previous</button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 border rounded-md disabled:opacity-50">Next</button>
                </div>
            </div>
        </div>
    );
};

// --- END OF ENTERPRISE ADMIN COMPONENTS ---


const BusinessDirectory = () => {
  const [activeTab, setActiveTab] = useState('for-you');
  const [data, setData] = useState<AppData>({
    businesses: [],
    events: [],
    historicalContent: [],
    news: [],
    skilledWorkers: [],
    accommodations: [],
    taxis: [],
    communityForums: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([
     { id: 1, username: 'owner1', pin: '1111', type: 'owner', email: 'owner@test.com', favorites: [], loyalty: {}, bookings: [] },
     { id: 2, username: 'user1', pin: '2222', type: 'user', email: 'user@test.com', favorites: [], loyalty: {}, bookings: [] },
     { id: 99, username: 'admin', pin: '9999', type: 'admin', email: 'admin@test.com', favorites: [], loyalty: {}, bookings: [] },
  ]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [tourData, setTourData] = useState({ imageUrl: '', title: '' });

  const [selectedThread, setSelectedThread] = useState<CommunityForum | null>(null);
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: 'model', content: "Hello! I'm your AI assistant for Gros-Islet. How can I help you today?" }]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [aiChat, setAiChat] = useState<Chat | null>(null);

  const [recommendations, setRecommendations] = useState<RecsResponse>({ grosIslet: [], stLucia: [] });
  const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);
  const [recsError, setRecsError] = useState('');
  
  const [generatedItinerary, setGeneratedItinerary] = useState<any>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [itineraryError, setItineraryError] = useState('');

  const [isAdminView, setIsAdminView] = useState(false);
  const [animatingFavorites, setAnimatingFavorites] = useState<Set<number>>(new Set());


  useEffect(() => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are a friendly and helpful tour guide for Gros-Islet, a town in St. Lucia. Your knowledge base consists of the following data: ${JSON.stringify(data)}. Answer questions based only on this data. If a question cannot be answered from the data, say "I'm sorry, I don't have information on that topic."`,
            },
        });
        setAiChat(chatInstance);
    } catch (e) {
        console.error("Failed to initialize AI:", e);
    }
  }, [data]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await mockApi.fetchData();
        setData(result);
      } catch (err) {
        setError('Failed to load data.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  
  const handleSelectItem = useCallback((item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedThread(null);
    setTimeout(() => setSelectedItem(null), 300);
  }, []);
  
  const handleLogin = useCallback((credentials: { username: string, pin: string }) => {
    const foundUser = registeredUsers.find(u => u.username === credentials.username && u.pin === credentials.pin);
    if (foundUser) {
      setUser(foundUser);
      setIsLoginModalOpen(false);
      toast.success(`Welcome back, ${foundUser.username}!`);
      if(foundUser.type === 'admin') {
        setIsAdminView(true);
        setActiveTab('admin');
      }
    } else {
      toast.error('Invalid username or PIN.');
    }
  }, [registeredUsers]);
  
  const handleLogout = useCallback(() => {
    toast.success("You've been logged out.");
    setUser(null);
    setIsAdminView(false);
    setActiveTab('for-you');
  }, []);

  const handleRegister = useCallback((newUser: { username: string, pin: string, type: string, email: string }) => {
    if (registeredUsers.some(u => u.username === newUser.username)) {
      toast.error('Username already exists.');
      return;
    }
    const userWithId: User = { ...newUser, type: newUser.type as 'user' | 'owner', id: Date.now(), favorites: [], loyalty: {}, bookings: [] };
    setRegisteredUsers(prev => [...prev, userWithId]);
    setUser(userWithId);
    setIsLoginModalOpen(false);
    toast.success('Registration successful!');
  }, [registeredUsers]);
  
  const handlePinReset = useCallback((username: string, newPin: string) => {
    setRegisteredUsers(prev => prev.map(u => u.username === username ? { ...u, pin: newPin } : u));
    toast.success(`PIN for ${username} has been successfully reset.`);
  }, []);
  
  const handleToggleFavorite = useCallback(async (id: number, type: string) => {
    if (!user) {
        setIsLoginModalOpen(true);
        return;
    }

    await mockApi.toggleFavorite(id, type);

    const isFavorited = user.favorites.some(fav => fav.id === id && fav.type === type);
    
    // Add shake animation only when adding a favorite
    if (!isFavorited) {
        setAnimatingFavorites(prev => new Set(prev).add(id));
        setTimeout(() => {
            setAnimatingFavorites(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }, 600);
    }

    const updatedFavorites = isFavorited
        ? user.favorites.filter(fav => !(fav.id === id && fav.type === type))
        : [...user.favorites, { id, type }];

    const updatedUser = { ...user, favorites: updatedFavorites };
    setUser(updatedUser);
    setRegisteredUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));

    const dataKey = {
      'worker': 'skilledWorkers',
      'accommodation': 'accommodations',
      'taxi': 'taxis',
      'event': 'events',
      'news': 'news',
      'heritage': 'historicalContent',
      'business': 'businesses',
    }[type] || `${type}s`;

    if (data[dataKey as keyof AppData]) {
        setData(prev => ({
            ...prev,
            [dataKey]: (prev[dataKey as keyof AppData] as any[]).map(item => item.id === id ? { ...item, favorited: !item.favorited } : item)
        }));
    }
  }, [user, data]);


  const handleAddItem = useCallback(async (itemData: AddFormData) => {
    const type = activeTab;
    
    const formattedData: any = {
        ...itemData,
        id: Date.now(),
        rating: 0,
        reviewCount: 0,
        reviews: [],
        verified: user?.type === 'admin',
        favorited: false,
    };

    if (type === 'businesses') {
        formattedData.loyaltyProgram = { enabled: itemData.loyaltyEnabled, offer: itemData.loyaltyOffer, goal: parseInt(itemData.loyaltyGoal as string, 10) || 0 };
        formattedData.socials = { facebook: itemData.facebook, instagram: itemData.instagram, twitter: itemData.twitter };
        formattedData.tags = itemData.tags ? itemData.tags.split(',').map(t => t.trim()) : [];
    }

    if (type === 'stays') {
        if(itemData.type === 'Accommodation') {
            formattedData.amenities = itemData.amenities ? itemData.amenities.split(',').map(t => t.trim()) : [];
            const newItem = await mockApi.addItem(formattedData) as Accommodation;
            setData(prev => ({ ...prev, accommodations: [...prev.accommodations, newItem] }));
        } else {
            const newItem = await mockApi.addItem(formattedData) as Taxi;
            setData(prev => ({ ...prev, taxis: [...prev.taxis, newItem] }));
        }
    } else {
        const newItem: any = await mockApi.addItem(formattedData);
        setData(prev => ({ ...prev, [type]: [...prev[type as keyof AppData], newItem] }));
    }
    
    setIsAddModalOpen(false);
  }, [activeTab, user]);


  const handleEditItem = useCallback(async (itemData: any) => {
    const itemType = itemData.plateNumber ? 'taxis' : (itemData.amenities ? 'accommodations' : (itemData.skill ? 'skilledWorkers' : (itemData.organizer ? 'events' : 'businesses')));
    
    const formattedData = { ...itemData };
    if (itemType === 'businesses') {
      formattedData.loyaltyProgram = { enabled: itemData.loyaltyEnabled, offer: itemData.loyaltyOffer, goal: parseInt(itemData.loyaltyGoal, 10) || 0 };
      formattedData.socials = { facebook: itemData.facebook, instagram: itemData.instagram, twitter: itemData.twitter };
      formattedData.tags = typeof itemData.tags === 'string' ? itemData.tags.split(',').map(t => t.trim()) : itemData.tags;
    }
     if (itemType === 'accommodations') {
       formattedData.amenities = typeof itemData.amenities === 'string' ? itemData.amenities.split(',').map(t => t.trim()) : itemData.amenities;
    }
    
    const updatedItem = await mockApi.updateItem(formattedData);

    setData(prev => ({
        ...prev,
        [itemType]: (prev[itemType as keyof AppData] as any[]).map(item => item.id === (updatedItem as any).id ? updatedItem : item)
    }));
    toast.success('Listing updated successfully!');
    setIsAddModalOpen(false);
    setIsEditMode(false);
    setItemToEdit(null);
  }, []);

  const openEditModal = useCallback((item: any) => {
    setItemToEdit(item);
    setIsEditMode(true);
    setIsAddModalOpen(true);
  }, []);

  const handleReviewSubmit = useCallback(async (itemId: number, reviewData: { rating: number, comment: string }) => {
    if(!user) return;
    const review = {
        id: Date.now(),
        author: user.username,
        date: new Date().toISOString().split('T')[0],
        ...reviewData
    };
    await mockApi.submitReview(review);
    toast.success('Thank you! Your review has been submitted.');
    
    const itemType = selectedItem?.data?.skill ? 'skilledWorkers' : 'businesses';

    setData(prev => ({
        ...prev,
        [itemType]: (prev[itemType as keyof AppData] as any[]).map(item => {
            if (item.id === itemId) {
                const newReviews = [review, ...(item.reviews || [])];
                const newTotalRating = newReviews.reduce((sum, r) => sum + r.rating, 0);
                const newReviewCount = newReviews.length;
                return {
                    ...item,
                    reviews: newReviews,
                    reviewCount: newReviewCount,
                    rating: newTotalRating / newReviewCount
                };
            }
            return item;
        })
    }));

    setSelectedItem((prev: any) => {
        if (!prev || prev.data.id !== itemId) return prev;
        const currentItem = (data[itemType as keyof AppData] as any[]).find(i => i.id === itemId);
        const newReviews = [review, ...(currentItem.reviews || [])];
        const newTotalRating = newReviews.reduce((sum, r) => sum + r.rating, 0);
        const newReviewCount = newReviews.length;
        return {
            ...prev,
            data: {
                ...currentItem,
                reviews: newReviews,
                reviewCount: newReviewCount,
                rating: newTotalRating / newReviewCount
            }
        };
    });
  }, [user, data, selectedItem]);
  
  const handleTourView = useCallback((imageUrl: string, title: string) => {
    setTourData({ imageUrl, title });
    setIsTourModalOpen(true);
  }, []);
  
  const handleLoyaltyAction = useCallback(async (businessId: number, action: 'collect' | 'redeem') => {
    if(!user) return;
    await mockApi.updateLoyalty(businessId, action);
    const business = data.businesses.find(b => b.id === businessId);
    if (!business || !business.loyaltyProgram.goal) return;

    const currentProgress = user.loyalty?.[businessId]?.progress || 0;
    let newProgress = currentProgress;
    
    if (action === 'collect') {
      newProgress += 1;
      toast.success('Stamp collected!');
    } else if (action === 'redeem') {
      newProgress = currentProgress - business.loyaltyProgram.goal;
      toast.success('Offer redeemed! Enjoy!');
    }

    const updatedUser = {
      ...user,
      loyalty: {
        ...user.loyalty,
        [businessId]: { progress: newProgress }
      }
    };
    setUser(updatedUser);
    setRegisteredUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));

  }, [user, data.businesses]);
  
  const handleNewBooking = useCallback(async (bookingDetails: Omit<Booking, 'id'>) => {
    if (!user) {
        setIsLoginModalOpen(true);
        return;
    }
    const booking = {
        id: Date.now(),
        ...bookingDetails
    };
    await mockApi.createBooking(booking);
    
    const updatedUser = { ...user, bookings: [...(user.bookings || []), booking] };
    setUser(updatedUser);
    setRegisteredUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    toast.success('Booking successful!');
  }, [user]);

  const handleCancelBooking = useCallback(async (bookingId: number) => {
    if (!user) return;
    if (window.confirm('Are you sure you want to cancel this booking?')) {
        await mockApi.cancelBooking(bookingId);
        const updatedUser = { ...user, bookings: user.bookings.filter(b => b.id !== bookingId) };
        setUser(updatedUser);
        setRegisteredUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
        toast.success('Booking cancelled.');
    }
  }, [user]);

  const handleNewThread = useCallback(async (threadData: { title: string, content: string }) => {
    if(!user) return;
    const thread = {
      id: Date.now(),
      author: user.username,
      date: new Date().toISOString().split('T')[0],
      replies: [],
      ...threadData
    };
    const newThread = await mockApi.createThread(thread) as CommunityForum;
    setData(prev => ({ ...prev, communityForums: [newThread, ...prev.communityForums] }));
    toast.success('New discussion posted!');
  }, [user]);

  const handleNewReply = useCallback(async (threadId: number, replyData: { content: string }) => {
    if(!user) return;
    const reply = {
      id: Date.now(),
      author: user.username,
      date: new Date().toISOString().split('T')[0],
      ...replyData
    };
    await mockApi.postReply(reply);
    toast.success('Reply posted!');

    setData(prev => ({
      ...prev,
      communityForums: prev.communityForums.map(thread => 
        thread.id === threadId 
          ? { ...thread, replies: [...thread.replies, reply] }
          : thread
      )
    }));

    setSelectedThread(prev => prev && prev.id === threadId ? { ...prev, replies: [...prev.replies, reply] } : prev);
  }, [user]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!aiChat) return;

    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsChatLoading(true);

    try {
        const response = await aiChat.sendMessage({ message });
        const text = response.text;
        setChatMessages(prev => [...prev, { role: 'model', content: text }]);
    } catch (e) {
        console.error("AI chat error:", e);
        setChatMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
        setIsChatLoading(false);
    }
  }, [aiChat]);

  const handleGenerateRecommendations = useCallback(async () => {
    setIsGeneratingRecs(true);
    setRecsError('');
    setRecommendations({ grosIslet: [], stLucia: [] });

    const favorites = user?.favorites || [];
    if (favorites.length === 0) {
      setRecsError("Add some items to your favorites to get personalized recommendations!");
      setIsGeneratingRecs(false);
      return;
    }

    const favoritedItems = favorites.map(({ id, type }) => {
        const key = {
          'worker': 'skilledWorkers',
          'accommodation': 'accommodations',
          'taxi': 'taxis',
          'event': 'events',
          'news': 'news',
          'heritage': 'historicalContent',
          'business': 'businesses',
        }[type] || `${type}s`;
        return (data[key as keyof AppData] as any[])?.find(item => item.id === id);
    }).filter(Boolean);

    const prompt = `Based on a user's interest in these places in St. Lucia: ${JSON.stringify(favoritedItems.map(f => f.name || f.title))}.
    Please recommend 2 other things in Gros-Islet and 2 other things from the rest of St. Lucia they might like from this list: ${JSON.stringify(data.businesses)}.
    For each recommendation, provide the item's id, name, and location, and a short, compelling "reason" (around 15-20 words) why they would like it based on their favorites.`;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        grosIslet: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.NUMBER },
                                    name: { type: Type.STRING },
                                    reason: { type: Type.STRING }
                                }
                            }
                        },
                        stLucia: {
                             type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.NUMBER },
                                    name: { type: Type.STRING },
                                    location: { type: Type.STRING },
                                    reason: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });

        const jsonResponse: RecsResponse = JSON.parse(response.text);
        
        const fullGrosIsletRecs = jsonResponse.grosIslet.map(rec => {
           const fullItem = data.businesses.find(b => b.id === rec.id);
           return { ...fullItem, reason: rec.reason };
        }).filter(Boolean);

        const fullStLuciaRecs = jsonResponse.stLucia.map(rec => {
           const fullItem = data.businesses.find(b => b.id === rec.id);
           return { ...fullItem, reason: rec.reason, location: rec.location };
        }).filter(Boolean);

        setRecommendations({ grosIslet: fullGrosIsletRecs as any, stLucia: fullStLuciaRecs as any });

    } catch (e) {
        console.error("Recommendation generation failed:", e);
        setRecsError("Sorry, I couldn't generate recommendations right now.");
    } finally {
        setIsGeneratingRecs(false);
    }
  }, [user, data]);
  
  const handleGenerateItinerary = useCallback(async (criteria: any) => {
    setIsPlanning(true);
    setItineraryError('');
    setGeneratedItinerary(null);
    
    const prompt = `Create a ${criteria.duration} itinerary for someone visiting Gros-Islet, St. Lucia.
    Their interests are: ${criteria.interests.join(', ')}.
    Their budget is ${criteria.budget}.
    Use the following list of businesses and attractions to build the itinerary: ${JSON.stringify(data.businesses)}.
    Provide a creative title for the plan and a sequence of activities with a suggested time (e.g., "9:00 AM", "1:00 PM"), the name of the activity, the location, and a short, engaging description for each step.`;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        planTitle: { type: Type.STRING },
                        itinerary: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    time: { type: Type.STRING },
                                    activity: { type: Type.STRING },
                                    location: { type: Type.STRING },
                                    description: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        const jsonResponse = JSON.parse(response.text);
        setGeneratedItinerary(jsonResponse);
    } catch (e) {
        console.error("Itinerary generation failed:", e);
        setItineraryError("Sorry, I couldn't generate an itinerary right now.");
    } finally {
        setIsPlanning(false);
    }
  }, [data.businesses]);

  const handleClaimBusiness = useCallback(async (businessId: number) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    if (user.type !== 'owner') {
      toast.error("Only users registered as Business Owners can claim listings.");
      return;
    }
    await mockApi.claimBusiness(businessId, user.id);
    setData(prev => ({
        ...prev,
        businesses: prev.businesses.map(b => b.id === businessId ? { ...b, ownerId: user.id } : b)
    }));
    toast.success("Business claimed successfully!");
  }, [user]);

  const handleDeleteItem = useCallback(async (id: number, type: string) => {
    setData(prev => ({
        ...prev,
        [type]: (prev[type as keyof AppData] as any[]).filter(item => item.id !== id)
    }));
  }, []);

  const handleToggleVerify = useCallback(async (id: number, type: string) => {
    setData(prev => ({
        ...prev,
        [type]: (prev[type as keyof AppData] as any[]).map(item => item.id === id ? { ...item, verified: !item.verified } : item)
    }));
  }, []);
  
  const handleUpdateUser = useCallback(async (id: number, newType: string) => {
      setRegisteredUsers(prev => prev.map(u => u.id === id ? { ...u, type: newType as 'user' | 'owner' | 'admin' } : u));
      toast.success("User role updated.");
  }, []);

  const combinedStays = useMemo(() => [...data.accommodations, ...data.taxis], [data.accommodations, data.taxis]);

  const filteredData = useMemo(() => {
    let items: any[];
    switch (activeTab) {
        case 'businesses': items = data.businesses; break;
        case 'workers': items = data.skilledWorkers; break;
        case 'stays': items = combinedStays; break;
        case 'news': items = data.news; break;
        case 'events': items = data.events; break;
        case 'heritage': items = data.historicalContent; break;
        case 'community': items = data.communityForums; break;
        default: items = [];
    }
    
    if (!searchTerm) return items;
    
    const lowercasedTerm = searchTerm.toLowerCase();
    return items.filter(item => {
        const name = item.name || item.title || item.driverName || '';
        const description = item.description || item.summary || '';
        const tags = Array.isArray(item.tags) ? item.tags.join(' ') : '';
        const category = item.category || item.skill || '';
        return name.toLowerCase().includes(lowercasedTerm) ||
               description.toLowerCase().includes(lowercasedTerm) ||
               tags.toLowerCase().includes(lowercasedTerm) ||
               category.toLowerCase().includes(lowercasedTerm);
    });
  }, [searchTerm, activeTab, data, combinedStays]);

  const handleTabClick = (tabId: string) => {
    if (tabId === 'admin' && user?.type === 'admin') {
      setIsAdminView(true);
    }
    setActiveTab(tabId);
  };

  const renderContent = () => {
    if (isLoading) return <div className="text-center p-12"><div className="w-12 h-12 border-4 border-t-transparent border-gray-800 rounded-full animate-spin mx-auto"></div></div>;
    if (error) return <p>{error}</p>;

    switch (activeTab) {
      case 'for-you':
        return <ForYouView 
          user={user} 
          onLoginClick={() => setIsLoginModalOpen(true)}
          onGenerateRecommendations={handleGenerateRecommendations}
          recommendations={recommendations}
          isGenerating={isGeneratingRecs}
          aiError={recsError}
          onGenerateItinerary={handleGenerateItinerary}
          generatedItinerary={generatedItinerary}
          isPlanning={isPlanning}
          onSelectItem={handleSelectItem}
        />;
      case 'map':
        return <MapView 
          businesses={data.businesses}
          events={data.events}
          accommodations={data.accommodations}
          onSelectItem={handleSelectItem}
        />;
      case 'heritage':
        return <TimelineView items={filteredData as HistoricalContent[]} onSelectItem={handleSelectItem} />;
      case 'community':
        return <CommunityView forums={filteredData as CommunityForum[]} user={user} onNewThread={handleNewThread} onSelectThread={(thread) => { setSelectedThread(thread); setIsModalOpen(true); }}/>;
      default:
        return (
          <>
            <div className="flex justify-end items-center mb-6">
                 <div>
                    <button onClick={() => setViewMode('grid')} aria-label="Grid View" className={`p-2 rounded-full ${viewMode === 'grid' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}><LayoutGrid/></button>
                    <button onClick={() => setViewMode('list')} aria-label="List View" className={`p-2 rounded-full ml-2 ${viewMode === 'list' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}><List/></button>
                 </div>
            </div>
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' : 'space-y-6'}`}>
              {filteredData.map(item => <ItemCard key={item.id} item={item} onSelectItem={handleSelectItem} onToggleFavorite={handleToggleFavorite} user={user} viewMode={viewMode} isAnimating={animatingFavorites.has(item.id)} />)}
            </div>
          </>
        );
    }
  };
  
  if (user?.type === 'admin' && isAdminView) {
    return <AdminPage 
        user={user}
        onLogout={handleLogout}
        onSwitchView={() => {
            setIsAdminView(false);
            setActiveTab('for-you');
        }}
        users={registeredUsers}
        businesses={data.businesses}
        workers={data.skilledWorkers}
        accommodations={data.accommodations}
        taxis={data.taxis}
        events={data.events}
        onEditItem={openEditModal}
        onDeleteItem={handleDeleteItem}
        onToggleVerify={handleToggleVerify}
        onUpdateUser={handleUpdateUser}
    />;
  }
  
  if (user?.type === 'owner' && activeTab === 'owner-dashboard') {
      return (
          <div className="min-h-screen bg-gray-50 bg-opacity-80 font-sans antialiased text-gray-800" style={{backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbb5eb?auto=format&fit=crop&w=2000&q=80')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
              <div className="bg-white/80 backdrop-blur-sm min-h-screen">
                  <Header user={user} onLogout={handleLogout} onLoginClick={() => setIsLoginModalOpen(true)} onSearchChange={setSearchTerm} onBookingsClick={() => setIsBookingModalOpen(true)}/>
                  <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                       <NavTabs activeTab={activeTab} onTabClick={handleTabClick} user={user}/>
                       <div className="mt-8">
                           <OwnerDashboard user={user} businesses={data.businesses} onSelectItem={handleSelectItem} onEditItem={openEditModal} />
                       </div>
                  </main>
              </div>
          </div>
      );
  }

  const getModalContent = () => {
    if (!selectedItem) return null;

    if (selectedThread) {
        return <ThreadView thread={selectedThread} onClose={handleCloseModal} user={user} onNewReply={handleNewReply} />;
    }

    switch (selectedItem.type) {
        case 'business':
            return <BusinessDetail item={selectedItem.data} onClose={handleCloseModal} onClaim={handleClaimBusiness} onEdit={openEditModal} user={user} onReviewSubmit={handleReviewSubmit} onTourView={handleTourView} onLoyaltyAction={handleLoyaltyAction} onNewBooking={handleNewBooking} />;
        case 'worker':
            return <WorkerDetail item={selectedItem.data} onClose={handleCloseModal} user={user} onReviewSubmit={handleReviewSubmit} onNewBooking={handleNewBooking} />;
        case 'accommodation':
            return <AccommodationDetail item={selectedItem.data} onClose={handleCloseModal} onTourView={handleTourView} user={user} onNewBooking={handleNewBooking} />;
        case 'taxi':
            return <TaxiDetail item={selectedItem.data} onClose={handleCloseModal} />;
        case 'event':
        case 'news':
        case 'heritage':
            return <ContentDetail item={selectedItem.data} onClose={handleCloseModal} type={selectedItem.type} />;
        default:
            return null;
    }
  }

  return (
    <>
    <Toaster position="top-center" reverseOrder={false} />
    <div className="min-h-screen bg-gray-50 bg-opacity-80 font-sans antialiased text-gray-800" style={{backgroundImage: "url('https://images.unsplash.com/photo-1579892211942-7a72d7315147?auto=format&fit=crop&w=2000&q=80')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
        <div className="bg-white/80 backdrop-blur-sm min-h-screen">
            <Header user={user} onLogout={handleLogout} onLoginClick={() => setIsLoginModalOpen(true)} onSearchChange={setSearchTerm} onBookingsClick={() => setIsBookingModalOpen(true)}/>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <NavTabs activeTab={activeTab} onTabClick={handleTabClick} user={user}/>
                <div className="mt-8">
                    {renderContent()}
                </div>
            </main>
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} onRegister={handleRegister} registeredUsers={registeredUsers} onPinReset={handlePinReset}/>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                {getModalContent()}
            </Modal>
             <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setIsEditMode(false); setItemToEdit(null); }}>
                <AddForm 
                    onSubmit={isEditMode ? handleEditItem : handleAddItem}
                    onCancel={() => { setIsAddModalOpen(false); setIsEditMode(false); setItemToEdit(null); }}
                    isEditMode={isEditMode}
                    initialData={itemToEdit}
                    activeTab={activeTab}
                    user={user}
                    itemTypeForForm={itemToEdit?.plateNumber ? 'taxis' : (itemToEdit?.amenities ? 'accommodations' : (itemToEdit?.skill ? 'workers' : (itemToEdit?.organizer ? 'events' : 'businesses')))}
                />
            </Modal>
            <TourModal isOpen={isTourModalOpen} onClose={() => setIsTourModalOpen(false)}>
                <TourViewer imageUrl={tourData.imageUrl} title={tourData.title} onClose={() => setIsTourModalOpen(false)} />
            </TourModal>
            <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} bookings={user?.bookings || []} onCancelBooking={handleCancelBooking}/>

             <div className="fixed bottom-6 right-6 z-40">
                <button onClick={() => setIsChatbotOpen(prev => !prev)} className="bg-black text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center" aria-label="Open AI Assistant">
                    {isChatbotOpen ? <X className="w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
                </button>
            </div>
            <Chatbot 
                isOpen={isChatbotOpen} 
                onClose={() => setIsChatbotOpen(false)}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isLoading={isChatLoading}
                onStarterClick={handleSendMessage}
            />
        </div>
    </div>
    </>
  );
};

const Header = ({ user, onLogout, onLoginClick, onSearchChange, onBookingsClick }: {
    user: User | null;
    onLogout: () => void;
    onLoginClick: () => void;
    onSearchChange: (term: string) => void;
    onBookingsClick: () => void;
}) => (
    <header className="bg-white/60 backdrop-blur-lg sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
                <div className="flex-shrink-0">
                    <a href="/" className="flex items-center gap-2">
                        <Map className="w-8 h-8 text-blue-600" />
                        <span className="text-2xl font-bold text-gray-900">InGrosIslet</span>
                    </a>
                </div>
                <div className="w-full max-w-lg ml-8">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="search"
                            placeholder="Search for restaurants, hotels, plumbers..."
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="block w-full bg-white bg-opacity-80 border border-gray-200 rounded-full py-3 pl-12 pr-6 leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-4">
                    {user ? (
                        <>
                           <button onClick={onBookingsClick} className="p-2 rounded-full hover:bg-gray-100 relative" aria-label="My Bookings">
                                <Calendar className="w-6 h-6 text-gray-700"/>
                                {user.bookings && user.bookings.length > 0 && (
                                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                                )}
                           </button>
                            <div className="flex items-center gap-2">
                                <div className="hidden sm:block text-right">
                                    <p className="font-semibold text-gray-800 text-sm">{user.username}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user.type} Profile</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">{user.username.charAt(0).toUpperCase()}</div>
                            </div>
                            <button onClick={onLogout} className="text-sm font-medium text-gray-700 hover:text-red-600">Logout</button>
                        </>
                    ) : (
                        <button onClick={onLoginClick} className="bg-black text-white px-5 py-2.5 rounded-full font-medium text-sm">Login / Register</button>
                    )}
                </div>
            </div>
        </div>
    </header>
);

const NavTabs = ({ activeTab, onTabClick, user }: { activeTab: string, onTabClick: (tab: string) => void, user: User | null }) => {
    const tabs = [
        { id: 'for-you', label: 'For You', icon: Sparkles },
        { id: 'businesses', label: 'Businesses', icon: Building },
        { id: 'workers', label: 'Skilled Workers', icon: Wrench },
        { id: 'stays', label: 'Stays & Taxis', icon: BedDouble },
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'news', label: 'News', icon: Newspaper },
        { id: 'heritage', label: 'Heritage', icon: Archive },
        { id: 'community', label: 'Community', icon: Users },
        { id: 'map', label: 'Map View', icon: Map },
    ];
    
    if (user?.type === 'owner') {
        tabs.push({ id: 'owner-dashboard', label: 'Owner Dashboard', icon: LayoutDashboard });
    }
    
    if (user?.type === 'admin') {
        tabs.push({ id: 'admin', label: 'Admin Panel', icon: Wrench });
    }

    const handleTabClick = (tabId: string) => {
        if (tabId === 'admin' && user?.type !== 'admin') return; // Prevent non-admins from clicking
        onTabClick(tabId);
    };

    return (
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                            activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                       <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
};

const ItemCard = ({ item, onSelectItem, onToggleFavorite, user, viewMode, isAnimating }: {
    item: any;
    onSelectItem: (item: any) => void;
    onToggleFavorite: (id: number, type: string) => void;
    user: User | null;
    viewMode: 'grid' | 'list';
    isAnimating: boolean;
}) => {
    const getItemType = (item: any) => {
        if (item.skill) return 'worker';
        if (item.amenities) return 'accommodation';
        if (item.plateNumber) return 'taxi';
        if (item.organizer) return 'event';
        if (item.summary) return 'news';
        if (item.era) return 'heritage';
        return 'business';
    };

    const type = getItemType(item);

    const title = item.name || item.title || item.driverName;
    const category = item.category || item.skill || item.type;
    const description = item.description || item.summary;

    if (viewMode === 'list') {
        return (
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex gap-6 p-4 hover:shadow-lg transition-shadow duration-300">
                <img src={item.image || item.images?.[0]} alt={`Image for ${title}`} className="w-48 h-full object-cover rounded-lg flex-shrink-0"/>
                <div className="flex-1 flex flex-col">
                    <div>
                        <div className="flex justify-between items-start">
                             <span className="text-sm font-semibold text-blue-600">{category}</span>
                             <button onClick={() => onToggleFavorite(item.id, type)} className="p-2 -mr-2 -mt-2" aria-label="Add to favorites">
                                <Heart className={`w-5 h-5 transition-colors ${item.favorited ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-400'} ${isAnimating ? 'animate-shake' : ''}`} />
                             </button>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mt-1">{title}</h3>
                        {item.rating !== undefined && (
                            <div className="flex items-center mt-1">
                                <Star className="w-4 h-4 text-amber-400 fill-current" />
                                <span className="text-sm font-bold ml-1">{item.rating?.toFixed(1)}</span>
                                <span className="text-xs text-gray-500 ml-2">({item.reviewCount} reviews)</span>
                            </div>
                        )}
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{description}</p>
                    </div>
                    <div className="mt-auto pt-4">
                       <button onClick={() => onSelectItem({ data: item, type })} className="text-sm font-semibold text-blue-600 hover:underline">View Details <ChevronRight className="w-4 h-4 inline"/></button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="relative">
                <img src={item.image || item.images?.[0]} alt={`Image for ${title}`} className="w-full h-48 object-cover"/>
                <button onClick={() => onToggleFavorite(item.id, type)} className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm p-2 rounded-full" aria-label="Add to favorites">
                    <Heart className={`w-5 h-5 transition-colors ${item.favorited ? 'text-red-500 fill-current' : 'text-white/80 hover:text-white'} ${isAnimating ? 'animate-shake' : ''}`} />
                </button>
            </div>
            <div className="p-5 flex-1 flex flex-col">
                 <div>
                    <span className="text-xs font-semibold text-blue-600 uppercase">{category}</span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1">{title}</h3>
                    {item.rating !== undefined && (
                        <div className="flex items-center mt-1">
                            <Star className="w-4 h-4 text-amber-400 fill-current" />
                            <span className="text-sm font-bold ml-1">{item.rating?.toFixed(1)}</span>
                            <span className="text-xs text-gray-500 ml-2">({item.reviewCount} reviews)</span>
                        </div>
                    )}
                </div>
                 <div className="mt-auto pt-4">
                     <button onClick={() => onSelectItem({ data: item, type })} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 rounded-lg text-sm transition-colors">View Details</button>
                 </div>
            </div>
        </div>
    );
};


const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<BusinessDirectory />);