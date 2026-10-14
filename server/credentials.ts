import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export interface ClaudeOAuthCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scopes?: string[];
  subscriptionType?: string;
}

export interface CredentialsStatus {
  loggedIn: boolean;
  expired: boolean;
  subscriptionType: string | null;
}

const CREDENTIALS_PATH = join(homedir(), ".claude", ".credentials.json");

async function readCredentials(): Promise<ClaudeOAuthCredentials | null> {
  try {
    const raw = await readFile(CREDENTIALS_PATH, "utf8");
    const data = JSON.parse(raw);
    const oauth = data?.claudeAiOauth;
    if (!oauth?.accessToken) return null;
    return oauth as ClaudeOAuthCredentials;
  } catch {
    return null;
  }
}

export async function getCredentialsStatus(): Promise<CredentialsStatus> {
  const creds = await readCredentials();
  if (!creds) return { loggedIn: false, expired: false, subscriptionType: null };
  const expired = typeof creds.expiresAt === "number" && creds.expiresAt < Date.now();
  return { loggedIn: true, expired, subscriptionType: creds.subscriptionType ?? null };
}

export async function getAccessToken(): Promise<string | null> {
  const creds = await readCredentials();
  if (!creds) return null;
  if (typeof creds.expiresAt === "number" && creds.expiresAt < Date.now()) return null;
  return creds.accessToken;
}
