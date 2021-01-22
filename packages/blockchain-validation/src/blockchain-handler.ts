import { LinkProof } from "@ceramicnetwork/blockchain-linking";

export interface BlockchainHandler {
  namespace: string;
  validateLink(proof: LinkProof): Promise<LinkProof | null>;
}
