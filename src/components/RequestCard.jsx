import { formatRelativeTime } from '../utils/time.js';

export default function RequestCard({ request }) {
  const { nom, prenom, from, to, contacts, createdAt } = request;

  return (
    <article className="request-card">
      <div className="request-card-top">
        <h3>
          {prenom} {nom}
        </h3>
        <span className="request-time">{formatRelativeTime(createdAt)}</span>
      </div>

      <div className="request-swap">
        <span className="class-code">{from.code}</span>
        <svg className="swap-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        <span className="class-code class-code-target">
          {to.code}{to.tp === 'ANY' && <span className="any-tp-label"> (sans préférence)</span>}
        </span>
      </div>

      <div className="request-contacts">
        {contacts.whatsapp && (
          <span className="contact-pill">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            {contacts.whatsapp}
          </span>
        )}
        {contacts.facebook && (
          <span className="contact-pill">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            {contacts.facebook}
          </span>
        )}
        {contacts.autre && (
          <span className="contact-pill">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            {contacts.autre}
          </span>
        )}
      </div>
    </article>
  );
}
