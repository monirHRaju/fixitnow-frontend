"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Wrench,
  CalendarCheck,
  ShieldCheck,
  Star,
  Users,
  Briefcase,
  SmilePlus,
  Headphones,
  Search,
  Calendar,
  CreditCard,
  ThumbsUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const features = [
  {
    icon: Users,
    title: "Verified Technicians",
    description:
      "All technicians are thoroughly vetted and verified to ensure you get quality service every time.",
  },
  {
    icon: CalendarCheck,
    title: "Instant Booking",
    description:
      "Book a technician in minutes. Choose your preferred time slot and get instant confirmation.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description:
      "Pay securely through our platform. Your transactions are protected and encrypted.",
  },
  {
    icon: Star,
    title: "Satisfaction Guaranteed",
    description:
      "Not happy with the service? We'll make it right. Your satisfaction is our top priority.",
  },
];

const statsData = [
  { icon: Users, value: 500, suffix: "+", label: "Technicians" },
  { icon: Briefcase, value: 10000, suffix: "+", label: "Jobs Done" },
  { icon: SmilePlus, value: 98, suffix: "%", label: "Satisfaction" },
  { icon: Headphones, value: 24, suffix: "/7", label: "Support" },
];

const howItWorks = [
  {
    icon: Search,
    step: "01",
    title: "Find a Service",
    description:
      "Browse through our wide range of services or search for what you need.",
  },
  {
    icon: Calendar,
    step: "02",
    title: "Book a Technician",
    description:
      "Pick a skilled technician and schedule a time that works for you.",
  },
  {
    icon: CreditCard,
    step: "03",
    title: "Get It Done",
    description:
      "Relax while the technician handles the job. Pay securely after completion.",
  },
];

function CountUp({
  end,
  suffix,
  duration = 2,
}: {
  end: number;
  suffix: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="flex flex-col">
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5 px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
            {/* Background decoration */}
            <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative mx-auto max-w-7xl">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="mx-auto max-w-3xl text-center"
              >
                <motion.h1
                  variants={fadeInUp}
                  className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
                >
                  FixItNow –{" "}
                  <span className="text-primary">Skilled Help, Just a Click Away</span>
                </motion.h1>
                <motion.p
                  variants={fadeInUp}
                  className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl"
                >
                  Find trusted technicians for all your repair and maintenance needs.
                  From plumbing to electrical work, we connect you with verified
                  professionals who get the job done right.
                </motion.p>
                <motion.div
                  variants={fadeInUp}
                  className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
                >
                  <Link href="/services">
                    <Button size="lg" className="gap-2 px-8 text-base">
                      Find Services
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/register?role=TECHNICIAN">
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 px-8 text-base"
                    >
                      <Wrench className="h-5 w-5" />
                      Become a Technician
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="bg-muted/50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="text-center"
              >
                <motion.h2
                  variants={fadeInUp}
                  className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                >
                  Why Choose FixItNow?
                </motion.h2>
                <motion.p
                  variants={fadeInUp}
                  className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"
                >
                  We make it easy to find reliable technicians and get your tasks done
                  without the hassle.
                </motion.p>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
              >
                {features.map((feature) => (
                  <motion.div
                    key={feature.title}
                    variants={fadeInUp}
                    className="group rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="bg-primary px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
              >
                {statsData.map((stat) => (
                  <motion.div
                    key={stat.label}
                    variants={fadeInUp}
                    className="text-center"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground">
                      <stat.icon className="h-7 w-7" />
                    </div>
                    <div className="mt-4 text-4xl font-bold text-primary-foreground sm:text-5xl">
                      <CountUp end={stat.value} suffix={stat.suffix} />
                    </div>
                    <p className="mt-2 text-sm font-medium text-primary-foreground/80">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="bg-background px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="text-center"
              >
                <motion.h2
                  variants={fadeInUp}
                  className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                >
                  How It Works
                </motion.h2>
                <motion.p
                  variants={fadeInUp}
                  className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"
                >
                  Getting the help you need is simple. Just follow these three easy
                  steps.
                </motion.p>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="mt-16 grid gap-8 md:grid-cols-3"
              >
                {howItWorks.map((item, index) => (
                  <motion.div
                    key={item.step}
                    variants={fadeInUp}
                    className="relative rounded-xl border bg-card p-8 text-center shadow-sm"
                  >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {item.step}
                      </span>
                    </div>
                    <div className="mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <item.icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>

                    {/* Connector line between steps */}
                    {index < howItWorks.length - 1 && (
                      <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 md:block">
                        <ArrowRight className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* CTA Banner */}
          <section className="bg-muted/50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-br from-primary to-primary/80 px-8 py-16 text-center shadow-xl sm:px-16"
            >
              <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
                Ready to Get Started?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/90">
                Join thousands of satisfied customers. Find the right technician for
                your needs today.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/services">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="gap-2 px-8 text-base"
                  >
                    <ThumbsUp className="h-5 w-5" />
                    Browse Services
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 border-primary-foreground/30 bg-transparent px-8 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    Sign Up Free
                  </Button>
                </Link>
              </div>
            </motion.div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}