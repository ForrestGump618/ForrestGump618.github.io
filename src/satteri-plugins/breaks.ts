import { defineMdastPlugin, type MdastPluginDefinition, type MdastContent } from "satteri";

/**
 * breaks（satteri 版）：
 * 将段落内的软换行（\n）转换为硬换行（<br>），等价于 remark-breaks
 *
 * 策略：订阅 text visitor，将含 \n 的文本节点拆分为 text + break + text + ...
 */
export default function breaks(): MdastPluginDefinition {
  return defineMdastPlugin({
    name: "breaks",
    text(node, ctx) {
      const value = node.value;
      if (typeof value !== "string" || !value.includes("\n")) return;

      const parts: MdastContent[] = [];
      const lines = value.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].length > 0) {
          parts.push({ type: "text", value: lines[i] });
        }
        // 在每行之间插入 break（最后一行之后不插）
        if (i < lines.length - 1) {
          parts.push({ type: "break" });
        }
      }

      if (parts.length <= 1) return;
      ctx.insertBefore(node, parts);
      ctx.removeNode(node);
    },
  });
}
