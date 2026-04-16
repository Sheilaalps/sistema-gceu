// No seu App.js
import Sidebar from './components/Sidebar/Sidebar';
import Home from './components/Home/Home';
import Banner from './components/Banner/Banner';
import Footer from './components/Footer/Footer';
import './App.css'; // Vamos ajustar o CSS no Passo 2

function App() {
  return (
    // Mudamos o nome da classe para "app-layout" para evitar conflitos
    <div className="app-layout">
      <Sidebar />
      <div className="main-container">
        <Banner />
        <main className="content">
          <Home />
        </main>
        <Footer />
      </div>
    </div>
  );
}
export default App;