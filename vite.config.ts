
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify("https://hszrxypoyqqzdkunvmjo.supabase.co"),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzenJ4eXBveXFxemRrdW52bWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNzkzOTgsImV4cCI6MjA1Mzg1NTM5OH0.BNcnWmNDRljdg9-IUmrkU0UGfruX2mzmyr3eS1kW9Io"),
    },
  };
});
