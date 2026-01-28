import { createFile, getFile } from "./file";

export const router = {
  file: {
    create: createFile,
    get: getFile,
  },
};

export type AppRouter = typeof router;
