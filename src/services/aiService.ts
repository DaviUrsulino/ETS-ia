// src/services/aiService.ts
"use server"; 

const apiKey = process.env.API_KEY;
// Confirme se está usando a versão 2.5 que funcionou no teste
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

export async function gerarFlashcardsAction(textoUsuario: string) {
  if (!apiKey) throw new Error("Chave de API não configurada no servidor (.env).");

  console.log("🚀 Iniciando conexão com o Google Gemini...");

  const prompt = `
    Você é um professor especialista. 
    Analise o seguinte texto e crie 5 flashcards de estudo (pergunta e resposta).
    O texto é: "${textoUsuario}"
    
    IMPORTANTE: Responda APENAS um JSON válido seguindo estritamente este formato:
    [
      { "front": "Pergunta aqui", "back": "Resposta aqui" },
      { "front": "Pergunta 2", "back": "Resposta 2" }
    ]
  `;

  try {
    // Adicionamos { cache: 'no-store' } para evitar cache do Next.js
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
      cache: "no-store", 
      // O Next.js às vezes precisa de um empurrãozinho no sinal
      signal: AbortSignal.timeout(15000) // Aumentamos o tempo limite para 15s
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Erro retornado pela API:", JSON.stringify(errorData, null, 2));
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Resposta recebida do Google!");

    let textoResposta = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    
    // Limpeza de blocos de código markdown que a IA gosta de mandar
    textoResposta = textoResposta.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(textoResposta);

  } catch (error) {
    console.error("❌ Falha crítica na conexão:", error);
    // Retornamos vazio para não quebrar a tela, mas logamos o erro real no terminal
    return []; 
  }
}