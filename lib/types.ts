export interface Expert {
  id: string;
  name: string;
  affiliation: string;
  bio: string;
  summary: string; // AI-generated summary
  fields: string[]; // AI-extracted key fields
  createdAt: string;
}
