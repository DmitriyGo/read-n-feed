import {
  FavouriteBooks,
  LikedBooks,
  ShowProfileInfo,
  UpdateProfileInfo,
  UpdateProfileAvatar,
} from '@/components/pages';

export const ProfilePage = () => {
  return (
    <>
      <ShowProfileInfo />

      <UpdateProfileAvatar />
      <UpdateProfileInfo />

      <LikedBooks />

      <FavouriteBooks />
    </>
  );
};
