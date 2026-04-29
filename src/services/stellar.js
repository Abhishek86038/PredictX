import { 
  Server, 
  TransactionBuilder, 
  Networks, 
  Address, 
  Account,
  scValToNative, 
  xdr 
} from 'stellar-sdk';
import { 
  getPublicKey, 
  signTransaction 
} from '@stellar/freighter-api';

const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;
const server = new Server(RPC_URL);

export const getNetworkDetails = () => ({
  network: NETWORK_PASSPHRASE,
  rpcUrl: RPC_URL
});

export const signAndSubmit = async (txBase64) => {
  try {
    const signedTx = await signTransaction(txBase64, {
      network: 'TESTNET'
    });
    
    const transaction = TransactionBuilder.fromXDR(signedTx, NETWORK_PASSPHRASE);
    const result = await server.sendTransaction(transaction);
    
    if (result.status === 'PENDING') {
      // Wait for completion
      let status = 'PENDING';
      let response;
      while (status === 'PENDING') {
        await new Promise(r => setTimeout(r, 2000));
        response = await server.getTransaction(result.hash);
        status = response.status;
      }
      return response;
    }
    return result;
  } catch (error) {
    console.error('Stellar submission error:', error);
    throw error;
  }
};

export const callContract = async (contractId, method, args = []) => {
  try {
    const publicKey = await getPublicKey();
    const account = await server.getAccount(publicKey);
    
    const contract = new Address(contractId);
    
    const tx = new TransactionBuilder(account, {
      fee: '10000',
      networkPassphrase: NETWORK_PASSPHRASE
    })
    .addOperation(xdr.Operation.body.invokeHostFunction(
      new xdr.InvokeHostFunctionOp({
        hostFunction: xdr.HostFunction.hostFunctionTypeInvokeContract(
          new xdr.InvokeContractArgs({
            contractAddress: contract.toScAddress(),
            functionName: method,
            args: args
          })
        ),
        auth: []
      })
    ))
    .setTimeout(30)
    .build();

    // In a real app, you would simulate first to get fee and auth
    // For MVP, we'll try to sign and submit
    return await signAndSubmit(tx.toXDR());
  } catch (error) {
    console.error(`Error calling ${method}:`, error);
    throw error;
  }
};

export const queryContract = async (contractId, method, args = []) => {
  try {
    const contract = new Address(contractId);
    const result = await server.simulateTransaction(
      new TransactionBuilder(
        new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0'),
        { networkPassphrase: NETWORK_PASSPHRASE }
      )
      .addOperation(xdr.Operation.body.invokeHostFunction(
        new xdr.InvokeHostFunctionOp({
          hostFunction: xdr.HostFunction.hostFunctionTypeInvokeContract(
            new xdr.InvokeContractArgs({
              contractAddress: contract.toScAddress(),
              functionName: method,
              args: args
            })
          ),
          auth: []
        })
      ))
      .build()
    );

    if (result.results && result.results[0]) {
      return scValToNative(xdr.ScVal.fromXDR(result.results[0].xdr, 'base64'));
    }
    return null;
  } catch (error) {
    console.error(`Error querying ${method}:`, error);
    throw error;
  }
};
