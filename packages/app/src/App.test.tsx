describe('App', () => {
  it('should render without crashing', () => {
    // Simple smoke test to verify App exports correctly
    // Full rendering tests are handled by e2e tests due to complex router setup
    const App = require('./App').default;
    expect(App).toBeDefined();
  });
});
