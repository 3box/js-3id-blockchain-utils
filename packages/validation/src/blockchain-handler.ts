import { LinkProof } from "@3id-blockchain-utils/linking";

export interface BlockchainHandler {
  namespace: string;
  validateLink(proof: LinkProof): Promise<LinkProof | null>;
}
