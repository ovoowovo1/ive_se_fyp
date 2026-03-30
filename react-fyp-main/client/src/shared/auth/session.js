export const STORAGE_KEYS = {
  token: 'token',
  loginId: 'Login_id',
  adminName: 'Admin_Name',
  adminImage: 'Admin_image',
  adminPermissionUser: 'Admin_Permission_User',
  adminPermissionAdmin: 'Admin_Permission_Admin',
  adminPermissionAnalysis: 'Admin_Permission_Analysis',
  adminPermissionAnnouncement: 'Admin_Permission_Announcement',
  adminPermissionViolation: 'Admin_Permission_Violation',
  adminPermissionDonate: 'Admin_Permission_Donate',
};

export const clearSession = () => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};

export const persistAdminSession = (payload) => {
  localStorage.setItem(STORAGE_KEYS.token, payload.token);
  localStorage.setItem(STORAGE_KEYS.loginId, payload.Login_id);
  localStorage.setItem(STORAGE_KEYS.adminName, payload.username);
  localStorage.setItem(STORAGE_KEYS.adminImage, payload.userimage);
  localStorage.setItem(STORAGE_KEYS.adminPermissionUser, payload.Admin_Permission_User);
  localStorage.setItem(STORAGE_KEYS.adminPermissionAdmin, payload.Admin_Permission_Admin);
  localStorage.setItem(STORAGE_KEYS.adminPermissionAnalysis, payload.Admin_Permission_Analysis);
  localStorage.setItem(
    STORAGE_KEYS.adminPermissionAnnouncement,
    payload.Admin_Permission_Announcement,
  );
  localStorage.setItem(STORAGE_KEYS.adminPermissionViolation, payload.Admin_Permission_Violation);
  localStorage.setItem(STORAGE_KEYS.adminPermissionDonate, payload.Admin_Permission_Donate);
};

export const getToken = () => localStorage.getItem(STORAGE_KEYS.token);
export const getLoginId = () => localStorage.getItem(STORAGE_KEYS.loginId);
export const getAdminName = () => localStorage.getItem(STORAGE_KEYS.adminName);
export const getAdminImage = () => localStorage.getItem(STORAGE_KEYS.adminImage);

export const getPermissions = () => ({
  user: localStorage.getItem(STORAGE_KEYS.adminPermissionUser),
  admin: localStorage.getItem(STORAGE_KEYS.adminPermissionAdmin),
  analysis: localStorage.getItem(STORAGE_KEYS.adminPermissionAnalysis),
  announcement: localStorage.getItem(STORAGE_KEYS.adminPermissionAnnouncement),
  violation: localStorage.getItem(STORAGE_KEYS.adminPermissionViolation),
  donate: localStorage.getItem(STORAGE_KEYS.adminPermissionDonate),
});

export const readSession = () => ({
  token: getToken(),
  loginId: getLoginId(),
  adminName: getAdminName(),
  adminImage: getAdminImage(),
  permissions: getPermissions(),
});
