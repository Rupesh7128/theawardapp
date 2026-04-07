import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Globe, Sparkles } from 'lucide-react';

import PublicLayout from '../components/PublicLayout';

export default function PublicNominee({ customAwardId }: { customAwardId?: string }) {
  const { id: paramId, nomineeId } = useParams<{ id: string, nomineeId: string }>();
  const id = customAwardId || paramId;
    const basePath = customAwardId ? '' : `/award/${id}`;
  const [award, setAward] = useState<any>(null);
  const [nominee, setNominee] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          }
        }
      } catch (error) {
        console.error("Error fetching nominee:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, nomineeId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#666666]">Loading...</div>;
  if (!nominee) return <div className="min-h-screen flex items-center justify-center text-xl text-[#666666]">Nominee not found.</div>;

  return (
    <PublicLayout award={award}>
      <div className="bg-[#FAFAFA] min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={`${basePath}/category/${nominee.categoryId}`} className="inline-flex items-center text-sm font-medium text-[#111111] hover:text-black mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {category?.name || 'Category'}
          </Link>

          <div className="bg-white shadow-sm sm:rounded-xl overflow-hidden border border-[#EAEAEA]">
            <div className="px-6 py-8 border-b border-[#EAEAEA]">
              <div className="flex items-center gap-6 mb-6">
                {nominee.logoUrl ? (
                  <img src={nominee.logoUrl} alt="" className="h-24 w-24 rounded-full object-cover border border-[#EAEAEA]" />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-[#FAFAFA] flex items-center justify-center text-4xl font-bold text-[#111111] border border-[#EAEAEA]">
                    {nominee.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-3xl font-bold leading-tight text-[#111111]">{nominee.name}</h3>
                  <p className="mt-2 max-w-2xl text-sm text-[#666666]">
                    Nominated for <span className="font-semibold text-[#111111]">{category?.name}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-6 sm:p-0">
              <dl className="sm:divide-y sm:divide-[#EAEAEA]">
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-6 sm:px-6">
                  <dt className="text-sm font-medium text-[#666666]">Current Votes</dt>
                  <dd className="mt-1 text-sm text-[#111111] sm:col-span-2 sm:mt-0 font-bold text-2xl">
                    {nominee.voteCount || 0}
                  </dd>
                </div>
                {nominee.website && (
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-6 sm:px-6">
                    <dt className="text-sm font-medium text-[#666666] flex items-center gap-2"><Globe className="h-4 w-4"/> Website</dt>
                    <dd className="mt-1 text-sm text-[#111111] sm:col-span-2 sm:mt-0">
                      <a href={nominee.website} target="_blank" rel="noopener noreferrer" className="text-[#111111] hover:underline font-medium">
                        {nominee.website}
                      </a>
                    </dd>
                  </div>
                )}
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-6 sm:px-6">
                  <dt className="text-sm font-medium text-[#666666]">Description</dt>
                  <dd className="mt-1 text-sm text-[#111111] sm:col-span-2 sm:mt-0 whitespace-pre-wrap leading-relaxed">
                    {nominee.description}
                  </dd>
                </div>
                {nominee.aiSummary && (
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-6 sm:px-6 bg-[#FAFAFA]">
                    <dt className="text-sm font-medium text-[#111111] flex items-center gap-2"><Sparkles className="h-4 w-4"/> AI Summary</dt>
                    <dd className="mt-1 text-sm text-[#666666] sm:col-span-2 sm:mt-0 leading-relaxed italic">
                      "{nominee.aiSummary}"
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
