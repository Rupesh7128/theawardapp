import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Check, Trophy, Users,
  TrendingUp, Target, BarChart2, Share2, Mail,
  Home, Building2, MapPin
} from 'lucide-react';
import WaitlistForm from '../components/WaitlistForm';

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
      <section className="py-20 px-6 border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#666666] border border-[#EAEAEA] bg-white px-3 py-1.5 rounded-full mb-6">
            <Building2 className="h-3.5 w-3.5" />
            For Real Estate Agents, Brokerages & PropTech
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#111111] leading-tight">
            The Real Estate Lead Machine.<br />Let Agents Market For You.
          </h1>
          <p className="mt-6 text-lg text-[#555555] leading-relaxed max-w-2xl mx-auto">
            Run "Top Agents in [City]" award campaigns. Every nominated agent shares to their sphere of influence — and you capture every buyer, seller, and investor that visits.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <WaitlistForm source="realestate-hero" className="max-w-md mx-auto" />
            <p className="mt-3 text-xs text-[#999]">Not live yet — join the waitlist for early access.</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 bg-white border-b border-[#EAEAEA]">
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
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-[#999] uppercase tracking-widest">Process</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[#111111]">How real estate teams use Awardly</h2>
            <p className="mt-3 text-[#666666]">From zero to a local lead database in days.</p>
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
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[#111111]">What real estate teams actually get</h2>
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
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[#111111]">Example real estate campaigns</h2>
            <p className="mt-3 text-[#666666]">Run locally. Results are national-grade.</p>
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
          <Home className="h-8 w-8 text-white mx-auto mb-5" />
          <h2 className="text-3xl sm:text-4xl font-bold">Own your local market with an award campaign</h2>
          <p className="mt-4 text-[#666666]">We're not live yet — join the waitlist and get early beta access.</p>
          <WaitlistForm source="realestate-cta" dark className="mt-8" />
        </div>
      </section>
    </div>
  );
}
