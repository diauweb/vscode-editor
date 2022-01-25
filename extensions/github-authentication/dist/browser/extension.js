/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

"use strict";
module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GitHubAuthenticationProvider = exports.AuthProviderType = void 0;
const vscode = __webpack_require__(1);
const uuid_1 = __webpack_require__(3);
const keychain_1 = __webpack_require__(13);
const githubServer_1 = __webpack_require__(17);
const utils_1 = __webpack_require__(19);
const experimentationService_1 = __webpack_require__(20);
const vscode_extension_telemetry_1 = __webpack_require__(65);
const logger_1 = __webpack_require__(66);
var AuthProviderType;
(function (AuthProviderType) {
    AuthProviderType["github"] = "github";
    AuthProviderType["githubEnterprise"] = "github-enterprise";
})(AuthProviderType = exports.AuthProviderType || (exports.AuthProviderType = {}));
class GitHubAuthenticationProvider {
    constructor(context, type) {
        this.context = context;
        this.type = type;
        this._sessionChangeEmitter = new vscode.EventEmitter();
        this._logger = new logger_1.Log(this.type);
        this._keychain = new keychain_1.Keychain(this.context, `${this.type}.auth`, this._logger);
        const { name, version, aiKey } = context.extension.packageJSON;
        this._telemetryReporter = new experimentationService_1.ExperimentationTelemetry(context, new vscode_extension_telemetry_1.default(name, version, aiKey));
        if (this.type === AuthProviderType.github) {
            this._githubServer = new githubServer_1.GitHubServer(this._logger, this._telemetryReporter);
        }
        else {
            this._githubServer = new githubServer_1.GitHubEnterpriseServer(this._logger, this._telemetryReporter);
        }
        // Contains the current state of the sessions we have available.
        this._sessionsPromise = this.readSessions();
        this._disposable = vscode.Disposable.from(this._telemetryReporter, this._githubServer, vscode.authentication.registerAuthenticationProvider(type, this._githubServer.friendlyName, this, { supportsMultipleAccounts: false }), this.context.secrets.onDidChange(() => this.checkForUpdates()));
    }
    dispose() {
        this._disposable.dispose();
    }
    get onDidChangeSessions() {
        return this._sessionChangeEmitter.event;
    }
    async getSessions(scopes) {
        this._logger.info(`Getting sessions for ${scopes?.join(',') || 'all scopes'}...`);
        const sessions = await this._sessionsPromise;
        const finalSessions = scopes
            ? sessions.filter(session => (0, utils_1.arrayEquals)([...session.scopes].sort(), scopes.sort()))
            : sessions;
        this._logger.info(`Got ${finalSessions.length} sessions for ${scopes?.join(',') || 'all scopes'}...`);
        return finalSessions;
    }
    async afterTokenLoad(token) {
        this._githubServer.sendAdditionalTelemetryInfo(token);
    }
    async checkForUpdates() {
        const previousSessions = await this._sessionsPromise;
        this._sessionsPromise = this.readSessions();
        const storedSessions = await this._sessionsPromise;
        const added = [];
        const removed = [];
        storedSessions.forEach(session => {
            const matchesExisting = previousSessions.some(s => s.id === session.id);
            // Another window added a session to the keychain, add it to our state as well
            if (!matchesExisting) {
                this._logger.info('Adding session found in keychain');
                added.push(session);
            }
        });
        previousSessions.forEach(session => {
            const matchesExisting = storedSessions.some(s => s.id === session.id);
            // Another window has logged out, remove from our state
            if (!matchesExisting) {
                this._logger.info('Removing session no longer found in keychain');
                removed.push(session);
            }
        });
        if (added.length || removed.length) {
            this._sessionChangeEmitter.fire({ added, removed, changed: [] });
        }
    }
    async readSessions() {
        let sessionData;
        try {
            this._logger.info('Reading sessions from keychain...');
            const storedSessions = await this._keychain.getToken();
            if (!storedSessions) {
                return [];
            }
            this._logger.info('Got stored sessions!');
            try {
                sessionData = JSON.parse(storedSessions);
            }
            catch (e) {
                await this._keychain.deleteToken();
                throw e;
            }
        }
        catch (e) {
            this._logger.error(`Error reading token: ${e}`);
            return [];
        }
        const sessionPromises = sessionData.map(async (session) => {
            let userInfo;
            if (!session.account) {
                try {
                    userInfo = await this._githubServer.getUserInfo(session.accessToken);
                    this._logger.info(`Verified session with the following scopes: ${session.scopes}`);
                }
                catch (e) {
                    // Remove sessions that return unauthorized response
                    if (e.message === 'Unauthorized') {
                        return undefined;
                    }
                }
            }
            setTimeout(() => this.afterTokenLoad(session.accessToken), 1000);
            this._logger.trace(`Read the following session from the keychain with the following scopes: ${session.scopes}`);
            return {
                id: session.id,
                account: {
                    label: session.account
                        ? session.account.label ?? session.account.displayName ?? '<unknown>'
                        : userInfo?.accountName ?? '<unknown>',
                    id: session.account?.id ?? userInfo?.id ?? '<unknown>'
                },
                scopes: session.scopes,
                accessToken: session.accessToken
            };
        });
        const verifiedSessions = (await Promise.allSettled(sessionPromises))
            .filter(p => p.status === 'fulfilled')
            .map(p => p.value)
            .filter((p) => Boolean(p));
        this._logger.info(`Got ${verifiedSessions.length} verified sessions.`);
        if (verifiedSessions.length !== sessionData.length) {
            await this.storeSessions(verifiedSessions);
        }
        return verifiedSessions;
    }
    async storeSessions(sessions) {
        this._logger.info(`Storing ${sessions.length} sessions...`);
        this._sessionsPromise = Promise.resolve(sessions);
        await this._keychain.setToken(JSON.stringify(sessions));
        this._logger.info(`Stored ${sessions.length} sessions!`);
    }
    async createSession(scopes) {
        try {
            /* __GDPR__
                "login" : {
                    "scopes": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" }
                }
            */
            this._telemetryReporter?.sendTelemetryEvent('login', {
                scopes: JSON.stringify(scopes),
            });
            const scopeString = scopes.join(' ');
            const token = await this._githubServer.login(scopeString);
            this.afterTokenLoad(token);
            const session = await this.tokenToSession(token, scopes);
            const sessions = await this._sessionsPromise;
            const sessionIndex = sessions.findIndex(s => s.id === session.id || s.scopes.join(' ') === scopeString);
            if (sessionIndex > -1) {
                sessions.splice(sessionIndex, 1, session);
            }
            else {
                sessions.push(session);
            }
            await this.storeSessions(sessions);
            this._sessionChangeEmitter.fire({ added: [session], removed: [], changed: [] });
            this._logger.info('Login success!');
            return session;
        }
        catch (e) {
            // If login was cancelled, do not notify user.
            if (e === 'Cancelled') {
                /* __GDPR__
                    "loginCancelled" : { }
                */
                this._telemetryReporter?.sendTelemetryEvent('loginCancelled');
                throw e;
            }
            /* __GDPR__
                "loginFailed" : { }
            */
            this._telemetryReporter?.sendTelemetryEvent('loginFailed');
            vscode.window.showErrorMessage(`Sign in failed: ${e}`);
            this._logger.error(e);
            throw e;
        }
    }
    async tokenToSession(token, scopes) {
        const userInfo = await this._githubServer.getUserInfo(token);
        return {
            id: (0, uuid_1.v4)(),
            accessToken: token,
            account: { label: userInfo.accountName, id: userInfo.id },
            scopes
        };
    }
    async removeSession(id) {
        try {
            /* __GDPR__
                "logout" : { }
            */
            this._telemetryReporter?.sendTelemetryEvent('logout');
            this._logger.info(`Logging out of ${id}`);
            const sessions = await this._sessionsPromise;
            const sessionIndex = sessions.findIndex(session => session.id === id);
            if (sessionIndex > -1) {
                const session = sessions[sessionIndex];
                sessions.splice(sessionIndex, 1);
                await this.storeSessions(sessions);
                this._sessionChangeEmitter.fire({ added: [], removed: [session], changed: [] });
            }
            else {
                this._logger.error('Session not found');
            }
        }
        catch (e) {
            /* __GDPR__
                "logoutFailed" : { }
            */
            this._telemetryReporter?.sendTelemetryEvent('logoutFailed');
            vscode.window.showErrorMessage(`Sign out failed: ${e}`);
            this._logger.error(e);
            throw e;
        }
    }
}
exports.GitHubAuthenticationProvider = GitHubAuthenticationProvider;


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "v1": () => (/* reexport safe */ _v1_js__WEBPACK_IMPORTED_MODULE_0__.default),
/* harmony export */   "v3": () => (/* reexport safe */ _v3_js__WEBPACK_IMPORTED_MODULE_1__.default),
/* harmony export */   "v4": () => (/* reexport safe */ _v4_js__WEBPACK_IMPORTED_MODULE_2__.default),
/* harmony export */   "v5": () => (/* reexport safe */ _v5_js__WEBPACK_IMPORTED_MODULE_3__.default)
/* harmony export */ });
/* harmony import */ var _v1_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var _v3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7);
/* harmony import */ var _v4_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(10);
/* harmony import */ var _v5_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(11);





/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _bytesToUuid_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6);

 // **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

var _nodeId;

var _clockseq; // Previous uuid creation time


var _lastMSecs = 0;
var _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];
  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189

  if (node == null || clockseq == null) {
    var seedBytes = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_0__.default)();

    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }

    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


  var msecs = options.msecs !== undefined ? options.msecs : Date.now(); // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock

  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

  var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval


  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  } // Per 4.2.1.2 Throw error if too many uuids are requested


  if (nsecs >= 10000) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

  msecs += 12219292800000; // `time_low`

  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff; // `time_mid`

  var tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff; // `time_high_and_version`

  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

  b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

  b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

  b[i++] = clockseq & 0xff; // `node`

  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf || (0,_bytesToUuid_js__WEBPACK_IMPORTED_MODULE_1__.default)(b);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v1);

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ rng)
/* harmony export */ });
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
// getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
// find the complete implementation of crypto (msCrypto) on IE11.
var getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
  }

  return getRandomValues(rnds8);
}

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];

for (var i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex; // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434

  return (bth[buf[i + 0]] + bth[buf[i + 1]] + bth[buf[i + 2]] + bth[buf[i + 3]] + '-' + bth[buf[i + 4]] + bth[buf[i + 5]] + '-' + bth[buf[i + 6]] + bth[buf[i + 7]] + '-' + bth[buf[i + 8]] + bth[buf[i + 9]] + '-' + bth[buf[i + 10]] + bth[buf[i + 11]] + bth[buf[i + 12]] + bth[buf[i + 13]] + bth[buf[i + 14]] + bth[buf[i + 15]]).toLowerCase();
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (bytesToUuid);

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _v35_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _md5_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);


var v3 = (0,_v35_js__WEBPACK_IMPORTED_MODULE_0__.default)('v3', 0x30, _md5_js__WEBPACK_IMPORTED_MODULE_1__.default);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v3);

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DNS": () => (/* binding */ DNS),
/* harmony export */   "URL": () => (/* binding */ URL),
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _bytesToUuid_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);


function uuidToBytes(uuid) {
  // Note: We assume we're being passed a valid uuid string
  var bytes = [];
  uuid.replace(/[a-fA-F0-9]{2}/g, function (hex) {
    bytes.push(parseInt(hex, 16));
  });
  return bytes;
}

function stringToBytes(str) {
  str = unescape(encodeURIComponent(str)); // UTF8 escape

  var bytes = [];

  for (var i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }

  return bytes;
}

var DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
var URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(name, version, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    var off = buf && offset || 0;
    if (typeof value === 'string') value = stringToBytes(value);
    if (typeof namespace === 'string') namespace = uuidToBytes(namespace);

    if (!Array.isArray(value)) {
      throw TypeError('value must be an array of bytes');
    }

    if (!Array.isArray(namespace) || namespace.length !== 16) {
      throw TypeError('namespace must be uuid string or an Array of 16 byte values');
    } // Per 4.3


    var bytes = hashfunc(namespace.concat(value));
    bytes[6] = bytes[6] & 0x0f | version;
    bytes[8] = bytes[8] & 0x3f | 0x80;

    if (buf) {
      for (var idx = 0; idx < 16; ++idx) {
        buf[off + idx] = bytes[idx];
      }
    }

    return buf || (0,_bytesToUuid_js__WEBPACK_IMPORTED_MODULE_0__.default)(bytes);
  } // Function#name is not settable on some platforms (#270)


  try {
    generateUUID.name = name; // eslint-disable-next-line no-empty
  } catch (err) {} // For CommonJS default export support


  generateUUID.DNS = DNS;
  generateUUID.URL = URL;
  return generateUUID;
}

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/*
 * Browser-compatible JavaScript MD5
 *
 * Modification of JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */
function md5(bytes) {
  if (typeof bytes === 'string') {
    var msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

    bytes = new Uint8Array(msg.length);

    for (var i = 0; i < msg.length; ++i) {
      bytes[i] = msg.charCodeAt(i);
    }
  }

  return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
}
/*
 * Convert an array of little-endian words to an array of bytes
 */


function md5ToHexEncodedArray(input) {
  var output = [];
  var length32 = input.length * 32;
  var hexTab = '0123456789abcdef';

  for (var i = 0; i < length32; i += 8) {
    var x = input[i >> 5] >>> i % 32 & 0xff;
    var hex = parseInt(hexTab.charAt(x >>> 4 & 0x0f) + hexTab.charAt(x & 0x0f), 16);
    output.push(hex);
  }

  return output;
}
/**
 * Calculate output length with padding and bit length
 */


function getOutputLength(inputLength8) {
  return (inputLength8 + 64 >>> 9 << 4) + 14 + 1;
}
/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */


function wordsToMd5(x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << len % 32;
  x[getOutputLength(len) - 1] = len;
  var a = 1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d = 271733878;

  for (var i = 0; i < x.length; i += 16) {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    a = md5ff(a, b, c, d, x[i], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = md5ii(a, b, c, d, x[i], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  return [a, b, c, d];
}
/*
 * Convert an array bytes to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */


function bytesToWords(input) {
  if (input.length === 0) {
    return [];
  }

  var length8 = input.length * 8;
  var output = new Uint32Array(getOutputLength(length8));

  for (var i = 0; i < length8; i += 8) {
    output[i >> 5] |= (input[i / 8] & 0xff) << i % 32;
  }

  return output;
}
/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */


function safeAdd(x, y) {
  var lsw = (x & 0xffff) + (y & 0xffff);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 0xffff;
}
/*
 * Bitwise rotate a 32-bit number to the left.
 */


function bitRotateLeft(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}
/*
 * These functions implement the four basic operations the algorithm uses.
 */


function md5cmn(q, a, b, x, s, t) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}

function md5ff(a, b, c, d, x, s, t) {
  return md5cmn(b & c | ~b & d, a, b, x, s, t);
}

function md5gg(a, b, c, d, x, s, t) {
  return md5cmn(b & d | c & ~d, a, b, x, s, t);
}

function md5hh(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}

function md5ii(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (md5);

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _bytesToUuid_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6);



function v4(options, buf, offset) {
  if (typeof options === 'string') {
    buf = options === 'binary' ? new Uint8Array(16) : null;
    options = null;
  }

  options = options || {};
  var rnds = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_0__.default)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    var start = offset || 0;

    for (var i = 0; i < 16; ++i) {
      buf[start + i] = rnds[i];
    }

    return buf;
  }

  return (0,_bytesToUuid_js__WEBPACK_IMPORTED_MODULE_1__.default)(rnds);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v4);

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _v35_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _sha1_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12);


var v5 = (0,_v35_js__WEBPACK_IMPORTED_MODULE_0__.default)('v5', 0x50, _sha1_js__WEBPACK_IMPORTED_MODULE_1__.default);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v5);

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Adapted from Chris Veness' SHA1 code at
// http://www.movable-type.co.uk/scripts/sha1.html
function f(s, x, y, z) {
  switch (s) {
    case 0:
      return x & y ^ ~x & z;

    case 1:
      return x ^ y ^ z;

    case 2:
      return x & y ^ x & z ^ y & z;

    case 3:
      return x ^ y ^ z;
  }
}

function ROTL(x, n) {
  return x << n | x >>> 32 - n;
}

function sha1(bytes) {
  var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
  var H = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];

  if (typeof bytes === 'string') {
    var msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

    bytes = [];

    for (var i = 0; i < msg.length; ++i) {
      bytes.push(msg.charCodeAt(i));
    }
  }

  bytes.push(0x80);
  var l = bytes.length / 4 + 2;
  var N = Math.ceil(l / 16);
  var M = new Array(N);

  for (var _i = 0; _i < N; ++_i) {
    var arr = new Uint32Array(16);

    for (var j = 0; j < 16; ++j) {
      arr[j] = bytes[_i * 64 + j * 4] << 24 | bytes[_i * 64 + j * 4 + 1] << 16 | bytes[_i * 64 + j * 4 + 2] << 8 | bytes[_i * 64 + j * 4 + 3];
    }

    M[_i] = arr;
  }

  M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
  M[N - 1][14] = Math.floor(M[N - 1][14]);
  M[N - 1][15] = (bytes.length - 1) * 8 & 0xffffffff;

  for (var _i2 = 0; _i2 < N; ++_i2) {
    var W = new Uint32Array(80);

    for (var t = 0; t < 16; ++t) {
      W[t] = M[_i2][t];
    }

    for (var _t = 16; _t < 80; ++_t) {
      W[_t] = ROTL(W[_t - 3] ^ W[_t - 8] ^ W[_t - 14] ^ W[_t - 16], 1);
    }

    var a = H[0];
    var b = H[1];
    var c = H[2];
    var d = H[3];
    var e = H[4];

    for (var _t2 = 0; _t2 < 80; ++_t2) {
      var s = Math.floor(_t2 / 20);
      var T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[_t2] >>> 0;
      e = d;
      d = c;
      c = ROTL(b, 30) >>> 0;
      b = a;
      a = T;
    }

    H[0] = H[0] + a >>> 0;
    H[1] = H[1] + b >>> 0;
    H[2] = H[2] + c >>> 0;
    H[3] = H[3] + d >>> 0;
    H[4] = H[4] + e >>> 0;
  }

  return [H[0] >> 24 & 0xff, H[0] >> 16 & 0xff, H[0] >> 8 & 0xff, H[0] & 0xff, H[1] >> 24 & 0xff, H[1] >> 16 & 0xff, H[1] >> 8 & 0xff, H[1] & 0xff, H[2] >> 24 & 0xff, H[2] >> 16 & 0xff, H[2] >> 8 & 0xff, H[2] & 0xff, H[3] >> 24 & 0xff, H[3] >> 16 & 0xff, H[3] >> 8 & 0xff, H[3] & 0xff, H[4] >> 24 & 0xff, H[4] >> 16 & 0xff, H[4] >> 8 & 0xff, H[4] & 0xff];
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (sha1);

/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Keychain = void 0;
// keytar depends on a native module shipped in vscode, so this is
// how we load it
const vscode = __webpack_require__(1);
const nls = __webpack_require__(14);
const localize = nls.loadMessageBundle();
class Keychain {
    constructor(context, serviceId, Logger) {
        this.context = context;
        this.serviceId = serviceId;
        this.Logger = Logger;
    }
    async setToken(token) {
        try {
            return await this.context.secrets.store(this.serviceId, token);
        }
        catch (e) {
            // Ignore
            this.Logger.error(`Setting token failed: ${e}`);
            const troubleshooting = localize('troubleshooting', "Troubleshooting Guide");
            const result = await vscode.window.showErrorMessage(localize('keychainWriteError', "Writing login information to the keychain failed with error '{0}'.", e.message), troubleshooting);
            if (result === troubleshooting) {
                vscode.env.openExternal(vscode.Uri.parse('https://code.visualstudio.com/docs/editor/settings-sync#_troubleshooting-keychain-issues'));
            }
        }
    }
    async getToken() {
        try {
            const secret = await this.context.secrets.get(this.serviceId);
            if (secret && secret !== '[]') {
                this.Logger.trace('Token acquired from secret storage.');
            }
            return secret;
        }
        catch (e) {
            // Ignore
            this.Logger.error(`Getting token failed: ${e}`);
            return Promise.resolve(undefined);
        }
    }
    async deleteToken() {
        try {
            return await this.context.secrets.delete(this.serviceId);
        }
        catch (e) {
            // Ignore
            this.Logger.error(`Deleting token failed: ${e}`);
            return Promise.resolve(undefined);
        }
    }
}
exports.Keychain = Keychain;


/***/ }),
/* 14 */
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
var ral_1 = __webpack_require__(15);
var common_1 = __webpack_require__(16);
var common_2 = __webpack_require__(16);
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
/* 15 */
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
/* 16 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.config = exports.loadMessageBundle = exports.localize = exports.format = exports.setPseudo = exports.isPseudo = exports.isDefined = exports.BundleFormat = exports.MessageFormat = void 0;
var ral_1 = __webpack_require__(15);
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
/* 17 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GitHubEnterpriseServer = exports.GitHubServer = void 0;
const nls = __webpack_require__(14);
const vscode = __webpack_require__(1);
const node_fetch_1 = __webpack_require__(18);
const github_1 = __webpack_require__(2);
const localize = nls.loadMessageBundle();
const NETWORK_ERROR = 'network error';
class UriEventHandler extends vscode.EventEmitter {
    constructor(Logger) {
        super();
        this.Logger = Logger;
    }
    handleUri(uri) {
        this.Logger.trace('Handling Uri...');
        this.fire(uri);
    }
}
async function getScopes(token, serverUri, logger) {
    try {
        logger.info('Getting token scopes...');
        const result = await (0, node_fetch_1.default)(serverUri.toString(), {
            headers: {
                Authorization: `token ${token}`,
                'User-Agent': 'Visual-Studio-Code'
            }
        });
        if (result.ok) {
            const scopes = result.headers.get('X-OAuth-Scopes');
            return scopes ? scopes.split(',').map(scope => scope.trim()) : [];
        }
        else {
            logger.error(`Getting scopes failed: ${result.statusText}`);
            throw new Error(result.statusText);
        }
    }
    catch (ex) {
        logger.error(ex.message);
        throw new Error(NETWORK_ERROR);
    }
}
async function getUserInfo(token, serverUri, logger) {
    let result;
    try {
        logger.info('Getting user info...');
        result = await (0, node_fetch_1.default)(serverUri.toString(), {
            headers: {
                Authorization: `token ${token}`,
                'User-Agent': 'Visual-Studio-Code'
            }
        });
    }
    catch (ex) {
        logger.error(ex.message);
        throw new Error(NETWORK_ERROR);
    }
    if (result.ok) {
        const json = await result.json();
        logger.info('Got account info!');
        return { id: json.id, accountName: json.login };
    }
    else {
        logger.error(`Getting account info failed: ${result.statusText}`);
        throw new Error(result.statusText);
    }
}
class GitHubServer {
    constructor(_logger, _telemetryReporter) {
        this._logger = _logger;
        this._telemetryReporter = _telemetryReporter;
        this.friendlyName = 'GitHub';
        this.type = github_1.AuthProviderType.github;
        this._statusBarCommandId = `${this.type}.provide-manually`;
        this._uriHandler = new UriEventHandler(this._logger);
        this._disposable = vscode.Disposable.from(vscode.commands.registerCommand(this._statusBarCommandId, () => this.manuallyProvideUri()), vscode.window.registerUriHandler(this._uriHandler));
    }
    dispose() {
        this._disposable.dispose();
    }
    async login(scopes) {
        this._logger.info(`Logging in for the following scopes: ${scopes}`);
        const token = await vscode.window.showInputBox({ prompt: 'GitHub Personal Access Token', ignoreFocusOut: true });
        if (!token) {
            throw new Error('Sign in failed: No token provided');
        }
        const tokenScopes = await getScopes(token, this.getServerUri('/'), this._logger); // Example: ['repo', 'user']
        const scopesList = scopes.split(' '); // Example: 'read:user repo user:email'
        if (!scopesList.every(scope => {
            const included = tokenScopes.includes(scope);
            if (included || !scope.includes(':')) {
                return included;
            }
            return scope.split(':').some(splitScopes => {
                return tokenScopes.includes(splitScopes);
            });
        })) {
            throw new Error(`The provided token does not match the requested scopes: ${scopes}`);
        }
        return token;
    }
    getServerUri(path = '') {
        const apiUri = vscode.Uri.parse('https://api.github.com');
        return vscode.Uri.parse(`${apiUri.scheme}://${apiUri.authority}${path}`);
    }
    async manuallyProvideUri() {
        const uri = await vscode.window.showInputBox({
            prompt: 'Uri',
            ignoreFocusOut: true,
            validateInput(value) {
                if (!value) {
                    return undefined;
                }
                const error = localize('validUri', "Please enter a valid Uri from the GitHub login page.");
                try {
                    const uri = vscode.Uri.parse(value.trim());
                    if (!uri.scheme || uri.scheme === 'file') {
                        return error;
                    }
                }
                catch (e) {
                    return error;
                }
                return undefined;
            }
        });
        if (!uri) {
            return;
        }
        this._uriHandler.handleUri(vscode.Uri.parse(uri.trim()));
    }
    getUserInfo(token) {
        return getUserInfo(token, this.getServerUri('/user'), this._logger);
    }
    async sendAdditionalTelemetryInfo(_token) {
    }
    async checkEnterpriseVersion(token) {
        try {
            const result = await (0, node_fetch_1.default)(this.getServerUri('/meta').toString(), {
                headers: {
                    Authorization: `token ${token}`,
                    'User-Agent': 'Visual-Studio-Code'
                }
            });
            if (!result.ok) {
                return;
            }
            const json = await result.json();
            /* __GDPR__
                "ghe-session" : {
                    "version": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            this._telemetryReporter.sendTelemetryEvent('ghe-session', {
                version: json.installed_version
            });
        }
        catch {
            // No-op
        }
    }
}
exports.GitHubServer = GitHubServer;
class GitHubEnterpriseServer {
    constructor(_logger, telemetryReporter) {
        this._logger = _logger;
        this.telemetryReporter = telemetryReporter;
        this.friendlyName = 'GitHub Enterprise';
        this.type = github_1.AuthProviderType.githubEnterprise;
        this._onDidManuallyProvideToken = new vscode.EventEmitter();
        this._statusBarCommandId = `github-enterprise.provide-manually`;
        this._disposable = vscode.commands.registerCommand(this._statusBarCommandId, async () => {
            const token = await vscode.window.showInputBox({ prompt: 'Token', ignoreFocusOut: true });
            this._onDidManuallyProvideToken.fire(token);
        });
    }
    dispose() {
        this._disposable.dispose();
    }
    async login(scopes) {
        this._logger.info(`Logging in for the following scopes: ${scopes}`);
        const token = await vscode.window.showInputBox({ prompt: 'GitHub Personal Access Token', ignoreFocusOut: true });
        if (!token) {
            throw new Error('Sign in failed: No token provided');
        }
        const tokenScopes = await getScopes(token, this.getServerUri('/'), this._logger); // Example: ['repo', 'user']
        const scopesList = scopes.split(' '); // Example: 'read:user repo user:email'
        if (!scopesList.every(scope => {
            const included = tokenScopes.includes(scope);
            if (included || !scope.includes(':')) {
                return included;
            }
            return scope.split(':').some(splitScopes => {
                return tokenScopes.includes(splitScopes);
            });
        })) {
            throw new Error(`The provided token does not match the requested scopes: ${scopes}`);
        }
        return token;
    }
    getServerUri(path = '') {
        const apiUri = vscode.Uri.parse(vscode.workspace.getConfiguration('github-enterprise').get('uri') || '', true);
        return vscode.Uri.parse(`${apiUri.scheme}://${apiUri.authority}/api/v3${path}`);
    }
    async getUserInfo(token) {
        return getUserInfo(token, this.getServerUri('/user'), this._logger);
    }
    async sendAdditionalTelemetryInfo(token) {
        try {
            const result = await (0, node_fetch_1.default)(this.getServerUri('/meta').toString(), {
                headers: {
                    Authorization: `token ${token}`,
                    'User-Agent': 'Visual-Studio-Code'
                }
            });
            if (!result.ok) {
                return;
            }
            const json = await result.json();
            /* __GDPR__
                "ghe-session" : {
                    "version": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            this.telemetryReporter.sendTelemetryEvent('ghe-session', {
                version: json.installed_version
            });
        }
        catch {
            // No-op
        }
    }
}
exports.GitHubEnterpriseServer = GitHubEnterpriseServer;


/***/ }),
/* 18 */
/***/ ((module, exports) => {

"use strict";


// ref: https://github.com/tc39/proposal-global
var getGlobal = function () {
	// the only reliable means to get the global object is
	// `Function('return this')()`
	// However, this causes CSP violations in Chrome apps.
	if (typeof self !== 'undefined') { return self; }
	if (typeof window !== 'undefined') { return window; }
	if (typeof global !== 'undefined') { return global; }
	throw new Error('unable to locate global object');
}

var global = getGlobal();

module.exports = exports = global.fetch;

// Needed for TypeScript and Webpack.
if (global.fetch) {
	exports.default = global.fetch.bind(global);
}

exports.Headers = global.Headers;
exports.Request = global.Request;
exports.Response = global.Response;

/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StopWatch = exports.arrayEquals = exports.promiseFromEvent = exports.onceEvent = exports.filterEvent = void 0;
const vscode_1 = __webpack_require__(1);
function filterEvent(event, filter) {
    return (listener, thisArgs = null, disposables) => event(e => filter(e) && listener.call(thisArgs, e), null, disposables);
}
exports.filterEvent = filterEvent;
function onceEvent(event) {
    return (listener, thisArgs = null, disposables) => {
        const result = event(e => {
            result.dispose();
            return listener.call(thisArgs, e);
        }, null, disposables);
        return result;
    };
}
exports.onceEvent = onceEvent;
const passthrough = (value, resolve) => resolve(value);
/**
 * Return a promise that resolves with the next emitted event, or with some future
 * event as decided by an adapter.
 *
 * If specified, the adapter is a function that will be called with
 * `(event, resolve, reject)`. It will be called once per event until it resolves or
 * rejects.
 *
 * The default adapter is the passthrough function `(value, resolve) => resolve(value)`.
 *
 * @param event the event
 * @param adapter controls resolution of the returned promise
 * @returns a promise that resolves or rejects as specified by the adapter
 */
function promiseFromEvent(event, adapter = passthrough) {
    let subscription;
    let cancel = new vscode_1.EventEmitter();
    return {
        promise: new Promise((resolve, reject) => {
            cancel.event(_ => reject());
            subscription = event((value) => {
                try {
                    Promise.resolve(adapter(value, resolve, reject))
                        .catch(reject);
                }
                catch (error) {
                    reject(error);
                }
            });
        }).then((result) => {
            subscription.dispose();
            return result;
        }, error => {
            subscription.dispose();
            throw error;
        }),
        cancel
    };
}
exports.promiseFromEvent = promiseFromEvent;
function arrayEquals(one, other, itemEquals = (a, b) => a === b) {
    if (one === other) {
        return true;
    }
    if (!one || !other) {
        return false;
    }
    if (one.length !== other.length) {
        return false;
    }
    for (let i = 0, len = one.length; i < len; i++) {
        if (!itemEquals(one[i], other[i])) {
            return false;
        }
    }
    return true;
}
exports.arrayEquals = arrayEquals;
class StopWatch {
    constructor() {
        this._startTime = Date.now();
        this._stopTime = -1;
    }
    stop() {
        this._stopTime = Date.now();
    }
    elapsed() {
        if (this._stopTime !== -1) {
            return this._stopTime - this._startTime;
        }
        return Date.now() - this._startTime;
    }
}
exports.StopWatch = StopWatch;


/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExperimentationTelemetry = void 0;
const vscode = __webpack_require__(1);
const vscode_tas_client_1 = __webpack_require__(21);
class ExperimentationTelemetry {
    constructor(context, baseReporter) {
        this.context = context;
        this.baseReporter = baseReporter;
        this.sharedProperties = {};
    }
    async createExperimentationService() {
        let targetPopulation;
        switch (vscode.env.uriScheme) {
            case 'vscode':
                targetPopulation = vscode_tas_client_1.TargetPopulation.Public;
            case 'vscode-insiders':
                targetPopulation = vscode_tas_client_1.TargetPopulation.Insiders;
            case 'vscode-exploration':
                targetPopulation = vscode_tas_client_1.TargetPopulation.Internal;
            case 'code-oss':
                targetPopulation = vscode_tas_client_1.TargetPopulation.Team;
            default:
                targetPopulation = vscode_tas_client_1.TargetPopulation.Public;
        }
        const id = this.context.extension.id;
        const version = this.context.extension.packageJSON.version;
        const experimentationService = (0, vscode_tas_client_1.getExperimentationService)(id, version, targetPopulation, this, this.context.globalState);
        await experimentationService.initialFetch;
        return experimentationService;
    }
    /**
     * @returns A promise that you shouldn't need to await because this is just telemetry.
     */
    async sendTelemetryEvent(eventName, properties, measurements) {
        if (!this.experimentationServicePromise) {
            this.experimentationServicePromise = this.createExperimentationService();
        }
        await this.experimentationServicePromise;
        this.baseReporter.sendTelemetryEvent(eventName, {
            ...this.sharedProperties,
            ...properties,
        }, measurements);
    }
    /**
     * @returns A promise that you shouldn't need to await because this is just telemetry.
     */
    async sendTelemetryErrorEvent(eventName, properties, _measurements) {
        if (!this.experimentationServicePromise) {
            this.experimentationServicePromise = this.createExperimentationService();
        }
        await this.experimentationServicePromise;
        this.baseReporter.sendTelemetryErrorEvent(eventName, {
            ...this.sharedProperties,
            ...properties,
        });
    }
    setSharedProperty(name, value) {
        this.sharedProperties[name] = value;
    }
    postEvent(eventName, props) {
        const event = {};
        for (const [key, value] of props) {
            event[key] = value;
        }
        this.sendTelemetryEvent(eventName, event);
    }
    dispose() {
        return this.baseReporter.dispose();
    }
}
exports.ExperimentationTelemetry = ExperimentationTelemetry;


/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

//
//  Copyright (c) Microsoft Corporation. All rights reserved.
//
Object.defineProperty(exports, "__esModule", ({ value: true }));
var VSCodeTasClient_1 = __webpack_require__(22);
exports.getExperimentationService = VSCodeTasClient_1.getExperimentationService;
exports.getExperimentationServiceAsync = VSCodeTasClient_1.getExperimentationServiceAsync;
var VSCodeFilterProvider_1 = __webpack_require__(23);
exports.TargetPopulation = VSCodeFilterProvider_1.TargetPopulation;
//# sourceMappingURL=index.js.map

/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const VSCodeFilterProvider_1 = __webpack_require__(23);
const tas_client_1 = __webpack_require__(24);
const vscode = __webpack_require__(1);
const MementoKeyValueStorage_1 = __webpack_require__(63);
const TelemetryDisabledExperimentationService_1 = __webpack_require__(64);
const endpoint = 'https://default.exp-tas.com/vscode/ab';
const telemetryEventName = 'query-expfeature';
const featuresTelemetryPropertyName = 'VSCode.ABExp.Features';
const assignmentContextTelemetryPropertyName = 'abexp.assignmentcontext';
const storageKey = 'VSCode.ABExp.FeatureData';
const refetchInterval = 1000 * 60 * 30; // By default it's set up to 30 minutes.
/**
 *
 * @param extensionName The name of the extension.
 * @param extensionVersion The version of the extension.
 * @param telemetry Telemetry implementation.
 * @param targetPopulation An enum containing the target population ('team', 'internal', 'insiders', 'public').
 * @param memento The memento state to be used for cache.
 * @param filterProviders The filter providers.
 */
function getExperimentationService(extensionName, extensionVersion, targetPopulation, telemetry, memento, ...filterProviders) {
    if (!memento) {
        throw new Error('Memento storage was not provided.');
    }
    const config = vscode.workspace.getConfiguration('telemetry');
    const telemetryEnabled = vscode.env.isTelemetryEnabled === undefined
        ? config.get('enableTelemetry', true)
        : vscode.env.isTelemetryEnabled;
    if (!telemetryEnabled) {
        return new TelemetryDisabledExperimentationService_1.default();
    }
    const extensionFilterProvider = new VSCodeFilterProvider_1.VSCodeFilterProvider(extensionName, extensionVersion, targetPopulation);
    const providerList = [extensionFilterProvider, ...filterProviders];
    const keyValueStorage = new MementoKeyValueStorage_1.MementoKeyValueStorage(memento);
    return new tas_client_1.ExperimentationService({
        filterProviders: providerList,
        telemetry: telemetry,
        storageKey: storageKey,
        keyValueStorage: keyValueStorage,
        featuresTelemetryPropertyName: featuresTelemetryPropertyName,
        assignmentContextTelemetryPropertyName: assignmentContextTelemetryPropertyName,
        telemetryEventName: telemetryEventName,
        endpoint: endpoint,
        refetchInterval: refetchInterval,
    });
}
exports.getExperimentationService = getExperimentationService;
/**
 * Returns the experimentation service after waiting on initialize.
 *
 * @param extensionName The name of the extension.
 * @param extensionVersion The version of the extension.
 * @param telemetry Telemetry implementation.
 * @param targetPopulation An enum containing the target population ('team', 'internal', 'insiders', 'public').
 * @param memento The memento state to be used for cache.
 * @param filterProviders The filter providers.
 */
async function getExperimentationServiceAsync(extensionName, extensionVersion, targetPopulation, telemetry, memento, ...filterProviders) {
    const experimentationService = getExperimentationService(extensionName, extensionVersion, targetPopulation, telemetry, memento, ...filterProviders);
    await experimentationService.initializePromise;
    return experimentationService;
}
exports.getExperimentationServiceAsync = getExperimentationServiceAsync;
//# sourceMappingURL=VSCodeTasClient.js.map

/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const vscode = __webpack_require__(1);
/**
 * Here is where we are going to define the filters we will set.
 */
class VSCodeFilterProvider {
    constructor(extensionName, extensionVersion, targetPopulation) {
        this.extensionName = extensionName;
        this.extensionVersion = extensionVersion;
        this.targetPopulation = targetPopulation;
    }
    /**
     * Returns a version string that can be parsed into a .NET Build object
     * by removing the tag suffix (for example -dev).
     *
     * @param version Version string to be trimmed.
     */
    static trimVersionSuffix(version) {
        const regex = /\-[a-zA-Z0-9]+$/;
        const result = version.split(regex);
        return result[0];
    }
    getFilterValue(filter) {
        switch (filter) {
            case Filters.ApplicationVersion:
                return VSCodeFilterProvider.trimVersionSuffix(vscode.version);
            case Filters.Build:
                return vscode.env.appName;
            case Filters.ClientId:
                return vscode.env.machineId;
            case Filters.ExtensionName:
                return this.extensionName;
            case Filters.ExtensionVersion:
                return VSCodeFilterProvider.trimVersionSuffix(this.extensionVersion);
            case Filters.Language:
                return vscode.env.language;
            case Filters.TargetPopulation:
                return this.targetPopulation;
            default:
                return '';
        }
    }
    getFilters() {
        let filters = new Map();
        let filterValues = Object.values(Filters);
        for (let value of filterValues) {
            filters.set(value, this.getFilterValue(value));
        }
        return filters;
    }
}
exports.VSCodeFilterProvider = VSCodeFilterProvider;
/*
Based upon the official VSCode currently existing filters in the
ExP backend for the VSCode cluster.
https://experimentation.visualstudio.com/Analysis%20and%20Experimentation/_git/AnE.ExP.TAS.TachyonHost.Configuration?path=%2FConfigurations%2Fvscode%2Fvscode.json&version=GBmaster
"X-MSEdge-Market": "detection.market",
"X-FD-Corpnet": "detection.corpnet",
"X-VSCode–AppVersion": "appversion",
"X-VSCode-Build": "build",
"X-MSEdge-ClientId": "clientid",
"X-VSCode-ExtensionName": "extensionname",
"X-VSCode-ExtensionVersion": "extensionversion",
"X-VSCode-TargetPopulation": "targetpopulation",
"X-VSCode-Language": "language"
*/
/**
 * All available filters, can be updated.
 */
var Filters;
(function (Filters) {
    /**
     * The market in which the extension is distributed.
     */
    Filters["Market"] = "X-MSEdge-Market";
    /**
     * The corporation network.
     */
    Filters["CorpNet"] = "X-FD-Corpnet";
    /**
     * Version of the application which uses experimentation service.
     */
    Filters["ApplicationVersion"] = "X-VSCode-AppVersion";
    /**
     * Insiders vs Stable.
     */
    Filters["Build"] = "X-VSCode-Build";
    /**
     * Client Id which is used as primary unit for the experimentation.
     */
    Filters["ClientId"] = "X-MSEdge-ClientId";
    /**
     * Extension header.
     */
    Filters["ExtensionName"] = "X-VSCode-ExtensionName";
    /**
     * The version of the extension.
     */
    Filters["ExtensionVersion"] = "X-VSCode-ExtensionVersion";
    /**
     * The language in use by VS Code
     */
    Filters["Language"] = "X-VSCode-Language";
    /**
     * The target population.
     * This is used to separate internal, early preview, GA, etc.
     */
    Filters["TargetPopulation"] = "X-VSCode-TargetPopulation";
})(Filters = exports.Filters || (exports.Filters = {}));
/**
 * Specifies the target population for the experimentation filter.
 */
var TargetPopulation;
(function (TargetPopulation) {
    TargetPopulation["Team"] = "team";
    TargetPopulation["Internal"] = "internal";
    TargetPopulation["Insiders"] = "insider";
    TargetPopulation["Public"] = "public";
})(TargetPopulation = exports.TargetPopulation || (exports.TargetPopulation = {}));
//# sourceMappingURL=VSCodeFilterProvider.js.map

/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

//
//  Copyright (c) Microsoft Corporation. All rights reserved.
//
Object.defineProperty(exports, "__esModule", ({ value: true }));
var ExperimentationService_1 = __webpack_require__(25);
exports.ExperimentationService = ExperimentationService_1.ExperimentationService;
//# sourceMappingURL=index.js.map

/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const TasApiFeatureProvider_1 = __webpack_require__(26);
const AxiosHttpClient_1 = __webpack_require__(29);
const ExperimentationServiceAutoPolling_1 = __webpack_require__(59);
/**
 * Experimentation service to provide functionality of A/B experiments:
 * - reading flights;
 * - caching current set of flights;
 * - get answer on if flights are enabled.
 */
class ExperimentationService extends ExperimentationServiceAutoPolling_1.ExperimentationServiceAutoPolling {
    constructor(options) {
        super(options.telemetry, options.filterProviders || [], // Defaulted to empty array.
        options.refetchInterval != null
            ? options.refetchInterval
            : // If no fetch interval is provided, refetch functionality is turned off.
                0, options.featuresTelemetryPropertyName, options.assignmentContextTelemetryPropertyName, options.telemetryEventName, options.storageKey, options.keyValueStorage);
        this.options = options;
        this.invokeInit();
    }
    init() {
        // set feature providers to be an empty array.
        this.featureProviders = [];
        // Add WebApi feature provider.
        this.addFeatureProvider(new TasApiFeatureProvider_1.TasApiFeatureProvider(new AxiosHttpClient_1.AxiosHttpClient(this.options.endpoint), this.telemetry, this.filterProviders));
        // This will start polling the TAS.
        super.init();
    }
}
exports.ExperimentationService = ExperimentationService;
ExperimentationService.REFRESH_RATE_IN_MINUTES = 30;
//# sourceMappingURL=ExperimentationService.js.map

/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const FilteredFeatureProvider_1 = __webpack_require__(27);
/**
 * Feature provider implementation that calls the TAS web service to get the most recent active features.
 */
class TasApiFeatureProvider extends FilteredFeatureProvider_1.FilteredFeatureProvider {
    constructor(httpClient, telemetry, filterProviders) {
        super(telemetry, filterProviders);
        this.httpClient = httpClient;
        this.telemetry = telemetry;
        this.filterProviders = filterProviders;
    }
    /**
     * Method that handles fetching of latest data (in this case, flights) from the provider.
     */
    async fetch() {
        // We get the filters that will be sent as headers.
        let filters = this.getFilters();
        let headers = {};
        // Filters are handled using Map<string,any> therefore we need to
        // convert these filters into something axios can take as headers.
        for (let key of filters.keys()) {
            const filterValue = filters.get(key);
            headers[key] = filterValue;
        }
        //axios webservice call.
        let response = await this.httpClient.get({ headers: headers });
        // If we have at least one filter, we post it to telemetry event.
        if (filters.keys.length > 0) {
            this.PostEventToTelemetry(headers);
        }
        // Read the response data from the server.
        let responseData = response.data;
        let configs = responseData.Configs;
        let features = [];
        for (let c of configs) {
            if (!c.Parameters) {
                continue;
            }
            for (let key of Object.keys(c.Parameters)) {
                const featureName = key + (c.Parameters[key] ? '' : 'cf');
                if (!features.includes(featureName)) {
                    features.push(featureName);
                }
            }
        }
        return {
            features,
            assignmentContext: responseData.AssignmentContext,
            configs
        };
    }
}
exports.TasApiFeatureProvider = TasApiFeatureProvider;
//# sourceMappingURL=TasApiFeatureProvider.js.map

/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const BaseFeatureProvider_1 = __webpack_require__(28);
/**
 * Feature provider implementation that handles filters.
 */
class FilteredFeatureProvider extends BaseFeatureProvider_1.BaseFeatureProvider {
    constructor(telemetry, filterProviders) {
        super(telemetry);
        this.telemetry = telemetry;
        this.filterProviders = filterProviders;
        this.cachedTelemetryEvents = [];
    }
    getFilters() {
        // We get the filters that will be sent as headers.
        let filters = new Map();
        for (let filter of this.filterProviders) {
            let filterHeaders = filter.getFilters();
            for (let key of filterHeaders.keys()) {
                // Headers can be overridden by custom filters.
                // That's why a check isn't done to see if the header already exists, the value is just set.
                let filterValue = filterHeaders.get(key);
                filters.set(key, filterValue);
            }
        }
        return filters;
    }
    PostEventToTelemetry(headers) {
        /**
         * If these headers have already been posted, we skip from posting them again..
         */
        if (this.cachedTelemetryEvents.includes(headers)) {
            return;
        }
        const jsonHeaders = JSON.stringify(headers);
        this.telemetry.postEvent('report-headers', new Map([['ABExp.headers', jsonHeaders]]));
        /**
         * We cache the flight so we don't post it again.
         */
        this.cachedTelemetryEvents.push(headers);
    }
}
exports.FilteredFeatureProvider = FilteredFeatureProvider;
//# sourceMappingURL=FilteredFeatureProvider.js.map

/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Abstract class for Feature Provider Implementation.
 */
class BaseFeatureProvider {
    /**
     * @param telemetry The telemetry implementation.
     */
    constructor(telemetry) {
        this.telemetry = telemetry;
        this.isFetching = false;
    }
    /**
     * Method that wraps the fetch method in order to re-use the fetch promise if needed.
     * @param headers The headers to be used on the fetch method.
     */
    async getFeatures() {
        if (this.isFetching && this.fetchPromise) {
            return this.fetchPromise;
        }
        this.fetchPromise = this.fetch();
        let features = await this.fetchPromise;
        this.isFetching = false;
        this.fetchPromise = undefined;
        return features;
    }
}
exports.BaseFeatureProvider = BaseFeatureProvider;
//# sourceMappingURL=BaseFeatureProvider.js.map

/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const axios_1 = __webpack_require__(30);
class AxiosHttpClient {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }
    get(config) {
        return axios_1.default.get(this.endpoint, Object.assign(Object.assign({}, config), { proxy: false }));
    }
}
exports.AxiosHttpClient = AxiosHttpClient;
//# sourceMappingURL=AxiosHttpClient.js.map

/***/ }),
/* 30 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(31);

/***/ }),
/* 31 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(32);
var bind = __webpack_require__(33);
var Axios = __webpack_require__(34);
var mergeConfig = __webpack_require__(52);
var defaults = __webpack_require__(39);

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(55);
axios.CancelToken = __webpack_require__(56);
axios.isCancel = __webpack_require__(51);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(57);

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(58);

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),
/* 32 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(33);

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),
/* 33 */
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),
/* 34 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(32);
var buildURL = __webpack_require__(35);
var InterceptorManager = __webpack_require__(36);
var dispatchRequest = __webpack_require__(37);
var mergeConfig = __webpack_require__(52);
var validator = __webpack_require__(53);

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean, '1.0.0'),
      forcedJSONParsing: validators.transitional(validators.boolean, '1.0.0'),
      clarifyTimeoutError: validators.transitional(validators.boolean, '1.0.0')
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),
/* 35 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(32);

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),
/* 36 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(32);

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),
/* 37 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(32);
var transformData = __webpack_require__(38);
var isCancel = __webpack_require__(51);
var defaults = __webpack_require__(39);

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),
/* 38 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(32);
var defaults = __webpack_require__(39);

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),
/* 39 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(32);
var normalizeHeaderName = __webpack_require__(40);
var enhanceError = __webpack_require__(41);

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(42);
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(42);
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  },

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),
/* 40 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(32);

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),
/* 41 */
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};


/***/ }),
/* 42 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(32);
var settle = __webpack_require__(43);
var cookies = __webpack_require__(45);
var buildURL = __webpack_require__(35);
var buildFullPath = __webpack_require__(46);
var parseHeaders = __webpack_require__(49);
var isURLSameOrigin = __webpack_require__(50);
var createError = __webpack_require__(44);

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        config.transitional && config.transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),
/* 43 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(44);

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),
/* 44 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(41);

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),
/* 45 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(32);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),
/* 46 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(47);
var combineURLs = __webpack_require__(48);

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),
/* 47 */
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),
/* 48 */
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),
/* 49 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(32);

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),
/* 50 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(32);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),
/* 51 */
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),
/* 52 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(32);

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};


/***/ }),
/* 53 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var pkg = __webpack_require__(54);

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};
var currentVerArr = pkg.version.split('.');

/**
 * Compare package versions
 * @param {string} version
 * @param {string?} thanVersion
 * @returns {boolean}
 */
function isOlderVersion(version, thanVersion) {
  var pkgVersionArr = thanVersion ? thanVersion.split('.') : currentVerArr;
  var destVer = version.split('.');
  for (var i = 0; i < 3; i++) {
    if (pkgVersionArr[i] > destVer[i]) {
      return true;
    } else if (pkgVersionArr[i] < destVer[i]) {
      return false;
    }
  }
  return false;
}

/**
 * Transitional option validator
 * @param {function|boolean?} validator
 * @param {string?} version
 * @param {string} message
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  var isDeprecated = version && isOlderVersion(version);

  function formatMessage(opt, desc) {
    return '[Axios v' + pkg.version + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed in ' + version));
    }

    if (isDeprecated && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  isOlderVersion: isOlderVersion,
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),
/* 54 */
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"name":"axios","version":"0.21.4","description":"Promise based HTTP client for the browser and node.js","main":"index.js","scripts":{"test":"grunt test","start":"node ./sandbox/server.js","build":"NODE_ENV=production grunt build","preversion":"npm test","version":"npm run build && grunt version && git add -A dist && git add CHANGELOG.md bower.json package.json","postversion":"git push && git push --tags","examples":"node ./examples/server.js","coveralls":"cat coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js","fix":"eslint --fix lib/**/*.js"},"repository":{"type":"git","url":"https://github.com/axios/axios.git"},"keywords":["xhr","http","ajax","promise","node"],"author":"Matt Zabriskie","license":"MIT","bugs":{"url":"https://github.com/axios/axios/issues"},"homepage":"https://axios-http.com","devDependencies":{"coveralls":"^3.0.0","es6-promise":"^4.2.4","grunt":"^1.3.0","grunt-banner":"^0.6.0","grunt-cli":"^1.2.0","grunt-contrib-clean":"^1.1.0","grunt-contrib-watch":"^1.0.0","grunt-eslint":"^23.0.0","grunt-karma":"^4.0.0","grunt-mocha-test":"^0.13.3","grunt-ts":"^6.0.0-beta.19","grunt-webpack":"^4.0.2","istanbul-instrumenter-loader":"^1.0.0","jasmine-core":"^2.4.1","karma":"^6.3.2","karma-chrome-launcher":"^3.1.0","karma-firefox-launcher":"^2.1.0","karma-jasmine":"^1.1.1","karma-jasmine-ajax":"^0.1.13","karma-safari-launcher":"^1.0.0","karma-sauce-launcher":"^4.3.6","karma-sinon":"^1.0.5","karma-sourcemap-loader":"^0.3.8","karma-webpack":"^4.0.2","load-grunt-tasks":"^3.5.2","minimist":"^1.2.0","mocha":"^8.2.1","sinon":"^4.5.0","terser-webpack-plugin":"^4.2.3","typescript":"^4.0.5","url-search-params":"^0.10.0","webpack":"^4.44.2","webpack-dev-server":"^3.11.0"},"browser":{"./lib/adapters/http.js":"./lib/adapters/xhr.js"},"jsdelivr":"dist/axios.min.js","unpkg":"dist/axios.min.js","typings":"./index.d.ts","dependencies":{"follow-redirects":"^1.14.0"},"bundlesize":[{"path":"./dist/axios.min.js","threshold":"5kB"}]}');

/***/ }),
/* 55 */
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),
/* 56 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(55);

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),
/* 57 */
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),
/* 58 */
/***/ ((module) => {

"use strict";


/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};


/***/ }),
/* 59 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const ExperimentationServiceBase_1 = __webpack_require__(60);
const PollingService_1 = __webpack_require__(62);
/**
 * Implementation of Feature provider that provides a polling feature, where the source can be re-fetched every x time given.
 */
class ExperimentationServiceAutoPolling extends ExperimentationServiceBase_1.ExperimentationServiceBase {
    constructor(telemetry, filterProviders, refreshRateMs, featuresTelemetryPropertyName, assignmentContextTelemetryPropertyName, telemetryEventName, storageKey, storage) {
        super(telemetry, featuresTelemetryPropertyName, assignmentContextTelemetryPropertyName, telemetryEventName, storageKey, storage);
        this.telemetry = telemetry;
        this.filterProviders = filterProviders;
        this.refreshRateMs = refreshRateMs;
        this.featuresTelemetryPropertyName = featuresTelemetryPropertyName;
        this.assignmentContextTelemetryPropertyName = assignmentContextTelemetryPropertyName;
        this.telemetryEventName = telemetryEventName;
        this.storageKey = storageKey;
        this.storage = storage;
        // Excluding 0 since it allows to turn off the auto polling.
        if (refreshRateMs < 1000 && refreshRateMs !== 0) {
            throw new Error('The minimum refresh rate for polling is 1000 ms (1 second). If you wish to deactivate this auto-polling use value of 0.');
        }
        if (refreshRateMs > 0) {
            this.pollingService = new PollingService_1.PollingService(refreshRateMs);
            this.pollingService.OnPollTick(async () => {
                await super.getFeaturesAsync();
            });
        }
    }
    init() {
        if (this.pollingService) {
            this.pollingService.StartPolling(true);
        }
        else {
            super.getFeaturesAsync();
        }
    }
    /**
     * Wrapper that will reset the polling intervals whenever the feature data is fetched manually.
     */
    async getFeaturesAsync(overrideInMemoryFeatures = false) {
        if (!this.pollingService) {
            return await super.getFeaturesAsync(overrideInMemoryFeatures);
        }
        else {
            this.pollingService.StopPolling();
            let result = await super.getFeaturesAsync(overrideInMemoryFeatures);
            this.pollingService.StartPolling();
            return result;
        }
    }
}
exports.ExperimentationServiceAutoPolling = ExperimentationServiceAutoPolling;
//# sourceMappingURL=ExperimentationServiceAutoPolling.js.map

/***/ }),
/* 60 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const MemoryKeyValueStorage_1 = __webpack_require__(61);
/**
 * Experimentation service to provide functionality of A/B experiments:
 * - reading flights;
 * - caching current set of flights;
 * - get answer on if flights are enabled.
 */
class ExperimentationServiceBase {
    constructor(telemetry, featuresTelemetryPropertyName, assignmentContextTelemetryPropertyName, telemetryEventName, storageKey, storage) {
        this.telemetry = telemetry;
        this.featuresTelemetryPropertyName = featuresTelemetryPropertyName;
        this.assignmentContextTelemetryPropertyName = assignmentContextTelemetryPropertyName;
        this.telemetryEventName = telemetryEventName;
        this.storageKey = storageKey;
        this.storage = storage;
        this.featuresConsumed = false;
        this.cachedTelemetryEvents = [];
        this._features = {
            features: [],
            assignmentContext: '',
            configs: []
        };
        if (!this.storageKey) {
            this.storageKey = 'ABExp.Features';
        }
        if (!this.storage) {
            storage = new MemoryKeyValueStorage_1.MemoryKeyValueStorage();
        }
        this.loadCachePromise = this.loadCachedFeatureData();
        this.initializePromise = this.loadCachePromise;
        this.initialFetch = new Promise((resolve, reject) => {
            this.resolveInitialFetchPromise = resolve;
        });
    }
    get features() {
        return this._features;
    }
    set features(value) {
        this._features = value;
        /**
         * If an implementation of telemetry exists, we set the shared property.
         */
        if (this.telemetry) {
            this.telemetry.setSharedProperty(this.featuresTelemetryPropertyName, this.features.features.join(';'));
            this.telemetry.setSharedProperty(this.assignmentContextTelemetryPropertyName, this.features.assignmentContext);
        }
    }
    /**
     * Gets all the features from the provider sources (not cache).
     * It returns these features and will also update the providers to have the latest features cached.
     */
    async getFeaturesAsync(overrideInMemoryFeatures = false) {
        /**
         * If there's already a fetching promise, there's no need to call it again.
         * We return that as result.
         */
        if (this.fetchPromise != null) {
            try {
                await this.fetchPromise;
            }
            catch (_a) {
                // Fetching features threw. Can happen if not connected to the internet, e.g
            }
            return this.features;
        }
        if (!this.featureProviders || this.featureProviders.length === 0) {
            return Promise.resolve({
                features: [],
                assignmentContext: '',
                configs: []
            });
        }
        /**
         * Fetch all from providers.
         */
        this.fetchPromise = Promise.all(this.featureProviders.map(async (provider) => {
            return await provider.getFeatures();
        }));
        try {
            const featureResults = await this.fetchPromise;
            this.updateFeatures(featureResults, overrideInMemoryFeatures);
        }
        catch (_b) {
            // Fetching features threw. Can happen if not connected to the internet, e.g.
        }
        this.fetchPromise = undefined;
        if (this.resolveInitialFetchPromise) {
            this.resolveInitialFetchPromise();
            this.resolveInitialFetchPromise = undefined;
        }
        /**
         * At this point all features have been re-fetched and cache has been updated.
         * We return the cached features.
         */
        return this.features;
    }
    /**
     *
     * @param featureResults The feature results obtained from all the feature providers.
     */
    updateFeatures(featureResults, overrideInMemoryFeatures = false) {
        /**
         * if features comes as a null value, that is taken as if there aren't any features active,
         * so an empty array is defaulted.
         */
        let features = {
            features: [],
            assignmentContext: '',
            configs: []
        };
        for (let result of featureResults) {
            for (let feature of result.features) {
                if (!features.features.includes(feature)) {
                    features.features.push(feature);
                }
            }
            for (let config of result.configs) {
                const existingConfig = features.configs.find(c => c.Id === config.Id);
                if (existingConfig) {
                    existingConfig.Parameters = Object.assign(Object.assign({}, existingConfig.Parameters), config.Parameters);
                }
                else {
                    features.configs.push(config);
                }
            }
            features.assignmentContext += result.assignmentContext;
        }
        /**
         * Set the obtained feature values to the global features variable. This stores them in memory.
         */
        if (overrideInMemoryFeatures || !this.featuresConsumed) {
            this.features = features;
        }
        /**
         * If we have storage, we cache the latest results into the storage.
         */
        if (this.storage) {
            this.storage.setValue(this.storageKey, features);
        }
    }
    async loadCachedFeatureData() {
        let cachedFeatureData;
        if (this.storage) {
            cachedFeatureData = await this.storage.getValue(this.storageKey);
            // When updating from an older version of tas-client, configs may be undefined 
            if (cachedFeatureData !== undefined && cachedFeatureData.configs === undefined) {
                cachedFeatureData.configs = [];
            }
        }
        if (this.features.features.length === 0) {
            this.features = cachedFeatureData || { features: [], assignmentContext: '', configs: [] };
        }
    }
    /**
     * Returns a value indicating whether the given flight is enabled.
     * It uses the in-memory cache.
     * @param flight The flight to check.
     */
    isFlightEnabled(flight) {
        this.featuresConsumed = true;
        this.PostEventToTelemetry(flight);
        return this.features.features.includes(flight);
    }
    /**
     * Returns a value indicating whether the given flight is enabled.
     * It uses the values currently on cache.
     * @param flight The flight to check.
     */
    async isCachedFlightEnabled(flight) {
        await this.loadCachePromise;
        this.featuresConsumed = true;
        this.PostEventToTelemetry(flight);
        return this.features.features.includes(flight);
    }
    /**
     * Returns a value indicating whether the given flight is enabled.
     * It re-fetches values from the server.
     * @param flight the flight to check.
     */
    async isFlightEnabledAsync(flight) {
        const features = await this.getFeaturesAsync(true);
        this.featuresConsumed = true;
        this.PostEventToTelemetry(flight);
        return features.features.includes(flight);
    }
    /**
     * Returns the value of the treatment variable, or undefined if not found.
     * It uses the values currently in memory, so the experimentation service
     * must be initialized before calling.
     * @param config name of the config to check.
     * @param name name of the treatment variable.
     */
    getTreatmentVariable(configId, name) {
        var _a;
        this.featuresConsumed = true;
        this.PostEventToTelemetry(`${configId}.${name}`);
        const config = this.features.configs.find(c => c.Id === configId);
        return (_a = config) === null || _a === void 0 ? void 0 : _a.Parameters[name];
    }
    /**
     * Returns the value of the treatment variable, or undefined if not found.
     * It re-fetches values from the server. If checkCache is set to true and the value exists
     * in the cache, the Treatment Assignment Service is not called.
     * @param config name of the config to check.
     * @param name name of the treatment variable.
     * @param checkCache check the cache for the variable before calling the TAS.
     */
    async getTreatmentVariableAsync(configId, name, checkCache) {
        if (checkCache) {
            const _featuresConsumed = this.featuresConsumed;
            const cachedValue = this.getTreatmentVariable(configId, name);
            if (cachedValue === undefined) {
                this.featuresConsumed = _featuresConsumed;
            }
            else {
                return cachedValue;
            }
        }
        await this.getFeaturesAsync(true);
        return this.getTreatmentVariable(configId, name);
    }
    PostEventToTelemetry(flight) {
        /**
         * If this event has already been posted, we omit from posting it again.
         */
        if (this.cachedTelemetryEvents.includes(flight)) {
            return;
        }
        this.telemetry.postEvent(this.telemetryEventName, new Map([['ABExp.queriedFeature', flight]]));
        /**
         * We cache the flight so we don't post it again.
         */
        this.cachedTelemetryEvents.push(flight);
    }
    invokeInit() {
        this.init();
    }
    addFeatureProvider(...providers) {
        if (providers == null || this.featureProviders == null) {
            return;
        }
        for (let provider of providers) {
            this.featureProviders.push(provider);
        }
    }
}
exports.ExperimentationServiceBase = ExperimentationServiceBase;
//# sourceMappingURL=ExperimentationServiceBase.js.map

/***/ }),
/* 61 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class MemoryKeyValueStorage {
    constructor() {
        this.storage = new Map();
    }
    async getValue(key, defaultValue) {
        if (this.storage.has(key)) {
            return await Promise.resolve(this.storage.get(key));
        }
        return await Promise.resolve(defaultValue || undefined);
    }
    setValue(key, value) {
        this.storage.set(key, value);
    }
}
exports.MemoryKeyValueStorage = MemoryKeyValueStorage;
//# sourceMappingURL=MemoryKeyValueStorage.js.map

/***/ }),
/* 62 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class PollingService {
    constructor(fetchInterval) {
        this.fetchInterval = fetchInterval;
    }
    StopPolling() {
        clearInterval(this.intervalHandle);
        this.intervalHandle = undefined;
    }
    OnPollTick(callback) {
        this.onTick = callback;
    }
    StartPolling(pollImmediately = false) {
        if (this.intervalHandle) {
            this.StopPolling();
        }
        // If there's no callback, there's no point to start polling.
        if (this.onTick == null) {
            return;
        }
        if (pollImmediately) {
            this.onTick().then(() => { return; }).catch(() => { return; });
        }
        /**
         * Set the interval to start running.
         */
        this.intervalHandle = setInterval(async () => {
            await this.onTick();
        }, this.fetchInterval);
        if (this.intervalHandle.unref) { // unref is only available in Node, not the web
            this.intervalHandle.unref(); // unref is used to avoid keeping node.js alive only because of these timeouts.
        }
    }
}
exports.PollingService = PollingService;
//# sourceMappingURL=PollingService.js.map

/***/ }),
/* 63 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class MementoKeyValueStorage {
    constructor(mementoGlobalStorage) {
        this.mementoGlobalStorage = mementoGlobalStorage;
    }
    async getValue(key, defaultValue) {
        const value = await this.mementoGlobalStorage.get(key);
        return value || defaultValue;
    }
    setValue(key, value) {
        this.mementoGlobalStorage.update(key, value);
    }
}
exports.MementoKeyValueStorage = MementoKeyValueStorage;
//# sourceMappingURL=MementoKeyValueStorage.js.map

/***/ }),
/* 64 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class TelemetryDisabledExperimentationService {
    constructor() {
        this.initializePromise = Promise.resolve();
        this.initialFetch = Promise.resolve();
    }
    isFlightEnabled(flight) {
        return false;
    }
    isCachedFlightEnabled(flight) {
        return Promise.resolve(false);
    }
    isFlightEnabledAsync(flight) {
        return Promise.resolve(false);
    }
    getTreatmentVariable(configId, name) {
        return undefined;
    }
    getTreatmentVariableAsync(configId, name) {
        return Promise.resolve(undefined);
    }
}
exports.default = TelemetryDisabledExperimentationService;
//# sourceMappingURL=TelemetryDisabledExperimentationService.js.map

/***/ }),
/* 65 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ mu)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
var mo=Object.defineProperty;var vu=t=>mo(t,"__esModule",{value:!0});var C=(t,e)=>()=>(t&&(e=t(t=0)),e);var hu=(t,e)=>{vu(t);for(var r in e)mo(t,r,{get:e[r],enumerable:!0})};var vo,ho=C(()=>{vo={Unknown:0,NonRetryableStatus:1,InvalidEvent:2,SizeLimitExceeded:3,KillSwitch:4,QueueFull:5}});var mt,Xe,Oe,Ie,zr,gt,Cr,Ir,Ln,Un,nr,_n=C(()=>{mt="function",Xe="object",Oe="undefined",Ie="prototype",zr="hasOwnProperty",gt=Object,Cr=gt[Ie],Ir=gt.assign,Ln=gt.create,Un=gt.defineProperty,nr=Cr[zr]});function ot(){return typeof globalThis!==Oe&&globalThis?globalThis:typeof self!==Oe&&self?self:typeof window!==Oe&&window?window:typeof global!==Oe&&global?global:null}function Tr(t){throw new TypeError(t)}function Dt(t){var e=Ln;if(e)return e(t);if(t==null)return{};var r=typeof t;r!==Xe&&r!==mt&&Tr("Object prototype may only be an Object:"+t);function n(){}return n[Ie]=t,new n}var Ai=C(()=>{_n()});function H(t,e){typeof e!==mt&&e!==null&&Tr("Class extends value "+String(e)+" is not a constructor or null"),Ni(t,e);function r(){this.constructor=t}t[Ie]=e===null?Dt(e):(r[Ie]=e[Ie],new r)}var Ul,_l,Su,yt,Ni,xo=C(()=>{_n();Ai();Ul=(ot()||{}).Symbol,_l=(ot()||{}).Reflect,Su=function(t){for(var e,r=1,n=arguments.length;r<n;r++){e=arguments[r];for(var i in e)Cr[zr].call(e,i)&&(t[i]=e[i])}return t},yt=Ir||Su,Ni=function(t,e){return Ni=gt.setPrototypeOf||{__proto__:[]}instanceof Array&&function(r,n){r.__proto__=n}||function(r,n){for(var i in n)n[zr](i)&&(r[i]=n[i])},Ni(t,e)}});var yo=C(()=>{});var ne=C(()=>{_n();Ai();xo();yo()});function zt(t,e){return t&&zn[At].hasOwnProperty.call(t,e)}function Eo(t){return t&&(t===zn[At]||t===Array[At])}function Mi(t){return Eo(t)||t===Function[At]}function ir(t){if(t){if(Vr)return Vr(t);var e=t[Iu]||t[At]||(t[On]?t[On][At]:null);if(e)return e}return null}function Bn(t,e){var r=[],n=zn.getOwnPropertyNames;if(n)r=n(t);else for(var i in t)typeof i=="string"&&zt(t,i)&&r.push(i);if(r&&r.length>0)for(var a=0;a<r.length;a++)e(r[a])}function Li(t,e,r){return e!==On&&typeof t[e]===Hn&&(r||zt(t,e))}function Vn(t){throw new TypeError("DynamicProto: "+t)}function Tu(t){var e={};return Bn(t,function(r){!e[r]&&Li(t,r,!1)&&(e[r]=t[r])}),e}function Ui(t,e){for(var r=t.length-1;r>=0;r--)if(t[r]===e)return!0;return!1}function Eu(t,e,r,n){function i(s,u,l){var f=u[l];if(f[Fi]&&n){var m=s[jn]||{};m[Br]!==!1&&(f=(m[u[Er]]||{})[l]||f)}return function(){return f.apply(s,arguments)}}var a={};Bn(r,function(s){a[s]=i(e,r,s)});for(var o=ir(t),c=[];o&&!Mi(o)&&!Ui(c,o);)Bn(o,function(s){!a[s]&&Li(o,s,!Vr)&&(a[s]=i(e,o,s))}),c.push(o),o=ir(o);return a}function wu(t,e,r,n){var i=null;if(t&&zt(r,Er)){var a=t[jn]||{};if(i=(a[r[Er]]||{})[e],i||Vn("Missing ["+e+"] "+Hn),!i[ki]&&a[Br]!==!1){for(var o=!zt(t,e),c=ir(t),s=[];o&&c&&!Mi(c)&&!Ui(s,c);){var u=c[e];if(u){o=u===n;break}s.push(c),c=ir(c)}try{o&&(t[e]=i),i[ki]=1}catch(l){a[Br]=!1}}}return i}function Pu(t,e,r){var n=e[t];return n===r&&(n=ir(e)[t]),typeof n!==Hn&&Vn("["+t+"] is not a "+Hn),n}function bu(t,e,r,n,i){function a(s,u){var l=function(){var f=wu(this,u,s,l)||Pu(u,s,l);return f.apply(this,arguments)};return l[Fi]=1,l}if(!Eo(t)){var o=r[jn]=r[jn]||{},c=o[e]=o[e]||{};o[Br]!==!1&&(o[Br]=!!i),Bn(r,function(s){Li(r,s,!1)&&r[s]!==n[s]&&(c[s]=r[s],delete r[s],(!zt(t,s)||t[s]&&!t[s][Fi])&&(t[s]=a(t,s)))})}}function Du(t,e){if(Vr)for(var r=[],n=ir(e);n&&!Mi(n)&&!Ui(r,n);){if(n===t)return!0;r.push(n),n=ir(n)}return!1}function _i(t,e){return zt(t,At)?t.name||e||Co:((t||{})[On]||{}).name||e||Co}function Oi(t,e,r,n){zt(t,At)||Vn("theClass is an invalid class definition.");var i=t[At];Du(i,e)||Vn("["+_i(t)+"] is not in class hierarchy of ["+_i(e)+"]");var a=null;zt(i,Er)?a=i[Er]:(a=Cu+_i(t,"_")+"$"+To,To++,i[Er]=a);var o=Oi[So],c=!!o[Ri];c&&n&&n[Ri]!==void 0&&(c=!!n[Ri]);var s=Tu(e),u=Eu(i,e,s,c);r(e,u);var l=!!Vr&&!!o[Io];l&&n&&(l=!!n[Io]),bu(i,a,e,s,l!==!1)}var On,At,Hn,jn,Fi,Er,Cu,ki,Br,So,Co,Iu,Ri,Io,zn,Vr,To,Au,W,Te=C(()=>{On="constructor",At="prototype",Hn="function",jn="_dynInstFuncs",Fi="_isDynProxy",Er="_dynClass",Cu="_dynCls$",ki="_dynInstChk",Br=ki,So="_dfOpts",Co="_unknown_",Iu="__proto__",Ri="useBaseInst",Io="setInstFuncs",zn=Object,Vr=zn.getPrototypeOf,To=0;Au={setInstFuncs:!0,useBaseInst:!0};Oi[So]=Au;W=Oi});var S,h,qr=C(()=>{(function(t){t[t.CRITICAL=1]="CRITICAL",t[t.WARNING=2]="WARNING"})(S||(S={}));h={BrowserDoesNotSupportLocalStorage:0,BrowserCannotReadLocalStorage:1,BrowserCannotReadSessionStorage:2,BrowserCannotWriteLocalStorage:3,BrowserCannotWriteSessionStorage:4,BrowserFailedRemovalFromLocalStorage:5,BrowserFailedRemovalFromSessionStorage:6,CannotSendEmptyTelemetry:7,ClientPerformanceMathError:8,ErrorParsingAISessionCookie:9,ErrorPVCalc:10,ExceptionWhileLoggingError:11,FailedAddingTelemetryToBuffer:12,FailedMonitorAjaxAbort:13,FailedMonitorAjaxDur:14,FailedMonitorAjaxOpen:15,FailedMonitorAjaxRSC:16,FailedMonitorAjaxSend:17,FailedMonitorAjaxGetCorrelationHeader:18,FailedToAddHandlerForOnBeforeUnload:19,FailedToSendQueuedTelemetry:20,FailedToReportDataLoss:21,FlushFailed:22,MessageLimitPerPVExceeded:23,MissingRequiredFieldSpecification:24,NavigationTimingNotSupported:25,OnError:26,SessionRenewalDateIsZero:27,SenderNotInitialized:28,StartTrackEventFailed:29,StopTrackEventFailed:30,StartTrackFailed:31,StopTrackFailed:32,TelemetrySampledAndNotSent:33,TrackEventFailed:34,TrackExceptionFailed:35,TrackMetricFailed:36,TrackPVFailed:37,TrackPVFailedCalc:38,TrackTraceFailed:39,TransmissionFailed:40,FailedToSetStorageBuffer:41,FailedToRestoreStorageBuffer:42,InvalidBackendResponse:43,FailedToFixDepricatedValues:44,InvalidDurationValue:45,TelemetryEnvelopeInvalid:46,CreateEnvelopeError:47,CannotSerializeObject:48,CannotSerializeObjectNonSerializable:49,CircularReferenceDetected:50,ClearAuthContextFailed:51,ExceptionTruncated:52,IllegalCharsInName:53,ItemNotInArray:54,MaxAjaxPerPVExceeded:55,MessageTruncated:56,NameTooLong:57,SampleRateOutOfRange:58,SetAuthContextFailed:59,SetAuthContextFailedAccountName:60,StringValueTooLong:61,StartCalledMoreThanOnce:62,StopCalledWithoutStart:63,TelemetryInitializerFailed:64,TrackArgumentsNotSpecified:65,UrlTooLong:66,SessionStorageBufferFull:67,CannotAccessCookie:68,IdTooLong:69,InvalidEvent:70,FailedMonitorAjaxSetRequestHeader:71,SendBrowserInfoOnUserInit:72,PluginException:73,NotificationException:74,SnippetScriptLoadFailure:99,InvalidInstrumentationKey:100,CannotParseAiBlobValue:101,InvalidContentBlob:102,TrackPageActionEventFailed:103}});function Hi(t){return Cr.toString.call(t)}function ji(t,e){return typeof t===e}function pe(t){return t===void 0||typeof t===Oe}function x(t){return t===null||pe(t)}function zi(t){return!x(t)}function wr(t,e){return t&&nr.call(t,e)}function st(t){return typeof t===Xe}function j(t){return typeof t===mt}function Bt(t,e,r,n){n===void 0&&(n=!1);var i=!1;if(!x(t))try{x(t[bo])?x(t[Po])||(t[Po](wo+e,r),i=!0):(t[bo](e,r,n),i=!0)}catch(a){}return i}function qn(t,e,r,n){if(n===void 0&&(n=!1),!x(t))try{x(t[Ao])?x(t[Do])||t[Do](wo+e,r):t[Ao](e,r,n)}catch(i){}}function Bi(t){var e=t,r=/([^\w\d_$])/g;return r.test(t)&&(e=t.replace(r,"_")),e}function Z(t,e){if(t)for(var r in t)nr.call(t,r)&&e.call(t,r,t[r])}function Vi(t,e){if(t&&e){var r=e.length,n=t.length;if(t===e)return!0;if(n>=r){for(var i=n-1,a=r-1;a>=0;a--){if(t[i]!=e[a])return!1;i--}return!0}}return!1}function Ee(t,e){return t&&e?t.indexOf(e)!==-1:!1}function Pr(t){return Hi(t)==="[object Date]"}function Re(t){return Hi(t)==="[object Array]"}function Vt(t){return Hi(t)==="[object Error]"}function _(t){return typeof t=="string"}function ar(t){return typeof t=="number"}function Gr(t){return typeof t=="boolean"}function Me(t){if(Pr(t)){var e=function(r){var n=String(r);return n.length===1&&(n="0"+n),n};return t.getUTCFullYear()+"-"+e(t.getUTCMonth()+1)+"-"+e(t.getUTCDate())+"T"+e(t.getUTCHours())+":"+e(t.getUTCMinutes())+":"+e(t.getUTCSeconds())+"."+String((t.getUTCMilliseconds()/1e3).toFixed(3)).slice(2,5)+"Z"}}function R(t,e,r){for(var n=t.length,i=0;i<n&&!(i in t&&e.call(r||t,t[i],i,t)===-1);i++);}function Nt(t,e,r){for(var n=t.length,i=r||0,a=Math.max(i>=0?i:n-Math.abs(i),0);a<n;a++)if(a in t&&t[a]===e)return a;return-1}function qt(t,e,r){for(var n=t.length,i=r||t,a=new Array(n),o=0;o<n;o++)o in t&&(a[o]=e.call(i,t[o],t));return a}function Kr(t,e,r){var n=t.length,i=0,a;if(arguments.length>=3)a=arguments[2];else{for(;i<n&&!(i in t);)i++;a=t[i++]}for(;i<n;)i in t&&(a=e(a,t[i],i,t)),i++;return a}function oe(t){return typeof t!="string"?t:t.replace(/^\s+|\s+$/g,"")}function Ze(t){var e=typeof t;e!==mt&&(e!==Xe||t===null)&&Tr("objKeys called on non-object");var r=[];for(var n in t)t&&nr.call(t,n)&&r.push(n);if(Nu)for(var i=qi.length,a=0;a<i;a++)t&&nr.call(t,qi[a])&&r.push(qi[a]);return r}function St(t,e,r,n){if(No)try{var i={enumerable:!0,configurable:!0};return r&&(i.get=r),n&&(i.set=n),No(t,e,i),!0}catch(a){}return!1}function de(){var t=Date;return t.now?t.now():new t().getTime()}function G(t){return Vt(t)?t.name:""}function K(t,e,r,n,i){var a=r;return t&&(a=t[e],a!==r&&(!i||i(a))&&(!n||n(r))&&(a=r,t[e]=a)),a}function ge(t,e,r){var n;return t?(n=t[e],!n&&x(n)&&(n=pe(r)?{}:r,t[e]=n)):n=pe(r)?{}:r,n}function Gn(t){return!t}function br(t){return!!t}function Ae(t){throw new Error(t)}function Wr(t,e,r){if(t&&e&&t!==e&&st(t)&&st(e)){var n=function(a){if(_(a)){var o=e[a];j(o)?(!r||r(a,!0,e,t))&&(t[a]=function(c){return function(){var s=arguments;return e[c].apply(e,s)}}(a)):(!r||r(a,!1,e,t))&&(wr(t,a)&&delete t[a],St(t,a,function(){return e[a]},function(c){e[a]=c})||(t[a]=o))}};for(var i in e)n(i)}return t}function Gi(t){return function(){function e(){var r=this;t&&Z(t,function(n,i){r[n]=i})}return e}()}function Kn(t){return t&&(t=gt(Ir?Ir({},t):t)),t}var wo,Po,bo,Do,Ao,No,uf,lf,Nu,qi,Le=C(()=>{ne();wo="on",Po="attachEvent",bo="addEventListener",Do="detachEvent",Ao="removeEventListener",No=Un,uf=gt.freeze,lf=gt.seal;Nu=!{toString:null}.propertyIsEnumerable("toString"),qi=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"]});function we(t){var e=ot();return e&&e[t]?e[t]:t===Fo&&or()?window:null}function or(){return Boolean(typeof window===Xe&&window)}function Ct(){return or()?window:we(Fo)}function Wn(){return Boolean(typeof document===Xe&&document)}function Ne(){return Wn()?document:we(Fu)}function Ro(){return Boolean(typeof navigator===Xe&&navigator)}function Ue(){return Ro()?navigator:we(ku)}function Mo(){return Boolean(typeof history===Xe&&history)}function Qi(){return Mo()?history:we(Ru)}function et(t){if(t&&ju){var e=we("__mockLocation");if(e)return e}return typeof location===Xe&&location?location:we(Mu)}function $i(){return typeof console!==Oe?console:we(Lu)}function Qe(){return we(Uu)}function vt(){return Boolean(typeof JSON===Xe&&JSON||we(ko)!==null)}function Pe(){return vt()?JSON||we(ko):null}function Yi(){return we(_u)}function Zi(){return we(Ou)}function ea(){var t=Ue();return t&&t.product?t.product===Hu:!1}function Gt(){var t=Ue();if(t&&(t.userAgent!==Xi||Ji===null)){Xi=t.userAgent;var e=(Xi||"").toLowerCase();Ji=Ee(e,Ki)||Ee(e,Wi)}return Ji}function sr(t){if(t===void 0&&(t=null),!t){var e=Ue()||{};t=e?(e.userAgent||"").toLowerCase():""}var r=(t||"").toLowerCase();if(Ee(r,Ki))return parseInt(r.split(Ki)[1]);if(Ee(r,Wi)){var n=parseInt(r.split(Wi)[1]);if(n)return n+4}return null}function O(t){var e=Object[Ie].toString.call(t),r="";return e==="[object Error]"?r="{ stack: '"+t.stack+"', message: '"+t.message+"', name: '"+t.name+"'":vt()&&(r=Pe().stringify(t)),e+r}var Fo,Fu,ku,Ru,Mu,Lu,Uu,ko,_u,Ou,Hu,Ki,Wi,Ji,Xi,ju,Dr=C(()=>{ne();Le();"use strict";Fo="window",Fu="document",ku="navigator",Ru="history",Mu="location",Lu="console",Uu="performance",ko="JSON",_u="crypto",Ou="msCrypto",Hu="ReactNative",Ki="msie",Wi="trident/",Ji=null,Xi=null,ju=!1});function Lo(t){return t?'"'+t.replace(/\"/g,"")+'"':""}function kt(t,e){return(t||{}).logger||new Jn(e)}var zu,Bu,Vu,Ft,Jn,Xn=C(()=>{qr();Dr();Te();Le();"use strict";zu="AI (Internal): ",Bu="AI: ",Vu="AITR_";Ft=function(){function t(e,r,n,i){n===void 0&&(n=!1);var a=this;a.messageId=e,a.message=(n?Bu:zu)+e;var o="";vt()&&(o=Pe().stringify(i));var c=(r?" message:"+Lo(r):"")+(i?" props:"+Lo(o):"");a.message+=c}return t.dataType="MessageData",t}();Jn=function(){function t(e){this.identifier="DiagnosticLogger",this.queue=[];var r=0,n={};W(t,this,function(i){x(e)&&(e={}),i.consoleLoggingLevel=function(){return a("loggingLevelConsole",0)},i.telemetryLoggingLevel=function(){return a("loggingLevelTelemetry",1)},i.maxInternalMessageLimit=function(){return a("maxMessageLimit",25)},i.enableDebugExceptions=function(){return a("enableDebugExceptions",!1)},i.throwInternal=function(c,s,u,l,f){f===void 0&&(f=!1);var m=new Ft(s,u,f,l);if(i.enableDebugExceptions())throw m;if(!pe(m.message)){var I=i.consoleLoggingLevel();if(f){var E=+m.messageId;!n[E]&&I>=S.WARNING&&(i.warnToConsole(m.message),n[E]=!0)}else I>=S.WARNING&&i.warnToConsole(m.message);i.logInternalMessage(c,m)}},i.warnToConsole=function(c){var s=$i();if(s){var u="log";s.warn&&(u="warn"),j(s[u])&&s[u](c)}},i.resetInternalMessageCount=function(){r=0,n={}},i.logInternalMessage=function(c,s){if(!o()){var u=!0,l=Vu+s.messageId;if(n[l]?u=!1:n[l]=!0,u&&(c<=i.telemetryLoggingLevel()&&(i.queue.push(s),r++),r===i.maxInternalMessageLimit())){var f="Internal events throttle limit per PageView reached for this app.",m=new Ft(h.MessageLimitPerPVExceeded,f,!1);i.queue.push(m),i.warnToConsole(f)}}};function a(c,s){var u=e[c];return x(u)?s:u}function o(){return r>=i.maxInternalMessageLimit()}})}return t}()});function ct(t,e,r,n,i){if(t){var a=t;if(j(a.getPerfMgr)&&(a=a.getPerfMgr()),a){var o=void 0,c=a.getCtx(ta);try{if(o=a.create(e(),n,i),o){if(c&&o.setCtx&&(o.setCtx(cr.ParentContextKey,c),c.getCtx&&c.setCtx)){var s=c.getCtx(cr.ChildrenContextKey);s||(s=[],c.setCtx(cr.ChildrenContextKey,s)),s.push(o)}return a.setCtx(ta,o),r(o)}}catch(u){o&&o.setCtx&&o.setCtx("exception",u)}finally{o&&a.fire(o),a.setCtx(ta,c)}}}return r()}var Ar,cr,Jr,ta,Xr=C(()=>{Te();Le();Ar="ctx",cr=function(){function t(e,r,n){var i=this,a=!1;if(i.start=de(),i.name=e,i.isAsync=n,i.isChildEvt=function(){return!1},j(r)){var o;a=St(i,"payload",function(){return!o&&j(r)&&(o=r(),r=null),o})}i.getCtx=function(c){return c?c===t.ParentContextKey||c===t.ChildrenContextKey?i[c]:(i[Ar]||{})[c]:null},i.setCtx=function(c,s){if(c)if(c===t.ParentContextKey)i[c]||(i.isChildEvt=function(){return!0}),i[c]=s;else if(c===t.ChildrenContextKey)i[c]=s;else{var u=i[Ar]=i[Ar]||{};u[c]=s}},i.complete=function(){var c=0,s=i.getCtx(t.ChildrenContextKey);if(Re(s))for(var u=0;u<s.length;u++){var l=s[u];l&&(c+=l.time)}i.time=de()-i.start,i.exTime=i.time-c,i.complete=function(){},!a&&j(r)&&(i.payload=r())}}return t.ParentContextKey="parent",t.ChildrenContextKey="childEvts",t}(),Jr=function(){function t(e){this.ctx={},W(t,this,function(r){r.create=function(n,i,a){return new cr(n,i,a)},r.fire=function(n){n&&(n.complete(),e&&e.perfEvent(n))},r.setCtx=function(n,i){if(n){var a=r[Ar]=r[Ar]||{};a[n]=i}},r.getCtx=function(n){return(r[Ar]||{})[n]}})}return t}(),ta="CoreUtils.doPerf"});var Uo,_o=C(()=>{Xr();qr();Le();"use strict";Uo=function(){function t(e,r){var n=this,i=null,a=j(e.processTelemetry),o=j(e.setNextPlugin);n._hasRun=!1,n.getPlugin=function(){return e},n.getNext=function(){return i},n.setNext=function(c){i=c},n.processTelemetry=function(c,s){s||(s=r);var u=e?e.identifier:"TelemetryPluginChain";ct(s?s.core():null,function(){return u+":processTelemetry"},function(){if(e&&a){n._hasRun=!0;try{s.setNext(i),o&&e.setNextPlugin(i),i&&(i._hasRun=!1),e.processTelemetry(c,s)}catch(f){var l=i&&i._hasRun;(!i||!l)&&s.diagLog().throwInternal(S.CRITICAL,h.PluginException,"Plugin ["+e.identifier+"] failed during processTelemetry - "+f),i&&!l&&i.processTelemetry(c,s)}}else i&&(n._hasRun=!0,i.processTelemetry(c,s))},function(){return{item:c}},!c.sync)}}return t}()});function ra(t,e){var r=[];if(t&&t.length>0)for(var n=null,i=0;i<t.length;i++){var a=t[i];if(a&&j(a.processTelemetry)){var o=new Uo(a,e);r.push(o),n&&n.setNext(o),n=o}}return r.length>0?r[0]:null}function qu(t,e,r){var n=[],i=!r;if(t)for(;t;){var a=t.getPlugin();(i||a===r)&&(i=!0,n.push(a)),t=t.getNext()}return i||n.push(r),ra(n,e)}function Gu(t,e,r){var n=t,i=!1;return r&&t&&(n=[],R(t,function(a){(i||a===r)&&(i=!0,n.push(a))})),r&&!i&&(n||(n=[]),n.push(r)),ra(n,e)}var Rt,Qn=C(()=>{Xn();_o();Le();"use strict";Rt=function(){function t(e,r,n,i){var a=this,o=null;i!==null&&(e&&j(e.getPlugin)?o=qu(e,a,i||e.getPlugin()):i?o=Gu(e,a,i):pe(i)&&(o=ra(e,a))),a.core=function(){return n},a.diagLog=function(){return kt(n,r)},a.getCfg=function(){return r},a.getExtCfg=function(c,s){s===void 0&&(s={});var u;if(r){var l=r.extensionConfig;l&&c&&(u=l[c])}return u||s},a.getConfig=function(c,s,u){u===void 0&&(u=!1);var l,f=a.getExtCfg(c,null);return f&&!x(f[s])?l=f[s]:r&&!x(r[s])&&(l=r[s]),x(l)?u:l},a.hasNext=function(){return o!=null},a.getNext=function(){return o},a.setNext=function(c){o=c},a.processNext=function(c){var s=o;s&&(o=s.getNext(),s.processTelemetry(c,a))},a.createNew=function(c,s){return c===void 0&&(c=null),new t(c||o,r,n,s)}}return t}()});var Oo,$n,na=C(()=>{Oo="iKey",$n="extensionConfig"});var Yn,tt,ia=C(()=>{Qn();Le();na();"use strict";Yn="getPlugin",tt=function(){function t(){var e=this,r=!1,n=null,i=null;e.core=null,e.diagLog=function(a){return e._getTelCtx(a).diagLog()},e.isInitialized=function(){return r},e.setInitialized=function(a){r=a},e.setNextPlugin=function(a){i=a},e.processNext=function(a,o){o?o.processNext(a):i&&j(i.processTelemetry)&&i.processTelemetry(a,null)},e._getTelCtx=function(a){a===void 0&&(a=null);var o=a;if(!o){var c=n||new Rt(null,{},e.core);i&&i[Yn]?o=c.createNew(null,i[Yn]):o=c.createNew(null,i)}return o},e._baseTelInit=function(a,o,c,s){a&&K(a,$n,[],null,x),!s&&o&&(s=o.getProcessTelContext().getNext());var u=i;i&&i[Yn]&&(u=i[Yn]()),e.core=o,n=new Rt(s,a,o,u),r=!0}}return t.prototype.initialize=function(e,r,n,i){this._baseTelInit(e,r,n,i)},t}()});function Qr(t,e){for(var r=[],n=null,i=t.getNext();i;){var a=i.getPlugin();a&&(n&&j(n[jo])&&j(a[aa])&&n[jo](a),(!j(a[zo])||!a[zo]())&&r.push(a),n=a,i=i.getNext())}R(r,function(o){o.initialize(t.getCfg(),t.core(),e,t.getNext())})}function oa(t){return t.sort(function(e,r){var n=0,i=j(r[aa]);return j(e[aa])?n=i?e[Ho]-r[Ho]:1:i&&(n=-1),n})}var aa,Ho,jo,zo,sa=C(()=>{Le();"use strict";aa="processTelemetry",Ho="priority",jo="setNextPlugin",zo="isInitialized"});var ca,Ku,Bo,Vo=C(()=>{ne();Te();ia();Qn();sa();Le();"use strict";ca=500,Ku="Channel has invalid priority",Bo=function(t){H(e,t);function e(){var r=t.call(this)||this;r.identifier="ChannelControllerPlugin",r.priority=ca;var n;W(e,r,function(c,s){c.setNextPlugin=function(u){},c.processTelemetry=function(u,l){n&&R(n,function(f){if(f.length>0){var m=r._getTelCtx(l).createNew(f);m.processNext(u)}})},c.getChannelControls=function(){return n},c.initialize=function(u,l,f){c.isInitialized()||(s.initialize(u,l,f),o((u||{}).channels,f),R(n,function(m){return Qr(new Rt(m,u,l),f)}))}});function i(c){R(c,function(s){s.priority<ca&&Ae(Ku+s.identifier)})}function a(c){c&&c.length>0&&(c=c.sort(function(s,u){return s.priority-u.priority}),i(c),n.push(c))}function o(c,s){if(n=[],c&&R(c,function(l){return a(l)}),s){var u=[];R(s,function(l){l.priority>ca&&u.push(l)}),a(u)}}return r}return e._staticInit=function(){var r=e.prototype;St(r,"ChannelControls",r.getChannelControls),St(r,"channelQueue",r.getChannelControls)}(),e}(tt)});function da(t,e){var r=lr[Kt]||ei[Kt];return r||(r=lr[Kt]=lr(t,e),ei[Kt]=r),r}function ti(t){return t?t.isEnabled():!0}function Wu(t){var e=t.cookieCfg=t.cookieCfg||{};if(K(e,"domain",t.cookieDomain,zi,x),K(e,"path",t.cookiePath||"/",null,x),x(e[fa])){var r=void 0;pe(t[Ko])||(r=!t[Ko]),pe(t[Wo])||(r=!t[Wo]),e[fa]=r}return e}function ur(t,e){var r;if(t)r=t.getCookieMgr();else if(e){var n=e.cookieCfg;n[Kt]?r=n[Kt]:r=lr(e)}return r||(r=da(e,(t||{}).logger)),r}function lr(t,e){var r=Wu(t||ei),n=r.path||"/",i=r.domain,a=r[fa]!==!1,o={isEnabled:function(){var c=a&&ma(e),s=ei[Kt];return c&&s&&o!==s&&(c=ti(s)),c},setEnabled:function(c){a=c!==!1},set:function(c,s,u,l,f){if(ti(o)){var m={},I=oe(s||ht),E=I.indexOf(";");if(E!==-1&&(I=oe(s.substring(0,E)),m=Qo(s.substring(E+1))),K(m,"domain",l||i,br,pe),!x(u)){var b=Gt();if(pe(m[la])){var p=de(),v=p+u*1e3;if(v>0){var y=new Date;y.setTime(v),K(m,la,$o(y,b?qo:Go)||$o(y,b?qo:Go)||ht,br)}}b||K(m,"max-age",ht+u,null,pe)}var w=et();w&&w.protocol==="https:"&&(K(m,"secure",null,null,pe),pa===null&&(pa=!ri((Ue()||{}).userAgent)),pa&&K(m,"SameSite","None",null,pe)),K(m,"path",f||n,null,pe);var L=r.setCookie||Zo;L(c,Yo(I,m))}},get:function(c){var s=ht;return ti(o)&&(s=(r.getCookie||Ju)(c)),s},del:function(c,s){ti(o)&&o.purge(c,s)},purge:function(c,s){if(ma(e)){var u=(f={},f.path=s||"/",f[la]="Thu, 01 Jan 1970 00:00:01 GMT",f);Gt()||(u["max-age"]="0");var l=r.delCookie||Zo;l(c,Yo(ht,u))}var f}};return o[Kt]=o,o}function ma(t){if(Zn===null){Zn=!1;try{var e=$r||{};Zn=e[ua]!==void 0}catch(r){t&&t.throwInternal(S.WARNING,h.CannotAccessCookie,"Cannot access document.cookie - "+G(r),{exception:O(r)})}}return Zn}function Qo(t){var e={};if(t&&t.length){var r=oe(t).split(";");R(r,function(n){if(n=oe(n||ht),n){var i=n.indexOf("=");i===-1?e[n]=null:e[oe(n.substring(0,i))]=oe(n.substring(i+1))}})}return e}function $o(t,e){return j(t[e])?t[e]():null}function Yo(t,e){var r=t||ht;return Z(e,function(n,i){r+="; "+n+(x(i)?ht:"="+i)}),r}function Ju(t){var e=ht;if($r){var r=$r[ua]||ht;Jo!==r&&(Xo=Qo(r),Jo=r),e=oe(Xo[t]||ht)}return e}function Zo(t,e){$r&&($r[ua]=t+"="+e)}function ri(t){return _(t)?!!(Ee(t,"CPU iPhone OS 12")||Ee(t,"iPad; CPU OS 12")||Ee(t,"Macintosh; Intel Mac OS X 10_14")&&Ee(t,"Version/")&&Ee(t,"Safari")||Ee(t,"Macintosh; Intel Mac OS X 10_14")&&Vi(t,"AppleWebKit/605.1.15 (KHTML, like Gecko)")||Ee(t,"Chrome/5")||Ee(t,"Chrome/6")||Ee(t,"UnrealEngine")&&!Ee(t,"Chrome")||Ee(t,"UCBrowser/12")||Ee(t,"UCBrowser/11")):!1}var qo,Go,ua,la,fa,Ko,Wo,Kt,ht,Zn,pa,Jo,$r,Xo,ei,ni=C(()=>{qr();Dr();Le();qo="toGMTString",Go="toUTCString",ua="cookie",la="expires",fa="enabled",Ko="isCookieUseDisabled",Wo="disableCookiesUsage",Kt="_ckMgr",ht="",Zn=null,pa=null,Jo=null,$r=Ne(),Xo={},ei={}});var Xu,es,Yr,ga=C(()=>{ne();Te();Vo();Qn();sa();Xr();ni();Le();na();"use strict";Xu="Extensions must provide callback to initialize",es="_notificationManager",Yr=function(){function t(){var e=!1,r,n,i,a,o;W(t,this,function(c){c._extensions=new Array,n=new Bo,c.logger=Dt({throwInternal:function(s,u,l,f,m){m===void 0&&(m=!1)},warnToConsole:function(s){},resetInternalMessageCount:function(){}}),r=[],c.isInitialized=function(){return e},c.initialize=function(s,u,l,f){c.isInitialized()&&Ae("Core should not be initialized more than once"),(!s||x(s.instrumentationKey))&&Ae("Please provide instrumentation key"),i=f,c[es]=f,c.config=s||{},s.extensions=x(s.extensions)?[]:s.extensions;var m=ge(s,$n);m.NotificationManager=f,l&&(c.logger=l);var I=[];I.push.apply(I,u.concat(s.extensions)),I=oa(I);var E=[],b=[],p={};R(I,function(v){(x(v)||x(v.initialize))&&Ae(Xu);var y=v.priority,w=v.identifier;v&&y&&(x(p[y])?p[y]=w:l.warnToConsole("Two extensions have same priority #"+y+" - "+p[y]+", "+w)),!y||y<n.priority?E.push(v):b.push(v)}),I.push(n),E.push(n),I=oa(I),c._extensions=I,Qr(new Rt([n],s,c),I),Qr(new Rt(E,s,c),I),c._extensions=E,c.getTransmissionControls().length===0&&Ae("No channels available"),e=!0,c.releaseQueue()},c.getTransmissionControls=function(){return n.getChannelControls()},c.track=function(s){K(s,Oo,c.config.instrumentationKey,null,Gn),K(s,"time",Me(new Date),null,Gn),K(s,"ver","4.0",null,x),c.isInitialized()?c.getProcessTelContext().processNext(s):r.push(s)},c.getProcessTelContext=function(){var s=c._extensions,u=s;return(!s||s.length===0)&&(u=[n]),new Rt(u,c.config,c)},c.getNotifyMgr=function(){return i||(i=Dt({addNotificationListener:function(s){},removeNotificationListener:function(s){},eventsSent:function(s){},eventsDiscarded:function(s,u){},eventsSendRequest:function(s,u){}}),c[es]=i),i},c.getCookieMgr=function(){return o||(o=lr(c.config,c.logger)),o},c.setCookieMgr=function(s){o=s},c.getPerfMgr=function(){return a||c.config&&c.config.enablePerfMgr&&(a=new Jr(c.getNotifyMgr())),a},c.setPerfMgr=function(s){a=s},c.eventCnt=function(){return r.length},c.releaseQueue=function(){r.length>0&&(R(r,function(s){c.getProcessTelContext().processNext(s)}),r=[])}})}return t}()});var Zr,va=C(()=>{Te();Le();Zr=function(){function t(e){this.listeners=[];var r=!!(e||{}).perfEvtsSendAll;W(t,this,function(n){n.addNotificationListener=function(i){n.listeners.push(i)},n.removeNotificationListener=function(i){for(var a=Nt(n.listeners,i);a>-1;)n.listeners.splice(a,1),a=Nt(n.listeners,i)},n.eventsSent=function(i){R(n.listeners,function(a){a&&a.eventsSent&&setTimeout(function(){return a.eventsSent(i)},0)})},n.eventsDiscarded=function(i,a){R(n.listeners,function(o){o&&o.eventsDiscarded&&setTimeout(function(){return o.eventsDiscarded(i,a)},0)})},n.eventsSendRequest=function(i,a){R(n.listeners,function(o){if(o&&o.eventsSendRequest)if(a)setTimeout(function(){return o.eventsSendRequest(i,a)},0);else try{o.eventsSendRequest(i,a)}catch(c){}})},n.perfEvent=function(i){i&&(r||!i.isChildEvt())&&R(n.listeners,function(a){if(a&&a.perfEvent)if(i.isAsync)setTimeout(function(){return a.perfEvent(i)},0);else try{a.perfEvent(i)}catch(o){}})}})}return t}()});var en,ts=C(()=>{ne();ga();ho();va();Xr();Xn();Te();Le();en=function(t){H(e,t);function e(){var r=t.call(this)||this;return W(e,r,function(n,i){n.initialize=function(c,s,u,l){i.initialize(c,s,u||new Jn(c),l||new Zr(c))},n.track=function(c){ct(n.getPerfMgr(),function(){return"AppInsightsCore:track"},function(){c===null&&(o(c),Ae("Invalid telemetry item")),a(c),i.track(c)},function(){return{item:c}},!c.sync)},n.addNotificationListener=function(c){var s=n.getNotifyMgr();s&&s.addNotificationListener(c)},n.removeNotificationListener=function(c){var s=n.getNotifyMgr();s&&s.removeNotificationListener(c)},n.pollInternalLogs=function(c){var s=n.config.diagnosticLogInterval;return(!s||!(s>0))&&(s=1e4),setInterval(function(){var u=n.logger?n.logger.queue:[];R(u,function(l){var f={name:c||"InternalMessageId: "+l.messageId,iKey:n.config.instrumentationKey,time:Me(new Date),baseType:Ft.dataType,baseData:{message:l.message}};n.track(f)}),u.length=0},s)};function a(c){if(x(c.name))throw o(c),Error("telemetry name required")}function o(c){var s=n.getNotifyMgr();s&&s.eventsDiscarded([c],vo.InvalidEvent)}}),r}return e}(Yr)});function is(t){t<0&&(t>>>=0),tn=123456789+t&Wt,rn=987654321-t&Wt,ns=!0}function as(){try{var t=de()&2147483647;is((Math.random()*rs^t)+t)}catch(e){}}function ii(t){return t>0?Math.floor(It()/Wt*(t+1))>>>0:0}function It(t){var e,r=Yi()||Zi();return r&&r.getRandomValues?e=r.getRandomValues(new Uint32Array(1))[0]&Wt:Gt()?(ns||as(),e=ai()&Wt):e=Math.floor(rs*Math.random()|0),t||(e>>>=0),e}function ha(t){t?is(t):as()}function ai(t){rn=36969*(rn&65535)+(rn>>16)&Wt,tn=18e3*(tn&65535)+(tn>>16)&Wt;var e=(rn<<16)+(tn&65535)>>>0&Wt|0;return t||(e>>>=0),e}var rs,Wt,ns,tn,rn,xa=C(()=>{Dr();Le();rs=4294967296,Wt=4294967295,ns=!1,tn=123456789,rn=987654321});function Mt(t,e){var r=!1,n=Ct();n&&(r=Bt(n,t,e),r=Bt(n.body,t,e)||r);var i=Ne();return i&&(r=Xt.Attach(i,t,e)||r),r}function os(){function t(){return ii(15)}return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(Qu,function(e){var r=t()|0,n=e==="x"?r:r&3|8;return n.toString(16)})}function ss(){var t=Qe();return t&&t.now?t.now():de()}function Jt(t){t===void 0&&(t=22);for(var e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",r=It()>>>0,n=0,i="";i.length<t;)n++,i+=e.charAt(r&63),r>>>=6,n===5&&(r=(It()<<2&4294967295|r&3)>>>0,n=0);return i}function He(){for(var t=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"],e="",r,n=0;n<4;n++)r=It(),e+=t[r&15]+t[r>>4&15]+t[r>>8&15]+t[r>>12&15]+t[r>>16&15]+t[r>>20&15]+t[r>>24&15]+t[r>>28&15];var i=t[8+(It()&3)|0];return e.substr(0,8)+e.substr(9,4)+"4"+e.substr(13,3)+i+e.substr(16,3)+e.substr(19,12)}function Qt(t,e){var r=da(t,e),n=on._canUseCookies;return nn===null&&(nn=[],an=n,St(on,"_canUseCookies",function(){return an},function(i){an=i,R(nn,function(a){a.setEnabled(i)})})),Nt(nn,r)===-1&&nn.push(r),Gr(n)&&r.setEnabled(n),Gr(an)&&r.setEnabled(an),r}function oi(){Qt().setEnabled(!1)}function ya(t){return Qt(null,t).isEnabled()}function Sa(t,e){return Qt(null,t).get(e)}function Ca(t,e,r,n){Qt(null,t).set(e,r,null,n)}function Ia(t,e){return Qt(null,t).del(e)}var nn,an,on,Qu,Xt,cs=C(()=>{ne();ni();Dr();Le();xa();"use strict";nn=null;on={_canUseCookies:void 0,isTypeof:ji,isUndefined:pe,isNullOrUndefined:x,hasOwnProperty:wr,isFunction:j,isObject:st,isDate:Pr,isArray:Re,isError:Vt,isString:_,isNumber:ar,isBoolean:Gr,toISOString:Me,arrForEach:R,arrIndexOf:Nt,arrMap:qt,arrReduce:Kr,strTrim:oe,objCreate:Dt,objKeys:Ze,objDefineAccessors:St,addEventHandler:Mt,dateNow:de,isIE:Gt,disableCookies:oi,newGuid:os,perfNow:ss,newId:Jt,randomValue:ii,random32:It,mwcRandomSeed:ha,mwcRandom32:ai,generateW3CId:He},Qu=/[xy]/g,Xt={Attach:Bt,AttachEvent:Bt,Detach:qn,DetachEvent:qn}});function Ta(t,e){if(t)for(var r=0;r<t.length&&!e(t[r],r);r++);}function Ea(t,e,r,n,i){i>=0&&i<=2&&Ta(t,function(a,o){var c=a.cbks,s=c[ls[i]];if(s){e.ctx=function(){var f=n[o]=n[o]||{};return f};try{s.apply(e.inst,r)}catch(f){var u=e.err;try{var l=c[ls[2]];l&&(e.err=f,l.apply(e.inst,r))}catch(m){}finally{e.err=u}}}})}function Zu(t){return function(){var e=this,r=arguments,n=t.h,i={name:t.n,inst:e,ctx:null,set:s},a=[],o=c([i],r);function c(l,f){return Ta(f,function(m){l.push(m)}),l}function s(l,f){r=c([],r),r[l]=f,o=c([i],r)}Ea(n,i,o,a,0);var u=t.f;try{i.rslt=u.apply(e,r)}catch(l){throw i.err=l,Ea(n,i,o,a,3),l}return Ea(n,i,o,a,1),i.rslt}}function el(t){if(t){if(fs)return fs(t);var e=t[$u]||t[Ie]||t[Yu];if(e)return e}return null}function ps(t,e,r){var n=null;return t&&(wr(t,e)?n=t:r&&(n=ps(el(t),e,!1))),n}function wa(t,e,r){return t?sn(t[Ie],e,r,!1):null}function sn(t,e,r,n){if(n===void 0&&(n=!0),t&&e&&r){var i=ps(t,e,n);if(i){var a=i[e];if(typeof a===mt){var o=a[us];if(!o){o={i:0,n:e,f:a,h:[]};var c=Zu(o);c[us]=o,i[e]=c}var s={id:o.i,cbks:r,rm:function(){var u=this.id;Ta(o.h,function(l,f){if(l.id===u)return o.h.splice(f,1),1})}};return o.i++,o.h.push(s),s}}}return null}var us,ls,$u,Yu,fs,ds=C(()=>{ne();Le();us="_aiHooks",ls=["req","rsp","hkErr","fnErr"],$u="__proto__",Yu="constructor";fs=Object.getPrototypeOf});var J=C(()=>{ts();ga();ia();xa();cs();Le();Dr();ne();va();Xr();Xn();qr();ds();ni()});var te,Pa=C(()=>{te={requestContextHeader:"Request-Context",requestContextTargetKey:"appId",requestContextAppIdFormat:"appId=cid-v1:",requestIdHeader:"Request-Id",traceParentHeader:"traceparent",traceStateHeader:"tracestate",sdkContextHeader:"Sdk-Context",sdkContextHeaderAppIdRequest:"appId",requestContextHeaderLowerCase:"request-context"}});function si(t,e,r){var n=e.length,i=ba(t,e);if(i.length!==n){for(var a=0,o=i;r[o]!==void 0;)a++,o=i.substring(0,150-3)+Da(a);i=o}return i}function ba(t,e){var r;return e&&(e=oe(e.toString()),e.length>150&&(r=e.substring(0,150),t.throwInternal(S.WARNING,h.NameTooLong,"name is too long.  It has been truncated to "+150+" characters.",{name:e},!0))),r||e}function ae(t,e,r){r===void 0&&(r=1024);var n;return e&&(r=r||1024,e=oe(e),e.toString().length>r&&(n=e.toString().substring(0,r),t.throwInternal(S.WARNING,h.StringValueTooLong,"string value is too long. It has been truncated to "+r+" characters.",{value:e},!0))),n||e}function Tt(t,e){return li(t,e,2048,h.UrlTooLong)}function Nr(t,e){var r;return e&&e.length>32768&&(r=e.substring(0,32768),t.throwInternal(S.WARNING,h.MessageTruncated,"message is too long, it has been truncated to "+32768+" characters.",{message:e},!0)),r||e}function ci(t,e){var r;if(e){var n=""+e;n.length>32768&&(r=n.substring(0,32768),t.throwInternal(S.WARNING,h.ExceptionTruncated,"exception is too long, it has been truncated to "+32768+" characters.",{exception:e},!0))}return r||e}function je(t,e){if(e){var r={};Z(e,function(n,i){if(st(i)&&vt())try{i=Pe().stringify(i)}catch(a){t.throwInternal(S.WARNING,h.CannotSerializeObjectNonSerializable,"custom property is not valid",{exception:a},!0)}i=ae(t,i,8192),n=si(t,n,r),r[n]=i}),e=r}return e}function ze(t,e){if(e){var r={};Z(e,function(n,i){n=si(t,n,r),r[n]=i}),e=r}return e}function ui(t,e){return e&&li(t,e,128,h.IdTooLong).toString()}function li(t,e,r,n){var i;return e&&(e=oe(e),e.length>r&&(i=e.substring(0,r),t.throwInternal(S.WARNING,n,"input is too long, it has been truncated to "+r+" characters.",{data:e},!0))),i||e}function Da(t){var e="00"+t;return e.substr(e.length-3)}var Aa,ut=C(()=>{J();Aa={MAX_NAME_LENGTH:150,MAX_ID_LENGTH:128,MAX_PROPERTY_LENGTH:8192,MAX_STRING_LENGTH:1024,MAX_URL_LENGTH:2048,MAX_MESSAGE_LENGTH:32768,MAX_EXCEPTION_LENGTH:32768,sanitizeKeyAndAddUniqueness:si,sanitizeKey:ba,sanitizeString:ae,sanitizeUrl:Tt,sanitizeMessage:Nr,sanitizeException:ci,sanitizeProperties:je,sanitizeMeasurements:ze,sanitizeId:ui,sanitizeInput:li,padNumber:Da,trim:oe}});function Lt(t){var e=null;if(j(Event))e=new Event(t);else{var r=Ne();r&&r.createEvent&&(e=r.createEvent("Event"),e.initEvent(t,!0,!0))}return e}var Na=C(()=>{J()});function ee(t,e){return e===void 0&&(e=!1),t==null?e:t.toString().toLowerCase()==="true"}function Ke(t){(isNaN(t)||t<0)&&(t=0),t=Math.round(t);var e=""+t%1e3,r=""+Math.floor(t/1e3)%60,n=""+Math.floor(t/(1e3*60))%60,i=""+Math.floor(t/(1e3*60*60))%24,a=Math.floor(t/(1e3*60*60*24));return e=e.length===1?"00"+e:e.length===2?"0"+e:e,r=r.length<2?"0"+r:r,n=n.length<2?"0"+n:n,i=i.length<2?"0"+i:i,(a>0?a+".":"")+i+":"+n+":"+r+"."+e}function Fr(){var t=Ue();return"sendBeacon"in t&&t.sendBeacon}function cn(t,e){var r=null;return R(t,function(n){if(n.identifier===e)return r=n,-1}),r}function un(t,e,r,n,i){return!i&&_(t)&&(t==="Script error."||t==="Script error")}var ln=C(()=>{J()});var Et,fr,Ut,kr,fn,le,lt=C(()=>{Et="Microsoft_ApplicationInsights_BypassAjaxInstrumentation",fr="sampleRate",Ut="ProcessLegacy",kr="http.method",fn="https://dc.services.visualstudio.com",le="not_specified"});var $t,We,Fa=C(()=>{(function(t){t[t.LocalStorage=0]="LocalStorage",t[t.SessionStorage=1]="SessionStorage"})($t||($t={}));(function(t){t[t.AI=0]="AI",t[t.AI_AND_W3C=1]="AI_AND_W3C",t[t.W3C=2]="W3C"})(We||(We={}))});function ka(){return Rr()?fi($t.LocalStorage):null}function fi(t){try{if(x(ot()))return null;var e=new Date,r=we(t===$t.LocalStorage?"localStorage":"sessionStorage");r.setItem(e.toString(),e.toString());var n=r.getItem(e.toString())!==e.toString();if(r.removeItem(e.toString()),!n)return r}catch(i){}return null}function Ra(){return wt()?fi($t.SessionStorage):null}function pn(){pr=!1,dr=!1}function Rr(){return pr===void 0&&(pr=!!fi($t.LocalStorage)),pr}function dn(t,e){var r=ka();if(r!==null)try{return r.getItem(e)}catch(n){pr=!1,t.throwInternal(S.WARNING,h.BrowserCannotReadLocalStorage,"Browser failed read of local storage. "+G(n),{exception:O(n)})}return null}function mn(t,e,r){var n=ka();if(n!==null)try{return n.setItem(e,r),!0}catch(i){pr=!1,t.throwInternal(S.WARNING,h.BrowserCannotWriteLocalStorage,"Browser failed write to local storage. "+G(i),{exception:O(i)})}return!1}function gn(t,e){var r=ka();if(r!==null)try{return r.removeItem(e),!0}catch(n){pr=!1,t.throwInternal(S.WARNING,h.BrowserFailedRemovalFromLocalStorage,"Browser failed removal of local storage item. "+G(n),{exception:O(n)})}return!1}function wt(){return dr===void 0&&(dr=!!fi($t.SessionStorage)),dr}function Ma(){var t=[];return wt()&&Z(we("sessionStorage"),function(e){t.push(e)}),t}function Yt(t,e){var r=Ra();if(r!==null)try{return r.getItem(e)}catch(n){dr=!1,t.throwInternal(S.WARNING,h.BrowserCannotReadSessionStorage,"Browser failed read of session storage. "+G(n),{exception:O(n)})}return null}function Zt(t,e,r){var n=Ra();if(n!==null)try{return n.setItem(e,r),!0}catch(i){dr=!1,t.throwInternal(S.WARNING,h.BrowserCannotWriteSessionStorage,"Browser failed write to session storage. "+G(i),{exception:O(i)})}return!1}function vn(t,e){var r=Ra();if(r!==null)try{return r.removeItem(e),!0}catch(n){dr=!1,t.throwInternal(S.WARNING,h.BrowserFailedRemovalFromSessionStorage,"Browser failed removal of session storage item. "+G(n),{exception:O(n)})}return!1}var pr,dr,La=C(()=>{J();Fa();pr=void 0,dr=void 0});function mr(t){var e=gs,r=tl,n=r[e];return ms.createElement?r[e]||(n=r[e]=ms.createElement("a")):n={host:pi(t,!0)},n.href=t,e++,e>=r.length&&(e=0),gs=e,n}function hn(t){var e,r=mr(t);return r&&(e=r.href),e}function Ua(t){var e,r=mr(t);return r&&(e=r.pathname),e}function xn(t,e){return t?t.toUpperCase()+" "+e:e}function pi(t,e){var r=yn(t,e)||"";if(r){var n=r.match(/(www[0-9]?\.)?(.[^/:]+)(\:[\d]+)?/i);if(n!=null&&n.length>3&&_(n[2])&&n[2].length>0)return n[2]+(n[3]||"")}return r}function yn(t,e){var r=null;if(t){var n=t.match(/(\w*):\/\/(.[^/:]+)(\:[\d]+)?/i);if(n!=null&&n.length>2&&_(n[2])&&n[2].length>0&&(r=n[2]||"",e&&n.length>2)){var i=(n[1]||"").toLowerCase(),a=n[3]||"";(i==="http"&&a===":80"||i==="https"&&a===":443")&&(a=""),r+=a}}return r}var ms,gs,tl,_a=C(()=>{J();ms=Ne()||{},gs=0,tl=[null,null,null,null,null]});function Mr(t){return rl.indexOf(t.toLowerCase())!==-1}function vs(t,e,r,n){var i,a=n,o=n;if(e&&e.length>0){var c=mr(e);if(i=c.host,!a)if(c.pathname!=null){var s=c.pathname.length===0?"/":c.pathname;s.charAt(0)!=="/"&&(s="/"+s),o=c.pathname,a=ae(t,r?r+" "+s:s)}else a=ae(t,e)}else i=n,a=n;return{target:i,name:a,data:o}}function gr(){var t=Qe();if(t&&t.now&&t.timing){var e=t.now()+t.timing.navigationStart;if(e>0)return e}return de()}function ve(t,e){var r=null;return t!==0&&e!==0&&!x(t)&&!x(e)&&(r=e-t),r}var rl,Sn,Oa,Pt,Ha,ja=C(()=>{J();Pa();ut();Na();ln();lt();La();_a();rl=["https://dc.services.visualstudio.com/v2/track","https://breeze.aimon.applicationinsights.io/v2/track","https://dc-int.services.visualstudio.com/v2/track"];Sn={NotSpecified:le,createDomEvent:Lt,disableStorage:pn,isInternalApplicationInsightsEndpoint:Mr,canUseLocalStorage:Rr,getStorage:dn,setStorage:mn,removeStorage:gn,canUseSessionStorage:wt,getSessionStorageKeys:Ma,getSessionStorage:Yt,setSessionStorage:Zt,removeSessionStorage:vn,disableCookies:oi,canUseCookies:ya,disallowsSameSiteNone:ri,setCookie:Ca,stringToBoolOrDefault:ee,getCookie:Sa,deleteCookie:Ia,trim:oe,newId:Jt,random32:function(){return It(!0)},generateW3CId:He,isArray:Re,isError:Vt,isDate:Pr,toISOStringForIE8:Me,getIEVersion:sr,msToTimeSpan:Ke,isCrossOriginError:un,dump:O,getExceptionName:G,addEventHandler:Bt,IsBeaconApiSupported:Fr,getExtension:cn},Oa={parseUrl:mr,getAbsoluteUrl:hn,getPathName:Ua,getCompleteUrl:xn,parseHost:pi,parseFullHost:yn},Pt={correlationIdPrefix:"cid-v1:",canIncludeCorrelationHeader:function(t,e,r){if(!e||t&&t.disableCorrelationHeaders)return!1;if(t&&t.correlationHeaderExcludePatterns){for(var n=0;n<t.correlationHeaderExcludePatterns.length;n++)if(t.correlationHeaderExcludePatterns[n].test(e))return!1}var i=mr(e).host.toLowerCase();if(i&&(i.indexOf(":443")!==-1||i.indexOf(":80")!==-1)&&(i=(yn(e,!0)||"").toLowerCase()),(!t||!t.enableCorsCorrelation)&&i&&i!==r)return!1;var a=t&&t.correlationHeaderDomains;if(a){var o;if(R(a,function(u){var l=new RegExp(u.toLowerCase().replace(/\\/g,"\\\\").replace(/\./g,"\\.").replace(/\*/g,".*"));o=o||l.test(i)}),!o)return!1}var c=t&&t.correlationHeaderExcludedDomains;if(!c||c.length===0)return!0;for(var n=0;n<c.length;n++){var s=new RegExp(c[n].toLowerCase().replace(/\\/g,"\\\\").replace(/\./g,"\\.").replace(/\*/g,".*"));if(s.test(i))return!1}return i&&i.length>0},getCorrelationContext:function(t){if(t){var e=Pt.getCorrelationContextValue(t,te.requestContextTargetKey);if(e&&e!==Pt.correlationIdPrefix)return e}},getCorrelationContextValue:function(t,e){if(t)for(var r=t.split(","),n=0;n<r.length;++n){var i=r[n].split("=");if(i.length===2&&i[0]===e)return i[1]}}};Ha={Now:gr,GetDuration:ve}});function di(t){if(!t)return{};var e=t.split(nl),r=Kr(e,function(i,a){var o=a.split(il);if(o.length===2){var c=o[0].toLowerCase(),s=o[1];i[c]=s}return i},{});if(Ze(r).length>0){if(r.endpointsuffix){var n=r.location?r.location+".":"";r.ingestionendpoint=r.ingestionendpoint||"https://"+n+"dc."+r.endpointsuffix}r.ingestionendpoint=r.ingestionendpoint||fn}return r}var nl,il,za,hs=C(()=>{lt();J();nl=";",il="=";za={parse:di}});var Cn,Ba=C(()=>{Cn=function(){function t(){}return t}()});var In,Va=C(()=>{ne();Ba();In=function(t){H(e,t);function e(){return t.call(this)||this}return e}(Cn)});var xs,ys=C(()=>{xs=function(){function t(){this.ver=1,this.sampleRate=100,this.tags={}}return t}()});var Tn,Ss=C(()=>{ne();ys();ut();J();lt();Tn=function(t){H(e,t);function e(r,n,i){var a=t.call(this)||this;return a.name=ae(r,i)||le,a.data=n,a.time=Me(new Date),a.aiDataContract={time:1,iKey:1,name:1,sampleRate:function(){return a.sampleRate===100?4:1},tags:1,data:1},a}return e}(xs)});var mi,qa=C(()=>{mi=function(){function t(){this.ver=2,this.properties={},this.measurements={}}return t}()});var Be,Cs=C(()=>{ne();qa();ut();lt();Be=function(t){H(e,t);function e(r,n,i,a){var o=t.call(this)||this;return o.aiDataContract={ver:1,name:1,properties:0,measurements:0},o.name=ae(r,n)||le,o.properties=je(r,i),o.measurements=ze(r,a),o}return e.envelopeType="Microsoft.ApplicationInsights.{0}.Event",e.dataType="EventData",e}(mi)});var Is,Ts=C(()=>{Is=function(){function t(){}return t}()});var Es,ws=C(()=>{Es=function(){function t(){this.ver=2,this.exceptions=[],this.properties={},this.measurements={}}return t}()});var Ps,bs=C(()=>{Ps=function(){function t(){this.hasFullStack=!0,this.parsedStack=[]}return t}()});function Wa(t,e){var r=t;return r&&!_(r)&&(JSON&&JSON.stringify?(r=JSON.stringify(t),e&&(!r||r==="{}")&&(j(t.toString)?r=t.toString():r=""+t)):r=""+t+" - (Missing JSON.stringify)"),r||""}function Ns(t,e){var r=t;return t&&(r=t[Ka]||t[As]||"",r&&!_(r)&&(r=Wa(r,!0)),t.filename&&(r=r+" @"+(t.filename||"")+":"+(t.lineno||"?")+":"+(t.colno||"?"))),e&&e!=="String"&&e!=="Object"&&e!=="Error"&&(r||"").indexOf(e)===-1&&(r=e+": "+r),r||""}function ol(t){return st(t)?"hasFullStack"in t&&"typeName"in t:!1}function sl(t){return st(t)?"ver"in t&&"exceptions"in t&&"properties"in t:!1}function Fs(t){return t&&t.src&&_(t.src)&&t.obj&&Re(t.obj)}function Ur(t){var e=t||"";_(e)||(_(e[ft])?e=e[ft]:e=""+e);var r=e.split(`
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
/* 66 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Log = void 0;
const vscode = __webpack_require__(1);
const github_1 = __webpack_require__(2);
class Log {
    constructor(type) {
        this.type = type;
        const friendlyName = this.type === github_1.AuthProviderType.github ? 'GitHub' : 'GitHub Enterprise';
        this.output = vscode.window.createOutputChannel(`${friendlyName} Authentication`);
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
    trace(message, data) {
        this.logLevel('Trace', message, data);
    }
    info(message, data) {
        this.logLevel('Info', message, data);
    }
    error(message, data) {
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
exports.Log = Log;
function padLeft(s, n, pad = ' ') {
    return pad.repeat(Math.max(0, n - s.length)) + s;
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
const github_1 = __webpack_require__(2);
function activate(context) {
    context.subscriptions.push(new github_1.GitHubAuthenticationProvider(context, github_1.AuthProviderType.github));
    let githubEnterpriseAuthProvider;
    if (vscode.workspace.getConfiguration().get('github-enterprise.uri')) {
        githubEnterpriseAuthProvider = new github_1.GitHubAuthenticationProvider(context, github_1.AuthProviderType.githubEnterprise);
        context.subscriptions.push(githubEnterpriseAuthProvider);
    }
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration('github-enterprise.uri')) {
            if (!githubEnterpriseAuthProvider && vscode.workspace.getConfiguration().get('github-enterprise.uri')) {
                githubEnterpriseAuthProvider = new github_1.GitHubAuthenticationProvider(context, github_1.AuthProviderType.githubEnterprise);
                context.subscriptions.push(githubEnterpriseAuthProvider);
            }
        }
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