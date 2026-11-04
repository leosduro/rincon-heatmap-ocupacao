# Heatmap de Ocupação Preditivo em Tempo Real – Rincon PMS

Módulo completo para o sistema **Rincon** (PMS multi-tenant NestJS + Next.js + Prisma + PostgreSQL).

## Objetivo

Eliminar comunicação por rádio/WhatsApp e consultas em relatórios dispersos entre **Recepção** e **Governança**.  
Uma única tela visual, preditiva e em tempo real com decisões em **1 clique**.

## Principais Características

- Heatmap visual por andar/bloco com código de cores intuitivo
- Cálculo preditivo de risco (check-in previsto vs tempo médio de limpeza)
- Atualização em tempo real via WebSocket (sem refresh)
- Ações rápidas: iniciar limpeza, marcar pronto, atribuir camareira, priorizar
- Algoritmo de priorização automática para evitar gargalos no check-in
- Baixa carga cognitiva (ergonomia intelectual máxima)

## Stack

- **Backend**: NestJS + Socket.io + Prisma
- **Frontend**: Next.js (React) + Tailwind
- **Banco**: PostgreSQL
- **Demo**: HTML puro → abra `demo/heatmap-demo.html`

## Estrutura

- `demo/heatmap-demo.html` — demo interativa (abra no navegador)
- `backend/` — PredictiveService, Gateway WebSocket e Controller
- `frontend/` — hook useHeatmap + componente HeatmapView
- `prisma/schema-additions.prisma` — models a adicionar

## Como usar a Demo

1. Abra o arquivo `demo/heatmap-demo.html` diretamente no navegador.
2. Use os botões para simular check-in iminente, iniciar e finalizar limpeza.
3. Observe as cores, o badge URGENTE e a fila de prioridade atualizando.

## Lógica Preditiva

```
margem = minutos_até_checkin - (tempo_médio_limpeza + buffer)
CRITICAL → margem < 15 min
HIGH     → margem < 30 min
MEDIUM   → margem < 60 min
LOW      → margem ≥ 60 min
SAFE     → sem check-in previsto
```

## Integração no Rincon

1. Adicione os models do Prisma e rode a migration.
2. Copie os arquivos de backend para o módulo NestJS correspondente.
3. No frontend, use o hook e o componente.
4. Emita eventos de atualização nos pontos de check-in, checkout e mudança de status.

---
Gerado para o projeto Rincon / Vem Hotel – Novembro 2026