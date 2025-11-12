-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-11-2025 a las 01:55:22
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
(4, '¡Snacks al 30% OFF! 🍿', 'Las mejores papas y piqueos importados', 6, 30.00, '/images/banners/banner-snacks.jpg', '#FFA62B', '#FFFFFF', '2025-11-07 14:38:33', '2025-11-27 14:38:33', 1, 4, 'porcentaje', NULL, 2, 290, NULL, '2025-11-07 19:38:33', '2025-11-10 00:15:13');

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
-- Estructura de tabla para la tabla `carritos`
--

CREATE TABLE `carritos` (
  `carrito_id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `sesion_temporal` varchar(100) DEFAULT NULL COMMENT 'Para usuarios no logueados',
  `estado` enum('activo','abandonado','procesando','completado','cancelado') DEFAULT 'activo',
  `subtotal` decimal(10,2) DEFAULT 0.00,
  `descuento_total` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) DEFAULT 0.00,
  `notas_cliente` text DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `convertido_venta_id` int(11) DEFAULT NULL COMMENT 'ID de venta si se completó'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito_items`
--

CREATE TABLE `carrito_items` (
  `item_id` int(11) NOT NULL,
  `carrito_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `precio_unitario` decimal(10,2) NOT NULL,
  `precio_descuento` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS (`cantidad` * coalesce(`precio_descuento`,`precio_unitario`)) STORED,
  `agregado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `carrito_items`
--
DELIMITER $$
CREATE TRIGGER `trg_actualizar_total_carrito_after_delete` AFTER DELETE ON `carrito_items` FOR EACH ROW BEGIN
  UPDATE carritos
  SET 
    subtotal = COALESCE((
      SELECT SUM(cantidad * precio_unitario)
      FROM carrito_items
      WHERE carrito_id = OLD.carrito_id
    ), 0),
    descuento_total = COALESCE((
      SELECT SUM(
        cantidad * (precio_unitario - COALESCE(precio_descuento, precio_unitario))
      )
      FROM carrito_items
      WHERE carrito_id = OLD.carrito_id
    ), 0),
    total = COALESCE((
      SELECT SUM(cantidad * COALESCE(precio_descuento, precio_unitario))
      FROM carrito_items
      WHERE carrito_id = OLD.carrito_id
    ), 0)
  WHERE carrito_id = OLD.carrito_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_actualizar_total_carrito_after_insert` AFTER INSERT ON `carrito_items` FOR EACH ROW BEGIN
  UPDATE carritos
  SET 
    subtotal = (
      SELECT SUM(cantidad * precio_unitario)
      FROM carrito_items
      WHERE carrito_id = NEW.carrito_id
    ),
    descuento_total = (
      SELECT SUM(
        cantidad * (precio_unitario - COALESCE(precio_descuento, precio_unitario))
      )
      FROM carrito_items
      WHERE carrito_id = NEW.carrito_id
    ),
    total = (
      SELECT SUM(cantidad * COALESCE(precio_descuento, precio_unitario))
      FROM carrito_items
      WHERE carrito_id = NEW.carrito_id
    )
  WHERE carrito_id = NEW.carrito_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_actualizar_total_carrito_after_update` AFTER UPDATE ON `carrito_items` FOR EACH ROW BEGIN
  UPDATE carritos
  SET 
    subtotal = (
      SELECT SUM(cantidad * precio_unitario)
      FROM carrito_items
      WHERE carrito_id = NEW.carrito_id
    ),
    descuento_total = (
      SELECT SUM(
        cantidad * (precio_unitario - COALESCE(precio_descuento, precio_unitario))
      )
      FROM carrito_items
      WHERE carrito_id = NEW.carrito_id
    ),
    total = (
      SELECT SUM(cantidad * COALESCE(precio_descuento, precio_unitario))
      FROM carrito_items
      WHERE carrito_id = NEW.carrito_id
    )
  WHERE carrito_id = NEW.carrito_id;
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
  `creado_en` datetime DEFAULT NULL,
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`categoria_id`, `nombre`, `padre_id`, `creado_en`, `actualizado_en`) VALUES
(1, 'Dulces', NULL, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(2, 'Chocolates', 1, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(3, 'Galletas', 1, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(4, 'Caramelos', 1, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(5, 'Gomitas', 1, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(6, 'Snacks', NULL, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(7, 'Papas fritas', 6, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(8, 'Piqueos', 6, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(9, 'Salados', 6, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(10, 'Ramen y Fideos', NULL, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(11, 'Instantáneo', 10, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(12, 'Premium', 10, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(13, 'Picante', 10, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(14, 'Bebidas', NULL, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(15, 'Bubble Tea', 14, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(16, 'Refrescos importados', 14, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(17, 'Energizantes', 14, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(18, 'Licores', NULL, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(19, 'Sake', 18, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(20, 'Soju', 18, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(21, 'Whisky importado', 18, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(22, 'Vinos', 18, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(23, 'Otros importados', NULL, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(24, 'Salsas', 23, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(25, 'Condimentos', 23, '2025-10-22 18:00:41', '2025-10-22 18:00:41'),
(26, 'Productos gourmet', 23, '2025-10-22 18:00:41', '2025-10-22 18:00:41');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `eventos_navegacion`
--

CREATE TABLE `eventos_navegacion` (
  `evento_id` int(11) NOT NULL,
  `tracking_id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `tipo_evento` enum('view_product','add_to_cart','remove_from_cart','view_category','search','click_banner','checkout_start','checkout_complete') NOT NULL,
  `producto_id` int(11) DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `termino_busqueda` varchar(255) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Datos adicionales del evento' CHECK (json_valid(`metadata`)),
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `perfil_preferencias`
--

CREATE TABLE `perfil_preferencias` (
  `preferencia_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `como_nos_conocio` varchar(100) DEFAULT NULL,
  `frecuencia_compra` enum('primera_vez','mensual','trimestral','ocasional') DEFAULT NULL,
  `rango_presupuesto` enum('hasta_50','50_100','100_250','250_500','mas_500') DEFAULT NULL,
  `acepta_marketing` tinyint(1) DEFAULT 1,
  `acepta_whatsapp` tinyint(1) DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `rol_id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `permisos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Permisos específicos del rol' CHECK (json_valid(`permisos`)),
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`rol_id`, `nombre`, `descripcion`, `permisos`, `creado_en`, `actualizado_en`) VALUES
(1, 'super_admin', 'Administrador con acceso total al sistema', '{\"productos\": [\"crear\", \"editar\", \"eliminar\", \"ver\"], \"usuarios\": [\"crear\", \"editar\", \"eliminar\", \"ver\"], \"ventas\": [\"ver\", \"modificar\", \"eliminar\"], \"reportes\": [\"ver\", \"exportar\"], \"configuracion\": [\"ver\", \"modificar\"], \"carruseles\": [\"crear\", \"editar\", \"eliminar\"], \"banners\": [\"crear\", \"editar\", \"eliminar\"]}', '2025-11-09 17:48:02', '2025-11-09 17:48:02'),
(2, 'vendedor', 'Gestiona ventas y carritos de clientes', '{\"productos\": [\"ver\"], \"ventas\": [\"ver\", \"crear\", \"modificar\"], \"carritos\": [\"ver\", \"modificar\", \"confirmar\"], \"clientes\": [\"ver\"], \"reportes\": [\"ver\"]}', '2025-11-09 17:48:02', '2025-11-09 17:48:02'),
(3, 'almacenero', 'Gestiona inventario y stock', '{\"productos\": [\"ver\", \"editar\"], \"stock\": [\"ver\", \"modificar\"], \"alertas\": [\"ver\", \"gestionar\"], \"carruseles\": [\"crear\", \"editar\"], \"banners\": [\"crear\", \"editar\"], \"reportes\": [\"ver\"]}', '2025-11-09 17:48:02', '2025-11-09 17:48:02'),
(4, 'cliente', 'Usuario final que realiza compras', '{\"productos\": [\"ver\"], \"carrito\": [\"ver\", \"modificar\"], \"compras\": [\"ver\"], \"perfil\": [\"ver\", \"editar\"]}', '2025-11-09 17:48:02', '2025-11-09 17:48:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesiones_tracking`
--

CREATE TABLE `sesiones_tracking` (
  `tracking_id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `sesion_temporal` varchar(100) DEFAULT NULL COMMENT 'Para usuarios no logueados',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `dispositivo` enum('mobile','desktop','tablet') DEFAULT NULL,
  `navegador` varchar(100) DEFAULT NULL,
  `sistema_operativo` varchar(100) DEFAULT NULL,
  `resolucion_pantalla` varchar(20) DEFAULT NULL,
  `fuente_trafico` varchar(100) DEFAULT NULL COMMENT 'utm_source',
  `medio_trafico` varchar(100) DEFAULT NULL COMMENT 'utm_medium',
  `campania` varchar(100) DEFAULT NULL COMMENT 'utm_campaign',
  `referrer` text DEFAULT NULL,
  `pagina_entrada` varchar(500) DEFAULT NULL,
  `fecha_sesion` timestamp NOT NULL DEFAULT current_timestamp(),
  `duracion_sesion` int(11) DEFAULT NULL COMMENT 'En segundos'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesiones_usuario`
--

CREATE TABLE `sesiones_usuario` (
  `sesion_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `token_sesion` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `fecha_inicio` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_expiracion` timestamp NULL DEFAULT NULL,
  `activa` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `usuario_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `auth_provider` enum('manual','google') DEFAULT 'manual',
  `google_id` varchar(255) DEFAULT NULL,
  `foto_perfil_url` varchar(500) DEFAULT NULL,
  `creado_en` datetime DEFAULT NULL,
  `actualizado_en` datetime DEFAULT NULL,
  `rol_id` int(11) DEFAULT 4 COMMENT '4=cliente por defecto',
  `nombre_completo` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `distrito` varchar(100) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT 'Huánuco',
  `pais` varchar(100) DEFAULT 'Perú',
  `departamento` varchar(100) DEFAULT 'Huánuco',
  `codigo_postal` varchar(10) DEFAULT NULL,
  `documento_tipo` enum('DNI','RUC','CE') DEFAULT 'DNI',
  `documento_numero` varchar(20) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `genero` enum('M','F','Otro','Prefiero no decir') DEFAULT NULL,
  `estado` enum('activo','inactivo','bloqueado') DEFAULT 'activo',
  `email_verificado` tinyint(1) DEFAULT 0,
  `telefono_verificado` tinyint(1) DEFAULT 0,
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `intentos_fallidos` int(11) DEFAULT 0,
  `bloqueado_hasta` timestamp NULL DEFAULT NULL,
  `como_nos_conocio` varchar(100) DEFAULT NULL COMMENT 'Canal de adquisición',
  `categorias_interes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array de IDs de categorías' CHECK (json_valid(`categorias_interes`)),
  `frecuencia_compra` enum('primera_vez','mensual','trimestral','ocasional') DEFAULT NULL,
  `rango_presupuesto` enum('hasta_50','50_100','100_250','250_500','mas_500') DEFAULT NULL,
  `perfil_completado` tinyint(1) DEFAULT 0 COMMENT 'Si completó datos adicionales'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`usuario_id`, `email`, `password`, `auth_provider`, `google_id`, `foto_perfil_url`, `creado_en`, `actualizado_en`, `rol_id`, `nombre_completo`, `telefono`, `direccion`, `distrito`, `ciudad`, `pais`, `departamento`, `codigo_postal`, `documento_tipo`, `documento_numero`, `fecha_nacimiento`, `genero`, `estado`, `email_verificado`, `telefono_verificado`, `ultimo_acceso`, `intentos_fallidos`, `bloqueado_hasta`, `como_nos_conocio`, `categorias_interes`, `frecuencia_compra`, `rango_presupuesto`, `perfil_completado`) VALUES
(1, 'admin@qhatu.com', '$2b$10$8uAQOLU3fcDjUIhVm6.j8.Kzl.jNfqdcm3nPqFf/LcVw6Kbj/mrE2', 'manual', NULL, NULL, NULL, '2025-11-09 18:24:58', 1, 'Administrador Principal', '962000001', 'Av. Alameda de la República 123', 'Huánuco', 'Huánuco', 'Perú', 'Huánuco', NULL, 'DNI', '70000001', NULL, NULL, 'activo', 1, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0),
(2, 'vendedor@qhatu.com', '$2b$10$qXzEjQKm3JvobHGiIUmoRuTWJbwxjzygCd.eGRinYQwZ27KDGLlAC', 'manual', NULL, NULL, '2025-11-09 18:23:50', '2025-11-09 18:23:50', 2, 'María Vendedora', '962000002', 'Jr. Dos de Mayo 456', 'Huánuco', 'Huánuco', 'Perú', 'Huánuco', NULL, 'DNI', '70000002', NULL, NULL, 'activo', 1, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0),
(3, 'almacenero@qhatu.com', '$2b$10$BsXYzeA6Rqp6iNThzEASm.cUdftfAsH5k2ySP9QdL2CM4jxHEMAIu', 'manual', NULL, NULL, '2025-11-09 18:23:50', '2025-11-09 18:23:50', 3, 'Carlos Almacenero', '962000003', 'Av. 28 de Julio 789', 'Huánuco', 'Huánuco', 'Perú', 'Huánuco', NULL, 'DNI', '70000003', NULL, NULL, 'activo', 1, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0),
(4, 'cliente@qhatu.com', '$2b$10$PLFM53I7OyWYsC4wSq8oM.tBq7N9hY7vnRgrtK79LMGYs4qbIsgLe', 'manual', NULL, NULL, '2025-11-09 18:23:50', '2025-11-09 18:23:50', 4, 'Ana Cliente', '962000004', 'Jr. Progreso 321', 'Huánuco', 'Huánuco', 'Perú', 'Huánuco', NULL, 'DNI', '70000004', NULL, NULL, 'activo', 1, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0),
(5, 'cliente2@qhatu.com', '$2b$10$pAka.I9DBHj1bKuz8ecyqeHsqygzp/YPrE.VgIjWgageefHZ2uZX2', 'manual', NULL, NULL, '2025-11-09 18:23:50', '2025-11-09 18:23:50', 4, 'Pedro Cliente', '962000005', 'Av. Universitaria 555', 'Amarilis', 'Huánuco', 'Perú', 'Huánuco', NULL, 'DNI', '70000005', NULL, NULL, 'activo', 1, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_categorias_interes`
--

CREATE TABLE `usuario_categorias_interes` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `categoria_id` int(11) NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `venta_id` int(11) NOT NULL,
  `carrito_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `vendedor_id` int(11) DEFAULT NULL COMMENT 'Usuario con rol vendedor que procesó',
  `numero_venta` varchar(50) NOT NULL COMMENT 'VEN-YYYYMMDD-XXXX',
  `cliente_nombre` varchar(255) DEFAULT NULL,
  `cliente_email` varchar(255) DEFAULT NULL,
  `cliente_telefono` varchar(20) DEFAULT NULL,
  `cliente_direccion` text DEFAULT NULL,
  `cliente_distrito` varchar(100) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `descuento_total` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','confirmada','en_preparacion','lista_entrega','en_camino','entregada','cancelada') DEFAULT 'pendiente',
  `metodo_pago` enum('whatsapp_pago','yape','plin','transferencia','efectivo') DEFAULT 'whatsapp_pago',
  `comprobante_pago` varchar(255) DEFAULT NULL COMMENT 'URL del comprobante subido',
  `notas_venta` text DEFAULT NULL,
  `notas_vendedor` text DEFAULT NULL,
  `notas_entrega` text DEFAULT NULL,
  `pdf_url` varchar(500) DEFAULT NULL,
  `fecha_venta` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_confirmacion` timestamp NULL DEFAULT NULL,
  `fecha_entrega` timestamp NULL DEFAULT NULL,
  `fecha_cancelacion` timestamp NULL DEFAULT NULL,
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `ventas`
--
DELIMITER $$
CREATE TRIGGER `trg_venta_historial_update` AFTER UPDATE ON `ventas` FOR EACH ROW BEGIN
  IF OLD.estado != NEW.estado THEN
    INSERT INTO venta_historial (
      venta_id, 
      usuario_id, 
      accion, 
      estado_anterior, 
      estado_nuevo, 
      descripcion
    )
    VALUES (
      NEW.venta_id,
      NEW.vendedor_id,
      'cambio_estado',
      OLD.estado,
      NEW.estado,
      CONCAT('Estado cambiado de ', OLD.estado, ' a ', NEW.estado)
    );
  END IF;  -- ¡¡Este END IF faltaba!!
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `venta_historial`
--

CREATE TABLE `venta_historial` (
  `historial_id` int(11) NOT NULL,
  `venta_id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `accion` varchar(100) NOT NULL,
  `estado_anterior` varchar(50) DEFAULT NULL,
  `estado_nuevo` varchar(50) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `metadatos` text DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `venta_items`
--

CREATE TABLE `venta_items` (
  `item_id` int(11) NOT NULL,
  `venta_id` int(11) NOT NULL,
  `producto_id` int(11) DEFAULT NULL,
  `producto_nombre` varchar(255) NOT NULL,
  `producto_descripcion` text DEFAULT NULL,
  `producto_imagen` varchar(500) DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `precio_descuento` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL
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
-- Estructura Stand-in para la vista `v_usuarios_analisis`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_usuarios_analisis` (
`usuario_id` int(11)
,`email` varchar(255)
,`nombre_completo` varchar(255)
,`auth_provider` enum('manual','google')
,`telefono` varchar(20)
,`ciudad` varchar(100)
,`departamento` varchar(100)
,`pais` varchar(100)
,`genero` enum('M','F','Otro','Prefiero no decir')
,`fecha_nacimiento` date
,`edad` bigint(21)
,`como_nos_conocio` varchar(100)
,`frecuencia_compra` enum('primera_vez','mensual','trimestral','ocasional')
,`rango_presupuesto` enum('hasta_50','50_100','100_250','250_500','mas_500')
,`perfil_completado` tinyint(1)
,`creado_en` datetime
,`ultimo_acceso` timestamp
,`rol_nombre` varchar(50)
,`total_compras` bigint(21)
,`valor_total_compras` decimal(32,2)
,`ticket_promedio` decimal(14,6)
,`ultima_compra` timestamp
,`dias_desde_ultima_compra` int(7)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_ventas_pendientes`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_ventas_pendientes` (
`venta_id` int(11)
,`numero_venta` varchar(50)
,`cliente_nombre` varchar(255)
,`cliente_telefono` varchar(20)
,`total` decimal(10,2)
,`estado` enum('pendiente','confirmada','en_preparacion','lista_entrega','en_camino','entregada','cancelada')
,`fecha_venta` timestamp
,`total_items` bigint(21)
,`vendedor_nombre` varchar(255)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `v_banners_activos`
--
DROP TABLE IF EXISTS `v_banners_activos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_banners_activos`  AS SELECT `b`.`banner_id` AS `banner_id`, `b`.`titulo` AS `titulo`, `b`.`descripcion` AS `descripcion`, `b`.`categoria_id` AS `categoria_id`, `c`.`nombre` AS `categoria_nombre`, `b`.`porcentaje_descuento` AS `porcentaje_descuento`, `b`.`url_imagen_fondo` AS `url_imagen_fondo`, `b`.`color_fondo` AS `color_fondo`, `b`.`color_texto` AS `color_texto`, `b`.`fecha_inicio` AS `fecha_inicio`, `b`.`fecha_fin` AS `fecha_fin`, `b`.`prioridad` AS `prioridad`, `b`.`tipo_descuento` AS `tipo_descuento`, `b`.`monto_minimo` AS `monto_minimo`, `b`.`clicks` AS `clicks`, `b`.`vistas` AS `vistas`, to_days(`b`.`fecha_fin`) - to_days(current_timestamp()) AS `dias_restantes` FROM (`banners_descuento` `b` join `categorias` `c` on(`b`.`categoria_id` = `c`.`categoria_id`)) WHERE `b`.`activo` = 1 AND current_timestamp() between `b`.`fecha_inicio` and `b`.`fecha_fin` ORDER BY `b`.`prioridad` DESC, `b`.`fecha_fin` ASC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_usuarios_analisis`
--
DROP TABLE IF EXISTS `v_usuarios_analisis`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_usuarios_analisis`  AS SELECT `u`.`usuario_id` AS `usuario_id`, `u`.`email` AS `email`, `u`.`nombre_completo` AS `nombre_completo`, `u`.`auth_provider` AS `auth_provider`, `u`.`telefono` AS `telefono`, `u`.`ciudad` AS `ciudad`, `u`.`departamento` AS `departamento`, `u`.`pais` AS `pais`, `u`.`genero` AS `genero`, `u`.`fecha_nacimiento` AS `fecha_nacimiento`, timestampdiff(YEAR,`u`.`fecha_nacimiento`,curdate()) AS `edad`, `u`.`como_nos_conocio` AS `como_nos_conocio`, `u`.`frecuencia_compra` AS `frecuencia_compra`, `u`.`rango_presupuesto` AS `rango_presupuesto`, `u`.`perfil_completado` AS `perfil_completado`, `u`.`creado_en` AS `creado_en`, `u`.`ultimo_acceso` AS `ultimo_acceso`, `r`.`nombre` AS `rol_nombre`, count(distinct `v`.`venta_id`) AS `total_compras`, coalesce(sum(`v`.`total`),0) AS `valor_total_compras`, coalesce(avg(`v`.`total`),0) AS `ticket_promedio`, max(`v`.`fecha_venta`) AS `ultima_compra`, to_days(current_timestamp()) - to_days(max(`v`.`fecha_venta`)) AS `dias_desde_ultima_compra` FROM ((`usuarios` `u` left join `roles` `r` on(`u`.`rol_id` = `r`.`rol_id`)) left join `ventas` `v` on(`u`.`usuario_id` = `v`.`usuario_id` and `v`.`estado` = 'entregada')) GROUP BY `u`.`usuario_id` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_ventas_pendientes`
--
DROP TABLE IF EXISTS `v_ventas_pendientes`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_ventas_pendientes`  AS SELECT `v`.`venta_id` AS `venta_id`, `v`.`numero_venta` AS `numero_venta`, `v`.`cliente_nombre` AS `cliente_nombre`, `v`.`cliente_telefono` AS `cliente_telefono`, `v`.`total` AS `total`, `v`.`estado` AS `estado`, `v`.`fecha_venta` AS `fecha_venta`, count(`vi`.`item_id`) AS `total_items`, `u`.`nombre_completo` AS `vendedor_nombre` FROM ((`ventas` `v` left join `venta_items` `vi` on(`v`.`venta_id` = `vi`.`venta_id`)) left join `usuarios` `u` on(`v`.`vendedor_id` = `u`.`usuario_id`)) WHERE `v`.`estado` in ('pendiente','confirmada','en_preparacion') GROUP BY `v`.`venta_id`, `v`.`numero_venta`, `v`.`cliente_nombre`, `v`.`cliente_telefono`, `v`.`total`, `v`.`estado`, `v`.`fecha_venta`, `u`.`nombre_completo` ORDER BY `v`.`fecha_venta` DESC ;

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
-- Indices de la tabla `carritos`
--
ALTER TABLE `carritos`
  ADD PRIMARY KEY (`carrito_id`),
  ADD KEY `idx_usuario_estado` (`usuario_id`,`estado`),
  ADD KEY `idx_sesion` (`sesion_temporal`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_carritos_actualizado` (`actualizado_en`);

--
-- Indices de la tabla `carrito_items`
--
ALTER TABLE `carrito_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `idx_carrito` (`carrito_id`),
  ADD KEY `idx_producto` (`producto_id`);

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
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD UNIQUE KEY `nombre_2` (`nombre`),
  ADD UNIQUE KEY `nombre_3` (`nombre`),
  ADD UNIQUE KEY `nombre_4` (`nombre`),
  ADD UNIQUE KEY `nombre_5` (`nombre`),
  ADD UNIQUE KEY `nombre_6` (`nombre`),
  ADD UNIQUE KEY `nombre_7` (`nombre`),
  ADD KEY `idx_nombre_categoria` (`nombre`),
  ADD KEY `idx_padre_id` (`padre_id`);

--
-- Indices de la tabla `eventos_navegacion`
--
ALTER TABLE `eventos_navegacion`
  ADD PRIMARY KEY (`evento_id`),
  ADD KEY `producto_id` (`producto_id`),
  ADD KEY `categoria_id` (`categoria_id`),
  ADD KEY `idx_usuario_evento` (`usuario_id`,`tipo_evento`,`timestamp`),
  ADD KEY `idx_tracking` (`tracking_id`,`timestamp`);

--
-- Indices de la tabla `perfil_preferencias`
--
ALTER TABLE `perfil_preferencias`
  ADD PRIMARY KEY (`preferencia_id`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`);

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
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`rol_id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `sesiones_tracking`
--
ALTER TABLE `sesiones_tracking`
  ADD PRIMARY KEY (`tracking_id`),
  ADD KEY `idx_usuario_fecha` (`usuario_id`,`fecha_sesion`),
  ADD KEY `idx_sesion_temporal` (`sesion_temporal`),
  ADD KEY `idx_fuente_trafico` (`fuente_trafico`,`medio_trafico`);

--
-- Indices de la tabla `sesiones_usuario`
--
ALTER TABLE `sesiones_usuario`
  ADD PRIMARY KEY (`sesion_id`),
  ADD UNIQUE KEY `token_sesion` (`token_sesion`),
  ADD KEY `idx_usuario_activa` (`usuario_id`,`activa`),
  ADD KEY `idx_token` (`token_sesion`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`usuario_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `google_id` (`google_id`),
  ADD KEY `idx_usuarios_rol` (`rol_id`,`estado`);

--
-- Indices de la tabla `usuario_categorias_interes`
--
ALTER TABLE `usuario_categorias_interes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_usuario_categoria` (`usuario_id`,`categoria_id`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`venta_id`),
  ADD UNIQUE KEY `numero_venta` (`numero_venta`),
  ADD KEY `carrito_id` (`carrito_id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_vendedor` (`vendedor_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_fecha` (`fecha_venta`),
  ADD KEY `idx_numero` (`numero_venta`),
  ADD KEY `idx_ventas_fecha_estado` (`fecha_venta`,`estado`);

--
-- Indices de la tabla `venta_historial`
--
ALTER TABLE `venta_historial`
  ADD PRIMARY KEY (`historial_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_venta` (`venta_id`),
  ADD KEY `idx_fecha` (`fecha`);

--
-- Indices de la tabla `venta_items`
--
ALTER TABLE `venta_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `idx_venta` (`venta_id`),
  ADD KEY `idx_producto` (`producto_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `banners_descuento`
--
ALTER TABLE `banners_descuento`
  MODIFY `banner_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `carritos`
--
ALTER TABLE `carritos`
  MODIFY `carrito_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `carrito_items`
--
ALTER TABLE `carrito_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT de la tabla `eventos_navegacion`
--
ALTER TABLE `eventos_navegacion`
  MODIFY `evento_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `perfil_preferencias`
--
ALTER TABLE `perfil_preferencias`
  MODIFY `preferencia_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `producto_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `rol_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `sesiones_tracking`
--
ALTER TABLE `sesiones_tracking`
  MODIFY `tracking_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `sesiones_usuario`
--
ALTER TABLE `sesiones_usuario`
  MODIFY `sesion_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `usuario_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `usuario_categorias_interes`
--
ALTER TABLE `usuario_categorias_interes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `venta_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `venta_historial`
--
ALTER TABLE `venta_historial`
  MODIFY `historial_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `venta_items`
--
ALTER TABLE `venta_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `banners_descuento`
--
ALTER TABLE `banners_descuento`
  ADD CONSTRAINT `fk_banner_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`categoria_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `carritos`
--
ALTER TABLE `carritos`
  ADD CONSTRAINT `carritos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `carrito_items`
--
ALTER TABLE `carrito_items`
  ADD CONSTRAINT `carrito_items_ibfk_1` FOREIGN KEY (`carrito_id`) REFERENCES `carritos` (`carrito_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `carrito_items_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`producto_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `carruseles`
--
ALTER TABLE `carruseles`
  ADD CONSTRAINT `fk_carrusel_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`categoria_id`);

--
-- Filtros para la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD CONSTRAINT `categorias_ibfk_1` FOREIGN KEY (`padre_id`) REFERENCES `categorias` (`categoria_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `eventos_navegacion`
--
ALTER TABLE `eventos_navegacion`
  ADD CONSTRAINT `eventos_navegacion_ibfk_1` FOREIGN KEY (`tracking_id`) REFERENCES `sesiones_tracking` (`tracking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `eventos_navegacion_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `eventos_navegacion_ibfk_3` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`producto_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `eventos_navegacion_ibfk_4` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`categoria_id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `perfil_preferencias`
--
ALTER TABLE `perfil_preferencias`
  ADD CONSTRAINT `perfil_preferencias_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`categoria_id`);

--
-- Filtros para la tabla `sesiones_tracking`
--
ALTER TABLE `sesiones_tracking`
  ADD CONSTRAINT `sesiones_tracking_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `sesiones_usuario`
--
ALTER TABLE `sesiones_usuario`
  ADD CONSTRAINT `sesiones_usuario_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`rol_id`),
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`rol_id`);

--
-- Filtros para la tabla `usuario_categorias_interes`
--
ALTER TABLE `usuario_categorias_interes`
  ADD CONSTRAINT `usuario_categorias_interes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `usuario_categorias_interes_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`categoria_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`carrito_id`) REFERENCES `carritos` (`carrito_id`),
  ADD CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`),
  ADD CONSTRAINT `ventas_ibfk_3` FOREIGN KEY (`vendedor_id`) REFERENCES `usuarios` (`usuario_id`);

--
-- Filtros para la tabla `venta_historial`
--
ALTER TABLE `venta_historial`
  ADD CONSTRAINT `venta_historial_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`venta_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `venta_historial_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `venta_items`
--
ALTER TABLE `venta_items`
  ADD CONSTRAINT `venta_items_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`venta_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `venta_items_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`producto_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
