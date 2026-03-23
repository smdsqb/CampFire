(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[784],{5283:function(e,t,r){Promise.resolve().then(r.bind(r,8701))},8030:function(e,t,r){"use strict";r.d(t,{Z:function(){return l}});var n=r(2265);/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),c=function(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];return t.filter((e,t,r)=>!!e&&r.indexOf(e)===t).join(" ")};/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var a={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n.forwardRef)((e,t)=>{let{color:r="currentColor",size:s=24,strokeWidth:i=2,absoluteStrokeWidth:l,className:o="",children:u,iconNode:d,...x}=e;return(0,n.createElement)("svg",{ref:t,...a,width:s,height:s,stroke:r,strokeWidth:l?24*Number(i)/Number(s):i,className:c("lucide",o),...x},[...d.map(e=>{let[t,r]=e;return(0,n.createElement)(t,r)}),...Array.isArray(u)?u:[u]])}),l=(e,t)=>{let r=(0,n.forwardRef)((r,a)=>{let{className:l,...o}=r;return(0,n.createElement)(i,{ref:a,iconNode:t,className:c("lucide-".concat(s(e)),l),...o})});return r.displayName="".concat(e),r}},5137:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]])},5268:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("Bookmark",[["path",{d:"m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z",key:"1fy3hk"}]])},7583:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]])},1510:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("Share2",[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]])},9338:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("Star",[["polygon",{points:"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2",key:"8f66p6"}]])},6463:function(e,t,r){"use strict";var n=r(1169);r.o(n,"useParams")&&r.d(t,{useParams:function(){return n.useParams}}),r.o(n,"useRouter")&&r.d(t,{useRouter:function(){return n.useRouter}})},8701:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return m}});var n=r(7437),s=r(2265),c=r(6463),a=r(5137),i=r(9506),l=r(9842),o=r(8493),u=r(9354),d=r(1322),x=r(1814);function m(){let{name:e}=(0,c.useParams)(),t=(0,c.useRouter)(),[r,m]=(0,s.useState)(null),[f,h]=(0,s.useState)([]),[p,y]=(0,s.useState)(!0),[v,k]=(0,s.useState)("");return(0,s.useEffect)(()=>{y(!0),k(""),(0,l.PL)((0,l.IO)((0,l.hJ)(i.db,"camps"),(0,l.ar)("name","==",e))).then(e=>{e.empty||m({id:e.docs[0].id,...e.docs[0].data()})}).catch(e=>{var t;return k(null!==(t=null==e?void 0:e.message)&&void 0!==t?t:"Failed to load camp.")}).finally(()=>y(!1));let t=(0,o.kf)(e,"hot",e=>h(e));return()=>t()},[e]),(0,n.jsxs)("div",{className:"relative w-full min-h-dvh overflow-hidden",children:[(0,n.jsx)(d.default,{}),(0,n.jsx)("div",{className:"relative z-10 h-full overflow-y-auto touch-scroll safe-top",children:(0,n.jsxs)("div",{className:"max-w-2xl mx-auto px-4 py-6",children:[(0,n.jsxs)("button",{onClick:()=>t.back(),className:"flex items-center gap-2 text-[#A89880] hover:text-[#F97316] mb-6 transition-colors",children:[(0,n.jsx)(a.Z,{size:16})," Back"]}),r&&(0,n.jsx)("div",{className:"rounded-2xl border border-[#2E2820] p-5 mb-6",style:{background:"rgba(18,14,10,.92)",backdropFilter:"blur(16px)"},children:(0,n.jsxs)("div",{className:"flex items-center gap-4",children:[(0,n.jsx)("div",{className:"w-14 h-14 rounded-xl flex items-center justify-center text-3xl",style:{background:r.color},children:r.icon}),(0,n.jsxs)("div",{children:[(0,n.jsx)("div",{className:"font-serif text-xl font-semibold text-[#F5EFE8]",children:r.displayName}),(0,n.jsx)("div",{className:"text-sm text-[#6B5A4A] mt-0.5",children:r.description}),(0,n.jsxs)("div",{className:"text-xs text-[#F97316] mt-1",children:[(0,u.CZ)(r.memberCount)," members"]})]})]})}),(0,n.jsx)("div",{className:"flex flex-col gap-3",children:p?(0,n.jsx)("div",{className:"text-center py-12 text-[#F97316] animate-pulse",children:"\uD83D\uDD25 Loading camp..."}):v?(0,n.jsx)("div",{className:"text-center py-12 text-red-400",children:v}):0===f.length?(0,n.jsx)("div",{className:"text-center py-12 text-[#6B5A4A]",children:"No posts in this camp yet \uD83D\uDD25"}):f.map(e=>(0,n.jsx)(x.Z,{post:e},e.id))})]})})]})}}},function(e){e.O(0,[358,481,139,960,322,814,971,23,744],function(){return e(e.s=5283)}),_N_E=e.O()}]);