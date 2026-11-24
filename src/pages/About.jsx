import React from 'react';
import { Link } from 'react-router-dom';
import { Award, CalendarCheck, CreditCard, TrendingUp, CheckCircle2 } from 'lucide-react';
import { PublicFooter, PublicNavbar } from '../components/PublicLayout';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <PublicNavbar />

      <section className="bg-slate-950 text-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            About AcademyFlow
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold">
            Dedicated Coaching &amp; Smart Student Administration
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300 text-base">
            We combine disciplined Karate and Skating instruction with a clear, reliable
            digital portal for enrollment, attendance, and fee records.
          </p>
        </div>
      </section>

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            {
              title: 'Professional Training',
              desc: 'Experienced Karate and Skating coaches guide students from foundational balance and stances to competitive mastery.',
              icon: Award,
            },
            {
              title: 'Attendance Tracking',
              desc: 'Coaches record daily attendance accurately by class, giving students instant visibility into monthly attendance percentages.',
              icon: CalendarCheck,
            },
            {
              title: 'Fee Management',
              desc: 'Transparent monthly billing and payment status tracking so students and parents always know their fee history.',
              icon: CreditCard,
            },
            {
              title: 'Student Progress',
              desc: 'Every student receives a unique ID after verified registration and enrolls in their chosen class with admin approval.',
              icon: TrendingUp,
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="card-surface p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-bold text-slate-900">{card.title}</h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="card-surface p-6">
          <h2 className="text-lg font-bold text-slate-900">Why Choose Us</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm text-slate-700">
            {[
              'Verified Gmail OTP student registration',
              'Controlled class enrollment & admin approval',
              'Dedicated Karate & Skating batches',
              'Mobile-friendly student portal',
            ].map((point) => (
              <div key={point} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
            <Link to="/contact" className="btn-secondary">
              Contact Academy
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default About;
