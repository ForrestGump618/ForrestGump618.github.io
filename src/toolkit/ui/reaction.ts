/** 反应速度小游戏的纯逻辑：随机等待时长、成绩评级与格式化。 */
export interface ReactionGrade {
  label: string;
  comment: string;
}

export const reactionDelayMs = (rand: () => number, min = 1200, max = 3200): number =>
  Math.round(min + rand() * (max - min));

export const gradeReaction = (ms: number): ReactionGrade => {
  if (ms < 200) {
    return { label: "闪电", comment: "比突触传递还快。" };
  }

  if (ms < 260) {
    return { label: "敏锐", comment: "一条稳定的反射弧。" };
  }

  if (ms < 330) {
    return { label: "稳健", comment: "正常人类水平，继续保持。" };
  }

  return { label: "慢热", comment: "喝口咖啡再来一次。" };
};

export const formatReactionMs = (ms: number): string => `${Math.round(ms)} ms`;
