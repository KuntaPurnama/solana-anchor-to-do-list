import { useTodo } from "./hooks/todo";
import dynamic from 'next/dynamic';
import styles from "../styles/home.module.css"
import AddTaskModal from "@/components/modal/AddTaskModal";
import { useState } from "react";
import { TaskList } from "@/components/TaskList";

export default function Home() {

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)

  const openTaskModal = () => {
    setIsAddTaskModalOpen(true)
  }

  const closeTaskModal = () => {
    setIsAddTaskModalOpen(false)
  }

  const {initialized, transactionPending, loading, taskIdx, totalTask, incompleteTasks, completeTasks, initializeUser, addTask, updateTask, deleteTask} = useTodo()
  
  const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
  );
  
  return (
    <div className={styles.container}>
      <div className={styles.contentContainer}>

        <div className={styles.homeHeader}>
          <div>
            {initialized ? 
              (
                <button className={styles.initializedButton} type="button" onClick={openTaskModal}>Create New Task</button>
              ) 
              : 
                <button className={styles.initializedButton} type="button" onClick={() => initializeUser()}> Initialized User </button>
            }
          </div> 
          <div>
            <WalletMultiButtonDynamic/>
          </div>
        </div>

        <div>
          <AddTaskModal isOpen={isAddTaskModalOpen} onClose={closeTaskModal} addTaskFunction={addTask}/>
        </div>
        
        <div className={styles.taskList}>
          <p style={{fontWeight:'bold'}}>Completed Tasks : </p>
          <TaskList tasks={completeTasks} updateTask={updateTask} deleteTask={deleteTask}/>
        </div>

        <div className={styles.taskList}>
          <p style={{fontWeight:'bold'}}>Incompleted Tasks : </p>
          <TaskList tasks={incompleteTasks} updateTask={updateTask} deleteTask={deleteTask}/>
        </div>
      </div>
    </div>
  );
}

