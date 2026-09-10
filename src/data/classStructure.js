// Structure de l'université : sections, années, classes (TD) et groupes (TP).
// Isolé dans son propre fichier pour pouvoir être remplacé plus tard par des
// données venant d'une vraie base de données sans toucher au reste du code.

export const SECTIONS = [
  { code: 'LM', label: 'LM — Informatique & Multimédia' },
  { code: 'LT', label: 'LT — Télécommunications' },
  { code: 'IOT', label: 'IoT — Systèmes Embarqués & IoT' },
];

export const YEARS = [1, 2, 3];

export const TDS = ['TD1', 'TD2', 'TD3', 'TD4'];

export const TPS = ['TP1', 'TP2'];

export function sectionLabel(code) {
  const found = SECTIONS.find((s) => s.code === code);
  return found ? found.label : code;
}

// Construit le code de classe complet, ex: { year: 3, section: 'LM', td: 'TD4', tp: 'TP1' }
// -> "3LMTD4TP1"
export function buildClassCode({ year, section, td, tp }) {
  if (!year || !section || !td || !tp) return '';
  if (tp === 'ANY') return `${year}${section}${td}`;
  return `${year}${section}${td}${tp}`;
}

// Libellé lisible pour affichage, ex: "3ème année LM · TD4 · TP1"
export function classDisplayLabel({ year, section, td, tp }) {
  if (!year || !section || !td || !tp) return '';
  const yearLabel = year === 1 ? '1ère année' : `${year}ème année`;
  return `${yearLabel} ${section} · ${td} · ${tp}`;
}
