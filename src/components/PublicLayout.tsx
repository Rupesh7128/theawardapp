import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';
import { motion } from 'framer-motion';

interface PublicLayoutProps {
  children: React.ReactNode;
  award: any;
}

export default function PublicLayout({ children, award }: PublicLayoutProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!award) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-white font-serif text-anthropic-dark">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans border-b ${
          scrolled ? 'bg-white/90 backdrop-blur-lg shadow-sm border-anthropic-lightGray/50 py-3' : 'bg-transparent border-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {award.logoUrl && (
              <a href={award.landingPageUrl || '#'} target="_blank" rel="noopener noreferrer" className="relative group">
                <img src={award.logoUrl} alt={award.name} className="h-10 w-auto object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
              </a>
            )}
            {!award.logoUrl && (
              <Link to={`/award/${award.id}`} className="font-bold text-xl tracking-tight text-anthropic-dark hover:text-anthropic-orange transition-colors">
                {award.name}
              </Link>
            )}
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide text-anthropic-dark uppercase">
            {award.landingPageUrl && (
              <a href={award.landingPageUrl} target="_blank" rel="noopener noreferrer" className="hover:text-anthropic-orange relative group transition-colors">
                Website
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-anthropic-orange transition-all duration-300 group-hover:w-full"></span>
              </a>
            )}
            {award.rulesUrl && (
              <a href={award.rulesUrl} target="_blank" rel="noopener noreferrer" className="hover:text-anthropic-orange relative group transition-colors">
                Rules
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-anthropic-orange transition-all duration-300 group-hover:w-full"></span>
              </a>
            )}
          </nav>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-grow pt-24">
        {children}
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-anthropic-dark text-white py-16 mt-auto font-sans relative overflow-hidden"
      >
        {/* Subtle background glow in footer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-anthropic-orange/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 border-b border-white/10 pb-12">
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-2xl font-bold tracking-tight mb-4">{award.name}</h3>
              {award.description && (
                <p className="text-sm text-anthropic-lightGray leading-relaxed max-w-xs font-serif">
                  {award.description}
                </p>
              )}
            </div>
            <div className="col-span-1 flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-anthropic-midGray mb-2">Links</h4>
              {award.landingPageUrl && (
                <a href={award.landingPageUrl} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-anthropic-orange transition-colors w-fit">
                  Official Website
                </a>
              )}
              {award.rulesUrl && (
                <a href={award.rulesUrl} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-anthropic-orange transition-colors w-fit">
                  Terms & Rules
                </a>
              )}
              {award.privacyPolicyUrl && (
                <a href={award.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-anthropic-orange transition-colors w-fit">
                  Privacy Policy
                </a>
              )}
            </div>
            <div className="col-span-1 flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-anthropic-midGray mb-2">Powered By</h4>
              <a href="/" className="inline-block hover:opacity-80 transition-opacity">
                <BrandMark compact dark />
              </a>
              <p className="text-xs text-anthropic-lightGray mt-2">
                Launch award campaigns that nominees want to share and voters want to join.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-anthropic-midGray">
            <p>&copy; {new Date().getFullYear()} {award.name}. All rights reserved.</p>
            <p>Designed with <span className="text-anthropic-orange">&hearts;</span> by The Awards App</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
