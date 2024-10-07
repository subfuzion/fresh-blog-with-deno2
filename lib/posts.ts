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
  console.log(post);
  return post;
}
