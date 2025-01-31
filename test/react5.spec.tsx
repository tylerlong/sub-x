// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, test } from 'vitest';
import { manage, runInAction } from '../src';
import { auto, Component } from '../src/react';

describe('React', () => {
  class Store {
    public count = 0;
    public increase() {
      this.count += 1;
    }
  }

  const testCases = [
    {
      name: 'Functional component',
      createComponents: () => {
        const store = manage(new Store());
        const renderHistory: number[] = [];

        const App = auto((props: { store: Store }) => {
          const { store } = props;
          renderHistory.push(store.count);
          return (
            <div>
              <span role="count">
                {store.count}
              </span>
              <button onClick={() => store.increase()}>+</button>
            </div>
          );
        });

        return { App, store, renderHistory };
      }
    },
    {
      name: 'Class component',
      createComponents: () => {
        const store = manage(new Store());
        const renderHistory: number[] = [];

        class App extends Component<{ store: Store }> {
          render() {
            const { store } = this.props;
            renderHistory.push(store.count);
            return (
              <div>
                <span role="count">
                  {store.count}
                </span>
                <button onClick={() => store.increase()}>+</button>
              </div>
            );
          }
        }

        return { App, store, renderHistory };
      }
    }
  ];

  testCases.forEach(({ name, createComponents }) => {
    test(`transaction - ${name}`, async () => {
      const { App, store, renderHistory } = createComponents();

      store.count = 0;
      render(
        <App store={store} />
      );

      // only one re-render for batch
      act(() => {
        runInAction(() => {
          act(() => {
            store.count += 1;
          });
          act(() => {
            store.count += 1;
          });
          act(() => {
            store.count += 1;
          });
        });
      });

      // note: this cannot be tested precisely, because React may batch re-renders
      // 3 re-renders without batch
      act(() => {
        store.count += 1;
      });
      act(() => {
        store.count += 1;
      });
      act(() => {
        store.count += 1;
      });

      const span = screen.getByRole('count');
      expect(parseInt(span.textContent!.trim(), 10)).toBe(store.count);
      expect(store.count).toBe(6);
      expect(renderHistory).toEqual([0, 3, 4, 5, 6]);

      cleanup();
    });
  });
});