import { useState, useMemo } from 'react';
import SearchBar from './SearchBar.jsx';
import Filters from './Filters.jsx';
import { matchesSearch } from '../utils/search.js';
import { matchesFilters, DEFAULT_FILTERS } from '../utils/filters.js';

const MODIFIABLE_FIELDS = [
  'Nom',
  'Prénom',
  'Classe actuelle (complète)',
  'Classe souhaitée (complète)',
  'Numéro de téléphone',
  'Facebook',
  'Autre contact',
  'Autre (préciser dans le message)'
];

export default function ModificationDrawer({ isOpen, onClose, requests }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('modify'); // 'modify' | 'delete'
  const [modifications, setModifications] = useState([{ field: '', newValue: '' }]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  // Filtrage des demandes pour la sélection
  const visibleRequests = useMemo(() => {
    return requests
      .filter((r) => matchesSearch(r, searchTerm))
      .filter((r) => matchesFilters(r, filters));
  }, [requests, searchTerm, filters]);

  if (!isOpen) return null;

  const handleNextStep1 = () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert("Veuillez entrer une adresse email valide.");
      return;
    }
    setStep(2);
  };

  const handleSelectRequest = (req) => {
    setSelectedRequest(req);
    setStep(3);
  };

  const addModificationField = () => {
    setModifications([...modifications, { field: '', newValue: '' }]);
  };

  const updateModification = (index, key, value) => {
    const newMods = [...modifications];
    newMods[index][key] = value;
    setModifications(newMods);
  };

  const removeModification = (index) => {
    const newMods = modifications.filter((_, i) => i !== index);
    setModifications(newMods);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (actionType === 'modify') {
      const validMods = modifications.filter(m => m.field && m.newValue);
      if (validMods.length === 0 && !message.trim()) {
        alert("Veuillez préciser au moins une modification ou ajouter un message.");
        return;
      }
    }

    setSubmitting(true);
    setSubmitStatus(null);

    const requestDetails = `
ID: ${selectedRequest.id}
Personne: ${selectedRequest.prenom} ${selectedRequest.nom}
Classe actuelle: ${selectedRequest.from.code}
Classe souhaitée: ${selectedRequest.to.code}
    `.trim();

    let modificationsText = '';
    if (actionType === 'modify') {
      modificationsText = modifications
        .filter(m => m.field && m.newValue)
        .map(m => `- ${m.field} : ${m.newValue}`)
        .join('\n');
    }

    const payload = {
      email_demandeur: email,
      type_demande: actionType === 'delete' ? 'SUPPRESSION' : 'MODIFICATION',
      demande_cible: requestDetails,
      modifications: modificationsText,
      message_additionnel: message,
      date: new Date().toISOString()
    };

    try {
      const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT;
      if (!endpoint) {
        // Fallback for development/testing if user hasn't set up formspree yet
        console.warn("VITE_FORMSPREE_ENDPOINT n'est pas défini. Simulation d'envoi.", payload);
        await new Promise(resolve => setTimeout(resolve, 1500)); // fake delay
      } else {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Erreur API');
      }
      setSubmitStatus('success');
    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetDrawer = () => {
    setStep(1);
    setEmail('');
    setSelectedRequest(null);
    setActionType('modify');
    setModifications([{ field: '', newValue: '' }]);
    setMessage('');
    setSubmitStatus(null);
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose}></div>
      <aside className="drawer-panel">
        <div className="drawer-header">
          <h2>Modifier / Supprimer</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">×</button>
        </div>

        <div className="drawer-content">
          {submitStatus === 'success' ? (
            <div className="drawer-success">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <h3>Demande envoyée !</h3>
              <p>Votre demande a été transmise à l'administrateur. Elle sera traitée manuellement dans les plus brefs délais.</p>
              <button className="btn btn-primary" onClick={() => { resetDrawer(); onClose(); }}>Fermer</button>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="drawer-step">
                  <h3>Étape 1 : Votre adresse email</h3>
                  <p className="field-hint">Nous avons besoin de votre email pour vous contacter si nécessaire lors du traitement de la modification.</p>
                  <div className="form-field">
                    <label htmlFor="drawer-email">Email</label>
                    <input 
                      id="drawer-email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre.email@exemple.com"
                    />
                  </div>
                  <button className="btn btn-primary drawer-btn-next" onClick={handleNextStep1} disabled={!email}>Suivant</button>
                </div>
              )}

              {step === 2 && (
                <div className="drawer-step step-selection">
                  <div className="step-header-with-back">
                    <button className="btn-back" onClick={() => setStep(1)}>← Retour</button>
                    <h3>Étape 2 : Sélectionnez votre demande</h3>
                  </div>
                  <div className="drawer-search-area">
                    <SearchBar value={searchTerm} onChange={setSearchTerm} />
                    <Filters filters={filters} onChange={setFilters} />
                  </div>
                  <div className="drawer-requests-list">
                    {visibleRequests.length === 0 ? (
                      <p className="empty-state-sub">Aucune demande trouvée.</p>
                    ) : (
                      visibleRequests.map(req => (
                        <div key={req.id} className="drawer-request-item" onClick={() => handleSelectRequest(req)}>
                          <div className="req-item-name">{req.prenom} {req.nom}</div>
                          <div className="req-item-classes">{req.from.code} → {req.to.code}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {step === 3 && selectedRequest && (
                <form className="drawer-step step-form" onSubmit={handleSubmit}>
                  <div className="step-header-with-back">
                    <button type="button" className="btn-back" onClick={() => setStep(2)}>← Changer</button>
                    <h3>Étape 3 : Que voulez-vous faire ?</h3>
                  </div>

                  <div className="selected-target">
                    <strong>Cible :</strong> {selectedRequest.prenom} {selectedRequest.nom} <br/>
                    <span className="target-classes">{selectedRequest.from.code} → {selectedRequest.to.code}</span>
                  </div>

                  <div className="action-toggle">
                    <label className={`toggle-option ${actionType === 'modify' ? 'active' : ''}`}>
                      <input type="radio" name="actionType" value="modify" checked={actionType === 'modify'} onChange={() => setActionType('modify')} />
                      Modifier
                    </label>
                    <label className={`toggle-option ${actionType === 'delete' ? 'active' : ''}`}>
                      <input type="radio" name="actionType" value="delete" checked={actionType === 'delete'} onChange={() => setActionType('delete')} />
                      Supprimer
                    </label>
                  </div>

                  {actionType === 'modify' && (
                    <div className="modifications-list">
                      <h4>Modifications souhaitées</h4>
                      {modifications.map((mod, index) => (
                        <div key={index} className="mod-row">
                          <select value={mod.field} onChange={(e) => updateModification(index, 'field', e.target.value)} disabled={submitting}>
                            <option value="">Choisir l'information...</option>
                            {MODIFIABLE_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                          <input 
                            type="text" 
                            placeholder="Nouvelle valeur" 
                            value={mod.newValue} 
                            onChange={(e) => updateModification(index, 'newValue', e.target.value)}
                            disabled={submitting}
                          />
                          {modifications.length > 1 && (
                            <button type="button" className="btn-remove-mod" onClick={() => removeModification(index)} title="Retirer" disabled={submitting}>×</button>
                          )}
                        </div>
                      ))}
                      <button type="button" className="btn btn-ghost btn-add-mod" onClick={addModificationField} disabled={submitting}>
                        + Ajouter une autre modification
                      </button>
                    </div>
                  )}

                  {actionType === 'delete' && (
                    <div className="delete-warning">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                      Vous êtes sur le point de demander la suppression définitive de cette demande de permutation.
                    </div>
                  )}

                  <div className="form-field">
                    <label htmlFor="drawer-message">Message / Commentaire (facultatif)</label>
                    <textarea 
                      id="drawer-message" 
                      rows="3" 
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Précisez votre demande si nécessaire..."
                      disabled={submitting}
                    ></textarea>
                  </div>

                  {submitStatus === 'error' && (
                    <div className="form-error drawer-error">
                      Erreur lors de l'envoi. Veuillez vérifier votre connexion ou vous assurer que l'URL d'envoi d'email est bien configurée.
                    </div>
                  )}

                  <div className="form-actions drawer-actions">
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Envoi en cours...' : 'Envoyer la demande'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
