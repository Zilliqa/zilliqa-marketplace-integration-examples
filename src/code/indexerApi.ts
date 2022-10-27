import { AssetType } from "./assetTypes";
import { getAssertedValue } from "./envUtils";

export const wholeListingData = `{
  sourceId
  data {
    ZILLIQA_FIXED_PRICE {
      othersOffers {
        maker
        unit
        amount
        currency
        expirationInBlockNumber
      }
      ownerOffers {
        maker
        unit
        amount
        currency
        expirationInBlockNumber
      }
      marketplaceContractAddress
    }
    ZILLIQA_ENGLISH_AUCTION {
      startingBid {
        unit
        amount
        currency
      }
      winnerBid {
        maker
        unit
        amount
      }
      bids {
        maker
        unit
        amount
        dest
      }
      state
      maker
      marketplaceContractAddress
      expirationInBlockNumber
    }
    fulfilled {
      __typename
      ... on FulfilledZilliqaEnglishAuctionV1 {
        id
        marketplaceContractAddress
        amount
        buyer
        currency
        seller
        unit
        assetRecipient
        paymentTokensRecipient
        royaltyRecipient
      }
      ... on FulfilledZilliqaFixedPriceListingV1 {
        id
        marketplaceContractAddress
        amount
        buyer
        currency
        seller
        side
        unit
      }
    }
  }
}`

export class IndexerApi {
  private indexerKey: string;
  private indexerUrl: string;
  
  constructor() {
    this.indexerKey = getAssertedValue(process.env.NEXT_PUBLIC_INDEXER_KEY, 'NEXT_PUBLIC_INDEXER_KEY')
    this.indexerUrl = getAssertedValue(process.env.NEXT_PUBLIC_INDEXER_URL, 'NEXT_PUBLIC_INDEXER_URL')
  }

  public static allOwnedAssetsInfoByAddress_ItemsPerCursor = 20
  public async allOwnedAssetsInfoByAddresses(
    addresses: Array<string>,
    cursor: number
  ): Promise<Array<AssetType>> {
    const query = `query {
      ${
        addresses.map(
          (address, idx) => `
            user${idx}: user(input: { address: "${address}" }) {
              address
              ownedAssets(
                input: {
                  restrictBy: {
                    type: SOURCE, id: "${process.env.NEXT_PUBLIC_MARKETPLACE_SOURCEID!}"
                  },
                  filter:{
                    after: "${cursor}",
                    limit: ${IndexerApi.allOwnedAssetsInfoByAddress_ItemsPerCursor}
                  }
                }
              ) {
                assetsList {
                  tokenId
                  tokenUri
                  name
                  resourceMimetype
                  description
                  externalUrl
                  ownerAddress
                  minterAddress
                  contractAddress
                  attributes {
                    traitType
                    value
                  }
                  listingData ${wholeListingData}
                }
              }
            }
          `
        ).join(',')
      }
    }`


    const results = (await this.handleIndexerQuery(query)).data

    const nfts: Array<AssetType> = []

    Object.keys(results).forEach(
      (key) => {
        nfts.push(...results[key].ownedAssets.assetsList)
      }
    )

    return nfts;
  }

  private async handleIndexerQuery(
    graphQlQuery: string
  ) {  
      const response = await fetch(this.indexerUrl, {
          method: "POST",
          headers: {
              Authorization: `Bearer ${this.indexerKey}`,
              "content-type": "application/json",
          },
          body: JSON.stringify({
              query: graphQlQuery,
          })
      });
      
      return await response.json();
  }
}