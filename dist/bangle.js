!function(e){var r={};function t(n){if(r[n])return r[n].exports;var a=r[n]={i:n,l:!1,exports:{}};return e[n].call(a.exports,a,a.exports,t),a.l=!0,a.exports}t.m=e,t.c=r,t.d=function(e,r,n){t.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:n})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,r){if(1&r&&(e=t(e)),8&r)return e;if(4&r&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(t.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&r&&"string"!=typeof e)for(var a in e)t.d(n,a,function(r){return e[r]}.bind(null,a));return n},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},t.p="",t(t.s=3)}([function(e,r,t){"use strict";function n(e){return(e+360)%360}function a(e){return Math.cos(e/180*Math.PI)}function l(e){return Math.sin(e/180*Math.PI)}function o(e){return Math.tan(e/180*Math.PI)}function i(e,r,t,n){return(t-e)*(t-e)+(n-r)*(n-r)}function u(e,r){return!(r.x>=0&&r.x<e[0].length&&r.y>=0&&r.y<e.length)}function c(e,r){return[{x:r.x-2,y:r.y},{x:r.x,y:r.y-2},{x:r.x+2,y:r.y},{x:r.x,y:r.y+2}].filter((function(r){return!u(e,r)&&-1===e[r.y][r.x]}))}function f(e,r){for(var t=new Array(r),n=0;n<r;n++){t[n]=new Array(e);for(var a=0;a<e;a++)t[n][a]=n%2==0||a%2==0?1:-1}var l,o,i,u=[],f={x:1,y:1};for(t[f.y][f.x]=0,u.push(f);u.length;)if((l=c(t,f=u.pop())).length){u.push(f);var y=l[(o=0,i=l.length-1,Math.floor(Math.random()*(i-o+1)+o))];t[(y.y+f.y)/2][(y.x+f.x)/2]=0,t[y.y][y.x]=0,u.push(y)}return t[1][1]=2,t[r-2][e-2]=3,t}t.d(r,"a",(function(){return n})),t.d(r,"b",(function(){return a})),t.d(r,"f",(function(){return l})),t.d(r,"g",(function(){return o})),t.d(r,"d",(function(){return i})),t.d(r,"e",(function(){return u})),t.d(r,"c",(function(){return f}))},function(e,r,t){"use strict";t.d(r,"a",(function(){return s}));var n,a,l,o=t(0),i=Object(o.c)(7,7),u=1===i[1][2]?90:0,c={mazeWidth:3,mazeHeight:3,screenWidth:240,screenHeight:160,viewAngleWidth:70,angleStep:7,playerStepSize:.1,mazeHorCells:7,mazeVerCells:7,playerX:1.5,playerY:1.5,maze:i,playerAngle:u,startGame:function(e){},stopGame:function(){}},f={"0000":!1,"0001":!0,"0010":!0,"0011":!1,"0100":!0,"0101":!1,"0110":!1,"0111":!0,1e3:!0,1001:!0,1010:!1,1011:!0,1100:!1,1101:!0,1110:!0,1111:!1},y=!0;function p(e,r,t){for(var n,a,l,u,f,y,p,d,g,s,h,b,x,M,v,j,w,O,m=Math.floor(e/90),A=0;!n||!a;)h=2===m||3===m,n||(l||(u=h?Math.floor(c.playerY):Math.floor(c.playerY)+1,l=c.playerX-(c.playerY-u)/Object(o.g)(e)),0===A||p||(d=h?-1:1,p=1/Object(o.g)(e)),x=l+(p||0)*A*(h?-1:1),M=u+(d||0)*A,v={x:Math.floor(x),y:Math.floor(M)+(h?-1:0)},Object(o.e)(i,v)||1===i[v.y][v.x]?(r&&t.drawDebugPixel(x,M),n={x:x,y:M}):r&&t.drawDebugPixel(x,M,"#FF0000")),b=0===m||3===m,a||(f||(f=b?Math.floor(c.playerX)+1:Math.floor(c.playerX),y=c.playerY-(c.playerX-f)*Object(o.g)(e)),0===A||g||(g=b?1:-1,s=Math.abs(Object(o.g)(e))*(h?-1:1)),j=f+(g||0)*A,w=y+(s||0)*A,O={x:Math.floor(j)+(b?0:-1),y:Math.floor(w)},Object(o.e)(i,O)||1===i[O.y][O.x]?(r&&t.drawDebugPixel(j,w),a={x:j,y:w}):r&&t.drawDebugPixel(j,w,"#FF0000")),A++;var P=Object(o.d)(c.playerX,c.playerY,n.x,n.y)<Object(o.d)(c.playerX,c.playerY,a.x,a.y)?n:a;if(r&&t.drawDebugPixel(P.x,P.y,"#00FF00"),t.drawDebugLine(c.playerX,c.playerY,P.x,P.y),!P)throw new Error("intersection is null");return P}function d(e,r){return 1===i[Math.floor(r)][Math.floor(e)]}function g(e,r){var t=c.playerX+e,n=c.playerY+r;return d(t,n)&&d(t=c.playerX,n=c.playerY+r)&&d(t=c.playerX+e,n=c.playerY)?void 0:(c.playerX=t,void(c.playerY=n))}c.startGame=function(e){y=!0,function e(r){r.BTN4.read()&&(c.playerAngle=Object(o.a)(c.playerAngle-c.angleStep));r.BTN5.read()&&(c.playerAngle=Object(o.a)(c.playerAngle+c.angleStep));var t,u,d,s,h;r.BTN1.read()&&(t=Math.floor(c.playerAngle/90),u=2===t||3===t,d=3===t||0===t,s=Math.abs(Object(o.b)(c.playerAngle)*c.playerStepSize)*(d?1:-1),h=Math.abs(Object(o.f)(c.playerAngle)*c.playerStepSize)*(u?-1:1),g(s,h));r.BTN2.read()&&(t=Math.floor(c.playerAngle/90),u=2===t||3===t,d=3===t||0===t,s=Math.abs(Object(o.b)(c.playerAngle)*c.playerStepSize)*(d?-1:1),h=Math.abs(Object(o.f)(c.playerAngle)*c.playerStepSize)*(u?1:-1),g(s,h));if(!y)return;n===c.playerX&&a===c.playerY&&l===c.playerAngle||(r.clear(),function(e){e.drawDebugGrid(i);for(var r=Object(o.a)(c.playerAngle-c.viewAngleWidth/2),t=c.viewAngleWidth/c.screenWidth,n=[],a=0;a<c.screenWidth;a+=1){var l=Object(o.a)(r+t*a),u=p(l,0===a||a>=c.screenWidth-1,e),y=Math.sqrt(Object(o.d)(c.playerX,c.playerY,u.x,u.y))*Object(o.b)(Object(o.a)(l-c.playerAngle));n.push({angle:l,collision:u,distance:y,shouldDrawWall:!1})}var d={};n.forEach((function(e){var r=Math.round(e.collision.x),t=Math.round(e.collision.y);d[r+";"+t]={x:r,y:t}}));var g=[];Object.keys(d).forEach((function(e){var r=d[e],t=i[r.y-1][r.x-1],n=i[r.y-1][r.x],a=i[r.y][r.x-1],l=i[r.y][r.x];f[(1===t?"1":"0")+(1===n?"1":"0")+(1===a?"1":"0")+(1===l?"1":"0")]&&g.push(r)})),g.forEach((function(e){var r=1e5,t=0;n.forEach((function(n,a){var l=Math.abs(e.x-n.collision.x)+Math.abs(e.y-n.collision.y);l<r&&(t=a,r=l)})),n[t].shouldDrawWall=!0})),n.forEach((function(r,t){var n=c.screenHeight/r.distance;r.shouldDrawWall?e.drawVerticalLine(t,Math.round((c.screenHeight-n)/2),Math.round((c.screenHeight-n)/2+n)):(e.drawPixel(t,Math.round((c.screenHeight-n)/2)),e.drawPixel(t,Math.round((c.screenHeight-n)/2+n)))}))}(r),r.flip());n=c.playerX,a=c.playerY,l=c.playerAngle,setTimeout((function(){return e(r)}),50)}(e)},c.stopGame=function(){y=!1};var s=c},,function(e,r,t){"use strict";t.r(r);var n=t(1);Bangle.setLCDMode("doublebuffered");var a={BTN1:BTN1,BTN2:BTN2,BTN3:BTN3,BTN4:BTN4,BTN5:BTN5,drawPixel:function(e,r,t){g.setPixel(e,r)},drawVerticalLine:function(e,r,t){g.drawLine(e,r,e,t)},clear:function(){g.clear()},flip:function(){g.flip()},drawDebugGrid:function(){},drawDebugLine:function(){},drawDebugPixel:function(){}};g.setFontAlign(0,-1),g.clear(),g.drawString("Press button 2 to start game ==>",120,(g.getHeight()-6)/2),console.log("starting maze runner"),function e(){BTN2.read()?(console.log("starting game"),n.a.startGame(a)):setTimeout(e,16)}()}]);
//# sourceMappingURL=bangle.js.map