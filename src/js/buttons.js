/*global require, module*/

const user = require('./user');
const eventHelper = require('./lib/eventHelper');
const config = require('./config.js');
const message = require('./lib/message');
const DomDelegate = require('ftdomdelegate');
const DEFAULT_FREQUENCY = 'daily';

let rootDelegate;

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
	rootDelegate.on('change', '[data-o-author-alerts-id] > .o-author-alerts__frequency', function() {
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
	const entityControls = rootEl.querySelectorAll('[data-o-author-alerts-id]');
	let i;
	let l;
	let controls;
	let id;
	let currentState;
	let preferredDefaultFrequency;

	for (i=0,l=entityControls.length; i<l;i++) {
		controls = entityControls[i];
		id = controls.getAttribute('data-o-author-alerts-id');
		preferredDefaultFrequency = controls.getAttribute('data-o-author-alerts-default-frequency');
		currentState = getSubscriptionStatus(id, user.subscription.entities);
		if (currentState === 'off') {
			unsubscribe(controls);
		} else {
			subscribe(controls);
		}
		setFrequency(controls, currentState, preferredDefaultFrequency);
		controls.setAttribute('data-o-author-alerts-state', currentState);

	}
}

/* Checks the entity's alerting state against data stored against the user */

function getSubscriptionStatus(id, subscriptionList) {
	let freq = 'off';
	let i;
	let l;

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
	const saveBtn = rootEl.querySelector('[data-o-author-alerts-action="save"]');
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
	const isPressed = (controls.querySelector('.o-author-alerts__button').getAttribute('aria-pressed') === 'true');
	if (isPressed) {
		unsubscribe(controls);
	} else {
		subscribe(controls);
	}
}

/* Handle UI when subscribed to an author) */
function subscribe(controls) {
	const name = controls.getAttribute('data-o-author-alerts-name');
	const preferredDefaultFrequency = controls.getAttribute('data-o-author-alerts-default-frequency');
	const btn = controls.querySelector('.o-author-alerts__button');

	//note: using innerHTML in second instance since element is hidden so innerText returns ''
	btn.innerHTML = config.get().stopAlertsText.replace(/\%entityName\%/g, name);
	btn.setAttribute('title', config.get().stopAlertsHoverText.replace(/\%entityType\%/g, config.get().entityType));
	btn.setAttribute('aria-pressed', 'true');
	setFrequency(controls, preferredDefaultFrequency || DEFAULT_FREQUENCY);
}

/* Handle UI when not subscribed to an author) */
function unsubscribe(controls) {
	const name = controls.getAttribute('data-o-author-alerts-name');
	const preferredDefaultFrequency = controls.getAttribute('data-o-author-alerts-default-frequency');
	const btn = controls.querySelector('.o-author-alerts__button');

	btn.innerHTML = config.get().startAlertsText.replace(/\%entityName\%/g, name); //Use innerHTML as config contains icon html
	btn.setAttribute('title', config.get().startAlertsHoverText.replace(/\%entityType\%/g, config.get().entityType));
	btn.setAttribute('aria-pressed', 'false');
	setFrequency(controls, 'off', preferredDefaultFrequency || DEFAULT_FREQUENCY); // Reset the frequency toggle
}


/* Handle external changes to frequency (i.e. from primary button clicks or dismissing widget) or set default state */
function setFrequency(controls, newFrequency, preferredDefaultFrequency) {
	const select = controls.querySelector('.o-author-alerts__frequency');
	if (newFrequency === 'off') {
		select.disabled = true;
		select.value = preferredDefaultFrequency || DEFAULT_FREQUENCY;
	} else {
		select.disabled = false;
		select.value = newFrequency || preferredDefaultFrequency || DEFAULT_FREQUENCY;
	}
}

/* Submit changes to frequencies to the server */
function saveFrequencyUpdates(rootEl, saveBtn) {
	const frequenciesToUpdate = getFrequencyUpdates(rootEl);
	let controls;
	let i;
	let l;
	let eventName;
	const updates = [];

	for (i=0, l=frequenciesToUpdate.length; i<l; i++) {
		controls = rootEl.querySelector('[data-o-author-alerts-id="' + frequenciesToUpdate[i].entity.id + '"]');

		updates.push({
			entity: frequenciesToUpdate[i].entity,
			frequency: frequenciesToUpdate[i].newFrequency
		});
		controls.setAttribute('data-o-author-alerts-state', frequenciesToUpdate[i].newFrequency);

		//Send tracking event on Save
		eventName = (frequenciesToUpdate[i].newFrequency === 'off') ? 'unfollow' : 'follow';
		eventHelper.dispatch('oTracking.Event', { model: 'followme', type: eventName, value: frequenciesToUpdate[i].entity.name}, window);
	}

	user.subscription.updateBulk(updates);
	saveBtn.disabled = true;

}

/* Return a list of all entities that have frequency updates pending, and the new frequency to update to*/
function getFrequencyUpdates(rootEl) {
	const allControls = rootEl.querySelectorAll('.o-author-alerts__controls');
	let i;
	let l;
	let controls;
	let savedFrequency;
	let newFrequency;
	let entity;
	const frequenciesToUpdate = [];

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
	const unsavedFrequencies = getFrequencyUpdates(rootEl);
	let controls;
	let i;
	let l;
	let isPressed;
	let savedState;
	let preferredDefaultFrequency;

	for (i=0, l=unsavedFrequencies.length; i<l; i++) {
		controls = rootEl.querySelector('[data-o-author-alerts-id="' + unsavedFrequencies[i].entity.id + '"]');
		savedState = controls.getAttribute('data-o-author-alerts-state');
		preferredDefaultFrequency = controls.getAttribute('data-o-author-alerts-default-frequency');
		isPressed = (controls.querySelector('.o-author-alerts__button').getAttribute('aria-pressed') === 'true');

		if(isPressed && savedState === 'off') {
			unsubscribe(controls);
		} else if (!isPressed && savedState !== 'off') {
			subscribe(controls);
		}
		setFrequency(controls, savedState, preferredDefaultFrequency);
	}

	if (rootEl.querySelector('[data-o-author-alerts-action="save"]')) {
		rootEl.querySelector('[data-o-author-alerts-action="save"]').setAttribute('disabled', '');
	}
}

/* Unsubscribe All button*/
function stopAll(el, rootEl) {
	const all = rootEl.querySelectorAll('[data-o-author-alerts-state]');
	let i;
	let l;

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
