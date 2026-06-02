/**
 * Landing page — /
 * Public marketing page visible to everyone (no auth required).
 * Shows what InvoiceFlow does and drives visitors to sign up or sign in.
 */
import Link from 'next/link';
import {
  FileText, Download, Palette, Users, Shield, Zap,
  BarChart2, Clock, CheckCircle,
} from 'lucide-react';

const FEATURES = [
  {
    icon: FileText,
    title: 'Professional Invoices',
    desc: 'Three beautiful templates — Minimal, Modern, Corporate — that make you look like a pro to every client.',
  },
  {
    icon: Download,
    title: 'Export Anywhere',
    desc: 'Download as PDF for email, PNG for WhatsApp, or JPEG for quick sharing. Print-ready A4 every time.',
  },
  {
    icon: Palette,
    title: 'Your Brand, Your Colour',
    desc: 'Upload your logo, add a digital signature, and pick your exact brand colour — hex or RGB.',
  },
  {
    icon: Users,
    title: 'Client Management',
    desc: 'Save clients and reuse their details in one click. No more typing the same address twice.',
  },
  {
    icon: BarChart2,
    title: 'Invoice History',
    desc: 'See every invoice you\'ve ever sent. Filter by client or date to track what\'s been paid.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    desc: 'Your data lives in your account only. Bank-grade security powered by Supabase.',
  },
];

const SERVICES = [
  'Data Analysis', 'Power BI Dashboards', 'SQL Development',
  'Excel Automation', 'Tutoring & Training', 'PowerPoint Design',
  'Any freelance service',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-bold text-gray-900">Invoice<span className="text-blue-600">Flow</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started — Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <CheckCircle className="w-3.5 h-3.5" />
          Free for freelancers
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Professional invoices<br />
          <span className="text-blue-600">in minutes</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Create, brand, and export beautiful invoices as PDF, PNG, or JPEG.
          Built for freelancers who want to look professional without the admin headache.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto text-base font-semibold bg-blue-600 text-white px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Create free account
          </Link>
          <Link
            href="/sign-in"
            className="w-full sm:w-auto text-base font-medium text-gray-600 border border-gray-200 px-8 py-3.5 rounded-xl hover:border-gray-400 transition-colors"
          >
            Sign in
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">No credit card required · Takes 2 minutes</p>
      </section>

      {/* ── Ideal for section ────────────────────────────── */}
      <section className="bg-gray-50 border-y">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">
            Built for service providers including
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {SERVICES.map((s) => (
              <span key={s} className="bg-white border border-gray-200 text-gray-700 text-sm px-4 py-1.5 rounded-full font-medium shadow-sm">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Everything you need to invoice professionally
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            No accounting bloat, no learning curve — just clean invoices that get you paid.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready in 3 steps</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10 text-left max-w-3xl mx-auto">
            {[
              { step: '1', title: 'Create account', desc: 'Sign up free in 2 minutes. Set up your profile with your business name and brand colour.' },
              { step: '2', title: 'Fill your invoice', desc: 'Add client details, select your services, and watch the total calculate automatically.' },
              { step: '3', title: 'Export & send', desc: 'Download as PDF, PNG, or JPEG and send to your client. Done.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <div className="font-semibold mb-1">{item.title}</div>
                  <div className="text-blue-100 text-sm">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/sign-up"
            className="inline-block mt-12 bg-white text-blue-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            Get started — it&apos;s free
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center">
              <Zap className="w-3 h-3" />
            </div>
            <span>InvoiceFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="hover:text-gray-700">Sign In</Link>
            <Link href="/sign-up" className="hover:text-gray-700">Create Account</Link>
          </div>
          <p>© {new Date().getFullYear()} InvoiceFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
