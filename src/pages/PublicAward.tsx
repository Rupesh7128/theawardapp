import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { ArrowRight, Search } from 'lucide-react';

import PublicLayout from '../components/PublicLayout';

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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-anthropic-midGray font-serif">Loading...</div>;
  if (!award) return <div className="min-h-screen flex items-center justify-center text-xl text-anthropic-midGray font-serif">Award not found or not published.</div>;

  const filteredNominees = searchQuery 
    ? allNominees.filter(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()) || n.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const topNominees = [...allNominees].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0)).slice(0, 3);

  return (
    <PublicLayout award={award}>
      <div className="bg-white min-h-screen font-sans selection:bg-anthropic-dark selection:text-white">
        
        {/* HERO SECTION - Minimalist, Centered, Massive */}
        <div className="py-32 sm:py-48 px-6 lg:px-8 max-w-5xl mx-auto text-center">
          {award.logoUrl && (
            <img src={award.logoUrl} alt={award.name} className="h-20 w-auto mx-auto mb-12 object-contain mix-blend-multiply" />
          )}
          <h1 className="text-6xl sm:text-8xl font-bold text-anthropic-dark tracking-tight leading-none mb-8">
            {award.name}
          </h1>
          {award.description && (
            <p className="text-xl sm:text-2xl text-anthropic-midGray max-w-3xl mx-auto font-serif leading-relaxed">
              {award.description}
            </p>
          )}
          
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm font-medium tracking-wide uppercase text-anthropic-midGray">
            {award.nominationEndDate && (
              <div>
                <span className="block text-xs mb-1 opacity-50">Nominations Close</span>
                {format(new Date(award.nominationEndDate), 'MMMM d, yyyy')}
              </div>
            )}
            {(award.nominationEndDate && award.votingEndDate) && (
              <div className="w-1 h-1 rounded-full bg-anthropic-lightGray"></div>
            )}
            {award.votingEndDate && (
              <div>
                <span className="block text-xs mb-1 opacity-50">Voting Closes</span>
                {format(new Date(award.votingEndDate), 'MMMM d, yyyy')}
              </div>
            )}
          </div>
        </div>

        {/* SEARCH BAR - Ultra clean */}
        <div className="max-w-2xl mx-auto px-6 mb-24 relative z-20">
          <div className="border-b-2 border-anthropic-dark flex items-center pb-2 transition-colors focus-within:border-anthropic-orange">
            <Search className="h-5 w-5 text-anthropic-dark mr-4" />
            <input 
              type="text" 
              placeholder="Search for a nominee..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border-0 focus:ring-0 text-xl text-anthropic-dark placeholder:text-anthropic-lightGray bg-transparent p-0 outline-none"
            />
          </div>
          
          {searchQuery && (
            <div className="mt-2 bg-white border border-anthropic-lightGray absolute w-full left-0 right-0 z-30 max-h-96 overflow-y-auto shadow-xl">
              {filteredNominees.length > 0 ? (
                <ul className="divide-y divide-anthropic-lightGray">
                  {filteredNominees.map(nominee => {
                    const cat = categories.find(c => c.id === nominee.categoryId);
                    return (
                      <li key={nominee.id} className="hover:bg-anthropic-light transition-colors">
                        <Link to={`${basePath}/category/${nominee.categoryId}`} className="flex justify-between items-center p-6">
                          <div>
                            <h4 className="text-lg font-bold text-anthropic-dark">{nominee.name}</h4>
                            <p className="text-sm text-anthropic-midGray font-serif mt-1">{cat?.name}</p>
                          </div>
                          <div className="text-sm font-bold text-anthropic-dark">
                            {nominee.voteCount || 0} votes
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-8 text-center text-anthropic-midGray font-serif italic">No nominees found matching "{searchQuery}"</div>
              )}
            </div>
          )}
        </div>

        {/* LIVE PODIUM - Simple lines, large numbers, negative space */}
        {topNominees.length > 0 && !searchQuery && (
          <div className="max-w-5xl mx-auto px-6 lg:px-8 py-24 border-t border-anthropic-lightGray">
            <div className="mb-20 text-center">
              <h2 className="text-xs font-bold tracking-widest uppercase text-anthropic-midGray mb-2">Live Standings</h2>
              <p className="text-4xl font-bold text-anthropic-dark">Current Leaders</p>
            </div>
            
            <div className="flex flex-col md:flex-row items-end justify-center gap-12 md:gap-8 max-w-4xl mx-auto">
              {/* 2nd Place */}
              {topNominees[1] && (
                <div className="w-full md:w-1/3 flex flex-col items-center order-2 md:order-1 group">
                  <div className="text-center mb-6 transition-transform group-hover:-translate-y-2">
                    <h3 className="font-bold text-xl text-anthropic-dark mb-1">{topNominees[1].name}</h3>
                    <p className="text-sm font-serif text-anthropic-midGray">{topNominees[1].voteCount || 0} votes</p>
                  </div>
                  <div className="w-full border-t border-l border-r border-anthropic-dark h-32 flex items-start justify-center pt-6">
                    <span className="text-5xl font-light text-anthropic-midGray font-serif">2</span>
                  </div>
                </div>
              )}
              
              {/* 1st Place */}
              {topNominees[0] && (
                <div className="w-full md:w-1/3 flex flex-col items-center order-1 md:order-2 group z-10">
                  <div className="text-center mb-6 transition-transform group-hover:-translate-y-2">
                    <h3 className="font-bold text-3xl text-anthropic-dark mb-2">{topNominees[0].name}</h3>
                    <p className="text-sm font-bold tracking-widest uppercase text-anthropic-orange">{topNominees[0].voteCount || 0} votes</p>
                  </div>
                  <div className="w-full bg-anthropic-dark text-white border-t border-l border-r border-anthropic-dark h-48 flex items-start justify-center pt-8">
                    <span className="text-6xl font-light font-serif">1</span>
                  </div>
                </div>
              )}
              
              {/* 3rd Place */}
              {topNominees[2] && (
                <div className="w-full md:w-1/3 flex flex-col items-center order-3 md:order-3 group">
                  <div className="text-center mb-6 transition-transform group-hover:-translate-y-2">
                    <h3 className="font-bold text-xl text-anthropic-dark mb-1">{topNominees[2].name}</h3>
                    <p className="text-sm font-serif text-anthropic-midGray">{topNominees[2].voteCount || 0} votes</p>
                  </div>
                  <div className="w-full border-t border-l border-r border-anthropic-dark h-24 flex items-start justify-center pt-6">
                    <span className="text-5xl font-light text-anthropic-midGray font-serif">3</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CATEGORIES - Sleek, border-only cards */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 border-t border-anthropic-lightGray">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-xs font-bold tracking-widest uppercase text-anthropic-midGray mb-2">The Categories</h2>
              <p className="text-4xl font-bold text-anthropic-dark">Cast Your Vote</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`${basePath}/category/${category.id}`}
                className="group block border-t-2 border-anthropic-dark pt-6 hover:border-anthropic-orange transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-anthropic-dark group-hover:text-anthropic-orange transition-colors">
                    {category.name}
                  </h3>
                  <ArrowRight className="h-6 w-6 text-anthropic-midGray group-hover:text-anthropic-orange transition-colors transform group-hover:translate-x-1" />
                </div>
                <p className="text-anthropic-midGray font-serif leading-relaxed line-clamp-3">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
        
        {/* FOOTER */}
        <footer className="border-t border-anthropic-lightGray py-12 text-center text-sm font-serif text-anthropic-midGray">
          <p>© {new Date().getFullYear()} {award.name}. All rights reserved.</p>
        </footer>
      </div>
    </PublicLayout>
  );
}
