// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, test, afterEach } from 'vitest';
import { manage } from '../src';
import { auto, Component } from '../src/react';

let id = 0;
class Bullet {
  public id: number;
  public constructor() {
    this.id = id++;
  }
}

class Store {
  public bullets: { [key: number]: Bullet } = {};
}

let count = 0;

const BulletComponent = auto(
  (props: { bullet: Bullet; position: [number, number, number] }) => {
    count += 1;
    const { bullet, position } = props;
    return String(bullet.id) + position.join('-');
  },
);

const position: [number, number, number] = [0, 0, 0];

// Functional App component
const FunctionalApp = auto((props: { store: Store }) => {
  const { store } = props;
  return Object.values(store.bullets).map((bullet) => (
    <BulletComponent key={bullet.id} bullet={bullet} position={position} />
  ));
});

// Class App component
class ClassApp extends Component<{ store: Store }> {
  render() {
    const { store } = this.props;
    return Object.values(store.bullets).map((bullet) => (
      <BulletComponent key={bullet.id} bullet={bullet} position={position} />
    ));
  }
}

const store = manage(new Store());

describe('React Game', () => {
  const testCases = [
    { name: 'Functional component', Component: FunctionalApp },
    { name: 'Class component', Component: ClassApp },
  ];

  afterEach(() => {
    cleanup();
    count = 0;
    store.bullets = {};
  });

  testCases.forEach(({ name, Component }) => {
    test(name, async () => {
      render(

        <Component store={store} />
      );
      expect(count).toBe(0);

      for (let i = 0; i < 4; i++) {
        act(() => {
          store.bullets[i] = new Bullet();
        });
        expect(count).toBe(i + 1);
      }
    });
  });
});