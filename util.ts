import { statSync, readdirSync, ReadStream } from "node:fs";
import { extname, join } from "node:path";

export const FallbackMimeType = "application/octet-stream";

export type MdictFileInfo = {
  // 目录（如: 牛津高阶十）下的mdx文件名称。
  // 如: oaldpe.mdx
  mdx: string;
  // 目录（如: 牛津高阶十）下的mdd文件名称，可能有多个。
  // 如: [oaldpe.mdd, oaldpe.1.mdd, oaldpe.2.mdd, ]
  mddArr: string[];
};

// 扫描目录
export const scanDir = (_dir: string) => {
  let rootDir: string;
  try {
    const stats = statSync(_dir);
    if (!stats.isDirectory()) throw "--dir 参数: 必须是目录，要求是绝对路径";
    rootDir = _dir;
  } catch (error) {
    console.error(error);
    throw "--dir 参数: 目录不存在，要求是绝对路径！";
  }

  const results: { mdxDir: string; fileInfo: MdictFileInfo }[] = [];

  // 1. 二级目录搜索
  for (const dirEntry of readdirSync(rootDir)) {
    // 只考虑root目录下的文件夹，不考虑其他
    const stats = statSync(join(_dir, dirEntry));
    if (!stats.isDirectory()) continue;

    const mdxDir = join(rootDir, dirEntry);
    const fileInfo = findMdictInfo(mdxDir);
    if (fileInfo.mdx) results.push({ mdxDir, fileInfo });
  }

  // 2. 没有数据，则可能是一级目录
  if (results.length === 0) {
    const mdxDir = rootDir;
    const fileInfo = findMdictInfo(mdxDir);
    if (fileInfo.mdx) results.push({ mdxDir, fileInfo });
  }

  return results;
};

export function findMdictInfo(mdxDir: string) {
  const mdictInfo: MdictFileInfo = {
    mdx: "",
    mddArr: [],
  };

  // 1. 词典mdx所在文件夹下的1级
  for (const dirEntry of readdirSync(mdxDir)) {
    const stats = statSync(join(mdxDir, dirEntry));

    // 只考虑1级目录下的文件，不考虑其他
    if (!stats.isFile()) continue;

    const ext = extname(dirEntry);
    if (ext === ".mdx") {
      mdictInfo.mdx = dirEntry;
    } else if (ext === ".mdd") {
      mdictInfo.mddArr.push(dirEntry);
    }
  }

  return mdictInfo;
}

export const createStreamBody = (stream: ReadStream) => {
  const body = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      stream.on("end", () => {
        controller.close();
      });
    },
    cancel() {
      stream.destroy();
    },
  });
  return body;
};
