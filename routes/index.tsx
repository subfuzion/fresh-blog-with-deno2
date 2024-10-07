import { Handlers, PageProps } from "$fresh/server.ts";

import { getPosts, Post } from "../lib/posts.ts";

export const handler: Handlers<Post[]> = {
  async GET(_req, ctx) {
    const posts = await getPosts();
    return ctx.render(posts);
  },
};

export default function BlogIndexPage(props: PageProps<Post[]>) {
  const posts = props.data;
  return (
    <main class="max-w-screen-md px-4 pt-16 mx-auto">
      <h1 class="text-5xl font-bold">My Awesome Blog</h1>
      <div class="mt-8">
        {posts.map((post) => <PostCard post={post}/>)}
      </div>
    </main>
  );
}

function PostCard(props: { post: Post }) {
  const { post } = props;
  return (
    <div class="py-6 border(t gray-200)">
      <a class="sm:col-span-2" href={`/${post.slug}`}>
        <h3 class="text-xl text-gray-900 font-bold hover:underline ">
          {post.title}&nbsp;
          <time class="font-medium text-gray-600">
            ({post.publishedAt!.toLocaleDateString("en-us", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })})
          </time>
        </h3>
        <div class="text-gray-900">
          {post.blurb}
        </div>
      </a>
    </div>
  );
}
