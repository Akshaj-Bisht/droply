import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";

export function useCreateFile() {
  return useMutation(orpc.file.create.mutationOptions());
}

export function useGetFile(token: string) {
  return useQuery(
    orpc.file.get.queryOptions({
      input: { token },
    }),
  );
}
