import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import Link from 'next/link'

import useRouterQuery from '../hooks/use-router-query'
import { currentDidAtom } from '../utils/atoms'
import { trpc } from '../utils/trpc'
import Avatar from './basic/avatar'

export default function SubscriptionList() {
  const query = useRouterQuery<['entry']>()
  const currentDid = useAtomValue(currentDidAtom)
  const { data } = trpc.subscription.list.useQuery(
    { subscriber: currentDid },
    { enabled: !!currentDid, refetchOnWindowFocus: false },
  )

  return (
    <div className="flex w-full flex-col items-center overflow-y-auto">
      {data?.map((community) => (
        <Link
          key={community.authorship.author}
          href={`/${community.authorship.author}`}
        >
          <Avatar
            size={12}
            name={community.authorship.author}
            value={community.extension?.avatar}
            noRing
            className={clsx(
              'mt-3',
              community.authorship.author === query.entry
                ? 'ring-2 ring-primary-500 ring-offset-2'
                : 'ring-1 ring-gray-200 hover:ring-2 hover:ring-gray-300 hover:ring-offset-2',
            )}
          />
        </Link>
      ))}
    </div>
  )
}
