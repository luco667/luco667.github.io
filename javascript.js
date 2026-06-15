/**
 * Bundled by jsDelivr using Rollup v2.79.2 and Terser v5.48.0.
 * Original file: /npm/overlayscrollbars@2.16.0/overlayscrollbars.mjs
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
/*!
 * OverlayScrollbars
 * Version: 2.16.0
 *
 * Copyright (c) Rene Haas | KingSora.
 * https://github.com/KingSora
 *
 * Released under the MIT license.
 */
const t=(t,e)=>{const{o:n,i:r,u:o}=t;let s,i=n;const c=(t,e)=>{const n=i,c=t,l=e||(r?!r(n,c):n!==c);return(l||o)&&(i=c,s=n),[i,l,s]};return[e?t=>c(e(i,s),t):c,t=>[i,!!t,s]]},e="undefined"!=typeof window&&"undefined"!=typeof HTMLElement&&!!window.document?window:{},n=Math.max,r=Math.min,o=Math.round,s=Math.abs,i=Math.sign,c=e.cancelAnimationFrame,l=e.requestAnimationFrame,a=e.setTimeout,u=e.clearTimeout,d=t=>void 0!==e[t]?e[t]:void 0,p=d("MutationObserver"),y=d("IntersectionObserver"),f=d("ResizeObserver"),h=d("ScrollTimeline"),v=t=>void 0===t,x=t=>null===t,b=t=>"number"==typeof t,g=t=>"string"==typeof t,w=t=>"boolean"==typeof t,m=t=>"function"==typeof t,$=t=>Array.isArray(t),S=t=>"object"==typeof t&&!$(t)&&!x(t),k=t=>{const e=!!t&&t.length,n=b(e)&&e>-1&&e%1==0;return!!($(t)||!m(t)&&n)&&(!(e>0&&S(t))||e-1 in t)},M=t=>!!t&&t.constructor===Object,D=t=>t instanceof HTMLElement,O=t=>t instanceof Element,T=()=>performance.now(),C=(t,e,r,o,s)=>{let i=0;const a=T(),u=n(0,r),d=r=>{const c=T(),p=c-a>=u,y=r?1:1-(n(0,a+u-c)/u||0),f=(e-t)*(m(s)?s(y,y*u,0,1,u):y)+t,h=p||1===y;o(f,y,h),i=h?0:l(()=>d())};return d(),t=>{c(i),t&&d(t)}};function L(t,e){if(k(t))for(let n=0;n<t.length&&!1!==e(t[n],n,t);n++);else t&&L(Object.keys(t),n=>e(t[n],n,t));return t}const P=(t,e)=>t.indexOf(e)>=0,I=(t,e)=>t.concat(e),A=(t,e,n)=>(!g(e)&&k(e)?Array.prototype.push.apply(t,e):t.push(e),t),z=t=>Array.from(t||[]),H=t=>$(t)?t:!g(t)&&k(t)?z(t):[t],R=t=>!!t&&!t.length,E=t=>z(new Set(t)),V=(t,e,n)=>{L(t,t=>!t||t.apply(void 0,e||[])),n||(t.length=0)},_="paddingTop",j="paddingRight",K="paddingLeft",B="paddingBottom",F="marginLeft",N="marginRight",Y="marginBottom",q="overflowX",X="overflowY",Z="width",W="height",U="visible",J="hidden",G="scroll",Q=(t,e,n,r)=>{if(t&&e){let r=!0;return L(n,n=>{t[n]!==e[n]&&(r=!1)}),r}return!1},tt=(t,e)=>Q(t,e,["w","h"]),et=(t,e)=>Q(t,e,["x","y"]),nt=(t,e)=>Q(t,e,["t","r","b","l"]),rt=(t,...e)=>t.bind(0,...e),ot=t=>{let e;const n=t?a:l,r=t?u:c;return[o=>{r(e),e=n(()=>o(),m(t)?t():t)},()=>r(e)]},st=t=>{const e=m(t)?t():t;if(b(e)){const t=e?a:l,n=e?u:c;return r=>{const o=t(()=>r(),e);return()=>{n(o)}}}return e&&e._},it=(t,e)=>{const{p:n,v:r,S:o,m:s}=e||{};let i,c,l,a;const u=function(e){c&&c(),i&&i(),a=c=i=l=void 0,t.apply(this,e)},d=t=>s&&l?s(l,t):t,p=()=>{c&&l&&u(d(l)||l)},y=function(){const t=z(arguments),e=st(n);if(e){const n="function"==typeof o?o():o,s=st(r),y=d(t)||t,f=u.bind(0,y);c&&c(),n&&!a?(f(),a=!0,c=e(()=>a=void 0)):(c=e(f),s&&!i&&(i=s(p))),l=y}else u(t)};return y.O=p,y},ct=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),lt=t=>t?Object.keys(t):[],at=(t,e,n,r,o,s,i)=>{const c=[e,n,r,o,s,i];return"object"==typeof t&&!x(t)||m(t)||(t={}),L(c,e=>{L(e,(n,r)=>{const o=e[r];if(t===o)return!0;const s=$(o);if(o&&M(o)){const e=t[r];let n=e;s&&!$(e)?n=[]:s||M(e)||(n={}),t[r]=at(n,o)}else t[r]=s?o.slice():o})}),t},ut=(t,e)=>L(at({},t),(t,e,n)=>{void 0===t?delete n[e]:t&&M(t)&&(n[e]=ut(t))}),dt=t=>!lt(t).length,pt=()=>{},yt=(t,e,o)=>n(t,r(e,o)),ft=t=>E(($(t)?t:(t||"").split(" ")).filter(t=>t)),ht=(t,e)=>t&&t.getAttribute(e),vt=(t,e)=>t&&t.hasAttribute(e),xt=(t,e,n)=>{L(ft(e),e=>{t&&t.setAttribute(e,String(n||""))})},bt=(t,e)=>{L(ft(e),e=>t&&t.removeAttribute(e))},gt=(t,e)=>{const n=ft(ht(t,e)),r=rt(xt,t,e),o=(t,e)=>{const r=new Set(n);return L(ft(t),t=>{r[e](t)}),z(r).join(" ")};return{C:t=>r(o(t,"delete")),$:t=>r(o(t,"add")),H:t=>{const e=ft(t);return e.reduce((t,e)=>t&&n.includes(e),e.length>0)}}},wt=(t,e,n)=>(gt(t,e).C(n),rt(mt,t,e,n)),mt=(t,e,n)=>(gt(t,e).$(n),rt(wt,t,e,n)),$t=(t,e,n,r)=>(r?mt:wt)(t,e,n),St=(t,e,n)=>gt(t,e).H(n),kt=t=>gt(t,"class"),Mt=(t,e)=>{kt(t).C(e)},Dt=(t,e)=>(kt(t).$(e),rt(Mt,t,e)),Ot=(t,e)=>{const n=e?O(e)&&e:document;return n?z(n.querySelectorAll(t)):[]},Tt=(t,e)=>O(t)&&t.matches(e),Ct=t=>Tt(t,"body"),Lt=t=>t?z(t.childNodes):[],Pt=t=>t&&t.parentElement,It=(t,e)=>O(t)&&t.closest(e),At=t=>document.activeElement,zt=(t,e,n)=>{const r=It(t,e),o=t&&((t,e)=>{const n=e?O(e)&&e:document;return n&&n.querySelector(t)})(n,r),s=It(o,e)===r;return!(!r||!o)&&(r===t||o===t||s&&It(It(t,n),e)!==r)},Ht=t=>{L(H(t),t=>{const e=Pt(t);t&&e&&e.removeChild(t)})},Rt=(t,e)=>rt(Ht,t&&e&&L(H(e),e=>{e&&t.appendChild(e)}));let Et;const Vt=t=>{const e=document.createElement("div");return xt(e,"class",t),e},_t=t=>{const e=Vt(),n=Et,r=t.trim();return e.innerHTML=n?n.createHTML(r):r,L(Lt(e),t=>Ht(t))},jt=(t,e)=>t.getPropertyValue(e)||t[e]||"",Kt=t=>{const e=t||0;return isFinite(e)?e:0},Bt=t=>Kt(parseFloat(t||"")),Ft=t=>Math.round(1e4*t)/1e4,Nt=t=>`${Ft(Kt(t))}px`;function Yt(t,e){t&&e&&L(e,(e,n)=>{try{const r=t.style,o=x(e)||w(e)?"":b(e)?Nt(e):e;0===n.indexOf("--")?r.setProperty(n,o):r[n]=o}catch(t){}})}function qt(t,n,r){const o=g(n);let s=o?"":{};if(t){const i=e.getComputedStyle(t,r)||t.style;s=o?jt(i,n):z(n).reduce((t,e)=>(t[e]=jt(i,e),t),s)}return s}const Xt=(t,e,n)=>{const r=e?`${e}-`:"",o=n?`-${n}`:"",s=`${r}top${o}`,i=`${r}right${o}`,c=`${r}bottom${o}`,l=`${r}left${o}`,a=qt(t,[s,i,c,l]);return{t:Bt(a[s]),r:Bt(a[i]),b:Bt(a[c]),l:Bt(a[l])}},Zt=(t,e)=>"translate"+(S(t)?`(${t.x},${t.y})`:`${e?"X":"Y"}(${t})`),Wt={w:0,h:0},Ut=(t,e)=>e?{w:e[`${t}Width`],h:e[`${t}Height`]}:Wt,Jt=t=>Ut("inner",t||e),Gt=rt(Ut,"offset"),Qt=rt(Ut,"client"),te=rt(Ut,"scroll"),ee=t=>{const e=parseFloat(qt(t,Z))||0,n=parseFloat(qt(t,W))||0;return{w:e-o(e),h:n-o(n)}},ne=t=>t.getBoundingClientRect(),re=t=>!(!t||!t[W]&&!t[Z]),oe=(t,e)=>{const n=re(t);return!re(e)&&n},se=(t,e,n,r)=>{L(ft(e),e=>{t&&t.removeEventListener(e,n,r)})},ie=(t,e,n,r)=>{var o;const s=null==(o=r&&r.D)||o,i=r&&r.I||!1,c=r&&r.A||!1,l={passive:s,capture:i};return rt(V,ft(e).map(e=>{const r=c?o=>{se(t,e,r,i),n&&n(o)}:n;return t&&t.addEventListener(e,r,l),rt(se,t,e,r,i)}))},ce=t=>t.stopPropagation(),le=t=>t.preventDefault(),ae=t=>ce(t)||le(t),ue=(t,e)=>{const{x:n,y:r}=b(e)?{x:e,y:e}:e||{};b(n)&&(t.scrollLeft=n),b(r)&&(t.scrollTop=r)},de=t=>({x:t.scrollLeft,y:t.scrollTop}),pe=(t,e)=>{const{T:n,k:r}=t,{w:o,h:c}=e,l=(t,e,n)=>{let r=i(t)*n,o=i(e)*n;if(r===o){const n=s(t),i=s(e);o=n>i?0:o,r=n<i?0:r}return r=r===o?0:r,[r+0,o+0]},[a,u]=l(n.x,r.x,o),[d,p]=l(n.y,r.y,c);return{T:{x:a,y:d},k:{x:u,y:p}}},ye=({T:t,k:e})=>{const n=(t,e)=>0===t&&t<=e;return{x:n(t.x,e.x),y:n(t.y,e.y)}},fe=({T:t,k:e},n)=>{const r=(t,e,n)=>yt(0,1,(t-n)/(t-e)||0);return{x:r(t.x,e.x,n.x),y:r(t.y,e.y,n.y)}},he=t=>{t&&t.focus&&t.focus({preventScroll:!0,focusVisible:!1})},ve=(t,e)=>{L(H(e),t)},xe=t=>{const e=new Map,n=(t,n)=>{if(t){const r=e.get(t);ve(t=>{r&&r[t?"delete":"clear"](t)},n)}else e.forEach(t=>{t.clear()}),e.clear()},r=(t,o)=>{if(g(t)){const r=e.get(t)||new Set;return e.set(t,r),ve(t=>{m(t)&&r.add(t)},o),rt(n,t,o)}w(o)&&o&&n();const s=lt(t),i=[];return L(s,e=>{const n=t[e];n&&A(i,r(e,n))}),rt(V,i)};return r(t||{}),[r,n,(t,n)=>{L(z(e.get(t)),t=>{n&&!R(n)?t.apply(0,n):t()})}]},be={},ge={},we=(t,e,n)=>lt(t).map(r=>{const{static:o,instance:s}=t[r],[i,c,l]=n||[],a=n?s:o;if(a){const t=n?a(i,c,e):a(e);return(l||ge)[r]=t}}),me=t=>((t,e)=>t[e])(ge,t),$e="data-overlayscrollbars",Se="os-environment",ke=`${Se}-scrollbar-hidden`,Me=`${$e}-initialize`,De="noClipping",Oe=`${$e}-body`,Te=$e,Ce=`${$e}-viewport`,Le=q,Pe=X,Ie="arrange",Ae="measuring",ze="scrollbarHidden",He=`${$e}-padding`,Re=`${$e}-content`,Ee="os-size-observer",Ve=`${Ee}-appear`,_e=`${Ee}-listener`,je=`${_e}-scroll`,Ke=`${_e}-item`,Be=`${Ke}-final`,Fe="os-scrollbar",Ne=`${Fe}-rtl`,Ye=`${Fe}-horizontal`,qe=`${Fe}-vertical`,Xe=`${Fe}-track`,Ze=`${Fe}-handle`,We=`${Fe}-visible`,Ue=`${Fe}-cornerless`,Je=`${Fe}-interaction`,Ge=`${Fe}-unusable`,Qe=`${Fe}-auto-hide`,tn=`${Qe}-hidden`,en=`${Fe}-wheel`,nn=`${Xe}-interactive`,rn=`${Ze}-interactive`,on="__osSizeObserverPlugin",sn=(()=>({[on]:{static:()=>(t,e,n)=>{const r=3333333,o="scroll",s=_t(`<div class="${Ke}" dir="ltr"><div class="${Ke}"><div class="${Be}"></div></div><div class="${Ke}"><div class="${Be}" style="width: 200%; height: 200%"></div></div></div>`),i=s[0],a=i.lastChild,u=i.firstChild,d=null==u?void 0:u.firstChild;let p,y=Gt(i),f=y,h=!1;const v=()=>{ue(u,r),ue(a,r)},x=t=>{p=0,h&&(y=f,e(!0===t))},b=t=>{f=Gt(i),h=!t||!tt(f,y),t?(ce(t),h&&!p&&(c(p),p=l(x))):x(!1===t),v()},g=[Rt(t,s),ie(u,o,b),ie(a,o,b)];return Dt(t,je),Yt(d,{[Z]:r,[W]:r}),l(v),[n?rt(b,!1):v,g]}}}))(),cn=(t,e)=>{const{M:n}=e,[r,o]=t("showNativeOverlaidScrollbars");return[r&&n.x&&n.y,o]},ln=t=>0===t.indexOf(U),an=(t,e)=>{if("auto"===t)return e?G:J;const n=t||J;return[J,G,U].includes(n)?n:J},un=(t,e)=>{const{overflowX:n,overflowY:r}=qt(t,[q,X]);return{x:an(n,e.x),y:an(r,e.y)}},dn="__osScrollbarsHidingPlugin",pn=(()=>({[dn]:{static:()=>({R:(t,e,n,r,o)=>{const{V:s,L:i}=t,{P:c,M:l,U:a}=r,u=!s&&!c&&(l.x||l.y),[d]=cn(o,r),p=t=>{const e=c||d?0:42,n=(t,n,r)=>[n&&!c?t?e:r:0,t&&!!e],[r,o]=n(l.x,t.x===G,a.x),[s,i]=n(l.y,t.y===G,a.y);return{N:{x:r,y:s},q:{x:o,y:i}}},y=t=>{if(!s){const{B:r}=n,o=at({},{[N]:0,[Y]:0,[F]:0}),{N:s,q:i}=p(t),{x:c,y:l}=i,{x:a,y:d}=s,{F:y}=e,f=r?F:N,h=r?K:j,v=y[f],x=y[Y],b=y[h],g=y[B];return o[Z]=`calc(100% + ${d+-1*v}px)`,o[f]=-d+v,o[Y]=-a+x,u&&(o[h]=b+(l?d:0),o[B]=g+(c?a:0)),o}};return{X:(t,r,o)=>{if(u){const{F:s}=e,{N:c,q:l}=p(t),{x:a,y:u}=l,{x:d,y:y}=c,{B:f}=n,h=s[f?j:K],v=s.paddingTop,x=r.w+o.w,b=r.h+o.h,g={w:y&&u?y+x-h+"px":"",h:d&&a?d+b-v+"px":""};Yt(i,{"--os-vaw":g.w,"--os-vah":g.h})}return u},Y:()=>{if(u){const{j:t,F:n}=e,r=un(i,t),{q:o}=p(r),{x:s,y:c}=o,l={},a=t=>L(t,t=>{l[t]=n[t]});s&&a([Y,_,B]),c&&a([F,N,K,j]);const u=qt(i,lt(l)),d=wt(i,Ce,Ie);return Yt(i,l),()=>{Yt(i,at({},u,y(r))),d()}}return pt},W:y}}})}}))(),yn="__osClickScrollPlugin",fn=(()=>({[yn]:{static:()=>(t,e,n,r,o,s,i,c)=>{let l=!1,a=pt;const u={clickScrollDistance:o,clickScrollDuration:200,clickPressDelay:150,pressDistanceDuration:90},d=t=>1-(1-t)*(1-t),p=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,{clickScrollDistance:y,clickScrollDuration:f,clickPressDelay:h,pressDistanceDuration:v}=at({},u,m(s)?s(i):u),x=0===y,b=2.3*v,g=2.5*v,w=y?o/y:0,[$,S]=ot(Math.max(22,h)),k=n(),M=Math.sign(r),D=C(0,x?r:y*M,f,(o,s,i)=>{x?e(o):t(o),i&&(c(l),$(()=>{if(l||x||!v)return;const t=n()-k,o=t*w,s=r-t,i=o?s/o:0,c=i<=2.2,u=Math.max(1,i||0);(!i||i>.5)&&Math.sign(s)===M&&(a=C(t,c?r:r-o,c?b*u:v*u,(t,n,o)=>{e(t),o&&!c&&(a=C(t,r,g,e,d))},c&&p))}))},p);return t=>{l=!0,t&&D(),S(),a()}}}}))(),hn=t=>JSON.stringify(t,(t,e)=>{if(m(e))throw 0;return e}),vn=(t,e)=>t?`${e}`.split(".").reduce((t,e)=>t&&ct(t,e)?t[e]:void 0,t):void 0,xn=[33,99],bn=[222,666,!0],gn={paddingAbsolute:!1,showNativeOverlaidScrollbars:!1,update:{elementEvents:[["img","load"]],debounce:{mutation:[0,33],resize:null,event:xn,env:bn},attributes:null,ignoreMutation:null,flowDirectionStyles:null},overflow:{x:"scroll",y:"scroll"},scrollbars:{theme:"os-theme-dark",visibility:"auto",autoHide:"never",autoHideDelay:1300,autoHideSuspend:!1,dragScroll:!0,clickScroll:!1,pointers:["mouse","touch","pen"]}},wn=(t,e)=>{const n={};return L(I(lt(e),lt(t)),r=>{const o=t[r],s=e[r];if(S(o)&&S(s))at(n[r]={},wn(o,s)),dt(n[r])&&delete n[r];else if(ct(e,r)&&s!==o){let t=!0;if($(o)||$(s))try{hn(o)===hn(s)&&(t=!1)}catch(t){}t&&(n[r]=s)}}),n},mn=(t,e,n)=>r=>[vn(t,r),n||void 0!==vn(e,r)];let $n;let Sn;const kn=()=>{const n=(t,e,n)=>{Rt(document.body,t),Rt(document.body,t);const r=Qt(t),o=Gt(t),s=ee(e);return n&&Ht(t),{x:o.h-r.h+s.h,y:o.w-r.w+s.w}},r=_t(`<div class="${Se}"><div></div><style>${`.${Se}{scroll-behavior:auto!important;position:fixed;opacity:0;visibility:hidden;overflow:scroll;height:200px;width:200px;z-index:-1}.${Se} div{width:200%;height:200%;margin:10px 0}.${ke}{scrollbar-width:none!important}.${ke}::-webkit-scrollbar,.${ke}::-webkit-scrollbar-corner{appearance:none!important;display:none!important;width:0!important;height:0!important}`}</style></div>`)[0],o=r.firstChild,s=r.lastChild,i=$n;i&&(s.nonce=i);const[c,,l]=xe(),[a,u]=t({o:n(r,o),i:et},rt(n,r,o,!0)),[d]=u(),p=(t=>{let e=!1;const n=Dt(t,ke);try{e="none"===qt(t,"scrollbar-width")||"none"===qt(t,"display","::-webkit-scrollbar")}catch(t){}return n(),e})(r),y={x:0===d.x,y:0===d.y},f={elements:{host:null,padding:!p,viewport:t=>p&&Ct(t)&&t,content:!1},scrollbars:{slot:!0},cancel:{nativeScrollbarsOverlaid:!1,body:null}},v=at({},gn),x=rt(at,{},v),b=rt(at,{},f),g={U:d,M:y,P:p,J:!!h,G:rt(c,"r"),K:b,Z:t=>at(f,t)&&b(),tt:x,nt:t=>at(v,t)&&x(),ot:at({},f),st:at({},v)};if(bt(r,"style"),Ht(r),ie(e,"resize",()=>{l("r",[])}),m(e.matchMedia)&&!p&&(!y.x||!y.y)){const t=n=>{const r=e.matchMedia(`(resolution: ${e.devicePixelRatio}dppx)`);ie(r,"change",()=>{n(),t(n)},{A:!0})};t(()=>{const[t,e]=a();at(g.U,t),l("r",[e])})}return g},Mn=()=>(Sn||(Sn=kn()),Sn),Dn=(t,e,n,r)=>{let o=!1;const{et:s,ct:i,rt:c,it:l,lt:a,ut:u}=r||{},[d,y]=((t,e,n)=>{let r=!1;const o=!!n&&new WeakMap,s=s=>{if(o&&n){const i=n.map(e=>{const[n,r]=e||[];return[r&&n?(s||Ot)(n,t):[],r]});L(i,n=>L(n[0],s=>{const i=n[1],c=o.get(s)||[];if(t.contains(s)&&i){const t=ie(s,i,n=>{r?(t(),o.delete(s)):e(n)});o.set(s,A(c,t))}else V(c),o.delete(s)}))}};return s(),[()=>{r=!0},s]})(t,()=>o&&n(!0),c),f=i||[],h=I(s||[],f),v=(o,s)=>{if(!R(s)){const i=a||pt,c=u||pt,d=[],p=[];let h=!1,v=!1;if(L(s,n=>{const{attributeName:o,target:s,type:a,oldValue:u,addedNodes:y,removedNodes:x}=n,b="attributes"===a,w="childList"===a,m=t===s,$=b&&o,S=$&&ht(s,o||""),k=g(S)?S:null,M=$&&u!==k,D=P(f,o)&&M;if(e&&(w||!m)){const e=b&&M,a=e&&l&&Tt(s,l),p=(a?!i(s,o,u,k):!b||e)&&!c(n,!!a,t,r);L(y,t=>A(d,t)),L(x,t=>A(d,t)),v=v||p}!e&&m&&M&&!i(s,o,u,k)&&(A(p,o),h=h||D)}),y(t=>E(d).reduce((e,n)=>(A(e,Ot(t,n)),Tt(n,t)?A(e,n):e),[])),e)return!o&&v&&n(!1),[!1];if(!R(p)||h){const t=[E(p),h];return o||n.apply(0,t),t}}},x=new p(rt(v,!1));return[()=>(x.observe(t,{attributes:!0,attributeOldValue:!0,attributeFilter:h,subtree:e,childList:e,characterData:e}),o=!0,()=>{o&&(d(),x.disconnect(),o=!1)}),()=>{if(o)return v(!0,x.takeRecords())}]};let On=null;const Tn=(e,n,r)=>{const{ft:o}=r||{},s=me(on),[i]=t({o:!1,u:!0});return()=>{const t=[],r=_t(`<div class="${Ee}"><div class="${_e}"></div></div>`)[0],c=r.firstChild,l=t=>{let e=!1,r=!1;if($(t)&&!R(t)){const n=t[0],[o,,s]=i(n.contentRect),c=re(o);r=oe(o,s),e=!r&&!c}else r=!0===t;e||n({_t:!0,ft:r})};if(f){if(!w(On)){const t=new f(pt);t.observe(e,{get box(){On=!0}}),On=On||!1,t.disconnect()}const n=it(l,{p:0,v:0}),o=t=>n(t),s=new f(o);if(s.observe(On?e:c),A(t,[()=>{s.disconnect()},!On&&Rt(e,r)]),On){const n=new f(o);n.observe(e,{box:"border-box"}),A(t,()=>n.disconnect())}}else{if(!s)return pt;{const[n,i]=s(c,l,o);A(t,I([Dt(r,Ve),ie(r,"animationstart",n),Rt(e,r)],i))}}return rt(V,t)}},Cn=(e,n)=>{let r;const o=Vt("os-trinsic-observer"),[s]=t({o:!1}),i=(t,e)=>{if(t){const r=s((t=>0===t.h||t.isIntersecting||t.intersectionRatio>0)(t)),[,o]=r;return o&&!e&&n(r)&&[r]}},c=(t,e)=>i(e.pop(),t);return[()=>{const t=[];if(y)r=new y(rt(c,!1),{root:e}),r.observe(o),A(t,()=>{r.disconnect()});else{const e=()=>{const t=Gt(o);i(t)};A(t,Tn(o,e)()),e()}return rt(V,A(t,Rt(e,o)))},()=>r&&c(!0,r.takeRecords())]},Ln=(e,n,r,o)=>{let s,i,c,l,a,u,d,p;const y=`[${Te}]`,h=`[${Ce}]`,v=["id","class","style","open","wrap","cols","rows"],{dt:x,vt:g,L:w,gt:S,ht:k,V:D,bt:O,yt:T,wt:C,St:L}=e,P=t=>"rtl"===qt(t,"direction"),A={Ot:!1,B:P(x)},z=Mn(),H=me(dn),[R]=t({i:tt,o:{w:0,h:0}},()=>{const t=H&&H.R(e,n,A,z,r).Y,o=!(O&&D)&&St(g,Te,De),s=!D&&T(Ie),i=s&&de(S),c=i&&L(),l=C(Ae,o),a=s&&t&&t(),u=te(w),d=ee(w);return a&&a(),ue(S,i),c&&c(),o&&l(),{w:u.w+d.w,h:u.h+d.h}}),E=(()=>{let t,e,n;const r=it(o,{p:()=>t,v:()=>e,S:()=>n,m(t,e){const[n]=t,[r]=e;return[I(lt(n),lt(r)).reduce((t,e)=>(t[e]=n[e]||r[e],t),{})]}}),s=(o,s)=>{if($(s)){const[r,o,i]=s;t=r,e=o,n=i}else b(s)?(t=s,e=!1,n=!1):(t=!1,e=!1,n=!1);r(o)};return s.O=r.O,s})(),V=t=>{const e=P(x);at(t,{Ct:p!==e}),at(A,{B:e}),p=e},_=(t,e)=>{const[n,r]=t,s={$t:r};return at(A,{Ot:n}),e||o(s),s},j=({_t:t,ft:e})=>{const n=e?o:E,r={_t:t||e,ft:e};V(r),n(r,i)},K=(t,e)=>{const[,n]=R(),r={xt:n};return V(r),n&&!e&&E(r,t?c:s),r},B=(t,e,n)=>{const r={Ht:e};return V(r),e&&!n&&E(r,s),r},[F,N]=k?Cn(g,_):[],Y=!D&&Tn(g,j,{ft:!0}),[q,X]=Dn(g,!1,B,{ct:v,et:v}),Z=D&&f&&new f(t=>{const e=t[t.length-1].contentRect;j({_t:!0,ft:oe(e,d)}),d=e});return[()=>{Z&&Z.observe(g);const t=Y&&Y(),e=F&&F(),n=q(),r=z.G(t=>{const[,e]=R();E({Et:t,xt:e,_t:O},l)});return()=>{Z&&Z.disconnect(),t&&t(),e&&e(),u&&u(),n(),r()}},({Dt:t,zt:e,It:n})=>{const r={},[o]=t("update.ignoreMutation"),[d,p]=t("update.attributes"),[f,x]=t("update.elementEvents"),[g,S]=t("update.debounce"),O=e||n;if(x||p){a&&a(),u&&u();const[t,e]=Dn(k||w,!0,K,{et:I(v,d||[]),rt:f,it:y,ut:(t,e)=>{const{target:n,attributeName:r}=t;return!(e||!r||D)&&zt(n,y,h)||!!It(n,`.${Fe}`)||(t=>m(o)&&!!o(t))(t)}});u=t(),a=e}if(S&&(E.O(),$(g)||b(g)?(s=g,i=!1,c=xn,l=bn):M(g)?(s=g.mutation,i=g.resize,c=g.event,l=g.env):(s=!1,i=!1,c=!1,l=!1)),O){const t=X(),e=N&&N(),n=a&&a();t&&at(r,B(t[0],t[1],O)),e&&at(r,_(e[0],O)),n&&at(r,K(n[0],O))}return V(r),r},A]},Pn=(t,e)=>m(e)?e.apply(0,t):e,In=(t,e,n,r)=>{const o=v(r)?n:r;return Pn(t,o)||e.apply(0,t)},An=(t,e,n,r)=>{const o=v(r)?n:r,s=Pn(t,o);return!!s&&(D(s)?s:e.apply(0,t))},zn=(t,e,n,r)=>{const o="--os-viewport-percent",s="--os-scroll-percent",i="--os-scroll-direction",{K:c}=Mn(),{scrollbars:l}=c(),{slot:a}=l,{dt:u,vt:d,L:p,At:y,gt:f,bt:v,V:x}=e,{scrollbars:b}=y?{}:t,{slot:g}=b||{},m=[],$=[],S=[],k=An([u,d,p],()=>x&&v?u:d,a,g),M=t=>{if(h){let e=null,r=[];const o=new h({source:f,axis:t}),s=()=>{e&&e.cancel(),e=null},i=i=>{const{Tt:c}=n,l=ye(c)[t],a="x"===t,u=[Zt(0,a),Zt(`calc(-100% + 100cq${a?"w":"h"})`,a)],d=l?u:u.reverse();return r[0]===d[0]&&r[1]===d[1]||(r=d,s(),e=i.kt.animate({clear:["left"],transform:d},{timeline:o})),s};return{Mt:i}}},D={x:M("x"),y:M("y")},O=(t,e,n)=>{const r=n?Dt:Mt;L(t,t=>{r(t.Lt,e)})},T=(t,e)=>{L(t,t=>{const[n,r]=e(t);Yt(n,r)})},C=(t,e,n)=>{const r=w(n),o=!r||!n;(!r||n)&&O($,t,e),o&&O(S,t,e)},P=t=>{const e=t?"x":"y",n=Vt(`${Fe} ${t?Ye:qe}`),o=Vt(Xe),s=Vt(Ze),i={Lt:n,Pt:o,kt:s},c=D[e];return A(t?$:S,i),A(m,[Rt(n,o),Rt(o,s),rt(Ht,n),c&&c.Mt(i),r(i,C,t)]),i},I=rt(P,!0),z=rt(P,!1);return I(),z(),[{Ut:()=>{const t=(()=>{const{Rt:t,Vt:e}=n,r=(t,e)=>yt(0,1,t/(t+e)||0);return{x:r(e.x,t.x),y:r(e.y,t.y)}})(),e=t=>e=>[e.Lt,{[o]:Ft(t)+""}];T($,e(t.x)),T(S,e(t.y))},Nt:()=>{if(!h){const{Tt:t}=n,e=fe(t,de(f)),r=t=>e=>[e.Lt,{[s]:Ft(t)+""}];T($,r(e.x)),T(S,r(e.y))}},qt:()=>{const{Tt:t}=n,e=ye(t),r=t=>e=>[e.Lt,{[i]:t?"0":"1"}];T($,r(e.x)),T(S,r(e.y)),h&&($.forEach(D.x.Mt),S.forEach(D.y.Mt))},Bt:()=>{if(x&&!v){const{Rt:t,Tt:e}=n,r=ye(e),o=fe(e,de(f)),s=e=>{const{Lt:n}=e,s=Pt(n)===p&&n,i=(t,e,n)=>{const r=e*t;return Nt(n?r:-r)};return[s,s&&{transform:Zt({x:i(o.x,t.x,r.x),y:i(o.y,t.y,r.y)})}]};T($,s),T(S,s)}},Ft:C,jt:{Xt:$,Yt:I,Wt:rt(T,$)},Jt:{Xt:S,Yt:z,Wt:rt(T,S)}},()=>(Rt(k,$[0].Lt),Rt(k,S[0].Lt),rt(V,m))]},Hn=(t,e,n,r,i)=>(c,l,u)=>{const{vt:d,L:p,V:y,gt:f,Gt:h,St:v}=e,{Lt:x,Pt:b,kt:g}=c,[w,$]=ot(333),[S,k]=ot(444),M=t=>{m(f.scrollBy)&&f.scrollBy({behavior:"smooth",left:t.x,top:t.y})};let D=!0;return rt(V,[ie(g,"pointermove pointerleave",r(i)),ie(x,"pointerenter",r(()=>{l(Je,!0)})),ie(x,"pointerleave pointercancel",r(()=>{l(Je,!1)})),ie(x,"wheel",r(t=>{const{deltaX:e,deltaY:n,deltaMode:r}=t;D&&0===r&&Pt(x)===d&&M({x:e,y:n}),D=!1,l(en,!0),w(()=>{D=!0,l(en)}),le(t)}),{D:!1,I:!0}),!y&&ie(x,"mousedown",r(()=>{const t=At();(vt(t,Ce)||vt(t,Te)||t===document.body)&&a(rt(he,p),25)})),ie(x,"pointerdown",()=>{const t=ie(h,"click",t=>{e(),ae(t)},{A:!0,I:!0,D:!1}),e=ie(h,"pointerup pointercancel",()=>{e(),setTimeout(t,150)},{I:!0,D:!0})},{I:!0,D:!0}),(()=>{const e="pointerup pointercancel lostpointercapture",i="client"+(u?"X":"Y"),c=u?Z:W,l=u?"left":"top",a=u?"w":"h",d=u?"x":"y",p=[];return ie(b,"pointerdown",r(r=>{const y=It(r.target,`.${Ze}`)===g,x=y?g:b,w=t.scrollbars,m=w[y?"dragScroll":"clickScroll"],{button:$,isPrimary:D,pointerType:O}=r,{pointers:T}=w;if(0===$&&D&&m&&(T||[]).includes(O)){V(p),k();const t=!y&&(r.shiftKey||"instant"===m),w=rt(ne,g),$=rt(ne,b),D=(t,e)=>(t||w())[l]-(e||$())[l],O=o(ne(f)[c])/Gt(f)[a]||1,T=de(f)[d],C=t=>{ue(f,{[d]:T+t})},L=t=>{const{Rt:e}=n,r=Gt(b)[a]-Gt(g)[a];C(1/O*t/r*e[d])},P=r[i],I=w(),z=$(),H=I[c],R=D(I,z)+H/2,E=P-z[l]-R,_=y?0:E,j=t=>{V(F),x.releasePointerCapture(t.pointerId)},K=y||t,B=v(),F=[ie(h,e,j),ie(h,"selectstart",t=>le(t),{D:!1}),ie(b,e,j),K&&ie(b,"pointermove",t=>L(_+t[i]-P)),K&&(()=>{const t=de(f);B();const e=de(f),n={x:e.x-t.x,y:e.y-t.y};(s(n.x)>3||s(n.y)>3)&&(v(),ue(f,t),M(n),S(B))})];if(x.setPointerCapture(r.pointerId),t)L(E);else if(!y){const t=me(yn);if(t){const{Vt:e}=n,r=t(C,L,rt(D),E,e[d],m,!!u,t=>{t?B():A(F,B)});A(F,r),A(p,rt(r,!0))}}}}))})(),$,k])},Rn=t=>{const n=Mn(),{K:r,P:o}=n,{elements:s}=r(),{padding:i,viewport:c,content:l}=s,a=D(t),u=a?{}:t,{elements:d}=u,{padding:p,viewport:y,content:f}=d||{},h=a?t:u.target,v=Ct(h),x=h.ownerDocument,b=x.documentElement,g=()=>x.defaultView||e,w=rt(In,[h]),m=rt(An,[h]),$=rt(Vt,""),S=rt(w,$,c),k=rt(m,$,l),M=S(y),O=M===h,T=O&&v,C=!O&&k(f),L=!O&&M===C,I=T?b:M,z=T?I:h,H=!O&&m($,i,p),R=!L&&C,E=[R,I,H,z].map(t=>D(t)&&!Pt(t)&&t),_=t=>t&&P(E,t),j=!_(I)&&(t=>{const e=Gt(t),n=te(t),r=qt(t,q),o=qt(t,X);return n.w-e.w>0&&!ln(r)||n.h-e.h>0&&!ln(o)})(I)?I:h,K=T?b:I,B={dt:h,vt:z,L:I,ln:H,ht:R,gt:K,Qt:T?x:I,an:v?b:j,Gt:x,bt:v,At:a,V:O,un:g,yt:t=>St(I,Ce,t),wt:(t,e)=>$t(I,Ce,t,e),St:()=>$t(K,Ce,"scrolling",!0)},{dt:F,vt:N,ln:Y,L:Z,ht:W}=B,U=[()=>{bt(N,[Te,Me]),bt(F,Me),v&&bt(b,[Me,Te])}];let J=Lt([W,Z,Y,N,F].find(t=>t&&!_(t)));const G=T?F:W||Z,Q=rt(V,U);return[B,()=>{const t=g(),e=At(),n=t=>{Rt(Pt(t),Lt(t)),Ht(t)},r=t=>ie(t,"focusin focusout focus blur",ae,{I:!0,D:!1}),s="tabindex",i=ht(Z,s),c=r(e);return xt(N,Te,O?"":"host"),xt(Y,He,""),xt(Z,Ce,""),xt(W,Re,""),O||(xt(Z,s,i||"-1"),v&&xt(b,Oe,"")),Rt(G,J),Rt(N,Y),Rt(Y||N,!O&&Z),Rt(Z,W),A(U,[c,()=>{const t=At(),e=_(Z),o=e&&t===Z?F:t,c=r(o);bt(Y,He),bt(W,Re),bt(Z,Ce),v&&bt(b,Oe),i?xt(Z,s,i):bt(Z,s),_(W)&&n(W),e&&n(Z),_(Y)&&n(Y),he(o),c()}]),o&&!O&&(mt(Z,Ce,ze),A(U,rt(bt,Z,Ce))),he(!O&&v&&e===F&&t.top===t?Z:e),c(),J=0,Q},Q]},En=({ht:t})=>({Zt:e,fn:n,It:r})=>{const{$t:o}=e||{},{Ot:s}=n;t&&(o||r)&&Yt(t,{[W]:s&&"100%"})},Vn=({vt:e,ln:n,L:r,V:o},s)=>{const[i,c]=t({i:nt,o:Xt()},rt(Xt,e,"padding",""));return({Dt:t,Zt:e,fn:l,It:a})=>{let[u,d]=c(a);const{P:p}=Mn(),{_t:y,xt:f,Ct:h}=e||{},{B:v}=l,[x,b]=t("paddingAbsolute");(y||d||(a||f))&&([u,d]=i(a));const g=!o&&(b||h||d);if(g){const t=!x||!n&&!p,e=u.r+u.l,o=u.t+u.b,i={[N]:t&&!v?-e:0,[Y]:t?-o:0,[F]:t&&v?-e:0,top:t?-u.t:0,right:t?v?-u.r:"auto":0,left:t?v?"auto":-u.l:0,[Z]:t&&`calc(100% + ${e}px)`},c={[_]:t?u.t:0,[j]:t?u.r:0,[B]:t?u.b:0,[K]:t?u.l:0};Yt(n||r,i),Yt(r,c),at(s,{ln:u,_n:!t,F:n?c:at({},i,c)})}return{dn:g}}},_n=(r,o)=>{const i=Mn(),{vt:c,ln:a,L:u,V:d,Qt:p,gt:y,bt:f,wt:h,un:v}=r,{P:x}=i,b=f&&d,w=rt(n,0),m={display:()=>!1,direction:t=>"ltr"!==t,flexDirection:t=>t.endsWith("-reverse"),writingMode:t=>"horizontal-tb"!==t},$=lt(m),S={i:tt,o:{w:0,h:0}},k={i:et,o:{}},M=t=>{h(Ae,!b&&t)},D=()=>qt(u,$),O=(t,e)=>{const n=!lt(t).length,r=!!e||$.some(e=>{const n=t[e];return g(n)&&m[e](n)});if(n||!r||!(t=>!!t&&(t=>!!(t.offsetWidth||t.offsetHeight||t.getClientRects().length))(t))(u))return{T:{x:0,y:0},k:{x:1,y:1}};M(!0);const o=de(y),i=ie(p,G,t=>{const e=de(y);t.isTrusted&&e.x===o.x&&e.y===o.y&&ce(t)},{I:!0,A:!0}),c=h("noContent",!0);ue(y,{x:0,y:0}),c();const a=de(y),d=te(y);ue(y,{x:d.w,y:d.h});const f=de(y),v={x:f.x-a.x,y:f.y-a.y};ue(y,{x:-d.w,y:-d.h});const x=de(y),b={x:x.x-a.x,y:x.y-a.y},w={x:s(v.x)>=s(b.x)?f.x:x.x,y:s(v.y)>=s(b.y)?f.y:x.y};return ue(y,o),l(()=>i()),{T:a,k:w}},T=(t,n)=>{const r=e.devicePixelRatio%1!=0?1:0,o={w:w(t.w-n.w),h:w(t.h-n.h)};return{w:o.w>r?o.w:0,h:o.h>r?o.h:0}},C=(t,e)=>{const n=(t,e,n,r)=>{const o=t===U?J:(t=>t.replace(`${U}-`,""))(t),s=ln(t),i=ln(n);if(!e&&!r)return J;if(s&&i)return U;if(s){return e&&r?o:e?U:J}return e?o:i&&r?U:J};return{x:n(e.x,t.x,e.y,t.y),y:n(e.y,t.y,e.x,t.x)}},L=t=>{const e=t=>[U,J,G].map(e=>X(an(e),t)),n=e(!0).concat(e()).join(" ");h(n),h(lt(t).map(e=>X(t[e],"x"===e)).join(" "),!0)},[P,A]=t(S,rt(ee,u)),[z,H]=t(S,rt(te,u)),[R,V]=t(S),[_]=t(k),[j,K]=t(S),[B]=t(k),[F]=t({i:(t,e)=>Q(t,e,E(I(lt(t),lt(e)))),o:{}}),[N,Y]=t({i:(t,e)=>et(t.T,e.T)&&et(t.k,e.k),o:{T:{x:0,y:0},k:{x:0,y:0}}}),q=me(dn),X=(t,e)=>`${e?Le:Pe}${(t=>{const e=String(t||"");return e?e[0].toUpperCase()+e.slice(1):""})(t)}`;return({Dt:t,Zt:e,fn:n,It:s},{dn:l})=>{const{_t:d,Ht:p,xt:y,Ct:f,ft:g,Et:m}=e||{},$=q&&q.R(r,o,n,i,t),{X:S,Y:k,W:I}=$||{},[E,X]=cn(t,i),[Z,W]=t("overflow"),U=ln(Z.x),J=ln(Z.y),G=d||l||y||f||m||X;let Q=A(s),tt=H(s),et=V(s),nt=K(s);if(X&&x&&h(ze,!E),G){St(c,Te,De)&&M(!0);const t=k&&k(),[e]=Q=P(s),[n]=tt=z(s),r=Qt(u),o=b&&Jt(v()),i={w:w(n.w+e.w),h:w(n.h+e.h)},l={w:w((o?o.w:r.w+w(r.w-n.w))+e.w),h:w((o?o.h:r.h+w(r.h-n.h))+e.h)};t&&t(),nt=j(l),et=R(T(i,l),s)}const[rt,ot]=nt,[st,it]=et,[ct,lt]=tt,[ut,dt]=Q,[pt]=_({x:st.w>0,y:st.h>0}),yt=U&&J&&(pt.x||pt.y)||U&&pt.x&&!pt.y||J&&pt.y&&!pt.x,ft=l||f||m||dt||lt||ot||it||W||X||G||p&&b,[ht]=t("update.flowDirectionStyles"),[vt,xt]=F(ht?ht(u)||{}:D(),s),bt=f||g||xt||s,[gt,wt]=bt?N(O(vt,!!ht),s):Y();let mt=C(pt,Z);M(!1),ft&&(L(mt),mt=un(u,pt),I&&S&&(S(mt,ct,ut),Yt(u,I(mt))));const[kt,Mt]=B(mt);return $t(c,Te,De,yt),$t(a,He,De,yt),at(o,{rn:kt,Vt:{x:rt.w,y:rt.h},Rt:{x:st.w,y:st.h},j:pt,Tt:pe(gt,st)}),{en:Mt,nn:ot,sn:it,cn:wt||it}}},jn=t=>{const[e,n,r]=Rn(t),o={ln:{t:0,r:0,b:0,l:0},_n:!1,F:{[N]:0,[Y]:0,[F]:0,[_]:0,[j]:0,[B]:0,[K]:0},Vt:{x:0,y:0},Rt:{x:0,y:0},rn:{x:J,y:J},j:{x:!1,y:!1},Tt:{T:{x:0,y:0},k:{x:0,y:0}}},{dt:s,gt:i,V:c,St:l}=e,{P:a,M:u}=Mn(),d=!a&&(u.x||u.y),p=[En(e),Vn(e,o),_n(e,o)];return[n,t=>{const e={},n=d&&de(i),r=n&&l();return L(p,n=>{at(e,n(t,e)||{})}),ue(i,n),r&&r(),c||ue(s,0),e},o,e,r]},Kn=(t,e,n,r)=>{let o=!1;const s={Kt:!1,pn:!1},i=mn(e,{}),[c,l,a,u,d]=jn(t),[p,y,f]=Ln(u,a,i,t=>{g({},t)}),[h,v,,x]=((t,e,n,r,o,s,i)=>{let c,l,a,u,d,p=pt,y=0;const f=["mouse","pen"],h=t=>e=>{n.Kt||t(e)},v=t=>f.includes(t.pointerType),[x,b]=ot(),[g,w]=ot(100),[m,$]=ot(50),[S,k]=ot(()=>y),[M,D]=zn(t,s,o,Hn(e,s,o,h,t=>v(t)&&E())),{vt:O,Qt:T,bt:C}=s,{Ft:L,Ut:P,Nt:I,qt:z,Bt:H}=M,R=(t,e)=>{k();const r=t=>{n.Kt||L(tn,t)};if(t)r();else{const t=!a||!c;y>0&&!e?S(rt(r,t)):r(t)}},E=()=>{(a?c:u)||(R(!0),g(()=>{R(!1)}))},_=t=>{v(t)&&(c=!0,!n.Kt&&a&&R(!0))},j=t=>{L(Qe,t,!0),L(Qe,t,!1)},K=[k,w,$,b,()=>p(),ie(O,"pointerover",_,{A:!0}),ie(O,"pointerenter",_),ie(O,"pointerleave",t=>{v(t)&&(c=!1,!n.Kt&&a&&R(!1))}),ie(O,"pointermove",h(t=>{v(t)&&l&&E()})),ie(T,"scroll",h(t=>{x(()=>{I(),E()}),i(t),H()}))],B=me(dn);return[()=>rt(V,A(K,D())),({Dt:t,It:e,Zt:n,tn:s})=>{const{nn:i,sn:c,en:f,cn:v}=s||{},{Ct:x,ft:b}=n||{},{B:g}=r,{M:w,P:$}=Mn(),{rn:S,j:k}=o,[M,D]=t("showNativeOverlaidScrollbars"),[O,A]=t("scrollbars.theme"),[E,V]=t("scrollbars.visibility"),[_,K]=t("scrollbars.autoHide"),[F,N]=t("scrollbars.autoHideSuspend"),[Y]=t("scrollbars.autoHideDelay"),[q,X]=t("scrollbars.dragScroll"),[Z,W]=t("scrollbars.clickScroll"),[J,Q]=t("overflow"),tt=b&&!e,et=i||c||v||x||e,nt=f||V||Q,ot=M&&w.x&&w.y,st=!$&&!B,it=(t,e,n)=>{const r=t.includes(G)&&(E===U||"auto"===E&&e===G);return L(We,r,n),r};if(y=Y,(D||st)&&L("os-theme-none",ot||st),A&&(L(d),L(O,!0),d=O),(N||tt)&&(j(!F),tt&&F&&(k.x||k.y?(p(),m(()=>{p=ie(T,G,h(rt(j,!0)),{A:!0})})):j(!0))),K&&(l="move"===_,a="leave"===_,u="never"===_,R(u,!0)),X&&L(rn,q),W&&L(nn,!!Z),nt){const t=it(J.x,S.x,!0),e=it(J.y,S.y,!1);L(Ue,!(t&&e))}et&&(I(),P(),H(),v&&z(),L(Ge,!k.x,!0),L(Ge,!k.y,!1),L(Ne,g&&!C))},{},M]})(t,e,s,f,a,u,r),b=t=>lt(t).some(e=>!!t[e]),g=(t,r)=>{const{Kt:i,pn:c}=s;if(c||i&&o)return!1;const{vn:a,It:u,zt:d}=t,p=a||{},h=!!u||!o,x={Dt:mn(e,p,h),vn:p,It:h},g=r||y(at({},x,{zt:d})),w=l(at({},x,{fn:f,Zt:g}));v(at({},x,{Zt:g,tn:w}));const m=b(g),$=b(w),S=m||$||!dt(p)||h;return o=!0,S&&n(t,{Zt:g,tn:w}),S};return[()=>{const{an:t,gt:e,St:n}=u,r=de(t),o=[p(),c(),h(),()=>{s.pn=!0}],i=n();return ue(e,r),i(),rt(V,o)},g,t=>{const e=s.Kt;s.Kt=t,t||e===t||g({It:!0,zt:!0})},()=>{v({Dt:mn(e,{},!1),vn:{},It:!1})},()=>({gn:s,hn:f,bn:a}),{yn:u,wn:x},d]},Bn=new WeakMap,Fn=t=>Bn.get(t),Nn=(t,e,n)=>{const{tt:r}=Mn(),o=D(t),s=o?t:t.target,i=Fn(s);if(e&&!i){const i=[],c={},l=t=>{const e=ut(t),n=me("__osOptionsValidationPlugin");return n?n(e,!0):e},a=at({},r(),l(e)),[u,d,p]=xe(),[y,f,h]=xe(n),b=(t,e)=>{h(t,e),p(t,e)},[g,w,m,$,S,k,M]=Kn(t,a,({vn:t,It:e},{Zt:n,tn:r})=>{const{_t:o,Ct:s,$t:i,xt:c,Ht:l,ft:a}=n,{nn:u,sn:d,en:p,cn:y}=r;b("updated",[T,{updateHints:{sizeChanged:!!o,directionChanged:!!s,heightIntrinsicChanged:!!i,overflowEdgeChanged:!!u,overflowAmountChanged:!!d,overflowStyleChanged:!!p,scrollCoordinatesChanged:!!y,contentMutation:!!c,hostMutation:!!l,appear:!!a},changedOptions:t||{},force:!!e}])},t=>b("scroll",[T,t])),D=t=>{const{gn:e}=S(),{pn:n}=e;n||((t=>{Bn.delete(t)})(s),V(i),b("destroyed",[T,t]),d(),f())},O=t=>w({It:t,zt:!0}),T={options(t,e){if(t){const n=e?r():{},o=wn(a,at(n,l(t)));dt(o)||(at(a,o),w({vn:o}))}return at({},a)},on:y,off:(t,e)=>{t&&e&&f(t,e)},state(){const{gn:t,hn:e,bn:n}=S(),{pn:r,Kt:o}=t,{B:s}=e,{Vt:i,Rt:c,rn:l,j:a,ln:u,_n:d,Tt:p}=n;return at({},{overflowEdge:i,overflowAmount:c,overflowStyle:l,hasOverflow:a,scrollCoordinates:{start:p.T,end:p.k},padding:u,paddingAbsolute:d,directionRTL:s,sleeping:o,destroyed:r})},elements(){const{dt:t,vt:e,ln:n,L:r,ht:o,gt:s,Qt:i}=k.yn,{jt:c,Jt:l}=k.wn,a=t=>{const{kt:e,Pt:n,Lt:r}=t;return{scrollbar:r,track:n,handle:e}},u=t=>{const{Xt:e,Yt:n}=t,r=a(e[0]);return at({},r,{clone:()=>{const t=a(n());return $(),t}})};return at({},{target:t,host:e,padding:n||r,viewport:r,content:o||r,scrollOffsetElement:s,scrollEventElement:i,scrollbarHorizontal:u(c),scrollbarVertical:u(l)})},update:O,destroy:rt(D,!1),sleep:m,plugin:t=>c[lt(t)[0]]};return A(i,[M]),((t,e)=>{Bn.set(t,e)})(s,T),we(be,Nn,[T,u,c]),((t,e)=>{const{nativeScrollbarsOverlaid:n,body:r}=e||{},{M:o,P:s,K:i}=Mn(),{nativeScrollbarsOverlaid:c,body:l}=i().cancel,a=null!=n?n:c,u=v(r)?l:r,d=(o.x||o.y)&&a,p=t&&(x(u)?!s:u);return!!d||!!p})(k.yn.bt,!o&&t.cancel)?(D(!0),T):(A(i,g()),b("initialized",[T]),T.update(),T)}return i};Nn.plugin=t=>{const e=$(t),n=e?t:[t],r=n.map(t=>we(t,Nn)[0]);return(t=>{L(t,t=>L(t,(e,n)=>{be[n]=t[n]}))})(n),e?r:r[0]},Nn.valid=t=>{const e=t&&t.elements,n=m(e)&&e();return M(n)&&!!Fn(n.target)},Nn.env=()=>{const{U:t,M:e,P:n,J:r,ot:o,st:s,K:i,Z:c,tt:l,nt:a}=Mn();return at({},{scrollbarsSize:t,scrollbarsOverlaid:e,scrollbarsHiding:n,scrollTimeline:r,staticDefaultInitialization:o,staticDefaultOptions:s,getDefaultInitialization:i,setDefaultInitialization:c,getDefaultOptions:l,setDefaultOptions:a})},Nn.nonce=t=>{$n=t},Nn.trustedTypePolicy=t=>{Et=t};export{fn as ClickScrollPlugin,Nn as OverlayScrollbars,pn as ScrollbarsHidingPlugin,sn as SizeObserverPlugin};export default null;
//# sourceMappingURL=/sm/3d18db347d530259811999b5f884e3665fe9485f0959a07613c41be2c338d0bd.map

/* ═══════════════════════════════════════════
   INIT GGSTATIC
═══════════════════════════════════════════ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  onDisconnect,
  runTransaction
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

/* ═══════════════════════════════════════════
   INIT FIREBASE
═══════════════════════════════════════════ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  onDisconnect,
  runTransaction
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBRj2MmECUYqeISLB-y4nR8Y0k3bv5q5g8",
  authDomain: "portfolio-60614.firebaseapp.com",
  databaseURL: "https://portfolio-60614-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "portfolio-60614",
  storageBucket: "portfolio-60614.firebasestorage.app",
  messagingSenderId: "296651632810",
  appId: "1:296651632810:web:bcbb692921ee27497ce0d3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ═══════════════════════════════════════════
   IDS / SESSION
═══════════════════════════════════════════ */

const sessionId = crypto.randomUUID();

/**
 * Hash navigateur (UserAgent + dimensions)
 * Pas d'IP, compatible GitHub Pages
 */
async function getVisitorHash() {
  const raw = navigator.userAgent + screen.width + screen.height;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

const onlineRef = ref(db, `analytics/online/${sessionId}`);
const sessionRef = ref(db, `analytics/sessions/${sessionId}`);
const visitsRef = ref(db, `analytics/visits_total`);

/* ═══════════════════════════════════════════
   GÉOLOCALISATION — timezone + langue + IP
   ─────────────────────────────────────────
   IP récupérée via ifconfig.me (open source).
   Combinée avec timezone IANA + langue nav.
   ⚠ Mentionner la collecte d'IP dans ta page RGPD.
═══════════════════════════════════════════ */

async function getGeoInfo() {
  let ip = null;
  try {
    const res = await fetch("https://ifconfig.me/ip", {
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      ip = (await res.text()).trim();
    }
  } catch {
    // silencieux si bloqué ou offline
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const language = navigator.language || navigator.languages?.[0] || "";

  // Déduction du pays depuis le timezone IANA
  const TZ_TO_COUNTRY = {
    "Europe/Paris": "FR",
    "Europe/London": "GB",
    "Europe/Berlin": "DE",
    "Europe/Madrid": "ES",
    "Europe/Rome": "IT",
    "Europe/Amsterdam": "NL",
    "Europe/Brussels": "BE",
    "Europe/Zurich": "CH",
    "Europe/Vienna": "AT",
    "Europe/Warsaw": "PL",
    "Europe/Prague": "CZ",
    "Europe/Budapest": "HU",
    "Europe/Bucharest": "RO",
    "Europe/Sofia": "BG",
    "Europe/Helsinki": "FI",
    "Europe/Stockholm": "SE",
    "Europe/Oslo": "NO",
    "Europe/Copenhagen": "DK",
    "Europe/Lisbon": "PT",
    "Europe/Athens": "GR",
    "Europe/Dublin": "IE",
    "Europe/Kiev": "UA",
    "Europe/Moscow": "RU",
    "Europe/Istanbul": "TR",
    "America/New_York": "US",
    "America/Chicago": "US",
    "America/Denver": "US",
    "America/Los_Angeles": "US",
    "America/Toronto": "CA",
    "America/Vancouver": "CA",
    "America/Montreal": "CA",
    "America/Mexico_City": "MX",
    "America/Sao_Paulo": "BR",
    "America/Argentina/Buenos_Aires": "AR",
    "America/Bogota": "CO",
    "America/Lima": "PE",
    "America/Santiago": "CL",
    "Asia/Tokyo": "JP",
    "Asia/Shanghai": "CN",
    "Asia/Hong_Kong": "HK",
    "Asia/Seoul": "KR",
    "Asia/Singapore": "SG",
    "Asia/Kolkata": "IN",
    "Asia/Dubai": "AE",
    "Asia/Bangkok": "TH",
    "Asia/Jakarta": "ID",
    "Asia/Karachi": "PK",
    "Asia/Dhaka": "BD",
    "Asia/Taipei": "TW",
    "Australia/Sydney": "AU",
    "Australia/Melbourne": "AU",
    "Australia/Perth": "AU",
    "Pacific/Auckland": "NZ",
    "Africa/Cairo": "EG",
    "Africa/Lagos": "NG",
    "Africa/Johannesburg": "ZA",
    "Africa/Nairobi": "KE",
    "Africa/Casablanca": "MA"
  };

  const COUNTRY_NAMES = {
    FR: "France",
    GB: "United Kingdom",
    DE: "Germany",
    ES: "Spain",
    IT: "Italy",
    NL: "Netherlands",
    BE: "Belgium",
    CH: "Switzerland",
    AT: "Austria",
    PL: "Poland",
    CZ: "Czech Republic",
    HU: "Hungary",
    RO: "Romania",
    BG: "Bulgaria",
    FI: "Finland",
    SE: "Sweden",
    NO: "Norway",
    DK: "Denmark",
    PT: "Portugal",
    GR: "Greece",
    IE: "Ireland",
    UA: "Ukraine",
    RU: "Russia",
    TR: "Turkey",
    US: "United States",
    CA: "Canada",
    MX: "Mexico",
    BR: "Brazil",
    AR: "Argentina",
    CO: "Colombia",
    PE: "Peru",
    CL: "Chile",
    JP: "Japan",
    CN: "China",
    HK: "Hong Kong",
    KR: "South Korea",
    SG: "Singapore",
    IN: "India",
    AE: "UAE",
    TH: "Thailand",
    ID: "Indonesia",
    PK: "Pakistan",
    BD: "Bangladesh",
    TW: "Taiwan",
    AU: "Australia",
    NZ: "New Zealand",
    EG: "Egypt",
    NG: "Nigeria",
    ZA: "South Africa",
    KE: "Kenya",
    MA: "Morocco"
  };

  const countryCode = TZ_TO_COUNTRY[timezone] || language.split("-")[1] || "??";
  const country = COUNTRY_NAMES[countryCode] || "Unknown";

  return { countryCode, country, timezone, language, ip };
}

/* ═══════════════════════════════════════════
   VISITE UNIQUE
═══════════════════════════════════════════ */

async function registerVisit() {
  const visitorHash = await getVisitorHash();
  const visitorRef = ref(db, `analytics/unique_visitors/${visitorHash}`);
  const snap = await get(visitorRef);

  if (!snap.exists()) {
    const geo = await getGeoInfo();

    await set(visitorRef, {
      firstSeen: Date.now(),
      countryCode: geo.countryCode,
      country: geo.country,
      timezone: geo.timezone,
      language: geo.language,
      ...(geo.ip && { ip: geo.ip })
    });

    await runTransaction(visitsRef, v => (v || 0) + 1);

    // Compteur agrégé par pays : analytics/geo/<countryCode>
    if (geo.countryCode !== "??") {
      const geoRef = ref(db, `analytics/geo/${geo.countryCode}`);
      await runTransaction(geoRef, v => (v || 0) + 1);
    }
  }
}

/* ═══════════════════════════════════════════
   SESSION
═══════════════════════════════════════════ */

async function startSession() {
  await set(sessionRef, { start: Date.now(), page: location.href, active: true });
  onDisconnect(sessionRef).update({ end: Date.now(), active: false });
}

/* ═══════════════════════════════════════════
   ONLINE HEARTBEAT
═══════════════════════════════════════════ */

function startHeartbeat() {
  const ping = () => set(onlineRef, { lastPing: Date.now() });
  ping();
  setInterval(ping, 8000);
  onDisconnect(onlineRef).remove();
}

/* ═══════════════════════════════════════════
   ONLINE COUNT
═══════════════════════════════════════════ */

function listenOnline() {
  onValue(ref(db, "analytics/online"), snapshot => {
    const data = snapshot.val() || {};
    const now = Date.now();
    const active = Object.values(data).filter(u => now - u.lastPing < 20000);
    const el = document.getElementById("online-count");
    if (el) {
      el.textContent = active.length;
    }
  });
}

/* ═══════════════════════════════════════════
   VISITS COUNT
═══════════════════════════════════════════ */

function listenVisits() {
  const el = document.getElementById("visits");
  onValue(visitsRef, snap => {
    if (el) {
      el.textContent = snap.val() || 0;
    }
  });
}

/* ═══════════════════════════════════════════
   EMAIL OBFUSCATION
   Le HTML porte data-user / data-domain.
   On reconstruit l'adresse ici, jamais dans le HTML brut.
═══════════════════════════════════════════ */

function revealEmail() {
  const el = document.getElementById("contact-email");
  if (!el) return;
  
  const addr = el.dataset.user + "\u0040" + el.dataset.domain;
  el.href = "mailto:" + addr;
  el.textContent = addr;
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */

(async function init() {
  await registerVisit();
  await startSession();
  startHeartbeat();
  listenOnline();
  listenVisits();
  revealEmail();
})();

/* ═══════════════════════════════════════════
   MATRIX RAIN
═══════════════════════════════════════════ */

const canvas = document.getElementById("matrix");

if (canvas) {
  const ctx = canvas.getContext("2d");
  const CHARS = "スシシャリノリサーモンマグロエビアボカドキュウリワサビショウユガリマキギリタテ1234567890><{}[]|/\\\\";

  let cols, drops, fontSize;

  function initMatrix() {
    fontSize = 14;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / fontSize);
    drops = Array.from({ length: cols }, () => Math.random() * -100);
  }

  function drawMatrix() {
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px "Minecraft", monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const y = drops[i] * fontSize;

      if (y > 0 && y < canvas.height) {
        ctx.fillStyle = "#ccffcc";
        ctx.shadowColor = "#00ff41";
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = "#00ff41";
        ctx.shadowColor = "#00ff41";
        ctx.shadowBlur = 4;
      }

      ctx.fillText(char, i * fontSize, y);
      ctx.shadowBlur = 0;

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += 0.5;
    }
  }

  initMatrix();
  window.addEventListener("resize", initMatrix);
  setInterval(drawMatrix, 40);
}

/* ═══════════════════════════════════════════
   WORK EXPERIENCE — SCROLL INFINI
═══════════════════════════════════════════ */

const track = document.querySelector(".work-track");

if (track) {
  let x = 0, isDown = false, startX = 0;
  const speed = 0.6;
  let loopWidth = track.scrollWidth / 2;

  track.addEventListener("mousedown", e => {
    isDown = true;
    startX = e.clientX - x;
    track.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", e => {
    if (!isDown) return;
    x = e.clientX - startX;
    normalizeLoop();
    track.style.transform = `translateX(${x}px)`;
  });

  window.addEventListener("mouseup", stopDrag);

  track.addEventListener("touchstart", e => {
    isDown = true;
    startX = e.touches[0].clientX - x;
  }, { passive: false });

  window.addEventListener("touchmove", e => {
    if (!isDown) return;
    e.preventDefault();
    x = e.touches[0].clientX - startX;
    normalizeLoop();
    track.style.transform = `translateX(${x}px)`;
  }, { passive: false });

  window.addEventListener("touchend", stopDrag);

  function stopDrag() {
    isDown = false;
    track.style.cursor = "grab";
  }

  function normalizeLoop() {
    if (x <= -loopWidth) {
      x += loopWidth;
    }
    if (x >= 0) {
      x -= loopWidth;
    }
  }

  function animate() {
    if (!isDown) {
      x -= speed;
      normalizeLoop();
      track.style.transform = `translateX(${x}px)`;
    }
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", () => {
    loopWidth = track.scrollWidth / 2;
  });
  animate();
}

/* ═══════════════════════════════════════════
   TERMINAL TYPEWRITER
═══════════════════════════════════════════ */

const LINES = [
  "> initializing profile...",
  "",
  "> status     : Open to opportunities",
  "> interests  : design, web security, reverse engineering, continuous learning",
  "> education  : Baccalaureate in Science and Technology of Industry and Sustainable Development, and studies in Optical Eyewear BTS and BTS CIEL Option B (Electronics and Networks).",
  "> hobbies    : nature, art, literature, cinema, music, animation, science",
  "",
  "> system ready_"
];

const output = document.getElementById("terminal-output");
let lineIndex = 0;
let charIndex = 0;
const term = document.getElementById("terminal");

function isNearBottom(el) {
  return (el.scrollHeight - el.scrollTop - el.clientHeight < 30);
}

function typeLine() {
  const shouldAutoScroll = isNearBottom(term);

  if (lineIndex >= LINES.length) {
    if (shouldAutoScroll) {
      term.scrollTop = term.scrollHeight;
    }
    return;
  }

  const line = document.createElement("div");
  line.classList.add("line");

  const text = document.createElement("span");
  const cursor = document.createElement("span");
  cursor.classList.add("cursor");

  line.append(text, cursor);
  output.appendChild(line);

  const currentLine = LINES[lineIndex];

  function typeChar() {
    if (charIndex < currentLine.length) {
      text.textContent += currentLine[charIndex++];

      if (shouldAutoScroll) {
        term.scrollTop = term.scrollHeight;
      }

      setTimeout(typeChar, 18 + Math.random() * 35);
      return;
    }

    cursor.remove();
    lineIndex++;
    charIndex = 0;

    setTimeout(typeLine, 110);
  }

  typeChar();
}

window.addEventListener("load", () => {
  setTimeout(typeLine, 600);
});

/* ═══════════════════════════════════════════
   ACTIVE NAV ON SCROLL
═══════════════════════════════════════════ */

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(sec => {
    if (scrollY >= sec.offsetTop - 60) {
      current = sec.id;
    }
  });
  navLinks.forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
}, { passive: true });

/* ═══════════════════════════════════════════
   PROJECTS DATABASE
═══════════════════════════════════════════ */

const PROJECTS = [
  {
    category: "developpement",
    icon: "◈",
    color: "#00ff41",
    projects: [
      {
        name: "Web Language",
        desc: "All projects in language for the Web.",
        tags: ["javascript", "wasm", "html", "css"],
        link: "Projects/Javascript_Language/Js.html",
        status: "done",
        date: "2023"
      },
      {
        name: "C Language",
        desc: "All projects in C.",
        tags: ["C", "SDL3", "MinGW", "embscripte"],
        link: "Projects/Language_C/Language_C.html",
        status: "done",
        date: "2024"
      }
    ]
  },
  {
    category: "electronics",
    icon: "◆",
    color: "#00ccff",
    projects: [
      {
        name: "Mini Piano PCB",
        desc: "",
        tags: ["KiCad", "PCB", "Hertz"],
        status: "wip",
        date: "2024"
      },
      {
        name: "Arroseur PCB",
        desc: "",
        tags: ["KiCad", "PCB", "STM32"],
        status: "wip",
        date: "2025"
      },
      {
        name: "Etiquette PCB",
        desc: "",
        tags: ["Kicad", "CODE39"],
        link: "https://github.com/luco667",
        status: "wip",
        date: "2026"
      }
    ]
  },
  {
    category: "cybersecurity",
    icon: "⬢",
    color: "#ffcc00",
    projects: [
      {
        name: "Empty",
        desc: "",
        tags: [],
        link: "",
        status: "wip",
        date: "2026"
      }
    ]
  },
  {
    category: "network",
    icon: "▣",
    color: "#ff4466",
    projects: [
      {
        name: "Proxy",
        desc: "Routeur proxy anti-pub.",
        tags: ["OSI"],
        status: "wip",
        date: "2026"
      }
    ]
  },
  {
    category: "miscellaneous",
    icon: "⧉",
    color: "#812bd5",
    projects: [
      {
        name: "Empty",
        desc: "",
        tags: [],
        link: "https://github.com/luco667",
        status: "wip",
        date: "2026"
      }
    ]
  }
];

/* ═══════════════════════════════════════════
   PROJECTS RENDERER — DOM manuel, anti-XSS
═══════════════════════════════════════════ */

(function renderProjects() {
  const STATUS_LABEL = Object.freeze({
    done: { text: "done", color: "#00ff41" },
    wip: { text: "in progress", color: "#ffcc00" },
    archived: { text: "archived", color: "#888" }
  });

  function el(tag, props = {}, text = "") {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === "class") {
        node.className = v;
      } else if (k === "style") {
        Object.assign(node.style, v);
      } else {
        node.setAttribute(k, v);
      }
    });
    if (text) {
      node.textContent = text;
    }
    return node;
  }

  const section = document.querySelector("#projects");
  if (!section) return;

  const grid = el("div", { class: "projects-grid" });

  PROJECTS.forEach(cat => {
    const card = el("div", { class: "cat-card" });
    card.style.setProperty("--cat-color", cat.color);
    card.dataset.category = cat.category;

    const header = el("div", { class: "cat-header" });
    const icon = el("span", { class: "cat-icon" });
    icon.textContent = cat.icon;
    const name = el("div", { class: "cat-name" });
    name.textContent = `./${cat.category}/`;
    header.appendChild(icon);
    header.appendChild(name);

    const count = cat.projects.length;
    const counter = el("div", { class: `cat-count${count > 0 ? " has-projects" : ""}` });
    counter.textContent = count > 0 ? `${count} project${count > 1 ? "s" : ""}` : "empty";

    card.appendChild(header);
    card.appendChild(counter);

    card.addEventListener("click", () => {
      document.querySelectorAll(".cat-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      openModal(cat);
    });

    grid.appendChild(card);
  });

  section.appendChild(grid);

  const overlay = el("div", { id: "proj-overlay" });
  const modal = el("div", { id: "proj-modal" });
  const mHeader = el("div", { class: "modal-header" });
  const modalTitle = el("div", { id: "modal-title", class: "modal-title" });
  const closeBtn = el("button", { class: "modal-close", id: "modal-close", "aria-label": "Fermer" });
  closeBtn.textContent = "✕";
  const modalBody = el("div", { class: "modal-body", id: "modal-body" });

  mHeader.appendChild(modalTitle);
  mHeader.appendChild(closeBtn);
  modal.appendChild(mHeader);
  modal.appendChild(modalBody);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", e => {
    if (e.target === overlay) {
      closeModal();
    }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeModal();
    }
  });
  modalBody.addEventListener("wheel", e => e.stopPropagation(), { passive: true });

  function openModal(cat) {
    overlay.style.setProperty("--modal-color", cat.color);
    modalTitle.textContent = `> ${cat.icon} ${cat.category}/`;
    modalBody.replaceChildren();

    if (cat.projects.length === 0) {
      const empty = el("div", { class: "empty-state" });
      empty.textContent = "> no projects yet_";
      modalBody.appendChild(empty);
    } else {
      cat.projects.forEach(p => {
        const s = p.status ? STATUS_LABEL[p.status] : null;
        const item = el("div", { class: "proj-item" });

        const top = el("div", { class: "proj-top" });
        const nameDiv = el("div", { class: "proj-name" });
        nameDiv.appendChild(document.createTextNode("> "));

        if (p.link && isSafeUrl(p.link)) {
          const a = el("a", { href: p.link, target: "_blank", rel: "noopener noreferrer", referrerpolicy: "no-referrer" });
          a.textContent = p.name;
          nameDiv.appendChild(a);
        } else {
          nameDiv.appendChild(document.createTextNode(p.name));
        }

        const meta = el("div", { class: "proj-meta" });
        if (p.date) {
          const d = el("span", { class: "proj-date" });
          d.textContent = p.date;
          meta.appendChild(d);
        }
        if (s) {
          const sp = el("span", { class: "proj-status" });
          sp.style.color = s.color;
          sp.style.borderColor = s.color + "33";
          sp.textContent = s.text;
          meta.appendChild(sp);
        }

        top.appendChild(nameDiv);
        top.appendChild(meta);

        const desc = el("div", { class: "proj-desc" });
        desc.textContent = p.desc;

        item.appendChild(top);
        item.appendChild(desc);

        if (p.tags && p.tags.length > 0) {
          const tagsDiv = el("div", { class: "proj-tags" });
          p.tags.forEach(t => {
            if (!t) return;
            const tag = el("span", { class: "proj-tag" });
            tag.textContent = "#" + t;
            tagsDiv.appendChild(tag);
          });
          item.appendChild(tagsDiv);
        }

        modalBody.appendChild(item);
      });
    }

    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    document.querySelectorAll(".cat-card").forEach(c => c.classList.remove("active"));
  }

  function isSafeUrl(url) {
    try {
      const u = new URL(url, location.origin);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return /^[^:]*$/.test(url);
    }
  }
})();
