-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS qhatu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qhatu_db;

-- Tabla para categorías (principales y subcategorías)
CREATE TABLE categorias (
    categoria_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    padre_id INT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (padre_id) REFERENCES categorias(categoria_id) ON DELETE SET NULL,
    INDEX idx_nombre_categoria (nombre),
    INDEX idx_padre_id (padre_id)
) ENGINE=InnoDB;

-- Tabla para productos
CREATE TABLE productos (
    producto_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    estado_stock ENUM('Habido', 'Agotado') GENERATED ALWAYS AS (
        CASE WHEN stock > 0 THEN 'Habido' ELSE 'Agotado' END
    ) STORED,
    porcentaje_stock DECIMAL(5, 2) GENERATED ALWAYS AS (
        CASE 
            WHEN stock > 0 THEN LEAST((stock / 100.0) * 100, 100.0)
            ELSE 0 
        END
    ) STORED,
    umbral_bajo_stock INT DEFAULT 20,
    umbral_critico_stock INT DEFAULT 10,
    categoria_id INT NOT NULL,
    destacado BOOLEAN DEFAULT FALSE,
    url_imagen VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FULLTEXT INDEX idx_nombre_descripcion (nombre, descripcion),
    FOREIGN KEY (categoria_id) REFERENCES categorias(categoria_id) ON DELETE RESTRICT,
    INDEX idx_nombre_producto (nombre),
    INDEX idx_categoria_id (categoria_id),
    INDEX idx_estado_stock (estado_stock),
    INDEX idx_destacado (destacado)
) ENGINE=InnoDB;

-- Tabla para carruseles (simplificada: una imagen por carrusel)
CREATE TABLE carruseles (
    carrusel_id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    url_imagen VARCHAR(255) NOT NULL,
    altura INT NOT NULL, -- Altura en píxeles
    ancho INT NOT NULL,  -- Ancho en píxeles
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_activo (activo)
) ENGINE=InnoDB;

-- Insertar categorías iniciales (principales y subcategorías)
INSERT INTO categorias (nombre, padre_id) VALUES
('Dulces', NULL),
('Chocolates', 1),
('Galletas', 1),
('Caramelos', 1),
('Gomitas', 1),
('Snacks', NULL),
('Papas fritas', 6),
('Piqueos', 6),
('Salados', 6),
('Ramen y Fideos', NULL),
('Instantáneo', 10),
('Premium', 10),
('Picante', 10),
('Bebidas', NULL),
('Bubble Tea', 14),
('Refrescos importados', 14),
('Energizantes', 14),
('Licores', NULL),
('Sake', 18),
('Soju', 18),
('Whisky importado', 18),
('Vinos', 18),
('Otros importados', NULL),
('Salsas', 23),
('Condimentos', 23),
('Productos gourmet', 23);

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, destacado, url_imagen) VALUES
('Chocolate Suizo Premium', 'Chocolate artesanal importado de Suiza', 15.50, 50, 2, TRUE, '/images/chocolate_suizo.png'),
('Ramen Picante Coreano', 'Ramen instantáneo con sabor picante', 8.99, 15, 13, FALSE, '/images/ramen_picante.png'),
('Bubble Tea de Mango', 'Bebida refrescante con perlas de tapioca', 5.75, 5, 15, TRUE, '/images/bubble_tea_mango.png'),
('Soju de Melocotón', 'Licor coreano de melocotón', 20.00, 0, 20, FALSE, '/images/soju_melocoton.png'),
('Papas Fritas BBQ', 'Papas fritas importadas con sabor BBQ', 4.50, 12, 7, FALSE, '/images/papas_bbq.png'),
('Salsa Sriracha', 'Salsa picante importada', 6.25, 30, 24, TRUE, '/images/sriracha.png');

-- Insertar carruseles de ejemplo
INSERT INTO carruseles (titulo, descripcion, url_imagen, altura, ancho, activo) VALUES
('Destacados de Dulces', 'Promoción de dulces importados', '/images/carrusel_dulces.png', 300, 1200, TRUE),
('Ofertas de Bebidas', 'Bebidas refrescantes en oferta', '/images/carrusel_bebidas.png', 300, 1200, TRUE);