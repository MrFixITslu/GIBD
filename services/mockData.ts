import { Business, Event, BusinessCategory } from '../types';

// Mock businesses data
export const mockBusinesses: Business[] = [
  {
    id: '1',
    ownerId: 'owner1',
    name: 'Sunset Beach Bar & Grill',
    category: BusinessCategory.BEACH_BAR,
    description: 'Enjoy fresh seafood and tropical cocktails with stunning ocean views. Perfect for sunset dining and live music on weekends.',
    contact: {
      phone: '+1 (758) 456-7890',
      email: 'info@sunsetbeachbar.com',
      website: 'https://sunsetbeachbar.com'
    },
    location: 'Beach Road, Gros-Islet',
    coordinates: { lat: 14.0861, lng: -60.9547 },
    hours: {
      'Monday': '11:00 AM - 10:00 PM',
      'Tuesday': '11:00 AM - 10:00 PM',
      'Wednesday': '11:00 AM - 10:00 PM',
      'Thursday': '11:00 AM - 10:00 PM',
      'Friday': '11:00 AM - 11:00 PM',
      'Saturday': '10:00 AM - 11:00 PM',
      'Sunday': '10:00 AM - 9:00 PM'
    },
    images: [
      'https://picsum.photos/seed/sunset-beach-bar/800/600',
      'https://picsum.photos/seed/sunset-beach-bar-2/800/600'
    ],
    rating: 4.8,
    tags: ['seafood', 'cocktails', 'live music', 'ocean view', 'sunset'],
    offers: 'Happy Hour 4-6 PM daily',
    votes: 127
  },
  {
    id: '2',
    ownerId: 'owner2',
    name: 'Gros-Islet Market Tours',
    category: BusinessCategory.TOUR,
    description: 'Experience the vibrant local culture with guided tours of the famous Gros-Islet Friday Night Street Party and local markets.',
    contact: {
      phone: '+1 (758) 234-5678',
      email: 'tours@grosisletmarket.com',
      website: 'https://grosisletmarket.com'
    },
    location: 'Main Street, Gros-Islet',
    coordinates: { lat: 14.0861, lng: -60.9547 },
    hours: {
      'Monday': '9:00 AM - 5:00 PM',
      'Tuesday': '9:00 AM - 5:00 PM',
      'Wednesday': '9:00 AM - 5:00 PM',
      'Thursday': '9:00 AM - 5:00 PM',
      'Friday': '9:00 AM - 8:00 PM',
      'Saturday': '9:00 AM - 6:00 PM',
      'Sunday': 'Closed'
    },
    images: [
      'https://picsum.photos/seed/gros-islet-market/800/600',
      'https://picsum.photos/seed/gros-islet-market-2/800/600'
    ],
    rating: 4.9,
    tags: ['cultural tours', 'street party', 'local markets', 'guided tours'],
    offers: 'Group discounts available',
    votes: 89
  },
  {
    id: '3',
    ownerId: 'owner3',
    name: 'Tropical Paradise Restaurant',
    category: BusinessCategory.RESTAURANT,
    description: 'Authentic Caribbean cuisine featuring fresh local ingredients and traditional St. Lucian dishes in a relaxed tropical setting.',
    contact: {
      phone: '+1 (758) 345-6789',
      email: 'dine@tropicalparadise.com',
      website: 'https://tropicalparadise.com'
    },
    location: 'Paradise Street, Gros-Islet',
    coordinates: { lat: 14.0861, lng: -60.9547 },
    hours: {
      'Monday': '12:00 PM - 10:00 PM',
      'Tuesday': '12:00 PM - 10:00 PM',
      'Wednesday': '12:00 PM - 10:00 PM',
      'Thursday': '12:00 PM - 10:00 PM',
      'Friday': '12:00 PM - 11:00 PM',
      'Saturday': '12:00 PM - 11:00 PM',
      'Sunday': '12:00 PM - 9:00 PM'
    },
    images: [
      'https://picsum.photos/seed/tropical-paradise/800/600',
      'https://picsum.photos/seed/tropical-paradise-2/800/600'
    ],
    rating: 4.7,
    tags: ['caribbean cuisine', 'local ingredients', 'traditional dishes', 'tropical setting'],
    offers: 'Lunch specials Mon-Fri',
    votes: 156
  },
  {
    id: '4',
    ownerId: 'owner4',
    name: 'Island Crafts & Souvenirs',
    category: BusinessCategory.SHOP,
    description: 'Handcrafted local souvenirs, jewelry, and traditional St. Lucian crafts. Perfect for unique gifts and mementos.',
    contact: {
      phone: '+1 (758) 456-7890',
      email: 'shop@islandcrafts.com',
      website: 'https://islandcrafts.com'
    },
    location: 'Craft Street, Gros-Islet',
    coordinates: { lat: 14.0861, lng: -60.9547 },
    hours: {
      'Monday': '9:00 AM - 6:00 PM',
      'Tuesday': '9:00 AM - 6:00 PM',
      'Wednesday': '9:00 AM - 6:00 PM',
      'Thursday': '9:00 AM - 6:00 PM',
      'Friday': '9:00 AM - 7:00 PM',
      'Saturday': '9:00 AM - 6:00 PM',
      'Sunday': '10:00 AM - 4:00 PM'
    },
    images: [
      'https://picsum.photos/seed/island-crafts/800/600',
      'https://picsum.photos/seed/island-crafts-2/800/600'
    ],
    rating: 4.6,
    tags: ['handcrafted', 'souvenirs', 'local crafts', 'jewelry', 'gifts'],
    offers: 'Free gift wrapping',
    votes: 73
  },
  {
    id: '5',
    ownerId: 'owner5',
    name: 'Seaside Villa Accommodations',
    category: BusinessCategory.ACCOMMODATION,
    description: 'Luxury beachfront villas with private pools, stunning ocean views, and personalized service for the perfect island getaway.',
    contact: {
      phone: '+1 (758) 567-8901',
      email: 'book@seasidevilla.com',
      website: 'https://seasidevilla.com'
    },
    location: 'Beachfront Road, Gros-Islet',
    coordinates: { lat: 14.0861, lng: -60.9547 },
    hours: {
      'Monday': '24/7',
      'Tuesday': '24/7',
      'Wednesday': '24/7',
      'Thursday': '24/7',
      'Friday': '24/7',
      'Saturday': '24/7',
      'Sunday': '24/7'
    },
    images: [
      'https://picsum.photos/seed/seaside-villa/800/600',
      'https://picsum.photos/seed/seaside-villa-2/800/600'
    ],
    rating: 4.9,
    tags: ['luxury', 'beachfront', 'private pool', 'ocean view', 'villa'],
    offers: 'Early booking discount',
    votes: 234
  },
  {
    id: '6',
    ownerId: 'owner6',
    name: 'Caribbean Artisan Studio',
    category: BusinessCategory.ARTISAN,
    description: 'Traditional pottery, woodcarving, and textile arts created by local artisans. Watch craftsmen at work and take home authentic pieces.',
    contact: {
      phone: '+1 (758) 678-9012',
      email: 'art@caribbeanartisan.com',
      website: 'https://caribbeanartisan.com'
    },
    location: 'Artisan Lane, Gros-Islet',
    coordinates: { lat: 14.0861, lng: -60.9547 },
    hours: {
      'Monday': '10:00 AM - 5:00 PM',
      'Tuesday': '10:00 AM - 5:00 PM',
      'Wednesday': '10:00 AM - 5:00 PM',
      'Thursday': '10:00 AM - 5:00 PM',
      'Friday': '10:00 AM - 6:00 PM',
      'Saturday': '10:00 AM - 5:00 PM',
      'Sunday': 'Closed'
    },
    images: [
      'https://picsum.photos/seed/caribbean-artisan/800/600',
      'https://picsum.photos/seed/caribbean-artisan-2/800/600'
    ],
    rating: 4.8,
    tags: ['pottery', 'woodcarving', 'textiles', 'local artisans', 'traditional crafts'],
    offers: 'Custom orders available',
    votes: 95
  }
];

// Mock events data
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Friday Night Street Party',
    date: '2024-01-26',
    time: '8:00 PM',
    description: 'Join the famous Gros-Islet Friday Night Street Party! Live music, local food vendors, and dancing in the streets. A must-experience cultural event.',
    businessId: '2',
    image: 'https://picsum.photos/seed/friday-street-party/800/600'
  },
  {
    id: '2',
    title: 'Sunset Jazz Night',
    date: '2024-01-27',
    time: '6:00 PM',
    description: 'Relax with smooth jazz music while enjoying the spectacular sunset over the Caribbean Sea. Perfect for a romantic evening.',
    businessId: '1',
    image: 'https://picsum.photos/seed/sunset-jazz/800/600'
  },
  {
    id: '3',
    title: 'Local Artisan Market',
    date: '2024-01-28',
    time: '10:00 AM',
    description: 'Browse and purchase authentic local crafts, jewelry, and artwork directly from the artisans. Support local artists and take home unique souvenirs.',
    businessId: '6',
    image: 'https://picsum.photos/seed/artisan-market/800/600'
  },
  {
    id: '4',
    title: 'Caribbean Cooking Class',
    date: '2024-01-29',
    time: '2:00 PM',
    description: 'Learn to cook traditional St. Lucian dishes with fresh local ingredients. Includes recipe booklet and samples of your creations.',
    businessId: '3',
    image: 'https://picsum.photos/seed/cooking-class/800/600'
  }
];

// Mock API functions
export const mockApi = {
  async getBusinesses(): Promise<Business[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockBusinesses;
  },

  async getEvents(): Promise<Event[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockEvents;
  },

  async voteForBusiness(businessId: string): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    const business = mockBusinesses.find(b => b.id === businessId);
    if (business) {
      business.votes += 1;
    }
  }
};
