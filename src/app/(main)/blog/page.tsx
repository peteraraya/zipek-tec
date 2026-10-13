

import { features } from "@/config/site";
import FadeIn from "@/components/layout/FadeIn";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getBlogPosts } from "@/lib/mdx";
import { notFound } from "next/navigation";

export default function BlogPage() {
  if (!features.enableBlog) notFound();

  return (
    <>
      <main className="flex-grow pt-32 pb-20">
        <FadeIn>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Blog & <span className="text-gradient">Insights</span></h1>
              <p className="text-gray-400 text-lg">
                Artículos, guías y consejos técnicos para ayudar a tu negocio a tomar mejores decisiones digitales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getBlogPosts().map((post, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 group hover:border-primary/50 transition-colors flex flex-col h-full">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>{post.date}</span>
                    <span>{post.readTime} de lectura</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-3 group-hover:text-primary-light transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-400 mb-6 flex-grow">
                    {post.excerpt}
                  </p>
                  <Link href={`/blog/${post.slug}`} className="inline-flex items-center text-primary hover:text-primary-light font-medium mt-auto">
                    Leer artículo <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </main>
      </>
  );
}
