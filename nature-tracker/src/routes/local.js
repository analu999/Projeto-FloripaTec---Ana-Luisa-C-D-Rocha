const express = require('express');
const jwt = require('jsonwebtoken');
const Yup = require('yup');
const { Local } = require('../models');
const { User } = require('../models');
const { JWT_SECRET } = process.env;

const localSchema = Yup.object().shape({
  name: Yup.string().required(),
  description: Yup.string().required(),
  location: Yup.string().required(),
  latitude: Yup.number().required(),
  longitude: Yup.number().required(),
});

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { id } = jwt.verify(req.headers.authorization, JWT_SECRET);
    await localSchema.validate(req.body);
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const local = await Local.create(req.body);
    local.setUser(user);
    res.status(201).json(local);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { id } = jwt.verify(req.headers.authorization, JWT_SECRET);
    const user = await User.findByPk(id, { include: Local });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.Locals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = jwt.verify(req.headers.authorization, JWT_SECRET);
    const local = await Local.findOne({
      where: { id: req.params.id },
      include: User,
    });
    if (!local || local.userId !== id) {
      return res.status(404).json({ error: 'Local not found' });
    }
    res.json(local);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;



// Importar o model de local da natureza
const NatureSpot = require('../models/NatureSpot');

// Rota de exclusão de local da natureza de um usuário (privada)
router.delete('/:userId/:localId', async (req, res) => {
  try {
    // Verificar se o usuário tem permissão de acesso
    const user = await User.findByPk(req.params.userId);
    if (!user || user.id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Excluir o local da natureza do banco de dados
    await NatureSpot.destroy({
      where: {
        id: req.params.localId,
        userId: req.params.userId,
      },
    });

    // Retornar uma mensagem de sucesso
    res.json({ message: 'Local da natureza excluído com sucesso' });
  } catch (error) {
    // Retornar um erro se ocorrer algum problema
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Rota de atualização de informações de local da natureza de um usuário (privada)
router.put('/:userId/:localId', async (req, res) => {
  try {
    // Verificar se o usuário tem permissão de acesso
    const user = await User.findByPk(req.params.userId);
    if (!user || user.id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Atualizar as informações do local da natureza no banco de dados
    await NatureSpot.update(req.body, {
      where: {
        id: req.params.localId,
        userId: req.params.userId,
      },
    });

    // Retornar as informações atualizadas do local da natureza
    const natureSpot = await NatureSpot.findOne({
      where: {
        id: req.params.localId,
        userId: req.params.userId,
      },
    });
    res.json(natureSpot);
  } catch (error) {
    // Retornar um erro se ocorrer algum problema
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Importar o model de local da natureza
const NatureSpot = require('../models/NatureSpot');

// Importar o pacote axios para fazer requisições HTTP
const axios = require('axios');

// Rota de exibição do link do Google Maps de um local da natureza de um usuário (privada)
router.get('/:userId/:localId/maps', async (req, res) => {
  try {
    // Verificar se o usuário tem permissão de acesso
    const user = await User.findByPk(req.params.userId);
    if (!user || user.id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Buscar as informações do local da natureza no banco de dados
    const natureSpot = await NatureSpot.findOne({
      where: {
        id: req.params.localId,
        userId: req.params.userId,
      },
    });

    // Verificar se o local da natureza existe
    if (!natureSpot) {
      return res.status(404).json({ message: 'Local da natureza não encontrado' });
    }

    // Fazer uma requisição HTTP para a API do Nominatim para obter as coordenadas do local da natureza
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${natureSpot.name},${natureSpot.address},${natureSpot.city},${natureSpot.state},${natureSpot.country}&format=json`);

    // Verificar se a requisição foi bem-sucedida
    if (response.status !== 200) {
      return res.status(500).json({ message: 'Erro ao obter as coordenadas do local da natureza' });
    }

    // Obter as coordenadas do primeiro resultado da API do Nominatim
    const coordinates = response.data[0].lat + ',' + response.data[0].lon;

    // Gerar o link do Google Maps usando as coordenadas
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${coordinates}`;

    // Retornar o link do Google Maps como resposta da rota
    res.json({ mapsLink });
  } catch (error) {
    // Retornar um erro se ocorrer algum problema
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Tratando erros de outra forma, opção extra
// // Importar o pacote winston para registro de logs
// const winston = require('winston');

// // Rota de exibição do link do Google Maps de um local da natureza de um usuário (privada)
// router.get('/:userId/:localId/maps', async (req, res) => {
//   try {
//     // Verificar se o usuário tem permissão de acesso
//     const user = await User.findByPk(req.params.userId);
//     if (!user || user.id !== req.user.id) {
//       return res.status(403).json({ message: 'Forbidden' });
//     }

//     // Buscar as informações do local da natureza no banco de dados
//     const natureSpot = await NatureSpot.findOne({
//       where: {
//         id: req.params.localId,
//         userId: req.params.userId,
//       },
//     });

//     // Verificar se o local da natureza existe
//     if (!natureSpot) {
//       return res.status(404).json({ message: 'Local da natureza não encontrado' });
//     }

//     // Fazer uma requisição HTTP para a API do Nominatim para obter as coordenadas do local da natureza
//     const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${natureSpot.name},${natureSpot.address},${natureSpot.city},${natureSpot.state},${natureSpot.country}&format=json`);

//     // Verificar se a requisição foi bem-sucedida
//     if (response.status !== 200) {
//       winston.error(`Erro ao obter as coordenadas do local da natureza: ${response.statusText}`);
//       return res.status(500).json({ message: 'Internal server error' });
//     }

//     // Obter as coordenadas do primeiro resultado da API do Nominatim
//     const coordinates = response.data[0].lat + ',' + response.data[0].lon;

//     // Gerar o link do Google Maps usando as coordenadas
//     const mapsLink = `https://www.google.com/maps/search/?api=1&query=${coordinates}`;

//     // Retornar o link do Google Maps como resposta da rota
//     res.json({ mapsLink });
//   } catch (error) {
//     // Registrar o erro no log de servidor
//     winston.error(`Erro ao exibir o link do Google Maps do local da natureza: ${error.message}`);

//     // Retornar um erro genérico
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });