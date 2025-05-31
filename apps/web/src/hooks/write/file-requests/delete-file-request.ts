import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib';

export const useDeleteFileRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileRequestId }: { fileRequestId: string }) => {
      return await axiosSecure.delete(
        ApiRoute.FileRequests.Delete(fileRequestId),
      );
    },
    onSuccess: () => {
      setTimeout(
        () =>
          queryClient.invalidateQueries({
            queryKey: [QueryKey.FileRequests.MyRequests],
            type: 'active',
          }),
        500,
      );

      toast.success('File request deleted successfully');
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
