import { Link } from 'react-router-dom';

export default function LegalPageLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-card/80">
        <div className="container-narrow flex items-center justify-between py-4">
          <Link to="/" className="text-sm font-medium text-primary hover:underline">
            ← Nazad na početnu
          </Link>
        </div>
      </div>
      <article className="container-narrow max-w-3xl space-y-6 py-10 text-sm leading-relaxed text-muted-foreground">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {children}
      </article>
    </div>
  );
}
