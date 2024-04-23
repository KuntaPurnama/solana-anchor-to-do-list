import Head from 'next/head'
import { WalletConnectProvider } from '../components/WalletConnectProvider.js'
import '@solana/wallet-adapter-react-ui/styles.css'
import "../styles/globals.css"

export default function App({ Component, pageProps }) {
  return (
        <div className={"parentDiv"}>
            <Head>
                <title>Todo App</title>
            </Head>
            <main>
                <WalletConnectProvider>
                    <Component {...pageProps} />
                </WalletConnectProvider>
            </main>
        </div>
  )
}
