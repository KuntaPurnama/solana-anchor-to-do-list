import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from "../../styles/update-task-modal.module.css"
import { useState } from 'react';

const EditTaskConfirmation = ({isOpen, onClose, editTaskFunction, task}) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleUpdateTask = async () =>{
        setIsSubmitting(true)
        await editTaskFunction(!task.account.isDone, task.account.idx)
        setIsSubmitting(false)
        onClose()
    }

    if(!task){
        return <></>
    }

    return (
      <Modal show={isOpen} onHide={onClose}>

        <Modal.Header closeButton className={styles.modalHeader}>
            <Modal.Title>Are You Sure Want To Mark It As {task.account.isDone ? 'Undone' : 'Done'}</Modal.Title>
        </Modal.Header>
        
        <div style={{display:'flex', padding:'10px'}}>
            <Button className={styles.footerButton} onClick={() => handleUpdateTask()}>
                {isSubmitting ? <div className={styles.loadingSpinner}></div> : <>Yes</>}
            </Button>  
            <Button className={styles.footerButtonNo} onClick={() => onClose()}>
                No
            </Button>  
        </div>
          
    </Modal>
    )
}

export default EditTaskConfirmation;