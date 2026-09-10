import { SECTIONS, YEARS, TDS, TPS } from '../data/classStructure.js';
import { DEFAULT_FILTERS, isFiltersActive } from '../utils/filters.js';

export default function Filters({ filters, onChange }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="filters">
      <div className="filter-field">
        <label htmlFor="filter-section">Section</label>
        <select
          id="filter-section"
          value={filters.section}
          onChange={(e) => update('section', e.target.value)}
        >
          <option value="ALL">Toutes</option>
          {SECTIONS.map((s) => (
            <option key={s.code} value={s.code}>
              {s.code}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filter-year">Année</label>
        <select
          id="filter-year"
          value={filters.year}
          onChange={(e) => update('year', e.target.value)}
        >
          <option value="ALL">Toutes</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y === 1 ? '1ère année' : `${y}ème année`}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filter-td">Classe</label>
        <select
          id="filter-td"
          value={filters.td}
          onChange={(e) => update('td', e.target.value)}
        >
          <option value="ALL">Toutes</option>
          {TDS.map((td) => (
            <option key={td} value={td}>
              {td}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filter-tp">Groupe</label>
        <select
          id="filter-tp"
          value={filters.tp}
          onChange={(e) => update('tp', e.target.value)}
        >
          <option value="ALL">Tous</option>
          {TPS.map((tp) => (
            <option key={tp} value={tp}>
              {tp}
            </option>
          ))}
        </select>
      </div>

      {isFiltersActive(filters) && (
        <button
          type="button"
          className="btn-reset"
          onClick={() => onChange(DEFAULT_FILTERS)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}
