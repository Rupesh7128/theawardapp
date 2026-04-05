import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Trophy, Calendar, ArrowRight, Search, Medal } from 'lucide-react';
import { format } from 'date-fns';

import PublicLayout from '../components/PublicLayout';

export default function PublicAward() {
  const { id } = useParams<{ id: string }>();
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
      <div className="bg-white min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-[#FAFAFA] border-b border-[#EAEAEA] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            {award.logoUrl && (
              <img src={award.logoUrl} alt={award.name} className="mx-auto h-24 w-auto mb-8 rounded-lg border border-[#EAEAEA]" />
            )}
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6 text-[#111111]">{award.name}</h1>
            <p className="mt-6 text-lg leading-8 text-[#666666] max-w-2xl mx-auto">
              {award.description}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm">
              {award.nominationEndDate && (
                <div className="flex items-center gap-2 bg-white border border-[#EAEAEA] px-4 py-2 rounded-full text-[#111111]">
                  <Calendar className="h-4 w-4" />
                  <span>Nominations close: {format(new Date(award.nominationEndDate), 'MMM d, yyyy')}</span>
                </div>
              )}
              {award.votingEndDate && (
                <div className="flex items-center gap-2 bg-white border border-[#EAEAEA] px-4 py-2 rounded-full text-[#111111]">
                  <Trophy className="h-4 w-4" />
                  <span>Voting closes: {format(new Date(award.votingEndDate), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mx-auto max-w-3xl px-6 lg:px-8 -mt-8 relative z-10">
          <div className="bg-white rounded-2xl shadow-md border border-[#EAEAEA] p-2 flex items-center">
            <Search className="h-5 w-5 text-[#666666] ml-3" />
            <input 
              type="text" 
              placeholder="Search nominees across all categories..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border-0 focus:ring-0 text-[#111111] placeholder:text-[#666666] px-4 py-3"
            />
          </div>
          
          {searchQuery && (
            <div className="mt-4 bg-white rounded-2xl shadow-lg border border-[#EAEAEA] overflow-hidden absolute w-full left-0 right-0 z-20 max-h-96 overflow-y-auto">
              {filteredNominees.length > 0 ? (
                <ul className="divide-y divide-[#EAEAEA]">
                  {filteredNominees.map(nominee => {
                    const cat = categories.find(c => c.id === nominee.categoryId);
                    return (
                      <li key={nominee.id} className="p-4 hover:bg-[#FAFAFA] transition-colors">
                        <Link to={`/award/${id}/category/${nominee.categoryId}`} className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-[#111111]">{nominee.name}</h4>
                            <p className="text-sm text-[#666666]">{cat?.name}</p>
                          </div>
                          <div className="text-sm font-medium text-[#111111] bg-[#EAEAEA] px-2 py-1 rounded-md">
                            {nominee.voteCount || 0} votes
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-8 text-center text-[#666666]">No nominees found matching "{searchQuery}"</div>
              )}
            </div>
          )}
        </div>

        {/* Live Podium */}
        {topNominees.length > 0 && !searchQuery && (
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-[#111111] flex items-center justify-center gap-3">
                <Medal className="h-8 w-8" /> Live Podium
              </h2>
              <p className="mt-4 text-lg leading-8 text-[#666666]">Top voted nominees across all categories.</p>
            </div>
            
            <div className="flex flex-col md:flex-row items-end justify-center gap-6 max-w-4xl mx-auto h-80">
              {/* 2nd Place */}
              {topNominees[1] && (
                <div className="w-full md:w-1/3 flex flex-col items-center order-2 md:order-1">
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-lg text-[#111111]">{topNominees[1].name}</h3>
                    <p className="text-sm text-[#666666]">{topNominees[1].voteCount || 0} votes</p>
                  </div>
                  <div className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-t-xl h-40 flex items-start justify-center pt-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#EAEAEA]/50 to-transparent"></div>
                    <span className="text-4xl font-bold text-[#666666] relative z-10">2</span>
                  </div>
                </div>
              )}
              
              {/* 1st Place */}
              {topNominees[0] && (
                <div className="w-full md:w-1/3 flex flex-col items-center order-1 md:order-2 z-10">
                  <div className="text-center mb-4">
                    <Trophy className="h-8 w-8 text-[#111111] mx-auto mb-2" />
                    <h3 className="font-bold text-xl text-[#111111]">{topNominees[0].name}</h3>
                    <p className="text-sm font-semibold text-[#111111]">{topNominees[0].voteCount || 0} votes</p>
                  </div>
                  <div className="w-full bg-[#111111] rounded-t-xl h-56 flex items-start justify-center pt-4 shadow-xl">
                    <span className="text-5xl font-bold text-white">1</span>
                  </div>
                </div>
              )}
              
              {/* 3rd Place */}
              {topNominees[2] && (
                <div className="w-full md:w-1/3 flex flex-col items-center order-3 md:order-3">
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-lg text-[#111111]">{topNominees[2].name}</h3>
                    <p className="text-sm text-[#666666]">{topNominees[2].voteCount || 0} votes</p>
                  </div>
                  <div className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-t-xl h-32 flex items-start justify-center pt-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#EAEAEA]/30 to-transparent"></div>
                    <span className="text-4xl font-bold text-[#666666] relative z-10">3</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categories Section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-24">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl">Award Categories</h2>
            <p className="mt-4 text-lg leading-8 text-[#666666]">Select a category to view nominees, vote, or submit a new nomination.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/award/${id}/category/${category.id}`}
                className="group relative flex flex-col justify-between rounded-2xl bg-white p-8 shadow-sm ring-1 ring-[#EAEAEA] hover:shadow-md hover:ring-[#111111] transition-all"
              >
                <div>
                  <h3 className="text-xl font-semibold leading-7 text-[#111111] group-hover:text-black transition-colors">
                    {category.name}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-[#666666] line-clamp-3">
                    {category.description}
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-x-2 text-sm font-medium text-[#111111]">
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
