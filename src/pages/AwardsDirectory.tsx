import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Trophy, Search, Calendar, Users, ArrowRight, Globe } from 'lucide-react';
import { format } from 'date-fns';
import BrandMark from '../components/BrandMark';

export default function AwardsDirectory() {
  const [awards, setAwards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const q = query(
          collection(db, 'awards'),
          where('status', '==', 'published'),
          where('isPublicDirectory', '==', true)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort by createdAt descending (most recent first)
        data.sort((a: any, b: any) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
        setAwards(data);
      } catch (err) {
        console.error('Error fetching directory awards:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAwards();
  }, []);

  const filtered = searchQuery
    ? awards.filter(
        a =>
          a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : awards;

  function getPhase(award: any): { label: string; color: string } {
    const now = new Date();
    const nomEnd = award.nominationEndDate ? new Date(award.nominationEndDate) : null;
    const voteStart = award.votingStartDate ? new Date(award.votingStartDate) : null;
    const voteEnd = award.votingEndDate ? new Date(award.votingEndDate) : null;

    if (voteEnd && now > voteEnd) return { label: 'Closed', color: '#999' };
    if (voteStart && now >= voteStart) return { label: 'Voting Live', color: '#16a34a' };
    if (nomEnd && now < nomEnd) return { label: 'Nominations Open', color: '#C8860A' };
    return { label: 'Coming Soon', color: '#666' };
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#EAEAEA] py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <Link to="/" className="flex-shrink-0">
            <BrandMark />
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-[#666666]">
            <Link to="/directory" className="text-[#111111] font-semibold">Directory</Link>
            <Link to="/" className="hover:text-[#111111] transition-colors">Home</Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#111111] px-4 py-2 text-sm font-semibold text-white hover:bg-black transition-colors"
            >
              Launch Your Award
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-[#111111] border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4" style={{ color: '#C8860A' }} />
            <span className="text-xs font-semibold text-[#666] uppercase tracking-widest">Award Directory</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Live Award Campaigns
          </h1>
          <p className="text-[#888] max-w-xl text-lg leading-relaxed mb-8">
            Discover active award campaigns across every industry. Vote for your favorites and support the best in each field.
          </p>

          {/* Search */}
          <div className="max-w-2xl">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-1.5 flex items-center gap-3">
              <Search className="h-5 w-5 text-[#888] ml-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search awards by name or description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-0 focus:ring-0 text-white placeholder:text-[#666] py-2.5 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 lg:px-8 py-12 w-full">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-[#666666]">
            Loading awards...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center mb-5">
              <Trophy className="h-7 w-7 text-[#CCCCCC]" />
            </div>
            <h3 className="text-lg font-semibold text-[#111111] mb-2">
              {searchQuery ? 'No awards match your search' : 'No awards in the directory yet'}
            </h3>
            <p className="text-sm text-[#666666] max-w-sm mb-6">
              {searchQuery
                ? 'Try a different search term.'
                : 'Be the first to list your award campaign in our public directory.'}
            </p>
            {!searchQuery && (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-6 py-3 text-sm font-semibold text-white hover:bg-black transition-colors"
              >
                Launch Your Award <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-[#666666]">
                {filtered.length} award{filtered.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(award => {
                const phase = getPhase(award);
                return (
                  <Link
                    key={award.id}
                    to={`/award/${award.id}`}
                    className="group flex flex-col bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden hover:border-[#111111] hover:shadow-md transition-all"
                  >
                    {/* Card header */}
                    <div className="bg-[#111111] px-6 py-5 flex items-start gap-4">
                      {award.logoUrl ? (
                        <img
                          src={award.logoUrl}
                          alt={award.name}
                          className="h-10 w-10 rounded-lg object-contain border border-white/10 flex-shrink-0 bg-white/5"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                          <Trophy className="h-5 w-5 text-white/50" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-base leading-tight truncate group-hover:text-white transition-colors">
                          {award.name}
                        </h3>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: phase.color }}
                          />
                          <span className="text-xs font-medium" style={{ color: phase.color }}>
                            {phase.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="flex-1 p-6">
                      {award.description && (
                        <p className="text-sm text-[#666666] leading-relaxed line-clamp-3 mb-4">
                          {award.description}
                        </p>
                      )}

                      <div className="space-y-2">
                        {award.nominationEndDate && (
                          <div className="flex items-center gap-2 text-xs text-[#999]">
                            <Users className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>Nominations close {format(new Date(award.nominationEndDate), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                        {award.votingEndDate && (
                          <div className="flex items-center gap-2 text-xs text-[#999]">
                            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>Voting closes {format(new Date(award.votingEndDate), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                        {award.landingPageUrl && (
                          <div className="flex items-center gap-2 text-xs text-[#999]">
                            <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{award.landingPageUrl.replace(/^https?:\/\//, '')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card footer */}
                    <div className="px-6 pb-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#111111] group-hover:gap-3 transition-all">
                        View Award <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Footer CTA */}
      <div className="border-t border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-[#111111] text-lg">Want to list your award here?</h3>
            <p className="text-sm text-[#666666] mt-1">Launch your campaign and opt in to the public directory.</p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-6 py-3 text-sm font-semibold text-white hover:bg-black transition-colors whitespace-nowrap flex-shrink-0"
          >
            Start for Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
