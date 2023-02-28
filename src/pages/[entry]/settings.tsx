import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'

import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import CommunityLayout from '../../components/layouts/community'
import useWallet from '../../hooks/use-wallet'
import { trpc } from '../../utils/trpc'
import useDids from '../../hooks/use-dids'
import LoadingBar from '../../components/basic/loading-bar'
import TextButton from '../../components/basic/text-button'

export default function CommunitySettingsPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry']>()
  const { account } = useWallet()
  const {
    data: community,
    isLoading,
    refetch,
  } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry, refetchOnWindowFocus: false },
  )
  const { data: dids } = useDids(account)
  const isAdmin = useMemo(
    () => !!(query.entry && dids?.includes(query.entry)),
    [dids, query.entry],
  )
  const handleSuccess = useCallback(() => {
    refetch()
    router.push(`/${query.entry}`)
  }, [refetch, query.entry, router])

  return (
    <CommunityLayout>
      <LoadingBar loading={isLoading} />
      <TextButton href="/create" className="mt-6">
        <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
      </TextButton>
      {query.entry && community !== undefined ? (
        <div className="flex w-full flex-col">
          <CommunityForm
            entry={query.entry}
            community={community}
            onSuccess={handleSuccess}
            disabled={!isAdmin}
          />
        </div>
      ) : null}
    </CommunityLayout>
  )
}