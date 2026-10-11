import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { siteConfig } from "@/config/site";

const blogDirectory = path.join(process.cwd(), "src/content/blog");

export function getBlogPosts() {
  const fileNames = fs.readdirSync(blogDirectory);
  
  const allPosts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(blogDirectory, fileName);
    let fileContents = fs.readFileSync(fullPath, "utf8");
    fileContents = fileContents.replace(/\*\*Zipek\*\*/g, `**${siteConfig.shortName}**`);
    const { data } = matter(fileContents);
    
    return {
      slug,
      ...(data as { title: string; date: string; readTime: string; excerpt: string }),
    };
  });
  
  return allPosts;
}

export function getPostBySlug(slug: string) {
  const fullPath = path.join(blogDirectory, `${slug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  
  let fileContents = fs.readFileSync(fullPath, "utf8");
  fileContents = fileContents.replace(/\*\*Zipek\*\*/g, `**${siteConfig.shortName}**`);
  const { data, content } = matter(fileContents);
  
  return {
    slug,
    content,
    ...(data as { title: string; date: string; readTime: string; excerpt: string }),
  };
}
