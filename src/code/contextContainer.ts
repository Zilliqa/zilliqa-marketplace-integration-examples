import { useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import { AssetType } from "./assetTypes"
import { IndexerApi } from "./indexerApi"
import useSWR from "swr";
import { logError, logInfo } from "./logger";
import { AssetIdentifier, getAssetIdentifier } from "./assetIdentifier";
import { getAssertedValue } from "./envUtils";
import { useDisclosure } from "@chakra-ui/react";
import { ContractAssetSaleData, FixedPriceContractApi } from "./fixedPriceContractApi";
import { allOwnedAssetsInfoByAddress_ItemsPerCursor } from "./indexerQueries";

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
  const [ nftsSelectedForSale, setNftsSelectedForSale ] = useState<Array<AssetIdentifier>>([])

  const [ contractAssetSaleData, setContractAssetSaleData ] = useState<Array<ContractAssetSaleData>>([])
  const [ assetSaleData, setAssetSaleData ] = useState<Array<ContractAssetSaleData & AssetType>>([])

  const fixedPriceContractAddress = getAssertedValue(process.env.NEXT_PUBLIC_FIXED_PRICE_ADDRESS, 'NEXT_PUBLIC_FIXED_PRICE_ADDRESS')
  const indexerApi = new IndexerApi()

  // transactions modal
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [ modalBody, setModalBody ] = useState<string>("")
  const [ transactionInProgress, setTransactionInProgress ] = useState<boolean>(false)
  const [ transactionError, setTransactionError ] = useState<boolean>(false)

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

          if (fetchedNfts.length >= allOwnedAssetsInfoByAddress_ItemsPerCursor) {
            setNftLoadingCursor((cursor) => cursor + allOwnedAssetsInfoByAddress_ItemsPerCursor)              
          } else {
            setLoadingNfts(false)
          }
        }
      )
    },
    { revalidateOnFocus: false }
  );

  /**
   * Wallet connection state handlers
   */

  // reset state when address changed
  useEffect(() => {
    logInfo('wallet connection', 'resseting wallet related state')
    setOwnedNfts([])
    setNftsSelectedForSale([])
    setNftLoadingCursor(0)
  }, [ currentlyConnectedWalletAddress ])


  const walletChangeDetected = (currentWallet: WalletAdress) => {
    const afterChangeWallet: WalletAdress = {
      base16: zilPay.wallet?.defaultAccount.base16.toLowerCase(),
      bech32: zilPay.wallet?.defaultAccount.bech32.toLowerCase()
    }

    if (currentWallet?.base16 === afterChangeWallet.base16) {
      logInfo(['wallet connection', 'wallet change'], 'false wallet change trigger')
      return
    }
    
    logInfo(['wallet connection', 'wallet change'], 'ZilPay wallet address changed', {
      from: currentWallet?.base16,
      to: afterChangeWallet.base16,
    })
    setCurrentlyConnectedWalletAddress({
      base16: zilPay.wallet?.defaultAccount.base16.toLowerCase(),
      bech32: zilPay.wallet?.defaultAccount.bech32.toLowerCase()
    })
  }

  useEffect(() => {
    if (!zilPay) {
      return
    }

    if (!zilPay.wallet?.defaultAccount) {
      logError('wallet connection', 'no wallet in the ZillPay')
      return
    }

    const newWallet: WalletAdress = {
      base16: zilPay.wallet?.defaultAccount.base16.toLowerCase(),
      bech32: zilPay.wallet?.defaultAccount.bech32.toLowerCase()
    }

    setCurrentlyConnectedWalletAddress(newWallet)

    try {
        zilPay.wallet?.observableAccount().subscribe(() => walletChangeDetected(newWallet));
    } catch(error) {
        logError(['wallet connection', 'listening for wallet change'], `${error}`, { wallet: zilPay?.wallet })        
    }
  }, [zilPay]);

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

  /**
   * Getting NFT on sale in given sale smart contract
   */
   useSWR(
    ["swr_fetch_items_on_sale", zilPay],
    async (_, zilPay) => {
      logInfo(['Items on sale', 'contract data'], 'fetching', { fixedPriceContractAddress })
      const fixedPriceApi = new FixedPriceContractApi(zilPay, fixedPriceContractAddress)

      setContractAssetSaleData(await fixedPriceApi.getAssetsOnSale())
    },
    { revalidateOnFocus: false }
  );

  useSWR(
    ["swr_indexer_data_about_items_on_sale", contractAssetSaleData],
    async (_, contractAssetSaleData) => {
      if (contractAssetSaleData.length === 0) {
        return
      }

      logInfo(['Items on sale', 'indexer data'], 'fetching', { count: contractAssetSaleData.length })
      const detailedAssets = await indexerApi.getAssetsInfo(contractAssetSaleData.map(
        (cas) => ({
          contractAddress: cas.assetContract,
          tokenId: cas.assetId
        }
      )))

      const merged = contractAssetSaleData.map(
        (cas) => ({
          ...cas,
          ...detailedAssets.find(
            (da) => da.contractAddress === cas.assetContract
              && da.tokenId === cas.assetId
          )!
        })
      )

      setAssetSaleData(merged)
    },
    { revalidateOnFocus: false }
  );

  return {
    zilPay, setZilPay,
    currentlyConnectedWalletAddress, setCurrentlyConnectedWalletAddress,
    loadingNfts, setLoadingNfts,
    ownedNFTs, setOwnedNfts,
    nftLoadingCursor, setNftLoadingCursor,
    nftsSelectedForSale, setNftsSelectedForSale,
    fixedPriceContractAddress,
    indexerApi,
    switchNftSaleSelection,
    isOpen, onOpen, onClose,
    modalBody, setModalBody,
    transactionInProgress, setTransactionInProgress,
    transactionError, setTransactionError,
    contractAssetSaleData, setContractAssetSaleData,
    assetSaleData, setAssetSaleData,
  }
}

export const contextContainer = createContainer(useCreateAssetContext);