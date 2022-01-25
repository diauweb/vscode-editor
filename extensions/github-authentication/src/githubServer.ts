/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as nls from 'vscode-nls';
import * as vscode from 'vscode';
import fetch, { Response } from 'node-fetch';
import { ExperimentationTelemetry } from './experimentationService';
import { AuthProviderType } from './github';
import { Log } from './common/logger';

const localize = nls.loadMessageBundle();

const NETWORK_ERROR = 'network error';

class UriEventHandler extends vscode.EventEmitter<vscode.Uri> implements vscode.UriHandler {
	constructor(private readonly Logger: Log) {
		super();
	}

	public handleUri(uri: vscode.Uri) {
		this.Logger.trace('Handling Uri...');
		this.fire(uri);
	}
}

export interface IGitHubServer extends vscode.Disposable {
	login(scopes: string): Promise<string>;
	getUserInfo(token: string): Promise<{ id: string, accountName: string }>;
	sendAdditionalTelemetryInfo(token: string): Promise<void>;
	friendlyName: string;
	type: AuthProviderType;
}

async function getScopes(token: string, serverUri: vscode.Uri, logger: Log): Promise<string[]> {
	try {
		logger.info('Getting token scopes...');
		const result = await fetch(serverUri.toString(), {
			headers: {
				Authorization: `token ${token}`,
				'User-Agent': 'Visual-Studio-Code'
			}
		});

		if (result.ok) {
			const scopes = result.headers.get('X-OAuth-Scopes');
			return scopes ? scopes.split(',').map(scope => scope.trim()) : [];
		} else {
			logger.error(`Getting scopes failed: ${result.statusText}`);
			throw new Error(result.statusText);
		}
	} catch (ex) {
		logger.error(ex.message);
		throw new Error(NETWORK_ERROR);
	}
}

async function getUserInfo(token: string, serverUri: vscode.Uri, logger: Log): Promise<{ id: string, accountName: string }> {
	let result: Response;
	try {
		logger.info('Getting user info...');
		result = await fetch(serverUri.toString(), {
			headers: {
				Authorization: `token ${token}`,
				'User-Agent': 'Visual-Studio-Code'
			}
		});
	} catch (ex) {
		logger.error(ex.message);
		throw new Error(NETWORK_ERROR);
	}

	if (result.ok) {
		const json = await result.json();
		logger.info('Got account info!');
		return { id: json.id, accountName: json.login };
	} else {
		logger.error(`Getting account info failed: ${result.statusText}`);
		throw new Error(result.statusText);
	}
}

export class GitHubServer implements IGitHubServer {
	friendlyName = 'GitHub';
	type = AuthProviderType.github;

	private _statusBarCommandId = `${this.type}.provide-manually`;
	private _disposable: vscode.Disposable;
	private _uriHandler = new UriEventHandler(this._logger);

	constructor(private readonly _logger: Log, private readonly _telemetryReporter: ExperimentationTelemetry) {
		this._disposable = vscode.Disposable.from(
			vscode.commands.registerCommand(this._statusBarCommandId, () => this.manuallyProvideUri()),
			vscode.window.registerUriHandler(this._uriHandler));
	}

	dispose() {
		this._disposable.dispose();
	}

	public async login(scopes: string): Promise<string> {
		this._logger.info(`Logging in for the following scopes: ${scopes}`);

		const token = await vscode.window.showInputBox({ prompt: 'GitHub Personal Access Token', ignoreFocusOut: true });
		if (!token) { throw new Error('Sign in failed: No token provided'); }

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

	private getServerUri(path: string = '') {
		const apiUri = vscode.Uri.parse('https://api.github.com');
		return vscode.Uri.parse(`${apiUri.scheme}://${apiUri.authority}${path}`);
	}

	private async manuallyProvideUri() {
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
				} catch (e) {
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

	public getUserInfo(token: string): Promise<{ id: string, accountName: string }> {
		return getUserInfo(token, this.getServerUri('/user'), this._logger);
	}

	public async sendAdditionalTelemetryInfo(_token: string): Promise<void> {
	}

	public async checkEnterpriseVersion(token: string): Promise<void> {
		try {

			const result = await fetch(this.getServerUri('/meta').toString(), {
				headers: {
					Authorization: `token ${token}`,
					'User-Agent': 'Visual-Studio-Code'
				}
			});

			if (!result.ok) {
				return;
			}

			const json: { verifiable_password_authentication: boolean, installed_version: string } = await result.json();

			/* __GDPR__
				"ghe-session" : {
					"version": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
				}
			*/
			this._telemetryReporter.sendTelemetryEvent('ghe-session', {
				version: json.installed_version
			});
		} catch {
			// No-op
		}
	}
}

export class GitHubEnterpriseServer implements IGitHubServer {
	friendlyName = 'GitHub Enterprise';
	type = AuthProviderType.githubEnterprise;

	private _onDidManuallyProvideToken = new vscode.EventEmitter<string | undefined>();
	private _statusBarCommandId = `github-enterprise.provide-manually`;
	private _disposable: vscode.Disposable;

	constructor(private readonly _logger: Log, private readonly telemetryReporter: ExperimentationTelemetry) {
		this._disposable = vscode.commands.registerCommand(this._statusBarCommandId, async () => {
			const token = await vscode.window.showInputBox({ prompt: 'Token', ignoreFocusOut: true });
			this._onDidManuallyProvideToken.fire(token);
		});
	}

	dispose() {
		this._disposable.dispose();
	}

	public async login(scopes: string): Promise<string> {
		this._logger.info(`Logging in for the following scopes: ${scopes}`);

		const token = await vscode.window.showInputBox({ prompt: 'GitHub Personal Access Token', ignoreFocusOut: true });
		if (!token) { throw new Error('Sign in failed: No token provided'); }

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

	private getServerUri(path: string = '') {
		const apiUri = vscode.Uri.parse(vscode.workspace.getConfiguration('github-enterprise').get<string>('uri') || '', true);
		return vscode.Uri.parse(`${apiUri.scheme}://${apiUri.authority}/api/v3${path}`);
	}

	public async getUserInfo(token: string): Promise<{ id: string, accountName: string }> {
		return getUserInfo(token, this.getServerUri('/user'), this._logger);
	}

	public async sendAdditionalTelemetryInfo(token: string): Promise<void> {
		try {

			const result = await fetch(this.getServerUri('/meta').toString(), {
				headers: {
					Authorization: `token ${token}`,
					'User-Agent': 'Visual-Studio-Code'
				}
			});

			if (!result.ok) {
				return;
			}

			const json: { verifiable_password_authentication: boolean, installed_version: string } = await result.json();

			/* __GDPR__
				"ghe-session" : {
					"version": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
				}
			*/
			this.telemetryReporter.sendTelemetryEvent('ghe-session', {
				version: json.installed_version
			});
		} catch {
			// No-op
		}
	}
}
