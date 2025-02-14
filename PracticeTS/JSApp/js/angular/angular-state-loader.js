/**
 * Created by felix on 18.11.15.
 */
'use strict';
angular.module('ec.stateloader', []).provider('stateLoader', function() {
  var settings = {
      template:     '<div id="IMGDIV" align="center" valign="middle" class="overlay">'+
            '<img src="Content/Images/Double-Ring.svg" style="position:relative; top:45%; " border="0" /><br /></div>',
    templateUrl: null
  };

  this.setTemplate = function(tpl) {
    settings.template = tpl;
  };
  this.getTemplate = function() {
    return settings.template;
  };
  this.setTemplateUrl = function(tpl) {
    settings.templateUrl = tpl;
  };
  this.getTemplateUrl = function() {
    return settings.templateUrl;
  };

  this.$get = function() {
    return this;
  };
}).directive('stateLoader', [
  '$rootScope',
  '$timeout',
  'stateLoader',
  function($rootScope, $timeout, stateLoader) {
    //credits to
    // http://stackoverflow.com/questions/24200909/apply-loading-spinner-during-ui-router-resolve
    return {
      scope:       {
        fromState: '@', //restrict showing loader only
                        // when loading from this state
                        // name
        toState:   '@', //restrict showing loader only
                        // when loading this state name
        delay:     '@', //show loader after ms loading time
        forceShow: '='
      },
      restrict:    'E',
      transclude:  true,
      replace:     true,
      compile:     function(elem, attrs, transcludeFn) {
        var timer;
        return {
          pre:  function preLink(scope) {
            scope.shouldFire =
              function(fromState, toState) {
                return (!scope.fromState ||
                  fromState.name === scope.fromState) &&
                  (!scope.toState ||
                  toState.name === scope.toState) &&
                  scope.forceShow === undefined;
              };
            scope.hideLoader = function(element, force) {
              if (!scope.forceShow || force) {
                if (timer) {
                  $timeout.cancel(timer);
                }
                element.addClass('ng-hide');
              }
            };
            scope.showLoader = function(element) {
              if (scope.delay > 0) {
                timer = $timeout(function() {
                  element.removeClass('ng-hide');
                }, scope.delay);
              } else {
                element.removeClass('ng-hide');
              }
            };

            transcludeFn(elem, function(clone) {
              //check if element contains custom loading
              // text/html
              scope.transcluding = clone.length > 0;
            });
          },
          post: function postLink(scope, element) {
            scope.delay = typeof scope.delay ===
            'number' ? scope.delay : 100;

            scope.$watch('forceShow', function(show) {
              if (show) {
                scope.showLoader(element);
              } else {
                scope.hideLoader(element);
              }
            });

            scope.hideLoader(element, true);

            var show = $rootScope.$on('$stateChangeStart', function(event,
              toState, toParams, fromState, fromParams) {
              if (scope.shouldFire(fromState, toState)) {
                scope.showLoader(element);
              }
            });
            var hide = $rootScope.$on('$stateChangeSuccess', function(event,
              toState, toParams, fromState, fromParams) {
              if (scope.shouldFire(fromState, toState)) {
                scope.hideLoader(element);
              }
            });
            scope.$on('$destroy', show);
            scope.$on('$destroy', hide);
          }
        };
      },
      template:    !stateLoader.getTemplateUrl() ? stateLoader.getTemplate() : null,
      templateUrl: stateLoader.getTemplateUrl() || null
    };
  }]);