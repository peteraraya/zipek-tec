import Link from "next/link";

export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-background/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link href="/" className="font-bold tracking-wide text-white">
            ZIPEK <span className="text-primary-light">TECNOLOGÍA</span>
          </Link>
          <Link href="/#inicio" className="text-sm text-gray-400 hover:text-white">
            Volver al sitio
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
