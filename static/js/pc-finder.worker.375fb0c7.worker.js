(()=>{"use strict";(()=>{const e={I:[[-1,0],[0,0],[1,0],[2,0]],O:[[0,1],[1,1],[0,0],[1,0]],T:[[0,1],[-1,0],[0,0],[1,0]],L:[[1,1],[-1,0],[0,0],[1,0]],J:[[-1,1],[-1,0],[0,0],[1,0]],Z:[[-1,1],[0,1],[0,0],[1,0]],S:[[0,1],[1,1],[-1,0],[0,0]]},t={I:[[[0,0],[-1,0],[2,0],[-1,0],[2,0]],[[-1,0],[0,0],[0,0],[0,1],[0,-2]],[[-1,1],[1,1],[-2,1],[1,0],[-2,0]],[[0,1],[0,1],[0,1],[0,-1],[0,2]]],O:[[[0,0]],[[0,-1]],[[-1,-1]],[[-1,0]]],T:[[[0,0],[0,0],[0,0],[0,0],[0,0]],[[0,0],[1,0],[1,-1],[0,2],[1,2]],[[0,0],[0,0],[0,0],[0,0],[0,0]],[[0,0],[-1,0],[-1,-1],[0,2],[-1,2]]],L:[[[0,0],[0,0],[0,0],[0,0],[0,0]],[[0,0],[1,0],[1,-1],[0,2],[1,2]],[[0,0],[0,0],[0,0],[0,0],[0,0]],[[0,0],[-1,0],[-1,-1],[0,2],[-1,2]]],J:[[[0,0],[0,0],[0,0],[0,0],[0,0]],[[0,0],[1,0],[1,-1],[0,2],[1,2]],[[0,0],[0,0],[0,0],[0,0],[0,0]],[[0,0],[-1,0],[-1,-1],[0,2],[-1,2]]],Z:[[[0,0],[0,0],[0,0],[0,0],[0,0]],[[0,0],[1,0],[1,-1],[0,2],[1,2]],[[0,0],[0,0],[0,0],[0,0],[0,0]],[[0,0],[-1,0],[-1,-1],[0,2],[-1,2]]],S:[[[0,0],[0,0],[0,0],[0,0],[0,0]],[[0,0],[1,0],[1,-1],[0,2],[1,2]],[[0,0],[0,0],[0,0],[0,0],[0,0]],[[0,0],[-1,0],[-1,-1],[0,2],[-1,2]]]},o=(e,t)=>{const o=Array.from({length:4},(()=>Array(10).fill("")));let r=Array(4).fill(0);const l=Array(4).fill(!1);for(let n of t){for(let e of n.blocks)o[e[1]+r[e[1]]][e[0]]=n.type;let t=r.slice();for(let n=3;n>=0;n--)if(!l[n]){let f=0;for(let t=0;t<10;t++)""===e[n][t]&&""===o[n][t]||f++;if(10===f){t.splice(n-r[n],1);for(let e=n-r[n];e<t.length;e++)t[e]++;t.push(t[t.length-1]),l[n]=!0}}r=t.slice()}return o},r=function(t){let o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0;return{blocks:e[t].map((e=>[o+e[0],r+e[1]])),type:t,perm:0,ox:o,oy:r}},l=(e,t,o)=>{const r=e.blocks.map((e=>[e[0]+t,e[1]+o]));return{...e,blocks:r,ox:e.ox+t,oy:e.oy+o}},n=(e,t)=>{const o=(t%4+4)%4;let r=e.blocks;for(let l=0;l<o;l++)r=r.map((t=>[t[1]-e.oy+e.ox,-(t[0]-e.ox)+e.oy]));return{...e,blocks:r,perm:(e.perm+o)%4}},f=(e,t)=>{for(let r of t.blocks){var o;if(void 0===(null===(o=e[r[1]])||void 0===o?void 0:o[r[0]])||e[r[1]][r[0]])return!0}return!1};function s(e,t){for(let r of t.blocks){var o;if(r[1]>=e.length&&0<=r[0]&&r[0]<10);else if(void 0===(null===(o=e[r[1]])||void 0===o?void 0:o[r[0]])||e[r[1]][r[0]])return!0}return!1}const i=(e,t,o)=>{let r=JSON.parse(JSON.stringify(e));for(let l of t)l[0]<10&&l[1]<4&&(r[l[1]][l[0]]=o);for(let l=0;l<r.length;l++)r[l].includes("")||(r.splice(l,1),l--);return r};function u(e,t){for(let r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:4;r<e.length;r++)for(let t of e[r])if(t)return!1;let o=0;for(let r of e)o+=r.reduce(((e,t)=>e+(""===t?1:0)),0);return o%4===0&&!(o/4>t.length)}function c(e,t){for(let o of t.blocks){if(0===o[1])return!0;if(e[o[1]-1][o[0]])return!0}return!1}function h(e,t){let o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:4,l=[];for(let s=0;s<4;s++){for(let i=0;i<10;i++)for(let u=0;u<o;u++){const o=n(r(t,i,u),s);!f(e,o)&&c(e,o)&&p(e,o,0)&&l.push(o)}if("O"===t&&s>0)break}return l}function p(e,o){let r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0;if(r>4)return!1;if(s(e,o))return!1;let f=!0;for(let t of o.blocks){if(!f)break;for(let o=0;o<e.length;o++){var i;if(null!==(i=e[t[1]+o])&&void 0!==i&&i[t[0]]){f=!1;break}}}if(f)return!0;if(p(e,l(o,0,1),r+1)||p(e,l(o,-1,0),r+1)||p(e,l(o,1,0),r+1))return!0;if("O"!==o.type)for(let u=1;u<4;u++)for(let f=0;f<5;f++){let i=(o.perm+u+4)%4,c=[t[o.type][i][f][0]-t[o.type][o.perm][f][0],t[o.type][i][f][1]-t[o.type][o.perm][f][1]];const h=n(l(o,-c[0],-c[1]),u);if(!s(e,h)){const f=t[h.type],i=n(h,4-u);for(let t=0;t<f[h.perm].length;t++){const n=[f[h.perm][t][0]-f[i.perm][t][0],f[h.perm][t][1]-f[i.perm][t][1]],u=l(i,n[0],n[1]);if(!s(e,u)){if(u.ox===o.ox&&u.oy===o.oy&&p(e,h,r+1))return!0;break}}}}return!1}function y(e,t,o){const r=[{blocks:e,queue:t,hold:o,history:[]}],l=[];for(;r.length>0;){const e=r.shift(),t=e.history.length>0?i(e.blocks,e.history[e.history.length-1].blocks,e.history[e.history.length-1].type):JSON.parse(JSON.stringify(e.blocks));if(0===t.length)l.push(e.history);else if(e.queue.length<=0&&null===e.hold);else{for(let o of h(t,e.queue[0],e.blocks.length))r.push({blocks:t,queue:e.queue.slice(1),hold:e.hold,history:[...e.history,o]});for(let o of h(t,e.hold,e.blocks.length))r.push({blocks:t,queue:e.queue.slice(1),hold:e.queue[0],history:[...e.history,o]})}}return l}onmessage=e=>{console.log("message received");const t=e.data;let r,l=[...t.queue];r=null!=t.hold?t.hold:l.shift();const n=t.b.reduce(((e,t,o)=>t.some((e=>""!==e))?o+1:e),0),f=JSON.parse(JSON.stringify(t.b)).slice(0,Math.max(n,4));let s;s=r&&0!==n?function(e,t,o){let r=[];for(let l=1;l<5;l++)u(e,t,l)&&(r=[...r,...y(e,t,o,l)]);return r}(f,l,r):[],s=function(e,t){let r=[],l=[];for(let n of t){let t=o(e,n),f=!1;for(let e of l)if(JSON.stringify(t)===JSON.stringify(e)){f=!0;break}f||(l.push(t),r.push(n))}return r}(f,s),postMessage(s),console.log("finished.")}})()})();
//# sourceMappingURL=pc-finder.worker.375fb0c7.worker.js.map