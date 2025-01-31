import React, { type FunctionComponent, memo, useEffect, useState } from "react";

import { WriteLog } from "./events/types.ts";
import writeEmitter from "./events/write-emitter.ts";
import { run } from "./utils.ts";

export const auto = <P extends object>(Component: FunctionComponent<P>) => {
  return memo(function MyComponent(props: P) {
    const [, reRender] = useState(0);
    const [r, isTrigger] = run(() => Component(props));
    useEffect(() => {
      const listener = (writeLog: WriteLog) => {
        if (isTrigger(writeLog)) {
          reRender((n) => n + 1);
        }
      };
      writeEmitter.on(listener);
      return () => {
        writeEmitter.off(listener);
      };
    }, [isTrigger]);
    return r;
  });
};

export class Component<P = {}, S = {}> extends React.Component<P, S> {
  private isTrigger?: (writeLog: WriteLog) => boolean;
  private originalRender: () => React.ReactNode;

  constructor(props: P) {
    super(props);
    this.originalRender = this.render;
    this.render = this.autoRender;
    const originalDidMount = this.componentDidMount?.bind(this);
    this.componentDidMount = () => {
      writeEmitter.on(this.handleWrite);
      originalDidMount?.();
    }
    const originalWillUnmount = this.componentWillUnmount?.bind(this);
    this.componentWillUnmount = () => {
      writeEmitter.off(this.handleWrite);
      originalWillUnmount?.();
    }
  }

  private handleWrite = (writeLog: WriteLog) => {
    if (this.isTrigger && this.isTrigger(writeLog)) {
      this.forceUpdate();
    }
  }

  private autoRender = () => {
    const [element, isTrigger] = run(() => {
      return this.originalRender();
    });
    this.isTrigger = isTrigger;
    return element;
  }
}