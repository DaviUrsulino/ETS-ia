import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return Response.json({ error: 'Texto obrigatório' }, { status: 400 });
    }

    const result = await generateObject({
      // "gemini-flash-latest" é o modelo coringa que apareceu na sua lista
      model: google('models/gemini-flash-latest'), 
      schema: z.object({
        flashcards: z.array(z.object({
          front: z.string().describe('A pergunta do flashcard'),
          back: z.string().describe('A resposta explicativa'),
        })),
      }),
      prompt: `Gere 5 flashcards de estudo didáticos baseados neste texto: \n\n ${text}`,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error("ERRO NO TERMINAL:", error);
    // Devolve o erro para o front-end mostrar no alerta
    return Response.json({ error: 'Falha na IA. Olhe o terminal para detalhes.' }, { status: 500 });
  }
}