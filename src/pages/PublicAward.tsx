import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Trophy, Calendar, ArrowRight, Search, Medal, Share2 } from 'lucide-react';
import { format } from 'date-fns';

import PublicLayout from '../components/PublicLayout';
import AlgorithmicBackground from '../components/AlgorithmicBackground';

export default function PublicAward({ customAwardId }: { customAwardId?: string }) {
  const { id: paramId } = useParams<{ id: string }>();
  const id = customAwardId || paramId;
    const basePath = customAwardId ? '' : `/award/${id}`;
  const [award, setAward] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [allNominees, setAllNominees] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const awardRef = doc(db, 'awards', id);
        const awardSnap = await getDoc(awardRef);
        
        if (!awardSnap.exists() || awardSnap.data().status !== 'published') {
          setLoading(false);
          return;
        }
        
        setAward({ id: awardSnap.id, ...awardSnap.data() });

        const catQ = query(collection(db, 'categories'), where('awardId', '==', id));
        const catSnap = await getDocs(catQ);
        setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const nomQ = query(collection(db, 'nominees'), where('awardId', '==', id), where('status', '==', 'approved'));
        const nomSnap = await getDocs(nomQ);
        setAllNominees(nomSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      } catch (error) {
        console.error("Error fetching award:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#666666]">Loading...</div>;
  if (!award) return <div className="min-h-screen flex items-center justify-center text-xl text-[#666666]">Award not found or not published.</div>;

  const filteredNominees = searchQuery 
    ? allNominees.filter(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()) || n.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const topNominees = [...allNominees].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0)).slice(0, 3);

  return (
    <PublicLayout award={award}>
      <div className="bg-anthropic-light min-h-screen font-serif">
        {/* Hero Section */}
        <div className="relative bg-anthropic-dark border-b border-anthropic-dark py-16 sm:py-24 overflow-hidden font-sans">
          <AlgorithmicBackground seed={award.id} />
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {award.logoUrl && (
                <img src={award.logoUrl} alt={award.name} className="h-16 w-auto rounded-xl border border-white/10 flex-shrink-0 bg-white" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-anthropic-orange" />
                  <span className="text-xs font-semibold text-anthropic-midGray uppercase tracking-widest">Award Campaign</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight font-sans">{award.name}</h1>
                {award.description && (
                  <p className="mt-3 text-anthropic-lightGray max-w-2xl leading-relaxed font-serif">{award.description}</p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-sans">
                  {award.nominationEndDate && (
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-anthropic-lightGray">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Nominations close {format(new Date(award.nominationEndDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  {award.votingEndDate && (
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-anthropic-lightGray">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Voting closes {format(new Date(award.votingEndDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
                {/* Share buttons */}
                <div className="mt-5 flex flex-wrap items-center gap-2 font-sans">
                  <span className="text-xs text-anthropic-midGray flex items-center gap-1.5 mr-1">
                    <Share2 className="h-3.5 w-3.5" /> Share:
                  </span>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Vote now for ${award.name}! `)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-anthropic-lightGray text-xs font-medium transition-colors"
                  >
                    X (Twitter)
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-anthropic-lightGray text-xs font-medium transition-colors"
                  >
                    LinkedIn
                  </a>
                  <button
                    onClick={() => { navigator.clipboard.writeText(window.location.href); }}
                    className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-anthropic-lightGray text-xs font-medium transition-colors"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mx-auto max-w-3xl px-6 lg:px-8 -mt-8 relative z-20 font-sans">
          <div className="bg-white rounded-2xl shadow-md border border-anthropic-lightGray p-2 flex items-center">
            <Search className="h-5 w-5 text-anthropic-midGray ml-3" />
            <input 
              type="text" 
              placeholder="Search nominees across all categories..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border-0 focus:ring-0 text-anthropic-dark placeholder:text-anthropic-midGray px-4 py-3 bg-transparent"
            />
          </div>
          
          {searchQuery && (
            <div className="mt-4 bg-white rounded-2xl shadow-lg border border-anthropic-lightGray overflow-hidden absolute w-full left-0 right-0 z-30 max-h-96 overflow-y-auto">
              {filteredNominees.length > 0 ? (
                <ul className="divide-y divide-anthropic-lightGray">
                  {filteredNominees.map(nominee => {
                    const cat = categories.find(c => c.id === nominee.categoryId);
                    return (
                      <li key={nominee.id} className="p-4 hover:bg-anthropic-light transition-colors">
                        <Link to={`${basePath}/category/${nominee.categoryId}`} className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-anthropic-dark">{nominee.name}</h4>
                            <p className="text-sm text-anthropic-midGray">{cat?.name}</p>
                          </div>
                          <div className="text-sm font-medium text-anthropic-dark bg-anthropic-lightGray px-2 py-1 rounded-md">
                            {nominee.voteCount || 0} votes
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-8 text-center text-anthropic-midGray">No nominees found matching "{searchQuery}"</div>
              )}
            </div>
          )}
        </div>

        {/* Live Podium */}
        {topNominees.length > 0 && !searchQuery && (
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 font-sans">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-anthropic-dark flex items-center justify-center gap-2">
                <Medal className="h-6 w-6 text-anthropic-orange" /> Live Podium
              </h2>
              <p className="text-anthropic-midGray mt-2 font-serif">Top voted nominees across all categories</p>
            </div>
            
            <div className="flex flex-col md:flex-row items-end justify-center gap-6 max-w-4xl mx-auto h-80">
              {/* 2nd Place */}
              {topNominees[1] && (
                <div className="w-full md:w-1/3 flex flex-col items-center order-2 md:order-1">
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-lg text-anthropic-dark">{topNominees[1].name}</h3>
                    <p className="text-sm text-anthropic-midGray font-medium">{topNominees[1].voteCount || 0} votes</p>
                  </div>
                  <div className="w-full bg-white border border-anthropic-lightGray rounded-t-2xl h-40 flex items-start justify-center pt-6 relative overflow-hidden shadow-sm">
                    <div className="absolute inset-0 bg-gradient-to-b from-anthropic-lightGray/20 to-transparent"></div>
                    <span className="text-4xl font-bold text-anthropic-midGray relative z-10">2</span>
                  </div>
                </div>
              )}
              
              {/* 1st Place */}
              {topNominees[0] && (
                <div className="w-full md:w-1/3 flex flex-col items-center order-1 md:order-2 z-10">
                  <div className="text-center mb-4">
                    <Trophy className="h-8 w-8 text-anthropic-orange mx-auto mb-2" />
                    <h3 className="font-bold text-2xl text-anthropic-dark">{topNominees[0].name}</h3>
                    <p className="text-sm font-bold text-anthropic-dark bg-anthropic-orange/10 text-anthropic-orange px-3 py-1 rounded-full inline-block mt-2">{topNominees[0].voteCount || 0} votes</p>
                  </div>
                  <div className="w-full bg-anthropic-dark border-2 border-anthropic-dark rounded-t-2xl h-56 flex items-start justify-center pt-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                    <span className="text-5xl font-bold text-white relative z-10">1</span>
                  </div>
                </div>
              )}
              
              {/* 3rd Place */}
              {topNominees[2] && (
                <div className="w-full md:w-1/3 flex flex-col items-center order-3 md:order-3">
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-lg text-anthropic-dark">{topNominees[2].name}</h3>
                    <p className="text-sm text-anthropic-midGray font-medium">{topNominees[2].voteCount || 0} votes</p>
                  </div>
                  <div className="w-full bg-white border border-anthropic-lightGray rounded-t-2xl h-32 flex items-start justify-center pt-6 relative overflow-hidden shadow-sm">
                    <div className="absolute inset-0 bg-gradient-to-b from-anthropic-lightGray/10 to-transparent"></div>
                    <span className="text-4xl font-bold text-anthropic-midGray relative z-10">3</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categories Section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-24 font-sans">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-anthropic-dark">Categories</h2>
            <p className="mt-2 text-anthropic-midGray font-serif">Select a category to view nominees and vote.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`${basePath}/category/${category.id}`}
                className="group relative flex flex-col justify-between rounded-2xl bg-white p-8 shadow-sm border border-anthropic-lightGray hover:shadow-md hover:border-anthropic-dark transition-all"
              >
                <div>
                  <h3 className="text-xl font-bold leading-7 text-anthropic-dark group-hover:text-black transition-colors">
                    {category.name}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-anthropic-midGray line-clamp-3 font-serif">
                    {category.description}
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-x-2 text-sm font-bold text-anthropic-dark group-hover:text-anthropic-orange transition-colors">
                  View Nominees & Vote <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
