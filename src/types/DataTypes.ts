import { type Rating } from '../data/ratings';

export interface Skill {
  name: string;
  rating: Rating | null;
}

export interface SkillCategory {
  name: string;
  skills: Skill[];
}

export interface CompressedSkill {
  name: string;
  rating: number | null;
}
export interface CompressedSkillCategory {
  name: string;
  skills: CompressedSkill[];
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
