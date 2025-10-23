import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import LoginForm from "@/components/LoginForm";
import { useEffect } from "react";

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/ngx/admin");
    }
  }, [isAuthenticated, setLocation]);

  const handleLogin = (username: string, password: string): boolean => {
    const success = login(username, password);
    if (success) {
      setLocation("/ngx/admin");
    }
    return success;
  };

  return <LoginForm onLogin={handleLogin} />;
}
