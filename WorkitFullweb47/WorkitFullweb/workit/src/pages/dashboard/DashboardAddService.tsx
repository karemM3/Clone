import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, Upload, Plus, X, AlertCircle } from 'lucide-react';
import { createService } from '../../services/api-compat';

// Define schema for service creation
const serviceSchema = z.object({
  title: z.string().min(10, { message: 'Le titre doit contenir au moins 10 caractères' }),
  category: z.string().min(1, { message: 'La catégorie est requise' }),
  subcategory: z.string().min(1, { message: 'La sous-catégorie est requise' }),
  price: z.coerce.number().positive({ message: 'Le prix doit être positif' }),
  description: z.string().min(50, { message: 'La description doit contenir au moins 50 caractères' }),
  deliveryTime: z.coerce.number().int().min(1, { message: 'Le délai de livraison est requis' }),
  revisions: z.string().min(1, { message: 'Le nombre de révisions est requis' }),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

const DashboardAddService = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>(['']);
  const [featureInput, setFeatureInput] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string; subcategories: {id: string; name: string}[] }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Setup form
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: '',
      category: '',
      subcategory: '',
      price: 0,
      description: '',
      deliveryTime: 1,
      revisions: 'Illimitées',
    }
  });

  // Watch category for dependent subcategory field
  const watchCategory = watch('category');

  // Load categories (mock data for now)
  useEffect(() => {
    // In a real application, these would be fetched from an API
    const mockCategories = [
      {
        id: 'dev',
        name: 'Développement & IT',
        subcategories: [
          { id: 'web', name: 'Développement Web' },
          { id: 'mobile', name: 'Applications Mobiles' },
          { id: 'desktop', name: 'Applications Desktop' },
          { id: 'cms', name: 'CMS' },
          { id: 'ecommerce', name: 'E-commerce' },
          { id: 'api', name: 'API & Backend' },
        ]
      },
      {
        id: 'design',
        name: 'Design & Création',
        subcategories: [
          { id: 'graphic', name: 'Design Graphique' },
          { id: 'ux', name: 'UI/UX Design' },
          { id: 'logo', name: 'Logo Design' },
          { id: 'illustration', name: 'Illustration' },
          { id: 'animation', name: '3D & Animation' },
        ]
      },
      {
        id: 'marketing',
        name: 'Marketing Digital',
        subcategories: [
          { id: 'seo', name: 'SEO' },
          { id: 'social', name: 'Réseaux Sociaux' },
          { id: 'content', name: 'Marketing de Contenu' },
          { id: 'analytics', name: 'Analytics & Data' },
        ]
      },
      {
        id: 'writing',
        name: 'Rédaction & Traduction',
        subcategories: [
          { id: 'copywriting', name: 'Copywriting' },
          { id: 'translation', name: 'Traduction' },
          { id: 'proofreading', name: 'Relecture & Correction' },
          { id: 'creative', name: 'Rédaction Créative' },
        ]
      }
    ];
    setCategories(mockCategories);
  }, []);

  // Reset subcategory when category changes
  useEffect(() => {
    if (watchCategory !== selectedCategory) {
      setValue('subcategory', '');
      setSelectedCategory(watchCategory);
    }
  }, [watchCategory, selectedCategory, setValue]);

  // Handle main image upload
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview image
    const reader = new FileReader();
    reader.onload = () => {
      setMainImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setMainImage(file);
  };

  // Handle gallery images upload
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newGalleryImages = [...galleryImages];
    const newPreviews = [...galleryPreviews];

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        newPreviews.push(reader.result as string);
        setGalleryPreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
      newGalleryImages.push(file);
    });

    setGalleryImages(newGalleryImages);
  };

  // Remove gallery image
  const removeGalleryImage = (index: number) => {
    const newGalleryImages = [...galleryImages];
    const newPreviews = [...galleryPreviews];
    newGalleryImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setGalleryImages(newGalleryImages);
    setGalleryPreviews(newPreviews);
  };

  // Handle adding features
  const addFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  // Remove a feature
  const removeFeature = (index: number) => {
    const newFeatures = [...features];
    newFeatures.splice(index, 1);
    setFeatures(newFeatures);
  };

  // Submit form
  const onSubmit: SubmitHandler<ServiceFormData> = async (data) => {
    if (!user) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // In a real app, you would upload the images to a storage service
      // and get the URLs to save in the database
      let mainImageUrl = '';
      if (mainImagePreview) {
        mainImageUrl = mainImagePreview; // Simulate a stored URL for demo
      }

      let galleryUrls: string[] = [];
      if (galleryPreviews.length > 0) {
        galleryUrls = galleryPreviews; // Simulate stored URLs for demo
      }

      // Create service data
      const serviceData = {
        ...data,
        features: features.filter(f => f.trim() !== ''), // Remove empty features
        userId: user.id,
        image: mainImageUrl,
        gallery: galleryUrls
      };

      // Use the new createService method
      const result = await createService(serviceData);

      setSuccessMessage("Service créé avec succès!");

      // Navigate back to services list after a short delay
      setTimeout(() => {
        navigate('/dashboard/services');
      }, 2000);

    } catch (error) {
      console.error('Error saving service:', error);
      setErrorMessage("Erreur lors de la création du service. Veuillez réessayer.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Link to="/dashboard/services" className="mr-4 text-gray-400 hover:text-white transition">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Ajouter un service</h1>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-md mb-6 flex items-start">
          <AlertCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-md mb-6 flex items-start">
          <AlertCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Informations de base</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-white text-sm font-medium mb-2">
                Titre du service <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                {...register('title')}
                className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-workit-purple"
                placeholder="Ex: Développement de site web responsive avec React"
              />
              {errors.title && (
                <p className="mt-1 text-red-500 text-xs">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-white text-sm font-medium mb-2">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                {...register('category')}
                className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-workit-purple"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-red-500 text-xs">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="subcategory" className="block text-white text-sm font-medium mb-2">
                Sous-catégorie <span className="text-red-500">*</span>
              </label>
              <select
                id="subcategory"
                {...register('subcategory')}
                className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-workit-purple"
                disabled={!watchCategory}
              >
                <option value="">Sélectionner une sous-catégorie</option>
                {watchCategory && categories.find(c => c.id === watchCategory)?.subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
              {errors.subcategory && (
                <p className="mt-1 text-red-500 text-xs">{errors.subcategory.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="price" className="block text-white text-sm font-medium mb-2">
                Prix (TND) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                {...register('price')}
                className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-workit-purple"
                placeholder="Ex: 150"
              />
              {errors.price && (
                <p className="mt-1 text-red-500 text-xs">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="deliveryTime" className="block text-white text-sm font-medium mb-2">
                Délai de livraison (jours) <span className="text-red-500">*</span>
              </label>
              <input
                id="deliveryTime"
                type="number"
                min="1"
                {...register('deliveryTime')}
                className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-workit-purple"
                placeholder="Ex: 7"
              />
              {errors.deliveryTime && (
                <p className="mt-1 text-red-500 text-xs">{errors.deliveryTime.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="revisions" className="block text-white text-sm font-medium mb-2">
                Révisions <span className="text-red-500">*</span>
              </label>
              <select
                id="revisions"
                {...register('revisions')}
                className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-workit-purple"
              >
                <option value="1">1 révision</option>
                <option value="2">2 révisions</option>
                <option value="3">3 révisions</option>
                <option value="5">5 révisions</option>
                <option value="Illimitées">Révisions illimitées</option>
              </select>
              {errors.revisions && (
                <p className="mt-1 text-red-500 text-xs">{errors.revisions.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Description</h2>
          <div>
            <label htmlFor="description" className="block text-white text-sm font-medium mb-2">
              Description détaillée <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={6}
              className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-workit-purple"
              placeholder="Décrivez en détail ce que vous proposez, ce que le client obtiendra, et comment vous travaillez..."
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-red-500 text-xs">{errors.description.message}</p>
            )}
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Fonctionnalités</h2>
          <p className="text-gray-400 mb-4">
            Ajoutez les fonctionnalités incluses dans votre service.
          </p>

          <div className="mb-4">
            <div className="flex">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                className="flex-1 px-4 py-2 rounded-l-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-workit-purple"
                placeholder="Ex: Conception responsive"
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-2 bg-workit-purple text-white rounded-r-md hover:bg-workit-purple-light transition"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {features.map((feature, index) => (
              feature.trim() !== '' && (
                <div key={index} className="flex items-center bg-gray-800 rounded-md p-2">
                  <span className="flex-1 text-white">{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              )
            ))}
            {features.filter(f => f.trim() !== '').length === 0 && (
              <p className="text-gray-500 italic">
                Aucune fonctionnalité ajoutée. Ajoutez au moins une fonctionnalité.
              </p>
            )}
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Images</h2>

          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">
              Image principale
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-700 rounded-md">
              {mainImagePreview ? (
                <div className="space-y-1 text-center">
                  <div className="flex justify-center">
                    <img
                      src={mainImagePreview}
                      alt="Preview"
                      className="max-h-40 max-w-full mb-4 rounded"
                    />
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setMainImage(null);
                        setMainImagePreview(null);
                      }}
                      className="px-3 py-1 bg-red-600/20 text-red-500 text-sm rounded-md hover:bg-red-600/30 transition"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <div className="flex justify-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  </div>
                  <div className="flex text-sm text-gray-400">
                    <label htmlFor="mainImage" className="relative cursor-pointer rounded-md font-medium text-workit-purple hover:text-workit-purple-light focus-within:outline-none">
                      <span>Télécharger une image</span>
                      <input
                        id="mainImage"
                        name="mainImage"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleMainImageUpload}
                      />
                    </label>
                    <p className="pl-1">ou glisser-déposer</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF jusqu'à 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Galerie d'images (optionnel)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-700 rounded-md">
              <div className="space-y-1 text-center">
                <div className="flex justify-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                </div>
                <div className="flex text-sm text-gray-400">
                  <label htmlFor="gallery" className="relative cursor-pointer rounded-md font-medium text-workit-purple hover:text-workit-purple-light focus-within:outline-none">
                    <span>Télécharger des images</span>
                    <input
                      id="gallery"
                      name="gallery"
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={handleGalleryUpload}
                    />
                  </label>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF jusqu'à 10MB
                </p>
              </div>
            </div>

            {galleryPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {galleryPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Gallery ${index}`}
                      className="h-24 w-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            to="/dashboard/services"
            className="px-6 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-workit-purple text-white rounded-md hover:bg-workit-purple-light transition disabled:opacity-70 flex items-center"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              'Créer le service'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DashboardAddService;
