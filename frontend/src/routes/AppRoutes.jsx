import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../components/Home/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Membros from "../pages/Membros";
import Admin from "../pages/Admin";
import ResetarSenha from "../pages/ResetarSenha";
import SolicitarRecuperacao from "../pages/SolicitarRecuperacao";
import Configuracoes from "../pages/Configuracoes";
import LayoutPrivado from "../layouts/LayoutPrivado";
import Aviso from '../pages/Aviso'; 
import GerenciarAviso from '../pages/GerenciarAviso';
import { RotaPrivada, RotaAdmin } from "../context/RotasProtegidas";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROTAS PÚBLICAS */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/resetar-senha" element={<ResetarSenha />} />
        <Route path="/solicitar-recuperacao" element={<SolicitarRecuperacao />} />
        
        <Route path="/atualizacoes" element={<Aviso />} />
        <Route path="/casadepaz" element={<Aviso />} />

        {/* ROTAS PROTEGIDAS */}
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

        <Route
          path="/configuracoes"
          element={
            <RotaPrivada>
              <LayoutPrivado>
                <Configuracoes />
              </LayoutPrivado>
            </RotaPrivada>
          }
        />

        <Route
          path="/avisos"
          element={
            <RotaPrivada>
              <LayoutPrivado>
                <GerenciarAviso />
              </LayoutPrivado>
            </RotaPrivada>
          }
        />

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

        {/* REDIRECIONAMENTO SEGURO */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;