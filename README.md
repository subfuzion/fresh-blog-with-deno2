# Create a blog with Fresh and Deno 2

If you haven't heard about Fresh, a popular web framework built on Deno, go take a quick look at the [home page](https://fresh.deno.dev/) first and then come back here.

For a slightly better reading experience, the following guide is also published here:

https://codesnip.sh/deno/fresh-blog-from-scratch

Coming primarily from Next.js and Astro, I'm intrigued and pleased to find lots to like about Fresh. The idea that everything is a server component that ships HTML to the client by default, but supports [islands architecture](https://fresh.deno.dev/docs/concepts/architecture) for independently rehydrated regions of interactivity where needed, really fits my use case well. I'm getting ready to start migrating [Fantastic Realms](https://fantasticrealms.ai), a Next.js project I'm working on (hoping to launch in early 2025), over to Deno and Fresh, and I plan to showcase that effort shortly.

Andy Jiang ([@andyjiang](https://x.com/andyjiang))'s excellent [Fresh blog example](https://deno.com/blog/build-a-blog-with-fresh) was literally the first tutorial I followed when I was coming up to speed. I'm going to riff on his work with some tweaks to help others also come up to speed using the latest Deno release candidate in time for the official 2.0 launch this week.

This is a quick dive into a simple blog engine to orient you to Deno and Fresh. Ideally you're already at least a bit familiar with another web framework, like Next.js. Here's what we'll cover here:

* Setting up (installing Deno, upgrading to the latest 2.0 RC, and initializing a Fresh project)
* Deleting unnecessary boilerplate to start "fresh" ;)
* Adding components for rendering the blog index and individual blog posts

<details>

<summary>Setting up</summary>

## Getting Started

### Install Deno

 1. Download and install Deno using the instructions at: https://docs.deno.com/runtime/
 2. Verify successful installation by entering the following command at a command prompt:

```
deno --version
```

### Upgrade to Deno 2 (release candidate)

If you're reading this after the 2.0 launch, you can skip this section. Otherwise, ensure you have have the latest 1.x version.:

```
deno upgrade
```

Then upgrade to the latest release candidate for Deno 2:

```
deno upgrade rc
```

Confirm you're on the latest release candidate:

```
deno -v
```

Your output should look like this:

```
deno 2.0.0-rc.10
```

</details>

<details>

<summary>Initializing a Fresh project</summary>

### Scaffold a new Fresh project

```
deno run -A -r https://fresh.deno.dev
```

Follow the prompts
- [ ] Name the project (ex: `my-fresh-blog`)
- [ ] Enter `y` for a styling library, then choose the option for `tailwindcss`
- [ ] Choose whether or not you want VS Code support

Once the project has been created, `cd` to the directory that was created.

#### Confirm you can run the starter project

If you've used [npm run scripts](https://docs.npmjs.com/cli/v10/using-npm/scripts) (the `scripts` property in `package.json`), then the `tasks` property in `deno.json` will feel familiar to you.

```
deno task start
```

This launches the blog, which listens on port `8000` , and watches source files for changes. Your output should look something like this:

```
Watcher File change detected! Restarting!
Warning `"nodeModulesDir": true` is deprecated in Deno 2.0. Use `"nodeModulesDir": "auto"` instead
    at file:///Users/tony/code/deno/fresh-blog/deno.json

 🍋 Fresh ready
    Local: http://localhost:8000/

Warning `"nodeModulesDir": true` is deprecated in Deno 2.0. Use `"nodeModulesDir": "auto"` instead
    at file:///Users/tony/code/deno/fresh-blog/deno.json
```

Great so far! This means the app is successfully running.

Go ahead and enter `CTRL-C` to stop the app.

Tailwind support relies on an npm module. This highlights the outstanding Node.js / npm ecosystem support that now ships with Deno. You can see the reference to the `tailwindcss` npm package under `imports` in `deno.json` and confirm that the package (and a few others) have been installed under the `node_modules` directory as well.

The deprecation warning alerts you to a recent change for Deno 2 that hasn't made its way yet to the Fresh init template. Go ahead and open `deno.json` in your editor and update the last line:

Change

```json
  "nodeModulesDir": true
```

To

```json
  "nodeModulesDir": "auto"
```

Try restarting the blog now:

```
Watcher File change detected! Restarting!

 🍋 Fresh ready
    Local: http://localhost:8000/

```

Check it out in your browser if you want, but we're going to delete all the boilerplate next and start from scratch.
#### Delete (almost) all of the boilerplate

We going to start from scratch by deleting everything we don't need. The only thing we're going to leave for convenience is the `static` directory (for using the basic Tailwind CSS integration to make styling easy) and the generic app and 404 components under `routes`. 

So why bother scaffolding in the first place if we're basically throwing out most of the initial code? The init prompts currently don't provide an option for starting off with a trim, vanilla project, but nevertheless, it's still convenient for starting out with functional code, even if we have to do some manual trimming. 

Enter the following command:

```
rm -rf components islands routes/api routes/greet
```

Replace the contents of `routes/index.tsx` with the following:

```tsx
export default function Home() {  
  return (  
    <></>  
  );  
}
```

You should now see a blank page at `http://localhost:8000`. Now you're ready to start actually implementing your blog!

</details>

<details>

<summary>Add components for rendering individual blog posts and the main blog index</summary>

## Create a couple of sample blog posts

Create a `posts` directory with two markdown files in it:

```
mkdir posts
touch posts/my-first-post.md posts/my-second-post.md
```

Use your editor to add the following post content:

`my-first-post.md`

```md
---  
title: This is my first blog post  
published_at: 2024-10-05T20:00:00.000Z  
blurb: This is a must-read blog post.
---  

# Hello, world!

This is cool.

```


`my-second-post.md`

```md
---  
title: This is my second blog post  
published_at: 2024-10-06T20:00:00.000Z  
blurb: A riveting, deeply insightful follow-up to my previous post.
---  
  
Foo bar baz!
```

## Display a post

For the first iteration, let's focus on just being able to render a single post. The filename without the extension is the *slug*, the final path component that identifies the content. We'll create a route handler that serves content using the slug, so the URL to view the content from `posts/my-first-post.md` on localhost for our example will look like this:

http://localhost:8000/my-first-post

To parameterize the route handler, create a file called `routes/[slug].tsx`. 

```
touch routes/[slug].tsx
```

### Load the post content

Our route handler will need a way to read and transform the markdown content into html. We'll delegate that functionality to a helper function that we put into a separate module:

```
mkdir lib
touch lib/posts.ts
```

For the first go at this, we'll simply return the raw markdown content without transforming it. Add the following code to `lib/posts.ts`:

```typescript
import { join } from "@std/path";  
  
const POSTS_DIR = "./posts";  
  
export interface Post {  
  slug: string;  
  content: string;  
}  

// Just return the raw markdown content for now
export async function getPost(slug: string): Promise<Post> {  
  const text = await Deno.readTextFile(join(POSTS_DIR, `${slug}.md`));  
  const post = {  
    slug,  
    content: text,  
  };  
  return post;  
}
```

We import `join` from `@std/path` in the standard library, so add that to your import map in `deno.json`:

```
deno add jsr:@std/path
```

#### Render the post

Now we can implement our slug handler. Add the following to `routes/[slug].tsx`:

```typescript
import { Handlers, PageProps } from "$fresh/server.ts";  
  
import { getPost, Post } from "../lib/posts.ts";  
  
export const handler: Handlers<Post> = {
  async GET(_req, ctx) {
    try {
      const post = await getPost(ctx.params.slug);
      return ctx.render(post);
    } catch (err) {
      console.error(err);
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
```

#### Test it

If it isn't already running from before, start the server again:

```
deno task start
```

Navigate to the following URL in your browser:

http://localhost:8000/my-first-post

You should be able to view the raw page content in your browser. The next steps are to be able to parse the front matter and render the content body markdown as HTML.

## Parse the front matter

The standard library supports [parsing front matter](https://jsr.io/@std/front-matter). Add the following to the `deno.json` import map:

```
deno add jsr:@std/front-matter
```

We're using YAML in the front matter for our posts, so we need to import [extractYaml](https://jsr.io/@std/front-matter#yaml) and make a few other changes to `lib/posts.ts`. The updated version should look like this:

```typescript
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
```


## Render the post markdown

To render to HTML, we'll need to add the [GitHub Flavored Markdown rendering package](https://jsr.io/@deno/gfm):

```
deno add jsr:@deno/gfm
```

Update `routes/[slug].tsx`:

```typescript
import { CSS, render } from "@deno/gfm";
import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";

import { getPost, Post } from "../lib/posts.ts";

export const handler: Handlers<Post> = {
  async GET(_req, ctx) {
    try {
      const post = await getPost(ctx.params.slug);
      return post.publishedAt ? ctx.render(post) : ctx.renderNotFound();
    } catch (err) {
      console.error(err);
      return ctx.renderNotFound();
    }
  },
};

export default function PostPage(props: PageProps<Post>) {
  const post = props.data;
  return (
    <>
      <Head>
        <style dangerouslySetInnerHTML={{__html: CSS}}/>
      </Head>
      <main>
        <h1>{post.title}</h1>
        <time>
          {post.publishedAt!.toLocaleDateString("en-us", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <div
          class="markdown-body"
          dangerouslySetInnerHTML={{__html: render(post.content)}}
        />
      </main>
    </>
  );
}

```

We're now injecting CSS into the page as well as rendering a title, the time of publication, and the content. Of course, the only styling we've added is specifically to support markdown elements, but nothing else looks pretty. Let's fix that with a bit of Tailwind. Here's final version of `routes/[slug].tsx`:

```ts
import { CSS, render } from "@deno/gfm";
import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";

import { getPost, Post } from "../lib/posts.ts";

export const handler: Handlers<Post> = {
  async GET(_req, ctx) {
    try {
      const post = await getPost(ctx.params.slug);
      return post.publishedAt ? ctx.render(post) : ctx.renderNotFound();
    } catch (err) {
      console.error(err);
      return ctx.renderNotFound();
    }
  },
};

export default function PostPage(props: PageProps<Post>) {
  const post = props.data;
  return (
    <>
      <Head>
        <style dangerouslySetInnerHTML={{__html: CSS}}/>
      </Head>
      <main class="max-w-screen-md px-4 pt-16 mx-auto">
        <h1 class="text-5xl font-bold">{post.title}</h1>
        <time class="text-gray-500">
          {post.publishedAt!.toLocaleDateString("en-us", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <div
          class="mt-8 markdown-body"
          dangerouslySetInnerHTML={{__html: render(post.content)}}
        />
      </main>
    </>
  );
}
```

Now take look. Looking a bit more like a proper blog post now!

## Render the blog index page

Now that we can render individual posts, let's wrap this up with the main page that renders a list of posts.

Add `getPosts()` to the bottom of `lib/posts.ts`. Here's the final version:

```ts
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
```

Here's the finished version of `routes/index.ts`:

```ts
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
```

Now navigate to the home page:

https://localhost:8000

Voila! It should look decent and you should be able to click through to the individual posts. Try removing the `publish_at` property in the front matter of one of the posts. The post should no longer be displayed in the list nor be accessible via its slug.

</details>

Congratulations if you made it this far. I hope you enjoy your Deno and Fresh exploration as much as I am.

Here's the GitHub repo for this example:
https://github.com/subfuzion/fresh-blog-with-deno2
