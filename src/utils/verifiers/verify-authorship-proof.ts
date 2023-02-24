import { TRPCError } from '@trpc/server'

import { checkDidAuthorshipProof } from '../did'
import { Authorized, Authorship } from '../schemas/authorship'
import { Proof, Proved } from '../schemas/proof'
import { verifyDocument } from '../signature'
import { isTestnet } from '../constants'
import { verifyMessage } from '../sdks/ethers'

export default async function verifyAuthorshipProof<T extends object>(
  document: Proved<Authorized<T>>,
): Promise<{ authorship: Authorship; proof: Proof }> {
  const { proof, ...rest } = document

  if ((rest.authorship.testnet || false) !== isTestnet) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'mainnet testnet mismatch',
    })
  }

  if (!(await verifyDocument(rest, proof, verifyMessage))) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'invalid proof' })
  }

  if (!(await checkDidAuthorshipProof(rest.authorship, proof))) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'invalid authorship' })
  }

  return { authorship: rest.authorship, proof }
}