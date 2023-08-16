import { type ResultCategory, type SkillCategory } from '../types/DataTypes';
import { ratings } from './ratings';

export function formatResult(categories: SkillCategory[]): ResultCategory[] {
  return categories
    .map((category) => ({
      category: category.name,
      levels: ratings
        .slice(1)
        .reverse()
        .map((rating) => ({
          level: rating,
          skills: category.skills
            .filter((skill) => skill.rating === rating)
            .map((skill) => skill.name),
        }))
        .filter((level) => level.skills.length > 0),
    }))
    .filter((category) => category.levels.length > 0);
}
