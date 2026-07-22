import"./disclose-version.xihTtKlq.js";import{$ as e,A as t,B as n,E as ee,H as r,I as i,L as te,M as a,O as o,P as s,R as c,U as l,X as u,Y as ne,b as d,f,i as p,j as m,l as h,m as g,o as _,t as v,u as y,v as b,x as re}from"./client.Bq-f7rIf.js";var ie={family:`Maple Mono CN`,style:`normal`,weight:`400`,display:`optional`},x={src:`/_astro/arrow-down-s-line.C4R9Le1k.svg`,width:24,height:24,format:`svg`},S={src:`/_astro/arrow-up-s-line.iUkzHvps.svg`,width:24,height:24,format:`svg`},C={src:`/_astro/check-fill.Di9c9L1U.svg`,width:24,height:24,format:`svg`},w={src:`/_astro/file-copy-fill.DeSCJhyB.svg`,width:24,height:24,format:`svg`},T={src:`/_astro/fullscreen-line.BkUoy_24.svg`,width:24,height:24,format:`svg`},E={src:`/_astro/fullscreen-exit-line.DBtvXyzK.svg`,width:24,height:24,format:`svg`},D=t(`<span class="lang-text svelte-ipr7k2"> </span>`),O=t(`<button class="collapse-btn svelte-ipr7k2"></button>`),ae=t(`<div><div class="header svelte-ipr7k2"><div class="controls svelte-ipr7k2"><div class="dot red svelte-ipr7k2"></div> <div class="dot yellow svelte-ipr7k2"></div> <div class="dot green svelte-ipr7k2"></div> <!></div> <div class="actions svelte-ipr7k2"><button class="action-btn svelte-ipr7k2" aria-label="Copy code"></button> <button class="action-btn svelte-ipr7k2"></button></div></div> <div><div class="content-wrapper svelte-ipr7k2"><!></div> <!></div></div>`),oe={hash:`svelte-ipr7k2`,code:`\r
  /* 基础布局 */.codeblock.svelte-ipr7k2 {margin:1.5rem 0;border-radius:0.5rem;overflow:hidden;box-shadow:var(--codeblock-shadow);font-family:"Maple Mono", "Courier New", monospace;}.dark.codeblock.svelte-ipr7k2 {box-shadow:none;}\r
\r
  /* 处于 code-group 内时：去掉独立卡片样式，与 tabs 容器融为一体 */.codeblock.in-group.svelte-ipr7k2 {margin:0;border-radius:0;box-shadow:none;}\r
\r
  /* 多 tab code-group 内：保留红黄绿圆点，仅隐藏语言文字（由 tab 栏承担语言标识） */.codeblock.in-group.in-multi-tab.svelte-ipr7k2 .lang-text:where(.svelte-ipr7k2) {display:none;}\r
\r
  /* Header 样式 */.header.svelte-ipr7k2 {display:flex;justify-content:space-between;align-items:center;padding:0.5rem 1rem;background-color:var(--surface-code-header);min-height:1.5rem;border-top-right-radius:0.5rem;border-top-left-radius:0.5rem;}.controls.svelte-ipr7k2 {display:flex;align-items:center;gap:0.6rem;margin-left:0.8125rem;}.dot.svelte-ipr7k2 {width:0.9375rem;height:0.9375rem;border-radius:50%;}.red.svelte-ipr7k2 {background:var(--codeblock-dot-red);}.yellow.svelte-ipr7k2 {background:var(--codeblock-dot-yellow);}.green.svelte-ipr7k2 {background:var(--codeblock-dot-green);}.lang-text.svelte-ipr7k2 {margin-left:0.75rem;font-size:1rem;color:var(--text-color-muted);text-transform:uppercase;}.actions.svelte-ipr7k2 {display:flex;flex-direction:row;gap:0.75rem;padding-right:1.5rem;color:var(--text-color-muted);}.action-btn.svelte-ipr7k2 {border:none;cursor:pointer;background-color:var(--codeblock-action-color);width:1.1rem;height:1.1rem;mask-size:contain;mask-repeat:no-repeat;mask-position:center;-webkit-mask-size:contain;-webkit-mask-repeat:no-repeat;-webkit-mask-position:center;transition:background-color 0.2s;}.action-btn.svelte-ipr7k2:hover {background-color:var(--codeblock-action-hover-color);}\r
\r
  /* 内容容器 - 支持折叠 */.content-container.svelte-ipr7k2 {position:relative;transition:max-height 0.3s ease-in-out;}.content-container.collapsed.svelte-ipr7k2 {max-height:400px;overflow:hidden;}.content-container.collapsed.svelte-ipr7k2::after {content:"";position:absolute;bottom:0;left:0;right:0;height:100px;background:linear-gradient(\r
      to bottom,\r
      transparent,\r
      var(--codeblock-collapse-gradient-end)\r
    );pointer-events:none;}.collapse-btn.svelte-ipr7k2 {position:absolute;bottom:1rem;left:50%;transform:translateX(-50%);background-color:var(--codeblock-action-color);border:1px solid var(--border-color-muted);border-radius:50%;width:2rem;height:2rem;mask-size:1.75rem;mask-repeat:no-repeat;mask-position:center;-webkit-mask-size:1.25rem;-webkit-mask-repeat:no-repeat;-webkit-mask-position:center;cursor:pointer;transition:all 0.2s ease;box-shadow:var(--codeblock-button-shadow);z-index:var(--z-dropdown);\r
    animation: svelte-ipr7k2-float 2s ease-in-out infinite;scale:1.5;}.collapse-btn.svelte-ipr7k2:hover {background-color:var(--codeblock-action-hover-color);transform:translateX(-50%) scale(1.1);box-shadow:var(--codeblock-button-shadow-hover);}\r
\r
  /* 飘动动画 */\r
  @keyframes svelte-ipr7k2-float {\r
    0%,\r
    100% {\r
      transform: translateX(-50%) translateY(0);\r
    }\r
    50% {\r
      transform: translateX(-50%) translateY(-6px);\r
    }\r
  }.collapse-btn.svelte-ipr7k2:hover {animation-play-state:paused;}\r
\r
  /* 核心：处理插槽内的样式 */code-block pre * {font-family:"Maple Mono", "Courier New", Courier, monospace;font-size:0.925rem;line-height:1.25rem;line-break:anywhere;white-space:break-spaces;}code-block pre {padding:0.925rem;margin:0;border-bottom-right-radius:0.5rem;border-bottom-left-radius:0.5rem;background-color:var(--surface-code) !important;overflow-x:auto;}html[data-theme="dark"] code-block span {color:var(--shiki-dark) !important;}\r
\r
  /* 行号样式 */code-block .line {color:inherit;text-indent:-2.5rem;padding-left:2.5rem;display:block;min-height:1.25rem;contain-intrinsic-height:24px;transition:background-color 0.15s ease,\r
      opacity 0.15s ease,\r
      box-shadow 0.15s ease;}code-block .line:hover {background-color:var(--line-hover-bg);}code-block code {counter-reset:step;counter-increment:step 0;display:flex;flex-direction:column;}code-block code .line::before {content:counter(step);counter-increment:step;width:1rem;margin-right:1.5rem;display:inline-block;text-align:right;color:var(--text-color-muted);}\r
\r
  /* 行高亮（highlight + meta highlight 复用同一个 class） */code-block .line.highlighted {background-color:var(--cb-line-highlight-bg);box-shadow:inset 0.25rem 0 0 var(--cb-line-highlight-border);}\r
\r
  /* Diff（增删行） */code-block .line.diff.add {background-color:var(--cb-diff-add-bg);box-shadow:inset 0.25rem 0 0 var(--cb-diff-add-border);}code-block .line.diff.remove {background-color:var(--cb-diff-remove-bg);box-shadow:inset 0.25rem 0 0 var(--cb-diff-remove-border);}\r
\r
  /* 不占用额外 DOM 的情况下，用行号前缀标识 + / -（避免覆盖 .line::before 计数逻辑） */code-block code .line.diff.add::before {content:counter(step) " +";color:var(--cb-diff-add-border);}code-block code .line.diff.remove::before {content:counter(step) " -";color:var(--cb-diff-remove-border);}\r
\r
  /* Focus（聚焦显示）：当存在 focused 行时，其他行整体淡化 */code-block pre.has-focused .line {opacity:var(--cb-focus-dim-opacity);}code-block pre.has-focused .line.focused {opacity:1;background-color:var(--cb-focus-bg);box-shadow:inset 0.25rem 0 0 var(--cb-focus-border);}\r
\r
  /* Error / Warning（基于 transformerNotationErrorLevel） */code-block .line.highlighted.error {background-color:var(--cb-error-bg);box-shadow:inset 0.25rem 0 0 var(--cb-error-border);}code-block .line.highlighted.warning {background-color:var(--cb-warning-bg);box-shadow:inset 0.25rem 0 0 var(--cb-warning-border);}code-block .highlighted-word {background-color:var(--cb-highlighted-word-bg);border-radius:0.2rem;padding:0.05rem 0.15rem;}code-block .dark {box-shadow:none;}\r
\r
  /* 全屏样式 */.fullscreen.svelte-ipr7k2 {position:fixed;top:0;left:0;right:0;bottom:0;width:100vw;height:100vh;margin:0;z-index:var(--z-fullscreen);border-radius:0;\r
    animation: svelte-ipr7k2-fullscreenIn 0.3s ease-out;display:flex;flex-direction:column;background-color:var(--codeblock-overlay-bg);backdrop-filter:blur(8px);padding:2rem;box-sizing:border-box;}.fullscreen.svelte-ipr7k2 .header:where(.svelte-ipr7k2) {border-radius:0.5rem 0.5rem 0 0;}.fullscreen.svelte-ipr7k2 .content-container:where(.svelte-ipr7k2) {flex:1;overflow:auto;max-height:none !important;border-radius:0 0 0.5rem 0.5rem;}.fullscreen.svelte-ipr7k2 .content-container.collapsed:where(.svelte-ipr7k2) {max-height:none !important;}.fullscreen.svelte-ipr7k2 .content-container:where(.svelte-ipr7k2)::after {display:none;}.fullscreen.svelte-ipr7k2 pre {border-radius:0 0 0.5rem 0.5rem !important;}\r
\r
  @keyframes svelte-ipr7k2-fullscreenIn {\r
    from {\r
      opacity: 0;\r
      transform: scale(0.95);\r
    }\r
    to {\r
      opacity: 1;\r
      transform: scale(1);\r
    }\r
  }.exiting.svelte-ipr7k2 {\r
    animation: svelte-ipr7k2-fullscreenOut 0.3s ease-in forwards;}\r
\r
  @keyframes svelte-ipr7k2-fullscreenOut {\r
    from {\r
      opacity: 1;\r
      transform: scale(1);\r
    }\r
    to {\r
      opacity: 0;\r
      transform: scale(0.95);\r
    }\r
  }`};function k(t,m){u(m,!0),f(t,oe);let v=l(null),k=l(!1),A=l(``),j=l(!1),M=l(!1),N=l(!1),P=l(!1),F=l(!1),I=l(null),L=l(!1),R=l(!1);async function z(){let e=((s(v)?.querySelector(`slot`))?.assignedElements({flatten:!0})??[]).find(e=>e.tagName===`PRE`);if(!e)return;let t=e.textContent??``;try{await navigator.clipboard.writeText(t),r(k,!0),setTimeout(()=>{r(k,!1)},3e3)}catch(e){console.error(`Failed to copy:`,e)}}function B(){let e=((s(v)?.querySelector(`slot`))?.assignedElements({flatten:!0})??[]).find(e=>e.tagName===`PRE`);return e?e.dataset.language??``:``}function V(){let e=((s(v)?.querySelector(`slot`))?.assignedElements({flatten:!0})??[]).find(e=>e.tagName===`PRE`);if(!e)return;let t=e.querySelector(`code`);t&&t.querySelectorAll(`.line`).length>15&&(r(N,!0),r(M,!0))}function H(){r(M,!s(M))}function U(){s(P)?(r(F,!0),setTimeout(()=>{r(P,!1),r(F,!1),typeof document<`u`&&(document.body.style.overflow=``)},300)):(r(P,!0),typeof document<`u`&&(document.body.style.overflow=`hidden`))}function W(e){e.key===`Escape`&&s(P)&&U()}re(async()=>{r(A,B(),!0);let e=s(I)?.getRootNode(),t=(e instanceof ShadowRoot?e.host:s(I)??null)?.closest(`.tabs.code-group`);if(t){r(L,!0);let e=t.querySelectorAll(`:scope > .tabs-panels > .tab-item`).length;r(R,e>1)}setTimeout(()=>{V()},100),typeof window<`u`&&window.addEventListener(`keydown`,W)}),d(()=>{typeof window<`u`&&window.removeEventListener(`keydown`,W),typeof document<`u`&&(document.body.style.overflow=``)});let G=()=>{let e=document.documentElement.dataset.theme;r(j,e===`dark`)};te(()=>{G();let e=new MutationObserver(G);return e.observe(document.documentElement,{attributes:!0,attributeFilter:[`data-theme`]}),()=>e.disconnect()});var K=ae(),q=c(K),J=c(q),se=n(c(J),6),ce=t=>{var n=D(),r=c(n,!0);e(n),i(()=>ee(r,s(A))),o(t,n)};b(se,e=>{s(A)&&e(ce)}),e(J);var Y=n(J,2),X=c(Y),Z=n(X,2);e(Y),e(q);var Q=n(q,2),$=c(Q);g(c($),m,`default`,{},null),e($),p($,e=>r(v,e),()=>s(v));var le=n($,2),ue=e=>{var t=O();i(()=>{h(t,`mask-image: url(${(s(M)?x.src:S.src)??``}); -webkit-mask-image: url(${(s(M)?x.src:S.src)??``});`),_(t,`aria-label`,s(M)?`Expand code`:`Collapse code`)}),a(`click`,t,H),o(e,t)};b(le,e=>{s(N)&&!s(P)&&e(ue)}),e(Q),e(K),p(K,e=>r(I,e),()=>s(I)),i(()=>{y(K,1,`codeblock ${s(j)?`dark`:``} ${s(P)?`fullscreen`:``} ${s(F)?`exiting`:``} ${s(L)?`in-group`:``} ${s(R)?`in-multi-tab`:``}`,`svelte-ipr7k2`),h(X,`mask-image: url(${(s(k)?C.src:w.src)??``}); -webkit-mask-image: url(${(s(k)?C.src:w.src)??``});`),h(Z,`mask-image: url(${(s(P)?E.src:T.src)??``}); -webkit-mask-image: url(${(s(P)?E.src:T.src)??``});`),_(Z,`aria-label`,s(P)?`Exit fullscreen`:`Enter fullscreen`),y(Q,1,`content-container ${s(M)?`collapsed`:``}`,`svelte-ipr7k2`),h($,`font-family: ${ie.family??``};`)}),a(`click`,X,z),a(`click`,Z,U),o(t,K),ne()}m([`click`]),customElements.define(`code-block`,v(k,{},[`default`],[],{mode:`open`}));export{k as default};