import { Transition, Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { clsx } from 'clsx'
import { Fragment, ReactNode, useState } from 'react'
import TextButton from './text-button'

export default function Slide(props: {
  title: string
  trigger: ({ handleOpen }: { handleOpen: () => void }) => ReactNode
  children: ({ handleClose }: { handleClose: () => void }) => ReactNode
  small?: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {props.trigger({ handleOpen: () => setOpen(true) })}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setOpen}>
          <div className="fixed inset-0" />
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel
                    className={clsx(
                      'pointer-events-auto w-screen',
                      props.small ? 'sm:max-w-md' : 'sm:max-w-2xl',
                    )}
                  >
                    <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                      <div className="px-4 pt-safe sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-xl-medium text-strong">
                            {props.title}
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <TextButton
                              onClick={() => setOpen(false)}>
                              <XMarkIcon className="h-6 w-6" />
                            </TextButton>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">
                        {props.children({ handleClose: () => setOpen(false) })}
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
