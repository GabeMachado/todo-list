import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card } from "@heroui/card";

import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");

      return;
    }

    try {
      setLoading(true);
      await signUp(formData.email, formData.password);
      navigate("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao criar sua conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-6">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Criar uma nova conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{" "}
            <Link
              className="font-medium text-primary-600 hover:text-primary-500"
              to="/login"
            >
              faça login se já possui uma conta
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              required
              label="Email"
              placeholder="seu@email.com"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <Input
              required
              label="Senha"
              placeholder="********"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <Input
              required
              label="Confirmar Senha"
              placeholder="********"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 text-center">{error}</div>
          )}

          <Button
            className="w-full"
            color="primary"
            isLoading={loading}
            type="submit"
          >
            Criar conta
          </Button>
        </form>
      </Card>
    </div>
  );
}
