import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Notes from "./pages/Notes";
import PostViewer from './pages/PostViewer';
import AIArchive from "./components/AIArchive";
import AdminArchive from "./pages/AdminArchive";
import NotFound from "./pages/NotFound";
import DonutTerminal from "./components/DonutTerminal";
import { useDonutTerminal } from "./hooks/useDonutTerminal";
import { useDonutState } from "./hooks/useDonutState";

const queryClient = new QueryClient();

const App = () => {
  const { isTerminalVisible, isClosing, closeTerminal, toggleTerminal } = useDonutTerminal();
  const donutState = useDonutState();

  // Listen for custom event from Navigation's λ button
  useEffect(() => {
    const handler = () => toggleTerminal();
    window.addEventListener('toggle-terminal', handler);
    return () => window.removeEventListener('toggle-terminal', handler);
  }, [toggleTerminal]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/posts" element={<Notes />} />
            <Route path="/posts/:slug" element={<PostViewer />} />
            <Route path="/archive" element={<AIArchive />} />
            <Route path="/admin/archive-upload" element={<AdminArchive />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <DonutTerminal
            isVisible={isTerminalVisible}
            isClosing={isClosing}
            onClose={closeTerminal}
            initialA={donutState.getRotation().A}
            initialB={donutState.getRotation().B}
          />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
