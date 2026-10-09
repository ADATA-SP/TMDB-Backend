BEGIN TRY

BEGIN TRAN;

ALTER TABLE [dbo].[users] DROP CONSTRAINT [users_ldap_crendential_df];
ALTER TABLE [dbo].[users] DROP COLUMN [ldap_crendential],
[password];
ALTER TABLE [dbo].[users] ADD [portal_user_id] VARCHAR(50);

CREATE NONCLUSTERED INDEX [users_portal_user_id_IDX] ON [dbo].[users]([portal_user_id]);

DELETE [po]
FROM [dbo].[profile_operation] [po]
INNER JOIN [dbo].[operations] [o] ON [o].[id] = [po].[operation_id]
INNER JOIN [dbo].[modules] [m] ON [m].[id] = [o].[module_id]
WHERE [m].[slug] = 'users';

DELETE [o]
FROM [dbo].[operations] [o]
INNER JOIN [dbo].[modules] [m] ON [m].[id] = [o].[module_id]
WHERE [m].[slug] = 'users';

DELETE FROM [dbo].[modules] WHERE [slug] = 'users';

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
