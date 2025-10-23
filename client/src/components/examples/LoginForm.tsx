import LoginForm from '../LoginForm';

export default function LoginFormExample() {
  const handleLogin = (username: string, password: string) => {
    console.log('Login attempt:', username, password);
    return username === 'admin' && password === 'admin123';
  };

  return <LoginForm onLogin={handleLogin} />;
}
