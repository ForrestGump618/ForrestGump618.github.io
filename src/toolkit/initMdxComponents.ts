const QUIZ_DATA_BOUND_KEY = "quizBound";
const TABS_DATA_BOUND_KEY = "tabsBound";

type QuizType = "true" | "false" | "single" | "multi" | "fill";
type QuizItem = HTMLElement;
type TabsRoot = HTMLElement;
type TabItem = HTMLElement;

let mdxInitBound = false;

const isValidQuizType = (v: string): v is QuizType =>
  ["true", "false", "single", "multi", "fill"].includes(v);

const getQuizTypeLabel = (quizType: QuizType) => {
  switch (quizType) {
    case "true":
    case "false":
      return "判断题";
    case "multi":
      return "多选题";
    case "fill":
      return "填空题";
    case "single":
    default:
      return "单选题";
  }
};

const revealAnswer = (quizItem: QuizItem) => {
  quizItem.classList.add("show");
};

const markSingleOrMulti = (quizItem: QuizItem) => {
  const options = quizItem.querySelectorAll<HTMLElement>(":scope .quiz-options > .quiz-option");
  options.forEach((option) => {
    const isCorrect = option.dataset.correct === "true";
    let optionIcon = option.querySelector<HTMLSpanElement>(":scope > .quiz-result-icon");

    if (!optionIcon) {
      optionIcon = document.createElement("span");
      optionIcon.className = "quiz-result-icon";
      optionIcon.setAttribute("aria-hidden", "true");
      option.append(optionIcon);
    }

    optionIcon.classList.remove("i-ri-check-fill", "i-ri-close-fill");
    optionIcon.classList.add(isCorrect ? "i-ri-check-fill" : "i-ri-close-fill");
    option.classList.remove("right", "wrong");
    option.classList.add(isCorrect ? "right" : "wrong");
  });

  revealAnswer(quizItem);
};

const bindQuizItem = (quizItem: QuizItem) => {
  if (quizItem.dataset[QUIZ_DATA_BOUND_KEY] === "true") {
    return;
  }

  const rawType = quizItem.dataset.quizType || "single";
  const quizType: QuizType = isValidQuizType(rawType) ? rawType : "single";
  const question = quizItem.querySelector<HTMLElement>(":scope > .quiz-question");
  const firstQuestionParagraph =
    question?.querySelector<HTMLParagraphElement>(":scope > p:first-child");

  if (firstQuestionParagraph) {
    firstQuestionParagraph.dataset.type = getQuizTypeLabel(quizType);
  }

  if (quizType === "true" || quizType === "false" || quizType === "fill") {
    if (quizType === "true" || quizType === "false") {
      let stateIcon = quizItem.querySelector(":scope > .quiz-state-icon");
      if (!stateIcon) {
        stateIcon = document.createElement("span");
        stateIcon.className = `quiz-state-icon ${
          quizType === "true" ? "i-ri-check-fill" : "i-ri-close-fill"
        }`;
        stateIcon.setAttribute("aria-hidden", "true");
        quizItem.append(stateIcon);
      }
    }

    if (quizType === "fill") {
      quizItem.addEventListener("click", () => {
        const willShow = !quizItem.classList.contains("show");
        quizItem.classList.toggle("show", willShow);

        if (willShow) {
          const gaps = quizItem.querySelectorAll<HTMLElement>(":scope .quiz-gap");
          gaps.forEach((gap) => {
            gap.textContent = gap.dataset.answer || "";
          });
        }
      });
    }

    if (quizType !== "fill") {
      firstQuestionParagraph?.addEventListener("click", () => {
        const willShow = !quizItem.classList.contains("show");
        quizItem.classList.toggle("show", willShow);
      });
    }
  }

  if (quizType === "single") {
    const hasAnswer = Boolean(quizItem.querySelector(":scope .quiz-answer"));
    let actionButton: HTMLButtonElement | null = hasAnswer
      ? quizItem.querySelector<HTMLButtonElement>(":scope > .quiz-check-btn")
      : null;

    if (hasAnswer && !actionButton) {
      actionButton = document.createElement("button");
      actionButton.type = "button";
      actionButton.className = "quiz-check-btn";
      actionButton.textContent = "隐藏答案";
      actionButton.hidden = true;
      quizItem.append(actionButton);
    }

    const options = quizItem.querySelectorAll<HTMLElement>(":scope .quiz-options > .quiz-option");
    options.forEach((option) => {
      option.addEventListener("click", () => {
        markSingleOrMulti(quizItem);
        if (actionButton) {
          actionButton.hidden = false;
          actionButton.textContent = "隐藏答案";
        }
      });
    });

    actionButton?.addEventListener("click", () => {
      const willShow = !quizItem.classList.contains("show");
      quizItem.classList.toggle("show", willShow);
      actionButton.textContent = willShow ? "隐藏答案" : "显示答案";
    });
  }

  if (quizType === "multi") {
    const options = quizItem.querySelectorAll<HTMLElement>(":scope .quiz-options > .quiz-option");
    options.forEach((option) => {
      option.addEventListener("click", () => {
        option.classList.toggle("selected");
      });
    });

    let actionButton = quizItem.querySelector<HTMLButtonElement>(":scope > .quiz-check-btn");

    if (!actionButton) {
      actionButton = document.createElement("button");
      actionButton.type = "button";
      actionButton.className = "quiz-check-btn";
      actionButton.textContent = "查看答案";
      quizItem.append(actionButton);
    }

    actionButton.addEventListener("click", () => {
      const shouldHide = quizItem.classList.contains("show");
      if (shouldHide) {
        quizItem.classList.remove("show");
        actionButton.textContent = "查看答案";
        return;
      }

      markSingleOrMulti(quizItem);
      actionButton.textContent = "隐藏答案";
    });
  }

  quizItem.dataset[QUIZ_DATA_BOUND_KEY] = "true";
};

const initQuiz = () => {
  const quizItems = document.querySelectorAll<QuizItem>(".md .quiz-item");
  quizItems.forEach(bindQuizItem);
};

const initTabs = (root: TabsRoot) => {
  if (root.dataset[TABS_DATA_BOUND_KEY] === "true") {
    return;
  }

  const navList = root.querySelector<HTMLUListElement>(":scope > .nav > ul");
  const nav = root.querySelector<HTMLElement>(":scope > .nav");
  const tabItems = Array.from(root.querySelectorAll<TabItem>(":scope > .tabs-panels > .tab-item"));

  if (!navList || tabItems.length === 0) {
    return;
  }

  const defaultValue = (root.dataset.defaultValue || "").trim();
  let activeIndex = 0;

  if (defaultValue.length > 0) {
    const matchedIndex = tabItems.findIndex((item) => {
      return (item.dataset.tabValue || "").trim() === defaultValue;
    });
    if (matchedIndex >= 0) {
      activeIndex = matchedIndex;
    }
  }

  const tabButtons: HTMLButtonElement[] = [];

  const activate = (index: number) => {
    tabItems.forEach((item, i) => {
      const isActive = i === index;
      item.classList.toggle("active", isActive);
      item.toggleAttribute("hidden", !isActive);
    });

    tabButtons.forEach((button, i) => {
      const isActive = i === index;
      button.parentElement?.classList.toggle("active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
      button.setAttribute("tabindex", isActive ? "0" : "-1");
    });
  };

  tabItems.forEach((item, index) => {
    const tabLabel = (item.dataset.tabLabel || "").trim() || `Tab ${index + 1}`;
    const tabValue = (item.dataset.tabValue || "").trim() || `tab-${index + 1}`;
    const panelId = `${tabValue}-panel-${index}`;
    const buttonId = `${tabValue}-tab-${index}`;

    item.id = panelId;
    item.setAttribute("role", "tabpanel");
    item.setAttribute("aria-labelledby", buttonId);

    const li = document.createElement("li");
    li.className = "tab-nav-item";
    li.setAttribute("role", "presentation");

    const button = document.createElement("button");
    button.type = "button";
    button.id = buttonId;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", panelId);
    button.textContent = tabLabel;
    button.addEventListener("click", () => {
      activate(index);
    });

    li.append(button);
    navList.append(li);
    tabButtons.push(button);
  });

  if (tabItems.length <= 1) {
    nav?.setAttribute("hidden", "true");
  }

  activate(activeIndex);
  root.dataset[TABS_DATA_BOUND_KEY] = "true";
};

const initAllTabs = () => {
  const tabsRoots = document.querySelectorAll<TabsRoot>(".md .tabs");
  tabsRoots.forEach((root) => {
    initTabs(root);
  });
};

const initMdxComponents = () => {
  initQuiz();
  initAllTabs();
};

const setupMdxComponents = () => {
  if (mdxInitBound) {
    return;
  }

  const onReady = () => {
    initMdxComponents();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady, { once: true });
  } else {
    onReady();
  }

  document.addEventListener("astro:page-load", onReady);
  mdxInitBound = true;
};

setupMdxComponents();
