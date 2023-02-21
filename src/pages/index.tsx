import { useEffect, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'

import { Grid6, GridItem2 } from '../components/basic/grid'
import LoadingBar from '../components/basic/loading-bar'
import CommunityCard from '../components/community-card'
import { trpc } from '../utils/trpc'

export default function IndexPage() {
  const { data, isLoading, fetchNextPage } =
    trpc.community.list.useInfiniteQuery(
      {},
      { getNextPageParam: ({ next }) => next, refetchOnWindowFocus: false },
    )
  const communities = useMemo(
    () => data?.pages.flatMap(({ data }) => data),
    [data],
  )
  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView) {
      fetchNextPage()
    }
  }, [fetchNextPage, inView])

  return (
    <>
      <LoadingBar loading={isLoading} />
      <Grid6 className="w-full py-6">
        {communities?.map((community) => (
          <GridItem2 key={community.entry.community}>
            <CommunityCard community={community} />
          </GridItem2>
        ))}
      </Grid6>
      <div ref={ref} />
    </>
  )
}
