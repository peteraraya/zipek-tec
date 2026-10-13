

import { features, portfolioData } from "@/config/site";
import { notFound } from "next/navigation";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FadeIn from "@/components/layout/FadeIn";

export async function generateStaticParams() {
  return portfolioData.map((project) => ({
    slug: project.slug,
  }));
}

export default async function CasoDeExito({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!features.enablePortfolio) notFound();
  const { slug } = await params;
  const project = portfolioData.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <>
      <main className="flex-grow pt-32 pb-20">
        <FadeIn>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/casos-de-exito" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Casos de Éxito
            </Link>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">{project.title}</h1>
            <p className="text-xl text-gray-400 mb-8">{project.description}</p>

            <div className="flex flex-wrap gap-2 mb-12">
              {project.tags.map((tag, idx) => (
                <span key={idx} className="px-4 py-2 text-sm font-medium rounded-full bg-primary/10 text-primary-light border border-primary/20">
                  {tag}
                </span>
              ))}
            </div>

            <div className="space-y-12">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">El Desafío</h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {project.challenge}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Nuestra Solución</h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {project.solution}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Resultados Obtenidos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.results.map((result, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-2xl p-6">
                      <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                      <span className="text-white font-medium">{result}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </main>
      </>
  );
}
