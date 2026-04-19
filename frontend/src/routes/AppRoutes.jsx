import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../components/Home/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Membros from "../pages/Membros";
import Admin from "../pages/Admin";
import LayoutPrivado from "../layouts/LayoutPrivado";
import Aviso from '../pages/Aviso'; // Conferindo se o arquivo chama Aviso.jsx agora
import { RotaPrivada, RotaAdmin } from "../context/RotasProtegidas";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Mudei aqui: Tirei a RotaPrivada para você conseguir testar sem logar */}
        <Route
          path="/atualizacoes"
          element={
            <LayoutPrivado>
              <Aviso />
            </LayoutPrivado>
          }
        />

        {/* Rotas do Sistema (Protegidas) */}
        <Route
          path="/dashboard"
          element={
            <RotaPrivada>
              <LayoutPrivado>
                <Dashboard />
              </LayoutPrivado>
            </RotaPrivada>
          }
        />

        <Route
          path="/membros"
          element={
            <RotaPrivada>
              <LayoutPrivado>
                <Membros />
              </LayoutPrivado>
            </RotaPrivada>
          }
        />

        {/* Rota para o Pastor/Admin gerenciar líderes */}
        <Route
          path="/admin"
          element={
            <RotaAdmin>
              <LayoutPrivado>
                <Admin />
              </LayoutPrivado>
            </RotaAdmin>
          }
        />

      {/* Se a rota não existir, ele tenta ir para o Dashboard em vez da Home pública */}
<Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;