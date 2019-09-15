export interface SlackToken {
  id: number;
  access_token: string;
  scope: string;
  team_name: string;
  team_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface SlackConfiguration {
  id: number;
  team_id: string;
  channel_id: string;
  lat?: number;
  lng?: number;
  restaurant_ids?: string;
  limit?: number;
  language?: string;
  created_at: Date;
  updated_at: Date;
}
