import React, { useState } from 'react';
import { Briefcase, Users, TrendingUp, Building2, Lock } from 'lucide-react';

interface Commission {
  power: number;
  commercial: number;
  superAgency: number;
}

const commissions: Commission[] = [
  { power: 2.5, commercial: 300, superAgency: 400 },
  { power: 3.0, commercial: 600, superAgency: 700 },
  { power: 3.5, commercial: 650, superAgency: 750 },
  { power: 4.0, commercial: 700, superAgency: 800 },
  { power: 4.5, commercial: 800, superAgency: 1000 },
  { power: 5.0, commercial: 900, superAgency: 1100 },
  { power: 5.5, commercial: 1000, superAgency: 1200 },
  { power: 6.0, commercial: 1200, superAgency: 1400 },
  { power: 6.5, commercial: 1300, superAgency: 1500 },
  { power: 7.0, commercial: 1400, superAgency: 1600 },
  { power: 7.5, commercial: 1500, superAgency: 1700 },
  { power: 8.0, commercial: 1600, superAgency: 1800 },
  { power: 8.5, commercial: 1700, superAgency: 1900 },
  { power: 9.0, commercial: 1800, superAgency: 2000 }
];

const ACCESS_CODE = '151515';

export default function Agency() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === ACCESS_CODE) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Code d\'accès incorrect');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Accès restreint
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Veuillez saisir le code d'accès pour consulter les informations agence
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="accessCode" className="sr-only">
                Code d'accès
              </label>
              <input
                id="accessCode"
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Code d'accès"
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Accéder
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Informations agence
        </h1>
        <p className="mt-2 text-gray-600">
          Barème applicable aux commerciaux et super régies
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-medium text-gray-900">Rémunération maximale</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">2 000 €</p>
          <p className="mt-1 text-sm text-gray-500">Pour les super régies</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="font-medium text-gray-900">Progression moyenne</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">+100 €</p>
          <p className="mt-1 text-sm text-gray-500">Par palier de puissance</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Building2 className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="font-medium text-gray-900">Bonus super régie</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600">+200 €</p>
          <p className="mt-1 text-sm text-gray-500">En moyenne par installation</p>
        </div>
      </div>

      {/* Commission Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900">
              Barème détaillé
            </h2>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puissance crête
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commercial
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Super régie (≥10/mois)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commissions.map((commission, index) => (
                <tr key={commission.power} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {commission.power.toFixed(1)} kWc
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {commission.commercial.toLocaleString('fr-FR')} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {commission.superAgency.toLocaleString('fr-FR')} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note :</strong> Les super régies doivent réaliser un minimum de 10 installations par mois pour bénéficier du barème majoré.
          Les rémunérations sont versées à la mise en service de l'installation.
        </p>
      </div>
    </div>
  );
}