import { AssetType } from "./assetTypes";
import { getAssertedValue } from "./envUtils";
import { allOwnedAssetsInfoByAddressesQuery, createAssetByIdQueryEntry, wholeListingData } from "./indexerQueries";


export class IndexerApi {
  private indexerKey: string;
  private indexerUrl: string;
  
  constructor() {
    this.indexerKey = getAssertedValue(process.env.NEXT_PUBLIC_INDEXER_KEY, 'NEXT_PUBLIC_INDEXER_KEY')
    this.indexerUrl = getAssertedValue(process.env.NEXT_PUBLIC_INDEXER_URL, 'NEXT_PUBLIC_INDEXER_URL')
  }

  public async allOwnedAssetsInfoByAddresses(
    addresses: Array<string>,
    cursor: number
  ): Promise<Array<AssetType>> {
    const query = allOwnedAssetsInfoByAddressesQuery(addresses, cursor)
    const results = (await this.handleIndexerQuery(query)).data

    const nfts: Array<AssetType> = []

    Object.keys(results).forEach(
      (key) => {
        nfts.push(...results[key].ownedAssets.assetsList)
      }
    )

    return nfts;
  }

  public async getAssetsInfo(
    assets: Array<{ contractAddress: string, tokenId: string } >
  ): Promise<Array<AssetType>> {
    const results = await this.handleIndexerQuery(`query {
        ${assets.map(
          (a, idx) => createAssetByIdQueryEntry(a.contractAddress, a.tokenId, `asset_${idx}`) 
        ).join(',\n')}
      }`
    )

    return Object.values(results.data)
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