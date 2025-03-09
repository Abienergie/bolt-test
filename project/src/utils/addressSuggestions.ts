import type { AddressFeature } from '../types/address';

interface AddressResponse {
  type: string;
  version: string;
  features: AddressFeature[];
  attribution: string;
  licence: string;
  query: string;
  limit: number;
}

// Cache for address suggestions to reduce API calls
const suggestionCache = new Map<string, AddressFeature[]>();

// Fallback data for common cities when API fails
const FALLBACK_CITIES: { [key: string]: { lat: number; lon: number } } = {
  'Paris': { lat: 48.8566, lon: 2.3522 },
  'Lyon': { lat: 45.7578, lon: 4.8320 },
  'Marseille': { lat: 43.2965, lon: 5.3698 },
  'Bordeaux': { lat: 44.8378, lon: -0.5792 },
  'Lille': { lat: 50.6292, lon: 3.0573 },
  'Toulouse': { lat: 43.6047, lon: 1.4442 },
  'Nice': { lat: 43.7102, lon: 7.2620 },
  'Nantes': { lat: 47.2184, lon: -1.5536 },
  'Strasbourg': { lat: 48.5734, lon: 7.7521 },
  'Montpellier': { lat: 43.6108, lon: 3.8767 }
};

export async function getSuggestions(query: string): Promise<AddressFeature[]> {
  if (!query || query.length < 3) return [];

  try {
    const cleanQuery = query.trim();
    
    // Check cache first
    const cacheKey = cleanQuery.toLowerCase();
    if (suggestionCache.has(cacheKey)) {
      console.log('Using cached address suggestions for:', cleanQuery);
      return suggestionCache.get(cacheKey) || [];
    }
    
    // Add a timeout and error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log('Aborting address API request due to timeout');
    }, 5000); // Reduced timeout to 5 seconds for better UX

    try {
      console.log('Fetching address suggestions for:', cleanQuery);
      
      // Use a more reliable API endpoint with multiple retries
      const apiUrl = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(cleanQuery)}&limit=5&autocomplete=1`;
      
      const response = await fetchWithRetry(apiUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Simulateur Solaire/1.0'
        }
      }, 3); // Try up to 3 times
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`Erreur API adresse: ${response.status} ${response.statusText}`);
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: AddressResponse = await response.json();
      
      if (!Array.isArray(data.features)) {
        console.error('Format de réponse invalide:', data);
        throw new Error('Format de réponse invalide');
      }

      // Filter for relevant results
      const filteredResults = data.features.filter(feature => 
        feature.properties.type === 'housenumber' || 
        feature.properties.type === 'street'
      );
      
      console.log(`Received ${filteredResults.length} address suggestions`);
      
      // Cache the results
      suggestionCache.set(cacheKey, filteredResults);
      
      return filteredResults;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Handle specific fetch errors
      if (fetchError.name === 'AbortError') {
        console.error('Timeout de la requête API adresse');
        return [];
      }
      
      // For network errors, try to use a fallback approach
      console.error('Erreur réseau API adresse:', fetchError.message);
      
      // Return empty results but don't throw
      return [];
    }
  } catch (error) {
    // Log the error but don't throw it to the UI
    console.error('Erreur lors de la récupération des suggestions d\'adresse:', error);
    
    // Return empty results instead of throwing
    return [];
  }
}

// Utility function to retry fetch requests
async function fetchWithRetry(url: string, options: RequestInit, maxRetries: number): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} for ${url}`);
        // Add exponential backoff
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
      }
      
      return await fetch(url, options);
    } catch (error) {
      console.error(`Fetch attempt ${attempt + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If it's an abort error, don't retry
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
    }
  }
  
  throw lastError || new Error(`Failed to fetch after ${maxRetries} attempts`);
}

// Fallback function for manual address entry
export function validateAddress(address: string, postalCode: string, city: string): boolean {
  // Basic validation
  return (
    address.length > 3 && 
    postalCode.length === 5 && 
    /^\d{5}$/.test(postalCode) && 
    city.length > 1
  );
}

// Get coordinates for a city when API fails
export function getFallbackCoordinates(city: string): { lat: number; lon: number } | null {
  const normalizedCity = city.trim().toLowerCase();
  
  for (const [key, coords] of Object.entries(FALLBACK_CITIES)) {
    if (key.toLowerCase() === normalizedCity) {
      return coords;
    }
  }
  
  // Default to center of France if city not found
  return { lat: 46.603354, lon: 1.888334 };
}