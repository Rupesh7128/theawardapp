import React from 'react';
import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';

interface PublicLayoutProps {
  children: React.ReactNode;
  award: any;
}

export default function PublicLayout({ children, award }: PublicLayoutProps) {
  if (!award) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-anthropic-light font-serif text-anthropic-dark">
      {/* Header */}
      <header className="bg-anthropic-light border-b border-anthropic-lightGray py-4 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {award.logoUrl && (
              <a href={award.landingPageUrl || '#'} target="_blank" rel="noopener noreferrer">
                <img src={award.logoUrl} alt={award.name} className="h-8 w-auto object-contain" />
              </a>
            )}
            <Link to={`/award/${award.id}`} className="font-bold text-lg text-anthropic-dark hover:text-anthropic-orange transition-colors">
              {award.name}
            </Link>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium text-anthropic-midGray">
            {award.landingPageUrl && (
              <a href={award.landingPageUrl} target="_blank" rel="noopener noreferrer" className="hover:text-anthropic-dark transition-colors">
                Website
              </a>
            )}
            {award.rulesUrl && (
              <a href={award.rulesUrl} target="_blank" rel="noopener noreferrer" className="hover:text-anthropic-dark transition-colors">
                Rules
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-anthropic-lightGray/30 border-t border-anthropic-lightGray py-8 mt-auto font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-anthropic-midGray">
            &copy; {new Date().getFullYear()} {award.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-anthropic-midGray">
            {award.privacyPolicyUrl && (
              <a href={award.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-anthropic-dark transition-colors">
                Privacy Policy
              </a>
            )}
            {award.rulesUrl && (
              <a href={award.rulesUrl} target="_blank" rel="noopener noreferrer" className="hover:text-anthropic-dark transition-colors">
                Terms & Rules
              </a>
            )}
            <span className="text-anthropic-lightGray">|</span>
            <a href="/" className="hover:text-anthropic-dark font-medium flex items-center gap-2 transition-colors">
              <span>Powered by</span>
              <BrandMark compact />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
