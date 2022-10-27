import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Toaster } from "react-hot-toast";
import { ChakraProvider } from '@chakra-ui/react'

export default function App({ Component, pageProps }: AppProps) {
  return (<>
        <ChakraProvider>
            <Component {...pageProps} />
        </ChakraProvider>
        <Toaster
            toastOptions={{
                style: {
                    fontSize: "0.85em",
                    fontWeight: 400,
                },
                success: {
                    duration: 2500,
                    iconTheme: {
                        primary: "#34d399",
                        secondary: "white",
                    },
                    position: 'top-right'
                },
                error: {
                    duration: 2500,
                    iconTheme: {
                        primary: "#fb7185",
                        secondary: "white",
                    },
                    position: 'top-right'
                },
                loading: {
                    duration: 2500,
                    iconTheme: {
                        primary: "white",
                        secondary: "white",
                    },
                    position: 'top-right'
                },
            }}
        />
    </>)
}
