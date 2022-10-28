import { Box, Center, Checkbox, Heading, Spinner, Tab, Table, TableCaption, TableContainer, TabList, TabPanel, TabPanels, Tabs, Tbody, Td, Tfoot, Th, Thead, Tr } from "@chakra-ui/react";
import { FC } from "react";
import { getAssertedValue } from "~/code/envUtils";
import { contextContainer } from "~/code/contextContainer";


const PutNftsOnSale: FC = () => {
  const {
    loadingNfts,
    ownedNFTs,
    switchNftSaleSelection,
    nftsSelectedForSale,
	} = contextContainer.useContainer();

  return (<>
    <Box mb={2} bg="lightgray" borderRadius='lg' w='100%' p={4} color='black'>
        <Heading as='h6' size='xs'>
          Fixed price contract details
        </Heading>
        <div>
          Address (base16): { getAssertedValue(process.env.NEXT_PUBLIC_FIXED_PRICE_ADDRESS, 'NEXT_PUBLIC_FIXED_PRICE_ADDRESS')}
        </div>
    </Box>

    <Tabs isFitted variant='enclosed'>
      <TabList>
        <Tab>Select NFTs to put on sale ({nftsSelectedForSale.length})</Tab>
        <Tab>Create sale</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <TableContainer>
            <Table variant='striped'>
              <Thead>
                <Tr>
                  <Th>Select for sale</Th>
                  <Th>Name</Th>
                  <Th>Identifier</Th>
                </Tr>
              </Thead>
              <Tbody>
                { ownedNFTs.map((nft, idx) => (
                  <Tr key={idx}>
                    <Td>
                      <Checkbox
                        onChange={() => switchNftSaleSelection(nft)}
                      ></Checkbox>
                    </Td>
                    <Td>{ nft.name }</Td>
                    <Td>{ nft.contractAddress }:{ nft.tokenId }</Td>
                  </Tr>
                ))}

                {
                  loadingNfts && <Center>
                    <Spinner />
                  </Center>
                }
            </Tbody>
              <Tfoot>
                <Tr>
                  <Th>Name</Th>
                  <Th>Identifier</Th>
                  <Th>Select for sale</Th>
                </Tr>
              </Tfoot>
            </Table>
          </TableContainer>
        </TabPanel>
        <TabPanel>
          <Heading as='h6' size='xs'>
            You selected {nftsSelectedForSale.length} for sale
          </Heading>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </>)

}

export default PutNftsOnSale