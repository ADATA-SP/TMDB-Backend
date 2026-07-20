const machines_edit = 'edit-machines';
const machines_show = 'show-machines';
const machines_sync = 'sync-machines';
const machines_delete = 'delete-machines';

export const MachinesOperation = {
	READ: [machines_edit, machines_show],
	UPDATE: [machines_edit],
	CHANGE_STATUS: [machines_edit],
	SYNC: [machines_sync],
	DELETE: [machines_delete],
};
