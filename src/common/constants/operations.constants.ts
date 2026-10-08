import { ChangeLogsOperation } from '../enums/change-logs.enum';
import { MachinesOperation } from '../enums/machines.enum';
import { NotificationsOperation } from '../enums/notifications.enum';
import { PermissionsOperation } from '../enums/permission.enum';
import { RecipesOperation } from '../enums/recipes.enum';
import { ReportsOperation } from '../enums/report.enum';

export const OperationsModule = {
	MACHINES: MachinesOperation,
	REPORTS: ReportsOperation,
	PERMISSION: PermissionsOperation,
	RECIPES: RecipesOperation,
	NOTIFICATIONS: NotificationsOperation,
	CHANGE_LOG: ChangeLogsOperation,
};
