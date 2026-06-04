import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '../components/Navbar';
import { Keyboard } from '../components/Keyboard';
import { Zap, BarChart2, Trophy, ArrowRight, Target, Flame } from 'lucide-react';

const FEATURES = [
  {
    icon: <Target size={20} />,
    title: 'Smart Progression',
    desc: 'Learn E & I before R & O before T & U — keys introduced in frequency order, not just rows.',
    color: '#00ff9f',
  },
  {
    icon: <BarChart2 size={20} />,
    title: 'Adaptive Engine',
    desc: 'Weak keys appear 3× more in your practice set. Your mistakes become your next drill.',
    color: '#00d4ff',
  },
  {
    icon: <Trophy size={20} />,
    title: '10 Badges to Earn',
    desc: 'From First Strike to TypeForge Master — unlock achievements as you level up.',
    color: '#a78bfa',
  },
  {
    icon: <Flame size={20} />,
    title: 'Daily Streaks',
    desc: 'Build a habit. Your streak counter keeps you accountable — even on lazy days.',
    color: '#ffd060',
  },
  {
    icon: <Zap size={20} />,
    title: 'Code & Symbols',
    desc: 'Lesson 10 covers real code syntax — brackets, colons, underscores — for devs.',
    color: '#fb923c',
  },
  {
    icon: <BarChart2 size={20} />,
    title: 'Full Dashboard',
    desc: 'WPM charts, heatmaps, session history. See exactly where you improved.',
    color: '#f43f5e',
  },
];

const STEPS = [
  { n: '01', title: 'Start with Home Row', desc: 'A S D F · J K L ;  —  your fingers never leave.' },
  { n: '02', title: 'Add keys by frequency', desc: 'E, I → R, O → T, U — most-used letters first.' },
  { n: '03', title: 'Build to full keyboard', desc: '10 structured lessons from beginner to 45+ WPM.' },
];

const HOME_KEYS = ['a','s','d','f','j','k','l',';'];

export default function Home() {
  return (
    <div className="min-h-screen bg-bg overflow-x-hidden">
      <Navbar />

      {/* Grid bg */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #1e1e2e 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.35 }} />

      <main className="relative pt-14">

        {/* ── HERO ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-14">
          <div className="flex-1 min-w-0">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="tag border-accent/30 bg-accent/8 text-accent mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              10-LESSON ADAPTIVE TRAINER
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.04] tracking-tight mb-5">
              Forge Your<br />
              <span className="glow-text" style={{ color: '#00ff9f' }}>Typing Skills</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
              className="text-text-secondary text-lg mb-9 max-w-md leading-relaxed">
              Master speed. Improve accuracy. Build confidence —
              one keystroke at a time. Keys taught in the order your brain learns best.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
              className="flex flex-wrap gap-3 mb-10">
              <Link href="/lessons"
                className="btn-primary flex items-center gap-2 text-sm">
                Start Learning Free <ArrowRight size={16} />
              </Link>
              <Link href="/dashboard" className="btn-secondary text-sm">
                View Dashboard
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}
              className="flex gap-6 text-text-secondary text-xs font-mono uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent" />10 Lessons</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent-blue" />Adaptive AI</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent-purple" />Free Forever</span>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="flex-1 flex flex-col items-center gap-8">

            <Link href="/lessons" className="btn-primary flex items-center gap-2 text-base px-8 py-3">
              Start Typing For Free <ArrowRight size={18} />
            </Link>

            <div className="relative w-full">
              <div className="absolute -inset-6 bg-accent/5 blur-3xl rounded-full pointer-events-none" />
              <div className="relative p-4 rounded-2xl border border-border bg-surface shadow-inner-glow">
                <Keyboard activeKeys={HOME_KEYS} size="sm" />
              </div>
            </div>
            <p className="text-text-secondary text-xs font-mono text-center">
              Lesson 1 · Home Row · Index fingers rest on{' '}
              <span className="text-accent font-bold">F</span> and{' '}
              <span className="text-accent font-bold">J</span>
            </p>
          </motion.div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <p className="text-text-secondary text-xs font-mono uppercase tracking-widest mb-3">The Method</p>
            <h2 className="text-3xl font-bold text-white">Why this order works</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {STEPS.map(({ n, title, desc }, i) => (
              <motion.div key={n} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card border-border hover:border-accent/25 transition-all">
                <span className="font-mono text-4xl font-black text-border select-none">{n}</span>
                <h3 className="font-bold text-white mt-3 mb-1">{title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <p className="text-text-secondary text-xs font-mono uppercase tracking-widest mb-3">Everything included</p>
            <h2 className="text-3xl font-bold text-white">Built to make you better</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURES.map(({ icon, title, desc, color }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="card-hover group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border transition-all"
                  style={{ background: `${color}12`, borderColor: `${color}30`, color }}>
                  {icon}
                </div>
                <h3 className="font-bold text-white mb-1.5 group-hover:text-accent transition-colors">{title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-3xl mx-auto px-4 pb-24 text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl border border-accent/20 bg-surface p-10"
            style={{ boxShadow: '0 0 60px rgba(0,255,159,0.08)' }}>
            <h2 className="text-3xl font-black text-white mb-3">Ready to start?</h2>
            <p className="text-text-secondary mb-7">Lesson 1 takes under 5 minutes. No signup required.</p>
            <Link href="/lessons" className="btn-primary inline-flex items-center gap-2">
              Begin Lesson 1 <ArrowRight size={16} />
            </Link>
          </motion.div>
        </section>

      </main>

      <footer className="border-t border-border py-6 text-center text-text-secondary text-xs font-mono">
        TypeForge © 2026 · Built for the keyboard-obsessed. · Developed by{' '}
<a href="https://my-portfolio-plum-seven-67.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline underline-offset-4 transition-colors">Sk Kutubuddin</a>
      </footer>
    </div>
  );
}
