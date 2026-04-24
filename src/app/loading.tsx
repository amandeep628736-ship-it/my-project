export default function Loading() {
  return (
    <div className="container py-16">
      <div className="flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <p className="text-muted mt-4">Loading...</p>
      </div>
    </div>
  );
}

