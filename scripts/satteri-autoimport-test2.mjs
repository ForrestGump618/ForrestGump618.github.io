/**
 * 验证 satteri auto-import：用 { raw: string } 方式注入 import 语句
 */
import { mdxToJs } from "satteri";

const importStatement = 'import Spoiler from "@/components/mdx/Spoiler.astro";';

// 方案 A：用 { raw } 注入
const autoImportRawPlugin = () => {
  let injected = false;
  return {
    name: "auto-import-raw",
    paragraph(node, ctx) {
      if (injected) return;
      injected = true;
      const parent = ctx.parent(node);
      if (parent) {
        ctx.insertChildAt(parent, 0, { raw: importStatement });
        console.log("[test A] injected { raw } at index 0");
      }
    },
  };
};

console.log("=== 方案 A: { raw: string } 注入 ===\n");
try {
  const result = mdxToJs("这是一段文字。", {
    mdastPlugins: [autoImportRawPlugin],
  });
  console.log("✅ 成功");
  console.log("输出代码（前 600 字符）:");
  console.log(result.code.slice(0, 600));
  console.log("\n...包含 import Spoiler:", result.code.includes("import Spoiler"));
} catch (e) {
  console.log("❌ 失败:", e.message);
}

// 方案 B：用 insertBefore + mdxjsEsm 节点（但带 value 字段）
const autoImportEsmPlugin = () => {
  let injected = false;
  return {
    name: "auto-import-esm",
    paragraph(node, ctx) {
      if (injected) return;
      injected = true;
      ctx.insertBefore(node, {
        type: "mdxjsEsm",
        value: importStatement,
      });
      console.log("[test B] injected mdxjsEsm with value");
    },
  };
};

console.log("\n=== 方案 B: mdxjsEsm 节点带 value ===\n");
try {
  const result = mdxToJs("这是一段文字。", {
    mdastPlugins: [autoImportEsmPlugin],
  });
  console.log("✅ 成功");
  console.log("输出代码（前 600 字符）:");
  console.log(result.code.slice(0, 600));
  console.log("\n...包含 import Spoiler:", result.code.includes("import Spoiler"));
} catch (e) {
  console.log("❌ 失败:", e.message);
}

// 方案 C：直接在源码前缀加 import（对照组）
console.log("\n=== 方案 C: 源码前缀（对照组）===\n");
try {
  const result = mdxToJs(`${importStatement}\n\n这是一段文字。`, {});
  console.log("✅ 成功");
  console.log("输出代码（前 600 字符）:");
  console.log(result.code.slice(0, 600));
  console.log("\n...包含 import Spoiler:", result.code.includes("import Spoiler"));
} catch (e) {
  console.log("❌ 失败:", e.message);
}
