import { AssetType } from "./assetTypes"

export type AssetIdentifier = string

export function getAssetIdentifier(nft: AssetType): AssetIdentifier {
  return `${nft.contractAddress}:${nft.tokenId}`
}

export function getTokenAddress(assetIdentifier: AssetIdentifier): string {
  return assetIdentifier.split(':')[0]
}

export function getTokenId(assetIdentifier: AssetIdentifier): string {
  return assetIdentifier.split(':')[1]
}