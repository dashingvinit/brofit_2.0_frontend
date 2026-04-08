import { useState, useEffect, useRef } from 'react';
import {
  Users,
  CreditCard,
  BarChart3,
  Dumbbell,
  UserCheck,
  Smartphone,
  Globe,
  Palette,
  CheckCircle2,
  ArrowRight,
  Star,
  TrendingUp,
  DollarSign,
  Bell,
  Shield,
  Zap,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Apple,
  Play,
  MonitorSmartphone,
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import brandLogo from '@/assets/brand_logo.png';
import gymImage1 from '@/assets/1.jpg';
import gymImage2 from '@/assets/2.jpg';
import gymImage3 from '@/assets/3.jpg';

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const features = [
  {
    icon: Users,
    title: 'Member Management',
    description:
      'Register, search, and manage members with full profile history, photos, and custom fields.',
  },
  {
    icon: CreditCard,
    title: 'Membership & Payments',
    description:
      'Flexible plans, variants, and payment recording with instant overdue alerts.',
  },
  {
    icon: Dumbbell,
    title: 'Personal Training',
    description:
      'Assign trainers, track PT sessions, and handle training-specific billing separately.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description:
      'Real-time dashboards — revenue trends, membership churn, active members, and more.',
  },
  {
    icon: DollarSign,
    title: 'Financials Module',
    description:
      'Log expenses, investments, and income. Know your gym\'s profitability at a glance.',
  },
  {
    icon: UserCheck,
    title: 'Trainer Profiles',
    description:
      'Dedicated trainer pages with specializations, session history, and earnings overview.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description:
      'Automated renewal reminders and expiry alerts so no revenue slips through the cracks.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description:
      'Admin and staff roles with fine-grained permissions — staff can\'t touch what they shouldn\'t.',
  },
  {
    icon: TrendingUp,
    title: 'Plan Management',
    description:
      'Create unlimited plan types and variants — monthly, quarterly, annual, custom.',
  },
];

const platforms = [
  {
    icon: Globe,
    title: 'Web App',
    description: 'Full-featured dashboard accessible from any browser, anywhere.',
    color: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'text-blue-500',
  },
  {
    icon: Apple,
    title: 'iOS App',
    description: 'Native iPhone & iPad app for members and staff on the go.',
    color: 'from-zinc-500/20 to-zinc-600/10',
    iconColor: 'text-zinc-400',
  },
  {
    icon: Play,
    title: 'Android App',
    description: 'Smooth Android experience — works on phones and tablets.',
    color: 'from-green-500/20 to-green-600/10',
    iconColor: 'text-green-500',
  },
];

const plans = [
  {
    name: 'Starter',
    price: '₹1,499',
    period: '/month',
    description: 'Perfect for small gyms just getting started.',
    highlight: false,
    features: [
      'Up to 200 active members',
      'Member & membership management',
      'Payment tracking',
      'Basic analytics',
      'Web app access',
      'Email support',
    ],
  },
  {
    name: 'Growth',
    price: '₹2,999',
    period: '/month',
    description: 'The most popular plan for growing gyms.',
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Up to 1,000 active members',
      'Everything in Starter',
      'Personal training module',
      'Financials & expense tracking',
      'Advanced analytics',
      'iOS & Android apps',
      'Priority support',
    ],
  },
  {
    name: 'Pro',
    price: '₹5,499',
    period: '/month',
    description: 'For multi-branch gyms and fitness chains.',
    highlight: false,
    features: [
      'Unlimited members',
      'Everything in Growth',
      'Multi-branch support',
      'White-label branding',
      'Custom domain',
      'API access',
      'Dedicated account manager',
    ],
  },
];

const testimonials = [
  {
    name: 'Rahul Sharma',
    gym: 'FitZone, Delhi',
    rating: 5,
    text: 'Switched from a spreadsheet to Brofit and honestly I don\'t know how we managed before. Renewal reminders alone saved us ₹40k in the first month.',
  },
  {
    name: 'Priya Menon',
    gym: 'Iron Temple, Bangalore',
    rating: 5,
    text: 'The financial module is a game-changer. I can see exactly where the money is going and which months are slow. The analytics are top-tier.',
  },
  {
    name: 'Arjun Verma',
    gym: 'Peak Performance, Mumbai',
    rating: 5,
    text: 'Setup took under 30 minutes. The UI is incredibly clean — my front-desk staff picked it up without any training.',
  },
];

/* ─── UI Demo Mock ──────────────────────────────────────────────────────────── */

function DashboardMock() {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 overflow-hidden shadow-2xl text-xs select-none">
      {/* Top bar */}
      <div className="bg-zinc-800/80 px-4 py-2.5 flex items-center gap-2 border-b border-white/5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <div className="ml-3 flex-1 bg-zinc-700/60 rounded px-2 py-0.5 text-zinc-400 text-[10px] max-w-48">
          app.brofit.in/dashboard
        </div>
      </div>
      {/* Layout */}
      <div className="flex h-64">
        {/* Sidebar */}
        <div className="w-36 bg-zinc-900 border-r border-white/5 p-3 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="h-5 w-5 rounded-full bg-primary/80" />
            <span className="text-white font-semibold text-[10px]">Brofit</span>
          </div>
          {['Dashboard', 'Members', 'Memberships', 'Training', 'Plans', 'Financials', 'Analytics'].map((item, i) => (
            <div
              key={item}
              className={`px-2 py-1 rounded text-[10px] ${i === 0 ? 'bg-primary/20 text-primary' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              {item}
            </div>
          ))}
        </div>
        {/* Main */}
        <div className="flex-1 p-3 overflow-hidden">
          <p className="text-white font-semibold text-[11px] mb-2">Overview</p>
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'Active Members', value: '342', change: '+12' },
              { label: 'Revenue (MTD)', value: '₹1.8L', change: '+8%' },
              { label: 'Renewals Due', value: '18', change: 'this week' },
            ].map((stat) => (
              <div key={stat.label} className="bg-zinc-800 rounded p-2">
                <p className="text-zinc-400 text-[9px]">{stat.label}</p>
                <p className="text-white font-bold text-sm">{stat.value}</p>
                <p className="text-green-400 text-[9px]">{stat.change}</p>
              </div>
            ))}
          </div>
          {/* Chart placeholder */}
          <div className="bg-zinc-800 rounded p-2 h-20 flex items-end gap-1 overflow-hidden">
            {[40, 60, 45, 80, 55, 90, 70, 85, 65, 95, 75, 88].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t"
                style={{
                  height: `${h}%`,
                  background: i === 10 ? 'hsl(0 72.2% 50.6%)' : 'hsl(0 72.2% 50.6% / 0.3)',
                }}
              />
            ))}
          </div>
          <p className="text-zinc-500 text-[9px] mt-1">Monthly Revenue — Last 12 Months</p>
        </div>
      </div>
    </div>
  );
}

function MembersMock() {
  const members = [
    { name: 'Aarav Singh', plan: 'Premium', status: 'Active', due: 'Mar 28' },
    { name: 'Nisha Gupta', plan: 'Standard', status: 'Active', due: 'Mar 15' },
    { name: 'Rohan Patel', plan: 'PT Package', status: 'Expiring', due: 'Mar 10' },
    { name: 'Divya Sharma', plan: 'Premium', status: 'Active', due: 'Apr 5' },
  ];
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 overflow-hidden shadow-2xl text-xs select-none">
      <div className="bg-zinc-800/80 px-4 py-2.5 flex items-center gap-2 border-b border-white/5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <div className="ml-3 flex-1 bg-zinc-700/60 rounded px-2 py-0.5 text-zinc-400 text-[10px] max-w-48">
          app.brofit.in/members
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-semibold text-[11px]">Members</p>
          <div className="bg-primary text-white rounded px-2 py-0.5 text-[9px] font-medium">+ Add Member</div>
        </div>
        <div className="bg-zinc-800/50 rounded px-2 py-1.5 text-zinc-400 text-[10px] mb-2">🔍 Search members...</div>
        <div className="divide-y divide-white/5">
          {members.map((m) => (
            <div key={m.name} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/30 flex items-center justify-center text-[9px] text-primary font-bold">
                  {m.name[0]}
                </div>
                <div>
                  <p className="text-white text-[10px] font-medium">{m.name}</p>
                  <p className="text-zinc-500 text-[9px]">{m.plan}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${m.status === 'Expiring' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                  {m.status}
                </span>
                <p className="text-zinc-500 text-[9px] mt-0.5">Due {m.due}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Carousel ──────────────────────────────────────────────────────────────── */

const carouselSlides = [
  {
    image: gymImage1,
    caption: 'Modern gym management at your fingertips',
  },
  {
    image: gymImage2,
    caption: 'Track members, payments, and growth in real time',
  },
  {
    image: gymImage3,
    caption: 'Built for serious gym owners across India',
  },
];

function GymCarousel() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = (idx: number) => {
    setCurrent((idx + carouselSlides.length) % carouselSlides.length);
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % carouselSlides.length), 4500);
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleNav = (dir: number) => {
    goTo(current + dir);
    resetTimer();
  };

  return (
    <section className="py-20 bg-zinc-950">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Inside Brofit</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white">A platform built for real gyms</h2>
        </div>

        <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
          {/* Images */}
          {carouselSlides.map((slide, i) => (
            <div
              key={i}
              className={`transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
            >
              <img
                src={slide.image}
                alt={slide.caption}
                className="w-full h-[420px] object-cover"
              />
              {/* Gradient overlay + caption */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent px-8 py-6">
                <p className="text-white text-lg font-semibold drop-shadow">{slide.caption}</p>
              </div>
            </div>
          ))}

          {/* Prev / Next */}
          <button
            onClick={() => handleNav(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-opacity opacity-0 group-hover:opacity-100"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleNav(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-opacity opacity-0 group-hover:opacity-100"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 right-6 flex gap-2">
            {carouselSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => { goTo(i); resetTimer(); }}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-5' : 'bg-white/40 w-1.5'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Sections ──────────────────────────────────────────────────────────────── */

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'Platforms', href: '#platforms' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-zinc-950/90 backdrop-blur-md border-b border-white/5 shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <img src={brandLogo} alt="Brofit" className="h-8 w-8 rounded-full object-cover" />
          <span className="text-white font-bold text-lg tracking-tight">Brofit</span>
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs hidden sm:inline-flex">SaaS</Badge>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-zinc-300 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="mailto:hello@brofit.in"
            className="text-zinc-300 hover:text-white text-sm font-medium transition-colors"
          >
            Contact Sales
          </a>
          <a
            href="#pricing"
            className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-primary/20"
          >
            Get Started Free
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-zinc-300 hover:text-white"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-zinc-950/95 backdrop-blur-md px-4 py-4 flex flex-col gap-2">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-zinc-300 hover:text-white text-sm font-medium py-2 border-b border-white/5"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#pricing"
            onClick={() => setOpen(false)}
            className="mt-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-lg text-center"
          >
            Get Started Free
          </a>
        </div>
      )}
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="text-primary text-sm font-medium">Built for serious gym owners</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-5xl mx-auto">
          Run Your Gym Like a{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400">
            Business
          </span>
          , Not a Hobby
        </h1>

        <p className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Brofit is the all-in-one gym management platform that handles members, payments, trainers, analytics, and more — so you can focus on what matters: growing your gym.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#pricing"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]"
          >
            Start Free — No Card Needed
            <ArrowRight className="h-5 w-5" />
          </a>
          <a
            href="#demo"
            className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-colors"
          >
            See It In Action
            <ChevronDown className="h-5 w-5" />
          </a>
        </div>

        {/* Social proof */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span>Loved by gym owners</span>
          </div>
          <div className="h-4 w-px bg-zinc-700 hidden sm:block" />
          <span>14-day free trial</span>
          <div className="h-4 w-px bg-zinc-700 hidden sm:block" />
          <span>Setup in under 30 min</span>
          <div className="h-4 w-px bg-zinc-700 hidden sm:block" />
          <span>Cancel anytime</span>
        </div>

        {/* Demo preview */}
        <div id="demo" className="mt-16 relative max-w-4xl mx-auto">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-transparent to-blue-500/20 rounded-2xl blur-xl" />
          <div className="relative grid md:grid-cols-2 gap-4">
            <DashboardMock />
            <MembersMock />
          </div>
          <p className="text-zinc-500 text-sm mt-4">Live preview of the Brofit dashboard</p>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-zinc-950">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Features</Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Everything a gym owner needs
          </h2>
          <p className="mt-4 text-zinc-400 text-lg max-w-xl mx-auto">
            No more spreadsheets. No more WhatsApp reminders. No more guesswork.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <Card
              key={f.title}
              className="bg-zinc-900 border-zinc-800 p-6 hover:border-primary/40 hover:bg-zinc-800/80 transition-all group"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlatformsSection() {
  return (
    <section id="platforms" className="py-24 bg-zinc-900/50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Multi-Platform</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Your gym, on every device
            </h2>
            <p className="mt-4 text-zinc-400 text-lg leading-relaxed">
              Whether you're at your front desk, on the floor, or checking stats from home — Brofit works everywhere. Web, iOS, and Android, all in perfect sync.
            </p>
            <div className="mt-8 space-y-4">
              {platforms.map((p) => (
                <div key={p.title} className="flex items-start gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 transition-colors">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center shrink-0`}>
                    <p.icon className={`h-5 w-5 ${p.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{p.title}</p>
                    <p className="text-zinc-400 text-sm mt-0.5">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform visual */}
          <div className="relative flex justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-3xl blur-3xl" />
            <div className="relative grid grid-cols-2 gap-4 max-w-sm">
              {/* Phone mock */}
              <div className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white text-xs font-semibold">Today's Overview</span>
                  <MonitorSmartphone className="h-4 w-4 text-zinc-500" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Check-ins', value: '47', icon: '👥' },
                    { label: 'Revenue', value: '₹12,400', icon: '💰' },
                    { label: 'Expiring', value: '6', icon: '⚠️' },
                    { label: 'New Today', value: '3', icon: '✨' },
                  ].map((s) => (
                    <div key={s.label} className="bg-zinc-800 rounded-lg p-3">
                      <p className="text-base">{s.icon}</p>
                      <p className="text-white font-bold text-sm mt-1">{s.value}</p>
                      <p className="text-zinc-500 text-[10px]">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-lg">
                <Smartphone className="h-5 w-5 text-primary mb-2" />
                <p className="text-white text-xs font-semibold">iOS App</p>
                <p className="text-zinc-500 text-[10px] mt-1">App Store</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-lg">
                <Play className="h-5 w-5 text-green-400 mb-2" />
                <p className="text-white text-xs font-semibold">Android App</p>
                <p className="text-zinc-500 text-[10px] mt-1">Play Store</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhiteLabelSection() {
  return (
    <section className="py-24 bg-zinc-950">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-700 p-8 md:p-16">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl" />
          <div className="relative max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-sm">White Label</Badge>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Make it yours. Brand it completely.
            </h2>
            <p className="mt-4 text-zinc-400 text-lg leading-relaxed max-w-2xl">
              Launch your own branded gym management app. Your logo, your colors, your domain. Your members will never know it's powered by Brofit — it's 100% yours.
            </p>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {[
                'Custom logo & brand colors',
                'Your domain (app.yourgym.com)',
                'Branded iOS & Android apps',
                'Custom email templates',
                'Reseller-ready pricing',
                'Full source control option',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:hello@brofit.in"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/25"
              >
                Talk to Sales
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                View Pro Plan
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-zinc-900/40">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Pricing</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-zinc-400 text-lg max-w-xl mx-auto">
            No hidden fees. No per-member charges. One flat monthly rate — and your first 14 days are on us.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 flex flex-col transition-all ${
                plan.highlight
                  ? 'bg-zinc-900 border-primary shadow-xl shadow-primary/10 scale-[1.02]'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}
              <div>
                <p className="text-white font-bold text-lg">{plan.name}</p>
                <p className="text-zinc-400 text-sm mt-1">{plan.description}</p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="text-white font-extrabold text-4xl">{plan.price}</span>
                  <span className="text-zinc-400 text-sm mb-1">{plan.period}</span>
                </div>
              </div>

              <Separator className="my-6 bg-zinc-800" />

              <ul className="space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-zinc-300 text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="mailto:hello@brofit.in"
                className={`mt-8 w-full inline-flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all text-sm ${
                  plan.highlight
                    ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                }`}
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-zinc-500 text-sm mt-8">
          All plans include 14-day free trial. No credit card required. Annual billing saves 20%.
        </p>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-zinc-950">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Testimonials</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Gym owners love Brofit
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <Card key={t.name} className="bg-zinc-900 border-zinc-800 p-6 hover:border-zinc-700 transition-colors">
              <div className="flex mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed">"{t.text}"</p>
              <div className="mt-5 pt-4 border-t border-zinc-800">
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{t.gym}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-24 bg-zinc-950">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 via-zinc-900 to-zinc-900 border border-primary/20 text-center px-8 py-20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/15 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white max-w-3xl mx-auto leading-tight">
              Your gym deserves better software.{' '}
              <span className="text-primary">Start today.</span>
            </h2>
            <p className="mt-5 text-zinc-400 text-lg max-w-xl mx-auto">
              Join gym owners who've replaced messy spreadsheets and forgotten WhatsApp reminders with Brofit.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:hello@brofit.in"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-lg px-10 py-4 rounded-xl transition-all shadow-2xl shadow-primary/30 hover:scale-[1.02]"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="mailto:hello@brofit.in"
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg px-10 py-4 rounded-xl transition-colors"
              >
                Talk to Sales
              </a>
            </div>
            <p className="mt-5 text-zinc-500 text-sm">14-day free trial · No credit card needed · Cancel anytime</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img src={brandLogo} alt="Brofit" className="h-7 w-7 rounded-full object-cover" />
            <span className="text-white font-bold">Brofit</span>
            <span className="text-zinc-600 text-sm">Gym Management Software</span>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#platforms" className="hover:text-white transition-colors">Platforms</a>
            <a href="mailto:hello@brofit.in" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
        <Separator className="my-8 bg-zinc-800" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>&copy; 2026 Brofit. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p>Made with love for gym owners across India 🇮🇳</p>
            <a
              href="/sign-in"
              className="text-zinc-700 hover:text-zinc-500 transition-colors"
            >
              Staff / Admin Login
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export function SaasLandingPage() {
  return (
    <div className="bg-zinc-950 min-h-screen">
      <Navbar />
      <HeroSection />
      <GymCarousel />
      <FeaturesSection />
      <PlatformsSection />
      <WhiteLabelSection />
      <PricingSection />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
