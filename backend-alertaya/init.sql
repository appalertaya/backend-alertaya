CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  verificado BOOLEAN DEFAULT FALSE,
  tokenVerificacion VARCHAR(255),
  fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reportes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  descripcion TEXT NOT NULL,
  lat DECIMAL(10, 6) NOT NULL,
  lng DECIMAL(10, 6) NOT NULL,
  ciudad VARCHAR(100),
  fechaHora DATETIME NOT NULL,
  enviado BOOLEAN DEFAULT TRUE,
  categoria VARCHAR(100) NOT NULL,
  imagenUrl TEXT,
  usuarioId INT,
  FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS valoraciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reporte_id INT NOT NULL,
  usuario_email VARCHAR(255) NOT NULL,
  utilidad ENUM('util', 'no_util') NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_valoracion (reporte_id, usuario_email),
  FOREIGN KEY (reporte_id) REFERENCES reportes(id)
);
