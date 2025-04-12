import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  return (
    <footer className={`${theme === 'dark' ? 'bg-workit-dark' : 'bg-gray-100'} py-10 mt-auto`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Column */}
          <div>
            <Link to="/" className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-workit-purple-dark'} text-xl font-bold mb-4`}>
              <div className="flex">
                <div className="w-6 h-6 rounded-full bg-workit-purple-light"></div>
                <div className="w-6 h-6 rounded-full bg-workit-purple-light -ml-3"></div>
              </div>
              <span>{t('site_title')}</span>
            </Link>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mb-6`}>
              {t('footer_description')}
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-workit-purple-dark'} font-semibold mb-4`}>
              {t('site_title')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-workit-purple-dark'} transition`}>
                  {t('about_us')}
                </Link>
              </li>
              <li>
                <Link to="/buyer-protection" className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-workit-purple-dark'} transition`}>
                  {t('buyer_seller_protection')}
                </Link>
              </li>
              <li>
                <Link to="/approval-process" className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-workit-purple-dark'} transition`}>
                  {t('approval_process')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-workit-purple-dark'} font-semibold mb-4`}>
              {t('contact_us')}
            </h3>
            <ul className="space-y-2">
              <li className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                <a
                  href="mailto:hi@workit.com"
                  className={`${theme === 'dark' ? 'hover:text-white' : 'hover:text-workit-purple-dark'} transition`}
                >
                  hi@workit.com
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-workit-purple-dark'} transition`}
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-workit-purple-dark'} transition`}
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className={`border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} mt-8 pt-6 flex flex-col md:flex-row justify-between items-center`}>
          <div className="flex space-x-6 mb-4 md:mb-0">
            <Link to="/terms" className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-workit-purple-dark'} text-sm transition`}>
              {t('terms_conditions')}
            </Link>
            <Link to="/privacy" className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-workit-purple-dark'} text-sm transition`}>
              {t('privacy_policy')}
            </Link>
          </div>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
            © {currentYear} {t('site_title')}. {t('all_rights_reserved')}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
