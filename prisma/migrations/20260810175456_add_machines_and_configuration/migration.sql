BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[machines] (
    [id] INT NOT NULL IDENTITY(1,1),
    [description] VARCHAR(100) NOT NULL,
    [code] VARCHAR(45) NOT NULL,
    [ip_address] VARCHAR(45),
    [port_address] VARCHAR(45),
    [status] TINYINT NOT NULL CONSTRAINT [machines_status_df] DEFAULT 1,
    [created_at] DATETIME CONSTRAINT [machines_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME CONSTRAINT [machines_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    [machine_type] VARCHAR(100) NOT NULL,
    [localization] VARCHAR(100) NOT NULL,
    [is_blocked] TINYINT NOT NULL CONSTRAINT [machines_is_blocked_df] DEFAULT 0,
    CONSTRAINT [machines_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[routes] (
    [id] INT NOT NULL IDENTITY(1,1),
    [description] VARCHAR(55) NOT NULL,
    [status] TINYINT NOT NULL CONSTRAINT [routes_status_df] DEFAULT 1,
    [created_at] DATETIME CONSTRAINT [routes_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME CONSTRAINT [routes_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    [machine_id] INT,
    CONSTRAINT [routes_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[routines] (
    [id] INT NOT NULL IDENTITY(1,1),
    [type] NVARCHAR(1000) NOT NULL CONSTRAINT [routines_type_df] DEFAULT 'RUN',
    [created_at] DATETIME CONSTRAINT [routines_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME CONSTRAINT [routines_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    [machine_id] INT NOT NULL,
    [delay_execution] TINYINT NOT NULL CONSTRAINT [routines_delay_execution_df] DEFAULT 5,
    [description] VARCHAR(170),
    [validate_recipe_success] TINYINT NOT NULL CONSTRAINT [routines_validate_recipe_success_df] DEFAULT 1,
    [ignore_recipe_validation] TINYINT,
    CONSTRAINT [routines_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[actions] (
    [id] INT NOT NULL IDENTITY(1,1),
    [description] VARCHAR(105),
    [command] TEXT NOT NULL,
    [created_at] DATETIME CONSTRAINT [actions_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME CONSTRAINT [actions_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    [name] VARCHAR(80),
    [machine_type] VARCHAR(100),
    CONSTRAINT [actions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[routine_action] (
    [routine_id] INT NOT NULL,
    [action_id] INT NOT NULL,
    [position] TINYINT NOT NULL,
    [created_at] DATETIME CONSTRAINT [routine_action_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME CONSTRAINT [routine_action_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [routine_action_pk] PRIMARY KEY CLUSTERED ([routine_id],[action_id])
);

-- CreateTable
CREATE TABLE [dbo].[reason_code] (
    [id] INT NOT NULL IDENTITY(1,1),
    [code] NVARCHAR(20) NOT NULL,
    [ignored] INT NOT NULL CONSTRAINT [reason_code_ignored_df] DEFAULT 1,
    [created_at] DATETIME CONSTRAINT [reason_code_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME CONSTRAINT [reason_code_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    [routine_id] INT NOT NULL,
    CONSTRAINT [reason_code_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [reason_code_code_routine_id_key] UNIQUE NONCLUSTERED ([code],[routine_id])
);

-- AddForeignKey
ALTER TABLE [dbo].[routes] ADD CONSTRAINT [routes_machines_FK] FOREIGN KEY ([machine_id]) REFERENCES [dbo].[machines]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[routine_action] ADD CONSTRAINT [routine_action_actions_FK] FOREIGN KEY ([action_id]) REFERENCES [dbo].[actions]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[routine_action] ADD CONSTRAINT [routine_action_routines_FK] FOREIGN KEY ([routine_id]) REFERENCES [dbo].[routines]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[reason_code] ADD CONSTRAINT [reason_code_routines_FK] FOREIGN KEY ([routine_id]) REFERENCES [dbo].[routines]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
