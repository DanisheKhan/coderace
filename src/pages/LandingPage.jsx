import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code2,
  Trophy,
  Flame,
  ListTodo,
  Keyboard,
  Brain,
  BarChart3,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Terminal
} from 'lucide-react';
import { pageTransition, staggerContainer, fadeUp, cardHover } from '../lib/animations';

const LandingPage = () => {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit="exit"
      variants={pageTransition}
      className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-zinc-800 selection:text-white font-sans antialiased transform-gpu"
    >
      {/* ── Minimal Sticky Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-100 group-hover:scale-105 transition-transform duration-200">
              <Code2 className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              Code<span className="text-violet-400">Race</span>
            </span>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
            <button onClick={() => scrollToSection('about')} className="hover:text-zinc-100 transition-colors cursor-pointer">
              About
            </button>
            <button onClick={() => scrollToSection('features')} className="hover:text-zinc-100 transition-colors cursor-pointer">
              Features
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-zinc-100 transition-colors cursor-pointer">
              Workflow
            </button>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-medium text-zinc-400 hover:text-white transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/login"
                className="text-xs font-semibold text-zinc-900 bg-white hover:bg-zinc-200 px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* ── Minimal Hero Section ── */}
      <section className="pt-16 pb-16 md:pt-24 md:pb-24 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <motion.div variants={staggerContainer} className="space-y-6">
          {/* Minimal Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 text-xs font-mono text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span>Competitive DSA & Speed Tracking</span>
          </motion.div>

          {/* Clean Headline */}
          <motion.h1 
            variants={fadeUp} 
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]"
          >
            Master Data Structures.<br />
            <span className="text-zinc-400 font-semibold">Race with your peers.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={fadeUp} 
            className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed font-normal"
          >
            A minimal, fast platform for tracking 500+ curated DSA problems, live peer leaderboards, typing speed, and concept quizzes.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/login"
                className="px-5 py-2.5 text-xs font-semibold text-zinc-900 bg-white hover:bg-zinc-200 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                Launch CodeRace <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollToSection('features')}
              className="px-4 py-2.5 text-xs font-medium text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              Explore Features <ChevronRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Minimal Terminal Mockup Component */}
        <motion.div variants={fadeUp} className="mt-12 text-left max-w-3xl mx-auto border border-zinc-800 rounded-xl bg-[#0d0d11] overflow-hidden shadow-2xl">
          <div className="bg-zinc-900/80 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <span className="ml-2 text-xs font-mono text-zinc-500">coderace-dashboard ~ status</span>
            </div>
            <div className="text-[11px] font-mono text-violet-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Sync
            </div>
          </div>
          <div className="p-5 font-mono text-xs space-y-3 text-zinc-300">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
              <span className="text-zinc-500">USER PROFILE</span>
              <span className="text-white font-semibold">@alex_dev</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-1 text-zinc-400">
              <div>
                <span className="block text-[10px] text-zinc-500">SOLVED</span>
                <span className="text-sm font-bold text-emerald-400">342 / 502</span>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-500">LEADERBOARD</span>
                <span className="text-sm font-bold text-amber-400">#2 Rank</span>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-500">TYPING SPEED</span>
                <span className="text-sm font-bold text-violet-400">98 WPM</span>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-500">CURRENT STREAK</span>
                <span className="text-sm font-bold text-orange-400">14 Days 🔥</span>
              </div>
            </div>
            <div className="pt-2 text-zinc-500 text-[11px] flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-violet-400" />
              <span>System active. 500+ problems loaded across Arrays, Graphs, DP & Trees.</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Key Metrics Bar ── */}
      <section className="border-y border-zinc-800/80 bg-zinc-950/40 py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x-0 md:divide-x divide-zinc-800/80">
          <div className="p-2">
            <div className="text-2xl font-bold text-white tracking-tight">502</div>
            <div className="text-xs text-zinc-500 font-medium mt-1">Curated DSA Questions</div>
          </div>
          <div className="p-2">
            <div className="text-2xl font-bold text-white tracking-tight">Real-time</div>
            <div className="text-xs text-zinc-500 font-medium mt-1">Peer Leaderboard</div>
          </div>
          <div className="p-2">
            <div className="text-2xl font-bold text-white tracking-tight">Monkeytype</div>
            <div className="text-xs text-zinc-500 font-medium mt-1">WPM Speed Integration</div>
          </div>
          <div className="p-2">
            <div className="text-2xl font-bold text-white tracking-tight">Gamified</div>
            <div className="text-xs text-zinc-500 font-medium mt-1">Streaks & Badges</div>
          </div>
        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="max-w-2xl mb-12">
          <h2 className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-2">01 // WHY CODERACE</h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Built to replace unstructured spreadsheets with clarity and focus.
          </h3>
          <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
            Managing your problem solving on static spreadsheets makes it hard to maintain consistency and track actual growth. CodeRace brings structure, friendly competition, and progress visibility under one roof.
          </p>
        </div>

        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div variants={fadeUp} whileHover={cardHover} className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 mb-3">
              <ListTodo className="w-4 h-4 text-violet-400" />
            </div>
            <h4 className="text-sm font-semibold text-white">Track & Review</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Mark status as Done, Attempted, or Revisit. Store solution notes and filter by topics seamlessly.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} whileHover={cardHover} className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 mb-3">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <h4 className="text-sm font-semibold text-white">Peer Accountability</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              See live rankings, daily activity streaks, and compare progress head-to-head with classmates.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} whileHover={cardHover} className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 mb-3">
              <Keyboard className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-sm font-semibold text-white">Speed & Quizzes</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Showcase your Monkeytype typing speed and test core language concepts with timed quizzes.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-20 border-t border-zinc-800/80 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="max-w-2xl mb-12">
          <h2 className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-2">02 // FEATURES</h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Everything designed for focused DSA preparation.
          </h3>
        </div>

        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div variants={fadeUp} whileHover={cardHover} className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/20">
            <ListTodo className="w-5 h-5 text-violet-400 mb-3" />
            <h4 className="text-sm font-semibold text-white mb-1">DSA Problem Sheet</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              500+ curated problems categorized by topic, difficulty, and customizable tags.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} whileHover={cardHover} className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/20">
            <Trophy className="w-5 h-5 text-amber-400 mb-3" />
            <h4 className="text-sm font-semibold text-white mb-1">Live Leaderboard</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Real-time rankings based on solved questions, daily streaks, and quiz performance.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} whileHover={cardHover} className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/20">
            <Keyboard className="w-5 h-5 text-emerald-400 mb-3" />
            <h4 className="text-sm font-semibold text-white mb-1">Monkeytype WPM</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Link your Monkeytype username to display typing WPM and stats on your profile.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} whileHover={cardHover} className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/20">
            <Brain className="w-5 h-5 text-indigo-400 mb-3" />
            <h4 className="text-sm font-semibold text-white mb-1">Concept Quizzes</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sharpen Java syntax and core programming concepts with timed quizzes.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} whileHover={cardHover} className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/20">
            <Flame className="w-5 h-5 text-orange-400 mb-3" />
            <h4 className="text-sm font-semibold text-white mb-1">Badges & Streaks</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Unlock achievements for solving milestones, daily streaks, and topic masteries.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} whileHover={cardHover} className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/20">
            <BarChart3 className="w-5 h-5 text-cyan-400 mb-3" />
            <h4 className="text-sm font-semibold text-white mb-1">Peer Analytics</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Compare solving pace, topic coverage, and difficulty distribution side-by-side.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Workflow Section ── */}
      <section id="how-it-works" className="py-20 border-t border-zinc-800/80 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="max-w-2xl mb-12">
          <h2 className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-2">03 // WORKFLOW</h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Simple 3-step workflow
          </h3>
        </div>

        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={fadeUp} whileHover={cardHover} className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 relative">
            <span className="text-xs font-mono text-zinc-500 mb-3 block">01</span>
            <h4 className="text-base font-semibold text-white mb-1">Sign In & Connect</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Create an account with your email and get approved by the admin.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} whileHover={cardHover} className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 relative">
            <span className="text-xs font-mono text-zinc-500 mb-3 block">02</span>
            <h4 className="text-base font-semibold text-white mb-1">Solve & Log Progress</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Work through the 502 DSA problems, update status, and log review notes.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} whileHover={cardHover} className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 relative">
            <span className="text-xs font-mono text-zinc-500 mb-3 block">03</span>
            <h4 className="text-base font-semibold text-white mb-1">Rank & Compete</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Climb the leaderboard, build your daily streak, and unlock milestone badges.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-zinc-800/80">
        <div className="p-8 sm:p-12 rounded-2xl border border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-white">Ready to start practicing?</h3>
            <p className="text-xs text-zinc-400">Join CodeRace and start tracking your DSA journey today.</p>
          </div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/login"
              className="px-5 py-2.5 text-xs font-semibold text-zinc-900 bg-white hover:bg-zinc-200 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Minimal Footer ── */}
      <footer className="border-t border-zinc-800/80 py-8 px-4 text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-zinc-400" />
            <span className="font-semibold text-zinc-300">CodeRace</span>
            <span>— DSA Practice Platform</span>
          </div>
          <div>
            © {new Date().getFullYear()} CodeRace. All rights reserved.
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default LandingPage;
