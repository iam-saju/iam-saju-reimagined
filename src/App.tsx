import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Notes from "./pages/Notes";
import AIArchive from "./components/AIArchive";
import AdminArchive from "./pages/AdminArchive";
import NotFound from "./pages/NotFound";
import DonutTerminal from "./components/DonutTerminal";
import { useSimpleTerminal } from "./hooks/useSimpleTerminal";

const queryClient = new QueryClient();

const App = () => {
  const { isTerminalVisible, closeTerminal } = useSimpleTerminal();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/posts" element={<Notes />} />
            <Route path="/archive" element={<AIArchive />} />
            <Route path="/admin/archive-upload" element={<AdminArchive />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <DonutTerminal 
            isVisible={isTerminalVisible} 
            onClose={closeTerminal}
          />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
