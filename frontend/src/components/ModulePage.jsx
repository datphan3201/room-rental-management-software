import React from 'react';

export function ModulePage({ title, description }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <p className="muted">{description}</p>
    </section>
  );
}

