import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Check, Trophy,
  TrendingUp, Target, Share2, Mail,
  Home, Building2, MapPin
} from 'lucide-react';
import WaitlistForm from '../components/WaitlistForm';

const ACCENT = '#C8860A';

const campaignExamples = [
  { title: 'Top Agents in Austin 2026', votes: '22,100', leads: '4,800', nominees: 120 },
  { title: 'Best Brokerages in Miami 2026', votes: '15,300', leads: '3,100', nominees: 55 },
  { title: 'Top New Developments — NYC', votes: '11,600', leads: '2,400', nominees: 40 },
];

const steps = [
  { step: '01', title: 'Create a local award', body: 'E.g. "Top Real Estate Agents in Austin 2026". AI generates categories like Best Residential Agent, Best Luxury Agent.' },
  { step: '02', title: 'Add agents & brokerages as nominees', body: 'Upload a CSV of local agents or let people self-nominate. Profiles auto-enriched with headshots and bios.' },
  { step: '03', title: 'Share in local groups & email', body: 'Every agent pushes it to their sphere — buyers, sellers, investors. You capture every single email.' },
  { step: '04', title: 'Follow up with every lead', body: 'Export your segmented list. Buyers, sellers, investors — all tagged. Start your drip campaign.' },
];

const outcomes = [
  { icon: Target, title: 'Generate buyer & seller leads', body: 'People who vote for their favourite agent are actively thinking about real estate. These are your warmest leads.' },
  { icon: Home, title: 'Build hyperlocal authority', body: '"The company behind the Austin Real Estate Awards" becomes the most trusted brand in that market.' },
  { icon: Share2, title: 'Agents promote for you', body: 'Nominated agents share to their sphere of influence — past clients, followers, family. You get their reach for free.' },
  { icon: Building2, title: 'Attract brokerage partnerships', body: 'Brokerages sponsor the awards to get visibility. Turn your campaign into a revenue stream.' },
  { icon: Mail, title: 'Build a local buyer/seller database', body: "Every voter is a potential future buyer or seller. Your database becomes a moat others can't replicate." },
  { icon: MapPin, title: 'Own the "best in city" keyword', body: 'Award campaigns rank on Google. "Best agents in [city]" becomes a traffic machine.' },
];

const idealFor = [
  'A brokerage wanting to dominate a local market',
  'A PropTech company targeting real estate professionals',
  'A title company or mortgage lender seeking agent referrals',
  'A real estate media company running annual rankings',
  'A developer wanting buyer leads for a new project',
  'An agent team building a referral network fast',
];

export default function UseCaseRealEstate() {

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
          <p className="text-sm font-medium text-[#999] mb-4">For real estate agents, brokerages & PropTech</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111111] leading-tight max-w-2xl">
            Let agents compete.<br />You capture every lead.
          </h1>
          <p className="mt-6 text-lg text-[#555555] leading-relaxed max-w-xl">
            Run a "Top Agents in [City]" award. Every nominated agent shares to their sphere of influence — buyers, sellers, investors. You capture every email.
          </p>
          <div className="mt-10 max-w-md">
            <WaitlistForm source="realestate-hero" />
            <p className="mt-3 text-xs text-[#999]">Not live yet — join the waitlist for early access.</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 bg-[#FAFAFA] border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-3xl grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-[#111111]">4,800+</p>
            <p className="text-sm text-[#666666] mt-0.5">Leads per campaign (avg)</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#111111]">120+</p>
            <p className="text-sm text-[#666666] mt-0.5">Agents per campaign (avg)</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#111111]">$0</p>
            <p className="text-sm text-[#666666] mt-0.5">Spent on ads</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#111111] mb-12">
            From launch to local lead database in days.
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

      {/* Outcomes */}
      <section className="py-24 px-6 border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#111111] mb-12">
            What real estate teams actually get.
          </h2>
          <div className="flex gap-5 p-7 bg-white border border-[#EAEAEA] rounded-2xl mb-5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: ACCENT + '15' }}>
              <Target className="h-5 w-5" style={{ color: ACCENT }} />
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

      {/* Example campaigns — table-style */}
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
                  <Trophy className="h-3.5 w-3.5 flex-shrink-0" style={{ color: ACCENT }} />
                  <span className="font-medium text-[#111111]">{c.title}</span>
                </div>
                <span className="text-[#111111] font-semibold">{c.votes}</span>
                <span className="text-[#111111] font-semibold">{c.leads}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal for */}
      <section className="py-16 px-6 border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="mx-auto max-w-3xl">
          <h3 className="text-lg font-bold text-[#111111] mb-6">This works best if you're...</h3>
          <ul className="space-y-3">
            {idealFor.map(item => (
              <li key={item} className="flex items-center gap-3 text-[#555555]">
                <Check className="h-4 w-4 flex-shrink-0" style={{ color: ACCENT }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#111111] text-white text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-bold">Own your local market.</h2>
          <p className="mt-4 text-[#666666]">Join the waitlist. Early access users launch first.</p>
          <WaitlistForm source="realestate-cta" dark className="mt-8" />
        </div>
      </section>
    </div>
  );
}
