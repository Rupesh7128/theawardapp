import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trophy, Calendar, ArrowRight, BarChart } from 'lucide-react';
import { format } from 'date-fns';

interface Award {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchAwards = async () => {
      try {
        const q = query(collection(db, 'awards'), where('ownerId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const awardsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Award[];
        
        awardsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAwards(awardsData);
      } catch (error) {
        console.error("Error fetching awards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-[#666666]">Loading your campaigns...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold leading-7 text-[#111111] sm:truncate sm:tracking-tight">
            Campaigns
          </h1>
          <p className="mt-2 text-sm text-[#666666]">
            Manage your award campaigns and generate leads.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-12">
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-[#EAEAEA] p-6">
          <dt className="truncate text-sm font-medium text-[#666666]">Active Campaigns</dt>
          <dd className="mt-2 text-3xl font-bold tracking-tight text-[#111111]">
            {awards.filter(a => a.status === 'published').length}
          </dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-[#EAEAEA] p-6">
          <dt className="truncate text-sm font-medium text-[#666666]">Total Leads Captured</dt>
          <dd className="mt-2 text-3xl font-bold tracking-tight text-[#111111]">
            --
          </dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-[#EAEAEA] p-6">
          <dt className="truncate text-sm font-medium text-[#666666]">Total Votes</dt>
          <dd className="mt-2 text-3xl font-bold tracking-tight text-[#111111]">
            --
          </dd>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Create New Card */}
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-dashed border-[#EAEAEA] hover:border-[#111111] transition-colors">
          <div className="px-6 py-8 h-full flex flex-col justify-center items-center text-center">
            <div className="w-full flex flex-col items-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FAFAFA] border border-[#EAEAEA] mb-4">
                <Plus className="h-5 w-5 text-[#111111]" />
              </div>
              <h3 className="text-lg font-semibold text-[#111111] mb-2">New Campaign</h3>
              <p className="text-sm text-[#666666] mb-6">Create a new award campaign with AI assistance.</p>
              <Link
                to="/dashboard/create"
                className="inline-flex items-center rounded-md bg-[#111111] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] transition-colors"
              >
                Create Campaign
              </Link>
            </div>
          </div>
        </div>

        {/* Existing Awards */}
        {awards.map((award) => (
          <div key={award.id} className="bg-white overflow-hidden shadow-sm rounded-xl border border-[#EAEAEA] flex flex-col hover:shadow-md transition-shadow">
            <div className="px-6 py-6 flex-grow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 bg-[#FAFAFA] p-2 rounded-lg border border-[#EAEAEA]">
                    <Trophy className="h-5 w-5 text-[#111111]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#111111] truncate">{award.name}</h3>
                </div>
              </div>
              <div className="flex items-center justify-between mt-6">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  award.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-[#FAFAFA] text-[#666666] border border-[#EAEAEA]'
                }`}>
                  {award.status.charAt(0).toUpperCase() + award.status.slice(1)}
                </span>
                <div className="flex items-center text-xs text-[#666666]">
                  <Calendar className="mr-1.5 h-3.5 w-3.5" />
                  {format(new Date(award.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
            <div className="bg-[#FAFAFA] px-6 py-4 border-t border-[#EAEAEA]">
              <Link
                to={`/dashboard/award/${award.id}`}
                className="text-sm font-semibold text-[#111111] hover:text-black flex items-center justify-between"
              >
                Manage Campaign
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
