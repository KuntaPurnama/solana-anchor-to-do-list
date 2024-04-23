import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from "../../styles/add-task-modal.module.css"
import { useState } from 'react';

const AddTaskModal = ({isOpen, onClose, addTaskFunction}) => {
    const [text, setText] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleTextChange = (input) => {
        setText(input.target.value)
    }

    const handleAddTask = async () =>{
        setIsSubmitting(true)
        await addTaskFunction(text)
        setIsSubmitting(false)
        onClose()
    }
    return (
      <Modal show={isOpen} onHide={onClose}>

        <Modal.Header closeButton className={styles.modalHeader}>
            <Modal.Title>Write Your Upcoming Activity</Modal.Title>
        </Modal.Header>

        <Modal.Body>
            <input onChange={handleTextChange} placeholder='Reading a book....' style={{padding:'10px', width:'100%', borderRadius:'5px', border:'0.7px solid grey'}}/>
        </Modal.Body>
        
        <Button className={styles.footerButton} onClick={() => handleAddTask()}>
            {isSubmitting ? <div className={styles.loadingSpinner}></div> : <>Add Task</>}
        </Button>    
    </Modal>
    )
}

export default AddTaskModal;