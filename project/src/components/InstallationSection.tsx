import React from 'react';
import { SolarParameters } from '../types';
import FormField from './FormField';
import FormFieldWithTooltip from './FormFieldWithTooltip';
import SelectFormField from './SelectFormField';
import PowerSelector from './PowerSelector';
import { ORIENTATION_OPTIONS, TILT_OPTIONS } from '../utils/orientationMapping';
import { SHADING_OPTIONS } from '../utils/constants/shadingOptions';
import OrientationCoefficientDisplay from './OrientationCoefficientDisplay';
import Tooltip from './Tooltip';
import { FileText } from 'lucide-react';

interface InstallationSectionProps {
  params: SolarParameters;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onParamsChange: (updates: Partial<SolarParameters>) => void;
}

export default function InstallationSection({
  params,
  onChange,
  onSelectChange,
  onParamsChange
}: InstallationSectionProps) {
  const handlePowerChange = (newPower: number) => {
    const nombreModules = Math.ceil((newPower * 1000) / params.puissanceModules);
    onParamsChange({ nombreModules });
  };

  const handleToggleChange = (name: string) => () => {
    onParamsChange({ [name]: !params[name] });
  };

  const handleOpenTechnicalDoc = (type: 'microinverter' | 'bifacial') => () => {
    const urls = {
      microinverter: 'https://drive.google.com/file/d/1eHC5DfxUCI9eGWikzXL2Adee7mmUS_EL/view?usp=drive_link',
      bifacial: 'https://drive.google.com/file/d/159O_va1W0Y2NBpUiJw-tt-wIQAgIq02l/view'
    };
    window.open(urls[type], '_blank');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Installation
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PowerSelector
          value={(params.nombreModules * params.puissanceModules) / 1000}
          onChange={handlePowerChange}
          typeCompteur={params.typeCompteur}
        />

        <FormField
          label="Nombre de modules"
          name="nombreModules"
          value={params.nombreModules}
          onChange={onChange}
          min={1}
          max={100}
          disabled={true}
        />

        <SelectFormField
          label="Inclinaison"
          name="inclinaison"
          value={params.inclinaison}
          onChange={onSelectChange}
          options={TILT_OPTIONS}
          unit="°"
        />

        <SelectFormField
          label="Orientation"
          name="orientation"
          value={params.orientation}
          onChange={onSelectChange}
          options={ORIENTATION_OPTIONS}
        />

        <FormFieldWithTooltip
          label="Pertes système"
          name="pertes"
          value={params.pertes}
          onChange={onChange}
          min={0}
          max={100}
          unit="%"
          tooltipContent="Les pertes système incluent les pertes dues aux câbles électriques, à la conversion DC/AC par l'onduleur, aux salissures sur les panneaux, et aux variations de température."
        />

        <SelectFormField
          label="Masque solaire"
          name="masqueSolaire"
          value={params.masqueSolaire}
          onChange={onSelectChange}
          options={SHADING_OPTIONS}
        />

        <div className="md:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Toggle pour Micro-onduleurs */}
            <div className="flex-1 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Micro-onduleurs</span>
                  <Tooltip content="Les micro-onduleurs optimisent la production de chaque panneau individuellement et augmentent la fiabilité du système" />
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={params.microOnduleurs || false}
                  onClick={handleToggleChange('microOnduleurs')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 ${
                    params.microOnduleurs ? 'bg-blue-400' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      params.microOnduleurs ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <button
                onClick={handleOpenTechnicalDoc('microinverter')}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <FileText className="h-4 w-4" />
                Fiche technique
              </button>
            </div>

            {/* Toggle pour Technologie bifacial */}
            <div className="flex-1 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Technologie bifacial</span>
                  <Tooltip content="Les panneaux bifaciaux captent la lumière des deux côtés, augmentant la production jusqu'à 10% selon les conditions d'installation" />
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={params.bifacial || false}
                  onClick={handleToggleChange('bifacial')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 ${
                    params.bifacial ? 'bg-blue-400' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      params.bifacial ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <button
                onClick={handleOpenTechnicalDoc('bifacial')}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <FileText className="h-4 w-4" />
                Fiche technique
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <OrientationCoefficientDisplay
            orientation={params.orientation}
            inclinaison={params.inclinaison}
          />
        </div>
      </div>
    </div>
  );
}