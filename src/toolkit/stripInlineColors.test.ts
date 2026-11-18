import { describe, expect, it } from "bun:test";
import { stripInlineTextColors } from "./stripInlineColors";

describe("stripInlineTextColors", () => {
  it("剥离内联文本颜色并保留其余声明", () => {
    expect(stripInlineTextColors('<div style="color: #2c3e50; font-size: 18px;">x</div>')).toBe(
      '<div style="font-size: 18px">x</div>',
    );
  });

  it("仅颜色声明时整个 style 属性移除", () => {
    expect(stripInlineTextColors('<span style="color:red">x</span>')).toBe("<span>x</span>");
  });

  it("不误伤 background-color", () => {
    expect(
      stripInlineTextColors('<mark style="background-color: yellow; color: #111">x</mark>'),
    ).toBe('<mark style="background-color: yellow">x</mark>');
  });

  it("支持单引号与大小写混写", () => {
    expect(stripInlineTextColors("<p style='COLOR: rgb(1,2,3); margin: 0'>x</p>")).toBe(
      '<p style="margin: 0">x</p>',
    );
  });

  it("无 style 的标记原样保留", () => {
    const html = '<p class="a">文本 <img src="x.png" alt=""></p>';
    expect(stripInlineTextColors(html)).toBe(html);
  });

  it("多个元素各自处理", () => {
    expect(
      stripInlineTextColors(
        '<i style="color:blue">a</i><b style="color:green;font-weight:700">b</b>',
      ),
    ).toBe('<i>a</i><b style="font-weight:700">b</b>');
  });
});
