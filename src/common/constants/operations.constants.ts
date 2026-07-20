import { ChangeLogsOperation } from '../enums/change-logs.enum';
import { MachinesOperation } from '../enums/machines.enum';
import { NotificationsOperation } from '../enums/notifications.enum';
import { PermissionsOperation } from '../enums/permission.enum';
import { RecipesOperation } from '../enums/recipes.enum';
import { ReportsOperation } from '../enums/report.enum';
import { UsersOperation } from '../enums/users.enum';

export const OperationsModule = {
	MACHINES: MachinesOperation,
	USERS: UsersOperation,
	REPORTS: ReportsOperation,
	PERMISSION: PermissionsOperation,
	RECIPES: RecipesOperation,
	NOTIFICATIONS: NotificationsOperation,
	CHANGE_LOG: ChangeLogsOperation,
};
