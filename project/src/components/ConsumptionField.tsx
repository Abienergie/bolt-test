import React from 'react';
import { Link } from 'react-router-dom';
import FormField from './FormField';
import { Link as LinkIcon, Zap } from 'lucide-react';
import { scrollToTop } from '../utils/scroll';

interface ConsumptionFieldProps {
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
}

export default function ConsumptionField({ 
  value, 
  onChange, 
  label = "Consommation annuelle estimée" 
}: ConsumptionFieldProps) {
  const handleLinkClick = () => {
    scrollToTop();
  };

  return (
    <div className="space-y-4">
      <FormField
        label={label}
        name="consommationAnnuelle"
        value={value}
        onChange={onChange}
        min={0}
        max={100000}
        step={100}
        unit="kWh/an"
      />
      <div className="flex flex-col space-y-2">
        <p className="text-sm text-gray-500">
          Vous trouverez votre consommation annuelle sur votre facture d'électricité.
        </p>
        <Link 
          to="/abie-link"
          onClick={handleLinkClick}
          className="relative block bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:border-blue-300 transition-colors group overflow-hidden"
        >
          <div className="absolute top-0 right-0">
            <div className="bg-amber-500 text-white text-xs px-3 py-1 rounded-bl-xl font-medium transform rotate-0">
              Bientôt disponible
            </div>
          </div>
          <div className="p-4 flex items-center gap-3">
            <div className="flex-shrink-0 p-2.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <span className="font-medium text-blue-600">Connecter mon compteur Linky</span>
                <span className="text-xs px-2 py-0.5 bg-white/80 text-blue-600 rounded-full border border-blue-200">
                  Optionnel
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-0.5">
                Récupérez automatiquement vos données de consommation
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="p-2 rounded-full group-hover:bg-blue-200/50 transition-colors">
                <LinkIcon className="h-5 w-5 text-blue-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}