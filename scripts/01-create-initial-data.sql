-- Crear usuarios iniciales
INSERT INTO usuarios (id, nombre, rol) VALUES 
('user-recepcion-1', 'Recepcionista Principal', 'recepcionista'),
('user-admin-1', 'Administrador Sistema', 'administrador');

-- Crear asesores iniciales
INSERT INTO asesores (id, nombre, turno, activo) VALUES 
('asesor-1', 'María González', 'Mañana', true),
('asesor-2', 'Carlos Rodríguez', 'Tarde', true),
('asesor-3', 'Ana Martínez', 'Noche', true),
('asesor-4', 'Luis Pérez', 'Mañana', true),
('asesor-5', 'Sofia López', 'Tarde', true);
