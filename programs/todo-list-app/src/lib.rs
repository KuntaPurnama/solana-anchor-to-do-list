use anchor_lang::prelude::*;

declare_id!("5EpLvuuFVug67DJTqDef7sU78SDndGcaznHrk3AqcJEC");

#[program]
pub mod todo_list_app {
    use super::*;

    pub fn adding_task(ctx: Context<AddingTask>, text: String) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let signer = &ctx.accounts.signer;
        let clock = Clock::get().unwrap();
        if text.chars().count() > 400 {
            return Err(ErrorCode::TextTooLong.into());
        }
        task.author = *signer.key;
        task.is_done = false;
        task.created_at = clock.unix_timestamp;
        task.updated_at = clock.unix_timestamp;
        task.text = text;

        Ok(())
    }

    pub fn update_task(ctx: Context<UpdateTask>, is_done: bool) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let signer = &ctx.accounts.author;
        let clock = Clock::get().unwrap();

        task.author = *signer.key;
        task.is_done = is_done;
        task.updated_at = clock.unix_timestamp;

        Ok(())
    }

    pub fn delete_task(ctx: Context<DeleteTask>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let signer = &ctx.accounts.author;
        let clock = Clock::get().unwrap();

        task.author = *signer.key;
        task.is_done = true;
        task.updated_at = clock.unix_timestamp;

        Ok(())
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("The text is too long")]
    TextTooLong,
}

#[derive(Accounts)]
pub struct AddingTask<'info> {
    #[account(init, payer = signer, space = Task::LEN)]
    pub task: Account<'info, Task>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct UpdateTask<'info> {
    #[account(mut, has_one= author)]
    pub task: Account<'info, Task>,
    pub author: Signer<'info>
}

#[derive(Accounts)]
pub struct DeleteTask<'info> {
    #[account(mut, has_one = author)]
    pub task: Account<'info, Task>,
    pub author: Signer<'info>
}



#[account]
pub struct Task {
    pub author: Pubkey, // The account that owns the task
    pub is_done: bool, // Whether the task is done or not
    pub text: String, // The text of the task
    pub created_at: i64, // The timestamp when the task was created
    pub updated_at: i64, // The timestamp when the task was last updated
}

const DISCRIMINATOR: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const BOOL_LENGTH: usize = 1;
const TEXT_LENGTH: usize = 4 + 400 * 4; // 400 chars
const TIMESTAMP_LENGTH: usize = 8;

impl Task {
    const LEN: usize = DISCRIMINATOR + // discriminator
    PUBLIC_KEY_LENGTH + // author
    BOOL_LENGTH + // is_done
    TEXT_LENGTH + // text
    TIMESTAMP_LENGTH + // created_at
    TIMESTAMP_LENGTH; // updated_at
}

//solana config set --url dev
