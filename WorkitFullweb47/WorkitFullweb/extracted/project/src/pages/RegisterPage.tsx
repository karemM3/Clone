import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRole } from '../context/UserContext';

const registerSchema = z.object({
  name: z.string().min(3, { message: 'Le nom doit contenir au moins 3 caractères' }),
  email: z.string().email({ message: 'Adresse email invalide' }),
  password: z.string().min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' }),
  confirmPassword: z.string(),
  role: z.enum(['buyer', 'seller', 'both'] as const, {
    required_error: 'Veuillez sélectionner un type de compte'
  }),
  acceptTerms: z.boolean().refine(val => val === true, { message: 'Vous devez accepter les conditions d\'utilisation' }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const { register: registerUser, isLoading } = useUser();
  const navigate = useNavigate();
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'buyer',
      acceptTerms: false,
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setRegistrationError(null);
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      navigate('/email-verification');
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationError(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'inscription');
    }
  };

  const renderRoleOption = (value: UserRole, label: string, description: string) => (
    <div className="mb-3">
      <div className="flex items-center p-4 border border-gray-700 rounded-lg bg-gray-800 cursor-pointer hover:border-workit-purple transition">
        <input
          type="radio"
          id={`role-${value}`}
          value={value}
          {...register('role')}
          className="h-4 w-4 text-workit-purple border-gray-600 focus:ring-workit-purple"
        />
        <label htmlFor={`role-${value}`} className="ml-3 block text-sm cursor-pointer">
          <span className="text-white font-medium">{label}</span>
          <p className="text-gray-400 text-xs mt-1">{description}</p>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-workit-dark px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex">
              <div className="w-8 h-8 rounded-full bg-workit-purple-light"></div>
              <div className="w-8 h-8 rounded-full bg-workit-purple-light -ml-4"></div>
            </div>
            <span className="text-2xl font-bold text-white">WorkiT</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Créer un compte</h1>
          <p className="text-gray-400">Rejoignez la communauté WorkiT dès aujourd'hui</p>
        </div>

        <div className="bg-workit-dark-card rounded-lg p-8 shadow-xl">
          {registrationError && (
            <div className="mb-6 p-3 bg-red-900 bg-opacity-30 border border-red-800 rounded text-red-400 text-sm">
              {registrationError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-white text-sm font-medium mb-2">
                Nom complet
              </label>
              <input
                type="text"
                id="name"
                {...register('name')}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-workit-purple"
                placeholder="Jean Dupont"
              />
              {errors.name && (
                <p className="mt-1 text-red-500 text-xs">{errors.name.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register('email')}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-workit-purple"
                placeholder="votre@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="password" className="block text-white text-sm font-medium mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  {...register('password')}
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-workit-purple"
                  placeholder="********"
                />
                {errors.password && (
                  <p className="mt-1 text-red-500 text-xs">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-white text-sm font-medium mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-workit-purple"
                  placeholder="********"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-red-500 text-xs">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-3">
                Type de compte
              </label>

              {renderRoleOption(
                'buyer',
                'Acheteur',
                'Je souhaite trouver et acheter des services de freelances'
              )}

              {renderRoleOption(
                'seller',
                'Vendeur / Freelance',
                'Je souhaite proposer mes services et trouver des clients'
              )}

              {renderRoleOption(
                'both',
                'Les deux',
                'Je souhaite à la fois acheter et vendre des services'
              )}

              {errors.role && (
                <p className="mt-1 text-red-500 text-xs">{errors.role.message}</p>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="acceptTerms"
                    type="checkbox"
                    {...register('acceptTerms')}
                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-workit-purple focus:ring-workit-purple"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="acceptTerms" className="text-gray-300">
                    J'accepte les <Link to="/terms" className="text-workit-purple hover:underline">conditions d'utilisation</Link> et la <Link to="/privacy" className="text-workit-purple hover:underline">politique de confidentialité</Link>
                  </label>
                  {errors.acceptTerms && (
                    <p className="mt-1 text-red-500 text-xs">{errors.acceptTerms.message}</p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-workit-purple text-white py-3 px-4 rounded-md font-medium hover:bg-workit-purple-light transition disabled:opacity-70"
            >
              {isLoading ? 'Création en cours...' : 'Créer un compte'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Vous avez déjà un compte? <Link to="/login" className="text-workit-purple hover:underline">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
