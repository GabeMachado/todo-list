import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";

import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signIn(email, password);
      navigate("/");
    } catch (err) {
      setError("Falha no login. Verifique suas credenciais.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
          <p className="text-default-500">Faça login para continuar</p>
        </div>

        {error && (
          <div className="bg-danger-50 text-danger p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <Input
            required
            label="Email"
            placeholder="Digite seu email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            required
            label="Senha"
            placeholder="Digite sua senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex justify-end">
            <Link color="primary" href="/forgot-password" size="sm">
              Esqueceu a senha?
            </Link>
          </div>

          <Button fullWidth color="primary" isLoading={isLoading} type="submit">
            Entrar
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-default-500">Não tem uma conta? </span>
          <Link color="primary" href="/register">
            Cadastre-se
          </Link>
        </div>
      </Card>
    </div>
  );
}
