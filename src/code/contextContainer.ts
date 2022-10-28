import { useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import { AssetType } from "./assetTypes"
import { IndexerApi } from "./indexerApi"
import useSWR from "swr";
import { logInfo } from "./logger";

export type WalletAdress = {
  base16: string
  bech32: string
}

function getAssetIdentifier(nft: AssetType) {
  return `${nft.contractAddress}:${nft.tokenId}`
}

const useCreateAssetContext = () => {

  const [ zilPay, setZilPay ] = useState<any>(undefined);
  const [ currentlyConnectedWalletAddress, setCurrentlyConnectedWalletAddress ] = useState<WalletAdress | undefined>(undefined);
  const [ loadingNfts, setLoadingNfts ] = useState<boolean>(true) 
  const [ ownedNFTs, setOwnedNfts ] = useState<Array<AssetType>>([])
  const [ nftLoadingCursor, setNftLoadingCursor ] = useState<number>(0)
  const [ nftsSelectedForSale, setNftsSelectedForSale ] = useState<Array<string>>([])

  const indexerApi = new IndexerApi()

  /**
   * Fetching all Owned NFTs
   */
  useSWR(
    ["swr_fetch_owned_nfts", currentlyConnectedWalletAddress, nftLoadingCursor],
    async (_, currentlyConnectedWalletAddress: WalletAdress, cursor: number) => {
      setLoadingNfts(true)
      logInfo('OwnedNFTs', 'fetching NFTs', { currentlyConnectedWalletAddress })
      if (!currentlyConnectedWalletAddress) {
        setLoadingNfts(false)
        return
      }

      await indexerApi.allOwnedAssetsInfoByAddresses([currentlyConnectedWalletAddress.base16], cursor).then(
        (fetchedNfts) => {
          setOwnedNfts((curr) => [...curr, ...fetchedNfts])

          if (fetchedNfts.length >= IndexerApi.allOwnedAssetsInfoByAddress_ItemsPerCursor) {
            setNftLoadingCursor((cursor) => cursor + IndexerApi.allOwnedAssetsInfoByAddress_ItemsPerCursor)              
          } else {
            setLoadingNfts(false)
          }
        }
      )
    },
    { revalidateOnFocus: false }
  );

  /**
   * resetting state when wallet changes
   */
  useEffect(() => {
    setOwnedNfts([])
    setNftLoadingCursor(0)
  }, [ currentlyConnectedWalletAddress ])

  /**
   * removing/adding NFT for sale
   */
  const switchNftSaleSelection = (nft: AssetType) => {
    setNftsSelectedForSale(
      (curr) => {
        const switchedAssetIdentifier = getAssetIdentifier(nft)
        const idx = curr.indexOf(switchedAssetIdentifier)

        if (idx > -1) {
          logInfo('NFT sale', 'removing nft from sale', { switchedAssetIdentifier })
          curr.splice(idx, 1)
          return [...curr]
        } else {
          logInfo('NFT sale', 'adding nft for sale', { switchedAssetIdentifier })
          return [...curr, switchedAssetIdentifier]
        }
      }
    )
  }

  return {
    zilPay, setZilPay,
    currentlyConnectedWalletAddress, setCurrentlyConnectedWalletAddress,
    loadingNfts, setLoadingNfts,
    ownedNFTs, setOwnedNfts,
    nftLoadingCursor, setNftLoadingCursor,
    nftsSelectedForSale, setNftsSelectedForSale,
    indexerApi,
    switchNftSaleSelection,
  }
}

export const contextContainer = createContainer(useCreateAssetContext);