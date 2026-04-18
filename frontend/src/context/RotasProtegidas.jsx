import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export const RotaPrivada = ({ children }) => {
  const { estaAutenticado, carregando } = useContext(AuthContext);

  if (carregando) {
    return <div>Carregando...</div>;
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const RotaAdmin = ({ children }) => {
  const { usuario, carregando } = useContext(AuthContext);

  if (carregando) {
    return <div>Carregando...</div>;
  }

  if (!usuario || usuario.nivel !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};
