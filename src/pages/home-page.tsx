import { useState, useEffect, useCallback } from 'react';
import {
  Dumbbell,
  Clock,
  ShowerHead,
  Heart,
  Users,
  ShieldCheck,
  MapPin,
  Phone,
  ChevronRight,
  ChevronLeft,
  Flame,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import brandLogo from '@/assets/brand_logo.png';

const facilities = [
  {
    icon: Dumbbell,
    title: 'Full Equipment Zone',
    description:
      'State-of-the-art machines, free weights, and functional training rigs for every fitness level.',
  },
  {
    icon: Heart,
    title: 'Cardio Section',
    description:
      'Dedicated cardio area with treadmills, ellipticals, cycles, and rowing machines to keep your heart pumping.',
  },
  {
    icon: ShowerHead,
    title: 'Clean Washrooms',
    description:
      'Hygienic, well-maintained washrooms available for all members. Freshness guaranteed.',
  },
  {
    icon: ShieldCheck,
    title: 'Changing Rooms',
    description:
      'Private, secure changing rooms with lockers so you can gear up comfortably before and after your workout.',
  },
  {
    icon: Users,
    title: 'Separate Ladies Timing',
    description:
      'Dedicated time slots exclusively for women, ensuring a comfortable and private workout environment.',
  },
  {
    icon: Flame,
    title: 'Expert Trainers',
    description:
      'Certified trainers who craft personalized plans and guide you every step of the way.',
  },
];

const highlights = [
  { icon: Sparkles, value: 'Grand Opening', label: 'Newly Launched' },
  { icon: Clock, value: '6AM–10PM', label: 'Open Daily' },
  { icon: Users, value: 'Ladies Timing', label: 'Exclusive Slots' },
  { icon: Flame, value: 'Certified', label: 'Expert Trainers' },
];

// Replace null with your imported image, e.g.: import gym1 from '@/assets/gym/gym1.jpg'
const slides: { src: string | null; label: string }[] = [
  { src: null, label: 'Weight Training Area' },
  { src: null, label: 'Cardio Zone' },
  { src: null, label: 'Free Weights Section' },
  { src: null, label: "Ladies' Training Area" },
  { src: null, label: 'Changing Room' },
];

function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + slides.length) % slides.length),
    []
  );
  const next = useCallback(
    () => setCurrent((c) => (c + 1) % slides.length),
    []
  );

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background — image or gradient fallback */}
      {slide.src ? (
        <img
          key={current}
          src={slide.src}
          alt={slide.label}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
      )}

      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Subtle animated grain texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjY1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
        aria-label="Previous"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
        aria-label="Next"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Hero content overlaid */}
      <div className="relative z-10 container mx-auto px-4 py-24 text-center text-white space-y-6 max-w-3xl">
        <div className="flex justify-center">
          <img
            src={brandLogo}
            alt="Brofit"
            className="h-24 w-24 rounded-full object-cover ring-4 ring-white/20 shadow-2xl"
          />
        </div>
        <Badge className="bg-white/15 text-white border-white/20 backdrop-blur-sm text-sm px-4 py-1 hover:bg-white/15">
          Now Open — New Batch Starting Soon
        </Badge>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-lg">
          Your Body Deserves{' '}
          <span className="text-primary">The Best Gym</span> in Town
        </h1>
        <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed">
          At Brofit, we don't just build muscles — we build discipline,
          confidence, and a healthier you. Walk in, work hard, walk out
          unstoppable.
        </p>
        <div className="flex flex-wrap gap-4 justify-center pt-2">
          <a
            href="tel:+917407473804"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg"
          >
            <Phone className="h-5 w-5" />
            Call Now
          </a>
          <a
            href="#facilities"
            className="inline-flex items-center gap-2 bg-white/10 border border-white/25 backdrop-blur-sm text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/20 transition-colors"
          >
            Explore Facilities
            <ChevronRight className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* Slide label + dots */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center gap-3">
        {slide.src && (
          <span className="text-white/60 text-xs tracking-widest uppercase">
            {slide.label}
          </span>
        )}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero + Carousel */}
      <HeroCarousel />

      {/* Highlights Bar */}
      <section className="border-y bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {highlights.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <item.icon className="h-6 w-6 text-primary" />
                <p className="text-lg md:text-xl font-bold text-primary">
                  {item.value}
                </p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section id="facilities" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything You Need, Under One Roof
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-lg">
              From heavy lifting to focused cardio — Brofit is built for every
              kind of fitness journey.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((facility) => (
              <Card
                key={facility.title}
                className="p-6 hover:shadow-lg transition-shadow border-border/60 group"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <facility.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{facility.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {facility.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Why Brofit Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Why People Choose Brofit
            </h2>
            <div className="space-y-4 text-left text-muted-foreground text-lg leading-relaxed">
              <p>
                Brofit isn't just another gym — it's a community built from day
                one with the right values. We've created a space where everyone
                feels welcome, whether you're stepping into a gym for the first
                time or getting back on track.
              </p>
              <p>
                Our separate ladies timing ensures women have their own
                dedicated, comfortable space. Our changing rooms and washrooms
                are cleaned multiple times a day. And our cardio section has
                everything from treadmills to rowing machines — so you'll never
                wait for your turn.
              </p>
              <p>
                With certified trainers who know their craft and an atmosphere
                that keeps you coming back — Brofit is where results happen.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Location / Contact CTA */}
      <section id="contact" className="py-20 md:py-28">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Come Visit Us</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Drop by anytime during our working hours. No appointment needed —
            just walk in and feel the energy.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-6 justify-center pt-4 text-muted-foreground">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span className="text-left">
                HC Nursing Home, Marwadi Patty,<br />
                Sainthia, Birbhum, 731234, WB
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary shrink-0" />
              <a
                href="tel:+917407473804"
                className="hover:text-foreground transition-colors"
              >
                +91 74074 73804
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary shrink-0" />
              <span>6:00 AM – 10:00 PM</span>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Software mention */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center space-y-3 max-w-2xl">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-sm font-medium uppercase tracking-wide">
              Powered by Brofit 2.0
            </span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Brofit runs on a custom-built gym management platform — handling
            memberships, trainers, payments, and more. Interested in using it
            for your own gym?{' '}
            <a
              href="tel:+917407473804"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Get in touch.
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
