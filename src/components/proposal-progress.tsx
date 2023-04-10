import useStatus from '../hooks/use-status'
import { Group } from '../utils/schemas/group'
import { formatTime } from '../utils/time'
import { DetailList, DetailItem } from './basic/detail'
import ProposalPhaseText from './proposal-phase-text'

export default function ProposalProgress(props: {
  proposal?: string
  phase?: Group['duration']
}) {
  const { data: status } = useStatus(props.proposal)

  return (
    <DetailList title="Progress">
      <DetailItem title="Current phase" className="overflow-y-visible">
        <ProposalPhaseText proposal={props.proposal} phase={props.phase} />
      </DetailItem>
      <DetailItem title="Confirmed at">
        {status?.timestamp ? formatTime(status.timestamp) : '...'}
      </DetailItem>
      <DetailItem title="Voting start">
        {status?.timestamp && props.phase
          ? formatTime(status.timestamp.getTime() + props.phase.pending * 1000)
          : '...'}
      </DetailItem>
      <DetailItem title="Voting end">
        {status?.timestamp && props.phase
          ? formatTime(
              status.timestamp.getTime() +
                (props.phase.pending + props.phase.voting) * 1000,
            )
          : '...'}
      </DetailItem>
    </DetailList>
  )
}