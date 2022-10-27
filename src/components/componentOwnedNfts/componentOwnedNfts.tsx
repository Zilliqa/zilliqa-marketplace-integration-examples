import { FC, useEffect, useState } from "react"
import { SimpleGrid, Box, Image, Center, Spinner } from '@chakra-ui/react'
import useSWR from "swr";
import ReactPlayer from 'react-player';
import { AssetType } from "../../code/assetTypes"
import { IndexerApi } from "../../code/indexerApi"
import { logInfo } from "../../code/logger"


export type OwnedNftsProps = {
  address: string
}

const OwnedNfts: FC<OwnedNftsProps> = (props) => {

  const {
    address
  } = props

  const [ loadingNfts, setLoadingNfts ] = useState<boolean>(true) 
  const [ currentAddress, setCurrentAddress ] = useState<string>('')
  const [ ownedNFTs, setOwnedNfts ] = useState<Array<AssetType>>([])
  const [ cursor, setCursor ] = useState<number>(0)

  const indexerApi = new IndexerApi()

  useSWR(
      ["swr_fetch_owned_nfts", currentAddress, cursor],
      async (_, address: string, cursor: number) => {
        logInfo('OwnedNFTs', 'fetching NFTs', { address })
        if (address.length === 0) {
          return
        }

        await indexerApi.allOwnedAssetsInfoByAddresses([address], cursor).then(
          (fetchedNfts) => {
            setOwnedNfts((curr) => [...curr, ...fetchedNfts])

            if (fetchedNfts.length >= IndexerApi.allOwnedAssetsInfoByAddress_ItemsPerCursor) {
              setCursor((cursor) => cursor + IndexerApi.allOwnedAssetsInfoByAddress_ItemsPerCursor)              
            } else {
              setLoadingNfts(false)
            }
          }
        )
      },
      { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (address !== currentAddress) {
      setOwnedNfts([])
      setCurrentAddress(address)
      setCursor(0)
      setLoadingNfts(true)
    }
  }, [ address ])

  return (
    <>
      <SimpleGrid columns={2} spacing={10}>
        { ownedNFTs.map((nft, idx) => (
            <Box key={idx} bg='lightGray' borderRadius='md'>
              {
                !nft.resourceMimetype || nft.resourceMimetype.startsWith('image') ? 
                  <Image
                    src={nft.externalUrl}
                    fallbackSrc='https://via.placeholder.com/150'
                    alt={nft.description}
                  />
                :
                  <ReactPlayer
                    url={nft.externalUrl}
                    playing={false}
                    controls={true}
                    loop={true}
                    width='100%'
                    height='auto'
                  />
              }

              <Center mt={1}>
                <div>{nft.name}</div>
              </Center>
              <Center mb={1}>
                <a href={`https://viewblock.io/zilliqa/address/${nft.contractAddress}?network=testnet&tab=state`} target="_blank" rel="noreferrer">
                  {nft.contractAddress}:{nft.tokenId}
                </a>
              </Center>
            </Box>
        )) }
      </SimpleGrid>
      {
        loadingNfts && <Center>
          <Spinner />
        </Center>
      }
    </>
  )
}

export default OwnedNfts