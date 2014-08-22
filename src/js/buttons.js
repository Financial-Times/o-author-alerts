/*global require, module*/

'use strict';

var user = require('./user'),
    eventHelper = require('./lib/eventHelper'),
    config = require('./config.js'),
    message = require('./lib/message'),
    DomDelegate = require('ftdomdelegate'),
    rootDelegate,
    frequencyUpdates = {};

//initialise all buttons in the rootEl
function init(rootEl) {
  rootDelegate = new DomDelegate(rootEl);
  rootDelegate.on('click', '[data-o-author-alerts-id] > .o-author-alerts__button', function(ev, el) {
    toggleButtonState(el.parentElement);
  });

  rootDelegate.on('click', '[data-o-author-alerts-action="unsubscribe"]', function(ev, el) {
    stopAll(el, rootEl);
  });

  rootDelegate.on('change', '[data-o-author-alerts-id] > .o-author-alerts__frequency', function(ev, el) {
      rootEl.querySelector('[data-o-author-alerts-action="save"]').removeAttribute('disabled');
  });

  rootDelegate.on('click', '[data-o-author-alerts-action="save"]', function(ev, el) {
    updateAllFrequencies(rootEl, el);
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
      i, l, controls, id, currentState;

  for(i=0,l=entityControls.length; i<l;i++) {
    controls = entityControls[i];
    id = controls.getAttribute('data-o-author-alerts-id');
    currentState = getSubscriptionStatus(id, user.subscription.entities);
    if(currentState === 'off') {
      unsubscribe(controls);
    } else {
      subscribe(controls);
    }
    setFrequency(controls, currentState);
  }
}


function getSubscriptionStatus(id, subscriptionList) {
  var freq = 'off',
      i, l;
  subscriptionList = subscriptionList || [];

  for(i=0,l=subscriptionList.length;i<l;i++) {
    if(subscriptionList[i].id === id) {
      freq = subscriptionList[i].frequency || 'daily';
      break;
    }
  }

  return freq;
}

function toggleButtonState(controls) {
  var entity = {
        'id': controls.getAttribute('data-o-author-alerts-id'),
        'name': controls.getAttribute('data-o-author-alerts-name')
      },
      currentState = controls.getAttribute('data-o-author-alerts-state'),
      eventName = (currentState === 'off') ? 'follow' : 'unfollow';

  if(currentState === 'off') {
    user.subscription.update(entity, 'daily');
    subscribe(controls);
    setFrequency(controls, 'daily');
    eventName = 'follow'; //Old name for tracking purposes
  } else {
    user.subscription.update(entity, 'off');
    unsubscribe(controls);
    setFrequency(controls, 'off');
    eventName = 'unfollow'; //Old name for tracking purposes
  }

  eventHelper.dispatch('oTracking.Event', { model: 'followme', type: eventName, value: entity.name}, window);
}

function setFrequency(controls, newFrequency) {
  var select = controls.querySelector('.o-author-alerts__frequency');
  if(newFrequency === 'off') {
    select.setAttribute('disabled', '');
  } else {
    select.removeAttribute('disabled');

  }
  controls.setAttribute('data-o-author-alerts-state', newFrequency);
}

function updateAllFrequencies(rootEl, saveBtn) {
  var allControls = rootEl.querySelectorAll('.o-author-alerts__controls'),
      i, l, controls, savedFrequency, newFrequency, entity;
  for (i=0, l=allControls.length; i<l; i++) {
    controls = allControls[i];
    savedFrequency = controls.getAttribute('data-o-author-alerts-state');
    newFrequency = controls.querySelector('.o-author-alerts__frequency').value;
    if(savedFrequency !== 'off' && newFrequency !== savedFrequency) {
      entity = {
        'id': controls.getAttribute('data-o-author-alerts-id'),
        'name': controls.getAttribute('data-o-author-alerts-name')
      };
      user.subscription.update(entity, newFrequency);
      controls.setAttribute('data-o-author-alerts-state', newFrequency);
    }
  }
  saveBtn.setAttribute('disabled', '');

}
function subscribe(controls) {
  var name = controls.getAttribute('data-o-author-alerts-name'),
      btn = controls.querySelector('.o-author-alerts__button');

  //note: using innerHTML in second instance since element is hidden so innerText returns ''
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
    toggleButtonState(subscribed[i]);
  }

  el.setAttribute('disabled', true);
}

module.exports = {
  init: init,
  destroy: destroy,
  setInitialStates: setInitialStates
};


