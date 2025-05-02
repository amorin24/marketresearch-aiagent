process.env.NODE_ENV = 'test';

jest.mock('../index', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

process.env.CREWAI_ENABLED = 'true';
process.env.SQUIDAI_ENABLED = 'true';
process.env.LETTAAI_ENABLED = 'true';
process.env.AUTOGEN_ENABLED = 'true';
process.env.LANGGRAPH_ENABLED = 'true';

test('setup test environment', () => {
  expect(process.env.NODE_ENV).toBe('test');
});

beforeAll(() => {
});

afterAll(() => {
});
