// Custom Jest type declarations to resolve react-day-picker dependency issue
declare namespace jest {
  interface Matchers<R> {
    [key: string]: any;
  }
}

declare var jest: any;
declare var describe: any;
declare var it: any;
declare var test: any;
declare var expect: any;
declare var beforeEach: any;
declare var afterEach: any;
declare var beforeAll: any;
declare var afterAll: any;
