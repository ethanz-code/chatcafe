// 随机生成验证码缓存区
interface VerifyObject {
  password: string;
  expireTime: number; // s为单位
  createdAt: string; // ISO格式
}
export const verifyCodeBuffer = new Map<string, VerifyObject>();

/** data example:
 * [
 *  '137662': {
 *    password: '123456',
 *    expireTime: 60,
 *    createdAt: '2022-09-01T00:00:00.000Z'
 *  }
 * ]
 */
