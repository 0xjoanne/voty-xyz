import { zodResolver } from '@hookform/resolvers/zod'
import pMap from 'p-map'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { EyeIcon } from '@heroicons/react/20/solid'
import { useAtom } from 'jotai'
import { useRouter } from 'next/router'

import {
  GrantProposal,
  grantProposalSchema,
} from '../utils/schemas/v1/grant-proposal'
import useStatus from '../hooks/use-status'
import { Grant } from '../utils/schemas/v1/grant'
import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
import { checkBoolean } from '../utils/functions/boolean'
import { previewGrantProposalAtom } from '../utils/atoms'
import { previewPermalink } from '../utils/constants'
import { permalink2Id } from '../utils/permalink'
import { trpc } from '../utils/trpc'
import Slide from './basic/slide'
import PermissionCard from './permission-card'
import Button from './basic/button'
import DidCombobox from './did-combobox'
import { Form, FormFooter, FormItem, FormSection } from './basic/form'
import TextButton from './basic/text-button'
import MarkdownEditor from './basic/markdown-editor'
import TextInput from './basic/text-input'

export default function GrantProposalForm(props: {
  initialValue: Partial<GrantProposal>
  communityId: string
  grantPermalink: string
  grant: Grant
  className?: string
}) {
  const router = useRouter()
  const [previewGrantProposal, setPreviewGrantProposal] = useAtom(
    previewGrantProposalAtom,
  )
  const grantProposal = previewGrantProposal || props.initialValue
  const methods = useForm<GrantProposal>({
    resolver: zodResolver(grantProposalSchema),
  })
  const {
    control,
    register,
    setValue,
    reset,
    formState: { errors },
    handleSubmit: onSubmit,
  } = methods
  useEffect(() => {
    reset(grantProposal)
    setValue('grant', props.grantPermalink)
  }, [grantProposal, props.grantPermalink, reset, setValue])
  const [did, setDid] = useState('')
  const { account, connect } = useWallet()
  const { data: dids } = useDids(account, props.grant.snapshots)
  const { data: proposed } = trpc.grantProposal.groupByProposer.useQuery(
    { grantPermalink: props.grantPermalink },
    { enabled: !!props.grantPermalink },
  )
  const { data: disables } = useQuery(
    [dids, props.grant],
    async () => {
      const booleans = await pMap(
        dids!,
        (did) =>
          checkBoolean(
            props.grant.permission.proposing,
            did,
            props.grant.snapshots,
          ),
        { concurrency: 5 },
      )
      return dids!.reduce(
        (obj, did, index) => {
          obj[did] = !booleans[index]
          return obj
        },
        {} as { [key: string]: boolean },
      )
    },
    { enabled: !!dids },
  )
  const didOptions = useMemo(
    () =>
      disables
        ? dids
            ?.filter((did) => !disables[did])
            .map((did) => ({ did, disabled: proposed?.[did] }))
        : undefined,
    [dids, disables, proposed],
  )
  const defaultDid = useMemo(
    () => didOptions?.find(({ disabled }) => !disabled)?.did,
    [didOptions],
  )
  useEffect(() => {
    setDid(defaultDid || '')
  }, [defaultDid])

  const { data: status } = useStatus(props.grantPermalink)
  const disabled = useMemo(
    () => !status?.timestamp || !did,
    [did, status?.timestamp],
  )

  return (
    <Form
      title={`New proposal for ${props.grant.name}`}
      className={props.className}>
      <FormSection 
        title="Proposer" 
        description="Author of the proposal.">
        <FormItem>
          <DidCombobox
            top
            options={didOptions}
            value={did}
            onChange={setDid}
            onClick={connect} />
            
          {!defaultDid && props.grant ? (
            <Slide
              title={`Proposers of ${props.grant.name}`}
              trigger={({ handleOpen }) => (
                <TextButton
                  className="ml-2 mt-2"
                  primary
                  onClick={handleOpen}>
                  Why I&#39;m not eligible to propose?
                </TextButton>
              )}>
              {() =>
                props.grant ? (
                  <PermissionCard
                    title="Proposers"
                    description="SubDIDs who can initiate proposals in this grant."
                    value={props.grant.permission.proposing}
                  />
                ) : null
              }
            </Slide>
          ) : null}
        </FormItem>
      </FormSection>
      
      <FormSection
        title="Proposal"
        description="Proposals that include a concise title and detailed content are more likely to capture member's attention.">
        <div
          className="grid grid-cols-1 gap-6">
          <FormItem label="Title" error={errors.title?.message}>
            <TextInput
              {...register('title')}
              disabled={disabled}
              error={!!errors.title?.message}
            />
          </FormItem>
          
          <FormItem 
            label="Content" 
            error={errors?.content?.message}>
            <Controller
              control={control}
              name="content"
              render={({ field: { value, onChange } }) => (
                <MarkdownEditor
                  value={value}
                  onChange={onChange}
                  disabled={disabled}
                  error={!!errors?.content?.message}
                />
              )}
            />
          </FormItem>
        </div>
      </FormSection>
      
      <FormFooter>
        <Button
          primary
          size="large"
          icon={EyeIcon}
          disabled={disabled}
          onClick={onSubmit((value) => {
            setPreviewGrantProposal({
              ...value,
              preview: {
                from: `/${props.communityId}/grant/${permalink2Id(
                  props.grantPermalink,
                )}/create`,
                to: `/grant-proposal/${previewPermalink}`,
                template: `You are creating proposal on Voty\n\nhash:\n{keccak256}`,
                author: did,
                snapshots: props.grant.snapshots,
              },
            })
            router.push(`/grant-proposal/${previewPermalink}`)
          }, console.error)}>
          Preview
        </Button>
      </FormFooter>
    </Form>
  )
}
