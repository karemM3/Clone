import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useMessages } from '../../context/MessageContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { MessageSquare, Moon, Sun, Globe } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useUser();
  const { unreadCount } = useMessages();
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`${theme === 'dark' ? 'bg-workit-purple' : 'bg-workit-purple-dark'} p-4`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 text-white text-xl font-bold">
            <div className="flex">
              <div className="w-8 h-8 rounded-full bg-workit-purple-light"></div>
              <div className="w-8 h-8 rounded-full bg-workit-purple-light -ml-4"></div>
            </div>
            <span>{t('site_title')}</span>
          </Link>
        </div>

        {/* Navigation links */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="text-white hover:text-gray-200">
            {t('home')}
          </Link>
          <Link to="/services" className="text-white hover:text-gray-200">
            {t('services')}
          </Link>
          <Link to="/employment" className="text-white hover:text-gray-200">
            {t('employment')}
          </Link>
          <Link to="/contact" className="text-white hover:text-gray-200">
            {t('contact')}
          </Link>
        </div>

        {/* Authentication buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4 relative">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="text-white"
                  aria-label="Change Language"
                >
                  <Globe size={22} />
                </button>
                {isLangMenuOpen && (
                  <div className="absolute right-0 top-10 mt-2 w-32 bg-workit-dark-card rounded-md shadow-lg z-50">
                    <div className="py-1">
                      {language !== 'en' && (
                        <button
                          onClick={() => {
                            changeLanguage('en');
                            setIsLangMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800"
                        >
                          {language === 'fr' ? 'English' : language === 'ar' ? 'الإنجليزية' : 'English'}
                        </button>
                      )}
                      {language !== 'fr' && (
                        <button
                          onClick={() => {
                            changeLanguage('fr');
                            setIsLangMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800"
                        >
                          {language === 'en' ? 'Français' : language === 'ar' ? 'الفرنسية' : 'Français'}
                        </button>
                      )}
                      {language !== 'ar' && (
                        <button
                          onClick={() => {
                            changeLanguage('ar');
                            setIsLangMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800"
                        >
                          {language === 'en' ? 'Arabic' : language === 'fr' ? 'Arabe' : 'عربي'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Dark/Light Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="text-white"
                aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
              </button>

              {/* Messages notification */}
              <Link to="/messenger" className="relative text-white">
                <MessageSquare size={22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 rounded-full bg-workit-purple-dark text-white flex items-center justify-center">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span>{user?.name.charAt(0).toLowerCase()}</span>
                  )}
                </div>
                {user?.name && (
                  <span className="text-white">{user.name}</span>
                )}
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-10 mt-2 w-48 bg-workit-dark-card rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-white hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('profile')}
                    </Link>
                    <Link
                      to="/dashboard/messages"
                      className="block px-4 py-2 text-white hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex justify-between items-center">
                        <span>{t('messages')}</span>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-white hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('dashboard')}
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800"
                    >
                      {t('logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white border border-white rounded-md px-4 py-1 hover:bg-workit-purple-dark transition"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="bg-workit-purple-dark text-white rounded-md px-4 py-1 hover:bg-workit-purple-light transition"
              >
                {t('register')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-workit-purple-dark mt-2 p-4 rounded-lg">
          <div className="flex flex-col space-y-3">
            <Link
              to="/"
              className="text-white hover:text-gray-200"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('home')}
            </Link>
            <Link
              to="/services"
              className="text-white hover:text-gray-200"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('services')}
            </Link>
            <Link
              to="/employment"
              className="text-white hover:text-gray-200"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('employment')}
            </Link>
            <Link
              to="/contact"
              className="text-white hover:text-gray-200"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('contact')}
            </Link>

            {/* Theme Toggle in Mobile Menu */}
            <button
              onClick={() => {
                toggleTheme();
                setIsMenuOpen(false);
              }}
              className="text-left text-white hover:text-gray-200 flex items-center"
            >
              {theme === 'dark'
                ? <><Sun size={18} className="mr-2" /> {t('theme_toggle_day')}</>
                : <><Moon size={18} className="mr-2" /> {t('theme_toggle_night')}</>
              }
            </button>

            {/* Language Switcher in Mobile Menu */}
            <div className="border-t border-gray-700 pt-2">
              <div className="text-white text-sm mb-1 opacity-70 flex items-center">
                <Globe size={18} className="mr-2" />
                {t('change_language')}
              </div>
              {language !== 'en' && (
                <button
                  onClick={() => {
                    changeLanguage('en');
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-white hover:text-gray-200 block mb-1"
                >
                  {language === 'fr' ? 'English' : 'الإنجليزية'}
                </button>
              )}
              {language !== 'fr' && (
                <button
                  onClick={() => {
                    changeLanguage('fr');
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-white hover:text-gray-200 block mb-1"
                >
                  {language === 'en' ? 'Français' : 'الفرنسية'}
                </button>
              )}
              {language !== 'ar' && (
                <button
                  onClick={() => {
                    changeLanguage('ar');
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-white hover:text-gray-200 block mb-1"
                >
                  {language === 'en' ? 'Arabic' : 'Arabe'}
                </button>
              )}
            </div>

            {isAuthenticated ? (
              <>
                <Link
                  to="/messenger"
                  className="text-white hover:text-gray-200 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('messages')}
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile"
                  className="text-white hover:text-gray-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('profile')}
                </Link>
                <Link
                  to="/dashboard"
                  className="text-white hover:text-gray-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('dashboard')}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-white hover:text-gray-200"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-gray-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="text-white hover:text-gray-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
