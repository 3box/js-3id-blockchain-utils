import { AccountID } from 'caip';
import { createWalletFromMnemonic } from '@tendermint/sig';
import cosmos from '../cosmos';

const chainId = 'cosmos:cosmoshub-3';
const did = 'did:3:bafysdfwefwe';
const mnemonic = 'test salon husband push melody usage fine ensure blade deal miss twin';
const localProvider = createWalletFromMnemonic(mnemonic);

const addressToAccountID = (address: string): AccountID => new AccountID(`${address}@${chainId}`);

describe('Blockchain: Cosmos', () => {
  describe('createLink', () => {
    test('create proof for cosmoshub3', async () => {
      const account = addressToAccountID(localProvider.address);
      const proof = await cosmos.createLink(did, account, localProvider, { skipTimestamp: true });
      expect(proof).toMatchSnapshot();
    });
  });

  describe('validateLink', () => {
    test('validate correct proof for cosmoshub3', async () => {
      const account = addressToAccountID(localProvider.address);
      const proof = await cosmos.createLink(did, account, localProvider, { skipTimestamp: true });
      await expect(cosmos.validateLink(proof)).resolves.toEqual(proof);
    });

    test('validate fails for wrong data for cosmoshub3', async () => {
      const account = addressToAccountID(localProvider.address);
      const proof = await cosmos.createLink(did, account, localProvider, { skipTimestamp: true });
      proof.message = 'This should fail!';
      await expect(cosmos.validateLink(proof)).resolves.toEqual(null);
    });
  });

  describe('authenticate', () => {
    test('create proof for cosmoshub3', async () => {
      const account = addressToAccountID(localProvider.address);
      const result = await cosmos.authenticate('msg', account, localProvider);
      expect(result).toMatchSnapshot();
    });
  });

});
