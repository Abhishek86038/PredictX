import { 
  isConnected, 
  signTransaction as signFreighter,
  requestAccess
} from "@stellar/freighter-api";
import albedo from '@albedo-link/intent';
import { 
  Horizon, 
  TransactionBuilder, 
  Networks, 
  Operation,
  Asset
} from "stellar-sdk";

const NETWORK_URL = "https://horizon-testnet.stellar.org";
const server = new Horizon.Server(NETWORK_URL);

let activeWallet = null;

export const checkWalletConnection = async () => {
  try {
    const result = await isConnected();
    if (typeof result === 'object' && result !== null) {
      return result.isConnected === true;
    }
    return result === true;
  } catch {
    return false;
  }
};

export const connectWallet = async (walletName = 'Freighter') => {
  try {
    if (walletName === 'Freighter') {
      const connected = await checkWalletConnection();
      if (!connected) {
        throw new Error("Freighter wallet not installed or not connected. Please install the Freighter extension.");
      }

      const result = await requestAccess();
      let publicKey;
      if (typeof result === 'object' && result !== null && result.address) {
        publicKey = result.address;
      } else if (typeof result === 'string') {
        publicKey = result;
      } else {
        throw new Error("Failed to get wallet address from Freighter.");
      }

      if (!publicKey || publicKey.length < 10) throw new Error("Invalid wallet address returned.");
      activeWallet = 'Freighter';
      return publicKey;

    } else if (walletName === 'Albedo') {
      const res = await albedo.publicKey({});
      if (!res || !res.pubkey) throw new Error("Failed to get wallet address from Albedo.");
      activeWallet = 'Albedo';
      return res.pubkey;

    } else if (walletName === 'Rabet') {
      if (!window.rabet) {
        throw new Error("Rabet wallet not installed. Please install the Rabet extension.");
      }
      const res = await window.rabet.connect();
      if (!res || !res.publicKey) throw new Error("Failed to get wallet address from Rabet.");
      activeWallet = 'Rabet';
      return res.publicKey;
      
    } else {
      throw new Error("Unsupported wallet.");
    }
  } catch (error) {
    console.error(`Wallet connection error (${walletName}):`, error);
    throw error;
  }
};

export const fetchXLMBalance = async (publicKey) => {
  try {
    const account = await server.loadAccount(publicKey);
    const balance = account.balances.find(b => b.asset_type === 'native');
    return balance ? balance.balance : "0";
  } catch (error) {
    console.error("Error fetching balance:", error);
    return "0";
  }
};

export const getStellarAccount = async (publicKey) => {
  try {
    return await server.loadAccount(publicKey);
  } catch (error) {
    console.error("Error loading account:", error);
    return null;
  }
};

export const submitStakingTransaction = async (publicKey, amount) => {
  try {
    if (!activeWallet) throw new Error("No active wallet connected.");

    const account = await server.loadAccount(publicKey);
    const fee = await server.fetchBaseFee();
    const vaultAddress = "GBXSZBSHVQIZGZCTS4RTENBM4Z3FXCRVJWKKWRIDVXKSVD447LDZIQKD";

    const transaction = new TransactionBuilder(account, {
      fee,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: vaultAddress,
          asset: Asset.native(),
          amount: amount.toString(),
        })
      )
      .setTimeout(30)
      .build();

    const txXdr = transaction.toXDR();
    let signedTxXdr;

    if (activeWallet === 'Freighter') {
      const signResult = await signFreighter(txXdr, {
        network: 'TESTNET',
        networkPassphrase: Networks.TESTNET,
      });
      if (typeof signResult === 'object' && signResult !== null && signResult.signedTxXdr) {
        signedTxXdr = signResult.signedTxXdr;
      } else if (typeof signResult === 'string') {
        signedTxXdr = signResult;
      } else {
        throw new Error("Failed to sign transaction with Freighter.");
      }
    } else if (activeWallet === 'Albedo') {
      const res = await albedo.tx({ xdr: txXdr, network: 'testnet' });
      signedTxXdr = res.signed_envelope_xdr;
    } else if (activeWallet === 'Rabet') {
      const res = await window.rabet.sign(txXdr, 'testnet');
      signedTxXdr = res.xdr;
    }

    const signedTx = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
    const response = await server.submitTransaction(signedTx);
    return response;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
};
