// Recherche sur le nom, prénom, classe actuelle et classe souhaitée.
export function matchesSearch(request, term) {
  const cleaned = (term || '').trim().toLowerCase();
  if (!cleaned) return true;

  const haystack = [
    request.nom,
    request.prenom,
    request.from.code,
    request.to.code,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(cleaned);
}
