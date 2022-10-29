import { useEffect } from 'react'
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'
import { Box, Heading, Tabs, Text, TabList, TabPanels, Tab, TabPanel, Button, Center, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, Icon } from '@chakra-ui/react'
import { logInfo } from '~/code/logger';
import { connectZilPay } from '~/code/zillpayUtils';
import styles from '~/styles/Home.module.css'
import OwnedNfts from '~/components/componentOwnedNfts/componentOwnedNfts';
import PutNftsOnSale from '~/components/componentPutNftsOnSale/componentPutNftsOnSale';
import SetSpender from '~/components/componentSetSpender/componentSetSpender';
import { contextContainer } from '~/code/contextContainer';


export default function Home() {
  const {
    setZilPay,
    currentlyConnectedWalletAddress, setCurrentlyConnectedWalletAddress,
    isOpen, onClose,
    modalBody,
    transactionInProgress,
    transactionError,
	} = contextContainer.useContainer();

  useEffect(() => {
    async function setupZilpay() {
      const extensionZilPayObject = (window as any)?.zilPay

      logInfo(['main page', 'wallet setup'], 'trying to set up zillpay')
      if (extensionZilPayObject) {
          await connectZilPay(extensionZilPayObject)
          setZilPay(extensionZilPayObject);
      } else {
          logInfo(['main page', 'wallet setup'], 'ZilPay extension not detected, next check scheduled')
          setTimeout(setupZilpay, 200)
      }
    }

    setupZilpay()
  }, [])


  return (
    <div className={styles.container}>
      <Box mt={5} mb={5} bg="lightgray" borderRadius='lg' w='100%' p={4} color='black'>
        <Heading>
          Zilliqa Marketplace Integration Examples
        </Heading>
      </Box>

      <Box mb={10} bg="lightgray" borderRadius='lg' w='100%' p={4} color='black'>
        { currentlyConnectedWalletAddress ? (
          <>
            <Heading as='h6' size='xs'>
              Currently connected wallet details
            </Heading>
            <div>
              Wallet address (base16): { currentlyConnectedWalletAddress.base16 }
            </div>
            <div>
              Wallet address (bech32): { currentlyConnectedWalletAddress.bech32 }
            </div>
          </>
        ) : (
          <div>
            ZillPay not connected. Install the extension and follow the instructions
          </div>
        )}
      </Box>

      { currentlyConnectedWalletAddress ? (
        <>
          <Tabs isFitted variant='enclosed' mb={500}>
            <TabList>
              <Tab>Owned NFTs</Tab>
              <Tab>1. Enable sale</Tab>
              <Tab>2. Put on sale</Tab>
              <Tab>3. Purchase</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <OwnedNfts />
              </TabPanel>
              <TabPanel>
                <SetSpender />
              </TabPanel>
              <TabPanel>
                <PutNftsOnSale />
              </TabPanel>
              <TabPanel>
                <p>three!</p>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      ) : <></>}
      
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transaction progress</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
            { modalBody }
            </Text>
            <Center>
              {
                transactionInProgress ? <Spinner />
                : transactionError ? <WarningIcon color="red" boxSize="3em"/>
                : <CheckCircleIcon color="green" boxSize="3em" />
              }
            </Center>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme='blue'
              onClick={onClose}
              disabled={transactionInProgress}
            >
              ok
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </div>
  )
}
