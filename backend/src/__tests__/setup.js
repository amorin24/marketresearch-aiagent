process.env.NODE_ENV = 'test';

jest.mock('../index', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

beforeAll(() => {
});

afterAll(() => {
});
