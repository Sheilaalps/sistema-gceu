import React, { useState, useRef } from 'react';
import { BarChart3, Download, Calendar as CalendarIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './PainelRelatorio.css';

const PainelRelatorio = ({ dadosIniciais = [] }) => {
  const [filtro, setFiltro] = useState('dia'); // 'dia', 'semana', 'ano', 'custom'
  const [dataCustom, setDataCustom] = useState(new Date().toISOString().split('T')[0]);
  const relatorioRef = useRef();

  const baixarPDF = async () => {
    const elemento = relatorioRef.current;
    const canvas = await html2canvas(elemento, {
      scale: 2,
      useCORS: true,
      backgroundColor: getComputedStyle(elemento).backgroundColor
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save(`relatorio-${filtro === 'custom' ? dataCustom : filtro}.pdf`);
  };

  const filtrarDados = () => {
    const hoje = new Date();
    return dadosIniciais.filter((item) => {
      const dataItem = new Date(item.data);
      
      // Filtro por Calendário (Data Específica)
      if (filtro === 'custom') {
        const dataSelecionada = new Date(dataCustom + 'T00:00:00');
        return dataItem.toDateString() === dataSelecionada.toDateString();
      }
      // Filtros Rápidos
      if (filtro === 'dia') return dataItem.toDateString() === hoje.toDateString();
      if (filtro === 'semana') return (hoje - dataItem) / (1000 * 60 * 60 * 24) <= 7;
      if (filtro === 'ano') return dataItem.getFullYear() === hoje.getFullYear();
      return true;
    });
  };

  const dadosFiltrados = filtrarDados();
  const contar = (nivel) => dadosFiltrados.filter(i => i.nivel === nivel).length;

  return (
    <div className="cadastro-usuarios-section card-glass-effect" ref={relatorioRef}>
      <div className="relatorio-header-container">
        <div className="titulo-relatorio">
          <BarChart3 size={24} color="#667eea" />
          <h2>Resumo de Usuários</h2>
        </div>
        
        <div className="acoes-relatorio">
          {/* Calendário */}
          <div className={`input-data-wrapper ${filtro === 'custom' ? 'active-border' : ''}`}>
            <CalendarIcon size={16} />
            <input 
              type="date" 
              value={dataCustom} 
              onChange={(e) => {
                setDataCustom(e.target.value);
                setFiltro('custom');
              }}
            />
          </div>

          {/* Botões Rápidos */}
          <div className="filtros-periodo">
            {['dia', 'semana', 'ano'].map((t) => (
              <button 
                key={t} 
                className={`btn-filtro-item ${filtro === t ? 'active' : ''}`}
                onClick={() => setFiltro(t)}
              >
                {t === 'dia' ? 'Hoje' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <button onClick={baixarPDF} className="btn-download-pdf" title="Baixar PDF">
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="admin-grid-stats">
        <div className="stat-box-mini main-stat">
          <span className="label">Total Geral</span>
          <p className="value">{dadosFiltrados.length}</p>
        </div>
        <div className="stat-box-mini">
          <span className="label">Líderes</span>
          <p className="value">{contar('lider')}</p>
        </div>
        <div className="stat-box-mini">
          <span className="label">Anfitriões</span>
          <p className="value">{contar('anfitriao')}</p>
        </div>
        <div className="stat-box-mini">
          <span className="label">Visitantes</span>
          <p className="value">{contar('visitante')}</p>
        </div>
        <div className="stat-box-mini">
          <span className="label">Samaritanos</span>
          <p className="value">{contar('samaritano')}</p>
        </div>
        <div className="stat-box-mini">
          <span className="label">Secretário(a)</span>
          <p className="value">{contar('secretaria')}</p>
        </div>
      </div>
    </div>
  );
};

export default PainelRelatorio;
