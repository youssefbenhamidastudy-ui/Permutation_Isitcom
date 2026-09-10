export const DEFAULT_FILTERS = {
  section: 'ALL',
  year: 'ALL',
  td: 'ALL',
  tp: 'ALL',
};

// Les filtres s'appliquent sur la classe actuelle de la demande (celle que
// l'étudiant quitte), car c'est ce qu'un autre étudiant cherche à obtenir.
export function matchesFilters(request, filters) {
  const { section, year, td, tp } = filters;
  if (section !== 'ALL' && request.from.section !== section) return false;
  if (year !== 'ALL' && String(request.from.year) !== String(year)) return false;
  if (td !== 'ALL' && request.from.td !== td) return false;
  if (tp !== 'ALL' && request.from.tp !== tp) return false;
  return true;
}

export function isFiltersActive(filters) {
  return filters.section !== 'ALL' || filters.year !== 'ALL' || filters.td !== 'ALL' || filters.tp !== 'ALL';
}
