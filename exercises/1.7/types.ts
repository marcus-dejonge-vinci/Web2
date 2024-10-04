
interface Film {
  id: number;
  title: string;
  director: string;
  duration: number;
  budget?: number;
  description?: string;
  imageUrl?: string;
}

type newFilm = Omit<Film, "id">;


export type { Film, newFilm };
