import { type ChangeEvent, useCallback } from 'react';

import { type Rating, ratingIcons, ratings } from '../data/ratings';
import { type SkillCategory } from '../types/DataTypes';
import { type Setter } from '../types/Generic';
import { CategorySkill } from './CategorySkill';
import { Tooltip } from './Tooltip';

export function Category({
  category,
  setCategories,
}: {
  category: SkillCategory;
  setCategories: Setter<SkillCategory[]>;
}) {
  const onSkillRatingChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const inputElement = e.target;
      const { skill: skillName } = inputElement.dataset;
      const rating: Rating = inputElement.form?.[inputElement.name].value;

      setCategories((prev) =>
        prev.map(
          (prevCat): SkillCategory =>
            prevCat !== category
              ? prevCat
              : {
                  ...category,
                  skills: category.skills.map((prevSkill) =>
                    prevSkill.name !== skillName
                      ? prevSkill
                      : {
                          ...prevSkill,
                          rating,
                        },
                  ),
                },
        ),
      );
    },
    [category, setCategories],
  );

  return (
    <section
      className="relative mb-4 break-inside-avoid rounded-lg bg-primary-950 px-4 pb-2 pt-1 text-white"
      data-category={category.name}
    >
      <h2 className="m-0 mb-1 text-center text-lg font-bold">{category.name}</h2>
      <div className="sticky top-0 z-10 m-0 flex p-0">
        <span className="flex-1" />
        {ratings.map((rating) => (
          <div
            key={rating}
            className="group relative mx-1 rounded-b-full bg-primary-950 bg-opacity-70 p-1"
          >
            <img
              src={`./${ratingIcons[rating]}.svg`}
              alt={rating}
              className="block h-4 w-4 invert"
            />
            <Tooltip text={rating} />
          </div>
        ))}
      </div>
      <ul className="m-0 list-none p-0">
        {category.skills.map((skill) => (
          <li key={`${category.name}.${skill.name}`} className="m-0 p-0">
            <CategorySkill
              category={category}
              skill={skill}
              onSkillRatingChange={onSkillRatingChange}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
