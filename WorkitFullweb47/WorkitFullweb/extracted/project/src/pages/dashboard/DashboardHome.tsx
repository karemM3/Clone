import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  ArrowUpRight,
  Clock,
  FileText,
  PlusCircle,
  MessageSquare,
  User,
  Award,
  Star,
  Calendar,
  BarChart2,
  Briefcase
} from 'lucide-react';

interface DashboardStat {
  title: string;
  value: string | number;
  change: number;
  icon: JSX.Element;
  iconBg: string;
}

interface RecentOrder {
  id: string;
  clientName: string;
  clientAvatar?: string;
  service: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
}

const DashboardHome = () => {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [freelancerStats, setFreelancerStats] = useState<any>({});
  const [skills, setSkills] = useState<{name: string, level: number}[]>([]);

  useEffect(() => {
    // Simulate API call to get dashboard data
    const fetchDashboardData = async () => {
      setIsLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock dashboard stats
      const mockStats: DashboardStat[] = [
        {
          title: 'Ventes ce mois',
          value: '1,285 TND',
          change: 12.5,
          icon: <TrendingUp size={20} />,
          iconBg: 'bg-green-500',
        },
        {
          title: 'En attente',
          value: '450 TND',
          change: -3.2,
          icon: <Clock size={20} />,
          iconBg: 'bg-orange-500',
        },
        {
          title: 'Commandes',
          value: 14,
          change: 8.3,
          icon: <ShoppingBag size={20} />,
          iconBg: 'bg-purple-500',
        },
        {
          title: 'Nouveaux clients',
          value: 7,
          change: 4.6,
          icon: <Users size={20} />,
          iconBg: 'bg-blue-500',
        },
      ];

      // Mock recent orders
      const mockRecentOrders: RecentOrder[] = [
        {
          id: 'ORD-001',
          clientName: 'Jean Dupont',
          clientAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          service: 'Développement Web Fullstack',
          date: '2025-03-18',
          status: 'in_progress',
          price: 150,
        },
        {
          id: 'ORD-002',
          clientName: 'Sophie Martin',
          clientAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
          service: 'Création de Logo',
          date: '2025-03-15',
          status: 'completed',
          price: 80,
        },
        {
          id: 'ORD-003',
          clientName: 'Marc Lefevre',
          clientAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
          service: 'Développement Web Fullstack',
          date: '2025-03-12',
          status: 'pending',
          price: 150,
        },
        {
          id: 'ORD-004',
          clientName: 'Laura Blanc',
          clientAvatar: 'https://randomuser.me/api/portraits/women/4.jpg',
          service: 'Développement d\'API',
          date: '2025-03-10',
          status: 'cancelled',
          price: 120,
        },
      ];

      // Mock active projects for freelancer
      const mockActiveProjects = [
        {
          id: 'PROJ-001',
          title: 'Refonte site e-commerce',
          client: 'Boutique Élégante',
          progress: 75,
          deadline: '2025-04-20',
          budget: 1200,
        },
        {
          id: 'PROJ-002',
          title: 'Application mobile de livraison',
          client: 'FoodExpress',
          progress: 30,
          deadline: '2025-05-15',
          budget: 2500,
        },
        {
          id: 'PROJ-003',
          title: 'Système de réservation en ligne',
          client: 'HôtelVue',
          progress: 90,
          deadline: '2025-04-05',
          budget: 900,
        }
      ];

      // Mock freelancer stats
      const mockFreelancerStats = {
        totalEarnings: 12850,
        availableBalance: 9450,
        pendingPayments: 3400,
        completedProjects: 47,
        averageRating: 4.8,
        totalHours: 1240,
        clientRetentionRate: 85
      };

      // Mock skills
      const mockSkills = [
        { name: 'Web Development', level: 90 },
        { name: 'UI/UX Design', level: 75 },
        { name: 'React/Next.js', level: 85 },
        { name: 'Node.js', level: 80 },
        { name: 'Database Design', level: 70 },
      ];

      setStats(mockStats);
      setRecentOrders(mockRecentOrders);
      setActiveProjects(mockActiveProjects);
      setFreelancerStats(mockFreelancerStats);
      setSkills(mockSkills);
      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  // Helper function to get status styling
  const getStatusStyle = (status: RecentOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500';
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  // Helper function to get status label
  const getStatusLabel = (status: RecentOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-workit-purple"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Tableau de bord</h1>
          <p className="text-gray-400">
            Bienvenue, {user?.name} ! Voici un aperçu de votre activité.
          </p>
        </div>
        <div className="mt-4 md:mt-0 space-x-3">
          <Link
            to="/dashboard/services/add"
            className="inline-flex items-center bg-workit-purple text-white px-4 py-2 rounded-md hover:bg-workit-purple-light transition"
          >
            <span className="mr-2">+ Ajouter un service</span>
          </Link>
          <Link
            to="/post-job"
            className="inline-flex items-center bg-transparent border border-workit-purple text-workit-purple px-4 py-2 rounded-md hover:bg-workit-purple/10 transition"
          >
            <Briefcase size={16} className="mr-2" />
            <span>Proposer un projet</span>
          </Link>
        </div>
      </div>

      {/* Freelancer Earnings Overview */}
      <div className="mb-8 bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Aperçu des revenus</h2>
          <Link
            to="/dashboard/payments"
            className="text-sm text-workit-purple hover:underline"
          >
            Voir les détails
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Revenus totaux</span>
              <span className="p-2 bg-green-500/20 rounded-md">
                <DollarSign size={18} className="text-green-500" />
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{freelancerStats.totalEarnings.toLocaleString()} TND</div>
            <div className="mt-2 text-sm text-gray-400">Depuis le début</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Solde disponible</span>
              <span className="p-2 bg-workit-purple/20 rounded-md">
                <DollarSign size={18} className="text-workit-purple" />
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{freelancerStats.availableBalance.toLocaleString()} TND</div>
            <Link to="/dashboard/payments/withdraw" className="mt-2 text-sm text-workit-purple hover:underline block">Retirer les fonds</Link>
          </div>

          <div className="bg-gray-800 rounded-lg p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Paiements en attente</span>
              <span className="p-2 bg-yellow-500/20 rounded-md">
                <Clock size={18} className="text-yellow-500" />
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{freelancerStats.pendingPayments.toLocaleString()} TND</div>
            <div className="mt-2 text-sm text-gray-400">Sur 3 projets</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                <div className={`mt-2 text-sm ${stat.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  <span className="flex items-center">
                    {stat.change >= 0 ? (
                      <ArrowUpRight size={16} className="mr-1" />
                    ) : (
                      <ArrowUpRight size={16} className="mr-1 rotate-180" />
                    )}
                    {Math.abs(stat.change)}%
                    <span className="text-gray-500 ml-1">du mois dernier</span>
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-md ${stat.iconBg}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Projects and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Active Projects */}
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="flex justify-between items-center p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white">Projets actifs</h2>
            <Link
              to="/dashboard/projects"
              className="text-sm text-workit-purple hover:underline"
            >
              Voir tous
            </Link>
          </div>
          <div className="p-4 divide-y divide-gray-800">
            {activeProjects.map(project => (
              <div key={project.id} className="py-4">
                <div className="flex justify-between items-center mb-3">
                  <Link to={`/dashboard/projects/${project.id}`} className="text-workit-purple font-medium hover:underline">
                    {project.title}
                  </Link>
                  <span className="text-gray-400 text-sm flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {new Date(project.deadline).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm mb-2">
                  <span>Client: {project.client}</span>
                  <span className="font-medium text-white">{project.budget.toLocaleString()} TND</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full mt-2">
                  <div
                    className="bg-workit-purple h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-400 text-xs">Progression</span>
                  <span className="text-white text-xs font-medium">{project.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="flex justify-between items-center p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white">Commandes récentes</h2>
            <Link
              to="/dashboard/orders"
              className="text-sm text-workit-purple hover:underline"
            >
              Voir toutes
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
                  <th className="py-4 px-6 font-medium">Client</th>
                  <th className="py-4 px-6 font-medium">Service</th>
                  <th className="py-4 px-6 font-medium">Statut</th>
                  <th className="py-4 px-6 font-medium text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.slice(0, 3).map((order) => (
                  <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                          <img
                            src={order.clientAvatar}
                            alt={order.clientName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-white">{order.clientName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-300">{order.service}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-white font-medium">
                      {order.price.toFixed(2)} TND
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions and Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Freelancer Performance */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance du freelancer</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Note moyenne</span>
                <div className="flex items-center text-yellow-400">
                  <Star size={16} className="fill-current" />
                  <span className="ml-1 text-white">{freelancerStats.averageRating}/5</span>
                </div>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${(freelancerStats.averageRating/5)*100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Projets complétés</span>
                <span className="text-white">{freelancerStats.completedProjects}</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: '75%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Taux de fidélisation</span>
                <span className="text-white">{freelancerStats.clientRetentionRate}%</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${freelancerStats.clientRetentionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <h4 className="text-white font-medium mb-3">Compétences principales</h4>
              <div className="space-y-3">
                {skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300 text-sm">{skill.name}</span>
                      <span className="text-gray-400 text-sm">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full">
                      <div
                        className="bg-workit-purple h-1.5 rounded-full"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <Link
              to="/dashboard/services"
              className="flex items-center px-4 py-3 text-gray-300 rounded-md hover:bg-gray-800 transition"
            >
              <FileText size={18} className="mr-3 text-workit-purple" />
              <span>Gérer mes services</span>
            </Link>
            <Link
              to="/dashboard/services/add"
              className="flex items-center px-4 py-3 text-gray-300 rounded-md hover:bg-gray-800 transition"
            >
              <PlusCircle size={18} className="mr-3 text-workit-purple" />
              <span>Ajouter un nouveau service</span>
            </Link>
            <Link
              to="/dashboard/messages"
              className="flex items-center px-4 py-3 text-gray-300 rounded-md hover:bg-gray-800 transition"
            >
              <MessageSquare size={18} className="mr-3 text-workit-purple" />
              <span>Messages</span>
              <span className="ml-auto bg-workit-purple text-white text-xs px-2 py-1 rounded-full">3</span>
            </Link>
            <Link
              to="/dashboard/orders"
              className="flex items-center px-4 py-3 text-gray-300 rounded-md hover:bg-gray-800 transition"
            >
              <ShoppingBag size={18} className="mr-3 text-workit-purple" />
              <span>Gérer les commandes</span>
            </Link>
            <Link
              to="/dashboard/payments"
              className="flex items-center px-4 py-3 text-gray-300 rounded-md hover:bg-gray-800 transition"
            >
              <DollarSign size={18} className="mr-3 text-workit-purple" />
              <span>Paiements</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center px-4 py-3 text-gray-300 rounded-md hover:bg-gray-800 transition"
            >
              <User size={18} className="mr-3 text-workit-purple" />
              <span>Modifier mon profil</span>
            </Link>
          </div>
        </div>

        {/* Service Performance */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance de vos services</h3>
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-white font-medium">Développement Web Fullstack</div>
                <div className="text-workit-purple font-medium">150 TND</div>
              </div>
              <div className="flex justify-between text-sm text-gray-400 mb-3">
                <div>10 ventes</div>
                <div>1500 TND au total</div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-workit-purple h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-white font-medium">Création de Logo</div>
                <div className="text-workit-purple font-medium">80 TND</div>
              </div>
              <div className="flex justify-between text-sm text-gray-400 mb-3">
                <div>5 ventes</div>
                <div>400 TND au total</div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-workit-purple h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-white font-medium">Développement d'API</div>
                <div className="text-workit-purple font-medium">120 TND</div>
              </div>
              <div className="flex justify-between text-sm text-gray-400 mb-3">
                <div>3 ventes</div>
                <div>360 TND au total</div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-workit-purple h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
