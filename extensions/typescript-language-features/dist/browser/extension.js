/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

"use strict";
module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getExtensionApi = void 0;
class ApiV0 {
    constructor(onCompletionAccepted, _pluginManager) {
        this.onCompletionAccepted = onCompletionAccepted;
        this._pluginManager = _pluginManager;
    }
    configurePlugin(pluginId, configuration) {
        this._pluginManager.setConfiguration(pluginId, configuration);
    }
}
function getExtensionApi(onCompletionAccepted, pluginManager) {
    return {
        getAPI(version) {
            if (version === 0) {
                return new ApiV0(onCompletionAccepted, pluginManager);
            }
            return undefined;
        }
    };
}
exports.getExtensionApi = getExtensionApi;


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommandManager = void 0;
const vscode = __webpack_require__(1);
class CommandManager {
    constructor() {
        this.commands = new Map();
    }
    dispose() {
        for (const registration of this.commands.values()) {
            registration.dispose();
        }
        this.commands.clear();
    }
    register(command) {
        if (!this.commands.has(command.id)) {
            this.commands.set(command.id, vscode.commands.registerCommand(command.id, command.execute, command));
        }
        return command;
    }
}
exports.CommandManager = CommandManager;


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.registerBaseCommands = void 0;
const configurePlugin_1 = __webpack_require__(5);
const goToProjectConfiguration_1 = __webpack_require__(6);
const learnMoreAboutRefactorings_1 = __webpack_require__(13);
const openTsServerLog_1 = __webpack_require__(15);
const reloadProject_1 = __webpack_require__(16);
const restartTsServer_1 = __webpack_require__(17);
const selectTypeScriptVersion_1 = __webpack_require__(18);
function registerBaseCommands(commandManager, lazyClientHost, pluginManager, activeJsTsEditorTracker) {
    commandManager.register(new reloadProject_1.ReloadTypeScriptProjectsCommand(lazyClientHost));
    commandManager.register(new reloadProject_1.ReloadJavaScriptProjectsCommand(lazyClientHost));
    commandManager.register(new selectTypeScriptVersion_1.SelectTypeScriptVersionCommand(lazyClientHost));
    commandManager.register(new openTsServerLog_1.OpenTsServerLogCommand(lazyClientHost));
    commandManager.register(new restartTsServer_1.RestartTsServerCommand(lazyClientHost));
    commandManager.register(new goToProjectConfiguration_1.TypeScriptGoToProjectConfigCommand(activeJsTsEditorTracker, lazyClientHost));
    commandManager.register(new goToProjectConfiguration_1.JavaScriptGoToProjectConfigCommand(activeJsTsEditorTracker, lazyClientHost));
    commandManager.register(new configurePlugin_1.ConfigurePluginCommand(pluginManager));
    commandManager.register(new learnMoreAboutRefactorings_1.LearnMoreAboutRefactoringsCommand());
}
exports.registerBaseCommands = registerBaseCommands;


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConfigurePluginCommand = void 0;
class ConfigurePluginCommand {
    constructor(pluginManager) {
        this.pluginManager = pluginManager;
        this.id = '_typescript.configurePlugin';
    }
    execute(pluginId, configuration) {
        this.pluginManager.setConfiguration(pluginId, configuration);
    }
}
exports.ConfigurePluginCommand = ConfigurePluginCommand;


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JavaScriptGoToProjectConfigCommand = exports.TypeScriptGoToProjectConfigCommand = void 0;
const tsconfig_1 = __webpack_require__(7);
class TypeScriptGoToProjectConfigCommand {
    constructor(activeJsTsEditorTracker, lazyClientHost) {
        this.activeJsTsEditorTracker = activeJsTsEditorTracker;
        this.lazyClientHost = lazyClientHost;
        this.id = 'typescript.goToProjectConfig';
    }
    execute() {
        const editor = this.activeJsTsEditorTracker.activeJsTsEditor;
        if (editor) {
            (0, tsconfig_1.openProjectConfigForFile)(0 /* TypeScript */, this.lazyClientHost.value.serviceClient, editor.document.uri);
        }
    }
}
exports.TypeScriptGoToProjectConfigCommand = TypeScriptGoToProjectConfigCommand;
class JavaScriptGoToProjectConfigCommand {
    constructor(activeJsTsEditorTracker, lazyClientHost) {
        this.activeJsTsEditorTracker = activeJsTsEditorTracker;
        this.lazyClientHost = lazyClientHost;
        this.id = 'javascript.goToProjectConfig';
    }
    execute() {
        const editor = this.activeJsTsEditorTracker.activeJsTsEditor;
        if (editor) {
            (0, tsconfig_1.openProjectConfigForFile)(1 /* JavaScript */, this.lazyClientHost.value.serviceClient, editor.document.uri);
        }
    }
}
exports.JavaScriptGoToProjectConfigCommand = JavaScriptGoToProjectConfigCommand;


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.openProjectConfigForFile = exports.openProjectConfigOrPromptToCreate = exports.openOrCreateConfig = exports.inferredProjectCompilerOptions = exports.isImplicitProjectConfigFile = void 0;
const path = __webpack_require__(8);
const vscode = __webpack_require__(1);
const nls = __webpack_require__(9);
const cancellation_1 = __webpack_require__(12);
const localize = nls.loadMessageBundle();
function isImplicitProjectConfigFile(configFileName) {
    return configFileName.startsWith('/dev/null/');
}
exports.isImplicitProjectConfigFile = isImplicitProjectConfigFile;
function inferredProjectCompilerOptions(projectType, serviceConfig) {
    const projectConfig = {
        module: 'commonjs',
        target: 'es2020',
        jsx: 'preserve',
    };
    if (serviceConfig.implicitProjectConfiguration.checkJs) {
        projectConfig.checkJs = true;
        if (projectType === 0 /* TypeScript */) {
            projectConfig.allowJs = true;
        }
    }
    if (serviceConfig.implicitProjectConfiguration.experimentalDecorators) {
        projectConfig.experimentalDecorators = true;
    }
    if (serviceConfig.implicitProjectConfiguration.strictNullChecks) {
        projectConfig.strictNullChecks = true;
    }
    if (serviceConfig.implicitProjectConfiguration.strictFunctionTypes) {
        projectConfig.strictFunctionTypes = true;
    }
    if (projectType === 0 /* TypeScript */) {
        projectConfig.sourceMap = true;
    }
    return projectConfig;
}
exports.inferredProjectCompilerOptions = inferredProjectCompilerOptions;
function inferredProjectConfigSnippet(projectType, config) {
    const baseConfig = inferredProjectCompilerOptions(projectType, config);
    const compilerOptions = Object.keys(baseConfig).map(key => `"${key}": ${JSON.stringify(baseConfig[key])}`);
    return new vscode.SnippetString(`{
	"compilerOptions": {
		${compilerOptions.join(',\n\t\t')}$0
	},
	"exclude": [
		"node_modules",
		"**/node_modules/*"
	]
}`);
}
async function openOrCreateConfig(projectType, rootPath, configuration) {
    const configFile = vscode.Uri.file(path.join(rootPath, projectType === 0 /* TypeScript */ ? 'tsconfig.json' : 'jsconfig.json'));
    const col = vscode.window.activeTextEditor?.viewColumn;
    try {
        const doc = await vscode.workspace.openTextDocument(configFile);
        return vscode.window.showTextDocument(doc, col);
    }
    catch {
        const doc = await vscode.workspace.openTextDocument(configFile.with({ scheme: 'untitled' }));
        const editor = await vscode.window.showTextDocument(doc, col);
        if (editor.document.getText().length === 0) {
            await editor.insertSnippet(inferredProjectConfigSnippet(projectType, configuration));
        }
        return editor;
    }
}
exports.openOrCreateConfig = openOrCreateConfig;
async function openProjectConfigOrPromptToCreate(projectType, client, rootPath, configFileName) {
    if (!isImplicitProjectConfigFile(configFileName)) {
        const doc = await vscode.workspace.openTextDocument(configFileName);
        vscode.window.showTextDocument(doc, vscode.window.activeTextEditor?.viewColumn);
        return;
    }
    const CreateConfigItem = {
        title: projectType === 0 /* TypeScript */
            ? localize('typescript.configureTsconfigQuickPick', 'Configure tsconfig.json')
            : localize('typescript.configureJsconfigQuickPick', 'Configure jsconfig.json'),
    };
    const selected = await vscode.window.showInformationMessage((projectType === 0 /* TypeScript */
        ? localize('typescript.noTypeScriptProjectConfig', 'File is not part of a TypeScript project. Click [here]({0}) to learn more.', 'https://go.microsoft.com/fwlink/?linkid=841896')
        : localize('typescript.noJavaScriptProjectConfig', 'File is not part of a JavaScript project Click [here]({0}) to learn more.', 'https://go.microsoft.com/fwlink/?linkid=759670')), CreateConfigItem);
    switch (selected) {
        case CreateConfigItem:
            openOrCreateConfig(projectType, rootPath, client.configuration);
            return;
    }
}
exports.openProjectConfigOrPromptToCreate = openProjectConfigOrPromptToCreate;
async function openProjectConfigForFile(projectType, client, resource) {
    const rootPath = client.getWorkspaceRootForResource(resource);
    if (!rootPath) {
        vscode.window.showInformationMessage(localize('typescript.projectConfigNoWorkspace', 'Please open a folder in VS Code to use a TypeScript or JavaScript project'));
        return;
    }
    const file = client.toPath(resource);
    // TSServer errors when 'projectInfo' is invoked on a non js/ts file
    if (!file || !await client.toPath(resource)) {
        vscode.window.showWarningMessage(localize('typescript.projectConfigUnsupportedFile', 'Could not determine TypeScript or JavaScript project. Unsupported file type'));
        return;
    }
    let res;
    try {
        res = await client.execute('projectInfo', { file, needFileNameList: false }, cancellation_1.nulToken);
    }
    catch {
        // noop
    }
    if (res?.type !== 'response' || !res.body) {
        vscode.window.showWarningMessage(localize('typescript.projectConfigCouldNotGetInfo', 'Could not determine TypeScript or JavaScript project'));
        return;
    }
    return openProjectConfigOrPromptToCreate(projectType, client, rootPath, res.body.configFileName);
}
exports.openProjectConfigForFile = openProjectConfigForFile;


/***/ }),
/* 8 */
/***/ ((module) => {

"use strict";
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;


/***/ }),
/* 9 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

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
var ral_1 = __webpack_require__(10);
var common_1 = __webpack_require__(11);
var common_2 = __webpack_require__(11);
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
/* 10 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

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
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.config = exports.loadMessageBundle = exports.localize = exports.format = exports.setPseudo = exports.isPseudo = exports.isDefined = exports.BundleFormat = exports.MessageFormat = void 0;
var ral_1 = __webpack_require__(10);
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
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.nulToken = void 0;
const vscode = __webpack_require__(1);
const noopDisposable = vscode.Disposable.from();
exports.nulToken = {
    isCancellationRequested: false,
    onCancellationRequested: () => noopDisposable
};


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LearnMoreAboutRefactoringsCommand = void 0;
const vscode = __webpack_require__(1);
const languageModeIds_1 = __webpack_require__(14);
class LearnMoreAboutRefactoringsCommand {
    constructor() {
        this.id = LearnMoreAboutRefactoringsCommand.id;
    }
    execute() {
        const docUrl = vscode.window.activeTextEditor && (0, languageModeIds_1.isTypeScriptDocument)(vscode.window.activeTextEditor.document)
            ? 'https://go.microsoft.com/fwlink/?linkid=2114477'
            : 'https://go.microsoft.com/fwlink/?linkid=2116761';
        vscode.env.openExternal(vscode.Uri.parse(docUrl));
    }
}
exports.LearnMoreAboutRefactoringsCommand = LearnMoreAboutRefactoringsCommand;
LearnMoreAboutRefactoringsCommand.id = '_typescript.learnMoreAboutRefactorings';


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isTypeScriptDocument = exports.isSupportedLanguageMode = exports.jsTsLanguageModes = exports.jsxTags = exports.javascriptreact = exports.javascript = exports.typescriptreact = exports.typescript = void 0;
const vscode = __webpack_require__(1);
exports.typescript = 'typescript';
exports.typescriptreact = 'typescriptreact';
exports.javascript = 'javascript';
exports.javascriptreact = 'javascriptreact';
exports.jsxTags = 'jsx-tags';
exports.jsTsLanguageModes = [
    exports.javascript,
    exports.javascriptreact,
    exports.typescript,
    exports.typescriptreact,
];
function isSupportedLanguageMode(doc) {
    return vscode.languages.match([exports.typescript, exports.typescriptreact, exports.javascript, exports.javascriptreact], doc) > 0;
}
exports.isSupportedLanguageMode = isSupportedLanguageMode;
function isTypeScriptDocument(doc) {
    return vscode.languages.match([exports.typescript, exports.typescriptreact], doc) > 0;
}
exports.isTypeScriptDocument = isTypeScriptDocument;


/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OpenTsServerLogCommand = void 0;
class OpenTsServerLogCommand {
    constructor(lazyClientHost) {
        this.lazyClientHost = lazyClientHost;
        this.id = 'typescript.openTsServerLog';
    }
    execute() {
        this.lazyClientHost.value.serviceClient.openTsServerLogFile();
    }
}
exports.OpenTsServerLogCommand = OpenTsServerLogCommand;


/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReloadJavaScriptProjectsCommand = exports.ReloadTypeScriptProjectsCommand = void 0;
class ReloadTypeScriptProjectsCommand {
    constructor(lazyClientHost) {
        this.lazyClientHost = lazyClientHost;
        this.id = 'typescript.reloadProjects';
    }
    execute() {
        this.lazyClientHost.value.reloadProjects();
    }
}
exports.ReloadTypeScriptProjectsCommand = ReloadTypeScriptProjectsCommand;
class ReloadJavaScriptProjectsCommand {
    constructor(lazyClientHost) {
        this.lazyClientHost = lazyClientHost;
        this.id = 'javascript.reloadProjects';
    }
    execute() {
        this.lazyClientHost.value.reloadProjects();
    }
}
exports.ReloadJavaScriptProjectsCommand = ReloadJavaScriptProjectsCommand;


/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RestartTsServerCommand = void 0;
class RestartTsServerCommand {
    constructor(lazyClientHost) {
        this.lazyClientHost = lazyClientHost;
        this.id = 'typescript.restartTsServer';
    }
    execute() {
        this.lazyClientHost.value.serviceClient.restartTsServer();
    }
}
exports.RestartTsServerCommand = RestartTsServerCommand;


/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SelectTypeScriptVersionCommand = void 0;
class SelectTypeScriptVersionCommand {
    constructor(lazyClientHost) {
        this.lazyClientHost = lazyClientHost;
        this.id = SelectTypeScriptVersionCommand.id;
    }
    execute() {
        this.lazyClientHost.value.serviceClient.showVersionPicker();
    }
}
exports.SelectTypeScriptVersionCommand = SelectTypeScriptVersionCommand;
SelectTypeScriptVersionCommand.id = 'typescript.selectTypeScriptVersion';


/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LanguageConfigurationManager = void 0;
/* --------------------------------------------------------------------------------------------
 * Includes code from typescript-sublime-plugin project, obtained from
 * https://github.com/microsoft/TypeScript-Sublime-Plugin/blob/master/TypeScript%20Indent.tmPreferences
 * ------------------------------------------------------------------------------------------ */
const vscode = __webpack_require__(1);
const dispose_1 = __webpack_require__(20);
const languageModeIds = __webpack_require__(14);
const jsTsLanguageConfiguration = {
    indentationRules: {
        decreaseIndentPattern: /^((?!.*?\/\*).*\*\/)?\s*[\}\]].*$/,
        increaseIndentPattern: /^((?!\/\/).)*(\{([^}"'`]*|(\t|[ ])*\/\/.*)|\([^)"'`]*|\[[^\]"'`]*)$/,
        // e.g.  * ...| or */| or *-----*/|
        unIndentedLinePattern: /^(\t|[ ])*[ ]\*[^/]*\*\/\s*$|^(\t|[ ])*[ ]\*\/\s*$|^(\t|[ ])*[ ]\*([ ]([^\*]|\*(?!\/))*)?$/
    },
    wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
    onEnterRules: [
        {
            // e.g. /** | */
            beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
            afterText: /^\s*\*\/$/,
            action: { indentAction: vscode.IndentAction.IndentOutdent, appendText: ' * ' },
        }, {
            // e.g. /** ...|
            beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
            action: { indentAction: vscode.IndentAction.None, appendText: ' * ' },
        }, {
            // e.g.  * ...|
            beforeText: /^(\t|[ ])*[ ]\*([ ]([^\*]|\*(?!\/))*)?$/,
            previousLineText: /(?=^(\s*(\/\*\*|\*)).*)(?=(?!(\s*\*\/)))/,
            action: { indentAction: vscode.IndentAction.None, appendText: '* ' },
        }, {
            // e.g.  */|
            beforeText: /^(\t|[ ])*[ ]\*\/\s*$/,
            action: { indentAction: vscode.IndentAction.None, removeText: 1 },
        },
        {
            // e.g.  *-----*/|
            beforeText: /^(\t|[ ])*[ ]\*[^/]*\*\/\s*$/,
            action: { indentAction: vscode.IndentAction.None, removeText: 1 },
        },
        {
            beforeText: /^\s*(\bcase\s.+:|\bdefault:)$/,
            afterText: /^(?!\s*(\bcase\b|\bdefault\b))/,
            action: { indentAction: vscode.IndentAction.Indent },
        }
    ]
};
const EMPTY_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'];
const jsxTagsLanguageConfiguration = {
    wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
    onEnterRules: [
        {
            beforeText: new RegExp(`<(?!(?:${EMPTY_ELEMENTS.join('|')}))([_:\\w][_:\\w\\-.\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
            afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
            action: { indentAction: vscode.IndentAction.IndentOutdent }
        },
        {
            beforeText: new RegExp(`<(?!(?:${EMPTY_ELEMENTS.join('|')}))([_:\\w][_:\\w\\-.\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
            action: { indentAction: vscode.IndentAction.Indent }
        },
        {
            // `beforeText` only applies to tokens of a given language. Since we are dealing with jsx-tags,
            // make sure we apply to the closing `>` of a tag so that mixed language spans
            // such as `<div onclick={1}>` are handled properly.
            beforeText: /^>$/,
            afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
            action: { indentAction: vscode.IndentAction.IndentOutdent }
        },
        {
            beforeText: /^>$/,
            action: { indentAction: vscode.IndentAction.Indent }
        },
    ],
};
class LanguageConfigurationManager extends dispose_1.Disposable {
    constructor() {
        super();
        const standardLanguages = [
            languageModeIds.javascript,
            languageModeIds.javascriptreact,
            languageModeIds.typescript,
            languageModeIds.typescriptreact,
        ];
        for (const language of standardLanguages) {
            this.registerConfiguration(language, jsTsLanguageConfiguration);
        }
        this.registerConfiguration(languageModeIds.jsxTags, jsxTagsLanguageConfiguration);
    }
    registerConfiguration(language, config) {
        this._register(vscode.languages.setLanguageConfiguration(language, config));
    }
}
exports.LanguageConfigurationManager = LanguageConfigurationManager;


/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

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
/* 21 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.lazilyActivateClient = exports.createLazyClientHost = void 0;
const vscode = __webpack_require__(1);
const typeScriptServiceClientHost_1 = __webpack_require__(22);
const arrays_1 = __webpack_require__(28);
const fileSchemes = __webpack_require__(26);
const languageDescription_1 = __webpack_require__(97);
const lazy_1 = __webpack_require__(99);
const managedFileContext_1 = __webpack_require__(100);
function createLazyClientHost(context, onCaseInsensitiveFileSystem, services, onCompletionAccepted) {
    return (0, lazy_1.lazy)(() => {
        const clientHost = new typeScriptServiceClientHost_1.default(languageDescription_1.standardLanguageDescriptions, context, onCaseInsensitiveFileSystem, services, onCompletionAccepted);
        context.subscriptions.push(clientHost);
        return clientHost;
    });
}
exports.createLazyClientHost = createLazyClientHost;
function lazilyActivateClient(lazyClientHost, pluginManager, activeJsTsEditorTracker) {
    const disposables = [];
    const supportedLanguage = (0, arrays_1.flatten)([
        ...languageDescription_1.standardLanguageDescriptions.map(x => x.modeIds),
        ...pluginManager.plugins.map(x => x.languages)
    ]);
    let hasActivated = false;
    const maybeActivate = (textDocument) => {
        if (!hasActivated && isSupportedDocument(supportedLanguage, textDocument)) {
            hasActivated = true;
            // Force activation
            void lazyClientHost.value;
            disposables.push(new managedFileContext_1.default(activeJsTsEditorTracker, resource => {
                return lazyClientHost.value.serviceClient.toPath(resource);
            }));
            return true;
        }
        return false;
    };
    const didActivate = vscode.workspace.textDocuments.some(maybeActivate);
    if (!didActivate) {
        const openListener = vscode.workspace.onDidOpenTextDocument(doc => {
            if (maybeActivate(doc)) {
                openListener.dispose();
            }
        }, undefined, disposables);
    }
    return vscode.Disposable.from(...disposables);
}
exports.lazilyActivateClient = lazilyActivateClient;
function isSupportedDocument(supportedLanguage, document) {
    return supportedLanguage.indexOf(document.languageId) >= 0
        && !fileSchemes.disabledSchemes.has(document.uri.scheme);
}


/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
/* --------------------------------------------------------------------------------------------
 * Includes code from typescript-sublime-plugin project, obtained from
 * https://github.com/microsoft/TypeScript-Sublime-Plugin/blob/master/TypeScript%20Indent.tmPreferences
 * ------------------------------------------------------------------------------------------ */
const vscode = __webpack_require__(1);
const fileConfigurationManager_1 = __webpack_require__(23);
const languageProvider_1 = __webpack_require__(30);
const PConst = __webpack_require__(34);
const typescriptServiceClient_1 = __webpack_require__(77);
const intellisenseStatus_1 = __webpack_require__(91);
const versionStatus_1 = __webpack_require__(92);
const arrays_1 = __webpack_require__(28);
const dispose_1 = __webpack_require__(20);
const errorCodes = __webpack_require__(57);
const LargeProjectStatus = __webpack_require__(93);
const logLevelMonitor_1 = __webpack_require__(94);
const typeConverters = __webpack_require__(37);
const typingsStatus_1 = __webpack_require__(95);
// Style check diagnostics that can be reported as warnings
const styleCheckDiagnostics = new Set([
    ...errorCodes.variableDeclaredButNeverUsed,
    ...errorCodes.propertyDeclaretedButNeverUsed,
    ...errorCodes.allImportsAreUnused,
    ...errorCodes.unreachableCode,
    ...errorCodes.unusedLabel,
    ...errorCodes.fallThroughCaseInSwitch,
    ...errorCodes.notAllCodePathsReturnAValue,
]);
class TypeScriptServiceClientHost extends dispose_1.Disposable {
    constructor(descriptions, context, onCaseInsensitiveFileSystem, services, onCompletionAccepted) {
        super();
        this.languages = [];
        this.languagePerId = new Map();
        this.reportStyleCheckAsWarnings = true;
        this.commandManager = services.commandManager;
        const allModeIds = this.getAllModeIds(descriptions, services.pluginManager);
        this.client = this._register(new typescriptServiceClient_1.default(context, onCaseInsensitiveFileSystem, services, allModeIds));
        this.client.onDiagnosticsReceived(({ kind, resource, diagnostics }) => {
            this.diagnosticsReceived(kind, resource, diagnostics);
        }, null, this._disposables);
        this.client.onConfigDiagnosticsReceived(diag => this.configFileDiagnosticsReceived(diag), null, this._disposables);
        this.client.onResendModelsRequested(() => this.populateService(), null, this._disposables);
        this._register(new versionStatus_1.VersionStatus(this.client));
        this._register(new intellisenseStatus_1.IntellisenseStatus(this.client, services.commandManager, services.activeJsTsEditorTracker));
        this._register(new typingsStatus_1.AtaProgressReporter(this.client));
        this.typingsStatus = this._register(new typingsStatus_1.default(this.client));
        this._register(LargeProjectStatus.create(this.client));
        this.fileConfigurationManager = this._register(new fileConfigurationManager_1.default(this.client, onCaseInsensitiveFileSystem));
        for (const description of descriptions) {
            const manager = new languageProvider_1.default(this.client, description, this.commandManager, this.client.telemetryReporter, this.typingsStatus, this.fileConfigurationManager, onCompletionAccepted);
            this.languages.push(manager);
            this._register(manager);
            this.languagePerId.set(description.id, manager);
        }
        Promise.resolve().then(() => __webpack_require__(96)).then(module => this._register(module.register(this.client, this.fileConfigurationManager, uri => this.handles(uri))));
        Promise.resolve().then(() => __webpack_require__(98)).then(module => this._register(module.register(this.client, allModeIds)));
        this.client.ensureServiceStarted();
        this.client.onReady(() => {
            const languages = new Set();
            for (const plugin of services.pluginManager.plugins) {
                if (plugin.configNamespace && plugin.languages.length) {
                    this.registerExtensionLanguageProvider({
                        id: plugin.configNamespace,
                        modeIds: Array.from(plugin.languages),
                        diagnosticSource: 'ts-plugin',
                        diagnosticLanguage: 1 /* TypeScript */,
                        diagnosticOwner: 'typescript',
                        isExternal: true,
                        standardFileExtensions: [],
                    }, onCompletionAccepted);
                }
                else {
                    for (const language of plugin.languages) {
                        languages.add(language);
                    }
                }
            }
            if (languages.size) {
                this.registerExtensionLanguageProvider({
                    id: 'typescript-plugins',
                    modeIds: Array.from(languages.values()),
                    diagnosticSource: 'ts-plugin',
                    diagnosticLanguage: 1 /* TypeScript */,
                    diagnosticOwner: 'typescript',
                    isExternal: true,
                    standardFileExtensions: [],
                }, onCompletionAccepted);
            }
        });
        this.client.onTsServerStarted(() => {
            this.triggerAllDiagnostics();
        });
        vscode.workspace.onDidChangeConfiguration(this.configurationChanged, this, this._disposables);
        this.configurationChanged();
        this._register(new logLevelMonitor_1.LogLevelMonitor(context));
    }
    registerExtensionLanguageProvider(description, onCompletionAccepted) {
        const manager = new languageProvider_1.default(this.client, description, this.commandManager, this.client.telemetryReporter, this.typingsStatus, this.fileConfigurationManager, onCompletionAccepted);
        this.languages.push(manager);
        this._register(manager);
        this.languagePerId.set(description.id, manager);
    }
    getAllModeIds(descriptions, pluginManager) {
        const allModeIds = (0, arrays_1.flatten)([
            ...descriptions.map(x => x.modeIds),
            ...pluginManager.plugins.map(x => x.languages)
        ]);
        return allModeIds;
    }
    get serviceClient() {
        return this.client;
    }
    reloadProjects() {
        this.client.executeWithoutWaitingForResponse('reloadProjects', null);
        this.triggerAllDiagnostics();
    }
    async handles(resource) {
        const provider = await this.findLanguage(resource);
        if (provider) {
            return true;
        }
        return this.client.bufferSyncSupport.handles(resource);
    }
    configurationChanged() {
        const typescriptConfig = vscode.workspace.getConfiguration('typescript');
        this.reportStyleCheckAsWarnings = typescriptConfig.get('reportStyleChecksAsWarnings', true);
    }
    async findLanguage(resource) {
        try {
            // First try finding language just based on the resource.
            // This is not strictly correct but should be in the vast majority of cases
            // (except when someone goes and maps `.js` to `typescript` or something...)
            for (const language of this.languages) {
                if (language.handlesUri(resource)) {
                    return language;
                }
            }
            // If that doesn't work, fallback to using a text document language mode.
            // This is not ideal since we have to open the document but should always
            // be correct
            const doc = await vscode.workspace.openTextDocument(resource);
            return this.languages.find(language => language.handlesDocument(doc));
        }
        catch {
            return undefined;
        }
    }
    triggerAllDiagnostics() {
        for (const language of this.languagePerId.values()) {
            language.triggerAllDiagnostics();
        }
    }
    populateService() {
        this.fileConfigurationManager.reset();
        for (const language of this.languagePerId.values()) {
            language.reInitialize();
        }
    }
    async diagnosticsReceived(kind, resource, diagnostics) {
        const language = await this.findLanguage(resource);
        if (language) {
            language.diagnosticsReceived(kind, resource, this.createMarkerDatas(diagnostics, language.diagnosticSource));
        }
    }
    configFileDiagnosticsReceived(event) {
        // See https://github.com/microsoft/TypeScript/issues/10384
        const body = event.body;
        if (!body || !body.diagnostics || !body.configFile) {
            return;
        }
        this.findLanguage(this.client.toResource(body.configFile)).then(language => {
            if (!language) {
                return;
            }
            language.configFileDiagnosticsReceived(this.client.toResource(body.configFile), body.diagnostics.map(tsDiag => {
                const range = tsDiag.start && tsDiag.end ? typeConverters.Range.fromTextSpan(tsDiag) : new vscode.Range(0, 0, 0, 1);
                const diagnostic = new vscode.Diagnostic(range, body.diagnostics[0].text, this.getDiagnosticSeverity(tsDiag));
                diagnostic.source = language.diagnosticSource;
                return diagnostic;
            }));
        });
    }
    createMarkerDatas(diagnostics, source) {
        return diagnostics.map(tsDiag => this.tsDiagnosticToVsDiagnostic(tsDiag, source));
    }
    tsDiagnosticToVsDiagnostic(diagnostic, source) {
        const { start, end, text } = diagnostic;
        const range = new vscode.Range(typeConverters.Position.fromLocation(start), typeConverters.Position.fromLocation(end));
        const converted = new vscode.Diagnostic(range, text, this.getDiagnosticSeverity(diagnostic));
        converted.source = diagnostic.source || source;
        if (diagnostic.code) {
            converted.code = diagnostic.code;
        }
        const relatedInformation = diagnostic.relatedInformation;
        if (relatedInformation) {
            converted.relatedInformation = (0, arrays_1.coalesce)(relatedInformation.map((info) => {
                const span = info.span;
                if (!span) {
                    return undefined;
                }
                return new vscode.DiagnosticRelatedInformation(typeConverters.Location.fromTextSpan(this.client.toResource(span.file), span), info.message);
            }));
        }
        const tags = [];
        if (diagnostic.reportsUnnecessary) {
            tags.push(vscode.DiagnosticTag.Unnecessary);
        }
        if (diagnostic.reportsDeprecated) {
            tags.push(vscode.DiagnosticTag.Deprecated);
        }
        converted.tags = tags.length ? tags : undefined;
        const resultConverted = converted;
        resultConverted.reportUnnecessary = diagnostic.reportsUnnecessary;
        resultConverted.reportDeprecated = diagnostic.reportsDeprecated;
        return resultConverted;
    }
    getDiagnosticSeverity(diagnostic) {
        if (this.reportStyleCheckAsWarnings
            && this.isStyleCheckDiagnostic(diagnostic.code)
            && diagnostic.category === PConst.DiagnosticCategory.error) {
            return vscode.DiagnosticSeverity.Warning;
        }
        switch (diagnostic.category) {
            case PConst.DiagnosticCategory.error:
                return vscode.DiagnosticSeverity.Error;
            case PConst.DiagnosticCategory.warning:
                return vscode.DiagnosticSeverity.Warning;
            case PConst.DiagnosticCategory.suggestion:
                return vscode.DiagnosticSeverity.Hint;
            default:
                return vscode.DiagnosticSeverity.Error;
        }
    }
    isStyleCheckDiagnostic(code) {
        return typeof code === 'number' && styleCheckDiagnostics.has(code);
    }
}
exports.default = TypeScriptServiceClientHost;


/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getInlayHintsPreferences = exports.InlayHintSettingNames = void 0;
const vscode = __webpack_require__(1);
const api_1 = __webpack_require__(24);
const dispose_1 = __webpack_require__(20);
const fileSchemes = __webpack_require__(26);
const languageModeIds_1 = __webpack_require__(14);
const objects_1 = __webpack_require__(27);
const resourceMap_1 = __webpack_require__(29);
function areFileConfigurationsEqual(a, b) {
    return (0, objects_1.equals)(a, b);
}
class FileConfigurationManager extends dispose_1.Disposable {
    constructor(client, onCaseInsensitiveFileSystem) {
        super();
        this.client = client;
        this.formatOptions = new resourceMap_1.ResourceMap(undefined, { onCaseInsensitiveFileSystem });
        vscode.workspace.onDidCloseTextDocument(textDocument => {
            // When a document gets closed delete the cached formatting options.
            // This is necessary since the tsserver now closed a project when its
            // last file in it closes which drops the stored formatting options
            // as well.
            this.formatOptions.delete(textDocument.uri);
        }, undefined, this._disposables);
    }
    async ensureConfigurationForDocument(document, token) {
        const formattingOptions = this.getFormattingOptions(document);
        if (formattingOptions) {
            return this.ensureConfigurationOptions(document, formattingOptions, token);
        }
    }
    getFormattingOptions(document) {
        const editor = vscode.window.visibleTextEditors.find(editor => editor.document.fileName === document.fileName);
        return editor
            ? {
                tabSize: editor.options.tabSize,
                insertSpaces: editor.options.insertSpaces
            }
            : undefined;
    }
    async ensureConfigurationOptions(document, options, token) {
        const file = this.client.toOpenedFilePath(document);
        if (!file) {
            return;
        }
        const currentOptions = this.getFileOptions(document, options);
        const cachedOptions = this.formatOptions.get(document.uri);
        if (cachedOptions) {
            const cachedOptionsValue = await cachedOptions;
            if (cachedOptionsValue && areFileConfigurationsEqual(cachedOptionsValue, currentOptions)) {
                return;
            }
        }
        let resolve;
        this.formatOptions.set(document.uri, new Promise(r => resolve = r));
        const args = {
            file,
            ...currentOptions,
        };
        try {
            const response = await this.client.execute('configure', args, token);
            resolve(response.type === 'response' ? currentOptions : undefined);
        }
        finally {
            resolve(undefined);
        }
    }
    async setGlobalConfigurationFromDocument(document, token) {
        const formattingOptions = this.getFormattingOptions(document);
        if (!formattingOptions) {
            return;
        }
        const args = {
            file: undefined /*global*/,
            ...this.getFileOptions(document, formattingOptions),
        };
        await this.client.execute('configure', args, token);
    }
    reset() {
        this.formatOptions.clear();
    }
    getFileOptions(document, options) {
        return {
            formatOptions: this.getFormatOptions(document, options),
            preferences: this.getPreferences(document)
        };
    }
    getFormatOptions(document, options) {
        const config = vscode.workspace.getConfiguration((0, languageModeIds_1.isTypeScriptDocument)(document) ? 'typescript.format' : 'javascript.format', document.uri);
        return {
            tabSize: options.tabSize,
            indentSize: options.tabSize,
            convertTabsToSpaces: options.insertSpaces,
            // We can use \n here since the editor normalizes later on to its line endings.
            newLineCharacter: '\n',
            insertSpaceAfterCommaDelimiter: config.get('insertSpaceAfterCommaDelimiter'),
            insertSpaceAfterConstructor: config.get('insertSpaceAfterConstructor'),
            insertSpaceAfterSemicolonInForStatements: config.get('insertSpaceAfterSemicolonInForStatements'),
            insertSpaceBeforeAndAfterBinaryOperators: config.get('insertSpaceBeforeAndAfterBinaryOperators'),
            insertSpaceAfterKeywordsInControlFlowStatements: config.get('insertSpaceAfterKeywordsInControlFlowStatements'),
            insertSpaceAfterFunctionKeywordForAnonymousFunctions: config.get('insertSpaceAfterFunctionKeywordForAnonymousFunctions'),
            insertSpaceBeforeFunctionParenthesis: config.get('insertSpaceBeforeFunctionParenthesis'),
            insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: config.get('insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis'),
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: config.get('insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets'),
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: config.get('insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces'),
            insertSpaceAfterOpeningAndBeforeClosingEmptyBraces: config.get('insertSpaceAfterOpeningAndBeforeClosingEmptyBraces'),
            insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: config.get('insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces'),
            insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: config.get('insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces'),
            insertSpaceAfterTypeAssertion: config.get('insertSpaceAfterTypeAssertion'),
            placeOpenBraceOnNewLineForFunctions: config.get('placeOpenBraceOnNewLineForFunctions'),
            placeOpenBraceOnNewLineForControlBlocks: config.get('placeOpenBraceOnNewLineForControlBlocks'),
            semicolons: config.get('semicolons'),
        };
    }
    getPreferences(document) {
        if (this.client.apiVersion.lt(api_1.default.v290)) {
            return {};
        }
        const config = vscode.workspace.getConfiguration((0, languageModeIds_1.isTypeScriptDocument)(document) ? 'typescript' : 'javascript', document.uri);
        const preferencesConfig = vscode.workspace.getConfiguration((0, languageModeIds_1.isTypeScriptDocument)(document) ? 'typescript.preferences' : 'javascript.preferences', document.uri);
        const preferences = {
            quotePreference: this.getQuoteStylePreference(preferencesConfig),
            importModuleSpecifierPreference: getImportModuleSpecifierPreference(preferencesConfig),
            importModuleSpecifierEnding: getImportModuleSpecifierEndingPreference(preferencesConfig),
            jsxAttributeCompletionStyle: getJsxAttributeCompletionStyle(preferencesConfig),
            allowTextChangesInNewFiles: document.uri.scheme === fileSchemes.file,
            providePrefixAndSuffixTextForRename: preferencesConfig.get('renameShorthandProperties', true) === false ? false : preferencesConfig.get('useAliasesForRenames', true),
            allowRenameOfImportPath: true,
            includeAutomaticOptionalChainCompletions: config.get('suggest.includeAutomaticOptionalChainCompletions', true),
            provideRefactorNotApplicableReason: true,
            generateReturnInDocTemplate: config.get('suggest.jsdoc.generateReturns', true),
            includeCompletionsForImportStatements: config.get('suggest.includeCompletionsForImportStatements', true),
            includeCompletionsWithSnippetText: config.get('suggest.includeCompletionsWithSnippetText', true),
            includeCompletionsWithClassMemberSnippets: config.get('suggest.classMemberSnippets.enabled', true),
            allowIncompleteCompletions: true,
            displayPartsForJSDoc: true,
            ...getInlayHintsPreferences(config),
        };
        return preferences;
    }
    getQuoteStylePreference(config) {
        switch (config.get('quoteStyle')) {
            case 'single': return 'single';
            case 'double': return 'double';
            default: return this.client.apiVersion.gte(api_1.default.v333) ? 'auto' : undefined;
        }
    }
}
exports.default = FileConfigurationManager;
class InlayHintSettingNames {
}
exports.InlayHintSettingNames = InlayHintSettingNames;
InlayHintSettingNames.parameterNamesSuppressWhenArgumentMatchesName = 'inlayHints.parameterNames.suppressWhenArgumentMatchesName';
InlayHintSettingNames.parameterNamesEnabled = 'inlayHints.parameterTypes.enabled';
InlayHintSettingNames.variableTypesEnabled = 'inlayHints.variableTypes.enabled';
InlayHintSettingNames.propertyDeclarationTypesEnabled = 'inlayHints.propertyDeclarationTypes.enabled';
InlayHintSettingNames.functionLikeReturnTypesEnabled = 'inlayHints.functionLikeReturnTypes.enabled';
InlayHintSettingNames.enumMemberValuesEnabled = 'inlayHints.enumMemberValues.enabled';
function getInlayHintsPreferences(config) {
    return {
        includeInlayParameterNameHints: getInlayParameterNameHintsPreference(config),
        includeInlayParameterNameHintsWhenArgumentMatchesName: !config.get(InlayHintSettingNames.parameterNamesSuppressWhenArgumentMatchesName, true),
        includeInlayFunctionParameterTypeHints: config.get(InlayHintSettingNames.parameterNamesEnabled, false),
        includeInlayVariableTypeHints: config.get(InlayHintSettingNames.variableTypesEnabled, false),
        includeInlayPropertyDeclarationTypeHints: config.get(InlayHintSettingNames.propertyDeclarationTypesEnabled, false),
        includeInlayFunctionLikeReturnTypeHints: config.get(InlayHintSettingNames.functionLikeReturnTypesEnabled, false),
        includeInlayEnumMemberValueHints: config.get(InlayHintSettingNames.enumMemberValuesEnabled, false),
    };
}
exports.getInlayHintsPreferences = getInlayHintsPreferences;
function getInlayParameterNameHintsPreference(config) {
    switch (config.get('inlayHints.parameterNames.enabled')) {
        case 'none': return 'none';
        case 'literals': return 'literals';
        case 'all': return 'all';
        default: return undefined;
    }
}
function getImportModuleSpecifierPreference(config) {
    switch (config.get('importModuleSpecifier')) {
        case 'project-relative': return 'project-relative';
        case 'relative': return 'relative';
        case 'non-relative': return 'non-relative';
        default: return undefined;
    }
}
function getImportModuleSpecifierEndingPreference(config) {
    switch (config.get('importModuleSpecifierEnding')) {
        case 'minimal': return 'minimal';
        case 'index': return 'index';
        case 'js': return 'js';
        default: return 'auto';
    }
}
function getJsxAttributeCompletionStyle(config) {
    switch (config.get('jsxAttributeCompletionStyle')) {
        case 'braces': return 'braces';
        case 'none': return 'none';
        default: return 'auto';
    }
}


/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
const semver = __webpack_require__(25);
const nls = __webpack_require__(9);
const localize = nls.loadMessageBundle();
class API {
    constructor(
    /**
     * Human readable string for the current version. Displayed in the UI
     */
    displayName, 
    /**
     * Semver version, e.g. '3.9.0'
     */
    version, 
    /**
     * Full version string including pre-release tags, e.g. '3.9.0-beta'
     */
    fullVersionString) {
        this.displayName = displayName;
        this.version = version;
        this.fullVersionString = fullVersionString;
    }
    static fromSimpleString(value) {
        return new API(value, value, value);
    }
    static fromVersionString(versionString) {
        let version = semver.valid(versionString);
        if (!version) {
            return new API(localize('invalidVersion', 'invalid version'), '1.0.0', '1.0.0');
        }
        // Cut off any prerelease tag since we sometimes consume those on purpose.
        const index = versionString.indexOf('-');
        if (index >= 0) {
            version = version.substr(0, index);
        }
        return new API(versionString, version, versionString);
    }
    eq(other) {
        return semver.eq(this.version, other.version);
    }
    gte(other) {
        return semver.gte(this.version, other.version);
    }
    lt(other) {
        return !this.gte(other);
    }
}
exports.default = API;
API.defaultVersion = API.fromSimpleString('1.0.0');
API.v240 = API.fromSimpleString('2.4.0');
API.v250 = API.fromSimpleString('2.5.0');
API.v260 = API.fromSimpleString('2.6.0');
API.v270 = API.fromSimpleString('2.7.0');
API.v280 = API.fromSimpleString('2.8.0');
API.v290 = API.fromSimpleString('2.9.0');
API.v291 = API.fromSimpleString('2.9.1');
API.v300 = API.fromSimpleString('3.0.0');
API.v310 = API.fromSimpleString('3.1.0');
API.v314 = API.fromSimpleString('3.1.4');
API.v320 = API.fromSimpleString('3.2.0');
API.v333 = API.fromSimpleString('3.3.3');
API.v340 = API.fromSimpleString('3.4.0');
API.v345 = API.fromSimpleString('3.4.5');
API.v350 = API.fromSimpleString('3.5.0');
API.v380 = API.fromSimpleString('3.8.0');
API.v381 = API.fromSimpleString('3.8.1');
API.v390 = API.fromSimpleString('3.9.0');
API.v400 = API.fromSimpleString('4.0.0');
API.v401 = API.fromSimpleString('4.0.1');
API.v420 = API.fromSimpleString('4.2.0');
API.v430 = API.fromSimpleString('4.3.0');
API.v440 = API.fromSimpleString('4.4.0');


/***/ }),
/* 25 */
/***/ ((module, exports) => {

exports = module.exports = SemVer;

// The debug function is excluded entirely from the minified version.
/* nomin */ var debug;
/* nomin */ if (typeof process === 'object' &&
    /* nomin */ {} &&
    /* nomin */ {}.NODE_DEBUG &&
    /* nomin */ /\bsemver\b/i.test({}.NODE_DEBUG))
  /* nomin */ debug = function() {
    /* nomin */ var args = Array.prototype.slice.call(arguments, 0);
    /* nomin */ args.unshift('SEMVER');
    /* nomin */ console.log.apply(console, args);
    /* nomin */ };
/* nomin */ else
  /* nomin */ debug = function() {};

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
exports.SEMVER_SPEC_VERSION = '2.0.0';

var MAX_LENGTH = 256;
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;

// Max safe segment length for coercion.
var MAX_SAFE_COMPONENT_LENGTH = 16;

// The actual regexps go on exports.re
var re = exports.re = [];
var src = exports.src = [];
var R = 0;

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

var NUMERICIDENTIFIER = R++;
src[NUMERICIDENTIFIER] = '0|[1-9]\\d*';
var NUMERICIDENTIFIERLOOSE = R++;
src[NUMERICIDENTIFIERLOOSE] = '[0-9]+';


// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

var NONNUMERICIDENTIFIER = R++;
src[NONNUMERICIDENTIFIER] = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';


// ## Main Version
// Three dot-separated numeric identifiers.

var MAINVERSION = R++;
src[MAINVERSION] = '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')';

var MAINVERSIONLOOSE = R++;
src[MAINVERSIONLOOSE] = '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')';

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

var PRERELEASEIDENTIFIER = R++;
src[PRERELEASEIDENTIFIER] = '(?:' + src[NUMERICIDENTIFIER] +
                            '|' + src[NONNUMERICIDENTIFIER] + ')';

var PRERELEASEIDENTIFIERLOOSE = R++;
src[PRERELEASEIDENTIFIERLOOSE] = '(?:' + src[NUMERICIDENTIFIERLOOSE] +
                                 '|' + src[NONNUMERICIDENTIFIER] + ')';


// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

var PRERELEASE = R++;
src[PRERELEASE] = '(?:-(' + src[PRERELEASEIDENTIFIER] +
                  '(?:\\.' + src[PRERELEASEIDENTIFIER] + ')*))';

var PRERELEASELOOSE = R++;
src[PRERELEASELOOSE] = '(?:-?(' + src[PRERELEASEIDENTIFIERLOOSE] +
                       '(?:\\.' + src[PRERELEASEIDENTIFIERLOOSE] + ')*))';

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

var BUILDIDENTIFIER = R++;
src[BUILDIDENTIFIER] = '[0-9A-Za-z-]+';

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

var BUILD = R++;
src[BUILD] = '(?:\\+(' + src[BUILDIDENTIFIER] +
             '(?:\\.' + src[BUILDIDENTIFIER] + ')*))';


// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

var FULL = R++;
var FULLPLAIN = 'v?' + src[MAINVERSION] +
                src[PRERELEASE] + '?' +
                src[BUILD] + '?';

src[FULL] = '^' + FULLPLAIN + '$';

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
var LOOSEPLAIN = '[v=\\s]*' + src[MAINVERSIONLOOSE] +
                 src[PRERELEASELOOSE] + '?' +
                 src[BUILD] + '?';

var LOOSE = R++;
src[LOOSE] = '^' + LOOSEPLAIN + '$';

var GTLT = R++;
src[GTLT] = '((?:<|>)?=?)';

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
var XRANGEIDENTIFIERLOOSE = R++;
src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + '|x|X|\\*';
var XRANGEIDENTIFIER = R++;
src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + '|x|X|\\*';

var XRANGEPLAIN = R++;
src[XRANGEPLAIN] = '[v=\\s]*(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:' + src[PRERELEASE] + ')?' +
                   src[BUILD] + '?' +
                   ')?)?';

var XRANGEPLAINLOOSE = R++;
src[XRANGEPLAINLOOSE] = '[v=\\s]*(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:' + src[PRERELEASELOOSE] + ')?' +
                        src[BUILD] + '?' +
                        ')?)?';

var XRANGE = R++;
src[XRANGE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAIN] + '$';
var XRANGELOOSE = R++;
src[XRANGELOOSE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAINLOOSE] + '$';

// Coercion.
// Extract anything that could conceivably be a part of a valid semver
var COERCE = R++;
src[COERCE] = '(?:^|[^\\d])' +
              '(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '})' +
              '(?:\\.(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '}))?' +
              '(?:\\.(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '}))?' +
              '(?:$|[^\\d])';

// Tilde ranges.
// Meaning is "reasonably at or greater than"
var LONETILDE = R++;
src[LONETILDE] = '(?:~>?)';

var TILDETRIM = R++;
src[TILDETRIM] = '(\\s*)' + src[LONETILDE] + '\\s+';
re[TILDETRIM] = new RegExp(src[TILDETRIM], 'g');
var tildeTrimReplace = '$1~';

var TILDE = R++;
src[TILDE] = '^' + src[LONETILDE] + src[XRANGEPLAIN] + '$';
var TILDELOOSE = R++;
src[TILDELOOSE] = '^' + src[LONETILDE] + src[XRANGEPLAINLOOSE] + '$';

// Caret ranges.
// Meaning is "at least and backwards compatible with"
var LONECARET = R++;
src[LONECARET] = '(?:\\^)';

var CARETTRIM = R++;
src[CARETTRIM] = '(\\s*)' + src[LONECARET] + '\\s+';
re[CARETTRIM] = new RegExp(src[CARETTRIM], 'g');
var caretTrimReplace = '$1^';

var CARET = R++;
src[CARET] = '^' + src[LONECARET] + src[XRANGEPLAIN] + '$';
var CARETLOOSE = R++;
src[CARETLOOSE] = '^' + src[LONECARET] + src[XRANGEPLAINLOOSE] + '$';

// A simple gt/lt/eq thing, or just "" to indicate "any version"
var COMPARATORLOOSE = R++;
src[COMPARATORLOOSE] = '^' + src[GTLT] + '\\s*(' + LOOSEPLAIN + ')$|^$';
var COMPARATOR = R++;
src[COMPARATOR] = '^' + src[GTLT] + '\\s*(' + FULLPLAIN + ')$|^$';


// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
var COMPARATORTRIM = R++;
src[COMPARATORTRIM] = '(\\s*)' + src[GTLT] +
                      '\\s*(' + LOOSEPLAIN + '|' + src[XRANGEPLAIN] + ')';

// this one has to use the /g flag
re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], 'g');
var comparatorTrimReplace = '$1$2$3';


// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
var HYPHENRANGE = R++;
src[HYPHENRANGE] = '^\\s*(' + src[XRANGEPLAIN] + ')' +
                   '\\s+-\\s+' +
                   '(' + src[XRANGEPLAIN] + ')' +
                   '\\s*$';

var HYPHENRANGELOOSE = R++;
src[HYPHENRANGELOOSE] = '^\\s*(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s+-\\s+' +
                        '(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s*$';

// Star ranges basically just allow anything at all.
var STAR = R++;
src[STAR] = '(<|>)?=?\\s*\\*';

// Compile to actual regexp objects.
// All are flag-free, unless they were created above with a flag.
for (var i = 0; i < R; i++) {
  debug(i, src[i]);
  if (!re[i])
    re[i] = new RegExp(src[i]);
}

exports.parse = parse;
function parse(version, loose) {
  if (version instanceof SemVer)
    return version;

  if (typeof version !== 'string')
    return null;

  if (version.length > MAX_LENGTH)
    return null;

  var r = loose ? re[LOOSE] : re[FULL];
  if (!r.test(version))
    return null;

  try {
    return new SemVer(version, loose);
  } catch (er) {
    return null;
  }
}

exports.valid = valid;
function valid(version, loose) {
  var v = parse(version, loose);
  return v ? v.version : null;
}


exports.clean = clean;
function clean(version, loose) {
  var s = parse(version.trim().replace(/^[=v]+/, ''), loose);
  return s ? s.version : null;
}

exports.SemVer = SemVer;

function SemVer(version, loose) {
  if (version instanceof SemVer) {
    if (version.loose === loose)
      return version;
    else
      version = version.version;
  } else if (typeof version !== 'string') {
    throw new TypeError('Invalid Version: ' + version);
  }

  if (version.length > MAX_LENGTH)
    throw new TypeError('version is longer than ' + MAX_LENGTH + ' characters')

  if (!(this instanceof SemVer))
    return new SemVer(version, loose);

  debug('SemVer', version, loose);
  this.loose = loose;
  var m = version.trim().match(loose ? re[LOOSE] : re[FULL]);

  if (!m)
    throw new TypeError('Invalid Version: ' + version);

  this.raw = version;

  // these are actually numbers
  this.major = +m[1];
  this.minor = +m[2];
  this.patch = +m[3];

  if (this.major > MAX_SAFE_INTEGER || this.major < 0)
    throw new TypeError('Invalid major version')

  if (this.minor > MAX_SAFE_INTEGER || this.minor < 0)
    throw new TypeError('Invalid minor version')

  if (this.patch > MAX_SAFE_INTEGER || this.patch < 0)
    throw new TypeError('Invalid patch version')

  // numberify any prerelease numeric ids
  if (!m[4])
    this.prerelease = [];
  else
    this.prerelease = m[4].split('.').map(function(id) {
      if (/^[0-9]+$/.test(id)) {
        var num = +id;
        if (num >= 0 && num < MAX_SAFE_INTEGER)
          return num;
      }
      return id;
    });

  this.build = m[5] ? m[5].split('.') : [];
  this.format();
}

SemVer.prototype.format = function() {
  this.version = this.major + '.' + this.minor + '.' + this.patch;
  if (this.prerelease.length)
    this.version += '-' + this.prerelease.join('.');
  return this.version;
};

SemVer.prototype.toString = function() {
  return this.version;
};

SemVer.prototype.compare = function(other) {
  debug('SemVer.compare', this.version, this.loose, other);
  if (!(other instanceof SemVer))
    other = new SemVer(other, this.loose);

  return this.compareMain(other) || this.comparePre(other);
};

SemVer.prototype.compareMain = function(other) {
  if (!(other instanceof SemVer))
    other = new SemVer(other, this.loose);

  return compareIdentifiers(this.major, other.major) ||
         compareIdentifiers(this.minor, other.minor) ||
         compareIdentifiers(this.patch, other.patch);
};

SemVer.prototype.comparePre = function(other) {
  if (!(other instanceof SemVer))
    other = new SemVer(other, this.loose);

  // NOT having a prerelease is > having one
  if (this.prerelease.length && !other.prerelease.length)
    return -1;
  else if (!this.prerelease.length && other.prerelease.length)
    return 1;
  else if (!this.prerelease.length && !other.prerelease.length)
    return 0;

  var i = 0;
  do {
    var a = this.prerelease[i];
    var b = other.prerelease[i];
    debug('prerelease compare', i, a, b);
    if (a === undefined && b === undefined)
      return 0;
    else if (b === undefined)
      return 1;
    else if (a === undefined)
      return -1;
    else if (a === b)
      continue;
    else
      return compareIdentifiers(a, b);
  } while (++i);
};

// preminor will bump the version up to the next minor release, and immediately
// down to pre-release. premajor and prepatch work the same way.
SemVer.prototype.inc = function(release, identifier) {
  switch (release) {
    case 'premajor':
      this.prerelease.length = 0;
      this.patch = 0;
      this.minor = 0;
      this.major++;
      this.inc('pre', identifier);
      break;
    case 'preminor':
      this.prerelease.length = 0;
      this.patch = 0;
      this.minor++;
      this.inc('pre', identifier);
      break;
    case 'prepatch':
      // If this is already a prerelease, it will bump to the next version
      // drop any prereleases that might already exist, since they are not
      // relevant at this point.
      this.prerelease.length = 0;
      this.inc('patch', identifier);
      this.inc('pre', identifier);
      break;
    // If the input is a non-prerelease version, this acts the same as
    // prepatch.
    case 'prerelease':
      if (this.prerelease.length === 0)
        this.inc('patch', identifier);
      this.inc('pre', identifier);
      break;

    case 'major':
      // If this is a pre-major version, bump up to the same major version.
      // Otherwise increment major.
      // 1.0.0-5 bumps to 1.0.0
      // 1.1.0 bumps to 2.0.0
      if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0)
        this.major++;
      this.minor = 0;
      this.patch = 0;
      this.prerelease = [];
      break;
    case 'minor':
      // If this is a pre-minor version, bump up to the same minor version.
      // Otherwise increment minor.
      // 1.2.0-5 bumps to 1.2.0
      // 1.2.1 bumps to 1.3.0
      if (this.patch !== 0 || this.prerelease.length === 0)
        this.minor++;
      this.patch = 0;
      this.prerelease = [];
      break;
    case 'patch':
      // If this is not a pre-release version, it will increment the patch.
      // If it is a pre-release it will bump up to the same patch version.
      // 1.2.0-5 patches to 1.2.0
      // 1.2.0 patches to 1.2.1
      if (this.prerelease.length === 0)
        this.patch++;
      this.prerelease = [];
      break;
    // This probably shouldn't be used publicly.
    // 1.0.0 "pre" would become 1.0.0-0 which is the wrong direction.
    case 'pre':
      if (this.prerelease.length === 0)
        this.prerelease = [0];
      else {
        var i = this.prerelease.length;
        while (--i >= 0) {
          if (typeof this.prerelease[i] === 'number') {
            this.prerelease[i]++;
            i = -2;
          }
        }
        if (i === -1) // didn't increment anything
          this.prerelease.push(0);
      }
      if (identifier) {
        // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
        // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
        if (this.prerelease[0] === identifier) {
          if (isNaN(this.prerelease[1]))
            this.prerelease = [identifier, 0];
        } else
          this.prerelease = [identifier, 0];
      }
      break;

    default:
      throw new Error('invalid increment argument: ' + release);
  }
  this.format();
  this.raw = this.version;
  return this;
};

exports.inc = inc;
function inc(version, release, loose, identifier) {
  if (typeof(loose) === 'string') {
    identifier = loose;
    loose = undefined;
  }

  try {
    return new SemVer(version, loose).inc(release, identifier).version;
  } catch (er) {
    return null;
  }
}

exports.diff = diff;
function diff(version1, version2) {
  if (eq(version1, version2)) {
    return null;
  } else {
    var v1 = parse(version1);
    var v2 = parse(version2);
    if (v1.prerelease.length || v2.prerelease.length) {
      for (var key in v1) {
        if (key === 'major' || key === 'minor' || key === 'patch') {
          if (v1[key] !== v2[key]) {
            return 'pre'+key;
          }
        }
      }
      return 'prerelease';
    }
    for (var key in v1) {
      if (key === 'major' || key === 'minor' || key === 'patch') {
        if (v1[key] !== v2[key]) {
          return key;
        }
      }
    }
  }
}

exports.compareIdentifiers = compareIdentifiers;

var numeric = /^[0-9]+$/;
function compareIdentifiers(a, b) {
  var anum = numeric.test(a);
  var bnum = numeric.test(b);

  if (anum && bnum) {
    a = +a;
    b = +b;
  }

  return (anum && !bnum) ? -1 :
         (bnum && !anum) ? 1 :
         a < b ? -1 :
         a > b ? 1 :
         0;
}

exports.rcompareIdentifiers = rcompareIdentifiers;
function rcompareIdentifiers(a, b) {
  return compareIdentifiers(b, a);
}

exports.major = major;
function major(a, loose) {
  return new SemVer(a, loose).major;
}

exports.minor = minor;
function minor(a, loose) {
  return new SemVer(a, loose).minor;
}

exports.patch = patch;
function patch(a, loose) {
  return new SemVer(a, loose).patch;
}

exports.compare = compare;
function compare(a, b, loose) {
  return new SemVer(a, loose).compare(new SemVer(b, loose));
}

exports.compareLoose = compareLoose;
function compareLoose(a, b) {
  return compare(a, b, true);
}

exports.rcompare = rcompare;
function rcompare(a, b, loose) {
  return compare(b, a, loose);
}

exports.sort = sort;
function sort(list, loose) {
  return list.sort(function(a, b) {
    return exports.compare(a, b, loose);
  });
}

exports.rsort = rsort;
function rsort(list, loose) {
  return list.sort(function(a, b) {
    return exports.rcompare(a, b, loose);
  });
}

exports.gt = gt;
function gt(a, b, loose) {
  return compare(a, b, loose) > 0;
}

exports.lt = lt;
function lt(a, b, loose) {
  return compare(a, b, loose) < 0;
}

exports.eq = eq;
function eq(a, b, loose) {
  return compare(a, b, loose) === 0;
}

exports.neq = neq;
function neq(a, b, loose) {
  return compare(a, b, loose) !== 0;
}

exports.gte = gte;
function gte(a, b, loose) {
  return compare(a, b, loose) >= 0;
}

exports.lte = lte;
function lte(a, b, loose) {
  return compare(a, b, loose) <= 0;
}

exports.cmp = cmp;
function cmp(a, op, b, loose) {
  var ret;
  switch (op) {
    case '===':
      if (typeof a === 'object') a = a.version;
      if (typeof b === 'object') b = b.version;
      ret = a === b;
      break;
    case '!==':
      if (typeof a === 'object') a = a.version;
      if (typeof b === 'object') b = b.version;
      ret = a !== b;
      break;
    case '': case '=': case '==': ret = eq(a, b, loose); break;
    case '!=': ret = neq(a, b, loose); break;
    case '>': ret = gt(a, b, loose); break;
    case '>=': ret = gte(a, b, loose); break;
    case '<': ret = lt(a, b, loose); break;
    case '<=': ret = lte(a, b, loose); break;
    default: throw new TypeError('Invalid operator: ' + op);
  }
  return ret;
}

exports.Comparator = Comparator;
function Comparator(comp, loose) {
  if (comp instanceof Comparator) {
    if (comp.loose === loose)
      return comp;
    else
      comp = comp.value;
  }

  if (!(this instanceof Comparator))
    return new Comparator(comp, loose);

  debug('comparator', comp, loose);
  this.loose = loose;
  this.parse(comp);

  if (this.semver === ANY)
    this.value = '';
  else
    this.value = this.operator + this.semver.version;

  debug('comp', this);
}

var ANY = {};
Comparator.prototype.parse = function(comp) {
  var r = this.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
  var m = comp.match(r);

  if (!m)
    throw new TypeError('Invalid comparator: ' + comp);

  this.operator = m[1];
  if (this.operator === '=')
    this.operator = '';

  // if it literally is just '>' or '' then allow anything.
  if (!m[2])
    this.semver = ANY;
  else
    this.semver = new SemVer(m[2], this.loose);
};

Comparator.prototype.toString = function() {
  return this.value;
};

Comparator.prototype.test = function(version) {
  debug('Comparator.test', version, this.loose);

  if (this.semver === ANY)
    return true;

  if (typeof version === 'string')
    version = new SemVer(version, this.loose);

  return cmp(version, this.operator, this.semver, this.loose);
};

Comparator.prototype.intersects = function(comp, loose) {
  if (!(comp instanceof Comparator)) {
    throw new TypeError('a Comparator is required');
  }

  var rangeTmp;

  if (this.operator === '') {
    rangeTmp = new Range(comp.value, loose);
    return satisfies(this.value, rangeTmp, loose);
  } else if (comp.operator === '') {
    rangeTmp = new Range(this.value, loose);
    return satisfies(comp.semver, rangeTmp, loose);
  }

  var sameDirectionIncreasing =
    (this.operator === '>=' || this.operator === '>') &&
    (comp.operator === '>=' || comp.operator === '>');
  var sameDirectionDecreasing =
    (this.operator === '<=' || this.operator === '<') &&
    (comp.operator === '<=' || comp.operator === '<');
  var sameSemVer = this.semver.version === comp.semver.version;
  var differentDirectionsInclusive =
    (this.operator === '>=' || this.operator === '<=') &&
    (comp.operator === '>=' || comp.operator === '<=');
  var oppositeDirectionsLessThan =
    cmp(this.semver, '<', comp.semver, loose) &&
    ((this.operator === '>=' || this.operator === '>') &&
    (comp.operator === '<=' || comp.operator === '<'));
  var oppositeDirectionsGreaterThan =
    cmp(this.semver, '>', comp.semver, loose) &&
    ((this.operator === '<=' || this.operator === '<') &&
    (comp.operator === '>=' || comp.operator === '>'));

  return sameDirectionIncreasing || sameDirectionDecreasing ||
    (sameSemVer && differentDirectionsInclusive) ||
    oppositeDirectionsLessThan || oppositeDirectionsGreaterThan;
};


exports.Range = Range;
function Range(range, loose) {
  if (range instanceof Range) {
    if (range.loose === loose) {
      return range;
    } else {
      return new Range(range.raw, loose);
    }
  }

  if (range instanceof Comparator) {
    return new Range(range.value, loose);
  }

  if (!(this instanceof Range))
    return new Range(range, loose);

  this.loose = loose;

  // First, split based on boolean or ||
  this.raw = range;
  this.set = range.split(/\s*\|\|\s*/).map(function(range) {
    return this.parseRange(range.trim());
  }, this).filter(function(c) {
    // throw out any that are not relevant for whatever reason
    return c.length;
  });

  if (!this.set.length) {
    throw new TypeError('Invalid SemVer Range: ' + range);
  }

  this.format();
}

Range.prototype.format = function() {
  this.range = this.set.map(function(comps) {
    return comps.join(' ').trim();
  }).join('||').trim();
  return this.range;
};

Range.prototype.toString = function() {
  return this.range;
};

Range.prototype.parseRange = function(range) {
  var loose = this.loose;
  range = range.trim();
  debug('range', range, loose);
  // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
  var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
  range = range.replace(hr, hyphenReplace);
  debug('hyphen replace', range);
  // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
  range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
  debug('comparator trim', range, re[COMPARATORTRIM]);

  // `~ 1.2.3` => `~1.2.3`
  range = range.replace(re[TILDETRIM], tildeTrimReplace);

  // `^ 1.2.3` => `^1.2.3`
  range = range.replace(re[CARETTRIM], caretTrimReplace);

  // normalize spaces
  range = range.split(/\s+/).join(' ');

  // At this point, the range is completely trimmed and
  // ready to be split into comparators.

  var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
  var set = range.split(' ').map(function(comp) {
    return parseComparator(comp, loose);
  }).join(' ').split(/\s+/);
  if (this.loose) {
    // in loose mode, throw out any that are not valid comparators
    set = set.filter(function(comp) {
      return !!comp.match(compRe);
    });
  }
  set = set.map(function(comp) {
    return new Comparator(comp, loose);
  });

  return set;
};

Range.prototype.intersects = function(range, loose) {
  if (!(range instanceof Range)) {
    throw new TypeError('a Range is required');
  }

  return this.set.some(function(thisComparators) {
    return thisComparators.every(function(thisComparator) {
      return range.set.some(function(rangeComparators) {
        return rangeComparators.every(function(rangeComparator) {
          return thisComparator.intersects(rangeComparator, loose);
        });
      });
    });
  });
};

// Mostly just for testing and legacy API reasons
exports.toComparators = toComparators;
function toComparators(range, loose) {
  return new Range(range, loose).set.map(function(comp) {
    return comp.map(function(c) {
      return c.value;
    }).join(' ').trim().split(' ');
  });
}

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
function parseComparator(comp, loose) {
  debug('comp', comp);
  comp = replaceCarets(comp, loose);
  debug('caret', comp);
  comp = replaceTildes(comp, loose);
  debug('tildes', comp);
  comp = replaceXRanges(comp, loose);
  debug('xrange', comp);
  comp = replaceStars(comp, loose);
  debug('stars', comp);
  return comp;
}

function isX(id) {
  return !id || id.toLowerCase() === 'x' || id === '*';
}

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
function replaceTildes(comp, loose) {
  return comp.trim().split(/\s+/).map(function(comp) {
    return replaceTilde(comp, loose);
  }).join(' ');
}

function replaceTilde(comp, loose) {
  var r = loose ? re[TILDELOOSE] : re[TILDE];
  return comp.replace(r, function(_, M, m, p, pr) {
    debug('tilde', comp, _, M, m, p, pr);
    var ret;

    if (isX(M))
      ret = '';
    else if (isX(m))
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    else if (isX(p))
      // ~1.2 == >=1.2.0 <1.3.0
      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
    else if (pr) {
      debug('replaceTilde pr', pr);
      if (pr.charAt(0) !== '-')
        pr = '-' + pr;
      ret = '>=' + M + '.' + m + '.' + p + pr +
            ' <' + M + '.' + (+m + 1) + '.0';
    } else
      // ~1.2.3 == >=1.2.3 <1.3.0
      ret = '>=' + M + '.' + m + '.' + p +
            ' <' + M + '.' + (+m + 1) + '.0';

    debug('tilde return', ret);
    return ret;
  });
}

// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
// ^1.2.3 --> >=1.2.3 <2.0.0
// ^1.2.0 --> >=1.2.0 <2.0.0
function replaceCarets(comp, loose) {
  return comp.trim().split(/\s+/).map(function(comp) {
    return replaceCaret(comp, loose);
  }).join(' ');
}

function replaceCaret(comp, loose) {
  debug('caret', comp, loose);
  var r = loose ? re[CARETLOOSE] : re[CARET];
  return comp.replace(r, function(_, M, m, p, pr) {
    debug('caret', comp, _, M, m, p, pr);
    var ret;

    if (isX(M))
      ret = '';
    else if (isX(m))
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    else if (isX(p)) {
      if (M === '0')
        ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
      else
        ret = '>=' + M + '.' + m + '.0 <' + (+M + 1) + '.0.0';
    } else if (pr) {
      debug('replaceCaret pr', pr);
      if (pr.charAt(0) !== '-')
        pr = '-' + pr;
      if (M === '0') {
        if (m === '0')
          ret = '>=' + M + '.' + m + '.' + p + pr +
                ' <' + M + '.' + m + '.' + (+p + 1);
        else
          ret = '>=' + M + '.' + m + '.' + p + pr +
                ' <' + M + '.' + (+m + 1) + '.0';
      } else
        ret = '>=' + M + '.' + m + '.' + p + pr +
              ' <' + (+M + 1) + '.0.0';
    } else {
      debug('no pr');
      if (M === '0') {
        if (m === '0')
          ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + m + '.' + (+p + 1);
        else
          ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + (+m + 1) + '.0';
      } else
        ret = '>=' + M + '.' + m + '.' + p +
              ' <' + (+M + 1) + '.0.0';
    }

    debug('caret return', ret);
    return ret;
  });
}

function replaceXRanges(comp, loose) {
  debug('replaceXRanges', comp, loose);
  return comp.split(/\s+/).map(function(comp) {
    return replaceXRange(comp, loose);
  }).join(' ');
}

function replaceXRange(comp, loose) {
  comp = comp.trim();
  var r = loose ? re[XRANGELOOSE] : re[XRANGE];
  return comp.replace(r, function(ret, gtlt, M, m, p, pr) {
    debug('xRange', comp, ret, gtlt, M, m, p, pr);
    var xM = isX(M);
    var xm = xM || isX(m);
    var xp = xm || isX(p);
    var anyX = xp;

    if (gtlt === '=' && anyX)
      gtlt = '';

    if (xM) {
      if (gtlt === '>' || gtlt === '<') {
        // nothing is allowed
        ret = '<0.0.0';
      } else {
        // nothing is forbidden
        ret = '*';
      }
    } else if (gtlt && anyX) {
      // replace X with 0
      if (xm)
        m = 0;
      if (xp)
        p = 0;

      if (gtlt === '>') {
        // >1 => >=2.0.0
        // >1.2 => >=1.3.0
        // >1.2.3 => >= 1.2.4
        gtlt = '>=';
        if (xm) {
          M = +M + 1;
          m = 0;
          p = 0;
        } else if (xp) {
          m = +m + 1;
          p = 0;
        }
      } else if (gtlt === '<=') {
        // <=0.7.x is actually <0.8.0, since any 0.7.x should
        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
        gtlt = '<';
        if (xm)
          M = +M + 1;
        else
          m = +m + 1;
      }

      ret = gtlt + M + '.' + m + '.' + p;
    } else if (xm) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    } else if (xp) {
      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
    }

    debug('xRange return', ret);

    return ret;
  });
}

// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
function replaceStars(comp, loose) {
  debug('replaceStars', comp, loose);
  // Looseness is ignored here.  star is always as loose as it gets!
  return comp.trim().replace(re[STAR], '');
}

// This function is passed to string.replace(re[HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0
function hyphenReplace($0,
                       from, fM, fm, fp, fpr, fb,
                       to, tM, tm, tp, tpr, tb) {

  if (isX(fM))
    from = '';
  else if (isX(fm))
    from = '>=' + fM + '.0.0';
  else if (isX(fp))
    from = '>=' + fM + '.' + fm + '.0';
  else
    from = '>=' + from;

  if (isX(tM))
    to = '';
  else if (isX(tm))
    to = '<' + (+tM + 1) + '.0.0';
  else if (isX(tp))
    to = '<' + tM + '.' + (+tm + 1) + '.0';
  else if (tpr)
    to = '<=' + tM + '.' + tm + '.' + tp + '-' + tpr;
  else
    to = '<=' + to;

  return (from + ' ' + to).trim();
}


// if ANY of the sets match ALL of its comparators, then pass
Range.prototype.test = function(version) {
  if (!version)
    return false;

  if (typeof version === 'string')
    version = new SemVer(version, this.loose);

  for (var i = 0; i < this.set.length; i++) {
    if (testSet(this.set[i], version))
      return true;
  }
  return false;
};

function testSet(set, version) {
  for (var i = 0; i < set.length; i++) {
    if (!set[i].test(version))
      return false;
  }

  if (version.prerelease.length) {
    // Find the set of versions that are allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (var i = 0; i < set.length; i++) {
      debug(set[i].semver);
      if (set[i].semver === ANY)
        continue;

      if (set[i].semver.prerelease.length > 0) {
        var allowed = set[i].semver;
        if (allowed.major === version.major &&
            allowed.minor === version.minor &&
            allowed.patch === version.patch)
          return true;
      }
    }

    // Version has a -pre, but it's not one of the ones we like.
    return false;
  }

  return true;
}

exports.satisfies = satisfies;
function satisfies(version, range, loose) {
  try {
    range = new Range(range, loose);
  } catch (er) {
    return false;
  }
  return range.test(version);
}

exports.maxSatisfying = maxSatisfying;
function maxSatisfying(versions, range, loose) {
  var max = null;
  var maxSV = null;
  try {
    var rangeObj = new Range(range, loose);
  } catch (er) {
    return null;
  }
  versions.forEach(function (v) {
    if (rangeObj.test(v)) { // satisfies(v, range, loose)
      if (!max || maxSV.compare(v) === -1) { // compare(max, v, true)
        max = v;
        maxSV = new SemVer(max, loose);
      }
    }
  })
  return max;
}

exports.minSatisfying = minSatisfying;
function minSatisfying(versions, range, loose) {
  var min = null;
  var minSV = null;
  try {
    var rangeObj = new Range(range, loose);
  } catch (er) {
    return null;
  }
  versions.forEach(function (v) {
    if (rangeObj.test(v)) { // satisfies(v, range, loose)
      if (!min || minSV.compare(v) === 1) { // compare(min, v, true)
        min = v;
        minSV = new SemVer(min, loose);
      }
    }
  })
  return min;
}

exports.validRange = validRange;
function validRange(range, loose) {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range, loose).range || '*';
  } catch (er) {
    return null;
  }
}

// Determine if version is less than all the versions possible in the range
exports.ltr = ltr;
function ltr(version, range, loose) {
  return outside(version, range, '<', loose);
}

// Determine if version is greater than all the versions possible in the range.
exports.gtr = gtr;
function gtr(version, range, loose) {
  return outside(version, range, '>', loose);
}

exports.outside = outside;
function outside(version, range, hilo, loose) {
  version = new SemVer(version, loose);
  range = new Range(range, loose);

  var gtfn, ltefn, ltfn, comp, ecomp;
  switch (hilo) {
    case '>':
      gtfn = gt;
      ltefn = lte;
      ltfn = lt;
      comp = '>';
      ecomp = '>=';
      break;
    case '<':
      gtfn = lt;
      ltefn = gte;
      ltfn = gt;
      comp = '<';
      ecomp = '<=';
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }

  // If it satisifes the range it is not outside
  if (satisfies(version, range, loose)) {
    return false;
  }

  // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.

  for (var i = 0; i < range.set.length; ++i) {
    var comparators = range.set[i];

    var high = null;
    var low = null;

    comparators.forEach(function(comparator) {
      if (comparator.semver === ANY) {
        comparator = new Comparator('>=0.0.0')
      }
      high = high || comparator;
      low = low || comparator;
      if (gtfn(comparator.semver, high.semver, loose)) {
        high = comparator;
      } else if (ltfn(comparator.semver, low.semver, loose)) {
        low = comparator;
      }
    });

    // If the edge version comparator has a operator then our version
    // isn't outside it
    if (high.operator === comp || high.operator === ecomp) {
      return false;
    }

    // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range
    if ((!low.operator || low.operator === comp) &&
        ltefn(version, low.semver)) {
      return false;
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false;
    }
  }
  return true;
}

exports.prerelease = prerelease;
function prerelease(version, loose) {
  var parsed = parse(version, loose);
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null;
}

exports.intersects = intersects;
function intersects(r1, r2, loose) {
  r1 = new Range(r1, loose)
  r2 = new Range(r2, loose)
  return r1.intersects(r2)
}

exports.coerce = coerce;
function coerce(version) {
  if (version instanceof SemVer)
    return version;

  if (typeof version !== 'string')
    return null;

  var match = version.match(re[COERCE]);

  if (match == null)
    return null;

  return parse((match[1] || '0') + '.' + (match[2] || '0') + '.' + (match[3] || '0')); 
}


/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.disabledSchemes = exports.semanticSupportedSchemes = exports.vscodeVfs = exports.memFs = exports.vscodeNotebookCell = exports.walkThroughSnippet = exports.vsls = exports.git = exports.untitled = exports.file = void 0;
exports.file = 'file';
exports.untitled = 'untitled';
exports.git = 'git';
/** Live share scheme */
exports.vsls = 'vsls';
exports.walkThroughSnippet = 'walkThroughSnippet';
exports.vscodeNotebookCell = 'vscode-notebook-cell';
exports.memFs = 'memfs';
exports.vscodeVfs = 'vscode-vfs';
exports.semanticSupportedSchemes = [
    exports.file,
    exports.untitled,
    exports.walkThroughSnippet,
    exports.vscodeNotebookCell,
];
/**
 * File scheme for which JS/TS language feature should be disabled
 */
exports.disabledSchemes = new Set([
    exports.git,
    exports.vsls
]);


/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.equals = void 0;
const array = __webpack_require__(28);
function equals(one, other) {
    if (one === other) {
        return true;
    }
    if (one === null || one === undefined || other === null || other === undefined) {
        return false;
    }
    if (typeof one !== typeof other) {
        return false;
    }
    if (typeof one !== 'object') {
        return false;
    }
    if (Array.isArray(one) !== Array.isArray(other)) {
        return false;
    }
    if (Array.isArray(one)) {
        return array.equals(one, other, equals);
    }
    else {
        const oneKeys = [];
        for (const key in one) {
            oneKeys.push(key);
        }
        oneKeys.sort();
        const otherKeys = [];
        for (const key in other) {
            otherKeys.push(key);
        }
        otherKeys.sort();
        if (!array.equals(oneKeys, otherKeys)) {
            return false;
        }
        return oneKeys.every(key => equals(one[key], other[key]));
    }
}
exports.equals = equals;


/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.coalesce = exports.flatten = exports.equals = exports.empty = void 0;
exports.empty = Object.freeze([]);
function equals(a, b, itemEquals = (a, b) => a === b) {
    if (a === b) {
        return true;
    }
    if (a.length !== b.length) {
        return false;
    }
    return a.every((x, i) => itemEquals(x, b[i]));
}
exports.equals = equals;
function flatten(array) {
    return Array.prototype.concat.apply([], array);
}
exports.flatten = flatten;
function coalesce(array) {
    return array.filter(e => !!e);
}
exports.coalesce = coalesce;


/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResourceMap = void 0;
const fileSchemes = __webpack_require__(26);
/**
 * Maps of file resources
 *
 * Attempts to handle correct mapping on both case sensitive and case in-sensitive
 * file systems.
 */
class ResourceMap {
    constructor(_normalizePath = ResourceMap.defaultPathNormalizer, config) {
        this._normalizePath = _normalizePath;
        this.config = config;
        this._map = new Map();
    }
    get size() {
        return this._map.size;
    }
    has(resource) {
        const file = this.toKey(resource);
        return !!file && this._map.has(file);
    }
    get(resource) {
        const file = this.toKey(resource);
        if (!file) {
            return undefined;
        }
        const entry = this._map.get(file);
        return entry ? entry.value : undefined;
    }
    set(resource, value) {
        const file = this.toKey(resource);
        if (!file) {
            return;
        }
        const entry = this._map.get(file);
        if (entry) {
            entry.value = value;
        }
        else {
            this._map.set(file, { resource, value });
        }
    }
    delete(resource) {
        const file = this.toKey(resource);
        if (file) {
            this._map.delete(file);
        }
    }
    clear() {
        this._map.clear();
    }
    get values() {
        return Array.from(this._map.values(), x => x.value);
    }
    get entries() {
        return this._map.values();
    }
    toKey(resource) {
        const key = this._normalizePath(resource);
        if (!key) {
            return key;
        }
        return this.isCaseInsensitivePath(key) ? key.toLowerCase() : key;
    }
    isCaseInsensitivePath(path) {
        if (isWindowsPath(path)) {
            return true;
        }
        return path[0] === '/' && this.config.onCaseInsensitiveFileSystem;
    }
}
exports.ResourceMap = ResourceMap;
ResourceMap.defaultPathNormalizer = (resource) => {
    if (resource.scheme === fileSchemes.file) {
        return resource.fsPath;
    }
    return resource.toString(true);
};
function isWindowsPath(path) {
    return /^[a-zA-Z]:[\/\\]/.test(path);
}


/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
const path_1 = __webpack_require__(8);
const vscode = __webpack_require__(1);
const cachedResponse_1 = __webpack_require__(31);
const typescriptService_1 = __webpack_require__(32);
const dispose_1 = __webpack_require__(20);
const fileSchemes = __webpack_require__(26);
const validateSetting = 'validate.enable';
const suggestionSetting = 'suggestionActions.enabled';
class LanguageProvider extends dispose_1.Disposable {
    constructor(client, description, commandManager, telemetryReporter, typingsStatus, fileConfigurationManager, onCompletionAccepted) {
        super();
        this.client = client;
        this.description = description;
        this.commandManager = commandManager;
        this.telemetryReporter = telemetryReporter;
        this.typingsStatus = typingsStatus;
        this.fileConfigurationManager = fileConfigurationManager;
        this.onCompletionAccepted = onCompletionAccepted;
        vscode.workspace.onDidChangeConfiguration(this.configurationChanged, this, this._disposables);
        this.configurationChanged();
        client.onReady(() => this.registerProviders());
    }
    get documentSelector() {
        const semantic = [];
        const syntax = [];
        for (const language of this.description.modeIds) {
            syntax.push({ language });
            for (const scheme of fileSchemes.semanticSupportedSchemes) {
                semantic.push({ language, scheme });
            }
        }
        return { semantic, syntax };
    }
    async registerProviders() {
        const selector = this.documentSelector;
        const cachedResponse = new cachedResponse_1.CachedResponse();
        await Promise.all([
            Promise.resolve().then(() => __webpack_require__(33)).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __webpack_require__(38)).then(provider => this._register(provider.register(selector, this.description.id, this.client, cachedResponse))),
            Promise.resolve().then(() => __webpack_require__(41)).then(provider => this._register(provider.register(selector, this.description.id, this.client, cachedResponse))),
            Promise.resolve().then(() => __webpack_require__(46)).then(provider => this._register(provider.register(selector, this.description.id, this.client, this.typingsStatus, this.fileConfigurationManager, this.commandManager, this.telemetryReporter, this.onCompletionAccepted))),
            Promise.resolve().then(() => __webpack_require__(50)).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __webpack_require__(52)).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __webpack_require__(53)).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __webpack_require__(54)).then(provider => this._register(provider.register(selector, this.client, cachedResponse))),
            Promise.resolve().then(() => __webpack_require__(55)).then(provider => this._register(provider.register(this.client, this.commandManager))),
            Promise.resolve().then(() => __webpack_require__(56)).then(provider => this._register(provider.register(selector, this.client, this.fileConfigurationManager, this.client.diagnosticsManager))),
            Promise.resolve().then(() => __webpack_require__(59)).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __webpack_require__(60)).then(provider => this._register(provider.register(selector, this.description.id, this.client, this.fileConfigurationManager))),
            Promise.resolve().then(() => __webpack_require__(61)).then(provider => this._register(provider.register(selector, this.client, this.fileConfigurationManager))),
            Promise.resolve().then(() => __webpack_require__(63)).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __webpack_require__(64)).then(provider => this._register(provider.register(selector, this.description.id, this.client, this.fileConfigurationManager))),
            Promise.resolve().then(() => __webpack_require__(65)).then(provider => this._register(provider.register(selector, this.client, this.commandManager, this.fileConfigurationManager, this.telemetryReporter))),
            Promise.resolve().then(() => __webpack_require__(66)).then(provider => this._register(provider.register(selector, this.client, this.fileConfigurationManager, this.commandManager, this.client.diagnosticsManager, this.telemetryReporter))),
            Promise.resolve().then(() => __webpack_require__(68)).then(provider => this._register(provider.register(selector, this.client, this.fileConfigurationManager, this.commandManager, this.telemetryReporter))),
            Promise.resolve().then(() => __webpack_require__(69)).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __webpack_require__(70)).then(provider => this._register(provider.register(selector, this.client, this.fileConfigurationManager))),
            Promise.resolve().then(() => __webpack_require__(71)).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __webpack_require__(72)).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __webpack_require__(73)).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __webpack_require__(74)).then(provider => this._register(provider.register(selector, this.description.id, this.client))),
            Promise.resolve().then(() => __webpack_require__(75)).then(provider => this._register(provider.register(selector, this.client))),
            Promise.resolve().then(() => __webpack_require__(76)).then(provider => this._register(provider.register(selector, this.description.id, this.description.modeIds, this.client, this.fileConfigurationManager))),
        ]);
    }
    configurationChanged() {
        const config = vscode.workspace.getConfiguration(this.id, null);
        this.updateValidate(config.get(validateSetting, true));
        this.updateSuggestionDiagnostics(config.get(suggestionSetting, true));
    }
    handlesUri(resource) {
        const ext = (0, path_1.extname)(resource.path).slice(1).toLowerCase();
        return this.description.standardFileExtensions.includes(ext) || this.handlesConfigFile(resource);
    }
    handlesDocument(doc) {
        return this.description.modeIds.includes(doc.languageId) || this.handlesConfigFile(doc.uri);
    }
    handlesConfigFile(resource) {
        const base = (0, path_1.basename)(resource.fsPath);
        return !!base && (!!this.description.configFilePattern && this.description.configFilePattern.test(base));
    }
    get id() {
        return this.description.id;
    }
    get diagnosticSource() {
        return this.description.diagnosticSource;
    }
    updateValidate(value) {
        this.client.diagnosticsManager.setValidate(this._diagnosticLanguage, value);
    }
    updateSuggestionDiagnostics(value) {
        this.client.diagnosticsManager.setEnableSuggestions(this._diagnosticLanguage, value);
    }
    reInitialize() {
        this.client.diagnosticsManager.reInitialize();
    }
    triggerAllDiagnostics() {
        this.client.bufferSyncSupport.requestAllDiagnostics();
    }
    diagnosticsReceived(diagnosticsKind, file, diagnostics) {
        if (diagnosticsKind !== 0 /* Syntax */ && !this.client.hasCapabilityForResource(file, typescriptService_1.ClientCapability.Semantic)) {
            return;
        }
        const config = vscode.workspace.getConfiguration(this.id, file);
        const reportUnnecessary = config.get('showUnused', true);
        const reportDeprecated = config.get('showDeprecated', true);
        this.client.diagnosticsManager.updateDiagnostics(file, this._diagnosticLanguage, diagnosticsKind, diagnostics.filter(diag => {
            // Don't bother reporting diagnostics we know will not be rendered
            if (!reportUnnecessary) {
                if (diag.reportUnnecessary && diag.severity === vscode.DiagnosticSeverity.Hint) {
                    return false;
                }
            }
            if (!reportDeprecated) {
                if (diag.reportDeprecated && diag.severity === vscode.DiagnosticSeverity.Hint) {
                    return false;
                }
            }
            return true;
        }));
    }
    configFileDiagnosticsReceived(file, diagnostics) {
        this.client.diagnosticsManager.configFileDiagnosticsReceived(file, diagnostics);
    }
    get _diagnosticLanguage() {
        return this.description.diagnosticLanguage;
    }
}
exports.default = LanguageProvider;


/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CachedResponse = void 0;
/**
 * Caches a class of TS Server request based on document.
 */
class CachedResponse {
    constructor() {
        this.version = -1;
        this.document = '';
    }
    /**
     * Execute a request. May return cached value or resolve the new value
     *
     * Caller must ensure that all input `resolve` functions return equivilent results (keyed only off of document).
     */
    execute(document, resolve) {
        if (this.response && this.matches(document)) {
            // Chain so that on cancellation we fall back to the next resolve
            return this.response = this.response.then(result => result.type === 'cancelled' ? resolve() : result);
        }
        return this.reset(document, resolve);
    }
    matches(document) {
        return this.version === document.version && this.document === document.uri.toString();
    }
    async reset(document, resolve) {
        this.version = document.version;
        this.document = document.uri.toString();
        return this.response = resolve();
    }
}
exports.CachedResponse = CachedResponse;


/***/ }),
/* 32 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClientCapabilities = exports.ClientCapability = exports.ServerResponse = exports.ServerType = void 0;
var ServerType;
(function (ServerType) {
    ServerType["Syntax"] = "syntax";
    ServerType["Semantic"] = "semantic";
})(ServerType = exports.ServerType || (exports.ServerType = {}));
var ServerResponse;
(function (ServerResponse) {
    class Cancelled {
        constructor(reason) {
            this.reason = reason;
            this.type = 'cancelled';
        }
    }
    ServerResponse.Cancelled = Cancelled;
    ServerResponse.NoContent = { type: 'noContent' };
})(ServerResponse = exports.ServerResponse || (exports.ServerResponse = {}));
var ClientCapability;
(function (ClientCapability) {
    /**
     * Basic syntax server. All clients should support this.
     */
    ClientCapability[ClientCapability["Syntax"] = 0] = "Syntax";
    /**
     * Advanced syntax server that can provide single file IntelliSense.
     */
    ClientCapability[ClientCapability["EnhancedSyntax"] = 1] = "EnhancedSyntax";
    /**
     * Complete, multi-file semantic server
     */
    ClientCapability[ClientCapability["Semantic"] = 2] = "Semantic";
})(ClientCapability = exports.ClientCapability || (exports.ClientCapability = {}));
class ClientCapabilities {
    constructor(...capabilities) {
        this.capabilities = new Set(capabilities);
    }
    has(capability) {
        return this.capabilities.has(capability);
    }
}
exports.ClientCapabilities = ClientCapabilities;


/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const path = __webpack_require__(8);
const vscode = __webpack_require__(1);
const PConst = __webpack_require__(34);
const typescriptService_1 = __webpack_require__(32);
const api_1 = __webpack_require__(24);
const dependentRegistration_1 = __webpack_require__(35);
const modifiers_1 = __webpack_require__(36);
const typeConverters = __webpack_require__(37);
class TypeScriptCallHierarchySupport {
    constructor(client) {
        this.client = client;
    }
    async prepareCallHierarchy(document, position, token) {
        const filepath = this.client.toOpenedFilePath(document);
        if (!filepath) {
            return undefined;
        }
        const args = typeConverters.Position.toFileLocationRequestArgs(filepath, position);
        const response = await this.client.execute('prepareCallHierarchy', args, token);
        if (response.type !== 'response' || !response.body) {
            return undefined;
        }
        return Array.isArray(response.body)
            ? response.body.map(fromProtocolCallHierarchyItem)
            : fromProtocolCallHierarchyItem(response.body);
    }
    async provideCallHierarchyIncomingCalls(item, token) {
        const filepath = this.client.toPath(item.uri);
        if (!filepath) {
            return undefined;
        }
        const args = typeConverters.Position.toFileLocationRequestArgs(filepath, item.selectionRange.start);
        const response = await this.client.execute('provideCallHierarchyIncomingCalls', args, token);
        if (response.type !== 'response' || !response.body) {
            return undefined;
        }
        return response.body.map(fromProtocolCallHierarchyIncomingCall);
    }
    async provideCallHierarchyOutgoingCalls(item, token) {
        const filepath = this.client.toPath(item.uri);
        if (!filepath) {
            return undefined;
        }
        const args = typeConverters.Position.toFileLocationRequestArgs(filepath, item.selectionRange.start);
        const response = await this.client.execute('provideCallHierarchyOutgoingCalls', args, token);
        if (response.type !== 'response' || !response.body) {
            return undefined;
        }
        return response.body.map(fromProtocolCallHierarchyOutgoingCall);
    }
}
TypeScriptCallHierarchySupport.minVersion = api_1.default.v380;
function isSourceFileItem(item) {
    return item.kind === PConst.Kind.script || item.kind === PConst.Kind.module && item.selectionSpan.start.line === 1 && item.selectionSpan.start.offset === 1;
}
function fromProtocolCallHierarchyItem(item) {
    const useFileName = isSourceFileItem(item);
    const name = useFileName ? path.basename(item.file) : item.name;
    const detail = useFileName ? vscode.workspace.asRelativePath(path.dirname(item.file)) : item.containerName ?? '';
    const result = new vscode.CallHierarchyItem(typeConverters.SymbolKind.fromProtocolScriptElementKind(item.kind), name, detail, vscode.Uri.file(item.file), typeConverters.Range.fromTextSpan(item.span), typeConverters.Range.fromTextSpan(item.selectionSpan));
    const kindModifiers = item.kindModifiers ? (0, modifiers_1.parseKindModifier)(item.kindModifiers) : undefined;
    if (kindModifiers?.has(PConst.KindModifiers.deprecated)) {
        result.tags = [vscode.SymbolTag.Deprecated];
    }
    return result;
}
function fromProtocolCallHierarchyIncomingCall(item) {
    return new vscode.CallHierarchyIncomingCall(fromProtocolCallHierarchyItem(item.from), item.fromSpans.map(typeConverters.Range.fromTextSpan));
}
function fromProtocolCallHierarchyOutgoingCall(item) {
    return new vscode.CallHierarchyOutgoingCall(fromProtocolCallHierarchyItem(item.to), item.fromSpans.map(typeConverters.Range.fromTextSpan));
}
function register(selector, client) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireMinVersion)(client, TypeScriptCallHierarchySupport.minVersion),
        (0, dependentRegistration_1.requireSomeCapability)(client, typescriptService_1.ClientCapability.Semantic),
    ], () => {
        return vscode.languages.registerCallHierarchyProvider(selector.semantic, new TypeScriptCallHierarchySupport(client));
    });
}
exports.register = register;


/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EventName = exports.DisplayPartKind = exports.KindModifiers = exports.DiagnosticCategory = exports.Kind = void 0;
class Kind {
}
exports.Kind = Kind;
Kind.alias = 'alias';
Kind.callSignature = 'call';
Kind.class = 'class';
Kind.const = 'const';
Kind.constructorImplementation = 'constructor';
Kind.constructSignature = 'construct';
Kind.directory = 'directory';
Kind.enum = 'enum';
Kind.enumMember = 'enum member';
Kind.externalModuleName = 'external module name';
Kind.function = 'function';
Kind.indexSignature = 'index';
Kind.interface = 'interface';
Kind.keyword = 'keyword';
Kind.let = 'let';
Kind.localFunction = 'local function';
Kind.localVariable = 'local var';
Kind.method = 'method';
Kind.memberGetAccessor = 'getter';
Kind.memberSetAccessor = 'setter';
Kind.memberVariable = 'property';
Kind.module = 'module';
Kind.primitiveType = 'primitive type';
Kind.script = 'script';
Kind.type = 'type';
Kind.variable = 'var';
Kind.warning = 'warning';
Kind.string = 'string';
Kind.parameter = 'parameter';
Kind.typeParameter = 'type parameter';
class DiagnosticCategory {
}
exports.DiagnosticCategory = DiagnosticCategory;
DiagnosticCategory.error = 'error';
DiagnosticCategory.warning = 'warning';
DiagnosticCategory.suggestion = 'suggestion';
class KindModifiers {
}
exports.KindModifiers = KindModifiers;
KindModifiers.optional = 'optional';
KindModifiers.deprecated = 'deprecated';
KindModifiers.color = 'color';
KindModifiers.dtsFile = '.d.ts';
KindModifiers.tsFile = '.ts';
KindModifiers.tsxFile = '.tsx';
KindModifiers.jsFile = '.js';
KindModifiers.jsxFile = '.jsx';
KindModifiers.jsonFile = '.json';
KindModifiers.fileExtensionKindModifiers = [
    KindModifiers.dtsFile,
    KindModifiers.tsFile,
    KindModifiers.tsxFile,
    KindModifiers.jsFile,
    KindModifiers.jsxFile,
    KindModifiers.jsonFile,
];
class DisplayPartKind {
}
exports.DisplayPartKind = DisplayPartKind;
DisplayPartKind.functionName = 'functionName';
DisplayPartKind.methodName = 'methodName';
DisplayPartKind.parameterName = 'parameterName';
DisplayPartKind.propertyName = 'propertyName';
DisplayPartKind.punctuation = 'punctuation';
DisplayPartKind.text = 'text';
var EventName;
(function (EventName) {
    EventName["syntaxDiag"] = "syntaxDiag";
    EventName["semanticDiag"] = "semanticDiag";
    EventName["suggestionDiag"] = "suggestionDiag";
    EventName["configFileDiag"] = "configFileDiag";
    EventName["telemetry"] = "telemetry";
    EventName["projectLanguageServiceState"] = "projectLanguageServiceState";
    EventName["projectsUpdatedInBackground"] = "projectsUpdatedInBackground";
    EventName["beginInstallTypes"] = "beginInstallTypes";
    EventName["endInstallTypes"] = "endInstallTypes";
    EventName["typesInstallerInitializationFailed"] = "typesInstallerInitializationFailed";
    EventName["surveyReady"] = "surveyReady";
    EventName["projectLoadingStart"] = "projectLoadingStart";
    EventName["projectLoadingFinish"] = "projectLoadingFinish";
})(EventName = exports.EventName || (exports.EventName = {}));


/***/ }),
/* 35 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.requireSomeCapability = exports.requireConfiguration = exports.requireMinVersion = exports.conditionalRegistration = exports.Condition = void 0;
const vscode = __webpack_require__(1);
const dispose_1 = __webpack_require__(20);
class Condition extends dispose_1.Disposable {
    constructor(getValue, onUpdate) {
        super();
        this.getValue = getValue;
        this._onDidChange = this._register(new vscode.EventEmitter());
        this.onDidChange = this._onDidChange.event;
        this._value = this.getValue();
        onUpdate(() => {
            const newValue = this.getValue();
            if (newValue !== this._value) {
                this._value = newValue;
                this._onDidChange.fire();
            }
        });
    }
    get value() { return this._value; }
}
exports.Condition = Condition;
class ConditionalRegistration {
    constructor(conditions, doRegister) {
        this.conditions = conditions;
        this.doRegister = doRegister;
        this.registration = undefined;
        for (const condition of conditions) {
            condition.onDidChange(() => this.update());
        }
        this.update();
    }
    dispose() {
        this.registration?.dispose();
        this.registration = undefined;
    }
    update() {
        const enabled = this.conditions.every(condition => condition.value);
        if (enabled) {
            if (!this.registration) {
                this.registration = this.doRegister();
            }
        }
        else {
            if (this.registration) {
                this.registration.dispose();
                this.registration = undefined;
            }
        }
    }
}
function conditionalRegistration(conditions, doRegister) {
    return new ConditionalRegistration(conditions, doRegister);
}
exports.conditionalRegistration = conditionalRegistration;
function requireMinVersion(client, minVersion) {
    return new Condition(() => client.apiVersion.gte(minVersion), client.onTsServerStarted);
}
exports.requireMinVersion = requireMinVersion;
function requireConfiguration(language, configValue) {
    return new Condition(() => {
        const config = vscode.workspace.getConfiguration(language, null);
        return !!config.get(configValue);
    }, vscode.workspace.onDidChangeConfiguration);
}
exports.requireConfiguration = requireConfiguration;
function requireSomeCapability(client, ...capabilities) {
    return new Condition(() => capabilities.some(requiredCapability => client.capabilities.has(requiredCapability)), client.onDidChangeCapabilities);
}
exports.requireSomeCapability = requireSomeCapability;


/***/ }),
/* 36 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseKindModifier = void 0;
function parseKindModifier(kindModifiers) {
    return new Set(kindModifiers.split(/,|\s+/g));
}
exports.parseKindModifier = parseKindModifier;


/***/ }),
/* 37 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CompletionTriggerKind = exports.SymbolKind = exports.WorkspaceEdit = exports.TextEdit = exports.Location = exports.Position = exports.Range = void 0;
/**
 * Helpers for converting FROM vscode types TO ts types
 */
const vscode = __webpack_require__(1);
const PConst = __webpack_require__(34);
var Range;
(function (Range) {
    Range.fromTextSpan = (span) => Range.fromLocations(span.start, span.end);
    Range.toTextSpan = (range) => ({
        start: Position.toLocation(range.start),
        end: Position.toLocation(range.end)
    });
    Range.fromLocations = (start, end) => new vscode.Range(Math.max(0, start.line - 1), Math.max(start.offset - 1, 0), Math.max(0, end.line - 1), Math.max(0, end.offset - 1));
    Range.toFileRangeRequestArgs = (file, range) => ({
        file,
        startLine: range.start.line + 1,
        startOffset: range.start.character + 1,
        endLine: range.end.line + 1,
        endOffset: range.end.character + 1
    });
    Range.toFormattingRequestArgs = (file, range) => ({
        file,
        line: range.start.line + 1,
        offset: range.start.character + 1,
        endLine: range.end.line + 1,
        endOffset: range.end.character + 1
    });
})(Range = exports.Range || (exports.Range = {}));
var Position;
(function (Position) {
    Position.fromLocation = (tslocation) => new vscode.Position(tslocation.line - 1, tslocation.offset - 1);
    Position.toLocation = (vsPosition) => ({
        line: vsPosition.line + 1,
        offset: vsPosition.character + 1,
    });
    Position.toFileLocationRequestArgs = (file, position) => ({
        file,
        line: position.line + 1,
        offset: position.character + 1,
    });
})(Position = exports.Position || (exports.Position = {}));
var Location;
(function (Location) {
    Location.fromTextSpan = (resource, tsTextSpan) => new vscode.Location(resource, Range.fromTextSpan(tsTextSpan));
})(Location = exports.Location || (exports.Location = {}));
var TextEdit;
(function (TextEdit) {
    TextEdit.fromCodeEdit = (edit) => new vscode.TextEdit(Range.fromTextSpan(edit), edit.newText);
})(TextEdit = exports.TextEdit || (exports.TextEdit = {}));
var WorkspaceEdit;
(function (WorkspaceEdit) {
    function fromFileCodeEdits(client, edits) {
        return withFileCodeEdits(new vscode.WorkspaceEdit(), client, edits);
    }
    WorkspaceEdit.fromFileCodeEdits = fromFileCodeEdits;
    function withFileCodeEdits(workspaceEdit, client, edits) {
        for (const edit of edits) {
            const resource = client.toResource(edit.fileName);
            for (const textChange of edit.textChanges) {
                workspaceEdit.replace(resource, Range.fromTextSpan(textChange), textChange.newText);
            }
        }
        return workspaceEdit;
    }
    WorkspaceEdit.withFileCodeEdits = withFileCodeEdits;
})(WorkspaceEdit = exports.WorkspaceEdit || (exports.WorkspaceEdit = {}));
var SymbolKind;
(function (SymbolKind) {
    function fromProtocolScriptElementKind(kind) {
        switch (kind) {
            case PConst.Kind.module: return vscode.SymbolKind.Module;
            case PConst.Kind.class: return vscode.SymbolKind.Class;
            case PConst.Kind.enum: return vscode.SymbolKind.Enum;
            case PConst.Kind.enumMember: return vscode.SymbolKind.EnumMember;
            case PConst.Kind.interface: return vscode.SymbolKind.Interface;
            case PConst.Kind.indexSignature: return vscode.SymbolKind.Method;
            case PConst.Kind.callSignature: return vscode.SymbolKind.Method;
            case PConst.Kind.method: return vscode.SymbolKind.Method;
            case PConst.Kind.memberVariable: return vscode.SymbolKind.Property;
            case PConst.Kind.memberGetAccessor: return vscode.SymbolKind.Property;
            case PConst.Kind.memberSetAccessor: return vscode.SymbolKind.Property;
            case PConst.Kind.variable: return vscode.SymbolKind.Variable;
            case PConst.Kind.let: return vscode.SymbolKind.Variable;
            case PConst.Kind.const: return vscode.SymbolKind.Variable;
            case PConst.Kind.localVariable: return vscode.SymbolKind.Variable;
            case PConst.Kind.alias: return vscode.SymbolKind.Variable;
            case PConst.Kind.function: return vscode.SymbolKind.Function;
            case PConst.Kind.localFunction: return vscode.SymbolKind.Function;
            case PConst.Kind.constructSignature: return vscode.SymbolKind.Constructor;
            case PConst.Kind.constructorImplementation: return vscode.SymbolKind.Constructor;
            case PConst.Kind.typeParameter: return vscode.SymbolKind.TypeParameter;
            case PConst.Kind.string: return vscode.SymbolKind.String;
            default: return vscode.SymbolKind.Variable;
        }
    }
    SymbolKind.fromProtocolScriptElementKind = fromProtocolScriptElementKind;
})(SymbolKind = exports.SymbolKind || (exports.SymbolKind = {}));
var CompletionTriggerKind;
(function (CompletionTriggerKind) {
    function toProtocolCompletionTriggerKind(kind) {
        switch (kind) {
            case vscode.CompletionTriggerKind.Invoke: return 1;
            case vscode.CompletionTriggerKind.TriggerCharacter: return 2;
            case vscode.CompletionTriggerKind.TriggerForIncompleteCompletions: return 3;
        }
    }
    CompletionTriggerKind.toProtocolCompletionTriggerKind = toProtocolCompletionTriggerKind;
})(CompletionTriggerKind = exports.CompletionTriggerKind || (exports.CompletionTriggerKind = {}));


/***/ }),
/* 38 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const nls = __webpack_require__(9);
const PConst = __webpack_require__(34);
const typescriptService_1 = __webpack_require__(32);
const dependentRegistration_1 = __webpack_require__(35);
const typeConverters = __webpack_require__(37);
const baseCodeLensProvider_1 = __webpack_require__(39);
const localize = nls.loadMessageBundle();
class TypeScriptImplementationsCodeLensProvider extends baseCodeLensProvider_1.TypeScriptBaseCodeLensProvider {
    async resolveCodeLens(codeLens, token) {
        const args = typeConverters.Position.toFileLocationRequestArgs(codeLens.file, codeLens.range.start);
        const response = await this.client.execute('implementation', args, token, { lowPriority: true, cancelOnResourceChange: codeLens.document });
        if (response.type !== 'response' || !response.body) {
            codeLens.command = response.type === 'cancelled'
                ? baseCodeLensProvider_1.TypeScriptBaseCodeLensProvider.cancelledCommand
                : baseCodeLensProvider_1.TypeScriptBaseCodeLensProvider.errorCommand;
            return codeLens;
        }
        const locations = response.body
            .map(reference => 
        // Only take first line on implementation: https://github.com/microsoft/vscode/issues/23924
        new vscode.Location(this.client.toResource(reference.file), reference.start.line === reference.end.line
            ? typeConverters.Range.fromTextSpan(reference)
            : new vscode.Range(typeConverters.Position.fromLocation(reference.start), new vscode.Position(reference.start.line, 0))))
            // Exclude original from implementations
            .filter(location => !(location.uri.toString() === codeLens.document.toString() &&
            location.range.start.line === codeLens.range.start.line &&
            location.range.start.character === codeLens.range.start.character));
        codeLens.command = this.getCommand(locations, codeLens);
        return codeLens;
    }
    getCommand(locations, codeLens) {
        return {
            title: this.getTitle(locations),
            command: locations.length ? 'editor.action.showReferences' : '',
            arguments: [codeLens.document, codeLens.range.start, locations]
        };
    }
    getTitle(locations) {
        return locations.length === 1
            ? localize('oneImplementationLabel', '1 implementation')
            : localize('manyImplementationLabel', '{0} implementations', locations.length);
    }
    extractSymbol(document, item, _parent) {
        switch (item.kind) {
            case PConst.Kind.interface:
                return (0, baseCodeLensProvider_1.getSymbolRange)(document, item);
            case PConst.Kind.class:
            case PConst.Kind.method:
            case PConst.Kind.memberVariable:
            case PConst.Kind.memberGetAccessor:
            case PConst.Kind.memberSetAccessor:
                if (item.kindModifiers.match(/\babstract\b/g)) {
                    return (0, baseCodeLensProvider_1.getSymbolRange)(document, item);
                }
                break;
        }
        return null;
    }
}
exports.default = TypeScriptImplementationsCodeLensProvider;
function register(selector, modeId, client, cachedResponse) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireConfiguration)(modeId, 'implementationsCodeLens.enabled'),
        (0, dependentRegistration_1.requireSomeCapability)(client, typescriptService_1.ClientCapability.Semantic),
    ], () => {
        return vscode.languages.registerCodeLensProvider(selector.semantic, new TypeScriptImplementationsCodeLensProvider(client, cachedResponse));
    });
}
exports.register = register;


/***/ }),
/* 39 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getSymbolRange = exports.TypeScriptBaseCodeLensProvider = exports.ReferencesCodeLens = void 0;
const vscode = __webpack_require__(1);
const nls = __webpack_require__(9);
const regexp_1 = __webpack_require__(40);
const typeConverters = __webpack_require__(37);
const localize = nls.loadMessageBundle();
class ReferencesCodeLens extends vscode.CodeLens {
    constructor(document, file, range) {
        super(range);
        this.document = document;
        this.file = file;
    }
}
exports.ReferencesCodeLens = ReferencesCodeLens;
class TypeScriptBaseCodeLensProvider {
    constructor(client, cachedResponse) {
        this.client = client;
        this.cachedResponse = cachedResponse;
        this.onDidChangeCodeLensesEmitter = new vscode.EventEmitter();
    }
    get onDidChangeCodeLenses() {
        return this.onDidChangeCodeLensesEmitter.event;
    }
    async provideCodeLenses(document, token) {
        const filepath = this.client.toOpenedFilePath(document);
        if (!filepath) {
            return [];
        }
        const response = await this.cachedResponse.execute(document, () => this.client.execute('navtree', { file: filepath }, token));
        if (response.type !== 'response') {
            return [];
        }
        const tree = response.body;
        const referenceableSpans = [];
        if (tree && tree.childItems) {
            tree.childItems.forEach(item => this.walkNavTree(document, item, null, referenceableSpans));
        }
        return referenceableSpans.map(span => new ReferencesCodeLens(document.uri, filepath, span));
    }
    walkNavTree(document, item, parent, results) {
        if (!item) {
            return;
        }
        const range = this.extractSymbol(document, item, parent);
        if (range) {
            results.push(range);
        }
        (item.childItems || []).forEach(child => this.walkNavTree(document, child, item, results));
    }
}
exports.TypeScriptBaseCodeLensProvider = TypeScriptBaseCodeLensProvider;
TypeScriptBaseCodeLensProvider.cancelledCommand = {
    // Cancellation is not an error. Just show nothing until we can properly re-compute the code lens
    title: '',
    command: ''
};
TypeScriptBaseCodeLensProvider.errorCommand = {
    title: localize('referenceErrorLabel', 'Could not determine references'),
    command: ''
};
function getSymbolRange(document, item) {
    if (item.nameSpan) {
        return typeConverters.Range.fromTextSpan(item.nameSpan);
    }
    // In older versions, we have to calculate this manually. See #23924
    const span = item.spans && item.spans[0];
    if (!span) {
        return null;
    }
    const range = typeConverters.Range.fromTextSpan(span);
    const text = document.getText(range);
    const identifierMatch = new RegExp(`^(.*?(\\b|\\W))${(0, regexp_1.escapeRegExp)(item.text || '')}(\\b|\\W)`, 'gm');
    const match = identifierMatch.exec(text);
    const prefixLength = match ? match.index + match[1].length : 0;
    const startOffset = document.offsetAt(new vscode.Position(range.start.line, range.start.character)) + prefixLength;
    return new vscode.Range(document.positionAt(startOffset), document.positionAt(startOffset + item.text.length));
}
exports.getSymbolRange = getSymbolRange;


/***/ }),
/* 40 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.escapeRegExp = void 0;
function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
exports.escapeRegExp = escapeRegExp;


/***/ }),
/* 41 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = exports.TypeScriptReferencesCodeLensProvider = void 0;
const vscode = __webpack_require__(1);
const nls = __webpack_require__(9);
const PConst = __webpack_require__(34);
const server_1 = __webpack_require__(42);
const typescriptService_1 = __webpack_require__(32);
const dependentRegistration_1 = __webpack_require__(35);
const typeConverters = __webpack_require__(37);
const baseCodeLensProvider_1 = __webpack_require__(39);
const localize = nls.loadMessageBundle();
class TypeScriptReferencesCodeLensProvider extends baseCodeLensProvider_1.TypeScriptBaseCodeLensProvider {
    constructor(client, _cachedResponse, modeId) {
        super(client, _cachedResponse);
        this._cachedResponse = _cachedResponse;
        this.modeId = modeId;
    }
    async resolveCodeLens(codeLens, token) {
        const args = typeConverters.Position.toFileLocationRequestArgs(codeLens.file, codeLens.range.start);
        const response = await this.client.execute('references', args, token, {
            lowPriority: true,
            executionTarget: server_1.ExecutionTarget.Semantic,
            cancelOnResourceChange: codeLens.document,
        });
        if (response.type !== 'response' || !response.body) {
            codeLens.command = response.type === 'cancelled'
                ? baseCodeLensProvider_1.TypeScriptBaseCodeLensProvider.cancelledCommand
                : baseCodeLensProvider_1.TypeScriptBaseCodeLensProvider.errorCommand;
            return codeLens;
        }
        const locations = response.body.refs
            .filter(reference => !reference.isDefinition)
            .map(reference => typeConverters.Location.fromTextSpan(this.client.toResource(reference.file), reference));
        codeLens.command = {
            title: this.getCodeLensLabel(locations),
            command: locations.length ? 'editor.action.showReferences' : '',
            arguments: [codeLens.document, codeLens.range.start, locations]
        };
        return codeLens;
    }
    getCodeLensLabel(locations) {
        return locations.length === 1
            ? localize('oneReferenceLabel', '1 reference')
            : localize('manyReferenceLabel', '{0} references', locations.length);
    }
    extractSymbol(document, item, parent) {
        if (parent && parent.kind === PConst.Kind.enum) {
            return (0, baseCodeLensProvider_1.getSymbolRange)(document, item);
        }
        switch (item.kind) {
            case PConst.Kind.function:
                const showOnAllFunctions = vscode.workspace.getConfiguration(this.modeId).get('referencesCodeLens.showOnAllFunctions');
                if (showOnAllFunctions) {
                    return (0, baseCodeLensProvider_1.getSymbolRange)(document, item);
                }
            // fallthrough
            case PConst.Kind.const:
            case PConst.Kind.let:
            case PConst.Kind.variable:
                // Only show references for exported variables
                if (/\bexport\b/.test(item.kindModifiers)) {
                    return (0, baseCodeLensProvider_1.getSymbolRange)(document, item);
                }
                break;
            case PConst.Kind.class:
                if (item.text === '<class>') {
                    break;
                }
                return (0, baseCodeLensProvider_1.getSymbolRange)(document, item);
            case PConst.Kind.interface:
            case PConst.Kind.type:
            case PConst.Kind.enum:
                return (0, baseCodeLensProvider_1.getSymbolRange)(document, item);
            case PConst.Kind.method:
            case PConst.Kind.memberGetAccessor:
            case PConst.Kind.memberSetAccessor:
            case PConst.Kind.constructorImplementation:
            case PConst.Kind.memberVariable:
                // Don't show if child and parent have same start
                // For https://github.com/microsoft/vscode/issues/90396
                if (parent &&
                    typeConverters.Position.fromLocation(parent.spans[0].start).isEqual(typeConverters.Position.fromLocation(item.spans[0].start))) {
                    return null;
                }
                // Only show if parent is a class type object (not a literal)
                switch (parent?.kind) {
                    case PConst.Kind.class:
                    case PConst.Kind.interface:
                    case PConst.Kind.type:
                        return (0, baseCodeLensProvider_1.getSymbolRange)(document, item);
                }
                break;
        }
        return null;
    }
}
exports.TypeScriptReferencesCodeLensProvider = TypeScriptReferencesCodeLensProvider;
function register(selector, modeId, client, cachedResponse) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireConfiguration)(modeId, 'referencesCodeLens.enabled'),
        (0, dependentRegistration_1.requireSomeCapability)(client, typescriptService_1.ClientCapability.Semantic),
    ], () => {
        return vscode.languages.registerCodeLensProvider(selector.semantic, new TypeScriptReferencesCodeLensProvider(client, cachedResponse, modeId));
    });
}
exports.register = register;


/***/ }),
/* 42 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SyntaxRoutingTsServer = exports.GetErrRoutingTsServer = exports.ProcessBasedTsServer = exports.ExecutionTarget = void 0;
const vscode = __webpack_require__(1);
const protocol_const_1 = __webpack_require__(34);
const callbackMap_1 = __webpack_require__(43);
const requestQueue_1 = __webpack_require__(44);
const serverError_1 = __webpack_require__(45);
const typescriptService_1 = __webpack_require__(32);
const dispose_1 = __webpack_require__(20);
var ExecutionTarget;
(function (ExecutionTarget) {
    ExecutionTarget[ExecutionTarget["Semantic"] = 0] = "Semantic";
    ExecutionTarget[ExecutionTarget["Syntax"] = 1] = "Syntax";
})(ExecutionTarget = exports.ExecutionTarget || (exports.ExecutionTarget = {}));
class ProcessBasedTsServer extends dispose_1.Disposable {
    constructor(_serverId, _serverSource, _process, _tsServerLogFile, _requestCanceller, _version, _telemetryReporter, _tracer) {
        super();
        this._serverId = _serverId;
        this._serverSource = _serverSource;
        this._process = _process;
        this._tsServerLogFile = _tsServerLogFile;
        this._requestCanceller = _requestCanceller;
        this._version = _version;
        this._telemetryReporter = _telemetryReporter;
        this._tracer = _tracer;
        this._requestQueue = new requestQueue_1.RequestQueue();
        this._callbacks = new callbackMap_1.CallbackMap();
        this._pendingResponses = new Set();
        this._onEvent = this._register(new vscode.EventEmitter());
        this.onEvent = this._onEvent.event;
        this._onExit = this._register(new vscode.EventEmitter());
        this.onExit = this._onExit.event;
        this._onError = this._register(new vscode.EventEmitter());
        this.onError = this._onError.event;
        this._process.onData(msg => {
            this.dispatchMessage(msg);
        });
        this._process.onExit((code, signal) => {
            this._onExit.fire({ code, signal });
            this._callbacks.destroy('server exited');
        });
        this._process.onError(error => {
            this._onError.fire(error);
            this._callbacks.destroy('server errored');
        });
    }
    get tsServerLogFile() { return this._tsServerLogFile; }
    write(serverRequest) {
        this._process.write(serverRequest);
    }
    dispose() {
        super.dispose();
        this._callbacks.destroy('server disposed');
        this._pendingResponses.clear();
    }
    kill() {
        this._process.kill();
    }
    dispatchMessage(message) {
        try {
            switch (message.type) {
                case 'response':
                    if (this._serverSource) {
                        this.dispatchResponse({
                            ...message,
                            _serverType: this._serverSource
                        });
                    }
                    else {
                        this.dispatchResponse(message);
                    }
                    break;
                case 'event':
                    const event = message;
                    if (event.event === 'requestCompleted') {
                        const seq = event.body.request_seq;
                        const callback = this._callbacks.fetch(seq);
                        if (callback) {
                            this._tracer.traceRequestCompleted(this._serverId, 'requestCompleted', seq, callback);
                            callback.onSuccess(undefined);
                        }
                    }
                    else {
                        this._tracer.traceEvent(this._serverId, event);
                        this._onEvent.fire(event);
                    }
                    break;
                default:
                    throw new Error(`Unknown message type ${message.type} received`);
            }
        }
        finally {
            this.sendNextRequests();
        }
    }
    tryCancelRequest(seq, command) {
        try {
            if (this._requestQueue.tryDeletePendingRequest(seq)) {
                this.logTrace(`Canceled request with sequence number ${seq}`);
                return true;
            }
            if (this._requestCanceller.tryCancelOngoingRequest(seq)) {
                return true;
            }
            this.logTrace(`Tried to cancel request with sequence number ${seq}. But request got already delivered.`);
            return false;
        }
        finally {
            const callback = this.fetchCallback(seq);
            if (callback) {
                callback.onSuccess(new typescriptService_1.ServerResponse.Cancelled(`Cancelled request ${seq} - ${command}`));
            }
        }
    }
    dispatchResponse(response) {
        const callback = this.fetchCallback(response.request_seq);
        if (!callback) {
            return;
        }
        this._tracer.traceResponse(this._serverId, response, callback);
        if (response.success) {
            callback.onSuccess(response);
        }
        else if (response.message === 'No content available.') {
            // Special case where response itself is successful but there is not any data to return.
            callback.onSuccess(typescriptService_1.ServerResponse.NoContent);
        }
        else {
            callback.onError(serverError_1.TypeScriptServerError.create(this._serverId, this._version, response));
        }
    }
    executeImpl(command, args, executeInfo) {
        const request = this._requestQueue.createRequest(command, args);
        const requestInfo = {
            request,
            expectsResponse: executeInfo.expectsResult,
            isAsync: executeInfo.isAsync,
            queueingType: ProcessBasedTsServer.getQueueingType(command, executeInfo.lowPriority)
        };
        let result;
        if (executeInfo.expectsResult) {
            result = new Promise((resolve, reject) => {
                this._callbacks.add(request.seq, { onSuccess: resolve, onError: reject, queuingStartTime: Date.now(), isAsync: executeInfo.isAsync }, executeInfo.isAsync);
                if (executeInfo.token) {
                    executeInfo.token.onCancellationRequested(() => {
                        this.tryCancelRequest(request.seq, command);
                    });
                }
            }).catch((err) => {
                if (err instanceof serverError_1.TypeScriptServerError) {
                    if (!executeInfo.token || !executeInfo.token.isCancellationRequested) {
                        /* __GDPR__
                            "languageServiceErrorResponse" : {
                                "${include}": [
                                    "${TypeScriptCommonProperties}",
                                    "${TypeScriptRequestErrorProperties}"
                                ]
                            }
                        */
                        this._telemetryReporter.logTelemetry('languageServiceErrorResponse', err.telemetry);
                    }
                }
                throw err;
            });
        }
        this._requestQueue.enqueue(requestInfo);
        this.sendNextRequests();
        return [result];
    }
    sendNextRequests() {
        while (this._pendingResponses.size === 0 && this._requestQueue.length > 0) {
            const item = this._requestQueue.dequeue();
            if (item) {
                this.sendRequest(item);
            }
        }
    }
    sendRequest(requestItem) {
        const serverRequest = requestItem.request;
        this._tracer.traceRequest(this._serverId, serverRequest, requestItem.expectsResponse, this._requestQueue.length);
        if (requestItem.expectsResponse && !requestItem.isAsync) {
            this._pendingResponses.add(requestItem.request.seq);
        }
        try {
            this.write(serverRequest);
        }
        catch (err) {
            const callback = this.fetchCallback(serverRequest.seq);
            if (callback) {
                callback.onError(err);
            }
        }
    }
    fetchCallback(seq) {
        const callback = this._callbacks.fetch(seq);
        if (!callback) {
            return undefined;
        }
        this._pendingResponses.delete(seq);
        return callback;
    }
    logTrace(message) {
        this._tracer.logTrace(this._serverId, message);
    }
    static getQueueingType(command, lowPriority) {
        if (ProcessBasedTsServer.fenceCommands.has(command)) {
            return requestQueue_1.RequestQueueingType.Fence;
        }
        return lowPriority ? requestQueue_1.RequestQueueingType.LowPriority : requestQueue_1.RequestQueueingType.Normal;
    }
}
exports.ProcessBasedTsServer = ProcessBasedTsServer;
ProcessBasedTsServer.fenceCommands = new Set(['change', 'close', 'open', 'updateOpen']);
class RequestRouter {
    constructor(servers, delegate) {
        this.servers = servers;
        this.delegate = delegate;
    }
    execute(command, args, executeInfo) {
        if (RequestRouter.sharedCommands.has(command) && typeof executeInfo.executionTarget === 'undefined') {
            // Dispatch shared commands to all servers but use first one as the primary response
            const requestStates = this.servers.map(() => RequestState.Unresolved);
            // Also make sure we never cancel requests to just one server
            let token = undefined;
            if (executeInfo.token) {
                const source = new vscode.CancellationTokenSource();
                executeInfo.token.onCancellationRequested(() => {
                    if (requestStates.some(state => state === RequestState.Resolved)) {
                        // Don't cancel.
                        // One of the servers completed this request so we don't want to leave the other
                        // in a different state.
                        return;
                    }
                    source.cancel();
                });
                token = source.token;
            }
            const allRequests = [];
            for (let serverIndex = 0; serverIndex < this.servers.length; ++serverIndex) {
                const server = this.servers[serverIndex].server;
                const request = server.executeImpl(command, args, { ...executeInfo, token })[0];
                allRequests.push(request);
                if (request) {
                    request
                        .then(result => {
                        requestStates[serverIndex] = RequestState.Resolved;
                        const erroredRequest = requestStates.find(state => state.type === 2 /* Errored */);
                        if (erroredRequest) {
                            // We've gone out of sync
                            this.delegate.onFatalError(command, erroredRequest.err);
                        }
                        return result;
                    }, err => {
                        requestStates[serverIndex] = new RequestState.Errored(err);
                        if (requestStates.some(state => state === RequestState.Resolved)) {
                            // We've gone out of sync
                            this.delegate.onFatalError(command, err);
                        }
                        throw err;
                    });
                }
            }
            return allRequests;
        }
        for (const { canRun, server } of this.servers) {
            if (!canRun || canRun(command, executeInfo)) {
                return server.executeImpl(command, args, executeInfo);
            }
        }
        throw new Error(`Could not find server for command: '${command}'`);
    }
}
RequestRouter.sharedCommands = new Set([
    'change',
    'close',
    'open',
    'updateOpen',
    'configure',
]);
class GetErrRoutingTsServer extends dispose_1.Disposable {
    constructor(servers, delegate) {
        super();
        this._onEvent = this._register(new vscode.EventEmitter());
        this.onEvent = this._onEvent.event;
        this._onExit = this._register(new vscode.EventEmitter());
        this.onExit = this._onExit.event;
        this._onError = this._register(new vscode.EventEmitter());
        this.onError = this._onError.event;
        this.getErrServer = servers.getErr;
        this.mainServer = servers.primary;
        this.router = new RequestRouter([
            { server: this.getErrServer, canRun: (command) => ['geterr', 'geterrForProject'].includes(command) },
            { server: this.mainServer, canRun: undefined /* gets all other commands */ }
        ], delegate);
        this._register(this.getErrServer.onEvent(e => {
            if (GetErrRoutingTsServer.diagnosticEvents.has(e.event)) {
                this._onEvent.fire(e);
            }
            // Ignore all other events
        }));
        this._register(this.mainServer.onEvent(e => {
            if (!GetErrRoutingTsServer.diagnosticEvents.has(e.event)) {
                this._onEvent.fire(e);
            }
            // Ignore all other events
        }));
        this._register(this.getErrServer.onError(e => this._onError.fire(e)));
        this._register(this.mainServer.onError(e => this._onError.fire(e)));
        this._register(this.mainServer.onExit(e => {
            this._onExit.fire(e);
            this.getErrServer.kill();
        }));
    }
    get tsServerLogFile() { return this.mainServer.tsServerLogFile; }
    kill() {
        this.getErrServer.kill();
        this.mainServer.kill();
    }
    executeImpl(command, args, executeInfo) {
        return this.router.execute(command, args, executeInfo);
    }
}
exports.GetErrRoutingTsServer = GetErrRoutingTsServer;
GetErrRoutingTsServer.diagnosticEvents = new Set([
    protocol_const_1.EventName.configFileDiag,
    protocol_const_1.EventName.syntaxDiag,
    protocol_const_1.EventName.semanticDiag,
    protocol_const_1.EventName.suggestionDiag
]);
class SyntaxRoutingTsServer extends dispose_1.Disposable {
    constructor(servers, delegate, enableDynamicRouting) {
        super();
        this._projectLoading = true;
        this._onEvent = this._register(new vscode.EventEmitter());
        this.onEvent = this._onEvent.event;
        this._onExit = this._register(new vscode.EventEmitter());
        this.onExit = this._onExit.event;
        this._onError = this._register(new vscode.EventEmitter());
        this.onError = this._onError.event;
        this.syntaxServer = servers.syntax;
        this.semanticServer = servers.semantic;
        this.router = new RequestRouter([
            {
                server: this.syntaxServer,
                canRun: (command, execInfo) => {
                    switch (execInfo.executionTarget) {
                        case ExecutionTarget.Semantic: return false;
                        case ExecutionTarget.Syntax: return true;
                    }
                    if (SyntaxRoutingTsServer.syntaxAlwaysCommands.has(command)) {
                        return true;
                    }
                    if (SyntaxRoutingTsServer.semanticCommands.has(command)) {
                        return false;
                    }
                    if (enableDynamicRouting && this.projectLoading && SyntaxRoutingTsServer.syntaxAllowedCommands.has(command)) {
                        return true;
                    }
                    return false;
                }
            }, {
                server: this.semanticServer,
                canRun: undefined /* gets all other commands */
            }
        ], delegate);
        this._register(this.syntaxServer.onEvent(e => {
            return this._onEvent.fire(e);
        }));
        this._register(this.semanticServer.onEvent(e => {
            switch (e.event) {
                case protocol_const_1.EventName.projectLoadingStart:
                    this._projectLoading = true;
                    break;
                case protocol_const_1.EventName.projectLoadingFinish:
                case protocol_const_1.EventName.semanticDiag:
                case protocol_const_1.EventName.syntaxDiag:
                case protocol_const_1.EventName.suggestionDiag:
                case protocol_const_1.EventName.configFileDiag:
                    this._projectLoading = false;
                    break;
            }
            return this._onEvent.fire(e);
        }));
        this._register(this.semanticServer.onExit(e => {
            this._onExit.fire(e);
            this.syntaxServer.kill();
        }));
        this._register(this.semanticServer.onError(e => this._onError.fire(e)));
    }
    get projectLoading() { return this._projectLoading; }
    get tsServerLogFile() { return this.semanticServer.tsServerLogFile; }
    kill() {
        this.syntaxServer.kill();
        this.semanticServer.kill();
    }
    executeImpl(command, args, executeInfo) {
        return this.router.execute(command, args, executeInfo);
    }
}
exports.SyntaxRoutingTsServer = SyntaxRoutingTsServer;
/**
 * Commands that should always be run on the syntax server.
 */
SyntaxRoutingTsServer.syntaxAlwaysCommands = new Set([
    'navtree',
    'getOutliningSpans',
    'jsxClosingTag',
    'selectionRange',
    'format',
    'formatonkey',
    'docCommentTemplate',
]);
/**
 * Commands that should always be run on the semantic server.
 */
SyntaxRoutingTsServer.semanticCommands = new Set([
    'geterr',
    'geterrForProject',
    'projectInfo',
    'configurePlugin',
]);
/**
 * Commands that can be run on the syntax server but would benefit from being upgraded to the semantic server.
 */
SyntaxRoutingTsServer.syntaxAllowedCommands = new Set([
    'completions',
    'completionEntryDetails',
    'completionInfo',
    'definition',
    'definitionAndBoundSpan',
    'documentHighlights',
    'implementation',
    'navto',
    'quickinfo',
    'references',
    'rename',
    'signatureHelp',
]);
var RequestState;
(function (RequestState) {
    RequestState.Unresolved = { type: 0 /* Unresolved */ };
    RequestState.Resolved = { type: 1 /* Resolved */ };
    class Errored {
        constructor(err) {
            this.err = err;
            this.type = 2 /* Errored */;
        }
    }
    RequestState.Errored = Errored;
})(RequestState || (RequestState = {}));


/***/ }),
/* 43 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CallbackMap = void 0;
const typescriptService_1 = __webpack_require__(32);
class CallbackMap {
    constructor() {
        this._callbacks = new Map();
        this._asyncCallbacks = new Map();
    }
    destroy(cause) {
        const cancellation = new typescriptService_1.ServerResponse.Cancelled(cause);
        for (const callback of this._callbacks.values()) {
            callback.onSuccess(cancellation);
        }
        this._callbacks.clear();
        for (const callback of this._asyncCallbacks.values()) {
            callback.onSuccess(cancellation);
        }
        this._asyncCallbacks.clear();
    }
    add(seq, callback, isAsync) {
        if (isAsync) {
            this._asyncCallbacks.set(seq, callback);
        }
        else {
            this._callbacks.set(seq, callback);
        }
    }
    fetch(seq) {
        const callback = this._callbacks.get(seq) || this._asyncCallbacks.get(seq);
        this.delete(seq);
        return callback;
    }
    delete(seq) {
        if (!this._callbacks.delete(seq)) {
            this._asyncCallbacks.delete(seq);
        }
    }
}
exports.CallbackMap = CallbackMap;


/***/ }),
/* 44 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RequestQueue = exports.RequestQueueingType = void 0;
var RequestQueueingType;
(function (RequestQueueingType) {
    /**
     * Normal request that is executed in order.
     */
    RequestQueueingType[RequestQueueingType["Normal"] = 1] = "Normal";
    /**
     * Request that normal requests jump in front of in the queue.
     */
    RequestQueueingType[RequestQueueingType["LowPriority"] = 2] = "LowPriority";
    /**
     * A fence that blocks request reordering.
     *
     * Fences are not reordered. Unlike a normal request, a fence will never jump in front of a low priority request
     * in the request queue.
     */
    RequestQueueingType[RequestQueueingType["Fence"] = 3] = "Fence";
})(RequestQueueingType = exports.RequestQueueingType || (exports.RequestQueueingType = {}));
class RequestQueue {
    constructor() {
        this.queue = [];
        this.sequenceNumber = 0;
    }
    get length() {
        return this.queue.length;
    }
    enqueue(item) {
        if (item.queueingType === RequestQueueingType.Normal) {
            let index = this.queue.length - 1;
            while (index >= 0) {
                if (this.queue[index].queueingType !== RequestQueueingType.LowPriority) {
                    break;
                }
                --index;
            }
            this.queue.splice(index + 1, 0, item);
        }
        else {
            // Only normal priority requests can be reordered. All other requests just go to the end.
            this.queue.push(item);
        }
    }
    dequeue() {
        return this.queue.shift();
    }
    tryDeletePendingRequest(seq) {
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].request.seq === seq) {
                this.queue.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    createRequest(command, args) {
        return {
            seq: this.sequenceNumber++,
            type: 'request',
            command: command,
            arguments: args
        };
    }
}
exports.RequestQueue = RequestQueue;


/***/ }),
/* 45 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TypeScriptServerError = void 0;
class TypeScriptServerError extends Error {
    constructor(serverId, version, response, serverMessage, serverStack, sanitizedStack) {
        super(`<${serverId}> TypeScript Server Error (${version.displayName})\n${serverMessage}\n${serverStack}`);
        this.serverId = serverId;
        this.version = version;
        this.response = response;
        this.serverMessage = serverMessage;
        this.serverStack = serverStack;
        this.sanitizedStack = sanitizedStack;
    }
    static create(serverId, version, response) {
        const parsedResult = TypeScriptServerError.parseErrorText(response);
        return new TypeScriptServerError(serverId, version, response, parsedResult?.message, parsedResult?.stack, parsedResult?.sanitizedStack);
    }
    get serverErrorText() { return this.response.message; }
    get serverCommand() { return this.response.command; }
    get telemetry() {
        // The "sanitizedstack" has been purged of error messages, paths, and file names (other than tsserver)
        // and, thus, can be classified as SystemMetaData, rather than CallstackOrException.
        /* __GDPR__FRAGMENT__
            "TypeScriptRequestErrorProperties" : {
                "command" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "serverid" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                "sanitizedstack" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                "badclient" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
            }
        */
        return {
            command: this.serverCommand,
            serverid: this.serverId,
            sanitizedstack: this.sanitizedStack || '',
            badclient: /\bBADCLIENT\b/.test(this.stack || ''),
        };
    }
    /**
     * Given a `errorText` from a tsserver request indicating failure in handling a request,
     * prepares a payload for telemetry-logging.
     */
    static parseErrorText(response) {
        const errorText = response.message;
        if (errorText) {
            const errorPrefix = 'Error processing request. ';
            if (errorText.startsWith(errorPrefix)) {
                const prefixFreeErrorText = errorText.substr(errorPrefix.length);
                const newlineIndex = prefixFreeErrorText.indexOf('\n');
                if (newlineIndex >= 0) {
                    // Newline expected between message and stack.
                    const stack = prefixFreeErrorText.substring(newlineIndex + 1);
                    return {
                        message: prefixFreeErrorText.substring(0, newlineIndex),
                        stack,
                        sanitizedStack: TypeScriptServerError.sanitizeStack(stack)
                    };
                }
            }
        }
        return undefined;
    }
    /**
     * Drop everything but ".js" and line/column numbers (though retain "tsserver" if that's the filename).
     */
    static sanitizeStack(message) {
        if (!message) {
            return '';
        }
        const regex = /(\btsserver)?(\.(?:ts|tsx|js|jsx)(?::\d+(?::\d+)?)?)\)?$/igm;
        let serverStack = '';
        while (true) {
            const match = regex.exec(message);
            if (!match) {
                break;
            }
            // [1] is 'tsserver' or undefined
            // [2] is '.js:{line_number}:{column_number}'
            serverStack += `${match[1] || 'suppressed'}${match[2]}\n`;
        }
        return serverStack;
    }
}
exports.TypeScriptServerError = TypeScriptServerError;


/***/ }),
/* 46 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const nls = __webpack_require__(9);
const PConst = __webpack_require__(34);
const typescriptService_1 = __webpack_require__(32);
const api_1 = __webpack_require__(24);
const cancellation_1 = __webpack_require__(12);
const codeAction_1 = __webpack_require__(47);
const dependentRegistration_1 = __webpack_require__(35);
const modifiers_1 = __webpack_require__(36);
const Previewer = __webpack_require__(48);
const snippetForFunctionCall_1 = __webpack_require__(49);
const typeConverters = __webpack_require__(37);
const localize = nls.loadMessageBundle();
class MyCompletionItem extends vscode.CompletionItem {
    constructor(position, document, tsEntry, completionContext, metadata, client) {
        super(tsEntry.name, MyCompletionItem.convertKind(tsEntry.kind));
        this.position = position;
        this.document = document;
        this.tsEntry = tsEntry;
        this.completionContext = completionContext;
        this.metadata = metadata;
        if (tsEntry.source && tsEntry.hasAction) {
            // De-prioritze auto-imports
            // https://github.com/microsoft/vscode/issues/40311
            this.sortText = '\uffff' + tsEntry.sortText;
            // Render "fancy" when source is a workspace path
            const qualifierCandidate = vscode.workspace.asRelativePath(tsEntry.source);
            if (qualifierCandidate !== tsEntry.source) {
                this.label = { label: tsEntry.name, description: qualifierCandidate };
            }
        }
        else {
            this.sortText = tsEntry.sortText;
        }
        const { sourceDisplay, isSnippet } = tsEntry;
        if (sourceDisplay) {
            this.label = { label: tsEntry.name, description: Previewer.plainWithLinks(sourceDisplay, client) };
        }
        this.preselect = tsEntry.isRecommended;
        this.position = position;
        this.useCodeSnippet = completionContext.useCodeSnippetsOnMethodSuggest && (this.kind === vscode.CompletionItemKind.Function || this.kind === vscode.CompletionItemKind.Method);
        this.range = this.getRangeFromReplacementSpan(tsEntry, completionContext);
        this.commitCharacters = MyCompletionItem.getCommitCharacters(completionContext, tsEntry);
        this.insertText = isSnippet && tsEntry.insertText ? new vscode.SnippetString(tsEntry.insertText) : tsEntry.insertText;
        this.filterText = this.getFilterText(completionContext.line, tsEntry.insertText);
        if (completionContext.isMemberCompletion && completionContext.dotAccessorContext && !(this.insertText instanceof vscode.SnippetString)) {
            this.filterText = completionContext.dotAccessorContext.text + (this.insertText || this.label);
            if (!this.range) {
                const replacementRange = this.getFuzzyWordRange();
                if (replacementRange) {
                    this.range = {
                        inserting: completionContext.dotAccessorContext.range,
                        replacing: completionContext.dotAccessorContext.range.union(replacementRange),
                    };
                }
                else {
                    this.range = completionContext.dotAccessorContext.range;
                }
                this.insertText = this.filterText;
            }
        }
        if (tsEntry.kindModifiers) {
            const kindModifiers = (0, modifiers_1.parseKindModifier)(tsEntry.kindModifiers);
            if (kindModifiers.has(PConst.KindModifiers.optional)) {
                if (!this.insertText) {
                    this.insertText = this.textLabel;
                }
                if (!this.filterText) {
                    this.filterText = this.textLabel;
                }
                if (typeof this.label === 'string') {
                    this.label += '?';
                }
                else {
                    this.label.label += '?';
                }
            }
            if (kindModifiers.has(PConst.KindModifiers.deprecated)) {
                this.tags = [vscode.CompletionItemTag.Deprecated];
            }
            if (kindModifiers.has(PConst.KindModifiers.color)) {
                this.kind = vscode.CompletionItemKind.Color;
            }
            if (tsEntry.kind === PConst.Kind.script) {
                for (const extModifier of PConst.KindModifiers.fileExtensionKindModifiers) {
                    if (kindModifiers.has(extModifier)) {
                        if (tsEntry.name.toLowerCase().endsWith(extModifier)) {
                            this.detail = tsEntry.name;
                        }
                        else {
                            this.detail = tsEntry.name + extModifier;
                        }
                        break;
                    }
                }
            }
        }
        this.resolveRange();
    }
    get textLabel() {
        return typeof this.label === 'string' ? this.label : this.label.label;
    }
    async resolveCompletionItem(client, token) {
        token.onCancellationRequested(() => {
            if (this._resolvedPromise && --this._resolvedPromise.waiting <= 0) {
                // Give a little extra time for another caller to come in
                setTimeout(() => {
                    if (this._resolvedPromise && this._resolvedPromise.waiting <= 0) {
                        this._resolvedPromise.requestToken.cancel();
                    }
                }, 300);
            }
        });
        if (this._resolvedPromise) {
            ++this._resolvedPromise.waiting;
            return this._resolvedPromise.promise;
        }
        const requestToken = new vscode.CancellationTokenSource();
        const promise = (async () => {
            const filepath = client.toOpenedFilePath(this.document);
            if (!filepath) {
                return undefined;
            }
            const args = {
                ...typeConverters.Position.toFileLocationRequestArgs(filepath, this.position),
                entryNames: [
                    this.tsEntry.source || this.tsEntry.data ? {
                        name: this.tsEntry.name,
                        source: this.tsEntry.source,
                        data: this.tsEntry.data,
                    } : this.tsEntry.name
                ]
            };
            const response = await client.interruptGetErr(() => client.execute('completionEntryDetails', args, requestToken.token));
            if (response.type !== 'response' || !response.body || !response.body.length) {
                return undefined;
            }
            const detail = response.body[0];
            if (!this.detail && detail.displayParts.length) {
                this.detail = Previewer.plainWithLinks(detail.displayParts, client);
            }
            this.documentation = this.getDocumentation(client, detail, this);
            const codeAction = this.getCodeActions(detail, filepath);
            const commands = [{
                    command: CompletionAcceptedCommand.ID,
                    title: '',
                    arguments: [this]
                }];
            if (codeAction.command) {
                commands.push(codeAction.command);
            }
            const additionalTextEdits = codeAction.additionalTextEdits;
            if (this.useCodeSnippet) {
                const shouldCompleteFunction = await this.isValidFunctionCompletionContext(client, filepath, this.position, this.document, token);
                if (shouldCompleteFunction) {
                    const { snippet, parameterCount } = (0, snippetForFunctionCall_1.snippetForFunctionCall)({ ...this, label: this.textLabel }, detail.displayParts);
                    this.insertText = snippet;
                    if (parameterCount > 0) {
                        //Fix for https://github.com/microsoft/vscode/issues/104059
                        //Don't show parameter hints if "editor.parameterHints.enabled": false
                        if (vscode.workspace.getConfiguration('editor.parameterHints').get('enabled')) {
                            commands.push({ title: 'triggerParameterHints', command: 'editor.action.triggerParameterHints' });
                        }
                    }
                }
            }
            return { commands, edits: additionalTextEdits };
        })();
        this._resolvedPromise = {
            promise,
            requestToken,
            waiting: 1,
        };
        return this._resolvedPromise.promise;
    }
    getDocumentation(client, detail, item) {
        const documentation = new vscode.MarkdownString();
        if (detail.source) {
            const importPath = `'${Previewer.plainWithLinks(detail.source, client)}'`;
            const autoImportLabel = localize('autoImportLabel', 'Auto import from {0}', importPath);
            item.detail = `${autoImportLabel}\n${item.detail}`;
        }
        Previewer.addMarkdownDocumentation(documentation, detail.documentation, detail.tags, client);
        return documentation.value.length ? documentation : undefined;
    }
    async isValidFunctionCompletionContext(client, filepath, position, document, token) {
        // Workaround for https://github.com/microsoft/TypeScript/issues/12677
        // Don't complete function calls inside of destructive assignments or imports
        try {
            const args = typeConverters.Position.toFileLocationRequestArgs(filepath, position);
            const response = await client.execute('quickinfo', args, token);
            if (response.type === 'response' && response.body) {
                switch (response.body.kind) {
                    case 'var':
                    case 'let':
                    case 'const':
                    case 'alias':
                        return false;
                }
            }
        }
        catch {
            // Noop
        }
        // Don't complete function call if there is already something that looks like a function call
        // https://github.com/microsoft/vscode/issues/18131
        const after = document.lineAt(position.line).text.slice(position.character);
        return after.match(/^[a-z_$0-9]*\s*\(/gi) === null;
    }
    getCodeActions(detail, filepath) {
        if (!detail.codeActions || !detail.codeActions.length) {
            return {};
        }
        // Try to extract out the additionalTextEdits for the current file.
        // Also check if we still have to apply other workspace edits and commands
        // using a vscode command
        const additionalTextEdits = [];
        let hasRemainingCommandsOrEdits = false;
        for (const tsAction of detail.codeActions) {
            if (tsAction.commands) {
                hasRemainingCommandsOrEdits = true;
            }
            // Apply all edits in the current file using `additionalTextEdits`
            if (tsAction.changes) {
                for (const change of tsAction.changes) {
                    if (change.fileName === filepath) {
                        additionalTextEdits.push(...change.textChanges.map(typeConverters.TextEdit.fromCodeEdit));
                    }
                    else {
                        hasRemainingCommandsOrEdits = true;
                    }
                }
            }
        }
        let command = undefined;
        if (hasRemainingCommandsOrEdits) {
            // Create command that applies all edits not in the current file.
            command = {
                title: '',
                command: ApplyCompletionCodeActionCommand.ID,
                arguments: [filepath, detail.codeActions.map((x) => ({
                        commands: x.commands,
                        description: x.description,
                        changes: x.changes.filter(x => x.fileName !== filepath)
                    }))]
            };
        }
        return {
            command,
            additionalTextEdits: additionalTextEdits.length ? additionalTextEdits : undefined
        };
    }
    getRangeFromReplacementSpan(tsEntry, completionContext) {
        if (!tsEntry.replacementSpan) {
            return;
        }
        let replaceRange = typeConverters.Range.fromTextSpan(tsEntry.replacementSpan);
        // Make sure we only replace a single line at most
        if (!replaceRange.isSingleLine) {
            replaceRange = new vscode.Range(replaceRange.start.line, replaceRange.start.character, replaceRange.start.line, completionContext.line.length);
        }
        // If TS returns an explicit replacement range, we should use it for both types of completion
        return {
            inserting: replaceRange,
            replacing: replaceRange,
        };
    }
    getFilterText(line, insertText) {
        // Handle private field completions
        if (this.tsEntry.name.startsWith('#')) {
            const wordRange = this.completionContext.wordRange;
            const wordStart = wordRange ? line.charAt(wordRange.start.character) : undefined;
            if (insertText) {
                if (insertText.startsWith('this.#')) {
                    return wordStart === '#' ? insertText : insertText.replace(/^this\.#/, '');
                }
                else {
                    return insertText;
                }
            }
            else {
                return wordStart === '#' ? undefined : this.tsEntry.name.replace(/^#/, '');
            }
        }
        // For `this.` completions, generally don't set the filter text since we don't want them to be overly prioritized. #74164
        if (insertText?.startsWith('this.')) {
            return undefined;
        }
        // Handle the case:
        // ```
        // const xyz = { 'ab c': 1 };
        // xyz.ab|
        // ```
        // In which case we want to insert a bracket accessor but should use `.abc` as the filter text instead of
        // the bracketed insert text.
        else if (insertText?.startsWith('[')) {
            return insertText.replace(/^\[['"](.+)[['"]\]$/, '.$1');
        }
        // In all other cases, fallback to using the insertText
        return insertText;
    }
    resolveRange() {
        if (this.range) {
            return;
        }
        const replaceRange = this.getFuzzyWordRange();
        if (replaceRange) {
            this.range = {
                inserting: new vscode.Range(replaceRange.start, this.position),
                replacing: replaceRange
            };
        }
    }
    getFuzzyWordRange() {
        if (this.completionContext.useFuzzyWordRangeLogic) {
            // Try getting longer, prefix based range for completions that span words
            const text = this.completionContext.line.slice(Math.max(0, this.position.character - this.textLabel.length), this.position.character).toLowerCase();
            const entryName = this.textLabel.toLowerCase();
            for (let i = entryName.length; i >= 0; --i) {
                if (text.endsWith(entryName.substr(0, i)) && (!this.completionContext.wordRange || this.completionContext.wordRange.start.character > this.position.character - i)) {
                    return new vscode.Range(new vscode.Position(this.position.line, Math.max(0, this.position.character - i)), this.position);
                }
            }
        }
        return this.completionContext.wordRange;
    }
    static convertKind(kind) {
        switch (kind) {
            case PConst.Kind.primitiveType:
            case PConst.Kind.keyword:
                return vscode.CompletionItemKind.Keyword;
            case PConst.Kind.const:
            case PConst.Kind.let:
            case PConst.Kind.variable:
            case PConst.Kind.localVariable:
            case PConst.Kind.alias:
            case PConst.Kind.parameter:
                return vscode.CompletionItemKind.Variable;
            case PConst.Kind.memberVariable:
            case PConst.Kind.memberGetAccessor:
            case PConst.Kind.memberSetAccessor:
                return vscode.CompletionItemKind.Field;
            case PConst.Kind.function:
            case PConst.Kind.localFunction:
                return vscode.CompletionItemKind.Function;
            case PConst.Kind.method:
            case PConst.Kind.constructSignature:
            case PConst.Kind.callSignature:
            case PConst.Kind.indexSignature:
                return vscode.CompletionItemKind.Method;
            case PConst.Kind.enum:
                return vscode.CompletionItemKind.Enum;
            case PConst.Kind.enumMember:
                return vscode.CompletionItemKind.EnumMember;
            case PConst.Kind.module:
            case PConst.Kind.externalModuleName:
                return vscode.CompletionItemKind.Module;
            case PConst.Kind.class:
            case PConst.Kind.type:
                return vscode.CompletionItemKind.Class;
            case PConst.Kind.interface:
                return vscode.CompletionItemKind.Interface;
            case PConst.Kind.warning:
                return vscode.CompletionItemKind.Text;
            case PConst.Kind.script:
                return vscode.CompletionItemKind.File;
            case PConst.Kind.directory:
                return vscode.CompletionItemKind.Folder;
            case PConst.Kind.string:
                return vscode.CompletionItemKind.Constant;
            default:
                return vscode.CompletionItemKind.Property;
        }
    }
    static getCommitCharacters(context, entry) {
        if (entry.kind === PConst.Kind.warning) { // Ambient JS word based suggestion
            return undefined;
        }
        if (context.isNewIdentifierLocation || !context.isInValidCommitCharacterContext) {
            return undefined;
        }
        const commitCharacters = ['.', ',', ';'];
        if (context.enableCallCompletions) {
            commitCharacters.push('(');
        }
        return commitCharacters;
    }
}
class CompletionAcceptedCommand {
    constructor(onCompletionAccepted, telemetryReporter) {
        this.onCompletionAccepted = onCompletionAccepted;
        this.telemetryReporter = telemetryReporter;
        this.id = CompletionAcceptedCommand.ID;
    }
    execute(item) {
        this.onCompletionAccepted(item);
        if (item instanceof MyCompletionItem) {
            /* __GDPR__
                "completions.accept" : {
                    "isPackageJsonImport" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "isImportStatementCompletion" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "${include}": [
                        "${TypeScriptCommonProperties}"
                    ]
                }
            */
            this.telemetryReporter.logTelemetry('completions.accept', {
                isPackageJsonImport: item.tsEntry.isPackageJsonImport ? 'true' : undefined,
                isImportStatementCompletion: item.tsEntry.isImportStatementCompletion ? 'true' : undefined,
            });
        }
    }
}
CompletionAcceptedCommand.ID = '_typescript.onCompletionAccepted';
/**
 * Command fired when an completion item needs to be applied
 */
class ApplyCompletionCommand {
    constructor(client) {
        this.client = client;
        this.id = ApplyCompletionCommand.ID;
    }
    async execute(item) {
        const resolved = await item.resolveCompletionItem(this.client, cancellation_1.nulToken);
        if (!resolved) {
            return;
        }
        const { edits, commands } = resolved;
        if (edits) {
            const workspaceEdit = new vscode.WorkspaceEdit();
            for (const edit of edits) {
                workspaceEdit.replace(item.document.uri, edit.range, edit.newText);
            }
            await vscode.workspace.applyEdit(workspaceEdit);
        }
        for (const command of commands) {
            await vscode.commands.executeCommand(command.command, ...(command.arguments ?? []));
        }
    }
}
ApplyCompletionCommand.ID = '_typescript.applyCompletionCommand';
class ApplyCompletionCodeActionCommand {
    constructor(client) {
        this.client = client;
        this.id = ApplyCompletionCodeActionCommand.ID;
    }
    async execute(_file, codeActions) {
        if (codeActions.length === 0) {
            return true;
        }
        if (codeActions.length === 1) {
            return (0, codeAction_1.applyCodeAction)(this.client, codeActions[0], cancellation_1.nulToken);
        }
        const selection = await vscode.window.showQuickPick(codeActions.map(action => ({
            label: action.description,
            description: '',
            action,
        })), {
            placeHolder: localize('selectCodeAction', 'Select code action to apply')
        });
        if (selection) {
            return (0, codeAction_1.applyCodeAction)(this.client, selection.action, cancellation_1.nulToken);
        }
        return false;
    }
}
ApplyCompletionCodeActionCommand.ID = '_typescript.applyCompletionCodeAction';
var CompletionConfiguration;
(function (CompletionConfiguration) {
    CompletionConfiguration.useCodeSnippetsOnMethodSuggest = 'suggest.completeFunctionCalls';
    CompletionConfiguration.nameSuggestions = 'suggest.names';
    CompletionConfiguration.pathSuggestions = 'suggest.paths';
    CompletionConfiguration.autoImportSuggestions = 'suggest.autoImports';
    CompletionConfiguration.importStatementSuggestions = 'suggest.importStatements';
    function getConfigurationForResource(modeId, resource) {
        const config = vscode.workspace.getConfiguration(modeId, resource);
        return {
            useCodeSnippetsOnMethodSuggest: config.get(CompletionConfiguration.useCodeSnippetsOnMethodSuggest, false),
            pathSuggestions: config.get(CompletionConfiguration.pathSuggestions, true),
            autoImportSuggestions: config.get(CompletionConfiguration.autoImportSuggestions, true),
            nameSuggestions: config.get(CompletionConfiguration.nameSuggestions, true),
            importStatementSuggestions: config.get(CompletionConfiguration.importStatementSuggestions, true),
        };
    }
    CompletionConfiguration.getConfigurationForResource = getConfigurationForResource;
})(CompletionConfiguration || (CompletionConfiguration = {}));
class TypeScriptCompletionItemProvider {
    constructor(client, modeId, typingsStatus, fileConfigurationManager, commandManager, telemetryReporter, onCompletionAccepted) {
        this.client = client;
        this.modeId = modeId;
        this.typingsStatus = typingsStatus;
        this.fileConfigurationManager = fileConfigurationManager;
        this.telemetryReporter = telemetryReporter;
        commandManager.register(new ApplyCompletionCodeActionCommand(this.client));
        commandManager.register(new CompletionAcceptedCommand(onCompletionAccepted, this.telemetryReporter));
        commandManager.register(new ApplyCompletionCommand(this.client));
    }
    async provideCompletionItems(document, position, token, context) {
        if (this.typingsStatus.isAcquiringTypings) {
            return Promise.reject({
                label: localize({ key: 'acquiringTypingsLabel', comment: ['Typings refers to the *.d.ts typings files that power our IntelliSense. It should not be localized'] }, 'Acquiring typings...'),
                detail: localize({ key: 'acquiringTypingsDetail', comment: ['Typings refers to the *.d.ts typings files that power our IntelliSense. It should not be localized'] }, 'Acquiring typings definitions for IntelliSense.')
            });
        }
        const file = this.client.toOpenedFilePath(document);
        if (!file) {
            return undefined;
        }
        const line = document.lineAt(position.line);
        const completionConfiguration = CompletionConfiguration.getConfigurationForResource(this.modeId, document.uri);
        if (!this.shouldTrigger(context, line, position, completionConfiguration)) {
            return undefined;
        }
        const wordRange = document.getWordRangeAtPosition(position);
        await this.client.interruptGetErr(() => this.fileConfigurationManager.ensureConfigurationForDocument(document, token));
        const args = {
            ...typeConverters.Position.toFileLocationRequestArgs(file, position),
            includeExternalModuleExports: completionConfiguration.autoImportSuggestions,
            includeInsertTextCompletions: true,
            triggerCharacter: this.getTsTriggerCharacter(context),
            triggerKind: typeConverters.CompletionTriggerKind.toProtocolCompletionTriggerKind(context.triggerKind),
        };
        let isNewIdentifierLocation = true;
        let isIncomplete = false;
        let isMemberCompletion = false;
        let dotAccessorContext;
        let entries;
        let metadata;
        let response;
        let duration;
        if (this.client.apiVersion.gte(api_1.default.v300)) {
            const startTime = Date.now();
            try {
                response = await this.client.interruptGetErr(() => this.client.execute('completionInfo', args, token));
            }
            finally {
                duration = Date.now() - startTime;
            }
            if (response.type !== 'response' || !response.body) {
                this.logCompletionsTelemetry(duration, response);
                return undefined;
            }
            isNewIdentifierLocation = response.body.isNewIdentifierLocation;
            isMemberCompletion = response.body.isMemberCompletion;
            if (isMemberCompletion) {
                const dotMatch = line.text.slice(0, position.character).match(/\??\.\s*$/) || undefined;
                if (dotMatch) {
                    const range = new vscode.Range(position.translate({ characterDelta: -dotMatch[0].length }), position);
                    const text = document.getText(range);
                    dotAccessorContext = { range, text };
                }
            }
            isIncomplete = !!response.body.isIncomplete || response.metadata && response.metadata.isIncomplete;
            entries = response.body.entries;
            metadata = response.metadata;
        }
        else {
            const response = await this.client.interruptGetErr(() => this.client.execute('completions', args, token));
            if (response.type !== 'response' || !response.body) {
                return undefined;
            }
            entries = response.body;
            metadata = response.metadata;
        }
        const completionContext = {
            isNewIdentifierLocation,
            isMemberCompletion,
            dotAccessorContext,
            isInValidCommitCharacterContext: this.isInValidCommitCharacterContext(document, position),
            enableCallCompletions: !completionConfiguration.useCodeSnippetsOnMethodSuggest,
            wordRange,
            line: line.text,
            useCodeSnippetsOnMethodSuggest: completionConfiguration.useCodeSnippetsOnMethodSuggest,
            useFuzzyWordRangeLogic: this.client.apiVersion.lt(api_1.default.v390),
        };
        let includesPackageJsonImport = false;
        let includesImportStatementCompletion = false;
        const items = [];
        for (const entry of entries) {
            if (!shouldExcludeCompletionEntry(entry, completionConfiguration)) {
                const item = new MyCompletionItem(position, document, entry, completionContext, metadata, this.client);
                item.command = {
                    command: ApplyCompletionCommand.ID,
                    title: '',
                    arguments: [item]
                };
                items.push(item);
                includesPackageJsonImport = includesPackageJsonImport || !!entry.isPackageJsonImport;
                includesImportStatementCompletion = includesImportStatementCompletion || !!entry.isImportStatementCompletion;
            }
        }
        if (duration !== undefined) {
            this.logCompletionsTelemetry(duration, response, includesPackageJsonImport, includesImportStatementCompletion);
        }
        return new vscode.CompletionList(items, isIncomplete);
    }
    logCompletionsTelemetry(duration, response, includesPackageJsonImport, includesImportStatementCompletion) {
        /* __GDPR__
            "completions.execute" : {
                "duration" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "type" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "count" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "updateGraphDurationMs" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "createAutoImportProviderProgramDurationMs" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "includesPackageJsonImport" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "includesImportStatementCompletion" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "${include}": [
                    "${TypeScriptCommonProperties}"
                ]
            }
        */
        this.telemetryReporter.logTelemetry('completions.execute', {
            duration: String(duration),
            type: response?.type ?? 'unknown',
            count: String(response?.type === 'response' && response.body ? response.body.entries.length : 0),
            updateGraphDurationMs: response?.type === 'response' && typeof response.performanceData?.updateGraphDurationMs === 'number'
                ? String(response.performanceData.updateGraphDurationMs)
                : undefined,
            createAutoImportProviderProgramDurationMs: response?.type === 'response' && typeof response.performanceData?.createAutoImportProviderProgramDurationMs === 'number'
                ? String(response.performanceData.createAutoImportProviderProgramDurationMs)
                : undefined,
            includesPackageJsonImport: includesPackageJsonImport ? 'true' : undefined,
            includesImportStatementCompletion: includesImportStatementCompletion ? 'true' : undefined,
        });
    }
    getTsTriggerCharacter(context) {
        switch (context.triggerCharacter) {
            case '@': // Workaround for https://github.com/microsoft/TypeScript/issues/27321
                return this.client.apiVersion.gte(api_1.default.v310) && this.client.apiVersion.lt(api_1.default.v320) ? undefined : '@';
            case '#': // Workaround for https://github.com/microsoft/TypeScript/issues/36367
                return this.client.apiVersion.lt(api_1.default.v381) ? undefined : '#';
            case ' ':
                const space = ' ';
                return this.client.apiVersion.gte(api_1.default.v430) ? space : undefined;
            case '.':
            case '"':
            case '\'':
            case '`':
            case '/':
            case '<':
                return context.triggerCharacter;
        }
        return undefined;
    }
    async resolveCompletionItem(item, token) {
        await item.resolveCompletionItem(this.client, token);
        return item;
    }
    isInValidCommitCharacterContext(document, position) {
        if (this.client.apiVersion.lt(api_1.default.v320)) {
            // Workaround for https://github.com/microsoft/TypeScript/issues/27742
            // Only enable dot completions when previous character not a dot preceded by whitespace.
            // Prevents incorrectly completing while typing spread operators.
            if (position.character > 1) {
                const preText = document.getText(new vscode.Range(position.line, 0, position.line, position.character));
                return preText.match(/(\s|^)\.$/ig) === null;
            }
        }
        return true;
    }
    shouldTrigger(context, line, position, configuration) {
        if (context.triggerCharacter && this.client.apiVersion.lt(api_1.default.v290)) {
            if ((context.triggerCharacter === '"' || context.triggerCharacter === '\'')) {
                // make sure we are in something that looks like the start of an import
                const pre = line.text.slice(0, position.character);
                if (!/\b(from|import)\s*["']$/.test(pre) && !/\b(import|require)\(['"]$/.test(pre)) {
                    return false;
                }
            }
            if (context.triggerCharacter === '/') {
                // make sure we are in something that looks like an import path
                const pre = line.text.slice(0, position.character);
                if (!/\b(from|import)\s*["'][^'"]*$/.test(pre) && !/\b(import|require)\(['"][^'"]*$/.test(pre)) {
                    return false;
                }
            }
            if (context.triggerCharacter === '@') {
                // make sure we are in something that looks like the start of a jsdoc comment
                const pre = line.text.slice(0, position.character);
                if (!/^\s*\*[ ]?@/.test(pre) && !/\/\*\*+[ ]?@/.test(pre)) {
                    return false;
                }
            }
            if (context.triggerCharacter === '<') {
                return false;
            }
        }
        if (context.triggerCharacter === ' ') {
            if (!configuration.importStatementSuggestions || this.client.apiVersion.lt(api_1.default.v430)) {
                return false;
            }
            const pre = line.text.slice(0, position.character);
            return pre === 'import';
        }
        return true;
    }
}
TypeScriptCompletionItemProvider.triggerCharacters = ['.', '"', '\'', '`', '/', '@', '<', '#', ' '];
function shouldExcludeCompletionEntry(element, completionConfiguration) {
    return ((!completionConfiguration.nameSuggestions && element.kind === PConst.Kind.warning)
        || (!completionConfiguration.pathSuggestions &&
            (element.kind === PConst.Kind.directory || element.kind === PConst.Kind.script || element.kind === PConst.Kind.externalModuleName))
        || (!completionConfiguration.autoImportSuggestions && element.hasAction));
}
function register(selector, modeId, client, typingsStatus, fileConfigurationManager, commandManager, telemetryReporter, onCompletionAccepted) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireConfiguration)(modeId, 'suggest.enabled'),
        (0, dependentRegistration_1.requireSomeCapability)(client, typescriptService_1.ClientCapability.EnhancedSyntax, typescriptService_1.ClientCapability.Semantic),
    ], () => {
        return vscode.languages.registerCompletionItemProvider(selector.syntax, new TypeScriptCompletionItemProvider(client, modeId, typingsStatus, fileConfigurationManager, commandManager, telemetryReporter, onCompletionAccepted), ...TypeScriptCompletionItemProvider.triggerCharacters);
    });
}
exports.register = register;


/***/ }),
/* 47 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.applyCodeActionCommands = exports.applyCodeAction = exports.getEditForCodeAction = void 0;
const vscode = __webpack_require__(1);
const typeConverters = __webpack_require__(37);
function getEditForCodeAction(client, action) {
    return action.changes && action.changes.length
        ? typeConverters.WorkspaceEdit.fromFileCodeEdits(client, action.changes)
        : undefined;
}
exports.getEditForCodeAction = getEditForCodeAction;
async function applyCodeAction(client, action, token) {
    const workspaceEdit = getEditForCodeAction(client, action);
    if (workspaceEdit) {
        if (!(await vscode.workspace.applyEdit(workspaceEdit))) {
            return false;
        }
    }
    return applyCodeActionCommands(client, action.commands, token);
}
exports.applyCodeAction = applyCodeAction;
async function applyCodeActionCommands(client, commands, token) {
    if (commands && commands.length) {
        for (const command of commands) {
            await client.execute('applyCodeActionCommand', { command }, token);
        }
    }
    return true;
}
exports.applyCodeActionCommands = applyCodeActionCommands;


/***/ }),
/* 48 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addMarkdownDocumentation = exports.markdownDocumentation = exports.tagsMarkdownPreview = exports.plainWithLinks = void 0;
const vscode = __webpack_require__(1);
function replaceLinks(text) {
    return text
        // Http(s) links
        .replace(/\{@(link|linkplain|linkcode) (https?:\/\/[^ |}]+?)(?:[| ]([^{}\n]+?))?\}/gi, (_, tag, link, text) => {
        switch (tag) {
            case 'linkcode':
                return `[\`${text ? text.trim() : link}\`](${link})`;
            default:
                return `[${text ? text.trim() : link}](${link})`;
        }
    });
}
function processInlineTags(text) {
    return replaceLinks(text);
}
function getTagBodyText(tag, filePathConverter) {
    if (!tag.text) {
        return undefined;
    }
    // Convert to markdown code block if it does not already contain one
    function makeCodeblock(text) {
        if (text.match(/^\s*[~`]{3}/m)) {
            return text;
        }
        return '```\n' + text + '\n```';
    }
    const text = convertLinkTags(tag.text, filePathConverter);
    switch (tag.name) {
        case 'example':
            // check for caption tags, fix for #79704
            const captionTagMatches = text.match(/<caption>(.*?)<\/caption>\s*(\r\n|\n)/);
            if (captionTagMatches && captionTagMatches.index === 0) {
                return captionTagMatches[1] + '\n' + makeCodeblock(text.substr(captionTagMatches[0].length));
            }
            else {
                return makeCodeblock(text);
            }
        case 'author':
            // fix obsucated email address, #80898
            const emailMatch = text.match(/(.+)\s<([-.\w]+@[-.\w]+)>/);
            if (emailMatch === null) {
                return text;
            }
            else {
                return `${emailMatch[1]} ${emailMatch[2]}`;
            }
        case 'default':
            return makeCodeblock(text);
    }
    return processInlineTags(text);
}
function getTagDocumentation(tag, filePathConverter) {
    switch (tag.name) {
        case 'augments':
        case 'extends':
        case 'param':
        case 'template':
            const body = (convertLinkTags(tag.text, filePathConverter)).split(/^(\S+)\s*-?\s*/);
            if (body?.length === 3) {
                const param = body[1];
                const doc = body[2];
                const label = `*@${tag.name}* \`${param}\``;
                if (!doc) {
                    return label;
                }
                return label + (doc.match(/\r\n|\n/g) ? '  \n' + processInlineTags(doc) : ` \u2014 ${processInlineTags(doc)}`);
            }
    }
    // Generic tag
    const label = `*@${tag.name}*`;
    const text = getTagBodyText(tag, filePathConverter);
    if (!text) {
        return label;
    }
    return label + (text.match(/\r\n|\n/g) ? '  \n' + text : ` \u2014 ${text}`);
}
function plainWithLinks(parts, filePathConverter) {
    return processInlineTags(convertLinkTags(parts, filePathConverter));
}
exports.plainWithLinks = plainWithLinks;
/**
 * Convert `@link` inline tags to markdown links
 */
function convertLinkTags(parts, filePathConverter) {
    if (!parts) {
        return '';
    }
    if (typeof parts === 'string') {
        return parts;
    }
    const out = [];
    let currentLink;
    for (const part of parts) {
        switch (part.kind) {
            case 'link':
                if (currentLink) {
                    if (currentLink.target) {
                        const link = filePathConverter.toResource(currentLink.target.file)
                            .with({
                            fragment: `L${currentLink.target.start.line},${currentLink.target.start.offset}`
                        });
                        const linkText = currentLink.text ? currentLink.text : escapeMarkdownSyntaxTokensForCode(currentLink.name ?? '');
                        out.push(`[${currentLink.linkcode ? '`' + linkText + '`' : linkText}](${link.toString()})`);
                    }
                    else {
                        const text = currentLink.text ?? currentLink.name;
                        if (text) {
                            if (/^https?:/.test(text)) {
                                const parts = text.split(' ');
                                if (parts.length === 1) {
                                    out.push(parts[0]);
                                }
                                else if (parts.length > 1) {
                                    const linkText = escapeMarkdownSyntaxTokensForCode(parts.slice(1).join(' '));
                                    out.push(`[${currentLink.linkcode ? '`' + linkText + '`' : linkText}](${parts[0]})`);
                                }
                            }
                            else {
                                out.push(escapeMarkdownSyntaxTokensForCode(text));
                            }
                        }
                    }
                    currentLink = undefined;
                }
                else {
                    currentLink = {
                        linkcode: part.text === '{@linkcode '
                    };
                }
                break;
            case 'linkName':
                if (currentLink) {
                    currentLink.name = part.text;
                    currentLink.target = part.target;
                }
                break;
            case 'linkText':
                if (currentLink) {
                    currentLink.text = part.text;
                }
                break;
            default:
                out.push(part.text);
                break;
        }
    }
    return processInlineTags(out.join(''));
}
function tagsMarkdownPreview(tags, filePathConverter) {
    return tags.map(tag => getTagDocumentation(tag, filePathConverter)).join('  \n\n');
}
exports.tagsMarkdownPreview = tagsMarkdownPreview;
function markdownDocumentation(documentation, tags, filePathConverter) {
    const out = new vscode.MarkdownString();
    addMarkdownDocumentation(out, documentation, tags, filePathConverter);
    return out;
}
exports.markdownDocumentation = markdownDocumentation;
function addMarkdownDocumentation(out, documentation, tags, converter) {
    if (documentation) {
        out.appendMarkdown(plainWithLinks(documentation, converter));
    }
    if (tags) {
        const tagsPreview = tagsMarkdownPreview(tags, converter);
        if (tagsPreview) {
            out.appendMarkdown('\n\n' + tagsPreview);
        }
    }
    return out;
}
exports.addMarkdownDocumentation = addMarkdownDocumentation;
function escapeMarkdownSyntaxTokensForCode(text) {
    return text.replace(/`/g, '\\$&');
}


/***/ }),
/* 49 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.snippetForFunctionCall = void 0;
const vscode = __webpack_require__(1);
const PConst = __webpack_require__(34);
function snippetForFunctionCall(item, displayParts) {
    if (item.insertText && typeof item.insertText !== 'string') {
        return { snippet: item.insertText, parameterCount: 0 };
    }
    const parameterListParts = getParameterListParts(displayParts);
    const snippet = new vscode.SnippetString();
    snippet.appendText(`${item.insertText || item.label}(`);
    appendJoinedPlaceholders(snippet, parameterListParts.parts, ', ');
    if (parameterListParts.hasOptionalParameters) {
        snippet.appendTabstop();
    }
    snippet.appendText(')');
    snippet.appendTabstop(0);
    return { snippet, parameterCount: parameterListParts.parts.length + (parameterListParts.hasOptionalParameters ? 1 : 0) };
}
exports.snippetForFunctionCall = snippetForFunctionCall;
function appendJoinedPlaceholders(snippet, parts, joiner) {
    for (let i = 0; i < parts.length; ++i) {
        const paramterPart = parts[i];
        snippet.appendPlaceholder(paramterPart.text);
        if (i !== parts.length - 1) {
            snippet.appendText(joiner);
        }
    }
}
function getParameterListParts(displayParts) {
    const parts = [];
    let isInMethod = false;
    let hasOptionalParameters = false;
    let parenCount = 0;
    let braceCount = 0;
    outer: for (let i = 0; i < displayParts.length; ++i) {
        const part = displayParts[i];
        switch (part.kind) {
            case PConst.DisplayPartKind.methodName:
            case PConst.DisplayPartKind.functionName:
            case PConst.DisplayPartKind.text:
            case PConst.DisplayPartKind.propertyName:
                if (parenCount === 0 && braceCount === 0) {
                    isInMethod = true;
                }
                break;
            case PConst.DisplayPartKind.parameterName:
                if (parenCount === 1 && braceCount === 0 && isInMethod) {
                    // Only take top level paren names
                    const next = displayParts[i + 1];
                    // Skip optional parameters
                    const nameIsFollowedByOptionalIndicator = next && next.text === '?';
                    // Skip this parameter
                    const nameIsThis = part.text === 'this';
                    if (!nameIsFollowedByOptionalIndicator && !nameIsThis) {
                        parts.push(part);
                    }
                    hasOptionalParameters = hasOptionalParameters || nameIsFollowedByOptionalIndicator;
                }
                break;
            case PConst.DisplayPartKind.punctuation:
                if (part.text === '(') {
                    ++parenCount;
                }
                else if (part.text === ')') {
                    --parenCount;
                    if (parenCount <= 0 && isInMethod) {
                        break outer;
                    }
                }
                else if (part.text === '...' && parenCount === 1) {
                    // Found rest parmeter. Do not fill in any further arguments
                    hasOptionalParameters = true;
                    break outer;
                }
                else if (part.text === '{') {
                    ++braceCount;
                }
                else if (part.text === '}') {
                    --braceCount;
                }
                break;
        }
    }
    return { hasOptionalParameters, parts };
}


/***/ }),
/* 50 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const typescriptService_1 = __webpack_require__(32);
const api_1 = __webpack_require__(24);
const dependentRegistration_1 = __webpack_require__(35);
const typeConverters = __webpack_require__(37);
const definitionProviderBase_1 = __webpack_require__(51);
class TypeScriptDefinitionProvider extends definitionProviderBase_1.default {
    constructor(client) {
        super(client);
    }
    async provideDefinition(document, position, token) {
        if (this.client.apiVersion.gte(api_1.default.v270)) {
            const filepath = this.client.toOpenedFilePath(document);
            if (!filepath) {
                return undefined;
            }
            const args = typeConverters.Position.toFileLocationRequestArgs(filepath, position);
            const response = await this.client.execute('definitionAndBoundSpan', args, token);
            if (response.type !== 'response' || !response.body) {
                return undefined;
            }
            const span = response.body.textSpan ? typeConverters.Range.fromTextSpan(response.body.textSpan) : undefined;
            return response.body.definitions
                .map((location) => {
                const target = typeConverters.Location.fromTextSpan(this.client.toResource(location.file), location);
                if (location.contextStart && location.contextEnd) {
                    return {
                        originSelectionRange: span,
                        targetRange: typeConverters.Range.fromLocations(location.contextStart, location.contextEnd),
                        targetUri: target.uri,
                        targetSelectionRange: target.range,
                    };
                }
                return {
                    originSelectionRange: span,
                    targetRange: target.range,
                    targetUri: target.uri
                };
            });
        }
        return this.getSymbolLocations('definition', document, position, token);
    }
}
exports.default = TypeScriptDefinitionProvider;
function register(selector, client) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireSomeCapability)(client, typescriptService_1.ClientCapability.EnhancedSyntax, typescriptService_1.ClientCapability.Semantic),
    ], () => {
        return vscode.languages.registerDefinitionProvider(selector.syntax, new TypeScriptDefinitionProvider(client));
    });
}
exports.register = register;


/***/ }),
/* 51 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
const typeConverters = __webpack_require__(37);
class TypeScriptDefinitionProviderBase {
    constructor(client) {
        this.client = client;
    }
    async getSymbolLocations(definitionType, document, position, token) {
        const file = this.client.toOpenedFilePath(document);
        if (!file) {
            return undefined;
        }
        const args = typeConverters.Position.toFileLocationRequestArgs(file, position);
        const response = await this.client.execute(definitionType, args, token);
        if (response.type !== 'response' || !response.body) {
            return undefined;
        }
        return response.body.map(location => typeConverters.Location.fromTextSpan(this.client.toResource(location.file), location));
    }
}
exports.default = TypeScriptDefinitionProviderBase;


/***/ }),
/* 52 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const nls = __webpack_require__(9);
const api_1 = __webpack_require__(24);
const localize = nls.loadMessageBundle();
const tsDirectives = [
    {
        value: '@ts-check',
        description: localize('ts-check', "Enables semantic checking in a JavaScript file. Must be at the top of a file.")
    }, {
        value: '@ts-nocheck',
        description: localize('ts-nocheck', "Disables semantic checking in a JavaScript file. Must be at the top of a file.")
    }, {
        value: '@ts-ignore',
        description: localize('ts-ignore', "Suppresses @ts-check errors on the next line of a file.")
    }
];
const tsDirectives390 = [
    ...tsDirectives,
    {
        value: '@ts-expect-error',
        description: localize('ts-expect-error', "Suppresses @ts-check errors on the next line of a file, expecting at least one to exist.")
    }
];
class DirectiveCommentCompletionProvider {
    constructor(client) {
        this.client = client;
    }
    provideCompletionItems(document, position, _token) {
        const file = this.client.toOpenedFilePath(document);
        if (!file) {
            return [];
        }
        const line = document.lineAt(position.line).text;
        const prefix = line.slice(0, position.character);
        const match = prefix.match(/^\s*\/\/+\s?(@[a-zA-Z\-]*)?$/);
        if (match) {
            const directives = this.client.apiVersion.gte(api_1.default.v390)
                ? tsDirectives390
                : tsDirectives;
            return directives.map(directive => {
                const item = new vscode.CompletionItem(directive.value, vscode.CompletionItemKind.Snippet);
                item.detail = directive.description;
                item.range = new vscode.Range(position.line, Math.max(0, position.character - (match[1] ? match[1].length : 0)), position.line, position.character);
                return item;
            });
        }
        return [];
    }
}
function register(selector, client) {
    return vscode.languages.registerCompletionItemProvider(selector.syntax, new DirectiveCommentCompletionProvider(client), '@');
}
exports.register = register;


/***/ }),
/* 53 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const arrays_1 = __webpack_require__(28);
const typeConverters = __webpack_require__(37);
class TypeScriptDocumentHighlightProvider {
    constructor(client) {
        this.client = client;
    }
    async provideDocumentHighlights(document, position, token) {
        const file = this.client.toOpenedFilePath(document);
        if (!file) {
            return [];
        }
        const args = {
            ...typeConverters.Position.toFileLocationRequestArgs(file, position),
            filesToSearch: [file]
        };
        const response = await this.client.execute('documentHighlights', args, token);
        if (response.type !== 'response' || !response.body) {
            return [];
        }
        return (0, arrays_1.flatten)(response.body
            .filter(highlight => highlight.file === file)
            .map(convertDocumentHighlight));
    }
}
function convertDocumentHighlight(highlight) {
    return highlight.highlightSpans.map(span => new vscode.DocumentHighlight(typeConverters.Range.fromTextSpan(span), span.kind === 'writtenReference' ? vscode.DocumentHighlightKind.Write : vscode.DocumentHighlightKind.Read));
}
function register(selector, client) {
    return vscode.languages.registerDocumentHighlightProvider(selector.syntax, new TypeScriptDocumentHighlightProvider(client));
}
exports.register = register;


/***/ }),
/* 54 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const PConst = __webpack_require__(34);
const modifiers_1 = __webpack_require__(36);
const typeConverters = __webpack_require__(37);
const getSymbolKind = (kind) => {
    switch (kind) {
        case PConst.Kind.module: return vscode.SymbolKind.Module;
        case PConst.Kind.class: return vscode.SymbolKind.Class;
        case PConst.Kind.enum: return vscode.SymbolKind.Enum;
        case PConst.Kind.interface: return vscode.SymbolKind.Interface;
        case PConst.Kind.method: return vscode.SymbolKind.Method;
        case PConst.Kind.memberVariable: return vscode.SymbolKind.Property;
        case PConst.Kind.memberGetAccessor: return vscode.SymbolKind.Property;
        case PConst.Kind.memberSetAccessor: return vscode.SymbolKind.Property;
        case PConst.Kind.variable: return vscode.SymbolKind.Variable;
        case PConst.Kind.const: return vscode.SymbolKind.Variable;
        case PConst.Kind.localVariable: return vscode.SymbolKind.Variable;
        case PConst.Kind.function: return vscode.SymbolKind.Function;
        case PConst.Kind.localFunction: return vscode.SymbolKind.Function;
        case PConst.Kind.constructSignature: return vscode.SymbolKind.Constructor;
        case PConst.Kind.constructorImplementation: return vscode.SymbolKind.Constructor;
    }
    return vscode.SymbolKind.Variable;
};
class TypeScriptDocumentSymbolProvider {
    constructor(client, cachedResponse) {
        this.client = client;
        this.cachedResponse = cachedResponse;
    }
    async provideDocumentSymbols(document, token) {
        const file = this.client.toOpenedFilePath(document);
        if (!file) {
            return undefined;
        }
        const args = { file };
        const response = await this.cachedResponse.execute(document, () => this.client.execute('navtree', args, token));
        if (response.type !== 'response' || !response.body?.childItems) {
            return undefined;
        }
        // The root represents the file. Ignore this when showing in the UI
        const result = [];
        for (const item of response.body.childItems) {
            TypeScriptDocumentSymbolProvider.convertNavTree(document.uri, result, item);
        }
        return result;
    }
    static convertNavTree(resource, output, item) {
        let shouldInclude = TypeScriptDocumentSymbolProvider.shouldInclueEntry(item);
        if (!shouldInclude && !item.childItems?.length) {
            return false;
        }
        const children = new Set(item.childItems || []);
        for (const span of item.spans) {
            const range = typeConverters.Range.fromTextSpan(span);
            const symbolInfo = TypeScriptDocumentSymbolProvider.convertSymbol(item, range);
            for (const child of children) {
                if (child.spans.some(span => !!range.intersection(typeConverters.Range.fromTextSpan(span)))) {
                    const includedChild = TypeScriptDocumentSymbolProvider.convertNavTree(resource, symbolInfo.children, child);
                    shouldInclude = shouldInclude || includedChild;
                    children.delete(child);
                }
            }
            if (shouldInclude) {
                output.push(symbolInfo);
            }
        }
        return shouldInclude;
    }
    static convertSymbol(item, range) {
        const selectionRange = item.nameSpan ? typeConverters.Range.fromTextSpan(item.nameSpan) : range;
        let label = item.text;
        switch (item.kind) {
            case PConst.Kind.memberGetAccessor:
                label = `(get) ${label}`;
                break;
            case PConst.Kind.memberSetAccessor:
                label = `(set) ${label}`;
                break;
        }
        const symbolInfo = new vscode.DocumentSymbol(label, '', getSymbolKind(item.kind), range, range.contains(selectionRange) ? selectionRange : range);
        const kindModifiers = (0, modifiers_1.parseKindModifier)(item.kindModifiers);
        if (kindModifiers.has(PConst.KindModifiers.deprecated)) {
            symbolInfo.tags = [vscode.SymbolTag.Deprecated];
        }
        return symbolInfo;
    }
    static shouldInclueEntry(item) {
        if (item.kind === PConst.Kind.alias) {
            return false;
        }
        return !!(item.text && item.text !== '<function>' && item.text !== '<class>');
    }
}
function register(selector, client, cachedResponse) {
    return vscode.languages.registerDocumentSymbolProvider(selector.syntax, new TypeScriptDocumentSymbolProvider(client, cachedResponse), { label: 'TypeScript' });
}
exports.register = register;


/***/ }),
/* 55 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const nls = __webpack_require__(9);
const api_1 = __webpack_require__(24);
const languageModeIds_1 = __webpack_require__(14);
const typeConverters = __webpack_require__(37);
const localize = nls.loadMessageBundle();
class FileReferencesCommand {
    constructor(client) {
        this.client = client;
        this.id = 'typescript.findAllFileReferences';
    }
    async execute(resource) {
        if (this.client.apiVersion.lt(FileReferencesCommand.minVersion)) {
            vscode.window.showErrorMessage(localize('error.unsupportedVersion', "Find file references failed. Requires TypeScript 4.2+."));
            return;
        }
        if (!resource) {
            resource = vscode.window.activeTextEditor?.document.uri;
        }
        if (!resource) {
            vscode.window.showErrorMessage(localize('error.noResource', "Find file references failed. No resource provided."));
            return;
        }
        const document = await vscode.workspace.openTextDocument(resource);
        if (!(0, languageModeIds_1.isSupportedLanguageMode)(document)) {
            vscode.window.showErrorMessage(localize('error.unsupportedLanguage', "Find file references failed. Unsupported file type."));
            return;
        }
        const openedFiledPath = this.client.toOpenedFilePath(document);
        if (!openedFiledPath) {
            vscode.window.showErrorMessage(localize('error.unknownFile', "Find file references failed. Unknown file type."));
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            title: localize('progress.title', "Finding file references")
        }, async (_progress, token) => {
            const response = await this.client.execute('fileReferences', {
                file: openedFiledPath
            }, token);
            if (response.type !== 'response' || !response.body) {
                return;
            }
            const locations = response.body.refs.map(reference => typeConverters.Location.fromTextSpan(this.client.toResource(reference.file), reference));
            const config = vscode.workspace.getConfiguration('references');
            const existingSetting = config.inspect('preferredLocation');
            await config.update('preferredLocation', 'view');
            try {
                await vscode.commands.executeCommand('editor.action.showReferences', resource, new vscode.Position(0, 0), locations);
            }
            finally {
                await config.update('preferredLocation', existingSetting?.workspaceFolderValue ?? existingSetting?.workspaceValue);
            }
        });
    }
}
FileReferencesCommand.context = 'tsSupportsFileReferences';
FileReferencesCommand.minVersion = api_1.default.v420;
function register(client, commandManager) {
    function updateContext() {
        vscode.commands.executeCommand('setContext', FileReferencesCommand.context, client.apiVersion.gte(FileReferencesCommand.minVersion));
    }
    updateContext();
    commandManager.register(new FileReferencesCommand(client));
    return client.onTsServerStarted(() => updateContext());
}
exports.register = register;


/***/ }),
/* 56 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const nls = __webpack_require__(9);
const typescriptService_1 = __webpack_require__(32);
const api_1 = __webpack_require__(24);
const dependentRegistration_1 = __webpack_require__(35);
const errorCodes = __webpack_require__(57);
const fixNames = __webpack_require__(58);
const typeConverters = __webpack_require__(37);
const localize = nls.loadMessageBundle();
async function buildIndividualFixes(fixes, edit, client, file, diagnostics, token) {
    for (const diagnostic of diagnostics) {
        for (const { codes, fixName } of fixes) {
            if (token.isCancellationRequested) {
                return;
            }
            if (!codes.has(diagnostic.code)) {
                continue;
            }
            const args = {
                ...typeConverters.Range.toFileRangeRequestArgs(file, diagnostic.range),
                errorCodes: [+(diagnostic.code)]
            };
            const response = await client.execute('getCodeFixes', args, token);
            if (response.type !== 'response') {
                continue;
            }
            const fix = response.body?.find(fix => fix.fixName === fixName);
            if (fix) {
                typeConverters.WorkspaceEdit.withFileCodeEdits(edit, client, fix.changes);
                break;
            }
        }
    }
}
async function buildCombinedFix(fixes, edit, client, file, diagnostics, token) {
    for (const diagnostic of diagnostics) {
        for (const { codes, fixName } of fixes) {
            if (token.isCancellationRequested) {
                return;
            }
            if (!codes.has(diagnostic.code)) {
                continue;
            }
            const args = {
                ...typeConverters.Range.toFileRangeRequestArgs(file, diagnostic.range),
                errorCodes: [+(diagnostic.code)]
            };
            const response = await client.execute('getCodeFixes', args, token);
            if (response.type !== 'response' || !response.body?.length) {
                continue;
            }
            const fix = response.body?.find(fix => fix.fixName === fixName);
            if (!fix) {
                continue;
            }
            if (!fix.fixId) {
                typeConverters.WorkspaceEdit.withFileCodeEdits(edit, client, fix.changes);
                return;
            }
            const combinedArgs = {
                scope: {
                    type: 'file',
                    args: { file }
                },
                fixId: fix.fixId,
            };
            const combinedResponse = await client.execute('getCombinedCodeFix', combinedArgs, token);
            if (combinedResponse.type !== 'response' || !combinedResponse.body) {
                return;
            }
            typeConverters.WorkspaceEdit.withFileCodeEdits(edit, client, combinedResponse.body.changes);
            return;
        }
    }
}
// #region Source Actions
class SourceAction extends vscode.CodeAction {
}
class SourceFixAll extends SourceAction {
    constructor() {
        super(localize('autoFix.label', 'Fix All'), SourceFixAll.kind);
    }
    async build(client, file, diagnostics, token) {
        this.edit = new vscode.WorkspaceEdit();
        await buildIndividualFixes([
            { codes: errorCodes.incorrectlyImplementsInterface, fixName: fixNames.classIncorrectlyImplementsInterface },
            { codes: errorCodes.asyncOnlyAllowedInAsyncFunctions, fixName: fixNames.awaitInSyncFunction },
        ], this.edit, client, file, diagnostics, token);
        await buildCombinedFix([
            { codes: errorCodes.unreachableCode, fixName: fixNames.unreachableCode }
        ], this.edit, client, file, diagnostics, token);
    }
}
SourceFixAll.kind = vscode.CodeActionKind.SourceFixAll.append('ts');
class SourceRemoveUnused extends SourceAction {
    constructor() {
        super(localize('autoFix.unused.label', 'Remove all unused code'), SourceRemoveUnused.kind);
    }
    async build(client, file, diagnostics, token) {
        this.edit = new vscode.WorkspaceEdit();
        await buildCombinedFix([
            { codes: errorCodes.variableDeclaredButNeverUsed, fixName: fixNames.unusedIdentifier },
        ], this.edit, client, file, diagnostics, token);
    }
}
SourceRemoveUnused.kind = vscode.CodeActionKind.Source.append('removeUnused').append('ts');
class SourceAddMissingImports extends SourceAction {
    constructor() {
        super(localize('autoFix.missingImports.label', 'Add all missing imports'), SourceAddMissingImports.kind);
    }
    async build(client, file, diagnostics, token) {
        this.edit = new vscode.WorkspaceEdit();
        await buildCombinedFix([
            { codes: errorCodes.cannotFindName, fixName: fixNames.fixImport }
        ], this.edit, client, file, diagnostics, token);
    }
}
SourceAddMissingImports.kind = vscode.CodeActionKind.Source.append('addMissingImports').append('ts');
//#endregion
class TypeScriptAutoFixProvider {
    constructor(client, fileConfigurationManager, diagnosticsManager) {
        this.client = client;
        this.fileConfigurationManager = fileConfigurationManager;
        this.diagnosticsManager = diagnosticsManager;
    }
    get metadata() {
        return {
            providedCodeActionKinds: TypeScriptAutoFixProvider.kindProviders.map(x => x.kind),
        };
    }
    async provideCodeActions(document, _range, context, token) {
        if (!context.only || !vscode.CodeActionKind.Source.intersects(context.only)) {
            return undefined;
        }
        const file = this.client.toOpenedFilePath(document);
        if (!file) {
            return undefined;
        }
        const actions = this.getFixAllActions(context.only);
        if (this.client.bufferSyncSupport.hasPendingDiagnostics(document.uri)) {
            return actions;
        }
        const diagnostics = this.diagnosticsManager.getDiagnostics(document.uri);
        if (!diagnostics.length) {
            // Actions are a no-op in this case but we still want to return them
            return actions;
        }
        await this.fileConfigurationManager.ensureConfigurationForDocument(document, token);
        if (token.isCancellationRequested) {
            return undefined;
        }
        await Promise.all(actions.map(action => action.build(this.client, file, diagnostics, token)));
        return actions;
    }
    getFixAllActions(only) {
        return TypeScriptAutoFixProvider.kindProviders
            .filter(provider => only.intersects(provider.kind))
            .map(provider => new provider());
    }
}
TypeScriptAutoFixProvider.kindProviders = [
    SourceFixAll,
    SourceRemoveUnused,
    SourceAddMissingImports,
];
function register(selector, client, fileConfigurationManager, diagnosticsManager) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireMinVersion)(client, api_1.default.v300),
        (0, dependentRegistration_1.requireSomeCapability)(client, typescriptService_1.ClientCapability.Semantic),
    ], () => {
        const provider = new TypeScriptAutoFixProvider(client, fileConfigurationManager, diagnosticsManager);
        return vscode.languages.registerCodeActionsProvider(selector.semantic, provider, provider.metadata);
    });
}
exports.register = register;


/***/ }),
/* 57 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.asyncOnlyAllowedInAsyncFunctions = exports.extendsShouldBeImplements = exports.cannotFindName = exports.incorrectlyImplementsInterface = exports.notAllCodePathsReturnAValue = exports.fallThroughCaseInSwitch = exports.unusedLabel = exports.unreachableCode = exports.allImportsAreUnused = exports.propertyDeclaretedButNeverUsed = exports.variableDeclaredButNeverUsed = void 0;
exports.variableDeclaredButNeverUsed = new Set([6196, 6133]);
exports.propertyDeclaretedButNeverUsed = new Set([6138]);
exports.allImportsAreUnused = new Set([6192]);
exports.unreachableCode = new Set([7027]);
exports.unusedLabel = new Set([7028]);
exports.fallThroughCaseInSwitch = new Set([7029]);
exports.notAllCodePathsReturnAValue = new Set([7030]);
exports.incorrectlyImplementsInterface = new Set([2420]);
exports.cannotFindName = new Set([2552, 2304]);
exports.extendsShouldBeImplements = new Set([2689]);
exports.asyncOnlyAllowedInAsyncFunctions = new Set([1308]);


/***/ }),
/* 58 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addMissingOverride = exports.addMissingAwait = exports.fixImport = exports.spelling = exports.forgottenThisPropertyAccess = exports.unusedIdentifier = exports.unreachableCode = exports.classDoesntImplementInheritedAbstractMember = exports.classIncorrectlyImplementsInterface = exports.awaitInSyncFunction = exports.extendsInterfaceBecomesImplements = exports.constructorForDerivedNeedSuperCall = exports.annotateWithTypeFromJSDoc = void 0;
exports.annotateWithTypeFromJSDoc = 'annotateWithTypeFromJSDoc';
exports.constructorForDerivedNeedSuperCall = 'constructorForDerivedNeedSuperCall';
exports.extendsInterfaceBecomesImplements = 'extendsInterfaceBecomesImplements';
exports.awaitInSyncFunction = 'fixAwaitInSyncFunction';
exports.classIncorrectlyImplementsInterface = 'fixClassIncorrectlyImplementsInterface';
exports.classDoesntImplementInheritedAbstractMember = 'fixClassDoesntImplementInheritedAbstractMember';
exports.unreachableCode = 'fixUnreachableCode';
exports.unusedIdentifier = 'unusedIdentifier';
exports.forgottenThisPropertyAccess = 'forgottenThisPropertyAccess';
exports.spelling = 'spelling';
exports.fixImport = 'import';
exports.addMissingAwait = 'addMissingAwait';
exports.addMissingOverride = 'fixOverrideModifier';


/***/ }),
/* 59 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const api_1 = __webpack_require__(24);
const arrays_1 = __webpack_require__(28);
const dependentRegistration_1 = __webpack_require__(35);
const typeConverters = __webpack_require__(37);
class TypeScriptFoldingProvider {
    constructor(client) {
        this.client = client;
    }
    async provideFoldingRanges(document, _context, token) {
        const file = this.client.toOpenedFilePath(document);
        if (!file) {
            return;
        }
        const args = { file };
        const response = await this.client.execute('getOutliningSpans', args, token);
        if (response.type !== 'response' || !response.body) {
            return;
        }
        return (0, arrays_1.coalesce)(response.body.map(span => this.convertOutliningSpan(span, document)));
    }
    convertOutliningSpan(span, document) {
        const range = typeConverters.Range.fromTextSpan(span.textSpan);
        const kind = TypeScriptFoldingProvider.getFoldingRangeKind(span);
        // Workaround for #49904
        if (span.kind === 'comment') {
            const line = document.lineAt(range.start.line).text;
            if (line.match(/\/\/\s*#endregion/gi)) {
                return undefined;
            }
        }
        const start = range.start.line;
        const end = this.adjustFoldingEnd(range, document);
        return new vscode.FoldingRange(start, end, kind);
    }
    adjustFoldingEnd(range, document) {
        // workaround for #47240
        if (range.end.character > 0) {
            const foldEndCharacter = document.getText(new vscode.Range(range.end.translate(0, -1), range.end));
            if (TypeScriptFoldingProvider.foldEndPairCharacters.includes(foldEndCharacter)) {
                return Math.max(range.end.line - 1, range.start.line);
            }
        }
        return range.end.line;
    }
    static getFoldingRangeKind(span) {
        switch (span.kind) {
            case 'comment': return vscode.FoldingRangeKind.Comment;
            case 'region': return vscode.FoldingRangeKind.Region;
            case 'imports': return vscode.FoldingRangeKind.Imports;
            case 'code':
            default: return undefined;
        }
    }
}
TypeScriptFoldingProvider.minVersion = api_1.default.v280;
TypeScriptFoldingProvider.foldEndPairCharacters = ['}', ']', ')', '`', '>'];
function register(selector, client) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireMinVersion)(client, TypeScriptFoldingProvider.minVersion),
    ], () => {
        return vscode.languages.registerFoldingRangeProvider(selector.syntax, new TypeScriptFoldingProvider(client));
    });
}
exports.register = register;


/***/ }),
/* 60 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const dependentRegistration_1 = __webpack_require__(35);
const typeConverters = __webpack_require__(37);
class TypeScriptFormattingProvider {
    constructor(client, formattingOptionsManager) {
        this.client = client;
        this.formattingOptionsManager = formattingOptionsManager;
    }
    async provideDocumentRangeFormattingEdits(document, range, options, token) {
        const file = this.client.toOpenedFilePath(document);
        if (!file) {
            return undefined;
        }
        await this.formattingOptionsManager.ensureConfigurationOptions(document, options, token);
        const args = typeConverters.Range.toFormattingRequestArgs(file, range);
        const response = await this.client.execute('format', args, token);
        if (response.type !== 'response' || !response.body) {
            return undefined;
        }
        return response.body.map(typeConverters.TextEdit.fromCodeEdit);
    }
    async provideOnTypeFormattingEdits(document, position, ch, options, token) {
        const file = this.client.toOpenedFilePath(document);
        if (!file) {
            return [];
        }
        await this.formattingOptionsManager.ensureConfigurationOptions(document, options, token);
        const args = {
            ...typeConverters.Position.toFileLocationRequestArgs(file, position),
            key: ch
        };
        const response = await this.client.execute('formatonkey', args, token);
        if (response.type !== 'response' || !response.body) {
            return [];
        }
        const result = [];
        for (const edit of response.body) {
            const textEdit = typeConverters.TextEdit.fromCodeEdit(edit);
            const range = textEdit.range;
            // Work around for https://github.com/microsoft/TypeScript/issues/6700.
            // Check if we have an edit at the beginning of the line which only removes white spaces and leaves
            // an empty line. Drop those edits
            if (range.start.character === 0 && range.start.line === range.end.line && textEdit.newText === '') {
                const lText = document.lineAt(range.start.line).text;
                // If the edit leaves something on the line keep the edit (note that the end character is exclusive).
                // Keep it also if it removes something else than whitespace
                if (lText.trim().length > 0 || lText.length > range.end.character) {
                    result.push(textEdit);
                }
            }
            else {
                result.push(textEdit);
            }
        }
        return result;
    }
}
function register(selector, modeId, client, fileConfigurationManager) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireConfiguration)(modeId, 'format.enable'),
    ], () => {
        const formattingProvider = new TypeScriptFormattingProvider(client, fileConfigurationManager);
        return vscode.Disposable.from(vscode.languages.registerOnTypeFormattingEditProvider(selector.syntax, formattingProvider, ';', '}', '\n'), vscode.languages.registerDocumentRangeFormattingEditProvider(selector.syntax, formattingProvider));
    });
}
exports.register = register;


/***/ }),
/* 61 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const versionProvider_1 = __webpack_require__(62);
const typescriptService_1 = __webpack_require__(32);
const dependentRegistration_1 = __webpack_require__(35);
const previewer_1 = __webpack_require__(48);
const typeConverters = __webpack_require__(37);
class TypeScriptHoverProvider {
    constructor(client, fileConfigurationManager) {
        this.client = client;
        this.fileConfigurationManager = fileConfigurationManager;
    }
    async provideHover(document, position, token) {
        const filepath = this.client.toOpenedFilePath(document);
        if (!filepath) {
            return undefined;
        }
        const response = await this.client.interruptGetErr(async () => {
            await this.fileConfigurationManager.ensureConfigurationForDocument(document, token);
            const args = typeConverters.Position.toFileLocationRequestArgs(filepath, position);
            return this.client.execute('quickinfo', args, token);
        });
        if (response.type !== 'response' || !response.body) {
            return undefined;
        }
        return new vscode.Hover(this.getContents(document.uri, response.body, response._serverType), typeConverters.Range.fromTextSpan(response.body));
    }
    getContents(resource, data, source) {
        const parts = [];
        if (data.displayString) {
            const displayParts = [];
            if (source === typescriptService_1.ServerType.Syntax && this.client.hasCapabilityForResource(resource, typescriptService_1.ClientCapability.Semantic)) {
                displayParts.push((0, versionProvider_1.localize)({
                    key: 'loadingPrefix',
                    comment: ['Prefix displayed for hover entries while the server is still loading']
                }, "(loading...)"));
            }
            displayParts.push(data.displayString);
            parts.push(new vscode.MarkdownString().appendCodeblock(displayParts.join(' '), 'typescript'));
        }
        parts.push((0, previewer_1.markdownDocumentation)(data.documentation, data.tags, this.client));
        return parts;
    }
}
function register(selector, client, fileConfigurationManager) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireSomeCapability)(client, typescriptService_1.ClientCapability.EnhancedSyntax, typescriptService_1.ClientCapability.Semantic),
    ], () => {
        return vscode.languages.registerHoverProvider(selector.syntax, new TypeScriptHoverProvider(client, fileConfigurationManager));
    });
}
exports.register = register;


/***/ }),
/* 62 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TypeScriptVersion = exports.localize = void 0;
const nls = __webpack_require__(9);
exports.localize = nls.loadMessageBundle();
class TypeScriptVersion {
    constructor(source, path, apiVersion, _pathLabel) {
        this.source = source;
        this.path = path;
        this.apiVersion = apiVersion;
        this._pathLabel = _pathLabel;
    }
    get tsServerPath() {
        return this.path;
    }
    get pathLabel() {
        return this._pathLabel ?? this.path;
    }
    get isValid() {
        return this.apiVersion !== undefined;
    }
    eq(other) {
        if (this.path !== other.path) {
            return false;
        }
        if (this.apiVersion === other.apiVersion) {
            return true;
        }
        if (!this.apiVersion || !other.apiVersion) {
            return false;
        }
        return this.apiVersion.eq(other.apiVersion);
    }
    get displayName() {
        const version = this.apiVersion;
        return version ? version.displayName : (0, exports.localize)('couldNotLoadTsVersion', 'Could not load the TypeScript version at this path');
    }
}
exports.TypeScriptVersion = TypeScriptVersion;


/***/ }),
/* 63 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const typescriptService_1 = __webpack_require__(32);
const dependentRegistration_1 = __webpack_require__(35);
const definitionProviderBase_1 = __webpack_require__(51);
class TypeScriptImplementationProvider extends definitionProviderBase_1.default {
    provideImplementation(document, position, token) {
        return this.getSymbolLocations('implementation', document, position, token);
    }
}
function register(selector, client) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireSomeCapability)(client, typescriptService_1.ClientCapability.Semantic),
    ], () => {
        return vscode.languages.registerImplementationProvider(selector.semantic, new TypeScriptImplementationProvider(client));
    });
}
exports.register = register;


/***/ }),
/* 64 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = exports.templateToSnippet = void 0;
const vscode = __webpack_require__(1);
const nls = __webpack_require__(9);
const dependentRegistration_1 = __webpack_require__(35);
const typeConverters = __webpack_require__(37);
const localize = nls.loadMessageBundle();
const defaultJsDoc = new vscode.SnippetString(`/**\n * $0\n */`);
class JsDocCompletionItem extends vscode.CompletionItem {
    constructor(document, position) {
        super('/** */', vscode.CompletionItemKind.Text);
        this.document = document;
        this.position = position;
        this.detail = localize('typescript.jsDocCompletionItem.documentation', 'JSDoc comment');
        this.sortText = '\0';
        const line = document.lineAt(position.line).text;
        const prefix = line.slice(0, position.character).match(/\/\**\s*$/);
        const suffix = line.slice(position.character).match(/^\s*\**\//);
        const start = position.translate(0, prefix ? -prefix[0].length : 0);
        const range = new vscode.Range(start, position.translate(0, suffix ? suffix[0].length : 0));
        this.range = { inserting: range, replacing: range };
    }
}
class JsDocCompletionProvider {
    constructor(client, fileConfigurationManager) {
        this.client = client;
        this.fileConfigurationManager = fileConfigurationManager;
    }
    async provideCompletionItems(document, position, token) {
        const file = this.client.toOpenedFilePath(document);
        if (!file) {
            return undefined;
        }
        if (!this.isPotentiallyValidDocCompletionPosition(document, position)) {
            return undefined;
        }
        const response = await this.client.interruptGetErr(async () => {
            await this.fileConfigurationManager.ensureConfigurationForDocument(document, token);
            const args = typeConverters.Position.toFileLocationRequestArgs(file, position);
            return this.client.execute('docCommentTemplate', args, token);
        });
        if (response.type !== 'response' || !response.body) {
            return undefined;
        }
        const item = new JsDocCompletionItem(document, position);
        // Workaround for #43619
        // docCommentTemplate previously returned undefined for empty jsdoc templates.
        // TS 2.7 now returns a single line doc comment, which breaks indentation.
        if (response.body.newText === '/** */') {
            item.insertText = defaultJsDoc;
        }
        else {
            item.insertText = templateToSnippet(response.body.newText);
        }
        return [item];
    }
    isPotentiallyValidDocCompletionPosition(document, position) {
        // Only show the JSdoc completion when the everything before the cursor is whitespace
        // or could be the opening of a comment
        const line = document.lineAt(position.line).text;
        const prefix = line.slice(0, position.character);
        if (!/^\s*$|\/\*\*\s*$|^\s*\/\*\*+\s*$/.test(prefix)) {
            return false;
        }
        // And everything after is possibly a closing comment or more whitespace
        const suffix = line.slice(position.character);
        return /^\s*(\*+\/)?\s*$/.test(suffix);
    }
}
function templateToSnippet(template) {
    // TODO: use append placeholder
    let snippetIndex = 1;
    template = template.replace(/\$/g, '\\$');
    template = template.replace(/^[ \t]*(?=(\/|[ ]\*))/gm, '');
    template = template.replace(/^(\/\*\*\s*\*[ ]*)$/m, (x) => x + `\$0`);
    template = template.replace(/\* @param([ ]\{\S+\})?\s+(\S+)[ \t]*$/gm, (_param, type, post) => {
        let out = '* @param ';
        if (type === ' {any}' || type === ' {*}') {
            out += `{\$\{${snippetIndex++}:*\}} `;
        }
        else if (type) {
            out += type + ' ';
        }
        out += post + ` \${${snippetIndex++}}`;
        return out;
    });
    template = template.replace(/\* @returns[ \t]*$/gm, `* @returns \${${snippetIndex++}}`);
    return new vscode.SnippetString(template);
}
exports.templateToSnippet = templateToSnippet;
function register(selector, modeId, client, fileConfigurationManager) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireConfiguration)(modeId, 'suggest.completeJSDocs')
    ], () => {
        return vscode.languages.registerCompletionItemProvider(selector.syntax, new JsDocCompletionProvider(client, fileConfigurationManager), '*');
    });
}
exports.register = register;


/***/ }),
/* 65 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const nls = __webpack_require__(9);
const typescriptService_1 = __webpack_require__(32);
const api_1 = __webpack_require__(24);
const cancellation_1 = __webpack_require__(12);
const dependentRegistration_1 = __webpack_require__(35);
const typeConverters = __webpack_require__(37);
const localize = nls.loadMessageBundle();
class OrganizeImportsCommand {
    constructor(client, telemetryReporter) {
        this.client = client;
        this.telemetryReporter = telemetryReporter;
        this.id = OrganizeImportsCommand.Id;
    }
    async execute(file, sortOnly = false) {
        /* __GDPR__
            "organizeImports.execute" : {
                "${include}": [
                    "${TypeScriptCommonProperties}"
                ]
            }
        */
        this.telemetryReporter.logTelemetry('organizeImports.execute', {});
        const args = {
            scope: {
                type: 'file',
                args: {
                    file
                }
            },
            skipDestructiveCodeActions: sortOnly,
        };
        const response = await this.client.interruptGetErr(() => this.client.execute('organizeImports', args, cancellation_1.nulToken));
        if (response.type !== 'response' || !response.body) {
            return;
        }
        if (response.body.length) {
            const edits = typeConverters.WorkspaceEdit.fromFileCodeEdits(this.client, response.body);
            return vscode.workspace.applyEdit(edits);
        }
    }
}
OrganizeImportsCommand.Id = '_typescript.organizeImports';
class ImportsCodeActionProvider {
    constructor(client, kind, title, sortOnly, commandManager, fileConfigManager, telemetryReporter) {
        this.client = client;
        this.kind = kind;
        this.title = title;
        this.sortOnly = sortOnly;
        this.fileConfigManager = fileConfigManager;
        commandManager.register(new OrganizeImportsCommand(client, telemetryReporter));
    }
    static register(client, minVersion, kind, title, sortOnly, commandManager, fileConfigurationManager, telemetryReporter, selector) {
        return (0, dependentRegistration_1.conditionalRegistration)([
            (0, dependentRegistration_1.requireMinVersion)(client, minVersion),
            (0, dependentRegistration_1.requireSomeCapability)(client, typescriptService_1.ClientCapability.Semantic),
        ], () => {
            const provider = new ImportsCodeActionProvider(client, kind, title, sortOnly, commandManager, fileConfigurationManager, telemetryReporter);
            return vscode.languages.registerCodeActionsProvider(selector.semantic, provider, {
                providedCodeActionKinds: [kind]
            });
        });
    }
    provideCodeActions(document, _range, context, token) {
        const file = this.client.toOpenedFilePath(document);
        if (!file) {
            return [];
        }
        if (!context.only || !context.only.contains(this.kind)) {
            return [];
        }
        this.fileConfigManager.ensureConfigurationForDocument(document, token);
        const action = new vscode.CodeAction(this.title, this.kind);
        action.command = { title: '', command: OrganizeImportsCommand.Id, arguments: [file, this.sortOnly] };
        return [action];
    }
}
function register(selector, client, commandManager, fileConfigurationManager, telemetryReporter) {
    return vscode.Disposable.from(ImportsCodeActionProvider.register(client, api_1.default.v280, vscode.CodeActionKind.SourceOrganizeImports, localize('organizeImportsAction.title', "Organize Imports"), false, commandManager, fileConfigurationManager, telemetryReporter, selector), ImportsCodeActionProvider.register(client, api_1.default.v430, vscode.CodeActionKind.Source.append('sortImports'), localize('sortImportsAction.title', "Sort Imports"), true, commandManager, fileConfigurationManager, telemetryReporter, selector));
}
exports.register = register;


/***/ }),
/* 66 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const nls = __webpack_require__(9);
const typescriptService_1 = __webpack_require__(32);
const api_1 = __webpack_require__(24);
const cancellation_1 = __webpack_require__(12);
const codeAction_1 = __webpack_require__(47);
const dependentRegistration_1 = __webpack_require__(35);
const fixNames = __webpack_require__(58);
const memoize_1 = __webpack_require__(67);
const objects_1 = __webpack_require__(27);
const typeConverters = __webpack_require__(37);
const localize = nls.loadMessageBundle();
class ApplyCodeActionCommand {
    constructor(client, telemetryReporter) {
        this.client = client;
        this.telemetryReporter = telemetryReporter;
        this.id = ApplyCodeActionCommand.ID;
    }
    async execute(action) {
        /* __GDPR__
            "quickFix.execute" : {
                "fixName" : { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" },
                "${include}": [
                    "${TypeScriptCommonProperties}"
                ]
            }
        */
        this.telemetryReporter.logTelemetry('quickFix.execute', {
            fixName: action.fixName
        });
        return (0, codeAction_1.applyCodeActionCommands)(this.client, action.commands, cancellation_1.nulToken);
    }
}
ApplyCodeActionCommand.ID = '_typescript.applyCodeActionCommand';
class ApplyFixAllCodeAction {
    constructor(client, telemetryReporter) {
        this.client = client;
        this.telemetryReporter = telemetryReporter;
        this.id = ApplyFixAllCodeAction.ID;
    }
    async execute(args) {
        /* __GDPR__
            "quickFixAll.execute" : {
                "fixName" : { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" },
                "${include}": [
                    "${TypeScriptCommonProperties}"
                ]
            }
        */
        this.telemetryReporter.logTelemetry('quickFixAll.execute', {
            fixName: args.action.tsAction.fixName
        });
        if (args.action.combinedResponse) {
            await (0, codeAction_1.applyCodeActionCommands)(this.client, args.action.combinedResponse.body.commands, cancellation_1.nulToken);
        }
    }
}
ApplyFixAllCodeAction.ID = '_typescript.applyFixAllCodeAction';
/**
 * Unique set of diagnostics keyed on diagnostic range and error code.
 */
class DiagnosticsSet {
    constructor(_values) {
        this._values = _values;
    }
    static from(diagnostics) {
        const values = new Map();
        for (const diagnostic of diagnostics) {
            values.set(DiagnosticsSet.key(diagnostic), diagnostic);
        }
        return new DiagnosticsSet(values);
    }
    static key(diagnostic) {
        const { start, end } = diagnostic.range;
        return `${diagnostic.code}-${start.line},${start.character}-${end.line},${end.character}`;
    }
    get values() {
        return this._values.values();
    }
    get size() {
        return this._values.size;
    }
}
class VsCodeCodeAction extends vscode.CodeAction {
    constructor(tsAction, title, kind) {
        super(title, kind);
        this.tsAction = tsAction;
    }
}
class VsCodeFixAllCodeAction extends VsCodeCodeAction {
    constructor(tsAction, file, title, kind) {
        super(tsAction, title, kind);
        this.file = file;
    }
}
class CodeActionSet {
    constructor() {
        this._actions = new Set();
        this._fixAllActions = new Map();
    }
    get values() {
        return this._actions;
    }
    addAction(action) {
        for (const existing of this._actions) {
            if (action.tsAction.fixName === existing.tsAction.fixName && (0, objects_1.equals)(action.edit, existing.edit)) {
                this._actions.delete(existing);
            }
        }
        this._actions.add(action);
        if (action.tsAction.fixId) {
            // If we have an existing fix all action, then make sure it follows this action
            const existingFixAll = this._fixAllActions.get(action.tsAction.fixId);
            if (existingFixAll) {
                this._actions.delete(existingFixAll);
                this._actions.add(existingFixAll);
            }
        }
    }
    addFixAllAction(fixId, action) {
        const existing = this._fixAllActions.get(fixId);
        if (existing) {
            // reinsert action at back of actions list
            this._actions.delete(existing);
        }
        this.addAction(action);
        this._fixAllActions.set(fixId, action);
    }
    hasFixAllAction(fixId) {
        return this._fixAllActions.has(fixId);
    }
}
class SupportedCodeActionProvider {
    constructor(client) {
        this.client = client;
    }
    async getFixableDiagnosticsForContext(context) {
        const fixableCodes = await this.fixableDiagnosticCodes;
        return DiagnosticsSet.from(context.diagnostics.filter(diagnostic => typeof diagnostic.code !== 'undefined' && fixableCodes.has(diagnostic.code + '')));
    }
    get fixableDiagnosticCodes() {
        return this.client.execute('getSupportedCodeFixes', null, cancellation_1.nulToken)
            .then(response => response.type === 'response' ? response.body || [] : [])
            .then(codes => new Set(codes));
    }
}
__decorate([
    memoize_1.memoize
], SupportedCodeActionProvider.prototype, "fixableDiagnosticCodes", null);
class TypeScriptQuickFixProvider {
    constructor(client, formattingConfigurationManager, commandManager, diagnosticsManager, telemetryReporter) {
        this.client = client;
        this.formattingConfigurationManager = formattingConfigurationManager;
        this.diagnosticsManager = diagnosticsManager;
        commandManager.register(new ApplyCodeActionCommand(client, telemetryReporter));
        commandManager.register(new ApplyFixAllCodeAction(client, telemetryReporter));
        this.supportedCodeActionProvider = new SupportedCodeActionProvider(client);
    }
    async provideCodeActions(document, _range, context, token) {
        const file = this.client.toOpenedFilePath(document);
        if (!file) {
            return [];
        }
        const fixableDiagnostics = await this.supportedCodeActionProvider.getFixableDiagnosticsForContext(context);
        if (!fixableDiagnostics.size) {
            return [];
        }
        if (this.client.bufferSyncSupport.hasPendingDiagnostics(document.uri)) {
            return [];
        }
        await this.formattingConfigurationManager.ensureConfigurationForDocument(document, token);
        const results = new CodeActionSet();
        for (const diagnostic of fixableDiagnostics.values) {
            await this.getFixesForDiagnostic(document, file, diagnostic, results, token);
        }
        const allActions = Array.from(results.values);
        for (const action of allActions) {
            action.isPreferred = isPreferredFix(action, allActions);
        }
        return allActions;
    }
    async resolveCodeAction(codeAction, token) {
        if (!(codeAction instanceof VsCodeFixAllCodeAction) || !codeAction.tsAction.fixId) {
            return codeAction;
        }
        const arg = {
            scope: {
                type: 'file',
                args: { file: codeAction.file }
            },
            fixId: codeAction.tsAction.fixId,
        };
        const response = await this.client.execute('getCombinedCodeFix', arg, token);
        if (response.type === 'response') {
            codeAction.combinedResponse = response;
            codeAction.edit = typeConverters.WorkspaceEdit.fromFileCodeEdits(this.client, response.body.changes);
        }
        return codeAction;
    }
    async getFixesForDiagnostic(document, file, diagnostic, results, token) {
        const args = {
            ...typeConverters.Range.toFileRangeRequestArgs(file, diagnostic.range),
            errorCodes: [+(diagnostic.code)]
        };
        const response = await this.client.execute('getCodeFixes', args, token);
        if (response.type !== 'response' || !response.body) {
            return results;
        }
        for (const tsCodeFix of response.body) {
            this.addAllFixesForTsCodeAction(results, document, file, diagnostic, tsCodeFix);
        }
        return results;
    }
    addAllFixesForTsCodeAction(results, document, file, diagnostic, tsAction) {
        results.addAction(this.getSingleFixForTsCodeAction(diagnostic, tsAction));
        this.addFixAllForTsCodeAction(results, document, file, diagnostic, tsAction);
        return results;
    }
    getSingleFixForTsCodeAction(diagnostic, tsAction) {
        const codeAction = new VsCodeCodeAction(tsAction, tsAction.description, vscode.CodeActionKind.QuickFix);
        codeAction.edit = (0, codeAction_1.getEditForCodeAction)(this.client, tsAction);
        codeAction.diagnostics = [diagnostic];
        codeAction.command = {
            command: ApplyCodeActionCommand.ID,
            arguments: [tsAction],
            title: ''
        };
        return codeAction;
    }
    addFixAllForTsCodeAction(results, document, file, diagnostic, tsAction) {
        if (!tsAction.fixId || this.client.apiVersion.lt(api_1.default.v270) || results.hasFixAllAction(tsAction.fixId)) {
            return results;
        }
        // Make sure there are multiple diagnostics of the same type in the file
        if (!this.diagnosticsManager.getDiagnostics(document.uri).some(x => {
            if (x === diagnostic) {
                return false;
            }
            return x.code === diagnostic.code
                || (fixAllErrorCodes.has(x.code) && fixAllErrorCodes.get(x.code) === fixAllErrorCodes.get(diagnostic.code));
        })) {
            return results;
        }
        const action = new VsCodeFixAllCodeAction(tsAction, file, tsAction.fixAllDescription || localize('fixAllInFileLabel', '{0} (Fix all in file)', tsAction.description), vscode.CodeActionKind.QuickFix);
        action.diagnostics = [diagnostic];
        action.command = {
            command: ApplyFixAllCodeAction.ID,
            arguments: [{ action }],
            title: ''
        };
        results.addFixAllAction(tsAction.fixId, action);
        return results;
    }
}
TypeScriptQuickFixProvider.metadata = {
    providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
};
// Some fix all actions can actually fix multiple differnt diagnostics. Make sure we still show the fix all action
// in such cases
const fixAllErrorCodes = new Map([
    // Missing async
    [2339, 2339],
    [2345, 2339],
]);
const preferredFixes = new Map([
    [fixNames.annotateWithTypeFromJSDoc, { priority: 2 }],
    [fixNames.constructorForDerivedNeedSuperCall, { priority: 2 }],
    [fixNames.extendsInterfaceBecomesImplements, { priority: 2 }],
    [fixNames.awaitInSyncFunction, { priority: 2 }],
    [fixNames.classIncorrectlyImplementsInterface, { priority: 3 }],
    [fixNames.classDoesntImplementInheritedAbstractMember, { priority: 3 }],
    [fixNames.unreachableCode, { priority: 2 }],
    [fixNames.unusedIdentifier, { priority: 2 }],
    [fixNames.forgottenThisPropertyAccess, { priority: 2 }],
    [fixNames.spelling, { priority: 0 }],
    [fixNames.addMissingAwait, { priority: 2 }],
    [fixNames.addMissingOverride, { priority: 2 }],
    [fixNames.fixImport, { priority: 1, thereCanOnlyBeOne: true }],
]);
function isPreferredFix(action, allActions) {
    if (action instanceof VsCodeFixAllCodeAction) {
        return false;
    }
    const fixPriority = preferredFixes.get(action.tsAction.fixName);
    if (!fixPriority) {
        return false;
    }
    return allActions.every(otherAction => {
        if (otherAction === action) {
            return true;
        }
        if (otherAction instanceof VsCodeFixAllCodeAction) {
            return true;
        }
        const otherFixPriority = preferredFixes.get(otherAction.tsAction.fixName);
        if (!otherFixPriority || otherFixPriority.priority < fixPriority.priority) {
            return true;
        }
        else if (otherFixPriority.priority > fixPriority.priority) {
            return false;
        }
        if (fixPriority.thereCanOnlyBeOne && action.tsAction.fixName === otherAction.tsAction.fixName) {
            return false;
        }
        return true;
    });
}
function register(selector, client, fileConfigurationManager, commandManager, diagnosticsManager, telemetryReporter) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireSomeCapability)(client, typescriptService_1.ClientCapability.Semantic),
    ], () => {
        return vscode.languages.registerCodeActionsProvider(selector.semantic, new TypeScriptQuickFixProvider(client, fileConfigurationManager, commandManager, diagnosticsManager, telemetryReporter), TypeScriptQuickFixProvider.metadata);
    });
}
exports.register = register;


/***/ }),
/* 67 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.memoize = void 0;
function memoize(_target, key, descriptor) {
    let fnKey;
    let fn;
    if (typeof descriptor.value === 'function') {
        fnKey = 'value';
        fn = descriptor.value;
    }
    else if (typeof descriptor.get === 'function') {
        fnKey = 'get';
        fn = descriptor.get;
    }
    else {
        throw new Error('not supported');
    }
    const memoizeKey = `$memoize$${key}`;
    descriptor[fnKey] = function (...args) {
        if (!this.hasOwnProperty(memoizeKey)) {
            Object.defineProperty(this, memoizeKey, {
                configurable: false,
                enumerable: false,
                writable: false,
                value: fn.apply(this, args)
            });
        }
        return this[memoizeKey];
    };
}
exports.memoize = memoize;


/***/ }),
/* 68 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const nls = __webpack_require__(9);
const learnMoreAboutRefactorings_1 = __webpack_require__(13);
const typescriptService_1 = __webpack_require__(32);
const api_1 = __webpack_require__(24);
const cancellation_1 = __webpack_require__(12);
const dependentRegistration_1 = __webpack_require__(35);
const fileSchemes = __webpack_require__(26);
const typeConverters = __webpack_require__(37);
const localize = nls.loadMessageBundle();
class DidApplyRefactoringCommand {
    constructor(telemetryReporter) {
        this.telemetryReporter = telemetryReporter;
        this.id = DidApplyRefactoringCommand.ID;
    }
    async execute(args) {
        /* __GDPR__
            "refactor.execute" : {
                "action" : { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" },
                "${include}": [
                    "${TypeScriptCommonProperties}"
                ]
            }
        */
        this.telemetryReporter.logTelemetry('refactor.execute', {
            action: args.codeAction.action,
        });
        if (!args.codeAction.edit?.size) {
            vscode.window.showErrorMessage(localize('refactoringFailed', "Could not apply refactoring"));
            return;
        }
        const renameLocation = args.codeAction.renameLocation;
        if (renameLocation) {
            // Disable renames in interactive playground https://github.com/microsoft/vscode/issues/75137
            if (args.codeAction.document.uri.scheme !== fileSchemes.walkThroughSnippet) {
                await vscode.commands.executeCommand('editor.action.rename', [
                    args.codeAction.document.uri,
                    typeConverters.Position.fromLocation(renameLocation)
                ]);
            }
        }
    }
}
DidApplyRefactoringCommand.ID = '_typescript.didApplyRefactoring';
class SelectRefactorCommand {
    constructor(client, didApplyCommand) {
        this.client = client;
        this.didApplyCommand = didApplyCommand;
        this.id = SelectRefactorCommand.ID;
    }
    async execute(args) {
        const file = this.client.toOpenedFilePath(args.document);
        if (!file) {
            return;
        }
        const selected = await vscode.window.showQuickPick(args.info.actions.map((action) => ({
            label: action.name,
            description: action.description,
        })));
        if (!selected) {
            return;
        }
        const tsAction = new InlinedCodeAction(this.client, args.action.title, args.action.kind, args.document, args.info.name, selected.label, args.rangeOrSelection);
        await tsAction.resolve(cancellation_1.nulToken);
        if (tsAction.edit) {
            if (!(await vscode.workspace.applyEdit(tsAction.edit))) {
                vscode.window.showErrorMessage(localize('refactoringFailed', "Could not apply refactoring"));
                return;
            }
        }
        await this.didApplyCommand.execute({ codeAction: tsAction });
    }
}
SelectRefactorCommand.ID = '_typescript.selectRefactoring';
const Extract_Function = Object.freeze({
    kind: vscode.CodeActionKind.RefactorExtract.append('function'),
    matches: refactor => refactor.name.startsWith('function_')
});
const Extract_Constant = Object.freeze({
    kind: vscode.CodeActionKind.RefactorExtract.append('constant'),
    matches: refactor => refactor.name.startsWith('constant_')
});
const Extract_Type = Object.freeze({
    kind: vscode.CodeActionKind.RefactorExtract.append('type'),
    matches: refactor => refactor.name.startsWith('Extract to type alias')
});
const Extract_Interface = Object.freeze({
    kind: vscode.CodeActionKind.RefactorExtract.append('interface'),
    matches: refactor => refactor.name.startsWith('Extract to interface')
});
const Move_NewFile = Object.freeze({
    kind: vscode.CodeActionKind.Refactor.append('move').append('newFile'),
    matches: refactor => refactor.name.startsWith('Move to a new file')
});
const Rewrite_Import = Object.freeze({
    kind: vscode.CodeActionKind.RefactorRewrite.append('import'),
    matches: refactor => refactor.name.startsWith('Convert namespace import') || refactor.name.startsWith('Convert named imports')
});
const Rewrite_Export = Object.freeze({
    kind: vscode.CodeActionKind.RefactorRewrite.append('export'),
    matches: refactor => refactor.name.startsWith('Convert default export') || refactor.name.startsWith('Convert named export')
});
const Rewrite_Arrow_Braces = Object.freeze({
    kind: vscode.CodeActionKind.RefactorRewrite.append('arrow').append('braces'),
    matches: refactor => refactor.name.startsWith('Convert default export') || refactor.name.startsWith('Convert named export')
});
const Rewrite_Parameters_ToDestructured = Object.freeze({
    kind: vscode.CodeActionKind.RefactorRewrite.append('parameters').append('toDestructured'),
    matches: refactor => refactor.name.startsWith('Convert parameters to destructured object')
});
const Rewrite_Property_GenerateAccessors = Object.freeze({
    kind: vscode.CodeActionKind.RefactorRewrite.append('property').append('generateAccessors'),
    matches: refactor => refactor.name.startsWith('Generate \'get\' and \'set\' accessors')
});
const allKnownCodeActionKinds = [
    Extract_Function,
    Extract_Constant,
    Extract_Type,
    Extract_Interface,
    Move_NewFile,
    Rewrite_Import,
    Rewrite_Export,
    Rewrite_Arrow_Braces,
    Rewrite_Parameters_ToDestructured,
    Rewrite_Property_GenerateAccessors
];
class InlinedCodeAction extends vscode.CodeAction {
    constructor(client, title, kind, document, refactor, action, range) {
        super(title, kind);
        this.client = client;
        this.document = document;
        this.refactor = refactor;
        this.action = action;
        this.range = range;
    }
    async resolve(token) {
        const file = this.client.toOpenedFilePath(this.document);
        if (!file) {
            return;
        }
        const args = {
            ...typeConverters.Range.toFileRangeRequestArgs(file, this.range),
            refactor: this.refactor,
            action: this.action,
        };
        const response = await this.client.execute('getEditsForRefactor', args, token);
        if (response.type !== 'response' || !response.body) {
            return;
        }
        // Resolve
        this.edit = InlinedCodeAction.getWorkspaceEditForRefactoring(this.client, response.body);
        this.renameLocation = response.body.renameLocation;
        return;
    }
    static getWorkspaceEditForRefactoring(client, body) {
        const workspaceEdit = new vscode.WorkspaceEdit();
        for (const edit of body.edits) {
            const resource = client.toResource(edit.fileName);
            if (resource.scheme === fileSchemes.file) {
                workspaceEdit.createFile(resource, { ignoreIfExists: true });
            }
        }
        typeConverters.WorkspaceEdit.withFileCodeEdits(workspaceEdit, client, body.edits);
        return workspaceEdit;
    }
}
class SelectCodeAction extends vscode.CodeAction {
    constructor(info, document, rangeOrSelection) {
        super(info.description, vscode.CodeActionKind.Refactor);
        this.command = {
            title: info.description,
            command: SelectRefactorCommand.ID,
            arguments: [{ action: this, document, info, rangeOrSelection }]
        };
    }
}
class TypeScriptRefactorProvider {
    constructor(client, formattingOptionsManager, commandManager, telemetryReporter) {
        this.client = client;
        this.formattingOptionsManager = formattingOptionsManager;
        const didApplyRefactoringCommand = commandManager.register(new DidApplyRefactoringCommand(telemetryReporter));
        commandManager.register(new SelectRefactorCommand(this.client, didApplyRefactoringCommand));
    }
    async provideCodeActions(document, rangeOrSelection, context, token) {
        if (!this.shouldTrigger(context, rangeOrSelection)) {
            return undefined;
        }
        if (!this.client.toOpenedFilePath(document)) {
            return undefined;
        }
        const response = await this.client.interruptGetErr(() => {
            const file = this.client.toOpenedFilePath(document);
            if (!file) {
                return undefined;
            }
            this.formattingOptionsManager.ensureConfigurationForDocument(document, token);
            const args = {
                ...typeConverters.Range.toFileRangeRequestArgs(file, rangeOrSelection),
                triggerReason: this.toTsTriggerReason(context),
                kind: context.only?.value
            };
            return this.client.execute('getApplicableRefactors', args, token);
        });
        if (response?.type !== 'response' || !response.body) {
            return undefined;
        }
        const actions = this.convertApplicableRefactors(response.body, document, rangeOrSelection).filter(action => {
            if (this.client.apiVersion.lt(api_1.default.v430)) {
                // Don't show 'infer return type' refactoring unless it has been explicitly requested
                // https://github.com/microsoft/TypeScript/issues/42993
                if (!context.only && action.kind?.value === 'refactor.rewrite.function.returnType') {
                    return false;
                }
            }
            return true;
        });
        if (!context.only) {
            return actions;
        }
        return this.pruneInvalidActions(this.appendInvalidActions(actions), context.only, /* numberOfInvalid = */ 5);
    }
    async resolveCodeAction(codeAction, token) {
        if (codeAction instanceof InlinedCodeAction) {
            await codeAction.resolve(token);
        }
        return codeAction;
    }
    toTsTriggerReason(context) {
        if (context.triggerKind === vscode.CodeActionTriggerKind.Invoke) {
            return 'invoked';
        }
        return undefined;
    }
    convertApplicableRefactors(body, document, rangeOrSelection) {
        const actions = [];
        for (const info of body) {
            if (info.inlineable === false) {
                const codeAction = new SelectCodeAction(info, document, rangeOrSelection);
                actions.push(codeAction);
            }
            else {
                for (const action of info.actions) {
                    actions.push(this.refactorActionToCodeAction(action, document, info, rangeOrSelection, info.actions));
                }
            }
        }
        return actions;
    }
    refactorActionToCodeAction(action, document, info, rangeOrSelection, allActions) {
        const codeAction = new InlinedCodeAction(this.client, action.description, TypeScriptRefactorProvider.getKind(action), document, info.name, action.name, rangeOrSelection);
        // https://github.com/microsoft/TypeScript/pull/37871
        if (action.notApplicableReason) {
            codeAction.disabled = { reason: action.notApplicableReason };
        }
        else {
            codeAction.command = {
                title: action.description,
                command: DidApplyRefactoringCommand.ID,
                arguments: [{ codeAction }],
            };
        }
        codeAction.isPreferred = TypeScriptRefactorProvider.isPreferred(action, allActions);
        return codeAction;
    }
    shouldTrigger(context, rangeOrSelection) {
        if (context.only && !vscode.CodeActionKind.Refactor.contains(context.only)) {
            return false;
        }
        if (context.triggerKind === vscode.CodeActionTriggerKind.Invoke) {
            return true;
        }
        return rangeOrSelection instanceof vscode.Selection;
    }
    static getKind(refactor) {
        if (refactor.kind) {
            return vscode.CodeActionKind.Empty.append(refactor.kind);
        }
        const match = allKnownCodeActionKinds.find(kind => kind.matches(refactor));
        return match ? match.kind : vscode.CodeActionKind.Refactor;
    }
    static isPreferred(action, allActions) {
        if (Extract_Constant.matches(action)) {
            // Only mark the action with the lowest scope as preferred
            const getScope = (name) => {
                const scope = name.match(/scope_(\d)/)?.[1];
                return scope ? +scope : undefined;
            };
            const scope = getScope(action.name);
            if (typeof scope !== 'number') {
                return false;
            }
            return allActions
                .filter(otherAtion => otherAtion !== action && Extract_Constant.matches(otherAtion))
                .every(otherAction => {
                const otherScope = getScope(otherAction.name);
                return typeof otherScope === 'number' ? scope < otherScope : true;
            });
        }
        if (Extract_Type.matches(action) || Extract_Interface.matches(action)) {
            return true;
        }
        return false;
    }
    appendInvalidActions(actions) {
        if (this.client.apiVersion.gte(api_1.default.v400)) {
            // Invalid actions come from TS server instead
            return actions;
        }
        if (!actions.some(action => action.kind && Extract_Constant.kind.contains(action.kind))) {
            const disabledAction = new vscode.CodeAction(localize('extractConstant.disabled.title', "Extract to constant"), Extract_Constant.kind);
            disabledAction.disabled = {
                reason: localize('extractConstant.disabled.reason', "The current selection cannot be extracted"),
            };
            disabledAction.isPreferred = true;
            actions.push(disabledAction);
        }
        if (!actions.some(action => action.kind && Extract_Function.kind.contains(action.kind))) {
            const disabledAction = new vscode.CodeAction(localize('extractFunction.disabled.title', "Extract to function"), Extract_Function.kind);
            disabledAction.disabled = {
                reason: localize('extractFunction.disabled.reason', "The current selection cannot be extracted"),
            };
            actions.push(disabledAction);
        }
        return actions;
    }
    pruneInvalidActions(actions, only, numberOfInvalid) {
        if (this.client.apiVersion.lt(api_1.default.v400)) {
            // Older TS version don't return extra actions
            return actions;
        }
        const availableActions = [];
        const invalidCommonActions = [];
        const invalidUncommonActions = [];
        for (const action of actions) {
            if (!action.disabled) {
                availableActions.push(action);
                continue;
            }
            // These are the common refactors that we should always show if applicable.
            if (action.kind && (Extract_Constant.kind.contains(action.kind) || Extract_Function.kind.contains(action.kind))) {
                invalidCommonActions.push(action);
                continue;
            }
            // These are the remaining refactors that we can show if we haven't reached the max limit with just common refactors.
            invalidUncommonActions.push(action);
        }
        const prioritizedActions = [];
        prioritizedActions.push(...invalidCommonActions);
        prioritizedActions.push(...invalidUncommonActions);
        const topNInvalid = prioritizedActions.filter(action => !only || (action.kind && only.contains(action.kind))).slice(0, numberOfInvalid);
        availableActions.push(...topNInvalid);
        return availableActions;
    }
}
TypeScriptRefactorProvider.minVersion = api_1.default.v240;
TypeScriptRefactorProvider.metadata = {
    providedCodeActionKinds: [
        vscode.CodeActionKind.Refactor,
        ...allKnownCodeActionKinds.map(x => x.kind),
    ],
    documentation: [
        {
            kind: vscode.CodeActionKind.Refactor,
            command: {
                command: learnMoreAboutRefactorings_1.LearnMoreAboutRefactoringsCommand.id,
                title: localize('refactor.documentation.title', "Learn more about JS/TS refactorings")
            }
        }
    ]
};
function register(selector, client, formattingOptionsManager, commandManager, telemetryReporter) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireMinVersion)(client, TypeScriptRefactorProvider.minVersion),
        (0, dependentRegistration_1.requireSomeCapability)(client, typescriptService_1.ClientCapability.Semantic),
    ], () => {
        return vscode.languages.registerCodeActionsProvider(selector.semantic, new TypeScriptRefactorProvider(client, formattingOptionsManager, commandManager, telemetryReporter), TypeScriptRefactorProvider.metadata);
    });
}
exports.register = register;


/***/ }),
/* 69 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const typescriptService_1 = __webpack_require__(32);
const dependentRegistration_1 = __webpack_require__(35);
const typeConverters = __webpack_require__(37);
class TypeScriptReferenceSupport {
    constructor(client) {
        this.client = client;
    }
    async provideReferences(document, position, options, token) {
        const filepath = this.client.toOpenedFilePath(document);
        if (!filepath) {
            return [];
        }
        const args = typeConverters.Position.toFileLocationRequestArgs(filepath, position);
        const response = await this.client.execute('references', args, token);
        if (response.type !== 'response' || !response.body) {
            return [];
        }
        const result = [];
        for (const ref of response.body.refs) {
            if (!options.includeDeclaration && ref.isDefinition) {
                continue;
            }
            const url = this.client.toResource(ref.file);
            const location = typeConverters.Location.fromTextSpan(url, ref);
            result.push(location);
        }
        return result;
    }
}
function register(selector, client) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireSomeCapability)(client, typescriptService_1.ClientCapability.EnhancedSyntax, typescriptService_1.ClientCapability.Semantic),
    ], () => {
        return vscode.languages.registerReferenceProvider(selector.syntax, new TypeScriptReferenceSupport(client));
    });
}
exports.register = register;


/***/ }),
/* 70 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const path = __webpack_require__(8);
const vscode = __webpack_require__(1);
const nls = __webpack_require__(9);
const typescriptService_1 = __webpack_require__(32);
const api_1 = __webpack_require__(24);
const dependentRegistration_1 = __webpack_require__(35);
const typeConverters = __webpack_require__(37);
const localize = nls.loadMessageBundle();
class TypeScriptRenameProvider {
    constructor(client, fileConfigurationManager) {
        this.client = client;
        this.fileConfigurationManager = fileConfigurationManager;
    }
    async prepareRename(document, position, token) {
        if (this.client.apiVersion.lt(api_1.default.v310)) {
            return null;
        }
        const response = await this.execRename(document, position, token);
        if (response?.type !== 'response' || !response.body) {
            return null;
        }
        const renameInfo = response.body.info;
        if (!renameInfo.canRename) {
            return Promise.reject(renameInfo.localizedErrorMessage);
        }
        return typeConverters.Range.fromTextSpan(renameInfo.triggerSpan);
    }
    async provideRenameEdits(document, position, newName, token) {
        const response = await this.execRename(document, position, token);
        if (!response || response.type !== 'response' || !response.body) {
            return null;
        }
        const renameInfo = response.body.info;
        if (!renameInfo.canRename) {
            return Promise.reject(renameInfo.localizedErrorMessage);
        }
        if (renameInfo.fileToRename) {
            const edits = await this.renameFile(renameInfo.fileToRename, newName, token);
            if (edits) {
                return edits;
            }
            else {
                return Promise.reject(localize('fileRenameFail', "An error occurred while renaming file"));
            }
        }
        return this.updateLocs(response.body.locs, newName);
    }
    async execRename(document, position, token) {
        const file = this.client.toOpenedFilePath(document);
        if (!file) {
            return undefined;
        }
        const args = {
            ...typeConverters.Position.toFileLocationRequestArgs(file, position),
            findInStrings: false,
            findInComments: false
        };
        return this.client.interruptGetErr(() => {
            this.fileConfigurationManager.ensureConfigurationForDocument(document, token);
            return this.client.execute('rename', args, token);
        });
    }
    updateLocs(locations, newName) {
        const edit = new vscode.WorkspaceEdit();
        for (const spanGroup of locations) {
            const resource = this.client.toResource(spanGroup.file);
            for (const textSpan of spanGroup.locs) {
                edit.replace(resource, typeConverters.Range.fromTextSpan(textSpan), (textSpan.prefixText || '') + newName + (textSpan.suffixText || ''));
            }
        }
        return edit;
    }
    async renameFile(fileToRename, newName, token) {
        // Make sure we preserve file extension if none provided
        if (!path.extname(newName)) {
            newName += path.extname(fileToRename);
        }
        const dirname = path.dirname(fileToRename);
        const newFilePath = path.join(dirname, newName);
        const args = {
            file: fileToRename,
            oldFilePath: fileToRename,
            newFilePath: newFilePath,
        };
        const response = await this.client.execute('getEditsForFileRename', args, token);
        if (response.type !== 'response' || !response.body) {
            return undefined;
        }
        const edits = typeConverters.WorkspaceEdit.fromFileCodeEdits(this.client, response.body);
        edits.renameFile(vscode.Uri.file(fileToRename), vscode.Uri.file(newFilePath));
        return edits;
    }
}
function register(selector, client, fileConfigurationManager) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireSomeCapability)(client, typescriptService_1.ClientCapability.Semantic),
    ], () => {
        return vscode.languages.registerRenameProvider(selector.semantic, new TypeScriptRenameProvider(client, fileConfigurationManager));
    });
}
exports.register = register;


/***/ }),
/* 71 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
// all constants are const
const vscode = __webpack_require__(1);
const typescriptService_1 = __webpack_require__(32);
const api_1 = __webpack_require__(24);
const dependentRegistration_1 = __webpack_require__(35);
const minTypeScriptVersion = api_1.default.fromVersionString(`${3 /* major */}.${7 /* minor */}`);
// as we don't do deltas, for performance reasons, don't compute semantic tokens for documents above that limit
const CONTENT_LENGTH_LIMIT = 100000;
function register(selector, client) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireMinVersion)(client, minTypeScriptVersion),
        (0, dependentRegistration_1.requireSomeCapability)(client, typescriptService_1.ClientCapability.Semantic),
    ], () => {
        const provider = new DocumentSemanticTokensProvider(client);
        return vscode.Disposable.from(
        // register only as a range provider
        vscode.languages.registerDocumentRangeSemanticTokensProvider(selector.semantic, provider, provider.getLegend()));
    });
}
exports.register = register;
/**
 * Prototype of a DocumentSemanticTokensProvider, relying on the experimental `encodedSemanticClassifications-full` request from the TypeScript server.
 * As the results retured by the TypeScript server are limited, we also add a Typescript plugin (typescript-vscode-sh-plugin) to enrich the returned token.
 * See https://github.com/aeschli/typescript-vscode-sh-plugin.
 */
class DocumentSemanticTokensProvider {
    constructor(client) {
        this.client = client;
    }
    getLegend() {
        return new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);
    }
    async provideDocumentSemanticTokens(document, token) {
        const file = this.client.toOpenedFilePath(document);
        if (!file || document.getText().length > CONTENT_LENGTH_LIMIT) {
            return null;
        }
        return this._provideSemanticTokens(document, { file, start: 0, length: document.getText().length }, token);
    }
    async provideDocumentRangeSemanticTokens(document, range, token) {
        const file = this.client.toOpenedFilePath(document);
        if (!file || (document.offsetAt(range.end) - document.offsetAt(range.start) > CONTENT_LENGTH_LIMIT)) {
            return null;
        }
        const start = document.offsetAt(range.start);
        const length = document.offsetAt(range.end) - start;
        return this._provideSemanticTokens(document, { file, start, length }, token);
    }
    async _provideSemanticTokens(document, requestArg, token) {
        const file = this.client.toOpenedFilePath(document);
        if (!file) {
            return null;
        }
        const versionBeforeRequest = document.version;
        requestArg.format = '2020';
        const response = await this.client.execute('encodedSemanticClassifications-full', requestArg, token, {
            cancelOnResourceChange: document.uri
        });
        if (response.type !== 'response' || !response.body) {
            return null;
        }
        const versionAfterRequest = document.version;
        if (versionBeforeRequest !== versionAfterRequest) {
            // cannot convert result's offsets to (line;col) values correctly
            // a new request will come in soon...
            //
            // here we cannot return null, because returning null would remove all semantic tokens.
            // we must throw to indicate that the semantic tokens should not be removed.
            // using the string busy here because it is not logged to error telemetry if the error text contains busy.
            // as the new request will come in right after our response, we first wait for the document activity to stop
            await waitForDocumentChangesToEnd(document);
            throw new vscode.CancellationError();
        }
        const tokenSpan = response.body.spans;
        const builder = new vscode.SemanticTokensBuilder();
        let i = 0;
        while (i < tokenSpan.length) {
            const offset = tokenSpan[i++];
            const length = tokenSpan[i++];
            const tsClassification = tokenSpan[i++];
            let tokenModifiers = 0;
            let tokenType = getTokenTypeFromClassification(tsClassification);
            if (tokenType !== undefined) {
                // it's a classification as returned by the typescript-vscode-sh-plugin
                tokenModifiers = getTokenModifierFromClassification(tsClassification);
            }
            else {
                // typescript-vscode-sh-plugin is not present
                tokenType = tokenTypeMap[tsClassification];
                if (tokenType === undefined) {
                    continue;
                }
            }
            // we can use the document's range conversion methods because the result is at the same version as the document
            const startPos = document.positionAt(offset);
            const endPos = document.positionAt(offset + length);
            for (let line = startPos.line; line <= endPos.line; line++) {
                const startCharacter = (line === startPos.line ? startPos.character : 0);
                const endCharacter = (line === endPos.line ? endPos.character : document.lineAt(line).text.length);
                builder.push(line, startCharacter, endCharacter - startCharacter, tokenType, tokenModifiers);
            }
        }
        return builder.build();
    }
}
function waitForDocumentChangesToEnd(document) {
    let version = document.version;
    return new Promise((s) => {
        const iv = setInterval(_ => {
            if (document.version === version) {
                clearInterval(iv);
                s();
            }
            version = document.version;
        }, 400);
    });
}
function getTokenTypeFromClassification(tsClassification) {
    if (tsClassification > 255 /* modifierMask */) {
        return (tsClassification >> 8 /* typeOffset */) - 1;
    }
    return undefined;
}
function getTokenModifierFromClassification(tsClassification) {
    return tsClassification & 255 /* modifierMask */;
}
const tokenTypes = [];
tokenTypes[0 /* class */] = 'class';
tokenTypes[1 /* enum */] = 'enum';
tokenTypes[2 /* interface */] = 'interface';
tokenTypes[3 /* namespace */] = 'namespace';
tokenTypes[4 /* typeParameter */] = 'typeParameter';
tokenTypes[5 /* type */] = 'type';
tokenTypes[6 /* parameter */] = 'parameter';
tokenTypes[7 /* variable */] = 'variable';
tokenTypes[8 /* enumMember */] = 'enumMember';
tokenTypes[9 /* property */] = 'property';
tokenTypes[10 /* function */] = 'function';
tokenTypes[11 /* method */] = 'method';
const tokenModifiers = [];
tokenModifiers[2 /* async */] = 'async';
tokenModifiers[0 /* declaration */] = 'declaration';
tokenModifiers[3 /* readonly */] = 'readonly';
tokenModifiers[1 /* static */] = 'static';
tokenModifiers[5 /* local */] = 'local';
tokenModifiers[4 /* defaultLibrary */] = 'defaultLibrary';
// mapping for the original ExperimentalProtocol.ClassificationType from TypeScript (only used when plugin is not available)
const tokenTypeMap = [];
tokenTypeMap[11 /* className */] = 0 /* class */;
tokenTypeMap[12 /* enumName */] = 1 /* enum */;
tokenTypeMap[13 /* interfaceName */] = 2 /* interface */;
tokenTypeMap[14 /* moduleName */] = 3 /* namespace */;
tokenTypeMap[15 /* typeParameterName */] = 4 /* typeParameter */;
tokenTypeMap[16 /* typeAliasName */] = 5 /* type */;
tokenTypeMap[17 /* parameterName */] = 6 /* parameter */;


/***/ }),
/* 72 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const typescriptService_1 = __webpack_require__(32);
const dependentRegistration_1 = __webpack_require__(35);
const Previewer = __webpack_require__(48);
const typeConverters = __webpack_require__(37);
class TypeScriptSignatureHelpProvider {
    constructor(client) {
        this.client = client;
    }
    async provideSignatureHelp(document, position, token, context) {
        const filepath = this.client.toOpenedFilePath(document);
        if (!filepath) {
            return undefined;
        }
        const args = {
            ...typeConverters.Position.toFileLocationRequestArgs(filepath, position),
            triggerReason: toTsTriggerReason(context)
        };
        const response = await this.client.interruptGetErr(() => this.client.execute('signatureHelp', args, token));
        if (response.type !== 'response' || !response.body) {
            return undefined;
        }
        const info = response.body;
        const result = new vscode.SignatureHelp();
        result.signatures = info.items.map(signature => this.convertSignature(signature));
        result.activeSignature = this.getActiveSignature(context, info, result.signatures);
        result.activeParameter = this.getActiveParameter(info);
        return result;
    }
    getActiveSignature(context, info, signatures) {
        // Try matching the previous active signature's label to keep it selected
        const previouslyActiveSignature = context.activeSignatureHelp?.signatures[context.activeSignatureHelp.activeSignature];
        if (previouslyActiveSignature && context.isRetrigger) {
            const existingIndex = signatures.findIndex(other => other.label === previouslyActiveSignature?.label);
            if (existingIndex >= 0) {
                return existingIndex;
            }
        }
        return info.selectedItemIndex;
    }
    getActiveParameter(info) {
        const activeSignature = info.items[info.selectedItemIndex];
        if (activeSignature && activeSignature.isVariadic) {
            return Math.min(info.argumentIndex, activeSignature.parameters.length - 1);
        }
        return info.argumentIndex;
    }
    convertSignature(item) {
        const signature = new vscode.SignatureInformation(Previewer.plainWithLinks(item.prefixDisplayParts, this.client), Previewer.markdownDocumentation(item.documentation, item.tags.filter(x => x.name !== 'param'), this.client));
        let textIndex = signature.label.length;
        const separatorLabel = Previewer.plainWithLinks(item.separatorDisplayParts, this.client);
        for (let i = 0; i < item.parameters.length; ++i) {
            const parameter = item.parameters[i];
            const label = Previewer.plainWithLinks(parameter.displayParts, this.client);
            signature.parameters.push(new vscode.ParameterInformation([textIndex, textIndex + label.length], Previewer.markdownDocumentation(parameter.documentation, [], this.client)));
            textIndex += label.length;
            signature.label += label;
            if (i !== item.parameters.length - 1) {
                signature.label += separatorLabel;
                textIndex += separatorLabel.length;
            }
        }
        signature.label += Previewer.plainWithLinks(item.suffixDisplayParts, this.client);
        return signature;
    }
}
TypeScriptSignatureHelpProvider.triggerCharacters = ['(', ',', '<'];
TypeScriptSignatureHelpProvider.retriggerCharacters = [')'];
function toTsTriggerReason(context) {
    switch (context.triggerKind) {
        case vscode.SignatureHelpTriggerKind.TriggerCharacter:
            if (context.triggerCharacter) {
                if (context.isRetrigger) {
                    return { kind: 'retrigger', triggerCharacter: context.triggerCharacter };
                }
                else {
                    return { kind: 'characterTyped', triggerCharacter: context.triggerCharacter };
                }
            }
            else {
                return { kind: 'invoked' };
            }
        case vscode.SignatureHelpTriggerKind.ContentChange:
            return context.isRetrigger ? { kind: 'retrigger' } : { kind: 'invoked' };
        case vscode.SignatureHelpTriggerKind.Invoke:
        default:
            return { kind: 'invoked' };
    }
}
function register(selector, client) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireSomeCapability)(client, typescriptService_1.ClientCapability.EnhancedSyntax, typescriptService_1.ClientCapability.Semantic),
    ], () => {
        return vscode.languages.registerSignatureHelpProvider(selector.syntax, new TypeScriptSignatureHelpProvider(client), {
            triggerCharacters: TypeScriptSignatureHelpProvider.triggerCharacters,
            retriggerCharacters: TypeScriptSignatureHelpProvider.retriggerCharacters
        });
    });
}
exports.register = register;


/***/ }),
/* 73 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const api_1 = __webpack_require__(24);
const dependentRegistration_1 = __webpack_require__(35);
const typeConverters = __webpack_require__(37);
class SmartSelection {
    constructor(client) {
        this.client = client;
    }
    async provideSelectionRanges(document, positions, token) {
        const file = this.client.toOpenedFilePath(document);
        if (!file) {
            return undefined;
        }
        const args = {
            file,
            locations: positions.map(typeConverters.Position.toLocation)
        };
        const response = await this.client.execute('selectionRange', args, token);
        if (response.type !== 'response' || !response.body) {
            return undefined;
        }
        return response.body.map(SmartSelection.convertSelectionRange);
    }
    static convertSelectionRange(selectionRange) {
        return new vscode.SelectionRange(typeConverters.Range.fromTextSpan(selectionRange.textSpan), selectionRange.parent ? SmartSelection.convertSelectionRange(selectionRange.parent) : undefined);
    }
}
SmartSelection.minVersion = api_1.default.v350;
function register(selector, client) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireMinVersion)(client, SmartSelection.minVersion),
    ], () => {
        return vscode.languages.registerSelectionRangeProvider(selector.syntax, new SmartSelection(client));
    });
}
exports.register = register;


/***/ }),
/* 74 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const api_1 = __webpack_require__(24);
const dependentRegistration_1 = __webpack_require__(35);
const dispose_1 = __webpack_require__(20);
const typeConverters = __webpack_require__(37);
class TagClosing extends dispose_1.Disposable {
    constructor(client) {
        super();
        this.client = client;
        this._disposed = false;
        this._timeout = undefined;
        this._cancel = undefined;
        vscode.workspace.onDidChangeTextDocument(event => this.onDidChangeTextDocument(event), null, this._disposables);
    }
    dispose() {
        super.dispose();
        this._disposed = true;
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = undefined;
        }
        if (this._cancel) {
            this._cancel.cancel();
            this._cancel.dispose();
            this._cancel = undefined;
        }
    }
    onDidChangeTextDocument({ document, contentChanges, reason }) {
        if (contentChanges.length === 0 || reason === vscode.TextDocumentChangeReason.Undo || reason === vscode.TextDocumentChangeReason.Redo) {
            return;
        }
        const activeDocument = vscode.window.activeTextEditor && vscode.window.activeTextEditor.document;
        if (document !== activeDocument) {
            return;
        }
        const filepath = this.client.toOpenedFilePath(document);
        if (!filepath) {
            return;
        }
        if (typeof this._timeout !== 'undefined') {
            clearTimeout(this._timeout);
        }
        if (this._cancel) {
            this._cancel.cancel();
            this._cancel.dispose();
            this._cancel = undefined;
        }
        const lastChange = contentChanges[contentChanges.length - 1];
        const lastCharacter = lastChange.text[lastChange.text.length - 1];
        if (lastChange.rangeLength > 0 || lastCharacter !== '>' && lastCharacter !== '/') {
            return;
        }
        const priorCharacter = lastChange.range.start.character > 0
            ? document.getText(new vscode.Range(lastChange.range.start.translate({ characterDelta: -1 }), lastChange.range.start))
            : '';
        if (priorCharacter === '>') {
            return;
        }
        const version = document.version;
        this._timeout = setTimeout(async () => {
            this._timeout = undefined;
            if (this._disposed) {
                return;
            }
            const addedLines = lastChange.text.split(/\r\n|\n/g);
            const position = addedLines.length <= 1
                ? lastChange.range.start.translate({ characterDelta: lastChange.text.length })
                : new vscode.Position(lastChange.range.start.line + addedLines.length - 1, addedLines[addedLines.length - 1].length);
            const args = typeConverters.Position.toFileLocationRequestArgs(filepath, position);
            this._cancel = new vscode.CancellationTokenSource();
            const response = await this.client.execute('jsxClosingTag', args, this._cancel.token);
            if (response.type !== 'response' || !response.body) {
                return;
            }
            if (this._disposed) {
                return;
            }
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                return;
            }
            const insertion = response.body;
            const activeDocument = activeEditor.document;
            if (document === activeDocument && activeDocument.version === version) {
                activeEditor.insertSnippet(this.getTagSnippet(insertion), this.getInsertionPositions(activeEditor, position));
            }
        }, 100);
    }
    getTagSnippet(closingTag) {
        const snippet = new vscode.SnippetString();
        snippet.appendPlaceholder('', 0);
        snippet.appendText(closingTag.newText);
        return snippet;
    }
    getInsertionPositions(editor, position) {
        const activeSelectionPositions = editor.selections.map(s => s.active);
        return activeSelectionPositions.some(p => p.isEqual(position))
            ? activeSelectionPositions
            : position;
    }
}
TagClosing.minVersion = api_1.default.v300;
function requireActiveDocument(selector) {
    return new dependentRegistration_1.Condition(() => {
        const editor = vscode.window.activeTextEditor;
        return !!(editor && vscode.languages.match(selector, editor.document));
    }, handler => {
        return vscode.Disposable.from(vscode.window.onDidChangeActiveTextEditor(handler), vscode.workspace.onDidOpenTextDocument(handler));
    });
}
function register(selector, modeId, client) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireMinVersion)(client, TagClosing.minVersion),
        (0, dependentRegistration_1.requireConfiguration)(modeId, 'autoClosingTags'),
        requireActiveDocument(selector.syntax)
    ], () => new TagClosing(client));
}
exports.register = register;


/***/ }),
/* 75 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const typescriptService_1 = __webpack_require__(32);
const dependentRegistration_1 = __webpack_require__(35);
const definitionProviderBase_1 = __webpack_require__(51);
class TypeScriptTypeDefinitionProvider extends definitionProviderBase_1.default {
    provideTypeDefinition(document, position, token) {
        return this.getSymbolLocations('typeDefinition', document, position, token);
    }
}
exports.default = TypeScriptTypeDefinitionProvider;
function register(selector, client) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireSomeCapability)(client, typescriptService_1.ClientCapability.EnhancedSyntax, typescriptService_1.ClientCapability.Semantic),
    ], () => {
        return vscode.languages.registerTypeDefinitionProvider(selector.syntax, new TypeScriptTypeDefinitionProvider(client));
    });
}
exports.register = register;


/***/ }),
/* 76 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = exports.requireInlayHintsConfiguration = void 0;
const vscode = __webpack_require__(1);
const typescriptService_1 = __webpack_require__(32);
const api_1 = __webpack_require__(24);
const dependentRegistration_1 = __webpack_require__(35);
const dispose_1 = __webpack_require__(20);
const typeConverters_1 = __webpack_require__(37);
const fileConfigurationManager_1 = __webpack_require__(23);
const inlayHintSettingNames = [
    fileConfigurationManager_1.InlayHintSettingNames.parameterNamesSuppressWhenArgumentMatchesName,
    fileConfigurationManager_1.InlayHintSettingNames.parameterNamesEnabled,
    fileConfigurationManager_1.InlayHintSettingNames.variableTypesEnabled,
    fileConfigurationManager_1.InlayHintSettingNames.propertyDeclarationTypesEnabled,
    fileConfigurationManager_1.InlayHintSettingNames.functionLikeReturnTypesEnabled,
    fileConfigurationManager_1.InlayHintSettingNames.enumMemberValuesEnabled,
];
class TypeScriptInlayHintsProvider extends dispose_1.Disposable {
    constructor(modeId, languageIds, client, fileConfigurationManager) {
        super();
        this.client = client;
        this.fileConfigurationManager = fileConfigurationManager;
        this._onDidChangeInlayHints = new vscode.EventEmitter();
        this.onDidChangeInlayHints = this._onDidChangeInlayHints.event;
        this._register(vscode.workspace.onDidChangeConfiguration(e => {
            if (inlayHintSettingNames.some(settingName => e.affectsConfiguration(modeId + '.' + settingName))) {
                this._onDidChangeInlayHints.fire();
            }
        }));
        // When a JS/TS file changes, change inlay hints for all visible editors
        // since changes in one file can effect the hints the others.
        this._register(vscode.workspace.onDidChangeTextDocument(e => {
            if (languageIds.includes(e.document.languageId)) {
                this._onDidChangeInlayHints.fire();
            }
        }));
    }
    async provideInlayHints(model, range, token) {
        const filepath = this.client.toOpenedFilePath(model);
        if (!filepath) {
            return [];
        }
        const start = model.offsetAt(range.start);
        const length = model.offsetAt(range.end) - start;
        await this.fileConfigurationManager.ensureConfigurationForDocument(model, token);
        const response = await this.client.execute('provideInlayHints', { file: filepath, start, length }, token);
        if (response.type !== 'response' || !response.success || !response.body) {
            return [];
        }
        return response.body.map(hint => {
            const result = new vscode.InlayHint(hint.text, typeConverters_1.Position.fromLocation(hint.position), hint.kind && fromProtocolInlayHintKind(hint.kind));
            result.whitespaceBefore = hint.whitespaceBefore;
            result.whitespaceAfter = hint.whitespaceAfter;
            return result;
        });
    }
}
TypeScriptInlayHintsProvider.minVersion = api_1.default.v440;
function fromProtocolInlayHintKind(kind) {
    switch (kind) {
        case 'Parameter': return vscode.InlayHintKind.Parameter;
        case 'Type': return vscode.InlayHintKind.Type;
        case 'Enum': return vscode.InlayHintKind.Other;
        default: return vscode.InlayHintKind.Other;
    }
}
function requireInlayHintsConfiguration(language) {
    return new dependentRegistration_1.Condition(() => {
        const config = vscode.workspace.getConfiguration(language, null);
        const preferences = (0, fileConfigurationManager_1.getInlayHintsPreferences)(config);
        return preferences.includeInlayParameterNameHints === 'literals' ||
            preferences.includeInlayParameterNameHints === 'all' ||
            preferences.includeInlayEnumMemberValueHints ||
            preferences.includeInlayFunctionLikeReturnTypeHints ||
            preferences.includeInlayFunctionParameterTypeHints ||
            preferences.includeInlayPropertyDeclarationTypeHints ||
            preferences.includeInlayVariableTypeHints;
    }, vscode.workspace.onDidChangeConfiguration);
}
exports.requireInlayHintsConfiguration = requireInlayHintsConfiguration;
function register(selector, modeId, languageIds, client, fileConfigurationManager) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        requireInlayHintsConfiguration(modeId),
        (0, dependentRegistration_1.requireMinVersion)(client, TypeScriptInlayHintsProvider.minVersion),
        (0, dependentRegistration_1.requireSomeCapability)(client, typescriptService_1.ClientCapability.Semantic),
    ], () => {
        const provider = new TypeScriptInlayHintsProvider(modeId, languageIds, client, fileConfigurationManager);
        return vscode.languages.registerInlayHintsProvider(selector.semantic, provider);
    });
}
exports.register = register;


/***/ }),
/* 77 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
const path = __webpack_require__(8);
const vscode = __webpack_require__(1);
const nls = __webpack_require__(9);
const diagnostics_1 = __webpack_require__(78);
const protocol_const_1 = __webpack_require__(34);
const bufferSyncSupport_1 = __webpack_require__(79);
const serverError_1 = __webpack_require__(45);
const spawner_1 = __webpack_require__(81);
const versionManager_1 = __webpack_require__(84);
const typescriptService_1 = __webpack_require__(32);
const api_1 = __webpack_require__(24);
const configuration_1 = __webpack_require__(82);
const dispose_1 = __webpack_require__(20);
const fileSchemes = __webpack_require__(26);
const logger_1 = __webpack_require__(85);
const platform_1 = __webpack_require__(83);
const pluginPathsProvider_1 = __webpack_require__(86);
const telemetry_1 = __webpack_require__(88);
const tracer_1 = __webpack_require__(90);
const tsconfig_1 = __webpack_require__(7);
const localize = nls.loadMessageBundle();
var ServerState;
(function (ServerState) {
    ServerState.None = { type: 0 /* None */ };
    class Running {
        constructor(server, 
        /**
         * API version obtained from the version picker after checking the corresponding path exists.
         */
        apiVersion, 
        /**
         * Version reported by currently-running tsserver.
         */
        tsserverVersion, languageServiceEnabled) {
            this.server = server;
            this.apiVersion = apiVersion;
            this.tsserverVersion = tsserverVersion;
            this.languageServiceEnabled = languageServiceEnabled;
            this.type = 1 /* Running */;
            this.toCancelOnResourceChange = new Set();
        }
        updateTsserverVersion(tsserverVersion) {
            this.tsserverVersion = tsserverVersion;
        }
        updateLanguageServiceEnabled(enabled) {
            this.languageServiceEnabled = enabled;
        }
    }
    ServerState.Running = Running;
    class Errored {
        constructor(error, tsServerLogFile) {
            this.error = error;
            this.tsServerLogFile = tsServerLogFile;
            this.type = 2 /* Errored */;
        }
    }
    ServerState.Errored = Errored;
})(ServerState || (ServerState = {}));
class TypeScriptServiceClient extends dispose_1.Disposable {
    constructor(context, onCaseInsenitiveFileSystem, services, allModeIds) {
        super();
        this.context = context;
        this.inMemoryResourcePrefix = '^';
        this.logger = new logger_1.Logger();
        this.tracer = new tracer_1.default(this.logger);
        this.serverState = ServerState.None;
        this._isPromptingAfterCrash = false;
        this.isRestarting = false;
        this.hasServerFatallyCrashedTooManyTimes = false;
        this.loadingIndicator = new ServerInitializingIndicator();
        this._onDidChangeCapabilities = this._register(new vscode.EventEmitter());
        this.onDidChangeCapabilities = this._onDidChangeCapabilities.event;
        this._onTsServerStarted = this._register(new vscode.EventEmitter());
        this.onTsServerStarted = this._onTsServerStarted.event;
        this._onDiagnosticsReceived = this._register(new vscode.EventEmitter());
        this.onDiagnosticsReceived = this._onDiagnosticsReceived.event;
        this._onConfigDiagnosticsReceived = this._register(new vscode.EventEmitter());
        this.onConfigDiagnosticsReceived = this._onConfigDiagnosticsReceived.event;
        this._onResendModelsRequested = this._register(new vscode.EventEmitter());
        this.onResendModelsRequested = this._onResendModelsRequested.event;
        this._onProjectLanguageServiceStateChanged = this._register(new vscode.EventEmitter());
        this.onProjectLanguageServiceStateChanged = this._onProjectLanguageServiceStateChanged.event;
        this._onDidBeginInstallTypings = this._register(new vscode.EventEmitter());
        this.onDidBeginInstallTypings = this._onDidBeginInstallTypings.event;
        this._onDidEndInstallTypings = this._register(new vscode.EventEmitter());
        this.onDidEndInstallTypings = this._onDidEndInstallTypings.event;
        this._onTypesInstallerInitializationFailed = this._register(new vscode.EventEmitter());
        this.onTypesInstallerInitializationFailed = this._onTypesInstallerInitializationFailed.event;
        this._onSurveyReady = this._register(new vscode.EventEmitter());
        this.onSurveyReady = this._onSurveyReady.event;
        this.token = 0;
        this.workspaceState = context.workspaceState;
        this.pluginManager = services.pluginManager;
        this.logDirectoryProvider = services.logDirectoryProvider;
        this.cancellerFactory = services.cancellerFactory;
        this.versionProvider = services.versionProvider;
        this.processFactory = services.processFactory;
        this.pathSeparator = path.sep;
        this.lastStart = Date.now();
        let resolve;
        let reject;
        const p = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        this._onReady = { promise: p, resolve: resolve, reject: reject };
        this.numberRestarts = 0;
        this._configuration = services.serviceConfigurationProvider.loadFromWorkspace();
        this.versionProvider.updateConfiguration(this._configuration);
        this.pluginPathsProvider = new pluginPathsProvider_1.TypeScriptPluginPathsProvider(this._configuration);
        this._versionManager = this._register(new versionManager_1.TypeScriptVersionManager(this._configuration, this.versionProvider, this.workspaceState));
        this._register(this._versionManager.onDidPickNewVersion(() => {
            this.restartTsServer();
        }));
        this.bufferSyncSupport = new bufferSyncSupport_1.default(this, allModeIds, onCaseInsenitiveFileSystem);
        this.onReady(() => { this.bufferSyncSupport.listen(); });
        this.diagnosticsManager = new diagnostics_1.DiagnosticsManager('typescript', onCaseInsenitiveFileSystem);
        this.bufferSyncSupport.onDelete(resource => {
            this.cancelInflightRequestsForResource(resource);
            this.diagnosticsManager.delete(resource);
        }, null, this._disposables);
        this.bufferSyncSupport.onWillChange(resource => {
            this.cancelInflightRequestsForResource(resource);
        });
        vscode.workspace.onDidChangeConfiguration(() => {
            const oldConfiguration = this._configuration;
            this._configuration = services.serviceConfigurationProvider.loadFromWorkspace();
            this.versionProvider.updateConfiguration(this._configuration);
            this._versionManager.updateConfiguration(this._configuration);
            this.pluginPathsProvider.updateConfiguration(this._configuration);
            this.tracer.updateConfiguration();
            if (this.serverState.type === 1 /* Running */) {
                if (!this._configuration.implicitProjectConfiguration.isEqualTo(oldConfiguration.implicitProjectConfiguration)) {
                    this.setCompilerOptionsForInferredProjects(this._configuration);
                }
                if (!(0, configuration_1.areServiceConfigurationsEqual)(this._configuration, oldConfiguration)) {
                    this.restartTsServer();
                }
            }
        }, this, this._disposables);
        this.telemetryReporter = this._register(new telemetry_1.VSCodeTelemetryReporter(() => {
            if (this.serverState.type === 1 /* Running */) {
                if (this.serverState.tsserverVersion) {
                    return this.serverState.tsserverVersion;
                }
            }
            return this.apiVersion.fullVersionString;
        }));
        this.typescriptServerSpawner = new spawner_1.TypeScriptServerSpawner(this.versionProvider, this._versionManager, this.logDirectoryProvider, this.pluginPathsProvider, this.logger, this.telemetryReporter, this.tracer, this.processFactory);
        this._register(this.pluginManager.onDidUpdateConfig(update => {
            this.configurePlugin(update.pluginId, update.config);
        }));
        this._register(this.pluginManager.onDidChangePlugins(() => {
            this.restartTsServer();
        }));
    }
    get capabilities() {
        if (this._configuration.useSyntaxServer === 1 /* Always */) {
            return new typescriptService_1.ClientCapabilities(typescriptService_1.ClientCapability.Syntax, typescriptService_1.ClientCapability.EnhancedSyntax);
        }
        if ((0, platform_1.isWeb)()) {
            return new typescriptService_1.ClientCapabilities(typescriptService_1.ClientCapability.Syntax, typescriptService_1.ClientCapability.EnhancedSyntax);
        }
        if (this.apiVersion.gte(api_1.default.v400)) {
            return new typescriptService_1.ClientCapabilities(typescriptService_1.ClientCapability.Syntax, typescriptService_1.ClientCapability.EnhancedSyntax, typescriptService_1.ClientCapability.Semantic);
        }
        return new typescriptService_1.ClientCapabilities(typescriptService_1.ClientCapability.Syntax, typescriptService_1.ClientCapability.Semantic);
    }
    cancelInflightRequestsForResource(resource) {
        if (this.serverState.type !== 1 /* Running */) {
            return;
        }
        for (const request of this.serverState.toCancelOnResourceChange) {
            if (request.resource.toString() === resource.toString()) {
                request.cancel();
            }
        }
    }
    get configuration() {
        return this._configuration;
    }
    dispose() {
        super.dispose();
        this.bufferSyncSupport.dispose();
        if (this.serverState.type === 1 /* Running */) {
            this.serverState.server.kill();
        }
        this.loadingIndicator.reset();
    }
    restartTsServer() {
        if (this.serverState.type === 1 /* Running */) {
            this.info('Killing TS Server');
            this.isRestarting = true;
            this.serverState.server.kill();
        }
        this.serverState = this.startService(true);
    }
    get apiVersion() {
        if (this.serverState.type === 1 /* Running */) {
            return this.serverState.apiVersion;
        }
        return api_1.default.defaultVersion;
    }
    onReady(f) {
        return this._onReady.promise.then(f);
    }
    info(message, data) {
        this.logger.info(message, data);
    }
    error(message, data) {
        this.logger.error(message, data);
    }
    logTelemetry(eventName, properties) {
        this.telemetryReporter.logTelemetry(eventName, properties);
    }
    service() {
        if (this.serverState.type === 1 /* Running */) {
            return this.serverState;
        }
        if (this.serverState.type === 2 /* Errored */) {
            throw this.serverState.error;
        }
        const newState = this.startService();
        if (newState.type === 1 /* Running */) {
            return newState;
        }
        throw new Error(`Could not create TS service. Service state:${JSON.stringify(newState)}`);
    }
    ensureServiceStarted() {
        if (this.serverState.type !== 1 /* Running */) {
            this.startService();
        }
    }
    startService(resendModels = false) {
        this.info(`Starting TS Server `);
        if (this.isDisposed) {
            this.info(`Not starting server. Disposed `);
            return ServerState.None;
        }
        if (this.hasServerFatallyCrashedTooManyTimes) {
            this.info(`Not starting server. Too many crashes.`);
            return ServerState.None;
        }
        let version = this._versionManager.currentVersion;
        if (!version.isValid) {
            vscode.window.showWarningMessage(localize('noServerFound', 'The path {0} doesn\'t point to a valid tsserver install. Falling back to bundled TypeScript version.', version.path));
            this._versionManager.reset();
            version = this._versionManager.currentVersion;
        }
        this.info(`Using tsserver from: ${version.path}`);
        const apiVersion = version.apiVersion || api_1.default.defaultVersion;
        const mytoken = ++this.token;
        const handle = this.typescriptServerSpawner.spawn(version, this.capabilities, this.configuration, this.pluginManager, this.cancellerFactory, {
            onFatalError: (command, err) => this.fatalError(command, err),
        });
        this.serverState = new ServerState.Running(handle, apiVersion, undefined, true);
        this.lastStart = Date.now();
        /* __GDPR__
            "tsserver.spawned" : {
                "${include}": [
                    "${TypeScriptCommonProperties}"
                ],
                "localTypeScriptVersion": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "typeScriptVersionSource": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            }
        */
        this.logTelemetry('tsserver.spawned', {
            localTypeScriptVersion: this.versionProvider.localVersion ? this.versionProvider.localVersion.displayName : '',
            typeScriptVersionSource: version.source,
        });
        handle.onError((err) => {
            if (this.token !== mytoken) {
                // this is coming from an old process
                return;
            }
            if (err) {
                vscode.window.showErrorMessage(localize('serverExitedWithError', 'TypeScript language server exited with error. Error message is: {0}', err.message || err.name));
            }
            this.serverState = new ServerState.Errored(err, handle.tsServerLogFile);
            this.error('TSServer errored with error.', err);
            if (handle.tsServerLogFile) {
                this.error(`TSServer log file: ${handle.tsServerLogFile}`);
            }
            /* __GDPR__
                "tsserver.error" : {
                    "${include}": [
                        "${TypeScriptCommonProperties}"
                    ]
                }
            */
            this.logTelemetry('tsserver.error');
            this.serviceExited(false);
        });
        handle.onExit((data) => {
            if (this.token !== mytoken) {
                // this is coming from an old process
                return;
            }
            const { code, signal } = data;
            if (code === null || typeof code === 'undefined') {
                this.info(`TSServer exited. Signal: ${signal}`);
            }
            else {
                // In practice, the exit code is an integer with no ties to any identity,
                // so it can be classified as SystemMetaData, rather than CallstackOrException.
                this.error(`TSServer exited with code: ${code}. Signal: ${signal}`);
                /* __GDPR__
                    "tsserver.exitWithCode" : {
                        "code" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                        "signal" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                        "${include}": [
                            "${TypeScriptCommonProperties}"
                        ]
                    }
                */
                this.logTelemetry('tsserver.exitWithCode', { code, signal: signal ?? undefined });
            }
            if (handle.tsServerLogFile) {
                this.info(`TSServer log file: ${handle.tsServerLogFile}`);
            }
            this.serviceExited(!this.isRestarting);
            this.isRestarting = false;
        });
        handle.onEvent(event => this.dispatchEvent(event));
        if (apiVersion.gte(api_1.default.v300) && this.capabilities.has(typescriptService_1.ClientCapability.Semantic)) {
            this.loadingIndicator.startedLoadingProject(undefined /* projectName */);
        }
        this.serviceStarted(resendModels);
        this._onReady.resolve();
        this._onTsServerStarted.fire({ version: version, usedApiVersion: apiVersion });
        this._onDidChangeCapabilities.fire();
        return this.serverState;
    }
    async showVersionPicker() {
        this._versionManager.promptUserForVersion();
    }
    async openTsServerLogFile() {
        if (this._configuration.tsServerLogLevel === configuration_1.TsServerLogLevel.Off) {
            vscode.window.showErrorMessage(localize('typescript.openTsServerLog.loggingNotEnabled', 'TS Server logging is off. Please set `typescript.tsserver.log` and restart the TS server to enable logging'), {
                title: localize('typescript.openTsServerLog.enableAndReloadOption', 'Enable logging and restart TS server'),
            })
                .then(selection => {
                if (selection) {
                    return vscode.workspace.getConfiguration().update('typescript.tsserver.log', 'verbose', true).then(() => {
                        this.restartTsServer();
                    });
                }
                return undefined;
            });
            return false;
        }
        if (this.serverState.type !== 1 /* Running */ || !this.serverState.server.tsServerLogFile) {
            vscode.window.showWarningMessage(localize('typescript.openTsServerLog.noLogFile', 'TS Server has not started logging.'));
            return false;
        }
        try {
            const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(this.serverState.server.tsServerLogFile));
            await vscode.window.showTextDocument(doc);
            return true;
        }
        catch {
            // noop
        }
        try {
            await vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(this.serverState.server.tsServerLogFile));
            return true;
        }
        catch {
            vscode.window.showWarningMessage(localize('openTsServerLog.openFileFailedFailed', 'Could not open TS Server log file'));
            return false;
        }
    }
    serviceStarted(resendModels) {
        this.bufferSyncSupport.reset();
        const watchOptions = this.apiVersion.gte(api_1.default.v380)
            ? this.configuration.watchOptions
            : undefined;
        const configureOptions = {
            hostInfo: 'vscode',
            preferences: {
                providePrefixAndSuffixTextForRename: true,
                allowRenameOfImportPath: true,
                includePackageJsonAutoImports: this._configuration.includePackageJsonAutoImports,
            },
            watchOptions
        };
        this.executeWithoutWaitingForResponse('configure', configureOptions);
        this.setCompilerOptionsForInferredProjects(this._configuration);
        if (resendModels) {
            this._onResendModelsRequested.fire();
            this.bufferSyncSupport.reinitialize();
            this.bufferSyncSupport.requestAllDiagnostics();
        }
        // Reconfigure any plugins
        for (const [config, pluginName] of this.pluginManager.configurations()) {
            this.configurePlugin(config, pluginName);
        }
    }
    setCompilerOptionsForInferredProjects(configuration) {
        const args = {
            options: this.getCompilerOptionsForInferredProjects(configuration)
        };
        this.executeWithoutWaitingForResponse('compilerOptionsForInferredProjects', args);
    }
    getCompilerOptionsForInferredProjects(configuration) {
        return {
            ...(0, tsconfig_1.inferredProjectCompilerOptions)(0 /* TypeScript */, configuration),
            allowJs: true,
            allowSyntheticDefaultImports: true,
            allowNonTsExtensions: true,
            resolveJsonModule: true,
        };
    }
    serviceExited(restart) {
        this.loadingIndicator.reset();
        const previousState = this.serverState;
        this.serverState = ServerState.None;
        if (restart) {
            const diff = Date.now() - this.lastStart;
            this.numberRestarts++;
            let startService = true;
            const reportIssueItem = {
                title: localize('serverDiedReportIssue', 'Report Issue'),
            };
            let prompt = undefined;
            if (this.numberRestarts > 5) {
                this.numberRestarts = 0;
                if (diff < 10 * 1000 /* 10 seconds */) {
                    this.lastStart = Date.now();
                    startService = false;
                    this.hasServerFatallyCrashedTooManyTimes = true;
                    prompt = vscode.window.showErrorMessage(localize('serverDiedAfterStart', 'The TypeScript language service died 5 times right after it got started. The service will not be restarted.'), reportIssueItem);
                    /* __GDPR__
                        "serviceExited" : {
                            "${include}": [
                                "${TypeScriptCommonProperties}"
                            ]
                        }
                    */
                    this.logTelemetry('serviceExited');
                }
                else if (diff < 60 * 1000 * 5 /* 5 Minutes */) {
                    this.lastStart = Date.now();
                    prompt = vscode.window.showWarningMessage(localize('serverDied', 'The TypeScript language service died unexpectedly 5 times in the last 5 Minutes.'), reportIssueItem);
                }
            }
            else if (['vscode-insiders', 'code-oss'].includes(vscode.env.uriScheme)) {
                // Prompt after a single restart
                if (!this._isPromptingAfterCrash && previousState.type === 2 /* Errored */ && previousState.error instanceof serverError_1.TypeScriptServerError) {
                    this.numberRestarts = 0;
                    this._isPromptingAfterCrash = true;
                    prompt = vscode.window.showWarningMessage(localize('serverDiedOnce', 'The TypeScript language service died unexpectedly.'), reportIssueItem);
                }
            }
            prompt?.then(item => {
                this._isPromptingAfterCrash = false;
                if (item === reportIssueItem) {
                    const minModernTsVersion = this.versionProvider.bundledVersion.apiVersion;
                    if (minModernTsVersion && this.apiVersion.lt(minModernTsVersion)) {
                        vscode.window.showWarningMessage(localize('usingOldTsVersion.title', 'Please update your TypeScript version'), {
                            modal: true,
                            detail: localize('usingOldTsVersion.detail', 'The workspace is using an old version of TypeScript ({0}).\n\nBefore reporting an issue, please update the workspace to use the latest stable TypeScript release to make sure the bug has not already been fixed.', previousState.type === 2 /* Errored */ && previousState.error instanceof serverError_1.TypeScriptServerError ? previousState.error.version.apiVersion?.displayName : undefined),
                            useCustom: true
                        });
                    }
                    else {
                        const args = previousState.type === 2 /* Errored */ && previousState.error instanceof serverError_1.TypeScriptServerError
                            ? getReportIssueArgsForError(previousState.error, previousState.tsServerLogFile)
                            : undefined;
                        vscode.commands.executeCommand('workbench.action.openIssueReporter', args);
                    }
                }
            });
            if (startService) {
                this.startService(true);
            }
        }
    }
    normalizedPath(resource) {
        if (fileSchemes.disabledSchemes.has(resource.scheme)) {
            return undefined;
        }
        switch (resource.scheme) {
            case fileSchemes.file:
                {
                    let result = resource.fsPath;
                    if (!result) {
                        return undefined;
                    }
                    result = path.normalize(result);
                    // Both \ and / must be escaped in regular expressions
                    return result.replace(new RegExp('\\' + this.pathSeparator, 'g'), '/');
                }
            default:
                {
                    return this.inMemoryResourcePrefix + '/' + resource.scheme
                        + (resource.path.startsWith('/') ? resource.path : '/' + resource.path)
                        + (resource.fragment ? '#' + resource.fragment : '');
                }
        }
    }
    toPath(resource) {
        return this.normalizedPath(resource);
    }
    toOpenedFilePath(document, options = {}) {
        if (!this.bufferSyncSupport.ensureHasBuffer(document.uri)) {
            if (!options.suppressAlertOnFailure && !fileSchemes.disabledSchemes.has(document.uri.scheme)) {
                console.error(`Unexpected resource ${document.uri}`);
            }
            return undefined;
        }
        return this.toPath(document.uri);
    }
    hasCapabilityForResource(resource, capability) {
        if (!this.capabilities.has(capability)) {
            return false;
        }
        switch (capability) {
            case typescriptService_1.ClientCapability.Semantic:
                {
                    return fileSchemes.semanticSupportedSchemes.includes(resource.scheme);
                }
            case typescriptService_1.ClientCapability.Syntax:
            case typescriptService_1.ClientCapability.EnhancedSyntax:
                {
                    return true;
                }
        }
    }
    toResource(filepath) {
        if ((0, platform_1.isWeb)()) {
            // On web, the stdlib paths that TS return look like: '/lib.es2015.collection.d.ts'
            if (filepath.startsWith('/lib.') && filepath.endsWith('.d.ts')) {
                return vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'browser', 'typescript', filepath.slice(1));
            }
        }
        if (filepath.startsWith(this.inMemoryResourcePrefix)) {
            const parts = filepath.match(/^\^\/([^\/]+)\/(.+)$/);
            if (parts) {
                const resource = vscode.Uri.parse(parts[1] + ':' + parts[2]);
                return this.bufferSyncSupport.toVsCodeResource(resource);
            }
        }
        return this.bufferSyncSupport.toResource(filepath);
    }
    getWorkspaceRootForResource(resource) {
        const roots = vscode.workspace.workspaceFolders ? Array.from(vscode.workspace.workspaceFolders) : undefined;
        if (!roots || !roots.length) {
            return undefined;
        }
        switch (resource.scheme) {
            case fileSchemes.file:
            case fileSchemes.untitled:
            case fileSchemes.vscodeNotebookCell:
            case fileSchemes.memFs:
            case fileSchemes.vscodeVfs:
                for (const root of roots.sort((a, b) => a.uri.fsPath.length - b.uri.fsPath.length)) {
                    if (resource.fsPath.startsWith(root.uri.fsPath + path.sep)) {
                        return root.uri.fsPath;
                    }
                }
                return roots[0].uri.fsPath;
            default:
                return undefined;
        }
    }
    execute(command, args, token, config) {
        let executions;
        if (config?.cancelOnResourceChange) {
            const runningServerState = this.service();
            const source = new vscode.CancellationTokenSource();
            token.onCancellationRequested(() => source.cancel());
            const inFlight = {
                resource: config.cancelOnResourceChange,
                cancel: () => source.cancel(),
            };
            runningServerState.toCancelOnResourceChange.add(inFlight);
            executions = this.executeImpl(command, args, {
                isAsync: false,
                token: source.token,
                expectsResult: true,
                ...config,
            });
            executions[0].finally(() => {
                runningServerState.toCancelOnResourceChange.delete(inFlight);
                source.dispose();
            });
        }
        else {
            executions = this.executeImpl(command, args, {
                isAsync: false,
                token,
                expectsResult: true,
                ...config,
            });
        }
        if (config?.nonRecoverable) {
            executions[0].catch(err => this.fatalError(command, err));
        }
        if (command === 'updateOpen') {
            // If update open has completed, consider that the project has loaded
            Promise.all(executions).then(() => {
                this.loadingIndicator.reset();
            });
        }
        return executions[0];
    }
    executeWithoutWaitingForResponse(command, args) {
        this.executeImpl(command, args, {
            isAsync: false,
            token: undefined,
            expectsResult: false
        });
    }
    executeAsync(command, args, token) {
        return this.executeImpl(command, args, {
            isAsync: true,
            token,
            expectsResult: true
        })[0];
    }
    executeImpl(command, args, executeInfo) {
        this.bufferSyncSupport.beforeCommand(command);
        const runningServerState = this.service();
        return runningServerState.server.executeImpl(command, args, executeInfo);
    }
    interruptGetErr(f) {
        return this.bufferSyncSupport.interruptGetErr(f);
    }
    fatalError(command, error) {
        /* __GDPR__
            "fatalError" : {
                "${include}": [
                    "${TypeScriptCommonProperties}",
                    "${TypeScriptRequestErrorProperties}"
                ],
                "command" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            }
        */
        this.logTelemetry('fatalError', { ...(error instanceof serverError_1.TypeScriptServerError ? error.telemetry : { command }) });
        console.error(`A non-recoverable error occurred while executing tsserver command: ${command}`);
        if (error instanceof serverError_1.TypeScriptServerError && error.serverErrorText) {
            console.error(error.serverErrorText);
        }
        if (this.serverState.type === 1 /* Running */) {
            this.info('Killing TS Server');
            const logfile = this.serverState.server.tsServerLogFile;
            this.serverState.server.kill();
            if (error instanceof serverError_1.TypeScriptServerError) {
                this.serverState = new ServerState.Errored(error, logfile);
            }
        }
    }
    dispatchEvent(event) {
        switch (event.event) {
            case protocol_const_1.EventName.syntaxDiag:
            case protocol_const_1.EventName.semanticDiag:
            case protocol_const_1.EventName.suggestionDiag:
                // This event also roughly signals that projects have been loaded successfully (since the TS server is synchronous)
                this.loadingIndicator.reset();
                const diagnosticEvent = event;
                if (diagnosticEvent.body && diagnosticEvent.body.diagnostics) {
                    this._onDiagnosticsReceived.fire({
                        kind: getDignosticsKind(event),
                        resource: this.toResource(diagnosticEvent.body.file),
                        diagnostics: diagnosticEvent.body.diagnostics
                    });
                }
                break;
            case protocol_const_1.EventName.configFileDiag:
                this._onConfigDiagnosticsReceived.fire(event);
                break;
            case protocol_const_1.EventName.telemetry:
                {
                    const body = event.body;
                    this.dispatchTelemetryEvent(body);
                    break;
                }
            case protocol_const_1.EventName.projectLanguageServiceState:
                {
                    const body = event.body;
                    if (this.serverState.type === 1 /* Running */) {
                        this.serverState.updateLanguageServiceEnabled(body.languageServiceEnabled);
                    }
                    this._onProjectLanguageServiceStateChanged.fire(body);
                    break;
                }
            case protocol_const_1.EventName.projectsUpdatedInBackground:
                this.loadingIndicator.reset();
                const body = event.body;
                const resources = body.openFiles.map(file => this.toResource(file));
                this.bufferSyncSupport.getErr(resources);
                break;
            case protocol_const_1.EventName.beginInstallTypes:
                this._onDidBeginInstallTypings.fire(event.body);
                break;
            case protocol_const_1.EventName.endInstallTypes:
                this._onDidEndInstallTypings.fire(event.body);
                break;
            case protocol_const_1.EventName.typesInstallerInitializationFailed:
                this._onTypesInstallerInitializationFailed.fire(event.body);
                break;
            case protocol_const_1.EventName.surveyReady:
                this._onSurveyReady.fire(event.body);
                break;
            case protocol_const_1.EventName.projectLoadingStart:
                this.loadingIndicator.startedLoadingProject(event.body.projectName);
                break;
            case protocol_const_1.EventName.projectLoadingFinish:
                this.loadingIndicator.finishedLoadingProject(event.body.projectName);
                break;
        }
    }
    dispatchTelemetryEvent(telemetryData) {
        const properties = Object.create(null);
        switch (telemetryData.telemetryEventName) {
            case 'typingsInstalled':
                const typingsInstalledPayload = telemetryData.payload;
                properties['installedPackages'] = typingsInstalledPayload.installedPackages;
                if (typeof typingsInstalledPayload.installSuccess === 'boolean') {
                    properties['installSuccess'] = typingsInstalledPayload.installSuccess.toString();
                }
                if (typeof typingsInstalledPayload.typingsInstallerVersion === 'string') {
                    properties['typingsInstallerVersion'] = typingsInstalledPayload.typingsInstallerVersion;
                }
                break;
            default:
                const payload = telemetryData.payload;
                if (payload) {
                    Object.keys(payload).forEach((key) => {
                        try {
                            if (payload.hasOwnProperty(key)) {
                                properties[key] = typeof payload[key] === 'string' ? payload[key] : JSON.stringify(payload[key]);
                            }
                        }
                        catch (e) {
                            // noop
                        }
                    });
                }
                break;
        }
        if (telemetryData.telemetryEventName === 'projectInfo') {
            if (this.serverState.type === 1 /* Running */) {
                this.serverState.updateTsserverVersion(properties['version']);
            }
        }
        /* __GDPR__
            "typingsInstalled" : {
                "installedPackages" : { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" },
                "installSuccess": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                "typingsInstallerVersion": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                "${include}": [
                    "${TypeScriptCommonProperties}"
                ]
            }
        */
        // __GDPR__COMMENT__: Other events are defined by TypeScript.
        this.logTelemetry(telemetryData.telemetryEventName, properties);
    }
    configurePlugin(pluginName, configuration) {
        if (this.apiVersion.gte(api_1.default.v314)) {
            this.executeWithoutWaitingForResponse('configurePlugin', { pluginName, configuration });
        }
    }
}
exports.default = TypeScriptServiceClient;
function getReportIssueArgsForError(error, logPath) {
    if (!error.serverStack || !error.serverMessage) {
        return undefined;
    }
    // Note these strings are intentionally not localized
    // as we want users to file issues in english
    const sections = [
        `❗️❗️❗️ Please fill in the sections below to help us diagnose the issue ❗️❗️❗️`,
        `**TypeScript Version:** ${error.version.apiVersion?.fullVersionString}`,
        `**Steps to reproduce crash**

1.
2.
3.`,
    ];
    if (logPath) {
        sections.push(`**TS Server Log**

❗️ Please review and upload this log file to help us diagnose this crash:

\`${logPath}\`

The log file may contain personal data, including full paths and source code from your workspace. You can scrub the log file to remove paths or other personal information.
`);
    }
    else {
        sections.push(`**TS Server Log**

❗️Server logging disabled. To help us fix crashes like this, please enable logging by setting:

\`\`\`json
"typescript.tsserver.log": "verbose"
\`\`\`

After enabling this setting, future crash reports will include the server log.`);
    }
    sections.push(`**TS Server Error Stack**

Server: \`${error.serverId}\`

\`\`\`
${error.serverStack}
\`\`\``);
    return {
        extensionId: 'vscode.typescript-language-features',
        issueTitle: `TS Server fatal error:  ${error.serverMessage}`,
        issueBody: sections.join('\n\n')
    };
}
function getDignosticsKind(event) {
    switch (event.event) {
        case 'syntaxDiag': return 0 /* Syntax */;
        case 'semanticDiag': return 1 /* Semantic */;
        case 'suggestionDiag': return 2 /* Suggestion */;
    }
    throw new Error('Unknown dignostics kind');
}
class ServerInitializingIndicator extends dispose_1.Disposable {
    reset() {
        if (this._task) {
            const error = new Error('Canceled');
            error.name = error.message;
            this._task.reject(error);
            this._task = undefined;
        }
    }
    /**
     * Signal that a project has started loading.
     */
    startedLoadingProject(projectName) {
        // TS projects are loaded sequentially. Cancel existing task because it should always be resolved before
        // the incoming project loading task is.
        this.reset();
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            title: localize('serverLoading.progress', "Initializing JS/TS language features"),
        }, () => new Promise((resolve, reject) => {
            this._task = { project: projectName, resolve, reject };
        }));
    }
    finishedLoadingProject(projectName) {
        if (this._task && this._task.project === projectName) {
            this._task.resolve();
            this._task = undefined;
        }
    }
}


/***/ }),
/* 78 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DiagnosticsManager = void 0;
const vscode = __webpack_require__(1);
const arrays = __webpack_require__(28);
const dispose_1 = __webpack_require__(20);
const resourceMap_1 = __webpack_require__(29);
function diagnosticsEquals(a, b) {
    if (a === b) {
        return true;
    }
    return a.code === b.code
        && a.message === b.message
        && a.severity === b.severity
        && a.source === b.source
        && a.range.isEqual(b.range)
        && arrays.equals(a.relatedInformation || arrays.empty, b.relatedInformation || arrays.empty, (a, b) => {
            return a.message === b.message
                && a.location.range.isEqual(b.location.range)
                && a.location.uri.fsPath === b.location.uri.fsPath;
        })
        && arrays.equals(a.tags || arrays.empty, b.tags || arrays.empty);
}
class FileDiagnostics {
    constructor(file, language) {
        this.file = file;
        this.language = language;
        this._diagnostics = new Map();
    }
    updateDiagnostics(language, kind, diagnostics) {
        if (language !== this.language) {
            this._diagnostics.clear();
            this.language = language;
        }
        const existing = this._diagnostics.get(kind);
        if (arrays.equals(existing || arrays.empty, diagnostics, diagnosticsEquals)) {
            // No need to update
            return false;
        }
        this._diagnostics.set(kind, diagnostics);
        return true;
    }
    getDiagnostics(settings) {
        if (!settings.getValidate(this.language)) {
            return [];
        }
        return [
            ...this.get(0 /* Syntax */),
            ...this.get(1 /* Semantic */),
            ...this.getSuggestionDiagnostics(settings),
        ];
    }
    getSuggestionDiagnostics(settings) {
        const enableSuggestions = settings.getEnableSuggestions(this.language);
        return this.get(2 /* Suggestion */).filter(x => {
            if (!enableSuggestions) {
                // Still show unused
                return x.tags && (x.tags.includes(vscode.DiagnosticTag.Unnecessary) || x.tags.includes(vscode.DiagnosticTag.Deprecated));
            }
            return true;
        });
    }
    get(kind) {
        return this._diagnostics.get(kind) || [];
    }
}
function areLanguageDiagnosticSettingsEqual(currentSettings, newSettings) {
    return currentSettings.validate === newSettings.validate
        && currentSettings.enableSuggestions && currentSettings.enableSuggestions;
}
class DiagnosticSettings {
    constructor() {
        this._languageSettings = new Map();
    }
    getValidate(language) {
        return this.get(language).validate;
    }
    setValidate(language, value) {
        return this.update(language, settings => ({
            validate: value,
            enableSuggestions: settings.enableSuggestions,
        }));
    }
    getEnableSuggestions(language) {
        return this.get(language).enableSuggestions;
    }
    setEnableSuggestions(language, value) {
        return this.update(language, settings => ({
            validate: settings.validate,
            enableSuggestions: value
        }));
    }
    get(language) {
        return this._languageSettings.get(language) || DiagnosticSettings.defaultSettings;
    }
    update(language, f) {
        const currentSettings = this.get(language);
        const newSettings = f(currentSettings);
        this._languageSettings.set(language, newSettings);
        return !areLanguageDiagnosticSettingsEqual(currentSettings, newSettings);
    }
}
DiagnosticSettings.defaultSettings = {
    validate: true,
    enableSuggestions: true
};
class DiagnosticsManager extends dispose_1.Disposable {
    constructor(owner, onCaseInsensitiveFileSystem) {
        super();
        this._settings = new DiagnosticSettings();
        this._updateDelay = 50;
        this._diagnostics = new resourceMap_1.ResourceMap(undefined, { onCaseInsensitiveFileSystem });
        this._pendingUpdates = new resourceMap_1.ResourceMap(undefined, { onCaseInsensitiveFileSystem });
        this._currentDiagnostics = this._register(vscode.languages.createDiagnosticCollection(owner));
    }
    dispose() {
        super.dispose();
        for (const value of this._pendingUpdates.values) {
            clearTimeout(value);
        }
        this._pendingUpdates.clear();
    }
    reInitialize() {
        this._currentDiagnostics.clear();
        this._diagnostics.clear();
    }
    setValidate(language, value) {
        const didUpdate = this._settings.setValidate(language, value);
        if (didUpdate) {
            this.rebuild();
        }
    }
    setEnableSuggestions(language, value) {
        const didUpdate = this._settings.setEnableSuggestions(language, value);
        if (didUpdate) {
            this.rebuild();
        }
    }
    updateDiagnostics(file, language, kind, diagnostics) {
        let didUpdate = false;
        const entry = this._diagnostics.get(file);
        if (entry) {
            didUpdate = entry.updateDiagnostics(language, kind, diagnostics);
        }
        else if (diagnostics.length) {
            const fileDiagnostics = new FileDiagnostics(file, language);
            fileDiagnostics.updateDiagnostics(language, kind, diagnostics);
            this._diagnostics.set(file, fileDiagnostics);
            didUpdate = true;
        }
        if (didUpdate) {
            this.scheduleDiagnosticsUpdate(file);
        }
    }
    configFileDiagnosticsReceived(file, diagnostics) {
        this._currentDiagnostics.set(file, diagnostics);
    }
    delete(resource) {
        this._currentDiagnostics.delete(resource);
        this._diagnostics.delete(resource);
    }
    getDiagnostics(file) {
        return this._currentDiagnostics.get(file) || [];
    }
    scheduleDiagnosticsUpdate(file) {
        if (!this._pendingUpdates.has(file)) {
            this._pendingUpdates.set(file, setTimeout(() => this.updateCurrentDiagnostics(file), this._updateDelay));
        }
    }
    updateCurrentDiagnostics(file) {
        if (this._pendingUpdates.has(file)) {
            clearTimeout(this._pendingUpdates.get(file));
            this._pendingUpdates.delete(file);
        }
        const fileDiagnostics = this._diagnostics.get(file);
        this._currentDiagnostics.set(file, fileDiagnostics ? fileDiagnostics.getDiagnostics(this._settings) : []);
    }
    rebuild() {
        this._currentDiagnostics.clear();
        for (const fileDiagnostic of this._diagnostics.values) {
            this._currentDiagnostics.set(fileDiagnostic.file, fileDiagnostic.getDiagnostics(this._settings));
        }
    }
}
exports.DiagnosticsManager = DiagnosticsManager;


/***/ }),
/* 79 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
const vscode = __webpack_require__(1);
const typescriptService_1 = __webpack_require__(32);
const api_1 = __webpack_require__(24);
const arrays_1 = __webpack_require__(28);
const async_1 = __webpack_require__(80);
const cancellation_1 = __webpack_require__(12);
const dispose_1 = __webpack_require__(20);
const languageModeIds = __webpack_require__(14);
const resourceMap_1 = __webpack_require__(29);
const typeConverters = __webpack_require__(37);
function mode2ScriptKind(mode) {
    switch (mode) {
        case languageModeIds.typescript: return 'TS';
        case languageModeIds.typescriptreact: return 'TSX';
        case languageModeIds.javascript: return 'JS';
        case languageModeIds.javascriptreact: return 'JSX';
    }
    return undefined;
}
class CloseOperation {
    constructor(args) {
        this.args = args;
        this.type = 0 /* Close */;
    }
}
class OpenOperation {
    constructor(args) {
        this.args = args;
        this.type = 1 /* Open */;
    }
}
class ChangeOperation {
    constructor(args) {
        this.args = args;
        this.type = 2 /* Change */;
    }
}
/**
 * Manages synchronization of buffers with the TS server.
 *
 * If supported, batches together file changes. This allows the TS server to more efficiently process changes.
 */
class BufferSynchronizer {
    constructor(client, pathNormalizer, onCaseInsensitiveFileSystem) {
        this.client = client;
        this._pending = new resourceMap_1.ResourceMap(pathNormalizer, {
            onCaseInsensitiveFileSystem
        });
    }
    open(resource, args) {
        if (this.supportsBatching) {
            this.updatePending(resource, new OpenOperation(args));
        }
        else {
            this.client.executeWithoutWaitingForResponse('open', args);
        }
    }
    /**
     * @return Was the buffer open?
     */
    close(resource, filepath) {
        if (this.supportsBatching) {
            return this.updatePending(resource, new CloseOperation(filepath));
        }
        else {
            const args = { file: filepath };
            this.client.executeWithoutWaitingForResponse('close', args);
            return true;
        }
    }
    change(resource, filepath, events) {
        if (!events.length) {
            return;
        }
        if (this.supportsBatching) {
            this.updatePending(resource, new ChangeOperation({
                fileName: filepath,
                textChanges: events.map((change) => ({
                    newText: change.text,
                    start: typeConverters.Position.toLocation(change.range.start),
                    end: typeConverters.Position.toLocation(change.range.end),
                })).reverse(), // Send the edits end-of-document to start-of-document order
            }));
        }
        else {
            for (const { range, text } of events) {
                const args = {
                    insertString: text,
                    ...typeConverters.Range.toFormattingRequestArgs(filepath, range)
                };
                this.client.executeWithoutWaitingForResponse('change', args);
            }
        }
    }
    reset() {
        this._pending.clear();
    }
    beforeCommand(command) {
        if (command === 'updateOpen') {
            return;
        }
        this.flush();
    }
    flush() {
        if (!this.supportsBatching) {
            // We've already eagerly synchronized
            this._pending.clear();
            return;
        }
        if (this._pending.size > 0) {
            const closedFiles = [];
            const openFiles = [];
            const changedFiles = [];
            for (const change of this._pending.values) {
                switch (change.type) {
                    case 2 /* Change */:
                        changedFiles.push(change.args);
                        break;
                    case 1 /* Open */:
                        openFiles.push(change.args);
                        break;
                    case 0 /* Close */:
                        closedFiles.push(change.args);
                        break;
                }
            }
            this.client.execute('updateOpen', { changedFiles, closedFiles, openFiles }, cancellation_1.nulToken, { nonRecoverable: true });
            this._pending.clear();
        }
    }
    get supportsBatching() {
        return this.client.apiVersion.gte(api_1.default.v340);
    }
    updatePending(resource, op) {
        switch (op.type) {
            case 0 /* Close */:
                const existing = this._pending.get(resource);
                switch (existing?.type) {
                    case 1 /* Open */:
                        this._pending.delete(resource);
                        return false; // Open then close. No need to do anything
                }
                break;
        }
        if (this._pending.has(resource)) {
            // we saw this file before, make sure we flush before working with it again
            this.flush();
        }
        this._pending.set(resource, op);
        return true;
    }
}
class SyncedBuffer {
    constructor(document, filepath, client, synchronizer) {
        this.document = document;
        this.filepath = filepath;
        this.client = client;
        this.synchronizer = synchronizer;
        this.state = 1 /* Initial */;
    }
    open() {
        const args = {
            file: this.filepath,
            fileContent: this.document.getText(),
            projectRootPath: this.client.getWorkspaceRootForResource(this.document.uri),
        };
        const scriptKind = mode2ScriptKind(this.document.languageId);
        if (scriptKind) {
            args.scriptKindName = scriptKind;
        }
        if (this.client.apiVersion.gte(api_1.default.v240)) {
            const tsPluginsForDocument = this.client.pluginManager.plugins
                .filter(x => x.languages.indexOf(this.document.languageId) >= 0);
            if (tsPluginsForDocument.length) {
                args.plugins = tsPluginsForDocument.map(plugin => plugin.name);
            }
        }
        this.synchronizer.open(this.resource, args);
        this.state = 2 /* Open */;
    }
    get resource() {
        return this.document.uri;
    }
    get lineCount() {
        return this.document.lineCount;
    }
    get kind() {
        switch (this.document.languageId) {
            case languageModeIds.javascript:
            case languageModeIds.javascriptreact:
                return 2 /* JavaScript */;
            case languageModeIds.typescript:
            case languageModeIds.typescriptreact:
            default:
                return 1 /* TypeScript */;
        }
    }
    /**
     * @return Was the buffer open?
     */
    close() {
        if (this.state !== 2 /* Open */) {
            this.state = 2 /* Closed */;
            return false;
        }
        this.state = 2 /* Closed */;
        return this.synchronizer.close(this.resource, this.filepath);
    }
    onContentChanged(events) {
        if (this.state !== 2 /* Open */) {
            console.error(`Unexpected buffer state: ${this.state}`);
        }
        this.synchronizer.change(this.resource, this.filepath, events);
    }
}
class SyncedBufferMap extends resourceMap_1.ResourceMap {
    getForPath(filePath) {
        return this.get(vscode.Uri.file(filePath));
    }
    get allBuffers() {
        return this.values;
    }
}
class PendingDiagnostics extends resourceMap_1.ResourceMap {
    getOrderedFileSet() {
        const orderedResources = Array.from(this.entries)
            .sort((a, b) => a.value - b.value)
            .map(entry => entry.resource);
        const map = new resourceMap_1.ResourceMap(this._normalizePath, this.config);
        for (const resource of orderedResources) {
            map.set(resource, undefined);
        }
        return map;
    }
}
class GetErrRequest {
    constructor(client, files, onDone) {
        this.client = client;
        this.files = files;
        this._done = false;
        this._token = new vscode.CancellationTokenSource();
        if (!this.isErrorReportingEnabled()) {
            this._done = true;
            (0, async_1.setImmediate)(onDone);
            return;
        }
        const supportsSyntaxGetErr = this.client.apiVersion.gte(api_1.default.v440);
        const allFiles = (0, arrays_1.coalesce)(Array.from(files.entries)
            .filter(entry => supportsSyntaxGetErr || client.hasCapabilityForResource(entry.resource, typescriptService_1.ClientCapability.Semantic))
            .map(entry => client.normalizedPath(entry.resource)));
        if (!allFiles.length) {
            this._done = true;
            (0, async_1.setImmediate)(onDone);
        }
        else {
            const request = this.areProjectDiagnosticsEnabled()
                // Note that geterrForProject is almost certainly not the api we want here as it ends up computing far
                // too many diagnostics
                ? client.executeAsync('geterrForProject', { delay: 0, file: allFiles[0] }, this._token.token)
                : client.executeAsync('geterr', { delay: 0, files: allFiles }, this._token.token);
            request.finally(() => {
                if (this._done) {
                    return;
                }
                this._done = true;
                onDone();
            });
        }
    }
    static executeGetErrRequest(client, files, onDone) {
        return new GetErrRequest(client, files, onDone);
    }
    isErrorReportingEnabled() {
        if (this.client.apiVersion.gte(api_1.default.v440)) {
            return true;
        }
        else {
            // Older TS versions only support `getErr` on semantic server
            return this.client.capabilities.has(typescriptService_1.ClientCapability.Semantic);
        }
    }
    areProjectDiagnosticsEnabled() {
        return this.client.configuration.enableProjectDiagnostics && this.client.capabilities.has(typescriptService_1.ClientCapability.Semantic);
    }
    cancel() {
        if (!this._done) {
            this._token.cancel();
        }
        this._token.dispose();
    }
}
class BufferSyncSupport extends dispose_1.Disposable {
    constructor(client, modeIds, onCaseInsensitiveFileSystem) {
        super();
        this._validateJavaScript = true;
        this._validateTypeScript = true;
        this.listening = false;
        this._onDelete = this._register(new vscode.EventEmitter());
        this.onDelete = this._onDelete.event;
        this._onWillChange = this._register(new vscode.EventEmitter());
        this.onWillChange = this._onWillChange.event;
        this.client = client;
        this.modeIds = new Set(modeIds);
        this.diagnosticDelayer = new async_1.Delayer(300);
        const pathNormalizer = (path) => this.client.normalizedPath(path);
        this.syncedBuffers = new SyncedBufferMap(pathNormalizer, { onCaseInsensitiveFileSystem });
        this.pendingDiagnostics = new PendingDiagnostics(pathNormalizer, { onCaseInsensitiveFileSystem });
        this.synchronizer = new BufferSynchronizer(client, pathNormalizer, onCaseInsensitiveFileSystem);
        this.updateConfiguration();
        vscode.workspace.onDidChangeConfiguration(this.updateConfiguration, this, this._disposables);
    }
    listen() {
        if (this.listening) {
            return;
        }
        this.listening = true;
        vscode.workspace.onDidOpenTextDocument(this.openTextDocument, this, this._disposables);
        vscode.workspace.onDidCloseTextDocument(this.onDidCloseTextDocument, this, this._disposables);
        vscode.workspace.onDidChangeTextDocument(this.onDidChangeTextDocument, this, this._disposables);
        vscode.window.onDidChangeVisibleTextEditors(e => {
            for (const { document } of e) {
                const syncedBuffer = this.syncedBuffers.get(document.uri);
                if (syncedBuffer) {
                    this.requestDiagnostic(syncedBuffer);
                }
            }
        }, this, this._disposables);
        vscode.workspace.textDocuments.forEach(this.openTextDocument, this);
    }
    handles(resource) {
        return this.syncedBuffers.has(resource);
    }
    ensureHasBuffer(resource) {
        if (this.syncedBuffers.has(resource)) {
            return true;
        }
        const existingDocument = vscode.workspace.textDocuments.find(doc => doc.uri.toString() === resource.toString());
        if (existingDocument) {
            return this.openTextDocument(existingDocument);
        }
        return false;
    }
    toVsCodeResource(resource) {
        const filepath = this.client.normalizedPath(resource);
        for (const buffer of this.syncedBuffers.allBuffers) {
            if (buffer.filepath === filepath) {
                return buffer.resource;
            }
        }
        return resource;
    }
    toResource(filePath) {
        const buffer = this.syncedBuffers.getForPath(filePath);
        if (buffer) {
            return buffer.resource;
        }
        return vscode.Uri.file(filePath);
    }
    reset() {
        this.pendingGetErr?.cancel();
        this.pendingDiagnostics.clear();
        this.synchronizer.reset();
    }
    reinitialize() {
        this.reset();
        for (const buffer of this.syncedBuffers.allBuffers) {
            buffer.open();
        }
    }
    openTextDocument(document) {
        if (!this.modeIds.has(document.languageId)) {
            return false;
        }
        const resource = document.uri;
        const filepath = this.client.normalizedPath(resource);
        if (!filepath) {
            return false;
        }
        if (this.syncedBuffers.has(resource)) {
            return true;
        }
        const syncedBuffer = new SyncedBuffer(document, filepath, this.client, this.synchronizer);
        this.syncedBuffers.set(resource, syncedBuffer);
        syncedBuffer.open();
        this.requestDiagnostic(syncedBuffer);
        return true;
    }
    closeResource(resource) {
        const syncedBuffer = this.syncedBuffers.get(resource);
        if (!syncedBuffer) {
            return;
        }
        this.pendingDiagnostics.delete(resource);
        this.pendingGetErr?.files.delete(resource);
        this.syncedBuffers.delete(resource);
        const wasBufferOpen = syncedBuffer.close();
        this._onDelete.fire(resource);
        if (wasBufferOpen) {
            this.requestAllDiagnostics();
        }
    }
    interruptGetErr(f) {
        if (!this.pendingGetErr
            || this.client.configuration.enableProjectDiagnostics // `geterr` happens on seperate server so no need to cancel it.
        ) {
            return f();
        }
        this.pendingGetErr.cancel();
        this.pendingGetErr = undefined;
        const result = f();
        this.triggerDiagnostics();
        return result;
    }
    beforeCommand(command) {
        this.synchronizer.beforeCommand(command);
    }
    onDidCloseTextDocument(document) {
        this.closeResource(document.uri);
    }
    onDidChangeTextDocument(e) {
        const syncedBuffer = this.syncedBuffers.get(e.document.uri);
        if (!syncedBuffer) {
            return;
        }
        this._onWillChange.fire(syncedBuffer.resource);
        syncedBuffer.onContentChanged(e.contentChanges);
        const didTrigger = this.requestDiagnostic(syncedBuffer);
        if (!didTrigger && this.pendingGetErr) {
            // In this case we always want to re-trigger all diagnostics
            this.pendingGetErr.cancel();
            this.pendingGetErr = undefined;
            this.triggerDiagnostics();
        }
    }
    requestAllDiagnostics() {
        for (const buffer of this.syncedBuffers.allBuffers) {
            if (this.shouldValidate(buffer)) {
                this.pendingDiagnostics.set(buffer.resource, Date.now());
            }
        }
        this.triggerDiagnostics();
    }
    getErr(resources) {
        const handledResources = resources.filter(resource => this.handles(resource));
        if (!handledResources.length) {
            return;
        }
        for (const resource of handledResources) {
            this.pendingDiagnostics.set(resource, Date.now());
        }
        this.triggerDiagnostics();
    }
    triggerDiagnostics(delay = 200) {
        this.diagnosticDelayer.trigger(() => {
            this.sendPendingDiagnostics();
        }, delay);
    }
    requestDiagnostic(buffer) {
        if (!this.shouldValidate(buffer)) {
            return false;
        }
        this.pendingDiagnostics.set(buffer.resource, Date.now());
        const delay = Math.min(Math.max(Math.ceil(buffer.lineCount / 20), 300), 800);
        this.triggerDiagnostics(delay);
        return true;
    }
    hasPendingDiagnostics(resource) {
        return this.pendingDiagnostics.has(resource);
    }
    sendPendingDiagnostics() {
        const orderedFileSet = this.pendingDiagnostics.getOrderedFileSet();
        if (this.pendingGetErr) {
            this.pendingGetErr.cancel();
            for (const { resource } of this.pendingGetErr.files.entries) {
                if (this.syncedBuffers.get(resource)) {
                    orderedFileSet.set(resource, undefined);
                }
            }
            this.pendingGetErr = undefined;
        }
        // Add all open TS buffers to the geterr request. They might be visible
        for (const buffer of this.syncedBuffers.values) {
            orderedFileSet.set(buffer.resource, undefined);
        }
        if (orderedFileSet.size) {
            const getErr = this.pendingGetErr = GetErrRequest.executeGetErrRequest(this.client, orderedFileSet, () => {
                if (this.pendingGetErr === getErr) {
                    this.pendingGetErr = undefined;
                }
            });
        }
        this.pendingDiagnostics.clear();
    }
    updateConfiguration() {
        const jsConfig = vscode.workspace.getConfiguration('javascript', null);
        const tsConfig = vscode.workspace.getConfiguration('typescript', null);
        this._validateJavaScript = jsConfig.get('validate.enable', true);
        this._validateTypeScript = tsConfig.get('validate.enable', true);
    }
    shouldValidate(buffer) {
        switch (buffer.kind) {
            case 2 /* JavaScript */:
                return this._validateJavaScript;
            case 1 /* TypeScript */:
            default:
                return this._validateTypeScript;
        }
    }
}
exports.default = BufferSyncSupport;


/***/ }),
/* 80 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setImmediate = exports.Delayer = void 0;
class Delayer {
    constructor(defaultDelay) {
        this.defaultDelay = defaultDelay;
        this.timeout = null;
        this.completionPromise = null;
        this.onSuccess = null;
        this.task = null;
    }
    trigger(task, delay = this.defaultDelay) {
        this.task = task;
        if (delay >= 0) {
            this.cancelTimeout();
        }
        if (!this.completionPromise) {
            this.completionPromise = new Promise((resolve) => {
                this.onSuccess = resolve;
            }).then(() => {
                this.completionPromise = null;
                this.onSuccess = null;
                const result = this.task && this.task();
                this.task = null;
                return result;
            });
        }
        if (delay >= 0 || this.timeout === null) {
            this.timeout = setTimeout(() => {
                this.timeout = null;
                if (this.onSuccess) {
                    this.onSuccess(undefined);
                }
            }, delay >= 0 ? delay : this.defaultDelay);
        }
        return this.completionPromise;
    }
    cancelTimeout() {
        if (this.timeout !== null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
}
exports.Delayer = Delayer;
function setImmediate(callback, ...args) {
    if (__webpack_require__.g.setImmediate) {
        const handle = __webpack_require__.g.setImmediate(callback, ...args);
        return { dispose: () => __webpack_require__.g.clearImmediate(handle) };
    }
    else {
        const handle = setTimeout(callback, 0, ...args);
        return { dispose: () => clearTimeout(handle) };
    }
}
exports.setImmediate = setImmediate;


/***/ }),
/* 81 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TypeScriptServerSpawner = void 0;
const path = __webpack_require__(8);
const vscode = __webpack_require__(1);
const typescriptService_1 = __webpack_require__(32);
const api_1 = __webpack_require__(24);
const configuration_1 = __webpack_require__(82);
const platform_1 = __webpack_require__(83);
const server_1 = __webpack_require__(42);
class TypeScriptServerSpawner {
    constructor(_versionProvider, _versionManager, _logDirectoryProvider, _pluginPathsProvider, _logger, _telemetryReporter, _tracer, _factory) {
        this._versionProvider = _versionProvider;
        this._versionManager = _versionManager;
        this._logDirectoryProvider = _logDirectoryProvider;
        this._pluginPathsProvider = _pluginPathsProvider;
        this._logger = _logger;
        this._telemetryReporter = _telemetryReporter;
        this._tracer = _tracer;
        this._factory = _factory;
    }
    spawn(version, capabilities, configuration, pluginManager, cancellerFactory, delegate) {
        let primaryServer;
        const serverType = this.getCompositeServerType(version, capabilities, configuration);
        const shouldUseSeparateDiagnosticsServer = this.shouldUseSeparateDiagnosticsServer(configuration);
        switch (serverType) {
            case 1 /* SeparateSyntax */:
            case 2 /* DynamicSeparateSyntax */:
                {
                    const enableDynamicRouting = !shouldUseSeparateDiagnosticsServer && serverType === 2 /* DynamicSeparateSyntax */;
                    primaryServer = new server_1.SyntaxRoutingTsServer({
                        syntax: this.spawnTsServer("syntax" /* Syntax */, version, configuration, pluginManager, cancellerFactory),
                        semantic: this.spawnTsServer("semantic" /* Semantic */, version, configuration, pluginManager, cancellerFactory),
                    }, delegate, enableDynamicRouting);
                    break;
                }
            case 0 /* Single */:
                {
                    primaryServer = this.spawnTsServer("main" /* Main */, version, configuration, pluginManager, cancellerFactory);
                    break;
                }
            case 3 /* SyntaxOnly */:
                {
                    primaryServer = this.spawnTsServer("syntax" /* Syntax */, version, configuration, pluginManager, cancellerFactory);
                    break;
                }
        }
        if (shouldUseSeparateDiagnosticsServer) {
            return new server_1.GetErrRoutingTsServer({
                getErr: this.spawnTsServer("diagnostics" /* Diagnostics */, version, configuration, pluginManager, cancellerFactory),
                primary: primaryServer,
            }, delegate);
        }
        return primaryServer;
    }
    getCompositeServerType(version, capabilities, configuration) {
        if (!capabilities.has(typescriptService_1.ClientCapability.Semantic)) {
            return 3 /* SyntaxOnly */;
        }
        switch (configuration.useSyntaxServer) {
            case 1 /* Always */:
                return 3 /* SyntaxOnly */;
            case 0 /* Never */:
                return 0 /* Single */;
            case 2 /* Auto */:
                if (version.apiVersion?.gte(api_1.default.v340)) {
                    return version.apiVersion?.gte(api_1.default.v400)
                        ? 2 /* DynamicSeparateSyntax */
                        : 1 /* SeparateSyntax */;
                }
                return 0 /* Single */;
        }
    }
    shouldUseSeparateDiagnosticsServer(configuration) {
        return configuration.enableProjectDiagnostics;
    }
    spawnTsServer(kind, version, configuration, pluginManager, cancellerFactory) {
        const apiVersion = version.apiVersion || api_1.default.defaultVersion;
        const canceller = cancellerFactory.create(kind, this._tracer);
        const { args, tsServerLogFile, tsServerTraceDirectory } = this.getTsServerArgs(kind, configuration, version, apiVersion, pluginManager, canceller.cancellationPipeName);
        if (TypeScriptServerSpawner.isLoggingEnabled(configuration)) {
            if (tsServerLogFile) {
                this._logger.info(`<${kind}> Log file: ${tsServerLogFile}`);
            }
            else {
                this._logger.error(`<${kind}> Could not create log directory`);
            }
        }
        if (configuration.enableTsServerTracing) {
            if (tsServerTraceDirectory) {
                this._logger.info(`<${kind}> Trace directory: ${tsServerTraceDirectory}`);
            }
            else {
                this._logger.error(`<${kind}> Could not create trace directory`);
            }
        }
        this._logger.info(`<${kind}> Forking...`);
        const process = this._factory.fork(version.tsServerPath, args, kind, configuration, this._versionManager);
        this._logger.info(`<${kind}> Starting...`);
        return new server_1.ProcessBasedTsServer(kind, this.kindToServerType(kind), process, tsServerLogFile, canceller, version, this._telemetryReporter, this._tracer);
    }
    kindToServerType(kind) {
        switch (kind) {
            case "syntax" /* Syntax */:
                return typescriptService_1.ServerType.Syntax;
            case "main" /* Main */:
            case "semantic" /* Semantic */:
            case "diagnostics" /* Diagnostics */:
            default:
                return typescriptService_1.ServerType.Semantic;
        }
    }
    getTsServerArgs(kind, configuration, currentVersion, apiVersion, pluginManager, cancellationPipeName) {
        const args = [];
        let tsServerLogFile;
        let tsServerTraceDirectory;
        if (kind === "syntax" /* Syntax */) {
            if (apiVersion.gte(api_1.default.v401)) {
                args.push('--serverMode', 'partialSemantic');
            }
            else {
                args.push('--syntaxOnly');
            }
        }
        if (apiVersion.gte(api_1.default.v250)) {
            args.push('--useInferredProjectPerProjectRoot');
        }
        else {
            args.push('--useSingleInferredProject');
        }
        if (configuration.disableAutomaticTypeAcquisition || kind === "syntax" /* Syntax */ || kind === "diagnostics" /* Diagnostics */) {
            args.push('--disableAutomaticTypingAcquisition');
        }
        if (kind === "semantic" /* Semantic */ || kind === "main" /* Main */) {
            args.push('--enableTelemetry');
        }
        if (cancellationPipeName) {
            args.push('--cancellationPipeName', cancellationPipeName + '*');
        }
        if (TypeScriptServerSpawner.isLoggingEnabled(configuration)) {
            if ((0, platform_1.isWeb)()) {
                args.push('--logVerbosity', configuration_1.TsServerLogLevel.toString(configuration.tsServerLogLevel));
            }
            else {
                const logDir = this._logDirectoryProvider.getNewLogDirectory();
                if (logDir) {
                    tsServerLogFile = path.join(logDir, `tsserver.log`);
                    args.push('--logVerbosity', configuration_1.TsServerLogLevel.toString(configuration.tsServerLogLevel));
                    args.push('--logFile', tsServerLogFile);
                }
            }
        }
        if (configuration.enableTsServerTracing && !(0, platform_1.isWeb)()) {
            tsServerTraceDirectory = this._logDirectoryProvider.getNewLogDirectory();
            if (tsServerTraceDirectory) {
                args.push('--traceDirectory', tsServerTraceDirectory);
            }
        }
        if (!(0, platform_1.isWeb)()) {
            const pluginPaths = this._pluginPathsProvider.getPluginPaths();
            if (pluginManager.plugins.length) {
                args.push('--globalPlugins', pluginManager.plugins.map(x => x.name).join(','));
                const isUsingBundledTypeScriptVersion = currentVersion.path === this._versionProvider.defaultVersion.path;
                for (const plugin of pluginManager.plugins) {
                    if (isUsingBundledTypeScriptVersion || plugin.enableForWorkspaceTypeScriptVersions) {
                        pluginPaths.push(plugin.path);
                    }
                }
            }
            if (pluginPaths.length !== 0) {
                args.push('--pluginProbeLocations', pluginPaths.join(','));
            }
        }
        if (configuration.npmLocation && !(0, platform_1.isWeb)()) {
            args.push('--npmLocation', `"${configuration.npmLocation}"`);
        }
        args.push('--locale', TypeScriptServerSpawner.getTsLocale(configuration));
        args.push('--noGetErrOnBackgroundUpdate');
        args.push('--validateDefaultNpmLocation');
        return { args, tsServerLogFile, tsServerTraceDirectory };
    }
    static isLoggingEnabled(configuration) {
        return configuration.tsServerLogLevel !== configuration_1.TsServerLogLevel.Off;
    }
    static getTsLocale(configuration) {
        return configuration.locale
            ? configuration.locale
            : vscode.env.language;
    }
}
exports.TypeScriptServerSpawner = TypeScriptServerSpawner;


/***/ }),
/* 82 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseServiceConfigurationProvider = exports.areServiceConfigurationsEqual = exports.ImplicitProjectConfiguration = exports.TsServerLogLevel = void 0;
const vscode = __webpack_require__(1);
const objects = __webpack_require__(27);
var TsServerLogLevel;
(function (TsServerLogLevel) {
    TsServerLogLevel[TsServerLogLevel["Off"] = 0] = "Off";
    TsServerLogLevel[TsServerLogLevel["Normal"] = 1] = "Normal";
    TsServerLogLevel[TsServerLogLevel["Terse"] = 2] = "Terse";
    TsServerLogLevel[TsServerLogLevel["Verbose"] = 3] = "Verbose";
})(TsServerLogLevel = exports.TsServerLogLevel || (exports.TsServerLogLevel = {}));
(function (TsServerLogLevel) {
    function fromString(value) {
        switch (value && value.toLowerCase()) {
            case 'normal':
                return TsServerLogLevel.Normal;
            case 'terse':
                return TsServerLogLevel.Terse;
            case 'verbose':
                return TsServerLogLevel.Verbose;
            case 'off':
            default:
                return TsServerLogLevel.Off;
        }
    }
    TsServerLogLevel.fromString = fromString;
    function toString(value) {
        switch (value) {
            case TsServerLogLevel.Normal:
                return 'normal';
            case TsServerLogLevel.Terse:
                return 'terse';
            case TsServerLogLevel.Verbose:
                return 'verbose';
            case TsServerLogLevel.Off:
            default:
                return 'off';
        }
    }
    TsServerLogLevel.toString = toString;
})(TsServerLogLevel = exports.TsServerLogLevel || (exports.TsServerLogLevel = {}));
class ImplicitProjectConfiguration {
    constructor(configuration) {
        this.checkJs = ImplicitProjectConfiguration.readCheckJs(configuration);
        this.experimentalDecorators = ImplicitProjectConfiguration.readExperimentalDecorators(configuration);
        this.strictNullChecks = ImplicitProjectConfiguration.readImplicitStrictNullChecks(configuration);
        this.strictFunctionTypes = ImplicitProjectConfiguration.readImplicitStrictFunctionTypes(configuration);
    }
    isEqualTo(other) {
        return objects.equals(this, other);
    }
    static readCheckJs(configuration) {
        return configuration.get('js/ts.implicitProjectConfig.checkJs')
            ?? configuration.get('javascript.implicitProjectConfig.checkJs', false);
    }
    static readExperimentalDecorators(configuration) {
        return configuration.get('js/ts.implicitProjectConfig.experimentalDecorators')
            ?? configuration.get('javascript.implicitProjectConfig.experimentalDecorators', false);
    }
    static readImplicitStrictNullChecks(configuration) {
        return configuration.get('js/ts.implicitProjectConfig.strictNullChecks', false);
    }
    static readImplicitStrictFunctionTypes(configuration) {
        return configuration.get('js/ts.implicitProjectConfig.strictFunctionTypes', true);
    }
}
exports.ImplicitProjectConfiguration = ImplicitProjectConfiguration;
function areServiceConfigurationsEqual(a, b) {
    return objects.equals(a, b);
}
exports.areServiceConfigurationsEqual = areServiceConfigurationsEqual;
class BaseServiceConfigurationProvider {
    loadFromWorkspace() {
        const configuration = vscode.workspace.getConfiguration();
        return {
            locale: this.extractLocale(configuration),
            globalTsdk: this.extractGlobalTsdk(configuration),
            localTsdk: this.extractLocalTsdk(configuration),
            npmLocation: this.readNpmLocation(configuration),
            tsServerLogLevel: this.readTsServerLogLevel(configuration),
            tsServerPluginPaths: this.readTsServerPluginPaths(configuration),
            implicitProjectConfiguration: new ImplicitProjectConfiguration(configuration),
            disableAutomaticTypeAcquisition: this.readDisableAutomaticTypeAcquisition(configuration),
            useSyntaxServer: this.readUseSyntaxServer(configuration),
            enableProjectDiagnostics: this.readEnableProjectDiagnostics(configuration),
            maxTsServerMemory: this.readMaxTsServerMemory(configuration),
            enablePromptUseWorkspaceTsdk: this.readEnablePromptUseWorkspaceTsdk(configuration),
            watchOptions: this.readWatchOptions(configuration),
            includePackageJsonAutoImports: this.readIncludePackageJsonAutoImports(configuration),
            enableTsServerTracing: this.readEnableTsServerTracing(configuration),
        };
    }
    readTsServerLogLevel(configuration) {
        const setting = configuration.get('typescript.tsserver.log', 'off');
        return TsServerLogLevel.fromString(setting);
    }
    readTsServerPluginPaths(configuration) {
        return configuration.get('typescript.tsserver.pluginPaths', []);
    }
    readNpmLocation(configuration) {
        return configuration.get('typescript.npm', null);
    }
    readDisableAutomaticTypeAcquisition(configuration) {
        return configuration.get('typescript.disableAutomaticTypeAcquisition', false);
    }
    extractLocale(configuration) {
        return configuration.get('typescript.locale', null);
    }
    readUseSyntaxServer(configuration) {
        const value = configuration.get('typescript.tsserver.useSyntaxServer');
        switch (value) {
            case 'never': return 0 /* Never */;
            case 'always': return 1 /* Always */;
            case 'auto': return 2 /* Auto */;
        }
        // Fallback to deprecated setting
        const deprecatedValue = configuration.get('typescript.tsserver.useSeparateSyntaxServer', true);
        if (deprecatedValue === 'forAllRequests') { // Undocumented setting
            return 1 /* Always */;
        }
        if (deprecatedValue === true) {
            return 2 /* Auto */;
        }
        return 0 /* Never */;
    }
    readEnableProjectDiagnostics(configuration) {
        return configuration.get('typescript.tsserver.experimental.enableProjectDiagnostics', false);
    }
    readWatchOptions(configuration) {
        return configuration.get('typescript.tsserver.watchOptions');
    }
    readIncludePackageJsonAutoImports(configuration) {
        return configuration.get('typescript.preferences.includePackageJsonAutoImports');
    }
    readMaxTsServerMemory(configuration) {
        const defaultMaxMemory = 3072;
        const minimumMaxMemory = 128;
        const memoryInMB = configuration.get('typescript.tsserver.maxTsServerMemory', defaultMaxMemory);
        if (!Number.isSafeInteger(memoryInMB)) {
            return defaultMaxMemory;
        }
        return Math.max(memoryInMB, minimumMaxMemory);
    }
    readEnablePromptUseWorkspaceTsdk(configuration) {
        return configuration.get('typescript.enablePromptUseWorkspaceTsdk', false);
    }
    readEnableTsServerTracing(configuration) {
        return configuration.get('typescript.tsserver.enableTracing', false);
    }
}
exports.BaseServiceConfigurationProvider = BaseServiceConfigurationProvider;


/***/ }),
/* 83 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isWeb = void 0;
const vscode = __webpack_require__(1);
function isWeb() {
    // @ts-expect-error
    return typeof navigator !== 'undefined' && vscode.env.uiKind === vscode.UIKind.Web;
}
exports.isWeb = isWeb;


/***/ }),
/* 84 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TypeScriptVersionManager = void 0;
const vscode = __webpack_require__(1);
const nls = __webpack_require__(9);
const async_1 = __webpack_require__(80);
const dispose_1 = __webpack_require__(20);
const localize = nls.loadMessageBundle();
const useWorkspaceTsdkStorageKey = 'typescript.useWorkspaceTsdk';
const suppressPromptWorkspaceTsdkStorageKey = 'typescript.suppressPromptWorkspaceTsdk';
class TypeScriptVersionManager extends dispose_1.Disposable {
    constructor(configuration, versionProvider, workspaceState) {
        super();
        this.configuration = configuration;
        this.versionProvider = versionProvider;
        this.workspaceState = workspaceState;
        this._onDidPickNewVersion = this._register(new vscode.EventEmitter());
        this.onDidPickNewVersion = this._onDidPickNewVersion.event;
        this._currentVersion = this.versionProvider.defaultVersion;
        if (this.useWorkspaceTsdkSetting) {
            if (vscode.workspace.isTrusted) {
                const localVersion = this.versionProvider.localVersion;
                if (localVersion) {
                    this._currentVersion = localVersion;
                }
            }
            else {
                this._disposables.push(vscode.workspace.onDidGrantWorkspaceTrust(() => {
                    if (this.versionProvider.localVersion) {
                        this.updateActiveVersion(this.versionProvider.localVersion);
                    }
                }));
            }
        }
        if (this.isInPromptWorkspaceTsdkState(configuration)) {
            (0, async_1.setImmediate)(() => {
                this.promptUseWorkspaceTsdk();
            });
        }
    }
    updateConfiguration(nextConfiguration) {
        const lastConfiguration = this.configuration;
        this.configuration = nextConfiguration;
        if (!this.isInPromptWorkspaceTsdkState(lastConfiguration)
            && this.isInPromptWorkspaceTsdkState(nextConfiguration)) {
            this.promptUseWorkspaceTsdk();
        }
    }
    get currentVersion() {
        return this._currentVersion;
    }
    reset() {
        this._currentVersion = this.versionProvider.bundledVersion;
    }
    async promptUserForVersion() {
        const selected = await vscode.window.showQuickPick([
            this.getBundledPickItem(),
            ...this.getLocalPickItems(),
            {
                kind: vscode.QuickPickItemKind.Separator,
                label: '',
                run: () => { },
            },
            LearnMorePickItem,
        ], {
            placeHolder: localize('selectTsVersion', "Select the TypeScript version used for JavaScript and TypeScript language features"),
        });
        return selected?.run();
    }
    getBundledPickItem() {
        const bundledVersion = this.versionProvider.defaultVersion;
        return {
            label: (!this.useWorkspaceTsdkSetting || !vscode.workspace.isTrusted
                ? '• '
                : '') + localize('useVSCodeVersionOption', "Use VS Code's Version"),
            description: bundledVersion.displayName,
            detail: bundledVersion.pathLabel,
            run: async () => {
                await this.workspaceState.update(useWorkspaceTsdkStorageKey, false);
                this.updateActiveVersion(bundledVersion);
            },
        };
    }
    getLocalPickItems() {
        return this.versionProvider.localVersions.map(version => {
            return {
                label: (this.useWorkspaceTsdkSetting && vscode.workspace.isTrusted && this.currentVersion.eq(version)
                    ? '• '
                    : '') + localize('useWorkspaceVersionOption', "Use Workspace Version"),
                description: version.displayName,
                detail: version.pathLabel,
                run: async () => {
                    const trusted = await vscode.workspace.requestWorkspaceTrust();
                    if (trusted) {
                        await this.workspaceState.update(useWorkspaceTsdkStorageKey, true);
                        const tsConfig = vscode.workspace.getConfiguration('typescript');
                        await tsConfig.update('tsdk', version.pathLabel, false);
                        this.updateActiveVersion(version);
                    }
                },
            };
        });
    }
    async promptUseWorkspaceTsdk() {
        const workspaceVersion = this.versionProvider.localVersion;
        if (workspaceVersion === undefined) {
            throw new Error('Could not prompt to use workspace TypeScript version because no workspace version is specified');
        }
        const allowIt = localize('allow', 'Allow');
        const dismissPrompt = localize('dismiss', 'Dismiss');
        const suppressPrompt = localize('suppress prompt', 'Never in this Workspace');
        const result = await vscode.window.showInformationMessage(localize('promptUseWorkspaceTsdk', 'This workspace contains a TypeScript version. Would you like to use the workspace TypeScript version for TypeScript and JavaScript language features?'), allowIt, dismissPrompt, suppressPrompt);
        if (result === allowIt) {
            await this.workspaceState.update(useWorkspaceTsdkStorageKey, true);
            this.updateActiveVersion(workspaceVersion);
        }
        else if (result === suppressPrompt) {
            await this.workspaceState.update(suppressPromptWorkspaceTsdkStorageKey, true);
        }
    }
    updateActiveVersion(pickedVersion) {
        const oldVersion = this.currentVersion;
        this._currentVersion = pickedVersion;
        if (!oldVersion.eq(pickedVersion)) {
            this._onDidPickNewVersion.fire();
        }
    }
    get useWorkspaceTsdkSetting() {
        return this.workspaceState.get(useWorkspaceTsdkStorageKey, false);
    }
    get suppressPromptWorkspaceTsdkSetting() {
        return this.workspaceState.get(suppressPromptWorkspaceTsdkStorageKey, false);
    }
    isInPromptWorkspaceTsdkState(configuration) {
        return (configuration.localTsdk !== null
            && configuration.enablePromptUseWorkspaceTsdk === true
            && this.suppressPromptWorkspaceTsdkSetting === false
            && this.useWorkspaceTsdkSetting === false);
    }
}
exports.TypeScriptVersionManager = TypeScriptVersionManager;
const LearnMorePickItem = {
    label: localize('learnMore', "Learn more about managing TypeScript versions"),
    description: '',
    run: () => {
        vscode.env.openExternal(vscode.Uri.parse('https://go.microsoft.com/fwlink/?linkid=839919'));
    }
};


/***/ }),
/* 85 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Logger = void 0;
const vscode = __webpack_require__(1);
const nls = __webpack_require__(9);
const memoize_1 = __webpack_require__(67);
const localize = nls.loadMessageBundle();
class Logger {
    get output() {
        return vscode.window.createOutputChannel(localize('channelName', 'TypeScript'));
    }
    data2String(data) {
        if (data instanceof Error) {
            return data.stack || data.message;
        }
        if (data.success === false && data.message) {
            return data.message;
        }
        return data.toString();
    }
    info(message, data) {
        this.logLevel('Info', message, data);
    }
    error(message, data) {
        // See https://github.com/microsoft/TypeScript/issues/10496
        if (data && data.message === 'No content available.') {
            return;
        }
        this.logLevel('Error', message, data);
    }
    logLevel(level, message, data) {
        this.output.appendLine(`[${level}  - ${this.now()}] ${message}`);
        if (data) {
            this.output.appendLine(this.data2String(data));
        }
    }
    now() {
        const now = new Date();
        return padLeft(now.getUTCHours() + '', 2, '0')
            + ':' + padLeft(now.getMinutes() + '', 2, '0')
            + ':' + padLeft(now.getUTCSeconds() + '', 2, '0') + '.' + now.getMilliseconds();
    }
}
__decorate([
    memoize_1.memoize
], Logger.prototype, "output", null);
exports.Logger = Logger;
function padLeft(s, n, pad = ' ') {
    return pad.repeat(Math.max(0, n - s.length)) + s;
}


/***/ }),
/* 86 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TypeScriptPluginPathsProvider = void 0;
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const path = __webpack_require__(8);
const vscode = __webpack_require__(1);
const relativePathResolver_1 = __webpack_require__(87);
class TypeScriptPluginPathsProvider {
    constructor(configuration) {
        this.configuration = configuration;
    }
    updateConfiguration(configuration) {
        this.configuration = configuration;
    }
    getPluginPaths() {
        const pluginPaths = [];
        for (const pluginPath of this.configuration.tsServerPluginPaths) {
            pluginPaths.push(...this.resolvePluginPath(pluginPath));
        }
        return pluginPaths;
    }
    resolvePluginPath(pluginPath) {
        if (path.isAbsolute(pluginPath)) {
            return [pluginPath];
        }
        const workspacePath = relativePathResolver_1.RelativeWorkspacePathResolver.asAbsoluteWorkspacePath(pluginPath);
        if (workspacePath !== undefined) {
            return [workspacePath];
        }
        return (vscode.workspace.workspaceFolders || [])
            .map(workspaceFolder => path.join(workspaceFolder.uri.fsPath, pluginPath));
    }
}
exports.TypeScriptPluginPathsProvider = TypeScriptPluginPathsProvider;


/***/ }),
/* 87 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RelativeWorkspacePathResolver = void 0;
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const path = __webpack_require__(8);
const vscode = __webpack_require__(1);
class RelativeWorkspacePathResolver {
    static asAbsoluteWorkspacePath(relativePath) {
        for (const root of vscode.workspace.workspaceFolders || []) {
            const rootPrefixes = [`./${root.name}/`, `${root.name}/`, `.\\${root.name}\\`, `${root.name}\\`];
            for (const rootPrefix of rootPrefixes) {
                if (relativePath.startsWith(rootPrefix)) {
                    return path.join(root.uri.fsPath, relativePath.replace(rootPrefix, ''));
                }
            }
        }
        return undefined;
    }
}
exports.RelativeWorkspacePathResolver = RelativeWorkspacePathResolver;


/***/ }),
/* 88 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VSCodeTelemetryReporter = void 0;
const vscode = __webpack_require__(1);
const vscode_extension_telemetry_1 = __webpack_require__(89);
const memoize_1 = __webpack_require__(67);
class VSCodeTelemetryReporter {
    constructor(clientVersionDelegate) {
        this.clientVersionDelegate = clientVersionDelegate;
        this._reporter = null;
    }
    logTelemetry(eventName, properties = {}) {
        const reporter = this.reporter;
        if (!reporter) {
            return;
        }
        /* __GDPR__FRAGMENT__
            "TypeScriptCommonProperties" : {
                "version" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            }
        */
        properties['version'] = this.clientVersionDelegate();
        reporter.sendTelemetryEvent(eventName, properties);
    }
    dispose() {
        if (this._reporter) {
            this._reporter.dispose();
            this._reporter = null;
        }
    }
    get reporter() {
        if (this.packageInfo && this.packageInfo.aiKey) {
            this._reporter = new vscode_extension_telemetry_1.default(this.packageInfo.name, this.packageInfo.version, this.packageInfo.aiKey);
            return this._reporter;
        }
        return null;
    }
    get packageInfo() {
        const { packageJSON } = vscode.extensions.getExtension('vscode.typescript-language-features');
        if (packageJSON) {
            return {
                name: packageJSON.name,
                version: packageJSON.version,
                aiKey: packageJSON.aiKey
            };
        }
        return null;
    }
}
__decorate([
    memoize_1.memoize
], VSCodeTelemetryReporter.prototype, "reporter", null);
__decorate([
    memoize_1.memoize
], VSCodeTelemetryReporter.prototype, "packageInfo", null);
exports.VSCodeTelemetryReporter = VSCodeTelemetryReporter;


/***/ }),
/* 89 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ mu)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
var mo=Object.defineProperty;var vu=t=>mo(t,"__esModule",{value:!0});var C=(t,e)=>()=>(t&&(e=t(t=0)),e);var hu=(t,e)=>{vu(t);for(var r in e)mo(t,r,{get:e[r],enumerable:!0})};var vo,ho=C(()=>{vo={Unknown:0,NonRetryableStatus:1,InvalidEvent:2,SizeLimitExceeded:3,KillSwitch:4,QueueFull:5}});var mt,Xe,Oe,Ie,zr,gt,Cr,Ir,Ln,Un,nr,_n=C(()=>{mt="function",Xe="object",Oe="undefined",Ie="prototype",zr="hasOwnProperty",gt=Object,Cr=gt[Ie],Ir=gt.assign,Ln=gt.create,Un=gt.defineProperty,nr=Cr[zr]});function ot(){return typeof globalThis!==Oe&&globalThis?globalThis:typeof self!==Oe&&self?self:typeof window!==Oe&&window?window:typeof __webpack_require__.g!==Oe&&__webpack_require__.g?__webpack_require__.g:null}function Tr(t){throw new TypeError(t)}function Dt(t){var e=Ln;if(e)return e(t);if(t==null)return{};var r=typeof t;r!==Xe&&r!==mt&&Tr("Object prototype may only be an Object:"+t);function n(){}return n[Ie]=t,new n}var Ai=C(()=>{_n()});function H(t,e){typeof e!==mt&&e!==null&&Tr("Class extends value "+String(e)+" is not a constructor or null"),Ni(t,e);function r(){this.constructor=t}t[Ie]=e===null?Dt(e):(r[Ie]=e[Ie],new r)}var Ul,_l,Su,yt,Ni,xo=C(()=>{_n();Ai();Ul=(ot()||{}).Symbol,_l=(ot()||{}).Reflect,Su=function(t){for(var e,r=1,n=arguments.length;r<n;r++){e=arguments[r];for(var i in e)Cr[zr].call(e,i)&&(t[i]=e[i])}return t},yt=Ir||Su,Ni=function(t,e){return Ni=gt.setPrototypeOf||{__proto__:[]}instanceof Array&&function(r,n){r.__proto__=n}||function(r,n){for(var i in n)n[zr](i)&&(r[i]=n[i])},Ni(t,e)}});var yo=C(()=>{});var ne=C(()=>{_n();Ai();xo();yo()});function zt(t,e){return t&&zn[At].hasOwnProperty.call(t,e)}function Eo(t){return t&&(t===zn[At]||t===Array[At])}function Mi(t){return Eo(t)||t===Function[At]}function ir(t){if(t){if(Vr)return Vr(t);var e=t[Iu]||t[At]||(t[On]?t[On][At]:null);if(e)return e}return null}function Bn(t,e){var r=[],n=zn.getOwnPropertyNames;if(n)r=n(t);else for(var i in t)typeof i=="string"&&zt(t,i)&&r.push(i);if(r&&r.length>0)for(var a=0;a<r.length;a++)e(r[a])}function Li(t,e,r){return e!==On&&typeof t[e]===Hn&&(r||zt(t,e))}function Vn(t){throw new TypeError("DynamicProto: "+t)}function Tu(t){var e={};return Bn(t,function(r){!e[r]&&Li(t,r,!1)&&(e[r]=t[r])}),e}function Ui(t,e){for(var r=t.length-1;r>=0;r--)if(t[r]===e)return!0;return!1}function Eu(t,e,r,n){function i(s,u,l){var f=u[l];if(f[Fi]&&n){var m=s[jn]||{};m[Br]!==!1&&(f=(m[u[Er]]||{})[l]||f)}return function(){return f.apply(s,arguments)}}var a={};Bn(r,function(s){a[s]=i(e,r,s)});for(var o=ir(t),c=[];o&&!Mi(o)&&!Ui(c,o);)Bn(o,function(s){!a[s]&&Li(o,s,!Vr)&&(a[s]=i(e,o,s))}),c.push(o),o=ir(o);return a}function wu(t,e,r,n){var i=null;if(t&&zt(r,Er)){var a=t[jn]||{};if(i=(a[r[Er]]||{})[e],i||Vn("Missing ["+e+"] "+Hn),!i[ki]&&a[Br]!==!1){for(var o=!zt(t,e),c=ir(t),s=[];o&&c&&!Mi(c)&&!Ui(s,c);){var u=c[e];if(u){o=u===n;break}s.push(c),c=ir(c)}try{o&&(t[e]=i),i[ki]=1}catch(l){a[Br]=!1}}}return i}function Pu(t,e,r){var n=e[t];return n===r&&(n=ir(e)[t]),typeof n!==Hn&&Vn("["+t+"] is not a "+Hn),n}function bu(t,e,r,n,i){function a(s,u){var l=function(){var f=wu(this,u,s,l)||Pu(u,s,l);return f.apply(this,arguments)};return l[Fi]=1,l}if(!Eo(t)){var o=r[jn]=r[jn]||{},c=o[e]=o[e]||{};o[Br]!==!1&&(o[Br]=!!i),Bn(r,function(s){Li(r,s,!1)&&r[s]!==n[s]&&(c[s]=r[s],delete r[s],(!zt(t,s)||t[s]&&!t[s][Fi])&&(t[s]=a(t,s)))})}}function Du(t,e){if(Vr)for(var r=[],n=ir(e);n&&!Mi(n)&&!Ui(r,n);){if(n===t)return!0;r.push(n),n=ir(n)}return!1}function _i(t,e){return zt(t,At)?t.name||e||Co:((t||{})[On]||{}).name||e||Co}function Oi(t,e,r,n){zt(t,At)||Vn("theClass is an invalid class definition.");var i=t[At];Du(i,e)||Vn("["+_i(t)+"] is not in class hierarchy of ["+_i(e)+"]");var a=null;zt(i,Er)?a=i[Er]:(a=Cu+_i(t,"_")+"$"+To,To++,i[Er]=a);var o=Oi[So],c=!!o[Ri];c&&n&&n[Ri]!==void 0&&(c=!!n[Ri]);var s=Tu(e),u=Eu(i,e,s,c);r(e,u);var l=!!Vr&&!!o[Io];l&&n&&(l=!!n[Io]),bu(i,a,e,s,l!==!1)}var On,At,Hn,jn,Fi,Er,Cu,ki,Br,So,Co,Iu,Ri,Io,zn,Vr,To,Au,W,Te=C(()=>{On="constructor",At="prototype",Hn="function",jn="_dynInstFuncs",Fi="_isDynProxy",Er="_dynClass",Cu="_dynCls$",ki="_dynInstChk",Br=ki,So="_dfOpts",Co="_unknown_",Iu="__proto__",Ri="useBaseInst",Io="setInstFuncs",zn=Object,Vr=zn.getPrototypeOf,To=0;Au={setInstFuncs:!0,useBaseInst:!0};Oi[So]=Au;W=Oi});var S,h,qr=C(()=>{(function(t){t[t.CRITICAL=1]="CRITICAL",t[t.WARNING=2]="WARNING"})(S||(S={}));h={BrowserDoesNotSupportLocalStorage:0,BrowserCannotReadLocalStorage:1,BrowserCannotReadSessionStorage:2,BrowserCannotWriteLocalStorage:3,BrowserCannotWriteSessionStorage:4,BrowserFailedRemovalFromLocalStorage:5,BrowserFailedRemovalFromSessionStorage:6,CannotSendEmptyTelemetry:7,ClientPerformanceMathError:8,ErrorParsingAISessionCookie:9,ErrorPVCalc:10,ExceptionWhileLoggingError:11,FailedAddingTelemetryToBuffer:12,FailedMonitorAjaxAbort:13,FailedMonitorAjaxDur:14,FailedMonitorAjaxOpen:15,FailedMonitorAjaxRSC:16,FailedMonitorAjaxSend:17,FailedMonitorAjaxGetCorrelationHeader:18,FailedToAddHandlerForOnBeforeUnload:19,FailedToSendQueuedTelemetry:20,FailedToReportDataLoss:21,FlushFailed:22,MessageLimitPerPVExceeded:23,MissingRequiredFieldSpecification:24,NavigationTimingNotSupported:25,OnError:26,SessionRenewalDateIsZero:27,SenderNotInitialized:28,StartTrackEventFailed:29,StopTrackEventFailed:30,StartTrackFailed:31,StopTrackFailed:32,TelemetrySampledAndNotSent:33,TrackEventFailed:34,TrackExceptionFailed:35,TrackMetricFailed:36,TrackPVFailed:37,TrackPVFailedCalc:38,TrackTraceFailed:39,TransmissionFailed:40,FailedToSetStorageBuffer:41,FailedToRestoreStorageBuffer:42,InvalidBackendResponse:43,FailedToFixDepricatedValues:44,InvalidDurationValue:45,TelemetryEnvelopeInvalid:46,CreateEnvelopeError:47,CannotSerializeObject:48,CannotSerializeObjectNonSerializable:49,CircularReferenceDetected:50,ClearAuthContextFailed:51,ExceptionTruncated:52,IllegalCharsInName:53,ItemNotInArray:54,MaxAjaxPerPVExceeded:55,MessageTruncated:56,NameTooLong:57,SampleRateOutOfRange:58,SetAuthContextFailed:59,SetAuthContextFailedAccountName:60,StringValueTooLong:61,StartCalledMoreThanOnce:62,StopCalledWithoutStart:63,TelemetryInitializerFailed:64,TrackArgumentsNotSpecified:65,UrlTooLong:66,SessionStorageBufferFull:67,CannotAccessCookie:68,IdTooLong:69,InvalidEvent:70,FailedMonitorAjaxSetRequestHeader:71,SendBrowserInfoOnUserInit:72,PluginException:73,NotificationException:74,SnippetScriptLoadFailure:99,InvalidInstrumentationKey:100,CannotParseAiBlobValue:101,InvalidContentBlob:102,TrackPageActionEventFailed:103}});function Hi(t){return Cr.toString.call(t)}function ji(t,e){return typeof t===e}function pe(t){return t===void 0||typeof t===Oe}function x(t){return t===null||pe(t)}function zi(t){return!x(t)}function wr(t,e){return t&&nr.call(t,e)}function st(t){return typeof t===Xe}function j(t){return typeof t===mt}function Bt(t,e,r,n){n===void 0&&(n=!1);var i=!1;if(!x(t))try{x(t[bo])?x(t[Po])||(t[Po](wo+e,r),i=!0):(t[bo](e,r,n),i=!0)}catch(a){}return i}function qn(t,e,r,n){if(n===void 0&&(n=!1),!x(t))try{x(t[Ao])?x(t[Do])||t[Do](wo+e,r):t[Ao](e,r,n)}catch(i){}}function Bi(t){var e=t,r=/([^\w\d_$])/g;return r.test(t)&&(e=t.replace(r,"_")),e}function Z(t,e){if(t)for(var r in t)nr.call(t,r)&&e.call(t,r,t[r])}function Vi(t,e){if(t&&e){var r=e.length,n=t.length;if(t===e)return!0;if(n>=r){for(var i=n-1,a=r-1;a>=0;a--){if(t[i]!=e[a])return!1;i--}return!0}}return!1}function Ee(t,e){return t&&e?t.indexOf(e)!==-1:!1}function Pr(t){return Hi(t)==="[object Date]"}function Re(t){return Hi(t)==="[object Array]"}function Vt(t){return Hi(t)==="[object Error]"}function _(t){return typeof t=="string"}function ar(t){return typeof t=="number"}function Gr(t){return typeof t=="boolean"}function Me(t){if(Pr(t)){var e=function(r){var n=String(r);return n.length===1&&(n="0"+n),n};return t.getUTCFullYear()+"-"+e(t.getUTCMonth()+1)+"-"+e(t.getUTCDate())+"T"+e(t.getUTCHours())+":"+e(t.getUTCMinutes())+":"+e(t.getUTCSeconds())+"."+String((t.getUTCMilliseconds()/1e3).toFixed(3)).slice(2,5)+"Z"}}function R(t,e,r){for(var n=t.length,i=0;i<n&&!(i in t&&e.call(r||t,t[i],i,t)===-1);i++);}function Nt(t,e,r){for(var n=t.length,i=r||0,a=Math.max(i>=0?i:n-Math.abs(i),0);a<n;a++)if(a in t&&t[a]===e)return a;return-1}function qt(t,e,r){for(var n=t.length,i=r||t,a=new Array(n),o=0;o<n;o++)o in t&&(a[o]=e.call(i,t[o],t));return a}function Kr(t,e,r){var n=t.length,i=0,a;if(arguments.length>=3)a=arguments[2];else{for(;i<n&&!(i in t);)i++;a=t[i++]}for(;i<n;)i in t&&(a=e(a,t[i],i,t)),i++;return a}function oe(t){return typeof t!="string"?t:t.replace(/^\s+|\s+$/g,"")}function Ze(t){var e=typeof t;e!==mt&&(e!==Xe||t===null)&&Tr("objKeys called on non-object");var r=[];for(var n in t)t&&nr.call(t,n)&&r.push(n);if(Nu)for(var i=qi.length,a=0;a<i;a++)t&&nr.call(t,qi[a])&&r.push(qi[a]);return r}function St(t,e,r,n){if(No)try{var i={enumerable:!0,configurable:!0};return r&&(i.get=r),n&&(i.set=n),No(t,e,i),!0}catch(a){}return!1}function de(){var t=Date;return t.now?t.now():new t().getTime()}function G(t){return Vt(t)?t.name:""}function K(t,e,r,n,i){var a=r;return t&&(a=t[e],a!==r&&(!i||i(a))&&(!n||n(r))&&(a=r,t[e]=a)),a}function ge(t,e,r){var n;return t?(n=t[e],!n&&x(n)&&(n=pe(r)?{}:r,t[e]=n)):n=pe(r)?{}:r,n}function Gn(t){return!t}function br(t){return!!t}function Ae(t){throw new Error(t)}function Wr(t,e,r){if(t&&e&&t!==e&&st(t)&&st(e)){var n=function(a){if(_(a)){var o=e[a];j(o)?(!r||r(a,!0,e,t))&&(t[a]=function(c){return function(){var s=arguments;return e[c].apply(e,s)}}(a)):(!r||r(a,!1,e,t))&&(wr(t,a)&&delete t[a],St(t,a,function(){return e[a]},function(c){e[a]=c})||(t[a]=o))}};for(var i in e)n(i)}return t}function Gi(t){return function(){function e(){var r=this;t&&Z(t,function(n,i){r[n]=i})}return e}()}function Kn(t){return t&&(t=gt(Ir?Ir({},t):t)),t}var wo,Po,bo,Do,Ao,No,uf,lf,Nu,qi,Le=C(()=>{ne();wo="on",Po="attachEvent",bo="addEventListener",Do="detachEvent",Ao="removeEventListener",No=Un,uf=gt.freeze,lf=gt.seal;Nu=!{toString:null}.propertyIsEnumerable("toString"),qi=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"]});function we(t){var e=ot();return e&&e[t]?e[t]:t===Fo&&or()?window:null}function or(){return Boolean(typeof window===Xe&&window)}function Ct(){return or()?window:we(Fo)}function Wn(){return Boolean(typeof document===Xe&&document)}function Ne(){return Wn()?document:we(Fu)}function Ro(){return Boolean(typeof navigator===Xe&&navigator)}function Ue(){return Ro()?navigator:we(ku)}function Mo(){return Boolean(typeof history===Xe&&history)}function Qi(){return Mo()?history:we(Ru)}function et(t){if(t&&ju){var e=we("__mockLocation");if(e)return e}return typeof location===Xe&&location?location:we(Mu)}function $i(){return typeof console!==Oe?console:we(Lu)}function Qe(){return we(Uu)}function vt(){return Boolean(typeof JSON===Xe&&JSON||we(ko)!==null)}function Pe(){return vt()?JSON||we(ko):null}function Yi(){return we(_u)}function Zi(){return we(Ou)}function ea(){var t=Ue();return t&&t.product?t.product===Hu:!1}function Gt(){var t=Ue();if(t&&(t.userAgent!==Xi||Ji===null)){Xi=t.userAgent;var e=(Xi||"").toLowerCase();Ji=Ee(e,Ki)||Ee(e,Wi)}return Ji}function sr(t){if(t===void 0&&(t=null),!t){var e=Ue()||{};t=e?(e.userAgent||"").toLowerCase():""}var r=(t||"").toLowerCase();if(Ee(r,Ki))return parseInt(r.split(Ki)[1]);if(Ee(r,Wi)){var n=parseInt(r.split(Wi)[1]);if(n)return n+4}return null}function O(t){var e=Object[Ie].toString.call(t),r="";return e==="[object Error]"?r="{ stack: '"+t.stack+"', message: '"+t.message+"', name: '"+t.name+"'":vt()&&(r=Pe().stringify(t)),e+r}var Fo,Fu,ku,Ru,Mu,Lu,Uu,ko,_u,Ou,Hu,Ki,Wi,Ji,Xi,ju,Dr=C(()=>{ne();Le();"use strict";Fo="window",Fu="document",ku="navigator",Ru="history",Mu="location",Lu="console",Uu="performance",ko="JSON",_u="crypto",Ou="msCrypto",Hu="ReactNative",Ki="msie",Wi="trident/",Ji=null,Xi=null,ju=!1});function Lo(t){return t?'"'+t.replace(/\"/g,"")+'"':""}function kt(t,e){return(t||{}).logger||new Jn(e)}var zu,Bu,Vu,Ft,Jn,Xn=C(()=>{qr();Dr();Te();Le();"use strict";zu="AI (Internal): ",Bu="AI: ",Vu="AITR_";Ft=function(){function t(e,r,n,i){n===void 0&&(n=!1);var a=this;a.messageId=e,a.message=(n?Bu:zu)+e;var o="";vt()&&(o=Pe().stringify(i));var c=(r?" message:"+Lo(r):"")+(i?" props:"+Lo(o):"");a.message+=c}return t.dataType="MessageData",t}();Jn=function(){function t(e){this.identifier="DiagnosticLogger",this.queue=[];var r=0,n={};W(t,this,function(i){x(e)&&(e={}),i.consoleLoggingLevel=function(){return a("loggingLevelConsole",0)},i.telemetryLoggingLevel=function(){return a("loggingLevelTelemetry",1)},i.maxInternalMessageLimit=function(){return a("maxMessageLimit",25)},i.enableDebugExceptions=function(){return a("enableDebugExceptions",!1)},i.throwInternal=function(c,s,u,l,f){f===void 0&&(f=!1);var m=new Ft(s,u,f,l);if(i.enableDebugExceptions())throw m;if(!pe(m.message)){var I=i.consoleLoggingLevel();if(f){var E=+m.messageId;!n[E]&&I>=S.WARNING&&(i.warnToConsole(m.message),n[E]=!0)}else I>=S.WARNING&&i.warnToConsole(m.message);i.logInternalMessage(c,m)}},i.warnToConsole=function(c){var s=$i();if(s){var u="log";s.warn&&(u="warn"),j(s[u])&&s[u](c)}},i.resetInternalMessageCount=function(){r=0,n={}},i.logInternalMessage=function(c,s){if(!o()){var u=!0,l=Vu+s.messageId;if(n[l]?u=!1:n[l]=!0,u&&(c<=i.telemetryLoggingLevel()&&(i.queue.push(s),r++),r===i.maxInternalMessageLimit())){var f="Internal events throttle limit per PageView reached for this app.",m=new Ft(h.MessageLimitPerPVExceeded,f,!1);i.queue.push(m),i.warnToConsole(f)}}};function a(c,s){var u=e[c];return x(u)?s:u}function o(){return r>=i.maxInternalMessageLimit()}})}return t}()});function ct(t,e,r,n,i){if(t){var a=t;if(j(a.getPerfMgr)&&(a=a.getPerfMgr()),a){var o=void 0,c=a.getCtx(ta);try{if(o=a.create(e(),n,i),o){if(c&&o.setCtx&&(o.setCtx(cr.ParentContextKey,c),c.getCtx&&c.setCtx)){var s=c.getCtx(cr.ChildrenContextKey);s||(s=[],c.setCtx(cr.ChildrenContextKey,s)),s.push(o)}return a.setCtx(ta,o),r(o)}}catch(u){o&&o.setCtx&&o.setCtx("exception",u)}finally{o&&a.fire(o),a.setCtx(ta,c)}}}return r()}var Ar,cr,Jr,ta,Xr=C(()=>{Te();Le();Ar="ctx",cr=function(){function t(e,r,n){var i=this,a=!1;if(i.start=de(),i.name=e,i.isAsync=n,i.isChildEvt=function(){return!1},j(r)){var o;a=St(i,"payload",function(){return!o&&j(r)&&(o=r(),r=null),o})}i.getCtx=function(c){return c?c===t.ParentContextKey||c===t.ChildrenContextKey?i[c]:(i[Ar]||{})[c]:null},i.setCtx=function(c,s){if(c)if(c===t.ParentContextKey)i[c]||(i.isChildEvt=function(){return!0}),i[c]=s;else if(c===t.ChildrenContextKey)i[c]=s;else{var u=i[Ar]=i[Ar]||{};u[c]=s}},i.complete=function(){var c=0,s=i.getCtx(t.ChildrenContextKey);if(Re(s))for(var u=0;u<s.length;u++){var l=s[u];l&&(c+=l.time)}i.time=de()-i.start,i.exTime=i.time-c,i.complete=function(){},!a&&j(r)&&(i.payload=r())}}return t.ParentContextKey="parent",t.ChildrenContextKey="childEvts",t}(),Jr=function(){function t(e){this.ctx={},W(t,this,function(r){r.create=function(n,i,a){return new cr(n,i,a)},r.fire=function(n){n&&(n.complete(),e&&e.perfEvent(n))},r.setCtx=function(n,i){if(n){var a=r[Ar]=r[Ar]||{};a[n]=i}},r.getCtx=function(n){return(r[Ar]||{})[n]}})}return t}(),ta="CoreUtils.doPerf"});var Uo,_o=C(()=>{Xr();qr();Le();"use strict";Uo=function(){function t(e,r){var n=this,i=null,a=j(e.processTelemetry),o=j(e.setNextPlugin);n._hasRun=!1,n.getPlugin=function(){return e},n.getNext=function(){return i},n.setNext=function(c){i=c},n.processTelemetry=function(c,s){s||(s=r);var u=e?e.identifier:"TelemetryPluginChain";ct(s?s.core():null,function(){return u+":processTelemetry"},function(){if(e&&a){n._hasRun=!0;try{s.setNext(i),o&&e.setNextPlugin(i),i&&(i._hasRun=!1),e.processTelemetry(c,s)}catch(f){var l=i&&i._hasRun;(!i||!l)&&s.diagLog().throwInternal(S.CRITICAL,h.PluginException,"Plugin ["+e.identifier+"] failed during processTelemetry - "+f),i&&!l&&i.processTelemetry(c,s)}}else i&&(n._hasRun=!0,i.processTelemetry(c,s))},function(){return{item:c}},!c.sync)}}return t}()});function ra(t,e){var r=[];if(t&&t.length>0)for(var n=null,i=0;i<t.length;i++){var a=t[i];if(a&&j(a.processTelemetry)){var o=new Uo(a,e);r.push(o),n&&n.setNext(o),n=o}}return r.length>0?r[0]:null}function qu(t,e,r){var n=[],i=!r;if(t)for(;t;){var a=t.getPlugin();(i||a===r)&&(i=!0,n.push(a)),t=t.getNext()}return i||n.push(r),ra(n,e)}function Gu(t,e,r){var n=t,i=!1;return r&&t&&(n=[],R(t,function(a){(i||a===r)&&(i=!0,n.push(a))})),r&&!i&&(n||(n=[]),n.push(r)),ra(n,e)}var Rt,Qn=C(()=>{Xn();_o();Le();"use strict";Rt=function(){function t(e,r,n,i){var a=this,o=null;i!==null&&(e&&j(e.getPlugin)?o=qu(e,a,i||e.getPlugin()):i?o=Gu(e,a,i):pe(i)&&(o=ra(e,a))),a.core=function(){return n},a.diagLog=function(){return kt(n,r)},a.getCfg=function(){return r},a.getExtCfg=function(c,s){s===void 0&&(s={});var u;if(r){var l=r.extensionConfig;l&&c&&(u=l[c])}return u||s},a.getConfig=function(c,s,u){u===void 0&&(u=!1);var l,f=a.getExtCfg(c,null);return f&&!x(f[s])?l=f[s]:r&&!x(r[s])&&(l=r[s]),x(l)?u:l},a.hasNext=function(){return o!=null},a.getNext=function(){return o},a.setNext=function(c){o=c},a.processNext=function(c){var s=o;s&&(o=s.getNext(),s.processTelemetry(c,a))},a.createNew=function(c,s){return c===void 0&&(c=null),new t(c||o,r,n,s)}}return t}()});var Oo,$n,na=C(()=>{Oo="iKey",$n="extensionConfig"});var Yn,tt,ia=C(()=>{Qn();Le();na();"use strict";Yn="getPlugin",tt=function(){function t(){var e=this,r=!1,n=null,i=null;e.core=null,e.diagLog=function(a){return e._getTelCtx(a).diagLog()},e.isInitialized=function(){return r},e.setInitialized=function(a){r=a},e.setNextPlugin=function(a){i=a},e.processNext=function(a,o){o?o.processNext(a):i&&j(i.processTelemetry)&&i.processTelemetry(a,null)},e._getTelCtx=function(a){a===void 0&&(a=null);var o=a;if(!o){var c=n||new Rt(null,{},e.core);i&&i[Yn]?o=c.createNew(null,i[Yn]):o=c.createNew(null,i)}return o},e._baseTelInit=function(a,o,c,s){a&&K(a,$n,[],null,x),!s&&o&&(s=o.getProcessTelContext().getNext());var u=i;i&&i[Yn]&&(u=i[Yn]()),e.core=o,n=new Rt(s,a,o,u),r=!0}}return t.prototype.initialize=function(e,r,n,i){this._baseTelInit(e,r,n,i)},t}()});function Qr(t,e){for(var r=[],n=null,i=t.getNext();i;){var a=i.getPlugin();a&&(n&&j(n[jo])&&j(a[aa])&&n[jo](a),(!j(a[zo])||!a[zo]())&&r.push(a),n=a,i=i.getNext())}R(r,function(o){o.initialize(t.getCfg(),t.core(),e,t.getNext())})}function oa(t){return t.sort(function(e,r){var n=0,i=j(r[aa]);return j(e[aa])?n=i?e[Ho]-r[Ho]:1:i&&(n=-1),n})}var aa,Ho,jo,zo,sa=C(()=>{Le();"use strict";aa="processTelemetry",Ho="priority",jo="setNextPlugin",zo="isInitialized"});var ca,Ku,Bo,Vo=C(()=>{ne();Te();ia();Qn();sa();Le();"use strict";ca=500,Ku="Channel has invalid priority",Bo=function(t){H(e,t);function e(){var r=t.call(this)||this;r.identifier="ChannelControllerPlugin",r.priority=ca;var n;W(e,r,function(c,s){c.setNextPlugin=function(u){},c.processTelemetry=function(u,l){n&&R(n,function(f){if(f.length>0){var m=r._getTelCtx(l).createNew(f);m.processNext(u)}})},c.getChannelControls=function(){return n},c.initialize=function(u,l,f){c.isInitialized()||(s.initialize(u,l,f),o((u||{}).channels,f),R(n,function(m){return Qr(new Rt(m,u,l),f)}))}});function i(c){R(c,function(s){s.priority<ca&&Ae(Ku+s.identifier)})}function a(c){c&&c.length>0&&(c=c.sort(function(s,u){return s.priority-u.priority}),i(c),n.push(c))}function o(c,s){if(n=[],c&&R(c,function(l){return a(l)}),s){var u=[];R(s,function(l){l.priority>ca&&u.push(l)}),a(u)}}return r}return e._staticInit=function(){var r=e.prototype;St(r,"ChannelControls",r.getChannelControls),St(r,"channelQueue",r.getChannelControls)}(),e}(tt)});function da(t,e){var r=lr[Kt]||ei[Kt];return r||(r=lr[Kt]=lr(t,e),ei[Kt]=r),r}function ti(t){return t?t.isEnabled():!0}function Wu(t){var e=t.cookieCfg=t.cookieCfg||{};if(K(e,"domain",t.cookieDomain,zi,x),K(e,"path",t.cookiePath||"/",null,x),x(e[fa])){var r=void 0;pe(t[Ko])||(r=!t[Ko]),pe(t[Wo])||(r=!t[Wo]),e[fa]=r}return e}function ur(t,e){var r;if(t)r=t.getCookieMgr();else if(e){var n=e.cookieCfg;n[Kt]?r=n[Kt]:r=lr(e)}return r||(r=da(e,(t||{}).logger)),r}function lr(t,e){var r=Wu(t||ei),n=r.path||"/",i=r.domain,a=r[fa]!==!1,o={isEnabled:function(){var c=a&&ma(e),s=ei[Kt];return c&&s&&o!==s&&(c=ti(s)),c},setEnabled:function(c){a=c!==!1},set:function(c,s,u,l,f){if(ti(o)){var m={},I=oe(s||ht),E=I.indexOf(";");if(E!==-1&&(I=oe(s.substring(0,E)),m=Qo(s.substring(E+1))),K(m,"domain",l||i,br,pe),!x(u)){var b=Gt();if(pe(m[la])){var p=de(),v=p+u*1e3;if(v>0){var y=new Date;y.setTime(v),K(m,la,$o(y,b?qo:Go)||$o(y,b?qo:Go)||ht,br)}}b||K(m,"max-age",ht+u,null,pe)}var w=et();w&&w.protocol==="https:"&&(K(m,"secure",null,null,pe),pa===null&&(pa=!ri((Ue()||{}).userAgent)),pa&&K(m,"SameSite","None",null,pe)),K(m,"path",f||n,null,pe);var L=r.setCookie||Zo;L(c,Yo(I,m))}},get:function(c){var s=ht;return ti(o)&&(s=(r.getCookie||Ju)(c)),s},del:function(c,s){ti(o)&&o.purge(c,s)},purge:function(c,s){if(ma(e)){var u=(f={},f.path=s||"/",f[la]="Thu, 01 Jan 1970 00:00:01 GMT",f);Gt()||(u["max-age"]="0");var l=r.delCookie||Zo;l(c,Yo(ht,u))}var f}};return o[Kt]=o,o}function ma(t){if(Zn===null){Zn=!1;try{var e=$r||{};Zn=e[ua]!==void 0}catch(r){t&&t.throwInternal(S.WARNING,h.CannotAccessCookie,"Cannot access document.cookie - "+G(r),{exception:O(r)})}}return Zn}function Qo(t){var e={};if(t&&t.length){var r=oe(t).split(";");R(r,function(n){if(n=oe(n||ht),n){var i=n.indexOf("=");i===-1?e[n]=null:e[oe(n.substring(0,i))]=oe(n.substring(i+1))}})}return e}function $o(t,e){return j(t[e])?t[e]():null}function Yo(t,e){var r=t||ht;return Z(e,function(n,i){r+="; "+n+(x(i)?ht:"="+i)}),r}function Ju(t){var e=ht;if($r){var r=$r[ua]||ht;Jo!==r&&(Xo=Qo(r),Jo=r),e=oe(Xo[t]||ht)}return e}function Zo(t,e){$r&&($r[ua]=t+"="+e)}function ri(t){return _(t)?!!(Ee(t,"CPU iPhone OS 12")||Ee(t,"iPad; CPU OS 12")||Ee(t,"Macintosh; Intel Mac OS X 10_14")&&Ee(t,"Version/")&&Ee(t,"Safari")||Ee(t,"Macintosh; Intel Mac OS X 10_14")&&Vi(t,"AppleWebKit/605.1.15 (KHTML, like Gecko)")||Ee(t,"Chrome/5")||Ee(t,"Chrome/6")||Ee(t,"UnrealEngine")&&!Ee(t,"Chrome")||Ee(t,"UCBrowser/12")||Ee(t,"UCBrowser/11")):!1}var qo,Go,ua,la,fa,Ko,Wo,Kt,ht,Zn,pa,Jo,$r,Xo,ei,ni=C(()=>{qr();Dr();Le();qo="toGMTString",Go="toUTCString",ua="cookie",la="expires",fa="enabled",Ko="isCookieUseDisabled",Wo="disableCookiesUsage",Kt="_ckMgr",ht="",Zn=null,pa=null,Jo=null,$r=Ne(),Xo={},ei={}});var Xu,es,Yr,ga=C(()=>{ne();Te();Vo();Qn();sa();Xr();ni();Le();na();"use strict";Xu="Extensions must provide callback to initialize",es="_notificationManager",Yr=function(){function t(){var e=!1,r,n,i,a,o;W(t,this,function(c){c._extensions=new Array,n=new Bo,c.logger=Dt({throwInternal:function(s,u,l,f,m){m===void 0&&(m=!1)},warnToConsole:function(s){},resetInternalMessageCount:function(){}}),r=[],c.isInitialized=function(){return e},c.initialize=function(s,u,l,f){c.isInitialized()&&Ae("Core should not be initialized more than once"),(!s||x(s.instrumentationKey))&&Ae("Please provide instrumentation key"),i=f,c[es]=f,c.config=s||{},s.extensions=x(s.extensions)?[]:s.extensions;var m=ge(s,$n);m.NotificationManager=f,l&&(c.logger=l);var I=[];I.push.apply(I,u.concat(s.extensions)),I=oa(I);var E=[],b=[],p={};R(I,function(v){(x(v)||x(v.initialize))&&Ae(Xu);var y=v.priority,w=v.identifier;v&&y&&(x(p[y])?p[y]=w:l.warnToConsole("Two extensions have same priority #"+y+" - "+p[y]+", "+w)),!y||y<n.priority?E.push(v):b.push(v)}),I.push(n),E.push(n),I=oa(I),c._extensions=I,Qr(new Rt([n],s,c),I),Qr(new Rt(E,s,c),I),c._extensions=E,c.getTransmissionControls().length===0&&Ae("No channels available"),e=!0,c.releaseQueue()},c.getTransmissionControls=function(){return n.getChannelControls()},c.track=function(s){K(s,Oo,c.config.instrumentationKey,null,Gn),K(s,"time",Me(new Date),null,Gn),K(s,"ver","4.0",null,x),c.isInitialized()?c.getProcessTelContext().processNext(s):r.push(s)},c.getProcessTelContext=function(){var s=c._extensions,u=s;return(!s||s.length===0)&&(u=[n]),new Rt(u,c.config,c)},c.getNotifyMgr=function(){return i||(i=Dt({addNotificationListener:function(s){},removeNotificationListener:function(s){},eventsSent:function(s){},eventsDiscarded:function(s,u){},eventsSendRequest:function(s,u){}}),c[es]=i),i},c.getCookieMgr=function(){return o||(o=lr(c.config,c.logger)),o},c.setCookieMgr=function(s){o=s},c.getPerfMgr=function(){return a||c.config&&c.config.enablePerfMgr&&(a=new Jr(c.getNotifyMgr())),a},c.setPerfMgr=function(s){a=s},c.eventCnt=function(){return r.length},c.releaseQueue=function(){r.length>0&&(R(r,function(s){c.getProcessTelContext().processNext(s)}),r=[])}})}return t}()});var Zr,va=C(()=>{Te();Le();Zr=function(){function t(e){this.listeners=[];var r=!!(e||{}).perfEvtsSendAll;W(t,this,function(n){n.addNotificationListener=function(i){n.listeners.push(i)},n.removeNotificationListener=function(i){for(var a=Nt(n.listeners,i);a>-1;)n.listeners.splice(a,1),a=Nt(n.listeners,i)},n.eventsSent=function(i){R(n.listeners,function(a){a&&a.eventsSent&&setTimeout(function(){return a.eventsSent(i)},0)})},n.eventsDiscarded=function(i,a){R(n.listeners,function(o){o&&o.eventsDiscarded&&setTimeout(function(){return o.eventsDiscarded(i,a)},0)})},n.eventsSendRequest=function(i,a){R(n.listeners,function(o){if(o&&o.eventsSendRequest)if(a)setTimeout(function(){return o.eventsSendRequest(i,a)},0);else try{o.eventsSendRequest(i,a)}catch(c){}})},n.perfEvent=function(i){i&&(r||!i.isChildEvt())&&R(n.listeners,function(a){if(a&&a.perfEvent)if(i.isAsync)setTimeout(function(){return a.perfEvent(i)},0);else try{a.perfEvent(i)}catch(o){}})}})}return t}()});var en,ts=C(()=>{ne();ga();ho();va();Xr();Xn();Te();Le();en=function(t){H(e,t);function e(){var r=t.call(this)||this;return W(e,r,function(n,i){n.initialize=function(c,s,u,l){i.initialize(c,s,u||new Jn(c),l||new Zr(c))},n.track=function(c){ct(n.getPerfMgr(),function(){return"AppInsightsCore:track"},function(){c===null&&(o(c),Ae("Invalid telemetry item")),a(c),i.track(c)},function(){return{item:c}},!c.sync)},n.addNotificationListener=function(c){var s=n.getNotifyMgr();s&&s.addNotificationListener(c)},n.removeNotificationListener=function(c){var s=n.getNotifyMgr();s&&s.removeNotificationListener(c)},n.pollInternalLogs=function(c){var s=n.config.diagnosticLogInterval;return(!s||!(s>0))&&(s=1e4),setInterval(function(){var u=n.logger?n.logger.queue:[];R(u,function(l){var f={name:c||"InternalMessageId: "+l.messageId,iKey:n.config.instrumentationKey,time:Me(new Date),baseType:Ft.dataType,baseData:{message:l.message}};n.track(f)}),u.length=0},s)};function a(c){if(x(c.name))throw o(c),Error("telemetry name required")}function o(c){var s=n.getNotifyMgr();s&&s.eventsDiscarded([c],vo.InvalidEvent)}}),r}return e}(Yr)});function is(t){t<0&&(t>>>=0),tn=123456789+t&Wt,rn=987654321-t&Wt,ns=!0}function as(){try{var t=de()&2147483647;is((Math.random()*rs^t)+t)}catch(e){}}function ii(t){return t>0?Math.floor(It()/Wt*(t+1))>>>0:0}function It(t){var e,r=Yi()||Zi();return r&&r.getRandomValues?e=r.getRandomValues(new Uint32Array(1))[0]&Wt:Gt()?(ns||as(),e=ai()&Wt):e=Math.floor(rs*Math.random()|0),t||(e>>>=0),e}function ha(t){t?is(t):as()}function ai(t){rn=36969*(rn&65535)+(rn>>16)&Wt,tn=18e3*(tn&65535)+(tn>>16)&Wt;var e=(rn<<16)+(tn&65535)>>>0&Wt|0;return t||(e>>>=0),e}var rs,Wt,ns,tn,rn,xa=C(()=>{Dr();Le();rs=4294967296,Wt=4294967295,ns=!1,tn=123456789,rn=987654321});function Mt(t,e){var r=!1,n=Ct();n&&(r=Bt(n,t,e),r=Bt(n.body,t,e)||r);var i=Ne();return i&&(r=Xt.Attach(i,t,e)||r),r}function os(){function t(){return ii(15)}return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(Qu,function(e){var r=t()|0,n=e==="x"?r:r&3|8;return n.toString(16)})}function ss(){var t=Qe();return t&&t.now?t.now():de()}function Jt(t){t===void 0&&(t=22);for(var e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",r=It()>>>0,n=0,i="";i.length<t;)n++,i+=e.charAt(r&63),r>>>=6,n===5&&(r=(It()<<2&4294967295|r&3)>>>0,n=0);return i}function He(){for(var t=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"],e="",r,n=0;n<4;n++)r=It(),e+=t[r&15]+t[r>>4&15]+t[r>>8&15]+t[r>>12&15]+t[r>>16&15]+t[r>>20&15]+t[r>>24&15]+t[r>>28&15];var i=t[8+(It()&3)|0];return e.substr(0,8)+e.substr(9,4)+"4"+e.substr(13,3)+i+e.substr(16,3)+e.substr(19,12)}function Qt(t,e){var r=da(t,e),n=on._canUseCookies;return nn===null&&(nn=[],an=n,St(on,"_canUseCookies",function(){return an},function(i){an=i,R(nn,function(a){a.setEnabled(i)})})),Nt(nn,r)===-1&&nn.push(r),Gr(n)&&r.setEnabled(n),Gr(an)&&r.setEnabled(an),r}function oi(){Qt().setEnabled(!1)}function ya(t){return Qt(null,t).isEnabled()}function Sa(t,e){return Qt(null,t).get(e)}function Ca(t,e,r,n){Qt(null,t).set(e,r,null,n)}function Ia(t,e){return Qt(null,t).del(e)}var nn,an,on,Qu,Xt,cs=C(()=>{ne();ni();Dr();Le();xa();"use strict";nn=null;on={_canUseCookies:void 0,isTypeof:ji,isUndefined:pe,isNullOrUndefined:x,hasOwnProperty:wr,isFunction:j,isObject:st,isDate:Pr,isArray:Re,isError:Vt,isString:_,isNumber:ar,isBoolean:Gr,toISOString:Me,arrForEach:R,arrIndexOf:Nt,arrMap:qt,arrReduce:Kr,strTrim:oe,objCreate:Dt,objKeys:Ze,objDefineAccessors:St,addEventHandler:Mt,dateNow:de,isIE:Gt,disableCookies:oi,newGuid:os,perfNow:ss,newId:Jt,randomValue:ii,random32:It,mwcRandomSeed:ha,mwcRandom32:ai,generateW3CId:He},Qu=/[xy]/g,Xt={Attach:Bt,AttachEvent:Bt,Detach:qn,DetachEvent:qn}});function Ta(t,e){if(t)for(var r=0;r<t.length&&!e(t[r],r);r++);}function Ea(t,e,r,n,i){i>=0&&i<=2&&Ta(t,function(a,o){var c=a.cbks,s=c[ls[i]];if(s){e.ctx=function(){var f=n[o]=n[o]||{};return f};try{s.apply(e.inst,r)}catch(f){var u=e.err;try{var l=c[ls[2]];l&&(e.err=f,l.apply(e.inst,r))}catch(m){}finally{e.err=u}}}})}function Zu(t){return function(){var e=this,r=arguments,n=t.h,i={name:t.n,inst:e,ctx:null,set:s},a=[],o=c([i],r);function c(l,f){return Ta(f,function(m){l.push(m)}),l}function s(l,f){r=c([],r),r[l]=f,o=c([i],r)}Ea(n,i,o,a,0);var u=t.f;try{i.rslt=u.apply(e,r)}catch(l){throw i.err=l,Ea(n,i,o,a,3),l}return Ea(n,i,o,a,1),i.rslt}}function el(t){if(t){if(fs)return fs(t);var e=t[$u]||t[Ie]||t[Yu];if(e)return e}return null}function ps(t,e,r){var n=null;return t&&(wr(t,e)?n=t:r&&(n=ps(el(t),e,!1))),n}function wa(t,e,r){return t?sn(t[Ie],e,r,!1):null}function sn(t,e,r,n){if(n===void 0&&(n=!0),t&&e&&r){var i=ps(t,e,n);if(i){var a=i[e];if(typeof a===mt){var o=a[us];if(!o){o={i:0,n:e,f:a,h:[]};var c=Zu(o);c[us]=o,i[e]=c}var s={id:o.i,cbks:r,rm:function(){var u=this.id;Ta(o.h,function(l,f){if(l.id===u)return o.h.splice(f,1),1})}};return o.i++,o.h.push(s),s}}}return null}var us,ls,$u,Yu,fs,ds=C(()=>{ne();Le();us="_aiHooks",ls=["req","rsp","hkErr","fnErr"],$u="__proto__",Yu="constructor";fs=Object.getPrototypeOf});var J=C(()=>{ts();ga();ia();xa();cs();Le();Dr();ne();va();Xr();Xn();qr();ds();ni()});var te,Pa=C(()=>{te={requestContextHeader:"Request-Context",requestContextTargetKey:"appId",requestContextAppIdFormat:"appId=cid-v1:",requestIdHeader:"Request-Id",traceParentHeader:"traceparent",traceStateHeader:"tracestate",sdkContextHeader:"Sdk-Context",sdkContextHeaderAppIdRequest:"appId",requestContextHeaderLowerCase:"request-context"}});function si(t,e,r){var n=e.length,i=ba(t,e);if(i.length!==n){for(var a=0,o=i;r[o]!==void 0;)a++,o=i.substring(0,150-3)+Da(a);i=o}return i}function ba(t,e){var r;return e&&(e=oe(e.toString()),e.length>150&&(r=e.substring(0,150),t.throwInternal(S.WARNING,h.NameTooLong,"name is too long.  It has been truncated to "+150+" characters.",{name:e},!0))),r||e}function ae(t,e,r){r===void 0&&(r=1024);var n;return e&&(r=r||1024,e=oe(e),e.toString().length>r&&(n=e.toString().substring(0,r),t.throwInternal(S.WARNING,h.StringValueTooLong,"string value is too long. It has been truncated to "+r+" characters.",{value:e},!0))),n||e}function Tt(t,e){return li(t,e,2048,h.UrlTooLong)}function Nr(t,e){var r;return e&&e.length>32768&&(r=e.substring(0,32768),t.throwInternal(S.WARNING,h.MessageTruncated,"message is too long, it has been truncated to "+32768+" characters.",{message:e},!0)),r||e}function ci(t,e){var r;if(e){var n=""+e;n.length>32768&&(r=n.substring(0,32768),t.throwInternal(S.WARNING,h.ExceptionTruncated,"exception is too long, it has been truncated to "+32768+" characters.",{exception:e},!0))}return r||e}function je(t,e){if(e){var r={};Z(e,function(n,i){if(st(i)&&vt())try{i=Pe().stringify(i)}catch(a){t.throwInternal(S.WARNING,h.CannotSerializeObjectNonSerializable,"custom property is not valid",{exception:a},!0)}i=ae(t,i,8192),n=si(t,n,r),r[n]=i}),e=r}return e}function ze(t,e){if(e){var r={};Z(e,function(n,i){n=si(t,n,r),r[n]=i}),e=r}return e}function ui(t,e){return e&&li(t,e,128,h.IdTooLong).toString()}function li(t,e,r,n){var i;return e&&(e=oe(e),e.length>r&&(i=e.substring(0,r),t.throwInternal(S.WARNING,n,"input is too long, it has been truncated to "+r+" characters.",{data:e},!0))),i||e}function Da(t){var e="00"+t;return e.substr(e.length-3)}var Aa,ut=C(()=>{J();Aa={MAX_NAME_LENGTH:150,MAX_ID_LENGTH:128,MAX_PROPERTY_LENGTH:8192,MAX_STRING_LENGTH:1024,MAX_URL_LENGTH:2048,MAX_MESSAGE_LENGTH:32768,MAX_EXCEPTION_LENGTH:32768,sanitizeKeyAndAddUniqueness:si,sanitizeKey:ba,sanitizeString:ae,sanitizeUrl:Tt,sanitizeMessage:Nr,sanitizeException:ci,sanitizeProperties:je,sanitizeMeasurements:ze,sanitizeId:ui,sanitizeInput:li,padNumber:Da,trim:oe}});function Lt(t){var e=null;if(j(Event))e=new Event(t);else{var r=Ne();r&&r.createEvent&&(e=r.createEvent("Event"),e.initEvent(t,!0,!0))}return e}var Na=C(()=>{J()});function ee(t,e){return e===void 0&&(e=!1),t==null?e:t.toString().toLowerCase()==="true"}function Ke(t){(isNaN(t)||t<0)&&(t=0),t=Math.round(t);var e=""+t%1e3,r=""+Math.floor(t/1e3)%60,n=""+Math.floor(t/(1e3*60))%60,i=""+Math.floor(t/(1e3*60*60))%24,a=Math.floor(t/(1e3*60*60*24));return e=e.length===1?"00"+e:e.length===2?"0"+e:e,r=r.length<2?"0"+r:r,n=n.length<2?"0"+n:n,i=i.length<2?"0"+i:i,(a>0?a+".":"")+i+":"+n+":"+r+"."+e}function Fr(){var t=Ue();return"sendBeacon"in t&&t.sendBeacon}function cn(t,e){var r=null;return R(t,function(n){if(n.identifier===e)return r=n,-1}),r}function un(t,e,r,n,i){return!i&&_(t)&&(t==="Script error."||t==="Script error")}var ln=C(()=>{J()});var Et,fr,Ut,kr,fn,le,lt=C(()=>{Et="Microsoft_ApplicationInsights_BypassAjaxInstrumentation",fr="sampleRate",Ut="ProcessLegacy",kr="http.method",fn="https://dc.services.visualstudio.com",le="not_specified"});var $t,We,Fa=C(()=>{(function(t){t[t.LocalStorage=0]="LocalStorage",t[t.SessionStorage=1]="SessionStorage"})($t||($t={}));(function(t){t[t.AI=0]="AI",t[t.AI_AND_W3C=1]="AI_AND_W3C",t[t.W3C=2]="W3C"})(We||(We={}))});function ka(){return Rr()?fi($t.LocalStorage):null}function fi(t){try{if(x(ot()))return null;var e=new Date,r=we(t===$t.LocalStorage?"localStorage":"sessionStorage");r.setItem(e.toString(),e.toString());var n=r.getItem(e.toString())!==e.toString();if(r.removeItem(e.toString()),!n)return r}catch(i){}return null}function Ra(){return wt()?fi($t.SessionStorage):null}function pn(){pr=!1,dr=!1}function Rr(){return pr===void 0&&(pr=!!fi($t.LocalStorage)),pr}function dn(t,e){var r=ka();if(r!==null)try{return r.getItem(e)}catch(n){pr=!1,t.throwInternal(S.WARNING,h.BrowserCannotReadLocalStorage,"Browser failed read of local storage. "+G(n),{exception:O(n)})}return null}function mn(t,e,r){var n=ka();if(n!==null)try{return n.setItem(e,r),!0}catch(i){pr=!1,t.throwInternal(S.WARNING,h.BrowserCannotWriteLocalStorage,"Browser failed write to local storage. "+G(i),{exception:O(i)})}return!1}function gn(t,e){var r=ka();if(r!==null)try{return r.removeItem(e),!0}catch(n){pr=!1,t.throwInternal(S.WARNING,h.BrowserFailedRemovalFromLocalStorage,"Browser failed removal of local storage item. "+G(n),{exception:O(n)})}return!1}function wt(){return dr===void 0&&(dr=!!fi($t.SessionStorage)),dr}function Ma(){var t=[];return wt()&&Z(we("sessionStorage"),function(e){t.push(e)}),t}function Yt(t,e){var r=Ra();if(r!==null)try{return r.getItem(e)}catch(n){dr=!1,t.throwInternal(S.WARNING,h.BrowserCannotReadSessionStorage,"Browser failed read of session storage. "+G(n),{exception:O(n)})}return null}function Zt(t,e,r){var n=Ra();if(n!==null)try{return n.setItem(e,r),!0}catch(i){dr=!1,t.throwInternal(S.WARNING,h.BrowserCannotWriteSessionStorage,"Browser failed write to session storage. "+G(i),{exception:O(i)})}return!1}function vn(t,e){var r=Ra();if(r!==null)try{return r.removeItem(e),!0}catch(n){dr=!1,t.throwInternal(S.WARNING,h.BrowserFailedRemovalFromSessionStorage,"Browser failed removal of session storage item. "+G(n),{exception:O(n)})}return!1}var pr,dr,La=C(()=>{J();Fa();pr=void 0,dr=void 0});function mr(t){var e=gs,r=tl,n=r[e];return ms.createElement?r[e]||(n=r[e]=ms.createElement("a")):n={host:pi(t,!0)},n.href=t,e++,e>=r.length&&(e=0),gs=e,n}function hn(t){var e,r=mr(t);return r&&(e=r.href),e}function Ua(t){var e,r=mr(t);return r&&(e=r.pathname),e}function xn(t,e){return t?t.toUpperCase()+" "+e:e}function pi(t,e){var r=yn(t,e)||"";if(r){var n=r.match(/(www[0-9]?\.)?(.[^/:]+)(\:[\d]+)?/i);if(n!=null&&n.length>3&&_(n[2])&&n[2].length>0)return n[2]+(n[3]||"")}return r}function yn(t,e){var r=null;if(t){var n=t.match(/(\w*):\/\/(.[^/:]+)(\:[\d]+)?/i);if(n!=null&&n.length>2&&_(n[2])&&n[2].length>0&&(r=n[2]||"",e&&n.length>2)){var i=(n[1]||"").toLowerCase(),a=n[3]||"";(i==="http"&&a===":80"||i==="https"&&a===":443")&&(a=""),r+=a}}return r}var ms,gs,tl,_a=C(()=>{J();ms=Ne()||{},gs=0,tl=[null,null,null,null,null]});function Mr(t){return rl.indexOf(t.toLowerCase())!==-1}function vs(t,e,r,n){var i,a=n,o=n;if(e&&e.length>0){var c=mr(e);if(i=c.host,!a)if(c.pathname!=null){var s=c.pathname.length===0?"/":c.pathname;s.charAt(0)!=="/"&&(s="/"+s),o=c.pathname,a=ae(t,r?r+" "+s:s)}else a=ae(t,e)}else i=n,a=n;return{target:i,name:a,data:o}}function gr(){var t=Qe();if(t&&t.now&&t.timing){var e=t.now()+t.timing.navigationStart;if(e>0)return e}return de()}function ve(t,e){var r=null;return t!==0&&e!==0&&!x(t)&&!x(e)&&(r=e-t),r}var rl,Sn,Oa,Pt,Ha,ja=C(()=>{J();Pa();ut();Na();ln();lt();La();_a();rl=["https://dc.services.visualstudio.com/v2/track","https://breeze.aimon.applicationinsights.io/v2/track","https://dc-int.services.visualstudio.com/v2/track"];Sn={NotSpecified:le,createDomEvent:Lt,disableStorage:pn,isInternalApplicationInsightsEndpoint:Mr,canUseLocalStorage:Rr,getStorage:dn,setStorage:mn,removeStorage:gn,canUseSessionStorage:wt,getSessionStorageKeys:Ma,getSessionStorage:Yt,setSessionStorage:Zt,removeSessionStorage:vn,disableCookies:oi,canUseCookies:ya,disallowsSameSiteNone:ri,setCookie:Ca,stringToBoolOrDefault:ee,getCookie:Sa,deleteCookie:Ia,trim:oe,newId:Jt,random32:function(){return It(!0)},generateW3CId:He,isArray:Re,isError:Vt,isDate:Pr,toISOStringForIE8:Me,getIEVersion:sr,msToTimeSpan:Ke,isCrossOriginError:un,dump:O,getExceptionName:G,addEventHandler:Bt,IsBeaconApiSupported:Fr,getExtension:cn},Oa={parseUrl:mr,getAbsoluteUrl:hn,getPathName:Ua,getCompleteUrl:xn,parseHost:pi,parseFullHost:yn},Pt={correlationIdPrefix:"cid-v1:",canIncludeCorrelationHeader:function(t,e,r){if(!e||t&&t.disableCorrelationHeaders)return!1;if(t&&t.correlationHeaderExcludePatterns){for(var n=0;n<t.correlationHeaderExcludePatterns.length;n++)if(t.correlationHeaderExcludePatterns[n].test(e))return!1}var i=mr(e).host.toLowerCase();if(i&&(i.indexOf(":443")!==-1||i.indexOf(":80")!==-1)&&(i=(yn(e,!0)||"").toLowerCase()),(!t||!t.enableCorsCorrelation)&&i&&i!==r)return!1;var a=t&&t.correlationHeaderDomains;if(a){var o;if(R(a,function(u){var l=new RegExp(u.toLowerCase().replace(/\\/g,"\\\\").replace(/\./g,"\\.").replace(/\*/g,".*"));o=o||l.test(i)}),!o)return!1}var c=t&&t.correlationHeaderExcludedDomains;if(!c||c.length===0)return!0;for(var n=0;n<c.length;n++){var s=new RegExp(c[n].toLowerCase().replace(/\\/g,"\\\\").replace(/\./g,"\\.").replace(/\*/g,".*"));if(s.test(i))return!1}return i&&i.length>0},getCorrelationContext:function(t){if(t){var e=Pt.getCorrelationContextValue(t,te.requestContextTargetKey);if(e&&e!==Pt.correlationIdPrefix)return e}},getCorrelationContextValue:function(t,e){if(t)for(var r=t.split(","),n=0;n<r.length;++n){var i=r[n].split("=");if(i.length===2&&i[0]===e)return i[1]}}};Ha={Now:gr,GetDuration:ve}});function di(t){if(!t)return{};var e=t.split(nl),r=Kr(e,function(i,a){var o=a.split(il);if(o.length===2){var c=o[0].toLowerCase(),s=o[1];i[c]=s}return i},{});if(Ze(r).length>0){if(r.endpointsuffix){var n=r.location?r.location+".":"";r.ingestionendpoint=r.ingestionendpoint||"https://"+n+"dc."+r.endpointsuffix}r.ingestionendpoint=r.ingestionendpoint||fn}return r}var nl,il,za,hs=C(()=>{lt();J();nl=";",il="=";za={parse:di}});var Cn,Ba=C(()=>{Cn=function(){function t(){}return t}()});var In,Va=C(()=>{ne();Ba();In=function(t){H(e,t);function e(){return t.call(this)||this}return e}(Cn)});var xs,ys=C(()=>{xs=function(){function t(){this.ver=1,this.sampleRate=100,this.tags={}}return t}()});var Tn,Ss=C(()=>{ne();ys();ut();J();lt();Tn=function(t){H(e,t);function e(r,n,i){var a=t.call(this)||this;return a.name=ae(r,i)||le,a.data=n,a.time=Me(new Date),a.aiDataContract={time:1,iKey:1,name:1,sampleRate:function(){return a.sampleRate===100?4:1},tags:1,data:1},a}return e}(xs)});var mi,qa=C(()=>{mi=function(){function t(){this.ver=2,this.properties={},this.measurements={}}return t}()});var Be,Cs=C(()=>{ne();qa();ut();lt();Be=function(t){H(e,t);function e(r,n,i,a){var o=t.call(this)||this;return o.aiDataContract={ver:1,name:1,properties:0,measurements:0},o.name=ae(r,n)||le,o.properties=je(r,i),o.measurements=ze(r,a),o}return e.envelopeType="Microsoft.ApplicationInsights.{0}.Event",e.dataType="EventData",e}(mi)});var Is,Ts=C(()=>{Is=function(){function t(){}return t}()});var Es,ws=C(()=>{Es=function(){function t(){this.ver=2,this.exceptions=[],this.properties={},this.measurements={}}return t}()});var Ps,bs=C(()=>{Ps=function(){function t(){this.hasFullStack=!0,this.parsedStack=[]}return t}()});function Wa(t,e){var r=t;return r&&!_(r)&&(JSON&&JSON.stringify?(r=JSON.stringify(t),e&&(!r||r==="{}")&&(j(t.toString)?r=t.toString():r=""+t)):r=""+t+" - (Missing JSON.stringify)"),r||""}function Ns(t,e){var r=t;return t&&(r=t[Ka]||t[As]||"",r&&!_(r)&&(r=Wa(r,!0)),t.filename&&(r=r+" @"+(t.filename||"")+":"+(t.lineno||"?")+":"+(t.colno||"?"))),e&&e!=="String"&&e!=="Object"&&e!=="Error"&&(r||"").indexOf(e)===-1&&(r=e+": "+r),r||""}function ol(t){return st(t)?"hasFullStack"in t&&"typeName"in t:!1}function sl(t){return st(t)?"ver"in t&&"exceptions"in t&&"properties"in t:!1}function Fs(t){return t&&t.src&&_(t.src)&&t.obj&&Re(t.obj)}function Ur(t){var e=t||"";_(e)||(_(e[ft])?e=e[ft]:e=""+e);var r=e.split(`
`);return{src:e,obj:r}}function cl(t){for(var e=[],r=t.split(`
`),n=0;n<r.length;n++){var i=r[n];r[n+1]&&(i+="@"+r[n+1],n++),e.push(i)}return{src:t,obj:e}}function ks(t){var e=null;if(t)try{if(t[ft])e=Ur(t[ft]);else if(t[Lr]&&t[Lr][ft])e=Ur(t[Lr][ft]);else if(t.exception&&t.exception[ft])e=Ur(t.exception[ft]);else if(Fs(t))e=t;else if(Fs(t[Ga]))e=t[Ga];else if(window.opera&&t[Ka])e=cl(t.message);else if(_(t))e=Ur(t);else{var r=t[Ka]||t[As]||"";_(t[Ds])&&(r&&(r+=`
`),r+=" from "+t[Ds]),r&&(e=Ur(r))}}catch(n){e=Ur(n)}return e||{src:"",obj:null}}function ul(t){var e="";return t&&(t.obj?R(t.obj,function(r){e+=r+`
`}):e=t.src||""),e}function ll(t){var e,r=t.obj;if(r&&r.length>0){e=[];var n=0,i=0;R(r,function(E){var b=E.toString();if(Xa.regex.test(b)){var p=new Xa(b,n++);i+=p.sizeInBytes,e.push(p)}});var a=32*1024;if(i>a)for(var o=0,c=e.length-1,s=0,u=o,l=c;o<c;){var f=e[o].sizeInBytes,m=e[c].sizeInBytes;if(s+=f+m,s>a){var I=l-u+1;e.splice(u,I);break}u=o,l=c,o++,c--}}return e}function gi(t){var e="";if(t&&(e=t.typeName||t.name||"",!e))try{var r=/function (.{1,200})\(/,n=r.exec(t.constructor.toString());e=n&&n.length>1?n[1]:""}catch(i){}return e}function Ja(t){if(t)try{if(!_(t)){var e=gi(t),r=Wa(t,!1);return(!r||r==="{}")&&(t[Lr]&&(t=t[Lr],e=gi(t)),r=Wa(t,!0)),r.indexOf(e)!==0&&e!=="String"?e+":"+r:r}}catch(n){}return""+(t||"")}var al,Lr,ft,Ga,Ds,Ka,As,he,Rs,Xa,Ms=C(()=>{ne();Ts();ws();bs();ut();J();lt();al="<no_method>",Lr="error",ft="stack",Ga="stackDetails",Ds="errorSrc",Ka="message",As="description";he=function(t){H(e,t);function e(r,n,i,a,o,c){var s=t.call(this)||this;return s.aiDataContract={ver:1,exceptions:1,severityLevel:0,properties:0,measurements:0},sl(n)?(s.exceptions=n.exceptions,s.properties=n.properties,s.measurements=n.measurements,n.severityLevel&&(s.severityLevel=n.severityLevel),n.id&&(s.id=n.id),n.problemGroup&&(s.problemGroup=n.problemGroup),s.ver=2,x(n.isManual)||(s.isManual=n.isManual)):(i||(i={}),s.exceptions=[new Rs(r,n,i)],s.properties=je(r,i),s.measurements=ze(r,a),o&&(s.severityLevel=o),c&&(s.id=c)),s}return e.CreateAutoException=function(r,n,i,a,o,c,s,u){var l=gi(o||c||r);return{message:Ns(r,l),url:n,lineNumber:i,columnNumber:a,error:Ja(o||c||r),evt:Ja(c||r),typeName:l,stackDetails:ks(s||o||c),errorSrc:u}},e.CreateFromInterface=function(r,n,i,a){var o=n.exceptions&&qt(n.exceptions,function(s){return Rs.CreateFromInterface(r,s)}),c=new e(r,yt({},n,{exceptions:o}),i,a);return c},e.prototype.toInterface=function(){var r=this,n=r.exceptions,i=r.properties,a=r.measurements,o=r.severityLevel,c=r.ver,s=r.problemGroup,u=r.id,l=r.isManual,f=n instanceof Array&&qt(n,function(m){return m.toInterface()})||void 0;return{ver:"4.0",exceptions:f,severityLevel:o,properties:i,measurements:a,problemGroup:s,id:u,isManual:l}},e.CreateSimpleException=function(r,n,i,a,o,c){return{exceptions:[{hasFullStack:!0,message:r,stack:o,typeName:n}]}},e.envelopeType="Microsoft.ApplicationInsights.{0}.Exception",e.dataType="ExceptionData",e.formatError=Ja,e}(Es),Rs=function(t){H(e,t);function e(r,n,i){var a=t.call(this)||this;if(a.aiDataContract={id:0,outerId:0,typeName:1,message:1,hasFullStack:0,stack:0,parsedStack:2},ol(n))a.typeName=n.typeName,a.message=n.message,a[ft]=n[ft],a.parsedStack=n.parsedStack,a.hasFullStack=n.hasFullStack;else{var o=n,c=o&&o.evt;Vt(o)||(o=o[Lr]||c||o),a.typeName=ae(r,gi(o))||le,a.message=Nr(r,Ns(n||o,a.typeName))||le;var s=n[Ga]||ks(n);a.parsedStack=ll(s),a[ft]=ci(r,ul(s)),a.hasFullStack=Re(a.parsedStack)&&a.parsedStack.length>0,i&&(i.typeName=i.typeName||a.typeName)}return a}return e.prototype.toInterface=function(){var r=this.parsedStack instanceof Array&&qt(this.parsedStack,function(i){return i.toInterface()}),n={id:this.id,outerId:this.outerId,typeName:this.typeName,message:this.message,hasFullStack:this.hasFullStack,stack:this[ft],parsedStack:r||void 0};return n},e.CreateFromInterface=function(r,n){var i=n.parsedStack instanceof Array&&qt(n.parsedStack,function(o){return Xa.CreateFromInterface(o)})||n.parsedStack,a=new e(r,yt({},n,{parsedStack:i}));return a},e}(Ps),Xa=function(t){H(e,t);function e(r,n){var i=t.call(this)||this;if(i.sizeInBytes=0,i.aiDataContract={level:1,method:1,assembly:0,fileName:0,line:0},typeof r=="string"){var a=r;i.level=n,i.method=al,i.assembly=oe(a),i.fileName="",i.line=0;var o=a.match(e.regex);o&&o.length>=5&&(i.method=oe(o[2])||i.method,i.fileName=oe(o[4]),i.line=parseInt(o[5])||0)}else i.level=r.level,i.method=r.method,i.assembly=r.assembly,i.fileName=r.fileName,i.line=r.line,i.sizeInBytes=0;return i.sizeInBytes+=i.method.length,i.sizeInBytes+=i.fileName.length,i.sizeInBytes+=i.assembly.length,i.sizeInBytes+=e.baseSize,i.sizeInBytes+=i.level.toString().length,i.sizeInBytes+=i.line.toString().length,i}return e.CreateFromInterface=function(r){return new e(r,null)},e.prototype.toInterface=function(){return{level:this.level,method:this.method,assembly:this.assembly,fileName:this.fileName,line:this.line}},e.regex=/^([\s]+at)?[\s]{0,50}([^\@\()]+?)[\s]{0,50}(\@|\()([^\(\n]+):([0-9]+):([0-9]+)(\)?)$/,e.baseSize=58,e}(Is)});var Ls,Us=C(()=>{Ls=function(){function t(){this.ver=2,this.metrics=[],this.properties={},this.measurements={}}return t}()});var vi,_s=C(()=>{(function(t){t[t.Measurement=0]="Measurement",t[t.Aggregation=1]="Aggregation"})(vi||(vi={}))});var Os,Hs=C(()=>{_s();Os=function(){function t(){this.kind=vi.Measurement}return t}()});var js,zs=C(()=>{ne();Hs();js=function(t){H(e,t);function e(){var r=t!==null&&t.apply(this,arguments)||this;return r.aiDataContract={name:1,kind:0,value:1,count:0,min:0,max:0,stdDev:0},r}return e}(Os)});var Ve,Bs=C(()=>{ne();Us();ut();zs();lt();Ve=function(t){H(e,t);function e(r,n,i,a,o,c,s,u){var l=t.call(this)||this;l.aiDataContract={ver:1,metrics:1,properties:0};var f=new js;return f.count=a>0?a:void 0,f.max=isNaN(c)||c===null?void 0:c,f.min=isNaN(o)||o===null?void 0:o,f.name=ae(r,n)||le,f.value=i,l.metrics=[f],l.properties=je(r,s),l.measurements=ze(r,u),l}return e.envelopeType="Microsoft.ApplicationInsights.{0}.Metric",e.dataType="MetricData",e}(Ls)});var vr,hi=C(()=>{ne();qa();vr=function(t){H(e,t);function e(){var r=t.call(this)||this;return r.ver=2,r.properties={},r.measurements={},r}return e}(mi)});var Fe,Vs=C(()=>{ne();hi();ut();ln();lt();Fe=function(t){H(e,t);function e(r,n,i,a,o,c,s){var u=t.call(this)||this;return u.aiDataContract={ver:1,name:0,url:0,duration:0,properties:0,measurements:0,id:0},u.id=ui(r,s),u.url=Tt(r,i),u.name=ae(r,n)||le,isNaN(a)||(u.duration=Ke(a)),u.properties=je(r,o),u.measurements=ze(r,c),u}return e.envelopeType="Microsoft.ApplicationInsights.{0}.Pageview",e.dataType="PageviewData",e}(vr)});var qs,Gs=C(()=>{qs=function(){function t(){this.ver=2,this.success=!0,this.properties={},this.measurements={}}return t}()});var qe,Ks=C(()=>{ne();ut();ja();Gs();ln();qe=function(t){H(e,t);function e(r,n,i,a,o,c,s,u,l,f,m,I){l===void 0&&(l="Ajax");var E=t.call(this)||this;E.aiDataContract={id:1,ver:1,name:0,resultCode:0,duration:0,success:0,data:0,target:0,type:0,properties:0,measurements:0,kind:0,value:0,count:0,min:0,max:0,stdDev:0,dependencyKind:0,dependencySource:0,commandName:0,dependencyTypeName:0},E.id=n,E.duration=Ke(o),E.success=c,E.resultCode=s+"",E.type=ae(r,l);var b=vs(r,i,u,a);return E.data=Tt(r,a)||b.data,E.target=ae(r,b.target),f&&(E.target=E.target+" | "+f),E.name=ae(r,b.name),E.properties=je(r,m),E.measurements=ze(r,I),E}return e.envelopeType="Microsoft.ApplicationInsights.{0}.RemoteDependency",e.dataType="RemoteDependencyData",e}(qs)});var Ws,Js=C(()=>{Ws=function(){function t(){this.ver=2,this.properties={},this.measurements={}}return t}()});var $e,Xs=C(()=>{ne();Js();ut();lt();$e=function(t){H(e,t);function e(r,n,i,a,o){var c=t.call(this)||this;return c.aiDataContract={ver:1,message:1,severityLevel:0,properties:0},n=n||le,c.message=Nr(r,n),c.properties=je(r,a),c.measurements=ze(r,o),i&&(c.severityLevel=i),c}return e.envelopeType="Microsoft.ApplicationInsights.{0}.Message",e.dataType="MessageData",e}(Ws)});var Qs,$s=C(()=>{ne();hi();Qs=function(t){H(e,t);function e(){var r=t.call(this)||this;return r.ver=2,r.properties={},r.measurements={},r}return e}(vr)});var Ye,Ys=C(()=>{ne();$s();ut();lt();Ye=function(t){H(e,t);function e(r,n,i,a,o,c,s){var u=t.call(this)||this;return u.aiDataContract={ver:1,name:0,url:0,duration:0,perfTotal:0,networkConnect:0,sentRequest:0,receivedResponse:0,domProcessing:0,properties:0,measurements:0},u.url=Tt(r,i),u.name=ae(r,n)||le,u.properties=je(r,o),u.measurements=ze(r,c),s&&(u.domProcessing=s.domProcessing,u.duration=s.duration,u.networkConnect=s.networkConnect,u.perfTotal=s.perfTotal,u.receivedResponse=s.receivedResponse,u.sentRequest=s.sentRequest),u}return e.envelopeType="Microsoft.ApplicationInsights.{0}.PageviewPerformance",e.dataType="PageviewPerformanceData",e}(Qs)});var xt,Zs=C(()=>{ne();Va();xt=function(t){H(e,t);function e(r,n){var i=t.call(this)||this;return i.aiDataContract={baseType:1,baseData:1},i.baseType=r,i.baseData=n,i}return e}(In)});var _t,ec=C(()=>{(function(t){t[t.Verbose=0]="Verbose",t[t.Information=1]="Information",t[t.Warning=2]="Warning",t[t.Error=3]="Error",t[t.Critical=4]="Critical"})(_t||(_t={}))});var Qa,tc=C(()=>{J();Qa=function(){function t(){}return t.getConfig=function(e,r,n,i){i===void 0&&(i=!1);var a;return n&&e.extensionConfig&&e.extensionConfig[n]&&!x(e.extensionConfig[n][r])?a=e.extensionConfig[n][r]:a=e[r],x(a)?i:a},t}()});function er(t){var e="ai."+t+".";return function(r){return e+r}}var En,be,xi,_r,$a,tr,hr,wn,xr,Ya=C(()=>{ne();J();En=er("application"),be=er("device"),xi=er("location"),_r=er("operation"),$a=er("session"),tr=er("user"),hr=er("cloud"),wn=er("internal"),xr=function(t){H(e,t);function e(){return t.call(this)||this}return e}(Gi({applicationVersion:En("ver"),applicationBuild:En("build"),applicationTypeId:En("typeId"),applicationId:En("applicationId"),applicationLayer:En("layer"),deviceId:be("id"),deviceIp:be("ip"),deviceLanguage:be("language"),deviceLocale:be("locale"),deviceModel:be("model"),deviceFriendlyName:be("friendlyName"),deviceNetwork:be("network"),deviceNetworkName:be("networkName"),deviceOEMName:be("oemName"),deviceOS:be("os"),deviceOSVersion:be("osVersion"),deviceRoleInstance:be("roleInstance"),deviceRoleName:be("roleName"),deviceScreenResolution:be("screenResolution"),deviceType:be("type"),deviceMachineName:be("machineName"),deviceVMName:be("vmName"),deviceBrowser:be("browser"),deviceBrowserVersion:be("browserVersion"),locationIp:xi("ip"),locationCountry:xi("country"),locationProvince:xi("province"),locationCity:xi("city"),operationId:_r("id"),operationName:_r("name"),operationParentId:_r("parentId"),operationRootId:_r("rootId"),operationSyntheticSource:_r("syntheticSource"),operationCorrelationVector:_r("correlationVector"),sessionId:$a("id"),sessionIsFirst:$a("isFirst"),sessionIsNew:$a("isNew"),userAccountAcquisitionDate:tr("accountAcquisitionDate"),userAccountId:tr("accountId"),userAgent:tr("userAgent"),userId:tr("id"),userStoreRegion:tr("storeRegion"),userAuthUserId:tr("authUserId"),userAnonymousUserAcquisitionDate:tr("anonUserAcquisitionDate"),userAuthenticatedUserAcquisitionDate:tr("authUserAcquisitionDate"),cloudName:hr("name"),cloudRole:hr("role"),cloudRoleVer:hr("roleVer"),cloudRoleInstance:hr("roleInstance"),cloudEnvironment:hr("environment"),cloudLocation:hr("location"),cloudDeploymentUnit:hr("deploymentUnit"),internalNodeName:wn("nodeName"),internalSdkVersion:wn("sdkVersion"),internalAgentVersion:wn("agentVersion"),internalSnippet:wn("snippet"),internalSdkSrc:wn("sdkSrc")}))});var rt,rc=C(()=>{ut();J();lt();rt=function(){function t(){}return t.create=function(e,r,n,i,a,o){if(n=ae(i,n)||le,x(e)||x(r)||x(n))throw Error("Input doesn't contain all required fields");var c={name:n,time:Me(new Date),iKey:"",ext:o||{},tags:[],data:{},baseType:r,baseData:e};return x(a)||Z(a,function(s,u){c.data[s]=u}),c},t}()});var _e,re,nc=C(()=>{Ya();_e={UserExt:"user",DeviceExt:"device",TraceExt:"trace",WebExt:"web",AppExt:"app",OSExt:"os",SessionExt:"ses",SDKExt:"sdk"},re=new xr});var Ot,Or,yi,xe=C(()=>{ja();hs();Pa();lt();Va();Ba();Ss();Cs();Ms();Bs();Vs();hi();Ks();Xs();Ys();Zs();ec();tc();Ya();ut();rc();nc();Fa();ln();Na();La();_a();Ot="AppInsightsPropertiesPlugin",Or="AppInsightsChannelPlugin",yi="ApplicationInsightsAnalytics"});var ic,ac=C(()=>{xe();J();Te();ic=function(){function t(e,r,n,i){W(t,this,function(a){var o=null,c=[],s=!1,u;n&&(u=n.logger);function l(){n&&R(n.getTransmissionControls(),function(m){R(m,function(I){return I.flush(!0)})})}function f(m){c.push(m),o||(o=setInterval(function(){var I=c.slice(0),E=!1;c=[],R(I,function(b){b()?E=!0:c.push(b)}),c.length===0&&(clearInterval(o),o=null),E&&l()},100))}a.trackPageView=function(m,I){var E=m.name;if(x(E)||typeof E!="string"){var b=Ne();E=m.name=b&&b.title||""}var p=m.uri;if(x(p)||typeof p!="string"){var v=et();p=m.uri=v&&v.href||""}if(!i.isPerformanceTimingSupported()){e.sendPageViewInternal(m,I),l(),u.throwInternal(S.WARNING,h.NavigationTimingNotSupported,"trackPageView: navigation timing API used for calculation of page duration is not supported in this browser. This page view will be collected without duration and timing info.");return}var y=!1,w,L=i.getPerformanceTiming().navigationStart;L>0&&(w=ve(L,+new Date),i.shouldCollectDuration(w)||(w=void 0));var F;!x(I)&&!x(I.duration)&&(F=I.duration),(r||!isNaN(F))&&(isNaN(F)&&(I||(I={}),I.duration=w),e.sendPageViewInternal(m,I),l(),y=!0);var Q=6e4;I||(I={}),f(function(){var Se=!1;try{if(i.isPerformanceTimingDataReady()){Se=!0;var X={name:E,uri:p};i.populatePageViewPerformanceEvent(X),!X.isValid&&!y?(I.duration=w,e.sendPageViewInternal(m,I)):(y||(I.duration=X.durationMs,e.sendPageViewInternal(m,I)),s||(e.sendPageViewPerformanceInternal(X,I),s=!0))}else L>0&&ve(L,+new Date)>Q&&(Se=!0,y||(I.duration=Q,e.sendPageViewInternal(m,I)))}catch(me){u.throwInternal(S.CRITICAL,h.TrackPVFailedCalc,"trackPageView failed on page load calculation: "+G(me),{exception:O(me)})}return Se})}})}return t}()});var oc,fl,sc=C(()=>{xe();J();oc=function(){function t(e,r){this.prevPageVisitDataKeyName="prevPageVisitData",this.pageVisitTimeTrackingHandler=r,this._logger=e}return t.prototype.trackPreviousPageVisit=function(e,r){try{var n=this.restartPageVisitTimer(e,r);n&&this.pageVisitTimeTrackingHandler(n.pageName,n.pageUrl,n.pageVisitTime)}catch(i){this._logger.warnToConsole("Auto track page visit time failed, metric will not be collected: "+O(i))}},t.prototype.restartPageVisitTimer=function(e,r){try{var n=this.stopPageVisitTimer();return this.startPageVisitTimer(e,r),n}catch(i){return this._logger.warnToConsole("Call to restart failed: "+O(i)),null}},t.prototype.startPageVisitTimer=function(e,r){try{if(wt()){Yt(this._logger,this.prevPageVisitDataKeyName)!=null&&Ae("Cannot call startPageVisit consecutively without first calling stopPageVisit");var n=new fl(e,r),i=Pe().stringify(n);Zt(this._logger,this.prevPageVisitDataKeyName,i)}}catch(a){this._logger.warnToConsole("Call to start failed: "+O(a))}},t.prototype.stopPageVisitTimer=function(){try{if(wt()){var e=de(),r=Yt(this._logger,this.prevPageVisitDataKeyName);if(r&&vt()){var n=Pe().parse(r);return n.pageVisitTime=e-n.pageVisitStartTime,vn(this._logger,this.prevPageVisitDataKeyName),n}else return null}return null}catch(i){return this._logger.warnToConsole("Stop page visit timer failed: "+O(i)),null}},t}(),fl=function(){function t(e,r){this.pageVisitStartTime=de(),this.pageName=e,this.pageUrl=r}return t}()});var cc,uc=C(()=>{xe();J();cc=function(){function t(e){this.MAX_DURATION_ALLOWED=36e5,e&&(this._logger=e.logger)}return t.prototype.populatePageViewPerformanceEvent=function(e){e.isValid=!1;var r=this.getPerformanceNavigationTiming(),n=this.getPerformanceTiming(),i=0,a=0,o=0,c=0,s=0;(r||n)&&(r?(i=r.duration,a=r.startTime===0?r.connectEnd:ve(r.startTime,r.connectEnd),o=ve(r.requestStart,r.responseStart),c=ve(r.responseStart,r.responseEnd),s=ve(r.responseEnd,r.loadEventEnd)):(i=ve(n.navigationStart,n.loadEventEnd),a=ve(n.navigationStart,n.connectEnd),o=ve(n.requestStart,n.responseStart),c=ve(n.responseStart,n.responseEnd),s=ve(n.responseEnd,n.loadEventEnd)),i===0?this._logger.throwInternal(S.WARNING,h.ErrorPVCalc,"error calculating page view performance.",{total:i,network:a,request:o,response:c,dom:s}):this.shouldCollectDuration(i,a,o,c,s)?i<Math.floor(a)+Math.floor(o)+Math.floor(c)+Math.floor(s)?this._logger.throwInternal(S.WARNING,h.ClientPerformanceMathError,"client performance math error.",{total:i,network:a,request:o,response:c,dom:s}):(e.durationMs=i,e.perfTotal=e.duration=Ke(i),e.networkConnect=Ke(a),e.sentRequest=Ke(o),e.receivedResponse=Ke(c),e.domProcessing=Ke(s),e.isValid=!0):this._logger.throwInternal(S.WARNING,h.InvalidDurationValue,"Invalid page load duration value. Browser perf data won't be sent.",{total:i,network:a,request:o,response:c,dom:s}))},t.prototype.getPerformanceTiming=function(){return this.isPerformanceTimingSupported()?Qe().timing:null},t.prototype.getPerformanceNavigationTiming=function(){return this.isPerformanceNavigationTimingSupported()?Qe().getEntriesByType("navigation")[0]:null},t.prototype.isPerformanceNavigationTimingSupported=function(){var e=Qe();return e&&e.getEntriesByType&&e.getEntriesByType("navigation").length>0},t.prototype.isPerformanceTimingSupported=function(){var e=Qe();return e&&e.timing},t.prototype.isPerformanceTimingDataReady=function(){var e=Qe(),r=e?e.timing:0;return r&&r.domainLookupStart>0&&r.navigationStart>0&&r.responseStart>0&&r.requestStart>0&&r.loadEventEnd>0&&r.responseEnd>0&&r.connectEnd>0&&r.domLoading>0},t.prototype.shouldCollectDuration=function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];var n=Ue()||{},i=["googlebot","adsbot-google","apis-google","mediapartners-google"],a=n.userAgent,o=!1;if(a)for(var c=0;c<i.length;c++)o=o||a.toLowerCase().indexOf(i[c])!==-1;if(o)return!1;for(var c=0;c<e.length;c++)if(e[c]<0||e[c]>=this.MAX_DURATION_ALLOWED)return!1;return!0},t}()});function Pn(t,e){t&&t.dispatchEvent&&e&&t.dispatchEvent(e)}var lc,Za,bn,fc,pc=C(()=>{ne();xe();J();ac();sc();uc();Te();lc="duration",Za="event";bn=function(t){H(e,t);function e(){var r=t.call(this)||this;r.identifier=yi,r.priority=180,r.autoRoutePVDelay=500;var n,i,a,o=0,c,s;return W(e,r,function(u,l){var f=et(!0);c=f&&f.href||"",u.getCookieMgr=function(){return ur(u.core)},u.processTelemetry=function(p,v){ct(u.core,function(){return u.identifier+":processTelemetry"},function(){var y=!1,w=u._telemetryInitializers.length;v=u._getTelCtx(v);for(var L=0;L<w;++L){var F=u._telemetryInitializers[L];if(F)try{if(F.apply(null,[p])===!1){y=!0;break}}catch(Q){v.diagLog().throwInternal(S.CRITICAL,h.TelemetryInitializerFailed,"One of telemetry initializers failed, telemetry item will not be sent: "+G(Q),{exception:O(Q)},!0)}}y||u.processNext(p,v)},function(){return{item:p}},!p.sync)},u.trackEvent=function(p,v){try{var y=rt.create(p,Be.dataType,Be.envelopeType,u.diagLog(),v);u.core.track(y)}catch(w){u.diagLog().throwInternal(S.WARNING,h.TrackTraceFailed,"trackTrace failed, trace will not be collected: "+G(w),{exception:O(w)})}},u.startTrackEvent=function(p){try{n.start(p)}catch(v){u.diagLog().throwInternal(S.CRITICAL,h.StartTrackEventFailed,"startTrackEvent failed, event will not be collected: "+G(v),{exception:O(v)})}},u.stopTrackEvent=function(p,v,y){try{n.stop(p,void 0,v)}catch(w){u.diagLog().throwInternal(S.CRITICAL,h.StopTrackEventFailed,"stopTrackEvent failed, event will not be collected: "+G(w),{exception:O(w)})}},u.trackTrace=function(p,v){try{var y=rt.create(p,$e.dataType,$e.envelopeType,u.diagLog(),v);u.core.track(y)}catch(w){u.diagLog().throwInternal(S.WARNING,h.TrackTraceFailed,"trackTrace failed, trace will not be collected: "+G(w),{exception:O(w)})}},u.trackMetric=function(p,v){try{var y=rt.create(p,Ve.dataType,Ve.envelopeType,u.diagLog(),v);u.core.track(y)}catch(w){u.diagLog().throwInternal(S.CRITICAL,h.TrackMetricFailed,"trackMetric failed, metric will not be collected: "+G(w),{exception:O(w)})}},u.trackPageView=function(p,v){try{var y=p||{};u._pageViewManager.trackPageView(y,yt({},y.properties,y.measurements,v)),u.config.autoTrackPageVisitTime&&u._pageVisitTimeManager.trackPreviousPageVisit(y.name,y.uri)}catch(w){u.diagLog().throwInternal(S.CRITICAL,h.TrackPVFailed,"trackPageView failed, page view will not be collected: "+G(w),{exception:O(w)})}},u.sendPageViewInternal=function(p,v,y){var w=Ne();w&&(p.refUri=p.refUri===void 0?w.referrer:p.refUri);var L=rt.create(p,Fe.dataType,Fe.envelopeType,u.diagLog(),v,y);u.core.track(L),o=0},u.sendPageViewPerformanceInternal=function(p,v,y){var w=rt.create(p,Ye.dataType,Ye.envelopeType,u.diagLog(),v,y);u.core.track(w)},u.trackPageViewPerformance=function(p,v){try{u._pageViewPerformanceManager.populatePageViewPerformanceEvent(p),u.sendPageViewPerformanceInternal(p,v)}catch(y){u.diagLog().throwInternal(S.CRITICAL,h.TrackPVFailed,"trackPageViewPerformance failed, page view will not be collected: "+G(y),{exception:O(y)})}},u.startTrackPage=function(p){try{if(typeof p!="string"){var v=Ne();p=v&&v.title||""}i.start(p)}catch(y){u.diagLog().throwInternal(S.CRITICAL,h.StartTrackFailed,"startTrackPage failed, page view may not be collected: "+G(y),{exception:O(y)})}},u.stopTrackPage=function(p,v,y,w){try{if(typeof p!="string"){var L=Ne();p=L&&L.title||""}if(typeof v!="string"){var F=et();v=F&&F.href||""}i.stop(p,v,y,w),u.config.autoTrackPageVisitTime&&u._pageVisitTimeManager.trackPreviousPageVisit(p,v)}catch(Q){u.diagLog().throwInternal(S.CRITICAL,h.StopTrackFailed,"stopTrackPage failed, page view will not be collected: "+G(Q),{exception:O(Q)})}},u.sendExceptionInternal=function(p,v,y){var w=p.exception||p.error||new Error(le),L=new he(u.diagLog(),w,p.properties||v,p.measurements,p.severityLevel,p.id).toInterface(),F=rt.create(L,he.dataType,he.envelopeType,u.diagLog(),v,y);u.core.track(F)},u.trackException=function(p,v){try{u.sendExceptionInternal(p,v)}catch(y){u.diagLog().throwInternal(S.CRITICAL,h.TrackExceptionFailed,"trackException failed, exception will not be collected: "+G(y),{exception:O(y)})}},u._onerror=function(p){var v=p&&p.error,y=p&&p.evt;try{if(!y){var w=Ct();w&&(y=w[Za])}var L=p&&p.url||(Ne()||{}).URL,F=p.errorSrc||"window.onerror@"+L+":"+(p.lineNumber||0)+":"+(p.columnNumber||0),Q={errorSrc:F,url:L,lineNumber:p.lineNumber||0,columnNumber:p.columnNumber||0,message:p.message};un(p.message,p.url,p.lineNumber,p.columnNumber,p.error)?b(he.CreateAutoException("Script error: The browser's same-origin policy prevents us from getting the details of this exception. Consider using the 'crossorigin' attribute.",L,p.lineNumber||0,p.columnNumber||0,v,y,null,F),Q):(p.errorSrc||(p.errorSrc=F),u.trackException({exception:p,severityLevel:_t.Error},Q))}catch(X){var Se=v?v.name+", "+v.message:"null";u.diagLog().throwInternal(S.CRITICAL,h.ExceptionWhileLoggingError,"_onError threw exception while logging error, error will not be collected: "+G(X),{exception:O(X),errorString:Se})}},u.addTelemetryInitializer=function(p){u._telemetryInitializers.push(p)},u.initialize=function(p,v,y,w){if(!u.isInitialized()){if(x(v))throw Error("Error initializing");l.initialize(p,v,y,w),u.setInitialized(!1);var L=u._getTelCtx(),F=u.identifier;u.config=L.getExtCfg(F);var Q=e.getDefaultConfig(p);Q!==void 0&&Z(Q,function(D,z){u.config[D]=L.getConfig(F,D,z),u.config[D]===void 0&&(u.config[D]=z)}),u.config.isStorageUseDisabled&&pn();var Se={instrumentationKey:function(){return p.instrumentationKey},accountId:function(){return u.config.accountId||p.accountId},sessionRenewalMs:function(){return u.config.sessionRenewalMs||p.sessionRenewalMs},sessionExpirationMs:function(){return u.config.sessionExpirationMs||p.sessionExpirationMs},sampleRate:function(){return u.config.samplingPercentage||p.samplingPercentage},sdkExtension:function(){return u.config.sdkExtension||p.sdkExtension},isBrowserLinkTrackingEnabled:function(){return u.config.isBrowserLinkTrackingEnabled||p.isBrowserLinkTrackingEnabled},appId:function(){return u.config.appId||p.appId}};u._pageViewPerformanceManager=new cc(u.core),u._pageViewManager=new ic(r,u.config.overridePageViewDuration,u.core,u._pageViewPerformanceManager),u._pageVisitTimeManager=new oc(u.diagLog(),function(D,z,U){return m(D,z,U)}),u._telemetryInitializers=u._telemetryInitializers||[],I(Se),n=new fc(u.diagLog(),"trackEvent"),n.action=function(D,z,U,q){q||(q={}),q[lc]=U.toString(),u.trackEvent({name:D,properties:q})},i=new fc(u.diagLog(),"trackPageView"),i.action=function(D,z,U,q,$){x(q)&&(q={}),q[lc]=U.toString();var ie={name:D,uri:z,properties:q,measurements:$};u.sendPageViewInternal(ie,q)};var X=Ct(),me=Qi(),De=et(!0),pt=r;if(u.config.disableExceptionTracking===!1&&!u.config.autoExceptionInstrumented&&X){var at="onerror",dt=X[at];X.onerror=function(D,z,U,q,$){var ie=X[Za],Ht=dt&&dt(D,z,U,q,$);return Ht!==!0&&pt._onerror(he.CreateAutoException(D,z,U,q,$,ie)),Ht},u.config.autoExceptionInstrumented=!0}if(u.config.disableExceptionTracking===!1&&u.config.enableUnhandledPromiseRejectionTracking===!0&&!u.config.autoUnhandledPromiseInstrumented&&X){var d="onunhandledrejection",T=X[d];X[d]=function(D){var z=X[Za],U=T&&T.call(X,D);return U!==!0&&pt._onerror(he.CreateAutoException(D.reason.toString(),De?De.href:"",0,0,D,z)),U},u.config.autoUnhandledPromiseInstrumented=!0}if(u.config.enableAutoRouteTracking===!0&&me&&j(me.pushState)&&j(me.replaceState)&&X&&typeof Event!="undefined"){var A=r;R(y,function(D){D.identifier===Ot&&(a=D)}),me.pushState=function(D){return function(){var U=D.apply(this,arguments);return Pn(X,Lt(A.config.namePrefix+"pushState")),Pn(X,Lt(A.config.namePrefix+"locationchange")),U}}(me.pushState),me.replaceState=function(D){return function(){var U=D.apply(this,arguments);return Pn(X,Lt(A.config.namePrefix+"replaceState")),Pn(X,Lt(A.config.namePrefix+"locationchange")),U}}(me.replaceState),X.addEventListener&&(X.addEventListener(A.config.namePrefix+"popstate",function(){Pn(X,Lt(A.config.namePrefix+"locationchange"))}),X.addEventListener(A.config.namePrefix+"locationchange",function(){if(a&&a.context&&a.context.telemetryTrace){a.context.telemetryTrace.traceID=He();var D="_unknown_";De&&De.pathname&&(D=De.pathname+(De.hash||"")),a.context.telemetryTrace.name=D}s&&(c=s),s=De&&De.href||"",setTimeout(function(z){A.trackPageView({refUri:z,properties:{duration:0}})}.bind(r,c),A.autoRoutePVDelay)}))}u.setInitialized(!0)}};function m(p,v,y){var w={PageName:p,PageUrl:v};u.trackMetric({name:"PageVisitTime",average:y,max:y,min:y,sampleCount:1},w)}function I(p){if(!p.isBrowserLinkTrackingEnabled()){var v=["/browserLinkSignalR/","/__browserLink/"],y=function(w){if(w.baseType===qe.dataType){var L=w.baseData;if(L){for(var F=0;F<v.length;F++)if(L.target&&L.target.indexOf(v[F])>=0)return!1}}return!0};E(y)}}function E(p){u._telemetryInitializers.push(p)}function b(p,v){var y=rt.create(p,he.dataType,he.envelopeType,u.diagLog(),v);u.core.track(y)}}),r}return e.getDefaultConfig=function(r){return r||(r={}),r.sessionRenewalMs=30*60*1e3,r.sessionExpirationMs=24*60*60*1e3,r.disableExceptionTracking=ee(r.disableExceptionTracking),r.autoTrackPageVisitTime=ee(r.autoTrackPageVisitTime),r.overridePageViewDuration=ee(r.overridePageViewDuration),r.enableUnhandledPromiseRejectionTracking=ee(r.enableUnhandledPromiseRejectionTracking),(isNaN(r.samplingPercentage)||r.samplingPercentage<=0||r.samplingPercentage>=100)&&(r.samplingPercentage=100),r.isStorageUseDisabled=ee(r.isStorageUseDisabled),r.isBrowserLinkTrackingEnabled=ee(r.isBrowserLinkTrackingEnabled),r.enableAutoRouteTracking=ee(r.enableAutoRouteTracking),r.namePrefix=r.namePrefix||"",r.enableDebug=ee(r.enableDebug),r.disableFlushOnBeforeUnload=ee(r.disableFlushOnBeforeUnload),r.disableFlushOnUnload=ee(r.disableFlushOnUnload,r.disableFlushOnBeforeUnload),r},e.Version="2.6.4",e}(tt),fc=function(){function t(e,r){var n=this,i={};n.start=function(a){typeof i[a]!="undefined"&&e.throwInternal(S.WARNING,h.StartCalledMoreThanOnce,"start was called more than once for this event without calling stop.",{name:a,key:a},!0),i[a]=+new Date},n.stop=function(a,o,c,s){var u=i[a];if(isNaN(u))e.throwInternal(S.WARNING,h.StopCalledWithoutStart,"stop was called without a corresponding start.",{name:a,key:a},!0);else{var l=+new Date,f=ve(u,l);n.action(a,o,f,c,s)}delete i[a],i[a]=void 0}}return t}()});var eo=C(()=>{pc()});var dc,mc,gc=C(()=>{xe();J();Te();dc=function(){function t(e){var r=[];W(t,this,function(n){n.enqueue=function(i){r.push(i)},n.count=function(){return r.length},n.clear=function(){r.length=0},n.getItems=function(){return r.slice(0)},n.batchPayloads=function(i){if(i&&i.length>0){var a=e.emitLineDelimitedJson()?i.join(`
`):"["+i.join(",")+"]";return a}return null},n.markAsSent=function(i){n.clear()},n.clearSent=function(i){}})}return t}(),mc=function(){function t(e,r){var n=!1,i;W(t,this,function(a){var o=u(t.BUFFER_KEY),c=u(t.SENT_BUFFER_KEY);i=o.concat(c),i.length>t.MAX_BUFFER_SIZE&&(i.length=t.MAX_BUFFER_SIZE),l(t.SENT_BUFFER_KEY,[]),l(t.BUFFER_KEY,i),a.enqueue=function(f){if(i.length>=t.MAX_BUFFER_SIZE){n||(e.throwInternal(S.WARNING,h.SessionStorageBufferFull,"Maximum buffer size reached: "+i.length,!0),n=!0);return}i.push(f),l(t.BUFFER_KEY,i)},a.count=function(){return i.length},a.clear=function(){i=[],l(t.BUFFER_KEY,[]),l(t.SENT_BUFFER_KEY,[]),n=!1},a.getItems=function(){return i.slice(0)},a.batchPayloads=function(f){if(f&&f.length>0){var m=r.emitLineDelimitedJson()?f.join(`
`):"["+f.join(",")+"]";return m}return null},a.markAsSent=function(f){i=s(f,i),l(t.BUFFER_KEY,i);var m=u(t.SENT_BUFFER_KEY);m instanceof Array&&f instanceof Array&&(m=m.concat(f),m.length>t.MAX_BUFFER_SIZE&&(e.throwInternal(S.CRITICAL,h.SessionStorageBufferFull,"Sent buffer reached its maximum size: "+m.length,!0),m.length=t.MAX_BUFFER_SIZE),l(t.SENT_BUFFER_KEY,m))},a.clearSent=function(f){var m=u(t.SENT_BUFFER_KEY);m=s(f,m),l(t.SENT_BUFFER_KEY,m)};function s(f,m){var I=[];return R(m,function(E){!j(E)&&Nt(f,E)===-1&&I.push(E)}),I}function u(f){var m=f;try{m=r.namePrefix&&r.namePrefix()?r.namePrefix()+"_"+m:m;var I=Yt(e,m);if(I){var E=Pe().parse(I);if(_(E)&&(E=Pe().parse(E)),E&&Re(E))return E}}catch(b){e.throwInternal(S.CRITICAL,h.FailedToRestoreStorageBuffer," storage key: "+m+", "+G(b),{exception:O(b)})}return[]}function l(f,m){var I=f;try{I=r.namePrefix&&r.namePrefix()?r.namePrefix()+"_"+I:I;var E=JSON.stringify(m);Zt(e,I,E)}catch(b){Zt(e,I,JSON.stringify([])),e.throwInternal(S.WARNING,h.FailedToSetStorageBuffer," storage key: "+I+", "+G(b)+". Buffer cleared",{exception:O(b)})}}})}return t.BUFFER_KEY="AI_buffer",t.SENT_BUFFER_KEY="AI_sentBuffer",t.MAX_BUFFER_SIZE=2e3,t}()});function ye(t,e,r){return K(t,e,r,br)}var to,se,ke,vc,fe,hc,ro,xc,yc,Sc,Cc,Ic,Tc=C(()=>{ne();xe();J();to="baseType",se="baseData",ke="properties",vc="true";fe=function(){function t(){}return t.extractPropsAndMeasurements=function(e,r,n){x(e)||Z(e,function(i,a){ar(a)?n[i]=a:_(a)?r[i]=a:vt()&&(r[i]=Pe().stringify(a))})},t.createEnvelope=function(e,r,n,i){var a=new Tn(e,i,r);ye(a,"sampleRate",n[fr]),(n[se]||{}).startTime&&(a.time=Me(n[se].startTime)),a.iKey=n.iKey;var o=n.iKey.replace(/-/g,"");return a.name=a.name.replace("{0}",o),t.extractPartAExtensions(n,a),n.tags=n.tags||[],Kn(a)},t.extractPartAExtensions=function(e,r){var n=r.tags=r.tags||{},i=e.ext=e.ext||{},a=e.tags=e.tags||[],o=i.user;o&&(ye(n,re.userAuthUserId,o.authId),ye(n,re.userId,o.id||o.localId));var c=i.app;c&&ye(n,re.sessionId,c.sesId);var s=i.device;s&&(ye(n,re.deviceId,s.id||s.localId),ye(n,re.deviceType,s.deviceClass),ye(n,re.deviceIp,s.ip),ye(n,re.deviceModel,s.model),ye(n,re.deviceType,s.deviceType));var u=e.ext.web;if(u){ye(n,re.deviceLanguage,u.browserLang),ye(n,re.deviceBrowserVersion,u.browserVer),ye(n,re.deviceBrowser,u.browser);var l=r.data=r.data||{},f=l[se]=l[se]||{},m=f[ke]=f[ke]||{};ye(m,"domain",u.domain),ye(m,"isManual",u.isManual?vc:null),ye(m,"screenRes",u.screenRes),ye(m,"userConsent",u.userConsent?vc:null)}var I=i.os;I&&ye(n,re.deviceOS,I.name);var E=i.trace;E&&(ye(n,re.operationParentId,E.parentID),ye(n,re.operationName,E.name),ye(n,re.operationId,E.traceID));for(var b={},p=a.length-1;p>=0;p--){var v=a[p];Z(v,function(w,L){b[w]=L}),a.splice(p,1)}Z(a,function(w,L){b[w]=L});var y=yt({},n,b);y[re.internalSdkVersion]||(y[re.internalSdkVersion]="javascript:"+t.Version),r.tags=Kn(y)},t.prototype.Init=function(e,r){this._logger=e,x(r[se])&&this._logger.throwInternal(S.CRITICAL,h.TelemetryEnvelopeInvalid,"telemetryItem.baseData cannot be null.")},t.Version="2.6.4",t}(),hc=function(t){H(e,t);function e(){return t!==null&&t.apply(this,arguments)||this}return e.prototype.Create=function(r,n){t.prototype.Init.call(this,r,n);var i=n[se].measurements||{},a=n[se][ke]||{};fe.extractPropsAndMeasurements(n.data,a,i);var o=n[se];if(x(o))return r.warnToConsole("Invalid input for dependency data"),null;var c=o[ke]&&o[ke][kr]?o[ke][kr]:"GET",s=new qe(r,o.id,o.target,o.name,o.duration,o.success,o.responseCode,c,o.type,o.correlationContext,a,i),u=new xt(qe.dataType,s);return fe.createEnvelope(r,qe.envelopeType,n,u)},e.DependencyEnvelopeCreator=new e,e}(fe),ro=function(t){H(e,t);function e(){return t!==null&&t.apply(this,arguments)||this}return e.prototype.Create=function(r,n){t.prototype.Init.call(this,r,n);var i={},a={};n[to]!==Be.dataType&&(i.baseTypeSource=n[to]),n[to]===Be.dataType?(i=n[se][ke]||{},a=n[se].measurements||{}):n[se]&&fe.extractPropsAndMeasurements(n[se],i,a),fe.extractPropsAndMeasurements(n.data,i,a);var o=n[se].name,c=new Be(r,o,i,a),s=new xt(Be.dataType,c);return fe.createEnvelope(r,Be.envelopeType,n,s)},e.EventEnvelopeCreator=new e,e}(fe),xc=function(t){H(e,t);function e(){return t!==null&&t.apply(this,arguments)||this}return e.prototype.Create=function(r,n){t.prototype.Init.call(this,r,n);var i=n[se].measurements||{},a=n[se][ke]||{};fe.extractPropsAndMeasurements(n.data,a,i);var o=n[se],c=he.CreateFromInterface(r,o,a,i),s=new xt(he.dataType,c);return fe.createEnvelope(r,he.envelopeType,n,s)},e.ExceptionEnvelopeCreator=new e,e}(fe),yc=function(t){H(e,t);function e(){return t!==null&&t.apply(this,arguments)||this}return e.prototype.Create=function(r,n){t.prototype.Init.call(this,r,n);var i=n[se],a=i[ke]||{},o=i.measurements||{};fe.extractPropsAndMeasurements(n.data,a,o);var c=new Ve(r,i.name,i.average,i.sampleCount,i.min,i.max,a,o),s=new xt(Ve.dataType,c);return fe.createEnvelope(r,Ve.envelopeType,n,s)},e.MetricEnvelopeCreator=new e,e}(fe),Sc=function(t){H(e,t);function e(){return t!==null&&t.apply(this,arguments)||this}return e.prototype.Create=function(r,n){t.prototype.Init.call(this,r,n);var i="duration",a,o=n[se];!x(o)&&!x(o[ke])&&!x(o[ke][i])?(a=o[ke][i],delete o[ke][i]):!x(n.data)&&!x(n.data[i])&&(a=n.data[i],delete n.data[i]);var c=n[se],s;((n.ext||{}).trace||{}).traceID&&(s=n.ext.trace.traceID);var u=c.id||s,l=c.name,f=c.uri,m=c[ke]||{},I=c.measurements||{};if(x(c.refUri)||(m.refUri=c.refUri),x(c.pageType)||(m.pageType=c.pageType),x(c.isLoggedIn)||(m.isLoggedIn=c.isLoggedIn.toString()),!x(c[ke])){var E=c[ke];Z(E,function(v,y){m[v]=y})}fe.extractPropsAndMeasurements(n.data,m,I);var b=new Fe(r,l,f,a,m,I,u),p=new xt(Fe.dataType,b);return fe.createEnvelope(r,Fe.envelopeType,n,p)},e.PageViewEnvelopeCreator=new e,e}(fe),Cc=function(t){H(e,t);function e(){return t!==null&&t.apply(this,arguments)||this}return e.prototype.Create=function(r,n){t.prototype.Init.call(this,r,n);var i=n[se],a=i.name,o=i.uri||i.url,c=i[ke]||{},s=i.measurements||{};fe.extractPropsAndMeasurements(n.data,c,s);var u=new Ye(r,a,o,void 0,c,s,i),l=new xt(Ye.dataType,u);return fe.createEnvelope(r,Ye.envelopeType,n,l)},e.PageViewPerformanceEnvelopeCreator=new e,e}(fe),Ic=function(t){H(e,t);function e(){return t!==null&&t.apply(this,arguments)||this}return e.prototype.Create=function(r,n){t.prototype.Init.call(this,r,n);var i=n[se].message,a=n[se].severityLevel,o=n[se][ke]||{},c=n[se].measurements||{};fe.extractPropsAndMeasurements(n.data,o,c);var s=new $e(r,i,a,o,c),u=new xt($e.dataType,s);return fe.createEnvelope(r,$e.envelopeType,n,u)},e.TraceEnvelopeCreator=new e,e}(fe)});var Ec,wc=C(()=>{J();Te();Ec=function(){function t(e){W(t,this,function(r){r.serialize=function(o){var c=n(o,"root");try{return Pe().stringify(c)}catch(s){e.throwInternal(S.CRITICAL,h.CannotSerializeObject,s&&j(s.toString)?s.toString():"Error serializing object",null,!0)}};function n(o,c){var s="__aiCircularRefCheck",u={};if(!o)return e.throwInternal(S.CRITICAL,h.CannotSerializeObject,"cannot serialize object because it is null or undefined",{name:c},!0),u;if(o[s])return e.throwInternal(S.WARNING,h.CircularReferenceDetected,"Circular reference detected while serializing object",{name:c},!0),u;if(!o.aiDataContract){if(c==="measurements")u=a(o,"number",c);else if(c==="properties")u=a(o,"string",c);else if(c==="tags")u=a(o,"string",c);else if(Re(o))u=i(o,c);else{e.throwInternal(S.WARNING,h.CannotSerializeObjectNonSerializable,"Attempting to serialize an object which does not implement ISerializable",{name:c},!0);try{Pe().stringify(o),u=o}catch(l){e.throwInternal(S.CRITICAL,h.CannotSerializeObject,l&&j(l.toString)?l.toString():"Error serializing object",null,!0)}}return u}return o[s]=!0,Z(o.aiDataContract,function(l,f){var m=j(f)?f()&1:f&1,I=j(f)?f()&4:f&4,E=f&2,b=o[l]!==void 0,p=st(o[l])&&o[l]!==null;if(m&&!b&&!E)e.throwInternal(S.CRITICAL,h.MissingRequiredFieldSpecification,"Missing required field specification. The field is required but not present on source",{field:l,name:c});else if(!I){var v=void 0;p?E?v=i(o[l],l):v=n(o[l],l):v=o[l],v!==void 0&&(u[l]=v)}}),delete o[s],u}function i(o,c){var s;if(o)if(!Re(o))e.throwInternal(S.CRITICAL,h.ItemNotInArray,`This field was specified as an array in the contract but the item is not an array.\r
`,{name:c},!0);else{s=[];for(var u=0;u<o.length;u++){var l=o[u],f=n(l,c+"["+u+"]");s.push(f)}}return s}function a(o,c,s){var u;return o&&(u={},Z(o,function(l,f){if(c==="string")f===void 0?u[l]="undefined":f===null?u[l]="null":f.toString?u[l]=f.toString():u[l]="invalid field: toString() is not defined.";else if(c==="number")if(f===void 0)u[l]="undefined";else if(f===null)u[l]="null";else{var m=parseFloat(f);isNaN(m)?u[l]="NaN":u[l]=m}else u[l]="invalid field: "+s+" is of unknown type.",e.throwInternal(S.CRITICAL,u[l],null,!0)})),u}})}return t}()});var pl,no,Pc=C(()=>{J();Te();pl=function(){function t(){var e=Ct(),r=Ne(),n=!1,i=!0;W(t,this,function(a){try{if(e&&Xt.Attach(e,"online",s)&&(Xt.Attach(e,"offline",u),n=!0),r){var o=r.body||r;pe(o.ononline)||(o.ononline=s,o.onoffline=u,n=!0)}if(n){var c=Ue();c&&!x(c.onLine)&&(i=c.onLine)}}catch(l){n=!1}a.isListening=n,a.isOnline=function(){var l=!0,f=Ue();return n?l=i:f&&!x(f.onLine)&&(l=f.onLine),l},a.isOffline=function(){return!a.isOnline()};function s(){i=!0}function u(){i=!1}})}return t.Offline=new t,t}(),no=pl.Offline});var bc,Dc=C(()=>{bc=function(){function t(){}return t.prototype.getHashCodeScore=function(e){var r=this.getHashCode(e)/t.INT_MAX_VALUE;return r*100},t.prototype.getHashCode=function(e){if(e==="")return 0;for(;e.length<t.MIN_INPUT_LENGTH;)e=e.concat(e);for(var r=5381,n=0;n<e.length;++n)r=(r<<5)+r+e.charCodeAt(n),r=r&r;return Math.abs(r)},t.INT_MAX_VALUE=2147483647,t.MIN_INPUT_LENGTH=8,t}()});var Ac,Nc=C(()=>{Dc();xe();Ac=function(){function t(){this.hashCodeGeneragor=new bc,this.keys=new xr}return t.prototype.getSamplingScore=function(e){var r=0;return e.tags&&e.tags[this.keys.userId]?r=this.hashCodeGeneragor.getHashCodeScore(e.tags[this.keys.userId]):e.ext&&e.ext.user&&e.ext.user.id?r=this.hashCodeGeneragor.getHashCodeScore(e.ext.user.id):e.tags&&e.tags[this.keys.operationId]?r=this.hashCodeGeneragor.getHashCodeScore(e.tags[this.keys.operationId]):e.ext&&e.ext.telemetryTrace&&e.ext.telemetryTrace.traceID?r=this.hashCodeGeneragor.getHashCodeScore(e.ext.telemetryTrace.traceID):r=Math.random()*100,r},t}()});var Fc,kc=C(()=>{Nc();xe();J();Fc=function(){function t(e,r){this.INT_MAX_VALUE=2147483647,this._logger=r||kt(null),(e>100||e<0)&&(this._logger.throwInternal(S.WARNING,h.SampleRateOutOfRange,"Sampling rate is out of range (0..100). Sampling will be disabled, you may be sending too much data which may affect your AI service level.",{samplingRate:e},!0),e=100),this.sampleRate=e,this.samplingScoreGenerator=new Ac}return t.prototype.isSampledIn=function(e){var r=this.sampleRate,n=!1;return r==null||r>=100||e.baseType===Ve.dataType?!0:(n=this.samplingScoreGenerator.getSamplingScore(e)<r,n)},t}()});function Si(t){try{return t.responseText}catch(e){}return null}var Dn,Rc=C(()=>{ne();gc();Tc();wc();xe();J();Pc();kc();Te();Dn=function(t){H(e,t);function e(){var r=t.call(this)||this;r.priority=1001,r.identifier=Or,r._XMLHttpRequestSupported=!1;var n,i,a,o,c,s,u={};return W(e,r,function(l,f){function m(){Ae("Method not implemented.")}l.pause=m,l.resume=m,l.flush=function(){try{l.triggerSend(!0,null,1)}catch(d){l.diagLog().throwInternal(S.CRITICAL,h.FlushFailed,"flush failed, telemetry will not be collected: "+G(d),{exception:O(d)})}},l.onunloadFlush=function(){if((l._senderConfig.onunloadDisableBeacon()===!1||l._senderConfig.isBeaconApiDisabled()===!1)&&Fr())try{l.triggerSend(!0,p,2)}catch(d){l.diagLog().throwInternal(S.CRITICAL,h.FailedToSendQueuedTelemetry,"failed to flush with beacon sender on page unload, telemetry will not be collected: "+G(d),{exception:O(d)})}else l.flush()},l.teardown=m,l.addHeader=function(d,T){u[d]=T},l.initialize=function(d,T,A,D){f.initialize(d,T,A,D);var z=l._getTelCtx(),U=l.identifier;c=new Ec(T.logger),n=0,i=null,a=0,l._sender=null,s=0;var q=e._getDefaultAppInsightsChannelConfig();if(l._senderConfig=e._getEmptyAppInsightsChannelConfig(),Z(q,function(g,P){l._senderConfig[g]=function(){return z.getConfig(U,g,P())}}),l._buffer=l._senderConfig.enableSessionStorageBuffer()&&wt()?new mc(l.diagLog(),l._senderConfig):new dc(l._senderConfig),l._sample=new Fc(l._senderConfig.samplingPercentage(),l.diagLog()),dt(d)||l.diagLog().throwInternal(S.CRITICAL,h.InvalidInstrumentationKey,"Invalid Instrumentation key "+d.instrumentationKey),!Mr(l._senderConfig.endpointUrl())&&l._senderConfig.customHeaders()&&l._senderConfig.customHeaders().length>0&&R(l._senderConfig.customHeaders(),function(g){r.addHeader(g.header,g.value)}),!l._senderConfig.isBeaconApiDisabled()&&Fr())l._sender=p;else{var $=we("XMLHttpRequest");if($){var ie=new $;"withCredentials"in ie?(l._sender=v,l._XMLHttpRequestSupported=!0):typeof XDomainRequest!==Oe&&(l._sender=me)}else{var Ht=we("fetch");Ht&&(l._sender=y)}}},l.processTelemetry=function(d,T){T=l._getTelCtx(T);try{if(l._senderConfig.disableTelemetry())return;if(!d){T.diagLog().throwInternal(S.CRITICAL,h.CannotSendEmptyTelemetry,"Cannot send empty telemetry");return}if(d.baseData&&!d.baseType){T.diagLog().throwInternal(S.CRITICAL,h.InvalidEvent,"Cannot send telemetry without baseData and baseType");return}if(d.baseType||(d.baseType="EventData"),!l._sender){T.diagLog().throwInternal(S.CRITICAL,h.SenderNotInitialized,"Sender was not initialized");return}if(I(d))d[fr]=l._sample.sampleRate;else{T.diagLog().throwInternal(S.WARNING,h.TelemetrySampledAndNotSent,"Telemetry item was sampled out and not sent",{SampleRate:l._sample.sampleRate});return}var A=e.constructEnvelope(d,l._senderConfig.instrumentationKey(),T.diagLog());if(!A){T.diagLog().throwInternal(S.CRITICAL,h.CreateEnvelopeError,"Unable to create an AppInsights envelope");return}var D=!1;if(d.tags&&d.tags[Ut]&&(R(d.tags[Ut],function($){try{$&&$(A)===!1&&(D=!0,T.diagLog().warnToConsole("Telemetry processor check returns false"))}catch(ie){T.diagLog().throwInternal(S.CRITICAL,h.TelemetryInitializerFailed,"One of telemetry initializers failed, telemetry item will not be sent: "+G(ie),{exception:O(ie)},!0)}}),delete d.tags[Ut]),D)return;var z=c.serialize(A),U=l._buffer.getItems(),q=l._buffer.batchPayloads(U);q&&q.length+z.length>l._senderConfig.maxBatchSizeInBytes()&&l.triggerSend(!0,null,10),l._buffer.enqueue(z),Q()}catch($){T.diagLog().throwInternal(S.WARNING,h.FailedAddingTelemetryToBuffer,"Failed adding telemetry to the sender's buffer, some telemetry will be lost: "+G($),{exception:O($)})}l.processNext(d,T)},l._xhrReadyStateChange=function(d,T,A){d.readyState===4&&E(d.status,T,d.responseURL,A,X(d),Si(d)||d.response)},l.triggerSend=function(d,T,A){d===void 0&&(d=!0);try{if(l._senderConfig.disableTelemetry())l._buffer.clear();else{if(l._buffer.count()>0){var D=l._buffer.getItems();at(A||0,d),T?T.call(r,D,d):l._sender(D,d)}a=+new Date}clearTimeout(o),o=null,i=null}catch(U){var z=sr();(!z||z>9)&&l.diagLog().throwInternal(S.CRITICAL,h.TransmissionFailed,"Telemetry transmission failed, some telemetry will be lost: "+G(U),{exception:O(U)})}},l._onError=function(d,T,A){l.diagLog().throwInternal(S.WARNING,h.OnError,"Failed to send telemetry.",{message:T}),l._buffer.clearSent(d)},l._onPartialSuccess=function(d,T){for(var A=[],D=[],z=T.errors.reverse(),U=0,q=z;U<q.length;U++){var $=q[U],ie=d.splice($.index,1)[0];Se($.statusCode)?D.push(ie):A.push(ie)}d.length>0&&l._onSuccess(d,T.itemsAccepted),A.length>0&&l._onError(A,X(null,["partial success",T.itemsAccepted,"of",T.itemsReceived].join(" "))),D.length>0&&(L(D),l.diagLog().throwInternal(S.WARNING,h.TransmissionFailed,"Partial success. Delivered: "+d.length+", Failed: "+A.length+". Will retry to send "+D.length+" our of "+T.itemsReceived+" items"))},l._onSuccess=function(d,T){l._buffer.clearSent(d)},l._xdrOnLoad=function(d,T){var A=Si(d);if(d&&(A+""=="200"||A===""))n=0,l._onSuccess(T,0);else{var D=w(A);D&&D.itemsReceived&&D.itemsReceived>D.itemsAccepted&&!l._senderConfig.isRetryDisabled()?l._onPartialSuccess(T,D):l._onError(T,De(d))}};function I(d){return l._sample.isSampledIn(d)}function E(d,T,A,D,z,U){var q=null;if(l._appId||(q=w(U),q&&q.appId&&(l._appId=q.appId)),(d<200||d>=300)&&d!==0){if((d===301||d===307||d===308)&&!b(A)){l._onError(T,z);return}!l._senderConfig.isRetryDisabled()&&Se(d)?(L(T),l.diagLog().throwInternal(S.WARNING,h.TransmissionFailed,". Response code "+d+". Will retry to send "+T.length+" items.")):l._onError(T,z)}else if(no.isOffline()){if(!l._senderConfig.isRetryDisabled()){var $=10;L(T,$),l.diagLog().throwInternal(S.WARNING,h.TransmissionFailed,". Offline - Response Code: "+d+". Offline status: "+no.isOffline()+". Will retry to send "+T.length+" items.")}}else b(A),d===206?(q||(q=w(U)),q&&!l._senderConfig.isRetryDisabled()?l._onPartialSuccess(T,q):l._onError(T,z)):(n=0,l._onSuccess(T,D))}function b(d){return s>=10?!1:!x(d)&&d!==""&&d!==l._senderConfig.endpointUrl()?(l._senderConfig.endpointUrl=function(){return d},++s,!0):!1}function p(d,T){var A=l._senderConfig.endpointUrl(),D=l._buffer.batchPayloads(d),z=new Blob([D],{type:"text/plain;charset=UTF-8"}),U=Ue().sendBeacon(A,z);U?(l._buffer.markAsSent(d),l._onSuccess(d,d.length)):(v(d,!0),l.diagLog().throwInternal(S.WARNING,h.TransmissionFailed,". Failed to send telemetry with Beacon API, retried with xhrSender."))}function v(d,T){var A=new XMLHttpRequest,D=l._senderConfig.endpointUrl();try{A[Et]=!0}catch(U){}A.open("POST",D,T),A.setRequestHeader("Content-type","application/json"),Mr(D)&&A.setRequestHeader(te.sdkContextHeader,te.sdkContextHeaderAppIdRequest),R(Ze(u),function(U){A.setRequestHeader(U,u[U])}),A.onreadystatechange=function(){return l._xhrReadyStateChange(A,d,d.length)},A.onerror=function(U){return l._onError(d,X(A),U)};var z=l._buffer.batchPayloads(d);A.send(z),l._buffer.markAsSent(d)}function y(d,T){var A=l._senderConfig.endpointUrl(),D=l._buffer.batchPayloads(d),z=new Blob([D],{type:"text/plain;charset=UTF-8"}),U=new Headers;Mr(A)&&U.append(te.sdkContextHeader,te.sdkContextHeaderAppIdRequest),R(Ze(u),function(ie){U.append(ie,u[ie])});var q={method:"POST",headers:U,body:z},$=new Request(A,q);fetch($).then(function(ie){if(ie.ok)ie.text().then(function(Ht){E(ie.status,d,ie.url,d.length,ie.statusText,Ht)}),l._buffer.markAsSent(d);else throw Error(ie.statusText)}).catch(function(ie){l._onError(d,ie.message)})}function w(d){try{if(d&&d!==""){var T=Pe().parse(d);if(T&&T.itemsReceived&&T.itemsReceived>=T.itemsAccepted&&T.itemsReceived-T.itemsAccepted===T.errors.length)return T}}catch(A){l.diagLog().throwInternal(S.CRITICAL,h.InvalidBackendResponse,"Cannot parse the response. "+G(A),{response:d})}return null}function L(d,T){if(T===void 0&&(T=1),!(!d||d.length===0)){l._buffer.clearSent(d),n++;for(var A=0,D=d;A<D.length;A++){var z=D[A];l._buffer.enqueue(z)}F(T),Q()}}function F(d){var T=10,A;if(n<=1)A=T;else{var D=(Math.pow(2,n)-1)/2,z=Math.floor(Math.random()*D*T)+1;z=d*z,A=Math.max(Math.min(z,3600),T)}var U=de()+A*1e3;i=U}function Q(){if(!o){var d=i?Math.max(0,i-de()):0,T=Math.max(l._senderConfig.maxBatchInterval(),d);o=setTimeout(function(){l.triggerSend(!0,null,1)},T)}}function Se(d){return d===408||d===429||d===500||d===503}function X(d,T){return d?"XMLHttpRequest,Status:"+d.status+",Response:"+Si(d)||0||0:T}function me(d,T){var A=Ct(),D=new XDomainRequest;D.onload=function(){return l._xdrOnLoad(D,d)},D.onerror=function($){return l._onError(d,De(D),$)};var z=A&&A.location&&A.location.protocol||"";if(l._senderConfig.endpointUrl().lastIndexOf(z,0)!==0){l.diagLog().throwInternal(S.WARNING,h.TransmissionFailed,". Cannot send XDomain request. The endpoint URL protocol doesn't match the hosting page protocol."),l._buffer.clear();return}var U=l._senderConfig.endpointUrl().replace(/^(https?:)/,"");D.open("POST",U);var q=l._buffer.batchPayloads(d);D.send(q),l._buffer.markAsSent(d)}function De(d,T){return d?"XDomainRequest,Response:"+Si(d)||0:T}function pt(){var d="getNotifyMgr";return l.core[d]?l.core[d]():l.core._notificationManager}function at(d,T){var A=pt();if(A&&A.eventsSendRequest)try{A.eventsSendRequest(d,T)}catch(D){l.diagLog().throwInternal(S.CRITICAL,h.NotificationException,"send request notification failed: "+G(D),{exception:O(D)})}}function dt(d){var T=x(d.disableInstrumentationKeyValidation)?!1:d.disableInstrumentationKeyValidation;if(T)return!0;var A="^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",D=new RegExp(A);return D.test(d.instrumentationKey)}}),r}return e.constructEnvelope=function(r,n,i){var a;switch(n!==r.iKey&&!x(n)?a=yt({},r,{iKey:n}):a=r,a.baseType){case Be.dataType:return ro.EventEnvelopeCreator.Create(i,a);case $e.dataType:return Ic.TraceEnvelopeCreator.Create(i,a);case Fe.dataType:return Sc.PageViewEnvelopeCreator.Create(i,a);case Ye.dataType:return Cc.PageViewPerformanceEnvelopeCreator.Create(i,a);case he.dataType:return xc.ExceptionEnvelopeCreator.Create(i,a);case Ve.dataType:return yc.MetricEnvelopeCreator.Create(i,a);case qe.dataType:return hc.DependencyEnvelopeCreator.Create(i,a);default:return ro.EventEnvelopeCreator.Create(i,a)}},e._getDefaultAppInsightsChannelConfig=function(){return{endpointUrl:function(){return"https://dc.services.visualstudio.com/v2/track"},emitLineDelimitedJson:function(){return!1},maxBatchInterval:function(){return 15e3},maxBatchSizeInBytes:function(){return 102400},disableTelemetry:function(){return!1},enableSessionStorageBuffer:function(){return!0},isRetryDisabled:function(){return!1},isBeaconApiDisabled:function(){return!0},onunloadDisableBeacon:function(){return!1},instrumentationKey:function(){},namePrefix:function(){},samplingPercentage:function(){return 100},customHeaders:function(){}}},e._getEmptyAppInsightsChannelConfig=function(){return{endpointUrl:void 0,emitLineDelimitedJson:void 0,maxBatchInterval:void 0,maxBatchSizeInBytes:void 0,disableTelemetry:void 0,enableSessionStorageBuffer:void 0,isRetryDisabled:void 0,isBeaconApiDisabled:void 0,onunloadDisableBeacon:void 0,instrumentationKey:void 0,namePrefix:void 0,samplingPercentage:void 0,customHeaders:void 0}},e}(tt)});var io=C(()=>{Rc()});var dl,ao,Mc,Lc=C(()=>{Te();xe();J();dl="ai_session",ao=function(){function t(){}return t}(),Mc=function(){function t(e,r){var n=this,i,a,o=kt(r),c=ur(r);W(t,n,function(s){e||(e={}),j(e.sessionExpirationMs)||(e.sessionExpirationMs=function(){return t.acquisitionSpan}),j(e.sessionRenewalMs)||(e.sessionRenewalMs=function(){return t.renewalSpan}),s.config=e;var u=s.config.sessionCookiePostfix&&s.config.sessionCookiePostfix()?s.config.sessionCookiePostfix():s.config.namePrefix&&s.config.namePrefix()?s.config.namePrefix():"";i=function(){return dl+u},s.automaticSession=new ao,s.update=function(){var b=de(),p=!1,v=s.automaticSession;v.id||(p=!l(v,b));var y=s.config.sessionExpirationMs();if(!p&&y>0){var w=s.config.sessionRenewalMs(),L=b-v.acquisitionDate,F=b-v.renewalDate;p=L<0||F<0,p=p||L>y,p=p||F>w}p?m(b):(!a||b-a>t.cookieUpdateInterval)&&I(v,b)},s.backup=function(){var b=s.automaticSession;E(b.id,b.acquisitionDate,b.renewalDate)};function l(b,p){var v=!1,y=c.get(i());if(y&&j(y.split))v=f(b,y);else{var w=dn(o,i());w&&(v=f(b,w))}return v||!!b.id}function f(b,p){var v=!1,y=", session will be reset",w=p.split("|");if(w.length>=2)try{var L=+w[1]||0,F=+w[2]||0;isNaN(L)||L<=0?o.throwInternal(S.WARNING,h.SessionRenewalDateIsZero,"AI session acquisition date is 0"+y):isNaN(F)||F<=0?o.throwInternal(S.WARNING,h.SessionRenewalDateIsZero,"AI session renewal date is 0"+y):w[0]&&(b.id=w[0],b.acquisitionDate=L,b.renewalDate=F,v=!0)}catch(Q){o.throwInternal(S.CRITICAL,h.ErrorParsingAISessionCookie,"Error parsing ai_session value ["+(p||"")+"]"+y+" - "+G(Q),{exception:O(Q)})}return v}function m(b){var p=s.config||{},v=(p.getNewId?p.getNewId():null)||Jt;s.automaticSession.id=v(p.idLength?p.idLength():22),s.automaticSession.acquisitionDate=b,I(s.automaticSession,b),Rr()||o.throwInternal(S.WARNING,h.BrowserDoesNotSupportLocalStorage,"Browser does not support local storage. Session durations will be inaccurate.")}function I(b,p){var v=b.acquisitionDate;b.renewalDate=p;var y=s.config,w=y.sessionRenewalMs(),L=v+y.sessionExpirationMs()-p,F=[b.id,v,p],Q=0;L<w?Q=L/1e3:Q=w/1e3;var Se=y.cookieDomain?y.cookieDomain():null;c.set(i(),F.join("|"),y.sessionExpirationMs()>0?Q:null,Se),a=p}function E(b,p,v){mn(o,i(),[b,p,v].join("|"))}})}return t.acquisitionSpan=864e5,t.renewalSpan=18e5,t.cookieUpdateInterval=6e4,t}()});var Uc,_c=C(()=>{Uc=function(){function t(){}return t}()});var Oc,Hc=C(()=>{Oc=function(){function t(){this.id="browser",this.deviceClass="Browser"}return t}()});var ml,jc,zc=C(()=>{ml="2.6.4",jc=function(){function t(e){this.sdkVersion=(e.sdkExtension&&e.sdkExtension()?e.sdkExtension()+"_":"")+"javascript:"+ml}return t}()});function Bc(t){return!(typeof t!="string"||!t||t.match(/,|;|=| |\|/))}var Vc,qc=C(()=>{Te();xe();J();Vc=function(){function t(e,r){this.isNewUser=!1;var n=kt(r),i=ur(r),a;W(t,this,function(o){o.config=e;var c=o.config.userCookiePostfix&&o.config.userCookiePostfix()?o.config.userCookiePostfix():"";a=function(){return t.userCookieName+c};var s=i.get(a());if(s){o.isNewUser=!1;var u=s.split(t.cookieSeparator);u.length>0&&(o.id=u[0])}if(!o.id){var l=e||{},f=(l.getNewId?l.getNewId():null)||Jt;o.id=f(l.idLength?e.idLength():22);var m=31536e3,I=Me(new Date);o.accountAcquisitionDate=I,o.isNewUser=!0;var E=[o.id,I];i.set(a(),E.join(t.cookieSeparator),m);var b=e.namePrefix&&e.namePrefix()?e.namePrefix()+"ai_session":"ai_session";gn(n,b)}o.accountId=e.accountId?e.accountId():void 0;var p=i.get(t.authUserCookieName);if(p){p=decodeURI(p);var v=p.split(t.cookieSeparator);v[0]&&(o.authenticatedId=v[0]),v.length>1&&v[1]&&(o.accountId=v[1])}o.setAuthenticatedUserContext=function(y,w,L){L===void 0&&(L=!1);var F=!Bc(y)||w&&!Bc(w);if(F){n.throwInternal(S.WARNING,h.SetAuthContextFailedAccountName,"Setting auth user context failed. User auth/account id should be of type string, and not contain commas, semi-colons, equal signs, spaces, or vertical-bars.",!0);return}o.authenticatedId=y;var Q=o.authenticatedId;w&&(o.accountId=w,Q=[o.authenticatedId,o.accountId].join(t.cookieSeparator)),L&&i.set(t.authUserCookieName,encodeURI(Q))},o.clearAuthenticatedUserContext=function(){o.authenticatedId=null,o.accountId=null,i.del(t.authUserCookieName)}})}return t.cookieSeparator="|",t.userCookieName="ai_user",t.authUserCookieName="ai_authUser",t}()});var Gc,Kc=C(()=>{Gc=function(){function t(){}return t}()});var Wc,Jc=C(()=>{xe();J();Wc=function(){function t(e,r,n,i){var a=this;a.traceID=e||He(),a.parentID=r,a.name=n;var o=et();!n&&o&&o.pathname&&(a.name=o.pathname),a.name=ae(i,a.name)}return t}()});function Hr(t,e){t&&t[e]&&Ze(t[e]).length===0&&delete t[e]}var Ci,Ii,Xc,Qc=C(()=>{Te();J();Lc();xe();_c();Hc();zc();qc();Kc();Jc();Ci="ext",Ii="tags";Xc=function(){function t(e,r){var n=this,i=e.logger;this.appId=function(){return null},W(t,this,function(a){a.application=new Uc,a.internal=new jc(r),or()&&(a.sessionManager=new Mc(r,e),a.device=new Oc,a.location=new Gc,a.user=new Vc(r,e),a.telemetryTrace=new Wc(void 0,void 0,void 0,i),a.session=new ao),a.applySessionContext=function(o,c){var s=a.session,u=a.sessionManager;s&&_(s.id)?K(ge(o.ext,_e.AppExt),"sesId",s.id):u&&u.automaticSession&&K(ge(o.ext,_e.AppExt),"sesId",u.automaticSession.id,_)},a.applyOperatingSystemContxt=function(o,c){K(o.ext,_e.OSExt,a.os)},a.applyApplicationContext=function(o,c){var s=a.application;if(s){var u=ge(o,Ii);K(u,re.applicationVersion,s.ver,_),K(u,re.applicationBuild,s.build,_)}},a.applyDeviceContext=function(o,c){var s=a.device;if(s){var u=ge(ge(o,Ci),_e.DeviceExt);K(u,"localId",s.id,_),K(u,"ip",s.ip,_),K(u,"model",s.model,_),K(u,"deviceClass",s.deviceClass,_)}},a.applyInternalContext=function(o,c){var s=a.internal;if(s){var u=ge(o,Ii);K(u,re.internalAgentVersion,s.agentVersion,_),K(u,re.internalSdkVersion,s.sdkVersion,_),(o.baseType===Ft.dataType||o.baseType===Fe.dataType)&&(K(u,re.internalSnippet,s.snippetVer,_),K(u,re.internalSdkSrc,s.sdkSrc,_))}},a.applyLocationContext=function(o,c){var s=n.location;s&&K(ge(o,Ii,[]),re.locationIp,s.ip,_)},a.applyOperationContext=function(o,c){var s=a.telemetryTrace;if(s){var u=ge(ge(o,Ci),_e.TraceExt,{traceID:void 0,parentID:void 0});K(u,"traceID",s.traceID,_),K(u,"name",s.name,_),K(u,"parentID",s.parentID,_)}},a.applyWebContext=function(o,c){var s=n.web;s&&K(ge(o,Ci),_e.WebExt,s)},a.applyUserContext=function(o,c){var s=a.user;if(s){var u=ge(o,Ii,[]);K(u,re.userAccountId,s.accountId,_);var l=ge(ge(o,Ci),_e.UserExt);K(l,"id",s.id,_),K(l,"authId",s.authenticatedId,_)}},a.cleanUp=function(o,c){var s=o.ext;s&&(Hr(s,_e.DeviceExt),Hr(s,_e.UserExt),Hr(s,_e.WebExt),Hr(s,_e.OSExt),Hr(s,_e.AppExt),Hr(s,_e.TraceExt))}})}return t}()});var gl,An,$c=C(()=>{ne();Te();J();Qc();xe();gl=function(t){H(e,t);function e(){var r=t.call(this)||this;r.priority=110,r.identifier=Ot;var n,i;return W(e,r,function(a,o){a.initialize=function(s,u,l,f){o.initialize(s,u,l,f);var m=a._getTelCtx(),I=a.identifier,E=e.getDefaultConfig();i=i||{},Z(E,function(b,p){i[b]=function(){return m.getConfig(I,b,p())}}),a.context=new Xc(u,i),n=cn(l,Or),a.context.appId=function(){return n?n._appId:null},a._extConfig=i},a.processTelemetry=function(s,u){if(!x(s)){u=a._getTelCtx(u),s.name===Fe.envelopeType&&u.diagLog().resetInternalMessageCount();var l=a.context||{};if(l.session&&typeof a.context.session.id!="string"&&l.sessionManager&&l.sessionManager.update(),c(s,u),l.user&&l.user.isNewUser){l.user.isNewUser=!1;var f=new Ft(h.SendBrowserInfoOnUserInit,(Ue()||{}).userAgent||"");u.diagLog().logInternalMessage(S.CRITICAL,f)}a.processNext(s,u)}};function c(s,u){ge(s,"tags",[]),ge(s,"ext",{});var l=a.context;l.applySessionContext(s,u),l.applyApplicationContext(s,u),l.applyDeviceContext(s,u),l.applyOperationContext(s,u),l.applyUserContext(s,u),l.applyOperatingSystemContxt(s,u),l.applyWebContext(s,u),l.applyLocationContext(s,u),l.applyInternalContext(s,u),l.cleanUp(s,u)}}),r}return e.getDefaultConfig=function(){var r={instrumentationKey:function(){},accountId:function(){return null},sessionRenewalMs:function(){return 30*60*1e3},samplingPercentage:function(){return 100},sessionExpirationMs:function(){return 24*60*60*1e3},cookieDomain:function(){return null},sdkExtension:function(){return null},isBrowserLinkTrackingEnabled:function(){return!1},appId:function(){return null},namePrefix:function(){},sessionCookiePostfix:function(){},userCookiePostfix:function(){},idLength:function(){return 22},getNewId:function(){return null}};return r},e}(tt),An=gl});var oo=C(()=>{$c()});function Yc(t,e,r){var n=0,i=t[e],a=t[r];return i&&a&&(n=ve(i,a)),n}function yr(t,e,r,n,i){var a=0,o=Yc(r,n,i);return o&&(a=rr(t,e,Ke(o))),a}function rr(t,e,r){var n="ajaxPerf",i=0;if(t&&e&&r){var a=t[n]=t[n]||{};a[e]=r,i=1}return i}function vl(t,e){var r=t.perfTiming,n=e[nt]||{},i=0,a="name",o="Start",c="End",s="domainLookup",u="connect",l="redirect",f="request",m="response",I="duration",E="startTime",b=s+o,p=s+c,v=u+o,y=u+c,w=f+o,L=f+c,F=m+o,Q=m+c,Se=l+o,X=l=c,me="transferSize",De="encodedBodySize",pt="decodedBodySize",at="serverTiming";if(r){i|=yr(n,l,r,Se,X),i|=yr(n,s,r,b,p),i|=yr(n,u,r,v,y),i|=yr(n,f,r,w,L),i|=yr(n,m,r,F,Q),i|=yr(n,"networkConnect",r,E,y),i|=yr(n,"sentRequest",r,w,Q);var dt=r[I];dt||(dt=Yc(r,E,Q)||0),i|=rr(n,I,dt),i|=rr(n,"perfTotal",dt);var d=r[at];if(d){var T={};R(d,function(A,D){var z=Bi(A[a]||""+D),U=T[z]||{};Z(A,function(q,$){(q!==a&&_($)||ar($))&&(U[q]&&($=U[q]+";"+$),($||!_($))&&(U[q]=$))}),T[z]=U}),i|=rr(n,at,T)}i|=rr(n,me,r[me]),i|=rr(n,De,r[De]),i|=rr(n,pt,r[pt])}else t.perfMark&&(i|=rr(n,"missing",t.perfAttempts));i&&(e[nt]=n)}var nt,hl,so,Zc=C(()=>{xe();J();Te();nt="properties";hl=function(){function t(){var e=this;e.openDone=!1,e.setRequestHeaderDone=!1,e.sendDone=!1,e.abortDone=!1,e.stateChangeAttached=!1}return t}(),so=function(){function t(e,r,n){var i=this,a=n,o="responseText";i.perfMark=null,i.completed=!1,i.requestHeadersSize=null,i.requestHeaders=null,i.responseReceivingDuration=null,i.callbackDuration=null,i.ajaxTotalDuration=null,i.aborted=0,i.pageUrl=null,i.requestUrl=null,i.requestSize=0,i.method=null,i.status=null,i.requestSentTime=null,i.responseStartedTime=null,i.responseFinishedTime=null,i.callbackFinishedTime=null,i.endTime=null,i.xhrMonitoringState=new hl,i.clientFailure=0,i.traceID=e,i.spanID=r,W(t,i,function(c){c.getAbsoluteUrl=function(){return c.requestUrl?hn(c.requestUrl):null},c.getPathName=function(){return c.requestUrl?Tt(a,xn(c.method,c.requestUrl)):null},c.CreateTrackItem=function(s,u,l){if(c.ajaxTotalDuration=Math.round(ve(c.requestSentTime,c.responseFinishedTime)*1e3)/1e3,c.ajaxTotalDuration<0)return null;var f=(b={id:"|"+c.traceID+"."+c.spanID,target:c.getAbsoluteUrl(),name:c.getPathName(),type:s,startTime:null,duration:c.ajaxTotalDuration,success:+c.status>=200&&+c.status<400,responseCode:+c.status,method:c.method},b[nt]={HttpMethod:c.method},b);if(c.requestSentTime&&(f.startTime=new Date,f.startTime.setTime(c.requestSentTime)),vl(c,f),u&&Ze(c.requestHeaders).length>0&&(f[nt]=f[nt]||{},f[nt].requestHeaders=c.requestHeaders),l){var m=l();if(m){var I=m.correlationContext;if(I&&(f.correlationContext=I),m.headerMap&&Ze(m.headerMap).length>0&&(f[nt]=f[nt]||{},f[nt].responseHeaders=m.headerMap),c.status>=400){var E=m.type;f[nt]=f[nt]||{},(E===""||E==="text")&&(f[nt][o]=m[o]?m.statusText+" - "+m[o]:m.statusText),E==="json"&&(f[nt][o]=m.response?m.statusText+" - "+JSON.stringify(m.response):m.statusText)}}}return f;var b}})}return t}()});var hh,eu=C(()=>{J();J();hh=function(){function t(){}return t.GetLength=function(e){var r=0;if(!x(e)){var n="";try{n=e.toString()}catch(i){}r=n.length,r=isNaN(r)?0:r}return r},t}()});var co,tu=C(()=>{J();co=function(){function t(e,r){var n=this;n.traceFlag=t.DEFAULT_TRACE_FLAG,n.version=t.DEFAULT_VERSION,e&&t.isValidTraceId(e)?n.traceId=e:n.traceId=He(),r&&t.isValidSpanId(r)?n.spanId=r:n.spanId=He().substr(0,16)}return t.isValidTraceId=function(e){return e.match(/^[0-9a-f]{32}$/)&&e!=="00000000000000000000000000000000"},t.isValidSpanId=function(e){return e.match(/^[0-9a-f]{16}$/)&&e!=="0000000000000000"},t.prototype.toString=function(){var e=this;return e.version+"-"+e.traceId+"-"+e.spanId+"-"+e.traceFlag},t.DEFAULT_TRACE_FLAG="01",t.DEFAULT_VERSION="00",t}()});function xl(){var t=ot();return!t||x(t.Request)||x(t.Request[Ie])||x(t[Fn])?null:t[Fn]}function yl(t){var e=!1;if(typeof XMLHttpRequest!==Oe&&!x(XMLHttpRequest)){var r=XMLHttpRequest[Ie];e=!x(r)&&!x(r.open)&&!x(r.send)&&!x(r.abort)}var n=sr();if(n&&n<9&&(e=!1),e)try{var i=new XMLHttpRequest;i[it]={};var a=XMLHttpRequest[Ie].open;XMLHttpRequest[Ie].open=a}catch(o){e=!1,kn(t,h.FailedMonitorAjaxOpen,"Failed to enable XMLHttpRequest monitoring, extension is not supported",{exception:O(o)})}return e}function Ti(t){var e="";try{!x(t)&&!x(t[it])&&!x(t[it].requestUrl)&&(e+="(url: '"+t[it].requestUrl+"')")}catch(r){}return e}function kn(t,e,r,n,i){t[Nn]()[nu](S.CRITICAL,e,r,n,i)}function Ei(t,e,r,n,i){t[Nn]()[nu](S.WARNING,e,r,n,i)}function Rn(t,e,r){return function(n){kn(t,e,r,{ajaxDiagnosticsMessage:Ti(n.inst),exception:O(n.err)})}}function jr(t,e){return t&&e?t.indexOf(e):-1}var ru,Nn,it,nu,Fn,iu,Mn,au=C(()=>{ne();xe();J();Zc();eu();tu();Te();ru="ai.ajxmn.",Nn="diagLog",it="ajaxData",nu="throwInternal",Fn="fetch",iu=0;Mn=function(t){H(e,t);function e(){var r=t.call(this)||this;r.identifier=e.identifier,r.priority=120;var n="trackDependencyDataInternal",i=et(),a=!1,o=!1,c=i&&i.host&&i.host.toLowerCase(),s=e.getEmptyConfig(),u=!1,l=0,f,m,I,E,b=!1,p=0,v=!1,y=[],w={},L;return W(e,r,function(F,Q){F.initialize=function(g,P,N,k){if(!F.isInitialized()){Q.initialize(g,P,N,k);var M=F._getTelCtx(),V=e.getDefaultConfig();Z(V,function(Je,Sr){s[Je]=M.getConfig(e.identifier,Je,Sr)});var B=s.distributedTracingMode;if(u=s.enableRequestHeaderTracking,b=s.enableAjaxPerfTracking,p=s.maxAjaxCallsPerView,v=s.enableResponseHeaderTracking,L=s.excludeRequestFromAutoTrackingPatterns,I=B===We.AI||B===We.AI_AND_W3C,m=B===We.AI_AND_W3C||B===We.W3C,b){var Y=g.instrumentationKey||"unkwn";Y.length>5?E=ru+Y.substring(Y.length-5)+".":E=ru+Y+"."}if(s.disableAjaxTracking===!1&&De(),X(),N.length>0&&N){for(var ce=void 0,Ce=0;!ce&&Ce<N.length;)N[Ce]&&N[Ce].identifier===Ot&&(ce=N[Ce]),Ce++;ce&&(f=ce.context)}}},F.teardown=function(){R(y,function(g){g.rm()}),y=[],a=!1,o=!1,F.setInitialized(!1)},F.trackDependencyData=function(g,P){F[n](g,P)},F.includeCorrelationHeaders=function(g,P,N,k){var M=F._currentWindowHost||c;if(P){if(Pt.canIncludeCorrelationHeader(s,g.getAbsoluteUrl(),M)){if(N||(N={}),N.headers=new Headers(N.headers||(P instanceof Request?P.headers||{}:{})),I){var V="|"+g.traceID+"."+g.spanID;N.headers.set(te.requestIdHeader,V),u&&(g.requestHeaders[te.requestIdHeader]=V)}var B=s.appId||f&&f.appId();if(B&&(N.headers.set(te.requestContextHeader,te.requestContextAppIdFormat+B),u&&(g.requestHeaders[te.requestContextHeader]=te.requestContextAppIdFormat+B)),m){var Y=new co(g.traceID,g.spanID);N.headers.set(te.traceParentHeader,Y.toString()),u&&(g.requestHeaders[te.traceParentHeader]=Y.toString())}}return N}else if(k){if(Pt.canIncludeCorrelationHeader(s,g.getAbsoluteUrl(),M)){if(I){var V="|"+g.traceID+"."+g.spanID;k.setRequestHeader(te.requestIdHeader,V),u&&(g.requestHeaders[te.requestIdHeader]=V)}var B=s.appId||f&&f.appId();if(B&&(k.setRequestHeader(te.requestContextHeader,te.requestContextAppIdFormat+B),u&&(g.requestHeaders[te.requestContextHeader]=te.requestContextAppIdFormat+B)),m){var Y=new co(g.traceID,g.spanID);k.setRequestHeader(te.traceParentHeader,Y.toString()),u&&(g.requestHeaders[te.traceParentHeader]=Y.toString())}}return k}},F[n]=function(g,P,N){if(p===-1||l<p){(s.distributedTracingMode===We.W3C||s.distributedTracingMode===We.AI_AND_W3C)&&typeof g.id=="string"&&g.id[g.id.length-1]!=="."&&(g.id+="."),x(g.startTime)&&(g.startTime=new Date);var k=rt.create(g,qe.dataType,qe.envelopeType,F[Nn](),P,N);F.core.track(k)}else l===p&&kn(F,h.MaxAjaxPerPVExceeded,"Maximum ajax per page view limit reached, ajax monitoring is paused until the next trackPageView(). In order to increase the limit set the maxAjaxCallsPerView configuration parameter.",!0);++l};function Se(g){var P=!0;return(g||s.ignoreHeaders)&&R(s.ignoreHeaders,function(N){if(N.toLowerCase()===g.toLowerCase())return P=!1,-1}),P}function X(){var g=xl();if(!!g){var P=ot(),N=g.polyfill;s.disableFetchTracking===!1?(y.push(sn(P,Fn,{req:function(k,M,V){var B;if(a&&!pt(null,M,V)&&!(N&&o)){var Y=k.ctx();B=q(M,V);var ce=F.includeCorrelationHeaders(B,M,V);ce!==V&&k.set(1,ce),Y.data=B}},rsp:function(k,M){var V=k.ctx().data;V&&(k.rslt=k.rslt.then(function(B){return ie(k,(B||{}).status,B,V,function(){var Y={statusText:B.statusText,headerMap:null,correlationContext:Ht(B)};if(v){var ce={};B.headers.forEach(function(Ce,Je){Se(Je)&&(ce[Je]=Ce)}),Y.headerMap=ce}return Y}),B}).catch(function(B){throw ie(k,0,M,V,null,{error:B.message}),B}))},hkErr:Rn(F,h.FailedMonitorAjaxOpen,"Failed to monitor Window.fetch, monitoring data for this fetch call may be incorrect.")})),a=!0):N&&y.push(sn(P,Fn,{req:function(k,M,V){pt(null,M,V)}})),N&&(P[Fn].polyfill=N)}}function me(g,P,N){y.push(wa(g,P,N))}function De(){yl(F)&&!o&&(me(XMLHttpRequest,"open",{req:function(g,P,N,k){var M=g.inst,V=M[it];!pt(M,N)&&at(M,!0)&&(!V||!V.xhrMonitoringState.openDone)&&dt(M,P,N,k)},hkErr:Rn(F,h.FailedMonitorAjaxOpen,"Failed to monitor XMLHttpRequest.open, monitoring data for this ajax call may be incorrect.")}),me(XMLHttpRequest,"send",{req:function(g,P){var N=g.inst,k=N[it];at(N)&&!k.xhrMonitoringState.sendDone&&(z("xhr",k),k.requestSentTime=gr(),F.includeCorrelationHeaders(k,void 0,void 0,N),k.xhrMonitoringState.sendDone=!0)},hkErr:Rn(F,h.FailedMonitorAjaxSend,"Failed to monitor XMLHttpRequest, monitoring data for this ajax call may be incorrect.")}),me(XMLHttpRequest,"abort",{req:function(g){var P=g.inst,N=P[it];at(P)&&!N.xhrMonitoringState.abortDone&&(N.aborted=1,N.xhrMonitoringState.abortDone=!0)},hkErr:Rn(F,h.FailedMonitorAjaxAbort,"Failed to monitor XMLHttpRequest.abort, monitoring data for this ajax call may be incorrect.")}),u&&me(XMLHttpRequest,"setRequestHeader",{req:function(g,P,N){var k=g.inst;at(k)&&Se(P)&&(k[it].requestHeaders[P]=N)},hkErr:Rn(F,h.FailedMonitorAjaxSetRequestHeader,"Failed to monitor XMLHttpRequest.setRequestHeader, monitoring data for this ajax call may be incorrect.")}),o=!0)}function pt(g,P,N){var k=!1,M=((_(P)?P:(P||{}).url||"")||"").toLowerCase();if(R(L,function(Y){var ce=Y;_(Y)&&(ce=new RegExp(Y)),k||(k=ce.test(M))}),k)return k;var V=jr(M,"?"),B=jr(M,"#");return(V===-1||B!==-1&&B<V)&&(V=B),V!==-1&&(M=M.substring(0,V)),x(g)?x(P)||(k=(typeof P=="object"?P[Et]===!0:!1)||(N?N[Et]===!0:!1)):k=g[Et]===!0||M[Et]===!0,k?w[M]||(w[M]=1):w[M]&&(k=!0),k}function at(g,P){var N=!0,k=o;return x(g)||(N=P===!0||!x(g[it])),k&&N}function dt(g,P,N,k){var M=f&&f.telemetryTrace&&f.telemetryTrace.traceID||He(),V=He().substr(0,16),B=new so(M,V,F[Nn]());B.method=P,B.requestUrl=N,B.xhrMonitoringState.openDone=!0,B.requestHeaders={},B.async=k,g[it]=B,d(g)}function d(g){g[it].xhrMonitoringState.stateChangeAttached=Xt.Attach(g,"readystatechange",function(){try{g&&g.readyState===4&&at(g)&&A(g)}catch(N){var P=O(N);(!P||jr(P.toLowerCase(),"c00c023f")===-1)&&kn(F,h.FailedMonitorAjaxRSC,"Failed to monitor XMLHttpRequest 'readystatechange' event handler, monitoring data for this ajax call may be incorrect.",{ajaxDiagnosticsMessage:Ti(g),exception:P})}})}function T(g){try{var P=g.responseType;if(P===""||P==="text")return g.responseText}catch(N){}return null}function A(g){var P=g[it];P.responseFinishedTime=gr(),P.status=g.status;function N(k,M){var V=M||{};V.ajaxDiagnosticsMessage=Ti(g),k&&(V.exception=O(k)),Ei(F,h.FailedMonitorAjaxDur,"Failed to calculate the duration of the ajax call, monitoring data for this ajax call won't be sent.",V)}U("xmlhttprequest",P,function(){try{var k=P.CreateTrackItem("Ajax",u,function(){var M={statusText:g.statusText,headerMap:null,correlationContext:D(g),type:g.responseType,responseText:T(g),response:g.response};if(v){var V=g.getAllResponseHeaders();if(V){var B=oe(V).split(/[\r\n]+/),Y={};R(B,function(ce){var Ce=ce.split(": "),Je=Ce.shift(),Sr=Ce.join(": ");Se(Je)&&(Y[Je]=Sr)}),M.headerMap=Y}}return M});k?F[n](k):N(null,{requestSentTime:P.requestSentTime,responseFinishedTime:P.responseFinishedTime})}finally{try{g[it]=null}catch(M){}}},function(k){N(k,null)})}function D(g){try{var P=g.getAllResponseHeaders();if(P!==null){var N=jr(P.toLowerCase(),te.requestContextHeaderLowerCase);if(N!==-1){var k=g.getResponseHeader(te.requestContextHeader);return Pt.getCorrelationContext(k)}}}catch(M){Ei(F,h.FailedMonitorAjaxGetCorrelationHeader,"Failed to get Request-Context correlation header as it may be not included in the response or not accessible.",{ajaxDiagnosticsMessage:Ti(g),exception:O(M)})}}function z(g,P){if(P.requestUrl&&E&&b){var N=Qe();if(N&&j(N.mark)){iu++;var k=E+g+"#"+iu;N.mark(k);var M=N.getEntriesByName(k);M&&M.length===1&&(P.perfMark=M[0])}}}function U(g,P,N,k){var M=P.perfMark,V=Qe(),B=s.maxAjaxPerfLookupAttempts,Y=s.ajaxPerfLookupDelay,ce=P.requestUrl,Ce=0;(function Je(){try{if(V&&M){Ce++;for(var Sr=null,po=V.getEntries(),Pi=po.length-1;Pi>=0;Pi--){var bt=po[Pi];if(bt){if(bt.entryType==="resource")bt.initiatorType===g&&(jr(bt.name,ce)!==-1||jr(ce,bt.name)!==-1)&&(Sr=bt);else if(bt.entryType==="mark"&&bt.name===M.name){P.perfTiming=Sr;break}if(bt.startTime<M.startTime-1e3)break}}}!M||P.perfTiming||Ce>=B||P.async===!1?(M&&j(V.clearMarks)&&V.clearMarks(M.name),P.perfAttempts=Ce,N()):setTimeout(Je,Y)}catch(gu){k(gu)}})()}function q(g,P){var N=f&&f.telemetryTrace&&f.telemetryTrace.traceID||He(),k=He().substr(0,16),M=new so(N,k,F[Nn]());M.requestSentTime=gr(),g instanceof Request?M.requestUrl=g?g.url:"":M.requestUrl=g;var V="GET";P&&P.method?V=P.method:g&&g instanceof Request&&(V=g.method),M.method=V;var B={};if(u){var Y=new Headers((P?P.headers:0)||(g instanceof Request?g.headers||{}:{}));Y.forEach(function(ce,Ce){Se(Ce)&&(B[Ce]=ce)})}return M.requestHeaders=B,z("fetch",M),M}function $(g){var P="";try{x(g)||(typeof g=="string"?P+="(url: '"+g+"')":P+="(url: '"+g.url+"')")}catch(N){kn(F,h.FailedMonitorAjaxOpen,"Failed to grab failed fetch diagnostics message",{exception:O(N)})}return P}function ie(g,P,N,k,M,V){if(!k)return;function B(Y,ce,Ce){var Je=Ce||{};Je.fetchDiagnosticsMessage=$(N),ce&&(Je.exception=O(ce)),Ei(F,Y,"Failed to calculate the duration of the fetch call, monitoring data for this fetch call won't be sent.",Je)}k.responseFinishedTime=gr(),k.status=P,U("fetch",k,function(){var Y=k.CreateTrackItem("Fetch",u,M);Y?F[n](Y):B(h.FailedMonitorAjaxDur,null,{requestSentTime:k.requestSentTime,responseFinishedTime:k.responseFinishedTime})},function(Y){B(h.FailedMonitorAjaxGetCorrelationHeader,Y,null)})}function Ht(g){if(g&&g.headers)try{var P=g.headers.get(te.requestContextHeader);return Pt.getCorrelationContext(P)}catch(N){Ei(F,h.FailedMonitorAjaxGetCorrelationHeader,"Failed to get Request-Context correlation header as it may be not included in the response or not accessible.",{fetchDiagnosticsMessage:$(g),exception:O(N)})}}}),r}return e.getDefaultConfig=function(){var r={maxAjaxCallsPerView:500,disableAjaxTracking:!1,disableFetchTracking:!0,excludeRequestFromAutoTrackingPatterns:void 0,disableCorrelationHeaders:!1,distributedTracingMode:We.AI_AND_W3C,correlationHeaderExcludedDomains:["*.blob.core.windows.net","*.blob.core.chinacloudapi.cn","*.blob.core.cloudapi.de","*.blob.core.usgovcloudapi.net"],correlationHeaderDomains:void 0,correlationHeaderExcludePatterns:void 0,appId:void 0,enableCorsCorrelation:!1,enableRequestHeaderTracking:!1,enableResponseHeaderTracking:!1,enableAjaxErrorStatusText:!1,enableAjaxPerfTracking:!1,maxAjaxPerfLookupAttempts:3,ajaxPerfLookupDelay:25,ignoreHeaders:["Authorization","X-API-Key","WWW-Authenticate"]};return r},e.getEmptyConfig=function(){var r=this.getDefaultConfig();return Z(r,function(n){r[n]=void 0}),r},e.prototype.processTelemetry=function(r,n){this.processNext(r,n)},e.identifier="AjaxDependencyPlugin",e}(tt)});var uo=C(()=>{au()});var lo,ou,Sl,su,wi,fo=C(()=>{J();eo();io();oo();uo();xe();ou=["snippet","dependencies","properties","_snippetVersion","appInsightsNew","getSKUDefaults"],Sl={Default:0,Required:1,Array:2,Hidden:4},su={__proto__:null,PropertiesPluginIdentifier:Ot,BreezeChannelIdentifier:Or,AnalyticsPluginIdentifier:yi,Util:Sn,CorrelationIdHelper:Pt,UrlHelper:Oa,DateTimeUtils:Ha,ConnectionStringParser:za,FieldType:Sl,RequestHeaders:te,DisabledPropertyName:Et,ProcessLegacy:Ut,SampleRate:fr,HttpMethod:kr,DEFAULT_BREEZE_ENDPOINT:fn,AIData:In,AIBase:Cn,Envelope:Tn,Event:Be,Exception:he,Metric:Ve,PageView:Fe,PageViewData:vr,RemoteDependencyData:qe,Trace:$e,PageViewPerformance:Ye,Data:xt,SeverityLevel:_t,ConfigurationManager:Qa,ContextTagKeys:xr,DataSanitizer:Aa,TelemetryItemCreator:rt,CtxTagKeys:re,Extensions:_e,DistributedTracingModes:We},wi=function(){function t(e){var r=this;r._snippetVersion=""+(e.sv||e.version||""),e.queue=e.queue||[],e.version=e.version||2;var n=e.config||{};if(n.connectionString){var i=di(n.connectionString),a=i.ingestionendpoint;n.endpointUrl=a?a+"/v2/track":n.endpointUrl,n.instrumentationKey=i.instrumentationkey||n.instrumentationKey}r.appInsights=new bn,r.properties=new An,r.dependencies=new Mn,r.core=new en,r._sender=new Dn,r.snippet=e,r.config=n,r.getSKUDefaults()}return t.prototype.getCookieMgr=function(){return this.appInsights.getCookieMgr()},t.prototype.trackEvent=function(e,r){this.appInsights.trackEvent(e,r)},t.prototype.trackPageView=function(e){var r=e||{};this.appInsights.trackPageView(r)},t.prototype.trackPageViewPerformance=function(e){var r=e||{};this.appInsights.trackPageViewPerformance(r)},t.prototype.trackException=function(e){e&&!e.exception&&e.error&&(e.exception=e.error),this.appInsights.trackException(e)},t.prototype._onerror=function(e){this.appInsights._onerror(e)},t.prototype.trackTrace=function(e,r){this.appInsights.trackTrace(e,r)},t.prototype.trackMetric=function(e,r){this.appInsights.trackMetric(e,r)},t.prototype.startTrackPage=function(e){this.appInsights.startTrackPage(e)},t.prototype.stopTrackPage=function(e,r,n,i){this.appInsights.stopTrackPage(e,r,n,i)},t.prototype.startTrackEvent=function(e){this.appInsights.startTrackEvent(e)},t.prototype.stopTrackEvent=function(e,r,n){this.appInsights.stopTrackEvent(e,r,n)},t.prototype.addTelemetryInitializer=function(e){return this.appInsights.addTelemetryInitializer(e)},t.prototype.setAuthenticatedUserContext=function(e,r,n){n===void 0&&(n=!1),this.properties.context.user.setAuthenticatedUserContext(e,r,n)},t.prototype.clearAuthenticatedUserContext=function(){this.properties.context.user.clearAuthenticatedUserContext()},t.prototype.trackDependencyData=function(e){this.dependencies.trackDependencyData(e)},t.prototype.flush=function(e){var r=this;e===void 0&&(e=!0),ct(this.core,function(){return"AISKU.flush"},function(){R(r.core.getTransmissionControls(),function(n){R(n,function(i){i.flush(e)})})},null,e)},t.prototype.onunloadFlush=function(e){e===void 0&&(e=!0),R(this.core.getTransmissionControls(),function(r){R(r,function(n){n.onunloadFlush?n.onunloadFlush():n.flush(e)})})},t.prototype.loadAppInsights=function(e,r,n){var i=this;e===void 0&&(e=!1);var a=this;function o(c){if(c){var s="";x(a._snippetVersion)||(s+=a._snippetVersion),e&&(s+=".lg"),a.context&&a.context.internal&&(a.context.internal.snippetVer=s||"-"),Z(a,function(u,l){_(u)&&!j(l)&&u&&u[0]!=="_"&&ou.indexOf(u)===-1&&(c[u]=l)})}}return e&&a.config.extensions&&a.config.extensions.length>0&&Ae("Extensions not allowed in legacy mode"),ct(a.core,function(){return"AISKU.loadAppInsights"},function(){var c=[];c.push(a._sender),c.push(a.properties),c.push(a.dependencies),c.push(a.appInsights),a.core.initialize(a.config,c,r,n),a.context=a.properties.context,lo&&a.context&&(a.context.internal.sdkSrc=lo),o(a.snippet),a.emptyQueue(),a.pollInternalLogs(),a.addHousekeepingBeforeUnload(i)}),a},t.prototype.updateSnippetDefinitions=function(e){Wr(e,this,function(r){return r&&ou.indexOf(r)===-1})},t.prototype.emptyQueue=function(){var e=this;try{if(Re(e.snippet.queue)){for(var r=e.snippet.queue.length,n=0;n<r;n++){var i=e.snippet.queue[n];i()}e.snippet.queue=void 0,delete e.snippet.queue}}catch(o){var a={};o&&j(o.toString)&&(a.exception=o.toString())}},t.prototype.pollInternalLogs=function(){this.core.pollInternalLogs()},t.prototype.addHousekeepingBeforeUnload=function(e){if(or()||Wn()){var r=function(){e.onunloadFlush(!1),R(e.appInsights.core._extensions,function(i){if(i.identifier===Ot)return i&&i.context&&i.context._sessionManager&&i.context._sessionManager.backup(),-1})};if(!e.appInsights.config.disableFlushOnBeforeUnload){var n=Mt("beforeunload",r);n=Mt("unload",r)||n,n=Mt("pagehide",r)||n,n=Mt("visibilitychange",r)||n,!n&&!ea()&&e.appInsights.core.logger.throwInternal(S.CRITICAL,h.FailedToAddHandlerForOnBeforeUnload,"Could not add handler for beforeunload and pagehide")}e.appInsights.config.disableFlushOnUnload||(Mt("pagehide",r),Mt("visibilitychange",r))}},t.prototype.getSender=function(){return this._sender},t.prototype.getSKUDefaults=function(){var e=this;e.config.diagnosticLogInterval=e.config.diagnosticLogInterval&&e.config.diagnosticLogInterval>0?e.config.diagnosticLogInterval:1e4},t}();(function(){var t=null,e=!1,r=["://js.monitor.azure.com/","://az416426.vo.msecnd.net/"];try{var n=(document||{}).currentScript;n&&(t=n.src)}catch(c){}if(t)try{var i=t.toLowerCase();if(i){for(var a="",o=0;o<r.length;o++)if(i.indexOf(r[o])!==-1){a="cdn"+(o+1),i.indexOf("/scripts/")===-1&&(i.indexOf("/next/")!==-1?a+="-next":i.indexOf("/beta/")!==-1&&(a+="-beta")),lo=a+(e?".mod":"");break}}}catch(c){}})()});var Cl,cu,uu=C(()=>{xe();J();Cl=["snippet","getDefaultConfig","_hasLegacyInitializers","_queue","_processLegacyInitializers"],cu=function(){function t(e,r){this._hasLegacyInitializers=!1,this._queue=[],this.config=t.getDefaultConfig(e.config),this.appInsightsNew=r,this.context={addTelemetryInitializer:this.addTelemetryInitializers.bind(this)}}return t.getDefaultConfig=function(e){return e||(e={}),e.endpointUrl=e.endpointUrl||"https://dc.services.visualstudio.com/v2/track",e.sessionRenewalMs=30*60*1e3,e.sessionExpirationMs=24*60*60*1e3,e.maxBatchSizeInBytes=e.maxBatchSizeInBytes>0?e.maxBatchSizeInBytes:102400,e.maxBatchInterval=isNaN(e.maxBatchInterval)?15e3:e.maxBatchInterval,e.enableDebug=ee(e.enableDebug),e.disableExceptionTracking=ee(e.disableExceptionTracking),e.disableTelemetry=ee(e.disableTelemetry),e.verboseLogging=ee(e.verboseLogging),e.emitLineDelimitedJson=ee(e.emitLineDelimitedJson),e.diagnosticLogInterval=e.diagnosticLogInterval||1e4,e.autoTrackPageVisitTime=ee(e.autoTrackPageVisitTime),(isNaN(e.samplingPercentage)||e.samplingPercentage<=0||e.samplingPercentage>=100)&&(e.samplingPercentage=100),e.disableAjaxTracking=ee(e.disableAjaxTracking),e.maxAjaxCallsPerView=isNaN(e.maxAjaxCallsPerView)?500:e.maxAjaxCallsPerView,e.isBeaconApiDisabled=ee(e.isBeaconApiDisabled,!0),e.disableCorrelationHeaders=ee(e.disableCorrelationHeaders),e.correlationHeaderExcludedDomains=e.correlationHeaderExcludedDomains||["*.blob.core.windows.net","*.blob.core.chinacloudapi.cn","*.blob.core.cloudapi.de","*.blob.core.usgovcloudapi.net"],e.disableFlushOnBeforeUnload=ee(e.disableFlushOnBeforeUnload),e.disableFlushOnUnload=ee(e.disableFlushOnUnload,e.disableFlushOnBeforeUnload),e.enableSessionStorageBuffer=ee(e.enableSessionStorageBuffer,!0),e.isRetryDisabled=ee(e.isRetryDisabled),e.isCookieUseDisabled=ee(e.isCookieUseDisabled),e.isStorageUseDisabled=ee(e.isStorageUseDisabled),e.isBrowserLinkTrackingEnabled=ee(e.isBrowserLinkTrackingEnabled),e.enableCorsCorrelation=ee(e.enableCorsCorrelation),e},t.prototype.addTelemetryInitializers=function(e){var r=this;this._hasLegacyInitializers||(this.appInsightsNew.addTelemetryInitializer(function(n){r._processLegacyInitializers(n)}),this._hasLegacyInitializers=!0),this._queue.push(e)},t.prototype.getCookieMgr=function(){return this.appInsightsNew.getCookieMgr()},t.prototype.startTrackPage=function(e){this.appInsightsNew.startTrackPage(e)},t.prototype.stopTrackPage=function(e,r,n,i){this.appInsightsNew.stopTrackPage(e,r,n)},t.prototype.trackPageView=function(e,r,n,i,a){var o={name:e,uri:r,properties:n,measurements:i};this.appInsightsNew.trackPageView(o)},t.prototype.trackEvent=function(e,r,n){this.appInsightsNew.trackEvent({name:e})},t.prototype.trackDependency=function(e,r,n,i,a,o,c){this.appInsightsNew.trackDependencyData({id:e,target:n,type:i,duration:a,properties:{HttpMethod:r},success:o,responseCode:c})},t.prototype.trackException=function(e,r,n,i,a){this.appInsightsNew.trackException({exception:e})},t.prototype.trackMetric=function(e,r,n,i,a,o){this.appInsightsNew.trackMetric({name:e,average:r,sampleCount:n,min:i,max:a})},t.prototype.trackTrace=function(e,r,n){this.appInsightsNew.trackTrace({message:e,severityLevel:n})},t.prototype.flush=function(e){this.appInsightsNew.flush(e)},t.prototype.setAuthenticatedUserContext=function(e,r,n){this.appInsightsNew.context.user.setAuthenticatedUserContext(e,r,n)},t.prototype.clearAuthenticatedUserContext=function(){this.appInsightsNew.context.user.clearAuthenticatedUserContext()},t.prototype._onerror=function(e,r,n,i,a){this.appInsightsNew._onerror({message:e,url:r,lineNumber:n,columnNumber:i,error:a})},t.prototype.startTrackEvent=function(e){this.appInsightsNew.startTrackEvent(e)},t.prototype.stopTrackEvent=function(e,r,n){this.appInsightsNew.stopTrackEvent(e,r,n)},t.prototype.downloadAndSetup=function(e){Ae("downloadAndSetup not implemented in web SKU")},t.prototype.updateSnippetDefinitions=function(e){Wr(e,this,function(r){return r&&Cl.indexOf(r)===-1})},t.prototype.loadAppInsights=function(){var e=this;if(this.config.iKey){var r=this.trackPageView;this.trackPageView=function(a,o,c){r.apply(e,[null,a,o,c])}}var n="logPageView";typeof this.snippet[n]=="function"&&(this[n]=function(a,o,c){e.trackPageView(null,a,o,c)});var i="logEvent";return typeof this.snippet[i]=="function"&&(this[i]=function(a,o,c){e.trackEvent(a,o,c)}),this},t.prototype._processLegacyInitializers=function(e){return e.tags[Ut]=this._queue,e},t}()});var lu,fu=C(()=>{uu();fo();J();lu=function(){function t(){}return t.getAppInsights=function(e,r){var n=new wi(e),i=r!==2;if(Qt(),r===2)return n.updateSnippetDefinitions(e),n.loadAppInsights(i),n;var a=new cu(e,n);return a.updateSnippetDefinitions(e),n.loadAppInsights(i),a},t}()});var pu={};hu(pu,{AppInsightsCore:()=>en,ApplicationAnalytics:()=>bn,ApplicationInsights:()=>wi,ApplicationInsightsContainer:()=>lu,BaseCore:()=>Yr,BaseTelemetryPlugin:()=>tt,CoreUtils:()=>on,DependenciesPlugin:()=>Mn,DistributedTracingModes:()=>We,Event:()=>Be,Exception:()=>he,LoggingSeverity:()=>S,Metric:()=>Ve,NotificationManager:()=>Zr,PageView:()=>Fe,PageViewPerformance:()=>Ye,PerfEvent:()=>cr,PerfManager:()=>Jr,PropertiesPlugin:()=>An,RemoteDependencyData:()=>qe,Sender:()=>Dn,SeverityLevel:()=>_t,Telemetry:()=>su,Trace:()=>$e,Util:()=>Sn,_InternalMessageId:()=>h,doPerf:()=>ct});var du=C(()=>{fo();fu();J();xe();io();eo();oo();uo()});var Ge;(function(r){r.ON="on",r.OFF="off"})(Ge||(Ge={}));function jt(){let t="telemetry",e="enableTelemetry";return vscode__WEBPACK_IMPORTED_MODULE_0__.env.isTelemetryEnabled!==void 0?vscode__WEBPACK_IMPORTED_MODULE_0__.env.isTelemetryEnabled?Ge.ON:Ge.OFF:vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration(t).get(e)?Ge.ON:Ge.OFF}var bi=class{constructor(e,r){this._isInstantiated=!1;this._eventQueue=[];this._exceptionQueue=[];this._clientFactory=r,this._key=e,jt()!==Ge.OFF&&this.instantiateAppender()}logEvent(e,r){if(!this._telemetryClient){!this._isInstantiated&&jt()===Ge.ON&&this._eventQueue.push({eventName:e,data:r});return}this._telemetryClient.logEvent(e,r)}logException(e,r){if(!this._telemetryClient){!this._isInstantiated&&jt()!==Ge.OFF&&this._exceptionQueue.push({exception:e,data:r});return}this._telemetryClient.logException(e,r)}async flush(){this._telemetryClient&&(await this._telemetryClient.flush(),this._telemetryClient=void 0)}_flushQueues(){this._eventQueue.forEach(({eventName:e,data:r})=>this.logEvent(e,r)),this._eventQueue=[],this._exceptionQueue.forEach(({exception:e,data:r})=>this.logException(e,r)),this._exceptionQueue=[]}instantiateAppender(){this._isInstantiated||this._clientFactory(this._key).then(e=>{this._telemetryClient=e,this._isInstantiated=!0,this._flushQueues()}).catch(e=>{console.error(e)})}};var Di=class{constructor(e,r,n,i,a){this.extensionId=e;this.extensionVersion=r;this.telemetryAppender=n;this.osShim=i;this.firstParty=!1;this.userOptIn=!1;this.errorOptIn=!1;this.disposables=[];this.firstParty=!!a,this.updateUserOptStatus(),vscode__WEBPACK_IMPORTED_MODULE_0__.env.onDidChangeTelemetryEnabled!==void 0?(this.disposables.push(vscode__WEBPACK_IMPORTED_MODULE_0__.env.onDidChangeTelemetryEnabled(()=>this.updateUserOptStatus())),this.disposables.push(vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.onDidChangeConfiguration(()=>this.updateUserOptStatus()))):this.disposables.push(vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.onDidChangeConfiguration(()=>this.updateUserOptStatus()))}updateUserOptStatus(){let e=jt();this.userOptIn=e===Ge.ON,this.errorOptIn=e===Ge.ON,(this.userOptIn||this.errorOptIn)&&this.telemetryAppender.instantiateAppender()}cleanRemoteName(e){if(!e)return"none";let r="other";return["ssh-remote","dev-container","attached-container","wsl","codespaces"].forEach(n=>{e.indexOf(`${n}+`)===0&&(r=n)}),r}get extension(){return this._extension===void 0&&(this._extension=vscode__WEBPACK_IMPORTED_MODULE_0__.extensions.getExtension(this.extensionId)),this._extension}cloneAndChange(e,r){if(e===null||typeof e!="object"||typeof r!="function")return e;let n={};for(let i in e)n[i]=r(i,e[i]);return n}shouldSendErrorTelemetry(){return this.errorOptIn===!1?!1:this.firstParty?this.cleanRemoteName(vscode__WEBPACK_IMPORTED_MODULE_0__.env.remoteName)!=="other"?!0:!(this.extension===void 0||this.extension.extensionKind===vscode__WEBPACK_IMPORTED_MODULE_0__.ExtensionKind.Workspace||vscode__WEBPACK_IMPORTED_MODULE_0__.env.uiKind===vscode__WEBPACK_IMPORTED_MODULE_0__.UIKind.Web):!0}getCommonProperties(){let e=Object.create(null);if(e["common.os"]=this.osShim.platform,e["common.platformversion"]=(this.osShim.release||"").replace(/^(\d+)(\.\d+)?(\.\d+)?(.*)/,"$1$2$3"),e["common.extname"]=this.extensionId,e["common.extversion"]=this.extensionVersion,vscode__WEBPACK_IMPORTED_MODULE_0__&&vscode__WEBPACK_IMPORTED_MODULE_0__.env){switch(e["common.vscodemachineid"]=vscode__WEBPACK_IMPORTED_MODULE_0__.env.machineId,e["common.vscodesessionid"]=vscode__WEBPACK_IMPORTED_MODULE_0__.env.sessionId,e["common.vscodeversion"]=vscode__WEBPACK_IMPORTED_MODULE_0__.version,e["common.isnewappinstall"]=vscode__WEBPACK_IMPORTED_MODULE_0__.env.isNewAppInstall?vscode__WEBPACK_IMPORTED_MODULE_0__.env.isNewAppInstall.toString():"false",e["common.product"]=vscode__WEBPACK_IMPORTED_MODULE_0__.env.appHost,vscode__WEBPACK_IMPORTED_MODULE_0__.env.uiKind){case vscode__WEBPACK_IMPORTED_MODULE_0__.UIKind.Web:e["common.uikind"]="web";break;case vscode__WEBPACK_IMPORTED_MODULE_0__.UIKind.Desktop:e["common.uikind"]="desktop";break;default:e["common.uikind"]="unknown"}e["common.remotename"]=this.cleanRemoteName(vscode__WEBPACK_IMPORTED_MODULE_0__.env.remoteName)}return e}anonymizeFilePaths(e,r){let n;if(e==null)return"";let i=[];vscode__WEBPACK_IMPORTED_MODULE_0__.env.appRoot!==""&&i.push(new RegExp(vscode__WEBPACK_IMPORTED_MODULE_0__.env.appRoot.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi")),this.extension&&i.push(new RegExp(this.extension.extensionPath.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi"));let a=e;if(r){let o=[];for(let l of i)for(;(n=l.exec(e))&&n;)o.push([n.index,l.lastIndex]);let c=/^[\\/]?(node_modules|node_modules\.asar)[\\/]/,s=/(file:\/\/)?([a-zA-Z]:(\\\\|\\|\/)|(\\\\|\\|\/))?([\w-._]+(\\\\|\\|\/))+[\w-._]*/g,u=0;for(a="";(n=s.exec(e))&&n;)n[0]&&!c.test(n[0])&&o.every(([l,f])=>n.index<l||n.index>=f)&&(a+=e.substring(u,n.index)+"<REDACTED: user-file-path>",u=s.lastIndex);u<e.length&&(a+=e.substr(u))}for(let o of i)a=a.replace(o,"");return a}removePropertiesWithPossibleUserInfo(e){if(typeof e!="object")return;let r=Object.create(null);for(let n of Object.keys(e)){let i=e[n];if(!i)continue;let a=/@[a-zA-Z0-9-.]+/;/\S*(key|token|sig|password|passwd|pwd)[="':\s]+\S*/.test(i.toLowerCase())?r[n]="<REDACTED: secret>":a.test(i)?r[n]="<REDACTED: email>":r[n]=i}return r}sendTelemetryEvent(e,r,n){if(this.userOptIn&&e!==""){r={...r,...this.getCommonProperties()};let i=this.cloneAndChange(r,(a,o)=>this.anonymizeFilePaths(o,this.firstParty));this.telemetryAppender.logEvent(`${this.extensionId}/${e}`,{properties:this.removePropertiesWithPossibleUserInfo(i),measurements:n})}}sendRawTelemetryEvent(e,r,n){this.userOptIn&&e!==""&&(r={...r,...this.getCommonProperties()},this.telemetryAppender.logEvent(`${this.extensionId}/${e}`,{properties:r,measurements:n}))}sendTelemetryErrorEvent(e,r,n,i){if(this.errorOptIn&&e!==""){r={...r,...this.getCommonProperties()};let a=this.cloneAndChange(r,(o,c)=>this.shouldSendErrorTelemetry()?this.anonymizeFilePaths(c,this.firstParty):i===void 0||i.indexOf(o)!==-1?"REDACTED":this.anonymizeFilePaths(c,this.firstParty));this.telemetryAppender.logEvent(`${this.extensionId}/${e}`,{properties:this.removePropertiesWithPossibleUserInfo(a),measurements:n})}}sendTelemetryException(e,r,n){if(this.shouldSendErrorTelemetry()&&this.errorOptIn&&e){r={...r,...this.getCommonProperties()};let i=this.cloneAndChange(r,(a,o)=>this.anonymizeFilePaths(o,this.firstParty));e.stack&&(e.stack=this.anonymizeFilePaths(e.stack,this.firstParty)),this.telemetryAppender.logException(e,{properties:this.removePropertiesWithPossibleUserInfo(i),measurements:n})}}dispose(){return this.telemetryAppender.flush(),Promise.all(this.disposables.map(e=>e.dispose()))}};var Il=async t=>{let e;try{let n=await Promise.resolve().then(()=>(du(),pu)),i;t&&t.indexOf("AIF-")===0&&(i="https://vortex.data.microsoft.com/collect/v1"),e=new n.ApplicationInsights({config:{instrumentationKey:t,endpointUrl:i,disableAjaxTracking:!0,disableExceptionTracking:!0,disableFetchTracking:!0,disableCorrelationHeaders:!0,disableCookiesUsage:!0,autoTrackPageVisitTime:!1,emitLineDelimitedJson:!0,disableInstrumentationKeyValidation:!0}}),e.loadAppInsights();let a=jt();i&&a===Ge.ON&&fetch(i).catch(()=>e=void 0)}catch(n){return Promise.reject(n)}return{logEvent:(n,i)=>{e?.trackEvent({name:n},{...i?.properties,...i?.measurements})},logException:(n,i)=>{e?.trackException({exception:n,properties:{...i?.properties,...i?.measurements}})},flush:async()=>{e?.flush()}}},mu=class extends Di{constructor(e,r,n,i){let a=new bi(n,Il);n&&n.indexOf("AIF-")===0&&(i=!0);super(e,r,a,{release:navigator.appVersion,platform:"web"},i)}};
/*!
 * Microsoft Dynamic Proto Utility, 1.1.4
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */


/***/ }),
/* 90 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
const vscode = __webpack_require__(1);
var Trace;
(function (Trace) {
    Trace[Trace["Off"] = 0] = "Off";
    Trace[Trace["Messages"] = 1] = "Messages";
    Trace[Trace["Verbose"] = 2] = "Verbose";
})(Trace || (Trace = {}));
(function (Trace) {
    function fromString(value) {
        value = value.toLowerCase();
        switch (value) {
            case 'off':
                return Trace.Off;
            case 'messages':
                return Trace.Messages;
            case 'verbose':
                return Trace.Verbose;
            default:
                return Trace.Off;
        }
    }
    Trace.fromString = fromString;
})(Trace || (Trace = {}));
class Tracer {
    constructor(logger) {
        this.logger = logger;
        this.updateConfiguration();
    }
    updateConfiguration() {
        this.trace = Tracer.readTrace();
    }
    static readTrace() {
        let result = Trace.fromString(vscode.workspace.getConfiguration().get('typescript.tsserver.trace', 'off'));
        if (result === Trace.Off && !!{}.TSS_TRACE) {
            result = Trace.Messages;
        }
        return result;
    }
    traceRequest(serverId, request, responseExpected, queueLength) {
        if (this.trace === Trace.Off) {
            return;
        }
        let data = undefined;
        if (this.trace === Trace.Verbose && request.arguments) {
            data = `Arguments: ${JSON.stringify(request.arguments, null, 4)}`;
        }
        this.logTrace(serverId, `Sending request: ${request.command} (${request.seq}). Response expected: ${responseExpected ? 'yes' : 'no'}. Current queue length: ${queueLength}`, data);
    }
    traceResponse(serverId, response, meta) {
        if (this.trace === Trace.Off) {
            return;
        }
        let data = undefined;
        if (this.trace === Trace.Verbose && response.body) {
            data = `Result: ${JSON.stringify(response.body, null, 4)}`;
        }
        this.logTrace(serverId, `Response received: ${response.command} (${response.request_seq}). Request took ${Date.now() - meta.queuingStartTime} ms. Success: ${response.success} ${!response.success ? '. Message: ' + response.message : ''}`, data);
    }
    traceRequestCompleted(serverId, command, request_seq, meta) {
        if (this.trace === Trace.Off) {
            return;
        }
        this.logTrace(serverId, `Async response received: ${command} (${request_seq}). Request took ${Date.now() - meta.queuingStartTime} ms.`);
    }
    traceEvent(serverId, event) {
        if (this.trace === Trace.Off) {
            return;
        }
        let data = undefined;
        if (this.trace === Trace.Verbose && event.body) {
            data = `Data: ${JSON.stringify(event.body, null, 4)}`;
        }
        this.logTrace(serverId, `Event received: ${event.event} (${event.seq}).`, data);
    }
    logTrace(serverId, message, data) {
        if (this.trace !== Trace.Off) {
            this.logger.logLevel('Trace', `<${serverId}> ${message}`, data);
        }
    }
}
exports.default = Tracer;


/***/ }),
/* 91 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IntellisenseStatus = void 0;
const vscode = __webpack_require__(1);
const nls = __webpack_require__(9);
const typescriptService_1 = __webpack_require__(32);
const dispose_1 = __webpack_require__(20);
const languageModeIds_1 = __webpack_require__(14);
const tsconfig_1 = __webpack_require__(7);
const localize = nls.loadMessageBundle();
var IntellisenseState;
(function (IntellisenseState) {
    IntellisenseState.None = Object.freeze({ type: 0 /* None */ });
    IntellisenseState.SyntaxOnly = Object.freeze({ type: 3 /* SyntaxOnly */ });
    class Pending {
        constructor(resource, projectType) {
            this.resource = resource;
            this.projectType = projectType;
            this.type = 1 /* Pending */;
            this.cancellation = new vscode.CancellationTokenSource();
        }
    }
    IntellisenseState.Pending = Pending;
    class Resolved {
        constructor(resource, projectType, configFile) {
            this.resource = resource;
            this.projectType = projectType;
            this.configFile = configFile;
            this.type = 2 /* Resolved */;
        }
    }
    IntellisenseState.Resolved = Resolved;
})(IntellisenseState || (IntellisenseState = {}));
class IntellisenseStatus extends dispose_1.Disposable {
    constructor(_client, commandManager, _activeTextEditorManager) {
        super();
        this._client = _client;
        this._activeTextEditorManager = _activeTextEditorManager;
        this.openOpenConfigCommandId = '_typescript.openConfig';
        this.createConfigCommandId = '_typescript.createConfig';
        this._ready = false;
        this._state = IntellisenseState.None;
        commandManager.register({
            id: this.openOpenConfigCommandId,
            execute: async (rootPath, projectType) => {
                if (this._state.type === 2 /* Resolved */) {
                    await (0, tsconfig_1.openProjectConfigOrPromptToCreate)(projectType, this._client, rootPath, this._state.configFile);
                }
                else if (this._state.type === 1 /* Pending */) {
                    await (0, tsconfig_1.openProjectConfigForFile)(projectType, this._client, this._state.resource);
                }
            },
        });
        commandManager.register({
            id: this.createConfigCommandId,
            execute: async (rootPath, projectType) => {
                await (0, tsconfig_1.openOrCreateConfig)(projectType, rootPath, this._client.configuration);
            },
        });
        _activeTextEditorManager.onDidChangeActiveJsTsEditor(this.updateStatus, this, this._disposables);
        this._client.onReady(() => {
            this._ready = true;
            this.updateStatus();
        });
    }
    dispose() {
        super.dispose();
        this._statusItem?.dispose();
    }
    async updateStatus() {
        const doc = this._activeTextEditorManager.activeJsTsEditor?.document;
        if (!doc || !(0, languageModeIds_1.isSupportedLanguageMode)(doc)) {
            this.updateState(IntellisenseState.None);
            return;
        }
        if (!this._client.hasCapabilityForResource(doc.uri, typescriptService_1.ClientCapability.Semantic)) {
            this.updateState(IntellisenseState.SyntaxOnly);
            return;
        }
        const file = this._client.toOpenedFilePath(doc, { suppressAlertOnFailure: true });
        if (!file) {
            this.updateState(IntellisenseState.None);
            return;
        }
        if (!this._ready) {
            return;
        }
        const projectType = (0, languageModeIds_1.isTypeScriptDocument)(doc) ? 0 /* TypeScript */ : 1 /* JavaScript */;
        const pendingState = new IntellisenseState.Pending(doc.uri, projectType);
        this.updateState(pendingState);
        const response = await this._client.execute('projectInfo', { file, needFileNameList: false }, pendingState.cancellation.token);
        if (response.type === 'response' && response.body) {
            if (this._state === pendingState) {
                this.updateState(new IntellisenseState.Resolved(doc.uri, projectType, response.body.configFileName));
            }
        }
    }
    updateState(newState) {
        if (this._state === newState) {
            return;
        }
        if (this._state.type === 1 /* Pending */) {
            this._state.cancellation.cancel();
            this._state.cancellation.dispose();
        }
        this._state = newState;
        switch (this._state.type) {
            case 0 /* None */:
                this._statusItem?.dispose();
                this._statusItem = undefined;
                break;
            case 1 /* Pending */:
                {
                    const statusItem = this.ensureStatusItem();
                    statusItem.severity = vscode.LanguageStatusSeverity.Information;
                    statusItem.text = '$(loading~spin)';
                    statusItem.detail = localize('pending.detail', 'Loading IntelliSense status');
                    statusItem.command = undefined;
                    break;
                }
            case 2 /* Resolved */:
                {
                    const rootPath = this._client.getWorkspaceRootForResource(this._state.resource);
                    if (!rootPath) {
                        return;
                    }
                    const statusItem = this.ensureStatusItem();
                    statusItem.severity = vscode.LanguageStatusSeverity.Information;
                    if ((0, tsconfig_1.isImplicitProjectConfigFile)(this._state.configFile)) {
                        statusItem.text = this._state.projectType === 0 /* TypeScript */
                            ? localize('resolved.detail.noTsConfig', "No tsconfig")
                            : localize('resolved.detail.noJsConfig', "No jsconfig");
                        statusItem.detail = undefined;
                        statusItem.command = {
                            command: this.createConfigCommandId,
                            title: this._state.projectType === 0 /* TypeScript */
                                ? localize('resolved.command.title.createTsconfig', "Create tsconfig")
                                : localize('resolved.command.title.createJsconfig', "Create jsconfig"),
                            arguments: [rootPath],
                        };
                    }
                    else {
                        statusItem.text = vscode.workspace.asRelativePath(this._state.configFile);
                        statusItem.detail = undefined;
                        statusItem.command = {
                            command: this.openOpenConfigCommandId,
                            title: localize('resolved.command.title.open', "Open config file"),
                            arguments: [rootPath],
                        };
                    }
                }
                break;
            case 3 /* SyntaxOnly */:
                {
                    const statusItem = this.ensureStatusItem();
                    statusItem.severity = vscode.LanguageStatusSeverity.Warning;
                    statusItem.text = localize('syntaxOnly.text', 'Partial Mode');
                    statusItem.detail = localize('syntaxOnly.detail', 'Project Wide IntelliSense not available');
                    statusItem.command = {
                        title: localize('syntaxOnly.command.title.learnMore', "Learn More"),
                        command: 'vscode.open',
                        arguments: [
                            vscode.Uri.parse('https://aka.ms/vscode/jsts/partial-mode'),
                        ]
                    };
                    break;
                }
        }
    }
    ensureStatusItem() {
        if (!this._statusItem) {
            this._statusItem = vscode.languages.createLanguageStatusItem('typescript.projectStatus', languageModeIds_1.jsTsLanguageModes);
            this._statusItem.name = localize('statusItem.name', "JS/TS IntelliSense Status");
        }
        return this._statusItem;
    }
}
exports.IntellisenseStatus = IntellisenseStatus;


/***/ }),
/* 92 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VersionStatus = void 0;
const vscode = __webpack_require__(1);
const nls = __webpack_require__(9);
const selectTypeScriptVersion_1 = __webpack_require__(18);
const dispose_1 = __webpack_require__(20);
const languageModeIds_1 = __webpack_require__(14);
const localize = nls.loadMessageBundle();
class VersionStatus extends dispose_1.Disposable {
    constructor(_client) {
        super();
        this._client = _client;
        this._statusItem = this._register(vscode.languages.createLanguageStatusItem('typescript.version', languageModeIds_1.jsTsLanguageModes));
        this._statusItem.name = localize('versionStatus.name', "TypeScript Version");
        this._statusItem.detail = localize('versionStatus.detail', "TypeScript Version");
        this._register(this._client.onTsServerStarted(({ version }) => this.onDidChangeTypeScriptVersion(version)));
    }
    onDidChangeTypeScriptVersion(version) {
        this._statusItem.text = version.displayName;
        this._statusItem.command = {
            command: selectTypeScriptVersion_1.SelectTypeScriptVersionCommand.id,
            title: localize('versionStatus.command', "Select Version"),
            tooltip: version.path
        };
    }
}
exports.VersionStatus = VersionStatus;


/***/ }),
/* 93 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.create = void 0;
const vscode = __webpack_require__(1);
const vscode_nls_1 = __webpack_require__(9);
const tsconfig_1 = __webpack_require__(7);
const localize = (0, vscode_nls_1.loadMessageBundle)();
class ExcludeHintItem {
    constructor(telemetryReporter) {
        this.telemetryReporter = telemetryReporter;
        this._item = vscode.window.createStatusBarItem('status.typescript.exclude', vscode.StatusBarAlignment.Right, 98 /* to the right of typescript version status (99) */);
        this._item.name = localize('statusExclude', "TypeScript: Configure Excludes");
        this._item.command = 'js.projectStatus.command';
    }
    getCurrentHint() {
        return this._currentHint;
    }
    hide() {
        this._item.hide();
    }
    show(largeRoots) {
        this._currentHint = {
            message: largeRoots
                ? localize('hintExclude', "To enable project-wide JavaScript/TypeScript language features, exclude folders with many files, like: {0}", largeRoots)
                : localize('hintExclude.generic', "To enable project-wide JavaScript/TypeScript language features, exclude large folders with source files that you do not work on.")
        };
        this._item.tooltip = this._currentHint.message;
        this._item.text = localize('large.label', "Configure Excludes");
        this._item.tooltip = localize('hintExclude.tooltip', "To enable project-wide JavaScript/TypeScript language features, exclude large folders with source files that you do not work on.");
        this._item.color = '#A5DF3B';
        this._item.show();
        /* __GDPR__
            "js.hintProjectExcludes" : {
                "${include}": [
                    "${TypeScriptCommonProperties}"
                ]
            }
        */
        this.telemetryReporter.logTelemetry('js.hintProjectExcludes');
    }
}
function createLargeProjectMonitorFromTypeScript(item, client) {
    return client.onProjectLanguageServiceStateChanged(body => {
        if (body.languageServiceEnabled) {
            item.hide();
        }
        else {
            item.show();
            const configFileName = body.projectName;
            if (configFileName) {
                item.configFileName = configFileName;
                vscode.window.showWarningMessage(item.getCurrentHint().message, {
                    title: localize('large.label', "Configure Excludes"),
                    index: 0
                }).then(selected => {
                    if (selected && selected.index === 0) {
                        onConfigureExcludesSelected(client, configFileName);
                    }
                });
            }
        }
    });
}
function onConfigureExcludesSelected(client, configFileName) {
    if (!(0, tsconfig_1.isImplicitProjectConfigFile)(configFileName)) {
        vscode.workspace.openTextDocument(configFileName)
            .then(vscode.window.showTextDocument);
    }
    else {
        const root = client.getWorkspaceRootForResource(vscode.Uri.file(configFileName));
        if (root) {
            (0, tsconfig_1.openOrCreateConfig)(/tsconfig\.?.*\.json/.test(configFileName) ? 0 /* TypeScript */ : 1 /* JavaScript */, root, client.configuration);
        }
    }
}
function create(client) {
    const toDispose = [];
    const item = new ExcludeHintItem(client.telemetryReporter);
    toDispose.push(vscode.commands.registerCommand('js.projectStatus.command', () => {
        if (item.configFileName) {
            onConfigureExcludesSelected(client, item.configFileName);
        }
        const { message } = item.getCurrentHint();
        return vscode.window.showInformationMessage(message);
    }));
    toDispose.push(createLargeProjectMonitorFromTypeScript(item, client));
    return vscode.Disposable.from(...toDispose);
}
exports.create = create;


/***/ }),
/* 94 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LogLevelMonitor = void 0;
const vscode = __webpack_require__(1);
const versionProvider_1 = __webpack_require__(62);
const configuration_1 = __webpack_require__(82);
const dispose_1 = __webpack_require__(20);
class LogLevelMonitor extends dispose_1.Disposable {
    constructor(context) {
        super();
        this.context = context;
        this._register(vscode.workspace.onDidChangeConfiguration(this.onConfigurationChange, this, this._disposables));
        if (this.shouldNotifyExtendedLogging()) {
            this.notifyExtendedLogging();
        }
    }
    onConfigurationChange(event) {
        const logLevelChanged = event.affectsConfiguration(LogLevelMonitor.logLevelConfigKey);
        if (!logLevelChanged) {
            return;
        }
        this.context.globalState.update(LogLevelMonitor.logLevelChangedStorageKey, new Date());
    }
    get logLevel() {
        return configuration_1.TsServerLogLevel.fromString(vscode.workspace.getConfiguration().get(LogLevelMonitor.logLevelConfigKey, 'off'));
    }
    /**
     * Last date change if it exists and can be parsed as a date,
     * otherwise undefined.
     */
    get lastLogLevelChange() {
        const lastChange = this.context.globalState.get(LogLevelMonitor.logLevelChangedStorageKey);
        if (lastChange) {
            const date = new Date(lastChange);
            if (date instanceof Date && !isNaN(date.valueOf())) {
                return date;
            }
        }
        return undefined;
    }
    get doNotPrompt() {
        return this.context.globalState.get(LogLevelMonitor.doNotPromptLogLevelStorageKey) || false;
    }
    shouldNotifyExtendedLogging() {
        const lastChangeMilliseconds = this.lastLogLevelChange ? new Date(this.lastLogLevelChange).valueOf() : 0;
        const lastChangePlusOneWeek = new Date(lastChangeMilliseconds + /* 7 days in milliseconds */ 86400000 * 7);
        if (!this.doNotPrompt && this.logLevel !== configuration_1.TsServerLogLevel.Off && lastChangePlusOneWeek.valueOf() < Date.now()) {
            return true;
        }
        return false;
    }
    notifyExtendedLogging() {
        vscode.window.showInformationMessage((0, versionProvider_1.localize)('typescript.extendedLogging.isEnabled', "TS Server logging is currently enabled which may impact performance."), {
            title: (0, versionProvider_1.localize)('typescript.extendedLogging.disableLogging', "Disable logging"),
            choice: 0 /* DisableLogging */
        }, {
            title: (0, versionProvider_1.localize)('typescript.extendedLogging.doNotShowAgain', "Don't show again"),
            choice: 1 /* DoNotShowAgain */
        })
            .then(selection => {
            if (!selection) {
                return;
            }
            if (selection.choice === 0 /* DisableLogging */) {
                return vscode.workspace.getConfiguration().update(LogLevelMonitor.logLevelConfigKey, 'off', true);
            }
            else if (selection.choice === 1 /* DoNotShowAgain */) {
                return this.context.globalState.update(LogLevelMonitor.doNotPromptLogLevelStorageKey, true);
            }
            return;
        });
    }
}
exports.LogLevelMonitor = LogLevelMonitor;
LogLevelMonitor.logLevelConfigKey = 'typescript.tsserver.log';
LogLevelMonitor.logLevelChangedStorageKey = 'typescript.tsserver.logLevelChanged';
LogLevelMonitor.doNotPromptLogLevelStorageKey = 'typescript.tsserver.doNotPromptLogLevel';


/***/ }),
/* 95 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AtaProgressReporter = void 0;
const vscode = __webpack_require__(1);
const vscode_nls_1 = __webpack_require__(9);
const dispose_1 = __webpack_require__(20);
const localize = (0, vscode_nls_1.loadMessageBundle)();
const typingsInstallTimeout = 30 * 1000;
class TypingsStatus extends dispose_1.Disposable {
    constructor(client) {
        super();
        this._acquiringTypings = new Map();
        this._client = client;
        this._register(this._client.onDidBeginInstallTypings(event => this.onBeginInstallTypings(event.eventId)));
        this._register(this._client.onDidEndInstallTypings(event => this.onEndInstallTypings(event.eventId)));
    }
    dispose() {
        super.dispose();
        for (const timeout of this._acquiringTypings.values()) {
            clearTimeout(timeout);
        }
    }
    get isAcquiringTypings() {
        return Object.keys(this._acquiringTypings).length > 0;
    }
    onBeginInstallTypings(eventId) {
        if (this._acquiringTypings.has(eventId)) {
            return;
        }
        this._acquiringTypings.set(eventId, setTimeout(() => {
            this.onEndInstallTypings(eventId);
        }, typingsInstallTimeout));
    }
    onEndInstallTypings(eventId) {
        const timer = this._acquiringTypings.get(eventId);
        if (timer) {
            clearTimeout(timer);
        }
        this._acquiringTypings.delete(eventId);
    }
}
exports.default = TypingsStatus;
class AtaProgressReporter extends dispose_1.Disposable {
    constructor(client) {
        super();
        this._promises = new Map();
        this._register(client.onDidBeginInstallTypings(e => this._onBegin(e.eventId)));
        this._register(client.onDidEndInstallTypings(e => this._onEndOrTimeout(e.eventId)));
        this._register(client.onTypesInstallerInitializationFailed(_ => this.onTypesInstallerInitializationFailed()));
    }
    dispose() {
        super.dispose();
        this._promises.forEach(value => value());
    }
    _onBegin(eventId) {
        const handle = setTimeout(() => this._onEndOrTimeout(eventId), typingsInstallTimeout);
        const promise = new Promise(resolve => {
            this._promises.set(eventId, () => {
                clearTimeout(handle);
                resolve();
            });
        });
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            title: localize('installingPackages', "Fetching data for better TypeScript IntelliSense")
        }, () => promise);
    }
    _onEndOrTimeout(eventId) {
        const resolve = this._promises.get(eventId);
        if (resolve) {
            this._promises.delete(eventId);
            resolve();
        }
    }
    async onTypesInstallerInitializationFailed() {
        const config = vscode.workspace.getConfiguration('typescript');
        if (config.get('check.npmIsInstalled', true)) {
            const dontShowAgain = {
                title: localize('typesInstallerInitializationFailed.doNotCheckAgain', "Don't Show Again"),
            };
            const selected = await vscode.window.showWarningMessage(localize('typesInstallerInitializationFailed.title', "Could not install typings files for JavaScript language features. Please ensure that NPM is installed or configure 'typescript.npm' in your user settings. Click [here]({0}) to learn more.", 'https://go.microsoft.com/fwlink/?linkid=847635'), dontShowAgain);
            if (selected === dontShowAgain) {
                config.update('check.npmIsInstalled', false, true);
            }
        }
    }
}
exports.AtaProgressReporter = AtaProgressReporter;


/***/ }),
/* 96 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const path = __webpack_require__(8);
const vscode = __webpack_require__(1);
const nls = __webpack_require__(9);
const typescriptService_1 = __webpack_require__(32);
const api_1 = __webpack_require__(24);
const async_1 = __webpack_require__(80);
const cancellation_1 = __webpack_require__(12);
const dependentRegistration_1 = __webpack_require__(35);
const dispose_1 = __webpack_require__(20);
const fileSchemes = __webpack_require__(26);
const languageDescription_1 = __webpack_require__(97);
const typeConverters = __webpack_require__(37);
const localize = nls.loadMessageBundle();
const updateImportsOnFileMoveName = 'updateImportsOnFileMove.enabled';
async function isDirectory(resource) {
    try {
        return (await vscode.workspace.fs.stat(resource)).type === vscode.FileType.Directory;
    }
    catch {
        return false;
    }
}
class UpdateImportsOnFileRenameHandler extends dispose_1.Disposable {
    constructor(client, fileConfigurationManager, _handles) {
        super();
        this.client = client;
        this.fileConfigurationManager = fileConfigurationManager;
        this._handles = _handles;
        this._delayer = new async_1.Delayer(50);
        this._pendingRenames = new Set();
        this._register(vscode.workspace.onDidRenameFiles(async (e) => {
            const [{ newUri, oldUri }] = e.files;
            const newFilePath = this.client.toPath(newUri);
            if (!newFilePath) {
                return;
            }
            const oldFilePath = this.client.toPath(oldUri);
            if (!oldFilePath) {
                return;
            }
            const config = this.getConfiguration(newUri);
            const setting = config.get(updateImportsOnFileMoveName);
            if (setting === "never" /* Never */) {
                return;
            }
            // Try to get a js/ts file that is being moved
            // For directory moves, this returns a js/ts file under the directory.
            const jsTsFileThatIsBeingMoved = await this.getJsTsFileBeingMoved(newUri);
            if (!jsTsFileThatIsBeingMoved || !this.client.toPath(jsTsFileThatIsBeingMoved)) {
                return;
            }
            this._pendingRenames.add({ oldUri, newUri, newFilePath, oldFilePath, jsTsFileThatIsBeingMoved });
            this._delayer.trigger(() => {
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Window,
                    title: localize('renameProgress.title', "Checking for update of JS/TS imports")
                }, () => this.flushRenames());
            });
        }));
    }
    async flushRenames() {
        const renames = Array.from(this._pendingRenames);
        this._pendingRenames.clear();
        for (const group of this.groupRenames(renames)) {
            const edits = new vscode.WorkspaceEdit();
            const resourcesBeingRenamed = [];
            for (const { oldUri, newUri, newFilePath, oldFilePath, jsTsFileThatIsBeingMoved } of group) {
                const document = await vscode.workspace.openTextDocument(jsTsFileThatIsBeingMoved);
                // Make sure TS knows about file
                this.client.bufferSyncSupport.closeResource(oldUri);
                this.client.bufferSyncSupport.openTextDocument(document);
                if (await this.withEditsForFileRename(edits, document, oldFilePath, newFilePath)) {
                    resourcesBeingRenamed.push(newUri);
                }
            }
            if (edits.size) {
                if (await this.confirmActionWithUser(resourcesBeingRenamed)) {
                    await vscode.workspace.applyEdit(edits);
                }
            }
        }
    }
    async confirmActionWithUser(newResources) {
        if (!newResources.length) {
            return false;
        }
        const config = this.getConfiguration(newResources[0]);
        const setting = config.get(updateImportsOnFileMoveName);
        switch (setting) {
            case "always" /* Always */:
                return true;
            case "never" /* Never */:
                return false;
            case "prompt" /* Prompt */:
            default:
                return this.promptUser(newResources);
        }
    }
    getConfiguration(resource) {
        return vscode.workspace.getConfiguration((0, languageDescription_1.doesResourceLookLikeATypeScriptFile)(resource) ? 'typescript' : 'javascript', resource);
    }
    async promptUser(newResources) {
        if (!newResources.length) {
            return false;
        }
        const response = await vscode.window.showInformationMessage(newResources.length === 1
            ? localize('prompt', "Update imports for '{0}'?", path.basename(newResources[0].fsPath))
            : this.getConfirmMessage(localize('promptMoreThanOne', "Update imports for the following {0} files?", newResources.length), newResources), {
            modal: true,
        }, {
            title: localize('reject.title', "No"),
            choice: 2 /* Reject */,
            isCloseAffordance: true,
        }, {
            title: localize('accept.title', "Yes"),
            choice: 1 /* Accept */,
        }, {
            title: localize('always.title', "Always automatically update imports"),
            choice: 3 /* Always */,
        }, {
            title: localize('never.title', "Never automatically update imports"),
            choice: 4 /* Never */,
        });
        if (!response) {
            return false;
        }
        switch (response.choice) {
            case 1 /* Accept */:
                {
                    return true;
                }
            case 2 /* Reject */:
                {
                    return false;
                }
            case 3 /* Always */:
                {
                    const config = this.getConfiguration(newResources[0]);
                    config.update(updateImportsOnFileMoveName, "always" /* Always */, vscode.ConfigurationTarget.Global);
                    return true;
                }
            case 4 /* Never */:
                {
                    const config = this.getConfiguration(newResources[0]);
                    config.update(updateImportsOnFileMoveName, "never" /* Never */, vscode.ConfigurationTarget.Global);
                    return false;
                }
        }
        return false;
    }
    async getJsTsFileBeingMoved(resource) {
        if (resource.scheme !== fileSchemes.file) {
            return undefined;
        }
        if (await isDirectory(resource)) {
            const files = await vscode.workspace.findFiles({
                base: resource.fsPath,
                pattern: '**/*.{ts,tsx,js,jsx}',
            }, '**/node_modules/**', 1);
            return files[0];
        }
        return (await this._handles(resource)) ? resource : undefined;
    }
    async withEditsForFileRename(edits, document, oldFilePath, newFilePath) {
        const response = await this.client.interruptGetErr(() => {
            this.fileConfigurationManager.setGlobalConfigurationFromDocument(document, cancellation_1.nulToken);
            const args = {
                oldFilePath,
                newFilePath,
            };
            return this.client.execute('getEditsForFileRename', args, cancellation_1.nulToken);
        });
        if (response.type !== 'response' || !response.body.length) {
            return false;
        }
        typeConverters.WorkspaceEdit.withFileCodeEdits(edits, this.client, response.body);
        return true;
    }
    groupRenames(renames) {
        const groups = new Map();
        for (const rename of renames) {
            // Group renames by type (js/ts) and by workspace.
            const key = `${this.client.getWorkspaceRootForResource(rename.jsTsFileThatIsBeingMoved)}@@@${(0, languageDescription_1.doesResourceLookLikeATypeScriptFile)(rename.jsTsFileThatIsBeingMoved)}`;
            if (!groups.has(key)) {
                groups.set(key, new Set());
            }
            groups.get(key).add(rename);
        }
        return groups.values();
    }
    getConfirmMessage(start, resourcesToConfirm) {
        const MAX_CONFIRM_FILES = 10;
        const paths = [start];
        paths.push('');
        paths.push(...resourcesToConfirm.slice(0, MAX_CONFIRM_FILES).map(r => path.basename(r.fsPath)));
        if (resourcesToConfirm.length > MAX_CONFIRM_FILES) {
            if (resourcesToConfirm.length - MAX_CONFIRM_FILES === 1) {
                paths.push(localize('moreFile', "...1 additional file not shown"));
            }
            else {
                paths.push(localize('moreFiles', "...{0} additional files not shown", resourcesToConfirm.length - MAX_CONFIRM_FILES));
            }
        }
        paths.push('');
        return paths.join('\n');
    }
}
UpdateImportsOnFileRenameHandler.minVersion = api_1.default.v300;
function register(client, fileConfigurationManager, handles) {
    return (0, dependentRegistration_1.conditionalRegistration)([
        (0, dependentRegistration_1.requireMinVersion)(client, UpdateImportsOnFileRenameHandler.minVersion),
        (0, dependentRegistration_1.requireSomeCapability)(client, typescriptService_1.ClientCapability.Semantic),
    ], () => {
        return new UpdateImportsOnFileRenameHandler(client, fileConfigurationManager, handles);
    });
}
exports.register = register;


/***/ }),
/* 97 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.doesResourceLookLikeAJavaScriptFile = exports.doesResourceLookLikeATypeScriptFile = exports.isJsConfigOrTsConfigFileName = exports.isTsConfigFileName = exports.standardLanguageDescriptions = exports.allDiagnosticLanguages = void 0;
const path_1 = __webpack_require__(8);
const languageModeIds = __webpack_require__(14);
exports.allDiagnosticLanguages = [0 /* JavaScript */, 1 /* TypeScript */];
exports.standardLanguageDescriptions = [
    {
        id: 'typescript',
        diagnosticOwner: 'typescript',
        diagnosticSource: 'ts',
        diagnosticLanguage: 1 /* TypeScript */,
        modeIds: [languageModeIds.typescript, languageModeIds.typescriptreact],
        configFilePattern: /^tsconfig(\..*)?\.json$/gi,
        standardFileExtensions: [
            'ts',
            'tsx',
            'cts',
            'mts'
        ],
    }, {
        id: 'javascript',
        diagnosticOwner: 'typescript',
        diagnosticSource: 'ts',
        diagnosticLanguage: 0 /* JavaScript */,
        modeIds: [languageModeIds.javascript, languageModeIds.javascriptreact],
        configFilePattern: /^jsconfig(\..*)?\.json$/gi,
        standardFileExtensions: [
            'js',
            'jsx',
            'cjs',
            'mjs',
            'es6',
            'pac',
        ],
    }
];
function isTsConfigFileName(fileName) {
    return /^tsconfig\.(.+\.)?json$/i.test((0, path_1.basename)(fileName));
}
exports.isTsConfigFileName = isTsConfigFileName;
function isJsConfigOrTsConfigFileName(fileName) {
    return /^[jt]sconfig\.(.+\.)?json$/i.test((0, path_1.basename)(fileName));
}
exports.isJsConfigOrTsConfigFileName = isJsConfigOrTsConfigFileName;
function doesResourceLookLikeATypeScriptFile(resource) {
    return /\.(tsx?|mts|cts)$/i.test(resource.fsPath);
}
exports.doesResourceLookLikeATypeScriptFile = doesResourceLookLikeATypeScriptFile;
function doesResourceLookLikeAJavaScriptFile(resource) {
    return /\.(jsx?|mjs|cjs)$/i.test(resource.fsPath);
}
exports.doesResourceLookLikeAJavaScriptFile = doesResourceLookLikeAJavaScriptFile;


/***/ }),
/* 98 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const vscode = __webpack_require__(1);
const PConst = __webpack_require__(34);
const api_1 = __webpack_require__(24);
const fileSchemes = __webpack_require__(26);
const languageDescription_1 = __webpack_require__(97);
const modifiers_1 = __webpack_require__(36);
const typeConverters = __webpack_require__(37);
function getSymbolKind(item) {
    switch (item.kind) {
        case PConst.Kind.method: return vscode.SymbolKind.Method;
        case PConst.Kind.enum: return vscode.SymbolKind.Enum;
        case PConst.Kind.enumMember: return vscode.SymbolKind.EnumMember;
        case PConst.Kind.function: return vscode.SymbolKind.Function;
        case PConst.Kind.class: return vscode.SymbolKind.Class;
        case PConst.Kind.interface: return vscode.SymbolKind.Interface;
        case PConst.Kind.type: return vscode.SymbolKind.Class;
        case PConst.Kind.memberVariable: return vscode.SymbolKind.Field;
        case PConst.Kind.memberGetAccessor: return vscode.SymbolKind.Field;
        case PConst.Kind.memberSetAccessor: return vscode.SymbolKind.Field;
        case PConst.Kind.variable: return vscode.SymbolKind.Variable;
        default: return vscode.SymbolKind.Variable;
    }
}
class TypeScriptWorkspaceSymbolProvider {
    constructor(client, modeIds) {
        this.client = client;
        this.modeIds = modeIds;
    }
    async provideWorkspaceSymbols(search, token) {
        let file;
        if (this.searchAllOpenProjects) {
            file = undefined;
        }
        else {
            const document = this.getDocument();
            file = document ? await this.toOpenedFiledPath(document) : undefined;
            if (!file && this.client.apiVersion.lt(api_1.default.v390)) {
                return [];
            }
        }
        const args = {
            file,
            searchValue: search,
            maxResultCount: 256,
        };
        const response = await this.client.execute('navto', args, token);
        if (response.type !== 'response' || !response.body) {
            return [];
        }
        return response.body
            .filter(item => item.containerName || item.kind !== 'alias')
            .map(item => this.toSymbolInformation(item));
    }
    get searchAllOpenProjects() {
        return this.client.apiVersion.gte(api_1.default.v390)
            && vscode.workspace.getConfiguration('typescript').get('workspaceSymbols.scope', 'allOpenProjects') === 'allOpenProjects';
    }
    async toOpenedFiledPath(document) {
        if (document.uri.scheme === fileSchemes.git) {
            try {
                const path = vscode.Uri.file(JSON.parse(document.uri.query)?.path);
                if ((0, languageDescription_1.doesResourceLookLikeATypeScriptFile)(path) || (0, languageDescription_1.doesResourceLookLikeAJavaScriptFile)(path)) {
                    const document = await vscode.workspace.openTextDocument(path);
                    return this.client.toOpenedFilePath(document);
                }
            }
            catch {
                // noop
            }
        }
        return this.client.toOpenedFilePath(document);
    }
    toSymbolInformation(item) {
        const label = TypeScriptWorkspaceSymbolProvider.getLabel(item);
        const info = new vscode.SymbolInformation(label, getSymbolKind(item), item.containerName || '', typeConverters.Location.fromTextSpan(this.client.toResource(item.file), item));
        const kindModifiers = item.kindModifiers ? (0, modifiers_1.parseKindModifier)(item.kindModifiers) : undefined;
        if (kindModifiers?.has(PConst.KindModifiers.deprecated)) {
            info.tags = [vscode.SymbolTag.Deprecated];
        }
        return info;
    }
    static getLabel(item) {
        const label = item.name;
        if (item.kind === 'method' || item.kind === 'function') {
            return label + '()';
        }
        return label;
    }
    getDocument() {
        // typescript wants to have a resource even when asking
        // general questions so we check the active editor. If this
        // doesn't match we take the first TS document.
        const activeDocument = vscode.window.activeTextEditor?.document;
        if (activeDocument) {
            if (this.modeIds.includes(activeDocument.languageId)) {
                return activeDocument;
            }
        }
        const documents = vscode.workspace.textDocuments;
        for (const document of documents) {
            if (this.modeIds.includes(document.languageId)) {
                return document;
            }
        }
        return undefined;
    }
}
function register(client, modeIds) {
    return vscode.languages.registerWorkspaceSymbolProvider(new TypeScriptWorkspaceSymbolProvider(client, modeIds));
}
exports.register = register;


/***/ }),
/* 99 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.lazy = void 0;
class LazyValue {
    constructor(_getValue) {
        this._getValue = _getValue;
        this._hasValue = false;
    }
    get value() {
        if (!this._hasValue) {
            this._hasValue = true;
            this._value = this._getValue();
        }
        return this._value;
    }
    get hasValue() {
        return this._hasValue;
    }
    map(f) {
        return new LazyValue(() => f(this.value));
    }
}
function lazy(getValue) {
    return new LazyValue(getValue);
}
exports.lazy = lazy;


/***/ }),
/* 100 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
const vscode = __webpack_require__(1);
const dispose_1 = __webpack_require__(20);
const languageDescription_1 = __webpack_require__(97);
const languageModeIds_1 = __webpack_require__(14);
/**E
 * When clause context set when the current file is managed by vscode's built-in typescript extension.
 */
class ManagedFileContextManager extends dispose_1.Disposable {
    constructor(activeJsTsEditorTracker, normalizePath) {
        super();
        this.normalizePath = normalizePath;
        this.isInManagedFileContext = false;
        activeJsTsEditorTracker.onDidChangeActiveJsTsEditor(this.onDidChangeActiveTextEditor, this, this._disposables);
        this.onDidChangeActiveTextEditor(activeJsTsEditorTracker.activeJsTsEditor);
    }
    onDidChangeActiveTextEditor(editor) {
        if (editor) {
            this.updateContext(this.isManagedFile(editor));
        }
        else {
            this.updateContext(false);
        }
    }
    updateContext(newValue) {
        if (newValue === this.isInManagedFileContext) {
            return;
        }
        vscode.commands.executeCommand('setContext', ManagedFileContextManager.contextName, newValue);
        this.isInManagedFileContext = newValue;
    }
    isManagedFile(editor) {
        return this.isManagedScriptFile(editor) || this.isManagedConfigFile(editor);
    }
    isManagedScriptFile(editor) {
        return (0, languageModeIds_1.isSupportedLanguageMode)(editor.document) && this.normalizePath(editor.document.uri) !== null;
    }
    isManagedConfigFile(editor) {
        return (0, languageDescription_1.isJsConfigOrTsConfigFileName)(editor.document.fileName);
    }
}
exports.default = ManagedFileContextManager;
ManagedFileContextManager.contextName = 'typescript.isManagedFile';


/***/ }),
/* 101 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.noopRequestCancellerFactory = void 0;
const noopRequestCanceller = new class {
    constructor() {
        this.cancellationPipeName = undefined;
    }
    tryCancelOngoingRequest(_seq) {
        return false;
    }
};
exports.noopRequestCancellerFactory = new class {
    create(_serverId, _tracer) {
        return noopRequestCanceller;
    }
};


/***/ }),
/* 102 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.noopLogDirectoryProvider = void 0;
exports.noopLogDirectoryProvider = new class {
    getNewLogDirectory() {
        return undefined;
    }
};


/***/ }),
/* 103 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkerServerProcess = void 0;
const vscode = __webpack_require__(1);
const nls = __webpack_require__(9);
const memoize_1 = __webpack_require__(67);
const localize = nls.loadMessageBundle();
class WorkerServerProcess {
    constructor(worker, args) {
        this.worker = worker;
        this._onDataHandlers = new Set();
        this._onErrorHandlers = new Set();
        this._onExitHandlers = new Set();
        worker.addEventListener('message', (msg) => {
            if (msg.data.type === 'log') {
                this.output.appendLine(msg.data.body);
                return;
            }
            for (const handler of this._onDataHandlers) {
                handler(msg.data);
            }
        });
        worker.onerror = (err) => {
            for (const handler of this._onErrorHandlers) {
                handler(err);
            }
        };
        worker.postMessage(args);
    }
    static fork(tsServerPath, args, _kind, _configuration) {
        const worker = new Worker(tsServerPath);
        return new WorkerServerProcess(worker, [
            ...args,
            // Explicitly give TS Server its path so it can
            // load local resources
            '--executingFilePath', tsServerPath,
        ]);
    }
    get output() {
        return vscode.window.createOutputChannel(localize('channelName', 'TypeScript Server Log'));
    }
    write(serverRequest) {
        this.worker.postMessage(serverRequest);
    }
    onData(handler) {
        this._onDataHandlers.add(handler);
    }
    onError(handler) {
        this._onErrorHandlers.add(handler);
    }
    onExit(handler) {
        this._onExitHandlers.add(handler);
        // Todo: not implemented
    }
    kill() {
        this.worker.terminate();
    }
}
__decorate([
    memoize_1.memoize
], WorkerServerProcess.prototype, "output", null);
exports.WorkerServerProcess = WorkerServerProcess;


/***/ }),
/* 104 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ActiveJsTsEditorTracker = void 0;
const vscode = __webpack_require__(1);
const dispose_1 = __webpack_require__(20);
const languageDescription_1 = __webpack_require__(97);
const languageModeIds_1 = __webpack_require__(14);
/**
 * Tracks the active JS/TS editor.
 *
 * This tries to handle the case where the user focuses in the output view / debug console.
 * When this happens, we want to treat the last real focused editor as the active editor,
 * instead of using `vscode.window.activeTextEditor`
 */
class ActiveJsTsEditorTracker extends dispose_1.Disposable {
    constructor() {
        super();
        this._onDidChangeActiveJsTsEditor = this._register(new vscode.EventEmitter());
        this.onDidChangeActiveJsTsEditor = this._onDidChangeActiveJsTsEditor.event;
        vscode.window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor, this, this._disposables);
        vscode.window.onDidChangeVisibleTextEditors(() => {
            // Make sure the active editor is still in the visible set.
            // This can happen if the output view is focused and the last active TS file is closed
            if (this._activeJsTsEditor) {
                if (!vscode.window.visibleTextEditors.some(visibleEditor => visibleEditor === this._activeJsTsEditor)) {
                    this.onDidChangeActiveTextEditor(undefined);
                }
            }
        }, this, this._disposables);
        this.onDidChangeActiveTextEditor(vscode.window.activeTextEditor);
    }
    get activeJsTsEditor() {
        return this._activeJsTsEditor;
    }
    onDidChangeActiveTextEditor(editor) {
        if (editor === this._activeJsTsEditor) {
            return;
        }
        if (editor && !editor.viewColumn) {
            // viewColumn is undefined for the debug/output panel, but we still want
            // to show the version info for the previous editor
            return;
        }
        if (editor && this.isManagedFile(editor)) {
            this._activeJsTsEditor = editor;
        }
        else {
            this._activeJsTsEditor = undefined;
        }
        this._onDidChangeActiveJsTsEditor.fire(this._activeJsTsEditor);
    }
    isManagedFile(editor) {
        return this.isManagedScriptFile(editor) || this.isManagedConfigFile(editor);
    }
    isManagedScriptFile(editor) {
        return (0, languageModeIds_1.isSupportedLanguageMode)(editor.document);
    }
    isManagedConfigFile(editor) {
        return (0, languageDescription_1.isJsConfigOrTsConfigFileName)(editor.document.fileName);
    }
}
exports.ActiveJsTsEditorTracker = ActiveJsTsEditorTracker;


/***/ }),
/* 105 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BrowserServiceConfigurationProvider = void 0;
const configuration_1 = __webpack_require__(82);
class BrowserServiceConfigurationProvider extends configuration_1.BaseServiceConfigurationProvider {
    // On browsers, we only support using the built-in TS version
    extractGlobalTsdk(_configuration) {
        return null;
    }
    extractLocalTsdk(_configuration) {
        return null;
    }
}
exports.BrowserServiceConfigurationProvider = BrowserServiceConfigurationProvider;


/***/ }),
/* 106 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PluginManager = void 0;
const vscode = __webpack_require__(1);
const arrays = __webpack_require__(28);
const dispose_1 = __webpack_require__(20);
var TypeScriptServerPlugin;
(function (TypeScriptServerPlugin) {
    function equals(a, b) {
        return a.path === b.path
            && a.name === b.name
            && a.enableForWorkspaceTypeScriptVersions === b.enableForWorkspaceTypeScriptVersions
            && arrays.equals(a.languages, b.languages);
    }
    TypeScriptServerPlugin.equals = equals;
})(TypeScriptServerPlugin || (TypeScriptServerPlugin = {}));
class PluginManager extends dispose_1.Disposable {
    constructor() {
        super();
        this._pluginConfigurations = new Map();
        this._onDidUpdatePlugins = this._register(new vscode.EventEmitter());
        this.onDidChangePlugins = this._onDidUpdatePlugins.event;
        this._onDidUpdateConfig = this._register(new vscode.EventEmitter());
        this.onDidUpdateConfig = this._onDidUpdateConfig.event;
        vscode.extensions.onDidChange(() => {
            if (!this._plugins) {
                return;
            }
            const newPlugins = this.readPlugins();
            if (!arrays.equals(arrays.flatten(Array.from(this._plugins.values())), arrays.flatten(Array.from(newPlugins.values())), TypeScriptServerPlugin.equals)) {
                this._plugins = newPlugins;
                this._onDidUpdatePlugins.fire(this);
            }
        }, undefined, this._disposables);
    }
    get plugins() {
        if (!this._plugins) {
            this._plugins = this.readPlugins();
        }
        return arrays.flatten(Array.from(this._plugins.values()));
    }
    setConfiguration(pluginId, config) {
        this._pluginConfigurations.set(pluginId, config);
        this._onDidUpdateConfig.fire({ pluginId, config });
    }
    configurations() {
        return this._pluginConfigurations.entries();
    }
    readPlugins() {
        const pluginMap = new Map();
        for (const extension of vscode.extensions.all) {
            const pack = extension.packageJSON;
            if (pack.contributes && Array.isArray(pack.contributes.typescriptServerPlugins)) {
                const plugins = [];
                for (const plugin of pack.contributes.typescriptServerPlugins) {
                    plugins.push({
                        name: plugin.name,
                        enableForWorkspaceTypeScriptVersions: !!plugin.enableForWorkspaceTypeScriptVersions,
                        path: extension.extensionPath,
                        languages: Array.isArray(plugin.languages) ? plugin.languages : [],
                        configNamespace: plugin.configNamespace,
                    });
                }
                if (plugins.length) {
                    pluginMap.set(extension.id, plugins);
                }
            }
        }
        return pluginMap;
    }
}
exports.PluginManager = PluginManager;


/***/ }),
/* 107 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.register = void 0;
const jsonc = __webpack_require__(108);
const path_1 = __webpack_require__(8);
const vscode = __webpack_require__(1);
const arrays_1 = __webpack_require__(28);
function mapChildren(node, f) {
    return node && node.type === 'array' && node.children
        ? node.children.map(f)
        : [];
}
class TsconfigLinkProvider {
    provideDocumentLinks(document, _token) {
        const root = jsonc.parseTree(document.getText());
        if (!root) {
            return null;
        }
        return (0, arrays_1.coalesce)([
            this.getExtendsLink(document, root),
            ...this.getFilesLinks(document, root),
            ...this.getReferencesLinks(document, root)
        ]);
    }
    getExtendsLink(document, root) {
        const extendsNode = jsonc.findNodeAtLocation(root, ['extends']);
        if (!this.isPathValue(extendsNode)) {
            return undefined;
        }
        if (extendsNode.value.startsWith('.')) {
            return new vscode.DocumentLink(this.getRange(document, extendsNode), vscode.Uri.file((0, path_1.join)((0, path_1.dirname)(document.uri.fsPath), extendsNode.value + (extendsNode.value.endsWith('.json') ? '' : '.json'))));
        }
        const workspaceFolderPath = vscode.workspace.getWorkspaceFolder(document.uri).uri.fsPath;
        return new vscode.DocumentLink(this.getRange(document, extendsNode), vscode.Uri.file((0, path_1.join)(workspaceFolderPath, 'node_modules', extendsNode.value + (extendsNode.value.endsWith('.json') ? '' : '.json'))));
    }
    getFilesLinks(document, root) {
        return mapChildren(jsonc.findNodeAtLocation(root, ['files']), child => this.pathNodeToLink(document, child));
    }
    getReferencesLinks(document, root) {
        return mapChildren(jsonc.findNodeAtLocation(root, ['references']), child => {
            const pathNode = jsonc.findNodeAtLocation(child, ['path']);
            if (!this.isPathValue(pathNode)) {
                return undefined;
            }
            return new vscode.DocumentLink(this.getRange(document, pathNode), (0, path_1.basename)(pathNode.value).endsWith('.json')
                ? this.getFileTarget(document, pathNode)
                : this.getFolderTarget(document, pathNode));
        });
    }
    pathNodeToLink(document, node) {
        return this.isPathValue(node)
            ? new vscode.DocumentLink(this.getRange(document, node), this.getFileTarget(document, node))
            : undefined;
    }
    isPathValue(extendsNode) {
        return extendsNode
            && extendsNode.type === 'string'
            && extendsNode.value
            && !extendsNode.value.includes('*'); // don't treat globs as links.
    }
    getFileTarget(document, node) {
        return vscode.Uri.file((0, path_1.join)((0, path_1.dirname)(document.uri.fsPath), node.value));
    }
    getFolderTarget(document, node) {
        return vscode.Uri.file((0, path_1.join)((0, path_1.dirname)(document.uri.fsPath), node.value, 'tsconfig.json'));
    }
    getRange(document, node) {
        const offset = node.offset;
        const start = document.positionAt(offset + 1);
        const end = document.positionAt(offset + (node.length - 1));
        return new vscode.Range(start, end);
    }
}
function register() {
    const patterns = [
        '**/[jt]sconfig.json',
        '**/[jt]sconfig.*.json',
    ];
    const languages = ['json', 'jsonc'];
    const selector = (0, arrays_1.flatten)(languages.map(language => patterns.map((pattern) => ({ language, pattern }))));
    return vscode.languages.registerDocumentLinkProvider(selector, new TsconfigLinkProvider());
}
exports.register = register;


/***/ }),
/* 108 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createScanner": () => (/* binding */ createScanner),
/* harmony export */   "getLocation": () => (/* binding */ getLocation),
/* harmony export */   "parse": () => (/* binding */ parse),
/* harmony export */   "parseTree": () => (/* binding */ parseTree),
/* harmony export */   "findNodeAtLocation": () => (/* binding */ findNodeAtLocation),
/* harmony export */   "findNodeAtOffset": () => (/* binding */ findNodeAtOffset),
/* harmony export */   "getNodePath": () => (/* binding */ getNodePath),
/* harmony export */   "getNodeValue": () => (/* binding */ getNodeValue),
/* harmony export */   "visit": () => (/* binding */ visit),
/* harmony export */   "stripComments": () => (/* binding */ stripComments),
/* harmony export */   "printParseErrorCode": () => (/* binding */ printParseErrorCode),
/* harmony export */   "format": () => (/* binding */ format),
/* harmony export */   "modify": () => (/* binding */ modify),
/* harmony export */   "applyEdits": () => (/* binding */ applyEdits)
/* harmony export */ });
/* harmony import */ var _impl_format__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(109);
/* harmony import */ var _impl_edit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(111);
/* harmony import */ var _impl_scanner__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(110);
/* harmony import */ var _impl_parser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(112);
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/





/**
 * Creates a JSON scanner on the given text.
 * If ignoreTrivia is set, whitespaces or comments are ignored.
 */
var createScanner = _impl_scanner__WEBPACK_IMPORTED_MODULE_2__.createScanner;
/**
 * For a given offset, evaluate the location in the JSON document. Each segment in the location path is either a property name or an array index.
 */
var getLocation = _impl_parser__WEBPACK_IMPORTED_MODULE_3__.getLocation;
/**
 * Parses the given text and returns the object the JSON content represents. On invalid input, the parser tries to be as fault tolerant as possible, but still return a result.
 * Therefore, always check the errors list to find out if the input was valid.
 */
var parse = _impl_parser__WEBPACK_IMPORTED_MODULE_3__.parse;
/**
 * Parses the given text and returns a tree representation the JSON content. On invalid input, the parser tries to be as fault tolerant as possible, but still return a result.
 */
var parseTree = _impl_parser__WEBPACK_IMPORTED_MODULE_3__.parseTree;
/**
 * Finds the node at the given path in a JSON DOM.
 */
var findNodeAtLocation = _impl_parser__WEBPACK_IMPORTED_MODULE_3__.findNodeAtLocation;
/**
 * Finds the innermost node at the given offset. If includeRightBound is set, also finds nodes that end at the given offset.
 */
var findNodeAtOffset = _impl_parser__WEBPACK_IMPORTED_MODULE_3__.findNodeAtOffset;
/**
 * Gets the JSON path of the given JSON DOM node
 */
var getNodePath = _impl_parser__WEBPACK_IMPORTED_MODULE_3__.getNodePath;
/**
 * Evaluates the JavaScript object of the given JSON DOM node
 */
var getNodeValue = _impl_parser__WEBPACK_IMPORTED_MODULE_3__.getNodeValue;
/**
 * Parses the given text and invokes the visitor functions for each object, array and literal reached.
 */
var visit = _impl_parser__WEBPACK_IMPORTED_MODULE_3__.visit;
/**
 * Takes JSON with JavaScript-style comments and remove
 * them. Optionally replaces every none-newline character
 * of comments with a replaceCharacter
 */
var stripComments = _impl_parser__WEBPACK_IMPORTED_MODULE_3__.stripComments;
function printParseErrorCode(code) {
    switch (code) {
        case 1 /* InvalidSymbol */: return 'InvalidSymbol';
        case 2 /* InvalidNumberFormat */: return 'InvalidNumberFormat';
        case 3 /* PropertyNameExpected */: return 'PropertyNameExpected';
        case 4 /* ValueExpected */: return 'ValueExpected';
        case 5 /* ColonExpected */: return 'ColonExpected';
        case 6 /* CommaExpected */: return 'CommaExpected';
        case 7 /* CloseBraceExpected */: return 'CloseBraceExpected';
        case 8 /* CloseBracketExpected */: return 'CloseBracketExpected';
        case 9 /* EndOfFileExpected */: return 'EndOfFileExpected';
        case 10 /* InvalidCommentToken */: return 'InvalidCommentToken';
        case 11 /* UnexpectedEndOfComment */: return 'UnexpectedEndOfComment';
        case 12 /* UnexpectedEndOfString */: return 'UnexpectedEndOfString';
        case 13 /* UnexpectedEndOfNumber */: return 'UnexpectedEndOfNumber';
        case 14 /* InvalidUnicode */: return 'InvalidUnicode';
        case 15 /* InvalidEscapeCharacter */: return 'InvalidEscapeCharacter';
        case 16 /* InvalidCharacter */: return 'InvalidCharacter';
    }
    return '<unknown ParseErrorCode>';
}
/**
 * Computes the edits needed to format a JSON document.
 *
 * @param documentText The input text
 * @param range The range to format or `undefined` to format the full content
 * @param options The formatting options
 * @returns A list of edit operations describing the formatting changes to the original document. Edits can be either inserts, replacements or
 * removals of text segments. All offsets refer to the original state of the document. No two edits must change or remove the same range of
 * text in the original document. However, multiple edits can have
 * the same offset, for example multiple inserts, or an insert followed by a remove or replace. The order in the array defines which edit is applied first.
 * To apply edits to an input, you can use `applyEdits`.
 */
function format(documentText, range, options) {
    return _impl_format__WEBPACK_IMPORTED_MODULE_0__.format(documentText, range, options);
}
/**
 * Computes the edits needed to modify a value in the JSON document.
 *
 * @param documentText The input text
 * @param path The path of the value to change. The path represents either to the document root, a property or an array item.
 * If the path points to an non-existing property or item, it will be created.
 * @param value The new value for the specified property or item. If the value is undefined,
 * the property or item will be removed.
 * @param options Options
 * @returns A list of edit operations describing the formatting changes to the original document. Edits can be either inserts, replacements or
 * removals of text segments. All offsets refer to the original state of the document. No two edits must change or remove the same range of
 * text in the original document. However, multiple edits can have
 * the same offset, for example multiple inserts, or an insert followed by a remove or replace. The order in the array defines which edit is applied first.
 * To apply edits to an input, you can use `applyEdits`.
 */
function modify(text, path, value, options) {
    return _impl_edit__WEBPACK_IMPORTED_MODULE_1__.setProperty(text, path, value, options);
}
/**
 * Applies edits to a input string.
 */
function applyEdits(text, edits) {
    for (var i = edits.length - 1; i >= 0; i--) {
        text = _impl_edit__WEBPACK_IMPORTED_MODULE_1__.applyEdit(text, edits[i]);
    }
    return text;
}


/***/ }),
/* 109 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "format": () => (/* binding */ format),
/* harmony export */   "isEOL": () => (/* binding */ isEOL)
/* harmony export */ });
/* harmony import */ var _scanner__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(110);
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


function format(documentText, range, options) {
    var initialIndentLevel;
    var formatText;
    var formatTextStart;
    var rangeStart;
    var rangeEnd;
    if (range) {
        rangeStart = range.offset;
        rangeEnd = rangeStart + range.length;
        formatTextStart = rangeStart;
        while (formatTextStart > 0 && !isEOL(documentText, formatTextStart - 1)) {
            formatTextStart--;
        }
        var endOffset = rangeEnd;
        while (endOffset < documentText.length && !isEOL(documentText, endOffset)) {
            endOffset++;
        }
        formatText = documentText.substring(formatTextStart, endOffset);
        initialIndentLevel = computeIndentLevel(formatText, options);
    }
    else {
        formatText = documentText;
        initialIndentLevel = 0;
        formatTextStart = 0;
        rangeStart = 0;
        rangeEnd = documentText.length;
    }
    var eol = getEOL(options, documentText);
    var lineBreak = false;
    var indentLevel = 0;
    var indentValue;
    if (options.insertSpaces) {
        indentValue = repeat(' ', options.tabSize || 4);
    }
    else {
        indentValue = '\t';
    }
    var scanner = (0,_scanner__WEBPACK_IMPORTED_MODULE_0__.createScanner)(formatText, false);
    var hasError = false;
    function newLineAndIndent() {
        return eol + repeat(indentValue, initialIndentLevel + indentLevel);
    }
    function scanNext() {
        var token = scanner.scan();
        lineBreak = false;
        while (token === 15 /* Trivia */ || token === 14 /* LineBreakTrivia */) {
            lineBreak = lineBreak || (token === 14 /* LineBreakTrivia */);
            token = scanner.scan();
        }
        hasError = token === 16 /* Unknown */ || scanner.getTokenError() !== 0 /* None */;
        return token;
    }
    var editOperations = [];
    function addEdit(text, startOffset, endOffset) {
        if (!hasError && startOffset < rangeEnd && endOffset > rangeStart && documentText.substring(startOffset, endOffset) !== text) {
            editOperations.push({ offset: startOffset, length: endOffset - startOffset, content: text });
        }
    }
    var firstToken = scanNext();
    if (firstToken !== 17 /* EOF */) {
        var firstTokenStart = scanner.getTokenOffset() + formatTextStart;
        var initialIndent = repeat(indentValue, initialIndentLevel);
        addEdit(initialIndent, formatTextStart, firstTokenStart);
    }
    while (firstToken !== 17 /* EOF */) {
        var firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
        var secondToken = scanNext();
        var replaceContent = '';
        while (!lineBreak && (secondToken === 12 /* LineCommentTrivia */ || secondToken === 13 /* BlockCommentTrivia */)) {
            // comments on the same line: keep them on the same line, but ignore them otherwise
            var commentTokenStart = scanner.getTokenOffset() + formatTextStart;
            addEdit(' ', firstTokenEnd, commentTokenStart);
            firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
            replaceContent = secondToken === 12 /* LineCommentTrivia */ ? newLineAndIndent() : '';
            secondToken = scanNext();
        }
        if (secondToken === 2 /* CloseBraceToken */) {
            if (firstToken !== 1 /* OpenBraceToken */) {
                indentLevel--;
                replaceContent = newLineAndIndent();
            }
        }
        else if (secondToken === 4 /* CloseBracketToken */) {
            if (firstToken !== 3 /* OpenBracketToken */) {
                indentLevel--;
                replaceContent = newLineAndIndent();
            }
        }
        else {
            switch (firstToken) {
                case 3 /* OpenBracketToken */:
                case 1 /* OpenBraceToken */:
                    indentLevel++;
                    replaceContent = newLineAndIndent();
                    break;
                case 5 /* CommaToken */:
                case 12 /* LineCommentTrivia */:
                    replaceContent = newLineAndIndent();
                    break;
                case 13 /* BlockCommentTrivia */:
                    if (lineBreak) {
                        replaceContent = newLineAndIndent();
                    }
                    else {
                        // symbol following comment on the same line: keep on same line, separate with ' '
                        replaceContent = ' ';
                    }
                    break;
                case 6 /* ColonToken */:
                    replaceContent = ' ';
                    break;
                case 10 /* StringLiteral */:
                    if (secondToken === 6 /* ColonToken */) {
                        replaceContent = '';
                        break;
                    }
                // fall through
                case 7 /* NullKeyword */:
                case 8 /* TrueKeyword */:
                case 9 /* FalseKeyword */:
                case 11 /* NumericLiteral */:
                case 2 /* CloseBraceToken */:
                case 4 /* CloseBracketToken */:
                    if (secondToken === 12 /* LineCommentTrivia */ || secondToken === 13 /* BlockCommentTrivia */) {
                        replaceContent = ' ';
                    }
                    else if (secondToken !== 5 /* CommaToken */ && secondToken !== 17 /* EOF */) {
                        hasError = true;
                    }
                    break;
                case 16 /* Unknown */:
                    hasError = true;
                    break;
            }
            if (lineBreak && (secondToken === 12 /* LineCommentTrivia */ || secondToken === 13 /* BlockCommentTrivia */)) {
                replaceContent = newLineAndIndent();
            }
        }
        var secondTokenStart = scanner.getTokenOffset() + formatTextStart;
        addEdit(replaceContent, firstTokenEnd, secondTokenStart);
        firstToken = secondToken;
    }
    return editOperations;
}
function repeat(s, count) {
    var result = '';
    for (var i = 0; i < count; i++) {
        result += s;
    }
    return result;
}
function computeIndentLevel(content, options) {
    var i = 0;
    var nChars = 0;
    var tabSize = options.tabSize || 4;
    while (i < content.length) {
        var ch = content.charAt(i);
        if (ch === ' ') {
            nChars++;
        }
        else if (ch === '\t') {
            nChars += tabSize;
        }
        else {
            break;
        }
        i++;
    }
    return Math.floor(nChars / tabSize);
}
function getEOL(options, text) {
    for (var i = 0; i < text.length; i++) {
        var ch = text.charAt(i);
        if (ch === '\r') {
            if (i + 1 < text.length && text.charAt(i + 1) === '\n') {
                return '\r\n';
            }
            return '\r';
        }
        else if (ch === '\n') {
            return '\n';
        }
    }
    return (options && options.eol) || '\n';
}
function isEOL(text, offset) {
    return '\r\n'.indexOf(text.charAt(offset)) !== -1;
}


/***/ }),
/* 110 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createScanner": () => (/* binding */ createScanner)
/* harmony export */ });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Creates a JSON scanner on the given text.
 * If ignoreTrivia is set, whitespaces or comments are ignored.
 */
function createScanner(text, ignoreTrivia) {
    if (ignoreTrivia === void 0) { ignoreTrivia = false; }
    var len = text.length;
    var pos = 0, value = '', tokenOffset = 0, token = 16 /* Unknown */, lineNumber = 0, lineStartOffset = 0, tokenLineStartOffset = 0, prevTokenLineStartOffset = 0, scanError = 0 /* None */;
    function scanHexDigits(count, exact) {
        var digits = 0;
        var value = 0;
        while (digits < count || !exact) {
            var ch = text.charCodeAt(pos);
            if (ch >= 48 /* _0 */ && ch <= 57 /* _9 */) {
                value = value * 16 + ch - 48 /* _0 */;
            }
            else if (ch >= 65 /* A */ && ch <= 70 /* F */) {
                value = value * 16 + ch - 65 /* A */ + 10;
            }
            else if (ch >= 97 /* a */ && ch <= 102 /* f */) {
                value = value * 16 + ch - 97 /* a */ + 10;
            }
            else {
                break;
            }
            pos++;
            digits++;
        }
        if (digits < count) {
            value = -1;
        }
        return value;
    }
    function setPosition(newPosition) {
        pos = newPosition;
        value = '';
        tokenOffset = 0;
        token = 16 /* Unknown */;
        scanError = 0 /* None */;
    }
    function scanNumber() {
        var start = pos;
        if (text.charCodeAt(pos) === 48 /* _0 */) {
            pos++;
        }
        else {
            pos++;
            while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                pos++;
            }
        }
        if (pos < text.length && text.charCodeAt(pos) === 46 /* dot */) {
            pos++;
            if (pos < text.length && isDigit(text.charCodeAt(pos))) {
                pos++;
                while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                }
            }
            else {
                scanError = 3 /* UnexpectedEndOfNumber */;
                return text.substring(start, pos);
            }
        }
        var end = pos;
        if (pos < text.length && (text.charCodeAt(pos) === 69 /* E */ || text.charCodeAt(pos) === 101 /* e */)) {
            pos++;
            if (pos < text.length && text.charCodeAt(pos) === 43 /* plus */ || text.charCodeAt(pos) === 45 /* minus */) {
                pos++;
            }
            if (pos < text.length && isDigit(text.charCodeAt(pos))) {
                pos++;
                while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                }
                end = pos;
            }
            else {
                scanError = 3 /* UnexpectedEndOfNumber */;
            }
        }
        return text.substring(start, end);
    }
    function scanString() {
        var result = '', start = pos;
        while (true) {
            if (pos >= len) {
                result += text.substring(start, pos);
                scanError = 2 /* UnexpectedEndOfString */;
                break;
            }
            var ch = text.charCodeAt(pos);
            if (ch === 34 /* doubleQuote */) {
                result += text.substring(start, pos);
                pos++;
                break;
            }
            if (ch === 92 /* backslash */) {
                result += text.substring(start, pos);
                pos++;
                if (pos >= len) {
                    scanError = 2 /* UnexpectedEndOfString */;
                    break;
                }
                var ch2 = text.charCodeAt(pos++);
                switch (ch2) {
                    case 34 /* doubleQuote */:
                        result += '\"';
                        break;
                    case 92 /* backslash */:
                        result += '\\';
                        break;
                    case 47 /* slash */:
                        result += '/';
                        break;
                    case 98 /* b */:
                        result += '\b';
                        break;
                    case 102 /* f */:
                        result += '\f';
                        break;
                    case 110 /* n */:
                        result += '\n';
                        break;
                    case 114 /* r */:
                        result += '\r';
                        break;
                    case 116 /* t */:
                        result += '\t';
                        break;
                    case 117 /* u */:
                        var ch3 = scanHexDigits(4, true);
                        if (ch3 >= 0) {
                            result += String.fromCharCode(ch3);
                        }
                        else {
                            scanError = 4 /* InvalidUnicode */;
                        }
                        break;
                    default:
                        scanError = 5 /* InvalidEscapeCharacter */;
                }
                start = pos;
                continue;
            }
            if (ch >= 0 && ch <= 0x1f) {
                if (isLineBreak(ch)) {
                    result += text.substring(start, pos);
                    scanError = 2 /* UnexpectedEndOfString */;
                    break;
                }
                else {
                    scanError = 6 /* InvalidCharacter */;
                    // mark as error but continue with string
                }
            }
            pos++;
        }
        return result;
    }
    function scanNext() {
        value = '';
        scanError = 0 /* None */;
        tokenOffset = pos;
        lineStartOffset = lineNumber;
        prevTokenLineStartOffset = tokenLineStartOffset;
        if (pos >= len) {
            // at the end
            tokenOffset = len;
            return token = 17 /* EOF */;
        }
        var code = text.charCodeAt(pos);
        // trivia: whitespace
        if (isWhiteSpace(code)) {
            do {
                pos++;
                value += String.fromCharCode(code);
                code = text.charCodeAt(pos);
            } while (isWhiteSpace(code));
            return token = 15 /* Trivia */;
        }
        // trivia: newlines
        if (isLineBreak(code)) {
            pos++;
            value += String.fromCharCode(code);
            if (code === 13 /* carriageReturn */ && text.charCodeAt(pos) === 10 /* lineFeed */) {
                pos++;
                value += '\n';
            }
            lineNumber++;
            tokenLineStartOffset = pos;
            return token = 14 /* LineBreakTrivia */;
        }
        switch (code) {
            // tokens: []{}:,
            case 123 /* openBrace */:
                pos++;
                return token = 1 /* OpenBraceToken */;
            case 125 /* closeBrace */:
                pos++;
                return token = 2 /* CloseBraceToken */;
            case 91 /* openBracket */:
                pos++;
                return token = 3 /* OpenBracketToken */;
            case 93 /* closeBracket */:
                pos++;
                return token = 4 /* CloseBracketToken */;
            case 58 /* colon */:
                pos++;
                return token = 6 /* ColonToken */;
            case 44 /* comma */:
                pos++;
                return token = 5 /* CommaToken */;
            // strings
            case 34 /* doubleQuote */:
                pos++;
                value = scanString();
                return token = 10 /* StringLiteral */;
            // comments
            case 47 /* slash */:
                var start = pos - 1;
                // Single-line comment
                if (text.charCodeAt(pos + 1) === 47 /* slash */) {
                    pos += 2;
                    while (pos < len) {
                        if (isLineBreak(text.charCodeAt(pos))) {
                            break;
                        }
                        pos++;
                    }
                    value = text.substring(start, pos);
                    return token = 12 /* LineCommentTrivia */;
                }
                // Multi-line comment
                if (text.charCodeAt(pos + 1) === 42 /* asterisk */) {
                    pos += 2;
                    var safeLength = len - 1; // For lookahead.
                    var commentClosed = false;
                    while (pos < safeLength) {
                        var ch = text.charCodeAt(pos);
                        if (ch === 42 /* asterisk */ && text.charCodeAt(pos + 1) === 47 /* slash */) {
                            pos += 2;
                            commentClosed = true;
                            break;
                        }
                        pos++;
                        if (isLineBreak(ch)) {
                            if (ch === 13 /* carriageReturn */ && text.charCodeAt(pos) === 10 /* lineFeed */) {
                                pos++;
                            }
                            lineNumber++;
                            tokenLineStartOffset = pos;
                        }
                    }
                    if (!commentClosed) {
                        pos++;
                        scanError = 1 /* UnexpectedEndOfComment */;
                    }
                    value = text.substring(start, pos);
                    return token = 13 /* BlockCommentTrivia */;
                }
                // just a single slash
                value += String.fromCharCode(code);
                pos++;
                return token = 16 /* Unknown */;
            // numbers
            case 45 /* minus */:
                value += String.fromCharCode(code);
                pos++;
                if (pos === len || !isDigit(text.charCodeAt(pos))) {
                    return token = 16 /* Unknown */;
                }
            // found a minus, followed by a number so
            // we fall through to proceed with scanning
            // numbers
            case 48 /* _0 */:
            case 49 /* _1 */:
            case 50 /* _2 */:
            case 51 /* _3 */:
            case 52 /* _4 */:
            case 53 /* _5 */:
            case 54 /* _6 */:
            case 55 /* _7 */:
            case 56 /* _8 */:
            case 57 /* _9 */:
                value += scanNumber();
                return token = 11 /* NumericLiteral */;
            // literals and unknown symbols
            default:
                // is a literal? Read the full word.
                while (pos < len && isUnknownContentCharacter(code)) {
                    pos++;
                    code = text.charCodeAt(pos);
                }
                if (tokenOffset !== pos) {
                    value = text.substring(tokenOffset, pos);
                    // keywords: true, false, null
                    switch (value) {
                        case 'true': return token = 8 /* TrueKeyword */;
                        case 'false': return token = 9 /* FalseKeyword */;
                        case 'null': return token = 7 /* NullKeyword */;
                    }
                    return token = 16 /* Unknown */;
                }
                // some
                value += String.fromCharCode(code);
                pos++;
                return token = 16 /* Unknown */;
        }
    }
    function isUnknownContentCharacter(code) {
        if (isWhiteSpace(code) || isLineBreak(code)) {
            return false;
        }
        switch (code) {
            case 125 /* closeBrace */:
            case 93 /* closeBracket */:
            case 123 /* openBrace */:
            case 91 /* openBracket */:
            case 34 /* doubleQuote */:
            case 58 /* colon */:
            case 44 /* comma */:
            case 47 /* slash */:
                return false;
        }
        return true;
    }
    function scanNextNonTrivia() {
        var result;
        do {
            result = scanNext();
        } while (result >= 12 /* LineCommentTrivia */ && result <= 15 /* Trivia */);
        return result;
    }
    return {
        setPosition: setPosition,
        getPosition: function () { return pos; },
        scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
        getToken: function () { return token; },
        getTokenValue: function () { return value; },
        getTokenOffset: function () { return tokenOffset; },
        getTokenLength: function () { return pos - tokenOffset; },
        getTokenStartLine: function () { return lineStartOffset; },
        getTokenStartCharacter: function () { return tokenOffset - prevTokenLineStartOffset; },
        getTokenError: function () { return scanError; },
    };
}
function isWhiteSpace(ch) {
    return ch === 32 /* space */ || ch === 9 /* tab */ || ch === 11 /* verticalTab */ || ch === 12 /* formFeed */ ||
        ch === 160 /* nonBreakingSpace */ || ch === 5760 /* ogham */ || ch >= 8192 /* enQuad */ && ch <= 8203 /* zeroWidthSpace */ ||
        ch === 8239 /* narrowNoBreakSpace */ || ch === 8287 /* mathematicalSpace */ || ch === 12288 /* ideographicSpace */ || ch === 65279 /* byteOrderMark */;
}
function isLineBreak(ch) {
    return ch === 10 /* lineFeed */ || ch === 13 /* carriageReturn */ || ch === 8232 /* lineSeparator */ || ch === 8233 /* paragraphSeparator */;
}
function isDigit(ch) {
    return ch >= 48 /* _0 */ && ch <= 57 /* _9 */;
}


/***/ }),
/* 111 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "removeProperty": () => (/* binding */ removeProperty),
/* harmony export */   "setProperty": () => (/* binding */ setProperty),
/* harmony export */   "applyEdit": () => (/* binding */ applyEdit),
/* harmony export */   "isWS": () => (/* binding */ isWS)
/* harmony export */ });
/* harmony import */ var _format__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(109);
/* harmony import */ var _parser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(112);
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/



function removeProperty(text, path, options) {
    return setProperty(text, path, void 0, options);
}
function setProperty(text, originalPath, value, options) {
    var _a;
    var path = originalPath.slice();
    var errors = [];
    var root = (0,_parser__WEBPACK_IMPORTED_MODULE_1__.parseTree)(text, errors);
    var parent = void 0;
    var lastSegment = void 0;
    while (path.length > 0) {
        lastSegment = path.pop();
        parent = (0,_parser__WEBPACK_IMPORTED_MODULE_1__.findNodeAtLocation)(root, path);
        if (parent === void 0 && value !== void 0) {
            if (typeof lastSegment === 'string') {
                value = (_a = {}, _a[lastSegment] = value, _a);
            }
            else {
                value = [value];
            }
        }
        else {
            break;
        }
    }
    if (!parent) {
        // empty document
        if (value === void 0) { // delete
            throw new Error('Can not delete in empty document');
        }
        return withFormatting(text, { offset: root ? root.offset : 0, length: root ? root.length : 0, content: JSON.stringify(value) }, options);
    }
    else if (parent.type === 'object' && typeof lastSegment === 'string' && Array.isArray(parent.children)) {
        var existing = (0,_parser__WEBPACK_IMPORTED_MODULE_1__.findNodeAtLocation)(parent, [lastSegment]);
        if (existing !== void 0) {
            if (value === void 0) { // delete
                if (!existing.parent) {
                    throw new Error('Malformed AST');
                }
                var propertyIndex = parent.children.indexOf(existing.parent);
                var removeBegin = void 0;
                var removeEnd = existing.parent.offset + existing.parent.length;
                if (propertyIndex > 0) {
                    // remove the comma of the previous node
                    var previous = parent.children[propertyIndex - 1];
                    removeBegin = previous.offset + previous.length;
                }
                else {
                    removeBegin = parent.offset + 1;
                    if (parent.children.length > 1) {
                        // remove the comma of the next node
                        var next = parent.children[1];
                        removeEnd = next.offset;
                    }
                }
                return withFormatting(text, { offset: removeBegin, length: removeEnd - removeBegin, content: '' }, options);
            }
            else {
                // set value of existing property
                return withFormatting(text, { offset: existing.offset, length: existing.length, content: JSON.stringify(value) }, options);
            }
        }
        else {
            if (value === void 0) { // delete
                return []; // property does not exist, nothing to do
            }
            var newProperty = JSON.stringify(lastSegment) + ": " + JSON.stringify(value);
            var index = options.getInsertionIndex ? options.getInsertionIndex(parent.children.map(function (p) { return p.children[0].value; })) : parent.children.length;
            var edit = void 0;
            if (index > 0) {
                var previous = parent.children[index - 1];
                edit = { offset: previous.offset + previous.length, length: 0, content: ',' + newProperty };
            }
            else if (parent.children.length === 0) {
                edit = { offset: parent.offset + 1, length: 0, content: newProperty };
            }
            else {
                edit = { offset: parent.offset + 1, length: 0, content: newProperty + ',' };
            }
            return withFormatting(text, edit, options);
        }
    }
    else if (parent.type === 'array' && typeof lastSegment === 'number' && Array.isArray(parent.children)) {
        var insertIndex = lastSegment;
        if (insertIndex === -1) {
            // Insert
            var newProperty = "" + JSON.stringify(value);
            var edit = void 0;
            if (parent.children.length === 0) {
                edit = { offset: parent.offset + 1, length: 0, content: newProperty };
            }
            else {
                var previous = parent.children[parent.children.length - 1];
                edit = { offset: previous.offset + previous.length, length: 0, content: ',' + newProperty };
            }
            return withFormatting(text, edit, options);
        }
        else if (value === void 0 && parent.children.length >= 0) {
            // Removal
            var removalIndex = lastSegment;
            var toRemove = parent.children[removalIndex];
            var edit = void 0;
            if (parent.children.length === 1) {
                // only item
                edit = { offset: parent.offset + 1, length: parent.length - 2, content: '' };
            }
            else if (parent.children.length - 1 === removalIndex) {
                // last item
                var previous = parent.children[removalIndex - 1];
                var offset = previous.offset + previous.length;
                var parentEndOffset = parent.offset + parent.length;
                edit = { offset: offset, length: parentEndOffset - 2 - offset, content: '' };
            }
            else {
                edit = { offset: toRemove.offset, length: parent.children[removalIndex + 1].offset - toRemove.offset, content: '' };
            }
            return withFormatting(text, edit, options);
        }
        else if (value !== void 0) {
            var edit = void 0;
            var newProperty = "" + JSON.stringify(value);
            if (!options.isArrayInsertion && parent.children.length > lastSegment) {
                var toModify = parent.children[lastSegment];
                edit = { offset: toModify.offset, length: toModify.length, content: newProperty };
            }
            else if (parent.children.length === 0 || lastSegment === 0) {
                edit = { offset: parent.offset + 1, length: 0, content: parent.children.length === 0 ? newProperty : newProperty + ',' };
            }
            else {
                var index = lastSegment > parent.children.length ? parent.children.length : lastSegment;
                var previous = parent.children[index - 1];
                edit = { offset: previous.offset + previous.length, length: 0, content: ',' + newProperty };
            }
            return withFormatting(text, edit, options);
        }
        else {
            throw new Error("Can not " + (value === void 0 ? 'remove' : (options.isArrayInsertion ? 'insert' : 'modify')) + " Array index " + insertIndex + " as length is not sufficient");
        }
    }
    else {
        throw new Error("Can not add " + (typeof lastSegment !== 'number' ? 'index' : 'property') + " to parent of type " + parent.type);
    }
}
function withFormatting(text, edit, options) {
    if (!options.formattingOptions) {
        return [edit];
    }
    // apply the edit
    var newText = applyEdit(text, edit);
    // format the new text
    var begin = edit.offset;
    var end = edit.offset + edit.content.length;
    if (edit.length === 0 || edit.content.length === 0) { // insert or remove
        while (begin > 0 && !(0,_format__WEBPACK_IMPORTED_MODULE_0__.isEOL)(newText, begin - 1)) {
            begin--;
        }
        while (end < newText.length && !(0,_format__WEBPACK_IMPORTED_MODULE_0__.isEOL)(newText, end)) {
            end++;
        }
    }
    var edits = (0,_format__WEBPACK_IMPORTED_MODULE_0__.format)(newText, { offset: begin, length: end - begin }, options.formattingOptions);
    // apply the formatting edits and track the begin and end offsets of the changes
    for (var i = edits.length - 1; i >= 0; i--) {
        var edit_1 = edits[i];
        newText = applyEdit(newText, edit_1);
        begin = Math.min(begin, edit_1.offset);
        end = Math.max(end, edit_1.offset + edit_1.length);
        end += edit_1.content.length - edit_1.length;
    }
    // create a single edit with all changes
    var editLength = text.length - (newText.length - end) - begin;
    return [{ offset: begin, length: editLength, content: newText.substring(begin, end) }];
}
function applyEdit(text, edit) {
    return text.substring(0, edit.offset) + edit.content + text.substring(edit.offset + edit.length);
}
function isWS(text, offset) {
    return '\r\n \t'.indexOf(text.charAt(offset)) !== -1;
}


/***/ }),
/* 112 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getLocation": () => (/* binding */ getLocation),
/* harmony export */   "parse": () => (/* binding */ parse),
/* harmony export */   "parseTree": () => (/* binding */ parseTree),
/* harmony export */   "findNodeAtLocation": () => (/* binding */ findNodeAtLocation),
/* harmony export */   "getNodePath": () => (/* binding */ getNodePath),
/* harmony export */   "getNodeValue": () => (/* binding */ getNodeValue),
/* harmony export */   "contains": () => (/* binding */ contains),
/* harmony export */   "findNodeAtOffset": () => (/* binding */ findNodeAtOffset),
/* harmony export */   "visit": () => (/* binding */ visit),
/* harmony export */   "stripComments": () => (/* binding */ stripComments),
/* harmony export */   "getNodeType": () => (/* binding */ getNodeType)
/* harmony export */ });
/* harmony import */ var _scanner__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(110);
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


var ParseOptions;
(function (ParseOptions) {
    ParseOptions.DEFAULT = {
        allowTrailingComma: false
    };
})(ParseOptions || (ParseOptions = {}));
/**
 * For a given offset, evaluate the location in the JSON document. Each segment in the location path is either a property name or an array index.
 */
function getLocation(text, position) {
    var segments = []; // strings or numbers
    var earlyReturnException = new Object();
    var previousNode = undefined;
    var previousNodeInst = {
        value: {},
        offset: 0,
        length: 0,
        type: 'object',
        parent: undefined
    };
    var isAtPropertyKey = false;
    function setPreviousNode(value, offset, length, type) {
        previousNodeInst.value = value;
        previousNodeInst.offset = offset;
        previousNodeInst.length = length;
        previousNodeInst.type = type;
        previousNodeInst.colonOffset = undefined;
        previousNode = previousNodeInst;
    }
    try {
        visit(text, {
            onObjectBegin: function (offset, length) {
                if (position <= offset) {
                    throw earlyReturnException;
                }
                previousNode = undefined;
                isAtPropertyKey = position > offset;
                segments.push(''); // push a placeholder (will be replaced)
            },
            onObjectProperty: function (name, offset, length) {
                if (position < offset) {
                    throw earlyReturnException;
                }
                setPreviousNode(name, offset, length, 'property');
                segments[segments.length - 1] = name;
                if (position <= offset + length) {
                    throw earlyReturnException;
                }
            },
            onObjectEnd: function (offset, length) {
                if (position <= offset) {
                    throw earlyReturnException;
                }
                previousNode = undefined;
                segments.pop();
            },
            onArrayBegin: function (offset, length) {
                if (position <= offset) {
                    throw earlyReturnException;
                }
                previousNode = undefined;
                segments.push(0);
            },
            onArrayEnd: function (offset, length) {
                if (position <= offset) {
                    throw earlyReturnException;
                }
                previousNode = undefined;
                segments.pop();
            },
            onLiteralValue: function (value, offset, length) {
                if (position < offset) {
                    throw earlyReturnException;
                }
                setPreviousNode(value, offset, length, getNodeType(value));
                if (position <= offset + length) {
                    throw earlyReturnException;
                }
            },
            onSeparator: function (sep, offset, length) {
                if (position <= offset) {
                    throw earlyReturnException;
                }
                if (sep === ':' && previousNode && previousNode.type === 'property') {
                    previousNode.colonOffset = offset;
                    isAtPropertyKey = false;
                    previousNode = undefined;
                }
                else if (sep === ',') {
                    var last = segments[segments.length - 1];
                    if (typeof last === 'number') {
                        segments[segments.length - 1] = last + 1;
                    }
                    else {
                        isAtPropertyKey = true;
                        segments[segments.length - 1] = '';
                    }
                    previousNode = undefined;
                }
            }
        });
    }
    catch (e) {
        if (e !== earlyReturnException) {
            throw e;
        }
    }
    return {
        path: segments,
        previousNode: previousNode,
        isAtPropertyKey: isAtPropertyKey,
        matches: function (pattern) {
            var k = 0;
            for (var i = 0; k < pattern.length && i < segments.length; i++) {
                if (pattern[k] === segments[i] || pattern[k] === '*') {
                    k++;
                }
                else if (pattern[k] !== '**') {
                    return false;
                }
            }
            return k === pattern.length;
        }
    };
}
/**
 * Parses the given text and returns the object the JSON content represents. On invalid input, the parser tries to be as fault tolerant as possible, but still return a result.
 * Therefore always check the errors list to find out if the input was valid.
 */
function parse(text, errors, options) {
    if (errors === void 0) { errors = []; }
    if (options === void 0) { options = ParseOptions.DEFAULT; }
    var currentProperty = null;
    var currentParent = [];
    var previousParents = [];
    function onValue(value) {
        if (Array.isArray(currentParent)) {
            currentParent.push(value);
        }
        else if (currentProperty !== null) {
            currentParent[currentProperty] = value;
        }
    }
    var visitor = {
        onObjectBegin: function () {
            var object = {};
            onValue(object);
            previousParents.push(currentParent);
            currentParent = object;
            currentProperty = null;
        },
        onObjectProperty: function (name) {
            currentProperty = name;
        },
        onObjectEnd: function () {
            currentParent = previousParents.pop();
        },
        onArrayBegin: function () {
            var array = [];
            onValue(array);
            previousParents.push(currentParent);
            currentParent = array;
            currentProperty = null;
        },
        onArrayEnd: function () {
            currentParent = previousParents.pop();
        },
        onLiteralValue: onValue,
        onError: function (error, offset, length) {
            errors.push({ error: error, offset: offset, length: length });
        }
    };
    visit(text, visitor, options);
    return currentParent[0];
}
/**
 * Parses the given text and returns a tree representation the JSON content. On invalid input, the parser tries to be as fault tolerant as possible, but still return a result.
 */
function parseTree(text, errors, options) {
    if (errors === void 0) { errors = []; }
    if (options === void 0) { options = ParseOptions.DEFAULT; }
    var currentParent = { type: 'array', offset: -1, length: -1, children: [], parent: undefined }; // artificial root
    function ensurePropertyComplete(endOffset) {
        if (currentParent.type === 'property') {
            currentParent.length = endOffset - currentParent.offset;
            currentParent = currentParent.parent;
        }
    }
    function onValue(valueNode) {
        currentParent.children.push(valueNode);
        return valueNode;
    }
    var visitor = {
        onObjectBegin: function (offset) {
            currentParent = onValue({ type: 'object', offset: offset, length: -1, parent: currentParent, children: [] });
        },
        onObjectProperty: function (name, offset, length) {
            currentParent = onValue({ type: 'property', offset: offset, length: -1, parent: currentParent, children: [] });
            currentParent.children.push({ type: 'string', value: name, offset: offset, length: length, parent: currentParent });
        },
        onObjectEnd: function (offset, length) {
            ensurePropertyComplete(offset + length); // in case of a missing value for a property: make sure property is complete
            currentParent.length = offset + length - currentParent.offset;
            currentParent = currentParent.parent;
            ensurePropertyComplete(offset + length);
        },
        onArrayBegin: function (offset, length) {
            currentParent = onValue({ type: 'array', offset: offset, length: -1, parent: currentParent, children: [] });
        },
        onArrayEnd: function (offset, length) {
            currentParent.length = offset + length - currentParent.offset;
            currentParent = currentParent.parent;
            ensurePropertyComplete(offset + length);
        },
        onLiteralValue: function (value, offset, length) {
            onValue({ type: getNodeType(value), offset: offset, length: length, parent: currentParent, value: value });
            ensurePropertyComplete(offset + length);
        },
        onSeparator: function (sep, offset, length) {
            if (currentParent.type === 'property') {
                if (sep === ':') {
                    currentParent.colonOffset = offset;
                }
                else if (sep === ',') {
                    ensurePropertyComplete(offset);
                }
            }
        },
        onError: function (error, offset, length) {
            errors.push({ error: error, offset: offset, length: length });
        }
    };
    visit(text, visitor, options);
    var result = currentParent.children[0];
    if (result) {
        delete result.parent;
    }
    return result;
}
/**
 * Finds the node at the given path in a JSON DOM.
 */
function findNodeAtLocation(root, path) {
    if (!root) {
        return undefined;
    }
    var node = root;
    for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
        var segment = path_1[_i];
        if (typeof segment === 'string') {
            if (node.type !== 'object' || !Array.isArray(node.children)) {
                return undefined;
            }
            var found = false;
            for (var _a = 0, _b = node.children; _a < _b.length; _a++) {
                var propertyNode = _b[_a];
                if (Array.isArray(propertyNode.children) && propertyNode.children[0].value === segment) {
                    node = propertyNode.children[1];
                    found = true;
                    break;
                }
            }
            if (!found) {
                return undefined;
            }
        }
        else {
            var index = segment;
            if (node.type !== 'array' || index < 0 || !Array.isArray(node.children) || index >= node.children.length) {
                return undefined;
            }
            node = node.children[index];
        }
    }
    return node;
}
/**
 * Gets the JSON path of the given JSON DOM node
 */
function getNodePath(node) {
    if (!node.parent || !node.parent.children) {
        return [];
    }
    var path = getNodePath(node.parent);
    if (node.parent.type === 'property') {
        var key = node.parent.children[0].value;
        path.push(key);
    }
    else if (node.parent.type === 'array') {
        var index = node.parent.children.indexOf(node);
        if (index !== -1) {
            path.push(index);
        }
    }
    return path;
}
/**
 * Evaluates the JavaScript object of the given JSON DOM node
 */
function getNodeValue(node) {
    switch (node.type) {
        case 'array':
            return node.children.map(getNodeValue);
        case 'object':
            var obj = Object.create(null);
            for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                var prop = _a[_i];
                var valueNode = prop.children[1];
                if (valueNode) {
                    obj[prop.children[0].value] = getNodeValue(valueNode);
                }
            }
            return obj;
        case 'null':
        case 'string':
        case 'number':
        case 'boolean':
            return node.value;
        default:
            return undefined;
    }
}
function contains(node, offset, includeRightBound) {
    if (includeRightBound === void 0) { includeRightBound = false; }
    return (offset >= node.offset && offset < (node.offset + node.length)) || includeRightBound && (offset === (node.offset + node.length));
}
/**
 * Finds the most inner node at the given offset. If includeRightBound is set, also finds nodes that end at the given offset.
 */
function findNodeAtOffset(node, offset, includeRightBound) {
    if (includeRightBound === void 0) { includeRightBound = false; }
    if (contains(node, offset, includeRightBound)) {
        var children = node.children;
        if (Array.isArray(children)) {
            for (var i = 0; i < children.length && children[i].offset <= offset; i++) {
                var item = findNodeAtOffset(children[i], offset, includeRightBound);
                if (item) {
                    return item;
                }
            }
        }
        return node;
    }
    return undefined;
}
/**
 * Parses the given text and invokes the visitor functions for each object, array and literal reached.
 */
function visit(text, visitor, options) {
    if (options === void 0) { options = ParseOptions.DEFAULT; }
    var _scanner = (0,_scanner__WEBPACK_IMPORTED_MODULE_0__.createScanner)(text, false);
    function toNoArgVisit(visitFunction) {
        return visitFunction ? function () { return visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()); } : function () { return true; };
    }
    function toOneArgVisit(visitFunction) {
        return visitFunction ? function (arg) { return visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()); } : function () { return true; };
    }
    var onObjectBegin = toNoArgVisit(visitor.onObjectBegin), onObjectProperty = toOneArgVisit(visitor.onObjectProperty), onObjectEnd = toNoArgVisit(visitor.onObjectEnd), onArrayBegin = toNoArgVisit(visitor.onArrayBegin), onArrayEnd = toNoArgVisit(visitor.onArrayEnd), onLiteralValue = toOneArgVisit(visitor.onLiteralValue), onSeparator = toOneArgVisit(visitor.onSeparator), onComment = toNoArgVisit(visitor.onComment), onError = toOneArgVisit(visitor.onError);
    var disallowComments = options && options.disallowComments;
    var allowTrailingComma = options && options.allowTrailingComma;
    function scanNext() {
        while (true) {
            var token = _scanner.scan();
            switch (_scanner.getTokenError()) {
                case 4 /* InvalidUnicode */:
                    handleError(14 /* InvalidUnicode */);
                    break;
                case 5 /* InvalidEscapeCharacter */:
                    handleError(15 /* InvalidEscapeCharacter */);
                    break;
                case 3 /* UnexpectedEndOfNumber */:
                    handleError(13 /* UnexpectedEndOfNumber */);
                    break;
                case 1 /* UnexpectedEndOfComment */:
                    if (!disallowComments) {
                        handleError(11 /* UnexpectedEndOfComment */);
                    }
                    break;
                case 2 /* UnexpectedEndOfString */:
                    handleError(12 /* UnexpectedEndOfString */);
                    break;
                case 6 /* InvalidCharacter */:
                    handleError(16 /* InvalidCharacter */);
                    break;
            }
            switch (token) {
                case 12 /* LineCommentTrivia */:
                case 13 /* BlockCommentTrivia */:
                    if (disallowComments) {
                        handleError(10 /* InvalidCommentToken */);
                    }
                    else {
                        onComment();
                    }
                    break;
                case 16 /* Unknown */:
                    handleError(1 /* InvalidSymbol */);
                    break;
                case 15 /* Trivia */:
                case 14 /* LineBreakTrivia */:
                    break;
                default:
                    return token;
            }
        }
    }
    function handleError(error, skipUntilAfter, skipUntil) {
        if (skipUntilAfter === void 0) { skipUntilAfter = []; }
        if (skipUntil === void 0) { skipUntil = []; }
        onError(error);
        if (skipUntilAfter.length + skipUntil.length > 0) {
            var token = _scanner.getToken();
            while (token !== 17 /* EOF */) {
                if (skipUntilAfter.indexOf(token) !== -1) {
                    scanNext();
                    break;
                }
                else if (skipUntil.indexOf(token) !== -1) {
                    break;
                }
                token = scanNext();
            }
        }
    }
    function parseString(isValue) {
        var value = _scanner.getTokenValue();
        if (isValue) {
            onLiteralValue(value);
        }
        else {
            onObjectProperty(value);
        }
        scanNext();
        return true;
    }
    function parseLiteral() {
        switch (_scanner.getToken()) {
            case 11 /* NumericLiteral */:
                var tokenValue = _scanner.getTokenValue();
                var value = Number(tokenValue);
                if (isNaN(value)) {
                    handleError(2 /* InvalidNumberFormat */);
                    value = 0;
                }
                onLiteralValue(value);
                break;
            case 7 /* NullKeyword */:
                onLiteralValue(null);
                break;
            case 8 /* TrueKeyword */:
                onLiteralValue(true);
                break;
            case 9 /* FalseKeyword */:
                onLiteralValue(false);
                break;
            default:
                return false;
        }
        scanNext();
        return true;
    }
    function parseProperty() {
        if (_scanner.getToken() !== 10 /* StringLiteral */) {
            handleError(3 /* PropertyNameExpected */, [], [2 /* CloseBraceToken */, 5 /* CommaToken */]);
            return false;
        }
        parseString(false);
        if (_scanner.getToken() === 6 /* ColonToken */) {
            onSeparator(':');
            scanNext(); // consume colon
            if (!parseValue()) {
                handleError(4 /* ValueExpected */, [], [2 /* CloseBraceToken */, 5 /* CommaToken */]);
            }
        }
        else {
            handleError(5 /* ColonExpected */, [], [2 /* CloseBraceToken */, 5 /* CommaToken */]);
        }
        return true;
    }
    function parseObject() {
        onObjectBegin();
        scanNext(); // consume open brace
        var needsComma = false;
        while (_scanner.getToken() !== 2 /* CloseBraceToken */ && _scanner.getToken() !== 17 /* EOF */) {
            if (_scanner.getToken() === 5 /* CommaToken */) {
                if (!needsComma) {
                    handleError(4 /* ValueExpected */, [], []);
                }
                onSeparator(',');
                scanNext(); // consume comma
                if (_scanner.getToken() === 2 /* CloseBraceToken */ && allowTrailingComma) {
                    break;
                }
            }
            else if (needsComma) {
                handleError(6 /* CommaExpected */, [], []);
            }
            if (!parseProperty()) {
                handleError(4 /* ValueExpected */, [], [2 /* CloseBraceToken */, 5 /* CommaToken */]);
            }
            needsComma = true;
        }
        onObjectEnd();
        if (_scanner.getToken() !== 2 /* CloseBraceToken */) {
            handleError(7 /* CloseBraceExpected */, [2 /* CloseBraceToken */], []);
        }
        else {
            scanNext(); // consume close brace
        }
        return true;
    }
    function parseArray() {
        onArrayBegin();
        scanNext(); // consume open bracket
        var needsComma = false;
        while (_scanner.getToken() !== 4 /* CloseBracketToken */ && _scanner.getToken() !== 17 /* EOF */) {
            if (_scanner.getToken() === 5 /* CommaToken */) {
                if (!needsComma) {
                    handleError(4 /* ValueExpected */, [], []);
                }
                onSeparator(',');
                scanNext(); // consume comma
                if (_scanner.getToken() === 4 /* CloseBracketToken */ && allowTrailingComma) {
                    break;
                }
            }
            else if (needsComma) {
                handleError(6 /* CommaExpected */, [], []);
            }
            if (!parseValue()) {
                handleError(4 /* ValueExpected */, [], [4 /* CloseBracketToken */, 5 /* CommaToken */]);
            }
            needsComma = true;
        }
        onArrayEnd();
        if (_scanner.getToken() !== 4 /* CloseBracketToken */) {
            handleError(8 /* CloseBracketExpected */, [4 /* CloseBracketToken */], []);
        }
        else {
            scanNext(); // consume close bracket
        }
        return true;
    }
    function parseValue() {
        switch (_scanner.getToken()) {
            case 3 /* OpenBracketToken */:
                return parseArray();
            case 1 /* OpenBraceToken */:
                return parseObject();
            case 10 /* StringLiteral */:
                return parseString(true);
            default:
                return parseLiteral();
        }
    }
    scanNext();
    if (_scanner.getToken() === 17 /* EOF */) {
        if (options.allowEmptyContent) {
            return true;
        }
        handleError(4 /* ValueExpected */, [], []);
        return false;
    }
    if (!parseValue()) {
        handleError(4 /* ValueExpected */, [], []);
        return false;
    }
    if (_scanner.getToken() !== 17 /* EOF */) {
        handleError(9 /* EndOfFileExpected */, [], []);
    }
    return true;
}
/**
 * Takes JSON with JavaScript-style comments and remove
 * them. Optionally replaces every none-newline character
 * of comments with a replaceCharacter
 */
function stripComments(text, replaceCh) {
    var _scanner = (0,_scanner__WEBPACK_IMPORTED_MODULE_0__.createScanner)(text), parts = [], kind, offset = 0, pos;
    do {
        pos = _scanner.getPosition();
        kind = _scanner.scan();
        switch (kind) {
            case 12 /* LineCommentTrivia */:
            case 13 /* BlockCommentTrivia */:
            case 17 /* EOF */:
                if (offset !== pos) {
                    parts.push(text.substring(offset, pos));
                }
                if (replaceCh !== undefined) {
                    parts.push(_scanner.getTokenValue().replace(/[^\r\n]/g, replaceCh));
                }
                offset = _scanner.getPosition();
                break;
        }
    } while (kind !== 17 /* EOF */);
    return parts.join('');
}
function getNodeType(value) {
    switch (typeof value) {
        case 'boolean': return 'boolean';
        case 'number': return 'number';
        case 'string': return 'string';
        case 'object': {
            if (!value) {
                return 'null';
            }
            else if (Array.isArray(value)) {
                return 'array';
            }
            return 'object';
        }
        default: return 'null';
    }
}


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
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = void 0;
const vscode = __webpack_require__(1);
const api_1 = __webpack_require__(2);
const commandManager_1 = __webpack_require__(3);
const index_1 = __webpack_require__(4);
const languageConfiguration_1 = __webpack_require__(19);
const lazyClientHost_1 = __webpack_require__(21);
const cancellation_1 = __webpack_require__(101);
const logDirectoryProvider_1 = __webpack_require__(102);
const serverProcess_browser_1 = __webpack_require__(103);
const versionProvider_1 = __webpack_require__(62);
const activeJsTsEditorTracker_1 = __webpack_require__(104);
const api_2 = __webpack_require__(24);
const configuration_browser_1 = __webpack_require__(105);
const plugins_1 = __webpack_require__(106);
class StaticVersionProvider {
    constructor(_version) {
        this._version = _version;
        this.globalVersion = undefined;
        this.localVersion = undefined;
        this.localVersions = [];
    }
    updateConfiguration(_configuration) {
        // noop
    }
    get defaultVersion() { return this._version; }
    get bundledVersion() { return this._version; }
}
function activate(context) {
    const pluginManager = new plugins_1.PluginManager();
    context.subscriptions.push(pluginManager);
    const commandManager = new commandManager_1.CommandManager();
    context.subscriptions.push(commandManager);
    context.subscriptions.push(new languageConfiguration_1.LanguageConfigurationManager());
    const onCompletionAccepted = new vscode.EventEmitter();
    context.subscriptions.push(onCompletionAccepted);
    const activeJsTsEditorTracker = new activeJsTsEditorTracker_1.ActiveJsTsEditorTracker();
    context.subscriptions.push(activeJsTsEditorTracker);
    const versionProvider = new StaticVersionProvider(new versionProvider_1.TypeScriptVersion("bundled" /* Bundled */, vscode.Uri.joinPath(context.extensionUri, 'dist/browser/typescript/tsserver.web.js').toString(), api_2.default.fromSimpleString('4.5.0')));
    const lazyClientHost = (0, lazyClientHost_1.createLazyClientHost)(context, false, {
        pluginManager,
        commandManager,
        logDirectoryProvider: logDirectoryProvider_1.noopLogDirectoryProvider,
        cancellerFactory: cancellation_1.noopRequestCancellerFactory,
        versionProvider,
        processFactory: serverProcess_browser_1.WorkerServerProcess,
        activeJsTsEditorTracker,
        serviceConfigurationProvider: new configuration_browser_1.BrowserServiceConfigurationProvider(),
    }, item => {
        onCompletionAccepted.fire(item);
    });
    (0, index_1.registerBaseCommands)(commandManager, lazyClientHost, pluginManager, activeJsTsEditorTracker);
    // context.subscriptions.push(task.register(lazyClientHost.map(x => x.serviceClient)));
    Promise.resolve().then(() => __webpack_require__(107)).then(module => {
        context.subscriptions.push(module.register());
    });
    context.subscriptions.push((0, lazyClientHost_1.lazilyActivateClient)(lazyClientHost, pluginManager, activeJsTsEditorTracker));
    return (0, api_1.getExtensionApi)(onCompletionAccepted.event, pluginManager);
}
exports.activate = activate;

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=extension.js.map