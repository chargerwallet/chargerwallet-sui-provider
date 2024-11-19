var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { bytesToHex } from '@noble/hashes/utils';
import { getOrCreateExtInjectedJsBridge } from '@chargerwallet/extension-bridge-injected';
import { ProviderSuiBase } from './ProviderSuiBase';
import { web3Errors } from '@chargerwallet/cross-inpage-provider-errors';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { ALL_PERMISSION_TYPES } from './types';
const PROVIDER_EVENTS = {
    'connect': 'connect',
    'disconnect': 'disconnect',
    'accountChanged': 'accountChanged',
    'networkChange': 'networkChange',
    'message_low_level': 'message_low_level',
};
function isWalletEventMethodMatch({ method, name }) {
    return method === `wallet_events_${name}`;
}
class ProviderSui extends ProviderSuiBase {
    constructor(props) {
        super(Object.assign(Object.assign({}, props), { bridge: props.bridge || getOrCreateExtInjectedJsBridge({ timeout: props.timeout }) }));
        this._account = null;
        this._registerEvents();
    }
    _registerEvents() {
        window.addEventListener('chargerwallet_bridge_disconnect', () => {
            this._handleDisconnected();
        });
        this.on(PROVIDER_EVENTS.message_low_level, (payload) => {
            if (!payload)
                return;
            const { method, params } = payload;
            if (isWalletEventMethodMatch({ method, name: PROVIDER_EVENTS.accountChanged })) {
                this._handleAccountChange(params);
            }
            if (isWalletEventMethodMatch({ method, name: PROVIDER_EVENTS.networkChange })) {
                this._handleNetworkChange(params);
            }
        });
    }
    _callBridge(params) {
        return this.bridgeRequest(params);
    }
    _handleConnected(account, options = { emit: true }) {
        var _a;
        if (options.emit) {
            this.emit('connect', (_a = account === null || account === void 0 ? void 0 : account.address) !== null && _a !== void 0 ? _a : null);
            this.emit('accountChanged', account ? { address: account === null || account === void 0 ? void 0 : account.address, publicKey: account === null || account === void 0 ? void 0 : account.publicKey } : null);
        }
    }
    _handleDisconnected(options = { emit: true }) {
        this._account = null;
        if (options.emit) {
            this.emit('disconnect');
            this.emit('accountChanged', null);
        }
    }
    isAccountsChanged(account) {
        var _a;
        return (account === null || account === void 0 ? void 0 : account.address) !== ((_a = this._account) === null || _a === void 0 ? void 0 : _a.address);
    }
    // trigger by bridge account change event
    _handleAccountChange(payload) {
        if (!payload) {
            this._handleDisconnected();
            return;
        }
        if (this.isAccountsChanged(payload)) {
            this._handleConnected(payload);
        }
        this._account = payload;
    }
    isNetworkChanged(network) {
        return this._network === undefined || network !== this._network;
    }
    _handleNetworkChange(payload) {
        const network = payload;
        if (this.isNetworkChanged(network)) {
            this.emit('networkChange', network || null);
        }
        this._network = network;
    }
    hasPermissions(permissions = ALL_PERMISSION_TYPES) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._callBridge({
                method: 'hasPermissions',
                params: permissions,
            });
        });
    }
    requestPermissions(permissions = ALL_PERMISSION_TYPES) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._callBridge({
                method: 'requestPermissions',
                params: permissions,
            });
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._callBridge({
                method: 'disconnect',
                params: void 0,
            });
            this._handleDisconnected();
        });
    }
    getAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            const accounts = yield this._callBridge({
                method: 'getAccounts',
                params: undefined,
            });
            if (accounts.length === 0) {
                this._handleDisconnected();
                throw web3Errors.provider.unauthorized();
            }
            return accounts;
        });
    }
    getActiveChain() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._callBridge({
                method: 'getActiveChain',
                params: undefined,
            });
        });
    }
    signAndExecuteTransactionBlock(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._callBridge({
                method: 'signAndExecuteTransactionBlock',
                params: Object.assign(Object.assign({}, input), { 
                    // https://github.com/MystenLabs/sui/blob/ace69fa8404eb704b504082d324ebc355a3d2948/sdk/typescript/src/transactions/object.ts#L6-L17
                    // With a few more objects, other wallets have steps for tojson.
                    transactionBlock: TransactionBlock.from(input.transactionBlock.serialize()), walletSerialize: JSON.stringify(input.account), blockSerialize: input.transactionBlock.serialize() }),
            });
        });
    }
    signTransactionBlock(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._callBridge({
                method: 'signTransactionBlock',
                params: Object.assign(Object.assign({}, input), { transactionBlock: TransactionBlock.from(input.transactionBlock.serialize()), walletSerialize: JSON.stringify(input.account), blockSerialize: input.transactionBlock.serialize() }),
            });
        });
    }
    signMessage(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._callBridge({
                method: 'signMessage',
                params: Object.assign(Object.assign({}, input), { walletSerialize: JSON.stringify(input.account), messageSerialize: bytesToHex(input.message) }),
            });
        });
    }
    signPersonalMessage(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._callBridge({
                method: 'signPersonalMessage',
                params: Object.assign(Object.assign({}, input), { walletSerialize: JSON.stringify(input.account), messageSerialize: bytesToHex(input.message) }),
            });
        });
    }
    isConnected() {
        return this._account !== null;
    }
    onNetworkChange(listener) {
        return super.on(PROVIDER_EVENTS.networkChange, listener);
    }
    onAccountChange(listener) {
        return super.on(PROVIDER_EVENTS.accountChanged, listener);
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    emit(event, ...args) {
        return super.emit(event, ...args);
    }
}
export { ProviderSui };
