import { PlusIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { useMemo } from 'react'

import useStatus from '../hooks/use-status'
import { Grant } from '../utils/schemas/v1/grant'
import { permalink2Id } from '../utils/permalink'
import { GrantPhase, getGrantPhase } from '../utils/phase'
import { formatDurationMs } from '../utils/time'
import useNow from '../hooks/use-now'
import Tooltip from './basic/tooltip'
import Button from './basic/button'

export default function GrantProposalCreateButton(props: {
  communityId?: string
  grant?: Grant & { permalink: string }
  className?: string
}) {
  const now = useNow()
  const { data: status } = useStatus(props.grant?.permalink)
  const phase = useMemo(
    () => getGrantPhase(now, status?.timestamp, props.grant?.duration),
    [now, props.grant?.duration, status?.timestamp],
  )

  return phase === GrantPhase.CONFIRMING ? (
    <Tooltip
      place="top"
      text="Waiting for grant to be confirmed (in about 5 minutes)">
      <Button 
        disabled 
        icon={PlusIcon} 
        className={props.className}>
        Proposal
      </Button>
    </Tooltip>
  ) : phase === GrantPhase.ANNOUNCING && status?.timestamp && props.grant ? (
    <Tooltip
      place="top"
      text={`Waiting for propose starting (in ${formatDurationMs(
        status.timestamp.getTime() +
          props.grant.duration.announcing * 1000 -
          now.getTime(),
      )})`}>
      <Button
        disabled 
        icon={PlusIcon} 
        className={props.className}>
        Proposal
      </Button>
    </Tooltip>
  ) : props.communityId && props.grant && phase === GrantPhase.PROPOSING ? (
    <Link
      className={props.className}
      href={`/${props.communityId}/grant/${permalink2Id(
        props.grant.permalink,
      )}/create`}>
      <Button 
        icon={PlusIcon}>
        Proposal
      </Button>
    </Link>
  ) : null
}
