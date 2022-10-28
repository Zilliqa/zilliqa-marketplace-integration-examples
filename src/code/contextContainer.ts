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

const useCreateAssetContext = () => {

  const [ zilPay, setZilPay ] = useState<any>(undefined);
  const [ currentlyConnectedWalletAddress, setCurrentlyConnectedWalletAddress ] = useState<WalletAdress | undefined>(undefined);
  const [ loadingNfts, setLoadingNfts ] = useState<boolean>(true) 
  const [ ownedNFTs, setOwnedNfts ] = useState<Array<AssetType>>([])
  const [ nftLoadingCursor, setNftLoadingCursor ] = useState<number>(0)

  const indexerApi = new IndexerApi()

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

  useEffect(() => {
    setOwnedNfts([])
    setNftLoadingCursor(0)
  }, [ currentlyConnectedWalletAddress ])

  return {
    zilPay, setZilPay,
    currentlyConnectedWalletAddress, setCurrentlyConnectedWalletAddress,
    loadingNfts, setLoadingNfts,
    ownedNFTs, setOwnedNfts,
    nftLoadingCursor, setNftLoadingCursor,
    indexerApi,
  }
}

export const contextContainer = createContainer(useCreateAssetContext);