import"./disclose-version.xihTtKlq.js";import{$ as e,A as t,B as n,E as r,G as i,H as a,I as o,L as s,M as c,N as ee,O as l,P as u,R as d,U as f,V as te,X as ne,Y as re,b as ie,f as p,i as m,j as h,m as ae,o as g,t as _,u as oe,v,x as se,z as ce}from"./client.Bq-f7rIf.js";import{n as le,t as ue}from"./i18n.Be8FzsRj.js";import{t as y}from"./scrollLock.CphHndS9.js";var b=t(`<button type="button" class="image-zoom-nav image-zoom-nav-prev svelte-1yby8l6">‹</button>`),x=t(`<img class="image-zoom-content svelte-1yby8l6" loading="eager" decoding="async"/>`),S=t(`<p class="image-zoom-caption svelte-1yby8l6"> </p>`),C=t(`<button type="button" class="image-zoom-nav image-zoom-nav-next svelte-1yby8l6">›</button>`),de=t(`<div class="image-zoom-wrapper svelte-1yby8l6"><!></div> <dialog><!> <button type="button" class="image-zoom-close svelte-1yby8l6">×</button> <!> <!> <!></dialog>`,1),fe={hash:`svelte-1yby8l6`,code:`image-zoom {display:block;margin:1.2rem auto;width:fit-content;max-width:100%;}.image-zoom-wrapper.svelte-1yby8l6 {display:block;max-width:100%;}image-zoom .image-zoom-trigger {cursor:zoom-in;transform-origin:center;transition:filter 0.2s ease,
      transform 0.2s ease;}image-zoom .image-zoom-trigger:hover {filter:brightness(0.96);transform:translateY(-1px) scale(1.01);}.image-zoom-overlay.svelte-1yby8l6 {position:fixed;inset:0;z-index:var(--z-fullscreen);display:grid;place-items:center;gap:0;width:100%;max-width:none;height:100%;max-height:none;border:0;margin:0;padding:2rem 1rem;box-sizing:border-box;background:var(--codeblock-overlay-bg, rgba(8, 10, 16, 0.72));backdrop-filter:blur(0.35rem);
    animation: svelte-1yby8l6-image-zoom-fade-in 220ms ease forwards;}.image-zoom-overlay.hidden.svelte-1yby8l6 {display:none;}.image-zoom-overlay.svelte-1yby8l6::backdrop {background:var(--codeblock-overlay-bg, rgba(8, 10, 16, 0.72));backdrop-filter:blur(0.35rem);}.image-zoom-overlay.closing.svelte-1yby8l6 {
    animation: svelte-1yby8l6-image-zoom-fade-out 220ms ease forwards;}.image-zoom-content.svelte-1yby8l6 {margin:0;max-width:min(92vw, 1100px);max-height:86vh;object-fit:contain;border-radius:0.5rem;box-shadow:0 0.75rem 2rem var(--grey-9-a15);cursor:zoom-out;
    animation: svelte-1yby8l6-image-zoom-scale-in 220ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;}.image-zoom-overlay.closing.svelte-1yby8l6 .image-zoom-content:where(.svelte-1yby8l6) {
    animation: svelte-1yby8l6-image-zoom-scale-out 220ms cubic-bezier(0.4, 0, 0.2, 1) forwards;}.image-zoom-close.svelte-1yby8l6 {position:absolute;top:1rem;right:1rem;width:2.4rem;height:2.4rem;border:0;border-radius:50%;background:rgba(17, 25, 40, 0.58);color:#fff;font-size:1.5rem;line-height:1;cursor:pointer;transition:background-color 0.2s ease,
      transform 0.2s ease;
    animation: svelte-1yby8l6-image-zoom-ui-in 220ms ease forwards;}.image-zoom-overlay.closing.svelte-1yby8l6 .image-zoom-close:where(.svelte-1yby8l6) {
    animation: svelte-1yby8l6-image-zoom-ui-out 220ms ease forwards;}.image-zoom-close.svelte-1yby8l6:hover {background:rgba(17, 25, 40, 0.8);transform:scale(1.06);}.image-zoom-nav.svelte-1yby8l6 {position:absolute;top:50%;width:2.75rem;height:2.75rem;border:0;border-radius:999px;background:rgba(17, 25, 40, 0.58);color:#fff;font-size:2rem;line-height:1;cursor:pointer;transform:translateY(-50%);transition:background-color 0.2s ease,
      transform 0.2s ease;
    animation: svelte-1yby8l6-image-zoom-ui-in 220ms ease forwards;}.image-zoom-nav.svelte-1yby8l6:hover {background:rgba(17, 25, 40, 0.8);transform:translateY(-50%) scale(1.06);}.image-zoom-nav-prev.svelte-1yby8l6 {left:max(1rem, calc(50vw - min(46vw, 550px) - 3.75rem));}.image-zoom-nav-next.svelte-1yby8l6 {right:max(1rem, calc(50vw - min(46vw, 550px) - 3.75rem));}.image-zoom-caption.svelte-1yby8l6 {margin:0.8rem 0 0;font-size:0.9rem;color:var(--grey-1);text-align:center;max-width:min(92vw, 1100px);line-height:1.5;
    animation: svelte-1yby8l6-image-zoom-ui-in 220ms ease forwards;}.image-zoom-overlay.closing.svelte-1yby8l6 .image-zoom-caption:where(.svelte-1yby8l6) {
    animation: svelte-1yby8l6-image-zoom-ui-out 220ms ease forwards;}.image-zoom-overlay.closing.svelte-1yby8l6 .image-zoom-nav:where(.svelte-1yby8l6) {
    animation: svelte-1yby8l6-image-zoom-ui-out 220ms ease forwards;}

  @keyframes svelte-1yby8l6-image-zoom-fade-in {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes svelte-1yby8l6-image-zoom-fade-out {
    from {
      opacity: 1;
    }

    to {
      opacity: 0;
    }
  }

  @keyframes svelte-1yby8l6-image-zoom-scale-in {
    from {
      opacity: 0;
      transform: scale(0.94) translateY(10px);
    }

    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes svelte-1yby8l6-image-zoom-scale-out {
    from {
      opacity: 1;
      transform: scale(1) translateY(0);
    }

    to {
      opacity: 0;
      transform: scale(0.94) translateY(10px);
    }
  }

  @keyframes svelte-1yby8l6-image-zoom-ui-in {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes svelte-1yby8l6-image-zoom-ui-out {
    from {
      opacity: 1;
      transform: translateY(0);
    }

    to {
      opacity: 0;
      transform: translateY(-6px);
    }
  }

  @media (prefers-reduced-motion: reduce) {image-zoom .image-zoom-trigger,
    .image-zoom-close.svelte-1yby8l6,
    .image-zoom-nav.svelte-1yby8l6 {transition:none;}.image-zoom-overlay.svelte-1yby8l6,
    .image-zoom-overlay.closing.svelte-1yby8l6,
    .image-zoom-content.svelte-1yby8l6,
    .image-zoom-overlay.closing.svelte-1yby8l6 .image-zoom-content:where(.svelte-1yby8l6),
    .image-zoom-caption.svelte-1yby8l6,
    .image-zoom-overlay.closing.svelte-1yby8l6 .image-zoom-caption:where(.svelte-1yby8l6),
    .image-zoom-nav.svelte-1yby8l6,
    .image-zoom-overlay.closing.svelte-1yby8l6 .image-zoom-nav:where(.svelte-1yby8l6),
    .image-zoom-overlay.closing.svelte-1yby8l6 .image-zoom-close:where(.svelte-1yby8l6) {
      animation: none;}
  }`};function w(t,h){ne(h,!0),p(t,fe);let _=f(null),w=f(null),T=f(!1),E=f(``),D=f(``),O=f(te([])),k=f(0),A=null,j=null,M=null,N=f(!1),P=le(ue),F=null,I=()=>{F?.(),F=null},L=()=>{a(T,!1),a(N,!1),a(E,``),a(D,``),a(O,[],!0),a(k,0),M&&=(clearTimeout(M),null),I()},R=()=>{if(!u(T)||u(N))return;let e=typeof window<`u`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches?0:220;if(e===0){L();return}a(N,!0),M&&clearTimeout(M),M=setTimeout(()=>{L()},e)},z=()=>{let e=u(O)[u(k)];e&&(a(E,e.src,!0),a(D,e.alt,!0))},B=e=>{let t=e.closest(`[data-image-zoom-gallery]`);return(t?Array.from(t.querySelectorAll(`image-zoom img`)):[e]).map(e=>({element:e,src:e.currentSrc||e.src,alt:e.alt||``})).filter(e=>!!e.src)},V=(e,t)=>{t?.preventDefault(),t?.stopPropagation();let n=B(e);n.length!==0&&(M&&=(clearTimeout(M),null),a(N,!1),a(O,n.map(({src:e,alt:t})=>({src:e,alt:t})),!0),a(k,Math.max(0,n.findIndex(t=>t.element===e)),!0),z(),a(T,!0),typeof document<`u`&&typeof window<`u`&&!F&&(F=y(document,{innerWidth:window.innerWidth,getComputedPaddingInlineEnd:()=>window.getComputedStyle(document.body).paddingInlineEnd})))},H=()=>u(O).length>1,U=e=>{e?.preventDefault(),e?.stopPropagation(),H()&&(a(k,(u(k)-1+u(O).length)%u(O).length),z())},W=e=>{e?.preventDefault(),e?.stopPropagation(),H()&&(a(k,(u(k)+1)%u(O).length),z())};s(()=>{if(!(!u(w)||typeof u(w).showModal!=`function`)){if(u(T)&&!u(w).open){u(w).showModal();return}!u(T)&&u(w).open&&u(w).close()}});let G=()=>{A?.(),A=null;let e=((u(_)?.querySelector(`slot`))?.assignedElements({flatten:!0})??[]).find(e=>e.tagName===`IMG`);if(!e)return;e.classList.add(`image-zoom-trigger`);let t=e.hasAttribute(`role`),n=e.hasAttribute(`tabindex`);t||e.setAttribute(`role`,`button`),n||e.setAttribute(`tabindex`,`0`);let r=t=>{V(e,t)},i=t=>{(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),V(e,t))};e.addEventListener(`click`,r),e.addEventListener(`keydown`,i),A=()=>{e.removeEventListener(`click`,r),e.removeEventListener(`keydown`,i),e.classList.remove(`image-zoom-trigger`),t||e.removeAttribute(`role`),n||e.removeAttribute(`tabindex`)}},pe=e=>{let t=e.target;t?.closest(`.image-zoom-content`)||t?.closest(`.image-zoom-close`)||t?.closest(`.image-zoom-nav`)||R()},K=e=>{if(u(T)){if(e.key===`Escape`){R();return}if(e.key===`ArrowLeft`){U(e);return}e.key===`ArrowRight`&&W(e)}};se(()=>{G();let e=u(_)?.querySelector(`slot`);if(e){let t=()=>{G()};e.addEventListener(`slotchange`,t),j=()=>{e.removeEventListener(`slotchange`,t)}}typeof window<`u`&&window.addEventListener(`keydown`,K)}),ie(()=>{j?.(),A?.(),M&&=(clearTimeout(M),null),typeof window<`u`&&window.removeEventListener(`keydown`,K),I()});var q=de(),J=ce(q);ae(d(J),h,`default`,{},null),e(J),m(J,e=>a(_,e),()=>u(_));var Y=n(J,2),X=d(Y),me=e=>{var t=b();o(e=>g(t,`aria-label`,e),[()=>P(`imageZoom.previous`)]),c(`click`,t,U),l(e,t)},he=i(()=>H());v(X,e=>{u(he)&&e(me)});var Z=n(X,2),Q=n(Z,2),ge=e=>{var t=x();o(()=>{g(t,`src`,u(E)),g(t,`alt`,u(D))}),l(e,t)};v(Q,e=>{u(E)&&e(ge)});var $=n(Q,2),_e=t=>{var n=S(),i=d(n,!0);e(n),o(()=>r(i,u(D))),l(t,n)};v($,e=>{u(D)&&e(_e)});var ve=n($,2),ye=e=>{var t=C();o(e=>g(t,`aria-label`,e),[()=>P(`imageZoom.next`)]),c(`click`,t,W),l(e,t)},be=i(()=>H());v(ve,e=>{u(be)&&e(ye)}),e(Y),m(Y,e=>a(w,e),()=>u(w)),o((e,t)=>{oe(Y,1,`image-zoom-overlay ${u(T)?``:`hidden`} ${u(N)?`closing`:``}`,`svelte-1yby8l6`),g(Y,`aria-label`,e),g(Z,`aria-label`,t)},[()=>u(D)||P(`imageZoom.dialog`),()=>P(`imageZoom.close`)]),c(`click`,Y,pe),ee(`close`,Y,()=>{(u(T)||u(N))&&L()}),c(`keydown`,Y,e=>{(e.key===`Escape`||e.key===`Enter`||e.key===` `)&&(e.preventDefault(),R())}),c(`click`,Z,R),l(t,q),re()}h([`click`,`keydown`]),customElements.define(`image-zoom`,_(w,{},[`default`],[],{mode:`open`}));export{w as default};