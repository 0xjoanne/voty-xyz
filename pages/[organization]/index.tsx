import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button, Menu } from 'react-daisyui'
import {
  Earth,
  Twitter,
  RobotOne,
  GithubOne,
  ViewList,
  HoldInterface,
  UserToUserTransmission,
  Info,
  SettingOne,
  NetworkTree,
} from '@icon-park/react'
import AvatarInput from '../../components/avatar-input'
import useArweaveFile from '../../hooks/use-arweave-file'
import useBitRecordValue from '../../hooks/use-bit-record-value'
import { Organization } from '../../src/schemas'

export default function OrganizationIndexPage() {
  const router = useRouter()
  const { data: record } = useBitRecordValue(
    router.query.organization as string | undefined,
    'voty',
  )
  const { data: organization } = useArweaveFile<Organization>(record)

  return (
    <>
      <AvatarInput
        name={organization?.profile.name}
        value={organization?.profile.avatar}
        disabled
      />
      <h1>{organization?.profile.name}</h1>
      <div className="menu bg-base-100 w-56 rounded-box">
        <Menu>
          <Menu.Item>
            <Link
              href={`/${router.query.organization}`}
              className={router.query.workgroup ? undefined : 'active'}
            >
              <NetworkTree />
              Workgroups
            </Link>
          </Menu.Item>
          {organization?.workgroups?.map((workgroup) => (
            <Menu.Item key={workgroup.id} className="ml-6">
              <Link
                href={`/${router.query.organization}?workgroup=${workgroup.id}`}
                className={
                  router.query.workgroup === workgroup.id ? 'active' : undefined
                }
              >
                <AvatarInput
                  size={24}
                  name={workgroup.profile.name}
                  value={workgroup.profile.avatar}
                  disabled
                />
                {workgroup.profile.name}
              </Link>
            </Menu.Item>
          ))}
          <Menu.Item>
            <Link href={`/${router.query.organization}/create`}>
              <HoldInterface />
              New proposal
            </Link>
          </Menu.Item>
          <Menu.Item>
            <Link href={`/delegate/${router.query.organization}`}>
              <UserToUserTransmission />
              Delegate
            </Link>
          </Menu.Item>
          <Menu.Item>
            <Link href={`/${router.query.organization}/about`}>
              <Info />
              About
            </Link>
          </Menu.Item>
          <Menu.Item>
            <Link href={`/${router.query.organization}/settings`}>
              <SettingOne />
              Settings
            </Link>
          </Menu.Item>
        </Menu>
      </div>
      <div>
        {organization?.profile.website ? (
          <Button shape="circle">
            <a href={organization.profile.website}>
              <Earth />
            </a>
          </Button>
        ) : null}
        {organization?.communities?.map((community, index) => (
          <Button key={index} shape="circle">
            <a
              href={`${
                {
                  twitter: 'https://twitter.com',
                  discord: 'https://discord.gg',
                  github: 'https://github.com',
                }[community.type]
              }/${community.value}`}
            >
              {
                {
                  twitter: <Twitter />,
                  discord: <RobotOne />,
                  github: <GithubOne />,
                }[community.type]
              }
            </a>
          </Button>
        ))}
      </div>
    </>
  )
}