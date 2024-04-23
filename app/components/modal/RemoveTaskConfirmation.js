import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from "../../styles/delete-task-modal.module.css"
import { useState } from 'react';

const DeleteTaskConfirmation = ({isOpen, onClose, deleteTaskFunction, task}) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleDeleteTask = async () =>{
        setIsSubmitting(true)
        await deleteTaskFunction(task.account.idx)
        setIsSubmitting(false)
        onClose()
    }

    if(!task){
        return <></>
    }

    return (
      <Modal show={isOpen} onHide={onClose}>

        <Modal.Header closeButton className={styles.modalHeader}>
            <Modal.Title>Are You Sure Want To Delete Task</Modal.Title>
        </Modal.Header>
        
        <div style={{display:'flex', padding:'10px'}}>
            <Button className={styles.footerButton} onClick={() => handleDeleteTask()}>
                {isSubmitting ? <div className={styles.loadingSpinner}></div> : <>Yes</>}
            </Button>  
            <Button className={styles.footerButtonNo} onClick={() => onClose()}>
                No
            </Button>  
        </div>
          
    </Modal>
    )
}

export default DeleteTaskConfirmation;