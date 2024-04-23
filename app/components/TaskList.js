import { useState } from "react"
import styles from "../styles/task-list.module.css"
import EditTaskConfirmation from "./modal/EditTaskConfirmation"
import DeleteTaskConfirmation from "./modal/RemoveTaskConfirmation"

export const TaskList = ({tasks, updateTask, deleteTask}) => {
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    
    const onCloseEdit = () => {
        setIsEditOpen(false)
    }

    const onCloseDelete = () => {
        setIsDeleteOpen(false)
    }

    const onChangeEditTask = (task) => {
        setSelectedTask(task)
        setIsEditOpen(true)
    }

    const onChangeRemoveTask = (task) => {
        setSelectedTask(task)
        setIsDeleteOpen(true)
    }

    return (
        <div>
           {tasks != undefined && tasks.length != 0? 
                <div className={styles.listContainer}>
                    {tasks.map(task => 
                    <div className={styles.listSpan}>
                        <p>{task.account.text}</p>
                        <div className={styles.editTask}>
                            <input
                                className={styles.radio}
                                type="radio"
                                name={"options" + task.account.idx}
                                checked={task.account.isDone}
                                onClick={() => onChangeEditTask(task)}
                            />
                            <img className={styles.removeIcon} src='/assets/delete-16.png' onClick={() => onChangeRemoveTask(task)}/>
                        </div>
                    </div>)}
                </div> :
                <div>
                    <p>No Tasks</p>
                </div>
            }
            <EditTaskConfirmation isOpen={isEditOpen} onClose={() => onCloseEdit()} editTaskFunction={updateTask} task={selectedTask}/>
            <DeleteTaskConfirmation isOpen={isDeleteOpen} onClose={() => onCloseDelete()} deleteTaskFunction={deleteTask} task={selectedTask}/>
        </div>
       
    )
}