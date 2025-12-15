require('dotenv').config(); // ou .config({ path: '.env.local' }) se não tiver renomeado

const apiKey = process.env.API_KEY;

if (!apiKey) {
    console.error("❌ ERRO: Chave não encontrada. Verifique o arquivo .env");
    process.exit(1);
}

// ATUALIZADO PARA VERSÃO 2.5 (Padrão Dez/2025)
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

async function testarConexao() {
    console.log("1. Conectando com o Google Gemini (v2.5)...");
    
    try {
        const resposta = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Responda apenas: FUNCIONOU 2025" }] }]
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            console.error("❌ Erro da API:", JSON.stringify(dados, null, 2));
        } else {
            console.log("--- SUCESSO! ---");
            console.log("Resposta:", dados.candidates[0].content.parts[0].text.trim());
        }

    } catch (erro) {
        console.error("❌ Erro de conexão:", erro.message);
    }
}

testarConexao();