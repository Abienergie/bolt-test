import axios from 'axios';
import type { IcollClientData } from '../../types/icoll';

class IcollAPI {
  private static instance: IcollAPI;
  private baseUrl = 'http://localhost:3001/api';
  private username = 'ilanl60';
  private password = 'rv5Z77*N$';
  
  private constructor() {
    console.log('Initialisation de l\'API iColl');
  }

  public static getInstance(): IcollAPI {
    if (!IcollAPI.instance) {
      IcollAPI.instance = new IcollAPI();
    }
    return IcollAPI.instance;
  }

  public async getToken(): Promise<string> {
    try {
      console.log('Tentative de récupération du token iColl');

      // Check cached token
      const cachedToken = localStorage.getItem('icoll_token');
      const tokenExpires = localStorage.getItem('icoll_token_expires');
      
      if (cachedToken && tokenExpires && new Date(tokenExpires) > new Date()) {
        console.log('Token en cache valide trouvé');
        return cachedToken;
      }

      console.log('Envoi de la requête d\'authentification');

      const response = await axios.post(`${this.baseUrl}/auth`, {
        username: this.username,
        password: this.password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.data?.response?.data?.token) {
        throw new Error('Token non reçu dans la réponse');
      }

      const token = response.data.response.data.token;
      console.log('Token reçu avec succès');
      
      // Store token with 4 hour expiration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 4);
      
      localStorage.setItem('icoll_token', token);
      localStorage.setItem('icoll_token_expires', expiresAt.toISOString());
      
      return token;
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error);
      
      // Clear cache on error
      localStorage.removeItem('icoll_token');
      localStorage.removeItem('icoll_token_expires');
      
      throw error;
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      console.error('Erreur lors du test de connexion:', error);
      return false;
    }
  }

  public async registerClientAndCreateQuote(clientData: IcollClientData): Promise<{
    clientId: number;
    quoteId?: number;
    quoteUrl?: string;
    pdfUrl?: string;
  }> {
    try {
      const token = await this.getToken();
      
      // Create client
      const clientResponse = await axios.post(`${this.baseUrl}/clients`, {
        clients: [{
          id_type_client: "PARTICULIER",
          sexe: clientData.civilite === 'M' ? 'M' : 'F',
          nom: clientData.nom,
          prenom: clientData.prenom,
          adresse: clientData.adresse,
          cp: clientData.codePostal,
          ville: clientData.ville,
          tel_1: clientData.telephone,
          email: clientData.email,
          origine_client: "Simulateur",
          package: clientData.package,
          id_commercial: clientData.commercialId
        }]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!clientResponse.data?.response?.data?.[0]?.id) {
        throw new Error('ID client non reçu');
      }

      const clientId = clientResponse.data.response.data[0].id;

      // Create quote
      const quoteResponse = await axios.post(`${this.baseUrl}/devis`, {
        id_client: clientId,
        id_commercial: clientData.commercialId,
        id_package: clientData.package,
        id_orientation_toit: clientData.orientation || 1,
        id_inclinaison: clientData.inclinaison || 1,
        masque_solaire: clientData.masqueSolaire ? '1' : '2',
        revenu_fiscal: clientData.revenuFiscal
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const quoteData = quoteResponse.data?.response?.data;
      
      return {
        clientId,
        quoteId: quoteData?.devisId,
        quoteUrl: quoteData?.quoteUrl,
        pdfUrl: quoteData?.filePath
      };
    } catch (error) {
      console.error('Erreur lors de la création du client/devis:', error);
      throw error;
    }
  }

  public getIcollLoginUrl(clientId: number, commercialId: string, quoteId?: number): string {
    const params = new URLSearchParams({
      redirect: 'import',
      clientId: clientId.toString(),
      commercialId
    });

    if (quoteId) {
      params.append('quoteId', quoteId.toString());
    }

    return `https://abienergie.icoll.fr/login?${params.toString()}`;
  }

  // Getter for complete auth URL
  public get authUrl(): string {
    return `${this.baseUrl}/auth`;
  }
}

export const icollApi = IcollAPI.getInstance();