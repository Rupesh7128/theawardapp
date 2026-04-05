import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowRight, ArrowLeft, Check, Trophy, TrendingUp, Target,
  Share2, Mail, Megaphone, BarChart2, RefreshCw, Users
} from 'lucide-react';

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

const viralLoop = [
  { icon: Trophy, step: 'You launch the award' },
  { icon: Share2, step: 'Nominees share to their 10K+ followers' },
  { icon: Users, step: 'Their audience votes and joins your list' },
  { icon: RefreshCw, step: 'Those voters tell others. Loop repeats.' },
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
  const { signIn } = useAuth();

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
            <Megaphone className="h-3.5 w-3.5" />
            For Marketing Teams, Agencies & Growth Marketers
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#111111] leading-tight">
            Replace Expensive Ads<br />With Viral Award Campaigns.
          </h1>
          <p className="mt-6 text-lg text-[#555555] leading-relaxed max-w-2xl mx-auto">
            Run award campaigns where nominees share your brand to their audiences for free. Capture thousands of leads. Build your list. All with zero ad spend.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={signIn}
              className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-7 py-3.5 text-sm font-semibold text-white hover:bg-black transition-colors"
            >
              Launch Your Marketing Award
              <ArrowRight className="h-4 w-4" />
            </button>
            <a href="#examples" className="inline-flex items-center gap-1 text-sm font-semibold text-[#666666] hover:text-[#111111] transition-colors">
              See campaign examples
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 bg-white border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-3xl grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-[#111111]">3,900+</p>
            <p className="text-sm text-[#666666] mt-0.5">Leads per campaign (avg)</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#111111]">8.4x</p>
            <p className="text-sm text-[#666666] mt-0.5">ROI vs paid ads (avg)</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#111111]">$0</p>
            <p className="text-sm text-[#666666] mt-0.5">Ad spend needed</p>
          </div>
        </div>
      </section>

      {/* CPL comparison */}
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
              <p className="text-sm text-[#666666] mt-1">CPL via award campaign</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-[#999] uppercase tracking-widest">Process</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[#111111]">How marketing teams use Awardly</h2>
            <p className="mt-3 text-[#666666]">Launch a viral campaign in under an hour.</p>
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
      <section className="py-24 px-6 border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-[#999] uppercase tracking-widest">Outcomes</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[#111111]">What marketing teams actually get</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {outcomes.map(o => (
              <div key={o.title} className="flex gap-4 p-6 bg-[#FAFAFA] border border-[#EAEAEA] rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EAEAEA] flex items-center justify-center flex-shrink-0">
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

      {/* Viral loop */}
      <section className="py-16 px-6 border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold text-[#999] uppercase tracking-widest">The Loop</span>
          <h3 className="mt-3 text-2xl font-bold text-[#111111] mb-10">The marketing award viral loop</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            {viralLoop.map((l, i) => (
              <div key={i} className="flex flex-col items-center gap-3 p-5 bg-white border border-[#EAEAEA] rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center">
                  <l.icon className="h-5 w-5 text-[#111111]" />
                </div>
                <p className="text-[#555555] leading-snug text-xs">{l.step}</p>
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
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[#111111]">Example marketing campaigns</h2>
            <p className="mt-3 text-[#666666]">Every one of these generated real, segmented leads.</p>
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
        <div className="mx-auto max-w-2xl">
          <Megaphone className="h-8 w-8 text-white mx-auto mb-5" />
          <h2 className="text-3xl sm:text-4xl font-bold">Launch your first award campaign today</h2>
          <p className="mt-4 text-[#666666]">Stop paying for ads. Let nominees carry your brand for free.</p>
          <button
            onClick={signIn}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-[#111111] hover:bg-[#FAFAFA] transition-colors"
          >
            Create Your Marketing Award
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
