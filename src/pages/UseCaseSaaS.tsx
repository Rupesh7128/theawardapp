import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Check, Trophy, Users, Zap,
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
      <section className="py-20 px-6 border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#666666] border border-[#EAEAEA] bg-white px-3 py-1.5 rounded-full mb-6">
            <Zap className="h-3.5 w-3.5" />
            For SaaS Founders & Operators
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#111111] leading-tight">
            The SaaS Lead Machine.<br />No Ads Required.
          </h1>
          <p className="mt-6 text-lg text-[#555555] leading-relaxed max-w-2xl mx-auto">
            Run a "Top SaaS Tools" award campaign and capture thousands of leads from your target market — while your competitors do the marketing for you.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <WaitlistForm source="saas-hero" className="max-w-md mx-auto" />
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

      {/* How it works */}
      <section className="py-24 px-6 border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-[#999] uppercase tracking-widest">Process</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[#111111]">How SaaS founders use Awardly</h2>
            <p className="mt-3 text-[#666666]">From zero to viral in under 30 minutes.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map(s => (
              <div key={s.step} className="group p-6 bg-white border border-[#EAEAEA] rounded-2xl hover:border-[#111111] transition-colors">
                <span className="text-3xl font-bold text-[#EAEAEA] group-hover:text-[#111111] transition-colors leading-none">{s.step}</span>
                <p className="mt-3 font-semibold text-[#111111]">{s.title}</p>
                <p className="mt-2 text-sm text-[#666666] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-24 px-6 border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-[#999] uppercase tracking-widest">Outcomes</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[#111111]">What SaaS founders actually get</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {outcomes.map(o => (
              <div key={o.title} className="flex gap-4 p-6 bg-white border border-[#EAEAEA] rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center flex-shrink-0">
                  <o.icon className="h-5 w-5 text-[#111111]" />
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

      {/* Example campaigns */}
      <section id="examples" className="py-24 px-6 border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-[#999] uppercase tracking-widest">Examples</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[#111111]">Example SaaS campaigns</h2>
            <p className="mt-3 text-[#666666]">Real campaigns. Real numbers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {campaignExamples.map(c => (
              <div key={c.title} className="p-6 bg-[#FAFAFA] border border-[#EAEAEA] rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-4 w-4 text-[#111111]" />
                  <p className="font-semibold text-sm text-[#111111]">{c.title}</p>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666666]">Votes</span>
                    <span className="font-semibold text-[#111111]">{c.votes}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666666]">Leads captured</span>
                    <span className="font-semibold text-[#111111]">{c.leads}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666666]">Nominees</span>
                    <span className="font-semibold text-[#111111]">{c.nominees}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal for */}
      <section className="py-16 px-6 border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="mx-auto max-w-3xl">
          <h3 className="text-lg font-bold text-[#111111] mb-6 text-center">Awardly works best if you are...</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {idealFor.map(item => (
              <div key={item} className="flex items-center gap-3 p-4 bg-white border border-[#EAEAEA] rounded-xl text-sm text-[#555555]">
                <Check className="h-4 w-4 text-[#111111] flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#111111] text-white text-center">
        <div className="mx-auto max-w-xl">
          <Trophy className="h-8 w-8 text-white mx-auto mb-5" />
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to generate SaaS leads without ads?</h2>
          <p className="mt-4 text-[#666666]">We're not live yet — join the waitlist and get early beta access.</p>
          <WaitlistForm source="saas-cta" dark className="mt-8" />
        </div>
      </section>
    </div>
  );
}
