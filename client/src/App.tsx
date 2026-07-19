import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { GuestRoute } from "@/routes/GuestRoute";
import Home from "@/pages/Home";
import JobDetail from "@/pages/JobDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import SavedJobs from "@/pages/SavedJobs";
import Profile from "@/pages/Profile";
import EmployerDashboard from "@/pages/EmployerDashboard";
import JobForm from "@/pages/JobForm";
import Applicants from "@/pages/Applicants";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/jobs/:id" element={<JobDetail />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["jobseeker"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/saved" element={<SavedJobs />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["employer"]} />}>
          <Route path="/employer" element={<EmployerDashboard />} />
          <Route path="/employer/profile" element={<Profile />} />
          <Route path="/employer/jobs/new" element={<JobForm />} />
          <Route path="/employer/jobs/:id/edit" element={<JobForm />} />
          <Route path="/employer/jobs/:id/applicants" element={<Applicants />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
