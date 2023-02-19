import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { BoltIcon } from '@heroicons/react/20/solid'
import type { inferRouterOutputs } from '@trpc/server'

import { calculateNumber } from '../utils/functions/number'
import { Vote, voteSchema } from '../utils/schemas/vote'
import {
  checkChoice,
  choiceIsEmpty,
  powerOfChoice,
  updateChoice,
} from '../utils/voting'
import { trpc } from '../utils/trpc'
import { ChoiceRouter } from '../server/routers/choice'
import useStatus from '../hooks/use-status'
import { getPeriod, Period } from '../utils/duration'
import { Proposal } from '../utils/schemas/proposal'
import { Workgroup } from '../utils/schemas/workgroup'

const VoterSelect = dynamic(() => import('./voter-select'), {
  ssr: false,
})

const SigningVoteButton = dynamic(
  () => import('./signing/signing-vote-button'),
  { ssr: false },
)

export default function VoteForm(props: {
  proposal: Proposal & { permalink: string; votes: number }
  workgroup: Workgroup
  onSuccess: () => void
}) {
  const { proposal, workgroup, onSuccess } = props
  const { data: choices, refetch: refetchChoices } =
    trpc.choice.groupByProposal.useQuery(
      { proposal: proposal.permalink },
      { enabled: !!proposal.permalink },
    )
  const [did, setDid] = useState('')
  const methods = useForm<Vote>({
    resolver: zodResolver(voteSchema),
  })
  const { setValue, resetField, control, watch } = methods
  useEffect(() => {
    if (proposal.permalink) {
      setValue('proposal', proposal.permalink)
    }
  }, [proposal.permalink, setValue])
  const { data: votingPower, isFetching } = useQuery(
    ['votingPower', workgroup, did, proposal],
    () =>
      calculateNumber(workgroup!.permission.voting, did!, proposal!.snapshots),
    { enabled: !!workgroup && !!did && !!proposal },
  )
  useEffect(() => {
    if (votingPower === undefined) {
      resetField('power')
    } else {
      setValue('power', votingPower)
    }
  }, [resetField, setValue, votingPower])
  const handleSuccess = useCallback(() => {
    onSuccess()
    refetchChoices()
    setValue('choice', '')
    setDid('')
  }, [onSuccess, refetchChoices, setValue])
  const { data: status } = useStatus(proposal.permalink)
  const disabled = useMemo(
    () =>
      !status?.timestamp ||
      !workgroup?.duration ||
      getPeriod(Date.now() / 1000, status.timestamp, workgroup.duration) !==
        Period.VOTING,
    [status?.timestamp, workgroup?.duration],
  )

  return proposal && workgroup ? (
    <>
      <ul
        role="list"
        className="mt-6 divide-y divide-gray-200 rounded-md border border-gray-200"
      >
        <Controller
          control={control}
          name="choice"
          render={({ field: { value, onChange } }) => (
            <>
              {proposal.options.map((option) => (
                <Option
                  key={option}
                  type={proposal.voting_type}
                  option={option}
                  votingPower={votingPower}
                  choices={choices}
                  disabled={disabled || !did}
                  value={value}
                  onChange={onChange}
                />
              ))}
            </>
          )}
        />
      </ul>
      <div className="flex items-center justify-between py-6">
        <h2 className="text-2xl font-bold">
          {proposal.votes
            ? proposal.votes === 1
              ? '1 Vote'
              : `${proposal.votes} Votes`
            : null}
        </h2>
        {disabled ? null : (
          <div className="flex rounded-md">
            <VoterSelect
              proposal={proposal.permalink}
              workgroup={workgroup}
              snapshots={proposal.snapshots}
              value={did}
              onChange={setDid}
              className="rounded-r-none focus:z-10 active:z-10"
            />
            <FormProvider {...methods}>
              <SigningVoteButton
                did={did}
                icon={BoltIcon}
                onSuccess={handleSuccess}
                disabled={
                  choiceIsEmpty(proposal.voting_type, watch('choice')) ||
                  !votingPower ||
                  isFetching ||
                  !did
                }
                className="rounded-l-none border-l-0 focus:z-10 active:z-10"
              >
                Vote{votingPower ? ` (${votingPower})` : null}
              </SigningVoteButton>
            </FormProvider>
          </div>
        )}
      </div>
    </>
  ) : null
}

function Option(props: {
  type: 'single' | 'multiple'
  option: string
  votingPower?: number
  choices?: inferRouterOutputs<ChoiceRouter>['groupByProposal']
  disabled?: boolean
  value: string
  onChange(value: string): void
}) {
  const { type, option, votingPower = 0, choices, value, onChange } = props
  const percentage = useMemo(() => {
    const power = powerOfChoice(type, value, votingPower)[option] || 0
    const denominator =
      (choices?.total || 0) + (choiceIsEmpty(type, value) ? 0 : votingPower)
    if (denominator === 0) {
      return 0
    }
    return (((choices?.powers[option] || 0) + power) / denominator) * 100
  }, [option, choices?.powers, choices?.total, type, value, votingPower])

  return (
    <li
      className="flex items-center justify-between bg-no-repeat py-3 pl-2 pr-4 text-sm"
      style={{
        transition: 'background-size 0.3s ease-out',
        backgroundImage: `linear-gradient(90deg, #f3f4f6 100%, transparent 100%)`,
        backgroundSize: `${percentage}% 100%`,
      }}
      onClick={() => {
        if (!props.disabled) {
          onChange(updateChoice(type, value, option))
        }
      }}
    >
      <span className="ml-2 w-0 flex-1 truncate">{option}</span>
      <span className="text-xs text-gray-500">{percentage.toFixed(2)}%</span>
      <div className="ml-4 shrink-0 leading-none">
        <input
          type={type === 'single' ? 'radio' : 'checkbox'}
          checked={checkChoice(type, value, option)}
          disabled={props.disabled}
          onChange={() => null}
          className={clsx(
            type === 'single' ? undefined : 'rounded',
            'h-4 w-4 border border-gray-300',
            'text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-50',
          )}
        />
      </div>
    </li>
  )
}
