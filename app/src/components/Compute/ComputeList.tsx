import { Button } from 'react-bootstrap'

import {
  useTable,
  useGlobalFilter,
  useSortBy,
  usePagination
} from 'react-table'

import React from 'react'

import TablePagination from 'Components/Utils/TablePagination'

function ComputeList({ jobList, onDownloadFile, onDownloadLog }: any) {
  const actions = React.useCallback(
    (compute) => (
      <>
        <Button
          className="button-margin"
          variant="primary"
          type="button"
          size="sm"
          disabled={compute['status'] !== 70}
          onClick={() => onDownloadFile(compute['job_id'])}>
          <i className="fa-solid fa-download"></i> Risultato
        </Button>
        <Button
          variant="primary"
          type="button"
          size="sm"
          disabled={compute['status'] !== 70}
          onClick={() => onDownloadLog(compute['job_id'])}>
          <i className="fa-solid fa-download"></i> Log
        </Button>
      </>
    ),
    [onDownloadFile, onDownloadLog]
  )

  const data = React.useMemo(
    () =>
      jobList.map((compute: any) => ({
        status: 'Caricamento',
        statusText: 'Caricamento',
        ...compute,
        actions: actions(compute)
      })),
    [actions, jobList]
  )

  const columns = React.useMemo(
    () => [
      { Header: 'Job Id', accessor: 'job_id' },
      { Header: 'Data Asset', accessor: 'data_name' },
      { Header: 'Algoritmo', accessor: 'alg_name' },
      { Header: 'Codice Stato', accessor: 'status' },
      { Header: 'Stato', accessor: 'statusText' },
      { Header: 'Azioni', accessor: 'actions' }
    ],
    []
  )

  const tableInstance = useTable(
    { columns, data },
    useGlobalFilter,
    useSortBy,
    usePagination
  )

  return (
    <TablePagination
      {...tableInstance}
      paginationProps={tableInstance}></TablePagination>
  )
}

export default ComputeList
export { ComputeList }
