import { 
  isConnected, 
  signTransaction,
  requestAccess
} from "@stellar/freighter-api";
import { 
  Horizon, 
  TransactionBuilder, 
  Networks, 
  Operation,
  Asset
} from "stellar-sdk";

const NETWORK_URL = "https://horizon-testnet.stellar.org";
const server = new Horizon.Server(NETWORK_URL);

// Freighter API v6 returns objects, not raw values. These helpers unwrap them safely.

export const checkWalletConnection = async () => {
  try {
    const result = await isConnected();
    // v6: { isConnected: boolean }, v5: boolean
    if (typeof result === 'object' && result !== null) {
      return result.isConnected === true;
    }
    return result === true;
  } catch {
    return false;
  }
};

export const connectWallet = async () => {
  try {
    const connected = await checkWalletConnection();
    if (!connected) {
      throw new Error("Freighter wallet not installed or not connected. Please install the Freighter extension.");
    }

    const result = await requestAccess();

    // v6: { address: string }, v5: string directly
    let publicKey;
    if (typeof result === 'object' && result !== null && result.address) {
      publicKey = result.address;
    } else if (typeof result === 'string') {
      publicKey = result;
    } else {
      throw new Error("Failed to get wallet address from Freighter.");
    }

    if (!publicKey || publicKey.length < 10) {
      throw new Error("Invalid wallet address returned.");
    }

    return publicKey;
  } catch (error) {
    console.error("Wallet connection error:", error);
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
    const account = await server.loadAccount(publicKey);
    const fee = await server.fetchBaseFee();

    // Testnet staking vault address
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

    const signResult = await signTransaction(txXdr, {
      network: 'TESTNET',
      networkPassphrase: Networks.TESTNET,
    });

    // v6: { signedTxXdr: string }, v5: string directly
    let signedTxXdr;
    if (typeof signResult === 'object' && signResult !== null && signResult.signedTxXdr) {
      signedTxXdr = signResult.signedTxXdr;
    } else if (typeof signResult === 'string') {
      signedTxXdr = signResult;
    } else {
      throw new Error("Failed to sign transaction.");
    }

    const signedTx = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
    const response = await server.submitTransaction(signedTx);
    return response;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
};
