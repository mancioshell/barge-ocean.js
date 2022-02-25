import { useState, useRef } from 'react'

import { Form, Col, Row, Button, Spinner } from 'react-bootstrap'
import Select from 'react-select'

function UploadAssetForm({ onUpload }: any) {
  const fileRef = useRef(null)

  const [name, setName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [type, setType] = useState<string>('data')
  const [outputType, setOutputType] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState(null)

  const onChangeFile = (event: any) => {
    setSelectedFile(event.target.files[0])
  }

  const contentTypeOptions = [
    {
      value: 'text/plain',
      label: 'Testo'
    },
    {
      value: 'application/json',
      label: 'Json'
    },
    {
      value: 'application/octet-stream',
      label: 'Binario'
    }
  ]

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault()

        onUpload(name, type, outputType, description, selectedFile, () => {
          // @ts-ignore
          fileRef.current = null
          setSelectedFile(null)
          setType('data')
          setOutputType('')
          setName('')
          setDescription('')
        })
      }}>
      <Row>
        <Col sm="6">
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>
              <b>Nome *</b> :{' '}
            </Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Inserisci il nome"
            />
          </Form.Group>
        </Col>
        <Col sm="6">
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>
              <b>Descrizione *</b> :{' '}
            </Form.Label>
            <Form.Control
              as="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Inserisci la descrizione"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col sm="2">
          <Form.Label>
            <b>Tipo * </b> :{' '}
          </Form.Label>
          <Form.Check
            label="Data Asset"
            name="type"
            type="radio"
            id={`inline-radio-data`}
            checked={type === 'data'}
            onChange={(e) => setType('data')}
          />
          <Form.Check
            label="Algoritmo"
            name="type"
            type="radio"
            id={`inline-radio-alg`}
            checked={type === 'alg'}
            onChange={(e) => setType('alg')}
          />
        </Col>

        <Col sm="5">
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>
              <b>Asset *</b> :
            </Form.Label>
            <Form.Control type="file" ref={fileRef} onChange={onChangeFile} />
          </Form.Group>
        </Col>

        {type === 'alg' ? (
          <Col sm="5">
            <Form.Group controlId={'select-player'}>
              <Form.Label>
                <b>Seleziona Output Algoritmo *</b> :
              </Form.Label>

              <Select
                inputId={`data-asset`}
                options={contentTypeOptions}
                isSearchable={true}
                name={'data-asset'}
                onChange={(option: any) => {
                  setOutputType(option.value)
                }}
                placeholder={'Seleziona Tipo di Output'}
              />
            </Form.Group>
          </Col>
        ) : null}
      </Row>
      <Row>
        <Col sm="2" className="align-self-center mt-2">
          <Button className="mr-3 mt-3" variant="primary" type="submit">
            <i className="fas fa-upload"></i> Carica
          </Button>
        </Col>
      </Row>
    </Form>
  )
}

export default UploadAssetForm
export { UploadAssetForm }
