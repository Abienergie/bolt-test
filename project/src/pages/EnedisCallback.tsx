import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { enedisApi } from '../utils/api/enedisApi';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function EnedisCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connexion à Enedis en cours...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Traitement du callback Enedis...');
        console.log('URL complète:', window.location.href);
        
        // Extraire les paramètres de l'URL
        const params = new URLSearchParams(location.search);
        const hash = location.hash;
        
        // Vérifier si les paramètres sont dans le hash (après #)
        let code = params.get('code');
        let error = params.get('error');
        let state = params.get('state');
        let usagePointId = params.get('usage_point_id');
        
        // Si les paramètres sont dans le hash, les extraire
        if (hash && hash.includes('?')) {
          const hashParams = new URLSearchParams(hash.split('?')[1]);
          code = code || hashParams.get('code');
          error = error || hashParams.get('error');
          state = state || hashParams.get('state');
          usagePointId = usagePointId || hashParams.get('usage_point_id');
        }
        
        console.log('Paramètres extraits:', { 
          code: code ? '***' + (code.length > 6 ? code.slice(-6) : code) : null,
          error,
          state,
          usagePointId
        });

        // Cas d'erreur
        if (error) {
          console.error('Erreur reçue:', error);
          setStatus('error');
          setMessage(error);
          setTimeout(() => {
            navigate('/abie-link', { 
              state: { error },
              replace: true
            });
          }, 3000);
          return;
        }

        // Si nous avons un code, échanger contre un token
        if (code) {
          setMessage('Échange du code contre un token...');
          
          try {
            // Échanger le code contre un token via l'API Enedis
            await enedisApi.handleCallback(code);
            console.log('Échange du code réussi');
            
            // Si nous avons un PDL, le sauvegarder
            if (usagePointId) {
              console.log('Sauvegarde du PDL:', usagePointId);
              localStorage.setItem('enedis_usage_point_id', usagePointId);
            }
            
            setStatus('success');
            setMessage('Connexion réussie, redirection...');
            
            setTimeout(() => {
              navigate('/abie-link', { 
                state: { 
                  success: true,
                  pdl: usagePointId,
                  message: 'Connexion à Enedis réussie'
                },
                replace: true
              });
            }, 2000);
          } catch (error) {
            console.error('Erreur lors de l\'échange du code:', error);
            setStatus('error');
            setMessage(error instanceof Error ? error.message : 'Erreur lors de l\'échange du code');
            
            setTimeout(() => {
              navigate('/abie-link', { 
                state: { 
                  error: error instanceof Error ? error.message : 'Échec de la connexion à Enedis'
                },
                replace: true
              });
            }, 3000);
          }
          return;
        }

        // Aucun paramètre utile
        setStatus('error');
        setMessage('Aucun paramètre d\'authentification reçu');
        setTimeout(() => {
          navigate('/abie-link', { 
            state: { error: 'Aucun paramètre d\'authentification reçu' },
            replace: true
          });
        }, 3000);
      } catch (error) {
        console.error('Erreur détaillée lors de la connexion Enedis:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Erreur inconnue');
        
        setTimeout(() => {
          navigate('/abie-link', { 
            state: { 
              error: error instanceof Error ? error.message : 'Échec de la connexion à Enedis'
            },
            replace: true
          });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 mb-2">{message}</p>
            <p className="text-sm text-gray-500">Veuillez patienter pendant que nous traitons votre demande</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">{message}</p>
            <p className="text-sm text-gray-500">Vous allez être redirigé automatiquement</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Erreur de connexion</p>
            <p className="text-sm text-red-500 mb-4">{message}</p>
            <button
              onClick={() => navigate('/abie-link')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retour à Abie Link
            </button>
          </>
        )}
      </div>
    </div>
  );
}