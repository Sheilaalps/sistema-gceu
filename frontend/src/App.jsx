import Sidebar from './components/Sidebar/Sidebar';
import Home from './components/Home/Home';
import Banner from './components/Banner/Banner';
import Footer from './components/Footer/Footer';
import './App.css';

function App() {
  return (
    <div className="container">
      <Sidebar />
      {/* Todo o conteúdo da direita agora fica aqui dentro */}
      <div className="main-content">
        <Banner />
        <Home />
        <Footer />
      </div>
    </div>
  );
}

export default App;