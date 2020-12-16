declare module "@smontero/eosio-local-provider" {
  export class EOSIOProvider {
    constructor(params: any)
    getChainId(): Promise<string>;
  }
}
