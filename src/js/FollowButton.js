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
  if(user.following.entities && user.following.entities.length) {
    this.setInitialState()
  } else {
    document.body.addEventListener('oFollow.userPreferencesLoaded', this.setInitialState.bind(this), false);
  }
}

function isBeingFollowed(entity, followingList) {
  var matched = false;
  followingList.forEach(function(following) {
    if(following.id === entity.id) {
      matched = true;
      return;
    }
  });
  return matched;
}

FollowButton.prototype.setInitialState = function() {
  if(isBeingFollowed(this.entity, user.following.entities)) {
    this.startFollowing();
  }
}

FollowButton.prototype.toggleFollowState = function(ev) {
  var isCurrentlyFollowing = (this.btn.getAttribute('data-o-follow-state') === 'true');
  if(isCurrentlyFollowing) {
    user.following.stop(this.entity, user.id )
    this.stopFollowing();
  } else {
    user.following.start(this.entity, user.id);
    this.startFollowing();
  }
}   

FollowButton.prototype.startFollowing = function() {
  this.btn.innerText = "Stop Following";
  this.btn.setAttribute('data-o-follow-state', true);
}

FollowButton.prototype.stopFollowing = function() {
  this.btn.innerText = "Start Following";
  this.btn.setAttribute('data-o-follow-state', false);
}


module.exports = FollowButton;