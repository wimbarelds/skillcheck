import { type ChangeEventHandler, useId } from 'react';

import { ratings } from '../data/ratings';
import { type Skill, type SkillCategory } from '../types/DataTypes';
import { Tooltip } from './Tooltip';

export function CategorySkill({
  category,
  skill,
  onSkillRatingChange,
}: {
  category: SkillCategory;
  skill: Skill;
  onSkillRatingChange: ChangeEventHandler<HTMLInputElement>;
}) {
  const id = useId();

  return (
    <div
      role="radiogroup"
      aria-labelledby={id}
      className="-mx-2 flex rounded-md px-2 hover:bg-primary-800 [&:not(body:has([role=radiogroup]:hover)_&)]:focus-within:bg-primary-800"
    >
      <div className="flex-1" id={id}>
        {skill.name}
      </div>
      {ratings.map((rating) => (
        <label
          key={`${category.name}.${skill.name}.${rating}`}
          className="group relative m-1 h-6 w-6 cursor-pointer rounded-full text-sm"
        >
          <input
            type="radio"
            name={`${category.name}.${skill.name}`}
            value={rating}
            onChange={onSkillRatingChange}
            data-skill={skill.name}
            checked={skill.rating === rating}
            className="peer sr-only"
          />
          <span className="sr-only">{rating}</span>
          <span className="absolute inset-1 rounded-full bg-primary-100 peer-checked:bg-primary-600" />
          <span className="absolute inset-0 rounded-full border border-primary-500 group-hover:border-4" />
          <Tooltip text={rating} />
        </label>
      ))}
    </div>
  );
}
