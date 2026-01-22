import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { JobsProvider } from "./contexts/JobsContext";
import { CandidatesProvider } from "./contexts/CandidatesContext";
import Index from "./pages/Index";
import JobDetail from "./pages/JobDetail";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminNewJob from "./pages/AdminNewJob";
import AdminEditJob from "./pages/AdminEditJob";
import AdminViewJob from "./pages/AdminViewJob";
import AdminViewCandidate from "./pages/AdminViewCandidate";
import AdminEditCandidate from "./pages/AdminEditCandidate";
import ApplyJob from "./pages/ApplyJob";
import CandidateLogin from "./pages/CandidateLogin";
import CandidateRegister from "./pages/CandidateRegister";
import MyJobs from "./pages/MyJobs";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <JobsProvider>
        <CandidatesProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename="/portal">
            <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/apply/:id" element={<ApplyJob />} />
          <Route path="/login" element={<CandidateLogin />} />
          <Route path="/register" element={<CandidateRegister />} />
          <Route path="/my-jobs" element={<MyJobs />} />
          
          {/* Rotas administrativas - Login */}
          <Route path="/admin" element={<AdminLogin />} />
          
          {/* Rotas administrativas - Protegidas */}
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/jobs/new" 
            element={
              <AdminRoute>
                <AdminNewJob />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/jobs/:id" 
            element={
              <AdminRoute>
                <AdminViewJob />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/jobs/:id/edit" 
            element={
              <AdminRoute>
                <AdminEditJob />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/candidates/:id" 
            element={
              <AdminRoute>
                <AdminViewCandidate />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/candidates/:id/edit" 
            element={
              <AdminRoute>
                <AdminEditCandidate />
              </AdminRoute>
            } 
          />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CandidatesProvider>
      </JobsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
