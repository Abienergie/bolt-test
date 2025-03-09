import React from 'react';
import { FinancialProjection } from '../../types/financial';
import { formatCurrency } from '../../utils/formatters';

interface ProjectionTableProps {
  projection: FinancialProjection;
}

export default function ProjectionTable({ projection }: ProjectionTableProps) {
  const hasSubscription = projection.projectionAnnuelle[0].coutAbonnement > 0;
  const prixFinal = projection.prixFinal;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Projection financière sur 30 ans
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Année
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Production (kWh)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Autoconsommation
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revente
              </th>
              {hasSubscription && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Abonnement
                </th>
              )}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gain total
              </th>
              {!hasSubscription && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rendement
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projection.projectionAnnuelle.map((annee) => {
              const rendement = !hasSubscription ? 
                ((annee.economiesAutoconsommation + annee.revenusRevente) / prixFinal * 100) : 0;

              return (
                <tr key={annee.annee} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {annee.annee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {Math.round(annee.production).toString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                    {formatCurrency(annee.economiesAutoconsommation)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600">
                    {formatCurrency(annee.revenusRevente)}
                  </td>
                  {hasSubscription && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                      {annee.coutAbonnement > 0 ? formatCurrency(-annee.coutAbonnement) : '-'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                    {formatCurrency(annee.gainTotal)}
                  </td>
                  {!hasSubscription && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-emerald-600">
                      {rendement.toFixed(1)}%
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                -
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                {formatCurrency(projection.totalAutoconsommation)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-blue-600">
                {formatCurrency(projection.totalRevente)}
              </td>
              {hasSubscription && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                  {formatCurrency(-projection.totalAbonnement)}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                {formatCurrency(projection.totalGains)}
              </td>
              {!hasSubscription && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-emerald-600">
                  -
                </td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}