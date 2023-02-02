import { keyBy, last } from 'lodash-es'
import { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../../src/database'
import { communityWithAuthorSchema } from '../../../src/schemas'

const textDecoder = new TextDecoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const query = req.query as {
    next?: string
  }
  const entries = await database.entry.findMany({
    cursor: query.next ? { did: query.next } : undefined,
    take: 50,
    orderBy: { ts: 'desc' },
  })
  const communities = keyBy(
    await database.community.findMany({
      where: { uri: { in: entries.map(({ community }) => community) } },
    }),
    ({ uri }) => uri,
  )
  res.json({
    data: entries
      .map(({ community }) => communities[community])
      .filter((community) => community)
      .map(({ uri, data }) => {
        try {
          return {
            uri,
            ...communityWithAuthorSchema.parse(
              JSON.parse(textDecoder.decode(data)),
            ),
          }
        } catch {
          return
        }
      })
      .filter((community) => community),
    next: last(entries)?.did,
  })
}