import { BlockchainHandler, BlockchainHandlerOpts } from '../blockchain-handler';
import { AccountID } from 'caip';
import { getConsentMessage, LinkProof } from '../utils';
import { signTx, Tx, SignMeta, verifyTx, createAddress } from '@tendermint/sig';
const { base64ToBytes, bytesToBase64, toCanonicalJSONBytes } = require('@tendermint/belt');
import * as uint8arrays from 'uint8arrays';

const namespace = 'cosmos';

const stringHex = (str: string): string => `0x${uint8arrays.toString(uint8arrays.fromString(str), 'base16')}`;

// return data in the cosmos unsigned transaction format
function asTransaction(address: string, message: string): Tx {
  return {
    fee: {
      amount: [{ amount: '0', denom: '' }],
      gas: '0',
    },
    memo: message,
    msg: [
      {
        type: 'cosmos-sdk/MsgSend',
        value: {
          from_address: address,
          to_address: address,
          amount: [{ amount: '0', denom: '0' }],
        },
      },
    ],
  };
}

// generate metadata for signing the transaction
function getMetaData(): SignMeta {
  return {
    account_number: '1',
    chain_id: 'cosmos',
    sequence: '0',
  };
}

async function createLink(did: string, account: AccountID, provider: any, opts: BlockchainHandlerOpts): Promise<LinkProof> {
  const { message, timestamp } = getConsentMessage(did, !opts?.skipTimestamp);
  const linkMessageHex = stringHex(message);
  const res = await signTx(asTransaction(account.address, linkMessageHex), getMetaData(), provider);
  const signature = bytesToBase64(toCanonicalJSONBytes(res));
  const proof: LinkProof = {
    version: 2,
    type: 'eoa',
    message: linkMessageHex,
    signature,
    account: account.toString(),
  };
  if (!opts?.skipTimestamp) proof.timestamp = timestamp;
  return proof;
}

async function authenticate(message: string, account: AccountID, provider: any): Promise<string> {
  const linkMessageHex = stringHex(message);
  const res = await signTx(asTransaction(account.address, linkMessageHex), getMetaData(), provider);
  return bytesToBase64(toCanonicalJSONBytes(res));
}

async function validateLink(proof: LinkProof): Promise<LinkProof | null> {
  const payload = JSON.parse(Buffer.from(base64ToBytes(proof.signature)).toString());
  const message = stringHex(proof.message);
  const signer_address = createAddress(base64ToBytes(payload.signatures[0].pub_key.value));
  const account = new AccountID(proof.account);
  const is_sig_valid = verifyTx(payload, getMetaData());
  if (is_sig_valid && payload.memo === message && signer_address === account.address) {
    return proof;
  } else {
    return null;
  }
}

const Handler: BlockchainHandler = {
  namespace,
  authenticate,
  validateLink,
  createLink,
};

export default Handler;
