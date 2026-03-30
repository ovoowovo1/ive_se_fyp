import { buildAssetUrl } from 'shared/config/env';

test('buildAssetUrl normalizes Windows paths', () => {
  expect(buildAssetUrl('uploadAdminIMG\\admin.png')).toContain('/uploadAdminIMG/admin.png');
});
