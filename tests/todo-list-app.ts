import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TodoListApp } from "../target/types/todo_list_app";
import { assert} from "chai";
import { PublicKey} from '@solana/web3.js';

describe("todo-list-app", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.TodoListApp as Program<TodoListApp>;
  const author = program.provider as anchor.AnchorProvider;

  const USER_PROFILE_SEED = Buffer.from("USER_PROFILE")
  const TODO_TASK_SEED = Buffer.from("TODO_TASK")

  console.log('author ', author.publicKey.toBase58())

  it("can create initialize user", async () => {
    const [userPda, bump] = PublicKey.findProgramAddressSync([USER_PROFILE_SEED, author.wallet.publicKey.toBuffer()], program.programId)

    const tx = await program.methods.initializeUser()
    .accounts({
      userProfile: userPda
    })
    .rpc()

    const userProfileAccount = await program.account.userProfile.fetch(userPda);
    // assert.equal(taskAccount.author.toBase58(), taskKey.publicKey.toBase58())
    assert.equal(
      userProfileAccount.authority.toBase58(),
      author.wallet.publicKey.toBase58()
    );
  });

  it("can add task", async () => {
    const [userPda, bump] = PublicKey.findProgramAddressSync([USER_PROFILE_SEED, author.wallet.publicKey.toBuffer()], program.programId)
    const userProfileAccount = await program.account.userProfile.fetch(userPda);

    const [taskPda, taskBump] = PublicKey.findProgramAddressSync([TODO_TASK_SEED, author.wallet.publicKey.toBuffer(), Buffer.from([userProfileAccount.todoIdx])], program.programId)
    const tx = await program.methods.addingTask("Reading a book")
    .accounts({
      userProfile: userPda,
      task: taskPda
    })
    .rpc()

    const taskAccount = await program.account.task.fetch(taskPda);
    // assert.equal(taskAccount.author.toBase58(), taskKey.publicKey.toBase58())
    assert.equal(
      taskAccount.authority.toBase58(),
      author.wallet.publicKey.toBase58()
    );
    assert.equal(taskAccount.isDone, false)
    assert.equal(taskAccount.text, "Reading a book")
  });

  it("can update task", async () => {
    const [userPda, bump] = PublicKey.findProgramAddressSync([USER_PROFILE_SEED, author.wallet.publicKey.toBuffer()], program.programId)
    const userProfileAccount = await program.account.userProfile.fetch(userPda);

    assert.equal(1, userProfileAccount.totalTodo)
    assert.equal(1, userProfileAccount.todoIdx)

    const filter = {
      memcmp: {
          offset: 8,
          bytes: author.wallet.publicKey.toString()
      },
    };
    const taskAccounts = await program.account.task.all([filter])
    const readingBookTodo = taskAccounts[0]

    assert.equal(false, readingBookTodo.account.isDone)
    
    const [taskPda, taskBump] = PublicKey.findProgramAddressSync([TODO_TASK_SEED, author.wallet.publicKey.toBuffer(), Buffer.from([readingBookTodo.account.idx])], program.programId)
    const tx = await program.methods.updateTask(true, readingBookTodo.account.idx)
    .accounts({
      task: taskPda
    })
    .rpc()

    const taskAccountsAfter = await program.account.task.all([filter])
    const readingBookTodoAfter = taskAccountsAfter[0]

    assert.equal(true, readingBookTodoAfter.account.isDone)
  });

  it("can delete task", async () => {
    const [userPda, bump] = PublicKey.findProgramAddressSync([USER_PROFILE_SEED, author.wallet.publicKey.toBuffer()], program.programId)
    const userProfileAccount = await program.account.userProfile.fetch(userPda);

    assert.equal(1, userProfileAccount.totalTodo)
    assert.equal(1, userProfileAccount.todoIdx)

    const filter = {
      memcmp: {
          offset: 8,
          bytes: author.wallet.publicKey.toString()
      },
    };
    
    const taskAccounts = await program.account.task.all([filter])
    const readingBookTodo = taskAccounts[0]
    assert.equal(1, taskAccounts.length)
    
    const [taskPda, taskBump] = PublicKey.findProgramAddressSync([TODO_TASK_SEED, author.wallet.publicKey.toBuffer(), Buffer.from([readingBookTodo.account.idx])], program.programId)
    const tx = await program.methods.deleteTask(readingBookTodo.account.idx)
    .accounts({
      task: taskPda,
      userProfile: userPda
    })
    .rpc()

    const taskAccountsAfter = await program.account.task.all([filter])

    assert.equal(0, taskAccountsAfter.length)

    const userProfileAccountAfter = await program.account.userProfile.fetch(userPda);

    assert.equal(0, userProfileAccountAfter.totalTodo)
    assert.equal(1, userProfileAccountAfter.todoIdx)
  });
});