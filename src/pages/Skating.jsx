import React from 'react';
import { Link } from 'react-router-dom';
import { Wind, CheckCircle2, Clock, Users, IndianRupee, Shield, Phone, ArrowRight } from 'lucide-react';
import { PublicFooter, PublicNavbar } from '../components/PublicLayout';
import { useAuth } from '../context/AuthContext';

const Skating = () => {
  const { isAuthenticated } = useAuth();
  const joinTarget = isAuthenticated
    ? '/student/enrollment?class=skating'
    : '/login?redirect=/student/enrollment?class=skating';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <PublicNavbar />

      <section className="bg-slate-950 text-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-200">
            <Wind className="h-3.5 w-3.5" />
            Roller &amp; Speed Skating
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold">Skating Classes</h1>
          <p className="mt-3 max-w-2xl text-slate-300 text-base">
            Beginner to competitive roller-skating training emphasizing balance, agility,
            posture, and safety on the rink.
          </p>
          <div className="mt-7">
            <Link
              to={joinTarget}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500 transition"
            >
              Join Skating <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="card-surface p-5">
            <Clock className="h-5 w-5 text-violet-600" />
            <h3 className="mt-3 text-sm font-bold text-slate-900">Class Timings</h3>
            <p className="mt-1 text-sm text-slate-600">
              Morning: 7:00 AM – 8:30 AM<br />
              Evening: 4:30 PM – 7:00 PM
            </p>
          </div>
          <div className="card-surface p-5">
            <Users className="h-5 w-5 text-violet-600" />
            <h3 className="mt-3 text-sm font-bold text-slate-900">Age Group</h3>
            <p className="mt-1 text-sm text-slate-600">
              Beginners (5–10 yrs), Juniors (11–16 yrs), Seniors (17+ yrs)
            </p>
          </div>
          <div className="card-surface p-5">
            <IndianRupee className="h-5 w-5 text-violet-600" />
            <h3 className="mt-3 text-sm font-bold text-slate-900">Monthly Fee</h3>
            <p className="mt-1 text-lg font-extrabold text-slate-900">₹1,000 / month</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="card-surface p-6">
            <h2 className="text-lg font-bold text-slate-900">Benefits of Skating</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              {[
                'Develops coordination, balance, and leg strength',
                'Boosts cardiovascular fitness and endurance',
                'Progressive drills from basic gliding to speed turns',
                'Safe supervised rink sessions for all levels',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-surface p-6">
            <h2 className="text-lg font-bold text-slate-900">Training &amp; Basic Rules</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              {[
                'Helmet, knee guards, and elbow pads are mandatory',
                'Bring your own fitted quad or inline skates',
                'Follow coach track direction and warm-up routines',
                'Daily attendance helps track skill progression',
              ].map((rule) => (
                <li key={rule} className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card-surface p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-violet-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Skating Desk Contact</h3>
              <p className="text-sm text-slate-600">
                +91 98765 43210 · support@academyflow.in
              </p>
            </div>
          </div>
          <Link to={joinTarget} className="btn-primary">
            Join Skating
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Skating;
