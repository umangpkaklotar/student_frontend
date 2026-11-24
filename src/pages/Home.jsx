import React from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Wind,
  ShieldCheck,
  CalendarCheck,
  CreditCard,
  UserCircle,
  MailCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Users,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { PublicFooter, PublicNavbar } from '../components/PublicLayout';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { title: 'Student Registration', desc: 'Fast account setup with safe personal verification.', icon: Users },
  { title: 'Gmail OTP Verification', desc: 'Secure 6-digit OTP sent directly to your Gmail.', icon: MailCheck },
  { title: 'Secure Login', desc: 'Encrypted passwords and JWT-protected sessions.', icon: ShieldCheck },
  { title: 'Karate Classes', desc: 'Structured martial arts batches for every age group.', icon: Award },
  { title: 'Skating Classes', desc: 'Balance, speed, and agility roller-skating coaching.', icon: Wind },
  { title: 'Attendance Tracking', desc: 'Daily roll call with live monthly attendance percentage.', icon: CalendarCheck },
  { title: 'Monthly Fee Tracking', desc: 'Clear paid, pending, and partial payment history.', icon: CreditCard },
  { title: 'Student Profile', desc: 'Dedicated portal for your ID, class, and status.', icon: UserCircle },
  { title: 'Admin Management', desc: 'Enrollment approvals, attendance, fees, and reports.', icon: CheckCircle2 },
];

const HOW_IT_WORKS = [
  'Create Account',
  'Verify Gmail OTP',
  'Login',
  'Choose Karate or Skating',
  'Submit Enrollment Form',
  'Admin Approves Enrollment',
  'Start Classes',
  'Track Attendance and Fees',
];

const Home = () => {
  const { isAuthenticated, role } = useAuth();
  const dashboardPath = role === 'admin' ? '/admin/dashboard' : '/student/dashboard';

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <PublicNavbar />

      {/* 2. Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 px-3.5 py-1 text-xs font-semibold text-indigo-200 ring-1 ring-inset ring-indigo-400/30">
              <Award className="h-3.5 w-3.5" />
              AcademyFlow · Student Attendance &amp; Fee Management System
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Train. Track. Grow.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Manage Karate and Skating classes, attendance, fees and student profiles
              from one simple platform.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              {isAuthenticated ? (
                <Link
                  to={dashboardPath}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-400 transition"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-400 transition"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
                  >
                    Student Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. About Academy */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                About Academy
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                Disciplined Coaching Meets Transparent Tracking
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                AcademyFlow brings professional Karate and Skating training together with an
                easy-to-use student portal. Students register online, choose their preferred
                program after logging in, and stay updated on daily attendance and monthly fees.
              </p>
              <div className="mt-6">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Learn more about our academy <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Disciplined Training', value: 'Karate & Skating' },
                { label: 'Batch Options', value: 'Morning & Evening' },
                { label: 'Verification', value: 'Gmail OTP Secured' },
                { label: 'Records', value: 'Real-Time Sync' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4 & 5. Karate & Skating Programs */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Our Programs
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              Choose Karate or Skating After You Join
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Explore class details, schedules, and benefits before creating your account.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Karate */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">Karate Classes</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Build discipline, self-defense, focus, and physical strength under certified
                  martial arts instructors.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>• Age Group: 6 to 25+ years</li>
                  <li>• Timings: Morning 6:30–8:00 AM · Evening 5:00–7:30 PM</li>
                  <li>• Monthly Fee: ₹1,000 / month</li>
                </ul>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/karate" className="btn-secondary">
                  View Karate Details
                </Link>
                <Link
                  to={isAuthenticated ? '/student/enrollment?class=karate' : '/login?redirect=/student/enrollment?class=karate'}
                  className="btn-primary"
                >
                  Join Karate
                </Link>
              </div>
            </div>

            {/* Skating */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Wind className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">Skating Classes</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Master balance, agility, posture, and rink speed with safety-first beginner
                  and intermediate skating batches.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>• Age Group: 5 to 22 years</li>
                  <li>• Timings: Morning 7:00–8:30 AM · Evening 4:30–7:00 PM</li>
                  <li>• Monthly Fee: ₹1,000 / month</li>
                </ul>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/skating" className="btn-secondary">
                  View Skating Details
                </Link>
                <Link
                  to={isAuthenticated ? '/student/enrollment?class=skating' : '/login?redirect=/student/enrollment?class=skating'}
                  className="btn-primary"
                >
                  Join Skating
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Why Choose Us */}
      <section className="py-16 bg-slate-50 border-y border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Why Choose Us
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
              Built for Students, Parents, and Coaches
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Professional Training', text: 'Structured curriculum tailored to skill level.' },
              { title: 'Attendance Tracking', text: 'Instant visibility into daily class presence.' },
              { title: 'Fee Management', text: 'Clear monthly billing and receipt history.' },
              { title: 'Student Progress', text: 'Verified profiles and dedicated class batches.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <h3 className="mt-3 text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Features */}
      <section id="features" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Platform Features
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
              Everything You Need in One Portal
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">{feat.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Class Information */}
      <section className="py-16 bg-slate-50 border-y border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Class Information
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
              Schedules &amp; Standard Monthly Fees
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Clock className="h-4 w-4" />
                Karate Schedule
              </div>
              <p className="mt-3 text-sm text-slate-600">Monday – Saturday · Morning &amp; Evening Batches</p>
              <p className="mt-2 text-lg font-extrabold text-slate-900">₹1,000 / month</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-violet-600 font-bold text-sm">
                <Clock className="h-4 w-4" />
                Skating Schedule
              </div>
              <p className="mt-3 text-sm text-slate-600">Monday – Saturday · Morning &amp; Evening Batches</p>
              <p className="mt-2 text-lg font-extrabold text-slate-900">₹1,000 / month</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. How It Works */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              How It Works
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
              From Registration to Active Training in 8 Simple Steps
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((stepTitle, idx) => (
              <div
                key={stepTitle}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {idx + 1}
                </span>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Step {idx + 1}
                </p>
                <h3 className="mt-1 text-base font-bold text-slate-900">{stepTitle}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Call To Action */}
      <section className="bg-indigo-600 py-14 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Ready to Start Your Karate or Skating Journey?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-indigo-100">
            Create your verified student account today and submit your preferred class enrollment.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-indigo-700 shadow-sm hover:bg-indigo-50 transition"
            >
              Join Now
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-indigo-300 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-500 transition"
            >
              Student Login
            </Link>
          </div>
        </div>
      </section>

      {/* 11. Contact */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Contact
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Get in Touch</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 text-sm">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-start gap-3">
              <Phone className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Phone</p>
                <p className="text-slate-600 mt-0.5">+91 98765 43210</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-start gap-3">
              <Mail className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Email</p>
                <p className="text-slate-600 mt-0.5">support@academyflow.in</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-start gap-3">
              <MapPin className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Academy Address</p>
                <p className="text-slate-600 mt-0.5">Sports Complex Road, Surat, Gujarat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Home;
