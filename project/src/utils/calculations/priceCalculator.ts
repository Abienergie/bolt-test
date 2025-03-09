import { useFinancialSettings } from '../../contexts/FinancialSettingsContext';

// Prix des abonnements mensuels en fonction de la puissance et de la durée
const SUBSCRIPTION_TABLE: {
  [key: string]: { [key: number]: number };
} = {
  '25': {
    2.5: 49.00,
    3.0: 59.00, 3.5: 68.50, 4.0: 78.00, 4.5: 87.00,
    5.0: 96.00, 5.5: 105.50, 6.0: 115.00, 6.5: 124.00,
    7.0: 132.00, 7.5: 140.00, 8.0: 149.00, 8.5: 158.00, 9.0: 167.00
  },
  '20': {
    2.5: 51.60,
    3.0: 63.60, 3.5: 72.00, 4.0: 82.80, 4.5: 92.00,
    5.0: 100.80, 5.5: 111.60, 6.0: 120.00, 6.5: 129.60,
    7.0: 138.00, 7.5: 146.40, 8.0: 156.00, 8.5: 164.40, 9.0: 174.00
  },
  '15': {
    2.5: 56.40,
    3.0: 73.20, 3.5: 80.40, 4.0: 91.20, 4.5: 102.00,
    5.0: 111.60, 5.5: 122.40, 6.0: 130.80, 6.5: 142.80,
    7.0: 150.00, 7.5: 159.60, 8.0: 169.20, 8.5: 177.60, 9.0: 189.60
  },
  '10': {
    2.5: 67.20,
    3.0: 86.40, 3.5: 97.20, 4.0: 106.80, 4.5: 120.00,
    5.0: 134.40, 5.5: 144.00, 6.0: 153.60, 6.5: 165.60,
    7.0: 174.00, 7.5: 178.80, 8.0: 192.00, 8.5: 200.40, 9.0: 206.40
  }
};

// Prix de base des installations jusqu'à 9 kWc
const DEFAULT_PRICES: { [key: number]: number } = {
  2.5: 6890,
  3.0: 7890,
  3.5: 8890,
  4.0: 9890,
  4.5: 10890,
  5.0: 11890,
  5.5: 12890,
  6.0: 14890,
  6.5: 15890,
  7.0: 16890,
  7.5: 17890,
  8.0: 18890,
  8.5: 19890,
  9.0: 19890
};

export function getPriceFromPower(power: number): number {
  // Arrondir la puissance au 0.5 le plus proche
  const roundedPower = Math.round(power * 2) / 2;

  // Pour les puissances jusqu'à 9 kWc, utiliser les prix par défaut
  if (roundedPower <= 9) {
    return DEFAULT_PRICES[roundedPower] || 0;
  }

  // Pour les puissances > 9 kWc, chercher dans le localStorage
  try {
    const savedPrices = localStorage.getItem('installation_prices');
    if (!savedPrices) {
      return 0;
    }

    const prices = JSON.parse(savedPrices);
    if (!Array.isArray(prices)) {
      console.error('Format de prix invalide dans le localStorage');
      return 0;
    }

    // Chercher le prix exact ou le plus proche
    const exactMatch = prices.find(p => Math.abs(p.power - roundedPower) < 0.01);
    if (exactMatch?.price) {
      return exactMatch.price;
    }

    // Si pas de correspondance exacte, trouver le prix le plus proche
    const sortedPrices = prices.sort((a, b) => Math.abs(a.power - roundedPower) - Math.abs(b.power - roundedPower));
    if (sortedPrices[0]?.price) {
      console.log(`Utilisation du prix le plus proche : ${sortedPrices[0].power} kWc pour ${roundedPower} kWc`);
      return sortedPrices[0].price;
    }

    return 0;
  } catch (error) {
    console.error('Erreur lors de la lecture des prix:', error);
    return 0;
  }
}

export function getSubscriptionPrice(power: number, duration: number): number {
  const roundedPower = Math.round(power * 2) / 2;
  return SUBSCRIPTION_TABLE[duration.toString()]?.[roundedPower] || 0;
}

// Calcul de la prime à l'autoconsommation selon la puissance
export function calculateSubsidy(power: number): number {
  if (power <= 3) {
    return Math.round(power * 1000 * 0.22); // 220€/kWc jusqu'à 3kWc
  } else if (power <= 9) {
    return Math.round(power * 1000 * 0.16); // 160€/kWc de 3 à 9kWc
  } else if (power <= 36) {
    return Math.round(power * 1000 * 0.11); // 110€/kWc de 9 à 36kWc
  } else if (power <= 100) {
    return Math.round(power * 1000 * 0.08); // 80€/kWc de 36 à 100kWc
  }
  return 0; // Pas de prime au-delà de 100kWc
}

export function calculateFinalPrice(
  power: number,
  primeAutoconsommation: number,
  remiseCommerciale: number
): number {
  const basePrice = getPriceFromPower(power);
  if (basePrice === 0) {
    console.error(`Impossible de trouver un prix pour la puissance ${power} kWc`);
    return 0;
  }
  
  const primeAmount = calculateSubsidy(power); // Utiliser le nouveau calcul de prime
  const remiseAmount = Math.round((basePrice * remiseCommerciale) / 100);
  return basePrice - primeAmount - remiseAmount;
}