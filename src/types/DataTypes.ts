import { type Rating } from '../data/ratings';

export interface Skill {
  name: string;
  rating: Rating | null;
}

export interface SkillCategory {
  name: string;
  skills: Skill[];
}

export interface BaseCategory {
  name: string;
  skills: string[];
}

export interface ResultLevel {
  level: Rating;
  skills: string[];
}

export interface ResultCategory {
  category: string;
  levels: ResultLevel[];
}
