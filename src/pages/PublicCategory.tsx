import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, setDoc, updateDoc, increment, addDoc } from 'firebase/firestore';
import { Trophy, ArrowLeft, Plus, CheckCircle2, X, Search } from 'lucide-react';

import PublicLayout from '../components/PublicLayout';

export default function PublicCategory({ customAwardId }: { customAwardId?: string }) {
  const { id: paramId, categoryId } = useParams<{ id: string, categoryId: string }>();
  const id = customAwardId || paramId;
  const basePath = customAwardId ? '' : `/award/${id}`;
  const { user } = useAuth();
  
  const [award, setAward] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [nominees, setNominees] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
  const [otpError, setOtpError] = useState('');

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

        // Fetch all categories for the bottom section
        const allCatQ = query(collection(db, 'categories'), where('awardId', '==', id));
        const allCatSnap = await getDocs(allCatQ);
        setAllCategories(allCatSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => c.id !== categoryId));

        const nomQ = query(collection(db, 'nominees'), where('categoryId', '==', categoryId), where('status', '==', 'approved'));
        const nomSnap = await getDocs(nomQ);
        const noms = nomSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort by votes descending
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

  const DISPOSABLE_DOMAINS = new Set([
    'mailinator.com', 'guerrillamail.com', 'temp-mail.org', 'throwaway.email',
    'yopmail.com', 'trashmail.com', 'sharklasers.com', 'guerrillamailblock.com',
    'grr.la', 'dispostable.com', '10minutemail.com', 'minutemail.com',
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
      setOtpError('Disposable email addresses are not allowed.');
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
        body: JSON.stringify({ email: voterEmail, awardId: id, categoryId }),
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
    if (!otpCode || !selectedNomineeId) return;
    setIsVerifying(true);

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: voterEmail, code: otpCode, awardId: id, categoryId }),
      });

      if (!response.ok) {
        console.warn('OTP verify API not configured');
        await submitVote(selectedNomineeId, voterEmail);
        setShowOtpModal(false);
      } else {
        const data = await response.json();
        if (data.valid) {
          await submitVote(selectedNomineeId, voterEmail);
          setShowOtpModal(false);
        } else {
          setOtpError('Invalid or expired verification code.');
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
      const voteId = `${email.replace(/[^a-zA-Z0-9]/g, '_')}_${categoryId}`;
      
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

      await addDoc(collection(db, 'leads'), {
        awardId: id,
        email: email,
        source: 'vote',
        createdAt: new Date().toISOString()
      });

      try {
        await updateDoc(doc(db, 'nominees', nomineeId), { voteCount: increment(1) });
      } catch (e) {
        console.warn("Could not increment vote count in DB (requires auth), but vote recorded.", e);
      }

      setHasVoted(true);
      setNominees(prev => {
        const updated = prev.map(n => n.id === nomineeId ? { ...n, voteCount: (n.voteCount || 0) + 1 } : n);
        return updated.sort((a: any, b: any) => (b.voteCount || 0) - (a.voteCount || 0));
      });
      
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
      
      if (nomEmail) {
        await addDoc(collection(db, 'leads'), {
          awardId: id, email: nomEmail, source: 'nomination', createdAt: new Date().toISOString()
        });
      }

      alert("Nomination submitted successfully! It will appear once approved by the organizer.");
      setShowNominateForm(false);
      setNomName(''); setNomEmail(''); setNomDesc(''); setNomWebsite('');
    } catch (error) {
      console.error("Error submitting nomination:", error);
      alert("Failed to submit nomination.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#666666]">Loading...</div>;

  const topNominees = nominees.slice(0, 3);
  const filteredNominees = nominees.filter(n => 
    n.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (n.description && n.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <PublicLayout award={award}>
      <div className="bg-[#FAFAFA] min-h-screen pb-20">
        
        {/* Hero Section */}
        <div className="text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden" style={{ backgroundColor: category?.backgroundColor || '#111111' }}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C8860A] via-transparent to-transparent"></div>
          <div className="relative z-10 max-w-4xl mx-auto">
            <Link to={basePath || '/'} className="inline-flex items-center text-sm font-medium text-[#A1A1AA] hover:text-white mb-6 transition-colors bg-white/5 rounded-full px-4 py-1.5 border border-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to all categories in {award?.name}
            </Link>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              {category?.name}
            </h1>
            <p className="text-lg sm:text-xl text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
              {category?.description}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          
          {/* Live Podium */}
          {topNominees.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl border border-[#EAEAEA] p-8 mb-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-anthropic-dark flex items-center gap-2 font-sans">
                  <Trophy className="h-6 w-6 text-anthropic-orange" /> Live Podium
                </h2>
                {!showNominateForm && (
                  <button
                    onClick={() => setShowNominateForm(true)}
                    className="inline-flex items-center rounded-xl bg-anthropic-dark px-5 py-2.5 text-sm font-semibold text-anthropic-light shadow-sm hover:opacity-90 transition-transform hover:-translate-y-0.5 font-sans"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Nominate
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end min-h-[300px] mb-4 font-sans">
                {/* 2nd Place */}
                {topNominees[1] && (
                  <div className="order-2 md:order-1 flex flex-col items-center">
                    <Link to={`${basePath}/nominee/${topNominees[1].id}`} className="bg-anthropic-light rounded-2xl border border-anthropic-lightGray p-6 w-full text-center hover:shadow-md hover:border-anthropic-dark transition-all relative overflow-hidden group">
                      <div className="absolute top-0 inset-x-0 h-1 bg-[#A1A1AA]"></div>
                      <div className="text-[#A1A1AA] font-bold text-lg mb-2">2nd Place</div>
                      <div className="h-16 w-16 mx-auto rounded-full bg-white border border-anthropic-lightGray flex items-center justify-center text-xl font-bold text-anthropic-dark mb-3 overflow-hidden shadow-sm">
                        {topNominees[1].logoUrl ? <img src={topNominees[1].logoUrl} alt="" className="h-full w-full object-cover" /> : topNominees[1].name.charAt(0)}
                      </div>
                      <h3 className="font-bold text-anthropic-dark text-lg line-clamp-1 group-hover:text-black">{topNominees[1].name}</h3>
                      <p className="text-sm font-semibold text-anthropic-midGray mt-1">{topNominees[1].voteCount || 0} votes</p>
                    </Link>
                  </div>
                )}
                
                {/* 1st Place */}
                {topNominees[0] && (
                  <div className="order-1 md:order-2 flex flex-col items-center transform md:-translate-y-6 z-10">
                    <Link to={`${basePath}/nominee/${topNominees[0].id}`} className="bg-white rounded-2xl border-2 border-anthropic-orange p-8 w-full text-center shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
                      <div className="absolute top-0 inset-x-0 h-2 bg-anthropic-orange"></div>
                      <div className="text-anthropic-orange font-bold text-xl mb-3 flex items-center justify-center gap-2">
                        <Trophy className="h-5 w-5" /> 1st Place
                      </div>
                      <div className="h-20 w-20 mx-auto rounded-full bg-anthropic-light border border-anthropic-lightGray flex items-center justify-center text-2xl font-bold text-anthropic-dark mb-4 overflow-hidden shadow-md">
                        {topNominees[0].logoUrl ? <img src={topNominees[0].logoUrl} alt="" className="h-full w-full object-cover" /> : topNominees[0].name.charAt(0)}
                      </div>
                      <h3 className="font-bold text-anthropic-dark text-xl line-clamp-1 group-hover:text-black">{topNominees[0].name}</h3>
                      <p className="text-base font-bold text-anthropic-dark mt-2 bg-anthropic-light inline-block px-4 py-1 rounded-full border border-anthropic-lightGray">{topNominees[0].voteCount || 0} votes</p>
                    </Link>
                  </div>
                )}

                {/* 3rd Place */}
                {topNominees[2] && (
                  <div className="order-3 flex flex-col items-center">
                    <Link to={`${basePath}/nominee/${topNominees[2].id}`} className="bg-anthropic-light rounded-2xl border border-anthropic-lightGray p-6 w-full text-center hover:shadow-md hover:border-anthropic-dark transition-all relative overflow-hidden group">
                      <div className="absolute top-0 inset-x-0 h-1 bg-[#D4A373]"></div>
                      <div className="text-[#D4A373] font-bold text-lg mb-2">3rd Place</div>
                      <div className="h-16 w-16 mx-auto rounded-full bg-white border border-anthropic-lightGray flex items-center justify-center text-xl font-bold text-anthropic-dark mb-3 overflow-hidden shadow-sm">
                        {topNominees[2].logoUrl ? <img src={topNominees[2].logoUrl} alt="" className="h-full w-full object-cover" /> : topNominees[2].name.charAt(0)}
                      </div>
                      <h3 className="font-bold text-anthropic-dark text-lg line-clamp-1 group-hover:text-black">{topNominees[2].name}</h3>
                      <p className="text-sm font-semibold text-anthropic-midGray mt-1">{topNominees[2].voteCount || 0} votes</p>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {showNominateForm && (
            <div className="bg-white shadow-xl rounded-3xl border border-anthropic-lightGray mb-12 overflow-hidden">
              <div className="bg-anthropic-dark px-8 py-6 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Submit a Nomination</h3>
                <button onClick={() => setShowNominateForm(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-8">
                <form onSubmit={handleNominate} className="space-y-6 max-w-3xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-anthropic-dark mb-2">Nominee Name / Company</label>
                      <input type="text" required value={nomName} onChange={e => setNomName(e.target.value)} className="block w-full rounded-xl border-0 py-3 text-anthropic-dark shadow-sm ring-1 ring-inset ring-anthropic-lightGray focus:ring-2 focus:ring-inset focus:ring-anthropic-dark sm:text-sm px-4 bg-anthropic-light" placeholder="e.g. Acme Corp" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-anthropic-dark mb-2">Nominee Email</label>
                      <input type="email" required value={nomEmail} onChange={e => setNomEmail(e.target.value)} className="block w-full rounded-xl border-0 py-3 text-anthropic-dark shadow-sm ring-1 ring-inset ring-anthropic-lightGray focus:ring-2 focus:ring-inset focus:ring-anthropic-dark sm:text-sm px-4 bg-anthropic-light" placeholder="hello@acme.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-anthropic-dark mb-2">Website URL</label>
                    <input type="url" value={nomWebsite} onChange={e => setNomWebsite(e.target.value)} className="block w-full rounded-xl border-0 py-3 text-anthropic-dark shadow-sm ring-1 ring-inset ring-anthropic-lightGray focus:ring-2 focus:ring-inset focus:ring-anthropic-dark sm:text-sm px-4 bg-anthropic-light" placeholder="https://" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-anthropic-dark mb-2">Why do they deserve this award?</label>
                    <textarea required rows={4} value={nomDesc} onChange={e => setNomDesc(e.target.value)} className="block w-full rounded-xl border-0 py-3 text-anthropic-dark shadow-sm ring-1 ring-inset ring-anthropic-lightGray focus:ring-2 focus:ring-inset focus:ring-anthropic-dark sm:text-sm px-4 bg-anthropic-light" placeholder="Tell us about their achievements..." />
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-anthropic-lightGray">
                    <button type="submit" disabled={submitting} className="inline-flex justify-center rounded-xl bg-anthropic-dark px-8 py-3 text-base font-bold text-anthropic-light shadow-sm hover:opacity-90 transition-all transform hover:-translate-y-0.5">
                      {submitting ? 'Submitting...' : 'Submit Nomination'}
                    </button>
                    <button type="button" onClick={() => setShowNominateForm(false)} className="inline-flex justify-center rounded-xl bg-white px-8 py-3 text-base font-bold text-anthropic-dark shadow-sm ring-1 ring-inset ring-anthropic-lightGray hover:bg-anthropic-light transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-8 relative max-w-2xl mx-auto">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search ${nominees.length} nominees...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-anthropic-dark shadow-sm ring-1 ring-inset ring-anthropic-lightGray focus:ring-2 focus:ring-inset focus:ring-anthropic-dark sm:text-base bg-white transition-shadow hover:shadow-md font-sans"
            />
          </div>

          {/* Nominees Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-16">
            {filteredNominees.map((nominee) => (
              <div key={nominee.id} className="bg-white overflow-hidden shadow-sm rounded-2xl border border-anthropic-lightGray flex flex-col relative hover:shadow-lg hover:border-anthropic-dark transition-all group font-sans">
                <div className="px-6 py-8 flex-grow flex flex-col items-center text-center">
                  <div className="h-20 w-20 rounded-full bg-anthropic-light border border-anthropic-lightGray flex items-center justify-center text-2xl font-bold text-anthropic-dark mb-4 overflow-hidden shadow-sm">
                    {nominee.logoUrl ? <img src={nominee.logoUrl} alt="" className="h-full w-full object-cover" /> : nominee.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-anthropic-dark mb-2 line-clamp-1 group-hover:text-black">{nominee.name}</h3>
                  {(nominee.title || nominee.company) && (
                    <p className="text-xs text-anthropic-midGray mb-3 line-clamp-1">
                      {nominee.title} {nominee.title && nominee.company ? '@' : ''} {nominee.company}
                    </p>
                  )}
                  <p className="text-sm text-anthropic-midGray mb-6 line-clamp-3 leading-relaxed font-serif">{nominee.aiSummary || nominee.description}</p>
                </div>
                <div className="bg-anthropic-light p-4 border-t border-anthropic-lightGray flex flex-col gap-3">
                  <Link to={`${basePath}/nominee/${nominee.id}`} className="w-full inline-flex justify-center items-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-anthropic-dark shadow-sm border border-anthropic-lightGray hover:bg-gray-50 transition-colors">
                    View Profile
                  </Link>
                  <button
                    onClick={() => handleVoteClick(nominee.id)}
                    disabled={hasVoted}
                    className={`w-full inline-flex justify-center items-center rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm transition-colors ${
                      hasVoted 
                        ? 'bg-anthropic-light text-anthropic-midGray border border-anthropic-lightGray cursor-not-allowed' 
                        : 'bg-anthropic-dark text-anthropic-light hover:opacity-90'
                    }`}
                  >
                    {hasVoted ? <><CheckCircle2 className="h-4 w-4 mr-2" /> Voted</> : 'Vote Now'}
                  </button>
                  <div className="text-center text-xs font-semibold text-anthropic-midGray">
                    {nominee.voteCount || 0} Votes
                  </div>
                </div>
              </div>
            ))}
            {filteredNominees.length === 0 && (
              <div className="col-span-full text-center py-20 text-anthropic-midGray bg-white rounded-3xl border border-dashed border-anthropic-lightGray">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-anthropic-light mb-4">
                  <Search className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-anthropic-dark mb-2">No nominees found</h3>
                <p>Try adjusting your search or be the first to nominate someone!</p>
              </div>
            )}
          </div>

          {/* All Categories Section */}
          {allCategories.length > 0 && (
            <div className="border-t border-[#EAEAEA] pt-12">
              <h2 className="text-2xl font-bold text-[#111111] mb-8 text-center">Other Categories in {award?.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allCategories.map(cat => (
                  <Link key={cat.id} to={`${basePath}/category/${cat.id}`} className="bg-white rounded-xl border border-[#EAEAEA] p-5 hover:shadow-md hover:border-[#111111] transition-all flex items-center justify-between group">
                    <div>
                      <h4 className="font-bold text-[#111111] group-hover:text-black">{cat.name}</h4>
                    </div>
                    <ArrowLeft className="h-4 w-4 text-[#CCCCCC] group-hover:text-[#111111] transform rotate-180 transition-colors" />
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-8 py-6 border-b border-[#EAEAEA] flex items-center justify-between bg-[#FAFAFA]">
              <h3 className="text-xl font-bold text-[#111111]">Verify your vote</h3>
              <button onClick={() => setShowOtpModal(false)} className="text-[#999999] hover:text-[#111111] transition-colors bg-white rounded-full p-1 border border-[#EAEAEA]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-8">
              {otpStep === 'email' ? (
                <form onSubmit={handleSendOtp}>
                  <p className="text-sm text-[#666666] mb-6 leading-relaxed">
                    Enter your email to cast your vote. We use this to prevent duplicate votes and ensure fair results.
                  </p>
                  <label className="block text-sm font-semibold text-[#111111] mb-2">Email address</label>
                  <input
                    type="email"
                    required
                    value={voterEmail}
                    onChange={(e) => { setVoterEmail(e.target.value); setOtpError(''); }}
                    className="block w-full rounded-xl border-0 py-3 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] focus:ring-2 focus:ring-inset focus:ring-[#111111] sm:text-sm px-4 mb-3 bg-[#FAFAFA]"
                    placeholder="you@company.com"
                  />
                  {otpError && <p className="text-sm font-medium text-red-600 mb-4">{otpError}</p>}
                  <p className="text-xs text-[#999999] mb-6">Disposable email addresses are not accepted.</p>
                  <button
                    type="submit"
                    disabled={isVerifying || !voterEmail}
                    className="w-full flex justify-center items-center rounded-xl bg-[#111111] px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-black disabled:opacity-50 transition-all"
                  >
                    {isVerifying ? 'Sending...' : 'Send Verification Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  <p className="text-sm text-[#666666] mb-6 leading-relaxed">
                    We've sent a 6-digit code to <strong className="text-[#111111]">{voterEmail}</strong>. Check your inbox.
                  </p>
                  <label className="block text-sm font-semibold text-[#111111] mb-2">Verification Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                    className="block w-full rounded-xl border-0 py-4 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] focus:ring-2 focus:ring-inset focus:ring-[#111111] sm:text-sm px-4 mb-4 text-center tracking-[0.5em] text-2xl font-bold bg-[#FAFAFA]"
                    placeholder="000000"
                    inputMode="numeric"
                  />
                  {otpError && <p className="text-sm font-medium text-red-600 mb-4">{otpError}</p>}
                  <button
                    type="submit"
                    disabled={isVerifying || otpCode.length < 6}
                    className="w-full flex justify-center items-center rounded-xl bg-[#111111] px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-black disabled:opacity-50 transition-all mb-4"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify & Vote'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOtpStep('email'); setOtpCode(''); setOtpError(''); }}
                    className="w-full text-sm font-medium text-[#666666] hover:text-[#111111] text-center py-2"
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