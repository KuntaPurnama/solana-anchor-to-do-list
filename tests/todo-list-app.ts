import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TodoListApp } from "../target/types/todo_list_app";
import { assert } from "chai";

describe("todo-list-app", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.TodoListApp as Program<TodoListApp>;
  const author = program.provider as anchor.AnchorProvider;
  console.log('author ', author.publicKey.toBase58())

  it("can create a task", async () => {
    const taskKey = anchor.web3.Keypair.generate()
    const tx = await program.methods.addingTask("Reading A Book")
    .accounts({
        task: taskKey.publicKey,
      })
    .signers([taskKey])
    .rpc()
    console.log("Your transaction signature", tx);

    const taskAccount = await program.account.task.fetch(taskKey.publicKey);
    // assert.equal(taskAccount.author.toBase58(), taskKey.publicKey.toBase58())
    assert.equal(
      taskAccount.author.toBase58(),
      author.wallet.publicKey.toBase58()
    );
    assert.equal(taskAccount.text, "Reading A Book");
    assert.equal(taskAccount.isDone, false);
    assert.ok(taskAccount.createdAt);
    assert.ok(taskAccount.updatedAt);
  });

  it("can update a task", async () => {
    const taskKey = anchor.web3.Keypair.generate()
    const tx = await program.methods.addingTask("Code For Lyfe")
    .accounts({
        task: taskKey.publicKey,
      })
    .signers([taskKey])
    .rpc()
    console.log("Your transaction signature", tx);

    const taskAccountFirst = await program.account.task.fetch(taskKey.publicKey);
    assert.equal(taskAccountFirst.isDone, false);
    assert.equal(
      taskAccountFirst.author.toBase58(),
      author.wallet.publicKey.toBase58()
    );
    

    const txUpdate = await program.methods.updateTask(true)
    .accounts({
        task: taskKey.publicKey
    })
    .rpc()
    console.log("New updated transaction ", txUpdate)

    const taskAccount = await program.account.task.fetch(taskKey.publicKey);
    assert.equal(taskAccount.isDone, true);
  });

  it("can delete a task", async () => {
    const taskKey = anchor.web3.Keypair.generate()
    const tx = await program.methods.addingTask("Code For Lyfe")
    .accounts({
        task: taskKey.publicKey,
      })
    .signers([taskKey])
    .rpc()
    console.log("Your transaction signature", tx);

    const taskAccountFirst = await program.account.task.fetch(taskKey.publicKey);
    assert.equal(taskAccountFirst.isDone, false);
    assert.equal(
      taskAccountFirst.author.toBase58(),
      author.wallet.publicKey.toBase58()
    );
    

    const txUpdate = await program.methods.deleteTask()
    .accounts({
        task: taskKey.publicKey
    })
    .rpc()
    console.log("New updated transaction ", txUpdate)

    const taskAccount = await program.account.task.fetch(taskKey.publicKey);
    assert.equal(taskAccount.isDone, true);
  });
});