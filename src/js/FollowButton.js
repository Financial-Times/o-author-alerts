'use strict';

var user = require('./user');
var followButtonView = require('./followButtonView');

function FollowButton(rootEl, entity, options) {
	this.rootEl = rootEl;
  this.entity = entity;
	this.init();
}

FollowButton.prototype.init = function() {
  var wrapper = followButtonView.render(this.rootEl, this.entity);
  this.btn = wrapper.querySelector('[data-o-follow-id]');
  this.btn.addEventListener('click', this.toggleFollowState.bind(this), false);
  if(user.following.entities && Object.keys(user.following.entities).length) {
    this.setInitialState()
  } else {
    document.body.addEventListener('oFollow.userPreferencesLoaded', this.setInitialState.bind(this), false);
  }
}

function isBeingFollowed(entity, followingList) {
  var matched = false;
  var id;
  for(id in followingList) {
    if(followingList.hasOwnProperty(id)) {
      if(id === entity.id) {
        matched = true;
        break;
      }
    }
  }
  return matched;
}

FollowButton.prototype.setInitialState = function() {
  if(isBeingFollowed(this.entity, user.following.entities)) {
    this.setStateToStop();
  }
}

FollowButton.prototype.toggleFollowState = function(ev) {
  var isCurrentlyFollowing = this.rootEl.getAttribute('data-o-follow-state');
  if(isCurrentlyFollowing) {
    user.following.stop(this.entity, user.id )
    this.setStateToStart();
  } else {
    user.following.start(this.entity, user.id);
    this.setStateToStop();
  }
}   

FollowButton.prototype.setStateToStart = function() {
  this.btn.innerText = "Start Following";
  this.rootEl.setAttribute('data-o-follow-state', true);
}

FollowButton.prototype.setStateToStop = function() {
  this.btn.innerText = "Stop Following";
  this.rootEl.setAttribute('data-o-follow-state', false);
}


module.exports = FollowButton;