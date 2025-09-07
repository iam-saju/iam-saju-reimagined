import { useRef, useCallback } from 'react';

// Global donut state shared between main page and terminal
class GlobalDonutState {
  private static instance: GlobalDonutState;
  public A = 0;
  public B = 0;
  public isRunning = true;
  public speed = 1;
  public color = '#4a9eff';
  private listeners: (() => void)[] = [];

  static getInstance(): GlobalDonutState {
    if (!GlobalDonutState.instance) {
      GlobalDonutState.instance = new GlobalDonutState();
    }
    return GlobalDonutState.instance;
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener());
  }

  updateRotation(deltaA: number, deltaB: number) {
    this.A += deltaA;
    this.B += deltaB;
  }

  setRunning(running: boolean) {
    this.isRunning = running;
    this.notify();
  }

  setSpeed(newSpeed: number) {
    this.speed = newSpeed;
    this.notify();
  }


  setColor(newColor: string) {
    this.color = newColor;
    this.notify();
  }

  reset() {
    this.speed = 1;
    this.isRunning = true;
    this.color = '#4a9eff';
    this.notify();
  }
}

export const useGlobalDonut = () => {
  const globalState = GlobalDonutState.getInstance();
  const forceUpdate = useRef(() => {});

  const subscribe = useCallback((callback: () => void) => {
    forceUpdate.current = callback;
    return globalState.subscribe(callback);
  }, [globalState]);

  return {
    globalState,
    subscribe,
    getState: () => ({
      A: globalState.A,
      B: globalState.B,
      isRunning: globalState.isRunning,
      speed: globalState.speed,
      color: globalState.color
    }),
    setRunning: (running: boolean) => globalState.setRunning(running),
    setSpeed: (speed: number) => globalState.setSpeed(speed),
    setColor: (color: string) => globalState.setColor(color),
    reset: () => globalState.reset()
  };
};
