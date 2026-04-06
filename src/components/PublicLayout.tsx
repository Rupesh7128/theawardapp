import React from 'react';
import { Link } from 'react-router-dom';

interface PublicLayoutProps {
  children: React.ReactNode;
  award: any;
}

export default function PublicLayout({ children, award }: PublicLayoutProps) {
  if (!award) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-[#EAEAEA] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {award.logoUrl && (
              <a href={award.landingPageUrl || '#'} target="_blank" rel="noopener noreferrer">
                <img src={award.logoUrl} alt={award.name} className="h-8 w-auto object-contain" />
              </a>
            )}
            <Link to={`/award/${award.id}`} className="font-bold text-lg text-[#111111] hover:underline">
              {award.name}
            </Link>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium text-[#666666]">
            {award.landingPageUrl && (
              <a href={award.landingPageUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#111111]">
                Website
              </a>
            )}
            {award.rulesUrl && (
              <a href={award.rulesUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#111111]">
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
      <footer className="bg-[#FAFAFA] border-t border-[#EAEAEA] py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#666666]">
            &copy; {new Date().getFullYear()} {award.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-[#666666]">
            {award.privacyPolicyUrl && (
              <a href={award.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#111111]">
                Privacy Policy
              </a>
            )}
            {award.rulesUrl && (
              <a href={award.rulesUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#111111]">
                Terms & Rules
              </a>
            )}
            <span className="text-[#EAEAEA]">|</span>
            <a href="/" className="hover:text-[#111111] font-medium flex items-center gap-1">
              Powered by <span className="text-[#111111] font-semibold">theawardsapp</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
