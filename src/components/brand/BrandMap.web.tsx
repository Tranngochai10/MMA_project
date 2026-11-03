import React from 'react';

export function BrandMap({ query }: { query: string }) {
  return <iframe title={`Bản đồ ${query}`} src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`} loading="lazy" style={{ width: '100%', height: 220, border: 0, borderRadius: 12 }} allowFullScreen />;
}
