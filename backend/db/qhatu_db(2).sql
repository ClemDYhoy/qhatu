-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 08-11-2025 a las 15:25:41
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

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_banners_activos` ()   BEGIN
  SELECT 
    banner_id,
    titulo,
    descripcion,
    categoria_id,
    porcentaje_descuento,
    url_imagen_fondo,
    color_fondo,
    color_texto,
    fecha_inicio,
    fecha_fin,
    tipo_descuento,
    monto_minimo,
    DATEDIFF(fecha_fin, NOW()) AS dias_restantes
  FROM 
    v_banners_activos
  LIMIT 5;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_interaccion_banner` (IN `p_banner_id` INT, IN `p_tipo` VARCHAR(10))   BEGIN
  IF p_tipo = 'vista' THEN
    UPDATE banners_descuento 
    SET vistas = vistas + 1 
    WHERE banner_id = p_banner_id;
  ELSEIF p_tipo = 'click' THEN
    UPDATE banners_descuento 
    SET clicks = clicks + 1 
    WHERE banner_id = p_banner_id;
  END IF;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `banners_descuento`
--

CREATE TABLE `banners_descuento` (
  `banner_id` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL COMMENT 'Título del banner (ej: "¡Mega Descuentos en Dulces!")',
  `descripcion` text DEFAULT NULL COMMENT 'Descripción opcional del banner',
  `categoria_id` int(11) NOT NULL COMMENT 'Categoría en descuento',
  `porcentaje_descuento` decimal(5,2) NOT NULL COMMENT 'Porcentaje de descuento (0.00 a 100.00)',
  `url_imagen_fondo` varchar(500) DEFAULT NULL COMMENT 'URL de la imagen de fondo del banner',
  `color_fondo` varchar(7) DEFAULT '#667eea' COMMENT 'Color de fondo alternativo (formato HEX)',
  `color_texto` varchar(7) DEFAULT '#ffffff' COMMENT 'Color del texto (formato HEX)',
  `fecha_inicio` datetime NOT NULL COMMENT 'Fecha de inicio de la promoción',
  `fecha_fin` datetime NOT NULL COMMENT 'Fecha de finalización de la promoción',
  `activo` tinyint(1) DEFAULT 1 COMMENT '1 = Activo, 0 = Inactivo',
  `prioridad` int(11) DEFAULT 0 COMMENT 'Orden de visualización (mayor = primero)',
  `tipo_descuento` enum('porcentaje','fijo') DEFAULT 'porcentaje' COMMENT 'Tipo de descuento',
  `monto_minimo` decimal(10,2) DEFAULT NULL COMMENT 'Monto mínimo de compra para aplicar descuento',
  `clicks` int(11) DEFAULT 0 COMMENT 'Contador de clicks en el banner',
  `vistas` int(11) DEFAULT 0 COMMENT 'Contador de vistas del banner',
  `creado_por` int(11) DEFAULT NULL COMMENT 'ID del admin que creó el banner',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Banners promocionales con descuentos por categoría. Gestionable por admin.';

--
-- Volcado de datos para la tabla `banners_descuento`
--

INSERT INTO `banners_descuento` (`banner_id`, `titulo`, `descripcion`, `categoria_id`, `porcentaje_descuento`, `url_imagen_fondo`, `color_fondo`, `color_texto`, `fecha_inicio`, `fecha_fin`, `activo`, `prioridad`, `tipo_descuento`, `monto_minimo`, `clicks`, `vistas`, `creado_por`, `creado_en`, `actualizado_en`) VALUES
(1, '¡Mega Descuento en Dulces! 🍬', 'Todos los chocolates, galletas y golosinas con 25% OFF', 1, 25.00, '/images/banners/banner-dulces.jpg', '#FF6B9D', '#FFFFFF', '2025-11-07 14:38:33', '2025-12-07 14:38:33', 1, 3, 'porcentaje', NULL, 2, 10, NULL, '2025-11-07 19:38:33', '2025-11-07 21:35:36'),
(2, 'Refréscate con 15% de Descuento 🥤', 'Bebidas importadas y Bubble Tea en oferta', 14, 15.00, '/images/banners/banner-bebidas.jpg', '#4ECDC4', '#FFFFFF', '2025-11-07 14:38:33', '2025-11-22 14:38:33', 1, 2, 'porcentaje', NULL, 1, 10, NULL, '2025-11-07 19:38:33', '2025-11-07 21:20:37'),
(3, 'Semana del Ramen 🍜', 'Aprovecha 20% OFF en todos los fideos instantáneos', 10, 20.00, '/images/banners/banner-ramen.jpg', '#FFD93D', '#2D3436', '2025-11-07 14:38:33', '2025-11-14 14:38:33', 1, 1, 'porcentaje', NULL, 2, 13, NULL, '2025-11-07 19:38:33', '2025-11-08 03:50:18'),
(4, '¡Snacks al 30% OFF! 🍿', 'Las mejores papas y piqueos importados', 6, 30.00, '/images/banners/banner-snacks.jpg', '#FFA62B', '#FFFFFF', '2025-11-07 14:38:33', '2025-11-27 14:38:33', 1, 4, 'porcentaje', NULL, 2, 262, NULL, '2025-11-07 19:38:33', '2025-11-08 04:54:10');

--
-- Disparadores `banners_descuento`
--
DELIMITER $$
CREATE TRIGGER `trg_aplicar_descuento_categoria` AFTER INSERT ON `banners_descuento` FOR EACH ROW BEGIN
  -- Solo si el banner está activo y es vigente
  IF NEW.activo = 1 AND NOW() BETWEEN NEW.fecha_inicio AND NEW.fecha_fin THEN
    -- Actualizar precio_descuento de productos de la categoría
    UPDATE productos
    SET precio_descuento = precio * (1 - NEW.porcentaje_descuento / 100)
    WHERE categoria_id = NEW.categoria_id
      AND precio_descuento IS NULL; -- Solo si no tiene descuento previo
  END IF;
END
$$
DELIMITER ;

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
(1, 'Destacados de Dulces', 'Promoción de dulces importados', 'https://i.pinimg.com/1200x/76/a3/c8/76a3c806f18b72096ef2895d5d53fa21.jpg', 300, 1200, 1, '2025-10-22 23:00:41', '2025-10-23 14:40:35', NULL),
(2, 'Ofertas de Bebidas', 'Bebidas refrescantes en oferta', 'https://i.pinimg.com/736x/f0/4e/2c/f04e2ce844798047e94def80052df4ad.jpg', 300, 1200, 1, '2025-10-22 23:00:41', '2025-10-23 14:41:44', NULL),
(3, '', 'Chocolate artesanal importado de Suiza', 'https://i.pinimg.com/736x/a9/2d/33/a92d33cf101c771ce94a118ae5ce0a81.jpg', 0, 0, 1, '2025-10-22 23:46:00', '2025-10-23 14:42:35', 2),
(4, '', 'Ramen instantáneo con sabor picante', 'https://i.pinimg.com/736x/bd/b5/0e/bdb50e8376ce6e5f013d3f6b056eed2d.jpg', 0, 0, 1, '2025-10-22 23:46:00', '2025-10-23 14:37:03', 13),
(5, '', 'Bebida refrescante con perlas de tapioca', 'https://i.pinimg.com/736x/3d/a2/87/3da287601afd51fd2165ddd02f814ed7.jpg', 0, 0, 1, '2025-10-22 23:46:00', '2025-10-23 14:43:06', 15),
(6, '', 'Licor coreano de melocotón', 'https://i.pinimg.com/736x/dc/16/55/dc1655b24c15e8f3ded0209d0fd8f4f8.jpg', 0, 0, 1, '2025-10-22 23:46:00', '2025-10-23 14:46:17', 20),
(8, 'Ofertas de Bebidas', 'Bebidas refrescantes en oferta', 'https://i.pinimg.com/736x/f3/30/82/f3308232b517b77fb9519d4ebd6eaf86.jpg', 300, 1200, 1, '2025-10-22 23:46:06', '2025-10-23 14:47:11', NULL);

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
(1, 'Chocolate Suizo Premium', 'Chocolate artesanal importado de Suiza', 15.50, 13.18, 50, 20, 10, 2, 1, 39, NULL, 'unidades', 'https://i.pinimg.com/1200x/76/a3/c8/76a3c806f18b72096ef2895d5d53fa21.jpg', '2025-10-22 23:00:41', '2025-10-23 14:39:54'),
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
(18, 'Cheetos Flamin Hot', 'Snack picante de queso', 4.50, NULL, 70, 20, 10, 9, 1, 78, NULL, 'bolsa', '/awaiting-image.jpeg', '2025-10-23 04:49:01', '2025-10-23 04:49:01'),
(19, 'Chocolate Suizo Premium', 'Chocolate artesanal importado de Suiza', 15.50, NULL, 50, 20, 10, 2, 1, 0, NULL, NULL, '/images/chocolate_suizo.png', '2025-10-23 15:19:01', '2025-10-23 15:19:01'),
(20, 'Ramen Picante Coreano', 'Ramen instantáneo con sabor picante', 8.99, NULL, 15, 20, 10, 13, 0, 0, NULL, NULL, '/images/ramen_picante.png', '2025-10-23 15:19:01', '2025-10-23 15:19:01');

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

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_banners_activos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_banners_activos` (
`banner_id` int(11)
,`titulo` varchar(200)
,`descripcion` text
,`categoria_id` int(11)
,`categoria_nombre` varchar(100)
,`porcentaje_descuento` decimal(5,2)
,`url_imagen_fondo` varchar(500)
,`color_fondo` varchar(7)
,`color_texto` varchar(7)
,`fecha_inicio` datetime
,`fecha_fin` datetime
,`prioridad` int(11)
,`tipo_descuento` enum('porcentaje','fijo')
,`monto_minimo` decimal(10,2)
,`clicks` int(11)
,`vistas` int(11)
,`dias_restantes` int(7)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `v_banners_activos`
--
DROP TABLE IF EXISTS `v_banners_activos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_banners_activos`  AS SELECT `b`.`banner_id` AS `banner_id`, `b`.`titulo` AS `titulo`, `b`.`descripcion` AS `descripcion`, `b`.`categoria_id` AS `categoria_id`, `c`.`nombre` AS `categoria_nombre`, `b`.`porcentaje_descuento` AS `porcentaje_descuento`, `b`.`url_imagen_fondo` AS `url_imagen_fondo`, `b`.`color_fondo` AS `color_fondo`, `b`.`color_texto` AS `color_texto`, `b`.`fecha_inicio` AS `fecha_inicio`, `b`.`fecha_fin` AS `fecha_fin`, `b`.`prioridad` AS `prioridad`, `b`.`tipo_descuento` AS `tipo_descuento`, `b`.`monto_minimo` AS `monto_minimo`, `b`.`clicks` AS `clicks`, `b`.`vistas` AS `vistas`, to_days(`b`.`fecha_fin`) - to_days(current_timestamp()) AS `dias_restantes` FROM (`banners_descuento` `b` join `categorias` `c` on(`b`.`categoria_id` = `c`.`categoria_id`)) WHERE `b`.`activo` = 1 AND current_timestamp() between `b`.`fecha_inicio` and `b`.`fecha_fin` ORDER BY `b`.`prioridad` DESC, `b`.`fecha_fin` ASC ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `banners_descuento`
--
ALTER TABLE `banners_descuento`
  ADD PRIMARY KEY (`banner_id`),
  ADD KEY `idx_categoria_descuento` (`categoria_id`),
  ADD KEY `idx_activo_fechas` (`activo`,`fecha_inicio`,`fecha_fin`),
  ADD KEY `idx_prioridad` (`prioridad`),
  ADD KEY `idx_banner_activo_vigente` (`activo`,`fecha_inicio`,`fecha_fin`,`prioridad`);

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
-- AUTO_INCREMENT de la tabla `banners_descuento`
--
ALTER TABLE `banners_descuento`
  MODIFY `banner_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
  MODIFY `producto_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `usuario_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `banners_descuento`
--
ALTER TABLE `banners_descuento`
  ADD CONSTRAINT `fk_banner_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`categoria_id`) ON DELETE CASCADE;

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
