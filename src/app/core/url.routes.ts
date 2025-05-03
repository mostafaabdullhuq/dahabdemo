const withBase = (base: string, path: string) => `${base}/${path}`;

const userManagementBase = 'user-management';

export const urlRoutes = {
  dashboard: 'dashboard',
  settings: 'settings',

  userManagement: {
    base: userManagementBase,
    users: 'users',
    addUser: 'users/add',
    editUser: 'users/edit',
    roles:'roles',
    addRoles:'roles/add',
    editRoles:'roles/edit',
  },
};