import { type BaseCategory, type SkillCategory } from '../types/DataTypes';

export function initSkills(categories: BaseCategory[], localStorageKey: string) {
  if (window.localStorage) {
    // TODO: Instead of just taking this value, merge the values into the categories.map below.
    const storedValue = window.localStorage.getItem(localStorageKey);
    if (storedValue) return JSON.parse(storedValue) as SkillCategory[];
  }
  return categories.map(
    ({ name, skills }): SkillCategory => ({
      name,
      skills: skills.map((skillName) => ({
        name: skillName,
        rating: null,
      })),
    }),
  );
}
