describe("testtest", function () {
    var setText = function(text, selector) {
      var input = $(selector || '#searchInput');
      var e = $.Event("keypress");
      e.which = e.keyCode = 13;
      return input.val(text).trigger(e);
  };
  it("Suche", function () {
    setText("neu");
    expect($("#searchInput").length).to.be.equal(3);
  });
});
