'use strict';

var user = require('./user'),
    views = require('./views'),
    eventHelper = require('./lib/eventHelper'),
    buttons = require('./buttons'),
    message = require('./lib/message'),
    AlertsWidget = require('./AlertsWidget'),
    metadata = require('./lib/metadata'),
    config = require('./config.js');

function AuthorAlerts(rootEl) {
	this.rootEl = rootEl;
  this.widget = null;
}

AuthorAlerts.prototype.init = function(opts) {
  config.set(opts);
  user.init();
  this.setupElements();
  if(user.subscription && user.subscription.entities) {
    this.setupButtons();
  } else {
    document.body.addEventListener('oAuthorAlerts.userPreferencesLoad', this.setupButtons.bind(this), false);
  }
};

AuthorAlerts.prototype.destroy = function() {
  document.body.removeEventListener('oAuthorAlerts.userPreferencesLoad');
  user.destroy();
  buttons.destroy();
  if(this.widget) {
      this.widget.destroy();
  }
  this.rootEl.parentElement.removeChild(this.rootEl);
};

AuthorAlerts.prototype.setupElements = function() {
	this.list = views.list(this.rootEl);

  if(isWidget(this.rootEl)) {
    this.widget = new AlertsWidget();
    this.widget.init(this.list, this.rootEl);
  }

  message.create(this.rootEl, 'Loading data...', '');

  //If lazyLoading metadata, show the widget immediately
  // Note: this means that the widget will still display if no authors found
  if(config.lazyLoad) {
    showComponent(this.rootEl);
  }


};

AuthorAlerts.prototype.setupButtons = function() {
  var self = this,
      eventToLoadOn = ('onmouseover' in window) ? 'mouseover' : 'click',
      initialiseButtons = function() {
        self.createButtons();
        buttons.init(self.rootEl);
        self.rootEl.removeEventListener(eventToLoadOn, initialiseButtons);
        if(self.widget && self.widget.widget) {
          self.widget.widget.removeEventListener('focus', initialiseButtons);
        }

      };

  if(config.lazyLoad === true && isWidget(this.rootEl)) {
    //Lazy loading metadata on hover of widget
    this.rootEl.addEventListener(eventToLoadOn, initialiseButtons, false);
    this.widget.widget.addEventListener('focus', initialiseButtons, false);
  } else {
    initialiseButtons();
  }
};

//NOT IMPLEMENTED YET
// AlertsComponent.prototype.onUpdateError = function() {
//   this.createMessage('There was a problem saving your preferences. We\'ll try again when you next visit an article.', 'error');
// };

// AlertsComponent.prototype.onUpdateSuccess = function() {
//   if(this.message && this.message.className.indexOf('error')) {
//     this.createMessage('Preferences successfully synced to server!', 'success');
//   }
// };

AuthorAlerts.init = function(rootEl, opts) {
  var components = [], 
      fEls, 
      c, l, 
      component;

  rootEl = rootEl || document.body;
  //set config with overrides passed through

  if (rootEl.querySelectorAll) {
    fEls = rootEl.querySelectorAll('[data-o-component=o-author-alerts]');
    for (c = 0, l = fEls.length; c < l; c++) {
      if (!fEls[c].hasAttribute('data-o-author-alerts--js')) {
        component = new AuthorAlerts(fEls[c]);
        component.init(opts);
        components.push(component);
      }
    }
  }

  return components;
};

function isWidget(rootEl) {
  return rootEl.className.indexOf('o-author-alerts--theme') >= 0;
}


AuthorAlerts.prototype.createButtons = function() {
  if(this.rootEl.hasAttribute('data-o-author-alerts-article-id'))  {
    this.createForArticle();
  } else if (this.rootEl.hasAttribute('data-o-author-alerts-user')) {
    this.createForUser();
  } else if (this.rootEl.hasAttribute('data-o-author-alerts-entities')) {
    this.createForEntities();
  } else {
    this.handleEntityLoad();
  }
};

//We've already initialised the user, so create buttons for ell the entities that they
//are already following
AuthorAlerts.prototype.createForUser = function() {
  var entities = user && user.subscription ? user.subscription.entities : [];

  renderButtonsForEntities(entities, this.list);

  //Add an unfollow all button if they are already following multiple things
  if(entities.length > 1) {
    views.standaloneButton(this.list, 'unsubscribe', 'Unsubscribe All');
  }
  this.handleEntityLoad();
};

//Make an async call to get the metadata for the given article, and render buttons
//for the entities for that article
AuthorAlerts.prototype.createForArticle = function() {
  var self = this,
      articleId = this.rootEl.getAttribute('data-o-author-alerts-article-id');

    metadata.get(articleId, function(entities) {
      renderButtonsForEntities(entities.authors, self.list);
      self.handleEntityLoad();
      // Reset the button states now they have been created asynchronously
      buttons.setInitialStates(self.rootEl);
    });
};

//Entities passed directly to component
AuthorAlerts.prototype.createForEntities = function() {
    var entities = JSON.parse(this.rootEl.getAttribute('data-o-author-alerts-entities'));
      
    renderButtonsForEntities(entities, this.list);
    this.handleEntityLoad();
};

function renderButtonsForEntities(entities, list) {
  var i, l;
  for(i=0,l=entities.length; i< l; i++) {
    views.button(list, entities[i]);
  }
  if(entities.length > 0) {
    views.standaloneButton(list, 'save', 'Save', true); //Disabled save button by default
  }
}

function showComponent(rootEl) {
  rootEl.setAttribute('data-o-author-alerts--js', '');

  //send tracking events since the widget will be visible
  eventHelper.dispatch('oAuthorAlerts.show', null, rootEl);
  //Matching the tracking set by the old widget
  eventHelper.dispatch('oTracking.Data', {'followme': true }, window);

}

AuthorAlerts.prototype.handleEntityLoad = function() {
  message.remove(this.rootEl);
  eventHelper.dispatch('oAuthorAlerts.entitiesLoaded', null, this.rootEl);

  if(!this.list.querySelector('.o-author-alerts__controls')) {
    message.create(this.rootEl,'No Authors found.', '');
  } else if (!config.lazyLoad) {
    showComponent(this.rootEl);
  }
};



module.exports = AuthorAlerts;