import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowRight, Check, Trophy, Users, Zap, ShieldCheck, Sparkles,
  TrendingUp, Award, Mail, Globe, ChevronRight, Play,
  BarChart2, Target, Share2, Building2, Megaphone, Cpu,
  DollarSign, VolumeX, Clock, Calendar
} from 'lucide-react';
import WaitlistForm from '../components/WaitlistForm';
import BrandMark from '../components/BrandMark';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { format } from 'date-fns';

const ACCENT = '#C8860A';

// -------------------------------------------------------------------
// Mini components
// -------------------------------------------------------------------

function LiveDot() {
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-[#111111] bg-white border border-[#EAEAEA] px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
      Live
    </span>
  );
}

// -------------------------------------------------------------------
// Leaderboard mock
// -------------------------------------------------------------------
const leaderboardData = [
  { rank: 1, name: 'Notion', category: 'Best Productivity Tool', votes: 14820, change: '+320' },
  { rank: 2, name: 'Linear', category: 'Best Project Manager', votes: 13440, change: '+210' },
  { rank: 3, name: 'Figma', category: 'Best Design Tool', votes: 11900, change: '+180' },
  { rank: 4, name: 'Loom', category: 'Best Video Tool', votes: 9650, change: '+95' },
];

function LeaderboardPreview() {
  const [votes, setVotes] = useState(leaderboardData.map(d => d.votes));

  useEffect(() => {
    const interval = setInterval(() => {
      setVotes((prev: number[]) => prev.map((v: number, i: number) => v + Math.floor(Math.random() * (4 - i) + 1)));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-sm overflow-hidden">
      <div className="bg-[#FAFAFA] px-5 py-3.5 border-b border-[#EAEAEA] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4" style={{ color: ACCENT }} />
          <span className="font-semibold text-sm text-[#111111]">Top AI Tools 2026</span>
        </div>
        <LiveDot />
      </div>
      <div className="divide-y divide-[#EAEAEA]">
        {leaderboardData.map((item, i) => (
          <div key={item.rank} className="px-5 py-3.5 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors">
            <div className="flex items-center gap-3">
              <span
                className="text-base font-bold w-5"
                style={{ color: i === 0 ? ACCENT : '#999' }}
              >
                #{item.rank}
              </span>
              <div>
                <p className="font-semibold text-sm text-[#111111]">{item.name}</p>
                <p className="text-xs text-[#999]">{item.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-[#111111]">{votes[i].toLocaleString()}</p>
              <p className="text-xs text-[#999]">{item.change} today</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------
// Use-case card data
// -------------------------------------------------------------------
const useCases = [
  {
    icon: Cpu,
    title: 'SaaS Founders',
    slug: '/use-cases/saas',
    description: 'Run "Top SaaS Tools" awards to generate high-intent leads from your exact target market.',
    example: '"Best B2B SaaS 2026"',
    bullets: ['Capture competitor audiences', 'Rank in your niche', 'Get social proof fast'],
  },
  {
    icon: Building2,
    title: 'Real Estate',
    slug: '/use-cases/real-estate',
    description: 'Award top agents and brokerages. Let agents self-promote while you capture buyer and seller leads.',
    example: '"Top Agents in Austin 2026"',
    bullets: ['Generate buyer & seller leads', 'Build local authority', 'Agents promote for you'],
  },
  {
    icon: Megaphone,
    title: 'Marketing Teams',
    slug: '/use-cases/marketing',
    description: 'Replace expensive ads with viral award campaigns. Nominees share your brand to their audiences for free.',
    example: '"Best Marketing Campaigns 2026"',
    bullets: ['Zero ad spend needed', 'Nominees do the marketing', 'Build an email list fast'],
  },
];

// -------------------------------------------------------------------
// Live Awards Section — fetches real directory listings from Firestore
// -------------------------------------------------------------------
function LiveAwardsSection() {
  const [awards, setAwards] = useState<any[]>([]);

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const q = query(
          collection(db, 'awards'),
          where('status', '==', 'published'),
          where('isPublicDirectory', '==', true),
          limit(6)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => ((b as any).createdAt?.seconds || 0) - ((a as any).createdAt?.seconds || 0));
        setAwards(data);
      } catch {
        // silently skip if no directory awards exist yet
      }
    };
    fetchAwards();
  }, []);

  if (awards.length === 0) return null;

  return (
    <section className="py-24 px-6 border-b border-[#EAEAEA]">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#C8860A' }} />
              <span className="text-xs font-semibold text-[#999] uppercase tracking-widest">Live Now</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
              Active award campaigns
            </h2>
            <p className="mt-3 text-lg text-[#666666]">Browse and vote in live campaigns from our directory.</p>
          </div>
          <Link
            to="/directory"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[#111111] border border-[#EAEAEA] px-4 py-2 rounded-xl hover:border-[#111111] transition-colors whitespace-nowrap"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {awards.map(award => (
            <Link
              key={award.id}
              to={`/award/${award.id}`}
              className="group flex flex-col bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden hover:border-[#111111] hover:shadow-md transition-all"
            >
              <div className="bg-[#111111] px-5 py-4 flex items-center gap-3">
                {award.logoUrl ? (
                  <img src={award.logoUrl} alt={award.name} className="h-8 w-8 rounded-lg object-contain border border-white/10 bg-white/5 flex-shrink-0" />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-4 w-4 text-white/50" />
                  </div>
                )}
                <p className="font-bold text-white text-sm truncate">{award.name}</p>
              </div>
              <div className="flex-1 p-5">
                {award.description && (
                  <p className="text-sm text-[#666666] line-clamp-2 leading-relaxed mb-3">{award.description}</p>
                )}
                {award.votingEndDate && (
                  <p className="text-xs text-[#999] flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Voting closes {format(new Date(award.votingEndDate), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
              <div className="px-5 pb-4 flex items-center gap-1 text-xs font-semibold text-[#111111] group-hover:gap-2 transition-all">
                Vote now <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 sm:hidden text-center">
          <Link
            to="/directory"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#111111] border border-[#EAEAEA] px-5 py-2.5 rounded-xl hover:border-[#111111] transition-colors"
          >
            View all awards <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------
// Main LandingPage
// -------------------------------------------------------------------
export default function LandingPage() {
  const { user, signIn } = useAuth();
  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="bg-white overflow-x-hidden">

      {/* ============================================================
          BETA BANNER
      ============================================================ */}
      <div className="bg-[#111111] text-white px-6 py-2.5 flex items-center justify-center gap-2 text-sm">
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ACCENT }} />
        <p className="text-center text-[#CCCCCC]">
          We're in private beta —{' '}
          <a href="#waitlist" className="text-white font-medium underline underline-offset-2">get early access below.</a>
        </p>
      </div>

      {/* ============================================================
          1. HERO SECTION
      ============================================================ */}
      <section className="relative pt-16 pb-0 px-6 border-b border-[#EAEAEA] overflow-hidden">
        <div className="relative mx-auto max-w-4xl text-center pt-10 pb-16">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#666666] border border-[#EAEAEA] bg-white px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
            Private beta — limited spots
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#111111] leading-[1.06]">
            Run an award.<br />
            Your nominees<br />
            <span style={{ color: ACCENT }}>do the marketing.</span>
          </h1>
          <p className="mt-7 text-lg sm:text-xl leading-8 text-[#555555] max-w-xl mx-auto">
            Launch a viral award campaign in your niche. Nominees share to win. Voters verify their email. You walk away with a qualified lead list.
          </p>

          {/* Email waitlist form */}
          <div id="waitlist" className="mt-10 max-w-lg mx-auto">
            <WaitlistForm source="hero" />
            <p className="mt-3 text-xs text-[#999]">No spam. Just an early access notification when we ship.</p>
          </div>

          <div className="mt-7">
            <a
              href="#live-example"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#666666] hover:text-[#111111] transition-colors"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              See a live example
            </a>
          </div>
        </div>

        {/* Visual: leaderboard preview */}
        <div className="relative mx-auto max-w-3xl pb-0 px-4 translate-y-8">
          <LeaderboardPreview />
        </div>
      </section>

      {/* ============================================================
          3. PROBLEM — styled list, not identical cards
      ============================================================ */}
      <section className="py-24 px-6 border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
              Your current lead gen<br />is expensive and exhausting.
            </h2>
            <p className="mt-5 text-lg text-[#666666]">
              The playbook everyone's running is getting more crowded and more expensive every year.
            </p>
          </div>
          <div className="space-y-0 divide-y divide-[#EAEAEA] border border-[#EAEAEA] rounded-2xl overflow-hidden">
            {[
              {
                icon: DollarSign,
                title: 'Ad costs keep rising',
                body: "CPCs are up. Click-through rates are down. You're spending more to reach people who've learned to ignore ads.",
              },
              {
                icon: VolumeX,
                title: 'Cold outreach goes nowhere',
                body: "Inboxes are full. Reply rates are at historic lows. You can't buy your way into a conversation anymore.",
              },
              {
                icon: Clock,
                title: 'Content takes months to pay off',
                body: 'SEO compounds slowly. You need leads this quarter, not next year. Waiting is not a growth strategy.',
              },
            ].map((p) => (
              <div key={p.title} className="flex gap-5 px-7 py-6 bg-white hover:bg-[#FAFAFA] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <p.icon className="h-4 w-4 text-[#111111]" />
                </div>
                <div>
                  <p className="font-semibold text-[#111111]">{p.title}</p>
                  <p className="text-sm text-[#666666] leading-relaxed mt-1">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-[#999] italic">
            If any of those hit close to home, keep reading.
          </p>
        </div>
      </section>

      {/* ============================================================
          4. SOLUTION — how the loop works
      ============================================================ */}
      <section id="use-cases" className="py-24 px-6 border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
            Awards create a loop<br />that runs on its own.
          </h2>
          <p className="mt-5 text-lg text-[#666666] max-w-xl mx-auto">
            Nominees share to rally votes. Voters give you their email. Winners celebrate publicly. You get leads from all of it.
          </p>
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0">
            {[
              { icon: Globe, label: 'Traffic', sub: 'Nominees & voters arrive' },
              { icon: Trophy, label: 'Voting', sub: 'Cast votes, verify email' },
              { icon: Share2, label: 'Sharing', sub: 'Nominees promote to win' },
              { icon: Users, label: 'Leads', sub: 'You own the list' },
            ].map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center text-center w-32">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#EAEAEA] flex items-center justify-center shadow-sm">
                    <step.icon className="h-5 w-5" style={{ color: i === 3 ? ACCENT : '#111111' }} />
                  </div>
                  <p className="mt-2.5 font-semibold text-sm text-[#111111]">{step.label}</p>
                  <p className="text-xs text-[#999] mt-0.5">{step.sub}</p>
                </div>
                {i < 3 && (
                  <ChevronRight className="h-5 w-5 text-[#CCCCCC] flex-shrink-0 hidden sm:block" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          5. HOW IT WORKS — numbered list style, not identical cards
      ============================================================ */}
      <section className="py-24 px-6 border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
              Live in under an hour.
            </h2>
            <p className="mt-4 text-lg text-[#666666]">No developers. No design team. Just you and a good idea.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
            {[
              { step: '01', title: 'Create your award campaign', body: 'Name your award, set categories, configure voting rules. AI drafts everything — you just review.' },
              { step: '02', title: 'Add nominees', body: 'Import via CSV, add manually, or open public nominations. AI fills in profiles and bios automatically.' },
              { step: '03', title: 'Share and let votes roll in', body: 'Post the link. Nominees share their unique page. Every vote captures a verified email.' },
              { step: '04', title: 'Export your leads', body: 'Every voter and nominator is a qualified prospect. Export to CSV or push directly to your CRM.' },
            ].map(s => (
              <div key={s.step} className="flex gap-5">
                <span
                  className="text-5xl font-bold leading-none flex-shrink-0 mt-0.5"
                  style={{ color: '#EAEAEA', fontVariantNumeric: 'tabular-nums' }}
                >
                  {s.step}
                </span>
                <div>
                  <p className="font-semibold text-[#111111] text-lg">{s.title}</p>
                  <p className="mt-1.5 text-sm text-[#666666] leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          6. BENEFITS — varied layout: 1 wide + 2-col grid
      ============================================================ */}
      <section id="use-cases" className="py-24 px-6 border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
              What one campaign gets you
            </h2>
          </div>
          {/* Hero benefit — full width */}
          <div className="flex gap-5 p-7 bg-white border border-[#EAEAEA] rounded-2xl mb-5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: ACCENT + '15' }}
            >
              <Target className="h-5 w-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <p className="font-semibold text-[#111111] text-lg">High-intent leads, not random clicks</p>
              <p className="mt-1.5 text-[#666666] leading-relaxed">
                Every voter verifies their email and cares about your space. These aren't people who saw an ad — they opted in because they have an opinion about your industry. That's the difference between a lead and a contact.
              </p>
            </div>
          </div>
          {/* 2-col grid for remaining benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { icon: TrendingUp, title: 'Viral reach without ad spend', body: 'Nominees share their page to rally votes. Every share is free marketing to an audience that already trusts them.' },
              { icon: Award, title: 'Authority in your niche', body: 'The company running the definitive awards in a space owns the conversation. It compounds over time.' },
              { icon: Share2, title: 'Public celebrations that spread', body: 'Winners post their badge everywhere. Your brand gets embedded in LinkedIn posts, newsletters, and email signatures.' },
              { icon: Mail, title: 'A list you actually own', body: "Unlike social followers, your email list goes nowhere. Export it, segment it, and nurture on your own terms." },
              { icon: BarChart2, title: 'Analytics while it runs', body: 'Watch votes update live. See which nominees drive the most shares. Adjust and double down.' },
            ].map(b => (
              <div key={b.title} className="flex gap-4 p-6 bg-white border border-[#EAEAEA] rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center flex-shrink-0">
                  <b.icon className="h-4 w-4 text-[#111111]" />
                </div>
                <div>
                  <p className="font-semibold text-[#111111]">{b.title}</p>
                  <p className="mt-1 text-sm text-[#666666] leading-relaxed">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          7. LIVE EXAMPLE
      ============================================================ */}
      <section id="live-example" className="py-24 px-6 border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
              This is what your campaign looks like
            </h2>
            <p className="mt-4 text-lg text-[#666666]">
              Clean. Shareable. Updating in real time.
            </p>
          </div>
          <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-3xl overflow-hidden">
            <div className="px-8 py-8 text-white text-center" style={{ background: '#111111' }}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Trophy className="h-4 w-4" style={{ color: ACCENT }} />
                <span className="text-xs font-semibold text-[#999] uppercase tracking-widest">Demo Campaign</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">Top AI Tools 2026</h3>
              <p className="text-sm text-[#666666]">Vote for your favourite AI tools across 6 categories</p>
            </div>
            <div className="p-6">
              <p className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-4">Current Standings</p>
              <LeaderboardPreview />
            </div>
          </div>
          <div className="mt-8 text-center">
            <a
              href="#waitlist"
              className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-7 py-3.5 text-sm font-semibold text-white hover:bg-black transition-colors"
            >
              Launch a campaign like this
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================
          LIVE AWARDS DIRECTORY
      ============================================================ */}
      <LiveAwardsSection />

      {/* ============================================================
          8. USE CASES
      ============================================================ */}
      <section className="py-24 px-6 border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
              Works in any market
            </h2>
            <p className="mt-4 text-lg text-[#666666]">
              If your industry has players worth recognizing, it has an award campaign waiting to happen.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {useCases.map(uc => (
              <Link
                to={uc.slug}
                key={uc.title}
                className="group relative flex flex-col bg-white border border-[#EAEAEA] rounded-2xl p-7 hover:border-[#111111] transition-all hover:shadow-md"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#111111] flex items-center justify-center mb-5">
                  <uc.icon className="h-5 w-5 text-white" />
                </div>
                <p className="font-bold text-[#111111] text-lg mb-2">{uc.title}</p>
                <p className="text-sm text-[#666666] leading-relaxed mb-5">{uc.description}</p>
                <div className="text-xs font-medium text-[#666666] bg-[#FAFAFA] border border-[#EAEAEA] px-3 py-1.5 rounded-lg mb-5 self-start">
                  e.g. {uc.example}
                </div>
                <ul className="space-y-2 mt-auto">
                  {uc.bullets.map(b => (
                    <li key={b} className="flex items-center gap-2 text-sm text-[#555555]">
                      <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: ACCENT }} />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-[#111111] group-hover:gap-2 transition-all">
                  See how it works <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          9. AI SECTION
      ============================================================ */}
      <section className="py-24 px-6 border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-[#111111]">
                The tedious parts<br />are automated.
              </h2>
              <p className="mt-5 text-lg text-[#666666] leading-relaxed">
                Writing category names, researching nominees, drafting bios — all of that takes 30 seconds instead of three hours.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  { icon: Sparkles, title: 'Generate categories', body: 'Describe your industry, get a full structured list instantly.' },
                  { icon: Users, title: 'Suggest nominees', body: 'AI researches relevant nominees so you start with a real list.' },
                  { icon: Zap, title: 'Write campaign copy', body: 'Headlines, descriptions, and nominee bios — drafted automatically.' },
                ].map(ai => (
                  <div key={ai.title} className="flex gap-4 items-start p-4 bg-[#FAFAFA] rounded-xl border border-[#EAEAEA]">
                    <div className="w-8 h-8 rounded-lg bg-[#111111] flex items-center justify-center flex-shrink-0">
                      <ai.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#111111]">{ai.title}</p>
                      <p className="text-xs text-[#666666] mt-0.5">{ai.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Terminal-style preview */}
            <div className="bg-[#0E0E0E] rounded-2xl overflow-hidden shadow-xl border border-[#222]">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#222]">
                <span className="w-3 h-3 rounded-full bg-[#333]" />
                <span className="w-3 h-3 rounded-full bg-[#333]" />
                <span className="w-3 h-3 rounded-full bg-[#333]" />
                <span className="ml-2 text-xs text-[#555]">Generating campaign</span>
              </div>
              <div className="p-5 font-mono text-sm space-y-4">
                <div>
                  <p className="text-[#555] text-xs mb-2">→ Generating categories for "B2B SaaS"</p>
                  <div className="space-y-1.5">
                    {['Best CRM Tool', 'Best Analytics Platform', 'Best Customer Success Tool', 'Best Sales Enablement', '+12 more...'].map((item, idx) => (
                      <p key={item} className={`text-xs pl-3 ${idx === 4 ? 'text-[#666]' : 'text-[#AAAAAA]'}`}>
                        {idx < 4 ? '✓ ' : ''}{item}
                      </p>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[#555] text-xs mb-2">→ Suggesting nominees for "Best CRM"</p>
                  <div className="space-y-1.5">
                    {['HubSpot — profile enriched', 'Salesforce — profile enriched', 'Pipedrive — profile enriched'].map(item => (
                      <p key={item} className="text-xs text-[#AAAAAA] pl-3">✓ {item}</p>
                    ))}
                  </div>
                </div>
                <div className="pt-1 border-t border-[#222]">
                  <p className="text-xs font-semibold" style={{ color: ACCENT }}>Campaign ready. 14 categories, 62 nominees.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          10. PRICING
      ============================================================ */}
      <section id="pricing" className="py-24 px-6 border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
              Pay per campaign.
            </h2>
            <p className="mt-4 text-lg text-[#666666]">
              No monthly subscriptions. No annual contracts. Just one campaign at a time.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="flex flex-col bg-white border border-[#EAEAEA] rounded-2xl p-7">
              <p className="font-semibold text-[#111111]">Starter</p>
              <p className="text-sm text-[#999] mt-1">Good for a first run</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[#111111]">$99</span>
                <span className="text-sm text-[#999]">/campaign</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm text-[#555555]">
                {['30 days', 'Up to 1,000 votes', '50 nominees', 'Lead export (CSV)', 'Standard support'].map(f => (
                  <li key={f} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 flex-shrink-0 text-[#AAAAAA]" />{f}</li>
                ))}
              </ul>
              <a href="#waitlist" className="mt-8 w-full rounded-xl border border-[#EAEAEA] bg-[#FAFAFA] py-3 text-sm font-semibold text-[#111111] hover:border-[#111111] transition-colors text-center">
                Join Waitlist
              </a>
            </div>
            {/* Growth — highlighted without the cliché badge */}
            <div className="flex flex-col bg-[#111111] border border-[#111111] rounded-2xl p-7 relative ring-2 ring-offset-2 ring-offset-[#FAFAFA]" style={{ '--tw-ring-color': ACCENT } as React.CSSProperties}>
              <p className="font-semibold text-white">Growth</p>
              <p className="text-sm mt-1" style={{ color: ACCENT }}>Most teams start here</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">$149</span>
                <span className="text-sm text-[#666666]">/campaign</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm text-[#999]">
                {['60 days', 'Up to 10,000 votes', '250 nominees', 'AI Automation Tools', 'Lead export (CSV + CRM)', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 flex-shrink-0 text-white" />{f}</li>
                ))}
              </ul>
              <a href="#waitlist" className="mt-8 w-full rounded-xl bg-white py-3 text-sm font-semibold text-[#111111] hover:bg-[#FAFAFA] transition-colors text-center">
                Join Waitlist
              </a>
            </div>
            {/* Pro */}
            <div className="flex flex-col bg-white border border-[#EAEAEA] rounded-2xl p-7">
              <p className="font-semibold text-[#111111]">Pro</p>
              <p className="text-sm text-[#999] mt-1">Enterprise scale & branding</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[#111111]">$199</span>
                <span className="text-sm text-[#999]">/campaign</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm text-[#555555]">
                {['90 days', 'Unlimited votes', 'Unlimited nominees', 'Custom domain', 'White-label embed', 'Dedicated support'].map(f => (
                  <li key={f} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 flex-shrink-0 text-[#AAAAAA]" />{f}</li>
                ))}
              </ul>
              <a href="#waitlist" className="mt-8 w-full rounded-xl border border-[#EAEAEA] bg-[#FAFAFA] py-3 text-sm font-semibold text-[#111111] hover:border-[#111111] transition-colors text-center">
                Join Waitlist
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          11. TRUST
      ============================================================ */}
      <section className="py-14 px-6 border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-14">
            {[
              { icon: ShieldCheck, label: 'SSL encrypted', sub: 'End-to-end' },
              { icon: Mail, label: 'Email verified', sub: '1 vote per address' },
              { icon: Globe, label: 'GDPR compliant', sub: 'Data processed lawfully' },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center flex-shrink-0">
                  <t.icon className="h-4 w-4 text-[#111111]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#111111]">{t.label}</p>
                  <p className="text-xs text-[#999]">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          12. FINAL CTA
      ============================================================ */}
      <section className="py-28 px-6 bg-[#111111] text-white text-center">
        <div className="mx-auto max-w-xl">
          <p className="text-sm font-medium mb-4" style={{ color: ACCENT }}>Private beta</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Get in before<br />we open the doors.
          </h2>
          <p className="mt-5 text-lg text-[#666666]">
            Early access users will launch first, get the best pricing, and help shape how the product works.
          </p>
          <WaitlistForm source="footer" dark className="mt-10" />
          <p className="mt-4 text-xs text-[#444444]">No spam. No subscription. Just an early access notification.</p>
        </div>
      </section>
      <footer id="footer" className="bg-[#111111] border-t border-white/10 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 md:grid-cols-[1.3fr_0.8fr_0.8fr_1fr]">
            <div>
              <Link to="/" className="inline-flex items-center">
                <BrandMark dark />
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#999999]">
                Launch award campaigns that nominees want to share, voters want to join, and your team can turn into qualified pipeline.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Product</p>
              <div className="mt-4 space-y-3 text-sm text-[#999999]">
                <Link to="/" className="block transition-colors hover:text-white">Home</Link>
                <a href="#live-example" className="block transition-colors hover:text-white">Live demo</a>
                <a href="#pricing" className="block transition-colors hover:text-white">Pricing</a>
                <a href="#waitlist" className="block transition-colors hover:text-white">Join waitlist</a>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Use cases</p>
              <div className="mt-4 space-y-3 text-sm text-[#999999]">
                <Link to="/use-cases/saas" className="block transition-colors hover:text-white">SaaS</Link>
                <Link to="/use-cases/real-estate" className="block transition-colors hover:text-white">Real estate</Link>
                <Link to="/use-cases/marketing" className="block transition-colors hover:text-white">Marketing</Link>
                <a href="#use-cases" className="block transition-colors hover:text-white">All use cases</a>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Access</p>
              <div className="mt-4 space-y-3 text-sm text-[#999999]">
                <button
                  onClick={signIn}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-medium text-white transition-colors hover:bg-white/10"
                >
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-xs leading-5 text-[#666666]">
                  Private beta access is invite-based. Join the waitlist to be first in line.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-[#666666] sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 taa. Built for modern award campaigns.</p>
            <div className="flex items-center gap-4">
              <a href="#pricing" className="transition-colors hover:text-white">Pricing</a>
              <a href="#waitlist" className="transition-colors hover:text-white">Waitlist</a>
              <a href="#live-example" className="transition-colors hover:text-white">Demo</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
