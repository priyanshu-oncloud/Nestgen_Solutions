import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Projects from "./pages/Projects";
import Technologies from "./pages/Technologies";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import CertificateVerification from "./pages/CertificateVerification";
import CertificateInputPage from "./pages/CertificateInputPage";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import ManageServices from "./pages/admin/ManageServices";
import ManageProjects from "./pages/admin/ManageProjects";
import ManageTeam from "./pages/admin/ManageTeam";
import ManageTestimonials from "./pages/admin/ManageTestimonials";
import FormSubmissions from "./pages/admin/FormSubmissions";
import ManageWebsite from "./pages/admin/ManageWebsite";
import ManageCertificates from "./pages/admin/ManageCertificates";
import ManageOffers from "./pages/admin/ManageOffers";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAdmin();
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<><Navigation /><Home /><Footer /></>} />
            <Route path="/about" element={<><Navigation /><About /><Footer /></>} />
            <Route path="/services" element={<><Navigation /><Services /><Footer /></>} />
            <Route path="/projects" element={<><Navigation /><Projects /><Footer /></>} />
            <Route path="/technologies" element={<><Navigation /><Technologies /><Footer /></>} />
            <Route path="/careers" element={<><Navigation /><Careers /><Footer /></>} />
            <Route path="/certificate-verification/:certNo" element={<><Navigation /><CertificateVerification /><Footer /></>} />
            <Route path="/certificate-input" element={<><Navigation /><CertificateInputPage /><Footer /></>} />
            <Route path="/contact" element={<><Navigation /><Contact /><Footer /></>} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute><ManageServices /></ProtectedRoute>} />
            <Route path="/admin/projects" element={<ProtectedRoute><ManageProjects /></ProtectedRoute>} />
            <Route path="/admin/team" element={<ProtectedRoute><ManageTeam /></ProtectedRoute>} />
            <Route path="/admin/testimonials" element={<ProtectedRoute><ManageTestimonials /></ProtectedRoute>} />
            <Route path="/admin/submissions" element={<ProtectedRoute><FormSubmissions /></ProtectedRoute>} />
            <Route path="/admin/website" element={<ProtectedRoute><ManageWebsite /></ProtectedRoute>} />
            <Route path="/admin/ManageCertificates" element={<ProtectedRoute><ManageCertificates /></ProtectedRoute>} />
            <Route path="/admin/ManageOffers" element={<ProtectedRoute><ManageOffers /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
