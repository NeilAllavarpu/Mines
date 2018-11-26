(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{11:function(e,t,n){e.exports=n(18)},16:function(e,t,n){},18:function(e,t,n){"use strict";n.r(t);var a=n(0),i=n.n(a),s=n(10),r=n.n(s),u=n(2),l=n(3),o=n(4),c=n(5),h=n(7),m=n(6),d=n(8),p=n(1),f=(n(16),-1),v=0,b=3,g=0,k=1,y=function(e){function t(e){var n;return Object(o.a)(this,t),(n=Object(h.a)(this,Object(m.a)(t).call(this,e))).start=Date.now(),n.state={seconds:0,last:Date.now()},requestAnimationFrame(n.updateTimer.bind(Object(p.a)(Object(p.a)(n)))),n}return Object(d.a)(t,e),Object(c.a)(t,[{key:"updateTimer",value:function(){this.setState(function(e){return{seconds:e.seconds+(Date.now()-e.last),last:Date.now()}},function(){!0===this.props.running&&requestAnimationFrame(this.updateTimer.bind(this))})}},{key:"resume",value:function(){this.setState({last:Date.now()},function(){requestAnimationFrame(this.updateTimer.bind(this))})}},{key:"render",value:function(){var e=Math.floor(this.state.seconds/1e3);return this.props.display?i.a.createElement("div",null,"Time: ",Math.floor(e/60),":",(e%60).toLocaleString(void 0,{minimumIntegerDigits:2})):null}}]),t}(a.Component);function C(e){var t=e.mine;return i.a.createElement("div",{className:"mine mineNum".concat(t.minesNear," ").concat(t.state!==k?"hidden":t.isMine?"mineLoss":""," ").concat(t.customClasses),onClick:e.handleClick,onContextMenu:e.handleRightClick},t.state!==g&&!(t.state===k&&!1===t.isMine&&0===t.minesNear)&&i.a.createElement("div",{className:"label"},t.state===k?t.isMine?"X":t.minesNear:t.state===g?"":"!"))}var w=function(e){function t(e){var n;Object(o.a)(this,t);var a=[];(n=Object(h.a)(this,Object(m.a)(t).call(this,e))).timer=i.a.createRef(),n.markedNum=0;for(var s=0;s<e.height;++s){a.push([]);for(var r=0;r<e.width;++r)a[s].push({state:g,isMine:!1,minesNear:0,customClasses:""})}return n.firstClick=!0,n.state={mines:a},n}return Object(d.a)(t,e),Object(c.a)(t,[{key:"getMinesToTest",value:function(e,t){var n=[];return e>0&&(t>0&&n.push([e-1,t-1]),n.push([e-1,t]),t<this.props.height-1&&n.push([e-1,t+1])),t>0&&n.push([e,t-1]),t<this.props.height-1&&n.push([e,t+1]),e<this.props.width-1&&(t>0&&n.push([e+1,t-1]),n.push([e+1,t]),t<this.props.height-1&&n.push([e+1,t+1])),n}},{key:"revealNear",value:function(e,t,n){var a=this.revealNear.bind(this),i=this.getMinesToTest(t,n),s=i.reduce(function(t,n){return t+(2===e[n[1]][n[0]].state?1:0)},0),r=null;if(e[n][t].minesNear===s){var u=!0;i.forEach(function(t){if(u){var n=e[t[1]][t[0]];if(n.state===g)if(n.state=k,n.isMine)r=t,n.customClasses="mineLossAutoClick";else{var i=a(e,t[0],t[1]);null===i.mineRevealed?e=i.mines:(u=!1,r=i.mineRevealed)}}})}return{mines:e,mineRevealed:r}}},{key:"validSquaresLeft",value:function(e){return e.reduce(function(e,t){return e+t.reduce(function(e,t){return e+(t.state===g&&!1===t.isMine?1:0)},0)},0)}},{key:"handleClick",value:function(e,t){var n=this;!0===this.firstClick?this.setState(function(n){for(var a=[],i=0;i<n.mines.length;++i)for(var s=0;s<n.mines[i].length;++s)s===e&&i===t||a.push([s,i]);for(var r=0;r<this.props.numMines;++r){var u=Math.floor(Math.random()*a.length),l=a[u];a.splice(u,1),n.mines[l[1]][l[0]].isMine=!0,this.getMinesToTest(l[0],l[1]).forEach(function(e){++n.mines[e[1]][e[0]].minesNear})}return{mines:n.mines}},function(){this.firstClick=!1,this.handleClick(e,t)}):this.props.playing===v&&2!==this.state.mines[t][e].state&&(this.state.mines[t][e].isMine?(this.props.updateState({playing:1}),this.setState(function(n){return n.mines[t][e].customClasses="mineLossClick",{mines:n.mines.map(function(e){return e.map(function(e){return Object(l.a)({},e,{state:!0!==e.isMine||2!==e.state?k:2,customClasses:"".concat(e.customClasses," ").concat(e.state===g&&"mineLossClick"!==e.customClasses?"after":"")})})})}})):this.setState(function(a){var i=a.mines;i[t][e].state=k;var s=n.revealNear(i,e,t);return null!==s.mineRevealed?(n.props.updateState({playing:1}),{mines:a.mines.map(function(e){return e.map(function(e){return Object(l.a)({},e,{customClasses:!1===e.isMine&&2===e.state?"falseMark":e.state===g&&"mineLossAutoClick"!==e.customClasses?"after":e.customClasses,state:!0!==e.isMine||2!==e.state?k:2})})})}):0===n.validSquaresLeft(s.mines)?(n.props.updateState({playing:2}),{mines:a.mines.map(function(e){return e.map(function(e){return Object(l.a)({},e,{state:!0===e.isMine?2:k})})})}):{mines:s.mines}}))}},{key:"handleRightClick",value:function(e,t){var n=this;if(this.props.playing===v){var a=this.state.mines[t][e];a.state!==k&&this.setState(function(i){return 2===a.state?(i.mines[t][e].state=g,--n.markedNum):(i.mines[t][e].state=2,++n.markedNum),{mines:i.mines}})}}},{key:"render",value:function(){var e=this,t=this.props,n=t.width,a=t.height,s=t.numMines,r=t.playing,u=!0===this.firstClick?0:100-100*this.validSquaresLeft(this.state.mines)/(a*n-s);return i.a.createElement("div",null," ",i.a.createElement(y,{running:r===v,display:r!==b,ref:function(t){return e.timer=t}}),r===b?i.a.createElement("div",null,"Paused",i.a.createElement("br",null),i.a.createElement("button",{onClick:function(){e.props.updateState({playing:v}),e.timer.resume()}},"Resume")):i.a.createElement("div",null,i.a.createElement("div",{className:"board",style:{marginLeft:(window.innerWidth-27*this.props.width)/2}},this.state.mines.map(function(t,n){return i.a.createElement("div",{className:"row",key:n},t.map(function(t,a){return i.a.createElement(C,{key:a,mine:t,handleClick:e.handleClick.bind(e,a,n),handleRightClick:function(t){t.preventDefault(),e.handleRightClick(a,n)}})}))})),i.a.createElement("div",{className:"status"},i.a.createElement("div",{className:2===r?"win":""},r===v?"Mines Left: ".concat(Math.max(this.props.numMines-this.markedNum,0)):2===r?"Good job!":"You lost!"),r===v&&i.a.createElement("div",null,"Progress:",i.a.createElement("div",{className:"bar"},i.a.createElement("div",{className:"innerBar",style:{width:"".concat(u,"%")}},Math.round(10*u)/10,"%")))),r!==v?i.a.createElement("button",{onClick:this.props.updateState.bind(this,{playing:f})},"Restart"):i.a.createElement("button",{onClick:this.props.updateState.bind(this,{playing:b})},"Pause")))}}]),t}(a.Component);function E(e){var t=e.handleInputChange,n=e.handleSubmit,a=e.height,s=e.numMines,r=e.width;return i.a.createElement("form",{onSubmit:n.bind(this)},i.a.createElement("label",null,"Board width ",i.a.createElement("input",{type:"number",min:1,max:window.innerWidth/25-6,value:r,onChange:t.bind(this,"width")})),i.a.createElement("label",null,"Board height ",i.a.createElement("input",{type:"number",min:1,value:a,onChange:t.bind(this,"height")})),i.a.createElement("label",null,"Number of mines ",i.a.createElement("input",{type:"number",min:1,max:r*a-1,value:s,onChange:t.bind(this,"numMines")})),i.a.createElement("input",{type:"submit",value:"Play!"}))}var M=function(e){function t(e){var n;Object(o.a)(this,t),(n=Object(h.a)(this,Object(m.a)(t).call(this,e))).state={playing:f,width:30,height:15,numMines:75};var a=Object(p.a)(Object(p.a)(n));return window.addEventListener("blur",function(){a.setState(function(e){return{playing:e.playing===v?b:e.playing}})},!1),n}return Object(d.a)(t,e),Object(c.a)(t,[{key:"updateState",value:function(e){this.setState(e)}},{key:"handleSubmit",value:function(e){e.preventDefault(),this.setState({playing:v})}},{key:"handleInputChange",value:function(e,t){this.setState(Object(u.a)({},e,t.target.value))}},{key:"render",value:function(){return i.a.createElement("div",null,this.state.playing!==f?i.a.createElement(w,{width:this.state.width,height:this.state.height,numMines:this.state.numMines,playing:this.state.playing,updateState:this.updateState.bind(this)}):i.a.createElement(E,{width:this.state.width,height:this.state.height,numMines:this.state.numMines,handleSubmit:this.handleSubmit.bind(this),handleInputChange:this.handleInputChange.bind(this)}))}}]),t}(a.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));r.a.render(i.a.createElement(M,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[11,2,1]]]);
//# sourceMappingURL=main.cf40ed7b.chunk.js.map