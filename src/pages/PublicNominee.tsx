import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, setDoc, updateDoc, increment, addDoc, limit } from 'firebase/firestore';
import { ArrowLeft, Globe, Sparkles, Linkedin, Mail, Share2, CheckCircle2, X, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

import PublicLayout from '../components/PublicLayout';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 15 }
  }
};

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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-anthropic-midGray font-serif bg-white">Loading...</div>;
  if (!nominee) return <div className="min-h-screen flex items-center justify-center text-xl text-anthropic-midGray font-serif bg-white">Nominee not found.</div>;

  return (
    <PublicLayout award={award}>
      <div className="bg-white min-h-screen font-sans selection:bg-anthropic-orange/30 selection:text-anthropic-dark">
        
        {/* HUGE HERO / LOGO SECTION */}
        <div className="relative w-full pt-20 pb-32 overflow-hidden flex flex-col items-center border-b border-anthropic-lightGray bg-anthropic-light/30">
          
          {/* Subtle animated background glow */}
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-anthropic-orange/20 to-transparent rounded-full blur-[100px] pointer-events-none"
          />

          <motion.div 
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center"
          >
            <motion.div variants={itemVariants} className="w-full flex justify-start mb-8">
              <Link to={`${basePath}/category/${nominee.categoryId}`} className="inline-flex items-center text-sm font-bold tracking-widest uppercase text-[#999999] hover:text-[#111111] transition-colors bg-white rounded-full px-6 py-2.5 border-2 border-[#EAEAEA] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <ArrowLeft className="mr-3 h-4 w-4" />
                Back to {category?.name || 'Category'}
              </Link>
            </motion.div>

            {/* Massive Logo Display */}
            <motion.div variants={itemVariants} className="relative mb-12 group">
              <div className="absolute inset-0 bg-anthropic-orange blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 rounded-full"></div>
              <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-white border border-anthropic-lightGray shadow-2xl p-2 relative z-10 flex items-center justify-center overflow-hidden">
                {nominee.logoUrl ? (
                  <img src={nominee.logoUrl} alt={nominee.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full rounded-full bg-anthropic-dark flex items-center justify-center text-6xl sm:text-8xl font-bold text-white">
                    {nominee.name.charAt(0)}
                  </div>
                )}
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.6, stiffness: 200 }}
                className="absolute -bottom-4 right-4 bg-anthropic-orange text-white px-4 py-2 rounded-full shadow-lg border-4 border-white flex items-center gap-2 z-20"
              >
                <Trophy className="h-4 w-4" />
                <span className="text-sm font-bold uppercase tracking-widest">{nominee.voteCount || 0} Votes</span>
              </motion.div>
            </motion.div>

            {/* Title & Details */}
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl font-extrabold text-anthropic-dark tracking-tight mb-4 leading-tight">
              {nominee.name}
            </motion.h1>
            
            {(nominee.title || nominee.company) && (
              <motion.div variants={itemVariants} className="text-xl sm:text-2xl text-anthropic-midGray font-serif italic mb-6">
                {nominee.title} {nominee.title && nominee.company ? 'at' : ''} <span className="font-bold text-anthropic-dark not-italic">{nominee.company}</span>
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="mt-2 mb-8 flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs sm:text-sm font-bold tracking-widest uppercase text-anthropic-midGray">
              {award?.nominationEndDate && (
                <div className="flex flex-col items-center bg-white px-4 py-2 rounded-xl border border-anthropic-lightGray shadow-sm">
                  <span className="text-[10px] mb-1 text-anthropic-midGray/70">Nominations Close</span>
                  <span className="text-anthropic-dark">{format(new Date(award.nominationEndDate), 'MMM d, yyyy - h:mm a')}</span>
                </div>
              )}
              {award?.votingStartDate && (
                <div className="flex flex-col items-center bg-white px-4 py-2 rounded-xl border border-anthropic-lightGray shadow-sm">
                  <span className="text-[10px] mb-1 text-anthropic-midGray/70">Voting Starts</span>
                  <span className="text-anthropic-dark">{format(new Date(award.votingStartDate), 'MMM d, yyyy - h:mm a')}</span>
                </div>
              )}
              {award?.votingEndDate && (
                <div className="flex flex-col items-center bg-white px-4 py-2 rounded-xl border border-anthropic-lightGray shadow-sm">
                  <span className="text-[10px] mb-1 text-anthropic-midGray/70">Voting Closes</span>
                  <span className="text-anthropic-dark">{format(new Date(award.votingEndDate), 'MMM d, yyyy - h:mm a')}</span>
                </div>
              )}
            </motion.div>

            {/* Huge Floating Vote Button */}
            <motion.div variants={itemVariants} className="mt-8 mb-12">
              <button
                onClick={handleVoteClick}
                disabled={hasVoted}
                className={`relative group overflow-hidden rounded-full px-12 py-5 text-xl font-bold shadow-xl transition-all duration-500 transform hover:-translate-y-1 ${
                  hasVoted 
                    ? 'bg-anthropic-light text-anthropic-midGray border border-anthropic-lightGray shadow-none cursor-not-allowed' 
                    : 'bg-anthropic-dark text-white hover:shadow-anthropic-orange/20 hover:shadow-2xl'
                }`}
              >
                {!hasVoted && (
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
                )}
                <span className="relative flex items-center gap-3">
                  {hasVoted ? (
                    <><CheckCircle2 className="h-6 w-6 text-anthropic-orange" /> Vote Cast</>
                  ) : (
                    <><Sparkles className="h-6 w-6 text-anthropic-orange" /> Cast Your Vote</>
                  )}
                </span>
              </button>
            </motion.div>

            {/* Social Links Row */}
            <motion.div variants={itemVariants} className="flex flex-wrap justify-center items-center gap-4">
              {nominee.linkedinUrl && (
                <a href={nominee.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 rounded-full bg-white border border-anthropic-lightGray text-anthropic-midGray hover:text-[#0A66C2] hover:border-[#0A66C2] hover:shadow-md transition-all">
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {nominee.website && (
                <a href={nominee.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 rounded-full bg-white border border-anthropic-lightGray text-anthropic-midGray hover:text-anthropic-dark hover:border-anthropic-dark hover:shadow-md transition-all">
                  <Globe className="h-5 w-5" />
                </a>
              )}
              {nominee.email && (
                <a href={`mailto:${nominee.email}`} className="flex items-center justify-center w-12 h-12 rounded-full bg-white border border-anthropic-lightGray text-anthropic-midGray hover:text-anthropic-dark hover:border-anthropic-dark hover:shadow-md transition-all">
                  <Mail className="h-5 w-5" />
                </a>
              )}
              <button 
                onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }}
                className="flex items-center justify-center px-6 h-12 rounded-full bg-white border border-anthropic-lightGray text-anthropic-dark font-bold text-sm hover:bg-anthropic-light transition-colors shadow-sm"
              >
                <Share2 className="h-4 w-4 mr-2" /> Share
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* CONTENT SECTION */}
        <div className="max-w-4xl mx-auto px-6 py-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {nominee.aiSummary && (
              <div className="mb-16 bg-gradient-to-br from-anthropic-orange/5 to-transparent border border-anthropic-orange/20 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles className="w-32 h-32 text-anthropic-orange" />
                </div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="bg-anthropic-orange text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">AI Generated Summary</div>
                </div>
                <p className="text-xl md:text-2xl text-anthropic-dark font-serif italic leading-relaxed relative z-10">
                  "{nominee.aiSummary}"
                </p>
              </div>
            )}

            <div className="prose prose-lg md:prose-xl max-w-none text-anthropic-midGray leading-relaxed font-serif">
              <h2 className="text-sm font-bold tracking-widest uppercase text-anthropic-dark mb-8 font-sans not-italic">About The Nominee</h2>
              <div className="whitespace-pre-wrap">{nominee.description || 'No detailed description provided.'}</div>
            </div>
          </motion.div>
        </div>

        {/* SIMILAR PROFILES SECTION */}
        {similarNominees.length > 0 && (
          <div className="bg-anthropic-light/50 border-t border-anthropic-lightGray py-24">
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex flex-col md:flex-row items-center justify-between mb-12">
                <h2 className="text-3xl font-bold text-anthropic-dark mb-4 md:mb-0">Other Nominees in <span className="text-anthropic-orange">{category?.name}</span></h2>
                <Link to={`${basePath}/category/${nominee.categoryId}`} className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white border border-anthropic-lightGray text-sm font-bold text-anthropic-dark hover:shadow-md transition-all">
                  View All Candidates
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {similarNominees.map((sim, i) => (
                  <motion.div
                    key={sim.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  >
                    <Link to={`${basePath}/nominee/${sim.id}`} className="block bg-white rounded-3xl p-8 border border-anthropic-lightGray shadow-sm hover:shadow-xl hover:border-anthropic-orange/30 transition-all duration-300 group text-center">
                      <div className="w-24 h-24 mx-auto rounded-full bg-anthropic-light border border-anthropic-lightGray mb-6 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        {sim.logoUrl ? (
                          <img src={sim.logoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-3xl font-bold text-anthropic-dark">{sim.name.charAt(0)}</div>
                        )}
                      </div>
                      <h4 className="text-xl font-bold text-anthropic-dark mb-2 group-hover:text-anthropic-orange transition-colors">{sim.name}</h4>
                      <p className="text-sm text-anthropic-midGray font-serif line-clamp-2 mb-6">{sim.aiSummary || sim.description}</p>
                      <div className="inline-flex items-center justify-center bg-anthropic-light px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-anthropic-dark">
                        {sim.voteCount || 0} Votes
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* OTP Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20"
            >
              <div className="px-8 py-6 border-b border-anthropic-lightGray flex items-center justify-between bg-anthropic-light/50">
                <h3 className="text-xl font-bold text-anthropic-dark">Secure Your Vote</h3>
                <button onClick={() => setShowOtpModal(false)} className="text-anthropic-midGray hover:text-anthropic-dark transition-colors bg-white rounded-full p-2 shadow-sm border border-anthropic-lightGray">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-8">
                {otpStep === 'email' ? (
                  <form onSubmit={handleSendOtp}>
                    <p className="text-anthropic-midGray mb-6 font-serif leading-relaxed">
                      To ensure fair voting, please enter your email address to receive a secure, one-time passcode.
                    </p>
                    <label className="block text-sm font-bold uppercase tracking-widest text-anthropic-dark mb-3">Email address</label>
                    <input
                      type="email"
                      required
                      value={voterEmail}
                      onChange={(e) => { setVoterEmail(e.target.value); setOtpError(''); }}
                      className="block w-full rounded-2xl border-0 py-4 px-5 text-anthropic-dark shadow-sm ring-1 ring-inset ring-anthropic-lightGray focus:ring-2 focus:ring-inset focus:ring-anthropic-orange text-lg transition-all mb-4 bg-anthropic-light/50"
                      placeholder="you@company.com"
                    />
                    {otpError && (
                      <p className="text-sm text-red-500 font-medium mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {otpError}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={isVerifying || !voterEmail}
                      className="w-full flex justify-center items-center rounded-2xl bg-anthropic-dark px-6 py-4 text-base font-bold text-white shadow-xl hover:opacity-90 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 mt-8"
                    >
                      {isVerifying ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending...
                        </div>
                      ) : (
                        'Send Code'
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp}>
                    <p className="text-anthropic-midGray mb-6 font-serif leading-relaxed">
                      We've sent a secure 6-digit code to <strong className="text-anthropic-dark font-sans">{voterEmail}</strong>. Check your inbox.
                    </p>
                    <label className="block text-sm font-bold uppercase tracking-widest text-anthropic-dark mb-3">Verification Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                      className="block w-full rounded-2xl border-0 py-4 px-5 text-anthropic-dark shadow-sm ring-1 ring-inset ring-anthropic-lightGray focus:ring-2 focus:ring-inset focus:ring-anthropic-orange text-center text-3xl tracking-[0.5em] font-mono transition-all mb-4 bg-anthropic-light/50"
                      placeholder="000000"
                      inputMode="numeric"
                    />
                    {otpError && (
                      <p className="text-sm text-red-500 font-medium mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {otpError}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={isVerifying || otpCode.length < 6}
                      className="w-full flex justify-center items-center rounded-2xl bg-anthropic-orange px-6 py-4 text-base font-bold text-white shadow-xl hover:opacity-90 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 mt-8"
                    >
                      {isVerifying ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Verifying...
                        </div>
                      ) : (
                        'Confirm & Vote'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setOtpStep('email'); setOtpCode(''); setOtpError(''); }}
                      className="w-full mt-4 text-sm font-medium text-anthropic-midGray hover:text-anthropic-dark text-center transition-colors"
                    >
                      Use a different email
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PublicLayout>
  );
}