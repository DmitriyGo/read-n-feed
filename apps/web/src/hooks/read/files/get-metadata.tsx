import { BookFormatDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { useQuery } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { useAuth } from '@/hooks/use-auth';
import { axiosSecure } from '@/lib';

export const useGetMetadata = ({
  fileId,
  enabled = true,
}: {
  fileId?: string | null;
  enabled: boolean;
}) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [QueryKey.Metadata, accessToken, fileId],
    queryFn: async () => {
      if (!isDefined(fileId)) {
        return;
      }

      return axiosSecure.get<{
        fileSize: number;
        format: BookFormatDto;
        filename: string;
      }>(ApiRoute.BookFiles.GetMetadata(fileId));
    },
    enabled: isDefined(accessToken) && enabled,
  });
};
