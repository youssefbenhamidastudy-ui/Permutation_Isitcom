import RequestCard from './RequestCard.jsx';

export default function RequestList({ requests }) {
  if (requests.length === 0) {
    return (
      <div className="empty-state">
        <p>Aucune demande ne correspond à votre recherche.</p>
        <p className="empty-state-sub">
          Essayez d'autres filtres, ou soyez le premier à publier une
          demande !
        </p>
      </div>
    );
  }

  return (
    <div className="request-list">
      {requests.map((r) => (
        <RequestCard key={r.id} request={r} />
      ))}
    </div>
  );
}
