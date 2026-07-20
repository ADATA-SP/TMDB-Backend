BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] TEXT NOT NULL,
    [username] VARCHAR(100),
    [email] VARCHAR(100),
    [password] VARCHAR(255),
    [status] TINYINT NOT NULL CONSTRAINT [users_status_df] DEFAULT 1,
    [path_image] VARCHAR(255),
    [created_at] DATETIME CONSTRAINT [users_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME CONSTRAINT [users_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    [ldap_crendential] TINYINT CONSTRAINT [users_ldap_crendential_df] DEFAULT 0,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [USERS_username_IDX] UNIQUE NONCLUSTERED ([username]),
    CONSTRAINT [USERS_email_IDX] UNIQUE NONCLUSTERED ([email])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
