"use server";

const apiKey = process.env.API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

export async function gerarFlashcardsAction(textoUsuario: string) {
  if (!apiKey) {
    console.error("❌ API_KEY não configurada no .env.local");
    throw new Error("Chave de API do Google Gemini não configurada.");
  }

  console.log("🚀 Conectando ao Google Gemini...");

  // Limita e limpa o texto
  const textoLimpo = limparTextoParaIA(textoUsuario);
  const textoLimitado = textoLimpo.substring(0, 10000);

  console.log("📝 Texto para IA:", textoLimitado.substring(0, 500) + "...");

  const prompt = `
    VOCÊ É UM PROFESSOR ESPECIALISTA EM CRIAR MATERIAIS DE ESTUDO.
    
    SEU OBJETIVO: Analisar o texto de um aluno e criar 5 PERGUNTAS DE VERDADE que testem a COMPREENSÃO dos conceitos principais.
    
    TEXTO DO ALUNO (extraído de material de estudo):
    """
    ${textoLimitado}
    """
    
    🔍 ANALISE PRIMEIRO: Identifique os 3-5 CONCEITOS-CHAVE mais importantes do texto.
    
    📝 CRIE FLASHCARDS: Para CADA conceito-chave, crie uma pergunta INTELIGENTE.
    
    ❗ REGRAS CRÍTICAS:
    1. As perguntas DEVEM ser sobre os CONCEITOS REAIS do texto
    2. As respostas DEVEM estar diretamente no texto
    3. NÃO crie perguntas sobre partes irrelevantes (datas, emails, nomes)
    4. As perguntas devem testar COMPREENSÃO, não memorização
    5. Use linguagem CLARA e DIRETA
    
    💡 EXEMPLOS DE BOAS PERGUNTAS (baseado em matemática/discreta):
    - "Qual a diferença entre indução fraca e indução forte?"
    - "Como a recursão é aplicada em árvores binárias?"
    - "Qual a vantagem de usar listas ligadas em vez de arrays?"
    - "O que é caso base em uma função recursiva?"
    
    🚫 EXEMPLOS DE PERGUNTAS RUINS (NÃO FAÇA):
    - "Qual é o email do professor?" (irrelevante)
    - "Em que ano foi escrito?" (irrelevante)
    - "Qual o nome da disciplina?" (óbvio)
    
    📋 FORMATO DE RESPOSTA (APENAS JSON):
    [
      {
        "front": "PERGUNTA 1 sobre um conceito importante do texto",
        "back": "RESPOSTA 1 clara e baseada diretamente no texto"
      },
      {
        "front": "PERGUNTA 2 sobre outro conceito importante",
        "back": "RESPOSTA 2 específica do texto"
      },
      {
        "front": "PERGUNTA 3 que testa compreensão",
        "back": "RESPOSTA 3 precisa"
      },
      {
        "front": "PERGUNTA 4 sobre aplicação prática",
        "back": "RESPOSTA 4 com exemplo do texto"
      },
      {
        "front": "PERGUNTA 5 que relaciona conceitos",
        "back": "RESPOSTA 5 que mostra conexões"
      }
    ]
    
    NÃO ADICIONE TEXTOS EXPLICATIVOS, APENAS O ARRAY JSON.
  `;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos

    console.log("📤 Enviando para Gemini...");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3, // Mais determinístico
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 2500,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Erro da API Gemini:", response.status, errorData.error?.message);
      
      // Fallback inteligente
      console.log("🔄 Usando gerador inteligente de flashcards...");
      return gerarFlashcardsInteligentes(textoUsuario);
    }

    const data = await response.json();
    console.log("✅ Resposta recebida do Gemini!");

    let textoResposta = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    
    // Limpa a resposta
    textoResposta = textoResposta
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    console.log("📝 Resposta IA:", textoResposta.substring(0, 300) + "...");

    // Extrai JSON
    let jsonStr = textoResposta;
    const jsonMatch = textoResposta.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    try {
      const flashcards = JSON.parse(jsonStr);
      
      if (!Array.isArray(flashcards) || flashcards.length === 0) {
        throw new Error("Resposta não é um array válido");
      }

      // Valida e formata os flashcards
      const flashcardsProcessados = flashcards.slice(0, 5).map((card: any, index: number) => {
        let front = card.front || card.pergunta || card.question || card.FRONT || "";
        let back = card.back || card.resposta || card.answer || card.BACK || "";
        
        // Se não tem conteúdo bom, cria um melhor
        if (!front || front.length < 10 || front.includes("...?")) {
          front = criarPerguntaInteligente(textoUsuario, index);
        }
        
        if (!back || back.length < 10) {
          back = criarRespostaRelevante(textoUsuario, front);
        }
        
        return {
          front: formatarTexto(front),
          back: formatarTexto(back)
        };
      });

      // Completa se necessário com perguntas inteligentes
      while (flashcardsProcessados.length < 5) {
        const idx = flashcardsProcessados.length;
        flashcardsProcessados.push({
          front: criarPerguntaInteligente(textoUsuario, idx),
          back: criarRespostaRelevante(textoUsuario, flashcardsProcessados[idx]?.front || "")
        });
      }

      console.log(`🎯 ${flashcardsProcessados.length} flashcards gerados com sucesso!`);
      return flashcardsProcessados;

    } catch (jsonError) {
      console.error("❌ Erro ao parsear JSON da IA:", jsonError);
      return gerarFlashcardsInteligentes(textoUsuario);
    }

  } catch (error: any) {
    console.error("❌ Erro ao gerar flashcards:", error.message);
    return gerarFlashcardsInteligentes(textoUsuario);
  }
}

// ===== FUNÇÕES AUXILIARES INTELIGENTES =====

function limparTextoParaIA(texto: string): string {
  // Remove linhas repetidas, emails, URLs, etc
  const linhas = texto.split('\n').filter((linha, index, arr) => {
    const linhaLimpa = linha.trim();
    if (linhaLimpa.length < 5) return false;
    if (linhaLimpa.includes('@') || linhaLimpa.includes('http')) return false;
    // Remove duplicatas próximas
    if (index > 0 && linhaLimpa === arr[index - 1].trim()) return false;
    return true;
  });
  
  return linhas.join('\n');
}

function criarPerguntaInteligente(texto: string, index: number): string {
  const conceitos = extrairConceitosChave(texto);
  
  if (conceitos.length > index) {
    return `Qual a importância ou definição de "${conceitos[index]}" no contexto do texto?`;
  }
  
  const perguntasPadrao = [
    "Qual o conceito principal apresentado neste material?",
    "Como este tema se aplica na prática?",
    "Qual a relação entre os diferentes conceitos apresentados?",
    "Quais são as etapas ou passos importantes descritos?",
    "Qual problema este conteúdo ajuda a resolver?"
  ];
  
  return perguntasPadrao[index % perguntasPadrao.length];
}

function criarRespostaRelevante(texto: string, pergunta: string): string {
  // Tenta encontrar resposta no texto
  const palavrasChave = pergunta.toLowerCase().split(/\s+/).filter(p => p.length > 3);
  
  for (const palavra of palavrasChave) {
    const regex = new RegExp(`[^.!?]*${palavra}[^.!?]*[.!?]`, 'gi');
    const matches = texto.match(regex);
    if (matches && matches.length > 0) {
      return matches[0].trim();
    }
  }
  
  // Fallback
  return "Conceito importante discutido no material. O texto aborda este tema em detalhes.";
}

function extrairConceitosChave(texto: string): string[] {
  // Encontra palavras com letra maiúscula (conceitos)
  const conceitos = texto.match(/\b[A-Z][a-záéíóúãõâêîôûàèìòùç]+\b/g) || [];
  
  // Filtra palavras comuns
  const palavrasComuns = new Set([
    'A', 'O', 'Os', 'As', 'Um', 'Uma', 'De', 'Da', 'Do', 'Em', 'No', 'Na',
    'Para', 'Por', 'Com', 'Sem', 'Que', 'Este', 'Esta', 'Isto'
  ]);
  
  const conceitosFiltrados = [...new Set(conceitos)]
    .filter(c => !palavrasComuns.has(c) && c.length > 3)
    .slice(0, 10);
  
  return conceitosFiltrados;
}

function formatarTexto(texto: string): string {
  return texto
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^"|"$/g, '') // Remove aspas no início/fim
    .replace(/\.{2,}/g, '.') // Remove múltiplos pontos
    .replace(/\s*\.\s*/g, '. ') // Padroniza pontos
    .replace(/^\w/, c => c.toUpperCase()); // Primeira letra maiúscula
}

// ===== GERADOR INTELIGENTE DE FLASHCARDS (fallback) =====

function gerarFlashcardsInteligentes(texto: string) {
  console.log("🤖 Gerando flashcards inteligentes do texto...");
  
  const conceitos = extrairConceitosChave(texto);
  const flashcards = [];
  
  // Cria flashcards baseados nos conceitos encontrados
  for (let i = 0; i < Math.min(5, conceitos.length); i++) {
    flashcards.push({
      front: `Explique o conceito de ${conceitos[i]}`,
      back: `"${conceitos[i]}" é um conceito fundamental discutido no texto sobre ${extrairTemaPrincipal(texto)}.`
    });
  }
  
  // Se não encontrou conceitos, analisa o texto
  if (flashcards.length === 0) {
    const temas = analisarTemas(texto);
    temas.forEach((tema, i) => {
      if (flashcards.length < 5) {
        flashcards.push({
          front: `O que é ${tema}?`,
          back: `${tema} é um tópico abordado no material de estudo.`
        });
      }
    });
  }
  
  // Completa se necessário
  const perguntasGerais = [
    "Qual o objetivo principal deste material?",
    "Quais métodos ou técnicas são apresentados?",
    "Como este conteúdo pode ser aplicado?",
    "Quais são os pontos-chave para estudar?",
    "O que você aprendeu com este texto?"
  ];
  
  while (flashcards.length < 5) {
    const idx = flashcards.length;
    flashcards.push({
      front: perguntasGerais[idx] || `Pergunta ${idx + 1} sobre o conteúdo`,
      back: "Resposta baseada na análise do material fornecido."
    });
  }
  
  return flashcards.slice(0, 5);
}

function extrairTemaPrincipal(texto: string): string {
  const temas = [
    'matemática discreta', 'recursão', 'indução', 'algoritmos', 
    'estrutura de dados', 'programação', 'lógica', 'computação'
  ];
  
  const textoLower = texto.toLowerCase();
  for (const tema of temas) {
    if (textoLower.includes(tema)) {
      return tema;
    }
  }
  
  return "o tema apresentado";
}

function analisarTemas(texto: string): string[] {
  const palavrasFrequentes: Record<string, number> = {};
  const palavras = texto.toLowerCase().split(/\W+/).filter(p => p.length > 4);
  
  palavras.forEach(palavra => {
    palavrasFrequentes[palavra] = (palavrasFrequentes[palavra] || 0) + 1;
  });
  
  return Object.entries(palavrasFrequentes)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([palavra]) => palavra);
}