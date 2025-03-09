export interface FinancialParameters {
  financingMode: 'cash' | 'subscription';
  prixKwh: number;
  tarifRevente: number;
  autoconsommation: number;
  revalorisationEnergie: number;
  indexationProduction: number;
  degradationPanneau: number;
  dureeAbonnement?: number;
  primeAutoconsommation: number;
  remiseCommerciale: number;
}

export interface YearlyProjection {
  annee: number;
  production: number;
  autoconsommation: number;
  revente: number;
  economiesAutoconsommation: number;
  revenusRevente: number;
  coutAbonnement: number;
  gainTotal: number;
}

export interface FinancialProjection {
  projectionAnnuelle: YearlyProjection[];
  totalAutoconsommation: number;
  totalRevente: number;
  totalAbonnement: number;
  totalGains: number;
  moyenneAnnuelle: {
    autoconsommation: number;
    revente: number;
    abonnement: number;
    total: number;
  };
  anneeRentabilite: number;
  prixInstallation: number;
  primeAutoconsommation: number;
  remiseCommerciale: number;
  prixFinal: number;
}