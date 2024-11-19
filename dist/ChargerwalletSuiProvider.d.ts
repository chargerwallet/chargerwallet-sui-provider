import type { IInpageProviderConfig } from '@chargerwallet/cross-inpage-provider-core';
import { ProviderSuiBase } from './ProviderSuiBase';
import type { IJsonRpcRequest } from '@chargerwallet/cross-inpage-provider-types';
import { AccountInfo } from './types';
import type { PermissionType } from './types';
import { IdentifierString, SuiSignAndExecuteTransactionBlockInput, SuiSignAndExecuteTransactionBlockOutput, SuiSignMessageInput, SuiSignMessageOutput, SuiSignPersonalMessageInput, SuiSignPersonalMessageOutput, SuiSignTransactionBlockInput, SuiSignTransactionBlockOutput } from '@mysten/wallet-standard';
declare const PROVIDER_EVENTS: {
    readonly connect: "connect";
    readonly disconnect: "disconnect";
    readonly accountChanged: "accountChanged";
    readonly networkChange: "networkChange";
    readonly message_low_level: "message_low_level";
};
type SuiProviderEventsMap = {
    [PROVIDER_EVENTS.connect]: (account: string) => void;
    [PROVIDER_EVENTS.disconnect]: () => void;
    [PROVIDER_EVENTS.accountChanged]: (account: {
        address: string;
        publicKey: string;
    } | null) => void;
    [PROVIDER_EVENTS.networkChange]: (name: string | null) => void;
    [PROVIDER_EVENTS.message_low_level]: (payload: IJsonRpcRequest) => void;
};
type SignAndExecuteTransactionBlockInput = SuiSignAndExecuteTransactionBlockInput & {
    blockSerialize: string;
    walletSerialize: string;
};
type SignTransactionBlockInput = SuiSignTransactionBlockInput & {
    blockSerialize: string;
    walletSerialize: string;
};
type SignMessageInput = SuiSignMessageInput & {
    messageSerialize: string;
    walletSerialize: string;
};
type SignPersonalMessageInput = SuiSignPersonalMessageInput & {
    messageSerialize: string;
    walletSerialize: string;
};
export type SuiRequest = {
    'hasPermissions': (permissions: readonly PermissionType[]) => Promise<boolean>;
    'requestPermissions': (permissions: readonly PermissionType[]) => Promise<boolean>;
    'disconnect': () => Promise<void>;
    'getActiveChain': () => Promise<IdentifierString | undefined>;
    'getAccounts': () => Promise<AccountInfo[]>;
    'signAndExecuteTransactionBlock': (input: SignAndExecuteTransactionBlockInput) => Promise<SuiSignAndExecuteTransactionBlockOutput>;
    'signTransactionBlock': (input: SignTransactionBlockInput) => Promise<SuiSignTransactionBlockOutput>;
    'signMessage': (input: SignMessageInput) => Promise<SuiSignMessageOutput>;
    'signPersonalMessage': (input: SignPersonalMessageInput) => Promise<SuiSignPersonalMessageOutput>;
};
export type PROVIDER_EVENTS_STRINGS = keyof typeof PROVIDER_EVENTS;
export interface IProviderSui {
    hasPermissions(permissions: readonly PermissionType[]): Promise<boolean>;
    requestPermissions(permissions: readonly PermissionType[]): Promise<boolean>;
    /**
     * Disconnect wallet
     */
    disconnect(): Promise<void>;
    /**
     * Connect wallet, and get wallet info
     * @emits `connect` on success
     */
    getAccounts(): Promise<AccountInfo[]>;
}
export type ChargerWalletSuiProviderProps = IInpageProviderConfig & {
    timeout?: number;
};
declare class ProviderSui extends ProviderSuiBase implements IProviderSui {
    protected _account: AccountInfo | null;
    constructor(props: ChargerWalletSuiProviderProps);
    private _registerEvents;
    private _callBridge;
    private _handleConnected;
    private _handleDisconnected;
    isAccountsChanged(account: AccountInfo | undefined): boolean;
    private _handleAccountChange;
    private _network;
    isNetworkChanged(network: string): boolean;
    private _handleNetworkChange;
    hasPermissions(permissions?: readonly PermissionType[]): Promise<boolean>;
    requestPermissions(permissions?: readonly PermissionType[]): Promise<boolean>;
    disconnect(): Promise<void>;
    getAccounts(): Promise<{
        address: string;
        publicKey: string;
    }[]>;
    getActiveChain(): Promise<`${string}:${string}` | undefined>;
    signAndExecuteTransactionBlock(input: SuiSignAndExecuteTransactionBlockInput): Promise<SuiSignAndExecuteTransactionBlockOutput>;
    signTransactionBlock(input: SuiSignTransactionBlockInput): Promise<SuiSignTransactionBlockOutput>;
    signMessage(input: SuiSignMessageInput): Promise<SuiSignMessageOutput>;
    signPersonalMessage(input: SuiSignPersonalMessageInput): Promise<SuiSignPersonalMessageOutput>;
    isConnected(): boolean;
    onNetworkChange(listener: SuiProviderEventsMap['networkChange']): this;
    onAccountChange(listener: SuiProviderEventsMap['accountChanged']): this;
    on<E extends keyof SuiProviderEventsMap>(event: E, listener: SuiProviderEventsMap[E]): this;
    emit<E extends keyof SuiProviderEventsMap>(event: E, ...args: Parameters<SuiProviderEventsMap[E]>): boolean;
}
export { ProviderSui };
