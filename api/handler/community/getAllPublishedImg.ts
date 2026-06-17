import prisma from "@/plugin/prismaClient";

// 获取所有已发布的图片，公共公开，无需验证权限
export default async function ({}: any) {
  const result = await prisma.imageCommunity.findMany({
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
      img: {
        select: {
          imgUrl: true,
          model: true,
          time: true,
          prompt: true,
        },
      },
      user: {
        select: {
          name: true,
          avatar: true,
          phoneNumber: true,
        },
      },
      pageView: true,
      likes: true,
    },
  });

  const remap = result.map(({ id, img, user, pageView, likes }) => {
    let imgUrl;
    if (img.imgUrl === "") imgUrl = "";
    else {
      if (img.imgUrl.startsWith("/media/genImg/")) {
        const splitPath = img.imgUrl.split("/");
        const imgName =
          splitPath[splitPath.length - 1].split(".")[0] + "gz.webp";
        splitPath.pop();
        splitPath.push(imgName);
        imgUrl = splitPath.join("/");
      } else imgUrl = img.imgUrl;
    }

    const splitPrompt = img.prompt.split("】")[1];
    return {
      id,
      img: {
        ...img,
        imgUrl,
        prompt: splitPrompt !== undefined ? splitPrompt : img.prompt,
      },
      user: {
        ...user,
        avatar: user.avatar || "",
      },
      pageView,
      likes: likes.length,
    };
  });

  return { status: 0, data: remap };
}
