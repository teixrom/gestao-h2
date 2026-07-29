-- Admin user (senha: admin123)
INSERT INTO usuarios (email, nome, senha, role, ativo, criado_em)
SELECT 'admin@exemplo.com', 'Admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMINISTRADOR', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@exemplo.com');

INSERT INTO categorias (nome) SELECT 'Bebidas' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'Bebidas');
INSERT INTO categorias (nome) SELECT 'Alimentos' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'Alimentos');
INSERT INTO categorias (nome) SELECT 'Limpeza' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'Limpeza');
INSERT INTO categorias (nome) SELECT 'Higiene' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'Higiene');

INSERT INTO clientes (nome, email, telefone, endereco)
SELECT 'Carlos Silva', 'carlos@teste.com', '11999999999', 'Rua A, 123'
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE email = 'carlos@teste.com');

INSERT INTO clientes (nome, email, telefone, endereco)
SELECT 'Maria Oliveira', 'maria@teste.com', '11988888888', 'Rua B, 456'
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE email = 'maria@teste.com');

INSERT INTO clientes (nome, email, telefone, endereco)
SELECT 'Joao Santos', 'joao@teste.com', '11977777777', 'Rua C, 789'
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE email = 'joao@teste.com');
