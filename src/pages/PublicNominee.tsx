import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, setDoc, updateDoc, increment, addDoc, limit } from 'firebase/firestore';
import { ArrowLeft, Globe, Sparkles, Linkedin, Mail, Share2, CheckCircle2, X, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

import PublicLayout from '../components/PublicLayout';

export default function PublicNominee({ customAwardId }: { customAwardId?: string }) {
  const { id: paramId, nomineeId } = useParams<{ id: string, nomineeId: string }>();
  const id = customAwardId || paramId;
  const basePath = customAwardId ? '' : `/award/${id}`;
  
  const { user } = useAuth();
  
  const [award, setAward] = useState<any>(null);
  const [nominee, setNominee] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [similarNominees, setSimilarNominees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // OTP Voting State
  const [hasVoted, setHasVoted] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpStep, setOtpStep] = useState<'email' | 'otp'>('email');
  const [voterEmail, setVoterEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!id || !nomineeId) return;

    const fetchData = async () => {
      try {
        const awardRef = doc(db, 'awards', id);
        const awardSnap = await getDoc(awardRef);
        if (awardSnap.exists()) {
          setAward({ id: awardSnap.id, ...awardSnap.data() });
        }

        const nomRef = doc(db, 'nominees', nomineeId);
        const nomSnap = await getDoc(nomRef);
        if (nomSnap.exists()) {
          const nomData: any = { id: nomSnap.id, ...nomSnap.data() };
          setNominee(nomData);
          
          if (nomData.categoryId) {
            const catRef = doc(db, 'categories', nomData.categoryId);
            const catSnap = await getDoc(catRef);
            if (catSnap.exists()) {
              setCategory({ id: catSnap.id, ...catSnap.data() });
            }
            
            // Fetch similar nominees
            const similarQ = query(
              collection(db, 'nominees'), 
              where('categoryId', '==', nomData.categoryId), 
              where('status', '==', 'approved'),
              limit(4)
            );
            const similarSnap = await getDocs(similarQ);
            const similar = similarSnap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter(n => n.id !== nomData.id)
              .slice(0, 3);
            
            setSimilarNominees(similar);
            
            if (user) {
              const voteId = `${user.uid}_${nomData.categoryId}`;
              const voteRef = doc(db, 'votes', voteId);
              const voteSnap = await getDoc(voteRef);
              if (voteSnap.exists()) {
                setHasVoted(true);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching nominee:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, nomineeId, user]);

  const isVotingOpen = () => {
    if (!award) return false;
    const now = new Date();
    const start = award.votingStartDate ? new Date(award.votingStartDate) : null;
    const end = award.votingEndDate ? new Date(award.votingEndDate) : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  };
  
  const handleVoteClick = () => {
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
      submitVote(user.email || '');
    } else {
      setShowOtpModal(true);
      setOtpStep('email');
      setOtpError('');
    }
  };

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
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: voterEmail,
          awardId: id,
          categoryId: nominee.categoryId,
        }),
      });

      if (!response.ok) {
        console.warn('OTP API not configured');
        setOtpStep('otp');
      } else {
        setOtpStep('otp');
      }
    } catch {
      console.warn('OTP send failed');
      setOtpStep('otp');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    if (!otpCode) return;
    setIsVerifying(true);

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: voterEmail,
          code: otpCode,
          awardId: id,
          categoryId: nominee.categoryId,
        }),
      });

      if (!response.ok) {
        console.warn('OTP verify API not configured');
        await submitVote(voterEmail);
        setShowOtpModal(false);
      } else {
        const data = await response.json();
        if (data.valid) {
          await submitVote(voterEmail);
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

  const submitVote = async (email: string) => {
    try {
      const voteId = `${email.replace(/[^a-zA-Z0-9]/g, '_')}_${nominee.categoryId}`;
      
      const voteRef = doc(db, 'votes', voteId);
      const voteSnap = await getDoc(voteRef);
      if (voteSnap.exists()) {
        alert("You have already voted in this category.");
        return;
      }

      await setDoc(voteRef, {
        awardId: id,
        categoryId: nominee.categoryId,
        nomineeId,
        voterEmail: email,
        createdAt: new Date().toISOString()
      });

      await addDoc(collection(db, 'leads'), {
        awardId: id,
        email: email,
        source: 'vote',
        createdAt: new Date().toISOString()
      });

      try {
        await updateDoc(doc(db, 'nominees', nomineeId), {
          voteCount: increment(1)
        });
      } catch (e) {
        console.warn("Could not increment vote count in DB (requires auth), but vote recorded.", e);
      }

      setHasVoted(true);
      setNominee((prev: any) => ({ ...prev, voteCount: (prev.voteCount || 0) + 1 }));
      
      alert("Vote cast successfully!");
    } catch (error) {
      console.error("Error voting:", error);
      alert("Failed to cast vote.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#666666]">Loading...</div>;
  if (!nominee) return <div className="min-h-screen flex items-center justify-center text-xl text-[#666666]">Nominee not found.</div>;

  return (
    <PublicLayout award={award}>
      <div className="bg-[#FAFAFA] min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={`${basePath}/category/${nominee.categoryId}`} className="inline-flex items-center text-sm font-medium text-[#666666] hover:text-[#111111] mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {category?.name || 'Category'}
          </Link>

          {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#EAEAEA] overflow-hidden mb-8 relative">
            <div className="h-32 bg-[#111111] absolute top-0 left-0 right-0 z-0"></div>
            
            <div className="px-8 pt-20 pb-8 relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 border-b border-[#EAEAEA]">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                <div className="h-32 w-32 rounded-2xl bg-white p-1.5 shadow-md flex-shrink-0">
                  {nominee.logoUrl ? (
                    <img src={nominee.logoUrl} alt="" className="h-full w-full rounded-xl object-cover border border-[#EAEAEA]" />
                  ) : (
                    <div className="h-full w-full rounded-xl bg-[#FAFAFA] flex items-center justify-center text-4xl font-bold text-[#111111] border border-[#EAEAEA]">
                      {nominee.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="pb-2">
                  <h1 className="text-3xl sm:text-4xl font-bold text-[#111111]">{nominee.name}</h1>
                  {(nominee.title || nominee.company) && (
                    <p className="mt-2 text-lg text-[#666666]">
                      {nominee.title} {nominee.title && nominee.company ? 'at' : ''} <span className="font-semibold text-[#111111]">{nominee.company}</span>
                    </p>
                  )}
                  <p className="mt-1 text-sm text-[#C8860A] font-semibold flex items-center gap-1.5">
                    <Trophy className="h-4 w-4" /> Nominated for {category?.name}
                  </p>
                </div>
              </div>
              
              <div className="w-full sm:w-auto flex flex-col gap-3 pb-2">
                <button
                  onClick={handleVoteClick}
                  disabled={hasVoted}
                  className={`w-full sm:w-48 flex justify-center items-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold shadow-sm transition-all ${
                    hasVoted 
                      ? 'bg-[#FAFAFA] text-[#666666] border border-[#EAEAEA] cursor-not-allowed' 
                      : 'bg-[#111111] text-white hover:bg-black hover:shadow-md transform hover:-translate-y-0.5'
                  }`}
                >
                  {hasVoted ? (
                    <><CheckCircle2 className="h-5 w-5" /> Voted</>
                  ) : (
                    'Vote Now'
                  )}
                </button>
                <div className="text-center text-sm font-medium text-[#666666]">
                  <span className="text-xl font-bold text-[#111111] mr-1">{nominee.voteCount || 0}</span> votes
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-[#FAFAFA] px-8 py-4 flex flex-wrap items-center gap-4">
              {nominee.linkedinUrl && (
                <a href={nominee.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[#666666] hover:text-[#0A66C2] transition-colors">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              )}
              {nominee.website && (
                <a href={nominee.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[#666666] hover:text-[#111111] transition-colors">
                  <Globe className="h-4 w-4" /> Website
                </a>
              )}
              {nominee.email && (
                <a href={`mailto:${nominee.email}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#666666] hover:text-[#111111] transition-colors">
                  <Mail className="h-4 w-4" /> Email
                </a>
              )}
              <div className="flex-1"></div>
              <button 
                onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#666666] hover:text-[#111111] transition-colors bg-white border border-[#EAEAEA] px-3 py-1.5 rounded-lg"
              >
                <Share2 className="h-4 w-4" /> Share Profile
              </button>
            </div>

            {/* About Section */}
            <div className="px-8 py-8">
              <h2 className="text-xl font-bold text-[#111111] mb-4">About</h2>
              <div className="prose prose-sm sm:prose-base max-w-none text-[#444444] leading-relaxed whitespace-pre-wrap">
                {nominee.description || 'No description provided.'}
              </div>
              
              {nominee.aiSummary && (
                <div className="mt-8 bg-[#FAFAFA] border border-[#EAEAEA] rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C8860A]/10 to-transparent rounded-bl-full pointer-events-none"></div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-[#C8860A]" />
                    <h3 className="font-semibold text-[#111111]">AI Summary</h3>
                  </div>
                  <p className="text-[#666666] italic leading-relaxed">
                    "{nominee.aiSummary}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Similar Profiles */}
          {similarNominees.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#111111]">Other Nominees in {category?.name}</h2>
                <Link to={`${basePath}/category/${nominee.categoryId}`} className="text-sm font-medium text-[#666666] hover:text-[#111111]">
                  View all &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {similarNominees.map(sim => (
                  <Link key={sim.id} to={`${basePath}/nominee/${sim.id}`} className="bg-white rounded-2xl border border-[#EAEAEA] p-6 hover:shadow-md hover:border-[#111111] transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                      {sim.logoUrl ? (
                        <img src={sim.logoUrl} alt="" className="h-12 w-12 rounded-full object-cover border border-[#EAEAEA]" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-[#FAFAFA] flex items-center justify-center text-lg font-bold text-[#111111] border border-[#EAEAEA]">
                          {sim.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-[#111111] group-hover:text-black line-clamp-1">{sim.name}</h4>
                        <p className="text-xs text-[#666666]">{sim.voteCount || 0} votes</p>
                      </div>
                    </div>
                    <p className="text-sm text-[#666666] line-clamp-2">{sim.aiSummary || sim.description}</p>
                  </Link>
                ))}
              </div>
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
    </PublicLayout>
  );
}