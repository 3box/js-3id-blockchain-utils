import { BlockchainHandler, BlockchainHandlerOpts } from '../blockchain-handler';
import { AccountID } from 'caip';
import { getConsentMessage, LinkProof } from '../utils';
import { signTx, Tx, SignMeta, verifyTx } from '@tendermint/sig';
const { base64ToBytes, bytesToBase64, toCanonicalJSONBytes } = require('@tendermint/belt');
import * as uint8arrays from 'uint8arrays';
import { sha256  } from 'js-sha256';

const namespace = 'cosmos';

const stringEncode = (str: string): string => bytesToBase64(uint8arrays.fromString(str));

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
  const encodedMsg = stringEncode(message);
  const res = await signTx(asTransaction(account.address, encodedMsg), getMetaData(), provider);
  const signature = bytesToBase64(toCanonicalJSONBytes(res.signatures[0]));
  const proof: LinkProof = {
    version: 2,
    type: 'eoa',
    message: message,
    signature,
    account: account.toString(),
  };
  if (!opts?.skipTimestamp) proof.timestamp = timestamp;
  return proof;
}

async function authenticate(message: string, account: AccountID, provider: any): Promise<string> {
  const encodedMsg = stringEncode(message);
  const res = await signTx(asTransaction(account.address, encodedMsg), getMetaData(), provider);
  return `0x${sha256(bytesToBase64(toCanonicalJSONBytes(res.signatures[0])))}`
}

async function validateLink(proof: LinkProof): Promise<LinkProof | null> {
  const account = new AccountID(proof.account);
  const encodedMsg = bytesToBase64(uint8arrays.fromString(proof.message));
  const payload = asTransaction(account.address, encodedMsg);
  const sigObj = JSON.parse(Buffer.from(base64ToBytes(proof.signature)).toString());
  const Tx = { ...payload, ...getMetaData(), signatures: [sigObj] };
  const is_sig_valid = verifyTx(Tx, getMetaData());
  return is_sig_valid ? proof : null;
}

const Handler: BlockchainHandler = {
  namespace,
  authenticate,
  validateLink,
  createLink,
};

export default Handler;
