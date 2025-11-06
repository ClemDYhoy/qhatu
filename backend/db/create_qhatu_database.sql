Try AI directly in your favorite apps … Use Gemini to generate drafts and refine content, plus get Gemini Pro with access to Google's next-gen AI for PEN 73.99 PEN 0 for 1 month
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-10-2025 a las 14:51:44
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `qhatu_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carruseles`
--

CREATE TABLE `carruseles` (
  `carrusel_id` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `url_imagen` varchar(255) NOT NULL,
  `altura` int(11) NOT NULL,
  `ancho` int(11) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `categoria_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `carruseles`
--

INSERT INTO `carruseles` (`carrusel_id`, `titulo`, `descripcion`, `url_imagen`, `altura`, `ancho`, `activo`, `creado_en`, `actualizado_en`, `categoria_id`) VALUES
(1, 'Destacados de Dulces', 'Promoción de dulces importados', '/awaiting-image.jpeg', 300, 1200, 1, '2025-10-22 23:00:41', '2025-10-23 07:04:54', NULL),
(2, 'Ofertas de Bebidas', 'Bebidas refrescantes en oferta', '/images/carrusel_bebidas.png', 300, 1200, 1, '2025-10-22 23:00:41', '2025-10-22 23:00:41', NULL),
(3, '', 'Chocolate artesanal importado de Suiza', '/images/chocolate_suizo.png', 0, 0, 1, '2025-10-22 23:46:00', '2025-10-22 23:46:00', 2),
(4, '', 'Ramen instantáneo con sabor picante', '/images/ramen_picante.png', 0, 0, 1, '2025-10-22 23:46:00', '2025-10-22 23:46:00', 13),
(5, '', 'Bebida refrescante con perlas de tapioca', '/images/bubble_tea_mango.png', 0, 0, 1, '2025-10-22 23:46:00', '2025-10-22 23:46:00', 15),
(6, '', 'Licor coreano de melocotón', '/images/soju_melocoton.png', 0, 0, 1, '2025-10-22 23:46:00', '2025-10-22 23:46:00', 20),
(8, 'Ofertas de Bebidas', 'Bebidas refrescantes en oferta', '/images/carrusel_bebidas.png', 300, 1200, 1, '2025-10-22 23:46:06', '2025-10-22 23:46:06', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `categoria_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `padre_id` int(11) DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`categoria_id`, `nombre`, `padre_id`, `creado_en`, `actualizado_en`) VALUES
(1, 'Dulces', NULL, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(2, 'Chocolates', 1, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(3, 'Galletas', 1, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(4, 'Caramelos', 1, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(5, 'Gomitas', 1, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(6, 'Snacks', NULL, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(7, 'Papas fritas', 6, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(8, 'Piqueos', 6, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(9, 'Salados', 6, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(10, 'Ramen y Fideos', NULL, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(11, 'Instantáneo', 10, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(12, 'Premium', 10, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(13, 'Picante', 10, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(14, 'Bebidas', NULL, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(15, 'Bubble Tea', 14, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(16, 'Refrescos importados', 14, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(17, 'Energizantes', 14, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(18, 'Licores', NULL, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(19, 'Sake', 18, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(20, 'Soju', 18, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(21, 'Whisky importado', 18, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(22, 'Vinos', 18, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(23, 'Otros importados', NULL, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(24, 'Salsas', 23, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(25, 'Condimentos', 23, '2025-10-22 23:00:41', '2025-10-22 23:00:41'),
(26, 'Productos gourmet', 23, '2025-10-22 23:00:41', '2025-10-22 23:00:41');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `producto_id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `precio_descuento` decimal(10,2) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `estado_stock` enum('Habido','Agotado') GENERATED ALWAYS AS (case when `stock` > 0 then 'Habido' else 'Agotado' end) STORED,
  `porcentaje_stock` decimal(5,2) GENERATED ALWAYS AS (case when `stock` > 0 then least(`stock` / 100.0 * 100,100.0) else 0 end) STORED,
  `umbral_bajo_stock` int(11) DEFAULT 20,
  `umbral_critico_stock` int(11) DEFAULT 10,
  `categoria_id` int(11) NOT NULL,
  `destacado` tinyint(1) DEFAULT 0,
  `ventas` int(11) DEFAULT 0,
  `peso` decimal(10,2) DEFAULT NULL,
  `unidad_medida` varchar(50) DEFAULT NULL,
  `url_imagen` varchar(255) DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`producto_id`, `nombre`, `descripcion`, `precio`, `precio_descuento`, `stock`, `umbral_bajo_stock`, `umbral_critico_stock`, `categoria_id`, `destacado`, `ventas`, `peso`, `unidad_medida`, `url_imagen`, `creado_en`, `actualizado_en`) VALUES
(1, 'Chocolate Suizo Premium', 'Chocolate artesanal importado de Suiza', 15.50, 13.18, 50, 20, 10, 2, 1, 39, NULL, 'unidades', '/awaiting-image.jpeg', '2025-10-22 23:00:41', '2025-10-23 04:48:05'),
(2, 'Ramen Picante Coreano', 'Ramen instantáneo con sabor picante', 8.99, 7.64, 15, 20, 10, 13, 0, 14, NULL, 'unidades', '/awaiting-image.jpeg', '2025-10-22 23:00:41', '2025-10-23 04:48:05'),
(3, 'Bubble Tea de Mango', 'Bebida refrescante con perlas de tapioca', 5.75, NULL, 5, 20, 10, 15, 1, 46, NULL, 'unidades', '/awaiting-image.jpeg', '2025-10-22 23:00:41', '2025-10-23 04:48:05'),
(4, 'Soju de Melocotón', 'Licor coreano de melocotón', 20.00, NULL, 0, 20, 10, 20, 0, 75, NULL, 'unidades', '/awaiting-image.jpeg', '2025-10-22 23:00:41', '2025-10-23 04:48:05'),
(5, 'Papas Fritas BBQ', 'Papas fritas importadas con sabor BBQ', 4.50, 3.83, 12, 20, 10, 7, 0, 29, NULL, 'unidades', '/awaiting-image.jpeg', '2025-10-22 23:00:41', '2025-10-23 04:48:05'),
(6, 'Salsa Sriracha', 'Salsa picante importada', 6.25, NULL, 30, 20, 10, 24, 1, 12, NULL, 'unidades', '/awaiting-image.jpeg', '2025-10-22 23:00:41', '2025-10-23 04:48:05'),
(7, 'Galletas Oreo', 'Galletas de chocolate con crema', 3.50, NULL, 100, 20, 10, 3, 0, 45, NULL, 'paquete', '/awaiting-image.jpeg', '2025-10-23 04:48:31', '2025-10-23 04:48:31'),
(8, 'Gomitas Haribo', 'Gomitas de frutas importadas', 4.00, NULL, 80, 20, 10, 5, 1, 67, NULL, 'bolsa', '/awaiting-image.jpeg', '2025-10-23 04:48:31', '2025-10-23 04:48:31'),
(9, 'Caramelos de menta', 'Caramelos refrescantes', 2.50, NULL, 120, 20, 10, 4, 0, 23, NULL, 'bolsa', '/awaiting-image.jpeg', '2025-10-23 04:48:31', '2025-10-23 04:48:31'),
(10, 'Doritos Nacho', 'Papas sabor queso nacho', 5.00, NULL, 60, 20, 10, 7, 1, 89, NULL, 'bolsa', '/awaiting-image.jpeg', '2025-10-23 04:48:31', '2025-10-23 04:48:31'),
(11, 'Pringles Original', 'Papas en tubo originales', 6.50, NULL, 40, 20, 10, 7, 0, 56, NULL, 'tubo', '/awaiting-image.jpeg', '2025-10-23 04:48:31', '2025-10-23 04:48:31'),
(12, 'Cheetos Flamin Hot', 'Snack picante de queso', 4.50, NULL, 70, 20, 10, 9, 1, 78, NULL, 'bolsa', '/awaiting-image.jpeg', '2025-10-23 04:48:31', '2025-10-23 04:48:31'),
(13, 'Galletas Oreo', 'Galletas de chocolate con crema', 3.50, NULL, 100, 20, 10, 3, 0, 45, NULL, 'paquete', '/awaiting-image.jpeg', '2025-10-23 04:49:01', '2025-10-23 04:49:01'),
(14, 'Gomitas Haribo', 'Gomitas de frutas importadas', 4.00, NULL, 80, 20, 10, 5, 1, 67, NULL, 'bolsa', '/awaiting-image.jpeg', '2025-10-23 04:49:01', '2025-10-23 04:49:01'),
(15, 'Caramelos de menta', 'Caramelos refrescantes', 2.50, NULL, 120, 20, 10, 4, 0, 23, NULL, 'bolsa', '/awaiting-image.jpeg', '2025-10-23 04:49:01', '2025-10-23 04:49:01'),
(16, 'Doritos Nacho', 'Papas sabor queso nacho', 5.00, NULL, 60, 20, 10, 7, 1, 89, NULL, 'bolsa', '/awaiting-image.jpeg', '2025-10-23 04:49:01', '2025-10-23 04:49:01'),
(17, 'Pringles Original', 'Papas en tubo originales', 6.50, NULL, 40, 20, 10, 7, 0, 56, NULL, 'tubo', '/awaiting-image.jpeg', '2025-10-23 04:49:01', '2025-10-23 04:49:01'),
(18, 'Cheetos Flamin Hot', 'Snack picante de queso', 4.50, NULL, 70, 20, 10, 9, 1, 78, NULL, 'bolsa', '/awaiting-image.jpeg', '2025-10-23 04:49:01', '2025-10-23 04:49:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `usuario_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isAdmin` tinyint(1) DEFAULT 0,
  `creado_en` datetime DEFAULT NULL,
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carruseles`
--
ALTER TABLE `carruseles`
  ADD PRIMARY KEY (`carrusel_id`),
  ADD KEY `idx_activo` (`activo`),
  ADD KEY `fk_carrusel_categoria` (`categoria_id`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`categoria_id`),
  ADD KEY `idx_nombre_categoria` (`nombre`),
  ADD KEY `idx_padre_id` (`padre_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`producto_id`),
  ADD KEY `idx_nombre_producto` (`nombre`),
  ADD KEY `idx_categoria_id` (`categoria_id`),
  ADD KEY `idx_estado_stock` (`estado_stock`),
  ADD KEY `idx_destacado` (`destacado`),
  ADD KEY `idx_productos_categoria` (`categoria_id`);
ALTER TABLE `productos` ADD FULLTEXT KEY `idx_nombre_descripcion` (`nombre`,`descripcion`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`usuario_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carruseles`
--
ALTER TABLE `carruseles`
  MODIFY `carrusel_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `categoria_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `producto_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `usuario_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carruseles`
--
ALTER TABLE `carruseles`
  ADD CONSTRAINT `fk_carrusel_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`categoria_id`);

--
-- Filtros para la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD CONSTRAINT `categorias_ibfk_1` FOREIGN KEY (`padre_id`) REFERENCES `categorias` (`categoria_id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`categoria_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;