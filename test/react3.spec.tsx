// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, test } from 'vitest';
import { manage } from '../src';
import { auto, Component } from '../src/react';

describe('React', () => {
  class Store {
    public hanzi: Hanzi;
    public hanzis = [new Hanzi('刘'), new Hanzi('日'), new Hanzi('藜')];
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
      name: 'Functional component',
      createComponents: () => {
        const store = manage(new Store());
        const renderHistory: string[] = [];

        const HanziComponent = auto((props: { hanzi: Hanzi }) => {
          const { hanzi } = props;
          renderHistory.push(hanzi.hanzi);
          return hanzi.hanzi;
        });

        const App = auto(() => {
          return (
            <>
              <button onClick={() => store.changeHanzi()}>
                Change Hanzi
              </button>
              <HanziComponent hanzi={store.hanzi} />
            </>
          );
        });

        return { App, store, renderHistory };
      }
    },
    {
      name: 'Class component',
      createComponents: () => {
        const store = manage(new Store());
        const renderHistory: string[] = [];

        class HanziComponent extends Component<{ hanzi: Hanzi }> {
          render() {
            const { hanzi } = this.props;
            renderHistory.push(hanzi.hanzi);
            return hanzi.hanzi;
          }
        }

        class App extends Component {
          render() {
            return (
              <>
                <button onClick={() => store.changeHanzi()}>
                  Change Hanzi
                </button>
                <HanziComponent hanzi={store.hanzi} />
              </>
            );
          }
        }

        return { App, store, renderHistory };
      }
    }
  ];

  testCases.forEach(({ name, createComponents }) => {
    test(`default - ${name}`, async () => {
      const { App, store, renderHistory } = createComponents();

      render(
        <App />
      );

      const changeButton = screen.getByText('Change Hanzi');
      expect(renderHistory).toEqual(['刘']);

      await userEvent.click(changeButton);
      expect(renderHistory).toEqual(['刘', '日']);

      await userEvent.click(changeButton);
      expect(renderHistory).toEqual(['刘', '日', '藜']);

      await userEvent.click(changeButton);
      expect(renderHistory).toEqual(['刘', '日', '藜', '刘']);

      await userEvent.click(changeButton);
      expect(renderHistory).toEqual(['刘', '日', '藜', '刘', '日']);

      await userEvent.click(changeButton);
      expect(renderHistory).toEqual(['刘', '日', '藜', '刘', '日', '藜']);

      cleanup();
    });
  });
});