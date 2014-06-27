'use strict';

var user = require('./user');
var followButtonView = require('./followButtonView');
var FollowButton = require('./FollowButton');
var FollowWidget = require('./FollowWidget');
var metadata = require('./lib/metadata');


function FollowList(rootEl) {
	this.rootEl = rootEl;
  this.list = null;
}

FollowList.prototype.init = function() {
  user.init();
  if(user.following.entities) {
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
	this.rootEl.setAttribute('data-o-follow--js', '');
	var existing = this.rootEl.querySelectorAll('[data-o-follow-id]');
	var i,l;
	for(i=0,l=existing.length; i<l;i++) {
		new FollowButton(existing[i]);
	}
  this.list = createList(this.rootEl);
	createButtons(this.rootEl, this.list);
  if(this.rootEl.hasAttribute('data-o-follow-widget')) {
    new FollowWidget(this.list);
  }
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
    createForArticle(list, el.getAttribute('data-o-follow-article-id') );
  } else if (el.hasAttribute('data-o-follow-user')) {
      createForUser(list);
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
  var entities = user.following.entities,
  		wrapper;
  for(var id in entities) {
    if(entities.hasOwnProperty(id)) {
      wrapper = followButtonView.render(el, entities[id]);
			new FollowButton(wrapper.querySelector('[data-o-follow-id]'));
    }
  }
}

function createForArticle(el, articleId) {
	var wrapper;
  metadata.get(articleId, function(entities) {
    entities.authors.forEach(function(entity) {
      wrapper = followButtonView.render(el, entity);
			new FollowButton(wrapper.querySelector('[data-o-follow-id]'));
    });
  });
}

module.exports = FollowList;