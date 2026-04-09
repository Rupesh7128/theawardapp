import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Settings, List, Users, Sparkles, Upload, Globe, BarChart, Download, CreditCard, Check, Code, Link as LinkIcon, Plus, Minus, Edit, Award, X, PieChart as PieChartIcon } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Papa from 'papaparse';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Helper to prevent infinite hangs if Firebase Storage is not enabled
const uploadWithTimeout = async (storageRef: any, file: File, timeoutMs = 15000) => {
  return Promise.race([
    uploadBytes(storageRef, file),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Storage upload timeout')), timeoutMs))
  ]);
};

export default function ManageAward() {
  const { id } = useParams<{ id: string }>();
  const { user, billingBypass } = useAuth();
  const navigate = useNavigate();

  const geminiApiKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ??
    (typeof process !== 'undefined' ? (process as any).env?.GEMINI_API_KEY : undefined);

  const ai = useMemo(() => {
    if (!geminiApiKey) return null;
    return new GoogleGenAI({ apiKey: geminiApiKey });
  }, [geminiApiKey]);
  
  const [award, setAward] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [nominees, setNominees] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [showImportGuide, setShowImportGuide] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('settings');
  const hasProAccess = Boolean(billingBypass || award?.plan === 'pro');
  
  // Settings State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [nominationEndDate, setNominationEndDate] = useState('');
  const [votingStartDate, setVotingStartDate] = useState('');
  const [votingEndDate, setVotingEndDate] = useState('');
  const [landingPageUrl, setLandingPageUrl] = useState('');
  const [rulesUrl, setRulesUrl] = useState('');
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState('');
  const [status, setStatus] = useState('draft');
  const [isPublicDirectory, setIsPublicDirectory] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingDirectory, setSavingDirectory] = useState(false);
  const [savingDomain, setSavingDomain] = useState(false);
  const [domainSaved, setDomainSaved] = useState(false);

  // AI Generation State
  const [isGeneratingCategories, setIsGeneratingCategories] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Nominee Edit State
  const [editingNominee, setEditingNominee] = useState<any>(null);
  const [nomineePhotoFile, setNomineePhotoFile] = useState<File | null>(null);

  // Billing State
  const [isUpgrading, setIsUpgrading] = useState(false);

  const [certificateUrl, setCertificateUrl] = useState('');
  const [badgeUrl, setBadgeUrl] = useState('');
  const [sendingCertificates, setSendingCertificates] = useState(false);

  useEffect(() => {
    if (!user || !id) return;

    const fetchData = async () => {
      try {
        // Fetch Award
        const awardRef = doc(db, 'awards', id);
        const awardSnap = await getDoc(awardRef);
        
        if (!awardSnap.exists() || awardSnap.data().ownerId !== user.uid) {
          navigate('/dashboard');
          return;
        }
        
        const awardData = awardSnap.data();
        setAward({ id: awardSnap.id, ...awardData });
        setName(awardData.name || '');
        setDescription(awardData.description || '');
        setLogoUrl(awardData.logoUrl || '');
        setNominationEndDate(awardData.nominationEndDate ? awardData.nominationEndDate.substring(0, 16) : '');
        setVotingStartDate(awardData.votingStartDate ? awardData.votingStartDate.substring(0, 16) : '');
        setVotingEndDate(awardData.votingEndDate ? awardData.votingEndDate.substring(0, 16) : '');
        setLandingPageUrl(awardData.landingPageUrl || awardData.links?.landingPage || '');
        setRulesUrl(awardData.rulesUrl || '');
        setPrivacyPolicyUrl(awardData.privacyPolicyUrl || '');
        setStatus(awardData.status || 'draft');
        setIsPublicDirectory(awardData.isPublicDirectory || false);
        setCustomDomain(awardData.customDomain || '');
        setCertificateUrl(awardData.certificateUrl || '');
        setBadgeUrl(awardData.badgeUrl || '');

        // Fetch Categories
        const catQ = query(collection(db, 'categories'), where('awardId', '==', id));
        const catSnap = await getDocs(catQ);
        setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Fetch Nominees
        const nomQ = query(collection(db, 'nominees'), where('awardId', '==', id));
        const nomSnap = await getDocs(nomQ);
        setNominees(nomSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Fetch Leads
        const leadsQ = query(collection(db, 'leads'), where('awardId', '==', id));
        const leadsSnap = await getDocs(leadsQ);
        setLeads(leadsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, navigate]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSavingSettings(true);
    try {
      await updateDoc(doc(db, 'awards', id), {
        name,
        description,
        logoUrl,
        landingPageUrl,
        rulesUrl,
        privacyPolicyUrl,
        nominationEndDate: nominationEndDate ? new Date(nominationEndDate).toISOString() : null,
        votingStartDate: votingStartDate ? new Date(votingStartDate).toISOString() : null,
        votingEndDate: votingEndDate ? new Date(votingEndDate).toISOString() : null,
        status
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error("Error saving settings:", error);
      alert('Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const generateCategoriesWithAI = async () => {
    if (!description) {
      alert("Please add a description in settings first so AI knows what the award is about.");
      return;
    }
    if (!ai) {
      alert("AI is not configured. Set VITE_GEMINI_API_KEY in a local .env file to enable AI features.");
      return;
    }
    setIsGeneratingCategories(true);
    try {
      const prompt = `Generate 5 award categories for an award program named "${name}". 
      Description: "${description}".
      Return ONLY a JSON array of objects with "name" and "description" properties.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });
      
      const generatedCats = JSON.parse(response.text || '[]');
      
      for (const cat of generatedCats) {
        const docRef = await addDoc(collection(db, 'categories'), {
          awardId: id,
          name: cat.name,
          description: cat.description,
          createdAt: new Date().toISOString()
        });
        setCategories(prev => [...prev, { id: docRef.id, awardId: id, name: cat.name, description: cat.description }]);
      }
      alert("Categories generated successfully!");
    } catch (error) {
      console.error("Error generating categories:", error);
      alert("Failed to generate categories.");
    } finally {
      setIsGeneratingCategories(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setImporting(true);
    setImportErrors([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        let addedCount = 0;
        const errors: string[] = [];

        // Validate headers first
        if (rows.length > 0) {
          const headers = Object.keys(rows[0]).map(h => h.toLowerCase().trim());
          const required = ['first name', 'last name', 'email', 'categoryname'];
          const missing = required.filter(r => !headers.includes(r));
          if (missing.length > 0) {
            setImportErrors([`CSV is missing required columns: ${missing.join(', ')}. Please use exact column names.`]);
            setImporting(false);
            e.target.value = '';
            return;
          }
        }

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          
          // Normalize row keys (case-insensitive)
          const normalizedRow: any = {};
          Object.keys(row).forEach(key => {
            normalizedRow[key.toLowerCase().trim()] = row[key];
          });

          const firstName = normalizedRow['first name']?.trim();
          const lastName = normalizedRow['last name']?.trim();
          const nomName = [firstName, lastName].filter(Boolean).join(' ');
          const nomEmail = normalizedRow.email?.trim();
          const catName = normalizedRow.categoryname?.trim();
          
          if (!firstName || !lastName || !nomEmail || !catName) {
            errors.push(`Row ${i + 2}: Missing required data (first name, last name, email, or categoryName)`);
            continue;
          }

          const cat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
          if (!cat) {
            errors.push(`Row ${i + 2}: Category "${catName}" not found in this award`);
            continue;
          }

          const websiteValue = normalizedRow['website url']?.trim() || normalizedRow.website?.trim() || '';
          const linkedinValue = normalizedRow['linkedin url']?.trim() || normalizedRow.linkedin?.trim() || '';
          const imageValue = normalizedRow['image url']?.trim() || normalizedRow.image?.trim() || normalizedRow.logourl?.trim() || '';

          try {
            const docRef = await addDoc(collection(db, 'nominees'), {
              awardId: id,
              categoryId: cat.id,
              name: nomName,
              email: nomEmail,
              description: normalizedRow.description?.trim() || '',
              website: websiteValue,
              linkedinUrl: linkedinValue,
              title: normalizedRow.title?.trim() || '',
              company: normalizedRow.company?.trim() || '',
              logoUrl: imageValue,
              aiSummary: '',
              status: 'approved',
              voteCount: 0,
              submittedBy: user?.uid,
              createdAt: new Date().toISOString()
            });
            
            setNominees(prev => [...prev, {
              id: docRef.id,
              awardId: id,
              categoryId: cat.id,
              name: nomName,
              email: nomEmail,
              description: normalizedRow.description?.trim() || '',
              website: websiteValue,
              linkedinUrl: linkedinValue,
              title: normalizedRow.title?.trim() || '',
              company: normalizedRow.company?.trim() || '',
              logoUrl: imageValue,
              status: 'approved',
              voteCount: 0
            }]);
            addedCount++;
          } catch (err) {
            errors.push(`Row ${i + 2}: Database error saving nominee`);
          }
        }
        
        if (errors.length > 0) {
          setImportErrors(errors);
        }
        
        if (addedCount > 0) {
          alert(`Successfully imported ${addedCount} nominees!`);
        }
        
        setImporting(false);
        e.target.value = '';
      }
    });
  };

  const exportLeads = () => {
    if (leads.length === 0) {
      alert("No leads to export.");
      return;
    }
    const csv = Papa.unparse(leads.map(l => ({
      Email: l.email,
      Name: l.name || '',
      Source: l.source,
      Date: new Date(l.createdAt).toLocaleDateString()
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_${award?.name || 'award'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpgrade = async (plan: string) => {
    if (!id) return;
    setIsUpgrading(true);
    try {
      // Simulate Stripe Checkout
      await new Promise(resolve => setTimeout(resolve, 1500));
      await updateDoc(doc(db, 'awards', id), { plan });
      setAward((prev: any) => ({ ...prev, plan }));
      alert(`Successfully upgraded to ${plan} plan!`);
    } catch (error) {
      console.error("Error upgrading plan:", error);
      alert("Failed to upgrade plan.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const topNomineesData = useMemo(() => {
    return [...nominees]
      .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
      .slice(0, 5)
      .map(n => ({ name: n.name, votes: n.voteCount || 0 }));
  }, [nominees]);

  const COLORS = ['#d97757', '#6a9bcc', '#788c5d', '#b0aea5', '#141413'];

  if (loading) return <div className="p-8 text-center text-[#666666]">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold leading-7 text-[#111111] sm:truncate sm:tracking-tight flex items-center gap-3">
            Manage: {award?.name}
            {award?.plan && award.plan !== 'free' && (
              <span className="inline-flex items-center rounded-full bg-[#111111] px-2.5 py-0.5 text-xs font-semibold text-white uppercase tracking-wider">
                {award.plan}
              </span>
            )}
          </h1>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => window.open(`/award/${id}`, '_blank')}
            className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] hover:bg-[#FAFAFA] transition-colors"
          >
            <Globe className="h-4 w-4 mr-2" />
            View Public Page
          </button>
        </div>
      </div>

      <div className="mb-8 border-b border-[#EAEAEA] overflow-x-auto">
        <nav className="-mb-px flex space-x-8 min-w-max" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('settings')}
            className={`${
              activeTab === 'settings'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#666666] hover:border-[#EAEAEA] hover:text-[#111111]'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center transition-colors`}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`${
              activeTab === 'categories'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#666666] hover:border-[#EAEAEA] hover:text-[#111111]'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center transition-colors`}
          >
            <List className="h-4 w-4 mr-2" />
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('nominees')}
            className={`${
              activeTab === 'nominees'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#666666] hover:border-[#EAEAEA] hover:text-[#111111]'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center transition-colors`}
          >
            <Users className="h-4 w-4 mr-2" />
            Nominees ({nominees.length})
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`${
              activeTab === 'leads'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#666666] hover:border-[#EAEAEA] hover:text-[#111111]'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center transition-colors`}
          >
            <BarChart className="h-4 w-4 mr-2" />
            Leads ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`${
              activeTab === 'certificates'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#666666] hover:border-[#EAEAEA] hover:text-[#111111]'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center transition-colors`}
          >
            <Award className="h-4 w-4 mr-2" />
            Certificates & Badges
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`${
              activeTab === 'analytics'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#666666] hover:border-[#EAEAEA] hover:text-[#111111]'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center transition-colors`}
          >
            <PieChartIcon className="h-4 w-4 mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`${
              activeTab === 'billing'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#666666] hover:border-[#EAEAEA] hover:text-[#111111]'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center transition-colors`}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
          </button>
          <button
            onClick={() => setActiveTab('publish')}
            className={`${
              activeTab === 'publish'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#666666] hover:border-[#EAEAEA] hover:text-[#111111]'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center transition-colors`}
          >
            <Globe className="h-4 w-4 mr-2" />
            Publish
          </button>
        </nav>
      </div>

      <div className="bg-white shadow-sm sm:rounded-xl border border-[#EAEAEA]">
        {activeTab === 'settings' && (
          <div className="px-6 py-8">
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium leading-6 text-[#111111]">Campaign Name</label>
                <div className="mt-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-md border-0 py-2 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] placeholder:text-[#666666] focus:ring-2 focus:ring-inset focus:ring-[#111111] sm:text-sm sm:leading-6 px-3"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-[#111111]">Description</label>
                <div className="mt-2">
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block w-full rounded-md border-0 py-2 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] placeholder:text-[#666666] focus:ring-2 focus:ring-inset focus:ring-[#111111] sm:text-sm sm:leading-6 px-3"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-[#111111]">Logo URL (or upload below)</label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="block w-full rounded-md border-0 py-2 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] placeholder:text-[#666666] focus:ring-2 focus:ring-inset focus:ring-[#111111] sm:text-sm sm:leading-6 px-3"
                  />
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0] && user) {
                        const file = e.target.files[0];
                        const photoRef = ref(storage, `awards/${user.uid}/${Date.now()}_${file.name}`);
                        await uploadWithTimeout(photoRef, file);
                        const url = await getDownloadURL(photoRef);
                        setLogoUrl(url);
                      }
                    }}
                    className="text-sm w-48"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-[#111111]">Landing Page URL</label>
                <div className="mt-2">
                  <input
                    type="url"
                    value={landingPageUrl}
                    onChange={(e) => setLandingPageUrl(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="block w-full rounded-md border-0 py-2 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] placeholder:text-[#666666] focus:ring-2 focus:ring-inset focus:ring-[#111111] sm:text-sm sm:leading-6 px-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-[#111111]">Rules URL</label>
                <div className="mt-2">
                  <input
                    type="url"
                    value={rulesUrl}
                    onChange={(e) => setRulesUrl(e.target.value)}
                    placeholder="https://yourwebsite.com/rules"
                    className="block w-full rounded-md border-0 py-2 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] placeholder:text-[#666666] focus:ring-2 focus:ring-inset focus:ring-[#111111] sm:text-sm sm:leading-6 px-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-[#111111]">Privacy Policy URL</label>
                <div className="mt-2">
                  <input
                    type="url"
                    value={privacyPolicyUrl}
                    onChange={(e) => setPrivacyPolicyUrl(e.target.value)}
                    placeholder="https://yourwebsite.com/privacy"
                    className="block w-full rounded-md border-0 py-2 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] placeholder:text-[#666666] focus:ring-2 focus:ring-inset focus:ring-[#111111] sm:text-sm sm:leading-6 px-3"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium leading-6 text-[#111111]">Nomination End Date</label>
                  <div className="mt-2">
                    <input
                      type="datetime-local"
                      value={nominationEndDate}
                      onChange={(e) => setNominationEndDate(e.target.value)}
                      className="block w-full rounded-md border-0 py-2 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] focus:ring-2 focus:ring-inset focus:ring-[#111111] sm:text-sm sm:leading-6 px-3"
                    />
                  </div>
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium leading-6 text-[#111111]">Voting Start Date</label>
                  <div className="mt-2">
                    <input
                      type="datetime-local"
                      value={votingStartDate}
                      onChange={(e) => setVotingStartDate(e.target.value)}
                      className="block w-full rounded-md border-0 py-2 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] focus:ring-2 focus:ring-inset focus:ring-[#111111] sm:text-sm sm:leading-6 px-3"
                    />
                  </div>
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium leading-6 text-[#111111]">Voting End Date</label>
                  <div className="mt-2">
                    <input
                      type="datetime-local"
                      value={votingEndDate}
                      onChange={(e) => setVotingEndDate(e.target.value)}
                      className="block w-full rounded-md border-0 py-2 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] focus:ring-2 focus:ring-inset focus:ring-[#111111] sm:text-sm sm:leading-6 px-3"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-[#111111]">Status</label>
                <div className="mt-2">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="block w-full rounded-md border-0 py-2 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] focus:ring-2 focus:ring-inset focus:ring-[#111111] sm:text-sm sm:leading-6 px-3"
                  >
                    <option value="draft">Draft (Hidden)</option>
                    <option value="published">Published (Live)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="inline-flex justify-center rounded-md bg-[#111111] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] transition-colors"
                >
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
            {/* Import Guide Modal */}
            {showImportGuide && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#111111]">CSV Import Guide</h3>
                    <button onClick={() => setShowImportGuide(false)} className="text-[#666666] hover:text-[#111111]">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-6 text-sm text-[#444444]">
                    <p>To bulk import nominees, your CSV file must have a header row with specific column names. The system is case-insensitive.</p>
                    
                    <div>
                      <h4 className="font-bold text-[#111111] mb-2 text-base">Required Columns:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><code className="bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-[#111111] font-semibold">first name</code>: The nominee's first name.</li>
                        <li><code className="bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-[#111111] font-semibold">last name</code>: The nominee's last name.</li>
                        <li><code className="bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-[#111111] font-semibold">email</code>: A valid contact email.</li>
                        <li><code className="bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-[#111111] font-semibold">categoryName</code>: Must exactly match one of your existing category names (e.g. "Best CRM").</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-[#111111] mb-2 text-base">Optional Columns:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><code className="bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-[#111111]">title</code>: The person's job title (e.g. "CEO").</li>
                        <li><code className="bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-[#111111]">company</code>: Their company name.</li>
                        <li><code className="bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-[#111111]">description</code>: A brief bio or reason for nomination.</li>
                        <li><code className="bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-[#111111]">website url</code>: A link to their portfolio or company site.</li>
                        <li><code className="bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-[#111111]">linkedin url</code>: A link to their LinkedIn profile.</li>
                        <li><code className="bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-[#111111]">image url</code>: A link to their profile photo/logo.</li>
                      </ul>
                    </div>

                    <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-lg p-4 overflow-x-auto">
                      <p className="font-semibold text-[#111111] mb-2">Example CSV Format:</p>
                      <pre className="text-xs">first name,last name,email,categoryName,title,company,description,website url,linkedin url,image url
John,Doe,john@acme.com,Best CEO,Founder,Acme Corp,Grew revenue.,https://acme.com,https://linkedin.com/in/johndoe,https://example.com/john.jpg
Jane,Smith,jane@test.com,Best Marketer,CMO,Test Inc,,,,,</pre>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        onClick={() => {
                          const csvContent = "first name,last name,email,categoryName,title,company,description,website url,linkedin url,image url\nJohn,Doe,john@example.com,Best Category,CEO,Acme Corp,Great leader.,https://example.com,https://linkedin.com/in/johndoe,https://example.com/john.jpg";
                          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                          const link = document.createElement("a");
                          const url = URL.createObjectURL(blob);
                          link.setAttribute("href", url);
                          link.setAttribute("download", "nominees_template.csv");
                          link.style.visibility = 'hidden';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="inline-flex items-center rounded-md bg-[#111111] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black transition-colors"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="px-6 py-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold leading-6 text-[#111111]">Categories</h3>
              <button
                onClick={generateCategoriesWithAI}
                disabled={isGeneratingCategories}
                className="inline-flex items-center rounded-md bg-[#FAFAFA] px-4 py-2 text-sm font-semibold text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] hover:bg-gray-50 transition-colors"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGeneratingCategories ? 'Generating...' : 'AI Suggest Categories'}
              </button>
            </div>
            
            {categories.length === 0 ? (
              <div className="text-center py-12 text-[#666666] border border-dashed border-[#EAEAEA] rounded-lg">No categories yet. Use AI to generate some!</div>
            ) : (
              <ul role="list" className="divide-y divide-[#EAEAEA] border border-[#EAEAEA] rounded-lg">
                {categories.map((category) => (
                  <li key={category.id} className="flex justify-between gap-x-6 py-5 px-6 hover:bg-[#FAFAFA] transition-colors items-center">
                    <div className="flex min-w-0 gap-x-4">
                      <div className="min-w-0 flex-auto">
                        <p className="text-sm font-semibold leading-6 text-[#111111] flex items-center gap-2">
                          {category.backgroundColor && (
                            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: category.backgroundColor }}></span>
                          )}
                          {category.name}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#666666]">{category.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="text-[#666666] hover:text-[#111111] transition-colors p-2 rounded-md hover:bg-[#EAEAEA]"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Edit Category Modal */}
            {editingCategory && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                  <h3 className="text-xl font-bold text-[#111111] mb-4">Edit Category</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#111111] mb-1">Name</label>
                      <input 
                        type="text"
                        value={editingCategory.name}
                        onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                        className="w-full rounded-md border border-[#EAEAEA] px-3 py-2 focus:ring-[#111111] focus:border-[#111111]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#111111] mb-1">Description</label>
                      <textarea 
                        rows={3}
                        value={editingCategory.description}
                        onChange={e => setEditingCategory({...editingCategory, description: e.target.value})}
                        className="w-full rounded-md border border-[#EAEAEA] px-3 py-2 focus:ring-[#111111] focus:border-[#111111]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#111111] mb-1">Background Color</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color"
                          value={editingCategory.backgroundColor || '#111111'}
                          onChange={e => setEditingCategory({...editingCategory, backgroundColor: e.target.value})}
                          className="h-10 w-10 rounded cursor-pointer border border-[#EAEAEA] p-1"
                        />
                        <span className="text-sm text-[#666666] font-mono">{editingCategory.backgroundColor || '#111111'}</span>
                      </div>
                      <p className="text-xs text-[#999999] mt-1">Used for the header background on the public category page.</p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button 
                      onClick={() => setEditingCategory(null)}
                      className="px-4 py-2 text-sm font-medium text-[#666666] hover:text-[#111111]"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          await updateDoc(doc(db, 'categories', editingCategory.id), {
                            name: editingCategory.name,
                            description: editingCategory.description,
                            backgroundColor: editingCategory.backgroundColor || '#111111'
                          });

                          setCategories(prev => prev.map(c => c.id === editingCategory.id ? editingCategory : c));
                          setEditingCategory(null);
                        } catch (error) {
                          console.error("Error updating category:", error);
                          alert("Failed to update category.");
                        }
                      }}
                      className="bg-[#111111] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-black"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'nominees' && (
          <div className="px-6 py-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold leading-6 text-[#111111]">Nominees</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowImportGuide(true)}
                  className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] hover:bg-gray-50 transition-colors"
                >
                  Format Guide
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to approve all pending nominees?")) {
                      const pendingNominees = nominees.filter(n => n.status === 'pending');
                      for (const n of pendingNominees) {
                        await updateDoc(doc(db, 'nominees', n.id), { status: 'approved' });
                      }
                      setNominees(prev => prev.map(n => n.status === 'pending' ? { ...n, status: 'approved' } : n));
                      alert("All pending nominees approved.");
                    }
                  }}
                  className="inline-flex items-center rounded-md bg-[#FAFAFA] px-4 py-2 text-sm font-semibold text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] hover:bg-gray-50 transition-colors"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve All Pending
                </button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Upload CSV (columns: name, email, categoryName, description, website)"
                  />
                  <button
                    disabled={importing}
                    className="inline-flex items-center rounded-md bg-[#FAFAFA] px-4 py-2 text-sm font-semibold text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {importing ? 'Importing...' : 'Bulk Upload CSV'}
                  </button>
                </div>
              </div>
            </div>

            {importErrors.length > 0 && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-red-800 mb-2">Import Errors ({importErrors.length})</h4>
                  <button onClick={() => setImportErrors([])} className="text-red-500 hover:text-red-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <ul className="list-disc pl-5 text-xs text-red-700 space-y-1 max-h-32 overflow-y-auto">
                  {importErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {nominees.length === 0 ? (
              <div className="text-center py-12 text-[#666666] border border-dashed border-[#EAEAEA] rounded-lg">No nominees yet. Share your public link to get nominations!</div>
            ) : (
              <div className="overflow-x-auto border border-[#EAEAEA] rounded-lg">
                <table className="min-w-full divide-y divide-[#EAEAEA]">
                  <thead className="bg-[#FAFAFA]">
                    <tr>
                      <th className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-[#111111]">Name</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-[#111111]">Category</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-[#111111]">Status</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-[#111111]">Votes</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-[#111111]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEA] bg-white">
                    {nominees.map((nominee) => {
                      const cat = categories.find(c => c.id === nominee.categoryId);
                      return (
                        <tr key={nominee.id} className="hover:bg-[#FAFAFA] transition-colors">
                          <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-[#111111]">
                            <div className="flex items-center gap-3">
                              {nominee.logoUrl ? (
                                <img src={nominee.logoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-[#EAEAEA] flex items-center justify-center text-xs font-medium text-[#666666]">
                                  {nominee.name.charAt(0)}
                                </div>
                              )}
                              {nominee.name}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-[#666666]">{cat?.name || 'Unknown'}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-[#666666]">
                            <select
                              value={nominee.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                await updateDoc(doc(db, 'nominees', nominee.id), { status: newStatus });
                                setNominees(prev => prev.map(n => n.id === nominee.id ? { ...n, status: newStatus } : n));
                              }}
                              className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                nominee.status === 'approved' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                                nominee.status === 'rejected' ? 'bg-red-50 text-red-700 ring-red-600/20' : 
                                'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-[#666666]">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={async () => {
                                  const newCount = Math.max(0, (nominee.voteCount || 0) - 1);
                                  await updateDoc(doc(db, 'nominees', nominee.id), { voteCount: newCount });
                                  setNominees(prev => prev.map(n => n.id === nominee.id ? { ...n, voteCount: newCount } : n));
                                }}
                                className="p-1 hover:bg-[#EAEAEA] rounded"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center">{nominee.voteCount || 0}</span>
                              <button 
                                onClick={async () => {
                                  const newCount = (nominee.voteCount || 0) + 1;
                                  await updateDoc(doc(db, 'nominees', nominee.id), { voteCount: newCount });
                                  setNominees(prev => prev.map(n => n.id === nominee.id ? { ...n, voteCount: newCount } : n));
                                }}
                                className="p-1 hover:bg-[#EAEAEA] rounded"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-[#666666]">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setEditingNominee(nominee)}
                                className="text-[#111111] hover:underline text-xs font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={async () => {
                                  if (!ai) {
                                    alert("AI is not configured. Set VITE_GEMINI_API_KEY in a local .env file to enable AI features.");
                                    return;
                                  }
                                  try {
                                    const prompt = `Write a professional, engaging 2-sentence summary for an award nominee named "${nominee.name}". Here is their description: "${nominee.description}".`;
                                    const response = await ai.models.generateContent({
                                      model: 'gemini-3-flash-preview',
                                      contents: prompt,
                                    });
                                    const aiSummary = response.text;
                                    await updateDoc(doc(db, 'nominees', nominee.id), { aiSummary });
                                    setNominees(prev => prev.map(n => n.id === nominee.id ? { ...n, aiSummary } : n));
                                    alert("Profile enhanced with AI!");
                                  } catch (error) {
                                    console.error("Error enhancing profile:", error);
                                    alert("Failed to enhance profile.");
                                  }
                                }}
                                className="text-[#111111] hover:underline text-xs font-medium flex items-center gap-1"
                              >
                                <Sparkles className="h-3 w-3" /> AI Enhance
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Import Guide Modal */}
            {showImportGuide && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#111111]">CSV Import Guide</h3>
                    <button onClick={() => setShowImportGuide(false)} className="text-[#666666] hover:text-[#111111]">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-6 text-sm text-[#444444]">
                    <p>To bulk import nominees, your CSV file must have a header row with specific column names. The system is case-insensitive.</p>
                    
                    <div>
                      <h4 className="font-bold text-[#111111] mb-2 text-base">Required Columns:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><code className="bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-[#111111] font-semibold">first name</code>: The nominee's first name.</li>
                        <li><code className="bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-[#111111] font-semibold">last name</code>: The nominee's last name.</li>
                        <li><code className="bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-[#111111] font-semibold">email</code>: A valid contact email.</li>
                        <li><code className="bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-[#111111] font-semibold">categoryName</code>: Must exactly match one of your existing category names (e.g. "Best CRM").</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-[#111111] mb-2 text-base">Optional Columns:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><code className="bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-[#111111]">title</code>: The person's job title (e.g. "CEO").</li>
                        <li><code className="bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-[#111111]">company</code>: Their company name.</li>
                        <li><code className="bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-[#111111]">description</code>: A brief bio or reason for nomination.</li>
                        <li><code className="bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-[#111111]">website url</code>: A link to their portfolio or company site.</li>
                        <li><code className="bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-[#111111]">linkedin url</code>: A link to their LinkedIn profile.</li>
                        <li><code className="bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-[#111111]">image url</code>: A link to their profile photo/logo.</li>
                      </ul>
                    </div>

                    <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-lg p-4 overflow-x-auto">
                      <p className="font-semibold text-[#111111] mb-2">Example CSV Format:</p>
                      <pre className="text-xs">first name,last name,email,categoryName,title,company,description,website url,linkedin url,image url
John,Doe,john@acme.com,Best CEO,Founder,Acme Corp,Grew revenue.,https://acme.com,https://linkedin.com/in/johndoe,https://example.com/john.jpg
Jane,Smith,jane@test.com,Best Marketer,CMO,Test Inc,,,,,</pre>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        onClick={() => {
                          const csvContent = "first name,last name,email,categoryName,title,company,description,website url,linkedin url,image url\nJohn,Doe,john@example.com,Best Category,CEO,Acme Corp,Great leader.,https://example.com,https://linkedin.com/in/johndoe,https://example.com/john.jpg";
                          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                          const link = document.createElement("a");
                          const url = URL.createObjectURL(blob);
                          link.setAttribute("href", url);
                          link.setAttribute("download", "nominees_template.csv");
                          link.style.visibility = 'hidden';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="inline-flex items-center rounded-md bg-[#111111] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black transition-colors"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Nominee Modal */}
        {editingNominee && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-[#111111] mb-4">Edit Nominee: {editingNominee.name}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#111111] mb-1">Photo</label>
                      <div className="flex items-center gap-4">
                        {editingNominee.logoUrl && (
                          <img src={editingNominee.logoUrl} alt="" className="h-16 w-16 rounded-full object-cover border border-[#EAEAEA]" />
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setNomineePhotoFile(e.target.files[0]);
                            }
                          }}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#111111] mb-1">Description</label>
                      <textarea 
                        rows={4}
                        value={editingNominee.description}
                        onChange={e => setEditingNominee({...editingNominee, description: e.target.value})}
                        className="w-full rounded-md border border-[#EAEAEA] px-3 py-2 focus:ring-[#111111] focus:border-[#111111]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#111111] mb-1">Website</label>
                      <input 
                        type="url"
                        value={editingNominee.website}
                        onChange={e => setEditingNominee({...editingNominee, website: e.target.value})}
                        className="w-full rounded-md border border-[#EAEAEA] px-3 py-2 focus:ring-[#111111] focus:border-[#111111]"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button 
                      onClick={() => {
                        setEditingNominee(null);
                        setNomineePhotoFile(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-[#666666] hover:text-[#111111]"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          let logoUrl = editingNominee.logoUrl;
                          if (nomineePhotoFile && user) {
                            const photoRef = ref(storage, `nominees/${user.uid}/${Date.now()}_${nomineePhotoFile.name}`);
                            await uploadWithTimeout(photoRef, nomineePhotoFile);
                            logoUrl = await getDownloadURL(photoRef);
                          }

                          await updateDoc(doc(db, 'nominees', editingNominee.id), {
                            description: editingNominee.description,
                            website: editingNominee.website,
                            logoUrl
                          });

                          setNominees(prev => prev.map(n => n.id === editingNominee.id ? { ...editingNominee, logoUrl } : n));
                          setEditingNominee(null);
                          setNomineePhotoFile(null);
                        } catch (error) {
                          console.error("Error updating nominee:", error);
                          alert("Failed to update nominee.");
                        }
                      }}
                      className="bg-[#111111] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-black"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

        {activeTab === 'leads' && (
          <div className="px-6 py-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold leading-6 text-[#111111]">Captured Leads</h3>
              <button
                onClick={exportLeads}
                className="inline-flex items-center rounded-md bg-[#FAFAFA] px-4 py-2 text-sm font-semibold text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
            
            {leads.length === 0 ? (
              <div className="text-center py-12 text-[#666666] border border-dashed border-[#EAEAEA] rounded-lg">No leads captured yet. Share your campaign to start collecting!</div>
            ) : (
              <div className="overflow-x-auto border border-[#EAEAEA] rounded-lg">
                <table className="min-w-full divide-y divide-[#EAEAEA]">
                  <thead className="bg-[#FAFAFA]">
                    <tr>
                      <th className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-[#111111]">Email</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-[#111111]">Source</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-[#111111]">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEA] bg-white">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-[#111111]">{lead.email}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-[#666666] capitalize">{lead.source}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-[#666666]">{new Date(lead.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="px-6 py-8">
            <h3 className="text-lg font-semibold text-anthropic-dark font-sans mb-6">Campaign Analytics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Top Nominees Chart */}
              <div className="bg-white p-6 rounded-2xl border border-anthropic-lightGray shadow-sm">
                <h4 className="font-semibold text-anthropic-dark mb-4">Top Nominees by Votes</h4>
                {topNomineesData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={topNomineesData}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
                        <YAxis allowDecimals={false} />
                        <Tooltip cursor={{ fill: '#f5f5f5' }} />
                        <Bar dataKey="votes" fill="#d97757" radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No vote data available yet.
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-white p-6 rounded-2xl border border-anthropic-lightGray shadow-sm flex flex-col justify-center">
                <h4 className="font-semibold text-anthropic-dark mb-6">Overview</h4>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Categories</p>
                    <p className="text-3xl font-semibold text-anthropic-dark">{categories.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Nominees</p>
                    <p className="text-3xl font-semibold text-anthropic-dark">{nominees.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Leads Captured</p>
                    <p className="text-3xl font-semibold text-anthropic-dark">{leads.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="px-6 py-8">
            <div className="mb-8">
              <h3 className="text-lg font-semibold leading-6 text-anthropic-dark">Certificates & Badges</h3>
              <p className="mt-1 text-sm text-anthropic-midGray">Upload your official certificate template and winner badge. Once the award is completed, you can send these directly to the winners.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mb-12">
              {/* Certificate Upload */}
              <div className="bg-anthropic-light border border-anthropic-lightGray rounded-2xl p-6">
                <h4 className="text-base font-semibold text-anthropic-dark mb-2 flex items-center gap-2">
                  <Award className="h-5 w-5" /> Certificate Template
                </h4>
                <p className="text-sm text-anthropic-midGray mb-4">Upload a blank certificate template. We'll automatically place the winner's name and category on it.</p>
                
                {certificateUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-anthropic-lightGray bg-white aspect-[4/3] flex items-center justify-center group mb-4">
                    <img src={certificateUrl} alt="Certificate Template" className="max-h-full object-contain" />
                    <button 
                      onClick={async () => {
                        setCertificateUrl('');
                        await updateDoc(doc(db, 'awards', id!), { certificateUrl: '' });
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-white mb-4">
                    <Award className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-anthropic-dark">No template uploaded</p>
                    <p className="text-xs text-anthropic-midGray mt-1">PNG, JPG up to 5MB</p>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0] && user) {
                        try {
                          const file = e.target.files[0];
                          const photoRef = ref(storage, `awards/${user.uid}/certs/${Date.now()}_${file.name}`);
                          await uploadWithTimeout(photoRef, file);
                          const url = await getDownloadURL(photoRef);
                          setCertificateUrl(url);
                          await updateDoc(doc(db, 'awards', id!), { certificateUrl: url });
                        } catch (err) {
                          alert('Failed to upload certificate');
                        }
                      }
                    }}
                    className="text-sm flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-anthropic-dark file:text-white hover:file:opacity-90 cursor-pointer"
                  />
                </div>
              </div>

              {/* Badge Upload */}
              <div className="bg-anthropic-light border border-anthropic-lightGray rounded-2xl p-6">
                <h4 className="text-base font-semibold text-anthropic-dark mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> Winner Badge
                </h4>
                <p className="text-sm text-anthropic-midGray mb-4">Upload a transparent PNG badge that winners can place on their website or email signature.</p>
                
                {badgeUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-anthropic-lightGray bg-white aspect-[4/3] flex items-center justify-center group mb-4 p-4">
                    <img src={badgeUrl} alt="Winner Badge" className="max-h-full object-contain drop-shadow-md" />
                    <button 
                      onClick={async () => {
                        setBadgeUrl('');
                        await updateDoc(doc(db, 'awards', id!), { badgeUrl: '' });
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-white mb-4">
                    <Sparkles className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-anthropic-dark">No badge uploaded</p>
                    <p className="text-xs text-anthropic-midGray mt-1">Transparent PNG up to 2MB</p>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0] && user) {
                        try {
                          const file = e.target.files[0];
                          const photoRef = ref(storage, `awards/${user.uid}/badges/${Date.now()}_${file.name}`);
                          await uploadWithTimeout(photoRef, file);
                          const url = await getDownloadURL(photoRef);
                          setBadgeUrl(url);
                          await updateDoc(doc(db, 'awards', id!), { badgeUrl: url });
                        } catch (err) {
                          alert('Failed to upload badge');
                        }
                      }
                    }}
                    className="text-sm flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-anthropic-dark file:text-white hover:file:opacity-90 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Send to Winners Action */}
            <div className="bg-white border-2 border-anthropic-dark rounded-2xl p-8 text-center max-w-2xl mx-auto shadow-lg">
              <h3 className="text-2xl font-bold text-anthropic-dark mb-2">Award Completed?</h3>
              <p className="text-anthropic-midGray mb-6">When voting has ended, you can automatically send an email to the top nominee in each category containing their certificate and badge.</p>
              
              <button
                disabled={sendingCertificates || (!certificateUrl && !badgeUrl) || nominees.length === 0}
                onClick={async () => {
                  setSendingCertificates(true);
                  try {
                    // Simulate sending API call
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    alert("Certificates and badges have been successfully sent to the category winners!");
                  } catch (e) {
                    alert("Failed to send certificates.");
                  } finally {
                    setSendingCertificates(false);
                  }
                }}
                className={`inline-flex items-center justify-center rounded-xl px-8 py-3 text-base font-bold shadow-sm transition-all ${
                  (!certificateUrl && !badgeUrl) || nominees.length === 0
                    ? 'bg-anthropic-light text-anthropic-midGray border border-anthropic-lightGray cursor-not-allowed'
                    : 'bg-anthropic-dark text-white hover:opacity-90 transform hover:-translate-y-0.5'
                }`}
              >
                {sendingCertificates ? 'Sending Emails...' : 'Send Assets to Winners'}
              </button>
              {(!certificateUrl && !badgeUrl) && (
                <p className="mt-3 text-sm text-red-500 font-medium">Please upload at least one asset (certificate or badge) to send.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="px-6 py-8">
            <div className="mb-8">
              <h3 className="text-lg font-semibold leading-6 text-[#111111]">Campaign Billing</h3>
              <p className="mt-1 text-sm text-[#666666]">Upgrade your campaign to unlock more features, higher vote limits, and custom branding.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Starter */}
              <div className={`rounded-2xl border ${award?.plan === 'starter' ? 'border-[#111111] ring-1 ring-[#111111]' : 'border-[#EAEAEA]'} p-6 bg-white relative`}>
                {award?.plan === 'starter' && (
                  <span className="absolute top-0 right-6 -translate-y-1/2 bg-[#111111] text-white px-3 py-1 rounded-full text-xs font-semibold">Current Plan</span>
                )}
                <h3 className="text-lg font-semibold text-[#111111]">Starter</h3>
                <p className="mt-4 flex items-baseline gap-x-1">
                  <span className="text-3xl font-bold tracking-tight text-[#111111]">$99</span>
                  <span className="text-sm font-semibold text-[#666666]">/campaign</span>
                </p>
                <ul role="list" className="mt-6 space-y-3 text-sm text-[#666666]">
                  <li className="flex gap-x-3"><Check className="h-5 w-5 flex-none text-[#111111]" /> 30 days duration</li>
                  <li className="flex gap-x-3"><Check className="h-5 w-5 flex-none text-[#111111]" /> Up to 1,000 votes</li>
                  <li className="flex gap-x-3"><Check className="h-5 w-5 flex-none text-[#111111]" /> 50 nominees</li>
                </ul>
                <button
                  onClick={() => handleUpgrade('starter')}
                  disabled={isUpgrading || award?.plan === 'starter'}
                  className={`mt-8 w-full rounded-md px-3 py-2 text-sm font-semibold shadow-sm transition-colors ${
                    award?.plan === 'starter' 
                      ? 'bg-[#FAFAFA] text-[#666666] border border-[#EAEAEA] cursor-not-allowed'
                      : 'bg-[#111111] text-white hover:bg-black'
                  }`}
                >
                  {isUpgrading ? 'Processing...' : award?.plan === 'starter' ? 'Current Plan' : 'Select Starter'}
                </button>
              </div>

              {/* Growth */}
              <div className={`rounded-2xl border ${award?.plan === 'growth' ? 'border-[#111111] ring-1 ring-[#111111]' : 'border-[#EAEAEA]'} p-6 bg-[#FAFAFA] relative`}>
                {award?.plan === 'growth' ? (
                  <span className="absolute top-0 right-6 -translate-y-1/2 bg-[#111111] text-white px-3 py-1 rounded-full text-xs font-semibold">Current Plan</span>
                ) : (
                  <span className="absolute top-0 right-6 -translate-y-1/2 bg-[#EAEAEA] text-[#111111] px-3 py-1 rounded-full text-xs font-semibold">Recommended</span>
                )}
                <h3 className="text-lg font-semibold text-[#111111]">Growth</h3>
                <p className="mt-4 flex items-baseline gap-x-1">
                  <span className="text-3xl font-bold tracking-tight text-[#111111]">$149</span>
                  <span className="text-sm font-semibold text-[#666666]">/campaign</span>
                </p>
                <ul role="list" className="mt-6 space-y-3 text-sm text-[#666666]">
                  <li className="flex gap-x-3"><Check className="h-5 w-5 flex-none text-[#111111]" /> 60 days duration</li>
                  <li className="flex gap-x-3"><Check className="h-5 w-5 flex-none text-[#111111]" /> Up to 10,000 votes</li>
                  <li className="flex gap-x-3"><Check className="h-5 w-5 flex-none text-[#111111]" /> 250 nominees</li>
                  <li className="flex gap-x-3"><Check className="h-5 w-5 flex-none text-[#111111]" /> AI Automation Tools</li>
                </ul>
                <button
                  onClick={() => handleUpgrade('growth')}
                  disabled={isUpgrading || award?.plan === 'growth'}
                  className={`mt-8 w-full rounded-md px-3 py-2 text-sm font-semibold shadow-sm transition-colors ${
                    award?.plan === 'growth' 
                      ? 'bg-white text-[#666666] border border-[#EAEAEA] cursor-not-allowed'
                      : 'bg-[#111111] text-white hover:bg-black'
                  }`}
                >
                  {isUpgrading ? 'Processing...' : award?.plan === 'growth' ? 'Current Plan' : 'Select Growth'}
                </button>
              </div>

              {/* Pro */}
              <div className={`rounded-2xl border ${award?.plan === 'pro' ? 'border-[#111111] ring-1 ring-[#111111]' : 'border-[#EAEAEA]'} p-6 bg-white relative`}>
                {award?.plan === 'pro' && (
                  <span className="absolute top-0 right-6 -translate-y-1/2 bg-[#111111] text-white px-3 py-1 rounded-full text-xs font-semibold">Current Plan</span>
                )}
                <h3 className="text-lg font-semibold text-[#111111]">Pro</h3>
                <p className="mt-4 flex items-baseline gap-x-1">
                  <span className="text-3xl font-bold tracking-tight text-[#111111]">$199</span>
                  <span className="text-sm font-semibold text-[#666666]">/campaign</span>
                </p>
                <ul role="list" className="mt-6 space-y-3 text-sm text-[#666666]">
                  <li className="flex gap-x-3"><Check className="h-5 w-5 flex-none text-[#111111]" /> 90 days duration</li>
                  <li className="flex gap-x-3"><Check className="h-5 w-5 flex-none text-[#111111]" /> Unlimited votes</li>
                  <li className="flex gap-x-3"><Check className="h-5 w-5 flex-none text-[#111111]" /> Unlimited nominees</li>
                  <li className="flex gap-x-3"><Check className="h-5 w-5 flex-none text-[#111111]" /> Custom Domain</li>
                </ul>
                <button
                  onClick={() => handleUpgrade('pro')}
                  disabled={isUpgrading || award?.plan === 'pro'}
                  className={`mt-8 w-full rounded-md px-3 py-2 text-sm font-semibold shadow-sm transition-colors ${
                    award?.plan === 'pro' 
                      ? 'bg-[#FAFAFA] text-[#666666] border border-[#EAEAEA] cursor-not-allowed'
                      : 'bg-[#111111] text-white hover:bg-black'
                  }`}
                >
                  {isUpgrading ? 'Processing...' : award?.plan === 'pro' ? 'Current Plan' : 'Select Pro'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'publish' && (
          <div className="px-6 py-8">
            <div className="mb-8">
              <h3 className="text-lg font-semibold leading-6 text-[#111111]">Publish & Share</h3>
              <p className="mt-1 text-sm text-[#666666]">Share your award campaign with the world.</p>
            </div>

            <div className="space-y-6">
              {/* Direct Link */}
              <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl p-6">
                <h4 className="text-base font-semibold text-[#111111] flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" /> Direct Link
                </h4>
                <p className="mt-2 text-sm text-[#666666]">Share this link directly with your audience.</p>
                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/award/${id}`}
                    className="block w-full rounded-md border-0 py-2 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] bg-white sm:text-sm sm:leading-6 px-3"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/award/${id}`);
                      alert('Link copied to clipboard!');
                    }}
                    className="inline-flex items-center rounded-md bg-[#111111] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black transition-colors whitespace-nowrap"
                  >
                    Copy Link
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <a
                    href={`https://twitter.com/intent/tweet?text=Vote+now+for+${encodeURIComponent(award?.name || 'our award')}!&url=${encodeURIComponent(`${window.location.origin}/award/${id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#111] transition-colors"
                  >
                    Share on X (Twitter)
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/award/${id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-[#0A66C2] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0958a8] transition-colors"
                  >
                    Share on LinkedIn
                  </a>
                </div>
              </div>

              {/* Add to Directory */}
              <div className="bg-white border border-[#EAEAEA] rounded-xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-[#111111] flex items-center gap-2">
                      <Globe className="h-5 w-5" /> List in Public Directory
                    </h4>
                    <p className="mt-1.5 text-sm text-[#666666] leading-relaxed">
                      Show your award on the public <a href="/directory" target="_blank" className="underline text-[#111111]">Awards Directory</a> — visible to everyone browsing live campaigns on our site.
                    </p>
                    {isPublicDirectory && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs font-medium text-green-700">Listed in directory</span>
                        <a
                          href="/directory"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#666] underline ml-2"
                        >
                          View listing →
                        </a>
                      </div>
                    )}
                  </div>
                  <button
                    disabled={savingDirectory}
                    onClick={async () => {
                      if (!id) return;
                      setSavingDirectory(true);
                      try {
                        const newVal = !isPublicDirectory;
                        await updateDoc(doc(db, 'awards', id), { isPublicDirectory: newVal });
                        setIsPublicDirectory(newVal);
                      } catch (e) {
                        console.error(e);
                      } finally {
                        setSavingDirectory(false);
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isPublicDirectory ? 'bg-[#111111]' : 'bg-[#EAEAEA]'}`}
                    role="switch"
                    aria-checked={isPublicDirectory}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isPublicDirectory ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>
              </div>

              {/* Embed Code */}
              <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl p-6">
                <h4 className="text-base font-semibold text-[#111111] flex items-center gap-2">
                  <Code className="h-5 w-5" /> Embed on your Website
                </h4>
                <p className="mt-2 text-sm text-[#666666]">Copy and paste this snippet into your website's HTML to embed the voting widget.</p>
                <div className="mt-4 relative">
                  <textarea
                    readOnly
                    rows={4}
                    value={`<iframe src="${window.location.origin}/award/${id}?embed=true" width="100%" height="800px" frameborder="0" style="border: 1px solid #EAEAEA; border-radius: 12px;"></iframe>`}
                    className="block w-full rounded-md border-0 py-3 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] bg-white font-mono text-sm px-3"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`<iframe src="${window.location.origin}/award/${id}?embed=true" width="100%" height="800px" frameborder="0" style="border: 1px solid #EAEAEA; border-radius: 12px;"></iframe>`);
                      alert('Embed code copied!');
                    }}
                    className="absolute top-3 right-3 inline-flex items-center rounded-md bg-[#FAFAFA] px-3 py-1.5 text-xs font-semibold text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] hover:bg-gray-50 transition-colors"
                  >
                    Copy Code
                  </button>
                </div>
              </div>

              {/* Custom Domain (Pro Only) */}
              <div className={`border rounded-xl p-6 ${hasProAccess ? 'border-[#EAEAEA] bg-white' : 'border-[#EAEAEA] bg-[#FAFAFA] opacity-75'}`}>
                <h4 className="text-base font-semibold text-[#111111] flex items-center gap-2">
                  <Globe className="h-5 w-5" /> Custom Domain
                  {!hasProAccess && (
                    <span className="inline-flex items-center rounded-full bg-[#EAEAEA] px-2 py-0.5 text-xs font-medium text-[#666666]">Pro Plan Required</span>
                  )}
                  {billingBypass && (
                    <span className="inline-flex items-center rounded-full bg-[#111111] px-2 py-0.5 text-xs font-medium text-white">Admin Approved</span>
                  )}
                </h4>
                <p className="mt-2 text-sm text-[#666666]">Host this campaign on your own domain (e.g., <code className="font-mono text-xs bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded">awards.yourcompany.com</code>).</p>

                {hasProAccess ? (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="awards.yourcompany.com"
                        value={customDomain}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomDomain(e.target.value)}
                        className="block w-full rounded-md border-0 py-2 text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] bg-white sm:text-sm sm:leading-6 px-3"
                      />
                      <button
                        disabled={savingDomain}
                        onClick={async () => {
                          if (!id) return;
                          setSavingDomain(true);
                          try {
                            const newDomain = customDomain.trim();
                            // First save to our database
                            await updateDoc(doc(db, 'awards', id), { customDomain: newDomain });
                            
                            // If Vercel API is available, call it to dynamically provision the SSL
                            if (newDomain) {
                              try {
                                await fetch('/api/add-domain', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ domain: newDomain })
                                });
                              } catch (err) {
                                console.warn('Could not provision via Vercel API automatically. You may need to manually add it in the Vercel Dashboard if the API route is missing.');
                              }
                            }
                            
                            setDomainSaved(true);
                            setTimeout(() => setDomainSaved(false), 3000);
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setSavingDomain(false);
                          }
                        }}
                        className="inline-flex items-center rounded-md bg-[#111111] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black transition-colors whitespace-nowrap"
                      >
                        {domainSaved ? <><Check className="h-4 w-4 mr-1.5" /> Saved</> : savingDomain ? 'Saving...' : 'Save Domain'}
                      </button>
                    </div>

                    {/* DNS Instructions */}
                    {customDomain && (
                      <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-lg p-4 space-y-3">
                        <p className="text-xs font-semibold text-[#111111] uppercase tracking-wide">DNS Setup Instructions</p>
                        <p className="text-xs text-[#666666]">Add the following CNAME record to your domain's DNS settings:</p>
                        <div className="bg-white border border-[#EAEAEA] rounded-md overflow-hidden">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-[#EAEAEA] bg-[#FAFAFA]">
                                <th className="text-left px-3 py-2 font-semibold text-[#111111]">Type</th>
                                <th className="text-left px-3 py-2 font-semibold text-[#111111]">Name</th>
                                <th className="text-left px-3 py-2 font-semibold text-[#111111]">Value</th>
                                <th className="text-left px-3 py-2 font-semibold text-[#111111]">TTL</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-3 py-2 font-mono text-[#111111]">CNAME</td>
                                <td className="px-3 py-2 font-mono text-[#111111]">{customDomain.split('.')[0]}</td>
                                <td className="px-3 py-2 font-mono text-[#111111]">proxy.theawardsapp.com</td>
                                <td className="px-3 py-2 font-mono text-[#666]">3600</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <p className="text-xs text-[#999]">DNS changes can take up to 48 hours to propagate. Contact support once you've added the record.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    <button
                      onClick={() => setActiveTab('billing')}
                      className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#111111] shadow-sm ring-1 ring-inset ring-[#EAEAEA] hover:bg-[#FAFAFA] transition-colors"
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
