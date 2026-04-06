import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, Shield } from 'lucide-react';
import BrandMark from './BrandMark';

export default function Navbar() {
  const { user, role, signIn, logOut } = useAuth();
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isPublicPage = !user && (location.pathname === '/' || location.pathname.startsWith('/use-cases/'));

  return (
    <nav className={`sticky z-50 ${isPublicPage ? 'top-0 px-4 pt-3 sm:px-6' : 'top-0 bg-white/95 backdrop-blur border-b border-[#EAEAEA]'}`}>
      <div
        className={`mx-auto px-4 sm:px-6 lg:px-8 ${isPublicPage ? 'max-w-5xl rounded-2xl border border-[#EAEAEA] bg-white/78 backdrop-blur-xl shadow-[0_12px_40px_rgba(17,17,17,0.06)]' : 'max-w-7xl'}`}
      >
        <div className={`flex justify-between items-center ${isPublicPage ? 'h-14' : 'h-16'}`}>
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2.5">
            <BrandMark compact={isPublicPage} />
          </Link>

          {/* Nav links (only on landing / public pages) */}
          {!user && isLanding && (
            <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-[#555555]">
              <a href="#live-example" className="hover:text-[#111111] transition-colors">Demo</a>
              <a href="#pricing" className="hover:text-[#111111] transition-colors">Pricing</a>
              <a href="#footer" className="hover:text-[#111111] transition-colors">Pages</a>
              <Link to="/use-cases/saas" className="hover:text-[#111111] transition-colors">Use cases</Link>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {role === 'superadmin' && (
                  <Link
                    to="/admin"
                    className="text-[#666666] hover:text-[#111111] flex items-center gap-1.5 font-medium text-sm transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="text-[#666666] hover:text-[#111111] flex items-center gap-1.5 font-medium text-sm transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={logOut}
                  className="text-[#666666] hover:text-[#111111] flex items-center gap-1.5 font-medium text-sm transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={signIn}
                className={`border border-[#EAEAEA] text-[#111111] rounded-lg text-sm font-medium transition-colors ${isPublicPage ? 'bg-white/90 px-3.5 py-1.5 hover:bg-white hover:border-[#C8860A]' : 'bg-white px-4 py-1.5 hover:border-[#111111]'}`}
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
