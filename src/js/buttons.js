/*global require, module*/

'use strict';

var user = require('./user'),
    eventHelper = require('./lib/eventHelper'),
    config = require('./config.js'),
    message = require('./lib/message'),
    DomDelegate = require('ftdomdelegate'),
    rootDelegate;

//initialise all buttons in the rootEl
function init(rootEl) {
  rootDelegate = new DomDelegate(rootEl);
  rootDelegate.on('click', '[data-o-author-alerts-id] > .o-author-alerts__button', function(ev, el) {
    toggleAlertState(el.parentElement);
  });

  rootDelegate.on('click', '[data-o-author-alerts-all="unsubscribe"]', function(ev, el) {
    stopAll(el, rootEl);
  });

  setInitialStates(rootEl);
}

function destroy() {
  if(rootDelegate) {
    rootDelegate.off();
  }
}


function setInitialStates(rootEl) {
  var entityControls = rootEl.querySelectorAll('[data-o-author-alerts-id]'),
      i, l, entity, id;

  for(i=0,l=entityControls.length; i<l;i++) {
    entity = entityControls[i];
    id = entity.getAttribute('data-o-author-alerts-id');
    if(isSubscribed(id, user.subscription.entities)) {
      subscribe(entity);
    } else {
      unsubscribe(entity);
    }
  }
}

function isSubscribed(id, subscriptionList) {
  var matched = false,
      i, l;
  subscriptionList = subscriptionList || [];

  for(i=0,l=subscriptionList.length;i<l;i++) {
    if(subscriptionList[i].id === id) {
      matched = true;
      break;
    }
  }

  return matched;
}

function toggleAlertState(controls) {
  var isSubscribed = (controls.getAttribute('data-o-author-alerts-state') === 'true'),
      entity = {
        'id': controls.getAttribute('data-o-author-alerts-id'),
        'name': controls.getAttribute('data-o-author-alerts-name')
      },
      eventName;
  if(isSubscribed) {
    user.subscription.stop(entity, user.id );
    unsubscribe(controls);
    eventName = 'unfollow'; //Old name for tracking purposes
  } else {
    user.subscription.start(entity, user.id);
    subscribe(controls);
    eventName = 'follow'; //Old name for tracking purposes
  }

  eventHelper.dispatch('oTracking.Event', { model: 'followme', type: eventName, value: entity.name}, window);
}

function subscribe(controls) {
  var name = controls.getAttribute('data-o-author-alerts-name'),
      btn = controls.querySelector('.o-author-alerts__button');
  //note: using innerHTML in second instance since element is hidden so innerText returns ''
  controls.setAttribute('data-o-author-alerts-state', true);
  btn.innerHTML = config.stopAlertsText.replace(/\%entityName\%/g, name);
  btn.setAttribute('title', 'Click to stop alerts for this ' + config.entityType);

}

function unsubscribe(controls) {
  var name = controls.getAttribute('data-o-author-alerts-name'),
      btn = controls.querySelector('.o-author-alerts__button');
  controls.setAttribute('data-o-author-alerts-state', false);
  btn.innerHTML = config.startAlertsText.replace(/\%entityName\%/g, name); //Use innerHTML as config contains icon html
  btn.setAttribute('title', 'Click to start alerts for this ' + config.entityType);

}

function stopAll(el, rootEl) {
  var subscribed = rootEl.querySelectorAll('[data-o-author-alerts-state="true"]'),
      i, l;

  message.create(rootEl, 'You have been unsubscribed from all authors.', '');

  for(i=0,l=subscribed.length;i<l;i++) {
    toggleAlertState(subscribed[i]);
  }

  el.setAttribute('disabled', true);
}

module.exports = {
  init: init,
  destroy: destroy,
  setInitialStates: setInitialStates
};


