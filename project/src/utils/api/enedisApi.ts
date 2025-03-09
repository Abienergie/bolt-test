import { ConsumptionData } from '../../types/consumption';

class EnedisAPI {
  private static instance: EnedisAPI;
  private accessToken: string | null = null;
  
  private readonly config = {
    clientId: 'Y_LuB7HsQW3JWYudw7HRmN28FN8a',
    clientSecret: 'Pb9H1p8zJ4IfX0xca5c7lficGo4a',
    // URL de redirection modifiée pour pointer vers l'environnement de production
    redirectUri: 'https://abienergie.github.io/Simulator/#/oauth/callback',
    authUrl: 'https://mon-compte-particulier.enedis.fr/dataconnect/v1/oauth2/authorize',
    tokenUrl: 'https://gw.hml.api.enedis.fr/oauth2/v3/token',
    apiUrl: 'https://gw.hml.api.enedis.fr/v5/metering_data',
    scope: 'fr_be_cons_detail_load_curve'
  };

  private constructor() {
    // Récupérer le token du localStorage s'il existe
    this.accessToken = localStorage.getItem('enedis_access_token');
    console.log('Token récupéré du localStorage:', this.accessToken ? 'Présent' : 'Absent');
    console.log('URL de redirection configurée:', this.config.redirectUri);
  }

  public static getInstance(): EnedisAPI {
    if (!EnedisAPI.instance) {
      EnedisAPI.instance = new EnedisAPI();
    }
    return EnedisAPI.instance;
  }

  public async initiateAuth(): Promise<string> {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      duration: 'P1Y',
      state: 'AbieLink1'
    });

    return `${this.config.authUrl}?${params.toString()}`;
  }

  public async handleCallback(code: string): Promise<void> {
    try {
      console.log('Échange du code contre un token...');
      
      // Créer un FormData pour l'échange du code
      const formData = new URLSearchParams();
      formData.append('grant_type', 'authorization_code');
      formData.append('client_id', this.config.clientId);
      formData.append('client_secret', this.config.clientSecret);
      formData.append('code', code);
      formData.append('redirect_uri', this.config.redirectUri);
      
      console.log('Envoi de la requête au endpoint token:', this.config.tokenUrl);
      console.log('Paramètres:', {
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: '***', // Masqué pour la sécurité
        redirect_uri: this.config.redirectUri
      });

      // Appel à l'API Enedis pour échanger le code contre un token
      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: formData.toString()
      });

      console.log('Réponse reçue, status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur réponse token:', errorText);
        try {
          const error = JSON.parse(errorText);
          throw new Error(error.error_description || 'Échec de l\'échange du token');
        } catch (e) {
          throw new Error(`Échec de l'échange du token: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('Token reçu avec succès, expires_in:', data.expires_in);
      
      // Stocker le token dans le localStorage
      localStorage.setItem('enedis_access_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('enedis_refresh_token', data.refresh_token);
      }
      
      // Stocker la date d'expiration
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);
      localStorage.setItem('enedis_token_expires', expiresAt.toISOString());
      
      this.accessToken = data.access_token;
      console.log('Token Enedis stocké avec succès');
      
    } catch (error) {
      console.error('Erreur détaillée dans handleCallback:', error);
      throw error;
    }
  }

  public async testConnection(prm: string): Promise<boolean> {
    try {
      console.log('Test de connexion pour le PDL:', prm);
      const token = await this.getValidToken();
      if (!token) {
        console.log('Pas de token valide disponible');
        return false;
      }

      // Vérifier si le token est valide en faisant une requête simple
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Juste une semaine pour tester
      
      const url = `${this.config.apiUrl}/daily_consumption?usage_point_id=${prm}&start=${startDate.toISOString().split('T')[0]}&end=${endDate}`;
      console.log('URL de test:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      console.log('Réponse du test de connexion:', response.status);
      return response.ok;
    } catch (error) {
      console.error('Erreur lors du test de connexion:', error);
      return false;
    }
  }

  public async getConsumptionData(prm: string, startDate: string, endDate: string) {
    try {
      console.log('Récupération des données de consommation pour le PDL:', prm);
      const token = await this.getValidToken();
      if (!token) {
        console.error('Pas de token valide disponible');
        throw new Error('Non authentifié');
      }

      console.log('Récupération des données de consommation réelles...');
      
      // Créer une date de début et de fin si non fournies
      if (!startDate) {
        // Selon la doc, on peut remonter jusqu'à 36 mois et 15 jours
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        startDate = oneYearAgo.toISOString().split('T')[0];
      }
      
      if (!endDate) {
        // La date de fin doit être le lendemain de la dernière date souhaitée
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        endDate = tomorrow.toISOString().split('T')[0];
      }

      console.log(`PDL: ${prm}, Période: ${startDate} à ${endDate}`);

      // Appel à l'API Enedis pour récupérer les données de consommation
      // Utilisation de daily_consumption au lieu de consumption_load_curve
      const url = `${this.config.apiUrl}/daily_consumption?usage_point_id=${prm}&start=${startDate}&end=${endDate}`;
      console.log('URL de récupération des données:', url);
      
      console.log('Envoi de la requête avec token:', token.substring(0, 10) + '...');
      
      // Utilisation d'un proxy CORS si nécessaire
      const corsProxy = '';
      const finalUrl = corsProxy ? `${corsProxy}${encodeURIComponent(url)}` : url;
      
      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      console.log('Réponse reçue, status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur API:', response.status, errorText);
        
        // Si le token est expiré, essayer de le rafraîchir et réessayer
        if (response.status === 401) {
          console.log('Token expiré, tentative de rafraîchissement');
          const refreshToken = localStorage.getItem('enedis_refresh_token');
          if (refreshToken) {
            await this.refreshToken(refreshToken);
            return this.getConsumptionData(prm, startDate, endDate);
          }
        }
        
        throw new Error(`Erreur API Enedis: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Données reçues:', responseData);
      
      // Sauvegarder la réponse brute dans le localStorage pour le débogage
      localStorage.setItem('enedis_raw_response', JSON.stringify(responseData));
      
      if (!responseData?.meter_reading?.interval_reading) {
        console.error('Format de données invalide:', responseData);
        throw new Error('Format de données invalide');
      }
      
      const formattedData = this.formatConsumptionData(responseData, prm);
      return {
        rawResponse: responseData,
        ...formattedData
      };
      
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      throw error;
    }
  }

  private async getValidToken(): Promise<string | null> {
    // Si on a déjà un token en mémoire, on l'utilise
    if (this.accessToken) {
      console.log('Utilisation du token en mémoire');
      return this.accessToken;
    }
    
    // Sinon on vérifie dans le localStorage
    const token = localStorage.getItem('enedis_access_token');
    const expiresAt = localStorage.getItem('enedis_token_expires');
    
    if (!token || !expiresAt) {
      console.log('Pas de token dans le localStorage');
      return null;
    }

    console.log('Token trouvé dans le localStorage, expiration:', expiresAt);

    // Vérifier si le token est expiré
    if (new Date(expiresAt) <= new Date()) {
      console.log('Token expiré, tentative de rafraîchissement');
      // Token expiré, essayer de le rafraîchir
      const refreshToken = localStorage.getItem('enedis_refresh_token');
      if (refreshToken) {
        try {
          await this.refreshToken(refreshToken);
          return localStorage.getItem('enedis_access_token');
        } catch (error) {
          console.error('Erreur refresh token:', error);
          return null;
        }
      }
      return null;
    }

    this.accessToken = token;
    return token;
  }

  private async refreshToken(refreshToken: string): Promise<void> {
    console.log('Rafraîchissement du token...');
    // Appel à l'API Enedis pour rafraîchir le token
    const formData = new URLSearchParams();
    formData.append('grant_type', 'refresh_token');
    formData.append('client_id', this.config.clientId);
    formData.append('client_secret', this.config.clientSecret);
    formData.append('refresh_token', refreshToken);

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    if (!response.ok) {
      throw new Error('Échec du rafraîchissement du token');
    }

    const data = await response.json();
    localStorage.setItem('enedis_access_token', data.access_token);
    this.accessToken = data.access_token;
    
    if (data.refresh_token) {
      localStorage.setItem('enedis_refresh_token', data.refresh_token);
    }
    
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);
    localStorage.setItem('enedis_token_expires', expiresAt.toISOString());
    
    console.log('Token rafraîchi avec succès');
  }

  private formatConsumptionData(data: any, prm: string) {
    console.log('Formatage des données de consommation');
    try {
      if (!data?.meter_reading?.interval_reading) {
        console.error('Format de données invalide:', data);
        throw new Error('Format de données invalide');
      }

      // Traiter les données pour les adapter au format attendu
      const readings = data.meter_reading.interval_reading;
      console.log(`Nombre de relevés: ${readings.length}`);
      
      // D'après la documentation, les données de consommation quotidienne
      // sont fournies avec une valeur par jour, et peuvent inclure un champ measure_type
      // pour distinguer les heures pleines (HP) et heures creuses (HC)
      const readingsByDate: Record<string, { peakHours: number, offPeakHours: number }> = {};
      
      readings.forEach((reading: any) => {
        const date = reading.date;
        const value = parseFloat(reading.value);
        const measureType = reading.measure_type;
        
        if (!readingsByDate[date]) {
          readingsByDate[date] = { peakHours: 0, offPeakHours: 0 };
        }
        
        if (measureType === 'HP') {
          readingsByDate[date].peakHours += value;
        } else if (measureType === 'HC') {
          readingsByDate[date].offPeakHours += value;
        } else {
          // Si pas de distinction HP/HC, on considère que c'est en heures pleines
          readingsByDate[date].peakHours += value;
        }
      });
      
      // Convertir le dictionnaire en tableau
      const consumption = Object.entries(readingsByDate).map(([date, values]) => ({
        date,
        peakHours: values.peakHours,
        offPeakHours: values.offPeakHours,
        prm: data.meter_reading.usage_point_id || prm
      }));

      console.log(`Données formatées: ${consumption.length} jours`);
      return { consumption };
    } catch (error) {
      console.error('Erreur lors du formatage des données:', error);
      throw error;
    }
  }
}

export const enedisApi = EnedisAPI.getInstance();