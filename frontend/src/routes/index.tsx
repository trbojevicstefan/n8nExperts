import { Suspense, lazy, type ReactNode } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AppLayout, CleanLayout, PublicLayout } from "@/components/layout/Layout";
import { RequireAuth, RequireRole } from "./guards";

const Home = lazy(() => import("@/pages/Home"));
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const ForClients = lazy(() => import("@/pages/ForClients"));
const ForExperts = lazy(() => import("@/pages/ForExperts"));
const Trust = lazy(() => import("@/pages/Trust"));
const RoleSelection = lazy(() => import("@/pages/auth/RoleSelection"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ExpertWizard = lazy(() => import("@/pages/onboarding/ExpertWizard"));
const ExpertMarketplace = lazy(() => import("@/pages/experts/ExpertMarketplace"));
const ExpertProfile = lazy(() => import("@/pages/experts/ExpertProfile"));
const SavedExperts = lazy(() => import("@/pages/experts/SavedExperts"));
const PostProject = lazy(() => import("@/pages/projects/PostProject"));
const FindWork = lazy(() => import("@/pages/work/FindWork"));
const MyJobs = lazy(() => import("@/pages/projects/MyJobs"));
const ApplicantPipeline = lazy(() => import("@/pages/projects/ApplicantPipeline"));
const MyApplications = lazy(() => import("@/pages/work/MyApplications"));
const ExpertServices = lazy(() => import("@/pages/experts/ExpertServices"));
const Invitations = lazy(() => import("@/pages/work/Invitations"));
const SavedJobs = lazy(() => import("@/pages/work/SavedJobs"));
const Inbox = lazy(() => import("@/pages/workspace/Inbox"));
const NotificationsPage = lazy(() => import("@/pages/workspace/Notifications"));
const SavedSearches = lazy(() => import("@/pages/workspace/SavedSearches"));
const ClientProfileEdit = lazy(() => import("@/pages/clients/ClientProfileEdit"));
const ClientPublicProfile = lazy(() => import("@/pages/clients/ClientPublicProfile"));

function PageFallback() {
  return (
    <div className="container py-10">
      <div className="panel p-5 text-sm text-slate-300">Loading page...</div>
    </div>
  );
}

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<PageFallback />}>{element}</Suspense>;
}

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: withSuspense(<Home />) },
      { path: "/how-it-works", element: withSuspense(<HowItWorks />) },
      { path: "/for-clients", element: withSuspense(<ForClients />) },
      { path: "/for-experts", element: withSuspense(<ForExperts />) },
      { path: "/trust", element: withSuspense(<Trust />) },
      { path: "/why-us", element: <Navigate to="/trust" replace /> },
      { path: "/find-experts", element: withSuspense(<ExpertMarketplace />) },
      { path: "/find-talent", element: withSuspense(<ExpertMarketplace />) },
      { path: "/experts/:expertId", element: withSuspense(<ExpertProfile />) },
      { path: "/expert/:expertId", element: withSuspense(<ExpertProfile />) },
      { path: "/clients/:clientId", element: withSuspense(<ClientPublicProfile />) },
      { path: "/jobs", element: withSuspense(<FindWork />) },
      { path: "/find-work", element: withSuspense(<FindWork />) },
    ],
  },
  {
    element: <CleanLayout />,
    children: [
      { path: "/auth/login", element: withSuspense(<Login />) },
      { path: "/auth/register", element: withSuspense(<Register />) },
      { path: "/auth/role-select", element: withSuspense(<RoleSelection />) },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/inbox", element: withSuspense(<Inbox />) },
          { path: "/notifications", element: withSuspense(<NotificationsPage />) },
          { path: "/saved-searches", element: withSuspense(<SavedSearches />) },
          {
            element: <RequireRole role="client" />,
            children: [
              { path: "/post-project", element: withSuspense(<PostProject />) },
              { path: "/my-jobs", element: withSuspense(<MyJobs />) },
              { path: "/my-jobs/pipeline", element: withSuspense(<ApplicantPipeline />) },
              { path: "/client/profile", element: withSuspense(<ClientProfileEdit />) },
              { path: "/saved-experts", element: withSuspense(<SavedExperts />) },
            ],
          },
          {
            element: <RequireRole role="expert" />,
            children: [
              { path: "/my-applications", element: withSuspense(<MyApplications />) },
              { path: "/saved-jobs", element: withSuspense(<SavedJobs />) },
              { path: "/invitations", element: withSuspense(<Invitations />) },
              { path: "/expert/services", element: withSuspense(<ExpertServices />) },
              { path: "/expert/setup", element: withSuspense(<ExpertWizard />) },
            ],
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
