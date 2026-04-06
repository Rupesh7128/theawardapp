import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Check, Trophy, TrendingUp, Target,
  Share2, Mail, Megaphone, BarChart2, RefreshCw, Users
} from 'lucide-react';
import WaitlistForm from '../components/WaitlistForm';

const ACCENT = '#C8860A';

const campaignExamples = [
  { title: 'Best Marketing Campaigns 2026', votes: '19,200', leads: '3,900', nominees: 74 },
  { title: 'Top Email Marketing Platforms', votes: '13,400', leads: '2,700', nominees: 42 },
  { title: 'Best Growth Hackers to Follow', votes: '10,100', leads: '2,100', nominees: 60 },
];

const steps = [
  { step: '01', title: 'Create a campaign around your audience', body: 'E.g. "Best Marketing Tools 2026". AI generates categories in seconds. You review and launch.' },
  { step: '02', title: 'Nominate brands, people, or tools', body: 'Every nominee has a stake in winning. They share to their email lists, social following, and communities.' },
  { step: '03', title: 'Watch the shares multiply', body: 'One nominee with 10K followers brings 10K new eyeballs. Each of those is a potential lead for you.' },
  { step: '04', title: 'Export and nurture', body: 'Every voter gave you their verified email. Segment by category interest and launch hyper-targeted campaigns.' },
];

const outcomes = [
  { icon: Share2, title: 'Zero ad spend needed', body: 'Nominees and their audiences do the distribution. Your CAC drops to nearly zero compared to paid acquisition.' },
  { icon: Megaphone, title: 'Nominees become your marketers', body: 'Every nominee has skin in the game. They tweet, post, and email their list — all sending traffic to your award page.' },
  { icon: Mail, title: 'Build a targeted email list fast', body: 'Get thousands of verified emails from people who care specifically about your marketing niche.' },
  { icon: Target, title: 'Hyper-segment your leads', body: 'Voters who voted in "Best Email Marketing Tools" are email marketers. You know exactly what to sell them.' },
  { icon: TrendingUp, title: 'Create content from the results', body: 'The leaderboard, winner announcements, and rankings are ready-made content pieces for your blog and social.' },
  { icon: BarChart2, title: 'Benchmark and build authority', body: '"The team behind the Marketing Awards" becomes the go-to data source and thought leader in your space.' },
];

const idealFor = [
  'A growth marketer running list-building campaigns',
  'An agency wanting leads from a niche vertical',
  'A newsletter operator building paid sponsorships',
  'A marketing director replacing expensive paid ads',
  'A B2B content team generating distribution without backlinks',
  'A community manager rewarding top contributors',
];

export default function UseCaseMarketing() {

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
          <p className="text-sm font-medium text-[#999] mb-4">For marketing teams, agencies & growth marketers</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111111] leading-tight max-w-2xl">
            Your nominees do<br />the marketing. You get<br />the leads.
          </h1>
          <p className="mt-6 text-lg text-[#555555] leading-relaxed max-w-xl">
            Run award campaigns where every nominee shares your brand to their audience to win. Thousands of verified leads. Zero ad spend.
          </p>
          <div className="mt-10 max-w-md">
            <WaitlistForm source="marketing-hero" />
            <p className="mt-3 text-xs text-[#999]">Not live yet — join the waitlist for early access.</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 bg-[#FAFAFA] border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-3xl grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-[#111111]">3,900+</p>
            <p className="text-sm text-[#666666] mt-0.5">Leads per campaign (avg)</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#111111]">8.4x</p>
            <p className="text-sm text-[#666666] mt-0.5">ROI vs paid ads</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#111111]">$0</p>
            <p className="text-sm text-[#666666] mt-0.5">Ad spend needed</p>
          </div>
        </div>
      </section>

      {/* CPL comparison — this section was already distinctive, keep it */}
      <section className="py-12 px-6 border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-3xl">
          <div className="bg-[#111111] rounded-2xl p-8 text-white grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-[#CCCCCC]">$5 – $50</p>
              <p className="text-sm text-[#666666] mt-1">CPL via paid ads</p>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-[#444444] text-2xl font-bold">vs</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">$0.08</p>
              <p className="text-sm mt-1" style={{ color: ACCENT }}>CPL via award campaign</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#111111] mb-12">
            Launch a viral campaign in under an hour.
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
      <section className="py-24 px-6 border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#111111] mb-12">
            What marketing teams actually get.
          </h2>
          <div className="flex gap-5 p-7 bg-[#FAFAFA] border border-[#EAEAEA] rounded-2xl mb-5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: ACCENT + '15' }}>
              <Share2 className="h-5 w-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <p className="font-semibold text-[#111111] text-lg">{outcomes[0].title}</p>
              <p className="mt-1.5 text-[#666666] leading-relaxed">{outcomes[0].body}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {outcomes.slice(1).map(o => (
              <div key={o.title} className="flex gap-4 p-6 bg-[#FAFAFA] border border-[#EAEAEA] rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#EAEAEA] flex items-center justify-center flex-shrink-0">
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

      {/* Example campaigns — table */}
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
          <h2 className="text-3xl sm:text-4xl font-bold">Stop buying ads. Start running awards.</h2>
          <p className="mt-4 text-[#666666]">Join the waitlist. Early access users launch first.</p>
          <WaitlistForm source="marketing-cta" dark className="mt-8" />
        </div>
      </section>
    </div>
  );
}
