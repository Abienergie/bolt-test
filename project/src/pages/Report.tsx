import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { useClient } from '../contexts/client';
import { useSolarData } from '../hooks/useSolarData';
import { useFinancialProjection } from '../hooks/useFinancialProjection';
import DownloadReportButton from '../components/DownloadReportButton';

export default function Report() {
  const { clientInfo, address } = useClient();
  const { params } = useSolarData();
  const [pdl, setPdl] = useState('');
  const { parameters, projection, calculateProjection } = useFinancialProjection();

  useEffect(() => {
    const savedResults = localStorage.getItem('solarResults');
    if (savedResults) {
      const { productionAnnuelle, puissanceCrete } = JSON.parse(savedResults);
      
      // Récupérer le mode de financement et les paramètres financiers du localStorage
      const savedFinancialMode = localStorage.getItem('financialMode');
      const savedDuration = localStorage.getItem('subscriptionDuration');
      const savedPrime = localStorage.getItem('primeAutoconsommation');
      const savedRemise = localStorage.getItem('remiseCommerciale');
      
      // Mettre à jour les paramètres financiers
      if (savedFinancialMode) {
        parameters.financingMode = savedFinancialMode as 'cash' | 'subscription';
      }
      if (savedDuration) {
        parameters.dureeAbonnement = parseInt(savedDuration, 10);
      }
      if (savedPrime) {
        parameters.primeAutoconsommation = parseFloat(savedPrime);
      }
      if (savedRemise) {
        parameters.remiseCommerciale = parseFloat(savedRemise);
      }

      calculateProjection(productionAnnuelle, puissanceCrete);
    }
  }, [calculateProjection, parameters]);

  const handlePDLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 14);
    setPdl(value);
  };

  // Get production data from localStorage
  const productionData = localStorage.getItem('solarResults') 
    ? JSON.parse(localStorage.getItem('solarResults')!)
    : null;

  // Prepare complete client info including address
  const completeClientInfo = {
    civilite: clientInfo.civilite,
    nom: clientInfo.nom,
    prenom: clientInfo.prenom,
    adresse: address.rue || '',
    codePostal: address.codePostal || '',
    ville: address.ville || '',
    telephone: clientInfo.telephone,
    email: clientInfo.email,
    pdl: pdl
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          to="/projection"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour à la projection financière
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Rapport détaillé
        </h2>

        <div className="space-y-6">
          {/* Affichage des informations client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations client</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nom complet</dt>
                  <dd className="text-sm text-gray-900">{`${clientInfo.civilite} ${clientInfo.prenom} ${clientInfo.nom}`}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                  <dd className="text-sm text-gray-900">{clientInfo.telephone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{clientInfo.email}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Adresse</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Rue</dt>
                  <dd className="text-sm text-gray-900">{address.rue || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Code postal</dt>
                  <dd className="text-sm text-gray-900">{address.codePostal || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ville</dt>
                  <dd className="text-sm text-gray-900">{address.ville || '-'}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Numéro PDL (Point De Livraison)
              </label>
              <div className="relative group">
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                <div className="absolute z-10 invisible group-hover:visible bg-gray-900 text-white text-sm rounded-lg py-2 px-3 w-72 bottom-full left-1/2 -translate-x-1/2 mb-2">
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  Le numéro PDL (Point De Livraison) est un identifiant unique de 14 chiffres qui se trouve sur votre facture d'électricité et sur votre compteur Linky.
                </div>
              </div>
            </div>
            <input
              type="text"
              value={pdl}
              onChange={handlePDLChange}
              placeholder="14 chiffres"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              maxLength={14}
            />
            <p className="mt-1 text-sm text-gray-500">
              Facultatif - Vous trouverez ce numéro sur votre facture d'électricité ou sur votre compteur Linky
            </p>
          </div>

          <div className="flex justify-end">
            {productionData && projection && (
              <DownloadReportButton
                params={parameters}
                projection={projection}
                productionAnnuelle={productionData.productionAnnuelle}
                clientInfo={completeClientInfo}
                installationParams={{
                  typeCompteur: params.typeCompteur,
                  pdl: pdl,
                  consommationAnnuelle: params.consommationAnnuelle,
                  puissanceCrete: productionData.puissanceCrete,
                  nombreModules: params.nombreModules,
                  inclinaison: params.inclinaison,
                  orientation: params.orientation,
                  pertes: params.pertes,
                  masqueSolaire: params.masqueSolaire || 0,
                  microOnduleurs: params.microOnduleurs || false,
                  bifacial: params.bifacial || false,
                  surfaceTotale: productionData.surfaceTotale
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}