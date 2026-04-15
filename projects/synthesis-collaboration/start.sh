#!/bin/bash
set -e

export TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN}"
export DATABASE_URL="file:./data/synthesis.db"
export OPENCLAW_WORKSPACE="${OPENCLAW_WORKSPACE:-/home/drg/.openclaw/workspace}"
export PORT="${PORT:-3008}"

mkdir -p data

echo "[Setup] Running Prisma db push..."
npx prisma db push --accept-data-loss

echo "[Setup] Starting bot..."
npm run bot
