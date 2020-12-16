import { LinkProof } from "@3id-blockchain-utils/linking";
import ethereum from "./blockchains/ethereum";
import filecoin from "./blockchains/filecoin";
import polkadot from "./blockchains/polkadot";
import { AccountID } from "caip";

const handlers = {
  [ethereum.namespace]: ethereum,
  [filecoin.namespace]: filecoin,
  [polkadot.namespace]: polkadot,
  // [eosio.namespace]: eosio
};

const findDID = (did: string): string | undefined =>
  did.match(/(did:(3|muport):[a-zA-Z0-9])\w+/)?.[0];

export async function validateLink(
  proof: LinkProof
): Promise<LinkProof | null> {
  // version < 2 are always eip155 namespace
  let namespace = ethereum.namespace;
  if (proof.version >= 2) {
    namespace = new AccountID(proof.account).chainId.namespace;
  }
  const handler = handlers[namespace];
  if (!handler)
    throw new Error(`proof with namespace '${namespace}' not supported`);
  const validProof = await handler.validateLink(proof);
  if (validProof) {
    validProof.did = findDID(validProof.message);
    return validProof;
  } else {
    return null;
  }
}
