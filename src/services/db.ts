import { createLocalDatabase } from "./localStore";
import { KANBAN_SEED } from "@constants/kanbanSeed";

const STORAGE_KEY = "macchina-core-db";

const seed: Record<string, unknown> = {};
Object.entries(KANBAN_SEED).forEach(([id, card]) => {
  seed[`cards/${id}`] = card;
});

export const db = createLocalDatabase(STORAGE_KEY, seed);
