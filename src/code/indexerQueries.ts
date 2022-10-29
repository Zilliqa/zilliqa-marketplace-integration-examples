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

export const assetInfoFields = `
  name,
  description,
  externalUrl,
  resourceMimetype,
  minterAddress,
  ownerAddress,
  contractAddress,
  tokenId,
  tokenUri
`;

// should be aligned with Asset type
export const assetFields = `
  ${assetInfoFields},
  attributes {
    traitType,
    value
  }
`

// should be aligned with AssetDetails type
export const assetDetailsFields = `
  ${assetFields},
  listingData ${wholeListingData}
`

export const allOwnedAssetsInfoByAddress_ItemsPerCursor = 20

export function allOwnedAssetsInfoByAddressesQuery(
  addresses: Array<string>,
  cursor: number
): string {
  return `query {
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
                  limit: ${allOwnedAssetsInfoByAddress_ItemsPerCursor}
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
}

export function createAssetByIdQueryEntry(
  contractAddress: string,
  tokenId: string,
  assetName: string
): string {
  return `
    ${assetName}: assetById(input: {
      contractAddress:"${contractAddress}",
      tokenId:"${tokenId}"
    }) {
      ${assetDetailsFields}
    }`
}