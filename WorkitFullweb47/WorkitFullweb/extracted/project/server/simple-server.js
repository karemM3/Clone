// Simple Express server without MongoDB dependencies
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Sample data
const services = [
  {
    _id: '1',
    title: 'Développement d\'application web React',
    description: 'Création d\'applications web modernes et réactives avec React et Next.js',
    price: 200,
    category: 'web',
    subcategory: 'frontend',
    features: ['Interface responsive', 'API RESTful', 'Authentification'],
    deliveryTime: 10,
    revisions: '3',
    userId: '1',
    image: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2ViJTIwZGV2ZWxvcG1lbnR8ZW58MHx8MHx8fDA%3D'
  },
  {
    _id: '2',
    title: 'Création d\'applications mobiles iOS et Android',
    description: 'Développement d\'applications mobiles cross-platform avec React Native',
    price: 300,
    category: 'mobile',
    subcategory: 'react-native',
    features: ['UI native', 'Notifications push', 'Offline mode'],
    deliveryTime: 15,
    revisions: '2',
    userId: '1',
    image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1vYmlsZSUyMGFwcHxlbnwwfHwwfHx8MA%3D%3D'
  },
  {
    _id: '3',
    title: 'Rédaction SEO et copywriting',
    description: 'Création de contenu optimisé pour les moteurs de recherche et engageant pour vos utilisateurs',
    price: 80,
    category: 'writing',
    subcategory: 'seo',
    features: ['Recherche de mots-clés', 'Optimisation SEO', 'Style captivant'],
    deliveryTime: 3,
    revisions: '5',
    userId: '2',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHdyaXRpbmd8ZW58MHx8MHx8fDA%3D'
  }
];

const users = [
  {
    _id: '1',
    username: 'thomas',
    email: 'thomas@workit.com',
    fullName: 'Thomas Bernard',
    isFreelancer: true,
    profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    _id: '2',
    username: 'julie',
    email: 'julie@workit.com',
    fullName: 'Julie Moreau',
    isFreelancer: true,
    profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg'
  }
];

// API Routes
app.get('/api', (req, res) => {
  res.json({ message: 'WorkiT API is running (Simple Server)' });
});

// Services endpoints
app.get('/api/services', (req, res) => {
  res.json({
    services,
    totalPages: 1,
    currentPage: 1,
    totalServices: services.length
  });
});

app.get('/api/services/:id', (req, res) => {
  const service = services.find(s => s._id === req.params.id);
  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }
  res.json(service);
});

app.post('/api/services', (req, res) => {
  const newService = {
    _id: (services.length + 1).toString(),
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  services.push(newService);
  res.status(201).json(newService);
});

app.put('/api/services/:id', (req, res) => {
  const idx = services.findIndex(s => s._id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Service not found' });
  }

  services[idx] = {
    ...services[idx],
    ...req.body,
    updatedAt: new Date()
  };

  res.json(services[idx]);
});

// Users endpoints
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u._id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
});

// Authentication endpoint (simple mock)
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    res.json({
      user: {
        _id: '1',
        username: 'thomas',
        email: email,
        fullName: 'Thomas Bernard',
        isFreelancer: true,
        profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      token: 'mock-jwt-token'
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Database status endpoint (mock)
app.get('/api/dbstatus', (req, res) => {
  res.json({
    isConnected: true,
    readyState: 1,
    host: 'localhost',
    name: 'workit-api',
    useMockData: true
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT}/api to test the API`);
});
