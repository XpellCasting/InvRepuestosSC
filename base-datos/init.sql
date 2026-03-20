CREATE DATABASE IF NOT EXISTS inventariado;
USE inventariado;

-- Distribuidores
CREATE TABLE distribuidores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL
);

-- Productos
CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo_barras VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  componentes TEXT,
  precio DECIMAL(10,2) DEFAULT 0,
  stock INT DEFAULT 0,
  imagen VARCHAR(500),
  distribuidor_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (distribuidor_id) REFERENCES distribuidores(id)
);

-- Compatibilidad vehicular (relación con productos)
CREATE TABLE compatibilidad (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  anio_desde VARCHAR(10),
  anio_hasta VARCHAR(10),
  motor VARCHAR(100),
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- Tickets / Boletas
CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero VARCHAR(20) NOT NULL UNIQUE,
  fecha DATE NOT NULL,
  total DECIMAL(10,2) DEFAULT 0,
  estado ENUM('en-espera', 'entregado', 'cancelado') DEFAULT 'en-espera',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Productos dentro de cada ticket
CREATE TABLE ticket_productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Datos de ejemplo para distribuidores
INSERT INTO distribuidores (nombre) VALUES
  ('Distribuidor 1'),
  ('Distribuidor 2'),
  ('Otros');

-- Datos de ejemplo para productos
INSERT INTO productos 
  (codigo_barras, nombre, descripcion, componentes, precio, stock, imagen, distribuidor_id)
VALUES
  ('7790001234560', 'Filtro de Aceite Toyota Corolla',
   'Filtro de aceite de alta eficiencia para motor 1.8L.',
   'Elemento filtrante, carcasa de acero, válvula antirretorno, junta tórica',
   4500, 50,
   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 1),

  ('7790009876543', 'Pastillas de Freno Delanteras Honda Civic',
   'Pastillas de freno cerámicas para eje delantero.',
   'Material cerámico, placa de acero, lámina anti-ruido, sensor de desgaste',
   8200, 30,
   'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400', 2),

  ('7790005551230', 'Correa de Distribución Volkswagen Gol',
   'Correa de distribución de alta resistencia.',
   'Correa dentada, tensor hidráulico, polea loca, kit de tornillos',
   15600, 20,
   'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=400', 3),

  ('7790003338880', 'Amortiguador Trasero Ford Focus',
   'Amortiguador de gas de doble tubo para eje trasero.',
   'Tubo interior, tubo exterior, válvula de compresión, sello de aceite',
   12300, 40,
   'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400', 1),

  ('7790007774440', 'Bujías Iridium Chevrolet Cruze',
   'Set de 4 bujías de iridio para mayor rendimiento.',
   'Electrodo de iridio, aislante de cerámica, junta de cobre',
   7800, 25,
   'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=400', 2),

  ('7790002221110', 'Filtro de Aire Renault Logan',
   'Filtro de aire de papel plisado para admisión de motor.',
   'Papel filtrante plisado, marco metálico, junta perimetral',
   2900, 35,
   'https://images.unsplash.com/photo-1609552651498-b6cfc0d58afc?w=400', 3);

-- Compatibilidades de ejemplo
INSERT INTO compatibilidad 
  (producto_id, marca, modelo, anio_desde, anio_hasta, motor)
VALUES
  (1, 'Toyota',     'Corolla', '2010', '2019', '1.8L 2ZR-FE'),
  (1, 'Toyota',     'Auris',   '2012', '2018', '1.8L 2ZR-FE'),
  (1, 'Toyota',     'Yaris',   '2014', '2020', '1.5L 1NZ-FE'),
  (2, 'Honda',      'Civic',   '2016', '2022', '1.5L Turbo'),
  (2, 'Honda',      'Civic',   '2013', '2015', '1.8L'),
  (3, 'Volkswagen', 'Gol',     '2008', '2016', '1.6L 8v'),
  (3, 'Volkswagen', 'Suran',   '2009', '2015', '1.6L 8v'),
  (4, 'Ford',       'Focus',   '2011', '2019', '1.6L / 2.0L'),
  (5, 'Chevrolet',  'Cruze',   '2012', '2020', '1.8L Ecotec'),
  (6, 'Renault',    'Logan',   '2007', '2023', '1.6L K7M');
