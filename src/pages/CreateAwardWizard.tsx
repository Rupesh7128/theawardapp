import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Globe,
  Sparkles,
  Target,
  Upload,
  Wand2,
  X
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../lib/firebase';

type Category = {
  name: string;
  description: string;
};

type QuestionId =
  | 'brief'
  | 'name'
  | 'description'
  | 'landing'
  | 'logo'
  | 'nomination'
  | 'votingStart'
  | 'votingEnd'
  | 'categories'
  | 'review';

const quickBriefs = [
  'Launch a SaaS awards campaign for B2B founders and operators',
  'Create a real estate awards campaign for top agents and local vendors',
  'Build a marketing awards campaign for agencies and in-house growth teams',
];

const questions: Array<{
  id: QuestionId;
  eyebrow: string;
  title: string;
  helper: string;
  optional?: boolean;
}> = [
  {
    id: 'brief',
    eyebrow: 'Campaign Brief',
    title: 'What kind of award campaign do you want to create?',
    helper: 'Start with a short prompt. AI can turn it into a polished campaign draft.'
  },
  {
    id: 'name',
    eyebrow: 'Campaign Name',
    title: 'What should this campaign be called?',
    helper: 'Use a short name that looks strong on landing pages, share cards, and emails.'
  },
  {
    id: 'description',
    eyebrow: 'Campaign Story',
    title: 'How would you describe this campaign to nominees and voters?',
    helper: 'Keep it sharp and persuasive so people instantly understand why it matters.'
  },
  {
    id: 'landing',
    eyebrow: 'Landing Page',
    title: 'Do you want to attach a landing page URL?',
    helper: 'This is optional. Add a website if you already have a home for the campaign.',
    optional: true
  },
  {
    id: 'logo',
    eyebrow: 'Branding',
    title: 'Do you want to upload a logo for the campaign?',
    helper: 'This is optional. A logo makes the campaign feel polished when people share it.',
    optional: true
  },
  {
    id: 'nomination',
    eyebrow: 'Timeline',
    title: 'When should nominations open?',
    helper: 'Choose the date when people can start submitting entries.'
  },
  {
    id: 'votingStart',
    eyebrow: 'Timeline',
    title: 'When should voting start?',
    helper: 'Choose the day when your shortlist goes live and public voting begins.'
  },
  {
    id: 'votingEnd',
    eyebrow: 'Timeline',
    title: 'When should voting end?',
    helper: 'Set the closing date so your campaign has a clear finish line.'
  },
  {
    id: 'categories',
    eyebrow: 'Categories',
    title: 'What award categories should people vote on?',
    helper: 'Generate them with AI or add your own. You need at least one category to publish.'
  },
  {
    id: 'review',
    eyebrow: 'Review',
    title: 'Ready to publish this campaign?',
    helper: 'Review the summary, then publish when everything looks right.'
  }
];

export default function CreateAwardWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questionIndex, setQuestionIndex] = useState(0);
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

  const currentQuestion = questions[questionIndex];
  const totalQuestions = questions.length;
  const canPublish = Boolean(name.trim() && description.trim() && categories.length > 0);

  const isCurrentQuestionComplete = () => {
    switch (currentQuestion.id) {
      case 'brief':
        return Boolean(campaignBrief.trim());
      case 'name':
        return Boolean(name.trim());
      case 'description':
        return Boolean(description.trim());
      case 'landing':
      case 'logo':
        return true;
      case 'nomination':
        return Boolean(nominationOpenDate);
      case 'votingStart':
        return Boolean(votingStartDate);
      case 'votingEnd':
        return Boolean(votingEndDate);
      case 'categories':
        return categories.length > 0;
      case 'review':
        return canPublish;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (!isCurrentQuestionComplete()) return;
    setQuestionIndex((current: number) => Math.min(current + 1, totalQuestions - 1));
  };

  const goBack = () => {
    setQuestionIndex((current: number) => Math.max(current - 1, 0));
  };

  const skipCurrentQuestion = () => {
    if (!currentQuestion.optional) return;
    goNext();
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;
    const file = event.target.files[0];
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
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
      setQuestionIndex(1);
    } catch (error) {
      console.error('Error generating campaign draft:', error);
      alert('Failed to generate an AI draft.');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const generateCategories = async () => {
    if (!name.trim() || !description.trim()) {
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
      setCategories(
        generated.map((entry: Category) => ({
          name: entry.name,
          description: entry.description,
        }))
      );
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
      alert('Please complete the campaign details and add at least one category before publishing.');
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
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign.');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionContent = () => {
    switch (currentQuestion.id) {
      case 'brief':
        return (
          <div className="space-y-8">
            <div className="rounded-[28px] border border-[#E9E9E7] bg-[#FAFAF8] p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E3] bg-white px-3 py-1 text-xs font-medium text-[#666666]">
                <Wand2 className="h-3.5 w-3.5 text-[#C8860A]" />
                Start with a prompt
              </div>
              <textarea
                autoFocus
                value={campaignBrief}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setCampaignBrief(event.target.value)}
                rows={5}
                placeholder="Launch a premium awards campaign for top B2B SaaS products. We want founders, operators, and investors to nominate tools, drive sharing, and capture qualified leads."
                className="mt-5 w-full resize-none border-0 bg-transparent p-0 text-3xl font-medium leading-[1.45] tracking-tight text-[#111111] outline-none placeholder:text-[#B8B8B4]"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {quickBriefs.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setCampaignBrief(prompt)}
                  className="rounded-full border border-[#E6E6E3] bg-white px-4 py-2 text-sm text-[#5D5D5A] transition-colors hover:border-[#111111] hover:text-[#111111]"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={generateCampaignDraft}
                disabled={isGeneratingDraft}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4 text-[#C8860A]" />
                {isGeneratingDraft ? 'Generating with AI...' : 'Generate with AI'}
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!campaignBrief.trim()}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#E5E5E3] bg-white px-5 py-3 text-sm font-semibold text-[#111111] transition-colors hover:border-[#111111] disabled:opacity-50"
              >
                Continue manually
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      case 'name':
        return (
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
            placeholder="SaaS Excellence Awards 2026"
            className="w-full border-0 bg-transparent p-0 text-5xl font-semibold tracking-tight text-[#111111] outline-none placeholder:text-[#C0C0BB]"
          />
        );
      case 'description':
        return (
          <textarea
            autoFocus
            value={description}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(event.target.value)}
            rows={5}
            placeholder="Recognizing the most trusted and innovative B2B SaaS products chosen by founders, operators, and investors."
            className="w-full resize-none border-0 bg-transparent p-0 text-3xl font-medium leading-[1.5] tracking-tight text-[#111111] outline-none placeholder:text-[#C0C0BB]"
          />
        );
      case 'landing':
        return (
          <div className="rounded-[28px] border border-[#E9E9E7] bg-[#FAFAF8] p-6">
            <div className="relative">
              <Globe className="pointer-events-none absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-[#888884]" />
              <input
                autoFocus
                type="url"
                value={landingPageUrl}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setLandingPageUrl(event.target.value)}
                placeholder="https://www.theawardsapp.com"
                className="w-full border-0 bg-transparent py-1 pl-9 pr-0 text-3xl font-medium tracking-tight text-[#111111] outline-none placeholder:text-[#C0C0BB]"
              />
            </div>
          </div>
        );
      case 'logo':
        return (
          <div className="rounded-[28px] border border-dashed border-[#DADAD5] bg-[#FAFAF8] p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-[#E2E2DE] bg-white">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="h-16 w-16 rounded-2xl object-cover" />
              ) : (
                <Upload className="h-8 w-8 text-[#666666]" />
              )}
            </div>
            <p className="mt-6 text-2xl font-semibold tracking-tight text-[#111111]">
              {logoPreview ? 'Logo uploaded' : 'Upload a campaign logo'}
            </p>
            <p className="mt-3 text-base leading-7 text-[#666666]">
              Add a visual identity now, or skip and upload it later from the dashboard.
            </p>
            <label className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black">
              <Upload className="h-4 w-4" />
              {logoPreview ? 'Replace logo' : 'Choose file'}
              <input type="file" className="sr-only" accept="image/*" onChange={handleLogoChange} />
            </label>
          </div>
        );
      case 'nomination':
      case 'votingStart':
      case 'votingEnd': {
        const value =
          currentQuestion.id === 'nomination'
            ? nominationOpenDate
            : currentQuestion.id === 'votingStart'
              ? votingStartDate
              : votingEndDate;
        const setValue =
          currentQuestion.id === 'nomination'
            ? setNominationOpenDate
            : currentQuestion.id === 'votingStart'
              ? setVotingStartDate
              : setVotingEndDate;

        return (
          <div className="max-w-xl">
            <div className="rounded-[28px] border border-[#E9E9E7] bg-[#FAFAF8] p-6">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E2E2DE] bg-white">
                <CalendarDays className="h-5 w-5 text-[#111111]" />
              </div>
              <input
                autoFocus
                type="date"
                value={value}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
                className="w-full rounded-2xl border border-[#E2E2DE] bg-white px-5 py-4 text-xl text-[#111111] outline-none transition-colors focus:border-[#111111]"
              />
            </div>
          </div>
        );
      }
      case 'categories':
        return (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={generateCategories}
                disabled={isGeneratingCategories}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4 text-[#C8860A]" />
                {isGeneratingCategories ? 'Generating categories...' : 'Generate with AI'}
              </button>
              <button
                type="button"
                onClick={() => setCategories([...categories, { name: 'New Category', description: 'Describe why this category matters.' }])}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#E5E5E3] bg-white px-5 py-3 text-sm font-semibold text-[#111111] transition-colors hover:border-[#111111]"
              >
                <Target className="h-4 w-4" />
                Add manually
              </button>
            </div>

            <div className="space-y-4">
              {categories.length === 0 && (
                <div className="rounded-[28px] border border-dashed border-[#DADAD5] bg-[#FAFAF8] px-6 py-10 text-center">
                  <p className="text-lg font-semibold text-[#111111]">No categories yet</p>
                  <p className="mt-2 text-sm text-[#666666]">Generate the first set with AI or add one manually.</p>
                </div>
              )}

              {categories.map((category: Category, index: number) => (
                <div key={`${category.name}-${index}`} className="rounded-[28px] border border-[#E9E9E7] bg-[#FAFAF8] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={category.name}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                          const next = [...categories];
                          next[index].name = event.target.value;
                          setCategories(next);
                        }}
                        className="w-full border-0 bg-transparent p-0 text-2xl font-semibold tracking-tight text-[#111111] outline-none"
                      />
                      <textarea
                        value={category.description}
                        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                          const next = [...categories];
                          next[index].description = event.target.value;
                          setCategories(next);
                        }}
                        rows={2}
                        className="w-full resize-none border-0 bg-transparent p-0 text-base leading-7 text-[#666666] outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setCategories(categories.filter((_: Category, categoryIndex: number) => categoryIndex !== index))}
                      className="rounded-xl border border-[#E1E1DD] px-3 py-2 text-sm font-medium text-[#666666] transition-colors hover:border-[#111111] hover:text-[#111111]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'review':
        return (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[28px] border border-[#E9E9E7] bg-[#FAFAF8] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[#999999]">Campaign</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111111]">{name || 'Untitled campaign'}</p>
                <p className="mt-3 text-base leading-7 text-[#666666]">
                  {description || 'Add a description so nominees and voters understand the value of this campaign.'}
                </p>
              </div>
              <div className="rounded-[28px] border border-[#E9E9E7] bg-[#FAFAF8] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[#999999]">Timeline</p>
                <div className="mt-3 space-y-2 text-sm text-[#111111]">
                  <p>Nomination opens: {nominationOpenDate || 'Not set'}</p>
                  <p>Voting starts: {votingStartDate || 'Not set'}</p>
                  <p>Voting ends: {votingEndDate || 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#E9E9E7] bg-[#FAFAF8] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[#999999]">Categories</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {categories.map((category: Category) => (
                  <div key={category.name} className="rounded-full border border-[#E1E1DD] bg-white px-4 py-2 text-sm font-medium text-[#111111]">
                    {category.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (awardId) {
    return (
      <div className="min-h-screen bg-[#F4F2EE] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="w-full max-w-3xl rounded-[32px] border border-white/70 bg-white/90 p-8 text-center shadow-[0_30px_120px_rgba(17,17,17,0.12)] backdrop-blur">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#111111] text-white shadow-[0_24px_80px_rgba(17,17,17,0.18)]">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="mt-8 text-4xl font-bold tracking-tight text-[#111111]">Campaign published</h1>
            <p className="mt-4 text-lg leading-8 text-[#666666]">
              Your award campaign is live and ready to collect nominations, votes, and new leads.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#111111] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
              >
                Go to dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate(`/awards/${awardId}`)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E5E5E3] px-6 py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#FAFAF8]"
              >
                Open campaign
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#F4F2EE] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[32px] border border-white/60 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(249,247,242,0.78))] p-6 shadow-[0_32px_120px_rgba(17,17,17,0.12)] backdrop-blur sm:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E3] bg-white px-3 py-1 text-xs font-medium text-[#666666]">
              <Sparkles className="h-3.5 w-3.5 text-[#C8860A]" />
              AI-powered campaign builder
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E5E3] bg-white text-[#111111] transition-colors hover:bg-[#FAFAF8]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_24px_100px_rgba(17,17,17,0.08)] sm:p-8 md:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#F4F2EE] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#777777]">
                  {currentQuestion.eyebrow}
                </span>
                <span className="rounded-full border border-[#E5E5E3] bg-white px-3 py-1 text-xs font-medium text-[#777777]">
                  Question {questionIndex + 1} of {totalQuestions}
                </span>
              </div>

              <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-[#ECEAE5]">
                <div
                  className="h-full rounded-full bg-[#111111] transition-all duration-300"
                  style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>

              <div className="mt-10 min-h-[420px]">
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-[#111111] sm:text-5xl">
                  {currentQuestion.title}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-[#666666]">{currentQuestion.helper}</p>

                <div className="mt-12">{renderQuestionContent()}</div>
              </div>

              <div className="mt-10 flex flex-col gap-3 border-t border-[#ECEAE5] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={questionIndex === 0}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#E5E5E3] bg-white px-5 py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#FAFAF8] disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  {currentQuestion.optional && (
                    <button
                      type="button"
                      onClick={skipCurrentQuestion}
                      className="inline-flex items-center gap-2 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-[#777777] transition-colors hover:text-[#111111]"
                    >
                      Skip
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-[#8B8B86]">
                    {currentQuestion.id === 'review'
                      ? 'Publish this campaign when everything looks right.'
                      : 'Press continue to move to the next question.'}
                  </span>
                  {currentQuestion.id === 'review' ? (
                    <button
                      type="button"
                      onClick={handleCreateAndPublish}
                      disabled={!canPublish || loading}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#111111] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-50"
                    >
                      {loading ? 'Publishing...' : 'Publish campaign'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!isCurrentQuestionComplete()}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#111111] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-50"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
