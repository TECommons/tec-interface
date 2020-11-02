import {
  Address,
  DataSourceTemplate,
  TypedMap,
  log,
} from '@graphprotocol/graph-ts'
import { NewAppProxy as NewAppProxyEvent } from '../generated/Kernel/Kernel'
import { loadConvictionConfig, loadVotingConfig } from './helpers'

const DANDELION_VOTING_APP_IDS: string[] = [
  // '0x2d7442e1c4cb7a7013aecc419f938bdfa55ad32d90002fb92ee5969e27b2bf07', // dandelion-voting.aragonpm.eth
  // '0x40a80c4b4050993512df39c802adec62dafeb1f0586cc15f4d34bda9c47ba468',  // gardens-dandelion-voting.open.aragonpm.eth
  '0x82d8d87cd48f4b245d5c8c1c98c5d527dc7b7e166f62471569fb8b1061900644', // dandelion-voting.1hive.aragonpm.eth
  // '0xcb3a8075b5aedae361e3d76cfc928af1dd44a9308cdf86f8f5f6109a8f954420' // dandelion-voting-beta.aragonpm.eth
  // '0xca60629a22f03bcad7738fee1a6f0c5863eb89463621b40566a6799b82cbe184', // disputable-conviction-voting.open.aragonpm.eth
]
const CONIVCTION_VOTING_ADDRESS: Address = Address.fromString(
  '0x57cbe08d6c987dda2148eb9be5ba3bcf96a392fb'
)

function onAppTemplateCreated(
  orgAddress: Address,
  appAddress: Address,
  appId: string
): void {
  if (CONIVCTION_VOTING_ADDRESS.equals(appAddress)) {
    log.info('********* Loading conviction config **********', [])
    loadConvictionConfig(orgAddress, appAddress)
    return
  }

  if (DANDELION_VOTING_APP_IDS.includes(appId)) {
    loadVotingConfig(orgAddress, appAddress)
  }
}

function processApp(
  orgAddress: Address,
  appAddress: Address,
  appId: string
): void {
  let template: string

  if (DANDELION_VOTING_APP_IDS.includes(appId)) {
    template = 'DandelionVoting'
  } else if (CONIVCTION_VOTING_ADDRESS.equals(appAddress)) {
    template = 'ConvictionVoting'
  }

  if (template) {
    DataSourceTemplate.create(template, [appAddress.toHexString()])
    onAppTemplateCreated(orgAddress, appAddress, appId)
  }
}

export function handleNewAppProxy(event: NewAppProxyEvent): void {
  processApp(
    event.address,
    event.params.proxy,
    event.params.appId.toHexString()
  )
}
