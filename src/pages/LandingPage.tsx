import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowRight, Check, Trophy, Users, Zap, ShieldCheck, Sparkles,
  TrendingUp, Award, Mail, Globe, ChevronRight, Play,
  BarChart2, Target, Share2, Building2, Megaphone, Cpu,
  DollarSign, VolumeX, Clock, Construction
} from 'lucide-react';
import WaitlistForm from '../components/WaitlistForm';

// -------------------------------------------------------------------
// Mini components
// -------------------------------------------------------------------

function LiveDot() {
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-[#111111] bg-white border border-[#EAEAEA] px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-[#111111] animate-pulse" />
      Live
    </span>
  );
}

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-[#111111]">{value}</p>
      <p className="text-sm text-[#666666] mt-0.5">{label}</p>
    </div>
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
          <Trophy className="h-4 w-4 text-[#111111]" />
          <span className="font-semibold text-sm text-[#111111]">Top AI Tools 2026</span>
        </div>
        <LiveDot />
      </div>
      <div className="divide-y divide-[#EAEAEA]">
        {leaderboardData.map((item, i) => (
          <div key={item.rank} className="px-5 py-3.5 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors">
            <div className="flex items-center gap-3">
              <span className={`text-base font-bold w-5 ${i === 0 ? 'text-[#111111]' : 'text-[#999]'}`}>
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
    title: 'For SaaS Founders',
    slug: '/use-cases/saas',
    description: 'Run "Top SaaS Tools" awards to generate thousands of high-intent leads from your target market.',
    example: '"Best B2B SaaS 2026"',
    bullets: ['Capture competitor audiences', 'Rank in your niche', 'Get social proof fast'],
  },
  {
    icon: Building2,
    title: 'For Real Estate',
    slug: '/use-cases/real-estate',
    description: 'Award top agents, brokerages, and listings. Let agents self-promote while you capture buyer and seller leads.',
    example: '"Top Agents in Austin 2026"',
    bullets: ['Generate buyer & seller leads', 'Build local authority', 'Agents promote for you'],
  },
  {
    icon: Megaphone,
    title: 'For Marketing Teams',
    slug: '/use-cases/marketing',
    description: 'Replace expensive ads with viral award campaigns. Nominees share your brand to their audiences for free.',
    example: '"Best Marketing Campaigns 2026"',
    bullets: ['Zero ad spend needed', 'Nominees do the marketing', 'Build an email list fast'],
  },
];

// -------------------------------------------------------------------
// Main LandingPage
// -------------------------------------------------------------------
export default function LandingPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="bg-white overflow-x-hidden">

      {/* ============================================================
          BETA BANNER
      ============================================================ */}
      <div className="bg-[#111111] text-white px-6 py-3 flex items-center justify-center gap-3 text-sm">
        <Construction className="h-4 w-4 text-[#999] flex-shrink-0" />
        <p className="text-center">
          <span className="font-semibold">Awardly is not live yet.</span>
          <span className="text-[#999] ml-2">We're in private beta — enter your email below to get early access.</span>
        </p>
      </div>

      {/* ============================================================
          1. HERO SECTION
      ============================================================ */}
      <section className="relative pt-16 pb-0 px-6 border-b border-[#EAEAEA] overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #EAEAEA 1px, transparent 0)',
            backgroundSize: '32px 32px',
            opacity: 0.5,
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center pt-10 pb-16">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#666666] border border-[#EAEAEA] bg-white px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Currently in Private Beta
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#111111] leading-[1.08]">
            Launch Viral Awards That<br />
            <span className="relative">
              <span className="relative z-10">Generate High-Intent Leads</span>
              <span
                className="absolute bottom-1 left-0 right-0 h-3 -z-0 rounded-sm"
                style={{ background: 'rgba(17,17,17,0.06)' }}
              />
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl leading-8 text-[#555555] max-w-2xl mx-auto">
            Turn your audience into engaged prospects with shareable award campaigns your nominees promote for you.
          </p>

          {/* Email waitlist form */}
          <div id="waitlist" className="mt-10 max-w-lg mx-auto">
            <WaitlistForm source="hero" />
            <p className="mt-3 text-xs text-[#999]">Be the first to know when we launch. No spam, ever.</p>
          </div>

          <div className="mt-6">
            <a
              href="#live-example"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#666666] hover:text-[#111111] transition-colors"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              See how it works
            </a>
          </div>
        </div>

        {/* Visual: leaderboard preview */}
        <div className="relative mx-auto max-w-3xl pb-0 px-4 translate-y-8">
          <LeaderboardPreview />
        </div>
      </section>

      {/* ============================================================
          2. SOCIAL PROOF
      ============================================================ */}
      <section className="bg-[#FAFAFA] border-b border-[#EAEAEA] pt-16 pb-12 px-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-semibold text-[#999] uppercase tracking-widest mb-10">
            Built for SaaS founders, agencies & marketers
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <StatBadge value="10,000+" label="Votes (demo)" />
            <StatBadge value="2,000+" label="Leads (demo)" />
            <StatBadge value="120+" label="Campaigns (planned)" />
            <StatBadge value="94%" label="Nominee share rate" />
          </div>
        </div>
      </section>

      {/* ============================================================
          3. PROBLEM SECTION
      ============================================================ */}
      <section className="py-24 px-6 border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold text-[#999] uppercase tracking-widest">The Problem</span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
            Getting attention and leads<br />is harder than ever
          </h2>
          <p className="mt-5 text-lg text-[#666666]">
            Every marketer's playing the same tired game. And it's getting more expensive.
          </p>
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              {
                icon: DollarSign,
                title: 'Ads are expensive',
                body: "CPCs keep rising. ROI keeps dropping. You're paying more to reach audiences that tune out.",
              },
              {
                icon: VolumeX,
                title: 'Cold outreach is ignored',
                body: "Inboxes are full. Response rates are at historic lows. Everyone's selling, nobody's listening.",
              },
              {
                icon: Clock,
                title: 'Content takes forever',
                body: 'Building SEO takes months. Viral moments are rare. You need leads now, not next quarter.',
              },
            ].map(p => (
              <div key={p.title} className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-2xl p-6">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#EAEAEA] flex items-center justify-center mb-4">
                  <p.icon className="h-4 w-4 text-[#111111]" />
                </div>
                <p className="font-semibold text-[#111111] mb-2">{p.title}</p>
                <p className="text-sm text-[#666666] leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 p-5 bg-[#111111] rounded-2xl text-white text-base font-medium">
            "Yeah… that's me." — Every founder reading this
          </div>
        </div>
      </section>

      {/* ============================================================
          4. SOLUTION SECTION
      ============================================================ */}
      <section className="py-24 px-6 border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold text-[#999] uppercase tracking-widest">The Solution</span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
            Turn your audience<br />into promoters
          </h2>
          <p className="mt-5 text-lg text-[#666666] max-w-xl mx-auto">
            Award campaigns create a viral loop: nominees share to win, voters share because they care, and you capture leads at every step.
          </p>
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0">
            {[
              { icon: Globe, label: 'Traffic', sub: 'Nominees & voters arrive' },
              { icon: Trophy, label: 'Voting', sub: 'Cast votes, enter email' },
              { icon: Share2, label: 'Sharing', sub: 'Nominees share to win' },
              { icon: Users, label: 'Leads', sub: 'You own the list' },
            ].map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center text-center w-32">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#EAEAEA] flex items-center justify-center shadow-sm">
                    <step.icon className="h-5 w-5 text-[#111111]" />
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
          5. HOW IT WORKS
      ============================================================ */}
      <section className="py-24 px-6 border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-[#999] uppercase tracking-widest">How It Works</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
              Up and running in minutes
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Create your award campaign', body: 'Name your award, set categories, configure voting rules. AI helps you write everything.' },
              { step: '02', title: 'Add nominees or accept submissions', body: 'Import a CSV, add manually, or open nominations publicly. AI enriches profiles instantly.' },
              { step: '03', title: 'Let your audience vote', body: 'Share the link. Nominees share their unique pages. Votes pour in. Leads captured automatically.' },
              { step: '04', title: 'Capture leads and grow', body: 'Export your verified lead list. Every voter and nominator is a qualified prospect.' },
            ].map(s => (
              <div key={s.step} className="group relative p-6 bg-white border border-[#EAEAEA] rounded-2xl hover:border-[#111111] transition-colors">
                <span className="text-4xl font-bold text-[#EAEAEA] group-hover:text-[#111111] transition-colors leading-none">{s.step}</span>
                <p className="mt-4 font-semibold text-[#111111]">{s.title}</p>
                <p className="mt-2 text-sm text-[#666666] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          6. BENEFITS
      ============================================================ */}
      <section className="py-24 px-6 border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-[#999] uppercase tracking-widest">Why It Works</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
              Real outcomes, not features
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { icon: Target, title: 'Generate high-intent leads', body: "Every voter verifies their email and cares about your space. These aren't random clicks — they're qualified buyers." },
              { icon: TrendingUp, title: 'Drive viral traffic', body: 'Nominees share their page to their audience to rally votes. You get exponential reach with zero ad spend.' },
              { icon: Award, title: 'Build authority in your niche', body: 'Be the company that runs the definitive awards in your space. Own the conversation, not just a corner of it.' },
              { icon: Share2, title: 'Create shareable moments', body: 'Winners celebrate publicly. Badges get embedded. Your brand spreads naturally across LinkedIn, Twitter, and newsletters.' },
              { icon: Mail, title: 'Own your audience', body: 'Unlike social media reach, your lead list is yours. Export to your CRM and nurture on your terms.' },
              { icon: BarChart2, title: 'Real-time campaign analytics', body: 'Watch votes roll in live. See which nominees drive the most shares. Double down on what works.' },
            ].map(b => (
              <div key={b.title} className="flex gap-4 p-6 bg-white border border-[#EAEAEA] rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center flex-shrink-0">
                  <b.icon className="h-5 w-5 text-[#111111]" />
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
            <span className="text-xs font-semibold text-[#999] uppercase tracking-widest">Demo Preview</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
              See it in action
            </h2>
            <p className="mt-4 text-lg text-[#666666]">
              This is exactly what your campaign looks like. Clean, shareable, lead-generating.
            </p>
          </div>
          <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-3xl overflow-hidden">
            <div className="bg-[#111111] px-8 py-8 text-white text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-white" />
                <span className="text-xs font-semibold text-white uppercase tracking-widest">Demo Campaign</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">Top AI Tools 2026</h3>
              <p className="text-sm text-[#999]">Vote for your favourite AI tools across 6 categories</p>
            </div>
            <div className="p-6">
              <p className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-4">Current Standings</p>
              <LeaderboardPreview />
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-[#666666] mb-4">Want to launch a campaign like this?</p>
            <a
              href="#waitlist"
              className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-7 py-3.5 text-sm font-semibold text-white hover:bg-black transition-colors"
            >
              Join the Waitlist
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================
          8. USE CASES
      ============================================================ */}
      <section className="py-24 px-6 border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-[#999] uppercase tracking-widest">Use Cases</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
              Built for your industry
            </h2>
            <p className="mt-4 text-lg text-[#666666]">
              Award campaigns work across every market. Here's how.
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
                <div className="text-xs font-semibold text-[#111111] bg-[#FAFAFA] border border-[#EAEAEA] px-3 py-1.5 rounded-lg mb-5 self-start">
                  {uc.example}
                </div>
                <ul className="space-y-2 mt-auto">
                  {uc.bullets.map(b => (
                    <li key={b} className="flex items-center gap-2 text-sm text-[#555555]">
                      <Check className="h-3.5 w-3.5 text-[#111111] flex-shrink-0" />
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
              <span className="text-xs font-semibold text-[#999] uppercase tracking-widest">AI-Powered</span>
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#111111]">
                Built with AI to launch faster
              </h2>
              <p className="mt-5 text-lg text-[#666666] leading-relaxed">
                Don't spend hours crafting nominees, categories, or copy. Our AI does it in seconds — you just review and launch.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: Sparkles, title: 'Generate categories', body: 'Describe your industry, get a full category list instantly.' },
                  { icon: Users, title: 'Suggest nominees', body: 'AI researches and suggests relevant nominees for your award.' },
                  { icon: Zap, title: 'Create campaign copy', body: 'Headlines, descriptions, and nominee bios written automatically.' },
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
            <div className="bg-[#111111] rounded-2xl p-6 font-mono text-sm space-y-3 shadow-xl">
              <p className="text-[#555555] text-xs">// AI generating your campaign...</p>
              <p><span className="text-[#CCCCCC]">categories</span> <span className="text-white">=</span> generateCategories(<span className="text-[#999]">"B2B SaaS"</span>)</p>
              <div className="pl-4 text-[#666666] space-y-1 text-xs">
                <p className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-[#444]" /> Best CRM Tool</p>
                <p className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-[#444]" /> Best Analytics Platform</p>
                <p className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-[#444]" /> Best Customer Success Tool</p>
                <p className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-[#444]" /> Best Sales Enablement</p>
                <p className="flex items-center gap-2 text-white"><ChevronRight className="h-3 w-3 text-[#666]" /> +12 more generated</p>
              </div>
              <p className="pt-2"><span className="text-[#CCCCCC]">nominees</span> <span className="text-white">=</span> suggestNominees(<span className="text-[#999]">"Best CRM"</span>)</p>
              <div className="pl-4 text-[#666666] space-y-1 text-xs">
                <p className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-[#444]" /> HubSpot, Salesforce, Pipedrive</p>
                <p className="flex items-center gap-2 text-white"><ChevronRight className="h-3 w-3 text-[#666]" /> Profiles enriched</p>
              </div>
              <p className="pt-2 text-white font-semibold">Campaign ready. Launch now.</p>
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
            <span className="text-xs font-semibold text-[#999] uppercase tracking-widest">Pricing</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
              Simple, campaign-based pricing
            </h2>
            <p className="mt-4 text-lg text-[#666666]">
              Pay per campaign. No hidden monthly subscriptions.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="flex flex-col bg-white border border-[#EAEAEA] rounded-2xl p-7">
              <p className="font-semibold text-[#111111]">Starter</p>
              <p className="text-sm text-[#999] mt-1">Perfect for first campaigns</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[#111111]">$99</span>
                <span className="text-sm text-[#999]">/campaign</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm text-[#555555]">
                {['30 days duration', 'Up to 1,000 votes', '50 nominees', 'Lead export (CSV)', 'Standard support'].map(f => (
                  <li key={f} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#111111] flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <a href="#waitlist" className="mt-8 w-full rounded-xl border border-[#EAEAEA] bg-[#FAFAFA] py-3 text-sm font-semibold text-[#111111] hover:border-[#111111] transition-colors text-center">
                Join Waitlist
              </a>
            </div>
            {/* Growth */}
            <div className="flex flex-col bg-[#111111] border border-[#111111] rounded-2xl p-7 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-white text-[#111111] text-xs font-bold px-3 py-1 rounded-full border border-[#EAEAEA] shadow-sm">
                  Most Popular
                </span>
              </div>
              <p className="font-semibold text-white">Growth</p>
              <p className="text-sm text-[#666666] mt-1">For growing SaaS & agencies</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">$149</span>
                <span className="text-sm text-[#666666]">/campaign</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm text-[#999]">
                {['60 days duration', 'Up to 10,000 votes', '250 nominees', 'AI Automation Tools', 'Lead export (CSV + CRM)', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-white flex-shrink-0" />{f}</li>
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
                {['90 days duration', 'Unlimited votes', 'Unlimited nominees', 'Custom domain', 'White-label embed', 'Dedicated support'].map(f => (
                  <li key={f} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#111111] flex-shrink-0" />{f}</li>
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
          11. TRUST + COMPLIANCE
      ============================================================ */}
      <section className="py-16 px-6 border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
            {[
              { icon: ShieldCheck, label: 'Secure voting', sub: 'SSL encrypted end-to-end' },
              { icon: Mail, label: 'Email verification', sub: '1 vote per verified email' },
              { icon: Globe, label: 'GDPR compliant', sub: 'Data processed lawfully' },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center flex-shrink-0">
                  <t.icon className="h-5 w-5 text-[#111111]" />
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
          <Trophy className="h-10 w-10 text-white mx-auto mb-6" />
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Be first to launch<br />when we go live
          </h2>
          <p className="mt-5 text-lg text-[#666666]">
            Join founders and marketers on the waitlist. We'll give early access to beta testers first.
          </p>
          <WaitlistForm source="footer" dark className="mt-10" />
          <p className="mt-4 text-xs text-[#444444]">No spam. No subscription. Just an early access notification.</p>
        </div>
      </section>
    </div>
  );
}
