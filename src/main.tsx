import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

const rootEl = document.querySelector('#root');
if (!rootEl) throw new Error('#root element not found');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

function onKeyDown(e: KeyboardEvent) {
  const { key } = e;
  if (['ArrowDown', 'ArrowUp'].includes(key)) {
    const groups = [...document.querySelectorAll('[role=radiogroup]')];
    const group = document.activeElement?.closest('[role=radiogroup]');

    if (!group) return;
    e.preventDefault();

    const curIndex = groups.indexOf(group);
    const nextIndex = key === 'ArrowDown' ? curIndex + 1 : curIndex - 1;
    const nextGroup = groups.at(nextIndex % groups.length) as HTMLDivElement;
    const checkedNext = nextGroup.querySelector<HTMLElement>('input:checked');
    if (checkedNext) {
      // If the target group has an already selected value, focus that
      checkedNext.focus();
    } else {
      // Find which value in the current group is selected or has focus
      const groupInputs: Array<HTMLElement | null> = [...group.querySelectorAll('input')];
      const groupChecked = group.querySelector<HTMLElement>('input:checked, input:focus');
      const indexInGroup = groupInputs.indexOf(groupChecked);
      if (indexInGroup >= 0) {
        // If any, focus that index in the target group
        [...nextGroup.querySelectorAll('input')].at(indexInGroup)?.focus();
      } else {
        // Else focus the first value in the target group
        nextGroup.querySelector('input')?.focus();
      }
    }
  }
}

window.addEventListener('keydown', onKeyDown);
