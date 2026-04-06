import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Globe,
  Sparkles,
  Target,
  Upload,
  Wand2
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

type Category = {
  name: string;
  description: string;
};

const steps = [
  { id: 1, label: 'Brief', title: 'Describe the campaign you want to launch' },
  { id: 2, label: 'Timeline', title: 'Choose when nominations and voting should happen' },
  { id: 3, label: 'Categories', title: 'Shape the categories people will vote for' },
  { id: 4, label: 'Launch', title: 'Your campaign is ready to publish' },
];

const quickBriefs = [
  'Launch a SaaS awards campaign for B2B founders and operators',
  'Create a real estate awards campaign for top agents and local vendors',
  'Build a marketing awards campaign for agencies and in-house growth teams',
];

export default function CreateAwardWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [awardId, setAwardId] = useState<string | null>(null);
  const [campaignBrief, setCampaignBrief] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [landingPageUrl, setLandingPageUrl] = useState('');
  const [nominationOpenDate, setNominationOpenDate] = useState('');
  const [votingStartDate, setVotingStartDate] = useState('');
  const [votingEndDate, setVotingEndDate] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isGeneratingCategories, setIsGeneratingCategories] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);

  const geminiApiKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ??
    (typeof process !== 'undefined' ? (process as any).env?.GEMINI_API_KEY : undefined);

  const ai = useMemo(() => {
    if (!geminiApiKey) return null;
    return new GoogleGenAI({ apiKey: geminiApiKey });
  }, [geminiApiKey]);

  const canContinueFromStepOne = Boolean(name.trim() && description.trim());
  const canContinueFromStepTwo = Boolean(nominationOpenDate && votingStartDate && votingEndDate);
  const canPublish = Boolean(name.trim() && description.trim() && categories.length > 0);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCampaignDraft = async () => {
    if (!campaignBrief.trim()) {
      alert('Add a short brief first so AI knows what to build.');
      return;
    }

    if (!ai) {
      alert('AI is not configured. Set VITE_GEMINI_API_KEY in a local .env file to enable the AI draft flow.');
      return;
    }

    setIsGeneratingDraft(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are helping create an award campaign. Based on this brief: "${campaignBrief}", return ONLY valid JSON with this shape: {"name":"string","description":"string","categories":[{"name":"string","description":"string"}]}. Keep the title punchy, the description under 220 characters, and suggest 5 strong categories.`,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const generated = JSON.parse(response.text);
      if (generated.name) setName(generated.name);
      if (generated.description) setDescription(generated.description);
      if (Array.isArray(generated.categories) && generated.categories.length > 0) {
        setCategories(
          generated.categories.map((entry: Category) => ({
            name: entry.name,
            description: entry.description,
          }))
        );
      }
    } catch (error) {
      console.error('Error generating campaign draft:', error);
      alert('Failed to generate an AI draft.');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const generateCategories = async () => {
    if (!name || !description) {
      alert('Please add the campaign name and description first.');
      return;
    }
    if (!ai) {
      alert('AI is not configured. Set VITE_GEMINI_API_KEY in a local .env file to enable category generation.');
      return;
    }

    setIsGeneratingCategories(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Suggest 5 award categories for an award campaign named "${name}" with this description: "${description}". Return ONLY a JSON array of objects with "name" and "description" properties. No markdown.`,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const generated = JSON.parse(response.text);
      setCategories(generated);
    } catch (error) {
      console.error('Error generating categories:', error);
      alert('Failed to generate categories.');
    } finally {
      setIsGeneratingCategories(false);
    }
  };

  const handleCreateAndPublish = async () => {
    if (!user) return;
    if (!canPublish) {
      alert('Please add at least one category before publishing.');
      return;
    }

    setLoading(true);
    try {
      let logoUrl = '';
      if (logoFile) {
        const logoRef = ref(storage, `awards/${user.uid}/${Date.now()}_${logoFile.name}`);
        await uploadBytes(logoRef, logoFile);
        logoUrl = await getDownloadURL(logoRef);
      }

      const awardRef = await addDoc(collection(db, 'awards'), {
        ownerId: user.uid,
        name,
        description,
        logoUrl,
        status: 'published',
        createdAt: new Date().toISOString(),
        nominationEndDate: nominationOpenDate,
        votingStartDate,
        votingEndDate,
        links: {
          landingPage: landingPageUrl
        }
      });

      for (const category of categories) {
        await addDoc(collection(db, 'categories'), {
          awardId: awardRef.id,
          name: category.name,
          description: category.description,
          status: 'published'
        });
      }

      setAwardId(awardRef.id);
      setStep(4);
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign.');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = steps.find((entry) => entry.id === step) ?? steps[0];

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[28px] border border-[#EAEAEA] bg-white shadow-[0_24px_80px_rgba(17,17,17,0.06)] overflow-hidden">
          <div className="grid lg:grid-cols-[280px_1fr]">
            <aside className="border-b border-[#EAEAEA] bg-[#111111] px-6 py-8 text-white lg:border-b-0 lg:border-r lg:border-r-white/10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-[#D6D6D6]">
                <Sparkles className="h-3.5 w-3.5 text-[#C8860A]" />
                AI-powered campaign builder
              </div>
              <h1 className="mt-6 text-3xl font-bold tracking-tight">New Campaign</h1>
              <p className="mt-3 text-sm leading-6 text-[#999999]">
                Build your campaign in a guided flow that feels closer to a conversation than a form.
              </p>
              <div className="mt-8 space-y-3">
                {steps.map((entry) => {
                  const isActive = step === entry.id;
                  const isDone = step > entry.id;

                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => {
                        if (entry.id < 4 || awardId) setStep(entry.id);
                      }}
                      className={`w-full rounded-2xl border px-4 py-4 text-left transition-colors ${
                        isActive
                          ? 'border-white/15 bg-white text-[#111111]'
                          : isDone
                            ? 'border-white/10 bg-white/10 text-white'
                            : 'border-white/10 bg-transparent text-[#D6D6D6] hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${isActive ? 'bg-[#111111] text-white' : isDone ? 'bg-[#C8860A] text-[#111111]' : 'bg-white/10 text-white'}`}>
                          {isDone ? '✓' : entry.id}
                        </span>
                        <div>
                          <p className={`text-xs uppercase tracking-[0.2em] ${isActive ? 'text-[#666666]' : 'text-[#999999]'}`}>{entry.label}</p>
                          <p className={`mt-1 text-sm font-medium ${isActive ? 'text-[#111111]' : 'text-white'}`}>{entry.title}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#999999]">Live preview</p>
                <div className="mt-4 rounded-2xl border border-white/10 bg-[#0B0B0B] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">{name || 'Your campaign title'}</p>
                      <p className="mt-2 text-sm leading-6 text-[#999999]">
                        {description || 'Your AI-generated campaign summary will appear here as you build.'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Campaign logo preview" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <Target className="h-5 w-5 text-[#C8860A]" />
                      )}
                    </div>
                  </div>
                  <div className="mt-5 space-y-2">
                    {categories.slice(0, 3).map((category: Category) => (
                      <div key={category.name} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#D6D6D6]">
                        {category.name}
                      </div>
                    ))}
                    {categories.length === 0 && (
                      <div className="rounded-xl border border-dashed border-white/10 px-3 py-2 text-sm text-[#777777]">
                        Categories will appear here after AI suggests them.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>

            <section className="px-6 py-8 sm:px-8 lg:px-12 lg:py-12">
              <div className="flex items-center justify-between gap-4 border-b border-[#EAEAEA] pb-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#999999]">{currentStep.label}</p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#111111]">{currentStep.title}</h2>
                </div>
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#EAEAEA] bg-[#FAFAFA] px-3 py-2 text-xs text-[#666666]">
                  <span>Step {step}</span>
                  <span className="text-[#D0D0D0]">/</span>
                  <span>{steps.length}</span>
                </div>
              </div>

              {step === 1 && (
                <div className="mt-8 space-y-8">
                  <div className="rounded-[24px] border border-[#EAEAEA] bg-[#FAFAFA] p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#666666] border border-[#EAEAEA]">
                        <Wand2 className="h-3.5 w-3.5 text-[#C8860A]" />
                        Start with a short brief
                      </span>
                    </div>
                    <textarea
                      value={campaignBrief}
                      onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setCampaignBrief(event.target.value)}
                      rows={5}
                      placeholder="Example: Launch a premium awards campaign for top B2B SaaS products. We want founders, operators, and investors to nominate tools, capture leads, and drive social sharing."
                      className="mt-5 w-full resize-none border-0 bg-transparent p-0 text-2xl font-medium leading-10 tracking-tight text-[#111111] outline-none placeholder:text-[#B3B3B3]"
                    />
                    <div className="mt-6 flex flex-wrap gap-3">
                      {quickBriefs.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => setCampaignBrief(prompt)}
                          className="rounded-full border border-[#EAEAEA] bg-white px-4 py-2 text-sm text-[#666666] transition-colors hover:border-[#111111] hover:text-[#111111]"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={generateCampaignDraft}
                        disabled={isGeneratingDraft}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
                      >
                        <Sparkles className="h-4 w-4" />
                        {isGeneratingDraft ? 'Generating draft...' : 'Generate with AI'}
                      </button>
                      <div className="inline-flex items-center rounded-xl border border-[#EAEAEA] bg-white px-4 py-3 text-sm text-[#666666]">
                        {ai ? 'AI is connected and ready to draft your campaign.' : 'AI is optional. You can still build everything manually.'}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-5">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#111111]">Campaign name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
                          className="w-full rounded-2xl border border-[#EAEAEA] px-4 py-4 text-lg text-[#111111] outline-none transition-colors focus:border-[#111111]"
                          placeholder="SaaS Excellence Awards 2026"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#111111]">Campaign description</label>
                        <textarea
                          value={description}
                          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(event.target.value)}
                          rows={4}
                          className="w-full rounded-2xl border border-[#EAEAEA] px-4 py-4 text-base text-[#111111] outline-none transition-colors focus:border-[#111111]"
                          placeholder="Tell nominees and voters why this campaign exists."
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#111111]">Landing page URL</label>
                        <div className="relative">
                          <Globe className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />
                          <input
                            type="url"
                            value={landingPageUrl}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setLandingPageUrl(event.target.value)}
                            className="w-full rounded-2xl border border-[#EAEAEA] py-4 pl-11 pr-4 text-base text-[#111111] outline-none transition-colors focus:border-[#111111]"
                            placeholder="https://www.theawardsapp.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-dashed border-[#EAEAEA] bg-[#FCFCFC] p-6">
                      <label className="block text-sm font-medium text-[#111111]">Campaign logo</label>
                      <div className="mt-5 flex min-h-[280px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#EAEAEA] bg-white px-6 py-10 text-center">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo preview" className="mb-5 h-24 w-24 rounded-2xl object-cover shadow-sm" />
                        ) : (
                          <div className="mb-5 rounded-2xl border border-[#EAEAEA] bg-[#FAFAFA] p-5">
                            <Upload className="h-8 w-8 text-[#666666]" />
                          </div>
                        )}
                        <p className="text-lg font-semibold text-[#111111]">
                          {logoPreview ? 'Logo ready to go' : 'Drop in your logo'}
                        </p>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-[#666666]">
                          Add a brand mark so your public campaign page feels polished from the first share.
                        </p>
                        <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#EAEAEA] bg-white px-4 py-3 text-sm font-medium text-[#111111] transition-colors hover:border-[#111111]">
                          <Upload className="h-4 w-4" />
                          {logoPreview ? 'Replace logo' : 'Upload logo'}
                          <input type="file" className="sr-only" accept="image/*" onChange={handleLogoChange} />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!canContinueFromStepOne}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-50"
                    >
                      Continue to timeline
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="mt-8 space-y-8">
                  <div className="grid gap-5 md:grid-cols-3">
                    {[
                      {
                        label: 'Nomination opens',
                        value: nominationOpenDate,
                        setValue: setNominationOpenDate,
                      },
                      {
                        label: 'Voting starts',
                        value: votingStartDate,
                        setValue: setVotingStartDate,
                      },
                      {
                        label: 'Voting ends',
                        value: votingEndDate,
                        setValue: setVotingEndDate,
                      },
                    ].map((entry) => (
                      <div key={entry.label} className="rounded-[24px] border border-[#EAEAEA] bg-[#FAFAFA] p-5">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl border border-[#EAEAEA] bg-white p-3">
                            <CalendarDays className="h-5 w-5 text-[#111111]" />
                          </div>
                          <p className="text-sm font-medium text-[#111111]">{entry.label}</p>
                        </div>
                        <input
                          type="date"
                          value={entry.value}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) => entry.setValue(event.target.value)}
                          className="mt-5 w-full rounded-2xl border border-[#EAEAEA] bg-white px-4 py-4 text-base text-[#111111] outline-none transition-colors focus:border-[#111111]"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[24px] border border-[#EAEAEA] bg-white p-6">
                    <p className="text-sm font-medium text-[#111111]">How this flow feels to voters and nominees</p>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-[#EAEAEA] bg-[#FAFAFA] p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#999999]">Phase 1</p>
                        <p className="mt-2 text-base font-semibold text-[#111111]">Nominations open</p>
                        <p className="mt-2 text-sm leading-6 text-[#666666]">Drive inbound submissions and start building your audience list.</p>
                      </div>
                      <div className="rounded-2xl border border-[#EAEAEA] bg-[#FAFAFA] p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#999999]">Phase 2</p>
                        <p className="mt-2 text-base font-semibold text-[#111111]">Voting begins</p>
                        <p className="mt-2 text-sm leading-6 text-[#666666]">Turn nominations into sharing loops and qualified traffic.</p>
                      </div>
                      <div className="rounded-2xl border border-[#EAEAEA] bg-[#FAFAFA] p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#999999]">Phase 3</p>
                        <p className="mt-2 text-base font-semibold text-[#111111]">Campaign closes</p>
                        <p className="mt-2 text-sm leading-6 text-[#666666]">Use your dashboard to convert winners, nominees, and voters into leads.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EAEAEA] px-6 py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#FAFAFA]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!canContinueFromStepTwo}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111111] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-50"
                    >
                      Continue to categories
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="mt-8 space-y-8">
                  <div className="rounded-[24px] border border-[#EAEAEA] bg-[#FAFAFA] p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#111111]">AI category suggestions</p>
                        <p className="mt-1 text-sm text-[#666666]">Generate category ideas from your campaign brief, then edit them inline.</p>
                      </div>
                      <button
                        type="button"
                        onClick={generateCategories}
                        disabled={isGeneratingCategories}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EAEAEA] bg-white px-4 py-3 text-sm font-semibold text-[#111111] transition-colors hover:border-[#111111] disabled:opacity-60"
                      >
                        <Sparkles className="h-4 w-4 text-[#C8860A]" />
                        {!ai ? 'AI unavailable' : isGeneratingCategories ? 'Generating...' : 'Generate categories'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {categories.map((category: Category, index: number) => (
                      <div key={`${category.name}-${index}`} className="rounded-[24px] border border-[#EAEAEA] bg-white p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={category.name}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                const next = [...categories];
                                next[index].name = event.target.value;
                                setCategories(next);
                              }}
                              className="w-full border-0 p-0 text-xl font-semibold text-[#111111] outline-none"
                            />
                            <textarea
                              value={category.description}
                              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                                const next = [...categories];
                                next[index].description = event.target.value;
                                setCategories(next);
                              }}
                              rows={2}
                              className="mt-3 w-full resize-none border-0 p-0 text-sm leading-6 text-[#666666] outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setCategories(categories.filter((_: Category, categoryIndex: number) => categoryIndex !== index))}
                            className="rounded-xl border border-[#EAEAEA] px-3 py-2 text-sm font-medium text-[#666666] transition-colors hover:border-[#111111] hover:text-[#111111]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}

                    {categories.length === 0 && (
                      <div className="rounded-[24px] border border-dashed border-[#EAEAEA] bg-[#FCFCFC] px-6 py-12 text-center">
                        <p className="text-lg font-semibold text-[#111111]">No categories yet</p>
                        <p className="mt-2 text-sm text-[#666666]">Use AI to generate the first set or add them manually below.</p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setCategories([...categories, { name: 'New Category', description: 'Describe what makes this category worth winning.' }])}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#EAEAEA] bg-[#FAFAFA] px-4 py-3 text-sm font-semibold text-[#111111] transition-colors hover:border-[#111111]"
                    >
                      <Target className="h-4 w-4" />
                      Add category manually
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EAEAEA] px-6 py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#FAFAFA]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateAndPublish}
                      disabled={loading || !canPublish}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111111] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-50"
                    >
                      {loading ? 'Publishing...' : 'Create & publish'}
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="flex min-h-[70vh] items-center justify-center py-8">
                  <div className="max-w-2xl text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#111111] text-white">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <p className="mt-8 text-xs font-medium uppercase tracking-[0.24em] text-[#999999]">Campaign published</p>
                    <h3 className="mt-3 text-4xl font-bold tracking-tight text-[#111111]">Your campaign is live.</h3>
                    <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-[#666666]">
                      The structure, timeline, and categories are ready. Head to the dashboard to customize the experience and start driving nominations.
                    </p>
                    <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => navigate(`/dashboard/award/${awardId}`)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111111] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
                      >
                        Go to dashboard
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/award/${awardId}`)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EAEAEA] px-6 py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#FAFAFA]"
                      >
                        View public page
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
