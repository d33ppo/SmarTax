"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45 },
  },
};

const steps = [
  {
    title: "Submit income details",
    desc: "Input your EA form details and  essential income information for assessment.",
  },
  {
    title: "Complete guided eligibility checks",
    desc: "Answer structured questions across lifestyle, medical, education, parent and insurance relief categories.",
  },
  {
    title: "Review assessment outcome",
    desc: "See estimated missed reliefs, projected tax savings and supporting LHDN-based references.",
  },
];

const reliefs = [
  { name: "Lifestyle", status: "Eligible" },
  { name: "Medical", status: "Eligible" },
  { name: "Education", status: "Eligible" },
  { name: "Insurance", status: "Eligible" },
];

function PortalBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-white" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute left-[-12rem] top-[-10rem] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(29,78,216,0.08),rgba(29,78,216,0.03)_35%,transparent_72%)] blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.7, delay: 0.2 }}
        className="absolute right-[-10rem] top-[6rem] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(15,39,71,0.05),rgba(29,78,216,0.02)_35%,transparent_72%)] blur-3xl"
      />

      <div className="absolute inset-x-0 top-[44rem] h-px bg-gradient-to-r from-transparent via-[#C9D2DD] to-transparent" />
    </div>
  );
}

function StatPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#D7DCE3] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#5B6472]">
      {children}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D7DCE3] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1D4ED8]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#1D4ED8]" />
      {children}
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-[#0F2747]">
      <PortalBackground />

      {/* TOP UTILITY BAR */}
      <div className="relative z-10 border-b border-[#D7DCE3]/70 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2.5 text-xs text-[#5B6472]">
          <div className="flex items-center gap-5">
            <span className="font-medium">Digital Tax Relief Review Service</span>
          </div>
          
        </div>
      </div>

      {/* NAV */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-4">
          <Image src="/logo.svg" alt="SmarTax" width={140} height={36} />
          <div className="hidden h-8 w-px bg-[#D7DCE3] md:block" />
          <div className="hidden md:block">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5B6472]">
              Public Service Interface
            </p>
            <p className="text-sm font-medium text-[#0F2747]">
              Relief Eligibility Assessment Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-[#5B6472] transition hover:text-[#0F2747]"
          >
            Log in
          </Link>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/signup"
              className="inline-flex items-center rounded-xl bg-[#0F2747] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(15,39,71,0.18)] transition hover:bg-[#12315A]"
            >
              Start assessment
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 pt-16 pb-10 md:grid-cols-2 md:pt-20 md:pb-12">
        {/* LEFT */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col"
        >
          <motion.div variants={item}>
            <SectionLabel>Service overview</SectionLabel>
          </motion.div>

          <motion.div
            variants={item}
            className="mb-5 flex flex-wrap items-center gap-3"
          >
            <StatPill>Based on LHDN guidance</StatPill>
            <StatPill>Covers 22 relief categories</StatPill>
          </motion.div>

          <motion.h1
            variants={item}
            className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#0B1F38] sm:text-5xl md:text-6xl"
          >
           Want to find your missing ringgit ? Click below
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-2xl text-lg leading-8 text-[#5B6472]"
          >
            Input  your EA form details, complete guided checks, and receive a clearer
            review of potentially claimable reliefs with estimated savings and
            relevant LHDN-based reference support.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-col gap-4 sm:flex-row"
          >
            <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-[#0F2747] px-6 py-3.5 font-semibold text-white shadow-[0_20px_40px_rgba(15,39,71,0.18)] transition hover:bg-[#12315A]"
              >
                Start assessment
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-[#C9D2DD] bg-white/80 px-6 py-3.5 font-semibold text-[#0F2747] transition hover:bg-white"
              >
                View sample report
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute inset-6 rounded-[1.75rem] border border-[#D7DCE3]/70 bg-white/40 shadow-[0_28px_60px_rgba(15,39,71,0.05)]" />

          <div className="relative w-full overflow-hidden rounded-[1.75rem] border border-[#C9D2DD] bg-white/92 shadow-[0_24px_80px_rgba(15,39,71,0.08)] backdrop-blur-sm">
            {/* Card Header */}
            <div className="border-b border-[#E3E8EF] px-6 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5B6472]">
                    Assessment summary
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#0B1F38]">
                    Estimated savings: RM 1,240
                  </h2>
                  <p className="mt-2 text-sm text-[#5B6472]">
                    Potential relief opportunities identified from submitted data
                    and guided eligibility review.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="inline-flex items-center rounded-full border border-[#B7E2C5] bg-[#EDF9F1] px-3 py-1 text-xs font-semibold text-[#1F8A4C]">
                    Assessment 
                  </span>
                  
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid gap-px bg-[#E3E8EF] sm:grid-cols-2">
              <div className="bg-white px-6 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5B6472]">
                  Assessment status
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F2747]">
                  Completed
                </p>
              </div>
              <div className="bg-white px-6 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5B6472]">
                  Reference basis
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F2747]">
                  LHDN guidance
                </p>
              </div>
              <div className="bg-white px-6 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5B6472]">
                  Eligible categories found
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F2747]">4</p>
              </div>
              <div className="bg-white px-6 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5B6472]">
                  Output type
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F2747]">
                  Relief review summary
                </p>
              </div>
            </div>

            {/* Relief list */}
            <div className="px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5B6472]">
                  Identified categories
                </p>
                <p className="text-xs text-[#5B6472]">Verified against guided inputs</p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[#D7DCE3] bg-[#FCFDFE]">
                {reliefs.map((relief, i) => (
                  <motion.div
                    key={relief.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className={`grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 ${
                      i !== reliefs.length - 1 ? "border-b border-[#E3E8EF]" : ""
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#0F2747]">
                        {relief.name}
                      </p>
                      <p className="mt-1 text-xs text-[#5B6472]">
                        Relief category matched through structured assessment logic
                      </p>
                    </div>

                    <span className="inline-flex items-center rounded-full border border-[#B7E2C5] bg-[#EDF9F1] px-3 py-1 text-xs font-semibold text-[#1F8A4C]">
                      {relief.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Reference note */}
            <div className="border-t border-[#E3E8EF] bg-[#F7FAFD] px-6 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5B6472]">
                Supporting basis
              </p>
              <p className="mt-2 text-sm leading-7 text-[#5B6472]">
                Relief findings are presented together with relevant LHDN-based
                guidance references to support review before filing.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 text-center">
          <SectionLabel>Assessment process</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-[#0B1F38]"
          >
            How the relief assessment works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#5B6472]"
          >
            The process is designed to feel more structured than a typical
            calculator while remaining clearer and faster than a traditional
            manual review.
          </motion.p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-[1.75rem] border border-[#D7DCE3] bg-white/82 p-6 shadow-[0_18px_40px_rgba(15,39,71,0.04)]"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0F2747] text-sm font-semibold text-white shadow-[0_12px_28px_rgba(15,39,71,0.18)]">
                  {i + 1}
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5B6472]">
                  Step {i + 1}
                </span>
              </div>

              <h3 className="text-lg font-semibold leading-snug text-[#0F2747]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#5B6472]">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TRUST / FOOTER STRIP */}
      <section className="relative z-10 border-t border-[#D7DCE3]/70 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto grid max-w-6xl gap-4 px-6 py-8 text-sm text-[#5B6472] md:grid-cols-3">
          <div className="text-center">
            <p className="font-semibold text-[#0F2747]">Guidance-aligned</p>
            <p className="mt-2">Structured against LHDN-based relief references.</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#0F2747]">Assessment-focused</p>
            <p className="mt-2">Designed to surface potentially missed claim opportunities.</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#0F2747]">Built for clarity</p>
            <p className="mt-2">A cleaner alternative to manual tax relief review.</p>
          </div>
        </div>
      </section>
    </main>
  );
}