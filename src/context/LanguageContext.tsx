import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Define translations for each language
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'home': 'Home',
    'services': 'Services',
    'employment': 'Employment',
    'contact': 'Contact',
    'login': 'Login',
    'register': 'Register',
    'profile': 'My Profile',
    'dashboard': 'Dashboard',
    'logout': 'Logout',
    'messages': 'Messages',

    // Common UI elements
    'search': 'Search',
    'submit': 'Submit',
    'cancel': 'Cancel',
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
    'view': 'View',
    'add': 'Add',
    'back': 'Back',
    'continue': 'Continue',
    'loading': 'Loading...',

    // Titles
    'site_title': 'WorkiT',
    'dashboard_title': 'Dashboard',
    'services_title': 'Services',
    'orders_title': 'Orders',
    'messages_title': 'Messages',
    'payments_title': 'Payments',

    // Footer
    'footer_description': 'WorkiT is the leading platform connecting talented freelancers with clients both locally and globally. Whether you\'re a buyer looking for professional services or a seller offering your skills, our marketplace caters to all your needs.',
    'about_us': 'About Us',
    'buyer_seller_protection': 'Buyer/Seller Protection',
    'approval_process': 'Approval Process',
    'contact_us': 'Contact Us',
    'terms_conditions': 'Terms and Conditions',
    'privacy_policy': 'Privacy Policy',
    'all_rights_reserved': 'All rights reserved',
    'theme_toggle_day': 'Day Mode',
    'theme_toggle_night': 'Night Mode',
    'change_language': 'Change Language',
  },
  fr: {
    // Navigation
    'home': 'Accueil',
    'services': 'Services',
    'employment': 'Emploi',
    'contact': 'Contact',
    'login': 'Se Connecter',
    'register': 'Inscrivez',
    'profile': 'Mon Profil',
    'dashboard': 'Tableau de bord',
    'logout': 'Se Déconnecter',
    'messages': 'Messages',

    // Common UI elements
    'search': 'Rechercher',
    'submit': 'Soumettre',
    'cancel': 'Annuler',
    'save': 'Enregistrer',
    'delete': 'Supprimer',
    'edit': 'Modifier',
    'view': 'Voir',
    'add': 'Ajouter',
    'back': 'Retour',
    'continue': 'Continuer',
    'loading': 'Chargement...',

    // Titles
    'site_title': 'WorkiT',
    'dashboard_title': 'Tableau de bord',
    'services_title': 'Services',
    'orders_title': 'Commandes',
    'messages_title': 'Messages',
    'payments_title': 'Paiements',

    // Footer
    'footer_description': 'WorkiT est la plateforme leader mettant en relation des freelances talentueux avec des clients tant au niveau local que mondial. Que vous soyez un acheteur recherchant des services professionnels ou un vendeur proposant vos compétences, notre marketplace répond à tous vos besoins.',
    'about_us': 'À propos de nous',
    'buyer_seller_protection': 'Protection des Acheteurs/Vendeurs',
    'approval_process': 'Processus d\'Approbation',
    'contact_us': 'Contactez Nous',
    'terms_conditions': 'Termes et Conditions',
    'privacy_policy': 'Politique de Confidentialité',
    'all_rights_reserved': 'Tous droits réservés',
    'theme_toggle_day': 'Mode Jour',
    'theme_toggle_night': 'Mode Nuit',
    'change_language': 'Changer la langue',
  },
  ar: {
    // Navigation
    'home': 'الرئيسية',
    'services': 'الخدمات',
    'employment': 'التوظيف',
    'contact': 'اتصل بنا',
    'login': 'تسجيل الدخول',
    'register': 'إنشاء حساب',
    'profile': 'ملفي الشخصي',
    'dashboard': 'لوحة التحكم',
    'logout': 'تسجيل الخروج',
    'messages': 'الرسائل',

    // Common UI elements
    'search': 'بحث',
    'submit': 'إرسال',
    'cancel': 'إلغاء',
    'save': 'حفظ',
    'delete': 'حذف',
    'edit': 'تعديل',
    'view': 'عرض',
    'add': 'إضافة',
    'back': 'رجوع',
    'continue': 'متابعة',
    'loading': 'جاري التحميل...',

    // Titles
    'site_title': 'ووركيت',
    'dashboard_title': 'لوحة التحكم',
    'services_title': 'الخدمات',
    'orders_title': 'الطلبات',
    'messages_title': 'الرسائل',
    'payments_title': 'المدفوعات',

    // Footer
    'footer_description': 'ووركيت هي المنصة الرائدة التي تربط المستقلين الموهوبين بالعملاء محليًا وعالميًا. سواء كنت مشتريًا تبحث عن خدمات احترافية أو بائعًا تقدم مهاراتك، فإن سوقنا يلبي جميع احتياجاتك.',
    'about_us': 'من نحن',
    'buyer_seller_protection': 'حماية المشتري/البائع',
    'approval_process': 'عملية الموافقة',
    'contact_us': 'اتصل بنا',
    'terms_conditions': 'الشروط والأحكام',
    'privacy_policy': 'سياسة الخصوصية',
    'all_rights_reserved': 'جميع الحقوق محفوظة',
    'theme_toggle_day': 'الوضع النهاري',
    'theme_toggle_night': 'الوضع الليلي',
    'change_language': 'تغيير اللغة',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    // Apply RTL direction for Arabic
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);

    // Add language class for styling
    document.documentElement.classList.remove('lang-en', 'lang-fr', 'lang-ar');
    document.documentElement.classList.add(`lang-${language}`);
  }, [language]);

  // Translate function
  const t = (key: string): string => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }

    // Fallback to French if translation is missing
    if (translations.fr[key]) {
      return translations.fr[key];
    }

    // Return the key itself if no translation found
    return key;
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    // Save language preference in localStorage
    localStorage.setItem('workit-language', lang);
  };

  // On mount, check if there's a saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('workit-language') as Language | null;
    if (savedLanguage && ['en', 'fr', 'ar'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
