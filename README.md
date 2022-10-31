# Description

This repository contains a self enclosed Next.js application meant to be run locally. It shows show how to

* integrate with ZillPay
* put items on sale in batches using Rialto `fixed price sale` Smart Contract
* buy NFTs using Rialto `fixed price sale` smart Contract, including `voucher` generation. `Voucher` is required to limit the number of NFTs available per user
* interact with the `Indexer` using graphQL API to fetch asset details
* render the NFT

The idea is that you should be able to follow the code behind specific UI control to learn how to implement a given feature in your application.

# How to prepare

1. Install the ZillPay browser extension

2. Configure ZillPay extension (this includes importing the private keys if they were provided to you by Rialto team)

3. Install the project dependencies

```bash
npm install
# or
yarn install
```
4. Create a `.env` file in the main directory of this repository. This file should be provided to you by Rialto team.

# How to run

```bash
npm run dev
# or
yarn install
```