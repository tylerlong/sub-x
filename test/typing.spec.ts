import { describe, expect, test } from 'vitest';

import { manage, type Managed } from '../src';

describe('typings', () => {
  test('function should not be Managed<T[K]>', async () => {
    class Store {
      public count = 0;
      public increase() {
        this.count += 1;
      }
    }
    const store = new Store() as unknown as Managed<Store>;
    store.increase(); // is not Managed<T[K]>, so TS compiler doesn't complain
    const mo = manage(store);
    mo.increase(); // is not Managed<T[K]>, so TS compiler will complain
  });

  test('dedault', async () => {
    const mo = manage({ a: { b: 1 } });
    (mo.a as Managed<typeof mo.a>).$e.on(() => {
      // does nothing
    });
    mo.a = { b: 2 };
  });

  // test('extend', async () => {
  //   class A {
  //     private p1 = 1;
  //   }
  //   const mo = manage(new A());
  //   const a: A = mo; // doesn't compile.
  //   expect(a).toBeDefined();
  // });

  test('cast', async () => {
    const o = { a: 1 };
    const mo = o as Managed<typeof o>;
    expect(mo).toBeDefined();
  });
});
