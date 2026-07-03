import { defineMdastPlugin, type MdastPluginDefinition } from "satteri";

/**
 * katex（satteri 版）：
 * 将 math/inlineMath 节点通过 KaTeX 渲染为 HTML，返回 { rawHtml }
 *
 * 等价于 remark 管线中的 remark-math + rehype-katex 组合
 * 需要 features.math: true 在 satteri 配置中开启解析
 */
export interface KatexOptions {
  /** KaTeX 渲染出错时是否抛出异常（默认 false，渲染为错误提示） */
  throwOnError?: boolean;
}

interface RenderResult {
  rawHtml: string;
}

export default function katex(options: KatexOptions = {}): MdastPluginDefinition {
  const throwOnError = options.throwOnError ?? false;

  async function render(value: string, displayMode: boolean): Promise<RenderResult> {
    const katexLib = (await import("katex")).default;
    try {
      return { rawHtml: katexLib.renderToString(value, { displayMode, throwOnError }) };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return { rawHtml: `<span class="katex-error">${message}</span>` };
    }
  }

  return defineMdastPlugin({
    name: "katex",
    async math(node) {
      return render(node.value, true);
    },
    async inlineMath(node) {
      return render(node.value, false);
    },
  });
}
