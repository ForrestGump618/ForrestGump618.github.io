import { getContainerRenderer as getMdxContainerRenderer } from "@astrojs/mdx";
import { getContainerRenderer as getSvelteContainerRenderer } from "@astrojs/svelte";
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
