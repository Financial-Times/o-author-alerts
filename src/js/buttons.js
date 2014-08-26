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

  setInitialStates(rootEl);

  // Primary alert toggle
  rootDelegate.on('click', '[data-o-author-alerts-id] > .o-author-alerts__button', function(ev, el) {
    toggleButtonState(el.parentElement);
    setSaveButtonState(rootEl);
  });

  // Changes in frequency should enable/disable save button as appropriate
  rootDelegate.on('change', '[data-o-author-alerts-id] > .o-author-alerts__frequency', function(ev, el) {
    setSaveButtonState(rootEl);
  });

  // Save button click should submit changes to frequency
  rootDelegate.on('click', '[data-o-author-alerts-action="save"]', function(ev, el) {
    saveFrequencyUpdates(rootEl, el);
    eventHelper.dispatch('oAuthorAlerts.saveFrequency', null, rootEl);
  });

  // When the widget is closed, set the UI back to it's initial state
  // rootEl.addEventListener('oAuthorAlerts.widgetClose', function() {
  //   dismissUnsavedChanges(rootEl);
  // });

  // Unsubscribe button
  rootDelegate.on('click', '[data-o-author-alerts-action="unsubscribe"]', function(ev, el) {
    stopAll(el, rootEl);
  });
}

function destroy() {
  if(rootDelegate) {
    rootDelegate.off();
  }
}

/* Set the initial UI of the view based on model data */

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
    controls.setAttribute('data-o-author-alerts-state', currentState);

  }
}

/* Checks the entity's alerting state against data stored against the user */

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

/* Handle whether the save button is enabled or not */

function setSaveButtonState(rootEl, forceEnable) {
  var saveBtn = rootEl.querySelector('[data-o-author-alerts-action="save"]');
  if(saveBtn) {
    if(forceEnable || getFrequencyUpdates(rootEl).length > 0) {
      saveBtn.removeAttribute('disabled');
    } else {
      saveBtn.setAttribute('disabled', '');
    }
  }
}

/* Handle Primary button clicks - toggling between alerting state) */
function toggleButtonState(controls) {
  var entity = {
        'id': controls.getAttribute('data-o-author-alerts-id'),
        'name': controls.getAttribute('data-o-author-alerts-name')
      },
      isPressed =(controls.querySelector('.o-author-alerts__button').getAttribute('aria-pressed') === 'true'),
      eventName;

  if(isPressed) {
    // user.subscription.update(entity, 'daily');
    unsubscribe(controls);
    eventName = 'unfollow'; //Old name for tracking purposes
  } else {
    // user.subscription.update(entity, 'off');

    subscribe(controls);
    eventName = 'follow'; //Old name for tracking purposes
  }

  eventHelper.dispatch('oTracking.Event', { model: 'followme', type: eventName, value: entity.name}, window);
}


/* Handle UI when subscribed to an author) */
function subscribe(controls) {
  var name = controls.getAttribute('data-o-author-alerts-name'),
      btn = controls.querySelector('.o-author-alerts__button');

  //note: using innerHTML in second instance since element is hidden so innerText returns ''
  btn.innerHTML = config.stopAlertsText.replace(/\%entityName\%/g, name);
  btn.setAttribute('title', 'Click to stop alerts for this ' + config.entityType);
  btn.setAttribute('aria-pressed', 'true');
  setFrequency(controls, 'daily');
}

/* Handle UI when not subscribed to an author) */
function unsubscribe(controls) {
  var name = controls.getAttribute('data-o-author-alerts-name'),
      btn = controls.querySelector('.o-author-alerts__button');
  btn.innerHTML = config.startAlertsText.replace(/\%entityName\%/g, name); //Use innerHTML as config contains icon html
  btn.setAttribute('title', 'Click to start alerts for this ' + config.entityType);
  btn.setAttribute('aria-pressed', 'false');
  setFrequency(controls, 'off');
}


/* Handle external changes to frequency (i.e. from primary button clicks or dismissing widget) */
function setFrequency(controls, newFrequency) {
  var select = controls.querySelector('.o-author-alerts__frequency');
  if(newFrequency === 'off') {
    select.setAttribute('disabled', '');
  } else {
    select.removeAttribute('disabled');
    select.value = newFrequency;
  }
}

/* Submit changes to frequencies to the server */
function saveFrequencyUpdates(rootEl, saveBtn) {
  var frequenciesToUpdate = getFrequencyUpdates(rootEl);
  var controls, i, l;
  for (i=0, l=frequenciesToUpdate.length; i<l; i++) {
    controls = rootEl.querySelector('[data-o-author-alerts-id="' + frequenciesToUpdate[i].entity.id + '"]');
    user.subscription.update(frequenciesToUpdate[i].entity, frequenciesToUpdate[i].newFrequency);
    controls.setAttribute('data-o-author-alerts-state', frequenciesToUpdate[i].newFrequency);
  }
  saveBtn.setAttribute('disabled', '');

}

/* Return a list of all entities that have frequency updates pending, and the new frequency to update to*/
function getFrequencyUpdates(rootEl) {
  var allControls = rootEl.querySelectorAll('.o-author-alerts__controls'),
      i, l, controls, savedFrequency, newFrequency, entity,
      frequenciesToUpdate = [];
  for (i=0, l=allControls.length; i<l; i++) {
    controls = allControls[i];
    savedFrequency = controls.getAttribute('data-o-author-alerts-state');
    if(controls.querySelector('.o-author-alerts__frequency').disabled === true) {
      newFrequency = 'off';
    } else {
      newFrequency = controls.querySelector('.o-author-alerts__frequency').value;
    }

    if(newFrequency !== savedFrequency) {
      entity = {
        'id': controls.getAttribute('data-o-author-alerts-id'),
        'name': controls.getAttribute('data-o-author-alerts-name'),
      };
      frequenciesToUpdate.push({entity: entity, newFrequency: newFrequency});
    }
  }
  return frequenciesToUpdate;

}


// /* Sets all controls back to original saved state */
// function dismissUnsavedChanges(rootEl) {
//   var unsavedFrequencies = getFrequencyUpdates(rootEl);
//   var controls, i, l;
//   for (i=0, l=unsavedFrequencies.length; i<l; i++) {
//     controls = rootEl.querySelector('[data-o-author-alerts-id="' + unsavedFrequencies[i].entity.id + '"]');
//     setFrequency(controls, controls.getAttribute('data-o-author-alerts-state'));
//   }
//   rootEl.querySelector('[data-o-author-alerts-action="save"]').setAttribute('disabled', '');
// }

/* Unsubscribe All button TODO: use new endpoint */
function stopAll(el, rootEl) {
  var all = rootEl.querySelectorAll('[data-o-author-alerts-state]'),
      i, l;

  message.create(rootEl, 'You have been unsubscribed from all authors.', '');

  user.subscription.update({id: 'ALL', name: 'ALL'}, 'off');

  for(i=0,l=all.length;i<l;i++) {
    if(all[i].getAttribute('data-o-author-alerts-state') !== 'off') {
      unsubscribe(all[i]);
    }
  }

  el.setAttribute('disabled', true);
}

module.exports = {
  init: init,
  destroy: destroy,
  setInitialStates: setInitialStates
};


