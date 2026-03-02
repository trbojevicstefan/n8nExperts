import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CleanLayout, Layout } from "@/components/layout/Layout";
import { RequireAuth, RequireRole } from "./guards";

import Home from "@/pages/Home";
import WhyUs from "@/pages/WhyUs";
import RoleSelection from "@/pages/auth/RoleSelection";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ExpertWizard from "@/pages/onboarding/ExpertWizard";
import ExpertMarketplace from "@/pages/experts/ExpertMarketplace";
import ExpertProfile from "@/pages/experts/ExpertProfile";
import SavedExperts from "@/pages/experts/SavedExperts";
import PostProject from "@/pages/projects/PostProject";
import FindWork from "@/pages/work/FindWork";
import MyJobs from "@/pages/projects/MyJobs";
import ApplicantPipeline from "@/pages/projects/ApplicantPipeline";
import MyApplications from "@/pages/work/MyApplications";
import ExpertServices from "@/pages/experts/ExpertServices";
import Invitations from "@/pages/work/Invitations";
import SavedJobs from "@/pages/work/SavedJobs";
import Inbox from "@/pages/workspace/Inbox";
import NotificationsPage from "@/pages/workspace/Notifications";
import SavedSearches from "@/pages/workspace/SavedSearches";
import ClientProfileEdit from "@/pages/clients/ClientProfileEdit";
import ClientPublicProfile from "@/pages/clients/ClientPublicProfile";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/why-us", element: <WhyUs /> },
      { path: "/find-experts", element: <ExpertMarketplace /> },
      { path: "/find-talent", element: <ExpertMarketplace /> },
      { path: "/experts/:expertId", element: <ExpertProfile /> },
      { path: "/expert/:expertId", element: <ExpertProfile /> },
      { path: "/clients/:clientId", element: <ClientPublicProfile /> },
      { path: "/jobs", element: <FindWork /> },
      { path: "/find-work", element: <FindWork /> },
    ],
  },
  {
    element: <CleanLayout />,
    children: [
      { path: "/auth/login", element: <Login /> },
      { path: "/auth/register", element: <Register /> },
      { path: "/auth/role-select", element: <RoleSelection /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/inbox", element: <Inbox /> },
          { path: "/notifications", element: <NotificationsPage /> },
          { path: "/saved-searches", element: <SavedSearches /> },
          {
            element: <RequireRole role="client" />,
            children: [
              { path: "/post-project", element: <PostProject /> },
              { path: "/my-jobs", element: <MyJobs /> },
              { path: "/my-jobs/pipeline", element: <ApplicantPipeline /> },
              { path: "/client/profile", element: <ClientProfileEdit /> },
              { path: "/saved-experts", element: <SavedExperts /> },
            ],
          },
          {
            element: <RequireRole role="expert" />,
            children: [
              { path: "/my-applications", element: <MyApplications /> },
              { path: "/saved-jobs", element: <SavedJobs /> },
              { path: "/invitations", element: <Invitations /> },
              { path: "/expert/services", element: <ExpertServices /> },
              { path: "/expert/setup", element: <ExpertWizard /> },
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
