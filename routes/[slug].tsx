import { Handlers, PageProps } from "$fresh/server.ts";

import { getPost, Post } from "../lib/posts.ts";

export const handler: Handlers<Post> = {
  async GET(_req, ctx) {
    try {
      const post = await getPost(ctx.params.slug);
      return ctx.render(post);
    } catch {
      return ctx.renderNotFound();
    }
  },
};

export default function PostPage(props: PageProps<Post>) {
  const post = props.data;
  return (
    <>
      <main>
        <div
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </main>
    </>
  );
}
