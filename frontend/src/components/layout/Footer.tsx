import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[rgba(10,16,24,0.75)]">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300 font-bold">n8nExperts</p>
            <p className="mt-3 text-sm text-slate-300 max-w-sm">
              A focused marketplace for n8n project hiring: client job posting, expert discovery, invitations, chat, and tracked delivery.
            </p>
            <p className="mt-3 text-xs text-slate-400">
              Built and operated by{" "}
              <a href="https://n8nlab.io" target="_blank" rel="noreferrer" className="text-sky-300 hover:underline">
                n8nlab.io
              </a>
              .
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300 font-bold">Platform</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>
                <Link to="/find-experts" className="hover:text-white">
                  Find Experts
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="hover:text-white">
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link to="/post-project" className="hover:text-white">
                  Post Project
                </Link>
              </li>
              <li>
                <Link to="/why-us" className="hover:text-white">
                  Why n8nExperts
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300 font-bold">Account</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>
                <Link to="/auth/login" className="hover:text-white">
                  Log in
                </Link>
              </li>
              <li>
                <Link to="/auth/role-select" className="hover:text-white">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/saved-searches" className="hover:text-white">
                  Saved Searches
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-xs text-slate-500">
          (c) {new Date().getFullYear()} n8nExperts by n8nlab.io. Built for workflow and automation teams.
        </p>
      </div>
    </footer>
  );
}
