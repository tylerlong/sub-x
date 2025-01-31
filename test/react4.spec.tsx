// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, test } from 'vitest';
import { manage } from '../src';
import { auto, Component } from '../src/react';

class Store {
  public count = 0;
  public increase() {
    this.count += 1;
  }
}

describe('React', () => {
  const testCases = [
    {
      name: 'functional component',
      createComponents: () => {
        const renderHistory: number[] = [];
        const App = auto((props: { store: Store }) => {
          const { store } = props;
          renderHistory.push(store.count);
          return (
            <div>
              <span role="count">{store.count}</span>
              <button onClick={() => store.increase()}>+</button>
            </div>
          );
        });
        return { App, renderHistory };
      }
    },
    {
      name: 'class component',
      createComponents: () => {
        const renderHistory: number[] = [];
        class App extends Component<{ store: Store }> {
          render() {
            const { store } = this.props;
            renderHistory.push(store.count);
            return (
              <div>
                <span role="count">{store.count}</span>
                <button onClick={() => store.increase()}>+</button>
              </div>
            );
          }
        }
        return { App, renderHistory };
      }
    }
  ];

  testCases.forEach(({ name, createComponents }) => {
    test(`functional component - ${name}`, async () => {
      const store = manage(new Store());
      const { App, renderHistory } = createComponents();

      store.count = 0;
      render(<App store={store} />);

      act(() => {
        store.count += 1;
      });

      act(() => {
        store.count += 1;
      });

      const span = screen.getByRole('count');
      expect(parseInt(span.textContent!.trim(), 10)).toBe(store.count);
      expect(store.count).toBe(2);
      expect(renderHistory).toEqual([0, 1, 2]);

      cleanup();
    });
  });

  testCases.forEach(({ name, createComponents }) => {
    test(`global store - ${name}`, async () => {
      const store = manage(new Store());
      const { App, renderHistory } = createComponents();

      store.count = 0;
      render(<App store={store} />);

      act(() => {
        store.count += 1;
      });

      act(() => {
        store.count += 1;
      });

      const span = screen.getByRole('count');
      expect(parseInt(span.textContent!.trim(), 10)).toBe(store.count);
      expect(store.count).toBe(2);
      expect(renderHistory).toEqual([0, 1, 2]);

      cleanup();
    });
  });
});