import { ReactNode, useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useMessages } from '../../context/MessageContext';
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  MessageSquare,
  Settings,
  LogOut,
  ChevronDown,
  Users,
  Menu,
  X,
  CreditCard,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isAuthenticated, logout } = useUser();
  const { unreadCount } = useMessages();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Protect the dashboard routes
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Make sure the user is a freelancer
  if (!user?.isFreelancer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Accès limité</h1>
        <p className="text-gray-400 mb-6 max-w-md">
          Cette section est réservée aux freelances. Pour devenir freelance, mettez à jour vos préférences dans votre profil.
        </p>
        <Link
          to="/profile"
          className="bg-workit-purple text-white px-6 py-2 rounded-md hover:bg-workit-purple-light transition"
        >
          Mettre à jour le profil
        </Link>
      </div>
    );
  }

  const navItems = [
    {
      name: 'Tableau de bord',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: 'Mes services',
      path: '/dashboard/services',
      icon: <FileText size={20} />,
    },
    {
      name: 'Commandes',
      path: '/dashboard/orders',
      icon: <ShoppingBag size={20} />,
    },
    {
      name: 'Messages',
      path: '/dashboard/messages',
      icon: <MessageSquare size={20} />,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      name: 'Paiements',
      path: '/dashboard/payments',
      icon: <CreditCard size={20} />,
    },
    {
      name: 'Clients',
      path: '/dashboard/clients',
      icon: <Users size={20} />,
    },
    {
      name: 'Paramètres',
      path: '/dashboard/settings',
      icon: <Settings size={20} />,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-workit-dark">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-2 text-white text-xl font-bold">
            <div className="flex">
              <div className="w-6 h-6 rounded-full bg-workit-purple-light"></div>
              <div className="w-6 h-6 rounded-full bg-workit-purple-light -ml-3"></div>
            </div>
            <span>WorkiT</span>
          </Link>
          <button
            className="text-gray-500 hover:text-gray-300 lg:hidden"
            onClick={toggleSidebar}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-workit-purple text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                  {item.badge !== undefined && (
                    <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-workit-purple-dark text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-workit-purple-dark flex items-center justify-center overflow-hidden">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-lg">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <div className="flex items-center text-xs text-gray-400">
                  <span>Freelance</span>
                  <ChevronDown size={14} className="ml-1" />
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="mt-4 flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              Se déconnecter
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="bg-gray-900 shadow-md">
          <div className="flex items-center justify-between p-4">
            <button
              className="text-gray-500 hover:text-gray-300 focus:outline-none lg:hidden"
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>
            <div className="text-xl font-bold text-white ml-4 lg:ml-0">
              Tableau de bord
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/dashboard/messages" className="relative text-gray-400 hover:text-white">
                <MessageSquare size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-workit-purple text-xs text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <Link
                to="/profile"
                className="relative rounded-full w-8 h-8 overflow-hidden bg-gray-700 flex items-center justify-center border border-gray-600"
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-workit-dark">
          <div className="container mx-auto py-6 px-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
