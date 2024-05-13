const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('../models/user');

dotenv.config();

const router = express.Router();

router.post('/login', async (req, res) => {
  // Implementação da lógica de login aqui

  const express = require('express');
  const app = express();
  const port = 3000;
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const dotenv = require('dotenv');
  const cors = require('cors');
  
  // Carregar variáveis de ambiente do .env
  dotenv.config();
  
  // Middleware para analisar JSON, parsear e adicionar o corpo da requisição na req.body
  app.use(express.json());
  app.use(cors());
  
  // Importar as rotas
  const userRoutes = require('./routes/userRoutes');
  const natureSpotRoutes = require('./routes/natureSpotRoutes');
  
  // Rotas
  app.use('/api/users', userRoutes);
  app.use('/api/nature-spots', natureSpotRoutes);
  
// Rota de login
app.post('/api/login', async (req, res) => {
    try {
      // Verificar se o usuário existe no banco de dados
      const user = await User.findOne({ where: { email: req.body.email } });
  
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
  
      // Comparar a senha fornecida com a senha armazenada no banco de dados (hash)
      const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Senha inválida.' });
      }
  
      // Se a senha estiver correta, gerar um token JWT e enviar no response
      const token = jwt.sign(
        { id: user.id, type: user.type },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.json({ token });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({ error: 'Erro ao fazer login.' });
    }
  });

// Rota de cadastro de novo usuário
app.post('/api/register', async (req, res) => {
    try {
      // Capturar as informações do novo usuário do corpo da requisição
      const { name, email, cpf, password, type } = req.body;
  
      // Verificar se o CPF e o e-mail já estão cadastrados
      const existingUserByEmail = await User.findOne({ where: { email } });
      const existingUserByCpf = await User.findOne({ where: { cpf } });
  
      if (existingUserByEmail) {
        return res.status(409).json({ error: 'E-mail já cadastrado.' });
      }
  
      if (existingUserByCpf) {
        return res.status(409).json({ error: 'CPF já cadastrado.' });
      }
  
      // Se não estiverem, criptografar a senha e salvar o novo usuário no banco de dados
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = await User.create({
        name,
        email,
        cpf,
        password: hashedPassword,
        type,
      });
  
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Erro ao cadastrar o usuário:', error);
      res.status(500).json({ error: 'Erro ao cadastrar o usuário.' });
    }
  });

  // Iniciar o servidor
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
  
  // routes/userRoutes.js
  const express = require('express');
  const router = express.Router();
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const dotenv = require('dotenv');
  
  dotenv.config();
  
  // Importar o model de usuário
  const User = require('../models/User');
  
  // Rota de listagem de usuários (privada)
  router.get('/', (req, res) => {
    try {
      // Verificar se o usuário tem permissão de acesso
      if (!req.user || req.user.type !== 'admin') {
        return res.status(403).json({ error: 'Você não tem permissão de acesso.' });
      }
  
      // Buscar os usuários no banco de dados
      const users = await User.findAll();
  
      // Retornar a lista de usuários
      res.json(users);
      // Retornar um erro se o usuário não tiver permissão de acesso
    } catch (error) {
      console.error('Erro ao listar os usuários:', error);
      res.status(500).json({ error: 'Erro ao listar os usuários.' });
    }
  });
  
  module.exports = router;
  
  // routes/natureSpotRoutes.js
  const express = require('express');
  const router = express.Router();
  const dotenv = require('dotenv');
  
  dotenv.config();
  
// Importar o model de local da natureza
const NatureSpot = require('../models/NatureSpot');

// Rota de listagem de locais da natureza de um usuário (privada)
router.get('/:userId', async (req, res) => {
  try {
    // Verificar se o usuário tem permissão de acesso
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Buscar os locais da natureza no banco de dados, filtrando pelos locais do usuário autenticado
    const natureSpots = await NatureSpot.findAll({
      where: { userId: req.params.userId },
    });

    // Retornar a lista de locais da natureza
    res.json(natureSpots);
  } catch (error) {
    // Retornar um erro se ocorrer algum problema
    res.status(500).json({ message: 'Internal server error' });
  }
});



    

