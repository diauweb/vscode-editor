/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BinarySizeStatusBarEntry = void 0;
const vscode = __webpack_require__(1);
const nls = __webpack_require__(3);
const ownedStatusBarEntry_1 = __webpack_require__(6);
const localize = nls.loadMessageBundle();
class BinarySize {
    static formatSize(size) {
        if (size < BinarySize.KB) {
            return localize('sizeB', "{0}B", size);
        }
        if (size < BinarySize.MB) {
            return localize('sizeKB', "{0}KB", (size / BinarySize.KB).toFixed(2));
        }
        if (size < BinarySize.GB) {
            return localize('sizeMB', "{0}MB", (size / BinarySize.MB).toFixed(2));
        }
        if (size < BinarySize.TB) {
            return localize('sizeGB', "{0}GB", (size / BinarySize.GB).toFixed(2));
        }
        return localize('sizeTB', "{0}TB", (size / BinarySize.TB).toFixed(2));
    }
}
BinarySize.KB = 1024;
BinarySize.MB = BinarySize.KB * BinarySize.KB;
BinarySize.GB = BinarySize.MB * BinarySize.KB;
BinarySize.TB = BinarySize.GB * BinarySize.KB;
class BinarySizeStatusBarEntry extends ownedStatusBarEntry_1.PreviewStatusBarEntry {
    constructor() {
        super('status.imagePreview.binarySize', localize('sizeStatusBar.name', "Image Binary Size"), vscode.StatusBarAlignment.Right, 100);
    }
    show(owner, size) {
        if (typeof size === 'number') {
            super.showItem(owner, BinarySize.formatSize(size));
        }
        else {
            this.hide(owner);
        }
    }
}
exports.BinarySizeStatusBarEntry = BinarySizeStatusBarEntry;


/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.config = exports.loadMessageBundle = void 0;
var ral_1 = __webpack_require__(4);
var common_1 = __webpack_require__(5);
var common_2 = __webpack_require__(5);
Object.defineProperty(exports, "MessageFormat", ({ enumerable: true, get: function () { return common_2.MessageFormat; } }));
Object.defineProperty(exports, "BundleFormat", ({ enumerable: true, get: function () { return common_2.BundleFormat; } }));
function loadMessageBundle(_file) {
    return function (key, message) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (typeof key === 'number') {
            throw new Error("Browser implementation does currently not support externalized strings.");
        }
        else {
            return common_1.localize.apply(void 0, __spreadArrays([key, message], args));
        }
    };
}
exports.loadMessageBundle = loadMessageBundle;
function config(options) {
    common_1.setPseudo((options === null || options === void 0 ? void 0 : options.locale.toLowerCase()) === 'pseudo');
    return loadMessageBundle;
}
exports.config = config;
ral_1.default.install(Object.freeze({
    loadMessageBundle: loadMessageBundle,
    config: config
}));
//# sourceMappingURL=main.js.map

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
var _ral;
function RAL() {
    if (_ral === undefined) {
        throw new Error("No runtime abstraction layer installed");
    }
    return _ral;
}
(function (RAL) {
    function install(ral) {
        if (ral === undefined) {
            throw new Error("No runtime abstraction layer provided");
        }
        _ral = ral;
    }
    RAL.install = install;
})(RAL || (RAL = {}));
exports.default = RAL;
//# sourceMappingURL=ral.js.map

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.config = exports.loadMessageBundle = exports.localize = exports.format = exports.setPseudo = exports.isPseudo = exports.isDefined = exports.BundleFormat = exports.MessageFormat = void 0;
var ral_1 = __webpack_require__(4);
var MessageFormat;
(function (MessageFormat) {
    MessageFormat["file"] = "file";
    MessageFormat["bundle"] = "bundle";
    MessageFormat["both"] = "both";
})(MessageFormat = exports.MessageFormat || (exports.MessageFormat = {}));
var BundleFormat;
(function (BundleFormat) {
    // the nls.bundle format
    BundleFormat["standalone"] = "standalone";
    BundleFormat["languagePack"] = "languagePack";
})(BundleFormat = exports.BundleFormat || (exports.BundleFormat = {}));
var LocalizeInfo;
(function (LocalizeInfo) {
    function is(value) {
        var candidate = value;
        return candidate && isDefined(candidate.key) && isDefined(candidate.comment);
    }
    LocalizeInfo.is = is;
})(LocalizeInfo || (LocalizeInfo = {}));
function isDefined(value) {
    return typeof value !== 'undefined';
}
exports.isDefined = isDefined;
exports.isPseudo = false;
function setPseudo(pseudo) {
    exports.isPseudo = pseudo;
}
exports.setPseudo = setPseudo;
function format(message, args) {
    var result;
    if (exports.isPseudo) {
        // FF3B and FF3D is the Unicode zenkaku representation for [ and ]
        message = '\uFF3B' + message.replace(/[aouei]/g, '$&$&') + '\uFF3D';
    }
    if (args.length === 0) {
        result = message;
    }
    else {
        result = message.replace(/\{(\d+)\}/g, function (match, rest) {
            var index = rest[0];
            var arg = args[index];
            var replacement = match;
            if (typeof arg === 'string') {
                replacement = arg;
            }
            else if (typeof arg === 'number' || typeof arg === 'boolean' || arg === void 0 || arg === null) {
                replacement = String(arg);
            }
            return replacement;
        });
    }
    return result;
}
exports.format = format;
function localize(_key, message) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return format(message, args);
}
exports.localize = localize;
function loadMessageBundle(file) {
    return ral_1.default().loadMessageBundle(file);
}
exports.loadMessageBundle = loadMessageBundle;
function config(opts) {
    return ral_1.default().config(opts);
}
exports.config = config;
//# sourceMappingURL=common.js.map

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PreviewStatusBarEntry = void 0;
const vscode = __webpack_require__(1);
const dispose_1 = __webpack_require__(7);
class PreviewStatusBarEntry extends dispose_1.Disposable {
    constructor(id, name, alignment, priority) {
        super();
        this.entry = this._register(vscode.window.createStatusBarItem(id, alignment, priority));
        this.entry.name = name;
    }
    showItem(owner, text) {
        this._showOwner = owner;
        this.entry.text = text;
        this.entry.show();
    }
    hide(owner) {
        if (owner === this._showOwner) {
            this.entry.hide();
            this._showOwner = undefined;
        }
    }
}
exports.PreviewStatusBarEntry = PreviewStatusBarEntry;


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports) => {


/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Disposable = exports.disposeAll = void 0;
function disposeAll(disposables) {
    while (disposables.length) {
        const item = disposables.pop();
        if (item) {
            item.dispose();
        }
    }
}
exports.disposeAll = disposeAll;
class Disposable {
    constructor() {
        this._isDisposed = false;
        this._disposables = [];
    }
    dispose() {
        if (this._isDisposed) {
            return;
        }
        this._isDisposed = true;
        disposeAll(this._disposables);
    }
    _register(value) {
        if (this._isDisposed) {
            value.dispose();
        }
        else {
            this._disposables.push(value);
        }
        return value;
    }
    get isDisposed() {
        return this._isDisposed;
    }
}
exports.Disposable = Disposable;


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PreviewManager = void 0;
const vscode = __webpack_require__(1);
const nls = __webpack_require__(3);
const dispose_1 = __webpack_require__(7);
const localize = nls.loadMessageBundle();
class PreviewManager {
    constructor(extensionRoot, sizeStatusBarEntry, binarySizeStatusBarEntry, zoomStatusBarEntry) {
        this.extensionRoot = extensionRoot;
        this.sizeStatusBarEntry = sizeStatusBarEntry;
        this.binarySizeStatusBarEntry = binarySizeStatusBarEntry;
        this.zoomStatusBarEntry = zoomStatusBarEntry;
        this._previews = new Set();
    }
    async openCustomDocument(uri) {
        return { uri, dispose: () => { } };
    }
    async resolveCustomEditor(document, webviewEditor) {
        const preview = new Preview(this.extensionRoot, document.uri, webviewEditor, this.sizeStatusBarEntry, this.binarySizeStatusBarEntry, this.zoomStatusBarEntry);
        this._previews.add(preview);
        this.setActivePreview(preview);
        webviewEditor.onDidDispose(() => { this._previews.delete(preview); });
        webviewEditor.onDidChangeViewState(() => {
            if (webviewEditor.active) {
                this.setActivePreview(preview);
            }
            else if (this._activePreview === preview && !webviewEditor.active) {
                this.setActivePreview(undefined);
            }
        });
    }
    get activePreview() { return this._activePreview; }
    setActivePreview(value) {
        this._activePreview = value;
        this.setPreviewActiveContext(!!value);
    }
    setPreviewActiveContext(value) {
        vscode.commands.executeCommand('setContext', 'imagePreviewFocus', value);
    }
}
exports.PreviewManager = PreviewManager;
PreviewManager.viewType = 'imagePreview.previewEditor';
class Preview extends dispose_1.Disposable {
    constructor(extensionRoot, resource, webviewEditor, sizeStatusBarEntry, binarySizeStatusBarEntry, zoomStatusBarEntry) {
        super();
        this.extensionRoot = extensionRoot;
        this.resource = resource;
        this.webviewEditor = webviewEditor;
        this.sizeStatusBarEntry = sizeStatusBarEntry;
        this.binarySizeStatusBarEntry = binarySizeStatusBarEntry;
        this.zoomStatusBarEntry = zoomStatusBarEntry;
        this.id = `${Date.now()}-${Math.random().toString()}`;
        this._previewState = 1 /* Visible */;
        this.emptyPngDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEElEQVR42gEFAPr/AP///wAI/AL+Sr4t6gAAAABJRU5ErkJggg==';
        const resourceRoot = resource.with({
            path: resource.path.replace(/\/[^\/]+?\.\w+$/, '/'),
        });
        webviewEditor.webview.options = {
            enableScripts: true,
            enableForms: false,
            localResourceRoots: [
                resourceRoot,
                extensionRoot,
            ]
        };
        this._register(webviewEditor.webview.onDidReceiveMessage(message => {
            switch (message.type) {
                case 'size':
                    {
                        this._imageSize = message.value;
                        this.update();
                        break;
                    }
                case 'zoom':
                    {
                        this._imageZoom = message.value;
                        this.update();
                        break;
                    }
                case 'reopen-as-text':
                    {
                        vscode.commands.executeCommand('vscode.openWith', resource, 'default', webviewEditor.viewColumn);
                        break;
                    }
            }
        }));
        this._register(zoomStatusBarEntry.onDidChangeScale(e => {
            if (this._previewState === 2 /* Active */) {
                this.webviewEditor.webview.postMessage({ type: 'setScale', scale: e.scale });
            }
        }));
        this._register(webviewEditor.onDidChangeViewState(() => {
            this.update();
            this.webviewEditor.webview.postMessage({ type: 'setActive', value: this.webviewEditor.active });
        }));
        this._register(webviewEditor.onDidDispose(() => {
            if (this._previewState === 2 /* Active */) {
                this.sizeStatusBarEntry.hide(this.id);
                this.binarySizeStatusBarEntry.hide(this.id);
                this.zoomStatusBarEntry.hide(this.id);
            }
            this._previewState = 0 /* Disposed */;
        }));
        const watcher = this._register(vscode.workspace.createFileSystemWatcher(resource.fsPath));
        this._register(watcher.onDidChange(e => {
            if (e.toString() === this.resource.toString()) {
                this.render();
            }
        }));
        this._register(watcher.onDidDelete(e => {
            if (e.toString() === this.resource.toString()) {
                this.webviewEditor.dispose();
            }
        }));
        vscode.workspace.fs.stat(resource).then(({ size }) => {
            this._imageBinarySize = size;
            this.update();
        });
        this.render();
        this.update();
        this.webviewEditor.webview.postMessage({ type: 'setActive', value: this.webviewEditor.active });
    }
    zoomIn() {
        if (this._previewState === 2 /* Active */) {
            this.webviewEditor.webview.postMessage({ type: 'zoomIn' });
        }
    }
    zoomOut() {
        if (this._previewState === 2 /* Active */) {
            this.webviewEditor.webview.postMessage({ type: 'zoomOut' });
        }
    }
    async render() {
        if (this._previewState !== 0 /* Disposed */) {
            this.webviewEditor.webview.html = await this.getWebviewContents();
        }
    }
    update() {
        if (this._previewState === 0 /* Disposed */) {
            return;
        }
        if (this.webviewEditor.active) {
            this._previewState = 2 /* Active */;
            this.sizeStatusBarEntry.show(this.id, this._imageSize || '');
            this.binarySizeStatusBarEntry.show(this.id, this._imageBinarySize);
            this.zoomStatusBarEntry.show(this.id, this._imageZoom || 'fit');
        }
        else {
            if (this._previewState === 2 /* Active */) {
                this.sizeStatusBarEntry.hide(this.id);
                this.binarySizeStatusBarEntry.hide(this.id);
                this.zoomStatusBarEntry.hide(this.id);
            }
            this._previewState = 1 /* Visible */;
        }
    }
    async getWebviewContents() {
        const version = Date.now().toString();
        const settings = {
            src: await this.getResourcePath(this.webviewEditor, this.resource, version),
        };
        const nonce = getNonce();
        const cspSource = this.webviewEditor.webview.cspSource;
        return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">

	<!-- Disable pinch zooming -->
	<meta name="viewport"
		content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">

	<title>Image Preview</title>

	<link rel="stylesheet" href="${escapeAttribute(this.extensionResource('/media/main.css'))}" type="text/css" media="screen" nonce="${nonce}">

	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: ${cspSource}; script-src 'nonce-${nonce}'; style-src ${cspSource} 'nonce-${nonce}';">
	<meta id="image-preview-settings" data-settings="${escapeAttribute(JSON.stringify(settings))}">
</head>
<body class="container image scale-to-fit loading">
	<div class="loading-indicator"></div>
	<div class="image-load-error">
		<p>${localize('preview.imageLoadError', "An error occurred while loading the image.")}</p>
		<a href="#" class="open-file-link">${localize('preview.imageLoadErrorLink', "Open file using VS Code's standard text/binary editor?")}</a>
	</div>
	<script src="${escapeAttribute(this.extensionResource('/media/main.js'))}" nonce="${nonce}"></script>
</body>
</html>`;
    }
    async getResourcePath(webviewEditor, resource, version) {
        if (resource.scheme === 'git') {
            const stat = await vscode.workspace.fs.stat(resource);
            if (stat.size === 0) {
                return this.emptyPngDataUri;
            }
        }
        // Avoid adding cache busting if there is already a query string
        if (resource.query) {
            return webviewEditor.webview.asWebviewUri(resource).toString();
        }
        return webviewEditor.webview.asWebviewUri(resource).with({ query: `version=${version}` }).toString();
    }
    extensionResource(path) {
        return this.webviewEditor.webview.asWebviewUri(this.extensionRoot.with({
            path: this.extensionRoot.path + path
        }));
    }
}
function escapeAttribute(value) {
    return value.toString().replace(/"/g, '&quot;');
}
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 64; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SizeStatusBarEntry = void 0;
const vscode = __webpack_require__(1);
const nls = __webpack_require__(3);
const ownedStatusBarEntry_1 = __webpack_require__(6);
const localize = nls.loadMessageBundle();
class SizeStatusBarEntry extends ownedStatusBarEntry_1.PreviewStatusBarEntry {
    constructor() {
        super('status.imagePreview.size', localize('sizeStatusBar.name', "Image Size"), vscode.StatusBarAlignment.Right, 101 /* to the left of editor status (100) */);
    }
    show(owner, text) {
        this.showItem(owner, text);
    }
}
exports.SizeStatusBarEntry = SizeStatusBarEntry;


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ZoomStatusBarEntry = void 0;
const vscode = __webpack_require__(1);
const nls = __webpack_require__(3);
const ownedStatusBarEntry_1 = __webpack_require__(6);
const localize = nls.loadMessageBundle();
const selectZoomLevelCommandId = '_imagePreview.selectZoomLevel';
class ZoomStatusBarEntry extends ownedStatusBarEntry_1.PreviewStatusBarEntry {
    constructor() {
        super('status.imagePreview.zoom', localize('zoomStatusBar.name', "Image Zoom"), vscode.StatusBarAlignment.Right, 102 /* to the left of editor size entry (101) */);
        this._onDidChangeScale = this._register(new vscode.EventEmitter());
        this.onDidChangeScale = this._onDidChangeScale.event;
        this._register(vscode.commands.registerCommand(selectZoomLevelCommandId, async () => {
            const scales = [10, 5, 2, 1, 0.5, 0.2, 'fit'];
            const options = scales.map((scale) => ({
                label: this.zoomLabel(scale),
                scale
            }));
            const pick = await vscode.window.showQuickPick(options, {
                placeHolder: localize('zoomStatusBar.placeholder', "Select zoom level")
            });
            if (pick) {
                this._onDidChangeScale.fire({ scale: pick.scale });
            }
        }));
        this.entry.command = selectZoomLevelCommandId;
    }
    show(owner, scale) {
        this.showItem(owner, this.zoomLabel(scale));
    }
    zoomLabel(scale) {
        return scale === 'fit'
            ? localize('zoomStatusBar.wholeImageLabel', "Whole Image")
            : `${Math.round(scale * 100)}%`;
    }
}
exports.ZoomStatusBarEntry = ZoomStatusBarEntry;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = void 0;
const vscode = __webpack_require__(1);
const binarySizeStatusBarEntry_1 = __webpack_require__(2);
const preview_1 = __webpack_require__(8);
const sizeStatusBarEntry_1 = __webpack_require__(9);
const zoomStatusBarEntry_1 = __webpack_require__(10);
function activate(context) {
    const sizeStatusBarEntry = new sizeStatusBarEntry_1.SizeStatusBarEntry();
    context.subscriptions.push(sizeStatusBarEntry);
    const binarySizeStatusBarEntry = new binarySizeStatusBarEntry_1.BinarySizeStatusBarEntry();
    context.subscriptions.push(binarySizeStatusBarEntry);
    const zoomStatusBarEntry = new zoomStatusBarEntry_1.ZoomStatusBarEntry();
    context.subscriptions.push(zoomStatusBarEntry);
    const previewManager = new preview_1.PreviewManager(context.extensionUri, sizeStatusBarEntry, binarySizeStatusBarEntry, zoomStatusBarEntry);
    context.subscriptions.push(vscode.window.registerCustomEditorProvider(preview_1.PreviewManager.viewType, previewManager, {
        supportsMultipleEditorsPerDocument: true,
    }));
    context.subscriptions.push(vscode.commands.registerCommand('imagePreview.zoomIn', () => {
        previewManager.activePreview?.zoomIn();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('imagePreview.zoomOut', () => {
        previewManager.activePreview?.zoomOut();
    }));
}
exports.activate = activate;

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=extension.js.map