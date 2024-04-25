<script setup lang="ts">
import {ref} from 'vue'
import {AminoTypes, SigningStargateClient} from "@cosmjs/stargate";
import {coins, DirectSecp256k1HdWallet} from "@cosmjs/proto-signing";
import {createVestingAminoConverters, getFees} from "./helpers";
import {
  MsgCreateVestingAccount,
  MsgMoveAvailableVesting, MsgSendToVestingAccount,
  MsgSplitVesting
} from "../../ts-client/chain4energy.c4echain.cfevesting/types/c4echain/cfevesting/tx";
import {registry} from "../../ts-client";
import {blockchainConfig} from "../blockchainConfig";
import {TxRaw} from "../../ts-client/cosmos.tx.v1beta1";
import {MsgSend} from "../../ts-client/cosmos.bank.v1beta1/types/cosmos/bank/v1beta1/tx";
import {Keplr} from "@keplr-wallet/types";
import {customAccountParser} from "./custom_account_parser";

enum OperationType {
  split = "split",
  move = "move",
  send = "send",
  createVestingAccount = "create-vesting",
  sendToVestingAccount = "send-to-vesting",
}

const userAddress = ref("")
const amount = ref("")
const loader = ref(false)
const toAddress = ref("")
const operation = ref()
const fromAddress = ref("")
const createVestingAccountStarttime = ref("")
const createVestingAccountEndtime = ref("")
const vestingPoolName = ref("")
const restartVesting = ref(false)

let client: SigningStargateClient

declare global {
  interface Window {
    keplr: Keplr;
  }
}

const connectWithKeplr = async () => {
  // const chainInfo = createKeplrConfig();
  // await window.keplr.experimentalSuggestChain(chainInfo);
  // await window.keplr.enable(chainInfo.chainId);
  // const offlineSigner = window.keplr.getOfflineSignerOnlyAmino(chainInfo.chainId);
  const offlineSigner = await DirectSecp256k1HdWallet.fromMnemonic("cabin gun luggage green fever either engage nest arrow sure record physical palace dutch clap vocal north snack birth exhibit either ancient sniff settle", {prefix: "c4e"})
  const accounts = await offlineSigner.getAccounts();
  userAddress.value = accounts[0].address
  const aminoTypes = new AminoTypes(createVestingAminoConverters())
  client = await SigningStargateClient.connectWithSigner(
      blockchainConfig.rpcUrl,
      offlineSigner,
      {registry, aminoTypes, accountParser: customAccountParser}
  );
}
connectWithKeplr()

const splitVesting = async () => {
  if (confirm("Confirm transaction")) {
    loader.value = true
    try {
      const coinsToSend = coins(amount.value, "uc4e");
      const msgSplitVestsing: MsgSplitVesting = {
        amount: coinsToSend,
        fromAddress: fromAddress.value,
        toAddress: toAddress.value,
      }
      await signAndBroadcast(createEncodedMsgSplitVesting(msgSplitVestsing))
    } catch (e) {
      loader.value = false
      alert("Error: " + e.toString())
    }

  }
}

const sendToVestingAccount = async () => {
  if (confirm("Confirm transaction")) {
    loader.value = true
    try {
      const msgSendToVestingAccount: MsgSendToVestingAccount = {
        owner: fromAddress.value,
        toAddress: toAddress.value,
        amount: amount.value + "",
        vestingPoolName: vestingPoolName.value,
        restartVesting: restartVesting.value,
      }
      console.log(msgSendToVestingAccount)
      await signAndBroadcast(createEncodedMsgSendToVestingAccount(msgSendToVestingAccount))
    } catch (e) {
      loader.value = false
      alert("Error: " + e.toString())
    }
  }
}

const sendCoins = async () => {
  if (confirm("Confirm transaction")) {
    loader.value = true
    try {
      const coinsToSend = coins(amount.value, "uc4e");
      const msgSend: MsgSend = {
        fromAddress: fromAddress.value,
        toAddress: toAddress.value,
        amount: coinsToSend,
      }
      await signAndBroadcast(createEncodedMsgSend(msgSend))
    } catch (e) {
      loader.value = false
      alert("Error: " + e.toString())
    }
  }
}

const createVestingAccount = async () => {
  if (confirm("Confirm transaction")) {
    loader.value = true
    try {
      const coinsToSend = coins(amount.value, "uc4e");
      const msgCreateVestingAccount: MsgCreateVestingAccount = {
        fromAddress: fromAddress.value,
        toAddress: toAddress.value,
        startTime: +createVestingAccountStarttime.value,
        endTime: +createVestingAccountEndtime.value,
        amount: coinsToSend,
      }
      await signAndBroadcast(createEncodedMsgCreateVestingAccount(msgCreateVestingAccount))
    } catch (e) {
      loader.value = false
      alert("Error: " + e.toString())
    }
  }
}

const moveAvailableVesting = async () => {
  if (confirm("Confirm transaction")) {
    loader.value = true
    try {
      const msgMoveAvailableVesting: MsgMoveAvailableVesting = {
        fromAddress: fromAddress.value,
        toAddress: toAddress.value,
      }
      await signAndBroadcast(createEncodedMsgMoveAvailableVesting(msgMoveAvailableVesting))
    } catch (e) {
      loader.value = false
      alert("Error: " + e.toString())
    }
  }
}


const signAndBroadcast = async (encoded: any) => {
  try {
    const {accountNumber, sequence} = await client.getSequence(fromAddress.value);
    const signed = await client.sign(userAddress.value, [encoded], getFees(), "ABC=", {
      sequence,
      accountNumber,
      chainId: blockchainConfig.chainId,
    })
    const txBytes = TxRaw.encode(signed).finish();
    const res = await client.broadcastTx(txBytes, 10000, 10000);
    if (res.code === 0) {
      loader.value = false
      alert("Transaction successful!")
    } else {
      loader.value = false
      alert("Transaction error! Raw error log:" + res.rawLog)
    }
  } catch (e) {
    loader.value = false
    alert("Error: " + e.toString())
  }
}

const createEncodedMsgSplitVesting = (objectToEncode: any) => {
  return {
    typeUrl: "/chain4energy.c4echain.cfevesting.MsgSplitVesting",
    value: objectToEncode,
  };
}

const createEncodedMsgMoveAvailableVesting = (objectToEncode: any) => {
  return {
    typeUrl: "/chain4energy.c4echain.cfevesting.MsgMoveAvailableVesting",
    value: objectToEncode,
  };
}

const createEncodedMsgSend = (objectToEncode: any) => {
  return {
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: objectToEncode,
  };
}

const createEncodedMsgCreateVestingAccount = (objectToEncode: any) => {
  return {
    typeUrl: "/chain4energy.c4echain.cfevesting.MsgCreateVestingAccount",
    value: objectToEncode,
  };
}

const createEncodedMsgSendToVestingAccount = (objectToEncode: any) => {
  return {
    typeUrl: "/chain4energy.c4echain.cfevesting.MsgSendToVestingAccount",
    value: objectToEncode,
  };
}

const chooseOperation = (op: OperationType) => {
  operation.value = op
  toAddress.value = ""
  amount.value = ""
  fromAddress.value = ""
}

</script>

<template>
  <div id="wrapper">
    <div v-if="!loader">
      <div class="wrapper">
        <div v-if="userAddress">
          <h3>User address: {{ userAddress }}</h3>
        </div>
        <div v-if="!userAddress">
          <h2>To split vesting connect with keplr first</h2>
          <button @click="connectWithKeplr()">Connect with keplr</button>
          <!--            TODO: add if needed-->
          <!--            <hr style="border: 1px solid grey; width: 100%"/>-->
          <!--            <h3>Enter mnemonic:</h3>-->
          <!--            <textarea v-model="mnemonic"></textarea>-->
          <!--            <button @click="retrieveKey(); retrieved = true">Connect with mnemonic</button>-->
        </div>

        <div v-if="userAddress">
          <div style="display: flex; gap: 10px">
            <h3>Choose operation</h3>
            <button @click="chooseOperation(OperationType.split)">Split vesting</button>
            <button @click="chooseOperation(OperationType.move)">Move available vesting</button>
            <button @click="chooseOperation(OperationType.send)">Send coins</button>
            <button @click="chooseOperation(OperationType.createVestingAccount)">Create vesting account</button>
            <button @click="chooseOperation(OperationType.sendToVestingAccount)">Send coins to vesting account</button>
          </div>
          <hr style="border: 1px solid grey; width: 100%" v-if="operation"/>
          <div class="centeredDiv" v-if="operation === OperationType.move">
            <h3>Account from</h3>
            <input v-model="fromAddress" type="text"/>
            <h3>To address: </h3>
            <input v-model="toAddress" type="text"/>
            <button @click="moveAvailableVesting()">Move available vesting</button>
          </div>
          <div class="centeredDiv" v-if="operation === OperationType.split">
            <h3>Account from</h3>
            <input v-model="fromAddress" type="text"/>
            <h3>To address: </h3>
            <input v-model="toAddress" type="text"/>
            <h3>Amount to split (uc4e): </h3>
            <input v-model="amount" type="number"/>
            <button @click="splitVesting()">Split vesting</button>
          </div>
          <div class="centeredDiv" v-if="operation === OperationType.send">
            <h3>Account from</h3>
            <input v-model="fromAddress" type="text"/>
            <h3>Send coins to: </h3>
            <input v-model="toAddress" type="text"/>
            <h3>Amount to send (uc4e): </h3>
            <input v-model="amount" type="number"/>
            <button @click="sendCoins()">Send coins</button>
        </div>
          <div class="centeredDiv" v-if="operation === OperationType.createVestingAccount">
            <h3>Account from</h3>
            <input v-model="fromAddress" type="text"/>
            <h3>To address: </h3>
            <input v-model="toAddress" type="text"/>
            <h3>Amount to send (uc4e): </h3>
            <input v-model="amount" type="number"/>
            <h3>Start time (unix timestamp in seconds): </h3>
            <input v-model="createVestingAccountStarttime" type="number" />
            <h3>End time (unix timestamp in seconds): </h3>
            <input v-model="createVestingAccountEndtime" type="number"/>
            <button @click="createVestingAccount()">Create vesting account</button>
          </div>
          <div class="centeredDiv" v-if="operation === OperationType.sendToVestingAccount">
            <h3>Account from</h3>
            <input v-model="fromAddress" type="text"/>
            <h3>To address: </h3>
            <input v-model="toAddress" type="text"/>
            <h3>Amount to send (uc4e): </h3>
            <input v-model="amount" type="number"/>
            <h3>Vesting pool name:</h3>
            <input v-model="vestingPoolName" type="text"/>
            <h3>Restart vesting</h3>
            <input v-model="restartVesting" type="checkbox"/>
            <button @click="sendToVestingAccount()">Send coins to vesting account</button>
          </div>
      </div>
    </div>
    </div>

    <div v-if="loader">
      <h1 style="font-size:45px; text-align: center; padding: 300px 0; margin: 0">Loading...</h1>
    </div>
  </div>
</template>

<style scoped lang="scss">
:root {
  font-family: 'Lato', sans-serif;
}

#wrapper {
  height: 100vh;
  padding-top: 40px;
  background: orange;
}

textarea {
  min-height: 150px;
  border-radius: 10px;
  border: 1px solid;
  padding: 7px;
  font-size: 15px;
  box-shadow: 3px 4px 4px grey;
}

input {
  border-radius: 10px;
  border: 1px solid;
  padding: 7px;
  font-size: 15px;
  box-shadow: 3px 4px 4px grey;
}

.wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  align-content: center;
  align-items: center;
}

.centeredDiv {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
}

.wrapper > div {
  box-shadow: 2px 5px 24px 0px rgba(66, 68, 90, 1);
  margin-top: 10px;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 600px;
  background: white;
}

</style>
