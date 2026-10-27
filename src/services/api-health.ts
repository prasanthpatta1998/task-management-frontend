import { apiClient } from "../lib/api-client";

export type ApiHealth = { status: string; service: string };

export function checkApiHealth(): Promise<ApiHealth> {
  return apiClient.get<ApiHealth>("/health/live");
}
