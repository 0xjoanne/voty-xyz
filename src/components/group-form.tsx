import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { ArchiveBoxIcon, EyeIcon } from '@heroicons/react/20/solid'
import { useMutation } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { useRouter } from 'next/router'

import { clsx } from 'clsx'
import useSignDocument from '../hooks/use-sign-document'
import { trpc } from '../utils/trpc'
import useIsManager from '../hooks/use-is-manager'
import { Group, groupSchema } from '../utils/schemas/v1/group'
import { previewGroupAtom } from '../utils/atoms'
import { Preview } from '../utils/types'
import DurationInput from './basic/duration-input'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import BooleanSetsBlock from './boolean-sets-block'
import DecimalSetsBlock from './decimal-sets-block'
import { Form, FormFooter, FormSection, FormItem } from './basic/form'
import Button from './basic/button'
import Notification from './basic/notification'

export default function GroupForm(props: {
  communityId: string
  initialValue: Group | null
  onArchive?: () => void
  preview: Preview
  className?: string
}) {
  const { onArchive } = props
  const router = useRouter()
  const { data } = trpc.group.getById.useQuery(
    { communityId: props.communityId, id: props.initialValue?.id },
    { enabled: !!props.communityId && !!props.initialValue?.id },
  )
  const { data: community } = trpc.community.getById.useQuery(
    { id: props.communityId },
    { enabled: !!props.communityId },
  )
  const [previewGroup, setPreviewGroup] = useAtom(previewGroupAtom)
  const group = previewGroup || props.initialValue || data || undefined
  const methods = useForm<Group>({
    resolver: zodResolver(groupSchema),
  })
  const {
    control,
    register,
    reset,
    formState: { errors },
    handleSubmit: onSubmit,
  } = methods
  useEffect(() => {
    reset(group)
  }, [group, reset])
  const isNewGroup = !props.onArchive
  const signDocument = useSignDocument(
    props.communityId,
    `You are archiving workgroup on Voty\n\nhash:\n{keccak256}`,
  )
  const { mutateAsync } = trpc.group.archive.useMutation()
  const handleArchive = useMutation<void, Error, Group>(
    async (group) => {
      const signed = await signDocument(group)
      await mutateAsync(signed)
    },
    { onSuccess: onArchive },
  )
  const isManager = useIsManager(props.communityId)
  const disabled = !isManager

  return (
    <>
      <Notification type="error" show={handleArchive.isError}>
        {handleArchive.error?.message}
      </Notification>
      
      <Form
        title={`${isNewGroup ? 'Create' : 'Edit'} workgroup${
          community?.name ? ` of ${community.name}` : ''
        }`}
        description="Workgroup helps you categorize proposals with different focuses. You can also set up workgroups to your community structure's needs."
        className={props.className}>
        <FormSection 
          title="Basic information">
          <div
            className="grid grid-cols-1 gap-6">
            <FormItem 
              label="Workgroup name" 
              error={errors.name?.message}>
              <TextInput
                {...register('name')}
                placeholder="e.g. Marketing Team"
                error={!!errors.name?.message}
                disabled={disabled}
              />
            </FormItem>
            
            <FormItem
              label="Introduction"
              description="The purpose of this workgroup."
              error={errors?.introduction?.message}>
              <TextInput
                {...register('introduction')}
                error={!!errors?.introduction?.message}
                disabled={disabled}
              />
            </FormItem>
          </div>
        </FormSection>
        
        <FormSection
          title="Proposers"
          description="SubDIDs who can initiate proposals in this workgroup.">
          <FormItem
            error={
              errors.permission?.proposing?.operands?.[0]
                ?.arguments?.[1]?.[0]?.message
            }>
            <FormProvider {...methods}>
              <BooleanSetsBlock
                name="proposing"
                communityId={props.communityId}
                disabled={disabled}
              />
            </FormProvider>
          </FormItem>
        </FormSection>
        
        <FormSection
          title="Voters"
          description="SubDIDs who can vote in this workgroup. You can create multiple voter groups with different voting power assigned to each group. The greatest voting power will be allocated when a SubDID has multiple occurrence.">
          <FormItem 
            error={errors.permission?.voting?.operands?.message}>
            <FormProvider {...methods}>
              <DecimalSetsBlock
                name="voting"
                communityId={props.communityId}
                disabled={disabled}
              />
            </FormProvider>
          </FormItem>
        </FormSection>
        
        <FormSection 
          title="Proposal rules">
          <div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormItem
              label="Announcing phase"
              error={errors.duration?.announcing?.message}>
              <Controller
                control={control}
                name="duration.announcing"
                render={({ field: { ref, value, onChange } }) => (
                  <DurationInput
                    inputRef={ref}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    error={!!errors.duration?.announcing}
                  />
                )}
              />
            </FormItem>

            <FormItem
              label="Voting phase"
              error={errors.duration?.voting?.message}>
              <Controller
                control={control}
                name="duration.voting"
                render={({ field: { ref, value, onChange } }) => (
                  <DurationInput
                    inputRef={ref}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    error={!!errors.duration?.voting}
                  />
                )}
              />
            </FormItem>

            <FormItem
              className="sm:col-span-2"
              label="Criteria for approval"
              error={errors?.criteria_for_approval?.message}>
              <Textarea
                {...register('criteria_for_approval')}
                error={!!errors?.criteria_for_approval?.message}
                disabled={disabled}
              />
            </FormItem>
          </div>
        </FormSection>
        
        {isManager ? (
          <FormFooter
            className={clsx(
              isNewGroup ? '' : 'max-[425px]:justify-center'
            )}>
            <Button
              primary
              size="large"
              icon={EyeIcon}
              onClick={onSubmit((value) => {
                setPreviewGroup({
                  ...value,
                  preview: props.preview,
                })
                router.push(props.preview.to)
              }, console.error)}>
              Preview
            </Button>
            
            {isNewGroup ? null : (
              <Button
                icon={ArchiveBoxIcon}
                loading={handleArchive.isLoading}
                size="large"
                onClick={onSubmit(
                  (value) => handleArchive.mutate(value),
                  console.error,
                )}>
                Archive
              </Button>
            )}
          </FormFooter>
        ) : null}
      </Form>
    </>
  )
}
