import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('E-mail ou senha inválidos.');
    } else {
      window.location.href = '/';
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center animate-in fade-in duration-500">
        <img src="/lovable-uploads/logo.png" alt="Logo Terrah Homes" className="h-16 mb-4" />
        <h1 className="text-2xl font-bold text-terrah-orange mb-1">Terrah Homes</h1>
        <p className="text-md text-muted-foreground">Aluguel de Temporada</p>
        <p className="text-sm text-muted-foreground mb-6 mt-4">Acesse sua conta</p>
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full h-12 mt-2" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        {error && <div className="text-destructive text-sm mt-4">{error}</div>}
      </div>
      <p className="text-xs text-muted-foreground mt-8">&copy; {new Date().getFullYear()} Terrah Homes</p>
    </div>
  );
} 