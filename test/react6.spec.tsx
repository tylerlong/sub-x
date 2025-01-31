// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import React, { ReactElement } from "react";
import { describe, expect, test } from "vitest";
import { manage } from "../src/index.ts";
import { auto, Component } from "../src/react.ts";

class Store {
  public count = 0;
  public increase() {
    this.count += 1;
  }
}

describe("React", () => {
  const testCases = [
    {
      name: 'functional component',
      createComponents: () => {
        const renderHistory: number[] = [];
        const App = auto((props: { toolBarItems: (string | ReactElement)[] }) => {
          const { toolBarItems } = props;
          return (
            <div>
              <span role="count">{toolBarItems.length}</span>
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
        class App extends Component<{ toolBarItems: (string | ReactElement)[] }> {
          render() {
            const { toolBarItems } = this.props;
            return (
              <div>
                <span role="count">{toolBarItems.length}</span>
              </div>
            );
          }
        }
        return { App, renderHistory };
      }
    }
  ];

  testCases.forEach(({ name, createComponents }) => {
    test(`ReactElement as props - ${name}`, async () => {
      const store = manage(new Store());
      const { App } = createComponents();
      store.count = 0;

      render(
        <App
          toolBarItems={[
            "about",
            "|",
            "print",
            "|",
            <i></i>,
          ]}
        />,
      );

      const span = await screen.findByRole("count");
      expect(parseInt(span.textContent!.trim(), 10)).toBe(5);
      cleanup();
    });
  });
});