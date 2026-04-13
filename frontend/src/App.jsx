import Sidebar from './components/Sidebar/Sidebar';
import Home from './components/Home/Home';
import Banner from './components/Banner/Banner';
import './App.css';

function App() {
  return (
    <div className="container">
      <Sidebar />
        <Banner />
      <div className="main-content">
        <Home />
      </div>
    </div>
  );
}

export default App;