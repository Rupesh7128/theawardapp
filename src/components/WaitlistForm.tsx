import React, { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowRight, Check } from 'lucide-react';

interface WaitlistFormProps {
  source?: string;
  dark?: boolean;
  className?: string;
}

export default function WaitlistForm({ source = 'landing', dark = false, className = '' }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) return;

    setStatus('loading');
    try {
      // Use email as doc ID so re-submits are idempotent
      const docId = trimmed.replace(/[^a-z0-9@._-]/g, '_');
      await setDoc(
        doc(db, 'waitlist', docId),
        { email: trimmed, source, createdAt: serverTimestamp() },
        { merge: true }
      );
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${dark ? 'border-white/20 bg-white/10' : 'border-[#EAEAEA] bg-[#FAFAFA]'} ${className}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${dark ? 'bg-white/20' : 'bg-[#111111]'}`}>
          <Check className={`h-4 w-4 ${dark ? 'text-white' : 'text-white'}`} />
        </div>
        <div>
          <p className={`font-semibold text-sm ${dark ? 'text-white' : 'text-[#111111]'}`}>
            You're on the list!
          </p>
          <p className={`text-xs mt-0.5 ${dark ? 'text-[#999]' : 'text-[#666666]'}`}>
            We'll notify you the moment we launch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-2.5 ${className}`}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email address"
        required
        className={`flex-1 min-w-0 px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
          dark
            ? 'bg-white/10 border-white/20 text-white placeholder:text-[#555] focus:border-white/50'
            : 'bg-white border-[#EAEAEA] text-[#111111] placeholder:text-[#999] focus:border-[#111111]'
        }`}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap disabled:opacity-60 ${
          dark
            ? 'bg-white text-[#111111] hover:bg-[#FAFAFA]'
            : 'bg-[#111111] text-white hover:bg-black'
        }`}
      >
        {status === 'loading' ? 'Saving...' : 'Get Early Access'}
        {status !== 'loading' && <ArrowRight className="h-4 w-4" />}
      </button>
      {status === 'error' && (
        <p className={`text-xs mt-1 ${dark ? 'text-[#999]' : 'text-[#666666]'}`}>
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
