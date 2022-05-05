import React, { useState, useEffect, useContext } from 'react'
import { useHistory } from 'react-router-dom'

import UIContext from 'Contexts/UIContext'
import { AssetList } from 'Components/Assets/AssetList'
import TablePlaceholder from 'Components/Utils/TablePlaceholder'

import BlockUi from 'Components/Utils/BlockUi'

function Marketplace() {
  const { service, addMessage } = useContext(UIContext)
  const history = useHistory()

  const [user, setUser] = useState<any>([])
  const [assets, setAssets] = useState<any>([])
  const [algorithms, setAlgorithms] = useState<any>([])
  const [isBuyingAsset, setIsBuyingAsset] = useState(false)
  const [isBuyingAlgorithm, setIsBuyingAlgorithm] = useState(false)

  const fetchDataAssets = async () => {
    let result = await service?.doAjax('GET', '/assets?type=data')
    setAssets(result?.data)
  }

  const fetchAlgorithms = async () => {
    let result = await service?.doAjax('GET', '/assets?type=alg')
    setAlgorithms(result?.data)
  }

  const getUserInfo = async () => {
    let result = await service?.doAjax('GET', '/authentications/me')
    setUser(result?.data.me)
  }

  const buy = async (did: any) => {
    let result = await service?.doAjax('PUT', `/assets/${did}`)
    return result
  }

  const buyAsset = async (did: any) => {
    setIsBuyingAsset(true)
    await buy(did)
    fetchDataAssets()
    fetchAlgorithms()
    setIsBuyingAsset(false)

    addMessage({
      text: "Richiesta di accesso eseguita con successo",
      type: 'Asset',
      variant: 'success',
      show: true
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const buyAlgorithm = async (did: any) => {
    setIsBuyingAlgorithm(true)
    await buy(did)
    fetchDataAssets()
    fetchAlgorithms()
    setIsBuyingAlgorithm(false)

    addMessage({
      text: "Richiesta di accesso eseguita con successo",
      type: 'Algoritmo',
      variant: 'success',
      show: true
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    fetchDataAssets()
    fetchAlgorithms()
    getUserInfo()
  }, [])

  return (
    <div id="container">
      <header className="mt-2">
        <h1>
          <i className="fa-brands fa-digital-ocean"></i> Marketplace
        </h1>
      </header>

      <section className="mt-5" id="formsContainer">
        <h3>
          {' '}
          <i className="fa-solid fa-database"></i> Lista Data Assets
        </h3>

        <hr className="mt-2"></hr>

        {assets.length > 0 ? (
          <BlockUi blocking={isBuyingAsset}>
            <AssetList
              assetList={assets}
              user={user._id}
              onBuy={buyAsset}></AssetList>
          </BlockUi>
        ) : (
          <TablePlaceholder
            title="Data Asset Pubblici"
            body={
              <>
                <p>Non è ancora stato pubblicato alcun Data Asset</p>
                <p>Pubblica tu il primo.</p>
              </>
            }
            button={
              <>
                <i className="fa-solid fa-bars"></i> Vai agli Asset
              </>
            }
            onClick={() => history.push('/assets')}></TablePlaceholder>
        )}
      </section>

      <section className="mt-5" id="formsContainer">
        <h3>
          {' '}
          <i className="fa-solid fa-calculator"></i> Lista Algoritmi
        </h3>

        <hr className="mt-2"></hr>

        {algorithms.length > 0 ? (
          <BlockUi blocking={isBuyingAlgorithm}>
            <AssetList
              assetList={algorithms}
              user={user._id}
              onBuy={buyAlgorithm}></AssetList>
          </BlockUi>
        ) : (
          <TablePlaceholder
            title="Algoritmi Pubblici"
            body={
              <>
                <p>Non è ancora stato pubblicato alcun Algoritmo</p>
                <p>Pubblica tu il primo.</p>
              </>
            }
            button={
              <>
                <i className="fa-solid fa-bars"></i> Vai agli Asset
              </>
            }
            onClick={() => history.push('/assets')}></TablePlaceholder>
        )}
      </section>
    </div>
  )
}

export { Marketplace }

export default Marketplace
