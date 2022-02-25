import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useHistory } from 'react-router-dom'

import UIContext from 'Contexts/UIContext'
import { ComputeList } from 'Components/Compute/ComputeList'
import TablePlaceholder from 'Components/Utils/TablePlaceholder'

import BlockUi from 'Components/Utils/BlockUi'
import Preview from 'Components/Utils/Preview'

function Compute() {
  const { service } = useContext(UIContext)
  const history = useHistory()

  const [jobList, setJobList] = useState<any>([])
  const [isLoading, setIsLoading] = useState(false)
  const [fetched, setIsFetched] = useState(false)
  const [show, setShow] = useState(false)
  const [dataPreview, setDataPreview] = useState<string|undefined>(undefined)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)  

  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    let result = await service?.doAjax('GET', '/computes')
    setJobList(result?.data)
    setIsLoading(false)
    setIsFetched(true)
  }, [service])

  const fetchJobById = useCallback(
    async (jobId: any) => {
      let result = await service?.doAjax('GET', `/computes?job_id=${jobId}`)
      return result?.data
    },
    [service]
  )

  const fetchJobsStatus = useCallback(async () => {
    setIsLoading(true)
    let result = await Promise.all(
      jobList.map(async (elem: any) => {
        let result = await fetchJobById(elem['job_id'])
        elem.status = result.status
        elem.statusText = result.statusText
        return elem
      })
    )
    setIsLoading(false)
    setJobList(result)
    setIsFetched(false)
  }, [fetchJobById, jobList])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  useEffect(() => {
    if (fetched) fetchJobsStatus()
  }, [fetchJobsStatus, fetched])  

  const downloadFile = async (jobId: any, preview?: any) => {
    setIsLoading(true)
    let result = await service?.doAjax(
      'GET',
      `/computes?job_id=${jobId}&file=true`
    )

    let contentType = result?.headers['content-type']
    let anchor = document.createElement('a')

    const blob = new Blob(
      [
        contentType === 'application/json'
          ? JSON.stringify(result?.data, undefined, 4)
          : result?.data
      ],
      {
        type: contentType
      }
    )

    setIsLoading(false)

    if (preview) {
      return blob
    } else {
      const url = URL.createObjectURL(blob)

      anchor.setAttribute('href', url)
      anchor.setAttribute('download', 'result')
      anchor.click()
    }
  }

  const onPreview = async (jobId: any) => {
    let data = await downloadFile(jobId, true)
    let result = await data?.text()
    setDataPreview(result)

    handleShow()
  }

  const downloadLog = async (jobId: any) => {
    setIsLoading(true)
    let result = await service?.doAjax(
      'GET',
      `/computes?job_id=${jobId}&result=true`
    )
    let anchor = document.createElement('a')

    const blob = new Blob([JSON.stringify(result?.data)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)

    anchor.setAttribute('href', url)
    anchor.setAttribute('download', 'logs.json')
    anchor.click()
    setIsLoading(false)
  }

  const computeList = (
    <ComputeList
      jobList={jobList}
      onDownloadFile={downloadFile}
      onDownloadLog={downloadLog}
      onPreview={onPreview}></ComputeList>
  )

  return (
    <div id="container">
      <header className="mt-2">
        <h1>
          <i className="fa-solid fa-gears"></i> Computazioni
        </h1>
      </header>

      <section className="mt-5" id="formsContainer">
        <h3>
          {' '}
          <i className="fa-solid fa-sliders"></i> Lista Job
        </h3>

        <hr className="mt-2"></hr>
        {jobList.length > 0 ? (
          <BlockUi blocking={isLoading}>{computeList}</BlockUi>
        ) : (
          <TablePlaceholder
            title="Computazioni"
            body={
              <>
                <p>Non è ancora stata avviata nessuna computazione</p>
                <p>Avvia una computazione a partire dai tuoi Asset.</p>
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
      <section>
        <Preview
          show={show}
          title="Preview Risultato"
          body={dataPreview}
          closeButton="Chiudi"
          onClose={handleClose}></Preview>
      </section>
    </div>
  )
}

export { Compute }

export default Compute
