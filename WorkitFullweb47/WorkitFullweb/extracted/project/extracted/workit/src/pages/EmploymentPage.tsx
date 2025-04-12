import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  postedAt: string;
  logo?: string;
}

const EmploymentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Mock data for jobs
  const jobs: Job[] = [
    {
      id: '1',
      title: 'Développeur Frontend React',
      company: 'TechCorp',
      location: 'Paris',
      type: 'Temps plein',
      salary: '45 000€ - 65 000€ / an',
      description: 'Nous recherchons un développeur Frontend expérimenté pour rejoindre notre équipe et participer au développement de nos plateformes web.',
      requirements: [
        'Expérience avancée avec React et TypeScript',
        'Bonne connaissance de HTML, CSS et JavaScript',
        'Expérience avec les outils modernes de développement web',
        'Capacité à travailler en équipe',
      ],
      postedAt: '2025-03-15',
      logo: 'https://randomuser.me/api/portraits/men/40.jpg',
    },
    {
      id: '2',
      title: 'Développeur Backend Node.js',
      company: 'InnoSoft',
      location: 'Lyon',
      type: 'Temps plein',
      salary: '50 000€ - 70 000€ / an',
      description: 'InnoSoft recherche un développeur Backend pour renforcer son équipe technique et contribuer au développement de services web hautement scalables.',
      requirements: [
        'Expérience avec Node.js et Express',
        'Connaissance des bases de données SQL et NoSQL',
        'Expérience en conception d\'API RESTful',
        'Compréhension des principes de sécurité web',
      ],
      postedAt: '2025-03-10',
      logo: 'https://randomuser.me/api/portraits/men/42.jpg',
    },
    {
      id: '3',
      title: 'Designer UI/UX',
      company: 'DigitalCreative',
      location: 'Paris',
      type: 'Freelance',
      salary: '400€ - 600€ / jour',
      description: 'Nous sommes à la recherche d\'un designer UI/UX talentueux pour des missions ponctuelles sur divers projets web et mobiles.',
      requirements: [
        'Portfolio solide de projets UI/UX',
        'Maîtrise de Figma, Adobe XD ou Sketch',
        'Connaissance des principes d\'accessibilité web',
        'Expérience en conception d\'interfaces pour web et mobile',
      ],
      postedAt: '2025-03-18',
      logo: 'https://randomuser.me/api/portraits/women/40.jpg',
    },
    {
      id: '4',
      title: 'Développeur Fullstack JavaScript',
      company: 'WebSolutions',
      location: 'Marseille',
      type: 'Temps plein',
      salary: '45 000€ - 65 000€ / an',
      description: 'WebSolutions recherche un développeur Fullstack pour participer à la création et à la maintenance de plusieurs projets web en croissance.',
      requirements: [
        'Expérience en développement Fullstack (React et Node.js)',
        'Connaissance des bases de données MongoDB',
        'Expérience avec Git et méthodologies Agile',
        'Capable de travailler de manière autonome',
      ],
      postedAt: '2025-03-05',
      logo: 'https://randomuser.me/api/portraits/men/45.jpg',
    },
    {
      id: '5',
      title: 'Chef de Projet Digital',
      company: 'AgenceDigitale',
      location: 'Bordeaux',
      type: 'Temps plein',
      salary: '55 000€ - 75 000€ / an',
      description: 'Nous cherchons un Chef de Projet Digital pour gérer et coordonner le développement de solutions digitales pour nos clients.',
      requirements: [
        'Expérience avérée en gestion de projets digitaux',
        'Connaissance techniques des environnements web',
        'Excellentes compétences en communication',
        'Capacité à gérer plusieurs projets simultanément',
      ],
      postedAt: '2025-03-12',
      logo: 'https://randomuser.me/api/portraits/women/42.jpg',
    },
  ];

  // If ID is provided, display job details instead of job list
  if (id) {
    const job = jobs.find(job => job.id === id);

    if (!job) {
      return (
        <div className="container mx-auto py-12 px-4">
          <div className="bg-workit-dark-card rounded-lg p-8 text-center">
            <h3 className="text-white text-xl mb-2">Offre d'emploi non trouvée</h3>
            <p className="text-gray-400 mb-6">
              L'offre d'emploi que vous recherchez n'existe pas ou a été supprimée.
            </p>
            <button
              onClick={() => navigate('/employment')}
              className="bg-workit-purple text-white px-4 py-2 rounded-md hover:bg-workit-purple-light transition"
            >
              Retour aux offres d'emploi
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto py-12 px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate('/employment')}
            className="flex items-center text-workit-purple hover:underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Retour aux offres d'emploi
          </button>
        </div>

        <div className="bg-workit-dark-card rounded-lg overflow-hidden border border-gray-800">
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start">
              <div className="md:w-24 md:mr-6 mb-4 md:mb-0">
                <div className="w-24 h-24 rounded-md overflow-hidden bg-gray-800 flex items-center justify-center">
                  {job.logo ? (
                    <img
                      src={job.logo}
                      alt={job.company}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {job.company.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {job.title}
                </h1>

                <div className="flex flex-wrap items-center text-gray-400 mb-6">
                  <span className="mr-4 font-medium">{job.company}</span>
                  <span className="mr-4">{job.location}</span>
                  <span className="mr-4">{job.type}</span>
                  <span className="text-workit-purple font-medium">{job.salary}</span>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg mb-8">
                  <h2 className="text-xl font-semibold text-white mb-4">Description du poste</h2>
                  <p className="text-gray-300 mb-6">{job.description}</p>

                  <h3 className="text-lg font-semibold text-white mb-3">Compétences requises</h3>
                  <ul className="list-disc pl-6 text-gray-300 space-y-2">
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between bg-gray-800 p-6 rounded-lg">
                  <div className="mb-4 md:mb-0">
                    <p className="text-white font-medium">Date de publication: {new Date(job.postedAt).toLocaleDateString('fr-FR')}</p>
                    <p className="text-gray-400 text-sm mt-1">Référence: JOB-{job.id}</p>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      className="bg-workit-purple text-white px-6 py-3 rounded-md font-medium hover:bg-workit-purple-light transition"
                      onClick={() => alert("Votre candidature a été soumise!")}
                    >
                      Postuler maintenant
                    </button>
                    <button
                      className="border border-workit-purple text-workit-purple px-6 py-3 rounded-md font-medium hover:bg-workit-purple hover:text-white transition"
                      onClick={() => alert("Offre sauvegardée!")}
                    >
                      Sauvegarder
                    </button>
                  </div>
                </div>

                <div className="mt-8 px-6 py-4 bg-workit-purple-dark rounded-lg">
                  <h3 className="text-white font-medium mb-2">À propos de {job.company}</h3>
                  <p className="text-gray-300">
                    {job.company} est une entreprise leader dans son domaine, offrant un environnement de travail stimulant et des opportunités de développement professionnel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter jobs based on search term and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || job.type === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || job.location === selectedLocation;

    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Get unique locations and job types for filters
  const locations = Array.from(new Set(jobs.map(job => job.location)));
  const jobTypes = Array.from(new Set(jobs.map(job => job.type)));

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trouvez votre Prochain Emploi
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Découvrez des opportunités d'emploi dans le domaine du développement, du design
            et du marketing digital.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-workit-dark-card rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un emploi, une entreprise..."
                className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-workit-purple"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-workit-purple"
            >
              <option value="all">Tous les types</option>
              {jobTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-3 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-workit-purple"
            >
              <option value="all">Toutes les villes</option>
              {locations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Jobs List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <div key={job.id} className="bg-workit-dark-card rounded-lg overflow-hidden border border-gray-800 transition hover:border-workit-purple">
                <div className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-800 flex items-center justify-center">
                        {job.logo ? (
                          <img
                            src={job.logo}
                            alt={job.company}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-bold text-white">
                            {job.company.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-white mb-1">
                        {job.title}
                      </h2>
                      <div className="flex flex-wrap items-center text-sm text-gray-400 mb-4">
                        <span className="mr-4">{job.company}</span>
                        <span className="mr-4">{job.location}</span>
                        <span className="mr-4">{job.type}</span>
                        <span className="text-workit-purple">{job.salary}</span>
                      </div>
                      <p className="text-gray-400 mb-4">{job.description}</p>
                      <div className="mb-4">
                        <h3 className="text-white font-medium mb-2">Compétences requises:</h3>
                        <ul className="list-disc pl-5 text-gray-400 text-sm">
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                          {job.requirements.length > 3 && (
                            <li>Et plus...</li>
                          )}
                        </ul>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Publié le {new Date(job.postedAt).toLocaleDateString('fr-FR')}
                        </span>
                        <Link
                          to={`/employment/${job.id}`}
                          className="inline-block bg-workit-purple text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-workit-purple-light transition"
                        >
                          Voir l'offre
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-workit-dark-card rounded-lg p-8 text-center">
              <h3 className="text-white text-xl mb-2">Aucun emploi trouvé</h3>
              <p className="text-gray-400">
                Essayez d'ajuster vos filtres ou votre recherche pour trouver plus de résultats.
              </p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-workit-purple rounded-lg overflow-hidden">
          <div className="p-8 md:flex md:items-center md:justify-between">
            <div className="mb-6 md:mb-0 md:max-w-xl">
              <h2 className="text-2xl font-bold text-white mb-3">
                Vous recherchez des talents pour votre entreprise?
              </h2>
              <p className="text-white opacity-90">
                Publiez vos offres d'emploi gratuitement et accédez à notre vivier de talents qualifiés.
              </p>
            </div>
            <div className="text-center md:text-right">
              <Link
                to="/post-job"
                className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-900 transition-colors shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Publier une offre
              </Link>
            </div>
          </div>
          <div className="bg-workit-purple-dark px-8 py-3 text-center md:text-right text-white text-sm opacity-80">
            Plus de 500 entreprises font confiance à WorkiT pour leurs recrutements
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmploymentPage;
