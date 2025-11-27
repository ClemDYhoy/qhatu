-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 27-11-2025 a las 22:41:12
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_metricas_vendedor` (IN `p_vendedor_id` INT, IN `p_fecha` DATE)   BEGIN
  INSERT INTO metricas_vendedores (
    vendedor_id, fecha,
    total_ventas, ventas_confirmadas,
    monto_total_vendido, ticket_promedio,
    productos_vendidos, clientes_atendidos
  )
  SELECT 
    p_vendedor_id,
    p_fecha,
    COUNT(*) AS total_ventas,
    COUNT(*) AS ventas_confirmadas,
    SUM(total) AS monto_total,
    AVG(total) AS ticket_avg,
    SUM(cantidad_items) AS productos,
    COUNT(DISTINCT cliente_id) AS clientes
  FROM ventas_realizadas
  WHERE vendedor_id = p_vendedor_id
    AND DATE(fecha_venta) = p_fecha
  ON DUPLICATE KEY UPDATE
    total_ventas = VALUES(total_ventas),
    ventas_confirmadas = VALUES(ventas_confirmadas),
    monto_total_vendido = VALUES(monto_total_vendido),
    ticket_promedio = VALUES(ticket_promedio),
    productos_vendidos = VALUES(productos_vendidos),
    clientes_atendidos = VALUES(clientes_atendidos);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_confirmar_venta_completa` (IN `p_venta_id` INT, IN `p_vendedor_id` INT)   BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'Error al confirmar la venta' AS resultado;
    END;
    
    START TRANSACTION;
    
    -- Actualizar la venta principal
    UPDATE ventas 
    SET estado = 'confirmada', 
        vendedor_id = p_vendedor_id,
        fecha_confirmacion = NOW()
    WHERE venta_id = p_venta_id AND estado = 'pendiente';
    
    -- Insertar en ventas_realizadas
    INSERT INTO ventas_realizadas (
        venta_id, numero_venta, cliente_id, cliente_nombre, 
        cliente_email, cliente_telefono, cliente_tipo, 
        vendedor_id, vendedor_nombre, subtotal, descuento_total, 
        total, metodo_pago, cantidad_productos, cantidad_items,
        hora_venta, dia_semana, mes, anio, trimestre,
        ciudad, distrito, departamento, fecha_venta, fecha_confirmacion
    )
    SELECT 
        v.venta_id,
        v.numero_venta,
        v.usuario_id,
        COALESCE(v.cliente_nombre, 'Cliente'),
        COALESCE(v.cliente_email, 'sin-email@qhatu.com'),
        COALESCE(v.cliente_telefono, 'Sin teléfono'),
        CASE WHEN v.usuario_id IS NULL THEN 'invitado' ELSE 'registrado' END,
        p_vendedor_id,
        COALESCE(u.nombre_completo, 'Sistema'),
        COALESCE(v.subtotal, 0),
        COALESCE(v.descuento_total, 0),
        COALESCE(v.total, 0),
        COALESCE(v.metodo_pago, 'whatsapp_pago'),
        (SELECT COUNT(DISTINCT producto_id) FROM venta_items WHERE venta_id = v.venta_id),
        (SELECT COALESCE(SUM(cantidad), 0) FROM venta_items WHERE venta_id = v.venta_id),
        TIME(NOW()),
        DAYOFWEEK(NOW()),
        MONTH(NOW()),
        YEAR(NOW()),
        QUARTER(NOW()),
        'Huánuco',
        COALESCE(v.cliente_distrito, 'Huánuco'),
        'Huánuco',
        v.fecha_venta,
        NOW()
    FROM ventas v
    LEFT JOIN usuarios u ON u.usuario_id = p_vendedor_id
    WHERE v.venta_id = p_venta_id;
    
    -- Insertar items de la venta
    INSERT INTO ventas_realizadas_items (
        venta_realizada_id, producto_id, producto_nombre, producto_codigo,
        categoria_id, categoria_nombre, cantidad, precio_unitario,
        precio_descuento, precio_final, subtotal, descuento_porcentaje,
        descuento_monto, stock_antes, stock_despues
    )
    SELECT 
        LAST_INSERT_ID(),
        vi.producto_id,
        vi.producto_nombre,
        CAST(vi.producto_id AS CHAR),
        p.categoria_id,
        COALESCE(c.nombre, 'General'),
        vi.cantidad,
        vi.precio_unitario,
        vi.precio_descuento,
        COALESCE(vi.precio_descuento, vi.precio_unitario),
        vi.subtotal,
        CASE 
            WHEN vi.precio_descuento IS NOT NULL AND vi.precio_descuento < vi.precio_unitario
            THEN ROUND(((vi.precio_unitario - vi.precio_descuento) / vi.precio_unitario * 100), 2)
            ELSE NULL 
        END,
        CASE 
            WHEN vi.precio_descuento IS NOT NULL AND vi.precio_descuento < vi.precio_unitario
            THEN (vi.precio_unitario - vi.precio_descuento) * vi.cantidad
            ELSE 0 
        END,
        COALESCE(p.stock + vi.cantidad, 0),
        COALESCE(p.stock, 0)
    FROM venta_items vi
    LEFT JOIN productos p ON vi.producto_id = p.producto_id
    LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
    WHERE vi.venta_id = p_venta_id;
    
    COMMIT;
    SELECT 'Venta confirmada exitosamente' AS resultado;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_venta_realizada` (IN `p_venta_id` INT, IN `p_vendedor_id` INT)   BEGIN
    DECLARE v_estado_actual VARCHAR(50);
    DECLARE v_numero_venta VARCHAR(20);
    DECLARE v_usuario_id INT;
    DECLARE v_cliente_nombre VARCHAR(255);
    DECLARE v_cliente_email VARCHAR(255);
    DECLARE v_cliente_telefono VARCHAR(20);
    DECLARE v_cliente_distrito VARCHAR(100);
    DECLARE v_subtotal DECIMAL(10,2);
    DECLARE v_descuento_total DECIMAL(10,2);
    DECLARE v_total DECIMAL(10,2);
    DECLARE v_metodo_pago VARCHAR(50);
    DECLARE v_fecha_venta DATETIME;
    DECLARE v_cantidad_productos INT;
    DECLARE v_cantidad_items INT;
    DECLARE v_vendedor_nombre VARCHAR(255);
    
    -- Obtener datos de la venta
    SELECT 
        estado, numero_venta, usuario_id, cliente_nombre,
        cliente_email, cliente_telefono, cliente_distrito,
        subtotal, descuento_total, total, metodo_pago, fecha_venta
    INTO 
        v_estado_actual, v_numero_venta, v_usuario_id, v_cliente_nombre,
        v_cliente_email, v_cliente_telefono, v_cliente_distrito,
        v_subtotal, v_descuento_total, v_total, v_metodo_pago, v_fecha_venta
    FROM ventas 
    WHERE venta_id = p_venta_id;
    
    -- Verificar que la venta está pendiente
    IF v_estado_actual = 'pendiente' THEN
        -- Obtener nombre del vendedor
        SELECT COALESCE(nombre_completo, 'Sistema') INTO v_vendedor_nombre
        FROM usuarios WHERE usuario_id = p_vendedor_id;
        
        -- Calcular cantidades
        SELECT 
            COUNT(DISTINCT producto_id),
            COALESCE(SUM(cantidad), 0)
        INTO v_cantidad_productos, v_cantidad_items
        FROM venta_items WHERE venta_id = p_venta_id;
        
        -- Insertar en ventas_realizadas
        INSERT INTO ventas_realizadas (
            venta_id, numero_venta, cliente_id, cliente_nombre, 
            cliente_email, cliente_telefono, cliente_tipo, 
            vendedor_id, vendedor_nombre, subtotal, descuento_total, 
            total, metodo_pago, cantidad_productos, cantidad_items,
            hora_venta, dia_semana, mes, anio, trimestre,
            ciudad, distrito, departamento, fecha_venta, fecha_confirmacion
        ) VALUES (
            p_venta_id,
            v_numero_venta,
            v_usuario_id,
            COALESCE(v_cliente_nombre, 'Cliente'),
            COALESCE(v_cliente_email, 'sin-email@qhatu.com'),
            COALESCE(v_cliente_telefono, 'Sin teléfono'),
            CASE WHEN v_usuario_id IS NULL THEN 'invitado' ELSE 'registrado' END,
            p_vendedor_id,
            v_vendedor_nombre,
            COALESCE(v_subtotal, 0),
            COALESCE(v_descuento_total, 0),
            COALESCE(v_total, 0),
            COALESCE(v_metodo_pago, 'whatsapp_pago'),
            v_cantidad_productos,
            v_cantidad_items,
            TIME(NOW()),
            DAYOFWEEK(NOW()),
            MONTH(NOW()),
            YEAR(NOW()),
            QUARTER(NOW()),
            'Huánuco',
            COALESCE(v_cliente_distrito, 'Huánuco'),
            'Huánuco',
            v_fecha_venta,
            NOW()
        );
        
        -- Insertar items
        INSERT INTO ventas_realizadas_items (
            venta_realizada_id, producto_id, producto_nombre, producto_codigo,
            categoria_id, categoria_nombre, cantidad, precio_unitario,
            precio_descuento, precio_final, subtotal, descuento_porcentaje,
            descuento_monto, stock_antes, stock_despues
        )
        SELECT 
            LAST_INSERT_ID(),
            vi.producto_id,
            vi.producto_nombre,
            CAST(vi.producto_id AS CHAR),
            p.categoria_id,
            COALESCE(c.nombre, 'General'),
            vi.cantidad,
            vi.precio_unitario,
            vi.precio_descuento,
            COALESCE(vi.precio_descuento, vi.precio_unitario),
            vi.subtotal,
            CASE 
                WHEN vi.precio_descuento IS NOT NULL AND vi.precio_descuento < vi.precio_unitario
                THEN ROUND(((vi.precio_unitario - vi.precio_descuento) / vi.precio_unitario * 100), 2)
                ELSE NULL 
            END,
            CASE 
                WHEN vi.precio_descuento IS NOT NULL AND vi.precio_descuento < vi.precio_unitario
                THEN (vi.precio_unitario - vi.precio_descuento) * vi.cantidad
                ELSE 0 
            END,
            COALESCE(p.stock + vi.cantidad, 0),
            COALESCE(p.stock, 0)
        FROM venta_items vi
        LEFT JOIN productos p ON vi.producto_id = p.producto_id
        LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
        WHERE vi.venta_id = p_venta_id;
        
        -- Actualizar estado de la venta
        UPDATE ventas 
        SET estado = 'confirmada', 
            vendedor_id = p_vendedor_id,
            fecha_confirmacion = NOW()
        WHERE venta_id = p_venta_id;
        
        SELECT 'Venta confirmada y registrada exitosamente' AS resultado;
    ELSE
        SELECT 'La venta no está pendiente o no existe' AS resultado;
    END IF;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `backup_ventas_realizadas_2025`
--

CREATE TABLE `backup_ventas_realizadas_2025` (
  `venta_realizada_id` int(11) NOT NULL DEFAULT 0,
  `venta_id` int(11) NOT NULL COMMENT 'Referencia a tabla ventas',
  `numero_venta` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'QH-0001, etc',
  `cliente_id` int(11) DEFAULT NULL COMMENT 'Usuario registrado',
  `cliente_nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cliente_telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cliente_documento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cliente_tipo` enum('registrado','invitado') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'invitado',
  `vendedor_id` int(11) NOT NULL COMMENT 'Usuario vendedor',
  `vendedor_nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `descuento_total` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `metodo_pago` enum('whatsapp_pago','yape','plin','transferencia','efectivo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'whatsapp_pago',
  `cantidad_productos` int(11) NOT NULL COMMENT 'Total de productos diferentes',
  `cantidad_items` int(11) NOT NULL COMMENT 'Total de unidades vendidas',
  `margen_beneficio` decimal(10,2) DEFAULT NULL COMMENT 'Si tienes costo de productos',
  `comision_vendedor` decimal(10,2) DEFAULT NULL COMMENT 'Si aplica',
  `hora_venta` time NOT NULL COMMENT 'Hora exacta',
  `dia_semana` tinyint(4) NOT NULL COMMENT '1=Lunes, 7=Domingo',
  `mes` tinyint(4) NOT NULL COMMENT '1-12',
  `anio` year(4) NOT NULL,
  `trimestre` tinyint(4) NOT NULL COMMENT '1-4',
  `ciudad` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Huánuco',
  `distrito` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departamento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Huánuco',
  `fecha_venta` datetime NOT NULL,
  `fecha_confirmacion` datetime NOT NULL COMMENT 'Cuando el vendedor confirmó',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `backup_ventas_realizadas_2025`
--

INSERT INTO `backup_ventas_realizadas_2025` (`venta_realizada_id`, `venta_id`, `numero_venta`, `cliente_id`, `cliente_nombre`, `cliente_email`, `cliente_telefono`, `cliente_documento`, `cliente_tipo`, `vendedor_id`, `vendedor_nombre`, `subtotal`, `descuento_total`, `total`, `metodo_pago`, `cantidad_productos`, `cantidad_items`, `margen_beneficio`, `comision_vendedor`, `hora_venta`, `dia_semana`, `mes`, `anio`, `trimestre`, `ciudad`, `distrito`, `departamento`, `fecha_venta`, `fecha_confirmacion`, `fecha_registro`) VALUES
(1, 2, 'QH-0002', 4, 'Ana Cliente', 'cliente@qhatu.com', '962000004', NULL, 'registrado', 2, 'María Vendedora', 72.00, 0.00, 72.00, 'whatsapp_pago', 5, 20, NULL, NULL, '11:38:42', 3, 11, '2025', 4, 'Huánuco', 'Huánuco', 'Huánuco', '2025-11-23 11:02:29', '2025-11-25 11:38:42', '2025-11-25 16:38:42'),
(2, 3, 'QH-0003', 4, 'Ana Cliente', 'cliente@qhatu.com', '962000004', NULL, 'registrado', 2, 'María Vendedora', 49.50, 0.00, 49.50, 'whatsapp_pago', 1, 11, NULL, NULL, '11:40:33', 3, 11, '2025', 4, 'Huánuco', 'Huánuco', 'Huánuco', '2025-11-23 11:32:17', '2025-11-25 11:40:33', '2025-11-25 16:40:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `backup_ventas_realizadas_items_2025`
--

CREATE TABLE `backup_ventas_realizadas_items_2025` (
  `item_id` int(11) NOT NULL DEFAULT 0,
  `venta_realizada_id` int(11) NOT NULL,
  `producto_id` int(11) DEFAULT NULL COMMENT 'Referencia si existe',
  `producto_nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `producto_codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `categoria_nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `precio_descuento` decimal(10,2) DEFAULT NULL,
  `precio_final` decimal(10,2) NOT NULL COMMENT 'Precio usado en la venta',
  `subtotal` decimal(10,2) NOT NULL,
  `descuento_porcentaje` decimal(5,2) DEFAULT NULL,
  `descuento_monto` decimal(10,2) DEFAULT 0.00,
  `stock_antes` int(11) DEFAULT NULL COMMENT 'Stock antes de la venta',
  `stock_despues` int(11) DEFAULT NULL COMMENT 'Stock después de la venta',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `backup_ventas_realizadas_items_2025`
--

INSERT INTO `backup_ventas_realizadas_items_2025` (`item_id`, `venta_realizada_id`, `producto_id`, `producto_nombre`, `producto_codigo`, `categoria_id`, `categoria_nombre`, `cantidad`, `precio_unitario`, `precio_descuento`, `precio_final`, `subtotal`, `descuento_porcentaje`, `descuento_monto`, `stock_antes`, `stock_despues`, `fecha_registro`) VALUES
(1, 1, 15, 'Caramelos de menta', '15', 10, 'Ramen y Fideos', 4, 2.50, NULL, 2.50, 10.00, NULL, 0.00, 24, 20, '2025-11-25 16:38:42'),
(2, 1, 9, 'Caramelos de menta', '9', 14, 'Bebidas', 4, 2.50, NULL, 2.50, 10.00, NULL, 0.00, 124, 120, '2025-11-25 16:38:42'),
(3, 1, 8, 'Gomitas Haribo', '8', 14, 'Bebidas', 3, 4.00, NULL, 4.00, 12.00, NULL, 0.00, 83, 80, '2025-11-25 16:38:42'),
(4, 1, 14, 'Gomitas Haribo', '14', 18, 'Licores', 1, 4.00, NULL, 4.00, 4.00, NULL, 0.00, 81, 80, '2025-11-25 16:38:42'),
(5, 1, NULL, 'Cheetos Flamin Hot', NULL, NULL, 'General', 4, 4.50, NULL, 4.50, 18.00, NULL, 0.00, 0, 0, '2025-11-25 16:38:42'),
(6, 1, 12, 'Cheetos Flamin Hot', '12', 18, 'Licores', 4, 4.50, NULL, 4.50, 18.00, NULL, 0.00, 74, 70, '2025-11-25 16:38:42'),
(8, 2, 12, 'Cheetos Flamin Hot', '12', 18, 'Licores', 5, 4.50, NULL, 4.50, 22.50, NULL, 0.00, 75, 70, '2025-11-25 16:40:33'),
(9, 2, NULL, 'Cheetos Flamin Hot', NULL, NULL, 'General', 6, 4.50, NULL, 4.50, 27.00, NULL, 0.00, 0, 0, '2025-11-25 16:40:33');

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
(1, '¡Mega Descuento en Dulces! 🍬', 'Todos los chocolates, galletas y golosinas con 25% OFF', 1, 25.00, '/images/banners/banner-dulces.jpg', '#FF6B9D', '#FFFFFF', '2025-11-07 14:38:33', '2025-12-07 14:38:33', 1, 3, 'porcentaje', NULL, 6, 41, NULL, '2025-11-07 19:38:33', '2025-11-18 03:37:21'),
(2, 'Refréscate con 15% de Descuento 🥤', 'Bebidas importadas y Bubble Tea en oferta', 14, 15.00, '/images/banners/banner-bebidas.jpg', '#4ECDC4', '#FFFFFF', '2025-11-07 14:38:33', '2025-11-22 14:38:33', 1, 2, 'porcentaje', NULL, 3, 39, NULL, '2025-11-07 19:38:33', '2025-11-18 03:37:21'),
(3, 'Semana del Ramen 🍜', 'Aprovecha 20% OFF en todos los fideos instantáneos', 10, 20.00, '/images/banners/banner-ramen.jpg', '#FFD93D', '#2D3436', '2025-11-07 14:38:33', '2025-11-14 14:38:33', 1, 1, 'porcentaje', NULL, 2, 22, NULL, '2025-11-07 19:38:33', '2025-11-13 17:27:45'),
(4, '¡Snacks al 30% OFF! 🍿', 'Las mejores papas y piqueos importados', 6, 30.00, '/images/banners/banner-snacks.jpg', '#FFA62B', '#FFFFFF', '2025-11-07 14:38:33', '2025-11-27 14:38:33', 1, 4, 'porcentaje', NULL, 4, 745, NULL, '2025-11-07 19:38:33', '2025-11-27 19:17:30');

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
  `estado` enum('activo','abandonado','procesando','enviado','completado','cancelado') DEFAULT 'activo',
  `subtotal` decimal(10,2) DEFAULT 0.00,
  `descuento_total` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) DEFAULT 0.00,
  `notas_cliente` text DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `convertido_venta_id` int(11) DEFAULT NULL COMMENT 'ID de venta si se completó'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `carritos`
--

INSERT INTO `carritos` (`carrito_id`, `usuario_id`, `sesion_temporal`, `estado`, `subtotal`, `descuento_total`, `total`, `notas_cliente`, `creado_en`, `actualizado_en`, `convertido_venta_id`) VALUES
(1, 4, NULL, 'enviado', 72.00, 0.00, 72.00, NULL, '2025-11-20 20:21:38', '2025-11-23 16:02:29', 2),
(2, 1, NULL, 'activo', 0.00, 0.00, 0.00, NULL, '2025-11-23 15:26:21', '2025-11-23 15:26:21', NULL),
(3, 2, NULL, 'activo', 0.00, 0.00, 0.00, NULL, '2025-11-23 15:26:33', '2025-11-23 15:26:33', NULL),
(4, 4, NULL, 'enviado', 49.50, 0.00, 49.50, NULL, '2025-11-23 16:02:29', '2025-11-23 16:32:17', 3),
(5, 4, NULL, 'enviado', 18.00, 0.00, 18.00, NULL, '2025-11-23 16:32:17', '2025-11-23 16:32:41', 4),
(6, 4, NULL, 'enviado', 10.00, 0.00, 10.00, NULL, '2025-11-23 16:32:41', '2025-11-23 16:35:00', 5),
(7, 4, NULL, 'enviado', 28.00, 0.00, 28.00, NULL, '2025-11-23 16:35:00', '2025-11-23 16:36:47', 6),
(8, 4, NULL, 'enviado', 133.50, 52.50, 133.50, NULL, '2025-11-23 16:36:47', '2025-11-23 16:43:00', 9),
(9, 6, NULL, 'enviado', 36.00, 0.00, 36.00, NULL, '2025-11-23 16:40:15', '2025-11-23 16:40:31', 7),
(10, 6, NULL, 'enviado', 43.00, 52.50, 43.00, NULL, '2025-11-23 16:40:31', '2025-11-23 16:41:18', 8),
(11, 6, NULL, 'enviado', 36.00, 0.00, 36.00, NULL, '2025-11-23 16:41:18', '2025-11-23 17:08:44', 11),
(12, 4, NULL, 'enviado', 62.00, 0.00, 62.00, NULL, '2025-11-23 16:43:00', '2025-11-23 16:54:25', 10),
(13, 4, NULL, 'activo', 2.50, 0.00, 2.50, NULL, '2025-11-23 16:54:25', '2025-11-24 23:32:16', NULL),
(14, 6, NULL, 'enviado', 40.50, 0.00, 40.50, NULL, '2025-11-23 17:08:44', '2025-11-23 20:09:35', 12),
(15, 6, NULL, 'enviado', 56.65, 34.85, 56.65, NULL, '2025-11-23 20:09:35', '2025-11-25 19:50:31', 13),
(16, 6, NULL, 'activo', 0.00, 0.00, 0.00, NULL, '2025-11-25 19:50:31', '2025-11-25 19:50:31', NULL),
(17, 7, NULL, 'enviado', 60.32, 2.68, 60.32, NULL, '2025-11-27 07:24:13', '2025-11-27 07:24:29', 21),
(18, 7, NULL, 'enviado', 53.99, 2.01, 53.99, NULL, '2025-11-27 07:24:29', '2025-11-27 15:01:23', 22),
(19, 7, NULL, 'enviado', 45.00, 0.00, 45.00, NULL, '2025-11-27 15:01:23', '2025-11-27 15:05:03', 23),
(20, 7, NULL, 'activo', 0.00, 0.00, 0.00, NULL, '2025-11-27 15:05:03', '2025-11-27 15:05:03', NULL),
(21, 8, NULL, 'enviado', 38.00, 0.00, 38.00, NULL, '2025-11-27 16:55:52', '2025-11-27 16:56:30', 24),
(22, 8, NULL, 'activo', 0.00, 0.00, 0.00, NULL, '2025-11-27 16:56:30', '2025-11-27 16:56:30', NULL),
(23, 9, NULL, 'enviado', 27.25, 0.00, 27.25, NULL, '2025-11-27 16:59:36', '2025-11-27 16:59:55', 25),
(24, 9, NULL, 'enviado', 46.92, 4.05, 46.92, NULL, '2025-11-27 16:59:55', '2025-11-27 17:04:11', 26),
(25, 9, NULL, 'activo', 0.00, 0.00, 0.00, NULL, '2025-11-27 17:04:11', '2025-11-27 17:04:11', NULL),
(26, 10, NULL, 'activo', 0.00, 0.00, 0.00, NULL, '2025-11-27 18:22:03', '2025-11-27 18:22:03', NULL),
(27, 11, NULL, 'enviado', 46.78, 2.70, 46.78, NULL, '2025-11-27 18:23:44', '2025-11-27 18:24:52', 27),
(28, 11, NULL, 'enviado', 34.00, 0.00, 34.00, NULL, '2025-11-27 18:24:52', '2025-11-27 19:17:50', 28),
(29, 11, NULL, 'activo', 0.00, 0.00, 0.00, NULL, '2025-11-27 19:17:50', '2025-11-27 19:17:50', NULL);

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
-- Volcado de datos para la tabla `carrito_items`
--

INSERT INTO `carrito_items` (`item_id`, `carrito_id`, `producto_id`, `cantidad`, `precio_unitario`, `precio_descuento`, `agregado_en`) VALUES
(5, 1, 15, 4, 2.50, NULL, '2025-11-20 21:30:23'),
(6, 1, 9, 4, 2.50, NULL, '2025-11-22 18:57:21'),
(7, 1, 8, 3, 4.00, NULL, '2025-11-22 19:18:52'),
(8, 1, 14, 1, 4.00, NULL, '2025-11-22 19:18:54'),
(10, 1, 12, 4, 4.50, NULL, '2025-11-22 19:19:05'),
(12, 4, 12, 5, 4.50, NULL, '2025-11-23 16:32:11'),
(14, 5, 12, 4, 4.50, NULL, '2025-11-23 16:32:35'),
(15, 6, 15, 4, 2.50, NULL, '2025-11-23 16:34:55'),
(16, 7, 15, 4, 2.50, NULL, '2025-11-23 16:36:40'),
(17, 7, 12, 4, 4.50, NULL, '2025-11-23 16:36:43'),
(18, 9, 12, 4, 4.50, NULL, '2025-11-23 16:40:21'),
(21, 10, 1, 5, 15.50, 5.00, '2025-11-23 16:41:15'),
(22, 8, 1, 5, 15.50, 5.00, '2025-11-23 16:42:54'),
(25, 12, 12, 6, 4.50, NULL, '2025-11-23 16:54:18'),
(26, 12, 15, 3, 2.50, NULL, '2025-11-23 16:54:19'),
(27, 12, 9, 2, 2.50, NULL, '2025-11-23 16:54:20'),
(28, 11, 12, 4, 4.50, NULL, '2025-11-23 17:08:40'),
(30, 14, 12, 4, 4.50, NULL, '2025-11-23 20:09:29'),
(32, 13, 15, 1, 2.50, NULL, '2025-11-24 23:32:16'),
(33, 15, 1, 3, 15.50, 5.00, '2025-11-25 19:50:23'),
(34, 15, 5, 5, 4.50, 3.83, '2025-11-25 19:50:26'),
(35, 15, 12, 5, 4.50, NULL, '2025-11-25 19:50:27'),
(36, 17, 16, 5, 6.00, NULL, '2025-11-27 07:24:20'),
(37, 17, 15, 6, 2.50, NULL, '2025-11-27 07:24:22'),
(38, 17, 5, 4, 4.50, 3.83, '2025-11-27 07:24:24'),
(39, 18, 14, 5, 4.00, NULL, '2025-11-27 15:01:01'),
(40, 18, 12, 5, 4.50, NULL, '2025-11-27 15:01:03'),
(41, 18, 5, 3, 4.50, 3.83, '2025-11-27 15:01:08'),
(42, 19, 10, 5, 5.00, NULL, '2025-11-27 15:04:55'),
(43, 19, 8, 5, 4.00, NULL, '2025-11-27 15:04:57'),
(44, 21, 12, 4, 4.50, NULL, '2025-11-27 16:56:20'),
(45, 21, 14, 5, 4.00, NULL, '2025-11-27 16:56:23'),
(46, 23, 15, 4, 2.50, NULL, '2025-11-27 16:59:50'),
(47, 23, 3, 3, 5.75, NULL, '2025-11-27 16:59:52'),
(48, 24, 16, 4, 6.00, NULL, '2025-11-27 17:04:05'),
(49, 24, 2, 3, 8.99, 7.64, '2025-11-27 17:04:08'),
(50, 27, 16, 4, 6.00, NULL, '2025-11-27 18:24:40'),
(51, 27, 2, 2, 8.99, 7.64, '2025-11-27 18:24:43'),
(52, 27, 15, 3, 2.50, NULL, '2025-11-27 18:24:46'),
(53, 28, 16, 1, 6.00, NULL, '2025-11-27 19:17:39'),
(54, 28, 15, 4, 2.50, NULL, '2025-11-27 19:17:43'),
(55, 28, 12, 4, 4.50, NULL, '2025-11-27 19:17:45');

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
-- Estructura de tabla para la tabla `ia_analytics_log`
--

CREATE TABLE `ia_analytics_log` (
  `log_id` int(11) NOT NULL,
  `tipo_ia` enum('prediccion_inventario','recomendaciones','asistente_vendedor') NOT NULL,
  `accion` varchar(100) NOT NULL,
  `entidad_tipo` enum('producto','cliente','vendedor','categoria') DEFAULT NULL,
  `entidad_id` int(11) DEFAULT NULL,
  `prediccion` text DEFAULT NULL COMMENT 'JSON con datos de predicción',
  `confianza` decimal(5,2) DEFAULT NULL COMMENT 'Nivel de confianza 0-100',
  `resultado` enum('exitoso','fallido','pendiente') DEFAULT 'pendiente',
  `fecha_prediccion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log de acciones y predicciones de las IAs para auditoría';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metricas_clientes`
--

CREATE TABLE `metricas_clientes` (
  `metrica_id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `total_compras` int(11) DEFAULT 0,
  `total_gastado` decimal(10,2) DEFAULT 0.00,
  `ticket_promedio` decimal(10,2) DEFAULT 0.00,
  `ultima_compra` datetime DEFAULT NULL,
  `primera_compra` datetime DEFAULT NULL,
  `dias_desde_ultima_compra` int(11) DEFAULT NULL,
  `frecuencia_compra_dias` decimal(8,2) DEFAULT NULL COMMENT 'Días promedio entre compras',
  `cliente_activo` tinyint(1) DEFAULT 1,
  `cliente_vip` tinyint(1) DEFAULT 0,
  `categoria_favorita_id` int(11) DEFAULT NULL,
  `categoria_favorita_nombre` varchar(100) DEFAULT NULL,
  `producto_mas_comprado_id` int(11) DEFAULT NULL,
  `producto_mas_comprado_nombre` varchar(255) DEFAULT NULL,
  `metodo_pago_preferido` varchar(50) DEFAULT NULL,
  `segmento` enum('nuevo','ocasional','regular','frecuente','vip','inactivo') DEFAULT 'nuevo',
  `score_fidelidad` decimal(5,2) DEFAULT 0.00 COMMENT '0-100',
  `probabilidad_recompra` decimal(5,2) DEFAULT NULL COMMENT 'Calculado por IA',
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Métricas y comportamiento de clientes para análisis y IA';

--
-- Volcado de datos para la tabla `metricas_clientes`
--

INSERT INTO `metricas_clientes` (`metrica_id`, `cliente_id`, `total_compras`, `total_gastado`, `ticket_promedio`, `ultima_compra`, `primera_compra`, `dias_desde_ultima_compra`, `frecuencia_compra_dias`, `cliente_activo`, `cliente_vip`, `categoria_favorita_id`, `categoria_favorita_nombre`, `producto_mas_comprado_id`, `producto_mas_comprado_nombre`, `metodo_pago_preferido`, `segmento`, `score_fidelidad`, `probabilidad_recompra`, `actualizado_en`) VALUES
(1, 4, 6, 414.50, 69.08, '2025-11-21 07:48:00', '2025-11-01 10:00:00', 5, 3.33, 1, 1, 1, 'Dulces', 12, 'Cheetos Flamin Hot', NULL, 'vip', 92.50, 95.00, '2025-11-26 12:48:00'),
(2, 5, 4, 195.25, 48.81, '2025-11-05 20:42:05', '2025-11-05 14:20:00', 20, 12.50, 1, 0, 14, 'Bebidas', 1, 'BON BONG UVA 238 ML', NULL, 'regular', 65.00, 72.00, '2025-11-26 01:42:05');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metricas_productos`
--

CREATE TABLE `metricas_productos` (
  `metrica_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `periodo` enum('diario','semanal','mensual') DEFAULT 'diario',
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `unidades_vendidas` int(11) DEFAULT 0,
  `veces_vendido` int(11) DEFAULT 0 COMMENT 'Número de ventas que lo incluyeron',
  `ingresos_generados` decimal(10,2) DEFAULT 0.00,
  `stock_inicial` int(11) DEFAULT 0,
  `stock_final` int(11) DEFAULT 0,
  `rotacion` decimal(8,2) DEFAULT NULL COMMENT 'Días para vender stock',
  `vistas_producto` int(11) DEFAULT 0,
  `agregado_carrito` int(11) DEFAULT 0,
  `tasa_conversion` decimal(5,2) DEFAULT NULL COMMENT 'Porcentaje',
  `precio_promedio` decimal(10,2) DEFAULT NULL,
  `descuento_aplicado` tinyint(1) DEFAULT 0,
  `ranking_categoria` int(11) DEFAULT NULL,
  `ranking_general` int(11) DEFAULT NULL,
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Métricas de rendimiento de productos para análisis y predicción';

--
-- Volcado de datos para la tabla `metricas_productos`
--

INSERT INTO `metricas_productos` (`metrica_id`, `producto_id`, `periodo`, `fecha_inicio`, `fecha_fin`, `unidades_vendidas`, `veces_vendido`, `ingresos_generados`, `stock_inicial`, `stock_final`, `rotacion`, `vistas_producto`, `agregado_carrito`, `tasa_conversion`, `precio_promedio`, `descuento_aplicado`, `ranking_categoria`, `ranking_general`, `actualizado_en`) VALUES
(1, 1, 'mensual', '2025-11-01', '2025-11-30', 45, 12, 697.50, 60, 15, 12.50, 156, 23, 14.74, 15.50, 1, 2, 5, '2025-11-25 16:39:55'),
(2, 12, 'mensual', '2025-11-01', '2025-11-30', 67, 18, 301.50, 80, 13, 8.20, 234, 45, 19.23, 4.50, 0, 1, 2, '2025-11-25 16:39:55'),
(3, 15, 'mensual', '2025-11-01', '2025-11-30', 32, 9, 80.00, 50, 18, 15.60, 89, 12, 13.48, 2.50, 0, 3, 8, '2025-11-25 16:39:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metricas_vendedores`
--

CREATE TABLE `metricas_vendedores` (
  `metrica_id` int(11) NOT NULL,
  `vendedor_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `total_ventas` int(11) DEFAULT 0,
  `ventas_confirmadas` int(11) DEFAULT 0,
  `ventas_canceladas` int(11) DEFAULT 0,
  `monto_total_vendido` decimal(10,2) DEFAULT 0.00,
  `ticket_promedio` decimal(10,2) DEFAULT 0.00,
  `comisiones_generadas` decimal(10,2) DEFAULT 0.00,
  `productos_vendidos` int(11) DEFAULT 0,
  `categorias_vendidas` int(11) DEFAULT 0,
  `clientes_atendidos` int(11) DEFAULT 0,
  `clientes_nuevos` int(11) DEFAULT 0,
  `clientes_recurrentes` int(11) DEFAULT 0,
  `tiempo_promedio_venta` int(11) DEFAULT NULL COMMENT 'Minutos',
  `tasa_conversion` decimal(5,2) DEFAULT NULL COMMENT 'Porcentaje',
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Métricas diarias de rendimiento de vendedores';

--
-- Volcado de datos para la tabla `metricas_vendedores`
--

INSERT INTO `metricas_vendedores` (`metrica_id`, `vendedor_id`, `fecha`, `total_ventas`, `ventas_confirmadas`, `ventas_canceladas`, `monto_total_vendido`, `ticket_promedio`, `comisiones_generadas`, `productos_vendidos`, `categorias_vendidas`, `clientes_atendidos`, `clientes_nuevos`, `clientes_recurrentes`, `tiempo_promedio_venta`, `tasa_conversion`, `actualizado_en`) VALUES
(1, 2, '2025-11-25', 8, 8, 0, 485.00, 60.63, 24.25, 45, 6, 3, 1, 2, 15, 75.00, '2025-11-25 16:39:55');

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
(1, 'BON BONG UVA 238 ML', 'Es una bebida sabor a uva que contiene pulpa real, azúcar, agua y saborizantes permitidos. Presentación individual de 238 ml.\r\n\r\nPrecio de la caja (12 unidades): S/ XX.XX\r\n\r\nAlérgenos: Puede contener trazas de sulfitos derivados del proceso de la uva. No apto para personas sensibles a colorantes artificiales', 15.50, 5.00, 0, 20, 10, 16, 1, 47, NULL, 'unidades', 'https://asiaonmart.com/wp-content/uploads/2020/08/WEB_BongBongChico_Frontal.jpg', '2025-10-22 23:00:41', '2025-11-25 21:42:34'),
(2, 'BEBIDA DE PERA 238 ML', 'Es una bebida de pera oriental (nashi) coreana que se caracteriza por contener pulpa de pera real triturada, agua, azúcar y saborizantes permitidos. Se presenta en una lata individual de 238 ml.\r\nPrecio de la caja (12 unidades): S/ 100\r\nAlérgenos: Contiene fruta real (pera). Personas con alergias a las frutas deben evitar su consumo.', 8.99, 7.64, 0, 20, 10, 16, 0, 19, NULL, 'unidades', 'https://asiaonmart.com/wp-content/uploads/2020/05/WEB_JugoPera_Grupal.jpg', '2025-10-22 23:00:41', '2025-11-27 18:26:07'),
(3, 'NEOGURI HOT x 120 GR', 'Es un paquete de fideos instantáneos tipo udon, sabor mariscos picante, que se caracteriza por tener fideos gruesos, un caldo a base de mariscos, especias picantes y algas marinas deshidratadas. Se presenta en un paquete individual de 120 g.\r\nPrecio de la caja (20 unidades): Aprox. S/ 100 - S/ 120 .\r\nAlérgenos: Contiene trigo (gluten), soja, y ingredientes derivados de mariscos, pescado y crustáceos.', 5.75, NULL, 5, 20, 10, 10, 1, 46, NULL, 'unidades', 'https://kfood.pe/wp-content/uploads/2022/08/SOPA-NEOGURI-UDON-HOT-x-120-GR.jpg', '2025-10-22 23:00:41', '2025-11-24 21:15:10'),
(4, 'KIMCHI SHIN RAMYUN X 120GR', 'Es un paquete de fideos instantáneos tipo ramen, sabor a kimchi picante. Se caracteriza por tener fideos rizados, un caldo especiado con el sabor tradicional, fermentado y ligeramente ácido del kimchi, e incluye hojuelas de kimchi deshidratadas. Se presenta en un paquete individual de 120 g.\r\nPrecio de la caja (20 unidades):S/ 101.42 .\r\nAlérgenos: Contiene trigo (gluten) y soja. El producto se puede elaborar en instalaciones que también procesan otros alérgenos como cebada, crustáceos, huevo, pescado, cacahuetes, leche, apio, mostaza, semillas de sésamo y moluscos. \r\n\r\n\r\n\r\n', 20.00, NULL, 0, 20, 10, 10, 0, 75, NULL, 'unidades', 'https://pharmax.com.pe/cdn/shop/files/8801043157742.png?v=1752773402', '2025-10-22 23:00:41', '2025-11-24 21:19:37'),
(5, 'CHAPAGURI ANGRY X 140 GR', 'Es un paquete de fideos instantáneos tipo ramen, conocido como Chapaguri Angry (Súper Picante). Se caracteriza por ser una combinación de los fideos Chapagetti (salsa de frijol negro, chajang) y el sabor picante a mariscos del Neoguri. Incluye fideos gruesos y masticables, condimentos que mezclan sabores salados, dulces y picantes intensos, y vegetales deshidratados como zanahoria y alga marina. Se presenta en un paquete individual de 140 g. \r\nPrecio de la caja (40 unidades): S/ 396 .\r\nAlérgenos: Contiene trigo (gluten) y soja, y puede contener ingredientes derivados de mariscos, pescado, huevo, leche, cacahuetes y frutos secos, ya que se elabora en instalaciones compartidas. ', 4.50, 3.83, 0, 20, 10, 10, 0, 41, NULL, 'unidades', 'https://kfood.pe/wp-content/uploads/2024/07/26215beba1278ddbf2dec144692d2ad3-1-Photoroom-1-e1722117519489.png', '2025-10-22 23:00:41', '2025-11-27 15:47:16'),
(6, 'PEPERO STRAY KIDS 47 GR', 'Es un paquete de palitos de galleta coreanos, edición especial Pepero x Stray Kids. Se caracteriza por ser un snack (aperitivo) que consiste en palitos de galleta delgados y crujientes, bañados en diferentes tipos de chocolate y recubrimientos (chocolate con leche, chocolate blanco con galleta, o chocolate con almendras). Se presenta en un paquete individual de 47 g.\r\nPrecio de la caja (40 unidades): S/ 396 .\r\nAlérgenos: Contiene trigo (gluten), soja, leche, y en algunas variedades, frutos secos (almendras). El producto se elabora en instalaciones que también pueden procesar otros alérgenos. ', 6.25, NULL, 30, 20, 10, 3, 1, 12, NULL, 'unidades', 'https://juntozstgsrvproduction.blob.core.windows.net/default-blob-images/orig_peperoalmendra_5d605c36-2ab9-4aaf-861c-b04902d3f1f7_603233.jpg', '2025-10-22 23:00:41', '2025-11-24 21:33:30'),
(7, 'SOFT DRINK LET´S BE MOCHA (CAFÉ) 175\r\nML', 'Es una bebida de café moca coreana de la marca Lotte, que se caracteriza por ser una bebida suave lista para beber, que combina el sabor del café arábica con notas de chocolate y leche. Se presenta en una lata individual de 175 ml.\r\nPrecio de la caja (30 unidades): S/ 396 . \r\nAlérgenos: Contiene leche y cafeína. Personas con sensibilidad o alergias a estos componentes deben evitar su consumo.', 3.50, NULL, 100, 20, 10, 14, 0, 45, NULL, 'paquete', 'https://kfood.pe/wp-content/uploads/2022/08/SOFT-DRINK-LETS-BE-MOCHA-175-ML.jpg', '2025-10-23 04:48:31', '2025-11-24 22:03:33'),
(8, 'SOFT DRINK LET´S BE MOCHA (CAFÉ&LECHE) 175\r\nML', 'Es una bebida de café con leche coreana de la marca Lotte, que se caracteriza por ser una bebida suave lista para beber tipo café con leche, con un perfil de sabor equilibrado y cremoso. Se presenta en una lata individual de 175 ml.\r\n\r\nPrecio de la caja (30 unidades): S/ XX.XX \r\n\r\nAlérgenos: Contiene leche y cafeína. Personas con sensibilidad o alergias a estos componentes deben evitar su consumo.', 4.00, NULL, 72, 20, 10, 14, 1, 75, NULL, 'bolsa', 'https://kfomart.com/wp-content/uploads/2025/05/Lotte-Lets-Be-Mild-Coffee-.svg', '2025-10-23 04:48:31', '2025-11-27 15:47:29'),
(9, 'SOFT DRINK LET\'S BE\r\nCAPUCCINO 240 ML', 'Es una bebida de café capuchino coreana de la marca Lotte, que se caracteriza por ser una bebida suave lista para beber. Combina un sabor equilibrado de café y leche con notas sutiles de cacao, y está diseñada para ser consumida fría o caliente. Se presenta en una lata individual de 240 ml. \r\nPrecio de la caja (30 unidades): S/ 180  \r\nAlérgenos: Contiene leche (lactosa) y cafeína. No contiene gluten. Personas con sensibilidad o alergias a estos componentes deben evitar su consumo.\r\n\r\n', 2.50, NULL, 116, 20, 10, 14, 1, 27, NULL, 'bolsa', 'https://kfood.pe/wp-content/uploads/2023/06/Untitled-Design-2023-06-08T165105.300.png', '2025-10-23 04:48:31', '2025-11-27 15:47:29'),
(10, 'SOFT DRINK SANTA FE COFFE\r\nORIGINAL 175 ML', 'Es una bebida de café negro de la marca Santa Fe. Se caracteriza por ser una bebida suave lista para beber que combina un sabor a café tostado con un aroma rico y clásico a nuez (avellana), diseñada para ser consumida fría. Se presenta en una lata individual de 175 ml. \r\n\r\nPrecio de la caja (30 unidades):S/ 120 \r\n\r\nAlérgenos: Contiene cafeína y puede contener leche o derivados lácteos. Aunque el saborizante no contiene avellanas reales en la mayoría de los casos. Personas con sensibilidad a la cafeína o alergias a los lácteos/frutos secos deben evitar su consumo. ', 5.00, NULL, 55, 20, 10, 14, 1, 94, NULL, 'bolsa', 'https://web.tradekorea.com/product/907/2127907/Beverage,_Drink,_Coffee_-_Santa_Fe_Original,_Santa_Fe_Hazelnuts_175ml_2.jpg', '2025-10-23 04:48:31', '2025-11-27 15:47:22'),
(11, 'GOOD DAY SOJU GREEN GRAPE 300 ML-12.5% ALC', 'Es un licor destilado coreano tradicional, conocido como soju (similar al vodka, pero más suave y dulce), de la marca Good Day, sabor a uva verde. Se caracteriza por su bajo contenido alcohólico para un destilado (12.5% ALC) y un sabor frutal, refrescante y ligeramente dulce. Se presenta en una botella de vidrio individual de 300 ml. \r\nPrecio de la caja (12 unidades): S/ 200 \r\n\r\nAlérgenos: Contiene alcohol destilado de cereales como trigo o cebada, o almidones como tapioca/patata, y saborizantes. Personas con alergias al gluten deben verificar la etiqueta del producto físico, ya que la destilación puede eliminar el gluten, pero la base de cereales es común en la producción de soju. ', 6.50, NULL, 40, 20, 10, 18, 0, 56, NULL, 'tubo', 'https://kfood.pe/wp-content/uploads/2023/02/Untitled-Design-2023-02-28T125947.859.png', '2025-10-23 04:48:31', '2025-11-24 22:12:44'),
(12, 'GOOD DAY SOJU GRANADA 300 ML-13.5 % ALC', 'Es un licor destilado coreano tradicional, conocido como soju (similar al vodka, pero más suave y dulce), de la marca Good Day, sabor a granada. Se caracteriza por su bajo contenido alcohólico para un destilado (13.5% ALC) y un sabor frutal, refrescante y ligeramente dulce. Se presenta en una botella de vidrio individual de 300 ml \r\nPrecio de la caja (12 unidades): S/ 260 \r\nAlérgenos: Contiene alcohol destilado de cereales como trigo o cebada, o almidones como tapioca/patata, y saborizantes, ya que la destilación puede eliminar el gluten, pero la base de cereales es común en la producción de soju.', 4.50, NULL, 27, 20, 10, 18, 1, 121, NULL, 'bolsa', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD0pEwySgMnNWkxIDUyutE_0zeEVVnkvtxYQ&s', '2025-10-23 04:48:31', '2025-11-27 19:18:44'),
(13, 'SOFT DRINK SANTA FE COFFE\r\nHAZELNUT 175 ML.', 'Es una bebida de café con sabor a avellana coreana de la marca Santa Fe (producida por Paldo), que se caracteriza por ser una bebida suave lista para beber, que combina un sabor a café tostado con un aroma rico y clásico a nuez. Se presenta en una lata individual de 175 ml.\r\nPrecio de la caja (30 unidades): S/ XX.XX \r\nAlérgenos: Contiene cafeína. El sabor a avellana es típicamente artificial y no contiene frutos secos reales ni leche. Personas con sensibilidad a la cafeína deben evitar su consumo.', 3.50, NULL, 100, 20, 10, 14, 0, 45, NULL, 'paquete', 'https://oppastorecolombia.com/wp-content/uploads/2022/04/8801128941792_1.jpeg', '2025-10-23 04:49:01', '2025-11-24 23:03:03'),
(14, 'GOOD DAY SOJU GREEN APPLE 300 ML-12% ALC', 'Es un licor destilado coreano tradicional, conocido como soju (similar al vodka, pero más suave y dulce), de la marca Good Day, sabor a manzana verde. Se caracteriza por su bajo contenido alcohólico para un destilado  y un sabor frutal, refrescante y ligeramente dulce. Se presenta en una botella de vidrio individual de 300 ml. \r\nPrecio de la caja (20 unidades):S/ 200 \r\nAlérgenos: Contiene alcohol destilado a partir de almidones como arroz, batata, tapioca, trigo o cebada. También contiene azúcar, jarabe de maíz alto en fructosa y saborizantes. Ya que la destilación puede eliminar el gluten, pero la base de cereales es común en la producción de soju.', 4.00, NULL, 74, 20, 10, 18, 1, 73, NULL, 'bolsa', 'https://whisky.my/cdn-cgi/image/quality=80,format=auto,onerror=redirect,metadata=none/wp-content/uploads/GOOD-DAY-Apple-Soju-20-Bottles.jpg', '2025-10-23 04:49:01', '2025-11-27 15:47:29'),
(15, 'BULDAK CARBONARA 130 GR', 'Es un paquete de fideos instantáneos tipo ramen, conocido como Buldak Carbonara Hot Chicken Flavor Ramen de la marca surcoreana Samyang. Se caracteriza por ser un \"fideo frito\" (salteado) que combina la salsa de pollo picante icónica de la marca con un polvo cremoso sabor a carbonara (queso mozzarella, mantequilla y leche). Se presenta en un paquete individual de 130 g. \r\n\r\nAlérgenos: Contiene trigo (gluten), soja y leche. Es fabricado en instalaciones que también procesan crustáceos, huevos, pescado, moluscos, mostaza, nueces, maní y semillas de sésamo. Personas con estas alergias deben evitar su consumo. ', 2.50, NULL, 3, 20, 10, 10, 0, 40, NULL, 'bolsa', 'https://orientalhm.com/cdn/shop/products/90_Carbonara_Buldak_Bokkeum_503x503_d2e08a95-bbee-4075-85d3-97cb1d383089_470x.jpg?v=1616758390', '2025-10-23 04:49:01', '2025-11-27 19:18:44'),
(16, 'BEBIDAS DE ALOE VERA SURTIDO 450 ML', 'Es un surtido de bebidas frutales con base de aloe vera (Aloe barbadensis Miller), presentadas en botellas individuales de 450 ml. Se caracterizan por contener jugo de aloe vera y trozos de pulpa real de la planta, combinados con jugos y sabores de frutas naturales: piña, sandía original, uva y mango. Son bebidas refrescantes que se asocian con beneficios para la salud digestiva e hidratación.\r\nAlérgenos: Estas bebidas generalmente no contienen alérgenos comunes como gluten, soja o lácteos. Sin embargo, se recomienda a las personas con alergias específicas a las frutas listadas (piña, sandía, uva, mango) que revisen la etiqueta antes de consumir.', 6.00, NULL, 16, 20, 10, 14, 1, 103, NULL, 'bolsa', 'https://gw.alicdn.com/imgextra/i4/6000000000247/O1CN01YA7ie51DhAtuRQhHw_!!6000000000247-2-mia.png_.webp', '2025-10-23 04:49:01', '2025-11-27 19:18:44'),
(17, 'TE VERDE MATCHA EN POLVO GRADO CULINARIO 100 GR', 'Es un té verde matcha japonés en polvo de grado culinario (culinary grade). Se caracteriza por ser hojas de té verde molidas finamente, con un sabor ligeramente más robusto y menos dulce que el grado ceremonial. Es ideal para preparar lattes de matcha, batidos, helados, o como ingrediente para hornear galletas, pasteles y postres con sabor a té verde. Se presenta en una lata o bolsa sellada, usualmente en formato de 100 g.\r\nAlérgenos: No contiene alérgenos comunes. Es 100% té verde. Contiene cafeína natural.', 45.00, NULL, 25, 20, 10, 26, 1, 0, 100.00, 'gramos', 'https://media.falabella.com/falabellaPE/138330970_01/w=800,h=800,fit=pad', '2025-11-25 01:04:18', '2025-11-25 01:06:55'),
(18, 'SEASONED SEAWEED SNACK GIM 10 GR', 'Es un snack de hojas de alga marina (gim o nori en coreano/japonés) sazonadas y tostadas. Se caracteriza por su textura extremadamente crujiente y su sabor salado y umami, realzado con aceite de sésamo y sal. Se presenta en un paquete individual de 10 g, que usualmente contiene varias láminas pequeñas. Marcas comunes incluyen Kwangcheonkim, Bibigo, y Ockdongja.\r\n\r\nAlérgenos: Contiene sésamo. Puede contener trazas de pescado o mariscos debido al entorno marino de cosecha.', 5.00, NULL, 30, 20, 10, 9, 1, 0, 15.00, 'gramos', 'https://kfood.pe/wp-content/uploads/2022/08/SEASONED-SEAWEED-JARAE-KIM-10-GR..jpg', '2025-11-25 01:27:48', '2025-11-25 01:34:46'),
(19, 'SHRIMP FLAVORED CRACKER 75 GR', 'Es un snack crujiente sabor a camarones (gambas) producido por varias marcas asiáticas. Se caracteriza por su textura ligera y aireada, con un sabor intenso a mariscos salados. Se presenta en una bolsa sellada individual, usualmente en formato de 75 g.\r\n\r\nAlérgenos: Contiene trigo (gluten) y mariscos/crustáceos (gambas/camarones). Puede contener soja y huevo dependiendo de la marca específica.\r\n\r\n', 5.00, NULL, 18, 15, 8, 8, 1, 0, 150.00, 'gramos', 'https://kfood.pe/wp-content/uploads/2022/08/SHRIMP-FLAVORED-CRACKER-x-75GR.jpg', '2025-11-25 01:21:57', '2025-11-25 01:37:39');

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

--
-- Volcado de datos para la tabla `sesiones_tracking`
--

INSERT INTO `sesiones_tracking` (`tracking_id`, `usuario_id`, `sesion_temporal`, `ip_address`, `user_agent`, `dispositivo`, `navegador`, `sistema_operativo`, `resolucion_pantalla`, `fuente_trafico`, `medio_trafico`, `campania`, `referrer`, `pagina_entrada`, `fecha_sesion`, `duracion_sesion`) VALUES
(1, 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0', 'desktop', 'Firefox 144.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-13 17:18:08', NULL),
(2, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0', 'desktop', 'Firefox 144.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-13 17:19:01', NULL),
(3, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0', 'desktop', 'Firefox 144.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-13 17:24:02', NULL),
(4, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-17 05:38:34', NULL),
(5, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-17 05:40:02', NULL),
(6, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-17 05:40:12', NULL),
(7, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-17 05:40:48', NULL),
(8, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-17 05:46:38', NULL),
(9, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-17 05:47:57', NULL),
(10, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-17 05:50:49', NULL),
(11, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-17 05:58:26', NULL),
(12, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-17 05:59:39', NULL),
(13, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-17 18:40:48', NULL),
(14, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-17 23:46:25', NULL),
(15, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-17 23:54:06', NULL),
(16, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-17 23:57:24', NULL),
(17, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-18 00:10:33', NULL),
(18, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-18 00:17:51', NULL),
(19, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-18 00:48:18', NULL),
(20, 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-18 00:48:43', NULL),
(21, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-18 00:48:56', NULL),
(22, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-18 00:49:12', NULL),
(23, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-18 00:49:53', NULL),
(24, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-18 00:53:52', NULL),
(25, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-18 00:58:29', NULL),
(26, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-18 18:26:09', NULL),
(27, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-18 18:45:52', NULL),
(28, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-18 20:02:06', NULL),
(29, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-18 20:02:23', NULL),
(30, 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-18 23:25:57', NULL),
(31, 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-18 23:36:08', NULL),
(32, 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-18 23:49:38', NULL),
(33, 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-18 23:49:43', NULL),
(34, 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-19 00:03:03', NULL),
(35, 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-19 00:03:51', NULL),
(36, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-19 04:27:27', NULL),
(37, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-19 04:31:05', NULL),
(38, 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-19 04:44:43', NULL),
(39, 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-19 04:53:55', NULL),
(40, 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-19 04:58:45', NULL),
(41, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-19 05:24:45', NULL),
(42, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-19 05:24:56', NULL),
(43, 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-19 05:31:37', NULL),
(44, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-19 16:05:45', NULL),
(45, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-19 18:00:02', NULL),
(46, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-20 16:17:35', NULL),
(47, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-20 17:56:02', NULL),
(48, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-20 20:54:31', NULL),
(49, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-20 21:43:13', NULL),
(50, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 15:26:15', NULL),
(51, 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 15:26:21', NULL),
(52, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 15:26:33', NULL),
(53, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 15:27:27', NULL),
(54, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 16:19:34', NULL),
(55, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 16:19:45', NULL),
(56, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 16:20:16', NULL),
(57, 6, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 OPR/123.0.0.0', 'desktop', 'Opera 123.0.0.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/register', '2025-11-23 16:40:14', NULL),
(58, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 16:56:56', NULL),
(59, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 17:07:57', NULL),
(60, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 17:08:16', NULL),
(61, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 17:08:28', NULL),
(62, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 17:16:56', NULL),
(63, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 18:34:16', NULL),
(64, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 18:37:41', NULL),
(65, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 19:16:28', NULL),
(66, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 19:17:19', NULL),
(67, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 19:55:38', NULL),
(68, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 19:58:31', NULL),
(69, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 19:59:00', NULL),
(70, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 20:15:57', NULL),
(71, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 20:25:22', NULL),
(72, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 21:09:00', NULL),
(73, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-23 21:20:22', NULL),
(74, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-24 11:49:09', NULL),
(75, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-24 12:10:11', NULL),
(76, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-24 12:29:23', NULL),
(77, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-24 20:42:36', NULL),
(78, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-24 20:42:54', NULL),
(79, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 OPR/123.0.0.0', 'desktop', 'Opera 123.0.0.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 02:09:31', NULL),
(80, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 02:10:04', NULL),
(81, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 04:09:33', NULL),
(82, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 04:21:53', NULL),
(83, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 04:28:50', NULL),
(84, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 06:12:39', NULL),
(85, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 06:23:38', NULL),
(86, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 06:25:59', NULL),
(87, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 06:28:43', NULL),
(88, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 06:29:25', NULL),
(89, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 06:31:18', NULL),
(90, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 06:32:36', NULL),
(91, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 06:40:05', NULL),
(92, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 06:42:40', NULL),
(93, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 06:44:06', NULL),
(94, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 06:46:21', NULL),
(95, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 07:01:09', NULL),
(96, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 07:03:24', NULL),
(97, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 07:03:49', NULL),
(98, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 17:36:35', NULL),
(99, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 17:48:21', NULL),
(100, 6, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 OPR/123.0.0.0', 'desktop', 'Opera 123.0.0.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 19:50:09', NULL),
(101, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 19:50:16', NULL),
(102, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 19:50:55', NULL),
(103, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 21:41:58', NULL),
(104, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 21:53:40', NULL),
(105, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 21:59:25', NULL),
(106, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 22:08:02', NULL),
(107, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 22:28:51', NULL),
(108, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 22:34:36', NULL),
(109, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-25 22:38:13', NULL),
(110, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-26 13:02:53', NULL),
(111, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-26 19:06:18', NULL),
(112, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 01:40:20', NULL),
(113, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 01:43:07', NULL),
(114, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 01:50:50', NULL),
(115, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 01:59:46', NULL),
(116, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 02:20:11', NULL),
(117, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 02:22:46', NULL),
(118, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 02:25:56', NULL),
(119, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 07:22:44', NULL),
(120, 7, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/124.0.0.0', 'desktop', 'Opera 124.0.0.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/register', '2025-11-27 07:24:13', NULL),
(121, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 07:32:50', NULL),
(122, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 14:13:38', NULL),
(123, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 14:16:35', NULL),
(124, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 14:18:30', NULL),
(125, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 14:22:05', NULL),
(126, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 14:38:41', NULL),
(127, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 14:39:21', NULL),
(128, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 14:45:51', NULL),
(129, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 14:47:04', NULL),
(130, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 14:48:46', NULL),
(131, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 14:49:31', NULL),
(132, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 14:52:06', NULL),
(133, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 14:53:04', NULL),
(134, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 14:53:10', NULL),
(135, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 14:53:49', NULL),
(136, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 14:59:16', NULL),
(137, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 14:59:46', NULL),
(138, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 14:59:53', NULL),
(139, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 15:02:43', NULL),
(140, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 15:03:59', NULL),
(141, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 15:04:41', NULL),
(142, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 15:12:50', NULL),
(143, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 15:23:54', NULL),
(144, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 15:27:56', NULL),
(145, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 15:40:26', NULL),
(146, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 15:45:56', NULL),
(147, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 16:30:07', NULL),
(148, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 16:30:48', NULL),
(149, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 16:38:08', NULL),
(150, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 16:50:58', NULL),
(151, 8, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', 'desktop', 'Edge 142.0.0.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/register', '2025-11-27 16:55:52', NULL),
(152, 9, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', 'desktop', 'Edge 142.0.0.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/register', '2025-11-27 16:59:36', NULL),
(153, 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 17:01:47', NULL),
(154, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 17:01:53', NULL),
(155, 9, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', 'desktop', 'Edge 142.0.0.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 17:03:52', NULL),
(156, 10, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', 'desktop', 'Edge 142.0.0.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/register', '2025-11-27 18:22:03', NULL),
(157, 11, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', 'desktop', 'Edge 142.0.0.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/register', '2025-11-27 18:23:44', NULL),
(158, 11, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', 'desktop', 'Edge 142.0.0.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 18:24:31', NULL),
(159, 11, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', 'desktop', 'Edge 142.0.0.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 19:17:25', NULL),
(160, 2, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'desktop', 'Firefox 145.0', 'Windows 10', NULL, NULL, NULL, NULL, 'http://localhost:5173/', '/api/auth/login', '2025-11-27 21:40:35', NULL);

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
(1, 'admin@qhatu.com', '$2b$10$8uAQOLU3fcDjUIhVm6.j8.Kzl.jNfqdcm3nPqFf/LcVw6Kbj/mrE2', 'manual', NULL, NULL, NULL, '2025-11-23 10:26:21', 1, 'Administrador Principal', '962000001', 'Av. Alameda de la República 123', 'Huánuco', 'Huánuco', 'Perú', 'Huánuco', NULL, 'DNI', '70000001', NULL, NULL, 'activo', 1, 0, '2025-11-23 15:26:21', 0, NULL, NULL, NULL, NULL, NULL, 0),
(2, 'vendedor@qhatu.com', '$2b$10$qXzEjQKm3JvobHGiIUmoRuTWJbwxjzygCd.eGRinYQwZ27KDGLlAC', 'manual', NULL, NULL, '2025-11-09 18:23:50', '2025-11-27 16:40:35', 2, 'María Vendedora', '962000002', 'Jr. Dos de Mayo 456', 'Huánuco', 'Huánuco', 'Perú', 'Huánuco', NULL, 'DNI', '70000002', NULL, NULL, 'activo', 1, 0, '2025-11-27 21:40:35', 0, NULL, NULL, NULL, NULL, NULL, 0),
(3, 'almacenero@qhatu.com', '$2b$10$BsXYzeA6Rqp6iNThzEASm.cUdftfAsH5k2ySP9QdL2CM4jxHEMAIu', 'manual', NULL, NULL, '2025-11-09 18:23:50', '2025-11-13 12:22:37', 3, 'Carlos Almacenero', '962000003', 'Av. 28 de Julio 789', 'Huánuco', 'Huánuco', 'Perú', 'Huánuco', NULL, 'DNI', '70000003', NULL, NULL, 'bloqueado', 1, 0, NULL, 5, '2025-11-13 17:52:37', NULL, NULL, NULL, NULL, 0),
(4, 'cliente@qhatu.com', '$2b$10$PLFM53I7OyWYsC4wSq8oM.tBq7N9hY7vnRgrtK79LMGYs4qbIsgLe', 'manual', NULL, NULL, '2025-11-09 18:23:50', '2025-11-27 12:01:47', 4, 'Ana Cliente', '962000004', 'Jr. Progreso 321', 'Huánuco', 'Huánuco', 'Perú', 'Huánuco', NULL, 'DNI', '70000004', NULL, NULL, 'activo', 1, 0, '2025-11-27 17:01:47', 0, NULL, NULL, NULL, NULL, NULL, 0),
(5, 'cliente2@qhatu.com', '$2b$10$pAka.I9DBHj1bKuz8ecyqeHsqygzp/YPrE.VgIjWgageefHZ2uZX2', 'manual', NULL, NULL, '2025-11-09 18:23:50', '2025-11-09 18:23:50', 4, 'Pedro Cliente', '962000005', 'Av. Universitaria 555', 'Amarilis', 'Huánuco', 'Perú', 'Huánuco', NULL, 'DNI', '70000005', NULL, NULL, 'activo', 1, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0),
(6, 'yhoycmdz@gmail.com', '$2b$10$3CYqurxKtYXUnPcxOA66GemW71fbU1HTT2MtNhy4drA25xfCkzOIu', 'manual', NULL, NULL, '2025-11-23 11:40:14', '2025-11-25 14:50:09', 4, 'maynor', '986523741', NULL, NULL, 'Huánuco', 'Perú', 'Huánuco', NULL, 'DNI', NULL, NULL, NULL, 'activo', 0, 0, '2025-11-25 19:50:09', 0, NULL, NULL, NULL, NULL, NULL, 0),
(7, 'jhonnsimp@gmail.com', '$2b$10$Myj8xYjbiLjjcATjNZhDj.oIZSNSWYmC4nfEZrnzCQag.lAPRRQjG', 'manual', NULL, NULL, '2025-11-27 02:24:13', '2025-11-27 02:24:13', 4, 'yhoy', '914679650', NULL, NULL, 'Huánuco', 'Perú', 'Huánuco', NULL, 'DNI', NULL, NULL, NULL, 'activo', 0, 0, '2025-11-27 07:24:13', 0, NULL, NULL, NULL, NULL, NULL, 0),
(8, 'yhoylsd@gmail.com', '$2b$10$0ZxfEJduaA/XN.I97Slo6eEnAiDDnq.kbZEXqWLLe43Kl8r8SiPcC', 'manual', NULL, NULL, '2025-11-27 11:55:52', '2025-11-27 11:55:52', 4, 'juan', '914679650', NULL, NULL, 'Huánuco', 'Perú', 'Huánuco', NULL, 'DNI', NULL, NULL, NULL, 'activo', 0, 0, '2025-11-27 16:55:52', 0, NULL, NULL, NULL, NULL, NULL, 0),
(9, 'yhoisgone@gmail.com', '$2b$10$3NVgv/LVyNEabCzV/Q9NQelmGD4IJmwb6X.jxRRAnyHWXKytOLxku', 'manual', NULL, NULL, '2025-11-27 11:59:36', '2025-11-27 12:03:52', 4, 'pablo', '914679650', NULL, NULL, 'Huánuco', 'Perú', 'Huánuco', NULL, 'DNI', NULL, NULL, NULL, 'activo', 0, 0, '2025-11-27 17:03:52', 0, NULL, NULL, NULL, NULL, NULL, 0),
(10, 'yhoyisback@gmail.com', '$2b$10$Itivn9wnuSpSWKfjtz.9ReT1wclYKA4cDdEBILqkLHp/slpIy2Fw2', 'manual', NULL, NULL, '2025-11-27 13:22:03', '2025-11-27 13:22:03', 4, 'Carlos', '914679650', NULL, NULL, 'Huánuco', 'Perú', 'Huánuco', NULL, 'DNI', NULL, NULL, NULL, 'activo', 0, 0, '2025-11-27 18:22:03', 0, NULL, NULL, NULL, NULL, NULL, 0),
(11, 'leo@gmail.com', '$2b$10$ey8t3xG/MIryQuPoFkvchuWnHJqW.H4bl1jRer7Wal35qqKN7Unc.', 'manual', NULL, NULL, '2025-11-27 13:23:44', '2025-11-27 14:17:25', 4, 'leo', '925725091', NULL, NULL, 'Huánuco', 'Perú', 'Huánuco', NULL, 'DNI', NULL, NULL, NULL, 'activo', 0, 0, '2025-11-27 19:17:25', 0, NULL, NULL, NULL, NULL, NULL, 0);

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
  `numero_venta` varchar(20) NOT NULL COMMENT 'QH-0001, QH-0002, etc.',
  `cliente_nombre` varchar(255) DEFAULT NULL,
  `cliente_email` varchar(255) DEFAULT NULL,
  `cliente_telefono` varchar(20) DEFAULT NULL,
  `cliente_direccion` text DEFAULT NULL,
  `cliente_distrito` varchar(100) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `descuento_total` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','confirmada','procesando','en_preparacion','lista_entrega','en_camino','enviada','entregada','cancelada') DEFAULT 'pendiente',
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
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `enviado_whatsapp` tinyint(1) DEFAULT 0 COMMENT 'Si se envió por WhatsApp',
  `fecha_envio_whatsapp` datetime DEFAULT NULL COMMENT 'Fecha en que se envió por WhatsApp',
  `mensaje_whatsapp` text DEFAULT NULL COMMENT 'Mensaje enviado al vendedor',
  `cliente_notas` text DEFAULT NULL COMMENT 'Notas del cliente sobre el pedido'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `ventas`
--

INSERT INTO `ventas` (`venta_id`, `carrito_id`, `usuario_id`, `vendedor_id`, `numero_venta`, `cliente_nombre`, `cliente_email`, `cliente_telefono`, `cliente_direccion`, `cliente_distrito`, `subtotal`, `descuento_total`, `total`, `estado`, `metodo_pago`, `comprobante_pago`, `notas_venta`, `notas_vendedor`, `notas_entrega`, `pdf_url`, `fecha_venta`, `fecha_confirmacion`, `fecha_entrega`, `fecha_cancelacion`, `actualizado_en`, `enviado_whatsapp`, `fecha_envio_whatsapp`, `mensaje_whatsapp`, `cliente_notas`) VALUES
(1, NULL, 1, 2, 'QH-0001', 'Prueba Trigger', NULL, '999999999', NULL, NULL, 0.00, 0.00, 100.00, 'procesando', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-23 15:50:16', '2025-11-25 17:06:33', NULL, NULL, '2025-11-26 01:51:26', 0, NULL, NULL, NULL),
(2, 1, 4, 2, 'QH-0002', 'Ana Cliente', 'cliente@qhatu.com', '962000004', 'Jr. Progreso 321', 'Huánuco', 72.00, 0.00, 72.00, 'confirmada', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-23 16:02:29', '2025-11-27 15:47:29', NULL, NULL, '2025-11-27 15:47:29', 1, '2025-11-23 11:02:29', 'Hola Qhatu E-commerce 👋\n\nSoy *Ana Cliente*\n\nSolicito la compra del pedido:\n🛍️ Código: *QH-0002*\n💰 Total: *S/.72.00*\n\n¿Cómo puedo proceder con el pago?', NULL),
(3, 4, 4, 2, 'QH-0003', 'Ana Cliente', 'cliente@qhatu.com', '962000004', 'Jr. Progreso 321', 'Huánuco', 49.50, 0.00, 49.50, 'en_preparacion', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-23 16:32:17', '2025-11-25 16:40:33', NULL, NULL, '2025-11-26 01:51:38', 1, '2025-11-23 11:32:17', 'Hola Qhatu E-commerce 👋\n\nSoy *Ana Cliente*\n\nQuiero realizar la compra del pedido:\n\n🛍️ Código: *QH-0003*\n💰 Total: *S/.49.50*\n\n¿Cómo procedo con el pago?', NULL),
(4, 5, 4, NULL, 'QH-0004', 'Ana Cliente', 'cliente@qhatu.com', '962000004', 'Jr. Progreso 321', 'Huánuco', 18.00, 0.00, 18.00, 'lista_entrega', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-23 16:32:41', NULL, NULL, NULL, '2025-11-26 01:51:42', 1, '2025-11-23 11:32:41', 'Hola Qhatu E-commerce 👋\n\nSoy *Ana Cliente*\n\nQuiero realizar la compra del pedido:\n\n🛍️ Código: *QH-0004*\n💰 Total: *S/.18.00*\n\n¿Cómo procedo con el pago?', NULL),
(5, 6, 4, NULL, 'QH-0005', 'Ana Cliente', 'cliente@qhatu.com', '962000004', 'Jr. Progreso 321', 'Huánuco', 10.00, 0.00, 10.00, 'en_camino', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-23 16:35:00', NULL, NULL, NULL, '2025-11-26 01:51:47', 1, '2025-11-23 11:35:00', 'Hola Qhatu E-commerce 👋\n\nSoy *Ana Cliente*\n\nQuiero realizar la compra del pedido:\n\n🛍️ Código: *QH-0005*\n💰 Total: *S/.10.00*\n\n¿Cómo procedo con el pago?', NULL),
(6, 7, 4, NULL, 'QH-0006', 'Ana Cliente', 'cliente@qhatu.com', '962000004', 'Jr. Progreso 321', 'Huánuco', 28.00, 0.00, 28.00, 'enviada', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-23 16:36:47', NULL, NULL, NULL, '2025-11-26 01:51:51', 1, '2025-11-23 11:36:47', 'Hola Qhatu E-commerce 👋\n\nSoy *Ana Cliente*\n\nQuiero realizar la compra del pedido:\n\n🛍️ Código: *QH-0006*\n💰 Total: *S/.28.00*\n\n¿Cómo procedo con el pago?', NULL),
(7, 9, 6, NULL, 'QH-0007', 'maynor', 'yhoycmdz@gmail.com', '986523741', 'Por confirmar', NULL, 36.00, 0.00, 36.00, 'enviada', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-23 16:40:31', NULL, NULL, NULL, '2025-11-26 01:51:54', 1, '2025-11-23 11:40:31', 'Hola Qhatu E-commerce 👋\n\nSoy *maynor*\n\nQuiero realizar la compra del pedido:\n\n🛍️ Código: *QH-0007*\n💰 Total: *S/.36.00*\n\n¿Cómo procedo con el pago?', NULL),
(8, 10, 6, 2, 'QH-0008', 'maynor', 'yhoycmdz@gmail.com', '986523741', 'Por confirmar', NULL, 43.00, 52.50, 43.00, 'entregada', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-23 16:41:18', '2025-11-25 17:39:59', NULL, NULL, '2025-11-26 01:51:59', 1, '2025-11-23 11:41:18', 'Hola Qhatu E-commerce 👋\n\nSoy *maynor*\n\nQuiero realizar la compra del pedido:\n\n🛍️ Código: *QH-0008*\n💰 Total: *S/.43.00*\n\n¿Cómo procedo con el pago?', NULL),
(9, 8, 4, NULL, 'QH-0009', 'Ana Cliente', 'cliente@qhatu.com', '962000004', 'Jr. Progreso 321', 'Huánuco', 133.50, 52.50, 133.50, 'cancelada', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-23 16:43:00', NULL, NULL, NULL, '2025-11-26 01:52:04', 1, '2025-11-23 11:43:00', 'Hola Qhatu E-commerce 👋\n\nSoy *Ana Cliente*\n\nQuiero realizar la compra del pedido:\n\n🛍️ Código: *QH-0009*\n💰 Total: *S/.133.50*\n\n¿Cómo procedo con el pago?', NULL),
(10, 12, 4, 2, 'QH-0010', 'Ana Cliente', 'cliente@qhatu.com', '962000004', 'Jr. Progreso 321', 'Huánuco', 62.00, 0.00, 62.00, 'confirmada', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-23 16:54:25', '2025-11-25 17:10:30', NULL, NULL, '2025-11-25 17:10:30', 1, '2025-11-23 11:54:25', 'Hola Qhatu E-commerce 👋\n\nSoy *Ana Cliente*\n\nQuiero realizar la compra del pedido:\n\n🛍️ Código: *QH-0010*\n💰 Total: *S/.62.00*\n\n¿Cómo procedo con el pago?', NULL),
(11, 11, 6, 2, 'QH-0011', 'maynor', 'yhoycmdz@gmail.com', '986523741', 'Por confirmar', NULL, 36.00, 0.00, 36.00, 'confirmada', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-23 17:08:44', '2025-11-25 17:38:24', NULL, NULL, '2025-11-25 17:38:24', 1, '2025-11-23 12:08:44', 'Hola Qhatu E-commerce 👋\n\nSoy *maynor*\n\nQuiero realizar la compra del pedido:\n\n🛍️ Código: *QH-0011*\n💰 Total: *S/.36.00*\n\n¿Cómo procedo con el pago?', NULL),
(12, 14, 6, 2, 'QH-0012', 'maynor', 'yhoycmdz@gmail.com', '986523741', 'Por confirmar', NULL, 40.50, 0.00, 40.50, 'confirmada', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-23 20:09:35', '2025-11-25 17:39:36', NULL, NULL, '2025-11-25 17:39:36', 1, '2025-11-23 15:09:35', 'Hola Qhatu E-commerce 👋\n\nSoy *maynor*\n\nQuiero realizar la compra del pedido:\n\n🛍️ Código: *QH-0012*\n💰 Total: *S/.40.50*\n\n¿Cómo procedo con el pago?', NULL),
(13, 15, 6, 2, 'QH-0013', 'maynor', 'yhoycmdz@gmail.com', '986523741', 'Por confirmar', NULL, 56.65, 34.85, 56.65, 'cancelada', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-25 19:50:31', '2025-11-25 21:42:34', NULL, NULL, '2025-11-26 01:50:10', 1, '2025-11-25 14:50:31', 'Hola Qhatu E-commerce 👋\n\nSoy *maynor*\n\nQuiero realizar la compra del pedido:\n\n🛍️ Código: *QH-0013*\n💰 Total: *S/.56.65*\n\n¿Cómo procedo con el pago?', NULL),
(14, NULL, 4, 2, 'QH-0014', 'Ana Cliente', 'cliente@qhatu.com', '962000004', 'Jr. Progreso 321', 'Huánuco', 85.50, 0.00, 85.50, 'confirmada', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-21 01:27:39', '2025-11-21 01:27:39', NULL, NULL, '2025-11-26 01:27:39', 0, NULL, NULL, NULL),
(15, NULL, 4, 2, 'QH-0015', 'Ana Cliente', 'cliente@qhatu.com', '962000004', 'Jr. Progreso 321', 'Huánuco', 62.00, 0.00, 62.00, 'confirmada', 'yape', NULL, NULL, NULL, NULL, NULL, '2025-11-16 01:28:52', '2025-11-16 01:28:52', NULL, NULL, '2025-11-26 01:28:52', 0, NULL, NULL, NULL),
(16, NULL, 4, 2, 'QH-0016', 'Ana Cliente', 'cliente@qhatu.com', '962000004', 'Jr. Progreso 321', 'Huánuco', 45.50, 0.00, 45.50, 'confirmada', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-11 01:28:52', '2025-11-11 01:28:52', NULL, NULL, '2025-11-26 01:28:52', 0, NULL, NULL, NULL),
(17, NULL, 5, 2, 'QH-0017', 'Pedro Cliente', 'cliente2@qhatu.com', '962000005', 'Av. Universitaria 555', 'Amarilis', 38.50, 0.00, 38.50, 'confirmada', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-06 01:28:52', '2025-11-07 01:28:52', NULL, NULL, '2025-11-26 01:28:52', 0, NULL, NULL, NULL),
(18, NULL, 5, 2, 'QH-0018', 'Pedro Cliente', 'cliente2@qhatu.com', '962000005', 'Av. Universitaria 555', 'Amarilis', 25.00, 0.00, 25.00, 'cancelada', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-10-12 01:28:52', NULL, NULL, '2025-10-13 01:28:52', '2025-11-26 01:28:52', 0, NULL, NULL, NULL),
(20, NULL, 4, 2, 'QH-001', 'Ana Cliente', 'cliente@qhatu.com', '962000004', NULL, 'Huánuco', 85.50, 0.00, 85.50, 'confirmada', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-21 12:48:00', '2025-11-21 12:48:00', NULL, NULL, '2025-11-26 12:48:00', 0, NULL, NULL, NULL),
(21, 17, 7, 2, 'QH-0019', 'yhoy', 'jhonnsimp@gmail.com', '914679650', 'Por confirmar', NULL, 60.32, 2.68, 60.32, 'confirmada', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-27 07:24:29', '2025-11-27 07:34:18', NULL, NULL, '2025-11-27 07:34:18', 1, '2025-11-27 02:24:29', 'Hola Qhatu E-commerce 👋\n\nSoy *yhoy*\n\nQuiero realizar la compra del pedido:\n\n🛍️ Código: *QH-0019*\n💰 Total: *S/.60.32*\n\n¿Cómo procedo con el pago?', NULL),
(22, 18, 7, 2, 'QH-0020', 'yhoy', 'jhonnsimp@gmail.com', '914679650', 'Por confirmar', NULL, 53.99, 2.01, 53.99, 'confirmada', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-27 15:01:23', '2025-11-27 15:47:16', NULL, NULL, '2025-11-27 15:47:16', 1, '2025-11-27 10:01:23', 'Hola Qhatu E-commerce 👋\n\nSoy *yhoy*\n\nQuiero realizar la compra del pedido:\n\n🛍️ Código: *QH-0020*\n💰 Total: *S/.53.99*\n\n¿Cómo procedo con el pago?', NULL),
(23, 19, 7, 2, 'QH-0021', 'yhoy', 'jhonnsimp@gmail.com', '914679650', 'Por confirmar', NULL, 45.00, 0.00, 45.00, 'confirmada', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-27 15:05:03', '2025-11-27 15:47:22', NULL, NULL, '2025-11-27 15:47:22', 1, '2025-11-27 10:05:03', 'Hola Qhatu E-commerce 👋\n\nSoy *yhoy*\n\nQuiero realizar la compra del pedido:\n\n🛍️ Código: *QH-0021*\n💰 Total: *S/.45.00*\n\n¿Cómo procedo con el pago?', NULL),
(24, 21, 8, NULL, 'QH-0022', 'juan', 'yhoylsd@gmail.com', '914679650', 'Por confirmar', NULL, 38.00, 0.00, 38.00, 'pendiente', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-27 16:56:30', NULL, NULL, NULL, '2025-11-27 16:56:30', 1, '2025-11-27 11:56:30', 'Hola Qhatu E-commerce 👋\n\nSoy *juan*\n\nQuiero realizar la compra del pedido:\n\n🛍️ Código: *QH-0022*\n💰 Total: *S/.38.00*\n\n¿Cómo procedo con el pago?', NULL),
(25, 23, 9, NULL, 'QH-0023', 'pablo', 'yhoisgone@gmail.com', '914679650', 'Por confirmar', NULL, 27.25, 0.00, 27.25, 'pendiente', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-27 16:59:55', NULL, NULL, NULL, '2025-11-27 16:59:55', 1, '2025-11-27 11:59:55', 'Hola Qhatu E-commerce 👋\n\nSoy *pablo*\n\nQuiero realizar la compra del pedido:\n\n🛍️ Código: *QH-0023*\n💰 Total: *S/.27.25*\n\n¿Cómo procedo con el pago?', NULL),
(26, 24, 9, 2, 'QH-0024', 'pablo', 'yhoisgone@gmail.com', '914679650', 'Por confirmar', NULL, 46.92, 4.05, 46.92, 'confirmada', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-27 17:04:11', '2025-11-27 17:04:42', NULL, NULL, '2025-11-27 17:04:42', 1, '2025-11-27 12:04:11', 'Hola Qhatu E-commerce 👋\n\nSoy *pablo*\n\nQuiero realizar la compra del pedido:\n\n🛍️ Código: *QH-0024*\n💰 Total: *S/.46.92*\n\n¿Cómo procedo con el pago?', NULL),
(27, 27, 11, 2, 'QH-0025', 'leo', 'leo@gmail.com', '925725091', 'Por confirmar', NULL, 46.78, 2.70, 46.78, 'confirmada', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-27 18:24:52', '2025-11-27 18:26:07', NULL, NULL, '2025-11-27 18:26:07', 1, '2025-11-27 13:24:52', 'Hola Qhatu E-commerce 👋\n\nSoy *leo*\n\nQuiero realizar la compra del pedido:\n\n🛍️ Código: *QH-0025*\n💰 Total: *S/.46.78*\n\n¿Cómo procedo con el pago?', NULL),
(28, 28, 11, 2, 'QH-0026', 'leo', 'leo@gmail.com', '925725091', 'Por confirmar', NULL, 34.00, 0.00, 34.00, 'confirmada', 'whatsapp_pago', NULL, NULL, NULL, NULL, NULL, '2025-11-27 19:17:50', '2025-11-27 19:18:44', NULL, NULL, '2025-11-27 19:18:44', 1, '2025-11-27 14:17:50', 'Hola Qhatu E-commerce 👋\n\nSoy *leo*\n\nQuiero realizar la compra del pedido:\n\n🛍️ Código: *QH-0026*\n💰 Total: *S/.34.00*\n\n¿Cómo procedo con el pago?', NULL);

--
-- Disparadores `ventas`
--
DELIMITER $$
CREATE TRIGGER `before_insert_venta_qhatu` BEFORE INSERT ON `ventas` FOR EACH ROW BEGIN
  DECLARE next_number INT;
  
  -- Solo generar si no viene numero_venta
  IF NEW.numero_venta IS NULL OR NEW.numero_venta = '' THEN
    -- Obtener el siguiente número
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_venta, 4) AS UNSIGNED)), 0) + 1 
    INTO next_number
    FROM ventas
    WHERE numero_venta LIKE 'QH-%';
    
    -- Generar el número con formato QH-XXXX (padding de 4 dígitos)
    SET NEW.numero_venta = CONCAT('QH-', LPAD(next_number, 4, '0'));
  END IF;
END
$$
DELIMITER ;
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
-- Estructura de tabla para la tabla `ventas_realizadas`
--

CREATE TABLE `ventas_realizadas` (
  `venta_realizada_id` int(11) NOT NULL,
  `venta_id` int(11) NOT NULL COMMENT 'Referencia a tabla ventas',
  `numero_venta` varchar(20) NOT NULL COMMENT 'QH-0001, etc',
  `cliente_id` int(11) DEFAULT NULL COMMENT 'Usuario registrado',
  `cliente_nombre` varchar(255) NOT NULL,
  `cliente_email` varchar(255) DEFAULT NULL,
  `cliente_telefono` varchar(20) DEFAULT NULL,
  `cliente_documento` varchar(20) DEFAULT NULL,
  `cliente_tipo` enum('registrado','invitado') DEFAULT 'invitado',
  `vendedor_id` int(11) NOT NULL COMMENT 'Usuario vendedor',
  `vendedor_nombre` varchar(255) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `descuento_total` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `metodo_pago` enum('whatsapp_pago','yape','plin','transferencia','efectivo') DEFAULT 'whatsapp_pago',
  `cantidad_productos` int(11) NOT NULL COMMENT 'Total de productos diferentes',
  `cantidad_items` int(11) NOT NULL COMMENT 'Total de unidades vendidas',
  `margen_beneficio` decimal(10,2) DEFAULT NULL COMMENT 'Si tienes costo de productos',
  `comision_vendedor` decimal(10,2) DEFAULT NULL COMMENT 'Si aplica',
  `hora_venta` time NOT NULL COMMENT 'Hora exacta',
  `dia_semana` tinyint(4) NOT NULL COMMENT '1=Lunes, 7=Domingo',
  `mes` tinyint(4) NOT NULL COMMENT '1-12',
  `anio` year(4) NOT NULL,
  `trimestre` tinyint(4) NOT NULL COMMENT '1-4',
  `ciudad` varchar(100) DEFAULT 'Huánuco',
  `distrito` varchar(100) DEFAULT NULL,
  `departamento` varchar(100) DEFAULT 'Huánuco',
  `fecha_venta` datetime NOT NULL,
  `fecha_confirmacion` datetime NOT NULL COMMENT 'Cuando el vendedor confirmó',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro completo de ventas realizadas para análisis y BI';

--
-- Volcado de datos para la tabla `ventas_realizadas`
--

INSERT INTO `ventas_realizadas` (`venta_realizada_id`, `venta_id`, `numero_venta`, `cliente_id`, `cliente_nombre`, `cliente_email`, `cliente_telefono`, `cliente_documento`, `cliente_tipo`, `vendedor_id`, `vendedor_nombre`, `subtotal`, `descuento_total`, `total`, `metodo_pago`, `cantidad_productos`, `cantidad_items`, `margen_beneficio`, `comision_vendedor`, `hora_venta`, `dia_semana`, `mes`, `anio`, `trimestre`, `ciudad`, `distrito`, `departamento`, `fecha_venta`, `fecha_confirmacion`, `fecha_registro`) VALUES
(1, 2, 'QH-0002', 4, 'Ana Cliente', 'cliente@qhatu.com', '962000004', NULL, 'registrado', 2, 'María Vendedora', 72.00, 0.00, 72.00, 'whatsapp_pago', 5, 20, NULL, NULL, '11:38:42', 3, 11, '2025', 4, 'Huánuco', 'Huánuco', 'Huánuco', '2025-11-23 11:02:29', '2025-11-25 11:38:42', '2025-11-25 16:38:42'),
(2, 3, 'QH-0003', 4, 'Ana Cliente', 'cliente@qhatu.com', '962000004', NULL, 'registrado', 2, 'María Vendedora', 49.50, 0.00, 49.50, 'whatsapp_pago', 1, 11, NULL, NULL, '11:40:33', 3, 11, '2025', 4, 'Huánuco', 'Huánuco', 'Huánuco', '2025-11-23 11:32:17', '2025-11-25 11:40:33', '2025-11-25 16:40:33'),
(3, 1, 'QH-0001', 1, 'Prueba Trigger', 'sin-email@qhatu.com', '999999999', NULL, 'registrado', 2, 'María Vendedora', 0.00, 0.00, 100.00, 'whatsapp_pago', 0, 0, NULL, NULL, '12:06:33', 3, 11, '2025', 4, 'Huánuco', 'Huánuco', 'Huánuco', '2025-11-23 10:50:16', '2025-11-25 12:06:33', '2025-11-25 17:06:33'),
(4, 10, 'QH-0010', 4, 'Ana Cliente', 'cliente@qhatu.com', '962000004', NULL, 'registrado', 2, 'María Vendedora', 62.00, 0.00, 62.00, 'whatsapp_pago', 3, 16, NULL, NULL, '12:10:30', 3, 11, '2025', 4, 'Huánuco', 'Huánuco', 'Huánuco', '2025-11-23 11:54:25', '2025-11-25 12:10:30', '2025-11-25 17:10:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas_realizadas_items`
--

CREATE TABLE `ventas_realizadas_items` (
  `item_id` int(11) NOT NULL,
  `venta_realizada_id` int(11) NOT NULL,
  `producto_id` int(11) DEFAULT NULL COMMENT 'Referencia si existe',
  `producto_nombre` varchar(255) NOT NULL,
  `producto_codigo` varchar(50) DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `categoria_nombre` varchar(100) DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `precio_descuento` decimal(10,2) DEFAULT NULL,
  `precio_final` decimal(10,2) NOT NULL COMMENT 'Precio usado en la venta',
  `subtotal` decimal(10,2) NOT NULL,
  `descuento_porcentaje` decimal(5,2) DEFAULT NULL,
  `descuento_monto` decimal(10,2) DEFAULT 0.00,
  `stock_antes` int(11) DEFAULT NULL COMMENT 'Stock antes de la venta',
  `stock_despues` int(11) DEFAULT NULL COMMENT 'Stock después de la venta',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Detalle de productos vendidos en cada venta realizada';

--
-- Volcado de datos para la tabla `ventas_realizadas_items`
--

INSERT INTO `ventas_realizadas_items` (`item_id`, `venta_realizada_id`, `producto_id`, `producto_nombre`, `producto_codigo`, `categoria_id`, `categoria_nombre`, `cantidad`, `precio_unitario`, `precio_descuento`, `precio_final`, `subtotal`, `descuento_porcentaje`, `descuento_monto`, `stock_antes`, `stock_despues`, `fecha_registro`) VALUES
(1, 1, 15, 'Caramelos de menta', '15', 10, 'Ramen y Fideos', 4, 2.50, NULL, 2.50, 10.00, NULL, 0.00, 24, 20, '2025-11-25 16:38:42'),
(2, 1, 9, 'Caramelos de menta', '9', 14, 'Bebidas', 4, 2.50, NULL, 2.50, 10.00, NULL, 0.00, 124, 120, '2025-11-25 16:38:42'),
(3, 1, 8, 'Gomitas Haribo', '8', 14, 'Bebidas', 3, 4.00, NULL, 4.00, 12.00, NULL, 0.00, 83, 80, '2025-11-25 16:38:42'),
(4, 1, 14, 'Gomitas Haribo', '14', 18, 'Licores', 1, 4.00, NULL, 4.00, 4.00, NULL, 0.00, 81, 80, '2025-11-25 16:38:42'),
(5, 1, NULL, 'Cheetos Flamin Hot', NULL, NULL, 'General', 4, 4.50, NULL, 4.50, 18.00, NULL, 0.00, 0, 0, '2025-11-25 16:38:42'),
(6, 1, 12, 'Cheetos Flamin Hot', '12', 18, 'Licores', 4, 4.50, NULL, 4.50, 18.00, NULL, 0.00, 74, 70, '2025-11-25 16:38:42'),
(8, 2, 12, 'Cheetos Flamin Hot', '12', 18, 'Licores', 5, 4.50, NULL, 4.50, 22.50, NULL, 0.00, 75, 70, '2025-11-25 16:40:33'),
(9, 2, NULL, 'Cheetos Flamin Hot', NULL, NULL, 'General', 6, 4.50, NULL, 4.50, 27.00, NULL, 0.00, 0, 0, '2025-11-25 16:40:33'),
(11, 4, 12, 'Cheetos Flamin Hot', '12', 18, 'Licores', 5, 4.50, NULL, 4.50, 22.50, NULL, 0.00, 75, 70, '2025-11-25 17:10:30'),
(12, 4, 12, 'Cheetos Flamin Hot', '12', 18, 'Licores', 6, 4.50, NULL, 4.50, 27.00, NULL, 0.00, 76, 70, '2025-11-25 17:10:30'),
(13, 4, 15, 'Caramelos de menta', '15', 10, 'Ramen y Fideos', 3, 2.50, NULL, 2.50, 7.50, NULL, 0.00, 23, 20, '2025-11-25 17:10:30'),
(14, 4, 9, 'Caramelos de menta', '9', 14, 'Bebidas', 2, 2.50, NULL, 2.50, 5.00, NULL, 0.00, 122, 120, '2025-11-25 17:10:30');

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

--
-- Volcado de datos para la tabla `venta_historial`
--

INSERT INTO `venta_historial` (`historial_id`, `venta_id`, `usuario_id`, `accion`, `estado_anterior`, `estado_nuevo`, `descripcion`, `metadatos`, `fecha`) VALUES
(1, 2, 2, 'cambio_estado', 'pendiente', 'confirmada', 'Estado cambiado de pendiente a confirmada', NULL, '2025-11-25 16:38:42'),
(2, 3, 2, 'cambio_estado', 'pendiente', 'confirmada', 'Estado cambiado de pendiente a confirmada', NULL, '2025-11-25 16:40:33'),
(3, 1, 2, 'cambio_estado', 'pendiente', 'confirmada', 'Estado cambiado de pendiente a confirmada', NULL, '2025-11-25 17:06:33'),
(4, 10, 2, 'cambio_estado', 'pendiente', 'confirmada', 'Estado cambiado de pendiente a confirmada', NULL, '2025-11-25 17:10:30'),
(5, 11, 2, 'cambio_estado', 'pendiente', 'confirmada', 'Estado cambiado de pendiente a confirmada', NULL, '2025-11-25 17:38:24'),
(6, 12, 2, 'cambio_estado', 'pendiente', 'confirmada', 'Estado cambiado de pendiente a confirmada', NULL, '2025-11-25 17:39:36'),
(7, 8, 2, 'cambio_estado', 'pendiente', 'confirmada', 'Estado cambiado de pendiente a confirmada', NULL, '2025-11-25 17:39:59'),
(8, 13, 2, 'cambio_estado', 'pendiente', 'confirmada', 'Estado cambiado de pendiente a confirmada', NULL, '2025-11-25 21:42:34'),
(9, 13, 2, 'cambio_estado', 'confirmada', 'cancelada', 'Estado cambiado de confirmada a cancelada', NULL, '2025-11-26 01:50:10'),
(10, 1, 2, 'cambio_estado', 'confirmada', 'procesando', 'Estado cambiado de confirmada a procesando', NULL, '2025-11-26 01:51:26'),
(11, 2, 2, 'cambio_estado', 'confirmada', 'pendiente', 'Estado cambiado de confirmada a pendiente', NULL, '2025-11-26 01:51:31'),
(12, 3, 2, 'cambio_estado', 'confirmada', 'en_preparacion', 'Estado cambiado de confirmada a en_preparacion', NULL, '2025-11-26 01:51:38'),
(13, 4, NULL, 'cambio_estado', 'pendiente', 'lista_entrega', 'Estado cambiado de pendiente a lista_entrega', NULL, '2025-11-26 01:51:42'),
(14, 5, NULL, 'cambio_estado', 'pendiente', 'en_camino', 'Estado cambiado de pendiente a en_camino', NULL, '2025-11-26 01:51:47'),
(15, 6, NULL, 'cambio_estado', 'pendiente', 'enviada', 'Estado cambiado de pendiente a enviada', NULL, '2025-11-26 01:51:51'),
(16, 7, NULL, 'cambio_estado', 'pendiente', 'enviada', 'Estado cambiado de pendiente a enviada', NULL, '2025-11-26 01:51:54'),
(17, 8, 2, 'cambio_estado', 'confirmada', 'entregada', 'Estado cambiado de confirmada a entregada', NULL, '2025-11-26 01:51:59'),
(18, 9, NULL, 'cambio_estado', 'pendiente', 'cancelada', 'Estado cambiado de pendiente a cancelada', NULL, '2025-11-26 01:52:04'),
(19, 21, 2, 'cambio_estado', 'pendiente', 'confirmada', 'Estado cambiado de pendiente a confirmada', NULL, '2025-11-27 07:34:18'),
(20, 22, 2, 'cambio_estado', 'pendiente', 'confirmada', 'Estado cambiado de pendiente a confirmada', NULL, '2025-11-27 15:47:16'),
(21, 23, 2, 'cambio_estado', 'pendiente', 'confirmada', 'Estado cambiado de pendiente a confirmada', NULL, '2025-11-27 15:47:22'),
(22, 2, 2, 'cambio_estado', 'pendiente', 'confirmada', 'Estado cambiado de pendiente a confirmada', NULL, '2025-11-27 15:47:29'),
(23, 26, 2, 'cambio_estado', 'pendiente', 'confirmada', 'Estado cambiado de pendiente a confirmada', NULL, '2025-11-27 17:04:42'),
(24, 27, 2, 'cambio_estado', 'pendiente', 'confirmada', 'Estado cambiado de pendiente a confirmada', NULL, '2025-11-27 18:26:07'),
(25, 28, 2, 'cambio_estado', 'pendiente', 'confirmada', 'Estado cambiado de pendiente a confirmada', NULL, '2025-11-27 19:18:44');

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
  `subtotal` decimal(10,2) NOT NULL,
  `producto_codigo` varchar(50) DEFAULT NULL COMMENT 'Código del producto (snapshot)',
  `producto_url_imagen` varchar(500) DEFAULT NULL COMMENT 'Imagen del producto (snapshot)',
  `creado_en` datetime DEFAULT current_timestamp() COMMENT 'Fecha de creación'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `venta_items`
--

INSERT INTO `venta_items` (`item_id`, `venta_id`, `producto_id`, `producto_nombre`, `producto_descripcion`, `producto_imagen`, `cantidad`, `precio_unitario`, `precio_descuento`, `subtotal`, `producto_codigo`, `producto_url_imagen`, `creado_en`) VALUES
(1, 2, 15, 'Caramelos de menta', 'Caramelos refrescantes', NULL, 4, 2.50, NULL, 10.00, NULL, '/awaiting-image.jpeg', '2025-11-23 11:02:29'),
(2, 2, 9, 'Caramelos de menta', 'Caramelos refrescantes', NULL, 4, 2.50, NULL, 10.00, NULL, '/awaiting-image.jpeg', '2025-11-23 11:02:29'),
(3, 2, 8, 'Gomitas Haribo', 'Gomitas de frutas importadas', NULL, 3, 4.00, NULL, 12.00, NULL, '/awaiting-image.jpeg', '2025-11-23 11:02:29'),
(4, 2, 14, 'Gomitas Haribo', 'Gomitas de frutas importadas', NULL, 1, 4.00, NULL, 4.00, NULL, '/awaiting-image.jpeg', '2025-11-23 11:02:29'),
(5, 2, 12, 'Cheetos Flamin Hot', 'Snack picante de queso', NULL, 4, 4.50, NULL, 18.00, NULL, '/awaiting-image.jpeg', '2025-11-23 11:02:29'),
(6, 2, 12, 'Cheetos Flamin Hot', 'Snack picante de queso', NULL, 4, 4.50, NULL, 18.00, NULL, '/awaiting-image.jpeg', '2025-11-23 11:02:29'),
(7, 3, 12, 'Cheetos Flamin Hot', 'Snack picante de queso', NULL, 5, 4.50, NULL, 22.50, NULL, '/awaiting-image.jpeg', '2025-11-23 11:32:17'),
(8, 3, 12, 'Cheetos Flamin Hot', 'Snack picante de queso', NULL, 6, 4.50, NULL, 27.00, NULL, '/awaiting-image.jpeg', '2025-11-23 11:32:17'),
(9, 4, 12, 'Cheetos Flamin Hot', 'Snack picante de queso', NULL, 4, 4.50, NULL, 18.00, NULL, '/awaiting-image.jpeg', '2025-11-23 11:32:41'),
(10, 5, 15, 'Caramelos de menta', 'Caramelos refrescantes', NULL, 4, 2.50, NULL, 10.00, NULL, '/awaiting-image.jpeg', '2025-11-23 11:35:00'),
(11, 6, 15, 'Caramelos de menta', 'Caramelos refrescantes', NULL, 4, 2.50, NULL, 10.00, NULL, '/awaiting-image.jpeg', '2025-11-23 11:36:47'),
(12, 6, 12, 'Cheetos Flamin Hot', 'Snack picante de queso', NULL, 4, 4.50, NULL, 18.00, NULL, '/awaiting-image.jpeg', '2025-11-23 11:36:47'),
(13, 7, 12, 'Cheetos Flamin Hot', 'Snack picante de queso', NULL, 4, 4.50, NULL, 18.00, NULL, '/awaiting-image.jpeg', '2025-11-23 11:40:31'),
(14, 7, 12, 'Cheetos Flamin Hot', 'Snack picante de queso', NULL, 4, 4.50, NULL, 18.00, NULL, '/awaiting-image.jpeg', '2025-11-23 11:40:31'),
(15, 8, 12, 'Cheetos Flamin Hot', 'Snack picante de queso', NULL, 4, 4.50, NULL, 18.00, NULL, '/awaiting-image.jpeg', '2025-11-23 11:41:18'),
(16, 8, 1, 'Chocolate Suizo Premium', 'Chocolate artesanal importado de Suiza', NULL, 5, 15.50, 5.00, 25.00, NULL, 'https://i.pinimg.com/1200x/76/a3/c8/76a3c806f18b72096ef2895d5d53fa21.jpg', '2025-11-23 11:41:18'),
(17, 9, 1, 'Chocolate Suizo Premium', 'Chocolate artesanal importado de Suiza', NULL, 5, 15.50, 5.00, 25.00, NULL, 'https://i.pinimg.com/1200x/76/a3/c8/76a3c806f18b72096ef2895d5d53fa21.jpg', '2025-11-23 11:43:00'),
(18, 9, 1, 'Chocolate Suizo Premium', 'Chocolate artesanal importado de Suiza', NULL, 7, 15.50, NULL, 108.50, NULL, '/images/chocolate_suizo.png', '2025-11-23 11:43:00'),
(19, 10, 12, 'Cheetos Flamin Hot', 'Snack picante de queso', NULL, 5, 4.50, NULL, 22.50, NULL, '/awaiting-image.jpeg', '2025-11-23 11:54:25'),
(20, 10, 12, 'Cheetos Flamin Hot', 'Snack picante de queso', NULL, 6, 4.50, NULL, 27.00, NULL, '/awaiting-image.jpeg', '2025-11-23 11:54:25'),
(21, 10, 15, 'Caramelos de menta', 'Caramelos refrescantes', NULL, 3, 2.50, NULL, 7.50, NULL, '/awaiting-image.jpeg', '2025-11-23 11:54:25'),
(22, 10, 9, 'Caramelos de menta', 'Caramelos refrescantes', NULL, 2, 2.50, NULL, 5.00, NULL, '/awaiting-image.jpeg', '2025-11-23 11:54:25'),
(23, 11, 12, 'Cheetos Flamin Hot', 'Snack picante de queso', NULL, 4, 4.50, NULL, 18.00, NULL, '/awaiting-image.jpeg', '2025-11-23 12:08:44'),
(24, 11, 12, 'Cheetos Flamin Hot', 'Snack picante de queso', NULL, 4, 4.50, NULL, 18.00, NULL, '/awaiting-image.jpeg', '2025-11-23 12:08:44'),
(25, 12, 12, 'Cheetos Flamin Hot', 'Snack picante de queso', NULL, 4, 4.50, NULL, 18.00, NULL, '/awaiting-image.jpeg', '2025-11-23 15:09:35'),
(26, 12, 12, 'Cheetos Flamin Hot', 'Snack picante de queso', NULL, 5, 4.50, NULL, 22.50, NULL, '/awaiting-image.jpeg', '2025-11-23 15:09:35'),
(27, 13, 1, 'BON BONG UVA 238 ML', 'Es una bebida sabor a uva que contiene pulpa real, azúcar, agua y saborizantes permitidos. Presentación individual de 238 ml.\r\n\r\nPrecio de la caja (12 unidades): S/ XX.XX\r\n\r\nAlérgenos: Puede contener trazas de sulfitos derivados del proceso de la uva. No apto para personas sensibles a colorantes artificiales', NULL, 3, 15.50, 5.00, 15.00, NULL, 'https://asiaonmart.com/wp-content/uploads/2020/08/WEB_BongBongChico_Frontal.jpg', '2025-11-25 14:50:31'),
(28, 13, 5, 'CHAPAGURI ANGRY X 140 GR', 'Es un paquete de fideos instantáneos tipo ramen, conocido como Chapaguri Angry (Súper Picante). Se caracteriza por ser una combinación de los fideos Chapagetti (salsa de frijol negro, chajang) y el sabor picante a mariscos del Neoguri. Incluye fideos gruesos y masticables, condimentos que mezclan sabores salados, dulces y picantes intensos, y vegetales deshidratados como zanahoria y alga marina. Se presenta en un paquete individual de 140 g. \r\nPrecio de la caja (40 unidades): S/ 396 .\r\nAlérgenos: Contiene trigo (gluten) y soja, y puede contener ingredientes derivados de mariscos, pescado, huevo, leche, cacahuetes y frutos secos, ya que se elabora en instalaciones compartidas. ', NULL, 5, 4.50, 3.83, 19.15, NULL, 'https://kfood.pe/wp-content/uploads/2024/07/26215beba1278ddbf2dec144692d2ad3-1-Photoroom-1-e1722117519489.png', '2025-11-25 14:50:31'),
(29, 13, 12, 'GOOD DAY SOJU GRANADA 300 ML-13.5 % ALC', 'Es un licor destilado coreano tradicional, conocido como soju (similar al vodka, pero más suave y dulce), de la marca Good Day, sabor a granada. Se caracteriza por su bajo contenido alcohólico para un destilado (13.5% ALC) y un sabor frutal, refrescante y ligeramente dulce. Se presenta en una botella de vidrio individual de 300 ml \r\nPrecio de la caja (12 unidades): S/ 260 \r\nAlérgenos: Contiene alcohol destilado de cereales como trigo o cebada, o almidones como tapioca/patata, y saborizantes, ya que la destilación puede eliminar el gluten, pero la base de cereales es común en la producción de soju.', NULL, 5, 4.50, NULL, 22.50, NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD0pEwySgMnNWkxIDUyutE_0zeEVVnkvtxYQ&s', '2025-11-25 14:50:31'),
(30, 14, 12, 'Cheetos Flamin Hot', NULL, NULL, 8, 4.50, NULL, 36.00, NULL, NULL, '2025-11-25 20:27:40'),
(31, 14, 1, 'BON BONG UVA 238 ML', NULL, NULL, 4, 5.00, NULL, 20.00, NULL, NULL, '2025-11-25 20:27:40'),
(32, 14, 3, 'NEOGURI HOT x 120 GR', NULL, NULL, 5, 5.75, NULL, 28.75, NULL, NULL, '2025-11-25 20:27:40'),
(33, 15, 12, 'Cheetos Flamin Hot', NULL, NULL, 6, 4.50, NULL, 27.00, NULL, NULL, '2025-11-25 20:28:52'),
(34, 15, 2, 'BEBIDA DE PERA 238 ML', NULL, NULL, 4, 8.99, NULL, 35.96, NULL, NULL, '2025-11-25 20:28:52'),
(35, 16, 3, 'NEOGURI HOT x 120 GR', NULL, NULL, 5, 5.75, NULL, 28.75, NULL, NULL, '2025-11-25 20:28:52'),
(36, 16, 12, 'Cheetos Flamin Hot', NULL, NULL, 4, 4.50, NULL, 18.00, NULL, NULL, '2025-11-25 20:28:52'),
(37, 17, 1, 'BON BONG UVA 238 ML', NULL, NULL, 3, 5.00, NULL, 15.00, NULL, NULL, '2025-11-25 20:28:52'),
(38, 17, 3, 'NEOGURI HOT x 120 GR', NULL, NULL, 4, 5.75, NULL, 23.00, NULL, NULL, '2025-11-25 20:28:52'),
(39, 18, 12, 'Cheetos Flamin Hot', NULL, NULL, 5, 4.50, NULL, 22.50, NULL, NULL, '2025-11-25 20:28:52'),
(40, 20, 12, 'Cheetos Flamin Hot', NULL, NULL, 8, 4.50, NULL, 36.00, NULL, NULL, '2025-11-26 07:48:00'),
(41, 20, 1, 'BON BONG UVA 238 ML', NULL, NULL, 4, 5.00, NULL, 20.00, NULL, NULL, '2025-11-26 07:48:00'),
(42, 20, 3, 'NEOGURI HOT x 120 GR', NULL, NULL, 5, 5.75, NULL, 28.75, NULL, NULL, '2025-11-26 07:48:00'),
(43, 21, 16, 'BEBIDAS DE ALOE VERA SURTIDO 450 ML', 'Es un surtido de bebidas frutales con base de aloe vera (Aloe barbadensis Miller), presentadas en botellas individuales de 450 ml. Se caracterizan por contener jugo de aloe vera y trozos de pulpa real de la planta, combinados con jugos y sabores de frutas naturales: piña, sandía original, uva y mango. Son bebidas refrescantes que se asocian con beneficios para la salud digestiva e hidratación.\r\nAlérgenos: Estas bebidas generalmente no contienen alérgenos comunes como gluten, soja o lácteos. Sin embargo, se recomienda a las personas con alergias específicas a las frutas listadas (piña, sandía, uva, mango) que revisen la etiqueta antes de consumir.', NULL, 5, 6.00, NULL, 30.00, NULL, 'https://gw.alicdn.com/imgextra/i4/6000000000247/O1CN01YA7ie51DhAtuRQhHw_!!6000000000247-2-mia.png_.webp', '2025-11-27 02:24:29'),
(44, 21, 15, 'BULDAK CARBONARA 130 GR', 'Es un paquete de fideos instantáneos tipo ramen, conocido como Buldak Carbonara Hot Chicken Flavor Ramen de la marca surcoreana Samyang. Se caracteriza por ser un \"fideo frito\" (salteado) que combina la salsa de pollo picante icónica de la marca con un polvo cremoso sabor a carbonara (queso mozzarella, mantequilla y leche). Se presenta en un paquete individual de 130 g. \r\n\r\nAlérgenos: Contiene trigo (gluten), soja y leche. Es fabricado en instalaciones que también procesan crustáceos, huevos, pescado, moluscos, mostaza, nueces, maní y semillas de sésamo. Personas con estas alergias deben evitar su consumo. ', NULL, 6, 2.50, NULL, 15.00, NULL, 'https://orientalhm.com/cdn/shop/products/90_Carbonara_Buldak_Bokkeum_503x503_d2e08a95-bbee-4075-85d3-97cb1d383089_470x.jpg?v=1616758390', '2025-11-27 02:24:29'),
(45, 21, 5, 'CHAPAGURI ANGRY X 140 GR', 'Es un paquete de fideos instantáneos tipo ramen, conocido como Chapaguri Angry (Súper Picante). Se caracteriza por ser una combinación de los fideos Chapagetti (salsa de frijol negro, chajang) y el sabor picante a mariscos del Neoguri. Incluye fideos gruesos y masticables, condimentos que mezclan sabores salados, dulces y picantes intensos, y vegetales deshidratados como zanahoria y alga marina. Se presenta en un paquete individual de 140 g. \r\nPrecio de la caja (40 unidades): S/ 396 .\r\nAlérgenos: Contiene trigo (gluten) y soja, y puede contener ingredientes derivados de mariscos, pescado, huevo, leche, cacahuetes y frutos secos, ya que se elabora en instalaciones compartidas. ', NULL, 4, 4.50, 3.83, 15.32, NULL, 'https://kfood.pe/wp-content/uploads/2024/07/26215beba1278ddbf2dec144692d2ad3-1-Photoroom-1-e1722117519489.png', '2025-11-27 02:24:29'),
(46, 22, 14, 'GOOD DAY SOJU GREEN APPLE 300 ML-12% ALC', 'Es un licor destilado coreano tradicional, conocido como soju (similar al vodka, pero más suave y dulce), de la marca Good Day, sabor a manzana verde. Se caracteriza por su bajo contenido alcohólico para un destilado  y un sabor frutal, refrescante y ligeramente dulce. Se presenta en una botella de vidrio individual de 300 ml. \r\nPrecio de la caja (20 unidades):S/ 200 \r\nAlérgenos: Contiene alcohol destilado a partir de almidones como arroz, batata, tapioca, trigo o cebada. También contiene azúcar, jarabe de maíz alto en fructosa y saborizantes. Ya que la destilación puede eliminar el gluten, pero la base de cereales es común en la producción de soju.', NULL, 5, 4.00, NULL, 20.00, NULL, 'https://whisky.my/cdn-cgi/image/quality=80,format=auto,onerror=redirect,metadata=none/wp-content/uploads/GOOD-DAY-Apple-Soju-20-Bottles.jpg', '2025-11-27 10:01:23'),
(47, 22, 12, 'GOOD DAY SOJU GRANADA 300 ML-13.5 % ALC', 'Es un licor destilado coreano tradicional, conocido como soju (similar al vodka, pero más suave y dulce), de la marca Good Day, sabor a granada. Se caracteriza por su bajo contenido alcohólico para un destilado (13.5% ALC) y un sabor frutal, refrescante y ligeramente dulce. Se presenta en una botella de vidrio individual de 300 ml \r\nPrecio de la caja (12 unidades): S/ 260 \r\nAlérgenos: Contiene alcohol destilado de cereales como trigo o cebada, o almidones como tapioca/patata, y saborizantes, ya que la destilación puede eliminar el gluten, pero la base de cereales es común en la producción de soju.', NULL, 5, 4.50, NULL, 22.50, NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD0pEwySgMnNWkxIDUyutE_0zeEVVnkvtxYQ&s', '2025-11-27 10:01:23'),
(48, 22, 5, 'CHAPAGURI ANGRY X 140 GR', 'Es un paquete de fideos instantáneos tipo ramen, conocido como Chapaguri Angry (Súper Picante). Se caracteriza por ser una combinación de los fideos Chapagetti (salsa de frijol negro, chajang) y el sabor picante a mariscos del Neoguri. Incluye fideos gruesos y masticables, condimentos que mezclan sabores salados, dulces y picantes intensos, y vegetales deshidratados como zanahoria y alga marina. Se presenta en un paquete individual de 140 g. \r\nPrecio de la caja (40 unidades): S/ 396 .\r\nAlérgenos: Contiene trigo (gluten) y soja, y puede contener ingredientes derivados de mariscos, pescado, huevo, leche, cacahuetes y frutos secos, ya que se elabora en instalaciones compartidas. ', NULL, 3, 4.50, 3.83, 11.49, NULL, 'https://kfood.pe/wp-content/uploads/2024/07/26215beba1278ddbf2dec144692d2ad3-1-Photoroom-1-e1722117519489.png', '2025-11-27 10:01:23'),
(49, 23, 10, 'SOFT DRINK SANTA FE COFFE\r\nORIGINAL 175 ML', 'Es una bebida de café negro de la marca Santa Fe. Se caracteriza por ser una bebida suave lista para beber que combina un sabor a café tostado con un aroma rico y clásico a nuez (avellana), diseñada para ser consumida fría. Se presenta en una lata individual de 175 ml. \r\n\r\nPrecio de la caja (30 unidades):S/ 120 \r\n\r\nAlérgenos: Contiene cafeína y puede contener leche o derivados lácteos. Aunque el saborizante no contiene avellanas reales en la mayoría de los casos. Personas con sensibilidad a la cafeína o alergias a los lácteos/frutos secos deben evitar su consumo. ', NULL, 5, 5.00, NULL, 25.00, NULL, 'https://web.tradekorea.com/product/907/2127907/Beverage,_Drink,_Coffee_-_Santa_Fe_Original,_Santa_Fe_Hazelnuts_175ml_2.jpg', '2025-11-27 10:05:03'),
(50, 23, 8, 'SOFT DRINK LET´S BE MOCHA (CAFÉ&LECHE) 175\r\nML', 'Es una bebida de café con leche coreana de la marca Lotte, que se caracteriza por ser una bebida suave lista para beber tipo café con leche, con un perfil de sabor equilibrado y cremoso. Se presenta en una lata individual de 175 ml.\r\n\r\nPrecio de la caja (30 unidades): S/ XX.XX \r\n\r\nAlérgenos: Contiene leche y cafeína. Personas con sensibilidad o alergias a estos componentes deben evitar su consumo.', NULL, 5, 4.00, NULL, 20.00, NULL, 'https://kfomart.com/wp-content/uploads/2025/05/Lotte-Lets-Be-Mild-Coffee-.svg', '2025-11-27 10:05:03'),
(51, 24, 12, 'GOOD DAY SOJU GRANADA 300 ML-13.5 % ALC', 'Es un licor destilado coreano tradicional, conocido como soju (similar al vodka, pero más suave y dulce), de la marca Good Day, sabor a granada. Se caracteriza por su bajo contenido alcohólico para un destilado (13.5% ALC) y un sabor frutal, refrescante y ligeramente dulce. Se presenta en una botella de vidrio individual de 300 ml \r\nPrecio de la caja (12 unidades): S/ 260 \r\nAlérgenos: Contiene alcohol destilado de cereales como trigo o cebada, o almidones como tapioca/patata, y saborizantes, ya que la destilación puede eliminar el gluten, pero la base de cereales es común en la producción de soju.', NULL, 4, 4.50, NULL, 18.00, NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD0pEwySgMnNWkxIDUyutE_0zeEVVnkvtxYQ&s', '2025-11-27 11:56:30'),
(52, 24, 14, 'GOOD DAY SOJU GREEN APPLE 300 ML-12% ALC', 'Es un licor destilado coreano tradicional, conocido como soju (similar al vodka, pero más suave y dulce), de la marca Good Day, sabor a manzana verde. Se caracteriza por su bajo contenido alcohólico para un destilado  y un sabor frutal, refrescante y ligeramente dulce. Se presenta en una botella de vidrio individual de 300 ml. \r\nPrecio de la caja (20 unidades):S/ 200 \r\nAlérgenos: Contiene alcohol destilado a partir de almidones como arroz, batata, tapioca, trigo o cebada. También contiene azúcar, jarabe de maíz alto en fructosa y saborizantes. Ya que la destilación puede eliminar el gluten, pero la base de cereales es común en la producción de soju.', NULL, 5, 4.00, NULL, 20.00, NULL, 'https://whisky.my/cdn-cgi/image/quality=80,format=auto,onerror=redirect,metadata=none/wp-content/uploads/GOOD-DAY-Apple-Soju-20-Bottles.jpg', '2025-11-27 11:56:30'),
(53, 25, 15, 'BULDAK CARBONARA 130 GR', 'Es un paquete de fideos instantáneos tipo ramen, conocido como Buldak Carbonara Hot Chicken Flavor Ramen de la marca surcoreana Samyang. Se caracteriza por ser un \"fideo frito\" (salteado) que combina la salsa de pollo picante icónica de la marca con un polvo cremoso sabor a carbonara (queso mozzarella, mantequilla y leche). Se presenta en un paquete individual de 130 g. \r\n\r\nAlérgenos: Contiene trigo (gluten), soja y leche. Es fabricado en instalaciones que también procesan crustáceos, huevos, pescado, moluscos, mostaza, nueces, maní y semillas de sésamo. Personas con estas alergias deben evitar su consumo. ', NULL, 4, 2.50, NULL, 10.00, NULL, 'https://orientalhm.com/cdn/shop/products/90_Carbonara_Buldak_Bokkeum_503x503_d2e08a95-bbee-4075-85d3-97cb1d383089_470x.jpg?v=1616758390', '2025-11-27 11:59:55'),
(54, 25, 3, 'NEOGURI HOT x 120 GR', 'Es un paquete de fideos instantáneos tipo udon, sabor mariscos picante, que se caracteriza por tener fideos gruesos, un caldo a base de mariscos, especias picantes y algas marinas deshidratadas. Se presenta en un paquete individual de 120 g.\r\nPrecio de la caja (20 unidades): Aprox. S/ 100 - S/ 120 .\r\nAlérgenos: Contiene trigo (gluten), soja, y ingredientes derivados de mariscos, pescado y crustáceos.', NULL, 3, 5.75, NULL, 17.25, NULL, 'https://kfood.pe/wp-content/uploads/2022/08/SOPA-NEOGURI-UDON-HOT-x-120-GR.jpg', '2025-11-27 11:59:55'),
(55, 26, 16, 'BEBIDAS DE ALOE VERA SURTIDO 450 ML', 'Es un surtido de bebidas frutales con base de aloe vera (Aloe barbadensis Miller), presentadas en botellas individuales de 450 ml. Se caracterizan por contener jugo de aloe vera y trozos de pulpa real de la planta, combinados con jugos y sabores de frutas naturales: piña, sandía original, uva y mango. Son bebidas refrescantes que se asocian con beneficios para la salud digestiva e hidratación.\r\nAlérgenos: Estas bebidas generalmente no contienen alérgenos comunes como gluten, soja o lácteos. Sin embargo, se recomienda a las personas con alergias específicas a las frutas listadas (piña, sandía, uva, mango) que revisen la etiqueta antes de consumir.', NULL, 4, 6.00, NULL, 24.00, NULL, 'https://gw.alicdn.com/imgextra/i4/6000000000247/O1CN01YA7ie51DhAtuRQhHw_!!6000000000247-2-mia.png_.webp', '2025-11-27 12:04:11'),
(56, 26, 2, 'BEBIDA DE PERA 238 ML', 'Es una bebida de pera oriental (nashi) coreana que se caracteriza por contener pulpa de pera real triturada, agua, azúcar y saborizantes permitidos. Se presenta en una lata individual de 238 ml.\r\nPrecio de la caja (12 unidades): S/ 100\r\nAlérgenos: Contiene fruta real (pera). Personas con alergias a las frutas deben evitar su consumo.', NULL, 3, 8.99, 7.64, 22.92, NULL, 'https://asiaonmart.com/wp-content/uploads/2020/05/WEB_JugoPera_Grupal.jpg', '2025-11-27 12:04:11'),
(57, 27, 16, 'BEBIDAS DE ALOE VERA SURTIDO 450 ML', 'Es un surtido de bebidas frutales con base de aloe vera (Aloe barbadensis Miller), presentadas en botellas individuales de 450 ml. Se caracterizan por contener jugo de aloe vera y trozos de pulpa real de la planta, combinados con jugos y sabores de frutas naturales: piña, sandía original, uva y mango. Son bebidas refrescantes que se asocian con beneficios para la salud digestiva e hidratación.\r\nAlérgenos: Estas bebidas generalmente no contienen alérgenos comunes como gluten, soja o lácteos. Sin embargo, se recomienda a las personas con alergias específicas a las frutas listadas (piña, sandía, uva, mango) que revisen la etiqueta antes de consumir.', NULL, 4, 6.00, NULL, 24.00, NULL, 'https://gw.alicdn.com/imgextra/i4/6000000000247/O1CN01YA7ie51DhAtuRQhHw_!!6000000000247-2-mia.png_.webp', '2025-11-27 13:24:52'),
(58, 27, 2, 'BEBIDA DE PERA 238 ML', 'Es una bebida de pera oriental (nashi) coreana que se caracteriza por contener pulpa de pera real triturada, agua, azúcar y saborizantes permitidos. Se presenta en una lata individual de 238 ml.\r\nPrecio de la caja (12 unidades): S/ 100\r\nAlérgenos: Contiene fruta real (pera). Personas con alergias a las frutas deben evitar su consumo.', NULL, 2, 8.99, 7.64, 15.28, NULL, 'https://asiaonmart.com/wp-content/uploads/2020/05/WEB_JugoPera_Grupal.jpg', '2025-11-27 13:24:52'),
(59, 27, 15, 'BULDAK CARBONARA 130 GR', 'Es un paquete de fideos instantáneos tipo ramen, conocido como Buldak Carbonara Hot Chicken Flavor Ramen de la marca surcoreana Samyang. Se caracteriza por ser un \"fideo frito\" (salteado) que combina la salsa de pollo picante icónica de la marca con un polvo cremoso sabor a carbonara (queso mozzarella, mantequilla y leche). Se presenta en un paquete individual de 130 g. \r\n\r\nAlérgenos: Contiene trigo (gluten), soja y leche. Es fabricado en instalaciones que también procesan crustáceos, huevos, pescado, moluscos, mostaza, nueces, maní y semillas de sésamo. Personas con estas alergias deben evitar su consumo. ', NULL, 3, 2.50, NULL, 7.50, NULL, 'https://orientalhm.com/cdn/shop/products/90_Carbonara_Buldak_Bokkeum_503x503_d2e08a95-bbee-4075-85d3-97cb1d383089_470x.jpg?v=1616758390', '2025-11-27 13:24:52'),
(60, 28, 16, 'BEBIDAS DE ALOE VERA SURTIDO 450 ML', 'Es un surtido de bebidas frutales con base de aloe vera (Aloe barbadensis Miller), presentadas en botellas individuales de 450 ml. Se caracterizan por contener jugo de aloe vera y trozos de pulpa real de la planta, combinados con jugos y sabores de frutas naturales: piña, sandía original, uva y mango. Son bebidas refrescantes que se asocian con beneficios para la salud digestiva e hidratación.\r\nAlérgenos: Estas bebidas generalmente no contienen alérgenos comunes como gluten, soja o lácteos. Sin embargo, se recomienda a las personas con alergias específicas a las frutas listadas (piña, sandía, uva, mango) que revisen la etiqueta antes de consumir.', NULL, 1, 6.00, NULL, 6.00, NULL, 'https://gw.alicdn.com/imgextra/i4/6000000000247/O1CN01YA7ie51DhAtuRQhHw_!!6000000000247-2-mia.png_.webp', '2025-11-27 14:17:50'),
(61, 28, 15, 'BULDAK CARBONARA 130 GR', 'Es un paquete de fideos instantáneos tipo ramen, conocido como Buldak Carbonara Hot Chicken Flavor Ramen de la marca surcoreana Samyang. Se caracteriza por ser un \"fideo frito\" (salteado) que combina la salsa de pollo picante icónica de la marca con un polvo cremoso sabor a carbonara (queso mozzarella, mantequilla y leche). Se presenta en un paquete individual de 130 g. \r\n\r\nAlérgenos: Contiene trigo (gluten), soja y leche. Es fabricado en instalaciones que también procesan crustáceos, huevos, pescado, moluscos, mostaza, nueces, maní y semillas de sésamo. Personas con estas alergias deben evitar su consumo. ', NULL, 4, 2.50, NULL, 10.00, NULL, 'https://orientalhm.com/cdn/shop/products/90_Carbonara_Buldak_Bokkeum_503x503_d2e08a95-bbee-4075-85d3-97cb1d383089_470x.jpg?v=1616758390', '2025-11-27 14:17:50'),
(62, 28, 12, 'GOOD DAY SOJU GRANADA 300 ML-13.5 % ALC', 'Es un licor destilado coreano tradicional, conocido como soju (similar al vodka, pero más suave y dulce), de la marca Good Day, sabor a granada. Se caracteriza por su bajo contenido alcohólico para un destilado (13.5% ALC) y un sabor frutal, refrescante y ligeramente dulce. Se presenta en una botella de vidrio individual de 300 ml \r\nPrecio de la caja (12 unidades): S/ 260 \r\nAlérgenos: Contiene alcohol destilado de cereales como trigo o cebada, o almidones como tapioca/patata, y saborizantes, ya que la destilación puede eliminar el gluten, pero la base de cereales es común en la producción de soju.', NULL, 4, 4.50, NULL, 18.00, NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD0pEwySgMnNWkxIDUyutE_0zeEVVnkvtxYQ&s', '2025-11-27 14:17:50');

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
-- Estructura Stand-in para la vista `v_clientes_vip`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_clientes_vip` (
`cliente_id` int(11)
,`nombre_completo` varchar(255)
,`email` varchar(255)
,`telefono` varchar(20)
,`total_compras` int(11)
,`total_gastado` decimal(10,2)
,`ticket_promedio` decimal(10,2)
,`ultima_compra` datetime
,`dias_desde_ultima_compra` int(11)
,`score_fidelidad` decimal(5,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_top_productos_vendidos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_top_productos_vendidos` (
`producto_id` int(11)
,`producto_nombre` varchar(255)
,`categoria_nombre` varchar(100)
,`total_vendido` decimal(32,0)
,`ingresos_total` decimal(32,2)
,`veces_vendido` bigint(21)
,`precio_promedio` decimal(14,6)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_top_vendedores_mes`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_top_vendedores_mes` (
`usuario_id` int(11)
,`nombre_completo` varchar(255)
,`total_ventas` bigint(21)
,`monto_vendido` decimal(32,2)
,`ticket_promedio` decimal(14,6)
,`items_vendidos` decimal(32,0)
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
,`numero_venta` varchar(20)
,`cliente_nombre` varchar(255)
,`cliente_telefono` varchar(20)
,`total` decimal(10,2)
,`estado` enum('pendiente','confirmada','procesando','en_preparacion','lista_entrega','en_camino','enviada','entregada','cancelada')
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
-- Estructura para la vista `v_clientes_vip`
--
DROP TABLE IF EXISTS `v_clientes_vip`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_clientes_vip`  AS SELECT `mc`.`cliente_id` AS `cliente_id`, `u`.`nombre_completo` AS `nombre_completo`, `u`.`email` AS `email`, `u`.`telefono` AS `telefono`, `mc`.`total_compras` AS `total_compras`, `mc`.`total_gastado` AS `total_gastado`, `mc`.`ticket_promedio` AS `ticket_promedio`, `mc`.`ultima_compra` AS `ultima_compra`, `mc`.`dias_desde_ultima_compra` AS `dias_desde_ultima_compra`, `mc`.`score_fidelidad` AS `score_fidelidad` FROM (`metricas_clientes` `mc` join `usuarios` `u` on(`mc`.`cliente_id` = `u`.`usuario_id`)) WHERE `mc`.`total_compras` >= 5 OR `mc`.`total_gastado` >= 500 ORDER BY `mc`.`total_gastado` DESC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_top_productos_vendidos`
--
DROP TABLE IF EXISTS `v_top_productos_vendidos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_top_productos_vendidos`  AS SELECT `p`.`producto_id` AS `producto_id`, `p`.`nombre` AS `producto_nombre`, `c`.`nombre` AS `categoria_nombre`, sum(`vri`.`cantidad`) AS `total_vendido`, sum(`vri`.`subtotal`) AS `ingresos_total`, count(distinct `vri`.`venta_realizada_id`) AS `veces_vendido`, avg(`vri`.`precio_final`) AS `precio_promedio` FROM ((`ventas_realizadas_items` `vri` join `productos` `p` on(`vri`.`producto_id` = `p`.`producto_id`)) join `categorias` `c` on(`p`.`categoria_id` = `c`.`categoria_id`)) GROUP BY `p`.`producto_id` ORDER BY sum(`vri`.`cantidad`) DESC LIMIT 0, 10 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_top_vendedores_mes`
--
DROP TABLE IF EXISTS `v_top_vendedores_mes`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_top_vendedores_mes`  AS SELECT `u`.`usuario_id` AS `usuario_id`, `u`.`nombre_completo` AS `nombre_completo`, count(`vr`.`venta_realizada_id`) AS `total_ventas`, sum(`vr`.`total`) AS `monto_vendido`, avg(`vr`.`total`) AS `ticket_promedio`, sum(`vr`.`cantidad_items`) AS `items_vendidos` FROM (`ventas_realizadas` `vr` join `usuarios` `u` on(`vr`.`vendedor_id` = `u`.`usuario_id`)) WHERE `vr`.`fecha_venta` >= date_format(current_timestamp(),'%Y-%m-01') GROUP BY `u`.`usuario_id` ORDER BY sum(`vr`.`total`) DESC ;

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
-- Indices de la tabla `ia_analytics_log`
--
ALTER TABLE `ia_analytics_log`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_tipo_fecha` (`tipo_ia`,`fecha_prediccion`),
  ADD KEY `idx_entidad` (`entidad_tipo`,`entidad_id`);

--
-- Indices de la tabla `metricas_clientes`
--
ALTER TABLE `metricas_clientes`
  ADD PRIMARY KEY (`metrica_id`),
  ADD UNIQUE KEY `unique_cliente` (`cliente_id`),
  ADD KEY `categoria_favorita_id` (`categoria_favorita_id`),
  ADD KEY `producto_mas_comprado_id` (`producto_mas_comprado_id`),
  ADD KEY `idx_segmento` (`segmento`),
  ADD KEY `idx_activo` (`cliente_activo`),
  ADD KEY `idx_score` (`score_fidelidad`);

--
-- Indices de la tabla `metricas_productos`
--
ALTER TABLE `metricas_productos`
  ADD PRIMARY KEY (`metrica_id`),
  ADD KEY `idx_producto_periodo` (`producto_id`,`periodo`,`fecha_inicio`),
  ADD KEY `idx_periodo` (`periodo`,`fecha_inicio`),
  ADD KEY `idx_ranking` (`ranking_general`);

--
-- Indices de la tabla `metricas_vendedores`
--
ALTER TABLE `metricas_vendedores`
  ADD PRIMARY KEY (`metrica_id`),
  ADD UNIQUE KEY `unique_vendedor_fecha` (`vendedor_id`,`fecha`),
  ADD KEY `idx_fecha` (`fecha`),
  ADD KEY `idx_monto` (`monto_total_vendido`);

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
  ADD KEY `idx_ventas_fecha_estado` (`fecha_venta`,`estado`),
  ADD KEY `idx_ventas_fecha_estado_vendedor` (`fecha_venta`,`estado`,`vendedor_id`),
  ADD KEY `idx_ventas_cliente` (`cliente_email`,`cliente_telefono`),
  ADD KEY `idx_ventas_whatsapp` (`enviado_whatsapp`,`fecha_envio_whatsapp`);

--
-- Indices de la tabla `ventas_realizadas`
--
ALTER TABLE `ventas_realizadas`
  ADD PRIMARY KEY (`venta_realizada_id`),
  ADD UNIQUE KEY `unique_venta` (`venta_id`),
  ADD KEY `idx_fecha_venta` (`fecha_venta`),
  ADD KEY `idx_vendedor` (`vendedor_id`,`fecha_venta`),
  ADD KEY `idx_cliente` (`cliente_id`,`fecha_venta`),
  ADD KEY `idx_periodo` (`anio`,`mes`,`dia_semana`),
  ADD KEY `idx_metodo_pago` (`metodo_pago`),
  ADD KEY `idx_total` (`total`),
  ADD KEY `idx_analytics` (`fecha_venta`,`vendedor_id`,`total`),
  ADD KEY `idx_cliente_analytics` (`cliente_id`,`fecha_venta`,`total`);

--
-- Indices de la tabla `ventas_realizadas_items`
--
ALTER TABLE `ventas_realizadas_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `idx_venta` (`venta_realizada_id`),
  ADD KEY `idx_producto` (`producto_id`,`fecha_registro`),
  ADD KEY `idx_categoria` (`categoria_id`,`fecha_registro`),
  ADD KEY `idx_producto_analytics` (`producto_id`,`fecha_registro`,`cantidad`);

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
  MODIFY `carrito_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `carrito_items`
--
ALTER TABLE `carrito_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

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
-- AUTO_INCREMENT de la tabla `ia_analytics_log`
--
ALTER TABLE `ia_analytics_log`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `metricas_clientes`
--
ALTER TABLE `metricas_clientes`
  MODIFY `metrica_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `metricas_productos`
--
ALTER TABLE `metricas_productos`
  MODIFY `metrica_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `metricas_vendedores`
--
ALTER TABLE `metricas_vendedores`
  MODIFY `metrica_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `tracking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=161;

--
-- AUTO_INCREMENT de la tabla `sesiones_usuario`
--
ALTER TABLE `sesiones_usuario`
  MODIFY `sesion_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `usuario_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `usuario_categorias_interes`
--
ALTER TABLE `usuario_categorias_interes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `venta_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `ventas_realizadas`
--
ALTER TABLE `ventas_realizadas`
  MODIFY `venta_realizada_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `ventas_realizadas_items`
--
ALTER TABLE `ventas_realizadas_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `venta_historial`
--
ALTER TABLE `venta_historial`
  MODIFY `historial_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `venta_items`
--
ALTER TABLE `venta_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

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
-- Filtros para la tabla `metricas_clientes`
--
ALTER TABLE `metricas_clientes`
  ADD CONSTRAINT `metricas_clientes_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `metricas_clientes_ibfk_2` FOREIGN KEY (`categoria_favorita_id`) REFERENCES `categorias` (`categoria_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `metricas_clientes_ibfk_3` FOREIGN KEY (`producto_mas_comprado_id`) REFERENCES `productos` (`producto_id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `metricas_productos`
--
ALTER TABLE `metricas_productos`
  ADD CONSTRAINT `metricas_productos_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`producto_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `metricas_vendedores`
--
ALTER TABLE `metricas_vendedores`
  ADD CONSTRAINT `metricas_vendedores_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE CASCADE;

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
-- Filtros para la tabla `ventas_realizadas`
--
ALTER TABLE `ventas_realizadas`
  ADD CONSTRAINT `ventas_realizadas_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`venta_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ventas_realizadas_ibfk_2` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ventas_realizadas_ibfk_3` FOREIGN KEY (`vendedor_id`) REFERENCES `usuarios` (`usuario_id`);

--
-- Filtros para la tabla `ventas_realizadas_items`
--
ALTER TABLE `ventas_realizadas_items`
  ADD CONSTRAINT `ventas_realizadas_items_ibfk_1` FOREIGN KEY (`venta_realizada_id`) REFERENCES `ventas_realizadas` (`venta_realizada_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ventas_realizadas_items_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`producto_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ventas_realizadas_items_ibfk_3` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`categoria_id`) ON DELETE SET NULL;

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
