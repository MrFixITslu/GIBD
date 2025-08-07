import * as React from 'react';
import { generateItinerarySuggestions, getTownInfo } from '../services/geminiService';
import { Itinerary, ItineraryDay, ItinerarySuggestions } from '../types';
import { useAppContext } from '../context/AppContext';
import Spinner from '../components/Spinner';
import { SuggestionPicker } from '../components/itinerary/SuggestionPicker';
import { ItineraryDisplay } from '../components/itinerary/ItineraryDisplay';
import { ItineraryPlaceholder } from '../components/itinerary/ItineraryPlaceholder';
import { TypingIndicator } from '../components/itinerary/TypingIndicator';


type ChatMessage = {
  id: number;
  sender: 'user' | 'bot';
  content: React.ReactNode;
};

type ChatStep = 'start' | 'prompt_action' | 'get_interests' | 'get_duration' | 'get_budget' | 'generate_suggestions' | 'selection' | 'display_final' | 'prompt_delivery' | 'get_email' | 'get_phone' | 'finished';

const ItineraryPlannerPage: React.FC = () => {
  const { t } = useAppContext();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const [step, setStep] = React.useState<ChatStep>('start');
  const [preferences, setPreferences] = React.useState({ interests: '', duration: 3, budget: '' });
  const [userInput, setUserInput] = React.useState('');
  
  const [suggestions, setSuggestions] = React.useState<ItinerarySuggestions | null>(null);
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());
  const [finalItinerary, setFinalItinerary] = React.useState<Itinerary | null>(null);
  
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const nextId = React.useRef(0);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addBotMessage = (content: React.ReactNode, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: nextId.current++, sender: 'bot', content }]);
      setIsTyping(false);
    }, delay);
  };
  
  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, { id: nextId.current++, sender: 'user', content }]);
  };

  React.useEffect(() => {
    if (step === 'start') {
      addBotMessage(t('itinerary_greeting_new'), 500);
      setStep('prompt_action');
    }
  }, [step, t]);
  
  const handleUserInput = (value: string) => {
     if (!value.trim()) return;
     addUserMessage(value);
     setUserInput('');
     switch (step) {
        case 'get_interests':
            setPreferences(p => ({ ...p, interests: value }));
            addBotMessage(t('itinerary_ask_duration'));
            setStep('get_duration');
            break;
        case 'get_duration':
            const duration = parseInt(value, 10);
            if (!isNaN(duration) && duration > 0 && duration <= 10) {
                setPreferences(p => ({ ...p, duration }));
                addBotMessage(t('itinerary_ask_budget'));
                setStep('get_budget');
            } else {
                addBotMessage("Please enter a valid number of days (1-10).");
            }
            break;
        case 'get_email':
            if (/\S+@\S+\.\S+/.test(value)) {
                addBotMessage(t('itinerary_final_confirmation', {contactInfo: value}));
                setStep('finished');
            } else {
                addBotMessage(t('itinerary_invalid_email'));
            }
            break;
        case 'get_phone':
            if (/^\+?[1-9]\d{1,14}$/.test(value)) {
                 addBotMessage(t('itinerary_final_confirmation', {contactInfo: value}));
                 setStep('finished');
            } else {
                addBotMessage(t('itinerary_invalid_phone'));
            }
            break;
        default: break;
     }
  };
  
  const handleActionChoice = async (choice: 'create' | 'learn') => {
      if (choice === 'create') {
          addUserMessage(t('itinerary_option_create'));
          addBotMessage(t('itinerary_greeting_start'));
          setStep('get_interests');
      } else {
          addUserMessage(t('itinerary_option_learn'));
          setIsTyping(true);
          const info = await getTownInfo();
          addBotMessage(info, 500);
          setTimeout(() => {
            setIsTyping(false);
            addBotMessage(t('itinerary_greeting_new'), 500);
            setStep('prompt_action');
          }, 1000);
      }
  };

  const handleBudgetChoice = (budget: string) => {
    addUserMessage(budget.charAt(0).toUpperCase() + budget.slice(1));
    setPreferences(p => ({ ...p, budget }));
    setStep('generate_suggestions');
  };
  
  React.useEffect(() => {
    const generate = async () => {
        if (step !== 'generate_suggestions') return;
        addBotMessage(t('itinerary_generating'));
        setIsTyping(true);
        const result = await generateItinerarySuggestions(preferences.interests, preferences.budget, preferences.duration);
        setIsTyping(false);

        if (result) {
            setSuggestions(result);
            addBotMessage(t('itinerary_selection_instruction'), 500);
            setStep('selection');
        } else {
            addBotMessage("I'm sorry, I couldn't generate an itinerary at this time. Please try again.", 500);
            restartConversation();
        }
    };
    generate();
  }, [step, preferences, t]);
  
  const handleToggleItem = (id: string) => {
    setSelectedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  };
  
  const handleCreateItinerary = () => {
    if (!suggestions || selectedItems.size === 0) return;

    const newSchedule: ItineraryDay[] = suggestions.suggestions.map(daySugg => {
      const selectedForDay = daySugg.options.filter(opt => selectedItems.has(opt.id));
      return {
        day: daySugg.day,
        title: `Your Day ${daySugg.day} Adventure`, // Can be improved
        theme: preferences.interests,
        items: selectedForDay,
      };
    }).filter(day => day.items.length > 0);

    const finalPlan: Itinerary = {
      title: suggestions.title,
      duration: suggestions.duration,
      schedule: newSchedule,
    };

    setFinalItinerary(finalPlan);
    setStep('display_final');
    setTimeout(() => {
      addBotMessage(t('itinerary_finalized_prompt_delivery'), 1000);
      setStep('prompt_delivery');
    }, 500);
};

  const handleModifySelections = () => {
    setStep('selection');
    setFinalItinerary(null);
  };
  
  const handleDeliveryChoice = (choice: 'email' | 'whatsapp' | 'none') => {
      switch (choice) {
        case 'email':
          addUserMessage(t('itinerary_email_button'));
          addBotMessage(t('itinerary_ask_email'));
          setStep('get_email');
          break;
        case 'whatsapp':
          addUserMessage(t('itinerary_whatsapp_button'));
          addBotMessage(t('itinerary_ask_phone'));
          setStep('get_phone');
          break;
        case 'none':
          addUserMessage(t('itinerary_no_thanks_button'));
          addBotMessage(t('itinerary_delivery_finished'));
          setStep('finished');
          break;
      }
  };

  const restartConversation = () => {
    setMessages([]);
    setPreferences({ interests: '', duration: 3, budget: '' });
    setSuggestions(null);
    setSelectedItems(new Set());
    setFinalItinerary(null);
    setStep('start');
  };

  const renderContentPanel = () => {
    if (step === 'display_final' || step === 'prompt_delivery' || step === 'get_email' || step === 'get_phone' || step === 'finished') {
        if(finalItinerary) {
            return <ItineraryDisplay itinerary={finalItinerary} onModify={handleModifySelections} t={t} />;
        }
    }
    if (step === 'selection' && suggestions) {
      return <SuggestionPicker 
        suggestions={suggestions}
        selectedItems={selectedItems}
        onToggleItem={handleToggleItem}
        onCreateItinerary={handleCreateItinerary}
        t={t}
      />;
    }
    if (isTyping && step === 'generate_suggestions') {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg h-full flex flex-col items-center justify-center text-center">
                <Spinner />
                <p className="mt-4 text-gray-500">{t('itinerary_generating')}</p>
            </div>
        );
    }
    return <ItineraryPlaceholder />;
  };

  return (
    <div className="bg-sandy-beige flex-grow flex flex-col">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col flex-grow">
        <div className="text-center mb-8 shrink-0">
            <h1 className="text-4xl font-bold text-charcoal-gray">{t('itineraryPlanner')}</h1>
            <p className="mt-2 text-lg text-gray-600 font-noto-sans">Let's plan your perfect trip to Gros-Islet!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-grow min-h-0">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-2xl flex flex-col">
              <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-lg px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-ocean-blue text-white' : 'bg-gray-100 text-charcoal-gray'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="px-4 py-2 rounded-2xl bg-gray-100 text-charcoal-gray">
                          <TypingIndicator />
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t bg-gray-50 rounded-b-xl shrink-0">
              {step === 'prompt_action' ? (
                  <div className="flex flex-wrap justify-center gap-2">
                       <button onClick={() => handleActionChoice('create')} className="px-4 py-2 bg-tropical-green text-white rounded-full hover:bg-opacity-90">{t('itinerary_option_create')}</button>
                       <button onClick={() => handleActionChoice('learn')} className="px-4 py-2 bg-ocean-blue text-white rounded-full hover:bg-opacity-90">{t('itinerary_option_learn')}</button>
                  </div>
              ) : step === 'get_budget' ? (
                  <div className="flex flex-wrap justify-center gap-2">
                      <button onClick={() => handleBudgetChoice('budget-friendly')} className="px-4 py-2 bg-tropical-green text-white rounded-full hover:bg-opacity-90">Budget-friendly</button>
                      <button onClick={() => handleBudgetChoice('moderate')} className="px-4 py-2 bg-ocean-blue text-white rounded-full hover:bg-opacity-90">Moderate</button>
                      <button onClick={() => handleBudgetChoice('luxury')} className="px-4 py-2 bg-sunset-orange text-white rounded-full hover:bg-opacity-90">Luxury</button>
                  </div>
              ) : step === 'prompt_delivery' ? (
                   <div className="flex flex-wrap justify-center gap-2">
                      <button onClick={() => handleDeliveryChoice('email')} className="px-4 py-2 bg-ocean-blue text-white rounded-full hover:bg-opacity-90">{t('itinerary_email_button')}</button>
                      <button onClick={() => handleDeliveryChoice('whatsapp')} className="px-4 py-2 bg-tropical-green text-white rounded-full hover:bg-opacity-90">{t('itinerary_whatsapp_button')}</button>
                      <button onClick={() => handleDeliveryChoice('none')} className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-opacity-90">{t('itinerary_no_thanks_button')}</button>
                  </div>
              ) : (step === 'finished') ? (
                   <div className="text-center">
                      <button onClick={restartConversation} className="px-6 py-2 bg-tropical-green text-white font-semibold rounded-full hover:bg-opacity-90 transition-transform transform hover:scale-105">
                          {t('itinerary_restart')}
                      </button>
                  </div>
              ) : (step !== 'display_final' && step !== 'selection') ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleUserInput(userInput); }} className="flex space-x-2">
                      <input
                          type={step === 'get_duration' ? 'number' : 'text'}
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder={t('itinerary_input_placeholder')}
                          className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-ocean-blue focus:border-ocean-blue transition"
                          autoFocus
                          disabled={isTyping}
                      />
                      <button type="submit" className="bg-sunset-orange text-white rounded-full p-2.5 hover:bg-opacity-90 transition disabled:bg-gray-400" disabled={isTyping || userInput.length === 0}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                          </svg>
                      </button>
                  </form>
              ) : null }
              </div>
            </div>
            <div className="lg:col-span-3 min-h-0">
              {renderContentPanel()}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryPlannerPage;