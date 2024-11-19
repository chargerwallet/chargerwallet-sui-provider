var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { hexToBytes } from '@noble/hashes/utils';
import mitt from 'mitt';
import { ReadonlyWalletAccount, registerWallet, SUI_DEVNET_CHAIN, SUI_TESTNET_CHAIN, } from '@mysten/wallet-standard';
import { ALL_PERMISSION_TYPES } from './types';
var Feature;
(function (Feature) {
    Feature["STANDARD__CONNECT"] = "standard:connect";
    Feature["STANDARD__DISCONNECT"] = "standard:disconnect";
    Feature["STANDARD__EVENTS"] = "standard:events";
    Feature["SUI__SIGN_AND_EXECUTE_TRANSACTION_BLOCK"] = "sui:signAndExecuteTransactionBlock";
    Feature["SUI__SIGN_TRANSACTION_BLOCK"] = "sui:signTransactionBlock";
    Feature["SUI__SIGN_MESSAGE"] = "sui:signMessage";
    Feature["SUI__SIGN_PERSONAL_MESSAGE"] = "sui:signPersonalMessage";
})(Feature || (Feature = {}));
class ChargerwalletSuiStandardWallet {
    get name() {
        var _a, _b;
        return (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : this._name;
    }
    get icon() {
        var _a;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
        return (((_a = this.options) === null || _a === void 0 ? void 0 : _a.logo) || '');
    }
    get chains() {
        return [SUI_DEVNET_CHAIN, SUI_TESTNET_CHAIN];
    }
    get accounts() {
        return this._account ? [this._account] : [];
    }
    get features() {
        return {
            [Feature.STANDARD__CONNECT]: {
                version: '1.0.0',
                connect: this.$connect,
            },
            [Feature.STANDARD__DISCONNECT]: {
                version: '1.0.0',
                disconnect: this.$disconnect,
            },
            [Feature.STANDARD__EVENTS]: {
                version: '1.0.0',
                on: this.$on,
            },
            [Feature.SUI__SIGN_AND_EXECUTE_TRANSACTION_BLOCK]: {
                version: '1.0.0',
                signAndExecuteTransactionBlock: this.$signAndExecuteTransactionBlock,
            },
            [Feature.SUI__SIGN_TRANSACTION_BLOCK]: {
                version: '1.0.0',
                signTransactionBlock: this.$signTransactionBlock,
            },
            [Feature.SUI__SIGN_MESSAGE]: {
                version: '1.0.0',
                signMessage: this.$signMessage,
            },
            [Feature.SUI__SIGN_PERSONAL_MESSAGE]: {
                version: '1.0.0',
                signPersonalMessage: this.$signPersonalMessage,
            },
        };
    }
    constructor(provider, options) {
        this.version = '1.0.0';
        this._name = 'ChargerWallet Wallet';
        this.$on = (event, listener) => {
            this._events.on(event, listener);
            return () => this._events.off(event, listener);
        };
        this.$connected = () => __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.$hasPermissions(['viewAccount']))) {
                return;
            }
            const accounts = yield this.provider.getAccounts();
            const [account] = accounts;
            const activateAccount = this._account;
            if (activateAccount && activateAccount.address === account.address) {
                return { accounts: this.accounts };
            }
            if (account) {
                yield this.handleAccountSwitch(account);
                return { accounts: this.accounts };
            }
        });
        this.$connect = (input) => __awaiter(this, void 0, void 0, function* () {
            if (!(input === null || input === void 0 ? void 0 : input.silent)) {
                yield this.provider.requestPermissions();
            }
            yield this.$connected();
            return { accounts: this.accounts };
        });
        this.$disconnect = () => __awaiter(this, void 0, void 0, function* () {
            yield this.provider.disconnect();
            this._account = null;
            this._events.all.clear();
        });
        this.$signAndExecuteTransactionBlock = (input) => __awaiter(this, void 0, void 0, function* () {
            return this.provider.signAndExecuteTransactionBlock(input);
        });
        this.$signTransactionBlock = (input) => __awaiter(this, void 0, void 0, function* () {
            return this.provider.signTransactionBlock(input);
        });
        this.$signMessage = (input) => __awaiter(this, void 0, void 0, function* () {
            return this.provider.signMessage(input);
        });
        this.$signPersonalMessage = (input) => __awaiter(this, void 0, void 0, function* () {
            return this.provider.signPersonalMessage(input);
        });
        this.handleAccountSwitch = (payload) => __awaiter(this, void 0, void 0, function* () {
            const { address, publicKey } = payload;
            const activateChain = yield this.getActiveChain();
            this._account = new ReadonlyWalletAccount({
                address: address,
                publicKey: hexToBytes(publicKey),
                chains: activateChain ? [activateChain] : [],
                features: [
                    Feature.STANDARD__CONNECT,
                    Feature.SUI__SIGN_AND_EXECUTE_TRANSACTION_BLOCK,
                    Feature.SUI__SIGN_TRANSACTION_BLOCK,
                    Feature.SUI__SIGN_MESSAGE,
                    Feature.SUI__SIGN_PERSONAL_MESSAGE,
                ],
            });
            this._events.emit('change', {
                accounts: this.accounts,
                chains: activateChain ? [activateChain] : [],
            });
        });
        this.handleNetworkSwitch = (payload) => {
            const { network } = payload;
            this._events.emit('change', {
                accounts: this.accounts,
                chains: [network],
            });
        };
        this.provider = provider;
        this._events = mitt();
        this._account = null;
        this.options = options;
        this.subscribeEventFromBackend();
        void this.$connected();
    }
    getActiveChain() {
        return this.provider.getActiveChain();
    }
    $hasPermissions(permissions = ALL_PERMISSION_TYPES) {
        return this.provider.hasPermissions(permissions);
    }
    subscribeEventFromBackend() {
        this.provider.onNetworkChange((network) => {
            if (!network) {
                return;
            }
            this.handleNetworkSwitch({ network: network });
        });
        this.provider.onAccountChange((account) => {
            if (!account) {
                return;
            }
            void this.handleAccountSwitch(account);
        });
    }
}
export function registerSuiWallet(provider, options) {
    try {
        registerWallet(new ChargerwalletSuiStandardWallet(provider, options));
    }
    catch (error) {
        console.error(error);
    }
}
