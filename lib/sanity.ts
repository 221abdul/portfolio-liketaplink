import { Project } from '../types';

/**
 * The requested GROQ query to fetch projects sorted by date
 */
export const PROJECT_QUERY = `*[_type == "project"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  mainImage {
    asset->{
      url
    },
    hotspot
  },
  category,
  publishedAt
}`;

/**
 * Mock data for demonstration purposes since we are in a sandbox environment.
 * In a real Next.js app, you would use `createClient` from `next-sanity`.
 */
export const MOCK_PROJECTS: Project[] = [
  {
    _id: "1",
    title: "Эко-айдентика бренда",
    slug: { current: "ecobrand-identity" },
    mainImage: { asset: { url: "https://picsum.photos/seed/design1/800/1000" } },
    category: "Логотипы",
    publishedAt: "2024-03-01T12:00:00Z"
  },
  {
    _id: "2",
    title: "Веб-интерфейс для финтех продукта",
    slug: { current: "future-finance" },
    mainImage: { asset: { url: "https://picsum.photos/seed/design2/800/1000" } },
    category: "Веб-дизайн",
    publishedAt: "2024-02-28T10:00:00Z"
  },
  {
    _id: "3",
    title: "Инфографика годового роста",
    slug: { current: "growth-info" },
    mainImage: { asset: { url: "https://picsum.photos/seed/design3/800/1000" } },
    category: "Инфографика",
    publishedAt: "2024-02-15T09:00:00Z"
  },
  {
    _id: "4",
    title: "Брендбук Nordic Coffee",
    slug: { current: "nordic-coffee" },
    mainImage: { asset: { url: "https://picsum.photos/seed/design4/800/1000" } },
    category: "Брендбуки",
    publishedAt: "2024-01-20T14:00:00Z"
  },
  {
    _id: "5",
    title: "Редизайн SaaS-панели",
    slug: { current: "saas-dashboard" },
    mainImage: { asset: { url: "https://picsum.photos/seed/design5/800/1000" } },
    category: "Веб-дизайн",
    publishedAt: "2024-01-10T16:00:00Z"
  },
  {
    _id: "6",
    title: "Минималистичный абстрактный логотип",
    slug: { current: "abstract-logo" },
    mainImage: { asset: { url: "https://picsum.photos/seed/design6/800/1000" } },
    category: "Логотипы",
    publishedAt: "2024-01-05T11:00:00Z"
  }
];

// Helper to simulate API fetching
export const getProjects = async (): Promise<Project[]> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_PROJECTS), 800);
  });
};
