--
-- Estructura de tabla para la tabla `carpeta`
--
CREATE TABLE `carpeta` (
  `id_carpeta` int NOT NULL,
  `ruta` varchar(200) NOT NULL,
  `tiempo` TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indices de la tabla `carpeta`
--
ALTER TABLE `carpeta`
  ADD PRIMARY KEY (`id_carpeta`);

--
-- AUTO_INCREMENT de la tabla `carpeta`
--
ALTER TABLE `carpeta`
  MODIFY `id_carpeta` int NOT NULL AUTO_INCREMENT;
