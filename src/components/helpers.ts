import {blockchainConfig} from "../blockchainConfig";
import {ChainInfo} from "@keplr-wallet/types";
import {AminoConverters} from "@cosmjs/stargate";
import {
    MsgMoveAvailableVesting,
    MsgSplitVesting
} from "../../ts-client/chain4energy.c4echain.cfevesting/types/c4echain/cfevesting/tx";

export const hexToBytes = (hex): Uint8Array => {
    let bytes = [];
    let c = 0;
    for (; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return new Uint8Array(bytes);
}

export function bytesToHex(byteArray) {
    return Array.from(byteArray, function(byte) {
        // @ts-ignore
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}

export const getFees = () => {
    const convertedFee = [{amount: String(0), denom: "uc4e"}];
    return {gas: String(1000000), amount: convertedFee};
}

export const PRIVATE_KEY = "PRIVATE_KEY"

export const createKeplrConfig = () =>  {
    return {
        chainId: blockchainConfig.chainId,
        chainName: blockchainConfig.chainId,
        rpc: blockchainConfig.rpcUrl,
        rest: blockchainConfig.restUrl,
        bip44: {
            coinType: 118
        },
        bech32blockchainConfig: {
            bech32PrefixAccAddr: blockchainConfig.addressPrefix,
            bech32PrefixAccPub: blockchainConfig.addressPrefix + "pub",
            bech32PrefixValAddr: blockchainConfig.addressPrefix + "valoper",
            bech32PrefixValPub: blockchainConfig.addressPrefix + "valoperpub",
            bech32PrefixConsAddr: blockchainConfig.addressPrefix + "valcons",
            bech32PrefixConsPub: blockchainConfig.addressPrefix + "valconspub"
        },
        stakeCurrency: {
            coinDenom: blockchainConfig.coinDenom,
            coinMinimalDenom: blockchainConfig.coinMinimalDenom,
            coinDecimals: blockchainConfig.coinDecimals
        },
        feeCurrencies: [
            {
                coinDenom: blockchainConfig.coinDenom,
                coinMinimalDenom: blockchainConfig.coinMinimalDenom,
                coinDecimals: blockchainConfig.coinDecimals
            }
        ],
        currencies: [
            {
                coinDenom: blockchainConfig.coinDenom,
                coinMinimalDenom: blockchainConfig.coinMinimalDenom,
                coinDecimals: blockchainConfig.coinDecimals
            }
        ],
        coinType: 118,
        gasPriceStep: blockchainConfig.gasPrices,
        walletUrlForStaking: blockchainConfig.walletUrlForStaking
    } as unknown as ChainInfo;
}
import { AminoMsg } from "@cosmjs/amino";
import {Coin} from "../../ts-client/cosmos.gov.v1/types/cosmos/base/v1beta1/coin";

export interface AminoMsgSplitVesting extends AminoMsg {
    readonly type: "cfevesting/SplitVesting";
    readonly value: {
        /** Bech32 account address */
        readonly from_address: string;
        /** Bech32 account address */
        readonly to_address: string;
        readonly amount: readonly Coin[];
    };
}

export interface AminoMsgMoveAvailableVesting extends AminoMsg {
    readonly type: "cfevesting/MoveAvailableVesting";
    readonly value: {
        /** Bech32 account address */
        readonly from_address: string;
        /** Bech32 account address */
        readonly to_address: string;
    };

}

export function createVestingAminoConverters(): AminoConverters {
    return {
        "/chain4energy.c4echain.cfevesting.MsgSplitVesting": {
            aminoType: "cfevesting/SplitVesting",
            toAmino: ({
                          fromAddress,
                          toAddress,
                          amount,
                      }: MsgSplitVesting): AminoMsgSplitVesting["value"] => ({
                from_address: fromAddress,
                to_address: toAddress,
                amount: [...amount],
            }),
            fromAmino: ({
                            from_address,
                            to_address,
                            amount,
                        }: AminoMsgSplitVesting["value"]): MsgSplitVesting => ({
                fromAddress: from_address,
                toAddress: to_address,
                amount: [...amount],
            }),
        },
        "/chain4energy.c4echain.cfevesting.MsgMoveAvailableVesting": {
            aminoType: "cfevesting/MoveAvailableVesting",
            toAmino: ({
                          fromAddress,
                          toAddress,
                      }: MsgMoveAvailableVesting): AminoMsgMoveAvailableVesting["value"] => ({
                from_address: fromAddress,
                to_address: toAddress,
            }),
            fromAmino: ({
                            from_address,
                            to_address,
                        }: AminoMsgMoveAvailableVesting["value"]): MsgMoveAvailableVesting => ({
                fromAddress: from_address,
                toAddress: to_address,
            }),
        },
    };
}