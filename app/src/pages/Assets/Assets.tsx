import React, { useState, useEffect, useContext } from 'react'

import UIContext from 'Contexts/UIContext'
import { OwnedAssetList } from 'Components/Assets/OwnedAssetList'
import { LinkAssetsForm } from 'Components/Assets/LinkAssetsForm'
import { UploadAssetForm } from 'Components/Assets/UploadAssetForm'
import BlockUi from 'Components/Utils/BlockUi'

function Assets() {
  const { service, addMessage } = useContext(UIContext)

  const [user, setUser] = useState<any>([])
  const [assets, setAssets] = useState<any>([])
  const [algorithms, setAlgorithms] = useState<any>([])
  const [isPublishing, setIsPublishing] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  const [isComputing, setIsComputing] = useState(false)

  useEffect(() => {
    fetchDataAssets()
    fetchAlgorithms()
    getUserInfo()
  }, [])

  const getUserInfo = async () => {
    let result = await service?.doAjax('GET', '/authentications/me')
    setUser(result?.data.me)
  }

  const fetchDataAssets = async () => {
    let result = await service?.doAjax('GET', '/assets?type=data')
    setAssets(result?.data)
  }

  const fetchAlgorithms = async () => {
    let result = await service?.doAjax('GET', '/assets?type=alg')
    setAlgorithms(result?.data)
  }

  const startCompute = async (data_did: string, alg_did: string) => {
    setIsComputing(true)
    let body = {
      data_did,
      alg_did
    }
    let result = await service?.doAjax('POST', '/computes', JSON.stringify(body))
    setIsComputing(false)

    addMessage({
      text: 'Computazione avviata con successo',
      type: 'Computazione',
      variant: 'success',
      show: true
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const uploadAsset = async (
    name: any,
    type: any,
    description: any,
    selectedFile: any,
    resetForm: any
  ) => {
    const formData = new FormData()
    formData.append('metadata', selectedFile)
    formData.append('name', name)
    formData.append('type', type)
    formData.append('description', description)

    setIsPublishing(true)

    try {

      await service?.doAjax('POST', '/assets', formData, [
        { name: 'Content-Type', value: 'multipart/form-data' }
      ])

      addMessage({
        text: 'Pubblicazione eseguita con successo',
        type: 'Pubblicazione',
        variant: 'success',
        show: true
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
    } catch (error) {

      addMessage({
        text: "Errore durante la pubblicazione dell'asset",
        type: 'Pubblicazione',
        variant: 'danger',
        show: true
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })

    } finally{

      resetForm()
      setIsPublishing(false)
      await fetchDataAssets()
      await fetchAlgorithms()
      
    } 
  }

  const linkAsset = async (asset: any, algorithm: any, resetForm: any) => {
    setIsLinking(true)

    let result = await service?.doAjax(
      'PUT',
      `/assets/${asset}`,
      JSON.stringify({
        alg_did: algorithm
      })
    )

    resetForm()
    setIsLinking(false)
    await fetchDataAssets()
    await fetchAlgorithms()

    addMessage({
      text: 'Assegnazione eseguita con successo',
      type: 'Assegnazione',
      variant: 'success',
      show: true
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div id="container">
      <header className="mt-2">
        <h1>
          <i className="fa-solid fa-bars"></i> Gestione Asset
        </h1>
      </header>

      <section className="mt-5" id="formsContainer">
        <BlockUi blocking={isPublishing}>
          <h3>
            {' '}
            <i className="fa-solid fa-upload"></i> Pubblica Asset{' '}
          </h3>

          <hr className="mt-2"></hr>
          <UploadAssetForm onUpload={uploadAsset}></UploadAssetForm>
        </BlockUi>
      </section>

      <section className="mt-5" id="formsContainer">
        <BlockUi blocking={isLinking}>
          <h3>
            {' '}
            <i className="fa-solid fa-link"></i> Assegna Dati / Algoritmi{' '}
          </h3>

          <hr className="mt-2"></hr>
          <LinkAssetsForm
            assets={assets}
            algorithms={algorithms}
            user={user._id}
            onLink={linkAsset}></LinkAssetsForm>
        </BlockUi>
      </section>

      <section className="mt-5" id="formsContainer">
        <BlockUi blocking={isComputing}>
          <h3>
            {' '}
            <i className="fa-solid fa-database"></i> Asset Posseduti
          </h3>

          <hr className="mt-2"></hr>

          <OwnedAssetList
            assetList={assets}
            user={user._id}
            onCompute={startCompute}></OwnedAssetList>
        </BlockUi>
      </section>
    </div>
  )
}

export { Assets }

export default Assets
