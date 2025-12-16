import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração para evitar erros de módulo
  serverExternalPackages: ['pdf-parse'],
};

export default nextConfig;