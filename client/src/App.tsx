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
import HomePage from "@/pages/HomePage";

function Router() {
  console.log('🔄 Router renderizado, URL atual:', window.location.pathname);
  return (
    <Switch>
      <Route path="/ngx/login" component={() => { console.log('📍 Rota /ngx/login ativada'); return <LoginPage />; }} />
      <Route path="/ngx/admin" component={() => { console.log('📍 Rota /ngx/admin ativada'); return <AdminPanel />; }} />
      <Route path="/" component={() => { console.log('📍 Rota / ativada'); return <HomePage />; }} />
      <Route path="/:slug" component={() => { console.log('📍 Rota /:slug ativada'); return <ClientDashboard />; }} />
      <Route component={() => { console.log('📍 Rota NotFound ativada'); return <NotFound />; }} />
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
