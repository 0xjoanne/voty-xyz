import React, { useCallback } from 'react'
import MdEditor from 'react-markdown-editor-lite'
import { clsx } from 'clsx'
import { useMutation } from '@tanstack/react-query'

import sleep from '../../utils/sleep'
import MarkdownViewer from './markdown-viewer'
import Notification from './notification'

export default function MarkdownEditor(props: {
  value: string
  onChange(value: string): void
  error?: boolean
  disabled?: boolean
}) {
  const { onChange } = props
  const handleEditorChange = useCallback(
    ({ text }: { text: string }) => {
      onChange(text)
    },
    [onChange],
  )
  const { mutateAsync, isError, error } = useMutation<
    string,
    Error,
    { data: Buffer; type: string }
  >({
    async mutationFn({ data, type }) {
      const response = await fetch('/api/upload-buffer', {
        method: 'POST',
        body: data,
        headers: { 'Content-Type': type },
      })
      if (!response.ok) {
        throw new Error('Image upload failed')
      }
      return response.text()
    },
  })
  const handleImageUpload = useCallback(
    async (file: File) => {
      const key = await mutateAsync({
        data: Buffer.from(await file.arrayBuffer()),
        type: file.type,
      })
      await sleep(500)
      return key
    },
    [mutateAsync],
  )

  return (
    <>
      <Notification type="error" show={isError}>
        {error?.message}
      </Notification>
      
      <MdEditor
        value={props.value}
        onChange={handleEditorChange}
        readOnly={props.disabled}
        renderHTML={(text) => <MarkdownViewer preview>{text}</MarkdownViewer>}
        shortcuts={true}
        plugins={[
          'header',
          'font-bold',
          'font-italic',
          'font-underline',
          'font-strikethrough',
          'list-unordered',
          'list-ordered',
          'block-quote',
          'block-wrap',
          'block-code-inline',
          'block-code-block',
          'table',
          'image',
          'link',
          'logger',
          'mode-toggle',
          'full-screen',
          'tab-insert',
        ]}
        allowPasteImage
        imageAccept=".jpg,.png,.svg,.gif"
        onImageUpload={handleImageUpload}
        style={{ height: 600 }}
        htmlClass="prose"
        markdownClass={
          'focus:ring-0 placeholder:text-subtle read-only:cursor-not-allowed read-only:bg-subtle read-only:text-subtle sm:text-sm'
        }
        className={clsx(
          'block w-full overflow-hidden rounded-xl border',
          props.disabled ? 'pointer-events-none' : undefined,
          props.error ? 'border-red-300' : 'border-base',
        )}
        placeholder="Markdown is supported"
      />
    </>
  )
}
