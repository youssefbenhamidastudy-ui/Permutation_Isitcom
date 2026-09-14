import { useEffect, useMemo, useState, useCallback } from 'react';
import Header from './components/Header.jsx';
import SearchBar from './components/SearchBar.jsx';
import Filters from './components/Filters.jsx';
import RequestList from './components/RequestList.jsx';
import Modal from './components/Modal.jsx';
import AddRequestForm from './components/AddRequestForm.jsx';
import ModificationDrawer from './components/ModificationDrawer.jsx';
import AnimatedBackground from './components/AnimatedBackground.jsx';
import { fetchPermutations, insertPermutation } from './services/permutations.js';
import { matchesSearch } from './utils/search.js';
import { matchesFilters, DEFAULT_FILTERS } from './utils/filters.js';

export default function App() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showForm, setShowForm] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const loadRequests = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    fetchPermutations()
      .then((data) => setRequests(data))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  // Au premier chargement, on récupère les permutations depuis Supabase.
  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // handleAddRequest ne fait PAS de try/catch : les erreurs remontent
  // naturellement vers le formulaire qui les affiche à l'utilisateur.
  async function handleAddRequest(newRequest) {
    const saved = await insertPermutation(newRequest);
    setRequests((prev) => [saved, ...prev]);
    setShowForm(false);
  }

  const visibleRequests = useMemo(() => {
    return requests
      .filter((r) => matchesSearch(r, searchTerm))
      .filter((r) => matchesFilters(r, filters));
  }, [requests, searchTerm, filters]);

  return (
    <>
      <AnimatedBackground />
      <div className="page">
        <Header onAddClick={() => setShowForm(true)} />

        <div className="toolbar">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <Filters filters={filters} onChange={setFilters} />
        </div>

        <section>
          <h2 className="section-title">
            Demandes récentes{' '}
            <span className="count-badge" aria-live="polite">{visibleRequests.length}</span>
          </h2>
          {loading ? (
            <div className="empty-state">
              <p>Chargement des demandes…</p>
            </div>
          ) : loadError ? (
            <div className="empty-state">
              <p>Impossible de charger les demandes. Vérifiez votre connexion.</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={loadRequests}>
                Réessayer
              </button>
            </div>
          ) : (
            <RequestList requests={visibleRequests} />
          )}
        </section>

        {showForm && (
          <Modal title="Ajouter une permutation" onClose={() => setShowForm(false)}>
            <AddRequestForm
              onSubmit={handleAddRequest}
              onCancel={() => setShowForm(false)}
            />
          </Modal>
        )}

        {/* Bouton flottant pour modifier/supprimer */}
        <button 
          className="floating-edit-btn" 
          onClick={() => setShowDrawer(true)}
          aria-label="Modifier ou supprimer une demande"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          <span className="floating-edit-text">Modifier ou supprimer une demande</span>
        </button>

        {/* Drawer pour la modification/suppression */}
        <ModificationDrawer 
          isOpen={showDrawer} 
          onClose={() => setShowDrawer(false)} 
          requests={requests}
        />
      </div>
    </>
  );
}
