var setText = function(text, selector) {
  var input = $(selector || "#searchInput"),
  e = $.Event("keypress");
  e.which = e.keyCode = 13;
  input.val(text).trigger(e);
};

module.exports = {
  "Testing TODOMVC app": function (test) {
    test
    .open("TestRunner.html")
    .execute(setText, "TODO A")
    .assert.text(("#searchInput").is("TODO A")
    .execute(function () {
      $(".input-group-btn").click();
    })
    .done());
  }
};
