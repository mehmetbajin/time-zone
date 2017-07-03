(function () {
  'use strict';

  angular
    .module('app.core')
    .provider('msNavigationService', msNavigationServiceProvider)
    .controller('MsNavigationController', MsNavigationController)
    .directive('msNavigation', msNavigationDirective)
    .controller('MsNavigationNodeController', MsNavigationNodeController)
    .directive('msNavigationNode', msNavigationNodeDirective)
    .directive('msNavigationItem', msNavigationItemDirective);

  /* istanbul ignore next */
  /** @ngInject */
  function msNavigationServiceProvider() {
    var navigation = [];

    var service = this;

    // Methods

    service.saveItem = saveItem;
    service.deleteItem = deleteItem;
    service.sortByWeight = sortByWeight;

    //////////

    function saveItem(path, item) {
      if (!angular.isString(path)) {
        return;
      }

      var parts = path.split('.');
      var id = parts[parts.length - 1];
      var parent = _findOrCreateParent(parts);

      var updateItem = false;
      for (var i = 0; i < parent.length; i++) {
        if (parent[i]._id === id) {
          updateItem = parent[i];
          break;
        }
      }

      if (updateItem) {
        angular.extend(updateItem, item);
        updateItem.uisref = _getUiSref(updateItem);
      } else {
        item.children = [];
        if (angular.isUndefined(item.weight) || !angular.isNumber(item.weight)) {
          item.weight = 1;
        }
        item._id = id;
        item._path = path;
        item.uisref = _getUiSref(item);
        parent.push(item);
      }
    }

    function deleteItem(path) {
      if (!angular.isString(path)) {
        return;
      }

      var item = navigation;
      var parts = path.split('.');

      for (var p = 0; p < parts.length; p++) {
        var id = parts[p];

        for (var i = 0; i < item.length; i++) {
          if (item[i]._id === id) {
            if (item[i]._path === path) {
              item.splice(i, 1);
              return true;
            }
            item = item[i].children;
            break;
          }
        }
      }

      return false;
    }

    function sortByWeight(parent) {
      if (!parent) {
        parent = navigation;
        parent.sort(_byWeight);
      }
      for (var i = 0; i < parent.length; i++) {
        var children = parent[i].children;
        if (children.length > 1) {
          children.sort(_byWeight);
        }
        if (children.length > 0) {
          sortByWeight(children);
        }
      }
    }

    function _findOrCreateParent(parts) {
      var parent = navigation;
      if (parts.length === 1) {
        return parent;
      }
      parts.pop();

      for (var i = 0; i < parts.length; i++) {
        var _id = parts[i];
        var createParent = true;

        for (var p = 0; p < parent.length; p++) {
          if (parent[p]._id === _id) {
            parent = parent[p].children;
            createParent = false;
            break;
          }
        }

        if (createParent) {
          var item = {
            _id: _id,
            _path: parts.join('.'),
            title: _id,
            weight: 1,
            children: []
          };
          parent.push(item);
          parent = item.children;
        }
      }

      return parent;
    }

    function _byWeight(x, y) {
      return parseInt(x.weight) - parseInt(y.weight);
    }

    function _getUiSref(item) {
      var uisref = '';

      if (angular.isDefined(item.state)) {
        uisref = item.state;

        if (angular.isDefined(item.stateParams) && angular.isObject(item.stateParams)) {
          uisref = uisref + '(' + angular.toJson(item.stateParams) + ')';
        }
      }

      return uisref;
    }

    this.$get = function () {
      var activeItem = null;
      var navigationScope = null;
      var folded = null;
      var foldedOpen = null;

      var service = {
        saveItem: saveItem,
        deleteItem: deleteItem,
        sort: sortByWeight,
        clearNavigation: clearNavigation,
        setActiveItem: setActiveItem,
        getActiveItem: getActiveItem,
        getNavigation: getNavigation,
        getFlatNavigation: getFlatNavigation,
        setNavigationScope: setNavigationScope,
        setFolded: setFolded,
        getFolded: getFolded,
        setFoldedOpen: setFoldedOpen,
        getFoldedOpen: getFoldedOpen,
        toggleFolded: toggleFolded
      };

      return service;

      //////////

      function clearNavigation() {
        navigation = [];
        if (navigationScope) {
          navigationScope.vm.navigation = navigation;
        }
      }

      function setActiveItem(node, scope) {
        activeItem = {
          node: node,
          scope: scope
        };
      }

      function getActiveItem() {
        return activeItem;
      }

      function getNavigation(root) {
        if (root) {
          for (var i = 0; i < navigation.length; i++) {
            if (navigation[i]._id === root) {
              return [navigation[i]];
            }
          }

          return null;
        }

        return navigation;
      }

      function getFlatNavigation(root) {
        return _flattenNavigation(getNavigation(root));
      }

      function setNavigationScope(scope) {
        navigationScope = scope;
      }

      function setFolded(status) {
        folded = status;
      }

      function getFolded() {
        return folded;
      }

      function setFoldedOpen(status) {
        foldedOpen = status;
      }

      function getFoldedOpen() {
        return foldedOpen;
      }

      function toggleFolded() {
        navigationScope.toggleFolded();
      }

      function _flattenNavigation(navigation) {
        var flatNav = [];

        for (var x = 0; x < navigation.length; x++) {
          var navToPush = angular.copy(navigation[x]);
          navToPush.children = [];
          flatNav.push(navToPush);

          if (navigation[x].children.length > 0) {
            flatNav = flatNav.concat(_flattenNavigation(navigation[x].children));
          }
        }

        return flatNav;
      }
    };
  }

  /* istanbul ignore next */
  /** @ngInject */
  function MsNavigationController($scope, msNavigationService) {
    var vm = this;

    // Data

    if ($scope.root) {
      vm.navigation = msNavigationService.getNavigation($scope.root);
    } else {
      vm.navigation = msNavigationService.getNavigation();
    }

    //////////

    init();

    function init() {
      msNavigationService.sort();
    }
  }

  /* istanbul ignore next */
  /** @ngInject */
  function msNavigationDirective($rootScope, $timeout, $mdSidenav, msNavigationService) {
    return {
      restrict: 'E',
      scope: {
        folded: '=',
        root: '@'
      },
      controller: 'MsNavigationController as vm',
      templateUrl: 'app/core/directives/ms-navigation/templates/vertical.html',
      transclude: true,
      compile: function (tElement) {
        tElement.addClass('ms-navigation');

        return function postLink(scope, iElement) {
          var bodyEl = angular.element('body');
          var foldExpanderEl = angular.element('<div id="ms-navigation-fold-expander"></div>');
          var foldCollapserEl = angular.element('<div id="ms-navigation-fold-collapser"></div>');
          var sidenav = $mdSidenav('navigation');

          msNavigationService.setNavigationScope(scope);

          init();

          function init() {
            if (msNavigationService.getFolded() === null) {
              msNavigationService.setFolded(scope.folded);
            }

            if (msNavigationService.getFolded()) {
              $timeout(function () {
                $rootScope.$broadcast('msNavigation::collapse');
              });

              bodyEl.addClass('ms-navigation-folded');

              setFoldExpander();
            }
          }

          scope.$watch(function () {
            return sidenav.isLockedOpen();
          }, function (current, old) {
            if (angular.isUndefined(current) || angular.equals(current, old)) {
              return;
            }

            var folded = msNavigationService.getFolded();

            if (folded) {
              if (current) {
                $rootScope.$broadcast('msNavigation::collapse');
              } else {
                var activeItem = msNavigationService.getActiveItem();
                if (activeItem) {
                  activeItem.scope.$emit('msNavigation::stateMatched');
                }
              }
            }
          });

          scope.$watch('folded', function (current, old) {
            if (angular.isUndefined(current) || angular.equals(current, old)) {
              return;
            }

            setFolded(current);
          });

          function setFolded(folded) {
            msNavigationService.setFolded(folded);

            if (folded) {
              $rootScope.$broadcast('msNavigation::collapse');
              bodyEl.addClass('ms-navigation-folded');
              setFoldExpander();
            } else {
              var activeItem = msNavigationService.getActiveItem();
              if (activeItem) {
                activeItem.scope.$emit('msNavigation::stateMatched');
              }
              bodyEl.removeClass('ms-navigation-folded ms-navigation-folded-open');
              removeFoldCollapser();
            }
          }

          function setFoldExpander() {
            iElement.parent().append(foldExpanderEl);

            $timeout(function () {
              foldExpanderEl.on('mouseenter touchstart', onFoldExpanderHover);
            });
          }

          function setFoldCollapser() {
            bodyEl.find('#main').append(foldCollapserEl);
            foldCollapserEl.on('mouseenter touchstart', onFoldCollapserHover);
          }

          function removeFoldCollapser() {
            foldCollapserEl.remove();
          }

          function onFoldExpanderHover(event) {
            if (event) {
              event.preventDefault();
            }
            msNavigationService.setFoldedOpen(true);

            var activeItem = msNavigationService.getActiveItem();
            if (activeItem) {
              activeItem.scope.$emit('msNavigation::stateMatched');
            }

            bodyEl.addClass('ms-navigation-folded-open');
            foldExpanderEl.remove();
            setFoldCollapser();
          }

          function onFoldCollapserHover(event) {
            if (event) {
              event.preventDefault();
            }

            msNavigationService.setFoldedOpen(false);
            $rootScope.$broadcast('msNavigation::collapse');
            bodyEl.removeClass('ms-navigation-folded-open');
            foldCollapserEl.remove();
            setFoldExpander();
          }

          scope.toggleFolded = function () {
            setFolded(!msNavigationService.getFolded());
          };

          scope.$on('$stateChangeStart', function () {
            sidenav.close();
          });

          scope.$on('$destroy', function () {
            foldCollapserEl.off('mouseenter touchstart');
            foldExpanderEl.off('mouseenter touchstart');
          });
        };
      }
    };
  }

  /* istanbul ignore next */
  /** @ngInject */
  function MsNavigationNodeController($scope, $element, $rootScope, $animate, $state, msNavigationService) {
    var vm = this;

    // Data

    vm.element = $element;
    vm.node = $scope.node;
    vm.hasChildren = undefined;
    vm.collapsed = undefined;
    vm.collapsable = undefined;
    vm.group = undefined;
    vm.animateHeightClass = 'animate-height';

    // Methods

    vm.toggleCollapsed = toggleCollapsed;
    vm.collapse = collapse;
    vm.expand = expand;
    vm.getClass = getClass;
    vm.isHidden = isHidden;

    //////////

    init();

    function init() {
      vm.hasChildren = vm.node.children.length > 0;

      vm.group = !!(angular.isDefined(vm.node.group) && vm.node.group === true);

      if (!vm.hasChildren || vm.group) {
        vm.collapsable = false;
      } else {
        vm.collapsable = !!(angular.isUndefined(vm.node.collapsable) || typeof vm.node.collapsable !== 'boolean' || vm.node.collapsable === true);
      }

      if (!vm.collapsable) {
        vm.collapsed = false;
      } else {
        vm.collapsed = !!(angular.isUndefined(vm.node.collapsed) || typeof vm.node.collapsed !== 'boolean' || vm.node.collapsed === true);
      }

      if (vm.node.state === $state.current.name || $state.includes(vm.node.state)) {
        if (angular.isDefined(vm.node.stateParams) && angular.isDefined($state.params) && !angular.equals(vm.node.stateParams, $state.params)) {
          return;
        }

        $scope.$emit('msNavigation::stateMatched');

        msNavigationService.setActiveItem(vm.node, $scope);
      }

      $scope.$on('msNavigation::stateMatched', function () {
        if (vm.collapsable && vm.collapsed) {
          $scope.$evalAsync(function () {
            vm.collapsed = false;
          });
        }
      });

      $scope.$on('msNavigation::collapse', function (event, path) {
        if (vm.collapsed || !vm.collapsable) {
          return;
        }

        if (angular.isUndefined(path)) {
          vm.collapse();
        } else {
          var givenPathParts = path.split('.');
          var activePathParts = [];

          var activeItem = msNavigationService.getActiveItem();
          if (activeItem) {
            activePathParts = activeItem.node._path.split('.');
          }

          if (givenPathParts.indexOf(vm.node._id) > -1) {
            return;
          }

          if (activePathParts.indexOf(vm.node._id) > -1) {
            return;
          }

          vm.collapse();
        }
      });

      $scope.$on('$stateChangeSuccess', function () {
        if (vm.node.state === $state.current.name) {
          if (angular.isDefined(vm.node.stateParams) && angular.isDefined($state.params) && !angular.equals(vm.node.stateParams, $state.params)) {
            return;
          }

          msNavigationService.setActiveItem(vm.node, $scope);

          $rootScope.$broadcast('msNavigation::collapse', vm.node._path);
        }

        if ($state.includes(vm.node.state)) {
          if (angular.isDefined(vm.node.stateParams) && angular.isDefined($state.params) && !angular.equals(vm.node.stateParams, $state.params)) {
            return;
          }
          $scope.$emit('msNavigation::stateMatched');
        }
      });
    }

    function toggleCollapsed() {
      if (vm.collapsed) {
        vm.expand();
      } else {
        vm.collapse();
      }
    }

    function collapse() {
      var collapseEl = vm.element.children('ul');
      var height = collapseEl[0].offsetHeight;

      $scope.$evalAsync(function () {
        vm.collapsed = true;

        vm.element.addClass('collapsing');

        $animate.animate(collapseEl, {
            'display': 'block',
            'height': height + 'px'
          }, {
            'height': '0px'
          },
          vm.animateHeightClass
        ).then(function () {
          collapseEl.css({
            'display': '',
            'height': ''
          });
          vm.element.removeClass('collapsing');
        });

        $scope.$broadcast('msNavigation::collapse');
      });
    }

    function expand() {
      var expandEl = vm.element.children('ul');

      expandEl.css({
        'position': 'absolute',
        'visibility': 'hidden',
        'display': 'block',
        'height': 'auto'
      });

      var height = expandEl[0].offsetHeight;

      expandEl.css({
        'position': '',
        'visibility': '',
        'display': '',
        'height': ''
      });

      $scope.$evalAsync(function () {
        vm.collapsed = false;

        vm.element.addClass('expanding');

        $animate.animate(expandEl, {
            'display': 'block',
            'height': '0px'
          }, {
            'height': height + 'px'
          },
          vm.animateHeightClass
        ).then(
          function () {
            expandEl.css({
              'height': ''
            });

            vm.element.removeClass('expanding');
          }
        );

        $rootScope.$broadcast('msNavigation::collapse', vm.node._path);
      });
    }

    function getClass() {
      return vm.node.class;
    }

    function isHidden() {
      if (angular.isDefined(vm.node.hidden) && angular.isFunction(vm.node.hidden)) {
        return vm.node.hidden();
      }

      return false;
    }
  }

  /* istanbul ignore next */
  /** @ngInject */
  function msNavigationNodeDirective() {
    return {
      restrict: 'A',
      bindToController: {
        node: '=msNavigationNode'
      },
      controller: 'MsNavigationNodeController as vm',
      compile: function (tElement) {
        tElement.addClass('ms-navigation-node');

        return function postLink(scope, iElement, iAttrs, MsNavigationNodeCtrl) {
          iElement.addClass(MsNavigationNodeCtrl.getClass());

          if (MsNavigationNodeCtrl.group) {
            iElement.addClass('group');
          }
        };
      }
    };
  }

  /* istanbul ignore next */
  /** @ngInject */
  function msNavigationItemDirective() {
    return {
      restrict: 'A',
      require: '^msNavigationNode',
      compile: function (tElement) {
        tElement.addClass('ms-navigation-item');

        return function postLink(scope, iElement, iAttrs, MsNavigationNodeCtrl) {
          if (MsNavigationNodeCtrl.collapsable) {
            iElement.on('click', MsNavigationNodeCtrl.toggleCollapsed);
          }

          scope.$on('$destroy', function () {
            iElement.off('click');
          });
        };
      }
    };
  }
})();
