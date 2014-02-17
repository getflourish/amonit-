describe('Unit: MainController', function() {
  // Load the module with MainController
  beforeEach(module('FeedbackController'));

  it('should have a FeedbackController controller', function() {
    expect(FeedbackController).not.to.equal(null);
  });
})