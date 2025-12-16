import { NextRequest, NextResponse } from "next/server";

// Polyfill para DOMMatrix
if (typeof global.DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class MockDOMMatrix {
    constructor() {}
    multiply() { return this; }
    inverse() { return this; }
    translate() { return this; }
    scale() { return this; }
    rotate() { return this; }
  };
}

// Função para limpar texto extraído
function limparTextoPDF(texto: string): string {
  console.log("🧹 Iniciando limpeza do texto...");
  
  // 1. Remove cabeçalhos repetidos (ex: "SOLUÇÃO DE PROBLEMAS" repetido)
  let linhas = texto.split('\n');
  const linhasUnicas: string[] = [];
  const linhasVistas = new Set();
  
  for (const linha of linhas) {
    const linhaLimpa = linha.trim();
    if (linhaLimpa.length > 0) {
      // Remove duplicatas consecutivas
      if (!linhasVistas.has(linhaLimpa) || (linhasUnicas.length > 0 && linhaLimpa !== linhasUnicas[linhasUnicas.length - 1])) {
        linhasUnicas.push(linhaLimpa);
        linhasVistas.add(linhaLimpa);
      }
    }
  }
  
  // 2. Junta linhas relevantes
  let textoLimpo = linhasUnicas.join('\n');
  
  // 3. Remove caracteres especiais mas mantém estrutura
  textoLimpo = textoLimpo
    .replace(/[^\w\sáéíóúãõâêîôûàèìòùçÁÉÍÓÚÃÕÂÊÎÔÛÀÈÌÒÙÇ.,!?;:()\-→\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
  
  // 4. Separa em parágrafos lógicos
  const frases = textoLimpo.split(/[.!?]+/).filter(f => f.trim().length > 10);
  
  // 5. Agrupa frases relacionadas (baseado em palavras-chave)
  const paragrafos: string[] = [];
  let paragrafoAtual: string[] = [];
  
  const palavrasChave = [
    'indução', 'recursão', 'matemática', 'algoritmo', 'problema',
    'caso base', 'passo', 'função', 'árvore', 'binária', 'lista',
    'cliente', 'eficiente', 'armazenar', 'acessar', 'dados'
  ];
  
  for (const frase of frases) {
    const palavrasFrase = frase.toLowerCase().split(/\s+/);
    const temPalavraChave = palavrasChave.some(palavra => 
      frase.toLowerCase().includes(palavra)
    );
    
    if (temPalavraChave || palavrasFrase.length > 15) {
      if (paragrafoAtual.length > 0) {
        paragrafos.push(paragrafoAtual.join('. ') + '.');
        paragrafoAtual = [];
      }
      paragrafos.push(frase.trim() + '.');
    } else {
      paragrafoAtual.push(frase.trim());
    }
  }
  
  if (paragrafoAtual.length > 0) {
    paragrafos.push(paragrafoAtual.join('. ') + '.');
  }
  
  // 6. Remove parágrafos muito curtos ou irrelevantes
  const paragrafosFiltrados = paragrafos.filter(p => {
    const palavras = p.split(/\s+/);
    return palavras.length >= 5 && 
           !p.toLowerCase().includes('@') && // Remove emails
           !p.toLowerCase().includes('http'); // Remove URLs
  });
  
  // 7. Limita o tamanho final
  const resultado = paragrafosFiltrados.join('\n\n').substring(0, 15000);
  
  console.log(`✅ Texto limpo: ${resultado.length} caracteres, ${paragrafosFiltrados.length} parágrafos`);
  return resultado;
}

export async function POST(req: NextRequest) {
  console.log("📥 API de upload chamada");
  
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    console.log(`📄 Processando: ${file.name} (${Math.round(file.size / 1024)} KB)`);
    
    let textoExtraido = "";
    
    try {
      // Tenta com pdf-parse
      const pdfModule = await import('pdf-parse');
      const pdfParse = pdfModule.default || pdfModule;
      
      if (typeof pdfParse !== 'function') {
        throw new Error('pdf-parse não é uma função');
      }
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      console.log("🔍 Extraindo texto com pdf-parse...");
      const data = await pdfParse(buffer);
      textoExtraido = data.text || "";
      
      if (textoExtraido.length > 0) {
        console.log(`✅ PDF processado: ${textoExtraido.length} caracteres brutos`);
      } else {
        throw new Error('Texto vazio extraído');
      }
      
    } catch (pdfError) {
      console.warn("❌ pdf-parse falhou:", pdfError.message);
      
      // Fallback básico
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      textoExtraido = buffer.toString('utf8', 0, Math.min(buffer.length, 500000));
      console.log(`⚠️ Usando fallback: ${textoExtraido.length} caracteres`);
    }

    // Limpa o texto extraído
    const textoLimpissimo = limparTextoPDF(textoExtraido);
    
    if (!textoLimpissimo || textoLimpissimo.trim().length < 100) {
      return NextResponse.json({
        success: false,
        error: "Não foi possível extrair conteúdo significativo do PDF. O arquivo pode ser uma imagem ou estar muito mal formatado.",
        text: "",
        raw_length: textoExtraido.length,
        clean_length: textoLimpissimo.length
      });
    }

    console.log(`🎯 PDF processado com sucesso! Texto limpo: ${textoLimpissimo.length} caracteres`);
    
    return NextResponse.json({
      success: true,
      text: textoLimpissimo,
      pages: 1,
      characters: textoLimpissimo.length,
      raw_characters: textoExtraido.length
    });

  } catch (error: any) {
    console.error("❌ Erro crítico no upload:", error);
    return NextResponse.json({ 
      error: "Erro ao processar arquivo: " + (error.message || "Desconhecido"),
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';