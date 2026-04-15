import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ThemeToggle from "@/components/ThemeToggle";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import SelectMode from "./pages/SelectMode.tsx";
import Discover from "./pages/Discover.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/select-mode" element={<SelectMode />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle />
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
