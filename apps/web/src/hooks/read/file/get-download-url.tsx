import { isDefined } from '@read-n-feed/shared';
import { useQuery } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { useAuth } from '@/hooks/use-auth';
import { axiosSecure } from '@/lib';

export const useGetDownloadUrl = ({ fileId }: { fileId?: string | null }) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [QueryKey.DownloadUrl, accessToken, fileId],
    queryFn: async () => {
      if (!isDefined(fileId)) {
        return;
      }

      return axiosSecure.get<{ url: string }>(
        ApiRoute.BookFiles.GetUrl(fileId),
      );
    },
    enabled: isDefined(accessToken),
  });
};
