
export enum Side {
  Owner = "0",
  NotOwner = "1"
}

export enum ListingTypeType {
  ZILLIQA_FIXED_PRICE = "ZILLIQA_FIXED_PRICE",
  ZILLIQA_ENGLISH_AUCTION = "ZILLIQA_ENGLISH_AUCTION"
}

export type ZilliqaFixedPriceOrderV1 = {
  maker: string
  unit: string
  amount: number
  currency: string
  expirationInBlockNumber: string
}

export type ZilliqaFixedPriceBuyOrderV1 = ZilliqaFixedPriceOrderV1
export type ZilliqaFixedPriceSellOrderV1 = ZilliqaFixedPriceOrderV1

export type ZilliqaEnglishAuctionStartingBidV1 = {
  unit: string
  amount: number
  currency: string
}

export type ZilliqaEnglishAuctionBidV1 = {
  maker: string
  unit: string
  amount: number
  dest: string
}

export type ZilliqaFixedPriceListingV1 = {
  ownerOffers: Array<ZilliqaFixedPriceBuyOrderV1>
  othersOffers: Array<ZilliqaFixedPriceSellOrderV1>
  marketplaceContractAddress: string
}

export enum EnglishAuctionState {
  Started = 'Started',
  Cancelled = 'Cancelled',
  Ended = 'Ended',
}

export type ZilliqaEnglishAuctionV1 = {
  startingBid: ZilliqaEnglishAuctionStartingBidV1
  bids: Array<ZilliqaEnglishAuctionBidV1>
  state: EnglishAuctionState,
  winnerBid: ZilliqaEnglishAuctionBidV1 | undefined,
  expirationInBlockNumber: string
  maker: string
  marketplaceContractAddress: string
}

export type FulfilledZilliqaFixedPriceListingV1 = {
  id: number
  listingType: ListingTypeType.ZILLIQA_FIXED_PRICE
  marketplaceContractAddress: string
  amount: number
  buyer: string
  currency: string
  seller: string
  side: Side,
  unit: string
}

export type FulfilledZilliqaEnglishAuctionV1 = {
  id: number
  listingType: ListingTypeType.ZILLIQA_ENGLISH_AUCTION
  marketplaceContractAddress: string
  amount: number
  buyer: string
  currency: string
  seller: string
  unit: string
  assetRecipient: string
  paymentTokensRecipient: string
  royaltyRecipient: string
}

export type FulfilledOrders = Array<FulfilledZilliqaFixedPriceListingV1 | FulfilledZilliqaEnglishAuctionV1>

export type SourceListingDataDataV1 = {
  ZILLIQA_FIXED_PRICE: ZilliqaFixedPriceListingV1 | undefined
  ZILLIQA_ENGLISH_AUCTION: ZilliqaEnglishAuctionV1 | undefined
  fulfilled: FulfilledOrders
}

export type ListingType = {
  sourceId: string;
  data: SourceListingDataDataV1;
};

export type AssetAttributeType = {
  traitType: string;
  value: string;
};

export type AssetType = {
  name: string;
  description?: string;
  contractAddress: string;
  tokenId: string;
  tokenUri?: string;
  externalUrl: string;
  resourceMimetype: string;
  minterAddress: string;
  ownerAddress: string;
  attributes: AssetAttributeType[];
  listingData: ListingType[];
  marketplaceContractAddress?: string;
  status?: 'Hot'| 'New';
};