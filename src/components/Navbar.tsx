import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, LogOut, LayoutDashboard, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, role, signIn, logOut } = useAuth();

  return (
    <nav className="bg-white border-b border-[#EAEAEA] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-[#111111]" />
              <span className="font-bold text-xl tracking-tight text-[#111111]">The Award App</span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            {user ? (
              <>
                {role === 'superadmin' && (
                  <Link
                    to="/admin"
                    className="text-[#666666] hover:text-[#111111] flex items-center gap-2 font-medium text-sm transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="text-[#666666] hover:text-[#111111] flex items-center gap-2 font-medium text-sm transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={logOut}
                  className="text-[#666666] hover:text-[#111111] flex items-center gap-2 font-medium text-sm transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={signIn}
                className="bg-[#111111] text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-black transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
