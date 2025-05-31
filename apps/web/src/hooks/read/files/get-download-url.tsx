import { isDefined } from '@read-n-feed/shared';
import { useQuery } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosBase } from '@/lib';

export const useGetDownloadUrl = ({
  fileId,
  enabled,
}: {
  fileId?: string | null;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: [...QueryKey.BookFiles.DownloadUrl(fileId || 'none')],
    queryFn: async () => {
      if (!isDefined(fileId)) {
        return null;
      }

      return axiosBase.get<{ url: string }>(ApiRoute.BookFiles.GetUrl(fileId));
    },
    enabled: enabled,
  });
};
