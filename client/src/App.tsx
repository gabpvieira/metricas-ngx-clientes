import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import ClientDashboard from "@/pages/ClientDashboard";
import AdminPanel from "@/pages/AdminPanel";
import LoginPage from "@/pages/LoginPage";

function Router() {
  return (
    <Switch>
      <Route path="/ngx/login" component={LoginPage} />
      <Route path="/ngx/admin" component={AdminPanel} />
      <Route path="/:slug" component={ClientDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
