import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const profileSchema = z.object({
  name: z.string().min(3, { message: 'Le nom doit contenir au moins 3 caractères' }),
  email: z.string().email({ message: 'Adresse email invalide' }),
  bio: z.string().optional(),
  location: z.string().optional(),
  skills: z.string().optional(),
  isFreelancer: z.boolean().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage = () => {
  const { user, updateUser, updateProfilePicture, isAuthenticated, logout } = useUser();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isDirty }, watch } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      location: user?.location || '',
      skills: user?.skills?.join(', ') || '',
      isFreelancer: user?.isFreelancer || false,
    }
  });

  // Get the current value of isFreelancer from the form
  const isFreelancerValue = watch('isFreelancer');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    reset();
    setPreviewImage(null);
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);

      const skills = data.skills
        ? data.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
        : undefined;

      await updateUser({
        name: data.name,
        email: data.email,
        bio: data.bio,
        location: data.location,
        skills,
        isFreelancer: data.isFreelancer,
      });

      setIsEditing(false);
      setIsSaving(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setIsSaving(false);
    }
  };

  const handleProfilePictureClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview the image
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Update the profile picture
    try {
      await updateProfilePicture(file);
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  const createdAtDate = user.createdAt ? new Date(user.createdAt) : new Date();
  const memberSince = createdAtDate.toISOString().split('T')[0];

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-workit-dark-card rounded-lg overflow-hidden shadow-lg">
          {/* Header section with purple gradient */}
          <div className="bg-workit-purple h-40 relative">
            {isEditing ? (
              <button
                onClick={() => navigate('/')}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-md hover:bg-opacity-70 transition"
              >
                Annuler
              </button>
            ) : (
              <button
                onClick={handleEditClick}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-md hover:bg-opacity-70 transition"
              >
                Modifier le profil
              </button>
            )}
          </div>

          {/* Profile avatar */}
          <div className="flex justify-center">
            <div
              className="w-32 h-32 rounded-full -mt-16 overflow-hidden border-4 border-workit-dark-card cursor-pointer"
              onClick={handleProfilePictureClick}
            >
              {previewImage || user.profilePicture ? (
                <img
                  src={previewImage || user.profilePicture}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-workit-purple-dark flex items-center justify-center text-4xl text-white">
                  {user.name.charAt(0).toLowerCase()}
                </div>
              )}
              {isEditing && (
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              )}
            </div>
          </div>

          {isEditing ? (
            // Edit mode
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-white text-sm font-medium mb-2">
                    Nom complet
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name')}
                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-workit-purple"
                  />
                  {errors.name && (
                    <p className="mt-1 text-red-500 text-xs">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-workit-purple"
                  />
                  {errors.email && (
                    <p className="mt-1 text-red-500 text-xs">{errors.email.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-white text-sm font-medium mb-2">
                    Biographie
                  </label>
                  <textarea
                    id="bio"
                    {...register('bio')}
                    rows={4}
                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-workit-purple"
                    placeholder="Décrivez votre expérience, vos compétences, et ce que vous aimez..."
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="location" className="block text-white text-sm font-medium mb-2">
                    Localisation
                  </label>
                  <input
                    id="location"
                    type="text"
                    {...register('location')}
                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-workit-purple"
                    placeholder="Paris, France"
                  />
                </div>

                <div>
                  <label htmlFor="skills" className="block text-white text-sm font-medium mb-2">
                    Compétences (séparées par des virgules)
                  </label>
                  <input
                    id="skills"
                    type="text"
                    {...register('skills')}
                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-workit-purple"
                    placeholder="React, Node.js, UI/UX Design"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      id="isFreelancer"
                      type="checkbox"
                      {...register('isFreelancer')}
                      className="h-4 w-4 text-workit-purple bg-gray-800 border-gray-700 rounded focus:ring-workit-purple"
                    />
                    <label htmlFor="isFreelancer" className="ml-2 block text-white">
                      Je suis un freelancer et je souhaite proposer mes services
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !isDirty}
                  className="bg-workit-purple text-white px-6 py-2 rounded-md hover:bg-workit-purple-light transition disabled:opacity-70"
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          ) : (
            // View mode
            <div className="p-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="text-gray-400">{user.email}</p>

                <div className="mt-4 flex justify-center items-center space-x-4 text-sm text-gray-400">
                  {user.location && (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span>{user.location}</span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>Membre depuis {memberSince}</span>
                  </div>
                </div>

                {user.isFreelancer && (
                  <div className="mt-2">
                    <span className="bg-workit-purple text-white text-xs px-2 py-1 rounded-full">
                      Freelancer
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-2">À propos</h2>
                <p className="text-gray-400">
                  {user.bio || 'Aucune biographie disponible.'}
                </p>
              </div>

              {user.skills && user.skills.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-white mb-2">Compétences</h2>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.isFreelancer ? (
                  <>
                    <Link
                      to="/dashboard/services/add"
                      className="bg-workit-purple text-white px-4 py-3 rounded-md hover:bg-workit-purple-light transition flex justify-center items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Ajouter un service
                    </Link>
                    <Link
                      to="/dashboard"
                      className="bg-gray-700 text-white px-4 py-3 rounded-md hover:bg-gray-600 transition flex justify-center items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                      </svg>
                      Tableau de bord
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleEditClick}
                      className="bg-workit-purple text-white px-4 py-3 rounded-md hover:bg-workit-purple-light transition flex justify-center items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Devenir Freelancer
                    </button>
                    <Link
                      to="/employment"
                      className="bg-gray-700 text-white px-4 py-3 rounded-md hover:bg-gray-600 transition flex justify-center items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                      </svg>
                      Chercher un emploi
                    </Link>
                  </>
                )}
              </div>

              <div className="border-t border-gray-800 pt-6 mt-8">
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="text-red-500 hover:text-red-400 transition"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
