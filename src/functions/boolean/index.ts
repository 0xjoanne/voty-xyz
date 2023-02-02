import { uniq } from 'lodash-es'
import pMap from 'p-map'

import { BooleanSets, BooleanUnit } from '../../schemas'
import { BooleanFunction } from '../types'
import { is_sub_did_of } from './is-sub-did-of'
import { is_did } from './is-did'
import { owns_erc721 } from './owns-erc721'
import { DID, Snapshots } from '../../types'

export const checkBooleanFunctions: {
  [name: string]: BooleanFunction<any[]>
} = {
  is_did,
  is_sub_did_of,
  owns_erc721,
}

export async function checkBoolean(
  data: BooleanSets | BooleanUnit,
  did: DID,
  snapshots: Snapshots,
): Promise<boolean> {
  if ('operator' in data) {
    const results = await pMap(
      data.operands,
      (operand) => checkBoolean(operand, did, snapshots),
      { concurrency: 5 },
    )
    if (data.operator === 'and') {
      return results.every((result) => result)
    } else if (data.operator === 'or') {
      return results.some((result) => result)
    } else if (data.operator === 'not') {
      return !results[0]
    }
    throw new Error(`unsupported operator: ${data.operator}`)
  }
  return checkBooleanFunctions[data.function](...data.arguments).execute(
    did,
    snapshots,
  )
}

export function requiredCoinTypesOfBooleanSets(
  data: BooleanSets | BooleanUnit,
): number[] {
  if ('operator' in data) {
    return uniq(
      Array.from(data.operands).flatMap((operand) =>
        requiredCoinTypesOfBooleanSets(operand),
      ),
    )
  }
  return checkBooleanFunctions[data.function](...data.arguments)
    .requiredCoinTypes
}