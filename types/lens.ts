export type LensCategory = '単焦点' | 'ズーム' | 'マクロ';

export interface Lens {
  id: string;
  name: string;
  category: LensCategory;
  focalLengthMin: number;
  focalLengthMax: number;
  aperture: string;
  manufacturer: string;
}

export const LENS_CATEGORIES: LensCategory[] = ['単焦点', 'ズーム', 'マクロ'];

export const FOCAL_LENGTH_RANGE = {
  min: 8,
  max: 800
} as const;