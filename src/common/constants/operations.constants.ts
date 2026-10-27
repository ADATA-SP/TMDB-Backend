import { ChangeLogsOperation } from '../enums/change-logs.enum';
import { MachinesOperation } from '../enums/machines.enum';
import { NotificationsOperation } from '../enums/notifications.enum';
import { PermissionsOperation } from '../enums/permission.enum';
import { RecipesOperation } from '../enums/recipes.enum';
import { ReportsOperation } from '../enums/report.enum';
import { ToolingsOperation } from '../enums/toolings.enum';

export const OperationsModule = {
	MACHINES: MachinesOperation,
	TOOLINGS: ToolingsOperation,
	REPORTS: ReportsOperation,
	PERMISSION: PermissionsOperation,
	RECIPES: RecipesOperation,
	NOTIFICATIONS: NotificationsOperation,
	CHANGE_LOG: ChangeLogsOperation,
};
