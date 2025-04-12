import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Edit, Trash2, Search, Plus, Filter, ChevronDown } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  totalSpent: number;
  lastOrder: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

const DashboardClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch clients
    const fetchClients = async () => {
      setIsLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock clients data
      const mockClients: Client[] = [
        {
          id: 'client1',
          name: 'Jean Dupont',
          email: 'jean.dupont@example.com',
          phone: '+33 6 12 34 56 78',
          location: 'Paris, France',
          totalSpent: 1250,
          lastOrder: '2024-03-15',
          status: 'active',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        },
        {
          id: 'client2',
          name: 'Marie Laurent',
          email: 'marie.laurent@example.com',
          phone: '+33 6 23 45 67 89',
          location: 'Lyon, France',
          totalSpent: 850,
          lastOrder: '2024-02-28',
          status: 'active',
          avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        },
        {
          id: 'client3',
          name: 'Thomas Bernard',
          email: 'thomas.bernard@example.com',
          phone: '+33 6 34 56 78 90',
          location: 'Marseille, France',
          totalSpent: 500,
          lastOrder: '2024-02-10',
          status: 'inactive',
          avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        },
        {
          id: 'client4',
          name: 'Sophie Martin',
          email: 'sophie.martin@example.com',
          phone: '+33 6 45 67 89 01',
          location: 'Toulouse, France',
          totalSpent: 1800,
          lastOrder: '2024-03-20',
          status: 'active',
          avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
        },
        {
          id: 'client5',
          name: 'Julien Petit',
          email: 'julien.petit@example.com',
          phone: '+33 6 56 78 90 12',
          location: 'Bordeaux, France',
          totalSpent: 350,
          lastOrder: '2024-01-15',
          status: 'inactive',
          avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
        },
        {
          id: 'client6',
          name: 'Céline Dubois',
          email: 'celine.dubois@example.com',
          phone: '+33 6 67 89 01 23',
          location: 'Nice, France',
          totalSpent: 1050,
          lastOrder: '2024-03-05',
          status: 'active',
          avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
        },
      ];

      setClients(mockClients);
      setIsLoading(false);
    };

    fetchClients();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleClientModal = (client: Client | null = null) => {
    setSelectedClient(client);
    setIsClientModalOpen(!isClientModalOpen);
  };

  const handleStatusFilter = (status: 'all' | 'active' | 'inactive') => {
    setStatusFilter(status);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Function to format date string to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Clients</h1>
          <p className="text-gray-400">
            Gérez vos clients et consultez leurs informations
          </p>
        </div>
        <button
          onClick={() => toggleClientModal()}
          className="mt-4 md:mt-0 inline-flex items-center bg-workit-purple text-white px-4 py-2 rounded-md hover:bg-workit-purple-light transition"
        >
          <Plus size={18} className="mr-2" />
          Ajouter un client
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-900 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Rechercher un client..."
              className="block w-full bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-workit-purple focus:border-transparent"
            />
          </div>

          <div className="relative">
            <div className="inline-flex items-center overflow-hidden rounded-md border border-gray-700 bg-gray-800">
              <button
                className="flex items-center gap-2 bg-gray-800 px-4 py-2 text-white"
              >
                <span className="flex items-center gap-2">
                  <Filter size={16} />
                  Statut: {statusFilter === 'all' ? 'Tous' : statusFilter === 'active' ? 'Actif' : 'Inactif'}
                </span>
                <ChevronDown size={16} />
              </button>

              <div
                className="absolute end-0 top-10 z-10 mt-1 w-56 rounded-md border border-gray-700 bg-gray-800 shadow-lg"
                role="menu"
              >
                <div className="p-2">
                  <button
                    onClick={() => handleStatusFilter('all')}
                    className={`block rounded-lg px-4 py-2 text-sm w-full text-left ${
                      statusFilter === 'all' ? 'bg-workit-purple text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                    role="menuitem"
                  >
                    Tous les clients
                  </button>

                  <button
                    onClick={() => handleStatusFilter('active')}
                    className={`block rounded-lg px-4 py-2 text-sm w-full text-left ${
                      statusFilter === 'active' ? 'bg-workit-purple text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                    role="menuitem"
                  >
                    Clients actifs
                  </button>

                  <button
                    onClick={() => handleStatusFilter('inactive')}
                    className={`block rounded-lg px-4 py-2 text-sm w-full text-left ${
                      statusFilter === 'inactive' ? 'bg-workit-purple text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                    role="menuitem"
                  >
                    Clients inactifs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Total dépensé
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Dernière commande
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {client.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={client.avatar}
                              alt={client.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-workit-purple flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {client.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {client.name}
                          </div>
                          <div className="text-sm text-gray-400 flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {client.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="text-sm text-gray-300 flex items-center">
                          <Mail size={14} className="mr-2" />
                          {client.email}
                        </div>
                        <div className="text-sm text-gray-300 flex items-center">
                          <Phone size={14} className="mr-2" />
                          {client.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {client.totalSpent.toFixed(2)} TND
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {formatDate(client.lastOrder)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        client.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {client.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleClientModal(client)}
                        className="text-indigo-400 hover:text-indigo-300 mr-3"
                      >
                        <Edit size={16} />
                      </button>
                      <button className="text-red-400 hover:text-red-300">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                    Aucun client trouvé correspondant à votre recherche
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Details Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-white mb-4">
                      {selectedClient ? 'Modifier le client' : 'Ajouter un nouveau client'}
                    </h3>

                    <form className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-400">Nom</label>
                        <input
                          type="text"
                          id="name"
                          className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                          defaultValue={selectedClient?.name}
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email</label>
                        <input
                          type="email"
                          id="email"
                          className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                          defaultValue={selectedClient?.email}
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-400">Téléphone</label>
                        <input
                          type="text"
                          id="phone"
                          className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                          defaultValue={selectedClient?.phone}
                        />
                      </div>

                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-400">Localisation</label>
                        <input
                          type="text"
                          id="location"
                          className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                          defaultValue={selectedClient?.location}
                        />
                      </div>

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-400">Statut</label>
                        <select
                          id="status"
                          className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                          defaultValue={selectedClient?.status}
                        >
                          <option value="active">Actif</option>
                          <option value="inactive">Inactif</option>
                        </select>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-workit-purple text-base font-medium text-white hover:bg-workit-purple-light focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {selectedClient ? 'Mettre à jour' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => toggleClientModal()}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-700 shadow-sm px-4 py-2 bg-gray-900 text-base font-medium text-gray-400 hover:bg-gray-800 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardClients;
