'use strict';

var user = require('./user');
var followButtonView = require('./followButtonView');
var followButtons = require('./followButtons');
var FollowWidget = require('./FollowWidget');
var metadata = require('./lib/metadata');


function FollowList(rootEl) {
	this.rootEl = rootEl;
  this.list = null;
}

FollowList.prototype.init = function() {
  user.init();
  if(user.following && user.following.entities) {
    this.setup();
  } else {
    document.body.addEventListener('oFollow.ready', this.setup.bind(this), false);
  }
};

FollowList.prototype.destroy = function() {
  document.body.removeEventListener('oFollow.ready');
  user.destroy();
  this.rootEl.parentElement.removeChild(this.rootEl);
};

FollowList.prototype.setup = function() {
	var existing = this.rootEl.querySelectorAll('[data-o-follow-id]');
  this.list = createList(this.rootEl);
	createButtons(this.rootEl, this.list);
  if(this.rootEl.hasAttribute('data-o-follow-widget')) {
    new FollowWidget(this.list);
  }
  followButtons.init(this.list);
};


FollowList.prototype.createAllIn = function(el) {

  var followButtons = [], fEls, c, l, btn;
  el = el || document.body;
  if (el.querySelectorAll) {
    fEls = el.querySelectorAll('[data-o-component=o-follow]');
    for (c = 0, l = fEls.length; c < l; c++) {
      if (!fEls[c].hasAttribute('data-o-follow--js')) {
        btn = new FollowList(fEls[c]);
        btn.init();
        followButtons.push(btn);
      }
    }
  }
  return followButtons;
};


function createButtons(el, list) {

  if(el.hasAttribute('data-o-follow-article-id'))  {
    createForArticle(list, el.getAttribute('data-o-follow-article-id'), el);
  } else {
    if (el.hasAttribute('data-o-follow-user')) {
      createForUser(list);
    }
    if(list.hasChildNodes()) {
      el.setAttribute('data-o-follow--js', '');
    }
  } 
}

function createList(el) {
  var list = el.querySelector('.o-follow__list');
  if(!list) {
    list = document.createElement('ul');
    list.className = 'o-follow__list';
    el.appendChild(list);
  }
  return list;
}

function createForUser(el) {
  var entities = user && user.following ? user.following.entities : [];
  for(var id in entities) {
    if(entities.hasOwnProperty(id)) {
      followButtonView.render(el, entities[id]);
    }
  }
}

function createForArticle(list, articleId, el) {
  metadata.get(articleId, function(entities) {
    if(entities.authors.length) {
      el.setAttribute('data-o-follow--js', '');
    }
    entities.authors.forEach(function(entity) {
      followButtonView.render(list, entity);
      followButtons.setButtonStates(list);
    });
  });
}

module.exports = FollowList;