// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, test } from 'vitest';
import { manage } from '../src';
import { auto, Component } from '../src/react';

describe('React', () => {
  class Store {
    public hanzi: Hanzi;
    public hanzis = [new Hanzi('刘'), new Hanzi('春'), new Hanzi('藜')];
    public index = 0;
    public constructor() {
      this.hanzi = this.hanzis[0];
    }
    public changeHanzi() {
      this.index += 1;
      if (this.index > 2) {
        this.index = 0;
      }
      this.hanzi = this.hanzis[this.index];
    }
  }

  class Hanzi {
    public hanzi: string;
    public constructor(hanzi: string) {
      this.hanzi = hanzi;
    }
  }

  const testCases = [
    {
      name: 'functional component',
      createComponents: () => {
        const HanziComponent = auto((props: { hanzi: Hanzi }) => {
          const { hanzi } = props;
          return hanzi.hanzi;
        });

        const App = auto((props: { store: Store }) => {
          const { store } = props;
          return (
            <>
              <button onClick={() => store.changeHanzi()}>Change Hanzi
              </button>
              <HanziComponent hanzi={store.hanzi} />
            </>
          );
        });

        return { HanziComponent, App };
      }
    },
    {
      name: 'class component',
      createComponents: () => {
        class HanziComponent extends Component<{ hanzi: Hanzi }> {
          render() {
            const { hanzi } = this.props;
            return hanzi.hanzi;
          }
        }

        class App extends Component<{ store: Store }> {
          render() {
            const { store } = this.props;
            return (
              <>
                <button onClick={() => store.changeHanzi()}>Change Hanzi
                </button>
                <HanziComponent hanzi={store.hanzi} />
              </>
            );
          }
        }

        return { HanziComponent, App };
      }
    }
  ];

  testCases.forEach(({ name, createComponents }) => {
    test(`default - ${ name }`, async () => {
      const renderHistory: string[] = [];
      const { App } = createComponents();
      const store = manage(new Store());

      render(
        <App store={store} />
      );
      renderHistory.push(store.hanzi.hanzi);

      const changeButton = screen.getByText('Change Hanzi');
      expect(renderHistory).toEqual(['刘']);

      act(() => {
        store.hanzi.hanzi = '劉';
      });
      renderHistory.push(store.hanzi.hanzi);
      expect(renderHistory).toEqual(['刘', '劉']);

      await userEvent.click(changeButton);
      renderHistory.push(store.hanzi.hanzi);
      expect(renderHistory).toEqual(['刘', '劉', '春']);

      act(() => {
        store.hanzi.hanzi = '熗';
      });
      renderHistory.push(store.hanzi.hanzi);
      expect(renderHistory).toEqual(['刘', '劉', '春', '熗']);

      await userEvent.click(changeButton);
      renderHistory.push(store.hanzi.hanzi);
      expect(renderHistory).toEqual(['刘', '劉', '春', '熗', '藜']);

      act(() => {
        store.hanzi.hanzi = '音';
      });
      renderHistory.push(store.hanzi.hanzi);
      expect(renderHistory).toEqual(['刘', '劉', '春', '熗', '藜', '音']);

      cleanup();
    });
  });
});