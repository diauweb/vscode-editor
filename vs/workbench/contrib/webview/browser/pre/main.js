const isSafari=navigator.vendor&&navigator.vendor.indexOf("Apple")>-1&&navigator.userAgent&&navigator.userAgent.indexOf("CriOS")===-1&&navigator.userAgent.indexOf("FxiOS")===-1,isFirefox=navigator.userAgent&&navigator.userAgent.indexOf("Firefox")>=0,searchParams=new URL(location.toString()).searchParams,ID=searchParams.get("id"),onElectron=searchParams.get("platform")==="electron",expectedWorkerVersion=parseInt(searchParams.get("swVersion")),parentOrigin=searchParams.get("parentOrigin"),trackFocus=({onFocus:e,onBlur:t})=>{const n=250;let o=document.hasFocus();setInterval(()=>{const r=document.hasFocus();r!==o&&(o=r,r?e():t())},n)},getActiveFrame=()=>document.getElementById("active-frame"),getPendingFrame=()=>document.getElementById("pending-frame");function assertIsDefined(e){if(typeof e=="undefined"||e===null)throw new Error("Found unexpected null");return e}const vscodePostMessageFuncName="__vscode_post_message__",defaultStyles=document.createElement("style");defaultStyles.id="_defaultStyles",defaultStyles.textContent=`
	html {
		scrollbar-color: var(--vscode-scrollbarSlider-background) var(--vscode-editor-background);
	}

	body {
		background-color: transparent;
		color: var(--vscode-editor-foreground);
		font-family: var(--vscode-font-family);
		font-weight: var(--vscode-font-weight);
		font-size: var(--vscode-font-size);
		margin: 0;
		padding: 0 20px;
	}

	img {
		max-width: 100%;
		max-height: 100%;
	}

	a, a code {
		color: var(--vscode-textLink-foreground);
	}

	a:hover {
		color: var(--vscode-textLink-activeForeground);
	}

	a:focus,
	input:focus,
	select:focus,
	textarea:focus {
		outline: 1px solid -webkit-focus-ring-color;
		outline-offset: -1px;
	}

	code {
		color: var(--vscode-textPreformat-foreground);
	}

	blockquote {
		background: var(--vscode-textBlockQuote-background);
		border-color: var(--vscode-textBlockQuote-border);
	}

	kbd {
		color: var(--vscode-editor-foreground);
		border-radius: 3px;
		vertical-align: middle;
		padding: 1px 3px;

		background-color: hsla(0,0%,50%,.17);
		border: 1px solid rgba(71,71,71,.4);
		border-bottom-color: rgba(88,88,88,.4);
		box-shadow: inset 0 -1px 0 rgba(88,88,88,.4);
	}
	.vscode-light kbd {
		background-color: hsla(0,0%,87%,.5);
		border: 1px solid hsla(0,0%,80%,.7);
		border-bottom-color: hsla(0,0%,73%,.7);
		box-shadow: inset 0 -1px 0 hsla(0,0%,73%,.7);
	}

	::-webkit-scrollbar {
		width: 10px;
		height: 10px;
	}

	::-webkit-scrollbar-corner {
		background-color: var(--vscode-editor-background);
	}

	::-webkit-scrollbar-thumb {
		background-color: var(--vscode-scrollbarSlider-background);
	}
	::-webkit-scrollbar-thumb:hover {
		background-color: var(--vscode-scrollbarSlider-hoverBackground);
	}
	::-webkit-scrollbar-thumb:active {
		background-color: var(--vscode-scrollbarSlider-activeBackground);
	}`;function getVsCodeApiScript(e,t){const n=t?encodeURIComponent(t):void 0;return`
			globalThis.acquireVsCodeApi = (function() {
				const originalPostMessage = window.parent['${vscodePostMessageFuncName}'].bind(window.parent);
				const doPostMessage = (channel, data, transfer) => {
					originalPostMessage(channel, data, transfer);
				};

				let acquired = false;

				let state = ${t?`JSON.parse(decodeURIComponent("${n}"))`:void 0};

				return () => {
					if (acquired && !${e}) {
						throw new Error('An instance of the VS Code API has already been acquired');
					}
					acquired = true;
					return Object.freeze({
						postMessage: function(message, transfer) {
							doPostMessage('onmessage', { message, transfer }, transfer);
						},
						setState: function(newState) {
							state = newState;
							doPostMessage('do-update-state', JSON.stringify(newState));
							return newState;
						},
						getState: function() {
							return state;
						}
					});
				};
			})();
			delete window.parent;
			delete window.top;
			delete window.frameElement;
		`}const workerReady=new Promise((e,t)=>{if(!areServiceWorkersEnabled())return t(new Error("Service Workers are not enabled. Webviews will not work. Try disabling private/incognito mode."));const n=`service-worker.js${self.location.search}`;navigator.serviceWorker.register(n).then(async o=>{await navigator.serviceWorker.ready;const r=async d=>{if(d.data.channel==="version")return navigator.serviceWorker.removeEventListener("message",r),d.data.version===expectedWorkerVersion?e():(console.log(`Found unexpected service worker version. Found: ${d.data.version}. Expected: ${expectedWorkerVersion}`),console.log("Attempting to reload service worker"),o.unregister().then(()=>navigator.serviceWorker.register(n)).then(()=>navigator.serviceWorker.ready).finally(()=>{e()}))};navigator.serviceWorker.addEventListener("message",r);const a=()=>{assertIsDefined(navigator.serviceWorker.controller).postMessage({channel:"version"})},u=navigator.serviceWorker.controller;if(u&&u.scriptURL.endsWith(n))a();else{const d=()=>{navigator.serviceWorker.removeEventListener("controllerchange",d),a()};navigator.serviceWorker.addEventListener("controllerchange",d)}},o=>{t(new Error(`Could not register service workers: ${o}.`))})}),hostMessaging=new class{constructor(){this.handlers=new Map,window.addEventListener("message",t=>{if(t.origin!==parentOrigin){console.log(`skipping webview message due to mismatched origins: ${t.origin} ${parentOrigin}`);return}const n=t.data.channel,o=this.handlers.get(n);if(o)for(const r of o)r(t,t.data.args);else console.log("no handler for ",t)})}postMessage(t,n){window.parent.postMessage({target:ID,channel:t,data:n},parentOrigin)}onMessage(t,n){let o=this.handlers.get(t);o||(o=[],this.handlers.set(t,o)),o.push(n)}},unloadMonitor=new class{constructor(){this.confirmBeforeClose="keyboardOnly",this.isModifierKeyDown=!1,hostMessaging.onMessage("set-confirm-before-close",(e,t)=>{this.confirmBeforeClose=t}),hostMessaging.onMessage("content",(e,t)=>{this.confirmBeforeClose=t.confirmBeforeClose}),window.addEventListener("beforeunload",e=>{if(!onElectron)switch(this.confirmBeforeClose){case"always":return e.preventDefault(),e.returnValue="","";case"never":break;case"keyboardOnly":default:{if(this.isModifierKeyDown)return e.preventDefault(),e.returnValue="","";break}}})}onIframeLoaded(e){e.contentWindow.addEventListener("keydown",t=>{this.isModifierKeyDown=t.metaKey||t.ctrlKey||t.altKey}),e.contentWindow.addEventListener("keyup",()=>{this.isModifierKeyDown=!1})}};let firstLoad=!0,loadTimeout,styleVersion=0,pendingMessages=[];const initData={initialScrollProgress:void 0,styles:void 0,activeTheme:void 0,themeName:void 0};hostMessaging.onMessage("did-load-resource",(e,t)=>{navigator.serviceWorker.ready.then(n=>{assertIsDefined(n.active).postMessage({channel:"did-load-resource",data:t},t.data?.buffer?[t.data.buffer]:[])})}),hostMessaging.onMessage("did-load-localhost",(e,t)=>{navigator.serviceWorker.ready.then(n=>{assertIsDefined(n.active).postMessage({channel:"did-load-localhost",data:t})})}),navigator.serviceWorker.addEventListener("message",e=>{switch(e.data.channel){case"load-resource":case"load-localhost":hostMessaging.postMessage(e.data.channel,e.data);return}});const applyStyles=(e,t)=>{if(!!e&&(t&&(t.classList.remove("vscode-light","vscode-dark","vscode-high-contrast"),initData.activeTheme&&t.classList.add(initData.activeTheme),t.dataset.vscodeThemeKind=initData.activeTheme,t.dataset.vscodeThemeName=initData.themeName||""),initData.styles)){const n=e.documentElement.style;for(let o=n.length-1;o>=0;o--){const r=n[o];r&&r.startsWith("--vscode-")&&n.removeProperty(r)}for(const o of Object.keys(initData.styles))n.setProperty(`--${o}`,initData.styles[o])}},handleInnerClick=e=>{if(!e?.view?.document)return;const t=e.view.document.querySelector("base");for(const n of e.composedPath()){const o=n;if(o.tagName&&o.tagName.toLowerCase()==="a"&&o.href){if(o.getAttribute("href")==="#")e.view.scrollTo(0,0);else if(o.hash&&(o.getAttribute("href")===o.hash||t&&o.href===t.href+o.hash)){const r=o.hash.substr(1,o.hash.length-1);e.view.document.getElementById(decodeURIComponent(r))?.scrollIntoView()}else hostMessaging.postMessage("did-click-link",o.href.baseVal||o.href);e.preventDefault();return}}},handleAuxClick=e=>{if(!!e?.view?.document&&e.button===1)for(const t of e.composedPath()){const n=t;if(n.tagName&&n.tagName.toLowerCase()==="a"&&n.href){e.preventDefault();return}}},handleInnerKeydown=e=>{if(isUndoRedo(e)||isPrint(e)||isFindEvent(e))e.preventDefault();else if(isCopyPasteOrCut(e))if(onElectron)e.preventDefault();else return;hostMessaging.postMessage("did-keydown",{key:e.key,keyCode:e.keyCode,code:e.code,shiftKey:e.shiftKey,altKey:e.altKey,ctrlKey:e.ctrlKey,metaKey:e.metaKey,repeat:e.repeat})},handleInnerUp=e=>{hostMessaging.postMessage("did-keyup",{key:e.key,keyCode:e.keyCode,code:e.code,shiftKey:e.shiftKey,altKey:e.altKey,ctrlKey:e.ctrlKey,metaKey:e.metaKey,repeat:e.repeat})};function isCopyPasteOrCut(e){const t=e.ctrlKey||e.metaKey,n=e.shiftKey&&e.key.toLowerCase()==="insert";return t&&["c","v","x"].includes(e.key.toLowerCase())||n}function isUndoRedo(e){return(e.ctrlKey||e.metaKey)&&["z","y"].includes(e.key.toLowerCase())}function isPrint(e){return(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="p"}function isFindEvent(e){return(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="f"}let isHandlingScroll=!1;const handleWheel=e=>{isHandlingScroll||hostMessaging.postMessage("did-scroll-wheel",{deltaMode:e.deltaMode,deltaX:e.deltaX,deltaY:e.deltaY,deltaZ:e.deltaZ,detail:e.detail,type:e.type})},handleInnerScroll=e=>{if(isHandlingScroll)return;const t=e.target,n=e.currentTarget;if(!n||!t?.body)return;const o=n.scrollY/t.body.clientHeight;isNaN(o)||(isHandlingScroll=!0,window.requestAnimationFrame(()=>{try{hostMessaging.postMessage("did-scroll",o)}catch(r){}isHandlingScroll=!1}))};function onDomReady(e){document.readyState==="interactive"||document.readyState==="complete"?e():document.addEventListener("DOMContentLoaded",e)}function areServiceWorkersEnabled(){try{return!!navigator.serviceWorker}catch(e){return!1}}function toContentHtml(e){const t=e.options,n=e.contents,o=new DOMParser().parseFromString(n,"text/html");if(o.querySelectorAll("a").forEach(a=>{if(!a.title){const u=a.getAttribute("href");typeof u=="string"&&(a.title=u)}}),o.body.hasAttribute("role")||o.body.setAttribute("role","document"),t.allowScripts){const a=o.createElement("script");a.id="_vscodeApiScript",a.textContent=getVsCodeApiScript(t.allowMultipleAPIAcquire,e.state),o.head.prepend(a)}o.head.prepend(defaultStyles.cloneNode(!0)),applyStyles(o,o.body);const r=o.querySelector('meta[http-equiv="Content-Security-Policy"]');if(!r)hostMessaging.postMessage("no-csp-found");else try{const a=r.getAttribute("content");if(a){const u=a.replace(/(vscode-webview-resource|vscode-resource):(?=(\s|;|$))/g,e.cspSource);r.setAttribute("content",u)}}catch(a){console.error(`Could not rewrite csp: ${a}`)}return`<!DOCTYPE html>
`+o.documentElement.outerHTML}onDomReady(()=>{if(!document.body)return;hostMessaging.onMessage("styles",(t,n)=>{++styleVersion,initData.styles=n.styles,initData.activeTheme=n.activeTheme,initData.themeName=n.themeName;const o=getActiveFrame();!o||o.contentDocument&&applyStyles(o.contentDocument,o.contentDocument.body)}),hostMessaging.onMessage("focus",()=>{const t=getActiveFrame();if(!t||!t.contentWindow){window.focus();return}document.activeElement!==t&&t.contentWindow.focus()});let e=0;hostMessaging.onMessage("content",async(t,n)=>{const o=++e;try{await workerReady}catch(s){console.error(`Webview fatal error: ${s}`),hostMessaging.postMessage("fatal-error",{message:s+""});return}if(o!==e)return;const r=n.options,a=toContentHtml(n),u=styleVersion,d=getActiveFrame(),b=firstLoad;let g;if(firstLoad)firstLoad=!1,g=(s,i)=>{typeof initData.initialScrollProgress=="number"&&!isNaN(initData.initialScrollProgress)&&i.scrollY===0&&i.scroll(0,s.clientHeight*initData.initialScrollProgress)};else{const s=d&&d.contentDocument&&d.contentDocument.body?assertIsDefined(d.contentWindow).scrollY:0;g=(i,c)=>{c.scrollY===0&&c.scroll(0,s)}}const h=getPendingFrame();h&&(h.setAttribute("id",""),document.body.removeChild(h)),b||(pendingMessages=[]);const l=document.createElement("iframe");l.setAttribute("id","pending-frame"),l.setAttribute("frameborder","0");const f=new Set(["allow-same-origin","allow-pointer-lock"]);r.allowScripts&&(f.add("allow-scripts"),f.add("allow-downloads")),r.allowForms&&f.add("allow-forms"),l.setAttribute("sandbox",Array.from(f).join(" ")),isFirefox||l.setAttribute("allow",r.allowScripts?"clipboard-read; clipboard-write;":""),l.src=`./fake.html?id=${ID}`,l.style.cssText="display: block; margin: 0; overflow: hidden; position: absolute; width: 100%; height: 100%; visibility: hidden",document.body.appendChild(l);function v(s){setTimeout(()=>{s.open(),s.write(a),s.close(),k(l),u!==styleVersion&&applyStyles(s,s.body)},0)}if(!r.allowScripts&&isSafari){const s=setInterval(()=>{if(!l.parentElement){clearInterval(s);return}const i=assertIsDefined(l.contentDocument);i.readyState!=="loading"&&(clearInterval(s),v(i))},10)}else assertIsDefined(l.contentWindow).addEventListener("DOMContentLoaded",s=>{const i=s.target?s.target:void 0;v(assertIsDefined(i))});const p=(s,i)=>{s&&s.body&&g(s.body,i);const c=getPendingFrame();if(c&&c.contentDocument&&c.contentDocument===s){const m=document.hasFocus(),y=getActiveFrame();y&&document.body.removeChild(y),u!==styleVersion&&applyStyles(c.contentDocument,c.contentDocument.body),c.setAttribute("id","active-frame"),c.style.visibility="visible",i.addEventListener("scroll",handleInnerScroll),i.addEventListener("wheel",handleWheel),m&&i.focus(),pendingMessages.forEach(w=>{i.postMessage(w.message,window.origin,w.transfer)}),pendingMessages=[]}hostMessaging.postMessage("did-load")};function k(s){clearTimeout(loadTimeout),loadTimeout=void 0,loadTimeout=setTimeout(()=>{clearTimeout(loadTimeout),loadTimeout=void 0,p(assertIsDefined(s.contentDocument),assertIsDefined(s.contentWindow))},200);const i=assertIsDefined(s.contentWindow);i.addEventListener("load",function(c){const m=c.target;loadTimeout&&(clearTimeout(loadTimeout),loadTimeout=void 0,p(m,this))}),i.addEventListener("click",handleInnerClick),i.addEventListener("auxclick",handleAuxClick),i.addEventListener("keydown",handleInnerKeydown),i.addEventListener("keyup",handleInnerUp),i.addEventListener("contextmenu",c=>{c.defaultPrevented||(c.preventDefault(),hostMessaging.postMessage("did-context-menu",{clientX:c.clientX,clientY:c.clientY}))}),unloadMonitor.onIframeLoaded(s)}hostMessaging.postMessage("did-set-content",void 0)}),hostMessaging.onMessage("message",(t,n)=>{if(!getPendingFrame()){const r=getActiveFrame();if(r){assertIsDefined(r.contentWindow).postMessage(n.message,window.origin,n.transfer);return}}pendingMessages.push(n)}),hostMessaging.onMessage("initial-scroll-position",(t,n)=>{initData.initialScrollProgress=n}),hostMessaging.onMessage("execCommand",(t,n)=>{const o=getActiveFrame();!o||assertIsDefined(o.contentDocument).execCommand(n)}),hostMessaging.onMessage("find",(t,n)=>{const o=getActiveFrame();if(!o)return;const r=o.contentWindow.getSelection();r.collapse(r.anchorNode);const a=o.contentWindow.find(n.value,!1,n.previous,!0,!1,!1,!1);hostMessaging.postMessage("did-find",a)}),hostMessaging.onMessage("find-stop",(t,n)=>{const o=getActiveFrame();if(!!o&&!n.clearSelection){const r=o.contentWindow.getSelection();for(let a=0;a<r.rangeCount;a++)r.removeRange(r.getRangeAt(a))}}),trackFocus({onFocus:()=>hostMessaging.postMessage("did-focus"),onBlur:()=>hostMessaging.postMessage("did-blur")}),window[vscodePostMessageFuncName]=(t,n)=>{switch(t){case"onmessage":case"do-update-state":hostMessaging.postMessage(t,n);break}},hostMessaging.postMessage("webview-ready",{})});

//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/899d46d82c4c95423fb7e10e68eba52050e30ba3/core/vs/workbench/contrib/webview/browser/pre/main.js.map
