import { createUploadSession, getUploadSession } from "./file.procedure";

export const router = {
  file: {
    createSession: createUploadSession,
    getSession: getUploadSession,
  },
};
export type AppRouter = typeof router;
