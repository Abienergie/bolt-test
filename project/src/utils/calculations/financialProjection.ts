import { FinancialParameters, FinancialProjection, YearlyProjection } from '../../types/financial';
import { getSubscriptionPrice, getPriceFromPower, calculateFinalPrice } from './priceCalculator';

function calculateYearlyValues(
  params: FinancialParameters,
  year: number,
  baseProduction: number,
  puissanceCrete: number
): YearlyProjection {
  // Calcul de la dégradation des panneaux
  const coefficientDegradation = Math.pow(1 + params.degradationPanneau / 100, year - 1);
  // Calcul de l'indexation de la revente
  const coefficientIndexation = Math.pow(1 + params.indexationProduction / 100, year - 1);
  // Revalorisation du prix de l'énergie
  const coefficientPrix = Math.pow(1 + params.revalorisationEnergie / 100, year - 1);
  
  // Production tenant compte de la dégradation
  const production = baseProduction * coefficientDegradation;
  const autoconsommation = production * (params.autoconsommation / 100);
  const revente = production - autoconsommation;
  
  const prixKwhActualise = params.prixKwh * coefficientPrix;
  const tarifReventeActualise = year <= 20 ? params.tarifRevente * coefficientIndexation : 0;
  
  const economiesAutoconsommation = autoconsommation * prixKwhActualise;
  const revenusRevente = revente * tarifReventeActualise;
  
  // L'abonnement s'arrête après la durée d'engagement
  const dureeAbonnement = params.dureeAbonnement || 20;
  const coutAbonnement = params.financingMode === 'subscription' && year <= dureeAbonnement
    ? getSubscriptionPrice(puissanceCrete, dureeAbonnement) * 12
    : 0;

  return {
    annee: year,
    production,
    autoconsommation,
    revente,
    economiesAutoconsommation,
    revenusRevente,
    coutAbonnement,
    gainTotal: economiesAutoconsommation + revenusRevente - coutAbonnement
  };
}

export function generateFinancialProjection(
  params: FinancialParameters,
  productionAnnuelle: number,
  puissanceCrete: number
): FinancialProjection {
  const projectionAnnuelle: YearlyProjection[] = [];
  let totalAutoconsommation = 0;
  let totalRevente = 0;
  let totalAbonnement = 0;
  let totalGains = 0;

  // Calcul sur 30 ans
  for (let year = 1; year <= 30; year++) {
    const yearlyValues = calculateYearlyValues(params, year, productionAnnuelle, puissanceCrete);
    projectionAnnuelle.push(yearlyValues);

    totalAutoconsommation += yearlyValues.economiesAutoconsommation;
    totalRevente += yearlyValues.revenusRevente;
    totalAbonnement += yearlyValues.coutAbonnement;
    totalGains += yearlyValues.gainTotal;
  }

  // Calcul des moyennes annuelles sur 20 ans
  const moyenneAnnuelle = {
    autoconsommation: totalAutoconsommation / 30,
    revente: totalRevente / 30,
    abonnement: totalAbonnement / 30,
    total: totalGains / 30
  };

  // Calcul du prix final
  const prixInstallation = getPriceFromPower(puissanceCrete);
  const prixFinal = calculateFinalPrice(
    puissanceCrete,
    params.primeAutoconsommation,
    params.remiseCommerciale
  );

  // Calcul de l'année de rentabilité
  let cumulGains = 0;
  let anneeRentabilite = 0;
  for (let i = 0; i < projectionAnnuelle.length; i++) {
    cumulGains += projectionAnnuelle[i].gainTotal;
    if (cumulGains >= prixFinal && anneeRentabilite === 0) {
      anneeRentabilite = i + 1;
    }
  }

  return {
    projectionAnnuelle,
    totalAutoconsommation,
    totalRevente,
    totalAbonnement,
    totalGains,
    moyenneAnnuelle,
    anneeRentabilite,
    prixInstallation,
    primeAutoconsommation: params.primeAutoconsommation,
    remiseCommerciale: params.remiseCommerciale,
    prixFinal
  };
}