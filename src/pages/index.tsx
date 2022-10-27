import { useEffect, useState } from 'react'
import { logError, logInfo } from '../code/logger';
import { connectZilPay } from '../code/zillpayUtils';
import styles from '../styles/Home.module.css'
import { Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import OwnedNfts from '../components/componentOwnedNfts/componentOwnedNfts';

export type WalletAdress = {
  base16: string
  bech32: string
}

export default function Home() {

  const [zilPay, setZilPay] = useState<any>(undefined);
  const [currentlyConnectedWalletAddress, setCurrentlyConnectedWalletAddress] = useState<WalletAdress | undefined>(undefined);

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


  useEffect(() => {
    if (!zilPay) {
      return
    }

    if (!zilPay.wallet?.defaultAccount) {
      logError('wallet setup', 'no wallet in the ZillPay')
      return
    }

    setCurrentlyConnectedWalletAddress({
      base16: zilPay.wallet?.defaultAccount.base16.toLowerCase(),
      bech32: zilPay.wallet?.defaultAccount.bech32.toLowerCase()
    })

    try {
        zilPay.wallet?.observableAccount().subscribe(() => {
          logInfo(['main page', 'wallet change'], 'ZilPay wallet address changed')
            setCurrentlyConnectedWalletAddress({
              base16: zilPay.wallet?.defaultAccount.base16.toLowerCase(),
              bech32: zilPay.wallet?.defaultAccount.bech32.toLowerCase()
            })
        });
    } catch(error) {
        logError(['wallet setup', 'listening for wallet change'], `${error}`, { wallet: zilPay?.wallet })        
    }
}, [zilPay]);

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
          <Tabs isFitted variant='enclosed'>
            <TabList>
              <Tab>Owned NFTs</Tab>
              <Tab>Put on sale</Tab>
              <Tab>Buy</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <OwnedNfts address={currentlyConnectedWalletAddress.base16} />
              </TabPanel>
              <TabPanel>
                <p>two!</p>
              </TabPanel>
              <TabPanel>
                <p>three!</p>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      ) : <></>}
      

    </div>
  )
}
