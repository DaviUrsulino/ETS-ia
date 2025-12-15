// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";

// A SOLUÇÃO DO ERRO ESTÁ AQUI:
// Usamos 'require' em vez de 'import' para o pdf-parse não reclamar de "default export"
const pdf = require("pdf-parse");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Transformar o arquivo em Buffer para a biblioteca ler
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extrair o texto
    const data = await pdf(buffer);

    return NextResponse.json({ text: data.text });

  } catch (error) {
    console.error("Erro ao ler PDF:", error);
    return NextResponse.json({ error: "Falha ao processar PDF" }, { status: 500 });
  }
}