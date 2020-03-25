import React, { useState } from 'react'

import { asset } from './asset'
import { algoAsset, createComputeService, rawAlgoMeta } from './compute-asset'

export default function Compute({ ocean, web3 }) {
  const [ddoAssetId, setDdoAssetId] = useState('')
  const [jobStatus, setJobStatus] = useState('')
  const [jobId, setJobId] = useState('')
  const [agreementId, setAgreementId] = useState('')
  const [ddoAlgorithmId, setDdoAlgorithmId] = useState('')
  const [divAlgoStyle, setdivAlgoStyle] = useState('')
  const [textRawAlgo, setTextRawAlgo] = useState('')
  const [publishLogState, setPublishLogState] = useState('')
  const [publishOutputState, setPublishOutputState] = useState('')
  // publish a dataset and an algorithm
  async function publish() {
    try {
      const accounts = await ocean.accounts.list()
      console.log('Publishing asset.')

      const service = await createComputeService(
        ocean,
        accounts[0],
        '0',
        '2020-03-10T10:00:00Z'
      )
      console.log(service)
      const ddoAssetNew = await ocean.assets.create(asset, accounts[0], [
        service
      ])
      console.log('Asset successfully submitted.')
      console.log(ddoAssetNew)
      // keep track of this registered asset for consumption later on
      setDdoAssetId(ddoAssetNew.id)
      alert('Asset successfully submitted.')
    } catch (error) {
      console.error(error.message)
    }
  }

  async function publishalgo() {
    try {
      const accounts = await ocean.accounts.list()
      console.log('Publishing algo.')

      const ddoAlgorithmNew = await ocean.assets.create(algoAsset, accounts[0])
      console.log(ddoAlgorithmNew)
      console.log('Algo asset successfully submitted.')
      // keep track of this registered asset for consumption later on
      setDdoAlgorithmId(ddoAlgorithmNew.id)
      alert('Algorithm successfully submitted.')
    } catch (error) {
      console.error(error.message)
    }
  }

  async function startCompute(algorithmId, algorithmMeta) {
    try {
      const accounts = await ocean.accounts.list()
      const ComputeOutput = {
        publishAlgorithmLog:
          publishLogState === '' || publishLogState === false ? false : true,
        publishOutput:
          publishOutputState === '' || publishOutputState === false
            ? false
            : true,
        brizoAddress: ocean.config.brizoAddress,
        brizoUri: ocean.config.brizoUri,
        metadataUri: ocean.config.aquariusUri,
        nodeUri: ocean.config.nodeUri,
        owner: accounts[0].getId(),
        secretStoreUri: ocean.config.secretStoreUri
      }
      console.log(ComputeOutput)

      // order the compute service
      const agreement = await ocean.compute.order(accounts[0], ddoAssetId)
      setAgreementId(agreement)
      // start a compute job
      const status = await ocean.compute.start(
        accounts[0],
        agreement,
        algorithmId,
        encodeURIComponent(JSON.stringify(algorithmMeta)),
        ComputeOutput
      )
      setJobId(status.jobId)
      console.log(status)
      alert('Job created.  You can query for status now')
    } catch (error) {
      console.error(error.message)
    }
  }

  // order and start the compute service with an algorithm published as an asset
  async function startWithPublishedAlgo() {
    return startCompute(ddoAlgorithmId)
  }

  // order and start the compute service with a passed raw algorithm
  async function startWithRawAlgo() {
    rawAlgoMeta.rawcode = textRawAlgo
    return startCompute(undefined, rawAlgoMeta)
  }

  async function getStatus() {
    try {
      const accounts = await ocean.accounts.list()

      const status = await ocean.compute.status(accounts[0], agreementId, jobId)
      setJobStatus(JSON.stringify(status, null, '\t'))
      console.log(status)
    } catch (error) {
      console.error(error.message)
    }
  }

  async function showDivAlgo() {
    if (divAlgoStyle === 'none') setdivAlgoStyle('block')
    else setdivAlgoStyle('none')
  }

  async function updateRawAlgoCode(event) {
    setTextRawAlgo(event.target.value)
  }

  async function updateDdoAssetId(event) {
    setDdoAssetId(event.target.value)
  }
  async function handlePublishOutputState(event) {
    setPublishOutputState(event.target.checked)
  }
  async function handlePublishLogState(event) {
    setPublishLogState(event.target.checked)
  }

  if (!web3) {
    return null
  }

  return (
    <>
      <h3>Compute</h3>
      <ComputeSection>
        <button onClick={publish}>Publish dataset with compute service</button>
        Asset DID:
        <input type="text" value={ddoAssetId} onChange={updateDdoAssetId} />
      </ComputeSection>
      <ComputeSection>
        <button onClick={publishalgo}>Publish algorithm</button>
        Algo DID:
        <input type="text" value={ddoAlgorithmId} readOnly />
      </ComputeSection>
      <ComputeSection>
        <input
          type="checkbox"
          checked={publishOutputState}
          onChange={handlePublishOutputState}
        />
        Publish Output into the Marketplace
        <input
          type="checkbox"
          checked={publishLogState}
          onChange={handlePublishLogState}
        />
        Publish Algorithm Logs into the Marketplace
        <button
          onClick={startWithPublishedAlgo}
          disabled={!ddoAssetId || !ddoAlgorithmId}
        >
          Order and start compute service with published algorithm
        </button>
        <button onClick={startWithRawAlgo} disabled={!ddoAssetId}>
          Order and start compute service with raw algorithm
        </button>
        <button onClick={showDivAlgo}>Show/Hide Raw Algo</button>
        <div style={{ display: divAlgoStyle }}>
          <textarea
            rows="10"
            cols="120"
            value={textRawAlgo}
            onChange={updateRawAlgoCode}
          />
        </div>
        Job ID:
        <input type="text" value={jobId} readOnly />
      </ComputeSection>
      <ComputeSection>
        <button onClick={getStatus} disabled={!jobId}>
          Get Job Status
        </button>
        Compute status:
        <textarea rows="15" cols="120" value={jobStatus} readOnly />
      </ComputeSection>
    </>
  )
}

function ComputeSection({ children }) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {children}
      </div>
      <hr />
    </>
  )
}
