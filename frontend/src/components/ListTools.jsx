import React from 'react';

function readPath(item, path) {
  return String(path.split('.').reduce((value, key) => value?.[key], item) ?? '');
}

export function useListView(items, { searchFields = [], statusField = null, initialPageSize = 10 } = {}) {
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  const statusOptions = React.useMemo(() => {
    if (!statusField) return [];
    return [...new Set(items.map((item) => readPath(item, statusField)).filter(Boolean))].sort();
  }, [items, statusField]);

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery = !needle || searchFields.some((field) => readPath(item, field).toLowerCase().includes(needle));
      const matchesStatus = !status || readPath(item, statusField) === status;
      return matchesQuery && matchesStatus;
    });
  }, [items, query, searchFields, status, statusField]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  React.useEffect(() => {
    setPage(1);
  }, [query, status, pageSize]);

  return {
    items: pageItems,
    total: filtered.length,
    query,
    setQuery,
    status,
    setStatus,
    statusOptions,
    page: currentPage,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
  };
}

export function ListToolbar({ view, searchPlaceholder = 'Search records' }) {
  return (
    <div className="list-toolbar">
      <input
        value={view.query}
        onChange={(event) => view.setQuery(event.target.value)}
        placeholder={searchPlaceholder}
      />
      {view.statusOptions.length ? (
        <select value={view.status} onChange={(event) => view.setStatus(event.target.value)}>
          <option value="">All status</option>
          {view.statusOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : null}
      <select value={view.pageSize} onChange={(event) => view.setPageSize(Number(event.target.value))}>
        <option value="5">5 / page</option>
        <option value="10">10 / page</option>
        <option value="20">20 / page</option>
      </select>
      <div className="pager">
        <button type="button" onClick={() => view.setPage(Math.max(1, view.page - 1))} disabled={view.page <= 1}>
          Prev
        </button>
        <span>{view.page} / {view.totalPages} ({view.total})</span>
        <button type="button" onClick={() => view.setPage(Math.min(view.totalPages, view.page + 1))} disabled={view.page >= view.totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
