import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets"
import { useMemo } from "react"

export const WalletConnectProvider = ({children}) => {
    const network = WalletAdapterNetwork.Testnet

    const endpoint = useMemo(() => {
        if(network === WalletAdapterNetwork.Devnet){
            return 'https://api.devnet.solana.com'
        }

        return 'http://127.0.0.1:8899'
    }, [network])

    const wallet = useMemo(() => [new PhantomWalletAdapter()], [network])
    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallet} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}