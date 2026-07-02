import { getContainerRenderer as getMdxContainerRenderer } from "@astrojs/mdx/container-renderer";
import { getContainerRenderer as getSvelteContainerRenderer } from "@astrojs/svelte/container-renderer";
import { experimental_AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";

const postContentRenderersPromise = loadRenderers([
  getMdxContainerRenderer(),
  getSvelteContainerRenderer(),
]);

export async function createPostContentContainer() {
  const renderers = await postContentRenderersPromise;

  return experimental_AstroContainer.create({ renderers });
}
