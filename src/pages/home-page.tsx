import {
  Dumbbell,
  Clock,
  ShowerHead,
  Heart,
  Users,
  ShieldCheck,
  MapPin,
  Phone,
  Star,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';

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

const stats = [
  { value: '500+', label: 'Active Members' },
  { value: '5+', label: 'Years Running' },
  { value: '6AM–10PM', label: 'Open Daily' },
  { value: '100%', label: 'Commitment' },
];

const testimonials = [
  {
    name: 'Rahul S.',
    text: "Brofit changed my life. The trainers genuinely care and the equipment is top-notch. I've never felt more confident.",
    rating: 5,
  },
  {
    name: 'Priya M.',
    text: "As a woman, the separate ladies timing is a game-changer. I feel safe and focused during my workouts. Love this place!",
    rating: 5,
  },
  {
    name: 'Amit K.',
    text: "Clean facilities, great cardio section, and the changing rooms are always spotless. Best gym in the area, hands down.",
    rating: 5,
  },
];

export function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-60" />
        <div className="container relative mx-auto px-4 py-24 md:py-36">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="text-sm px-4 py-1">
              Now Open — New Batch Starting Soon
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Your Body Deserves{' '}
              <span className="text-primary">The Best Gym</span> in Town
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              At Brofit, we don't just build muscles — we build discipline,
              confidence, and a healthier you. Walk in unfit, walk out unstoppable.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <a
                href="tel:+919999999999"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors"
              >
                <Phone className="h-5 w-5" />
                Call Now
              </a>
              <a
                href="#facilities"
                className="inline-flex items-center gap-2 border border-border px-8 py-3 rounded-lg font-semibold text-lg hover:bg-accent transition-colors"
              >
                Explore Facilities
                <ChevronRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl md:text-3xl font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
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
              From heavy lifting to peaceful cardio — Brofit is designed for
              every kind of fitness journey.
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
                Brofit isn't just another gym — it's a community. We've
                spent years perfecting a space where everyone feels welcome,
                whether you're a first-timer or a seasoned lifter.
              </p>
              <p>
                Our separate ladies timing ensures women have their own
                dedicated, comfortable space. Our changing rooms and washrooms
                are cleaned multiple times a day. And our cardio section? It's
                got everything from treadmills to rowing machines, so you'll
                never wait for your turn.
              </p>
              <p>
                With certified trainers who know their craft and a vibe that
                keeps you coming back — Brofit is where results happen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">
              What Our Members Say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <Card key={t.name} className="p-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  "{t.text}"
                </p>
                <p className="font-semibold text-sm">{t.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Location / Contact CTA */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Come Visit Us</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Drop by anytime during our working hours. No appointment needed — just
            walk in and feel the energy.
          </p>
          <div className="flex flex-wrap gap-8 justify-center pt-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Your City, Your Area</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <span>+91 99999 99999</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>6:00 AM – 10:00 PM</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
