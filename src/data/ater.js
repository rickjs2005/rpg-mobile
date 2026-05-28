/* ============================================================
   ATER — Assistência Técnica e Extensão Rural (EMATER/Incaper/Sebrae).
   Um agente visita a fazenda periodicamente e oferece um CURSO.
   Concluir o curso concede um PERK permanente + XP. Os perks têm
   efeito mecânico lido nas ações do reducer. Funções puras.
   ============================================================ */

export const ATER_PRIMEIRA_VISITA = 45; // dias até a 1ª visita
export const ATER_INTERVALO_DIAS = 150; // ~2-3 visitas por ano

// Cursos liberados por nível (pré-requisito de XP). Perk = id do curso.
export const CURSOS = [
  { id: "mip", icone: "🔬", nome: "Manejo Integrado de Pragas", desc: "A amostragem (vistoria) passa a ser gratuita.", nivelMin: 1, xp: 40 },
  { id: "poda", icone: "✂️", nome: "Poda e Renovação", desc: "Esqueletamento e recepa ficam 30% mais baratos.", nivelMin: 2, xp: 60 },
  { id: "irrigacao", icone: "💧", nome: "Irrigação Eficiente", desc: "Instalar irrigação fica 20% mais barato.", nivelMin: 2, xp: 60 },
  { id: "gestao", icone: "📊", nome: "Gestão Rural (Sebrae)", desc: "+5% no preço de venda do café.", nivelMin: 3, xp: 100 },
];

export function cursoPorId(id) {
  return CURSOS.find((c) => c.id === id) || null;
}

// Próximo curso ainda não feito e liberado pro nível atual.
export function proximoCurso(cursosFeitos, nivel) {
  return CURSOS.find((c) => !cursosFeitos?.[c.id] && c.nivelMin <= nivel)?.id || null;
}
