var FollowButton = require('./src/js/FollowButton');

exports.createAllIn = function(el){
	var followButtons = [], fEls, c, l;
  el = el || document.body;
  if (el.querySelectorAll) {
      fEls = el.querySelectorAll('[data-o-component=o-follow]');
      for (c = 0, l = fEls.length; c < l; c++) {
          if (!fEls[c].classList.contains('o-follow--js')) {
              createButtons(fEls[c]);
          }
      }
  }
  return followButtons;
};

function createButtons(el) {
  if(el.getAttribute('data-o-follow-entity')) {
    console.log('creating for entity');
    createForEntity(el, JSON.parse(el.getAttribute('data-o-follow-entity')));
  }
}

exports.createForArticle = function(el, articleId) {

}

function createForEntity(el, entity) {
  new FollowButton(el, entity);
}
