import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { PdvProvider } from "./contexts/PdvContext";
import DashboardPage from "./pages/DashboardPage";
import PdvsPage from "./pages/PdvsPage";
import SecurityPage from "./pages/SecurityPage";

export default function App() {
  return (
    <BrowserRouter>
      <PdvProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="seguranca" element={<SecurityPage />} />
            <Route path="pdvs" element={<PdvsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </PdvProvider>
    </BrowserRouter>
  );
}
