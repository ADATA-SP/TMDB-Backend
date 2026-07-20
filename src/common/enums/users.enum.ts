const users_create = 'create-users';
const users_edit = 'edit-users';
const users_show = 'show-users';
const users_notify = 'notify-users';
const users_delete = 'delete-users';

export const UsersOperation = {
	CREATE: [users_create],
	READ: [users_create, users_edit, users_show],
	UPDATE: [users_edit],
	CHANGE_STATUS: [users_edit],
	NOTIFY: [users_notify],
	DELETE: [users_delete],
};
