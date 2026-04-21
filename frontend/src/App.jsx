import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import './theme.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;