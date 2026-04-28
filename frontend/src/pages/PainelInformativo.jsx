import React, { useState, useEffect } from 'react';
import { supabase } from '../Service/supabaseClient';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import './PainelInformativo.css';

const PainelInformativo = () => {
  const [avisos, setAvisos] = useState([]);

  useEffect(() => {
    const fetchAvisos = async () => {
      const { data } = await supabase.from('avisos_gceu').select('*');
      setAvisos(data || []);
    };
    fetchAvisos();
  }, []);

  // FILTRO CORRIGIDO: Itens com "GCEU" no título sobem para os Slides
  const slidesGceu = avisos.filter(item => item.titulo.includes("GCEU"));

  // FILTRO CORRIGIDO: APENAS o que for título EXATO "AVISOS" ou "NOTÍCIAS" fica na lista de baixo
  const listaAvisos = avisos.filter(item => item.titulo === "AVISOS" || item.titulo === "NOTÍCIAS");

  return (
    <div className="painel-container">
      {/* SEÇÃO SUPERIOR: SLIDES AUTOMÁTICOS */}
      <div className="gceu-section">
        <Swiper 
          modules={[Autoplay, Pagination]} 
          spaceBetween={30} 
          slidesPerView={1}
          autoplay={{ delay: 8000, disableOnInteraction: false }} 
          pagination={{ clickable: true }}
          className="mySwiper"
        >
          {slidesGceu.length > 0 ? (
            slidesGceu.map((gceu) => (
              <SwiperSlide key={gceu.id}>
                <div className="card-gceu-slide">
                  <span className="tag-gceu">SOBRE GCEU</span>
                  <h2>{gceu.titulo}</h2>
                  <div className="divider"></div>
                  <p>{gceu.conteudo}</p>
                </div>
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide>
              <div className="card-gceu-slide">
                <p>Nenhum slide disponível.</p>
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      </div>

      {/* SEÇÃO INFERIOR: LISTA FIXA COM SCROLL VERTICAL */}
      <div className="avisos-section">
        <div className="header-avisos">
          <span className="tag-yellow">📢 AVISOS E NOTÍCIAS</span>
        </div>
        
        <div className="avisos-list">
          {listaAvisos.length > 0 ? (
            listaAvisos.map((aviso) => (
              <div key={aviso.id} className="aviso-item">
                <span className={aviso.titulo === "NOTÍCIAS" ? "tag-noticia-mini" : "tag-aviso-mini"}>
                  {aviso.titulo}
                </span>
                <p>{aviso.conteudo}</p>
                <div className="mini-divider"></div>
              </div>
            ))
          ) : (
            <p className="no-data">Nenhum aviso no momento.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PainelInformativo;