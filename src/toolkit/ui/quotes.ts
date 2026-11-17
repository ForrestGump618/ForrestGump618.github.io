/** 首页个人卡片里的一句话：科研与创造者的格言，可手动换一句。 */
export interface Quote {
  text: string;
  source: string;
}

export const QUOTES: Quote[] = [
  { text: "所有模型都是错的，但有些是有用的。", source: "George Box" },
  { text: "科学中最激动人心的话不是「我发现了」，而是「这有点奇怪……」。", source: "Isaac Asimov" },
  { text: "我不能创造的，我就不理解。", source: "Richard Feynman" },
  { text: "计算的目的在于洞察，而非数字。", source: "Richard Hamming" },
  { text: "科学更是一种思维方式，而不只是一堆知识。", source: "Carl Sagan" },
  { text: "预测未来的最好方式，是去发明它。", source: "Alan Kay" },
  { text: "简单，是终极的复杂。", source: "Leonardo da Vinci" },
  { text: "保持饥饿，保持愚蠢。", source: "Stewart Brand" },
];

/** 保证换一句不会停留在当前这条。 */
export const pickNextQuoteIndex = (current: number, rand: () => number): number => {
  if (QUOTES.length < 2) {
    return 0;
  }

  const offset = 1 + Math.floor(rand() * (QUOTES.length - 1));
  return (current + offset) % QUOTES.length;
};
