const machines_edit = 'edit-machines';
const machines_show = 'show-machines';

export const ToolingsOperation = {
	READ: [machines_edit, machines_show],
	LINK_DATAMATRIX: [machines_edit],
};

export enum ToolingStatus {
	LINKED = 'LINKED',
	UNLINKED = 'UNLINKED',
}
