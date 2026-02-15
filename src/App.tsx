import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Search from "./pages/Search";
import Leaders from "./pages/Leaders";
import LeaderProfile from "./pages/LeaderProfile";
import ImpeachedLeaders from "./pages/ImpeachedLeaders";
import Counties from "./pages/Counties";
import Surveys from "./pages/Surveys";
import CivicFacts from "./pages/CivicFacts";
import Feedback from "./pages/Feedback";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<Search />} />
          <Route path="/leaders" element={<Leaders />} />
          <Route path="/leader/:id" element={<LeaderProfile />} />
          <Route path="/impeached" element={<ImpeachedLeaders />} />
          <Route path="/counties" element={<Counties />} />
          <Route path="/surveys" element={<Surveys />} />
          <Route path="/civic-facts" element={<CivicFacts />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
