import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ArrowRight, ArrowLeft, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export default function CreateAwardWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [awardId, setAwardId] = useState<string | null>(null);

  const geminiApiKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ??
    (typeof process !== 'undefined' ? (process as any).env?.GEMINI_API_KEY : undefined);

  const ai = useMemo(() => {
    if (!geminiApiKey) return null;
    return new GoogleGenAI({ apiKey: geminiApiKey });
  }, [geminiApiKey]);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [landingPageUrl, setLandingPageUrl] = useState('');
  
  const [nominationOpenDate, setNominationOpenDate] = useState('');
  const [votingStartDate, setVotingStartDate] = useState('');
  const [votingEndDate, setVotingEndDate] = useState('');

  const [categories, setCategories] = useState<{name: string, description: string}[]>([]);
  const [isGeneratingCategories, setIsGeneratingCategories] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCategories = async () => {
    if (!name || !description) return alert("Please provide award name and description first.");
    if (!ai) return alert("AI is not configured. Set VITE_GEMINI_API_KEY in a local .env file to enable category generation.");
    setIsGeneratingCategories(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Suggest 5 award categories for an award named "${name}" with description "${description}". Return ONLY a JSON array of objects with "name" and "description" properties. No markdown formatting.`,
        config: {
          responseMimeType: "application/json",
        }
      });
      const generated = JSON.parse(response.text);
      setCategories(generated);
    } catch (error) {
      console.error("Error generating categories:", error);
      alert("Failed to generate categories.");
    } finally {
      setIsGeneratingCategories(false);
    }
  };

  const handleCreateAndPublish = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let logoUrl = '';
      if (logoFile) {
        const logoRef = ref(storage, `awards/${user.uid}/${Date.now()}_${logoFile.name}`);
        await uploadBytes(logoRef, logoFile);
        logoUrl = await getDownloadURL(logoRef);
      }

      // Create Award
      const awardRef = await addDoc(collection(db, 'awards'), {
        ownerId: user.uid,
        name,
        description,
        logoUrl,
        status: 'published', // Auto-publish as requested
        createdAt: new Date().toISOString(),
        nominationEndDate: nominationOpenDate, // Actually nomination open date, but keeping field name for now or we can add new ones
        votingStartDate,
        votingEndDate,
        links: {
          landingPage: landingPageUrl
        }
      });

      // Create Categories
      for (const cat of categories) {
        await addDoc(collection(db, 'categories'), {
          awardId: awardRef.id,
          name: cat.name,
          description: cat.description,
          status: 'published'
        });
      }

      setAwardId(awardRef.id);
      setStep(4); // Success step
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? 'bg-[#111111] text-white' : 'bg-white border border-[#EAEAEA] text-[#666666]'}`}>
                  {s === 4 ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#EAEAEA] -z-10 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-0 h-0.5 bg-[#111111] -z-10 -translate-y-1/2 transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-xl border border-[#EAEAEA] p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#111111]">Basic Details</h2>
                <p className="text-[#666666] mt-1">Let's start with the basics of your award campaign.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Award Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-md border border-[#EAEAEA] px-3 py-2 focus:ring-[#111111] focus:border-[#111111]" placeholder="e.g., SaaS Excellence Awards 2026" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-md border border-[#EAEAEA] px-3 py-2 focus:ring-[#111111] focus:border-[#111111]" placeholder="Describe the purpose of this award..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Landing Page URL</label>
                <input type="url" value={landingPageUrl} onChange={e => setLandingPageUrl(e.target.value)} className="w-full rounded-md border border-[#EAEAEA] px-3 py-2 focus:ring-[#111111] focus:border-[#111111]" placeholder="https://yourwebsite.com" />
                <p className="text-xs text-[#666666] mt-1">Clicking your logo will redirect here.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Award Logo</label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-[#EAEAEA] px-6 py-10">
                  <div className="text-center">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Preview" className="mx-auto h-24 object-contain mb-4" />
                    ) : (
                      <Upload className="mx-auto h-12 w-12 text-[#666666]" aria-hidden="true" />
                    )}
                    <div className="mt-4 flex text-sm leading-6 text-[#666666] justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-[#111111] focus-within:outline-none hover:underline">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleLogoChange} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button onClick={() => setStep(2)} disabled={!name} className="bg-[#111111] text-white px-6 py-2 rounded-md font-medium hover:bg-black disabled:opacity-50 flex items-center gap-2">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#111111]">Timeline</h2>
                <p className="text-[#666666] mt-1">Set the important dates for your campaign.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Nomination Open Date</label>
                <input type="date" value={nominationOpenDate} onChange={e => setNominationOpenDate(e.target.value)} className="w-full rounded-md border border-[#EAEAEA] px-3 py-2 focus:ring-[#111111] focus:border-[#111111]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Voting Start Date</label>
                <input type="date" value={votingStartDate} onChange={e => setVotingStartDate(e.target.value)} className="w-full rounded-md border border-[#EAEAEA] px-3 py-2 focus:ring-[#111111] focus:border-[#111111]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Voting End Date</label>
                <input type="date" value={votingEndDate} onChange={e => setVotingEndDate(e.target.value)} className="w-full rounded-md border border-[#EAEAEA] px-3 py-2 focus:ring-[#111111] focus:border-[#111111]" />
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="text-[#111111] px-6 py-2 rounded-md font-medium border border-[#EAEAEA] hover:bg-[#FAFAFA] flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => setStep(3)} className="bg-[#111111] text-white px-6 py-2 rounded-md font-medium hover:bg-black flex items-center gap-2">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#111111]">Categories</h2>
                <p className="text-[#666666] mt-1">Define the categories for your award. You can use AI to suggest them based on your description.</p>
              </div>

              <button 
                onClick={generateCategories} 
                disabled={isGeneratingCategories || !ai}
                className="w-full bg-[#FAFAFA] border border-[#EAEAEA] text-[#111111] px-4 py-3 rounded-md font-medium hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                {!ai ? 'Auto-Generate Categories with AI (configure API key)' : isGeneratingCategories ? 'Generating...' : 'Auto-Generate Categories with AI'}
              </button>

              <div className="space-y-4 mt-6">
                {categories.map((cat, idx) => (
                  <div key={idx} className="p-4 border border-[#EAEAEA] rounded-lg relative">
                    <button 
                      onClick={() => setCategories(categories.filter((_, i) => i !== idx))}
                      className="absolute top-4 right-4 text-red-500 text-sm hover:underline"
                    >
                      Remove
                    </button>
                    <input 
                      type="text" 
                      value={cat.name} 
                      onChange={e => {
                        const newCats = [...categories];
                        newCats[idx].name = e.target.value;
                        setCategories(newCats);
                      }}
                      className="font-semibold text-[#111111] w-full mb-2 border-none p-0 focus:ring-0" 
                    />
                    <textarea 
                      value={cat.description}
                      onChange={e => {
                        const newCats = [...categories];
                        newCats[idx].description = e.target.value;
                        setCategories(newCats);
                      }}
                      className="text-sm text-[#666666] w-full border-none p-0 focus:ring-0 resize-none"
                      rows={2}
                    />
                  </div>
                ))}
                <button 
                  onClick={() => setCategories([...categories, { name: 'New Category', description: 'Description here' }])}
                  className="text-sm text-[#111111] font-medium hover:underline"
                >
                  + Add Category Manually
                </button>
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(2)} className="text-[#111111] px-6 py-2 rounded-md font-medium border border-[#EAEAEA] hover:bg-[#FAFAFA] flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={handleCreateAndPublish} disabled={loading} className="bg-[#111111] text-white px-6 py-2 rounded-md font-medium hover:bg-black flex items-center gap-2">
                  {loading ? 'Creating...' : 'Create & Publish'} <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-12 space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-[#111111]">Campaign Published!</h2>
              <p className="text-[#666666] max-w-md mx-auto">
                Your award campaign has been successfully created and published. You can now start accepting nominations or votes.
              </p>
              <div className="pt-6 flex justify-center gap-4">
                <button onClick={() => navigate(`/dashboard/award/${awardId}`)} className="bg-[#111111] text-white px-6 py-2 rounded-md font-medium hover:bg-black">
                  Go to Dashboard
                </button>
                <button onClick={() => navigate(`/award/${awardId}`)} className="text-[#111111] px-6 py-2 rounded-md font-medium border border-[#EAEAEA] hover:bg-[#FAFAFA]">
                  View Public Page
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
