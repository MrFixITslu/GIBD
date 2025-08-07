import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { Language, Translations, Business, User, Event, UpdatableBusinessData } from '../types';
import * as api from '../services/api';

const translations: Translations = {
  // General
  welcome: { en: 'Welcome to the', fr: 'Bienvenue au', kw: 'Byenvini nan' },
  appName: { en: 'Gros-Islet Business Directory', fr: 'Répertoire des Entreprises de Gros-Islet', kw: 'Gwo Zil Biznis Dirèktwa' },
  // Nav
  home: { en: 'Home', fr: 'Accueil', kw: 'Akèy' },
  directory: { en: 'Directory', fr: 'Répertoire', kw: 'Anyè' },
  events: { en: 'Events', fr: 'Événements', kw: 'Evènman' },
  news: { en: 'News', fr: 'Actualités', kw: 'Nouvèl' },
  itineraryPlanner: { en: 'Itinerary Planner', fr: 'Planificateur d\'Itinéraire', kw: 'Planifikatè Wout' },
  dashboard: { en: 'Dashboard', fr: 'Tableau de Bord', kw: 'Tablo Bò' },
  login: { en: 'Login', fr: 'Connexion', kw: 'Konekte' },
  register: { en: 'Register', fr: 'S\'inscrire', kw: 'Enskri' },
  logout: { en: 'Logout', fr: 'Déconnexion', kw: 'Dekonekte' },
  ownerLogin: { en: 'Owner Login', fr: 'Connexion Propriétaire', kw: 'Koneksyon Pwopriyetè' },
  // Auth Page
  signInToYourAccount: { en: 'Sign in to your owner account', fr: 'Connectez-vous à votre compte propriétaire', kw: 'Konekte nan kont pwopriyetè ou' },
  email: { en: 'Email Address', fr: 'Adresse e-mail', kw: 'Adrès Imèl' },
  password: { en: 'Password', fr: 'Mot de passe', kw: 'Modpas' },
  confirmPassword: { en: 'Confirm Password', fr: 'Confirmez le mot de passe', kw: 'Konfime Modpas' },
  alreadyHaveAccount: { en: 'Already have an account?', fr: 'Vous avez déjà un compte ?', kw: 'Ou gen yon kont deja?' },
  needAnAccount: { en: 'Don\'t have an account?', fr: 'Pas encore de compte ?', kw: 'Ou pa gen kont?' },
  // Home Page
  heroSubtitle: { en: 'Discover the heart of St. Lucia. Your guide to local gems.', fr: 'Découvrez le cœur de Sainte-Lucie. Votre guide des trésors locaux.', kw: 'Découvrez kè a nan St Lucia. Gid ou a bèl pyè koute chè lokal yo.' },
  explore: { en: 'Explore Directory', fr: 'Explorer le Répertoire', kw: 'Eksplore Anyè a' },
  featuredBusinesses: { en: 'Featured Businesses', fr: 'Entreprises en Vedette', kw: 'Biznis An Vedèt' },
  upcomingEvents: { en: 'Upcoming Events', fr: 'Événements à Venir', kw: 'Evènman k ap Vini' },
  communityChoice: { en: 'Community Choice Awards', fr: 'Prix du Choix de la Communauté', kw: 'Prim Chwa Kominotè' },
  voteNow: { en: 'Vote Now', fr: 'Votez Maintenant', kw: 'Vote Kounye a' },
  topBusinesses: { en: 'Top Businesses of the Month', fr: 'Meilleures Entreprises du Mois', kw: 'Pi Bon Biznis nan Mwa a' },
  // Directory Page
  searchPlaceholder: { en: 'Search by name, category, or tag...', fr: 'Rechercher par nom, catégorie ou tag...', kw: 'Chèche pa non, kategori, oswa tag...' },
  filterByCategory: { en: 'Filter by Category', fr: 'Filtrer par Catégorie', kw: 'Filtre pa Kategori' },
  allCategories: { en: 'All Categories', fr: 'Toutes les Catégories', kw: 'Tout Kategori' },
  // Itinerary Planner Page
  itinerary_greeting_new: { en: "Hi, I'm Conch Shell, your friendly guide! I can help you create a personalized itinerary or learn more about our beautiful town. What would you like to do?", fr: "Salut, je suis Conch Shell, votre guide amical ! Je peux vous aider à créer un itinéraire personnalisé ou à en apprendre davantage sur notre belle ville. Que souhaitez-vous faire ?", kw: "Bonjou, mwen se Conch Shell, gid zanmitay ou! Mwen ka ede w kreye yon wout pèsonalize oswa aprann plis sou bèl vil nou an. Kisa ou ta renmen fè?" },
  itinerary_option_create: { en: "Create Itinerary", fr: "Créer un Itinéraire", kw: "Kreye Wout" },
  itinerary_option_learn: { en: "Learn About Town", fr: "En savoir plus", kw: "Aprann sou vil la" },
  itinerary_greeting_start: { en: "Great! I can help you create a personalized itinerary. First, what kind of activities are you interested in? (e.g., beaches, hiking, local food)", fr: "Super! Je peux vous aider à créer un itinéraire personnalisé. D'abord, quels types d'activités vous intéressent? (ex: plages, randonnée, cuisine locale)", kw: "Magnifik! Mwen ka ede ou kreye yon wout pèsonalize. Pou kòmanse, ki kalite aktivite ou enterese? (egzanp, plaj, randone, manje lokal)" },
  itinerary_ask_duration: { en: "Sounds great! And how many days will your trip be?", fr: "Ça semble super! Et combien de jours durera votre voyage?", kw: "Sa sonnen byen! E konbyen jou vwayaj ou a ap dire?" },
  itinerary_ask_budget: { en: "Perfect. What's your budget for the trip?", fr: "Parfait. Quel est votre budget pour le voyage?", kw: "Pafè. Ki bidjè ou genyen pou vwayaj la?" },
  itinerary_generating: { en: "Awesome! I'm finding the best local spots for you. This will just take a moment...", fr: "Génial! Je cherche les meilleurs endroits pour vous. Cela ne prendra qu'un instant...", kw: "Ekcelan! Mwen ap chèche pi bon kote pou ou. Sa pral pran yon ti moman..." },
  itinerary_selection_instruction: { en: "Here are some suggestions based on your interests! Please select the activities you'd like to include in your itinerary.", fr: "Voici quelques suggestions basées sur vos intérêts ! Veuillez sélectionner les activités que vous souhaitez inclure dans votre itinéraire.", kw: "Men kèk sijesyon ki baze sou enterè ou! Tanpri chwazi aktivite ou ta renmen mete nan chimen ou." },
  create_my_itinerary: { en: 'Create My Itinerary', fr: 'Créer Mon Itinéraire', kw: 'Kreye Chimen Mwen' },
  modify_selections: { en: 'Modify Selections', fr: 'Modifier les Sélections', kw: 'Chanje Seleksyon yo' },
  itinerary_finalized_prompt_delivery: { en: 'Excellent choices! Your personalized itinerary is ready. How would you like to receive it?', fr: 'Excellents choix ! Votre itinéraire personnalisé est prêt. Comment souhaitez-vous le recevoir ?', kw: 'Chwa ekselan! Wout pèsonalize ou a pare. Kòman ou ta renmen resevwa li?' },
  itinerary_restart: { en: "Start Over", fr: "Recommencer", kw: "Kòmanse Anko" },
  itinerary_input_placeholder: { en: "Type your message...", fr: "Écrivez votre message...", kw: "Ekri mesaj ou a..." },
  itinerary_email_button: { en: 'Email', fr: 'E-mail', kw: 'Imèl' },
  itinerary_whatsapp_button: { en: 'WhatsApp', fr: 'WhatsApp', kw: 'WhatsApp' },
  itinerary_no_thanks_button: { en: 'No, thanks', fr: 'Non, merci', kw: 'Non, mèsi' },
  itinerary_ask_email: { en: 'Great! What email address should I send it to?', fr: 'Parfait! À quelle adresse e-mail dois-je l\'envoyer?', kw: 'Pèfè! Nan ki adrès imèl mwen ta dwe voye li?' },
  itinerary_ask_phone: { en: 'Got it! What\'s the best WhatsApp number to send it to? (e.g. +1758...)' , fr: 'Compris! Quel numéro de téléphone dois-je utiliser pour WhatsApp? (ex: +1758...)', kw: 'Oke! Ki nimewo telefòn mwen ta dwe itilize pou WhatsApp? (egzanp +1758...)' },
  itinerary_invalid_email: { en: "That doesn't look like a valid email. Could you please double-check it?", fr: "Cela ne semble pas être une adresse e-mail valide. Pourriez-vous vérifier à nouveau?", kw: "Sa pa sanble yon adrès imel valab. Èske ou ka tcheke li ankò?" },
  itinerary_invalid_phone: { en: "That doesn't seem to be a valid phone number. Please enter a number with a country code.", fr: "Cela ne semble pas être un numéro de-téléphone valide. Veuillez entrer un numéro avec l'indicatif du pays.", kw: "Sa pa sanble yon nimewo telefòn valab. Tanpri antre yon nimewo avèk kòd peyi a." },
  itinerary_final_confirmation: { en: 'All set! Your itinerary has been sent to {contactInfo}. Enjoy your trip!', fr: 'Tout est prêt! Votre itinéraire a été envoyé à {contactInfo}. Bon voyage!', kw: 'Tout pare! Mwen voye chimen ou an nan {contactInfo}. Pwofite vwayaj ou!' },
  itinerary_delivery_finished: { en: "You got it. Is there anything else I can help you with today?", fr: "Entendu. Y a-t-il autre chose que je puisse faire pour vous aujourd'hui ?", kw: "Oke. Èske gen lòt bagay mwen ka ede ou avèk jodi a?" },
  // Dashboard Page
  businessDashboard: { en: 'Business Dashboard', fr: 'Tableau de Bord d\'Entreprise', kw: 'Tablo Bò Biznis' },
  manageProfile: { en: 'Manage Profile', fr: 'Gérer le Profil', kw: 'Jere Pwofil' },
  saveProfile: { en: 'Save Profile', fr: 'Enregistrer le Profil', kw: 'Sove Pwofil' },
  profileSaved: { en: 'Profile Saved!', fr: 'Profil Enregistré !', kw: 'Pwofil Sove!' },
  manageEvents: { en: 'Manage Events', fr: 'Gérer les Événements', kw: 'Jere Evènman' },
  addEvent: { en: 'Add Event', fr: 'Ajouter un événement', kw: 'Ajoute Evènman' },
  currentEvents: { en: 'Current Events', fr: 'Événements actuels', kw: 'Evènman Kounye a' },
  eventName: { en: 'Event Name', fr: 'Nom de l\'événement', kw: 'Non Evènman' },
  eventDateTime: { en: 'Date & Time', fr: 'Date & Heure', kw: 'Dat & Lè' },
  eventDescription: { en: 'Event Description', fr: 'Description de l\'événement', kw: 'Deskripsyon Evènman' },
  // Business Registration
  registerYourBusiness: { en: 'Register Your Business', fr: 'Enregistrez Votre Entreprise', kw: 'Anrejistre Biznis Ou' },
  createOwnerAccount: { en: 'Create Your Owner Account', fr: 'Créez Votre Compte Propriétaire', kw: 'Kreye Kont Pwopriyetè Ou' },
  growWithUs: { en: 'Are you a local business owner? Join our community and reach more customers!', fr: 'Êtes-vous propriétaire d\'une entreprise locale? Rejoignez notre communauté et touchez plus de clients!', kw: 'Èske ou se yon pwopriyetè biznis lokal? Antre nan kominote nou an epi rive jwenn plis kliyan!' },
  getStarted: { en: 'Get Started', fr: 'Commencer', kw: 'Kòmanse' },
  businessName: { en: 'Business Name', fr: 'Nom de l\'entreprise', kw: 'Non Biznis' },
  businessCategory: { en: 'Business Category', fr: 'Catégorie d\'entreprise', kw: 'Kategori Biznis' },
  businessDescription: { en: 'Business Description', fr: 'Description de l\'entreprise', kw: 'Deskripsyon Biznis' },
  contactPhone: { en: 'Contact Phone', fr: 'Téléphone de contact', kw: 'Telefòn Kontak' },
  contactEmail: { en: 'Contact Email', fr: 'Email de contact', kw: 'Imèl Kontak' },
  website: { en: 'Website (optional)', fr: 'Site Web (facultatif)', kw: 'Sit wèb (opsyonèl)' },
  locationAddress: { en: 'Location / Address', fr: 'Lieu / Adresse', kw: 'Kote / Adrès' },
  businessLogo: { en: 'Business Logo / Image', fr: 'Logo / Image de l\'entreprise', kw: 'Logo / Imaj Biznis' },
  uploadImage: { en: 'Upload Image', fr: 'Télécharger une image', kw: 'Chaje Imaj' },
  changeImage: { en: 'Change Image', fr: 'Changer l\'image', kw: 'Chanje Imaj' },
  tags: { en: 'Tags (comma-separated)', fr: 'Tags (séparés par des virgules)', kw: 'Tags (separe pa vigil)' },
  submitRegistration: { en: 'Create Account & Register Business', fr: 'Créer un compte et enregistrer l\'entreprise', kw: 'Kreye Kont & Anrejistre Biznis' },
};


interface AppContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: {[key:string]: string}) => string;
  isAuthenticated: boolean;
  currentUser: {id: string, email: string} | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<{user: {id: string, email: string}}>;
  logout: () => void;
  businesses: Business[];
  events: Event[];
  isLoading: boolean;
  appError: string | null;
  isUsingMockData: boolean;
  addBusiness: (businessData: Omit<Business, 'id' | 'rating' | 'votes' | 'ownerId'>) => Promise<void>;
  updateBusiness: (businessId: string, updatedData: UpdatableBusinessData) => Promise<void>;
  voteForBusiness: (businessId: string) => void;
  hasVotedFor: (businessId: string) => boolean;
  totalVotes: number;
  addEvent: (eventData: Omit<Event, 'id' | 'image'>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(Language.EN);
  const [currentUser, setCurrentUser] = useState<{id: string, email: string} | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('gimd-token'));
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [appError, setAppError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  
  const [votedBusinessIds, setVotedBusinessIds] = useState<Set<string>>(() => {
    const savedVotes = sessionStorage.getItem('gimd-votes');
    return savedVotes ? new Set(JSON.parse(savedVotes)) : new Set();
  });

  useEffect(() => {
    sessionStorage.setItem('gimd-votes', JSON.stringify(Array.from(votedBusinessIds)));
  }, [votedBusinessIds]);

  const isAuthenticated = !!token;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const [bizData, eventData] = await Promise.all([
          api.getBusinesses(),
          api.getEvents(),
        ]);
        setBusinesses(bizData);
        setEvents(eventData);
        setAppError(null);
        
        setIsUsingMockData(false);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        setAppError("Could not connect to the server. Please try again later.");
        setIsUsingMockData(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);
  
  useEffect(() => {
    // This effect synchronizes the user state with the token in localStorage
    const storedToken = localStorage.getItem('gimd-token');
    const storedUser = localStorage.getItem('gimd-user');
    if (storedToken && storedUser) {
        setToken(storedToken);
        setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const t = useCallback((key: string, replacements: {[key:string]: string} = {}): string => {
    let translation = translations[key]?.[language] || key;
    Object.keys(replacements).forEach(rKey => {
      translation = translation.replace(`{${rKey}}`, replacements[rKey]);
    });
    return translation;
  }, [language]);

  const login = useCallback(async (email: string, password: string) => {
    const { user, token: newToken } = await api.login(email, password);
    localStorage.setItem('gimd-token', newToken);
    localStorage.setItem('gimd-user', JSON.stringify(user));
    setToken(newToken);
    setCurrentUser(user);
  }, []);
  
  const register = useCallback(async (email: string, password: string) => {
    const { user, token: newToken } = await api.register(email, password);
    localStorage.setItem('gimd-token', newToken);
    localStorage.setItem('gimd-user', JSON.stringify(user));
    setToken(newToken);
    setCurrentUser(user);
    return { user };
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('gimd-token');
    localStorage.removeItem('gimd-user');
  }, []);
  
  const addBusiness = useCallback(async (businessData: Omit<Business, 'id' | 'rating' | 'votes' | 'ownerId'>) => {
    if (!token) throw new Error("Authentication required.");
    const newBusiness = await api.addBusiness(businessData, token);
    setBusinesses(prev => [newBusiness, ...prev]);
  }, [token]);
  
  const updateBusiness = useCallback(async (businessId: string, updatedData: UpdatableBusinessData) => {
    if (!token) throw new Error("Authentication required.");
    const updatedBusiness = await api.updateBusiness(businessId, updatedData, token);
    setBusinesses(prev => prev.map(b => b.id === businessId ? updatedBusiness : b));
  }, [token]);

  const voteForBusiness = useCallback(async (businessId: string) => {
    if (votedBusinessIds.has(businessId)) {
      console.warn("Already voted for this business.");
      return;
    }
    const { votes } = await api.voteForBusiness(businessId);
    setBusinesses(prev => prev.map(b => b.id === businessId ? { ...b, votes } : b));
    setVotedBusinessIds(prevIds => new Set(prevIds).add(businessId));
  }, [votedBusinessIds]);
  
  const addEvent = useCallback(async (eventData: Omit<Event, 'id' | 'image'>) => {
    if (!token) throw new Error("Authentication required.");
    const newEvent = await api.addEvent(eventData, token);
    setEvents(prev => [newEvent, ...prev]);
  }, [token]);
  
  const deleteEvent = useCallback(async (eventId: string) => {
    if (!token) throw new Error("Authentication required.");
    await api.deleteEvent(eventId, token);
    setEvents(prev => prev.filter(e => e.id !== eventId));
  }, [token]);

  const hasVotedFor = useCallback((businessId: string): boolean => {
    return votedBusinessIds.has(businessId);
  }, [votedBusinessIds]);
  
  const totalVotes = votedBusinessIds.size;

  const value = useMemo(() => ({
    language, setLanguage, t,
    isAuthenticated, currentUser, login, register, logout,
    businesses, events,
    isLoading, appError, isUsingMockData,
    addBusiness, updateBusiness,
    voteForBusiness, hasVotedFor, totalVotes,
    addEvent, deleteEvent
  }), [
    language, setLanguage, t,
    isAuthenticated, currentUser, login, register, logout,
    businesses, events,
    isLoading, appError, isUsingMockData,
    addBusiness, updateBusiness,
    voteForBusiness, hasVotedFor, totalVotes,
    addEvent, deleteEvent
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};