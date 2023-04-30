import useStatus from '../hooks/use-status'
import { Grant } from '../utils/schemas/grant'
import { formatTime } from '../utils/time'
import { DetailList, DetailItem } from './basic/detail'
import GrantPhaseText from './grant-phase-text'

export default function GrantProgress(props: {
  grantPermalink?: string
  phase?: Grant['duration']
}) {
  const { data: status } = useStatus(props.grantPermalink)

  return (
    <DetailList title="Progress">
      <DetailItem title="Current phase" className="overflow-y-visible">
        <GrantPhaseText
          grantPermalink={props.grantPermalink}
          phase={props.phase}
        />
      </DetailItem>
      <DetailItem title="Confirmed at">
        {status?.timestamp ? formatTime(status.timestamp) : '...'}
      </DetailItem>
      <DetailItem title="Proposing start">
        {status?.timestamp && props.phase
          ? formatTime(
              status.timestamp.getTime() + props.phase.announcing * 1000,
            )
          : '...'}
      </DetailItem>
      <DetailItem title="Proposing end">
        {status?.timestamp && props.phase
          ? formatTime(
              status.timestamp.getTime() +
                (props.phase.announcing + props.phase.proposing) * 1000,
            )
          : '...'}
      </DetailItem>
      <DetailItem title="Voting end">
        {status?.timestamp && props.phase
          ? formatTime(
              status.timestamp.getTime() +
                (props.phase.announcing +
                  props.phase.proposing +
                  props.phase.voting) *
                  1000,
            )
          : '...'}
      </DetailItem>
    </DetailList>
  )
}
