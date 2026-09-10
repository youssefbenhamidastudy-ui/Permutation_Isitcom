// Service de permutations — couche de données Supabase.
// Il expose des fonctions qui retournent des objets au même format que
// celui attendu par les composants (from/to/contacts imbriqués).

import { supabase } from '../lib/supabase.js';
import { buildClassCode } from '../data/classStructure.js';

// Colonnes nécessaires côté frontend (management_token et expires_at exclus).
const SELECT_COLUMNS = 'id, nom, prenom, section, annee, td_actuel, tp_actuel, td_souhaite, tp_souhaite, telephone, facebook, autre_contact, created_at';

// ────────────────────────────────────────────────────────────────────────
// Mapping : ligne Supabase (colonnes plates) → objet UI (format imbriqué)
// ────────────────────────────────────────────────────────────────────────

function rowToRequest(row) {
  const from = {
    section: row.section,
    year: row.annee,
    td: row.td_actuel,
    tp: row.tp_actuel,
  };
  from.code = buildClassCode(from);

  const to = {
    section: row.section, // toujours identique
    year: row.annee,      // toujours identique
    td: row.td_souhaite,
    tp: row.tp_souhaite,
  };
  to.code = buildClassCode(to);

  const contacts = {};
  if (row.telephone) contacts.whatsapp = row.telephone;
  if (row.facebook) contacts.facebook = row.facebook;
  if (row.autre_contact) contacts.autre = row.autre_contact;

  return {
    id: row.id,
    nom: row.nom,
    prenom: row.prenom,
    from,
    to,
    contacts,
    createdAt: new Date(row.created_at).getTime(),
  };
}

// ────────────────────────────────────────────────────────────────────────
// Mapping inverse : objet formulaire → colonnes Supabase
// ────────────────────────────────────────────────────────────────────────

function requestToRow(request) {
  const row = {
    nom: request.nom,
    prenom: request.prenom,
    section: request.from.section,
    annee: Number(request.from.year),
    td_actuel: request.from.td,
    tp_actuel: request.from.tp,
    td_souhaite: request.to.td,
    tp_souhaite: request.to.tp,
    telephone: request.contacts.whatsapp || null,
    facebook: request.contacts.facebook || null,
    autre_contact: request.contacts.autre || null,
  };

  // Filet de sécurité : empêcher l'insertion si la classe est identique.
  if (row.td_actuel === row.td_souhaite && row.tp_souhaite !== 'ANY' && row.tp_actuel === row.tp_souhaite) {
    throw new Error('La classe souhaitée doit être différente de la classe actuelle.');
  }

  return row;
}

// ────────────────────────────────────────────────────────────────────────
// CRUD
// ────────────────────────────────────────────────────────────────────────

/**
 * Récupère toutes les permutations non expirées, triées par date DESC.
 * La politique RLS filtre déjà les expirées côté serveur.
 */
export async function fetchPermutations() {
  const { data, error } = await supabase
    .from('permutations')
    .select(SELECT_COLUMNS)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors du chargement des permutations :', error);
    throw error;
  }

  return (data || []).map(rowToRequest);
}

/**
 * Insère une nouvelle permutation et retourne l'objet mappé.
 * @param {object} request — objet construit par AddRequestForm (format imbriqué)
 */
export async function insertPermutation(request) {
  const row = requestToRow(request);

  const { data, error } = await supabase
    .from('permutations')
    .insert(row)
    .select(SELECT_COLUMNS)
    .single();

  if (error) {
    console.error("Erreur lors de l'ajout de la permutation :", error);
    throw error;
  }

  return rowToRequest(data);
}

// ────────────────────────────────────────────────────────────────────────
// Anti-spam : vérification de la limite par numéro de téléphone (8h)
// ────────────────────────────────────────────────────────────────────────

/**
 * Vérifie si un numéro de téléphone a déjà été utilisé dans les 8 dernières heures.
 * Retourne { allowed: true } ou { allowed: false, unlockTime: Date }.
 */
export async function checkPhoneRateLimit(phone) {
  if (!phone) return { allowed: true };

  const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('permutations')
    .select('created_at')
    .eq('telephone', phone)
    .gte('created_at', eightHoursAgo)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Erreur lors de la vérification anti-spam :', error);
    throw error;
  }

  if (data && data.length > 0) {
    const lastCreated = new Date(data[0].created_at);
    const unlockTime = new Date(lastCreated.getTime() + 8 * 60 * 60 * 1000);
    return { allowed: false, unlockTime };
  }

  return { allowed: true };
}
