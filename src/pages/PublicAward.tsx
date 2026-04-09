import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { ArrowRight, Search, Trophy, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import PublicLayout from '../components/PublicLayout';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 80, damping: 15 }
  }
};

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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-anthropic-midGray font-serif bg-white">Loading...</div>;
  if (!award) return <div className="min-h-screen flex items-center justify-center text-xl text-anthropic-midGray font-serif bg-white">Award not found or not published.</div>;

  const filteredNominees = searchQuery 
    ? allNominees.filter(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()) || n.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const topNominees = [...allNominees].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0)).slice(0, 3);

  return (
    <PublicLayout award={award}>
      <div className="bg-white min-h-screen font-sans selection:bg-anthropic-orange/30 selection:text-anthropic-dark overflow-hidden">
        
        {/* HERO SECTION - Motion, Glow, and Editorial Beauty */}
        <div className="relative pt-32 pb-48 px-6 lg:px-8 flex items-center justify-center min-h-[85vh]">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[20%] -left-[10%] w-[60%] h-[80%] rounded-full bg-gradient-to-br from-anthropic-orange/20 to-transparent blur-[120px]"
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, -90, 0],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute top-[20%] -right-[10%] w-[50%] h-[70%] rounded-full bg-gradient-to-bl from-anthropic-lightGray/50 to-transparent blur-[100px]"
            />
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 max-w-5xl mx-auto text-center"
          >
            {award.logoUrl && (
              <motion.img 
                variants={itemVariants}
                src={award.logoUrl} 
                alt={award.name} 
                className="h-24 w-auto mx-auto mb-12 object-contain mix-blend-multiply drop-shadow-sm" 
              />
            )}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-anthropic-lightGray bg-white/50 backdrop-blur-sm mb-8 text-xs font-bold uppercase tracking-widest text-anthropic-dark">
              <Sparkles className="h-4 w-4 text-anthropic-orange" />
              <span>Official Award Campaign</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-6xl sm:text-8xl md:text-9xl font-extrabold text-anthropic-dark tracking-tighter leading-[1.05] mb-8">
              {award.name}
            </motion.h1>
            
            {award.description && (
              <motion.p variants={itemVariants} className="text-xl sm:text-3xl text-anthropic-midGray max-w-4xl mx-auto font-serif leading-relaxed">
                {award.description}
              </motion.p>
            )}
            
            <motion.div variants={itemVariants} className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm font-semibold tracking-widest uppercase text-anthropic-dark">
              {award.nominationEndDate && (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] mb-2 text-anthropic-midGray">Nominations Close</span>
                  <span className="border-b-2 border-anthropic-orange pb-1">{format(new Date(award.nominationEndDate), 'MMMM d, yyyy')}</span>
                </div>
              )}
              {award.votingEndDate && (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] mb-2 text-anthropic-midGray">Voting Closes</span>
                  <span className="border-b-2 border-anthropic-dark pb-1">{format(new Date(award.votingEndDate), 'MMMM d, yyyy')}</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* SEARCH BAR - Floating & Elegant */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto px-6 mb-32 relative z-30 -mt-16"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-full shadow-2xl shadow-anthropic-dark/5 border border-anthropic-lightGray p-2 flex items-center transition-all focus-within:ring-4 focus-within:ring-anthropic-orange/20">
            <div className="bg-anthropic-lightGray/20 p-4 rounded-full mr-3">
              <Search className="h-6 w-6 text-anthropic-dark" />
            </div>
            <input 
              type="text" 
              placeholder="Search for a nominee or company..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border-0 focus:ring-0 text-xl font-medium text-anthropic-dark placeholder:text-anthropic-midGray/60 bg-transparent p-0 outline-none"
            />
          </div>
          
          <AnimatePresence>
            {searchQuery && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="absolute top-full mt-4 w-full left-0 right-0 z-40 max-h-96 overflow-y-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-anthropic-lightGray"
              >
                {filteredNominees.length > 0 ? (
                  <ul className="divide-y divide-anthropic-lightGray/50 p-2">
                    {filteredNominees.map(nominee => {
                      const cat = categories.find(c => c.id === nominee.categoryId);
                      return (
                        <li key={nominee.id}>
                          <Link to={`${basePath}/category/${nominee.categoryId}`} className="flex justify-between items-center p-6 hover:bg-anthropic-light/50 rounded-2xl transition-colors group">
                            <div className="flex items-center gap-4">
                              {nominee.logoUrl ? (
                                <img src={nominee.logoUrl} alt="" className="w-12 h-12 rounded-full object-cover border border-anthropic-lightGray shadow-sm" />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-anthropic-dark text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                  {nominee.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <h4 className="text-xl font-bold text-anthropic-dark group-hover:text-anthropic-orange transition-colors">{nominee.name}</h4>
                                <p className="text-sm text-anthropic-midGray font-serif mt-1">{cat?.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-black text-anthropic-dark">{nominee.voteCount || 0}</div>
                              <div className="text-xs uppercase tracking-widest text-anthropic-midGray font-bold">Votes</div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="p-12 text-center text-anthropic-midGray font-serif text-lg">No nominees found matching "<span className="text-anthropic-dark font-bold">{searchQuery}</span>"</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* LIVE PODIUM - Architectural, Motion-driven */}
        {!searchQuery && topNominees.length > 0 && (
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-32">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-24 text-center"
            >
              <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-anthropic-orange mb-4 flex items-center justify-center gap-3">
                <Trophy className="h-5 w-5" /> Live Standings
              </h2>
              <p className="text-5xl md:text-7xl font-extrabold text-anthropic-dark tracking-tight">The Leaderboard</p>
            </motion.div>
            
            <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-4 lg:gap-8 max-w-5xl mx-auto h-[500px]">
              {/* 2nd Place */}
              {topNominees[1] && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  whileInView={{ height: '100%', opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                  className="w-full md:w-1/3 flex flex-col justify-end order-2 md:order-1 h-[70%]"
                >
                  <div className="text-center mb-6 px-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
                      {topNominees[1].logoUrl ? (
                        <img src={topNominees[1].logoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-anthropic-lightGray flex items-center justify-center text-2xl font-bold text-anthropic-dark">{topNominees[1].name.charAt(0)}</div>
                      )}
                    </div>
                    <h3 className="font-bold text-2xl text-anthropic-dark mb-1 line-clamp-1">{topNominees[1].name}</h3>
                    <p className="text-sm font-bold uppercase tracking-widest text-anthropic-midGray">{topNominees[1].voteCount || 0} votes</p>
                  </div>
                  <div className="w-full bg-gradient-to-t from-anthropic-lightGray/30 to-anthropic-lightGray/10 border-t-4 border-anthropic-midGray rounded-t-3xl h-full flex items-start justify-center pt-8 relative overflow-hidden backdrop-blur-sm">
                    <span className="text-7xl font-black text-anthropic-midGray/40">2</span>
                  </div>
                </motion.div>
              )}
              
              {/* 1st Place */}
              {topNominees[0] && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  whileInView={{ height: '100%', opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                  className="w-full md:w-1/3 flex flex-col justify-end order-1 md:order-2 h-full z-10"
                >
                  <div className="text-center mb-6 px-4 relative">
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Trophy className="h-12 w-12 text-anthropic-orange mx-auto mb-4 drop-shadow-lg" />
                    </motion.div>
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-anthropic-orange shadow-2xl bg-white relative">
                      {topNominees[0].logoUrl ? (
                        <img src={topNominees[0].logoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-anthropic-light flex items-center justify-center text-4xl font-bold text-anthropic-orange">{topNominees[0].name.charAt(0)}</div>
                      )}
                    </div>
                    <h3 className="font-extrabold text-3xl text-anthropic-dark mb-2 line-clamp-2">{topNominees[0].name}</h3>
                    <p className="text-base font-black tracking-[0.2em] uppercase text-white bg-anthropic-orange px-6 py-2 rounded-full inline-block shadow-lg">{topNominees[0].voteCount || 0} votes</p>
                  </div>
                  <div className="w-full bg-anthropic-dark rounded-t-[40px] h-[80%] flex items-start justify-center pt-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-anthropic-orange to-transparent"></div>
                    <span className="text-9xl font-black text-white/10">1</span>
                  </div>
                </motion.div>
              )}
              
              {/* 3rd Place */}
              {topNominees[2] && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  whileInView={{ height: '100%', opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                  className="w-full md:w-1/3 flex flex-col justify-end order-3 md:order-3 h-[55%]"
                >
                  <div className="text-center mb-6 px-4">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                      {topNominees[2].logoUrl ? (
                        <img src={topNominees[2].logoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-anthropic-lightGray flex items-center justify-center text-xl font-bold text-anthropic-dark">{topNominees[2].name.charAt(0)}</div>
                      )}
                    </div>
                    <h3 className="font-bold text-xl text-anthropic-dark mb-1 line-clamp-1">{topNominees[2].name}</h3>
                    <p className="text-sm font-bold uppercase tracking-widest text-anthropic-midGray">{topNominees[2].voteCount || 0} votes</p>
                  </div>
                  <div className="w-full bg-gradient-to-t from-anthropic-lightGray/20 to-anthropic-lightGray/5 border-t-4 border-anthropic-lightGray rounded-t-3xl h-full flex items-start justify-center pt-6 relative overflow-hidden backdrop-blur-sm">
                    <span className="text-6xl font-black text-anthropic-midGray/30">3</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* CATEGORIES - Sleek, airy layout */}
        <div className="bg-anthropic-light/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-32">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
              <div>
                <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-anthropic-midGray mb-4">The Categories</h2>
                <p className="text-5xl font-extrabold text-anthropic-dark tracking-tight">Cast Your Vote</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category, i) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Link
                    to={`${basePath}/category/${category.id}`}
                    className="group block bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-anthropic-lightGray/50 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-anthropic-orange/30 transition-all duration-500 h-full flex flex-col"
                  >
                    <div className="flex-grow">
                      <div className="w-12 h-1 bg-anthropic-dark mb-8 group-hover:w-24 group-hover:bg-anthropic-orange transition-all duration-500"></div>
                      <h3 className="text-3xl font-bold text-anthropic-dark mb-4 leading-tight group-hover:text-anthropic-orange transition-colors duration-300">
                        {category.name}
                      </h3>
                      <p className="text-lg text-anthropic-midGray font-serif leading-relaxed line-clamp-4">
                        {category.description}
                      </p>
                    </div>
                    <div className="mt-12 flex items-center gap-x-3 text-sm font-bold uppercase tracking-widest text-anthropic-dark group-hover:text-anthropic-orange transition-colors">
                      View & Vote 
                      <motion.div
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </PublicLayout>
  );
}
