import { useState, useEffect } from 'react';
import {
  Users, CreditCard, BarChart3, Dumbbell, UserCheck,
  Globe, Palette, CheckCircle2, ArrowRight,
  Star, TrendingUp, DollarSign, Bell, Shield, Zap,
  Menu, X, Apple, Play, LogIn, ScanLine,
} from 'lucide-react';
import { Separator } from '@/shared/components/ui/separator';
import brandLogo from '@/assets/brand_logo.png';
import screenshotDashboard from '@/assets/dashboard.png';
import screenshotAnalytics from '@/assets/analytics.png';
import screenshotAttendance from '@/assets/attendance.png';
import screenshotDashboardLight from '@/assets/dashboard_light.png';
import screenshotAnalyticsLight from '@/assets/analytics_light.png';
import screenshotAttendanceLight from '@/assets/attendance_light.png';

/* ─── Data ──────────────────────────────────────────────────────────────────── */

const features = [
  { icon: Users,        title: 'Member Management',    description: 'Register, search, and manage members with full profile history, photos, and custom fields.',               size: 'large',  screenshot: screenshotDashboard  },
  { icon: CreditCard,   title: 'Membership & Payments', description: 'Flexible plans, variants, and payment recording with instant overdue alerts.',                            size: 'small' },
  { icon: Dumbbell,     title: 'Personal Training',     description: 'Assign trainers, track PT sessions, and handle training-specific billing separately.',                    size: 'small' },
  { icon: BarChart3,    title: 'Analytics & Insights',  description: 'Real-time dashboards — revenue trends, membership churn, active members, and more.',                      size: 'large',  screenshot: screenshotAnalytics  },
  { icon: DollarSign,   title: 'Financials Module',     description: "Log expenses, investments, and income. Know your gym's profitability at a glance.",                       size: 'small' },
  { icon: Bell,         title: 'Smart Notifications',   description: 'Automated renewal reminders and expiry alerts so no revenue slips through the cracks.',                   size: 'small' },
  { icon: Shield,       title: 'Role-Based Access',     description: "Admin and staff roles with fine-grained permissions — staff can't touch what they shouldn't.",            size: 'small' },
  { icon: UserCheck,    title: 'Trainer Profiles',      description: 'Dedicated trainer pages with specializations, session history, and earnings overview.',                   size: 'small' },
  { icon: TrendingUp,   title: 'Plan Management',       description: 'Create unlimited plan types and variants — monthly, quarterly, annual, custom.',                          size: 'small' },
];

const stats = [
  { value: '500+',  label: 'Gyms onboarded' },
  { value: '₹2Cr+', label: 'Revenue tracked' },
  { value: '50k+',  label: 'Active members'  },
  { value: '98%',   label: 'Retention rate'  },
];

const plans = [
  {
    name: 'Starter', price: '₹1,499', period: '/month', highlight: false,
    description: 'Perfect for small gyms just getting started.',
    features: ['Up to 200 active members', 'Member & membership management', 'Payment tracking', 'Basic analytics', 'Web app access', 'Email support'],
  },
  {
    name: 'Growth', price: '₹2,999', period: '/month', highlight: true, badge: 'Most Popular',
    description: 'The most popular plan for growing gyms.',
    features: ['Up to 1,000 active members', 'Everything in Starter', 'Personal training module', 'Financials & expense tracking', 'Advanced analytics', 'iOS & Android apps', 'Priority support'],
  },
  {
    name: 'Pro', price: '₹5,499', period: '/month', highlight: false,
    description: 'For multi-branch gyms and fitness chains.',
    features: ['Unlimited members', 'Everything in Growth', 'Multi-branch support', 'White-label branding', 'Custom domain', 'API access', 'Dedicated account manager'],
  },
];

const testimonials = [
  { name: 'Rahul Sharma', gym: 'FitZone, Delhi',           rating: 5, text: "Switched from a spreadsheet to Brofit and honestly I don't know how we managed before. Renewal reminders alone saved us ₹40k in the first month." },
  { name: 'Priya Menon',  gym: 'Iron Temple, Bangalore',   rating: 5, text: 'The financial module is a game-changer. I can see exactly where the money is going and which months are slow. The analytics are top-tier.' },
  { name: 'Arjun Verma',  gym: 'Peak Performance, Mumbai', rating: 5, text: 'Setup took under 30 minutes. The UI is incredibly clean — my front-desk staff picked it up without any training.' },
];

/* ─── Navbar ─────────────────────────────────────────────────────────────────── */

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const links = [
    { label: 'Features',     href: '#features'     },
    { label: 'Pricing',      href: '#pricing'      },
    { label: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-zinc-950/90 backdrop-blur-xl border-b border-white/5' : ''}`}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={brandLogo} alt="Brofit" className="h-8 w-8 rounded-full object-cover" />
          <span className="text-white font-black text-lg tracking-tight">Brofit</span>
        </div>

        <nav className="hidden md:flex items-center gap-0.5">
          {links.map(l => (
            <a key={l.label} href={l.href} className="text-zinc-400 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-all">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <a href="/sign-in" className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm font-medium px-4 py-2 rounded-lg border border-zinc-800 hover:border-zinc-600 hover:bg-white/5 transition-all">
            <LogIn className="h-3.5 w-3.5" />
            Log in
          </a>
          <a href="#pricing" className="inline-flex items-center gap-1.5 bg-white text-zinc-950 hover:bg-zinc-100 text-sm font-bold px-4 py-2 rounded-lg transition-all shadow-lg">
            Get Started
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <button className="md:hidden text-zinc-400 hover:text-white p-2" onClick={() => setOpen(o => !o)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-zinc-950/98 backdrop-blur-xl border-t border-white/5 px-5 py-5 flex flex-col gap-1">
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="text-zinc-300 text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-white/5">
              {l.label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2 border-t border-white/5 mt-2">
            <a href="/sign-in" className="flex items-center justify-center gap-2 border border-zinc-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg">
              <LogIn className="h-4 w-4" /> Log in
            </a>
            <a href="#pricing" className="flex items-center justify-center gap-2 bg-white text-zinc-950 text-sm font-bold px-4 py-2.5 rounded-lg">
              Get Started <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-zinc-950 pt-16">
      {/* Beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-64 bg-gradient-to-b from-transparent via-primary/60 to-transparent" />
      {/* Top glow orb */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-20" style={{ background: 'hsl(0 72% 51%)' }} />
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
      {/* Radial fade over grid */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%,transparent 40%,#09090b 100%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-5 py-24 w-full">
        {/* Pill badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/10 rounded-full px-4 py-1.5 text-primary text-xs font-semibold tracking-widest uppercase">
            <Zap className="h-3 w-3 fill-primary" />
            Gym Management, Reinvented
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-center text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight">
          Run your gym<br />
          <span className="relative inline-block">
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, hsl(0 72% 65%) 0%, hsl(0 72% 51%) 40%, hsl(20 90% 55%) 100%)' }}>
              like a business.
            </span>
          </span>
        </h1>

        <p className="text-center mt-8 text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Members, payments, trainers, analytics — one clean dashboard.
          Stop managing chaos. Start growing.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <a href="#pricing" className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02]">
            Start Free — No Card Needed
            <ArrowRight className="h-4 w-4" />
          </a>
          <a href="/sign-in" className="inline-flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-500 bg-white/5 hover:bg-white/8 text-zinc-300 hover:text-white font-medium px-7 py-3.5 rounded-xl text-sm transition-all">
            <LogIn className="h-4 w-4" />
            Log in to your account
          </a>
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-zinc-600">
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />)}
            <span className="ml-1 text-zinc-500">Loved by gym owners</span>
          </div>
          <span>·</span><span className="text-zinc-500">14-day free trial</span>
          <span>·</span><span className="text-zinc-500">Cancel anytime</span>
        </div>

        {/* Hero screenshot */}
        <div className="relative mt-20 max-w-5xl mx-auto">
          {/* Glow behind image */}
          <div className="absolute -inset-4 rounded-3xl blur-3xl opacity-30" style={{ background: 'linear-gradient(135deg, hsl(0 72% 51% / 0.4), transparent 60%)' }} />
          {/* Top edge gradient */}
          <div className="absolute -top-px inset-x-12 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
            <img src={screenshotDashboard} alt="Brofit dashboard" className="w-full object-cover object-top" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Stats ──────────────────────────────────────────────────────────────────── */

function StatsBar() {
  return (
    <div className="relative border-y border-zinc-800/60">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
      <div className="relative max-w-6xl mx-auto px-5 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={s.label} className={`text-center ${i < 3 ? 'md:border-r md:border-zinc-800' : ''}`}>
              <p className="text-4xl font-black text-white">{s.value}</p>
              <p className="text-zinc-500 text-sm mt-1.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Features ───────────────────────────────────────────────────────────────── */

function FeaturesSection() {
  const large = features.filter(f => f.size === 'large');
  const small = features.filter(f => f.size === 'small');
  const Large0Icon = large[0].icon;
  const Large1Icon = large[1].icon;

  return (
    <section id="features" className="py-32 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-20">
          <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4">Features</p>
          <h2 className="text-4xl md:text-5xl font-black text-white">Everything you need.<br /><span className="text-zinc-500">Nothing you don't.</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Large card 1 */}
          <div className="md:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all group relative">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 100%, hsl(0 72% 51% / 0.07), transparent)' }} />
            <div className="p-8 pb-5 relative">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                <Large0Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">{large[0].title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{large[0].description}</p>
            </div>
            <div className="mx-6 rounded-t-xl overflow-hidden border border-white/8 border-b-0 shadow-2xl">
              <img src={large[0].screenshot} alt={large[0].title} className="w-full object-cover object-top max-h-56" />
            </div>
          </div>

          {/* Small cards col */}
          <div className="flex flex-col gap-4">
            {small.slice(0, 2).map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all group relative overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(ellipse at top right, hsl(0 72% 51% / 0.06), transparent 70%)' }} />
                  <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>

          {/* 3 small cards row */}
          {small.slice(2, 5).map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all group relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(ellipse at top right, hsl(0 72% 51% / 0.06), transparent 70%)' }} />
                <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            );
          })}

          {/* Small cards col (left of large card 2) */}
          <div className="flex flex-col gap-4">
            {small.slice(5).map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all group relative overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(ellipse at top right, hsl(0 72% 51% / 0.06), transparent 70%)' }} />
                  <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>

          {/* Large card 2 — right side */}
          <div className="md:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all group relative">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 100%, hsl(0 72% 51% / 0.07), transparent)' }} />
            <div className="p-8 pb-5 relative">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                <Large1Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">{large[1].title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{large[1].description}</p>
            </div>
            <div className="mx-6 rounded-t-xl overflow-hidden border border-white/8 border-b-0 shadow-2xl">
              <img src={large[1].screenshot} alt={large[1].title} className="w-full object-cover object-top max-h-56" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Mid CTA ────────────────────────────────────────────────────────────────── */

function MidCtaSection() {
  return (
    <section className="py-20 border-t border-zinc-800/60 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-5">
        <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900/40 px-10 py-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 100% at 0% 50%, hsl(0 72% 51% / 0.07), transparent 60%)' }} />
          <div className="absolute -top-px left-16 right-16 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="relative">
            <p className="text-white font-black text-2xl md:text-3xl">Ready to run a tighter gym?</p>
            <p className="text-zinc-500 mt-2 max-w-md">Start your free trial today — no credit card needed, setup in under 30 minutes.</p>
          </div>
          <div className="relative flex flex-col sm:flex-row gap-3 shrink-0">
            <a href="#pricing" className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-primary/20 whitespace-nowrap">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </a>
            <a href="/sign-in" className="inline-flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white font-medium px-6 py-3 rounded-xl text-sm transition-all whitespace-nowrap">
              <LogIn className="h-4 w-4" /> Log in
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Theme Showcase ─────────────────────────────────────────────────────────── */

function ThemeShowcaseSection() {
  const screens = [
    { dark: screenshotDashboard,  light: screenshotDashboardLight,  label: 'Dashboard'  },
    { dark: screenshotAnalytics,  light: screenshotAnalyticsLight,  label: 'Analytics'  },
    { dark: screenshotAttendance, light: screenshotAttendanceLight, label: 'Attendance' },
  ];
  const [active, setActive] = useState(1);

  // horizontal offsets: left card, center, right card
  const positions = [
    { x: '-52%', rotate: '-4deg', scale: 0.82, z: 10, opacity: 0.6 },
    { x: '0%',   rotate: '0deg',  scale: 1,    z: 30, opacity: 1   },
    { x: '52%',  rotate: '4deg',  scale: 0.82, z: 10, opacity: 0.6 },
  ];

  const getPos = (i: number) => {
    const rel = ((i - active + 3) % 3);
    // rel 0 = active, 1 = right, 2 = left
    if (rel === 0) return positions[1];
    if (rel === 1) return positions[2];
    return positions[0];
  };

  return (
    <section className="py-32 bg-zinc-950 border-t border-zinc-800/60 overflow-hidden">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-16">
          <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4">Theme Support</p>
          <h2 className="text-4xl md:text-5xl font-black text-white">Dark mode. Light mode.<br /><span className="text-zinc-500">Your call.</span></h2>
          <p className="mt-5 text-zinc-500 max-w-md mx-auto">Toggle between themes with one click. Brofit looks sharp either way.</p>
        </div>

        {/* Glow — sits outside the overflow-hidden container so it bleeds visibly */}
        <div className="relative flex justify-center">
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[50%] h-48 blur-[100px] pointer-events-none" style={{ background: 'hsl(0 72% 51% / 0.35)' }} />
        </div>

        {/* Fan carousel */}
        <div className="relative flex justify-center" style={{ height: '520px' }}>
          {screens.map((item, i) => {
            const pos = getPos(i);
            const isActive = i === active;
            return (
              <div
                key={item.label}
                onClick={() => setActive(i)}
                className="absolute w-[68%] rounded-2xl overflow-hidden border shadow-2xl transition-all duration-500 select-none"
                style={{
                  transform: `translateX(${pos.x}) rotate(${pos.rotate}) scale(${pos.scale})`,
                  zIndex: pos.z,
                  opacity: pos.opacity,
                  cursor: isActive ? 'default' : 'pointer',
                  borderColor: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                  top: isActive ? '0px' : '40px',
                }}
              >
                {/* Label */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-zinc-950/80 backdrop-blur-sm border border-zinc-700/60 rounded-full px-3 py-1">
                  <ScanLine className="h-3 w-3 text-primary" />
                  <span className="text-xs text-zinc-300 font-medium">{item.label}</span>
                </div>

                {/* Split image */}
                <div className="flex w-full">
                  <div className="w-1/2 overflow-hidden">
                    <img src={item.dark}  alt={`${item.label} dark`}  className="w-[200%] max-w-none object-cover object-top" />
                  </div>
                  <div className="w-1/2 overflow-hidden">
                    <img src={item.light} alt={`${item.label} light`} className="w-[200%] max-w-none object-cover object-top" style={{ marginLeft: '-100%' }} />
                  </div>
                </div>

                {/* Divider */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-gradient-to-b from-transparent via-white/30 to-transparent z-10" />
                {isActive && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-zinc-950/90 backdrop-blur border border-zinc-700 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-xl">
                    <span className="text-[10px] font-bold tracking-wider text-zinc-500">DARK</span>
                    <div className="w-px h-3 bg-zinc-700" />
                    <span className="text-[10px] font-bold tracking-wider text-zinc-500">LIGHT</span>
                  </div>
                )}

                {/* Bottom fade on active */}
                {isActive && <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-zinc-950 to-transparent" />}
              </div>
            );
          })}
        </div>

        {/* Dot nav */}
        <div className="flex justify-center gap-3 mt-8">
          {screens.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setActive(i)}
              className={`transition-all duration-300 rounded-full ${i === active ? 'w-8 h-2 bg-primary' : 'w-2 h-2 bg-zinc-700 hover:bg-zinc-500'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ────────────────────────────────────────────────────────────────── */

function PricingSection() {
  return (
    <section id="pricing" className="py-32 bg-zinc-950 border-t border-zinc-800/60">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-20">
          <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-black text-white">Simple, transparent pricing.</h2>
          <p className="mt-5 text-zinc-500 max-w-md mx-auto">No hidden fees. No per-member charges. First 14 days are free.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`relative rounded-2xl flex flex-col transition-all ${
                plan.highlight
                  ? 'bg-zinc-900 border-2 border-primary/50 shadow-[0_0_60px_rgba(220,38,38,0.12)]'
                  : 'bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                  <span className="bg-primary text-white text-[10px] font-black px-4 py-1 rounded-full tracking-widest uppercase shadow-lg shadow-primary/30">
                    {plan.badge}
                  </span>
                </div>
              )}
              <div className="p-7 flex flex-col flex-1">
                <p className="text-zinc-400 text-sm font-medium">{plan.name}</p>
                <div className="mt-3 flex items-end gap-1.5">
                  <span className="text-white font-black text-5xl leading-none">{plan.price}</span>
                  <span className="text-zinc-600 text-sm mb-1.5">{plan.period}</span>
                </div>
                <p className="text-zinc-600 text-xs mt-2">{plan.description}</p>

                <Separator className="my-6 bg-zinc-800" />

                <ul className="space-y-3 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-zinc-400 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="mailto:hello@brofit.in"
                  className={`mt-8 w-full inline-flex items-center justify-center gap-2 font-bold py-3 rounded-xl text-sm transition-all ${
                    plan.highlight
                      ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                  }`}
                >
                  Get Started <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-zinc-600 text-sm mt-8">14-day free trial · No credit card required · Annual billing saves 20%</p>
      </div>
    </section>
  );
}

/* ─── Testimonials ───────────────────────────────────────────────────────────── */

function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-32 border-t border-zinc-800/60" style={{ background: 'radial-gradient(ellipse 100% 60% at 50% 0%, hsl(0 72% 51% / 0.04), transparent 60%), #09090b' }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-20">
          <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-black text-white">Gym owners love Brofit.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div key={t.name} className={`relative bg-zinc-900/40 border rounded-2xl p-7 flex flex-col transition-all hover:border-zinc-700 ${i === 1 ? 'border-zinc-700 md:-translate-y-2' : 'border-zinc-800'}`}>
              <div className="flex gap-0.5 mb-5">
                {[...Array(t.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />)}
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed flex-1">"{t.text}"</p>
              <div className="mt-6 pt-5 border-t border-zinc-800 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-zinc-600 text-xs mt-0.5">{t.gym}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── White Label ────────────────────────────────────────────────────────────── */

function WhiteLabelSection() {
  return (
    <section className="py-32 bg-zinc-950 border-t border-zinc-800/60">
      <div className="max-w-6xl mx-auto px-5">
        <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900/40 p-10 md:p-16">
          <div className="absolute top-0 right-0 w-[500px] h-[300px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right, hsl(0 72% 51% / 0.08), transparent 60%)' }} />
          <div className="absolute -top-px left-16 right-16 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="relative flex flex-col md:flex-row gap-12 items-start">
            <div className="shrink-0 h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Palette className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4">White Label</p>
              <h2 className="text-3xl md:text-4xl font-black text-white">Your brand.<br />Powered by Brofit.</h2>
              <p className="mt-4 text-zinc-500 leading-relaxed max-w-lg">
                Your logo, your colors, your domain. Members never know it's Brofit under the hood — it's 100% yours.
              </p>
              <div className="mt-8 grid sm:grid-cols-2 gap-3">
                {['Custom logo & brand colors', 'Your domain (app.yourgym.com)', 'Branded iOS & Android apps', 'Custom email templates', 'Reseller-ready pricing', 'Full source control option'].map(item => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-zinc-400 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="mailto:hello@brofit.in" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20">
                  Talk to Sales <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#pricing" className="inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all">
                  View Pro Plan
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ────────────────────────────────────────────────────────────────────── */

function CtaSection() {
  return (
    <section className="py-32 border-t border-zinc-800/60" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 100%, hsl(0 72% 51% / 0.08), transparent 70%), #09090b' }}>
      <div className="max-w-4xl mx-auto px-5 text-center">
        <div className="absolute left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-primary/60 to-transparent -mt-32 hidden md:block" />
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight">
          Your gym deserves<br />
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, hsl(0 72% 65%), hsl(0 72% 51%), hsl(20 90% 55%))' }}>
            better software.
          </span>
        </h2>
        <p className="mt-7 text-zinc-500 text-lg max-w-md mx-auto">
          Join gym owners who've ditched spreadsheets and WhatsApp chaos for Brofit.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <a href="mailto:hello@brofit.in" className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-base px-9 py-4 rounded-xl transition-all shadow-2xl shadow-primary/30 hover:scale-[1.02]">
            Start Free Trial <ArrowRight className="h-5 w-5" />
          </a>
          <a href="/sign-in" className="inline-flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-600 bg-white/5 text-zinc-300 hover:text-white font-medium text-base px-9 py-4 rounded-xl transition-all">
            <LogIn className="h-5 w-5" /> Log in to your account
          </a>
        </div>
        <p className="mt-5 text-zinc-700 text-sm">14-day free trial · No credit card needed · Cancel anytime</p>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800/60 py-10">
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img src={brandLogo} alt="Brofit" className="h-7 w-7 rounded-full object-cover" />
            <span className="text-white font-black">Brofit</span>
            <span className="text-zinc-700 text-sm">· Gym Management Software</span>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-zinc-600">
            <a href="#features"     className="hover:text-zinc-300 transition-colors">Features</a>
            <a href="#pricing"      className="hover:text-zinc-300 transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-zinc-300 transition-colors">Testimonials</a>
            <a href="mailto:hello@brofit.in" className="hover:text-zinc-300 transition-colors">Contact</a>
            <a href="/sign-in" className="hover:text-zinc-300 transition-colors flex items-center gap-1.5">
              <LogIn className="h-3.5 w-3.5" /> Log in
            </a>
          </div>
        </div>
        <Separator className="my-7 bg-zinc-800/60" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-zinc-700">
          <p>&copy; 2026 Brofit. All rights reserved.</p>
          <p>Made with love for gym owners across India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */

export function SaasLandingPage() {
  return (
    <div className="bg-zinc-950 min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <MidCtaSection />
      <ThemeShowcaseSection />
      <PricingSection />
      <TestimonialsSection />
      <WhiteLabelSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
