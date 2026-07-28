BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[users] ADD [profile_id] INT;

-- CreateTable
CREATE TABLE [dbo].[profiles] (
    [id] INT NOT NULL IDENTITY(1,1),
    [description] VARCHAR(30) NOT NULL,
    [identifier] VARCHAR(80) NOT NULL,
    [external] TINYINT NOT NULL CONSTRAINT [profiles_external_df] DEFAULT 1,
    [status] TINYINT NOT NULL CONSTRAINT [profiles_status_df] DEFAULT 1,
    [created_at] DATETIME CONSTRAINT [profiles_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME CONSTRAINT [profiles_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [profiles_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [profiles_identifier_IDX] UNIQUE NONCLUSTERED ([identifier])
);

-- CreateTable
CREATE TABLE [dbo].[modules] (
    [id] INT NOT NULL IDENTITY(1,1),
    [description] VARCHAR(150) NOT NULL,
    [slug] VARCHAR(100) NOT NULL,
    [status] TINYINT NOT NULL CONSTRAINT [modules_status_df] DEFAULT 1,
    [created_at] DATETIME CONSTRAINT [modules_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME CONSTRAINT [modules_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [modules_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [modules_identifier_IDX] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[operations] (
    [id] INT NOT NULL IDENTITY(1,1),
    [description] VARCHAR(100) NOT NULL,
    [identifier] VARCHAR(100) NOT NULL,
    [status] TINYINT NOT NULL CONSTRAINT [operations_status_df] DEFAULT 1,
    [module_id] INT NOT NULL,
    CONSTRAINT [operations_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [operations_identifier_IDX] UNIQUE NONCLUSTERED ([identifier])
);

-- CreateTable
CREATE TABLE [dbo].[profile_operation] (
    [profile_id] INT NOT NULL,
    [operation_id] INT NOT NULL,
    CONSTRAINT [profile_operation_pkey] PRIMARY KEY CLUSTERED ([operation_id],[profile_id])
);

-- CreateTable
CREATE TABLE [dbo].[audit_log] (
    [id] INT NOT NULL IDENTITY(1,1),
    [type] VARCHAR(50),
    [description] VARCHAR(100),
    [operation] VARCHAR(50),
    [user_id] INT,
    [created_at] DATETIME CONSTRAINT [audit_log_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME CONSTRAINT [audit_log_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [audit_log_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[notification_log] (
    [id] INT NOT NULL IDENTITY(1,1),
    [type] VARCHAR(50),
    [description] VARCHAR(100),
    [created_at] DATETIME CONSTRAINT [notification_log_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME CONSTRAINT [notification_log_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    [machine_code] VARCHAR(20),
    [user_id] INT,
    CONSTRAINT [notification_log_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [profile_operation_operation_id_IDX] ON [dbo].[profile_operation]([operation_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [profile_operation_profile_id_IDX] ON [dbo].[profile_operation]([profile_id]);

-- AddForeignKey
ALTER TABLE [dbo].[users] ADD CONSTRAINT [users_profiles_FK] FOREIGN KEY ([profile_id]) REFERENCES [dbo].[profiles]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[operations] ADD CONSTRAINT [operations_modules_FK] FOREIGN KEY ([module_id]) REFERENCES [dbo].[modules]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[profile_operation] ADD CONSTRAINT [fk_profile_has_operation_operation] FOREIGN KEY ([operation_id]) REFERENCES [dbo].[operations]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[profile_operation] ADD CONSTRAINT [fk_profile_has_operation_profile] FOREIGN KEY ([profile_id]) REFERENCES [dbo].[profiles]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[audit_log] ADD CONSTRAINT [audit_log_users_FK] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[notification_log] ADD CONSTRAINT [notification_log_users_FK] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
