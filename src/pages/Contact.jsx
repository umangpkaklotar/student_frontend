import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { PublicFooter, PublicNavbar } from '../components/PublicLayout';

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <PublicNavbar />

      <section className="bg-slate-950 text-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            Contact Us
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold">
            Visit or Reach AcademyFlow
          </h1>
          <p className="mt-3 max-w-xl text-slate-300 text-base">
            Have questions about Karate or Skating batch timings, trials, or enrollment?
            Connect with our academy desk.
          </p>
        </div>
      </section>

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="card-surface p-6 flex items-start gap-4">
            <Phone className="h-5 w-5 text-indigo-600 mt-1 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Phone</h2>
              <p className="mt-1 text-sm text-slate-600">+91 98765 43210</p>
            </div>
          </div>

          <div className="card-surface p-6 flex items-start gap-4">
            <Mail className="h-5 w-5 text-indigo-600 mt-1 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Email</h2>
              <p className="mt-1 text-sm text-slate-600">support@academyflow.in</p>
            </div>
          </div>

          <div className="card-surface p-6 flex items-start gap-4">
            <MapPin className="h-5 w-5 text-indigo-600 mt-1 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Location</h2>
              <p className="mt-1 text-sm text-slate-600">
                Sports Complex Road, Vesu, Surat, Gujarat
              </p>
            </div>
          </div>

          <div className="card-surface p-6 flex items-start gap-4">
            <Clock className="h-5 w-5 text-indigo-600 mt-1 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Academy Hours</h2>
              <p className="mt-1 text-sm text-slate-600">
                Mon – Sat · 6:30 AM – 9:00 AM &amp; 4:30 PM – 8:00 PM
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 card-surface p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Ready to enroll in Karate or Skating?
            </h3>
            <p className="text-sm text-slate-600 mt-0.5">
              Create your student account first and choose your class after logging in.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/register" className="btn-primary">
              Register
            </Link>
            <Link to="/login" className="btn-secondary">
              Login
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Contact;
