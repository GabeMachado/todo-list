import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DefaultLayout from "@/layouts/default";

function App() {
  return (
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<RegisterPage />} path="/register" />
      <Route
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <IndexPage />
            </DefaultLayout>
          </ProtectedRoute>
        }
        path="/"
      />
    </Routes>
  );
}

export default App;
