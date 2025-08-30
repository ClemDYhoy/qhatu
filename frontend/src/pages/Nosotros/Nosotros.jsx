import React from 'react';
import './Nosotros.css';

function Nosotros() {
  return (
    <div className="nosotros-page">
      <main className="nosotros-content">
        {/* Sección 1: ¿Quiénes Somos? */}
        <section className="qhatu-about-section">
          <div className="container">
            <div className="qhatu-about-row">
              <div className="qhatu-about-text">
                <h1 className="qhatu-about-main-title">Sobre Nosotros</h1>
                <h2 className="qhatu-about-subtitle">¿Quiénes Somos?</h2>
                <p className="qhatu-about-highlight">
                  <strong>OE | Qhatu Marca - Tu puente a productos globales</strong>
                </p>
                <p>
                  Somos una plataforma dedicada a conectar a hispanohablantes con productos importados de todo el mundo, 
                  eliminando barreras idiomáticas y logísticas. En Qhatu Marca, ofrecemos una experiencia de compra sencilla, 
                  confiable y culturalmente adaptada, utilizando WhatsApp como nuestra herramienta principal para que compres 
                  con facilidad y confianza.
                </p>
                <p>
                  Nuestro compromiso es apoyar a la comunidad hispanohablante, brindando acceso a productos internacionales 
                  de alta calidad con traducciones claras y guías detalladas. Como tú, soñamos en grande y trabajamos con 
                  pasión para hacer realidad una experiencia de compra sin complicaciones.
                </p>
                <blockquote className="qhatu-about-quote">
                  "En Qhatu Marca, somos tu aliado para explorar un mundo de sabores y productos."
                </blockquote>
              </div>
              <div className="qhatu-about-image">
                <img 
                  src="../../../public/oe.png" 
                  alt="Qhatu Marca - Tu puente a productos globales" 
                  className="qhatu-logo-animate"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Sección 2: Nuestra Historia */}
        <section className="qhatu-about-section">
          <div className="container">
            <div className="qhatu-about-row qhatu-about-row-reverse">
              <div className="qhatu-about-image">
                <img 
                  src="../../../public/oe.png" 
                  alt="Historia de Qhatu Marca" 
                />
              </div>
              <div className="qhatu-about-text">
                <h2 className="qhatu-about-subtitle">Nuestra <strong>Historia</strong></h2>
                <div className="qhatu-about-separator">...</div>
                <p>
                  Qhatu Marca nació en 2023 con una idea simple pero poderosa: hacer que los productos internacionales 
                  sean accesibles para todos los hispanohablantes. Comenzamos conectando pequeños comercios con snacks 
                  y bebidas importadas, enfrentando los desafíos de la traducción y la logística.
                </p>
                <p>
                  Durante la pandemia, identificamos la necesidad de una solución que simplificara las compras globales. 
                  Por eso, integramos WhatsApp como una herramienta conversacional para guiar a nuestros clientes en 
                  cada paso, desde la selección hasta la entrega.
                </p>
                <p>
                  Hoy, trabajamos con comercios y clientes individuales en toda América Latina, garantizando calidad y 
                  confianza en cada pedido. En Qhatu Marca, no solo vendemos productos; construimos puentes culturales 
                  para que explores un mundo de posibilidades.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 3: Beneficios */}
        <section className="qhatu-benefits-section">
          <div className="container">
            <h2 className="qhatu-benefits-title">Te ofrecemos una experiencia única</h2>
            <div className="qhatu-benefits-grid">
              <div className="qhatu-benefit-card">
                <div className="qhatu-benefit-icon">
                  <img src="/assets/delivery-icon.png" alt="Envíos Rápidos" />
                </div>
                <h3>Envíos Rápidos</h3>
                <p>Recibe tus productos en 24-48 horas con seguimiento incluido.</p>
              </div>
              <div className="qhatu-benefit-card">
                <div className="qhatu-benefit-icon">
                  <img src="/assets/support-icon.png" alt="Atención al Cliente" />
                </div>
                <h3>Atención al Cliente</h3>
                <p>Contáctanos al +1 (123) 456-7890 para soporte inmediato.</p>
              </div>
              <div className="qhatu-benefit-card">
                <div className="qhatu-benefit-icon">
                  <img src="/assets/secure-icon.png" alt="Compras Seguras" />
                </div>
                <h3>Compras Seguras</h3>
                <p>Transacciones protegidas en todos los pedidos.</p>
              </div>
              <div className="qhatu-benefit-card">
                <div className="qhatu-benefit-icon">
                  <img src="/assets/guaranteed-icon.png" alt="Garantía de Calidad" />
                </div>
                <h3>Garantía de Calidad</h3>
                <p>Productos frescos y en perfectas condiciones.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 4: Nuestra Misión */}
        <section className="qhatu-about-section">
          <div className="container">
            <div className="qhatu-about-row">
              <div className="qhatu-about-text">
                <h2 className="qhatu-about-subtitle">Nuestra <strong>Misión</strong></h2>
                <div className="qhatu-about-separator">...</div>
                <p>
                  Nuestra misión es ser el marketplace líder para hispanohablantes, ofreciendo productos internacionales 
                  con información clara en español y una experiencia de compra simplificada a través de WhatsApp.
                </p>
                <p>
                  Queremos evitar las complicaciones de comprar productos importados, asegurando que cada artículo llegue 
                  en perfectas condiciones, con traducciones precisas y guías de uso detalladas.
                </p>
                <p>
                  Trabajamos para que comercios y clientes individuales puedan disfrutar de productos globales sin 
                  preocupaciones, apoyando su crecimiento y satisfacción.
                </p>
              </div>
              <div className="qhatu-about-image">
                <img 
                  src="../../../public/oe.png" 
                  alt="Misión de Qhatu Marca" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Sección 5: Nuestra Visión */}
        <section className="qhatu-about-section">
          <div className="container">
            <div className="qhatu-about-row qhatu-about-row-reverse">
              <div className="qhatu-about-image">
                <img 
                  src="../../../public/oe.png" 
                  alt="Visión de Qhatu Marca" 
                />
              </div>
              <div className="qhatu-about-text">
                <h2 className="qhatu-about-subtitle">Nuestra <strong>Visión</strong></h2>
                <div className="qhatu-about-separator">...</div>
                <p>
                  Nuestra visión es posicionarnos como el mejor marketplace para hispanohablantes, conectando a la 
                  comunidad con productos internacionales de alta calidad en un entorno confiable y accesible.
                </p>
                <p>
                  Buscamos que cientos de comercios y clientes encuentren en Qhatu Marca una plataforma para crecer, 
                  explorar nuevos productos y disfrutar de una experiencia de compra innovadora.
                </p>
                <p>
                  Con nuestro enfoque en la simplicidad y la tecnología, queremos transformar la forma en que los 
                  hispanohablantes acceden a productos globales.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 6: Nuestros Valores */}
        <section className="qhatu-values-section">
          <div className="container">
            <h2 className="qhatu-values-title">Nuestros Valores</h2>
            <div className="qhatu-values-grid">
              <div className="qhatu-value-item">
                <h3>Confianza</h3>
                <p>Traducciones precisas y contenido adaptado culturalmente.</p>
              </div>
              <div className="qhatu-value-item">
                <h3>Simplicidad</h3>
                <p>Proceso de compra intuitivo y fácil a través de WhatsApp.</p>
              </div>
              <div className="qhatu-value-item">
                <h3>Accesibilidad</h3>
                <p>Diseño móvil-first y experiencia de usuario inclusiva.</p>
              </div>
              <div className="qhatu-value-item">
                <h3>Innovación</h3>
                <p>Mejora continua basada en datos y recomendaciones inteligentes.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Nosotros;