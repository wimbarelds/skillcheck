import { CompressedSkillCategory, type SkillCategory } from '../types/DataTypes';
import { ratings } from './ratings';

export function compressCategories(categories: SkillCategory[]): CompressedSkillCategory[] {
  return categories.map(
    (cat): CompressedSkillCategory => ({
      ...cat,
      skills: cat.skills.map(({ name, rating }) => ({
        name,
        rating: rating && ratings.indexOf(rating),
      })),
    }),
  );
}

export function decompressCategories(categories: CompressedSkillCategory[]): SkillCategory[] {
  return categories.map((cat) => ({
    ...cat,
    skills: cat.skills.map(({ name, rating }) => ({
      name,
      rating: typeof rating === 'number' ? ratings[rating] : null,
    })),
  }));
}
