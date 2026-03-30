import {
  clearSession,
  persistAdminSession,
  readSession,
  STORAGE_KEYS,
} from '../session';

describe('session helpers', () => {
  beforeEach(() => {
    clearSession();
  });

  it('persists admin session with donate permission from the API payload', () => {
    persistAdminSession({
      token: 'token-1',
      Login_id: 'admin01',
      username: 'Admin Name',
      userimage: 'uploadAdminIMG/admin.png',
      Admin_Permission_User: '1',
      Admin_Permission_Admin: '1',
      Admin_Permission_Analysis: '0',
      Admin_Permission_Announcement: '1',
      Admin_Permission_Violation: '0',
      Admin_Permission_Donate: '1',
    });

    const session = readSession();

    expect(session.token).toBe('token-1');
    expect(session.loginId).toBe('admin01');
    expect(session.permissions.donate).toBe('1');
    expect(localStorage.getItem(STORAGE_KEYS.adminPermissionDonate)).toBe('1');
  });
});
