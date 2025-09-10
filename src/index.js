// src/index.js

import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'uma-chave-secreta-forte-e-aleatoria';

// Rota de teste
app.get('/', (req, res) => {
    res.send('Serviço de Autenticação está online!');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Servidor de Autenticação rodando na porta ${PORT}`);
});

// Rota de registro de usuário
app.post('/auth/register', async (req, res) => {
    const { email, password, role } = req.body;

    // 1. Verificação básica
    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
        // 2. Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Salvar o novo usuário no banco de dados
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role || 'user', // Permite definir o role, com 'user' como padrão
            },
        });

        // 4. Gerar o JWT (token de autenticação)
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expira em 1 hora
        );

        res.status(201).json({
            message: 'Usuário registrado com sucesso!',
            token,
        });
    } catch (error) {
        // 5. Tratamento de erros, como e-mail duplicado
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'E-mail já está em uso.' });
        }
        res.status(500).json({ error: 'Erro ao registrar o usuário.' });
    }
});