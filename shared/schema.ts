import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Metrics Schema
export interface MetricaAnuncio {
  idx: number;
  id: string;
  data_registro: string;
  nome_anuncio: string;
  link_criativo: string;
  valor_gasto: string;
  conversas_iniciadas: number;
  custo_por_conversa: string;
  impressoes: number;
  alcance: number;
  frequencia: string;
  cliques_todos: number;
  cliques_link: number;
  ctr_todos: string;
  ctr_link: string;
  cpm: string;
  cpc_todos: string;
  custo_clique_link: string;
  engajamento_publicacao: number;
  visualizacoes_video: number;
  custo_visualizacao_video: string;
  created_at: string;
}

export type TipoNegocio = 'mensagens' | 'vendas';

export interface ClienteInfo {
  nome: string;
  slug: string;
  logo_url: string;
  tipo_negocio: TipoNegocio;
  meta_mensal_conversas?: number;
  meta_mensal_investimento?: number;
  meta_mensal_vendas?: number;
  meta_roi?: number;
}

export interface ResumoMetricas {
  investimento_total: number;
  conversas_iniciadas: number;
  custo_medio_conversa: number;
  impressoes: number;
  alcance: number;
  cliques_todos: number;
  cliques_link: number;
  ctr_medio: number;
  cpm_medio: number;
  cpc_medio: number;
  frequencia_media: number;
  engajamento_total: number;
  visualizacoes_video: number;
  vendas_geradas?: number;
  receita_total?: number;
  roi?: number;
  ticket_medio?: number;
}
