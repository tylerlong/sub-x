// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import React, { StrictMode } from 'react';
import { describe, expect, test } from 'vitest';
import { manage } from '../src';
import { auto, Component } from '../src/react';

describe('React strict mode', () => {
  let id = 0;
  class Bullet {
    public id: number;
    public speed = 10;
    public constructor() {
      this.id = id++;
    }
  }

  class Store {
    public bullets: { [key: number]: Bullet } = {};
  }

  const testCases = [
    {
      name: 'functional component',
      createComponents: () => {
        const BulletComponent = auto((props: { bullet: Bullet }) => {
          const { bullet } = props;
          return bullet.speed;
        });

        const App = auto((props: { store: Store }) => {
          const { store } = props;
          return Object.values(store.bullets).map((bullet) => (
            <BulletComponent key={bullet.id} bullet={bullet} />
          ));
        });

        return { BulletComponent, App };
      }
    },
    {
      name: 'class component',
      createComponents: () => {
        class BulletComponent extends Component<{ bullet: Bullet }> {
          render() {
            const { bullet } = this.props;
            return bullet.speed;
          }
        }

        class App extends Component<{ store: Store }> {
          render() {
            const { store } = this.props;
            return Object.values(store.bullets).map((bullet) => (
              <BulletComponent key={bullet.id} bullet={bullet} />
            ));
          }
        }

        return { BulletComponent, App };
      }
    }
  ];

  testCases.forEach(({ name, createComponents }) => {
    test(`Update children props - ${ name }`, async () => {
      let bulletCount = 0;
      let appCount = 0;
      const { App } = createComponents();

      const store = manage(new Store());
      store.bullets[0] = new Bullet();
      render(
        <StrictMode>
          <App store={store} />
        </StrictMode>
      );

      appCount += 2;
      bulletCount += 2;
      expect(appCount).toBe(2);
      expect(bulletCount).toBe(2);

      act(() => {
        store.bullets[0].speed = 20;
      });
      bulletCount += 2;
      expect(appCount).toBe(2);
      expect(bulletCount).toBe(4);

      act(() => {
        store.bullets[0].speed = 30;
      });
      bulletCount += 2;
      expect(appCount).toBe(2);
      expect(bulletCount).toBe(6);

      act(() => {
        store.bullets[1] = new Bullet();
      });
      appCount += 2;
      bulletCount += 2;
      expect(appCount).toBe(4);
      expect(bulletCount).toBe(8);

      cleanup();
    });
  });
});