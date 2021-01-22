# Deprecated!
This repo has been deprecated in favour of `@ceramicnetwork/blockchain-utils-linking` and `@ceramicnetwork/blockchain-utils-validation`. See [ceramicnetwork/js-ceramic](https://github.com/ceramicnetwork/js-ceramic) for more information.




# 3id-blockchain-utils

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![CircleCI](https://img.shields.io/circleci/project/github/ceramicnetwork/js-3id-blockchain-utils.svg?style=for-the-badge)](https://circleci.com/gh/ceramicnetwork/js-3id-blockchain-utils)
[![npm](https://img.shields.io/npm/dt/3id-blockchain-utils.svg?style=for-the-badge)](https://www.npmjs.com/package/3id-blockchain-utils)
[![npm](https://img.shields.io/npm/v/3id-blockchain-utils.svg?style=for-the-badge)](https://www.npmjs.com/package/3id-blockchain-utils)
[![Codecov](https://img.shields.io/codecov/c/github/ceramicnetwork/js-3id-blockchain-utils.svg?style=for-the-badge)](https://codecov.io/gh/ceramicnetwork/js-3id-blockchain-utils)

Utility functions for linking blockchain accounts to DID.

## Tabel of Contents

- [Overview](#overview)
  - [Linking](#linking)
  - [Validation](#validation)
- [Install](#install)
- [Usage](#usage)
- [Supported blockchains](#supported-blockchains)
- [Adding support for a blockchain](#adding-support-for-a-blockchain)
- [Test](#test)
- [Maintainers](#maintainers)
- [Licence](#licence)

## Overview

To fully link blockchain account one has to:

- prove ownership of the account via [Linking](#linking)
- [validate](#validation) the link.

Due to asymmetry in dependencies - linking is light weigth, while validation requires quite heavy code - and target use cases,
the package is divided into two: namely `@3id-blockchain-utils/linking` and `@3id-blockchain-utils/validation`.

### Linking

Linking blockchain accounts could mean two things:

1. Provide entropy based on owned blockchain account for Ceramic-managed keys,
2. Prove that you own blockchain account.

There is as well a need to validate the proof from (2).

This boils down to making a signature by a blockchain key. Currently, the keys are managed by a so called provider, be it MetaMask, FilSnap, or something else.
Linking a blockchain account then means requesting a signature from the provider.

To abstract over all bunch of providers, the package introduces a notion of `AuthProvider` (see corresponding interface), that does three things:

- translate blockchain account to form of CAIP AccountID (`AuthProvider.accountId`)
- provide entropy (`AuthProvider.authenticate`),
- provide proof-of-ownership data structure (`AuthProvider.createLink`).

For every blockchain (and provider) supported, there is one class implementing AuthProvider.

### Validation

Validation of a link consists of mainly checking if signature in the link corresponds to the declared blockchain account it belongs to.

## Install

```
$ npm install --save 3id-blockchain-utils
```

## Usage

To create links: import the package into your project, and use appropriate auth provider:

```typescript
import * as linking from "@3id-blockchain-utils/linking";
// const ethereumAddress = '0xdeadbeaf...'
// const did = 'did:3:bafypwg9834gf...'
const authProvider = new linking.ethereum.EthereumAuthProvider(
  ethereumProvider,
  ethereumAddress
);
const proof = await authProvider.createLink(did);
console.log(proof);
```

For 3id authentication, AuthProvider is used too:

```typescript
import * as linking from "@3id-blockchain-utils/linking";
// const ethereumAddress = '0xdeadbeaf...'
const authProvider = new linking.ethereum.EthereumAuthProvider(
  ethereumProvider,
  ethereumAddress
);
const entropy = await authProvider.authenticate("message");
console.log(entropy);
```

To verify link created by `createLink` one has to include validation counterpart. No knowledge of particular provider is necessary:

```typescript
import { validateLink } from "@3id-blockchain-utils/validation";
const proofOrNull = await validateLink(proof);
if (proofOrNull) {
  console.log("Proof is valid", proof);
} else {
  console.log("Proof is invalid");
}
```

## Supported blockchains

Below you can see a table which lists supported blockchains and their provider objects.

| Blockchain | CAIP-2 namespace                                                             | Supported providers                                                                  |
| ---------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Ethereum   | [eip155](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-3.md) | metamask-like ethereum provider                                                      |
| Filecoin   | fil                                                                          | [Filecoin Wallet Provider](https://github.com/openworklabs/filecoin-wallet-provider) |
| EOS        | eosio                                                                        | [EOSIO Provider](https://github.com/sebastianmontero/eosio-local-provider#readme)    |

## Adding support for a blockchain

If you want to add support for a new blockchain to 3ID this is the place to do so. This library uses [CAIP-10](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-10.md) to represent accounts in a blockchain agnostic way. If the blockchain you want to add isn't already part of the [CAIP](https://github.com/ChainAgnostic/CAIPs) standards you shold make sure to add it there.

To begin adding support for a given blockchain add a file with the path: `packages/linking/src/<blockchain-name>.ts`.
This module needs to export class implementing `AuthProvider` interface. Also, the module has to be exported from `packages/linking/src/index.ts`

Then add a file with the path `packages/validation/src/blockchains/<blockchain-name>.ts` It has to export a default constant object with the following properties:

- `namespace` - constant string which contains the [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md) chainId namespace,
- `validateLink` - function that validates the given LinkProof.

Then declare support of your blockchain in handlers record in `packages/validation/src/index.ts`.

Please see `src/blockchains/ethereum.js` for an example of how this is implemented for the `eip155` (ethereum) CAIP-2 namespace.

## Test

Test the code by running:

```
$ npm test
```

## Maintainers

[@oed](https://github.com/oed)

## Licence

Apache-2.0 OR MIT
