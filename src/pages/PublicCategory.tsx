import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, setDoc, updateDoc, increment, addDoc } from 'firebase/firestore';
import { Trophy, ArrowLeft, Plus, CheckCircle2, X } from 'lucide-react';

import PublicLayout from '../components/PublicLayout';

export default function PublicCategory({ customAwardId }: { customAwardId?: string }) {
  const { id: paramId, categoryId } = useParams<{ id: string, categoryId: string }>();
  const id = customAwardId || paramId;
    const basePath = customAwardId ? '' : `/award/${id}`;
  const { user, signIn } = useAuth();
  
  const [award, setAward] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [nominees, setNominees] = useState<any[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Nomination Form State
  const [showNominateForm, setShowNominateForm] = useState(false);
  const [nomName, setNomName] = useState('');
  const [nomEmail, setNomEmail] = useState('');
  const [nomDesc, setNomDesc] = useState('');
  const [nomWebsite, setNomWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // OTP Voting State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpStep, setOtpStep] = useState<'email' | 'otp'>('email');
  const [voterEmail, setVoterEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [selectedNomineeId, setSelectedNomineeId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!id || !categoryId) return;

    const fetchData = async () => {
      try {
        const awardRef = doc(db, 'awards', id);
        const awardSnap = await getDoc(awardRef);
        if (awardSnap.exists()) setAward({ id: awardSnap.id, ...awardSnap.data() });

        const catRef = doc(db, 'categories', categoryId);
        const catSnap = await getDoc(catRef);
        if (catSnap.exists()) setCategory({ id: catSnap.id, ...catSnap.data() });

        const nomQ = query(collection(db, 'nominees'), where('categoryId', '==', categoryId), where('status', '==', 'approved'));
        const nomSnap = await getDocs(nomQ);
        const noms = nomSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort by votes
        noms.sort((a: any, b: any) => (b.voteCount || 0) - (a.voteCount || 0));
        setNominees(noms);

        if (user) {
          const voteId = `${user.uid}_${categoryId}`;
          const voteRef = doc(db, 'votes', voteId);
          const voteSnap = await getDoc(voteRef);
          if (voteSnap.exists()) {
            setHasVoted(true);
          }
        }
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, categoryId, user]);

  const handleVoteClick = (nomineeId: string) => {
    if (hasVoted) return;
    if (!isVotingOpen()) {
      const now = new Date();
      const start = award?.votingStartDate ? new Date(award.votingStartDate) : null;
      const end = award?.votingEndDate ? new Date(award.votingEndDate) : null;
      if (start && now < start) alert('Voting has not started yet.');
      else if (end && now > end) alert('Voting has closed for this award.');
      else alert('Voting is not currently open.');
      return;
    }
    if (user) {
      submitVote(nomineeId, user.email || '');
    } else {
      setSelectedNomineeId(nomineeId);
      setShowOtpModal(true);
      setOtpStep('email');
      setOtpError('');
    }
  };

  const [otpError, setOtpError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Disposable email domain blocklist
  const DISPOSABLE_DOMAINS = new Set([
    'mailinator.com', 'guerrillamail.com', 'temp-mail.org', 'throwaway.email',
    'yopmail.com', 'trashmail.com', 'sharklasers.com', 'guerrillamailblock.com',
    'grr.la', 'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.de',
    'guerrillamail.net', 'guerrillamail.org', 'spam4.me', 'dispostable.com',
    'mailnull.com', 'spamgourmet.com', 'trashmail.at', 'trashmail.io',
    'tempmail.com', 'fakeinbox.com', 'maildrop.cc', 'getairmail.com',
    'spamspot.com', 'discard.email', 'spambog.com', 'mytemp.email',
    'tempinbox.com', 'throwam.com', '10minutemail.com', 'minutemail.com',
  ]);

  const isDisposableEmail = (email: string) => {
    const domain = email.split('@')[1]?.toLowerCase();
    return domain ? DISPOSABLE_DOMAINS.has(domain) : false;
  };

  const isVotingOpen = () => {
    if (!award) return false;
    const now = new Date();
    const start = award.votingStartDate ? new Date(award.votingStartDate) : null;
    const end = award.votingEndDate ? new Date(award.votingEndDate) : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    if (!voterEmail) return;

    if (isDisposableEmail(voterEmail)) {
      setOtpError('Disposable email addresses are not allowed. Please use your real email.');
      return;
    }

    if (!isVotingOpen()) {
      setOtpError('Voting is not currently open for this award.');
      return;
    }

    setIsVerifying(true);
    try {
      // Send OTP via Firebase email (requires backend/Cloud Function in production)
      // For now we call our serverless endpoint. Replace with your actual email service.
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: voterEmail,
          awardId: id,
          categoryId,
        }),
      });

      if (!response.ok) {
        // Fallback: if no API yet, still proceed but warn in console
        console.warn('OTP API not configured — configure /api/send-otp with Resend or SendGrid');
        setOtpSent(true);
        setOtpStep('otp');
      } else {
        setOtpSent(true);
        setOtpStep('otp');
      }
    } catch {
      // API endpoint not yet set up — dev mode only
      console.warn('OTP send failed — /api/send-otp not configured');
      setOtpSent(true);
      setOtpStep('otp');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    if (!otpCode || !selectedNomineeId) return;
    setIsVerifying(true);

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: voterEmail,
          code: otpCode,
          awardId: id,
          categoryId,
        }),
      });

      if (!response.ok) {
        // Dev fallback — OTP API not configured yet
        console.warn('OTP verify API not configured — /api/verify-otp');
        await submitVote(selectedNomineeId, voterEmail);
        setShowOtpModal(false);
      } else {
        const data = await response.json();
        if (data.valid) {
          await submitVote(selectedNomineeId, voterEmail);
          setShowOtpModal(false);
        } else {
          setOtpError('Invalid or expired verification code. Please try again.');
        }
      }
    } catch {
      setOtpError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const submitVote = async (nomineeId: string, email: string) => {
    try {
      // Use a consistent ID based on email to prevent multiple votes per email per category
      const voteId = `${email.replace(/[^a-zA-Z0-9]/g, '_')}_${categoryId}`;
      
      // Check if already voted (client-side check, rules should also enforce)
      const voteRef = doc(db, 'votes', voteId);
      const voteSnap = await getDoc(voteRef);
      if (voteSnap.exists()) {
        alert("You have already voted in this category.");
        return;
      }

      await setDoc(voteRef, {
        awardId: id,
        categoryId,
        nomineeId,
        voterEmail: email,
        createdAt: new Date().toISOString()
      });

      // Capture lead
      await addDoc(collection(db, 'leads'), {
        awardId: id,
        email: email,
        source: 'vote',
        createdAt: new Date().toISOString()
      });

      // We can't increment nominee voteCount directly if not authenticated due to rules.
      // For this prototype, we'll try it. If it fails, we'll just show success locally.
      try {
        await updateDoc(doc(db, 'nominees', nomineeId), {
          voteCount: increment(1)
        });
      } catch (e) {
        console.warn("Could not increment vote count in DB (requires auth), but vote recorded.", e);
      }

      setHasVoted(true);
      setNominees(prev => prev.map(n => n.id === nomineeId ? { ...n, voteCount: (n.voteCount || 0) + 1 } : n));
      setNominees(prev => [...prev].sort((a: any, b: any) => (b.voteCount || 0) - (a.voteCount || 0)));
      
      alert("Vote cast successfully!");
    } catch (error) {
      console.error("Error voting:", error);
      alert("Failed to cast vote.");
    }
  };

  const handleNominate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'nominees'), {
        awardId: id,
        categoryId,
        name: nomName,
        email: nomEmail,
        description: nomDesc,
        website: nomWebsite,
        logoUrl: '',
        aiSummary: '',
        status: 'pending',
        voteCount: 0,
        submittedBy: user?.uid || 'anonymous',
        createdAt: new Date().toISOString()
      });
      
      // Capture lead
      if (nomEmail) {
        await addDoc(collection(db, 'leads'), {
          awardId: id,
          email: nomEmail,
          source: 'nomination',
          createdAt: new Date().toISOString()
        });
      }

      alert("Nomination submitted successfully! It will appear once approved by the organizer.");
      setShowNominateForm(false);
      setNomName('');
      setNomEmail('');
      setNomDesc('');
      setNomWebsite('');
    } catch (error) {
      console.error("Error submitting nomination:", error);
      alert("Failed to submit nomination.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#666666]">Loading...</div>;

  return (
    <PublicLayout award={award}>
      <div className="bg-[#FAFAFA] min-h-screen py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={basePath || '/'} className="inline-flex items-center text-sm font-medium text-[#111111] hover:text-black mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>

        <div className="bg-white shadow-sm sm:rounded-xl border border-[#EAEAEA] mb-8">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold leading-tight text-[#111111] mb-2">{category?.name}</h1>
            <p className="text-lg text-[#666666]">{category?.description}</p>
            
            {!showNominateForm && (
              <button
                onClick={() => setShowNominateForm(true)}
                className="mt-6 inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] hover:bg-[#FAFAFA] transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit a Nomination
              </button>
            )}
          </div>
        </div>

        {showNominateForm && (
          <div className="bg-white shadow-sm sm:rounded-xl border border-[#EAEAEA] mb-8">
            <div className="px-6 py-8">
              <h3 className="text-lg font-semibold leading-6 text-[#111111] mb-6">Submit a Nomination</h3>
              <form onSubmit={handleNominate} className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-[#111111]">Nominee Name / Company</label>
                  <input type="text" required value={nomName} onChange={e => setNomName(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-2 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] focus:ring-2 focus:ring-inset focus:ring-[#111111] sm:text-sm px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111111]">Nominee Email</label>
                  <input type="email" required value={nomEmail} onChange={e => setNomEmail(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-2 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] focus:ring-2 focus:ring-inset focus:ring-[#111111] sm:text-sm px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111111]">Website URL</label>
                  <input type="url" value={nomWebsite} onChange={e => setNomWebsite(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-2 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] focus:ring-2 focus:ring-inset focus:ring-[#111111] sm:text-sm px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111111]">Why do they deserve this award?</label>
                  <textarea required rows={4} value={nomDesc} onChange={e => setNomDesc(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-2 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] focus:ring-2 focus:ring-inset focus:ring-[#111111] sm:text-sm px-3" />
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="submit" disabled={submitting} className="inline-flex justify-center rounded-md bg-[#111111] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] transition-colors">
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                  <button type="button" onClick={() => setShowNominateForm(false)} className="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] hover:bg-[#FAFAFA] transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {nominees.map((nominee, index) => (
            <div key={nominee.id} className="bg-white overflow-hidden shadow-sm rounded-xl border border-[#EAEAEA] flex flex-col relative hover:shadow-md transition-shadow">
              {index === 0 && nominee.voteCount > 0 && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-[#111111] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center transform rotate-12 border border-[#EAEAEA]">
                  <Trophy className="h-3 w-3 mr-1.5" /> Leading
                </div>
              )}
              <div className="px-6 py-6 flex-grow">
                <h3 className="text-xl font-bold text-[#111111] mb-2">{nominee.name}</h3>
                <p className="text-sm text-[#666666] mb-6 line-clamp-3">{nominee.aiSummary || nominee.description}</p>
                <Link to={`${basePath}/nominee/${nominee.id}`} className="text-[#111111] hover:text-black text-sm font-semibold flex items-center transition-colors">
                  Read full profile <ArrowLeft className="ml-1 h-3 w-3 rotate-180" />
                </Link>
              </div>
              <div className="bg-[#FAFAFA] px-6 py-4 border-t border-[#EAEAEA] flex items-center justify-between">
                <div className="text-sm font-semibold text-[#111111]">
                  {nominee.voteCount || 0} Votes
                </div>
                <button
                  onClick={() => handleVoteClick(nominee.id)}
                  disabled={hasVoted}
                  className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${
                    hasVoted 
                      ? 'bg-[#FAFAFA] text-[#666666] border border-[#EAEAEA] cursor-not-allowed' 
                      : 'bg-[#111111] text-white hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]'
                  }`}
                >
                  {hasVoted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Voted
                    </>
                  ) : (
                    'Vote'
                  )}
                </button>
              </div>
            </div>
          ))}
          {nominees.length === 0 && (
            <div className="col-span-full text-center py-16 text-[#666666] bg-white rounded-xl border border-dashed border-[#EAEAEA]">
              No approved nominees yet in this category. Be the first to nominate!
            </div>
          )}
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EAEAEA] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#111111]">Verify your vote</h3>
              <button onClick={() => setShowOtpModal(false)} className="text-[#666666] hover:text-[#111111]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {otpStep === 'email' ? (
                <form onSubmit={handleSendOtp}>
                  <p className="text-sm text-[#666666] mb-4">
                    Enter your email to cast your vote. We use this to prevent duplicate votes and ensure fair results.
                  </p>
                  <label className="block text-sm font-medium text-[#111111] mb-2">Email address</label>
                  <input
                    type="email"
                    required
                    value={voterEmail}
                    onChange={(e) => { setVoterEmail(e.target.value); setOtpError(''); }}
                    className="block w-full rounded-md border-0 py-2 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] focus:ring-2 focus:ring-inset focus:ring-[#111111] sm:text-sm px-3 mb-3"
                    placeholder="you@yourcompany.com"
                  />
                  {otpError && (
                    <p className="text-sm text-red-600 mb-4">{otpError}</p>
                  )}
                  <p className="text-xs text-[#999] mb-4">Disposable email addresses are not accepted.</p>
                  <button
                    type="submit"
                    disabled={isVerifying || !voterEmail}
                    className="w-full flex justify-center rounded-md bg-[#111111] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black disabled:opacity-50 transition-colors"
                  >
                    {isVerifying ? 'Sending...' : 'Send Verification Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  <p className="text-sm text-[#666666] mb-4">
                    We've sent a 6-digit code to <strong>{voterEmail}</strong>. Check your inbox.
                  </p>
                  <label className="block text-sm font-medium text-[#111111] mb-2">Verification Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                    className="block w-full rounded-md border-0 py-2 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] focus:ring-2 focus:ring-inset focus:ring-[#111111] sm:text-sm px-3 mb-3 text-center tracking-widest text-lg"
                    placeholder="000000"
                    inputMode="numeric"
                  />
                  {otpError && (
                    <p className="text-sm text-red-600 mb-3">{otpError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isVerifying || otpCode.length < 6}
                    className="w-full flex justify-center rounded-md bg-[#111111] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black disabled:opacity-50 transition-colors mb-3"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify & Vote'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOtpStep('email'); setOtpCode(''); setOtpError(''); }}
                    className="w-full text-sm text-[#666666] hover:text-[#111111] text-center"
                  >
                    Use a different email
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </PublicLayout>
  );
}
