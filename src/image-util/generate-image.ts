import { type ResultCategory, type ResultLevel } from '../types/DataTypes';

function getStackedHeight(blocks: HTMLCanvasElement[], spacing: number = 0) {
  if (blocks.length === 0) return 0;
  return (
    blocks.map((block) => block.height).reduce((sum, height) => sum + height, 0) +
    (blocks.length - 1) * spacing
  );
}

function divideIntoColumns(
  blocks: HTMLCanvasElement[],
  desiredNumColumns: number,
  spacing: number,
): HTMLCanvasElement[][] {
  // Fall through
  if (blocks.length === 0) return [];
  if (desiredNumColumns === 1) return [blocks];

  // Total single column height
  const totalHeight = getStackedHeight(blocks, spacing);

  // Calculate desired height
  const desiredHeight = (totalHeight - (desiredNumColumns - 1) * spacing) / desiredNumColumns;

  // Create column 1, with at least 1 block
  const firstBlock = blocks[0];
  const column = [firstBlock];
  let columnHeight = firstBlock.height;

  // First add blocks that definitely fit
  for (let i = 1; i < blocks.length; i += 1) {
    const block = blocks[i];
    const resultHeight = columnHeight + spacing + block.height;
    if (resultHeight <= desiredHeight) {
      column.push(block);
      columnHeight = resultHeight;
    } else {
      break;
    }
  }

  // Gather remaining blocks
  const remainingBlocks = blocks.slice(column.length);

  // Fall through, no remaining blocks
  if (remainingBlocks.length === 0) return [column];

  // We will use recursion to figure out our other columns
  // But we might get a better column distribution if we add additional blocks to the current
  // column. So figure out at what number of added blocks the results stop improving
  // (between 0 extra and ... however many it takes)
  let bestResult: { tallestColumnHeight: number; columns: HTMLCanvasElement[][] } = {
    tallestColumnHeight: Infinity,
    columns: [],
  };
  for (let addExtra = 0; addExtra < remainingBlocks.length; addExtra += 1) {
    const resultColumn = [...column, ...remainingBlocks.slice(0, addExtra)];
    const restColumns = divideIntoColumns(
      remainingBlocks.slice(addExtra),
      desiredNumColumns - 1,
      spacing,
    );
    const columns = [resultColumn, ...restColumns];
    const tallestColumnHeight = Math.max(
      ...columns.map((restColumn) => getStackedHeight(restColumn, spacing)),
    );
    if (tallestColumnHeight < bestResult.tallestColumnHeight) {
      bestResult = { tallestColumnHeight, columns };
    } else {
      break;
    }
  }
  return bestResult.columns.filter((col) => col.length);
}

interface Config {
  backgroundColor: string;
  cardColor: string;
  outerPadding: number;
  numColumns: number;
  columnWidth: number;
  categorySpacing: number;
  categoryPadding: number;
  levelSpacing: number;
  skillSpacing: number;
  textColor: string;
  skillBorder: string;
  skillFont: string;
  levelFont: string;
  categoryFont: string;
}

const defaultConfig: Config = {
  outerPadding: 16,
  backgroundColor: '#333',
  cardColor: '#222',
  numColumns: 4,
  columnWidth: 400,
  categoryPadding: 16,
  categorySpacing: 8,
  levelSpacing: 8,
  textColor: '#FFFFFF',
  skillBorder: '#FFFFFF',
  skillFont: '12px Arial',
  skillSpacing: 4,
  levelFont: 'bold 14px Arial',
  categoryFont: 'bold 16px Arial',
};

export function drawResult(
  categories: ResultCategory[],
  userConfig: Partial<Config> = {},
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Failed to draw result, could not get Canvas Context');

  const config = { ...defaultConfig, ...userConfig };
  const { backgroundColor, outerPadding, numColumns, categorySpacing, columnWidth } = config;

  // Draw all categories individually
  const blocks = categories.map((category) => drawCategory(category, config));
  // Divide into columns
  const columns = divideIntoColumns(blocks, numColumns, categorySpacing);

  const width =
    outerPadding * 2 + columns.length * columnWidth + (columns.length - 1) * categorySpacing;

  const height =
    outerPadding * 2 +
    Math.max(...columns.map((column) => getStackedHeight(column, categorySpacing)));

  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, width, height);

  let x = outerPadding;
  columns.forEach((column) => {
    let y = outerPadding;
    column.forEach((block) => {
      context.drawImage(block, x, y);
      y += block.height + categorySpacing;
    });
    x += columnWidth + categorySpacing;
  });

  return canvas;
}

export function drawCategory(category: ResultCategory, config: Config): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Failed to draw category, could not get Canvas Context');

  const { categoryPadding, categoryFont, levelSpacing, columnWidth, textColor, cardColor } = config;

  const levels = category.levels.map((level) => drawLevel(level, config));
  let y = categoryPadding;

  // Measure space needed for title
  context.font = categoryFont;
  const { fontBoundingBoxDescent, fontBoundingBoxAscent } = context.measureText(category.category);
  const titleHeight = fontBoundingBoxDescent + fontBoundingBoxAscent;
  y += titleHeight + 8;

  // Create Level-Blocks
  const drawCalls: Array<{ level: HTMLCanvasElement; y: number }> = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const level of levels) {
    drawCalls.push({ level, y });
    y += level.height + levelSpacing;
  }

  // Set canvas size
  const width = columnWidth;
  const height = y - levelSpacing + categoryPadding * 2;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = width;
  canvas.height = height;

  // Draw background
  context.fillStyle = cardColor;
  context.roundRect(0, 0, canvas.width, canvas.height, 8);
  context.fill();

  // Draw title
  context.font = categoryFont;
  context.fillStyle = textColor;
  context.textAlign = 'center';
  context.fillText(
    category.category,
    columnWidth / 2,
    categoryPadding + fontBoundingBoxAscent,
    columnWidth - 2 * categoryPadding,
  );

  // Draw levels
  drawCalls.forEach((call) => context.drawImage(call.level, categoryPadding, call.y));

  return canvas;
}

export function drawLevel(level: ResultLevel, config: Config): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Failed to draw skill, could not get Canvas Context');

  const { columnWidth, levelFont, categoryPadding, skillSpacing, textColor } = config;

  const skills = level.skills.map((skill) => drawSkill(skill, config));
  let x = 0;
  let y = 0;
  let rowHeight = 0;
  const maxX = columnWidth - 2 * categoryPadding;

  // Measure space needed for title
  context.font = levelFont;
  const { fontBoundingBoxDescent, fontBoundingBoxAscent, actualBoundingBoxLeft } =
    context.measureText(level.level);
  y += fontBoundingBoxDescent + fontBoundingBoxAscent + 2;

  const drawCalls: Array<{ skill: HTMLCanvasElement; x: number; y: number }> = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const skill of skills) {
    if (x > 0 && x + skill.width > maxX) {
      x = 0;
      y += Math.ceil(rowHeight + skillSpacing);
      rowHeight = 0;
    }
    drawCalls.push({ skill, x, y });
    x += Math.ceil(skill.width + skillSpacing);
    rowHeight = Math.ceil(Math.max(rowHeight, skill.height));
  }

  // Set canvas size
  const width = Math.ceil(columnWidth - categoryPadding * 2);
  const height = y + rowHeight;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = width;
  canvas.height = height;

  // Draw title
  context.font = levelFont;
  context.fillStyle = textColor;
  context.fillText(
    level.level,
    actualBoundingBoxLeft,
    fontBoundingBoxAscent,
    width - actualBoundingBoxLeft,
  );
  drawCalls.forEach((call) => context.drawImage(call.skill, call.x, call.y));

  return canvas;
}

export function drawSkill(skill: string, config: Config): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Failed to draw skill, could not get Canvas Context');

  const { skillFont, textColor, columnWidth, categoryPadding, skillBorder } = config;

  context.font = skillFont;
  context.textAlign = 'start';
  const {
    fontBoundingBoxDescent,
    fontBoundingBoxAscent,
    actualBoundingBoxRight,
    actualBoundingBoxLeft,
  } = context.measureText(skill);
  const height = Math.ceil(fontBoundingBoxDescent + fontBoundingBoxAscent + 4);
  const width = Math.ceil(actualBoundingBoxRight + actualBoundingBoxLeft + 12);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = width;
  canvas.height = height;
  context.font = skillFont;
  context.textAlign = 'start';
  context.fillStyle = textColor;
  context.fillText(skill, 6, fontBoundingBoxAscent + 2, columnWidth - 2 * categoryPadding);

  context.fillStyle = 'none';
  context.roundRect(0.5, 0.5, width - 1.5, height - 1, 3);
  context.strokeStyle = skillBorder;
  context.stroke();

  return canvas;
}
