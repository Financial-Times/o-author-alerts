/*global require, module*/

'use strict';

var user = require('./user');
var DomDelegate = require('ftdomdelegate');

function init(rootEl) {
  //bind dom delegate event
  //loop through buttons and set initial state
  var rootDelegate = new DomDelegate(rootEl);
  var buttons = rootEl.querySelectorAll('[data-o-follow-id]'),
      i,l;

  rootDelegate.on('click', '[data-o-follow-id]', toggleFollowState);
  for(i=0,l=buttons.length; i<l;i++) {
    setInitialState(buttons[i]);
  }
}

function isBeingFollowed(id, followingList) {
  var matched = false;
  followingList.forEach(function(following) {
    if(following.id === id) {
      matched = true;
      return;
    }
  });
  return matched;
}

function setInitialState(btn) {
  if(isBeingFollowed(btn.getAttribute('data-o-follow-id'), user.following.entities)) {
    startFollowing(btn);
  }
}

function toggleFollowState(ev) {
  var btn = ev.target;
  var isCurrentlyFollowing = (btn.getAttribute('data-o-follow-state') === 'true');
  var entity = {
    'id': btn.getAttribute('data-o-follow-id'),
    'name': btn.getAttribute('data-o-follow-name')
  };

  if(isCurrentlyFollowing) {
    user.following.stop(entity, user.id );
    stopFollowing(btn);
  } else {
    user.following.start(entity, user.id);
    startFollowing(btn);
  }
};


function startFollowing(el) {
  el.innerText = el.innerText.replace('Start', 'Stop');
  el.setAttribute('data-o-follow-state', true);
}

function stopFollowing(el) {
  el.innerText = el.innerText.replace('Stop', 'Start');
  el.setAttribute('data-o-follow-state', false);
};



module.exports = {
  init: init
};


