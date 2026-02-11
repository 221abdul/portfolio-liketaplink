export type Category = {
  label: string;
  slug: string;
};

export const CATEGORIES: Category[] = [
  { label: 'Логотипы', slug: 'logos' },
  { label: 'Инфографика', slug: 'infographics' },
  { label: 'Брендбуки', slug: 'brandbooks' },
  { label: 'Веб-дизайн', slug: 'web-design' }
];

export type Project = {
  id: number;
  created_at: string;
  title: string;
  slug: string;
  image_url: string | null;
  category_slug: string | null;
  description: string | null;
  views?: number | null;
};
