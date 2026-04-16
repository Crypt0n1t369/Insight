# House Configuration Platform — Project Specification

## Overview
A web platform for configuring and ordering eco-friendly modular houses. Customers and professionals can configure house exteriors/interiors, simulate energy efficiency, and get answers via chat.

## Participants
- **Kristaps** — Project lead, visionary
- **Mārtiņš** — Technical/architect, skeptic (digital-first approach)
- **Jānis** — Was tasked to draft project specification after meeting

## Three Core Modules

### 1. Configurator
- 3D house builder (exterior + interior)
- Options: colors, materials, floor plans, floor thickness
- 3D engine: SketchUp/open-source + custom catalog import
- WordPress backend for product catalog
- 3-level uzdāvums (configuration tiers)

### 2. Energy Simulation
- Real-time heat loss, insulation calculation
- Cost comparison between material options
- Deterministic formula-based as primary method
- Monte Carlo simulation mentioned but deferred
- Data sourced from existing industry databases

### 3. Knowledge Base + Chat
- Material specs, construction regulations
- AI chat layer (GPT/llama)
- WordPress + frontend approach
- Telegram bot for client notifications/follow-up

## Tech Stack (Decided)
- **Backend:** WordPress (product catalog)
- **Frontend:** Custom (not finalized — WordPress vs Laravel vs custom)
- **3D:** SketchUp + open-source tools
- **PM:** Folder/file structure + Asana + Telegram bot
- **Chat/Notifications:** Telegram bot (dedicated project channel)

## Unresolved
- Final frontend stack choice
- Energy calc precision (Monte Carlo yes/no)
- 3D asset sourcing (who creates models)
- Knowledge base content maintenance
- Target user segment
- Pricing model
- Timeline & milestones
- Team roles beyond Mārtiņš
- Specifica document (Jānis's task — status unknown)
- Smart home module details
- AR/VR direction

## Meeting Reference
- **Transcript:** `/home/drg/.openclaw/workspace/transcript_latvian.json`
- **Duration:** 79 min 18s (1841 segments)
- **Date:** ~2026-03-29
- **Language:** Latvian (mostly garbled — base Whisper model)

## Status
- **Phase:** Discovery / Planning
- **Next action:** Kristaps to review this doc, Jānis to deliver specification draft, decide on demo/prototype approach
