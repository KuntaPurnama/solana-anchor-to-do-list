use anchor_lang::prelude::*;

declare_id!("D622DiQe4F8FazwhjAWRsYQLeJABmz4R9cfQhwKKypzs");

#[program]
pub mod todo_list_app {
    use super::*;
    
    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        let signer = &ctx.accounts.signer;
        user_profile.todo_idx = 0;
        user_profile.total_todo = 0;
        user_profile.authority = *signer.key;

        Ok(())
    }

    pub fn adding_task(ctx: Context<AddingTask>, text: String) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let user_profile = &mut ctx.accounts.user_profile;
        let signer = &ctx.accounts.authority;
        let clock = Clock::get().unwrap();

        if text.chars().count() > 400 {
            return Err(ErrorCode::TextTooLong.into());
        }

        task.authority = *signer.key;
        task.is_done = false;
        task.created_at = clock.unix_timestamp;
        task.updated_at = clock.unix_timestamp;
        task.text = text;
        task.idx = user_profile.todo_idx;

        user_profile.todo_idx += 1;
        user_profile.total_todo += 1;

        Ok(())
    }

    pub fn update_task(ctx: Context<UpdateTask>, is_done: bool, todo_idx: u8) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let clock = Clock::get().unwrap();

        task.is_done = is_done;
        task.updated_at = clock.unix_timestamp;
        Ok(())
    }

    pub fn delete_task(ctx: Context<DeleteTask>, todo_idx: u8) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.total_todo -= 1;
        Ok(())
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("The text is too long")]
    TextTooLong,
}

#[derive(Accounts)]
pub struct InitializeUser<'info>{
    #[account(
        init,
        payer = signer,
        space = 8 + std::mem::size_of::<UserProfile>(),
        seeds = [b"USER_PROFILE", signer.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct AddingTask<'info> {
    #[account(
        mut,
        has_one = authority,
        seeds = [b"USER_PROFILE", authority.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    #[account(
        init,
        payer = authority,
        space = Task::LEN,
        seeds = [b"TODO_TASK", authority.key().as_ref(), &[user_profile.todo_idx as u8].as_ref()],
        bump
    )]
    pub task: Account<'info, Task>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(is_done:bool, todo_idx: u8)]
pub struct UpdateTask<'info> {
    #[account(
        mut,
        has_one = authority,
        seeds = [b"TODO_TASK", authority.key().as_ref(), &[todo_idx as u8].as_ref()],
        bump
    )]
    pub task: Account<'info, Task>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(todo_idx: u8)]
pub struct DeleteTask<'info> {
    #[account(
        mut,
        has_one = authority,
        close = authority,
        seeds = [b"TODO_TASK", authority.key().as_ref(), &[todo_idx as u8].as_ref()],
        bump
    )]
    pub task: Account<'info, Task>,
    #[account(
        mut,
        has_one = authority,
        seeds = [b"USER_PROFILE", authority.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    #[account(mut)]
    pub authority: Signer<'info>
}

#[account]
pub struct UserProfile{
    pub authority: Pubkey,
    pub todo_idx: u8,
    pub total_todo: u8
}

#[account]
pub struct Task {
    pub authority: Pubkey, // The account that owns the task
    pub idx: u8, // index of the task account
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
const INDEX: usize = 8;

impl Task {
    const LEN: usize = DISCRIMINATOR + // discriminator
    PUBLIC_KEY_LENGTH + // author
    BOOL_LENGTH + // is_done
    TEXT_LENGTH + //text
    INDEX + // index
    TIMESTAMP_LENGTH + // created_at
    TIMESTAMP_LENGTH; // updated_at
}

//solana config set --url dev
