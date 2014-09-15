window.WaniKani = {
  handleLoadUserSubmit: function() {
    var $waniKaniSubmit = $('.submitWaniKaniUser');

    $waniKaniSubmit.on('click', function() {
      var apiKey = $('.inputWaniKaniUser').val().trim();
      WaniKani.loadUser(apiKey);
    });
  },

  setUserKanji: function(userKanji) {
    var $selectedCategory = $('.categoryBox[data-category="wanikani"] h2');
    userKanji.sort(function(a, b) {
      if (a.level < b.level) return -1;
      if (a.level > b.level) return 1;
      return 0;
    });
    $.each(userKanji, function(i, kanji) {
      kanji['category'] = 'wanikani';
      kanji['subcategory'] = 'Level ' + kanji['level'];
    });
    window.Kanji._setKanjiArraySelectors(userKanji);
    window.Kanji.sectionExpansion($selectedCategory);
  },

  hideUserForm: function() {
    var $waniKaniForm = $('.waniKaniContent');

    $waniKaniForm.hide();
  },

  loadUser: function(apiKey) {
    $.ajax({
      url: 'https://www.wanikani.com/api/user/'+ apiKey +'/kanji/',
      type: 'GET',
      dataType: 'jsonp',

      error: function(xhr, status, error) {
          alert("error");
      },

      success: function(resp, status) {
        var userKanji = resp.requested_information;

        WaniKani.setUserKanji(userKanji);
        WaniKani.hideUserForm();
      }
    });
  },

  init: function() {
    WaniKani.handleLoadUserSubmit();
  }
}
