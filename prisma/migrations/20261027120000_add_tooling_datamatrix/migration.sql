BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[tooling_datamatrix] (
    [id] INT NOT NULL IDENTITY(1,1),
    [tooling_sn_id] INT NOT NULL,
    [tooling_sn] VARCHAR(100) NOT NULL,
    [datamatrix] VARCHAR(100) NOT NULL,
    [created_at] DATETIME CONSTRAINT [tooling_datamatrix_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME CONSTRAINT [tooling_datamatrix_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [tooling_datamatrix_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [tooling_datamatrix_tooling_sn_id_IDX] UNIQUE NONCLUSTERED ([tooling_sn_id]),
    CONSTRAINT [tooling_datamatrix_datamatrix_IDX] UNIQUE NONCLUSTERED ([datamatrix])
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

