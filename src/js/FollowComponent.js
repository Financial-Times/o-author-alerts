'use strict';

var user = require('./user'),
    views = require('./views'),
    eventHelper = require('./lib/eventHelper'),
    followButtons = require('./followButtons'),
    FollowWidget = require('./FollowWidget'),
    metadata = require('./lib/metadata'),
    config = require('./config.js');

function FollowComponent(rootEl) {
	this.rootEl = rootEl;
  this.widget = null;
}

FollowComponent.prototype.init = function(opts) {
  config.set(opts);
  user.init();
  this.setupElements();
  if(user.following && user.following.entities) {
    this.setupButtons();
  } else {
    document.body.addEventListener('oFollow.userPreferencesLoad', this.setupButtons.bind(this), false);
  }
};

FollowComponent.prototype.destroy = function() {
  document.body.removeEventListener('oFollow.userPreferencesLoad');
  user.destroy();
  followButtons.destroy();
  if(this.widget) {
      this.widget.destroy();
  }
  this.rootEl.parentElement.removeChild(this.rootEl);
};

FollowComponent.prototype.setupElements = function() {
	this.list = views.list(this.rootEl);
  this.createMessage('Loading data...', '');

  if(isWidget(this.rootEl)) {
    this.widget = new FollowWidget().init(this.list, this.rootEl);
  }

  //If lazyLoading metadata, show the widget immediately
  // Note: this means that the widget will still display if no authors found
  if(config.lazyLoad) {
    showComponent(this.rootEl);
  }


};

FollowComponent.prototype.setupButtons = function() {
  var self = this,
      eventToLoadOn = ('onmouseover' in window) ? 'mouseover' : 'click',
      initialiseButtons = function() {
        self.createButtons();
        followButtons.init(self.list);
        self.rootEl.removeEventListener(eventToLoadOn, initialiseButtons);
      };

  if(config.lazyLoad === true && isWidget(this.rootEl)) {
    //Lazy loading metadata on hover of widget
    this.rootEl.addEventListener(eventToLoadOn, initialiseButtons, false);
  } else {
    initialiseButtons();
  }
};

//NOT IMPLEMENTED YET
// FollowComponent.prototype.onUpdateError = function() {
//   this.createMessage('There was a problem saving your preferences. We\'ll try again when you next visit an article.', 'error');
// };

// FollowComponent.prototype.onUpdateSuccess = function() {
//   if(this.message && this.message.className.indexOf('error')) {
//     this.createMessage('Preferences successfully synced to server!', 'success');
//   }
// };

FollowComponent.prototype.createMessage = function(msg, type) {
  if(!this.message) {
    this.message = document.createElement('span');
    this.message.className = 'o-follow__message';
    this.list.insertBefore(this.message, this.list.querySelector('.o-follow__entity'));
  }
  this.message.innerText = msg;
  this.rootEl.setAttribute('data-o-follow-message', type);
};

FollowComponent.prototype.removeMessage = function(msg, type) {
  if(this.message) {
    this.message.parentElement.removeChild(this.message);
    this.message = null;
  }
  this.rootEl.removeAttribute('data-o-follow-message');
};

FollowComponent.prototype.createAllIn = function(rootEl, opts) {
  var followComponents = [], 
      fEls, 
      c, l, 
      component;

  rootEl = rootEl || document.body;
  //set config with overrides passed through

  if (rootEl.querySelectorAll) {
    fEls = rootEl.querySelectorAll('[data-o-component=o-follow]');
    for (c = 0, l = fEls.length; c < l; c++) {
      if (!fEls[c].hasAttribute('data-o-follow--js')) {
        component = new FollowComponent(fEls[c]);
        component.init(opts);
        followComponents.push(component);
      }
    }
  }

  return followComponents;
};

function isWidget(rootEl) {
  return rootEl.className.indexOf('o-follow--theme') >= 0;
}


FollowComponent.prototype.createButtons = function() {
  if(this.rootEl.hasAttribute('data-o-follow-article-id'))  {
    this.createForArticle();
  } else if (this.rootEl.hasAttribute('data-o-follow-user')) {
    this.createForUser();
  } else if (this.rootEl.hasAttribute('data-o-follow-entities')) {
    this.createForEntities();
  } else {
    this.handleEntityLoad();
  }
};

//We've already initialised the user, so create buttons for ell the entities that they
//are already following
FollowComponent.prototype.createForUser = function() {
  var entities = user && user.following ? user.following.entities : [];

  renderButtonsForEntities(entities, this.list);

  //Add an unfollow all button if they are already following multiple things
  if(entities.length > 1) {
    views.unfollowAll(this.list);
  }
  this.handleEntityLoad();
};

//Make an async call to get the metadata for the given article, and render buttons
//for the entities for that article
FollowComponent.prototype.createForArticle = function() {
  var self = this,
      articleId = this.rootEl.getAttribute('data-o-follow-article-id');
    metadata.get(articleId, function(entities) {
      renderButtonsForEntities(entities.authors, self.list);
      self.handleEntityLoad();
      // Reset the button states now they have been created asynchronously
      followButtons.setInitialStates(self.rootEl);
    });
};

//Entities passed directly to component
FollowComponent.prototype.createForEntities = function() {
    var entities = JSON.parse(this.rootEl.getAttribute('data-o-follow-entities'));
      
    renderButtonsForEntities(entities, this.list);
    this.handleEntityLoad();
};

function renderButtonsForEntities(entities, list) {
  var i, l;
  for(i=0,l=entities.length; i< l; i++) {
    views.button(list, entities[i]);
  }
}

function showComponent(rootEl) {
  rootEl.setAttribute('data-o-follow--js', '');

  //send tracking events since the widget will be visible
  eventHelper.dispatch('oFollow.show', null, rootEl);
  eventHelper.dispatch('oTracking.Data', {'followme': true }, window);

}

FollowComponent.prototype.handleEntityLoad = function() {
  this.removeMessage();
  eventHelper.dispatch('oFollow.entitiesLoaded', null, this.rootEl);

  if(!this.list.querySelector('.o-follow__entity')) {
    this.createMessage('No Authors found.', '');
  } else if (!config.lazyLoad) {
    showComponent(this.rootEl);
  }
};



module.exports = FollowComponent;