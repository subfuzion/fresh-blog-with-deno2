FROM denoland/deno:alpine-2.0.0
#FROM denoland/deno:distroless-2.0.0
#FROM denoland/deno:debian-2.0.0

ENV DENO_DIR=./.deno_cache

WORKDIR /app

# deno.json changes less frequently than the rest of the app
# so optimize by caching this layer
COPY deno.json deno.json
RUN ["/bin/deno", "install"]

# copy everything else
COPY . .
RUN ["/bin/deno", "install", "--entrypoint", "main.ts"]
RUN ["/bin/deno", "task", "build"]

EXPOSE 8080
ENTRYPOINT ["/tini", "--", "/bin/deno", "serve", "--cached-only", "--allow-net", "--allow-env", "--allow-read"]
CMD ["main.ts"]
