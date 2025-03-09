import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useClient } from '../contexts/client';
import { 
  ClipboardList, Calculator, FileText, 
  DoorOpen, FileSpreadsheet, CheckSquare,
  Settings, Link, Briefcase, Beaker
} from 'lucide-react';
import { scrollToTop } from '../utils/scroll';

export default function StepNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clientInfo } = useClient();
  
  const hasRequiredInfo = Boolean(
    clientInfo.civilite &&
    clientInfo.nom &&
    clientInfo.prenom &&
    clientInfo.telephone &&
    clientInfo.email
  );

  const steps = [
    {
      path: '/',
      label: 'Dimensionnement',
      icon: ClipboardList,
      description: 'Caractéristiques de votre installation'
    },
    {
      path: '/projection',
      label: 'Projection financière',
      icon: Calculator,
      description: 'Simulation de rentabilité'
    },
    {
      path: '/eligibilite',
      label: 'Tester mon éligibilité',
      icon: CheckSquare,
      description: 'Vérification des conditions'
    },
    {
      path: '/rapport',
      label: 'Rapport',
      icon: FileSpreadsheet,
      description: 'Rapport détaillé'
    },
    {
      path: '/modalites-abonnement',
      label: "Modalités d'abonnement",
      icon: FileText,
      description: 'Conditions et engagements',
      isStatic: true
    },
    {
      path: '/modalites-sortie',
      label: 'Modalités de sortie',
      icon: DoorOpen,
      description: 'Conditions de résiliation',
      isStatic: true
    }
  ];

  const handleStepClick = (path: string, isStatic?: boolean) => {
    if (isStatic || path === '/abie-link' || path === '/settings' || path === '/test-icoll' || path === '/agence') {
      navigate(path);
      scrollToTop();
      return;
    }

    if (!hasRequiredInfo && path !== '/') {
      alert('Veuillez remplir tous les champs obligatoires avant de continuer.');
      return;
    }

    navigate(path);
    scrollToTop();
  };

  return (
    <nav className="w-64 bg-white border-r border-gray-200 h-full py-6">
      <div className="px-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Menu
        </h2>
        <div className="space-y-1">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = location.pathname === step.path;
            const isDisabled = !step.isStatic && !hasRequiredInfo && step.path !== '/';

            return (
              <button
                key={step.path}
                onClick={() => handleStepClick(step.path, step.isStatic)}
                disabled={isDisabled}
                className={`w-full group flex items-start gap-4 p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : isDisabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white border text-sm font-medium ${
                  isActive ? 'border-blue-200' : 'border-gray-200'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${
                      isActive ? 'text-blue-500' : isDisabled ? 'text-gray-300' : 'text-gray-400'
                    }`} />
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  <p className={`mt-1 text-xs ${
                    isDisabled ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Liens utilitaires */}
        <div className="mt-8 pt-6 border-t border-gray-200 space-y-2">
          <button
            onClick={() => handleStepClick('/abie-link')}
            className={`w-full group flex items-center gap-3 p-3 rounded-lg transition-colors ${
              location.pathname === '/abie-link'
                ? 'bg-green-50 text-green-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Link className={`h-5 w-5 ${
              location.pathname === '/abie-link' ? 'text-green-500' : 'text-gray-400'
            }`} />
            <span className="text-sm font-medium">Abie Link</span>
          </button>

          <button
            onClick={() => handleStepClick('/agence')}
            className={`w-full group flex items-center gap-3 p-3 rounded-lg transition-colors ${
              location.pathname === '/agence'
                ? 'bg-purple-50 text-purple-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Briefcase className={`h-5 w-5 ${
              location.pathname === '/agence' ? 'text-purple-500' : 'text-gray-400'
            }`} />
            <span className="text-sm font-medium">Info agence</span>
          </button>

          <button
            onClick={() => handleStepClick('/test-icoll')}
            className={`w-full group flex items-center gap-3 p-3 rounded-lg transition-colors ${
              location.pathname === '/test-icoll'
                ? 'bg-amber-50 text-amber-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Beaker className={`h-5 w-5 ${
              location.pathname === '/test-icoll' ? 'text-amber-500' : 'text-gray-400'
            }`} />
            <span className="text-sm font-medium">Test iColl</span>
          </button>
        </div>

        {/* Settings button */}
        <div className="mt-4">
          <button
            onClick={() => handleStepClick('/settings')}
            className={`w-full group flex items-center gap-3 p-3 rounded-lg transition-colors ${
              location.pathname === '/settings'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Settings className={`h-5 w-5 ${
              location.pathname === '/settings' ? 'text-gray-900' : 'text-gray-400'
            }`} />
            <span className="text-sm font-medium">Réglages</span>
          </button>
        </div>
      </div>
    </nav>
  );
}