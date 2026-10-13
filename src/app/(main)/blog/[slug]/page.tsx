

import { getPostBySlug, getBlogPosts } from "@/lib/mdx";
import { features, siteConfig } from "@/config/site";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import FadeIn from "@/components/layout/FadeIn";
import ReactMarkdown from "react-markdown";

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!features.enableBlog) notFound();
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <main className="flex-grow pt-32 pb-20">
        <FadeIn>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/blog" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Blog
            </Link>

            <header className="mb-12">
              <div className="flex items-center gap-4 text-sm text-primary-light mb-4 font-medium">
                <span>{post.date}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span>{post.readTime} de lectura</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>
              <p className="text-xl text-gray-400">{post.excerpt}</p>
            </header>

            <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-primary hover:prose-a:text-primary-light prose-strong:text-white prose-p:text-gray-300">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
            
            <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-center">
              <p className="text-gray-400 text-sm">Escrito por el equipo de {siteConfig.name}</p>
              <Link href="/#contacto" className="px-6 py-2 bg-primary hover:bg-primary-light text-white rounded-full font-medium transition-all text-sm">
                Asesoría Gratuita
              </Link>
            </div>
          </div>
        </FadeIn>
      </main>
      </>
  );
}
