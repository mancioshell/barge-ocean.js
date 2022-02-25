import { Modal, Button } from 'react-bootstrap'

function Preview({ show, title, body, closeButton, onClose }: any) {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="preview-body">{body}</div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          {closeButton}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default Preview
