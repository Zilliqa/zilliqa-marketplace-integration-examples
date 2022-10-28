import { FC } from "react"
import { SimpleGrid, Box, Image, Center, Spinner } from '@chakra-ui/react'
import ReactPlayer from 'react-player';
import { contextContainer } from "~/code/contextContainer";


const OwnedNfts: FC = () => {

  const {
    loadingNfts,
    ownedNFTs
	} = contextContainer.useContainer();

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