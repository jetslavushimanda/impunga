import { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    appTagline: 'Start. Match. Build Zambia.',
    dashboard: 'Dashboard',
    ideaValidator: 'Idea Validator',
    registrationGuide: 'Registration Guide',
    businessPlan: 'Business Plan Builder',
    pricingCalculator: 'Pricing Calculator',
    fundingFinder: 'Funding Finder',
    aiAdvisor: 'AI Business Advisor',
    growthTracker: 'Growth Tracker',
    nameGenerator: 'Business Name Generator',
    invoiceGenerator: 'Invoice Generator',
    myProfile: 'My Profile',
    logout: 'Logout',
    getStarted: 'Get Started — It\'s Free',
    login: 'Login',
    welcome: 'Welcome',
    save: 'Save',
    cancel: 'Cancel',
    download: 'Download',
    generate: 'Generate',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    loading: 'Loading...',
    yourTools: 'Your Tools',
    dailyTip: 'Daily Business Tip',
    recentActivity: 'Recent Activity',
  },
  bem: {
    appTagline: 'Seka Icimweo Cako. Kulisa Umushitisha Wako. Lisha Zambia.',
    dashboard: 'Intanshi',
    ideaValidator: 'Suntisha Icimweo',
    registrationGuide: 'Balanganyo wa Kulembela',
    businessPlan: 'Pangisha Umushitisha',
    pricingCalculator: 'Shintulula Amanambala',
    fundingFinder: 'Shita Indalama',
    aiAdvisor: 'Cakulalanda ca AI',
    growthTracker: 'Temenwa Ukucula',
    nameGenerator: 'Panga Ishina',
    invoiceGenerator: 'Panga Icalilo',
    myProfile: 'Ine Mwine',
    logout: 'Fuma',
    getStarted: 'Aandile — Tafye',
    login: 'Ingila',
    welcome: 'Mwaiseni',
    save: 'Sunga',
    cancel: 'Siya',
    download: 'Kula',
    generate: 'Panga',
    back: 'Bwela',
    next: 'Enda',
    submit: 'Tuma',
    loading: 'Elenganisha...',
    yourTools: 'Ifyo Mufwilila',
    dailyTip: 'Icibulo ca Bushiku',
    recentActivity: 'Ifyo Mwacita',
  },
  nya: {
    appTagline: 'Dzala Lingaliro Lako. Kulitsa Bizinesi Yako. Dyetsa Zambia.',
    dashboard: 'Tsamba Yaikulu',
    ideaValidator: 'Sinthani Lingaliro',
    registrationGuide: 'Longosolero la Kulembetsa',
    businessPlan: 'Lunganitsa Bizinesi',
    pricingCalculator: 'Werengani Mitengo',
    fundingFinder: 'Peza Ndalama',
    aiAdvisor: 'Mlangizi wa AI',
    growthTracker: 'Tsatira Kukula',
    nameGenerator: 'Panga Dzina',
    invoiceGenerator: 'Panga Risiti',
    myProfile: 'Ine Ndine',
    logout: 'Tuluka',
    getStarted: 'Yambani — Kwaulere',
    login: 'Lowani',
    welcome: 'Takulandirani',
    save: 'Sunga',
    cancel: 'Siya',
    download: 'Tsitsani',
    generate: 'Panga',
    back: 'Bwererani',
    next: 'Pitani',
    submit: 'Tumizani',
    loading: 'Khalani...',
    yourTools: 'Zida Zanu',
    dailyTip: 'Uphungu wa Lero',
    recentActivity: 'Zimene Munachita',
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('impunga_lang') || 'en');

  function switchLang(newLang) {
    setLang(newLang);
    localStorage.setItem('impunga_lang', newLang);
  }

  function t(key) {
    return translations[lang]?.[key] || translations.en[key] || key;
  }

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
