import {
  FavouriteBooks,
  LikedBooks,
  ShowProfileInfo,
  UpdateProfileInfo,
} from '@/components/pages';

export const ProfilePage = () => {
  return (
    <>
      <ShowProfileInfo />

      <UpdateProfileInfo />

      <LikedBooks />

      <FavouriteBooks />
    </>
  );
};
