import {
  PrismaClient,
  Provider,
  Role,
  BookFormat,
  BookRequestStatus,
  SubscriptionPlan,
} from '@prisma/client';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Configuration
const UPLOAD_DIR = 'uploads';
const NUM_USERS = 50;
const NUM_ADMINS = 3;
const NUM_AUTHORS = 40;
const NUM_GENRES = 15;
const NUM_TAGS = 25;
const NUM_BOOK_FILES = 150; // Some books will have multiple formats
const NUM_COMMENTS = 150;
const NUM_READING_PROGRESS = 200;
const NUM_LIKES = 300;
const NUM_BOOK_REQUESTS = 20;

// Ensure uploads directory exists (recreate it)
function ensureUploadDirExists() {
  if (fs.existsSync(UPLOAD_DIR)) {
    // Remove existing uploads directory and its contents
    fs.rmSync(UPLOAD_DIR, { recursive: true, force: true });
  }
  // Create fresh uploads directory
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Generate a secure random password hash (using bcrypt would be better in production)
function generatePasswordHash(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Create empty file for book files
function createEmptyFile(fileName: string, sizeInKB = 100): string {
  const filePath = path.join(UPLOAD_DIR, fileName);
  const buffer = Buffer.alloc(sizeInKB * 1024);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

// Helper function to get n unique random items from an array
function getUniqueRandomItems<T>(array: T[], n: number): T[] {
  const arrayCopy = [...array]; // Clone to avoid modifying original
  const result: T[] = [];

  // Get min of requested items or array length
  const count = Math.min(n, arrayCopy.length);

  for (let i = 0; i < count; i++) {
    // Get random index from remaining items
    const index = Math.floor(Math.random() * arrayCopy.length);
    // Add to result and remove from copy to ensure uniqueness
    result.push(arrayCopy[index]);
    arrayCopy.splice(index, 1);
  }

  return result;
}

// Generate sample data for each entity
async function seed() {
  console.log('Starting database seeding...');
  ensureUploadDirExists();

  // Clear existing data
  await clearDatabase();

  // Create users
  console.log('Creating users...');
  const users = await createUsers();

  // Create authors
  console.log('Creating authors...');
  const authors = await createAuthors();

  // Create genres
  console.log('Creating genres...');
  const genres = await createGenres();

  // Create tags
  console.log('Creating tags...');
  const tags = await createTags();

  // Create books
  console.log('Creating books...');
  const books = await createBooks(authors, genres, tags);

  // Create book files
  console.log('Creating book files...');
  await createBookFiles(books);

  // Create reading progress
  console.log('Creating reading progress...');
  await createReadingProgress(books, users);

  // Create comments
  console.log('Creating comments...');
  await createComments(books, users);

  // Create likes
  console.log('Creating likes...');
  await createLikes(books, users);

  // Create book requests
  console.log('Creating book requests...');
  await createBookRequests(users, authors, genres, tags);

  console.log('Seeding completed successfully!');
}

// Clear existing data
async function clearDatabase() {
  console.log('Clearing existing data...');

  // The deletion order is important to avoid foreign key constraint errors
  await prisma.bookLike.deleteMany({});
  await prisma.bookComment.deleteMany({});
  await prisma.readingProgress.deleteMany({});
  await prisma.bookFile.deleteMany({});
  await prisma.bookTag.deleteMany({});
  await prisma.bookGenre.deleteMany({});
  await prisma.bookAuthor.deleteMany({});
  await prisma.bookFileRequest.deleteMany({});
  await prisma.bookRequest.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.author.deleteMany({});
  await prisma.genre.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
}

// Create users
async function createUsers() {
  const password = generatePasswordHash('Password123!');

  // Create admin users
  const admins: any[] = [];
  for (let i = 0; i < NUM_ADMINS; i++) {
    admins.push({
      id: crypto.randomUUID(),
      email: `admin${i + 1}@example.com`,
      password,
      provider: 'LOCAL' as Provider,
      roles: ['ADMIN', 'USER'] as Role[],
      isBlocked: false,
      username: `admin${i + 1}`,
      firstName: `Admin${i + 1}`,
      lastName: 'User',
      avatarUrl: null,
      preferredLanguage: 'en',
      subscriptionPlan: 'PREMIUM' as SubscriptionPlan,
      metadata: null,
    });
  }

  // Create regular users
  const regularUsers: any[] = [];
  for (let i = 0; i < NUM_USERS; i++) {
    regularUsers.push({
      id: crypto.randomUUID(),
      email: `user${i + 1}@example.com`,
      password,
      provider: 'LOCAL' as Provider,
      roles: ['USER'] as Role[],
      isBlocked: false,
      username: `user${i + 1}`,
      firstName: `User${i + 1}`,
      lastName: 'Reader',
      avatarUrl: null,
      preferredLanguage: Math.random() > 0.7 ? 'fr' : 'en',
      subscriptionPlan: (Math.random() > 0.8
        ? 'PREMIUM'
        : 'FREE') as SubscriptionPlan,
      metadata: null,
    });
  }

  // Create all users
  const users = [...admins, ...regularUsers];
  await prisma.user.createMany({ data: users });

  return users;
}

// Create authors
async function createAuthors() {
  const authors = [
    {
      name: 'J.K. Rowling',
      bio: 'British author best known for the Harry Potter series',
    },
    {
      name: 'Stephen King',
      bio: 'American author of horror, supernatural fiction, suspense, and fantasy novels',
    },
    {
      name: 'Harper Lee',
      bio: 'American novelist best known for her 1960 novel To Kill a Mockingbird',
    },
    {
      name: 'Jane Austen',
      bio: 'English novelist known primarily for her six major novels',
    },
    {
      name: 'Mark Twain',
      bio: 'American writer, humorist, entrepreneur, publisher, and lecturer',
    },
    {
      name: 'George Orwell',
      bio: 'English novelist, essayist, journalist, and critic',
    },
    {
      name: 'Agatha Christie',
      bio: 'English writer known for her detective novels',
    },
    {
      name: 'Ernest Hemingway',
      bio: 'American novelist, short-story writer, and journalist',
    },
    { name: 'Virginia Woolf', bio: 'English writer, modernist author' },
    {
      name: 'F. Scott Fitzgerald',
      bio: 'American fiction writer, Jazz Age novelist',
    },
    {
      name: 'Leo Tolstoy',
      bio: 'Russian author of War and Peace and Anna Karenina',
    },
    { name: 'Charles Dickens', bio: 'English novelist and social critic' },
    {
      name: 'Fyodor Dostoevsky',
      bio: 'Russian novelist, author of Crime and Punishment',
    },
    { name: 'Emily Brontë', bio: 'English novelist and poet' },
    { name: 'Neil Gaiman', bio: 'English author of novels and graphic novels' },
    {
      name: 'Gabriel García Márquez',
      bio: 'Colombian novelist known for magical realism',
    },
    {
      name: 'Margaret Atwood',
      bio: 'Canadian author, poet, and environmental activist',
    },
    { name: 'Kazuo Ishiguro', bio: 'British novelist and screenwriter' },
    {
      name: 'J.D. Salinger',
      bio: 'American author known for The Catcher in the Rye',
    },
    {
      name: 'J.R.R. Tolkien',
      bio: 'English author of The Hobbit and The Lord of the Rings',
    },
    {
      name: 'Oscar Wilde',
      bio: 'Irish poet and playwright, famous for The Picture of Dorian Gray',
    },
  ];

  // Add more authors to reach the desired number
  for (let i = authors.length; i < NUM_AUTHORS; i++) {
    authors.push({
      name: `Author ${i + 1}`,
      bio: `Biography for Author ${i + 1}, who has written several popular books in various genres.`,
    });
  }

  // Add UUIDs and dates for some authors
  const authorsWithIds = authors.map((author) => ({
    id: crypto.randomUUID(),
    ...author,
    dateOfBirth:
      Math.random() > 0.3
        ? new Date(
            1950 + Math.floor(Math.random() * 50),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1,
          )
        : null,
    dateOfDeath:
      Math.random() > 0.8
        ? new Date(
            2010 + Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1,
          )
        : null,
  }));

  await prisma.author.createMany({ data: authorsWithIds });

  return authorsWithIds;
}

// Create genres
async function createGenres() {
  const genres = [
    { name: 'Fiction' },
    { name: 'Non-Fiction' },
    { name: 'Mystery' },
    { name: 'Thriller' },
    { name: 'Science Fiction' },
    { name: 'Fantasy' },
    { name: 'Romance' },
    { name: 'Horror' },
    { name: 'Biography' },
    { name: 'History' },
    { name: 'Young Adult' },
    { name: "Children's" },
    { name: 'Self-Help' },
    { name: 'Business' },
    { name: 'Psychology' },
  ].slice(0, NUM_GENRES);

  // Add UUIDs
  const genresWithIds = genres.map((genre) => ({
    id: crypto.randomUUID(),
    ...genre,
  }));

  await prisma.genre.createMany({ data: genresWithIds });

  return genresWithIds;
}

// Create tags
async function createTags() {
  const tags = [
    { label: 'bestseller' },
    { label: 'classic' },
    { label: 'award-winner' },
    { label: 'recommended' },
    { label: 'summer-reading' },
    { label: 'beach-read' },
    { label: 'page-turner' },
    { label: 'thought-provoking' },
    { label: 'character-driven' },
    { label: 'plot-driven' },
    { label: 'dark' },
    { label: 'funny' },
    { label: 'emotional' },
    { label: 'inspirational' },
    { label: 'philosophical' },
    { label: 'dystopian' },
    { label: 'adventure' },
    { label: 'action' },
    { label: 'romance' },
    { label: 'coming-of-age' },
    { label: 'historical' },
    { label: 'political' },
    { label: 'suspense' },
    { label: 'magical-realism' },
    { label: 'short-stories' },
  ].slice(0, NUM_TAGS);

  // Add UUIDs
  const tagsWithIds = tags.map((tag) => ({
    id: crypto.randomUUID(),
    ...tag,
  }));

  await prisma.tag.createMany({ data: tagsWithIds });

  return tagsWithIds;
}

// Create books
async function createBooks(authors: any[], genres: any[], tags: any[]) {
  const books: any[] = [];

  // Famous books
  const famousBooks = [
    {
      title: 'To Kill a Mockingbird',
      description:
        'A novel about racial injustice and moral growth in the American South.',
      authorIndexes: [2],
      genreIndexes: [0, 9],
      tagIndexes: [1, 7, 19],
      publishedYear: 1960,
    },
    {
      title: '1984',
      description:
        'A dystopian novel about a totalitarian regime and the rebellion against it.',
      authorIndexes: [5],
      genreIndexes: [0, 4],
      tagIndexes: [1, 15, 21],
      publishedYear: 1949,
    },
    {
      title: 'Pride and Prejudice',
      description:
        'A romantic novel about the emotional development of Elizabeth Bennet.',
      authorIndexes: [3],
      genreIndexes: [0, 6],
      tagIndexes: [1, 6, 19],
      publishedYear: 1813,
    },
    {
      title: "Harry Potter and the Philosopher's Stone",
      description:
        'A young wizard discovers his magical heritage and begins his education at Hogwarts.',
      authorIndexes: [0],
      genreIndexes: [5, 10],
      tagIndexes: [0, 17, 19],
      publishedYear: 1997,
    },
    {
      title: 'The Great Gatsby',
      description:
        'A novel of the Jazz Age that depicts the life of the nouveau riche in the 1920s.',
      authorIndexes: [9],
      genreIndexes: [0],
      tagIndexes: [1, 7, 19],
      publishedYear: 1925,
    },
    {
      title: 'The Catcher in the Rye',
      description:
        "A teenage boy's experiences in New York City, dealing with themes of alienation and rebellion.",
      authorIndexes: [18],
      genreIndexes: [0, 10],
      tagIndexes: [1, 19, 7],
      publishedYear: 1951,
    },
    {
      title: 'The Hobbit',
      description:
        'The journey of Bilbo Baggins to help a group of dwarves reclaim their mountain home from a dragon.',
      authorIndexes: [19],
      genreIndexes: [5],
      tagIndexes: [17, 16, 6],
      publishedYear: 1937,
    },
    {
      title: 'Crime and Punishment',
      description:
        'A novel about a poor ex-student who murders a pawnbroker for her money, dealing with themes of guilt and redemption.',
      authorIndexes: [12],
      genreIndexes: [0],
      tagIndexes: [1, 7, 14],
      publishedYear: 1866,
    },
    {
      title: 'One Hundred Years of Solitude',
      description:
        'The multi-generational story of the Buendía family in the fictional Colombian town of Macondo.',
      authorIndexes: [16],
      genreIndexes: [0],
      tagIndexes: [1, 23, 7],
      publishedYear: 1967,
    },
    {
      title: 'Brave New World',
      description:
        'A dystopian novel about a futuristic society where people are engineered and conditioned to serve the state.',
      authorIndexes: [4],
      genreIndexes: [0, 4, 5],
      tagIndexes: [15, 7, 14],
      publishedYear: 1932,
    },
    {
      title: 'The Lord of the Rings',
      description:
        "An epic fantasy adventure about a hobbit's quest to destroy a powerful ring and defeat the Dark Lord Sauron.",
      authorIndexes: [19],
      genreIndexes: [5],
      tagIndexes: [17, 16, 6],
      publishedYear: 1954,
    },
    {
      title: 'Wuthering Heights',
      description:
        'A passionate and turbulent story of love, revenge, and social conflict set on the Yorkshire moors.',
      authorIndexes: [12],
      genreIndexes: [0, 6],
      tagIndexes: [1, 11, 12],
      publishedYear: 1847,
    },
    {
      title: 'The Grapes of Wrath',
      description:
        'The story of a family of tenant farmers driven from their Oklahoma home during the Great Depression.',
      authorIndexes: [6],
      genreIndexes: [0, 9],
      tagIndexes: [1, 7, 14],
      publishedYear: 1939,
    },
    {
      title: 'Moby-Dick',
      description:
        'The obsessive quest of Captain Ahab for revenge against the white whale that bit off his leg.',
      authorIndexes: [3],
      genreIndexes: [0, 16],
      tagIndexes: [1, 17, 7],
      publishedYear: 1851,
    },
    {
      title: 'Anna Karenina',
      description:
        'A complex novel about family, society, and the tragic consequences of an affair in Russian high society.',
      authorIndexes: [9],
      genreIndexes: [0, 6],
      tagIndexes: [1, 7, 12],
      publishedYear: 1877,
    },
    {
      title: "The Handmaid's Tale",
      description:
        'A dystopian novel set in a near-future totalitarian state where fertile women are forced into reproductive servitude.',
      authorIndexes: [17],
      genreIndexes: [0, 4, 5],
      tagIndexes: [15, 7, 21],
      publishedYear: 1985,
    },
    {
      title: 'The Picture of Dorian Gray',
      description:
        'A philosophical novel about a man whose portrait ages while he remains young and beautiful.',
      authorIndexes: [20],
      genreIndexes: [0, 7],
      tagIndexes: [1, 7, 14],
      publishedYear: 1890,
    },
    {
      title: 'The Chronicles of Narnia: The Lion, the Witch and the Wardrobe',
      description:
        'Four siblings discover a magical wardrobe that leads to the fantasy world of Narnia.',
      authorIndexes: [14],
      genreIndexes: [5, 11],
      tagIndexes: [17, 16, 13],
      publishedYear: 1950,
    },
    {
      title: 'The Alchemist',
      description:
        'A philosophical novel about a young Andalusian shepherd who travels to Egypt after having a recurring dream of finding treasure there.',
      authorIndexes: [16],
      genreIndexes: [0, 5],
      tagIndexes: [13, 14, 7],
      publishedYear: 1988,
    },
    {
      title: 'Frankenstein',
      description:
        'A novel about a young scientist who creates a sapient creature in an unorthodox scientific experiment.',
      authorIndexes: [2],
      genreIndexes: [0, 4, 7],
      tagIndexes: [1, 7, 15],
      publishedYear: 1818,
    },
    {
      title: 'Jane Eyre',
      description:
        'A novel about the emotional and spiritual development of an orphaned girl who becomes a governess.',
      authorIndexes: [12],
      genreIndexes: [0, 6],
      tagIndexes: [1, 7, 12],
      publishedYear: 1847,
    },
    {
      title: 'The Road',
      description:
        "A post-apocalyptic novel about a father and son's journey through a devastated America.",
      authorIndexes: [6],
      genreIndexes: [0, 4],
      tagIndexes: [15, 12, 7],
      publishedYear: 2006,
    },
    {
      title: 'American Gods',
      description:
        'A novel about a battle between traditional gods from mythology and modern gods representing technology and media.',
      authorIndexes: [13],
      genreIndexes: [0, 5],
      tagIndexes: [23, 17, 14],
      publishedYear: 2001,
    },
    {
      title: 'The Shining',
      description:
        'A novel about a family that becomes isolated at a hotel for the winter where an evil presence influences the father into violence.',
      authorIndexes: [1],
      genreIndexes: [7],
      tagIndexes: [11, 22, 6],
      publishedYear: 1977,
    },
    {
      title: 'Never Let Me Go',
      description:
        'A novel about students at a seemingly idyllic English boarding school and their fate in a dystopian world.',
      authorIndexes: [19],
      genreIndexes: [0, 4],
      tagIndexes: [15, 7, 12],
      publishedYear: 2005,
    },
    {
      title: 'The Fault in Our Stars',
      description:
        'A touching love story between two teens who meet at a cancer support group.',
      authorIndexes: [20],
      genreIndexes: [10, 6],
      tagIndexes: [12, 19],
      publishedYear: 2012,
    },
    {
      title: 'The Hunger Games',
      description:
        'A dystopian survival game where teenagers must fight to the death on live TV.',
      authorIndexes: [21],
      genreIndexes: [4, 5],
      tagIndexes: [17, 22],
      publishedYear: 2008,
    },
    {
      title: 'The Book Thief',
      description:
        'A girl discovers the power of books during Nazi Germany, narrated by Death.',
      authorIndexes: [22],
      genreIndexes: [9, 0],
      tagIndexes: [12, 14],
      publishedYear: 2005,
    },
    {
      title: 'The Da Vinci Code',
      description:
        'A symbologist uncovers secrets about the Holy Grail through hidden clues.',
      authorIndexes: [23],
      genreIndexes: [3, 2],
      tagIndexes: [22, 9],
      publishedYear: 2003,
    },
    {
      title: 'A Game of Thrones',
      description:
        'Noble families clash for power in the fantasy land of Westeros.',
      authorIndexes: [24],
      genreIndexes: [5],
      tagIndexes: [17, 10],
      publishedYear: 1996,
    },
    {
      title: 'The Girl on the Train',
      description:
        'A woman gets involved in a missing person case she glimpses from a train.',
      authorIndexes: [25],
      genreIndexes: [2, 3],
      tagIndexes: [22, 10],
      publishedYear: 2015,
    },
    {
      title: 'Gone Girl',
      description:
        'A thriller exploring the disappearance of a woman and the secrets behind her marriage.',
      authorIndexes: [26],
      genreIndexes: [2, 3],
      tagIndexes: [14, 10],
      publishedYear: 2012,
    },
    {
      title: 'Life of Pi',
      description:
        'A boy survives a shipwreck and shares a lifeboat with a Bengal tiger.',
      authorIndexes: [27],
      genreIndexes: [0, 16],
      tagIndexes: [14, 8],
      publishedYear: 2001,
    },
    {
      title: 'The Kite Runner',
      description:
        'A man reflects on a childhood betrayal in war-torn Afghanistan.',
      authorIndexes: [28],
      genreIndexes: [0, 9],
      tagIndexes: [12, 20],
      publishedYear: 2003,
    },
    {
      title: 'The Perks of Being a Wallflower',
      description:
        'A shy teenager navigates high school life and personal trauma.',
      authorIndexes: [29],
      genreIndexes: [10],
      tagIndexes: [19, 12],
      publishedYear: 1999,
    },
    {
      title: 'The Giver',
      description:
        'A boy is chosen to receive the memories of a colorless, dystopian world.',
      authorIndexes: [30],
      genreIndexes: [4, 5],
      tagIndexes: [14, 7],
      publishedYear: 1993,
    },
    {
      title: 'The Maze Runner',
      description:
        'Teenagers trapped in a deadly maze try to find their way out.',
      authorIndexes: [31],
      genreIndexes: [4, 10],
      tagIndexes: [22, 17],
      publishedYear: 2009,
    },
    {
      title: 'Twilight',
      description:
        'A high school girl falls in love with a mysterious vampire.',
      authorIndexes: [32],
      genreIndexes: [5, 6],
      tagIndexes: [19, 8],
      publishedYear: 2005,
    },
    {
      title: 'Divergent',
      description:
        "In a divided society, a girl discovers she doesn't fit into just one faction.",
      authorIndexes: [33],
      genreIndexes: [4, 10],
      tagIndexes: [17, 10],
      publishedYear: 2011,
    },
    {
      title: 'Percy Jackson and the Olympians',
      description:
        "A boy discovers he's the son of Poseidon and goes on epic quests.",
      authorIndexes: [34],
      genreIndexes: [5, 10],
      tagIndexes: [16, 11],
      publishedYear: 2005,
    },
    {
      title: "The Time Traveler's Wife",
      description:
        'A man with a genetic disorder that causes him to time travel struggles with love.',
      authorIndexes: [35],
      genreIndexes: [6, 4],
      tagIndexes: [12, 8],
      publishedYear: 2003,
    },
    {
      title: 'The Lovely Bones',
      description:
        'A murdered girl watches over her family from the afterlife.',
      authorIndexes: [36],
      genreIndexes: [0],
      tagIndexes: [12, 22],
      publishedYear: 2002,
    },
    {
      title: 'Room',
      description:
        'A young boy grows up in captivity with his mother, then escapes into the world.',
      authorIndexes: [37],
      genreIndexes: [0],
      tagIndexes: [10, 12],
      publishedYear: 2010,
    },
    {
      title: 'Water for Elephants',
      description:
        'A young man joins a circus and falls in love during the Great Depression.',
      authorIndexes: [38],
      genreIndexes: [9, 6],
      tagIndexes: [14, 8],
      publishedYear: 2006,
    },
    {
      title: 'The Shadow of the Wind',
      description:
        "A boy uncovers a mysterious author's past in post-war Barcelona.",
      authorIndexes: [39],
      genreIndexes: [2, 9],
      tagIndexes: [14, 22],
      publishedYear: 2001,
    },
    {
      title: 'Memoirs of a Geisha',
      description:
        'A young girl is trained to become a geisha in pre-WWII Japan.',
      authorIndexes: [40],
      genreIndexes: [9, 6],
      tagIndexes: [12, 14],
      publishedYear: 1997,
    },
    {
      title: 'Me Before You',
      description:
        'A woman becomes caretaker for a paralyzed man and falls in love.',
      authorIndexes: [41],
      genreIndexes: [6, 0],
      tagIndexes: [12, 14],
      publishedYear: 2012,
    },
    {
      title: 'The Night Circus',
      description: 'Two magicians compete in a mysterious, magical circus.',
      authorIndexes: [42],
      genreIndexes: [5, 6],
      tagIndexes: [23, 7],
      publishedYear: 2011,
    },
    {
      title: 'Big Little Lies',
      description:
        'A murder mystery unfolds among mothers at a prestigious elementary school.',
      authorIndexes: [43],
      genreIndexes: [3, 0],
      tagIndexes: [22, 8],
      publishedYear: 2014,
    },
    {
      title: 'The Silent Patient',
      description:
        'A woman stops speaking after murdering her husband — a therapist seeks the truth.',
      authorIndexes: [44],
      genreIndexes: [2, 3],
      tagIndexes: [22, 10],
      publishedYear: 2019,
    },
  ];

  // Add famous books
  for (const famousBook of famousBooks) {
    const bookAuthors = famousBook.authorIndexes.map(
      (idx) => authors[idx % authors.length],
    );
    const bookGenres = famousBook.genreIndexes.map(
      (idx) => genres[idx % genres.length],
    );
    const bookTags = famousBook.tagIndexes.map(
      (idx) => tags[idx % tags.length],
    );

    // Ensure unique selections
    const uniqueAuthors = [
      ...new Map(bookAuthors.map((a) => [a.id, a])).values(),
    ];
    const uniqueGenres = [
      ...new Map(bookGenres.map((g) => [g.id, g])).values(),
    ];
    const uniqueTags = [...new Map(bookTags.map((t) => [t.id, t])).values()];

    const publicationDate = new Date(
      famousBook.publishedYear,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1,
    );

    const bookId = crypto.randomUUID();

    // First create the book
    await prisma.book.create({
      data: {
        id: bookId,
        title: famousBook.title,
        description: famousBook.description,
        coverImageUrl: `https://picsum.photos/seed/${bookId}/300/450`,
        publicationDate,
        publisher: 'Famous Publishing House',
        language: 'en',
        averageRating: 4 + Math.random(),
        totalLikes: Math.floor(Math.random() * 1000),
        createdAt: new Date(2023, 0, 1),
        updatedAt: new Date(),
      },
    });

    books.push({
      id: bookId,
      title: famousBook.title,
      description: famousBook.description,
      coverImageUrl: `https://picsum.photos/seed/${bookId}/300/450`,
      publicationDate,
      publisher: 'Famous Publishing House',
      language: 'en',
      averageRating: 4 + Math.random(),
      totalLikes: Math.floor(Math.random() * 1000),
      createdAt: new Date(2023, 0, 1),
      updatedAt: new Date(),
    });

    // Add relationships after book is created
    await Promise.all([
      // Add authors
      ...uniqueAuthors.map((author) =>
        prisma.bookAuthor.create({
          data: {
            bookId,
            authorId: author.id,
          },
        }),
      ),

      // Add genres
      ...uniqueGenres.map((genre) =>
        prisma.bookGenre.create({
          data: {
            bookId,
            genreId: genre.id,
          },
        }),
      ),

      // Add tags
      ...uniqueTags.map((tag) =>
        prisma.bookTag.create({
          data: {
            bookId,
            tagId: tag.id,
          },
        }),
      ),
    ]);
  }

  return books;
}

// Create book files
async function createBookFiles(books: any[]) {
  const bookFiles: any[] = [];
  const formats = Object.values(BookFormat);

  // Create some files for each book
  for (let i = 0; i < NUM_BOOK_FILES; i++) {
    const book = books[Math.floor(Math.random() * books.length)];
    const format = formats[0];
    const extension = format.toLowerCase();

    const fileName = `${crypto.randomUUID()}.${extension}`;
    const filePath = createEmptyFile(
      fileName,
      1000 + Math.floor(Math.random() * 9000),
    ); // 1-10MB dummy file

    const fileId = crypto.randomUUID();

    bookFiles.push({
      id: fileId,
      bookId: book.id,
      format,
      filePath,
      fileSize: Math.floor(Math.random() * 10000000) + 100000, // 100KB - 10MB
      filename: `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`,
      mimeType: getMimeType(format),
      metadata: {
        pageCount: Math.floor(Math.random() * 500) + 50,
        language: book.language || 'en',
      },
      isValidated: true,
      checksum: crypto.randomBytes(16).toString('hex'),
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
      ), // Up to 30 days ago
    });
  }

  await prisma.bookFile.createMany({ data: bookFiles });
  return bookFiles;
}

// Helper function to determine MIME type
function getMimeType(format: BookFormat): string {
  switch (format) {
    case 'PDF':
      return 'application/pdf';
    case 'EPUB':
      return 'application/epub+zip';
    case 'FB2':
      return 'application/xml';
    case 'MOBI':
      return 'application/x-mobipocket-ebook';
    case 'AZW3':
      return 'application/vnd.amazon.ebook';
    default:
      return 'application/octet-stream';
  }
}

// Create reading progress
async function createReadingProgress(books: any[], users: any[]) {
  const readingProgress: any[] = [];
  // Track combinations to avoid duplicates
  const trackCombinations = new Set<string>();

  for (let i = 0; i < NUM_READING_PROGRESS; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const book = books[Math.floor(Math.random() * books.length)];
    const progress = Math.random() * 100; // 0-100%
    const deviceId = ['laptop', 'phone', 'tablet', ''][
      Math.floor(Math.random() * 4)
    ]; // Sometimes empty for default

    // Create a unique key for this combination
    const key = `${user.id}-${book.id}-${deviceId || 'default'}`;

    // Skip if this combination already exists
    if (trackCombinations.has(key)) {
      continue;
    }

    trackCombinations.add(key);

    readingProgress.push({
      id: crypto.randomUUID(),
      userId: user.id,
      bookId: book.id,
      progress,
      deviceId,
      updatedAt: new Date(
        Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
      ), // Up to 30 days ago
      metadata: {
        pageNumber: Math.floor(Math.random() * 300) + 1,
        totalPages: 300,
        position:
          Math.random() > 0.5
            ? `/4/${Math.floor(Math.random() * 10)}/6/1:${Math.floor(Math.random() * 100)}`
            : null,
      },
    });
  }

  // Only create reading progress entries if there are any valid ones
  if (readingProgress.length > 0) {
    await prisma.readingProgress.createMany({ data: readingProgress });
  }

  return readingProgress;
}

// Create comments
async function createComments(books: any[], users: any[]) {
  const comments: any[] = [];

  for (let i = 0; i < NUM_COMMENTS; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const book = books[Math.floor(Math.random() * books.length)];
    const createdAt = new Date(
      Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000),
    ); // Up to 60 days ago

    comments.push({
      id: crypto.randomUUID(),
      userId: user.id,
      bookId: book.id,
      content: `This is comment ${i + 1} about "${book.title}". It contains some thoughts about the book.`,
      parentCommentId: null, // Could add reply logic if needed
      createdAt,
      updatedAt:
        Math.random() > 0.8
          ? new Date(
              createdAt.getTime() +
                Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000),
            )
          : createdAt,
    });
  }

  await prisma.bookComment.createMany({ data: comments });

  // Add some replies
  const replies: any[] = [];
  const parentComments = comments.slice(0, Math.min(30, comments.length));

  for (let i = 0; i < Math.min(50, NUM_COMMENTS / 3); i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const parentComment =
      parentComments[Math.floor(Math.random() * parentComments.length)];

    // Ensure parentComment has the required properties
    if (
      parentComment &&
      parentComment.createdAt &&
      parentComment.bookId &&
      parentComment.id
    ) {
      const createdAt = new Date(
        parentComment.createdAt.getTime() +
          Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000),
      ); // 0-5 days after parent

      replies.push({
        id: crypto.randomUUID(),
        userId: user.id,
        bookId: parentComment.bookId,
        content: `This is a reply to comment about "${books.find((b) => b.id === parentComment.bookId)?.title}".`,
        parentCommentId: parentComment.id,
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  if (replies.length > 0) {
    await prisma.bookComment.createMany({ data: replies });
  }

  return [...comments, ...replies];
}

// Create likes
async function createLikes(books: any[], users: any[]) {
  const likes: any[] = [];
  const bookLikes = new Map();

  for (let i = 0; i < NUM_LIKES; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const book = books[Math.floor(Math.random() * books.length)];

    // Avoid duplicate likes
    const key = `${user.id}-${book.id}`;
    if (bookLikes.has(key)) {
      continue;
    }

    bookLikes.set(key, true);

    likes.push({
      userId: user.id,
      bookId: book.id,
      likedAt: new Date(
        Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000),
      ), // Up to 90 days ago
    });
  }

  await prisma.bookLike.createMany({ data: likes });

  // Update book like counts to match actual likes
  for (const book of books) {
    const count = [...bookLikes.keys()].filter((key) =>
      key.endsWith(`-${book.id}`),
    ).length;
    await prisma.book.update({
      where: { id: book.id },
      data: { totalLikes: count },
    });
  }

  return likes;
}

// Create book requests
async function createBookRequests(
  users: any[],
  authors: any[],
  genres: any[],
  tags: any[],
) {
  const statuses: BookRequestStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];
  const requests: any[] = [];

  for (let i = 0; i < NUM_BOOK_REQUESTS; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = new Date(
      Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000),
    ); // Up to 90 days ago

    // Select 1-3 random authors
    const numAuthors = Math.floor(Math.random() * 3) + 1;
    const requestAuthors = getUniqueRandomItems(
      authors.map((a) => a.name),
      numAuthors,
    );

    // Select 1-3 random genres
    const numGenres = Math.floor(Math.random() * 3) + 1;
    const requestGenres = getUniqueRandomItems(
      genres.map((g) => g.name),
      numGenres,
    );

    // Select 1-5 random tags
    const numTags = Math.floor(Math.random() * 5) + 1;
    const requestTags = getUniqueRandomItems(
      tags.map((t) => t.label),
      numTags,
    );

    const request = {
      id: crypto.randomUUID(),
      userId: user.id,
      title: `Requested Book ${i + 1}`,
      description: `Description for requested book ${i + 1}. This is a user-submitted request.`,
      coverImageUrl:
        Math.random() > 0.3
          ? `https://picsum.photos/seed/request${i}/300/450`
          : null,
      publicationDate:
        Math.random() > 0.5
          ? new Date(
              2000 + Math.floor(Math.random() * 23),
              Math.floor(Math.random() * 12),
              Math.floor(Math.random() * 28) + 1,
            )
          : null,
      publisher:
        Math.random() > 0.5
          ? `Publisher ${Math.floor(Math.random() * 10) + 1}`
          : null,
      authorNames: requestAuthors,
      genreNames: requestGenres,
      tagLabels: requestTags,
      status,
      adminNotes:
        status !== 'PENDING' ? `Admin notes for request ${i + 1}` : null,
      rejectionReason:
        status === 'REJECTED'
          ? `This book is already in our catalog or doesn't meet our requirements.`
          : null,
      createdAt,
      updatedAt: new Date(),
      approvedAt:
        status === 'APPROVED'
          ? new Date(
              createdAt.getTime() +
                Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000),
            )
          : null,
      rejectedAt:
        status === 'REJECTED'
          ? new Date(
              createdAt.getTime() +
                Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000),
            )
          : null,
      approvedBy:
        status === 'APPROVED'
          ? users[Math.floor(Math.random() * NUM_ADMINS)].id
          : null,
      rejectedBy:
        status === 'REJECTED'
          ? users[Math.floor(Math.random() * NUM_ADMINS)].id
          : null,
      resultingBookId: null, // We could create books for APPROVED requests
    };

    requests.push(request);
  }

  await prisma.bookRequest.createMany({ data: requests });
  return requests;
}

// Run the seed function
seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Close the Prisma client
    await prisma.$disconnect();
  });
