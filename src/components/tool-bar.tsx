import dynamic from 'next/dynamic'
import { clsx } from 'clsx'
import Link from 'next/link'

import { isTestnet } from '../utils/constants'

const ConnectButton = dynamic(() => import('./connect-button'), { ssr: false })

const InfoButton = dynamic(() => import('./info-button'), { ssr: false })

export default function ToolBar(props: { className?: string }) {
  return (
    <header
      className={clsx(
        'w-full justify-center border-b border-gray-200 pt-safe',
        props.className,
      )}
    >
      <div className="mx-auto flex h-18 w-full max-w-5xl items-center px-6">
        <Link href="/" className="group flex items-end">
          <h1 className="text-lg font-bold">
            <svg
              width="73"
              height="27"
              viewBox="0 0 73 27"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary-600 group-hover:text-primary-500"
            >
              <path
                d="M28.9838 21.6C27.3038 21.6 25.9338 21.33 24.8738 20.79C23.8138 20.25 23.0638 19.47 22.6238 18.46C22.1838 17.45 22.0438 16.25 22.2038 14.85C22.2537 14.45 22.3137 13.99 22.4037 13.48C22.4937 12.97 22.5737 12.52 22.6637 12.15C22.9837 10.73 23.5438 9.52 24.3538 8.52C25.1637 7.52 26.1838 6.75 27.4338 6.21C28.6738 5.67 30.1038 5.4 31.7238 5.4C33.3638 5.4 34.7137 5.67 35.7738 6.21C36.8338 6.75 37.5938 7.52 38.0638 8.52C38.5338 9.52 38.6937 10.73 38.5337 12.15C38.4937 12.53 38.4238 12.97 38.3338 13.48C38.2438 13.99 38.1637 14.45 38.0737 14.85C37.7537 16.25 37.2037 17.46 36.4237 18.46C35.6437 19.47 34.6338 20.25 33.3937 20.79C32.1537 21.33 30.6838 21.6 28.9838 21.6ZM29.6038 17.94C30.5038 17.94 31.2038 17.67 31.7038 17.13C32.2038 16.59 32.5737 15.78 32.8237 14.7C32.8937 14.4 32.9737 14 33.0537 13.5C33.1338 13 33.1938 12.6 33.2238 12.3C33.3438 11.24 33.2437 10.44 32.9237 9.89C32.6137 9.34 32.0038 9.06 31.1038 9.06C30.2238 9.06 29.5238 9.33 29.0138 9.88C28.5038 10.43 28.1338 11.24 27.9138 12.29C27.8438 12.59 27.7638 12.99 27.6838 13.49C27.6038 13.99 27.5438 14.39 27.5138 14.69C27.3738 15.77 27.4638 16.58 27.7938 17.12C28.1138 17.67 28.7238 17.94 29.6038 17.94Z"
                fill="currentColor"
              />
              <path
                d="M72.0038 5.89C71.8938 5.76 71.7538 5.7 71.5738 5.7H68.2138C67.9538 5.7 67.7438 5.77 67.5938 5.89C67.4437 6.02 67.3138 6.17 67.2038 6.33L62.2137 15.06L60.2438 6.33C60.2338 6.17 60.1738 6.03 60.0638 5.89C59.9538 5.76 59.7737 5.7 59.5137 5.7H49.2938L50.1338 0.75C50.1738 0.53 50.1337 0.35 50.0137 0.21C49.8837 0.07 49.7138 0 49.4938 0H46.0137C45.8137 0 45.6237 0.07 45.4538 0.21C45.2838 0.35 45.1738 0.53 45.1338 0.75L44.3037 5.7H41.9637C41.7437 5.7 41.5437 5.77 41.3737 5.91C41.2038 6.05 41.0938 6.23 41.0537 6.45L40.6437 8.88C40.6037 9.1 40.6538 9.28 40.7738 9.42C40.9038 9.56 41.0737 9.63 41.2938 9.63H43.6338L42.6637 15.39C42.4338 16.77 42.4938 17.9 42.8438 18.77C43.1937 19.64 43.8037 20.28 44.6637 20.69C45.5238 21.1 46.5938 21.3 47.8737 21.3H53.2537C53.2537 21.3 51.9738 17.54 51.8638 17.4C51.7438 17.26 51.5838 17.19 51.3638 17.19H49.0537C48.4338 17.19 48.0238 16.99 47.8338 16.59C47.6438 16.19 47.6037 15.65 47.7137 14.97L48.4237 10.8C48.5337 10.16 49.1437 9.63 49.7837 9.63H52.3638C52.5838 9.63 52.7738 9.56 52.9437 9.42C53.1037 9.28 53.2038 9.1 53.2438 8.88L53.5537 7.07C53.6037 6.78 53.8237 6.52 54.1138 6.41L54.5838 6.24C54.9038 6.12 55.2137 6.26 55.2938 6.56C55.9438 9.15 58.7837 20.35 58.7837 20.35L55.4938 25.99C55.4438 26.07 55.4038 26.14 55.3838 26.21C55.3638 26.28 55.3438 26.34 55.3438 26.38C55.3138 26.56 55.3438 26.71 55.4437 26.83C55.5437 26.95 55.6737 27 55.8537 27H59.1538C59.4137 27 59.6237 26.94 59.7837 26.81C59.9437 26.68 60.0737 26.54 60.1538 26.38L71.9738 6.72C72.0638 6.56 72.1138 6.43 72.1338 6.33C72.1537 6.17 72.1138 6.03 72.0038 5.89Z"
                fill="currentColor"
              />
              <path
                d="M24.1637 0.92C24.1537 1.01 24.1237 1.09 24.0637 1.19L14.6937 20.4C14.5737 20.64 14.4038 20.85 14.1838 21.02C13.9538 21.2 13.6638 21.3 13.3138 21.3H8.72375C8.38375 21.3 8.12375 21.2 7.96375 21.02C7.79375 20.85 7.68375 20.63 7.65375 20.4L6.06375 9.81C5.99375 9.38 5.63375 9.06 5.19375 9.06H1.96375C1.52375 9.06 1.15375 8.74 1.09375 8.31L0.03375 1.19C0.00375 1.09 -0.00625 1.01 0.00375 0.92C0.03375 0.77 0.12375 0.62 0.27375 0.49C0.42375 0.36 0.60375 0.3 0.78375 0.3H4.49375C4.81375 0.3 5.05375 0.39 5.20375 0.57C5.34375 0.75 5.43375 0.91 5.44375 1.08L6.42375 8.3C6.48375 8.74 6.86375 9.06 7.30375 9.06H10.5138C10.9537 9.06 11.3237 9.39 11.3837 9.82L12.0737 14.94L18.6838 1.07C18.7738 0.91 18.9137 0.75 19.1138 0.56C19.3038 0.38 19.5737 0.29 19.8837 0.29H23.6038C23.7838 0.29 23.9237 0.35 24.0338 0.48C24.1538 0.62 24.1938 0.77 24.1637 0.92Z"
                fill="currentColor"
              />
            </svg>
          </h1>
          {isTestnet ? (
            <span className="ml-2 italic text-primary-600 group-hover:text-primary-500">
              Testnet
            </span>
          ) : (
            <span className="ml-2 italic text-primary-600 group-hover:text-primary-500">
              Beta
            </span>
          )}
        </Link>
        <div className="w-0 flex-1" />
        <InfoButton />
        <div className="w-4"></div>
        <ConnectButton />
      </div>
    </header>
  )
}
