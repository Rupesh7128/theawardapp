import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Check, Trophy, Users, Zap,
  TrendingUp, Target, BarChart2, Share2, Mail
} from 'lucide-react';
import WaitlistForm from '../components/WaitlistForm';

const campaignExamples = [
  { title: 'Best B2B SaaS Tools 2026', votes: '18,400', leads: '3,200', nominees: 64 },
  { title: 'Top CRM Platforms 2026', votes: '12,100', leads: '2,050', nominees: 38 },
  { title: 'Best Product Analytics Tools', votes: '9,800', leads: '1,700', nominees: 29 },
];

const steps = [
  { step: '01', title: 'Name your award', body: 'E.g. "Best B2B SaaS Tools 2026". AI suggests categories instantly.' },
  { step: '02', title: 'Add competing tools as nominees', body: 'AI imports competitor profiles. Logos, descriptions, websites — all enriched.' },
  { step: '03', title: 'Publish & share to your audience', body: 'Tweet it, email it, post it. Every SaaS founder in your space sees it.' },
  { step: '04', title: 'Nominees promote for you', body: 'Every nominee shares to their users. You get their traffic and their leads.' },
];

const outcomes = [
  { icon: Target, title: 'Capture competitor audiences', body: "When HubSpot users vote, their email lands in your list. That's competitor intelligence and leads in one." },
  { icon: TrendingUp, title: 'Rank your tool publicly', body: 'Your own product can be a nominee too. Use the award to position yourself as the category leader.' },
  { icon: Share2, title: 'Get social proof fast', body: '"Voted #1 CRM 2026" is a headline badge every winner puts in their pitch deck, website, and LinkedIn.' },
  { icon: Mail, title: 'Build a qualified email list', body: "Voters care about the tools they're voting for. These are your warmest prospects." },
  { icon: BarChart2, title: 'Zero ad spend required', body: 'No Facebook ads. No LinkedIn CPCs. Nominees drive traffic because they want to win.' },
  { icon: Users, title: 'Create community and authority', body: 'The company running the awards becomes the authority — not the one begging for backlinks.' },
];

const idealFor = [
  'A B2B SaaS founder building a go-to-market list',
  'An agency wanting leads from a specific niche',
  'A newsletter operator monetizing your audience',
  'A VC or investor mapping a category',
  'A community builder rewarding members',
  'A media company running industry rankings',
];

export default function UseCaseSaaS() {

  return (
    <div className="bg-white min-h-screen">
      {/* Back nav */}
      <div className="border-b border-[#EAEAEA] px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#666666] hover:text-[#111111] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="py-20 px-6 border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-medium text-[#999] mb-4">For SaaS founders & operators</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111111] leading-tight max-w-2xl">
            Generate SaaS leads<br />without buying a single ad.
          </h1>
          <p className="mt-6 text-lg text-[#555555] leading-relaxed max-w-xl">
            Run a "Top SaaS Tools" award. Your competitors become nominees and share to their audiences to win — you capture leads the whole time.
          </p>
          <div className="mt-10 max-w-md">
            <WaitlistForm source="saas-hero" />
            <p className="mt-3 text-xs text-[#999]">Not live yet — join the waitlist for early access.</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 bg-white border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-3xl grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-[#111111]">3,200+</p>
            <p className="text-sm text-[#666666] mt-0.5">Leads per campaign (avg)</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#111111]">94%</p>
            <p className="text-sm text-[#666666] mt-0.5">Nominees share their page</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#111111]">$0</p>
            <p className="text-sm text-[#666666] mt-0.5">Ad spend needed</p>
          </div>
        </div>
      </section>

      {/* How it works — numbered list, not card grid */}
      <section className="py-24 px-6 border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#111111] mb-12">
            From zero to viral in under an hour.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
            {steps.map(s => (
              <div key={s.step} className="flex gap-5">
                <span className="text-5xl font-bold leading-none flex-shrink-0" style={{ color: '#EAEAEA' }}>{s.step}</span>
                <div>
                  <p className="font-semibold text-[#111111] text-lg">{s.title}</p>
                  <p className="mt-1.5 text-sm text-[#666666] leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes — lead with the best one full-width */}
      <section className="py-24 px-6 border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#111111] mb-12">
            What you actually get.
          </h2>
          <div className="flex gap-5 p-7 bg-white border border-[#EAEAEA] rounded-2xl mb-5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#C8860A15' }}>
              <Target className="h-5 w-5" style={{ color: '#C8860A' }} />
            </div>
            <div>
              <p className="font-semibold text-[#111111] text-lg">{outcomes[0].title}</p>
              <p className="mt-1.5 text-[#666666] leading-relaxed">{outcomes[0].body}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {outcomes.slice(1).map(o => (
              <div key={o.title} className="flex gap-4 p-6 bg-white border border-[#EAEAEA] rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center flex-shrink-0">
                  <o.icon className="h-4 w-4 text-[#111111]" />
                </div>
                <div>
                  <p className="font-semibold text-[#111111]">{o.title}</p>
                  <p className="mt-1 text-sm text-[#666666] leading-relaxed">{o.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example campaigns — table-style, not cards */}
      <section id="examples" className="py-24 px-6 border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#111111] mb-3">Example campaigns</h2>
          <p className="text-[#666666] mb-10">Projected numbers based on typical award campaign benchmarks.</p>
          <div className="border border-[#EAEAEA] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 bg-[#FAFAFA] px-6 py-3 border-b border-[#EAEAEA] text-xs font-semibold text-[#999] uppercase tracking-wide">
              <span className="col-span-2">Campaign</span>
              <span>Votes</span>
              <span>Leads</span>
            </div>
            {campaignExamples.map((c, i) => (
              <div key={c.title} className={`grid grid-cols-4 px-6 py-4 text-sm ${i < campaignExamples.length - 1 ? 'border-b border-[#EAEAEA]' : ''} hover:bg-[#FAFAFA] transition-colors`}>
                <div className="col-span-2 flex items-center gap-2">
                  <Trophy className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#C8860A' }} />
                  <span className="font-medium text-[#111111]">{c.title}</span>
                </div>
                <span className="text-[#111111] font-semibold">{c.votes}</span>
                <span className="text-[#111111] font-semibold">{c.leads}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal for — inline list, not card grid */}
      <section className="py-16 px-6 border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="mx-auto max-w-3xl">
          <h3 className="text-lg font-bold text-[#111111] mb-6">This works best if you're...</h3>
          <ul className="space-y-3">
            {idealFor.map(item => (
              <li key={item} className="flex items-center gap-3 text-[#555555]">
                <Check className="h-4 w-4 flex-shrink-0" style={{ color: '#C8860A' }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#111111] text-white text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-bold">Want leads without buying ads?</h2>
          <p className="mt-4 text-[#666666]">Join the waitlist. Early access users launch first.</p>
          <WaitlistForm source="saas-cta" dark className="mt-8" />
        </div>
      </section>
    </div>
  );
}
