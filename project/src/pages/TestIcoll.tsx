import React, { useState } from 'react';
import { icollApi } from '../utils/api/icollApi';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Lock } from 'lucide-react';

export default function TestIcoll() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleTestToken = async () => {
    setLoading(true);
    setError(null);
    setToken(null);
    setSuccess(false);

    try {
      console.log('Test de connexion iColl...');
      const newToken = await icollApi.getToken();
      console.log('Token reçu avec succès');
      
      setToken(newToken);
      setSuccess(true);
    } catch (err) {
      console.error('Erreur lors du test:', err);
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem('icoll_token');
    localStorage.removeItem('icoll_token_expires');
    setToken(null);
    setSuccess(false);
    setError(null);
  };

  // Formater la date d'expiration pour l'affichage
  const formatExpirationDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Date invalide';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">
            Test de connexion iColl
          </h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Cette page permet de tester la connexion à l'API iColl avec les identifiants configurés.
            Les informations de connexion sont affichées ci-dessous pour faciliter le débogage.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex gap-4">
            <button
              onClick={handleTestToken}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Test en cours...
                </>
              ) : (
                'Tester la connexion'
              )}
            </button>

            <button
              onClick={handleClearCache}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Vider le cache
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Erreur de connexion</p>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && token && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Connexion réussie
                  </p>
                  <p className="mt-1 text-xs text-green-700 font-mono break-all">
                    Token: {token.substring(0, 20)}...{token.substring(token.length - 20)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Informations de débogage :</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">URL de base :</span>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{icollApi['baseUrl']}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">URL d'authentification :</span>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{icollApi.authUrl}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ID Société :</span>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{icollApi['societeId']}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Token en cache :</span>
                <span className="text-sm font-medium">
                  {localStorage.getItem('icoll_token') ? 'Oui' : 'Non'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Expiration :</span>
                <span className="text-sm">
                  {formatExpirationDate(localStorage.getItem('icoll_token_expires'))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}