import { join } from "@std/path";

const POSTS_DIR = "./posts";

export interface Post {
  slug: string;
  content: string;
}

export async function getPost(slug: string): Promise<Post> {
  const text = await Deno.readTextFile(join(POSTS_DIR, `${slug}.md`));
  const post = {
    slug,
    content: text,
  };
  return post;
}
