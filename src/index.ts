import {EventEmitter} from 'events';
import {AccessEvent, Children} from './models';

const emitterKey = '~`!@#$%^&*()_+=-'; // make it special so no conflict with user defined key names

export const canProxy = (obj: any) => typeof obj === 'object' && obj !== null;

export const getEmitter = (obj: any): EventEmitter | undefined =>
  canProxy(obj) ? Reflect.get(obj, emitterKey) : undefined;

export function useProxy<T extends object>(target: T): [T, EventEmitter] {
  // return if the object is already a proxy
  const oldEmitter = getEmitter(target);
  if (oldEmitter) {
    return [target, oldEmitter!];
  }

  // two variables belongs to the scope of useProxy (the proxy)
  const emitter = new EventEmitter();
  const children = new Children();

  // make child a proxy and add it to children
  const proxyChild = (path: string, value: any) => {
    if (!canProxy(value)) {
      return value;
    }
    const [childProxy, childEmitter] = useProxy(value);
    children.addChild(path, childEmitter, emitter);
    return childProxy;
  };

  const proxy = new Proxy(target, {
    get: (target: T, path: string, receiver?: any) => {
      if (path === emitterKey) {
        return emitter;
      }
      const value = Reflect.get(target, path, receiver);
      if (typeof value !== 'function') {
        emitter.emit('event', new AccessEvent('get', [path]));
      }
      return value;
    },
    set: (target: T, path: string, value: any, receiver?: any): boolean => {
      // no assign object to itself, doesn't make sense
      // array.length assign oldValue === value, strange
      if (canProxy(value) && value === Reflect.get(target, path)) {
        return true;
      }
      // remove old child in case there is one
      children.removeChild(path);
      Reflect.set(target, path, proxyChild(path, value), receiver);
      emitter.emit('event', new AccessEvent('set', [path]));
      return true;
    },
  });

  // first time init
  for (const path of Object.keys(target)) {
    const value = Reflect.get(target, path);
    Reflect.set(target, path, proxyChild(path, value), target);
  }

  return [proxy, emitter];
}

export const runAndMonitor = (
  emitter: EventEmitter,
  f: Function
): [result: any, filter: (event: AccessEvent) => boolean] => {
  const events: AccessEvent[] = [];
  const callback = (event: AccessEvent) => events.push(event);
  emitter.on('event', callback);
  const result = f();
  emitter.off('event', callback);
  const getPaths = [
    ...new Set(
      events
        .filter(event => event.name === 'get')
        .map(event => event.pathString())
    ),
  ];
  const filter = (event: AccessEvent): boolean => {
    if (event.name === 'set') {
      const setPath = event.pathString();
      if (getPaths.some(getPath => getPath.startsWith(setPath))) {
        // if setPath is shorter than getPath, then it's time to refresh
        return true;
      }
    }
    return false;
  };
  return [result, filter];
};
