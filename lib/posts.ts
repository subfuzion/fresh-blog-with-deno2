import { extractYaml } from "@std/front-matter";
import { join } from "@std/path";

const POSTS_DIR = "./posts";

// This is what gets parsed from the post front matter
interface FrontMatter {
  title: string;
  published_at: string;
  blurb: string;
}

// This is what gets used for rendering
export interface Post {
  slug: string;
  title: string;
  publishedAt: Date | null;
  blurb: string;
  content: string;
}

export async function getPost(slug: string): Promise<Post> {
  const text = await Deno.readTextFile(join(POSTS_DIR, `${slug}.md`));
  const { attrs, body } = extractYaml<FrontMatter>(text);
  const post = {
    slug,
    title: attrs.title,
    publishedAt: attrs.published_at ? new Date(attrs.published_at) : null,
    blurb: attrs.blurb,
    content: body,
  };
  return post;
}

export async function getPosts(): Promise<Post[]> {
  const files = Deno.readDir(POSTS_DIR);
  const promises = [];
  for await (const file of files) {
    if (file.name.startsWith(".")) continue;
    const slug = file.name.replace(".md", "");
    promises.push(getPost(slug));
  }
  const posts = (await Promise.all(promises) as Post[])
    .filter((post) => post.publishedAt instanceof Date);
  posts.sort((a, b) => b.publishedAt!.getTime() - a.publishedAt!.getTime());
  return posts;
}
