/* 
  此脚本用户获取数据库中的配置信息，并将其存储在config对象中。
  !注意：当数据库中配置数据修改后，需要重启程序才能正常获取最新的配置信息。
  之所以这种做是为了节省查询数据库的开销，因为当数据不可控时可能每个需要配置信息的接口在请求时都需要重新查询。
*/

import prisma from "@/plugin/prismaClient";

let config: any = {};
let isExist = false;
async function write() {
  const result = await prisma.configuration.findMany({
    select: {
      name: true,
      value: true,
    },
  });
  result.forEach(({ name, value }) => (config[name] = value));
}
export const writeConfig = (name: string, value: string) => {
  config[name] = value;
};
export const getConfig = async () => {
  if (!isExist) {
    await write().finally(() => {
      isExist = true;
    });
    return config;
  } else return config;
};
