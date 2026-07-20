const recipes_create = 'create-recipes';
const recipes_edit = 'edit-recipes';
const recipes_show = 'show-recipes';
const recipes_delete = 'delete-recipes';
const recipes_notify = 'notify-recipes';

export const RecipesOperation = {
	CREATE: [recipes_create],
	READ: [recipes_create, recipes_edit, recipes_show],
	UPDATE: [recipes_edit],
	CHANGE_STATUS: [recipes_edit],
	DELETE: [recipes_delete],
	NOTIFY: [recipes_notify],
};
