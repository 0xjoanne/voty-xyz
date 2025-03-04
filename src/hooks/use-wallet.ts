import { useMemo } from 'react'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useAccount, useDisconnect, useNetwork, useSignMessage } from 'wagmi'

import { chainIdToCoinType, coinTypeToChainId } from '../utils/constants'
import useIsMounted from './use-is-mounted'

export default function useWallet() {
  const isMounted = useIsMounted()
  const account = useAccount()
  const network = useNetwork()
  const { signMessageAsync } = useSignMessage()
  const coinType = useMemo(
    () => (network.chain?.id ? chainIdToCoinType[network.chain.id] : undefined),
    [network.chain?.id],
  )
  const { openConnectModal } = useConnectModal()
  const { disconnect } = useDisconnect()

  return useMemo(
    () => ({
      account:
        isMounted && coinType && account.address
          ? { coinType, address: account.address }
          : undefined,
      displayAddress:
        isMounted && coinType && account.address
          ? `${account.address.substring(0, 5)}...${account.address.substring(
              38,
            )}`
          : undefined,
      signMessage: async (message: string) => {
        if (coinType && coinTypeToChainId[coinType]) {
          const signature = Buffer.from(
            (
              await signMessageAsync({
                message,
              })
            ).substring(2),
            'hex',
          )
          return signature
        }
        throw new Error(`sign message unsupported coin type: ${coinType}`)
      },
      connect: () => (account.address ? null : openConnectModal),
      disconnect: () => disconnect(),
    }),
    [
      isMounted,
      coinType,
      account.address,
      signMessageAsync,
      openConnectModal,
      disconnect,
    ],
  )
}
