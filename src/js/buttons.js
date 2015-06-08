/*global require, module*/

'use strict';

var user = require('./user');
var eventHelper = require('./lib/eventHelper');
var config = require('./config.js');
var message = require('./lib/message');
var DomDelegate = require('ftdomdelegate');
var rootDelegate;
var DEFAULT_FREQUENCY = 'daily';

/* Initialise all buttons in the rootEl */
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
		eventHelper.dispatch('oAuthorAlerts.saveChanges', null, rootEl);
	});

	// When the widget is closed, set the UI back to it's initial state
	rootEl.addEventListener('oAuthorAlerts.widgetClose', function() {
		dismissUnsavedChanges(rootEl);
	});

	// Unsubscribe button
	rootDelegate.on('click', '[data-o-author-alerts-action="unsubscribe"]', function(ev, el) {
		stopAll(el, rootEl);
	});
}

function destroy() {
	if (rootDelegate) {
		rootDelegate.off();
	}
}

/* Set the initial UI of the view based on model data */

function setInitialStates(rootEl) {
	var entityControls = rootEl.querySelectorAll('[data-o-author-alerts-id]');
	var i;
	var l;
	var controls;
	var id;
	var currentState;

	for (i=0,l=entityControls.length; i<l;i++) {
		controls = entityControls[i];
		id = controls.getAttribute('data-o-author-alerts-id');
		currentState = getSubscriptionStatus(id, user.subscription.entities);
		if (currentState === 'off') {
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
	var freq = 'off';
	var i;
	var l;

	subscriptionList = subscriptionList || [];

	for (i=0,l=subscriptionList.length;i<l;i++) {
		if (subscriptionList[i].id === id) {
			freq = subscriptionList[i].frequency || DEFAULT_FREQUENCY;
			break;
		}
	}

	return freq;
}

/* Handle whether the save button is enabled or not */

function setSaveButtonState(rootEl) {
	var saveBtn = rootEl.querySelector('[data-o-author-alerts-action="save"]');
	if (saveBtn) {
		if (getFrequencyUpdates(rootEl).length > 0) {
			saveBtn.removeAttribute('disabled');
		} else {
			saveBtn.setAttribute('disabled', '');
		}
	}
}

/* Handle Primary button clicks - toggling between alerting state) */
function toggleButtonState(controls) {
	var isPressed = (controls.querySelector('.o-author-alerts__button').getAttribute('aria-pressed') === 'true');
	if (isPressed) {
		unsubscribe(controls);
	} else {
		subscribe(controls);
	}
}

/* Handle UI when subscribed to an author) */
function subscribe(controls) {
	var name = controls.getAttribute('data-o-author-alerts-name');
	var btn = controls.querySelector('.o-author-alerts__button');

	//note: using innerHTML in second instance since element is hidden so innerText returns ''
	btn.innerHTML = config.get().stopAlertsText.replace(/\%entityName\%/g, name);
	btn.setAttribute('title', config.get().stopAlertsHoverText.replace(/\%entityType\%/g, config.get().entityType));
	btn.setAttribute('aria-pressed', 'true');
	setFrequency(controls, DEFAULT_FREQUENCY);
}

/* Handle UI when not subscribed to an author) */
function unsubscribe(controls) {
	var name = controls.getAttribute('data-o-author-alerts-name');
	var btn = controls.querySelector('.o-author-alerts__button');

	btn.innerHTML = config.get().startAlertsText.replace(/\%entityName\%/g, name); //Use innerHTML as config contains icon html
	btn.setAttribute('title', config.get().startAlertsHoverText.replace(/\%entityType\%/g, config.get().entityType));
	btn.setAttribute('aria-pressed', 'false');
	setFrequency(controls, 'off'); // Reset the frequency toggle
}


/* Handle external changes to frequency (i.e. from primary button clicks or dismissing widget) */
function setFrequency(controls, newFrequency) {
	var select = controls.querySelector('.o-author-alerts__frequency');
	if (newFrequency === 'off') {
		select.disabled = true;
		select.value = DEFAULT_FREQUENCY;
	} else {
		select.disabled = false;
		select.value = newFrequency;
	}
}

/* Submit changes to frequencies to the server */
function saveFrequencyUpdates(rootEl, saveBtn) {
	var frequenciesToUpdate = getFrequencyUpdates(rootEl);
	var controls;
	var i;
	var l;
	var eventName;

	for (i=0, l=frequenciesToUpdate.length; i<l; i++) {
		controls = rootEl.querySelector('[data-o-author-alerts-id="' + frequenciesToUpdate[i].entity.id + '"]');
		user.subscription.update(frequenciesToUpdate[i].entity, frequenciesToUpdate[i].newFrequency);
		controls.setAttribute('data-o-author-alerts-state', frequenciesToUpdate[i].newFrequency);
		//Send tracking event on Save
		eventName = (frequenciesToUpdate[i].newFrequency === 'off') ? 'unfollow' : 'follow';
		eventHelper.dispatch('oTracking.Event', { model: 'followme', type: eventName, value: frequenciesToUpdate[i].entity.name}, window);
	}
	saveBtn.disabled = true;

}

/* Return a list of all entities that have frequency updates pending, and the new frequency to update to*/
function getFrequencyUpdates(rootEl) {
	var allControls = rootEl.querySelectorAll('.o-author-alerts__controls');
	var i;
	var l;
	var controls;
	var savedFrequency;
	var newFrequency;
	var entity;
	var frequenciesToUpdate = [];

	for (i=0, l=allControls.length; i<l; i++) {
		controls = allControls[i];
		savedFrequency = controls.getAttribute('data-o-author-alerts-state');
		if (controls.querySelector('.o-author-alerts__frequency').disabled === true) {
			newFrequency = 'off';
		} else {
			newFrequency = controls.querySelector('.o-author-alerts__frequency').value;
		}

		if (newFrequency !== savedFrequency) {
			entity = {
				'id': controls.getAttribute('data-o-author-alerts-id'),
				'name': controls.getAttribute('data-o-author-alerts-name'),
			};
			frequenciesToUpdate.push({entity: entity, newFrequency: newFrequency});
		}
	}
	return frequenciesToUpdate;

}


/* Sets all controls back to original saved state */
function dismissUnsavedChanges(rootEl) {
	var unsavedFrequencies = getFrequencyUpdates(rootEl);
	var controls;
	var i;
	var l;
	var isPressed;
	var savedState;

	for (i=0, l=unsavedFrequencies.length; i<l; i++) {
		controls = rootEl.querySelector('[data-o-author-alerts-id="' + unsavedFrequencies[i].entity.id + '"]');
		savedState = controls.getAttribute('data-o-author-alerts-state');
		isPressed = (controls.querySelector('.o-author-alerts__button').getAttribute('aria-pressed') === 'true');

		if(isPressed && savedState === 'off') {
			unsubscribe(controls);
		} else if (!isPressed && savedState !== 'off') {
			subscribe(controls);
		}
		setFrequency(controls, savedState);
	}

	if (rootEl.querySelector('[data-o-author-alerts-action="save"]')) {
		rootEl.querySelector('[data-o-author-alerts-action="save"]').setAttribute('disabled', '');
	}
}

/* Unsubscribe All button*/
function stopAll(el, rootEl) {
	var all = rootEl.querySelectorAll('[data-o-author-alerts-state]');
	var i;
	var l;

	message.create(rootEl, config.get().unsubscribeAllText, '');

	user.subscription.update({id: 'ALL', name: 'ALL'}, 'off');

	for (i=0,l=all.length;i<l;i++) {
		if (all[i].getAttribute('data-o-author-alerts-state') !== 'off') {
			unsubscribe(all[i]); //set the button states as if they were unsubscribed
		}
	}

	el.setAttribute('disabled', true);
}

module.exports = {
	init: init,
	destroy: destroy,
	setInitialStates: setInitialStates
};
