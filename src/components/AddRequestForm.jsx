import { useState } from 'react';
import { SECTIONS, YEARS, TDS, TPS, buildClassCode, sectionLabel } from '../data/classStructure.js';
import { checkPhoneRateLimit } from '../services/permutations.js';

const EMPTY_CONTACT_FIELDS = {
  whatsapp: { checked: false, value: '' },
  facebook: { checked: false, value: '' },
  autre: { checked: false, value: '' },
};

const NOM_MAX_LENGTH = 20;
const PRENOM_MAX_LENGTH = 20;
const FACEBOOK_MAX_LENGTH = 100;
const AUTRE_MAX_LENGTH = 30;

function emptyClassSelection() {
  return { section: '', year: '', td: '', tp: '' };
}

// Validation du numéro de téléphone :
// Le format attendu est +216 suivi de exactement 8 chiffres.
function isPhoneValid(value) {
  const withoutPrefix = value.replace(/^\+?216\s*/, '');
  const digits = withoutPrefix.replace(/\D/g, '');
  return digits.length === 8;
}

// Formate le temps restant avant la fin du blocage anti-spam.
function formatTimeRemaining(unlockTime) {
  const diff = unlockTime.getTime() - Date.now();
  if (diff <= 0) return 'quelques instants';
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  if (hours > 0) return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}

export default function AddRequestForm({ onSubmit, onCancel }) {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [from, setFrom] = useState(emptyClassSelection());
  const [to, setTo] = useState({ section: '', year: '', td: '', tp: '' });
  const [contacts, setContacts] = useState(EMPTY_CONTACT_FIELDS);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateFrom(key, value) {
    const nextFrom = { ...from, [key]: value };
    setFrom(nextFrom);
    if (key === 'section') {
      setTo((prevTo) => ({ ...prevTo, section: value }));
    }
    if (key === 'year') {
      setTo((prevTo) => ({ ...prevTo, year: value }));
    }
  }

  function updateTo(key, value) {
    if (key === 'section') return;
    if (key === 'year') return;
    setTo((prevTo) => ({ ...prevTo, [key]: value }));
  }

  function toggleContact(key) {
    setContacts((prev) => ({
      ...prev,
      [key]: { ...prev[key], checked: !prev[key].checked },
    }));
  }

  function updateContactValue(key, value) {
    if (key === 'facebook' && value.length > FACEBOOK_MAX_LENGTH) return;
    if (key === 'autre' && value.length > AUTRE_MAX_LENGTH) return;
    setContacts((prev) => ({
      ...prev,
      [key]: { ...prev[key], value },
    }));
  }

  function validate() {
    if (!nom.trim() || !prenom.trim()) {
      return 'Merci de renseigner le nom et le prénom.';
    }
    if (!from.section || !from.year || !from.td || !from.tp) {
      return 'Merci de compléter entièrement la classe actuelle.';
    }
    if (!to.td || !to.tp) {
      return 'Merci de compléter entièrement la classe souhaitée.';
    }
    if (to.section !== from.section) {
      return 'La classe souhaitée doit être dans la même section que la classe actuelle.';
    }
    if (String(to.year) !== String(from.year)) {
      return 'La classe souhaitée doit être dans la même année que la classe actuelle.';
    }
    if (to.td === from.td && to.tp !== 'ANY' && to.tp === from.tp) {
      return 'La classe souhaitée doit être différente de la classe actuelle. Modifiez au moins le TD ou le groupe TP.';
    }
    const activeContacts = Object.entries(contacts).filter(
      ([, c]) => c.checked && c.value.trim()
    );
    if (activeContacts.length === 0) {
      return 'Merci de fournir au moins un moyen de contact.';
    }
    if (contacts.whatsapp.checked && contacts.whatsapp.value.trim()) {
      if (!isPhoneValid(contacts.whatsapp.value)) {
        return 'Le numéro WhatsApp est invalide. Il doit contenir exactement 8 chiffres après le préfixe +216 (format : +216 XX XXX XXX).';
      }
    }
    if (contacts.facebook.checked && contacts.facebook.value.length > FACEBOOK_MAX_LENGTH) {
      return `Le champ Facebook ne doit pas dépasser ${FACEBOOK_MAX_LENGTH} caractères.`;
    }
    if (contacts.autre.checked && contacts.autre.value.length > AUTRE_MAX_LENGTH) {
      return `Le champ "Autre" ne doit pas dépasser ${AUTRE_MAX_LENGTH} caractères.`;
    }
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const finalContacts = {};
      Object.entries(contacts).forEach(([key, c]) => {
        if (c.checked && c.value.trim()) finalContacts[key] = c.value.trim();
      });

      // Anti-spam : vérifier si le numéro a été utilisé dans les 8 dernières heures.
      const phone = finalContacts.whatsapp || null;
      if (phone) {
        const rateCheck = await checkPhoneRateLimit(phone);
        if (!rateCheck.allowed) {
          const remaining = formatTimeRemaining(rateCheck.unlockTime);
          setError(`Vous avez déjà publié une demande récemment avec ce numéro. Vous pourrez en publier une nouvelle dans ${remaining}.`);
          return;
        }
      }

      const request = {
        nom: nom.trim(),
        prenom: prenom.trim(),
        from: { ...from },
        to: { ...to },
        contacts: finalContacts,
      };

      // onSubmit (App.handleAddRequest) propage les erreurs naturellement.
      await onSubmit(request);
      // Si on arrive ici, la publication a réussi. Le formulaire sera
      // démonté par App (showForm = false), donc pas besoin de reset.
    } catch (err) {
      setError('Impossible de publier votre demande. Vérifiez votre connexion et réessayez.');
    } finally {
      setSubmitting(false);
    }
  }

  const yearLabel = from.year
    ? (from.year === 1 || from.year === '1' ? '1ère année' : `${from.year}ème année`)
    : '';

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="nom">Nom</label>
          <input id="nom" value={nom} maxLength={NOM_MAX_LENGTH} onChange={(e) => setNom(e.target.value)} disabled={submitting} />
        </div>
        <div className="form-field">
          <label htmlFor="prenom">Prénom</label>
          <input id="prenom" value={prenom} maxLength={PRENOM_MAX_LENGTH} onChange={(e) => setPrenom(e.target.value)} disabled={submitting} />
        </div>
      </div>

      <div className="class-grid">
        <fieldset className="class-fieldset" disabled={submitting}>
          <legend>Classe actuelle</legend>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="from-section">Section</label>
              <select
                id="from-section"
                value={from.section}
                onChange={(e) => updateFrom('section', e.target.value)}
              >
                <option value="">Choisir...</option>
                {SECTIONS.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="from-year">Année</label>
              <select
                id="from-year"
                value={from.year}
                onChange={(e) => updateFrom('year', e.target.value)}
              >
                <option value="">Choisir...</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="from-td">Classe</label>
              <select
                id="from-td"
                value={from.td}
                onChange={(e) => updateFrom('td', e.target.value)}
              >
                <option value="">Choisir...</option>
                {TDS.map((td) => (
                  <option key={td} value={td}>
                    {td}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="from-tp">Groupe</label>
              <select
                id="from-tp"
                value={from.tp}
                onChange={(e) => updateFrom('tp', e.target.value)}
              >
                <option value="">Choisir...</option>
                {TPS.map((tp) => (
                  <option key={tp} value={tp}>
                    {tp}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {from.section && from.year && from.td && from.tp && (
            <p className="code-preview">Code : {buildClassCode(from)}</p>
          )}
        </fieldset>

        <fieldset className="class-fieldset" disabled={submitting}>
          <legend>Classe souhaitée</legend>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="to-section">Section</label>
              <input
                id="to-section"
                value={from.section ? sectionLabel(from.section) : ''}
                placeholder="Choisissez d'abord la classe actuelle"
                disabled
                readOnly
              />
            </div>
            <div className="form-field">
              <label htmlFor="to-year">Année</label>
              <input
                id="to-year"
                value={yearLabel}
                placeholder="Choisissez d'abord l'année actuelle"
                disabled
                readOnly
              />
            </div>
            <div className="form-field">
              <label htmlFor="to-td">Classe</label>
              <select
                id="to-td"
                value={to.td}
                disabled={!from.section || !from.year}
                onChange={(e) => updateTo('td', e.target.value)}
              >
                <option value="">Choisir...</option>
                {TDS.map((td) => (
                  <option key={td} value={td}>
                    {td}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="to-tp">Groupe</label>
              <select
                id="to-tp"
                value={to.tp}
                disabled={!from.section || !from.year}
                onChange={(e) => updateTo('tp', e.target.value)}
              >
                <option value="">Choisir...</option>
                {TPS.map((tp) => (
                  <option key={tp} value={tp}>
                    {tp}
                  </option>
                ))}
                <option value="ANY">Peu importe le groupe</option>
              </select>
            </div>
          </div>
          {to.section && to.year && to.td && to.tp && (
            <p className="code-preview">
              Code : {to.tp === 'ANY' ? `${to.year}${to.section}${to.td} (groupe indifférent)` : buildClassCode(to)}
            </p>
          )}
          <p className="field-hint">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            La section et l'année restent identiques à la classe actuelle.
          </p>
        </fieldset>
      </div>

      <fieldset className="contacts-fieldset" disabled={submitting}>
        <legend>Moyen(s) de contact (au moins un)</legend>

        <div className="contact-item">
          <label className="contact-checkbox">
            <input
              type="checkbox"
              checked={contacts.whatsapp.checked}
              onChange={() => toggleContact('whatsapp')}
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            WhatsApp
          </label>
          {contacts.whatsapp.checked && (
            <input
              className="contact-input"
              placeholder="+216 XX XXX XXX"
              value={contacts.whatsapp.value}
              onChange={(e) => updateContactValue('whatsapp', e.target.value)}
            />
          )}
        </div>

        <div className="contact-item">
          <label className="contact-checkbox">
            <input
              type="checkbox"
              checked={contacts.facebook.checked}
              onChange={() => toggleContact('facebook')}
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            Facebook
          </label>
          {contacts.facebook.checked && (
            <>
              <input
                className="contact-input"
                placeholder="facebook.com/votre-profil"
                value={contacts.facebook.value}
                maxLength={FACEBOOK_MAX_LENGTH}
                onChange={(e) => updateContactValue('facebook', e.target.value)}
              />
              <span className="char-counter">
                {contacts.facebook.value.length}/{FACEBOOK_MAX_LENGTH}
              </span>
            </>
          )}
        </div>

        <div className="contact-item">
          <label className="contact-checkbox">
            <input
              type="checkbox"
              checked={contacts.autre.checked}
              onChange={() => toggleContact('autre')}
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            Autre
          </label>
          {contacts.autre.checked && (
            <>
              <input
                className="contact-input"
                placeholder="Ex : Instagram, email..."
                value={contacts.autre.value}
                maxLength={AUTRE_MAX_LENGTH}
                onChange={(e) => updateContactValue('autre', e.target.value)}
              />
              <span className="char-counter">
                {contacts.autre.value.length}/{AUTRE_MAX_LENGTH}
              </span>
            </>
          )}
        </div>
      </fieldset>

      <div className="form-notices">
        <p>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          Ne publiez pas plusieurs fois la même demande.
        </p>
        <p>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          Vérifiez attentivement vos informations avant l'envoi.
        </p>
        <p>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Tout contenu vulgaire, offensant ou inapproprié est interdit.
        </p>
      </div>

      {error && (
        <div className="form-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          {error}
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
          Annuler
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Publication en cours…' : 'Publier la demande'}
        </button>
      </div>
    </form>
  );
}
