import { useState, useCallback, useEffect } from 'react';
import { enedisApi } from '../utils/api/enedisApi';
import { saveConsumptionData, getConsumptionData } from '../utils/api/consumptionApi';
import type { ConsumptionData } from '../types/consumption';

export function useEnedisData() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[] | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [rawApiResponse, setRawApiResponse] = useState<any>(null);

  // Vérifier la connexion au chargement
  useEffect(() => {
    const checkConnection = async () => {
      const pdl = localStorage.getItem('enedis_usage_point_id');
      const token = localStorage.getItem('enedis_access_token');
      
      console.log('Vérification de la connexion Enedis:', { 
        pdl: pdl ? 'Présent' : 'Absent', 
        token: token ? 'Présent' : 'Absent' 
      });
      
      if (pdl && token) {
        setIsConnected(true);
        
        // Charger les données du localStorage
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
          
        try {
          console.log('Chargement des données depuis le localStorage');
          const data = await getConsumptionData(pdl, startDate, endDate);
          if (data && data.length > 0) {
            console.log(`${data.length} jours de données trouvés dans le localStorage`);
            setConsumptionData(data);
          } else {
            console.log('Pas de données dans le localStorage, tentative de récupération depuis Enedis');
            // Si pas de données dans le localStorage, essayer de les récupérer depuis Enedis
            try {
              await fetchConsumptionData(pdl);
            } catch (fetchError) {
              console.error('Échec de la récupération des données Enedis:', fetchError);
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
          // En cas d'erreur, essayer quand même de récupérer les données d'Enedis
          try {
            await fetchConsumptionData(pdl);
          } catch (fetchError) {
            console.error('Échec de la récupération des données Enedis:', fetchError);
          }
        }
      }
    };
    
    checkConnection();
  }, []);

  const testConnection = useCallback(async (prm: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Test de connexion pour le PDL:', prm);
      // Vérifier si on a un token
      const token = localStorage.getItem('enedis_access_token');
      if (!token) {
        console.log('Pas de token disponible');
        setIsConnected(false);
        return false;
      }
      
      // Tester la connexion avec l'API Enedis
      const isConnected = await enedisApi.testConnection(prm);
      console.log('Résultat du test de connexion:', isConnected);
      setIsConnected(isConnected);
      return isConnected;
    } catch (error) {
      console.error('Erreur lors du test de connexion:', error);
      const message = error instanceof Error ? error.message : 'Erreur lors du test de connexion';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchConsumptionData = useCallback(async (prm: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Récupération des données pour le PDL:', prm);
      
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      
      console.log(`Récupération des données pour le PDL ${prm} du ${startDate} au ${endDate}`);
      
      // Récupérer les données depuis l'API Enedis
      const enedisData = await enedisApi.getConsumptionData(prm, startDate, endDate);
      
      // Stocker la réponse brute pour le débogage
      if (enedisData.rawResponse) {
        setRawApiResponse(enedisData.rawResponse);
        // Sauvegarder dans le localStorage pour référence
        localStorage.setItem('enedis_raw_response', JSON.stringify(enedisData.rawResponse));
      }
      
      if (!enedisData || !enedisData.consumption || enedisData.consumption.length === 0) {
        console.log('Aucune donnée de consommation disponible');
        throw new Error('Aucune donnée de consommation disponible');
      }
      
      console.log(`${enedisData.consumption.length} jours de données reçus`);
      
      // Sauvegarder les données dans le localStorage
      await saveConsumptionData(enedisData.consumption);
      
      // Récupérer les données sauvegardées
      const data = await getConsumptionData(prm, startDate, endDate);
      console.log(`${data.length} jours de données sauvegardés dans le localStorage`);
      setConsumptionData(data);
      
      return {
        consumption: data,
        rawResponse: enedisData.rawResponse
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      const message = error instanceof Error ? error.message : 'Erreur lors de la récupération des données';
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetData = useCallback(() => {
    console.log('Réinitialisation des données Enedis');
    localStorage.removeItem('enedis_consumption_data');
    localStorage.removeItem('enedis_usage_point_id');
    localStorage.removeItem('enedis_access_token');
    localStorage.removeItem('enedis_refresh_token');
    localStorage.removeItem('enedis_token_expires');
    localStorage.removeItem('enedis_raw_response');
    setConsumptionData(null);
    setRawApiResponse(null);
    setIsConnected(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    consumptionData,
    rawApiResponse,
    isConnected,
    testConnection,
    fetchConsumptionData,
    resetData
  };
}

export default useEnedisData;