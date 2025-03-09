import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinancialParameters, FinancialProjection } from '../types/financial';
import { formatCurrency } from './formatters';
import { getOrientationLabel } from './orientationMapping';

export async function generatePDF(
  params: FinancialParameters,
  projection: FinancialProjection,
  productionAnnuelle: number,
  clientInfo: {
    civilite: string;
    nom: string;
    prenom: string;
    adresse: string;
    codePostal: string;
    ville: string;
    telephone: string;
    email: string;
    pdl?: string;
  },
  installationParams: {
    typeCompteur: string;
    pdl?: string;
    consommationAnnuelle: number;
    puissanceCrete: number;
    nombreModules: number;
    inclinaison: number;
    orientation: number;
    pertes: number;
    masqueSolaire: number;
    microOnduleurs: boolean;
    bifacial: boolean;
    surfaceTotale: number;
  }
): Promise<void> {
  try {
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(20);
    doc.text('Rapport Installation Solaire', 105, 20, { align: 'center' });
    
    // Note sur la simulation
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Note : Cette simulation de productible est réalisée avec soin à partir des données disponibles, mais reste indicative et non contractuelle.', 20, 30, { maxWidth: 170 });
    doc.setTextColor(0, 0, 0);
    
    // Informations client
    doc.setFontSize(14);
    doc.text('Informations client', 20, 45);

    const clientData = [
      ['Civilité', clientInfo.civilite],
      ['Nom', clientInfo.nom],
      ['Prénom', clientInfo.prenom],
      ['Adresse', clientInfo.adresse],
      ['Code postal', clientInfo.codePostal],
      ['Ville', clientInfo.ville],
      ['Téléphone', clientInfo.telephone],
      ['Email', clientInfo.email],
      ['Point de livraison (PDL)', clientInfo.pdl || 'Non renseigné']
    ];

    autoTable(doc, {
      startY: 50,
      head: [['Information', 'Valeur']],
      body: clientData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      margin: { top: 50 }
    });

    // Caractéristiques techniques
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Caractéristiques techniques', 20, 20);

    const technicalData = [
      ['Type de compteur', installationParams.typeCompteur === 'monophase' ? 'Monophasé' : 'Triphasé'],
      ['Consommation annuelle', `${installationParams.consommationAnnuelle.toString()} kWh/an`],
      ['Puissance crête', `${installationParams.puissanceCrete.toFixed(1)} kWc`],
      ['Nombre de modules', installationParams.nombreModules.toString()],
      ['Surface totale', `${installationParams.surfaceTotale.toFixed(1)} m²`],
      ['Orientation', getOrientationLabel(installationParams.orientation)],
      ['Inclinaison', `${installationParams.inclinaison}°`],
      ['Pertes système', `${installationParams.pertes}%`],
      ['Masque solaire', `${installationParams.masqueSolaire}%`],
      ['Micro-onduleurs', installationParams.microOnduleurs ? 'Oui' : 'Non'],
      ['Technologie bifaciale', installationParams.bifacial ? 'Oui' : 'Non'],
      ['Production annuelle estimée', `${Math.round(productionAnnuelle).toString()} kWh/an`]
    ];

    autoTable(doc, {
      startY: 25,
      head: [['Caractéristique', 'Valeur']],
      body: technicalData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] }
    });

    // Informations financières
    doc.text('Informations financières', 20, doc.lastAutoTable.finalY + 20);

    const financialData = params.financingMode === 'cash' ? [
      ['Type de financement', 'Paiement comptant'],
      ['Prix de base TTC', formatCurrency(projection.prixInstallation)],
      ['Remise commerciale', `${params.remiseCommerciale}%`],
      ['Prime à l\'autoconsommation', formatCurrency(params.primeAutoconsommation)],
      ['Prix final TTC', formatCurrency(projection.prixFinal)]
    ] : [
      ['Type de financement', 'Abonnement mensuel'],
      ['Durée d\'engagement', `${params.dureeAbonnement} ans`],
      ['Mensualité TTC', formatCurrency(projection.projectionAnnuelle[0].coutAbonnement / 12)],
      ['Services inclus', 'Maintenance, garantie, monitoring et assurance']
    ];

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 25,
      head: [['Information financière', 'Valeur']],
      body: financialData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] }
    });

    // Projection financière
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Projection financière sur 20 ans', 20, 20);

    const projectionData = projection.projectionAnnuelle
      .slice(0, 20)
      .map(year => [
        year.annee.toString(),
        Math.round(year.production).toString(),
        formatCurrency(year.economiesAutoconsommation),
        formatCurrency(year.revenusRevente),
        formatCurrency(year.gainTotal)
      ]);

    autoTable(doc, {
      startY: 25,
      head: [['Année', 'Production (kWh)', 'Économies', 'Revente', 'Gain total']],
      body: projectionData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] }
    });

    // Synthèse financière
    doc.text('Synthèse financière', 20, doc.lastAutoTable.finalY + 20);

    const summaryData = [
      ['Économies moyennes annuelles', formatCurrency(projection.moyenneAnnuelle.autoconsommation)],
      ['Revente moyenne annuelle', formatCurrency(projection.moyenneAnnuelle.revente)],
      ['Gain total sur 20 ans', formatCurrency(projection.totalGains)]
    ];

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 25,
      head: [['Indicateur', 'Montant']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] }
    });

    // Ajout des numéros de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} sur ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
    }

    doc.save('rapport-installation-solaire.pdf');
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
}