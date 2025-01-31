// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, test, afterEach } from 'vitest';
import { manage } from '../src';
import { auto, Component } from '../src/react';

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

let bulletCount = 0;

const BulletComponent = auto((props: { bullet: Bullet }) => {
  bulletCount += 1;
  const { bullet } = props;
  return bullet.speed;
});

// Functional App component
const FunctionalApp = auto((props: { store: Store }) => {
  const { store } = props;
  return Object.values(store.bullets).map((bullet) => (
    <BulletComponent key={bullet.id} bullet={bullet} />
  ));
});

// Class App component
class ClassApp extends Component<{ store: Store }> {
  render() {
    const { store } = this.props;
    return Object.values(store.bullets).map((bullet) => (
      <BulletComponent key={bullet.id} bullet={bullet} />
    ));
  }
}

const store = manage(new Store());

describe('React re-render', () => {
  const testCases = [
    { name: 'Functional component', App: FunctionalApp },
    { name: 'Class component', App: ClassApp },
  ];

  afterEach(() => {
    cleanup();
    bulletCount = 0;
    store.bullets = {};
  });

  testCases.forEach(({ name, App }) => {
    test(`Update children props - ${ name }`, async () => {
      store.bullets[0] = new Bullet();
      render(

        <App store={store} />
      );
      expect(bulletCount).toBe(1);

      act(() => {
        store.bullets[0].speed = 20;
      });
      expect(bulletCount).toBe(2);

      act(() => {
        store.bullets[0].speed = 30;
      });
      expect(bulletCount).toBe(3);

      act(() => {
        store.bullets[1] = new Bullet();
      });
      expect(bulletCount).toBe(4);
    });
  });

  testCases.forEach(({ name, App }) => {
    test(`Add new child - ${ name }`, async () => {
      render(

        <App store={store} />
      );
      expect(bulletCount).toBe(0);

      act(() => {
        store.bullets[0] = new Bullet();
      });
      expect(bulletCount).toBe(1);

      act(() => {
        store.bullets[1] = new Bullet();
      });
      expect(bulletCount).toBe(2);

      act(() => {
        store.bullets[2] = new Bullet();
      });
      expect(bulletCount).toBe(3);
    });
  });
});