
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MilestonesPage from "./pages/MilestonesPage";
import MilestoneDetailPage from "./pages/MilestoneDetailPage";
import GoalsPage from "./pages/GoalsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/milestones" element={<MilestonesPage />} />
            <Route path="/milestones/:id" element={<MilestoneDetailPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Calendário Liebe está rodando!');
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});


export default App;
