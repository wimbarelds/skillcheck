import { type SkillCategory } from '../types/DataTypes';
import { ratings } from './ratings';

export function compressCategories(categories: SkillCategory[]) {
  return categories.map((cat) => ({
    ...cat,
    skills: cat.skills.map(({ name, rating }) => ({
      name,
      rating: rating && ratings.indexOf(rating),
    })),
  }));
}
