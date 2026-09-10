export default function Header({ onAddClick }) {
  return (
    <header className="header">
      <div className="header-text">
        <h1>Permutation de classes</h1>
        <p>
          Vous voulez changer de TD ou de TP ? Publiez votre demande, ou
          trouvez un autre étudiant qui cherche à échanger avec vous.
        </p>
      </div>
      <button className="btn btn-primary" onClick={onAddClick}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Ajouter permutation
      </button>
    </header>
  );
}
