import { BookResponseDto } from '@read-n-feed/application';

import { BookDetails } from '@/components/pages/books/details';

export const MOCK_BOOK: BookResponseDto = {
  id: '1',
  title: 'Book 1',
  description:
    'After nearly eighteen months at Basgiath War College, Violet Sorrengail knows there’s no more time for lessons. No more time for uncertainty. Because the battle has truly begun, and with enemies closing in from outside their walls and within their ranks, it’s impossible to know who to trust. Now Violet must journey beyond the failing Aretian wards to seek allies from unfamiliar lands to stand with Navarre. The trip will test every bit of her wit, luck, and strength, but she will do anything to save what she loves—her dragons, her family, her home, and him. Even if it means keeping a secret so big, it could destroy everything.They need an army. They need power. They need magic. And they need the one thing only Violet can find—the truth.But a storm is coming...and not everyone can survive its wrath.The Empyrean series is best enjoyed in order.',
  coverImageUrl:
    'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimg.buzzfeed.com%2Fbuzzfeed-static%2Fstatic%2F2020-12%2F21%2F0%2Fasset%2Ff69da90b1e93%2Fsub-buzz-5094-1608511484-18.jpg&f=1&nofb=1&ipt=fe93e12f2d1d907c4d8a20caf95a88d43c1473aafe523f39b256422b0d4636d0&ipo=images',
  publisher: 'publisher1',
  createdAt: new Date(),
  updatedAt: new Date(),
  averageRating: 4.5,
  totalLikes: 100,
};

export const BookDetailsPage = () => {
  // const { id } = useParams<{ id: string }>();

  return (
    <div>
      <BookDetails book={MOCK_BOOK} />
    </div>
  );
};
