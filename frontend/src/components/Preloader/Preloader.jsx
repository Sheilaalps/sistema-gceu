import './Preloader.css';

const Preloader = () => {
  return (
    <div className="preloader-overlay">
      <div className="preloader-spinner">
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
      </div>
      <p className="preloader-text">Carregando...</p>
    </div>
  );
};

export default Preloader;
