export const ratings = ['Dont know', 'Know of', 'Have used', 'Experienced', 'Expert'] as const;

export type Rating = (typeof ratings)[number];

export const ratingIcons: Record<Rating, string> = {
  'Dont know': 'question_mark', // Question Mark
  'Know of': 'flaky', // Flaky, Emergency, Battery Horiz 050, Battery 4 bar
  'Have used': 'download_done', // Incomplete Circle, Task
  'Experienced': 'engineering', //
  'Expert': 'social_leaderboard', // Star Rate, Social Leaderboard,
};
