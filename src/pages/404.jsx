import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center flex-col gap-4 text-center px-4">
      <p className="font-mono text-accent text-6xl font-bold">404</p>
      <h1 className="text-2xl font-bold text-white">Page not found</h1>
      <p className="text-text-secondary">The page you're looking for doesn't exist.</p>
      <Link href="/" className="btn-primary mt-2">Go Home</Link>
    </div>
  );
}
