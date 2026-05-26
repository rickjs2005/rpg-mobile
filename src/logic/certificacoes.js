/* ============================================================
   CERTIFICAÇÕES — Lote F.
   Aderir, processar transição, calcular prêmio sobre o preço,
   invalidar orgânico se aplicar defensivo.
   ============================================================ */

import { CERTIFICACOES } from "../data/economia.js";

// Estado inicial vazio (sem cert).
export function certsVazias() {
  return {};
}

// Inicia a adesão de uma certificação. Retorna o objeto state da cert.
export function aderir(certId, tempo) {
  const def = CERTIFICACOES[certId];
  if (!def) return null;
  // Cert sem transição entra ativa direto. Com transição (orgânico),
  // começa "em transição" e fica ativa após X dias sem defensivo.
  if (def.diasTransicao === 0) {
    return { ativa: true, emTransicao: false, diasNaTransicao: 0, dataAdesao: { ...tempo } };
  }
  return { ativa: false, emTransicao: true, diasNaTransicao: 0, dataAdesao: { ...tempo } };
}

// Avança 1 dia na transição (chamado pelo loop diário do reducer).
// Retorna { certs, eventos }.
export function avancarTransicaoDia(certs) {
  if (!certs) return { certs: {}, eventos: [] };
  const eventos = [];
  const nova = { ...certs };
  let mudou = false;
  for (const [id, c] of Object.entries(certs)) {
    if (!c.emTransicao) continue;
    const def = CERTIFICACOES[id];
    if (!def) continue;
    const dias = c.diasNaTransicao + 1;
    if (dias >= def.diasTransicao) {
      nova[id] = { ...c, emTransicao: false, ativa: true, diasNaTransicao: dias };
      eventos.push(`${def.icone} Certificação ${def.nome} ATIVADA após transição!`);
      mudou = true;
    } else {
      nova[id] = { ...c, diasNaTransicao: dias };
      mudou = true;
    }
  }
  return { certs: mudou ? nova : certs, eventos };
}

// Aplicar defensivo invalida orgânico (transição OU ativa).
// Retorna { certs, eventos } com a cert reset se invalidada.
export function invalidarPorDefensivo(certs) {
  if (!certs) return { certs: {}, eventos: [] };
  const eventos = [];
  const nova = { ...certs };
  let mudou = false;
  for (const [id, c] of Object.entries(certs)) {
    const def = CERTIFICACOES[id];
    if (!def?.invalidadoPorDefensivo) continue;
    if (c.ativa || c.emTransicao) {
      delete nova[id];
      eventos.push(`💔 Defensivo aplicado — certificação ${def.nome} perdida.`);
      mudou = true;
    }
  }
  return { certs: mudou ? nova : certs, eventos };
}

// Multiplier total do prêmio das certificações ATIVAS.
// Soma os prêmios (cumulativo simplificado).
export function premioCertificacoes(certs) {
  if (!certs) return 0;
  let total = 0;
  for (const [id, c] of Object.entries(certs)) {
    if (!c.ativa) continue;
    total += CERTIFICACOES[id]?.premio || 0;
  }
  return total;
}

// Preço da saca COM bônus de certificações ativas.
export function precoComCertificacoes(precoBase, certs) {
  const premio = premioCertificacoes(certs);
  return Math.round(precoBase * (1 + premio));
}

// Custo anual total das certificações (somatório).
export function custoAnualCertificacoes(certs) {
  if (!certs) return 0;
  let total = 0;
  for (const [id, c] of Object.entries(certs)) {
    if (!c.ativa && !c.emTransicao) continue;
    total += CERTIFICACOES[id]?.custoAnual || 0;
  }
  return total;
}

// Texto curto do status de uma cert pra UI.
export function statusCertText(certs, certId) {
  const c = certs?.[certId];
  const def = CERTIFICACOES[certId];
  if (!c) return "não adquirida";
  if (c.ativa) return "ativa";
  if (c.emTransicao) {
    const dias = def.diasTransicao - c.diasNaTransicao;
    const meses = Math.ceil(dias / 30);
    return `em transição (${meses}m restantes)`;
  }
  return "—";
}
