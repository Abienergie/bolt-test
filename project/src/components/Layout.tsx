import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import StepNavigation from './StepNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isNavOpen, setIsNavOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsNavOpen(true);
      } else {
        setIsNavOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation sidebar */}
      <div className="fixed inset-y-0 left-0 z-30">
        <div className={`fixed inset-y-0 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out ${
          isNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="h-full overflow-y-auto">
            <StepNavigation />
          </div>
        </div>
        
        {/* Toggle button */}
        <button
          onClick={() => setIsNavOpen(!isNavOpen)}
          className={`fixed top-4 bg-white rounded-full p-1 shadow-md border border-gray-200 transition-transform duration-300 ease-in-out lg:hidden ${
            isNavOpen 
              ? 'left-[246px]' 
              : 'left-0'
          }`}
          aria-label={isNavOpen ? 'Réduire le menu' : 'Ouvrir le menu'}
        >
          {isNavOpen ? (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isNavOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity lg:hidden z-20"
          onClick={() => setIsNavOpen(false)}
        />
      )}

      {/* Main content */}
      <div className={`flex-1 ${isNavOpen ? 'lg:pl-64' : ''}`}>
        {children}
      </div>
    </div>
  );
}