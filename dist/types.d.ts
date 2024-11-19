import { SuiChain } from '@mysten/wallet-standard';
export declare const ALL_PERMISSION_TYPES: readonly ["viewAccount", "suggestTransactions"];
type AllPermissionsType = typeof ALL_PERMISSION_TYPES;
export type PermissionType = AllPermissionsType[number];
export type WalletInfo = {
    name?: string;
    logo: string;
};
export type SuiChainType = SuiChain;
export interface AccountInfo {
    address: string;
    publicKey: string;
}
export {};
