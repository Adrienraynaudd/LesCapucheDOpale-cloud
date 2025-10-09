import { hashPassword, comparePassword } from '../utils/password.util';
import * as bcrypt from 'bcrypt';

describe('Password Utils', () => {
  it('should hash a password correctly', async () => {
    const hash = await hashPassword('secret');
    expect(hash).toMatch(/^\$2[aby]\$.{56}$/);
  });

  it('should compare password correctly', async () => {
    const hash = await bcrypt.hash('secret', 10);
    const match = await comparePassword('secret', hash);
    expect(match).toBe(true);
  });
});
