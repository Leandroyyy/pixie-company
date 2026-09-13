import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { ToastContainer } from "./components/ui/ToastContainer";
import { AuthProvider } from "./contexts/AuthContext";
import { PdvProvider } from "./contexts/PdvContext";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import PdvsPage from "./pages/PdvsPage";
import SecurityPage from "./pages/SecurityPage";

export default function App() {
  return (
    <HashRouter>
      <ToastContainer />
      <AuthProvider>
        <PdvProvider>
          <Routes>
            {/* Rota pública */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rotas protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="seguranca" element={<SecurityPage />} />
                <Route path="pdvs" element={<PdvsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </PdvProvider>
      </AuthProvider>
    </HashRouter>
  );
}
