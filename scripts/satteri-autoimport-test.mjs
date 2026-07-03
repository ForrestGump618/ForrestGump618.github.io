/**
 * 验证 satteri auto-import 插件：mdxjsEsm 节点注入是否被 mdxToJs 正确编译
 */
import { mdxToJs } from "satteri";
import { parse as parseJs } from "acorn";

const importsNode = {
  type: "mdxjsEsm",
  value: "",
  data: {
    estree: {
      body: [],
      ...parseJs('import Spoiler from "@/components/mdx/Spoiler.astro";', {
        ecmaVersion: "latest",
        sourceType: "module",
      }),
      type: "Program",
      sourceType: "module",
    },
  },
};

// 模拟 auto-import 插件
const autoImportPlugin = () => {
  let injected = false;
  return {
    name: "auto-import-test",
    paragraph(node, ctx) {
      if (injected) return;
      injected = true;
      const parent = ctx.parent(node);
      if (parent) {
        ctx.insertChildAt(parent, 0, importsNode);
        console.log("[test] injected mdxjsEsm at index 0 of root");
      }
    },
  };
};

console.log("=== 测试：mdxjsEsm 注入 ===\n");
try {
  const result = mdxToJs("这是一段文字，!!隐藏!!。", {
    mdastPlugins: [autoImportPlugin],
  });
  console.log("✅ mdxToJs 成功");
  console.log("输出代码（前 600 字符）:");
  console.log(result.code.slice(0, 600));
  console.log("\n...是否包含 import:", result.code.includes("import"));
  console.log("...是否包含 Spoiler:", result.code.includes("Spoiler"));
} catch (e) {
  console.log("❌ 失败:", e.message);
  console.log(e.stack);
}

console.log("\n=== 对照：不注入 mdxjsEsm ===\n");
try {
  const result = mdxToJs("这是一段文字。", {});
  console.log("✅ 基线成功");
  console.log("输出代码（前 400 字符）:");
  console.log(result.code.slice(0, 400));
} catch (e) {
  console.log("❌ 失败:", e.message);
}
