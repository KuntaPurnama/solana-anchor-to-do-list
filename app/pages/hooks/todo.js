import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";
import * as anchor from '@project-serum/anchor'
import todoIdl from "../../constants/todo_list_app.json"
import { PublicKey} from '@solana/web3.js';
import { filterWithAuthor } from "../utils";
import toast from 'react-hot-toast'

export function useTodo(){
    const { connection } = useConnection()
    const { publicKey } = useWallet()
    const TODO_PROGRAM_ID = todoIdl["metadata"]["address"]

    const anchorWallet = useAnchorWallet()

    const [initialized, setInitialized] = useState(false)
    const [totalTask, setTotalTask] = useState(0)
    const [taskIdx, setTaskIdx] = useState(0)
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(false)
    const [transactionPending, setTransactionPending] = useState(false)

    const USER_PROFILE_SEED = Buffer.from("USER_PROFILE")
    const TODO_TASK_SEED = Buffer.from("TODO_TASK")

    const program = useMemo(() => {
        if(anchorWallet){
            const provider = new anchor.AnchorProvider(connection, anchorWallet, anchor.AnchorProvider.defaultOptions())
            return new anchor.Program(todoIdl, TODO_PROGRAM_ID, provider)
        }
    }, [connection, anchorWallet])

    useEffect(() => {
        findProfileAccounts()
    }, [anchorWallet, publicKey, transactionPending, program])

    const findProfileAccounts = async() => {
        if(program && publicKey && !transactionPending){
            try{
                setLoading(true)
                const [profilePda, profileBump] = await PublicKey.findProgramAddressSync([USER_PROFILE_SEED, publicKey.toBuffer()], program.programId)
                let profileAccount = null
                try{
                    profileAccount = await program.account.userProfile.fetch(profilePda)
                }catch(e){
                    console.log(e)
                }
                if(profileAccount){
                    const tasks = await program.account.task.all([filterWithAuthor(publicKey)])
                    setTasks(tasks)
                    setInitialized(true)
                    setTotalTask(profileAccount.totalTodo)
                    setTaskIdx(profileAccount.todoIdx)
                }else{
                    setInitialized(false)
                }
            }catch(error){
                console.log(error)
                setInitialized(false)
                setTasks([])
            }finally{
                setLoading(false)
            }
        }
    }

    const initializeUser = async () =>{
        if(program && publicKey && connection){
            try{
                setTransactionPending(true)
                const [profilePda, profileBump] = await PublicKey.findProgramAddressSync([USER_PROFILE_SEED, publicKey.toBuffer()], program.programId)
                const tx = await program.methods.initializeUser()
                .accounts({
                    userProfile: profilePda
                })
                .rpc()
                setInitialized(true)
                toast.success('Successfully initialized user.')
            }catch(error){
                console.log(error)
                toast.error(error.toString())
            }finally{
                setTransactionPending(false)
            }
        }   
    }

    const addTask = async(text) => {
        if(program && publicKey && connection){
            try{
                setTransactionPending(true)
                const [taskPda, taskBump] = await PublicKey.findProgramAddressSync([TODO_TASK_SEED, publicKey.toBuffer(), Buffer.from([taskIdx])], program.programId)
                const [profilePda, profileBump] = await PublicKey.findProgramAddressSync([USER_PROFILE_SEED, publicKey.toBuffer()], program.programId)

                const tx = await program.methods.addingTask(text)
                .accounts({
                    userProfile: profilePda,
                    task: taskPda
                })
                .rpc()

                toast.success("Success create task")
            }catch(error){
                console.log(error)
                toast.error(error.toString())
            }finally{
                setTransactionPending(false)
            }
        }
    }

    const updateTask = async(isDone, taskIdx) => {
        if(program && publicKey && connection){
            try{
                setTransactionPending(true)
                const [taskPda, taskBump] = await PublicKey.findProgramAddressSync([TODO_TASK_SEED, publicKey.toBuffer(), Buffer.from([taskIdx])], program.programId)
                const tx = await program.methods.updateTask(isDone, taskIdx)
                .accounts({
                    task: taskPda
                })
                .rpc()

                toast.success("Success update task")
            }catch(error){
                console.log(error)
                toast.error(error.toString())
            }finally{
                setTransactionPending(false)
            }
        }
    }

    const deleteTask = async(idx) => {
        console.log("goes here? ", idx)
        if(program && publicKey && connection){
            try{
                setTransactionPending(true)
                const [taskPda, taskBump] = await PublicKey.findProgramAddressSync([TODO_TASK_SEED, publicKey.toBuffer(), Buffer.from([idx])], program.programId)
                const [profilePda, profileBump] = await PublicKey.findProgramAddressSync([USER_PROFILE_SEED, publicKey.toBuffer()], program.programId)

                const tx = await program.methods.deleteTask(idx)
                .accounts({
                    userProfile: profilePda,
                    task: taskPda
                })
                .rpc()

                toast.success("Success delete task")
            }catch(error){
                console.log(error)
                toast.error(error.toString())
            }finally{
                setTransactionPending(false)
            }
        }
    }

    const incompleteTasks = useMemo(() => tasks.filter((task) => !task.account.isDone), [tasks])
    const completeTasks = useMemo(() => tasks.filter((task) => task.account.isDone), [tasks])

    return {initialized, transactionPending, loading, taskIdx, totalTask, incompleteTasks, completeTasks, initializeUser, addTask, updateTask, deleteTask}
}