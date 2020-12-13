import {BlockchainHandler, BlockchainHandlerOpts} from "../blockchain-handler";
import {AccountID} from "caip";
import { getConsentMessage, LinkProof} from "../utils";
import * as uint8arrays from 'uint8arrays'

const namespace = 'cosmos'

async function createLink (did: string, account: AccountID, signer: any, opts: BlockchainHandlerOpts): Promise<LinkProof> {
    return
}

// polkadot sr25519 signatures inlcude randomness, need deterministic function to currently implment authentication
async function authenticate(message: string, account: AccountID, signer: any): Promise<string> {
    return
}

async function validateLink (proof: LinkProof): Promise<LinkProof | null> {
    return
}

const Handler: BlockchainHandler = {
    namespace,
    authenticate,
    validateLink,
    createLink
}

export default Handler