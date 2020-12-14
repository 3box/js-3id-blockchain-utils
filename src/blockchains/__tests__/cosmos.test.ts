import { AccountID } from "caip";
import { createWalletFromMnemonic } from '@tendermint/sig';
import {authenticate, createLink, validateLink} from "../cosmos";

const chainId = "cosmoshub-3";

const did = 'did:3:bafysdfwefwe'
const mnemonic = 'test salon husband push melody usage fine ensure blade deal miss twin';
const localProvider = createWalletFromMnemonic(mnemonic);

const addressToAccountID = (address: string): AccountID => new AccountID(`${address}@${chainId}`)

describe('Blockchain: Cosmos', () => {

    describe('createLink', () => {
        expect(true)
    })

})
