/*global angular*/
//Initialize app
var app = angular.module('app', [
							'ngRoute', 
							'ngResource', 
							'ngCookies', 
							'ui.grid', 
							'ui.grid.resizeColumns', 
							'ui.grid.moveColumns', 
							'ui.grid.selection', 
							'ui.grid.exporter', 
							'ui.grid.autoResize',
							'ui.bootstrap',
							'ui.calendar',    
							'ngMessages',
							'angular-md5',
							'zingchart-angularjs',
							'720kb.datepicker'
							]);
/*global $*/
//JQuery

GLOBALS = {}

GLOBALS.data = {}

GLOBALS.registry = {}

GLOBALS.methods = {
	autoFocus: function(){
		setTimeout(function(){
			angular.element(document).ready(function() {
				//$('input[autofocus]:visible:first').focus();
				$($('input')[0]).focus()
			});
		}, 1000);
	},
	sideNav: function(cb, mode) {
		if (!GLOBALS.registry.sideNavStatus) {
			GLOBALS._internal.sideNav(cb, mode);
		}
	},
	sideNavDelayed: function(mode) {
		setTimeout(function(){
			GLOBALS.methods.sideNavLoading();
		}, 1000);
		setTimeout(function() {
			GLOBALS.methods.sideNav(null, mode);
		}, 2500);
	},
	sideNavLoading: function(){
		$('.menu-static').hide();
        $('.menu-loading').show();        
	},
	logout: function(){
		GLOBALS.registry.sideNavStatus = false;
		$('.all-nav').hide(); //CUSTOM
		$('.menu-static').show();
        $('.menu-loading').hide();        
	}
}

GLOBALS._internal = {
	
	sideNav: function(cb, mode = "expand") {
		$('.all-nav').show(); //CUSTOM
		$('#main-nav').hide();
		$('.side-nav-div').css('display', 'none');
	
		for (var x = navCount; x >= 0; x--) {
			$('.all-nav').removeClass('hc-nav-' + x);
			$('nav.hc-nav-' + x).remove();
		}
		
		
	
		setTimeout(function(cb) {
	
			var $main_nav = $('#main-nav');
			var $toggle = $('.toggle');
	
	
			var defaultData = {
				maxWidth: false,
				customToggle: $toggle,
				navTitle: '',
				levelTitles: true,
				pushContent: '#container',
				insertClose: 2,
				closeLevels: false,
				levelOpen: mode, //overlap, expand or false,
				levelSpacing: 0
			};
	
			// add new items to original nav
			$main_nav.find('li.add').children('a').on('click', function() {
				var $this = $(this);
				var $li = $this.parent();
				var items = eval('(' + $this.attr('data-add') + ')');
	
				$li.before('<li class="new"><a>' + items[0] + '</a></li>');
	
				items.shift();
	
				if (!items.length) {
					$li.remove();
				} else {
					$this.attr('data-add', JSON.stringify(items));
				}
	
				Nav.update(true);
			});
	
			// call our plugin
			Nav = $main_nav.hcOffcanvasNav(defaultData);
	
			// demo settings update
	
			const update = (settings) => {
				if (Nav.isOpen()) {
					Nav.on('close.once', function() {
						Nav.update(settings);
						Nav.open();
					});
	
					Nav.close();
				} else {
					Nav.update(settings);
				}
			};
	
			$('.actions').find('a').on('click', function(e) {
				e.preventDefault();
	
				var $this = $(this).addClass('active');
				var $siblings = $this.parent().siblings().children('a').removeClass('active');
				var settings = eval('(' + $this.data('demo') + ')');
	
				update(settings);
			});
	
			$('.actions').find('input').on('change', function() {
				var $this = $(this);
				var settings = eval('(' + $this.data('demo') + ')');
	
				if ($this.is(':checked')) {
					update(settings);
				} else {
					var removeData = {};
					$.each(settings, function(index, value) {
						removeData[index] = false;
					});
	
					update(removeData);
				}
			});
	
			$('.menu-loading').hide();
			$('.side-nav-div').css('display', 'inherit');
			$('#main-nav').hide();
	
			//SideNavStatus = true;
			GLOBALS.registry.sideNavStatus = true;
	
			if (cb) cb();
	
		}, 1000, cb);
	
	},
	
	allNavHide: function(){
		for (i = 100; i <= 2000; i += 100) {
			setTimeout(function() {
				$('.all-nav').hide();
			}, i);
		}
	},
	
	htmlbodyHeightUpdate: function() {
		var height3 = $(window).height()
		var height1 = $('.nav').height() + 50
		height2 = $('.main').height()
		if (height2 > height3) {
			$('html').height(Math.max(height1, height3, height2) + 10);
			$('body').height(Math.max(height1, height3, height2) + 10);
		} else {
			$('html').height(Math.max(height1, height3, height2));
			$('body').height(Math.max(height1, height3, height2));
		}
	},
	
	triggerHtmlBodyHeightUpdate: function(){
		GLOBALS._internal.htmlbodyHeightUpdate();
		$(window).resize(function() {
			GLOBALS._internal.htmlbodyHeightUpdate();
		});
		$(window).scroll(function() {
			height2 = $('.main').height();
			GLOBALS._internal.htmlbodyHeightUpdate();
		});
	}

}

$(function() {

	$(document).ready(function() {

		GLOBALS._internal.triggerHtmlBodyHeightUpdate();
		
		GLOBALS._internal.allNavHide();
	});
});
/*global app, RegisterRoutes*/
app.factory('httpRequestInterceptor', function($rootScope, $q) {
	return {
		request: function(config) {
			$rootScope.loading = true;
			if ($rootScope.currentUser) {
				config.headers['api-key'] = $rootScope.currentUser.token;

				if ($rootScope.SETTINGS.enableSaaS) {
					if (config.method == "GET" || config.method == "DELETE" || config.method == "PUT") {
						var m = config.url.match(/\.[0-9a-z]+$/i);
						var bypassedKeywords = ['ui-grid'];
						var bypassedKeywordsMatches = bypassedKeywords.filter(function(p) {
							return config.url.indexOf(p) > -1
						});
						if ((m && m.length > 0) || bypassedKeywordsMatches.length > 0) {} else {
							var idx = config.url.lastIndexOf("/");
							var idt = config.url.substr(idx);
							if (config.method == "PUT" && isNaN(idt)) {
								config.data.secret = $rootScope.currentUser.secret;
							} else {
								var secret = '/?secret=';
								if (config.url.endsWith('/')) secret = '?secret=';
								if (config.url.indexOf('?') > -1) secret = '&secret=';
								config.url = config.url + secret + $rootScope.currentUser.secret;
							}
						}
					} else {
						config.headers['secret'] = $rootScope.currentUser.secret;
						config.data.secret = $rootScope.currentUser.secret;
					}
				}
			}
			return config;
		},
		response: function(response) {
			//if(response.headers()['content-type'] === "application/json; charset=utf-8"){
			$rootScope.loading = false;
			//}
			return response;
		},
		responseError: function(response) {
			$rootScope.loading = false;
			if (response.status === 401) {
				$rootScope.$emit('loginRequired');
			}
			if (response.status === 503) {
				$rootScope.$emit('outOfService');
			}
			return $q.reject(response);
		}
	};
});


function CustomRoutes() {
	this.routes = RegisterRoutes();
}

app.provider('customRoutes', function() {
	Object.assign(this, new CustomRoutes());

	this.$get = function() {
		return new CustomRoutes();
	};
});


app.config(async function($routeProvider, $resourceProvider, $httpProvider, $controllerProvider, customRoutesProvider) {
		var routes = customRoutesProvider.routes.customRoutes;
		var existingRoutes = routes.map(function(p) {
			return p.route;
		});
		AutoRoutes = [];

		var easyRoutes = customRoutesProvider.routes.easyRoutes || [];
		for (var i = 0; i < easyRoutes.length; i++) {
			var r = easyRoutes[i];
			routes.push({
				route: r,
				template: 'common/templates/list',
				controller: r
			});
			routes.push({
				route: r + '/new',
				template: 'common/templates/new',
				controller: r
			});
			routes.push({
				route: r + '/:id',
				template: 'common/templates/edit',
				controller: r
			});
			existingRoutes.push(r);
		}

		var autoRoutesExcluded = customRoutesProvider.routes.autoRoutesExcluded || [];
		autoRoutesExcluded.forEach(function(p) {
			existingRoutes.push(p);
		});

		var autoRoutes = customRoutesProvider.routes.autoRoutes;
		GLOBALS.menu = {
			masterItems: [],
			controllers: []
		};

		for (var i = 0; i < autoRoutes.length; i++) {
			var r = autoRoutes[i];
			routes.push({
				route: r,
				template: 'common/templates/list',
				controller: r
			});
			routes.push({
				route: r + '/new',
				template: 'common/templates/new',
				controller: r
			});
			routes.push({
				route: r + '/:id',
				template: 'common/templates/edit',
				controller: r
			});
			existingRoutes.push(r);
			GLOBALS.menu.masterItems.push({
				action: r,
				icon: 'settings',
				color: '',
				text: Helper.toTitleCase(Helper.replaceAll(r, '_', ' '))
			});
		}

		if (Settings.get().autoMasters) {
			var initInjector = angular.injector(['ng']);
			var $http = initInjector.get('$http');
			var S = Settings.get();
			await $http.get(S.baseUrl + '/metadata/table').then(function(r) {
				r.data.forEach(function(i) {
					for (j in i) {
						if (!(existingRoutes.indexOf(i[j]) > -1)) {
							autoRoutes.push(i[j]);
							GLOBALS.menu.masterItems.push({
								action: i[j],
								icon: 'settings',
								color: '',
								text: Helper.toTitleCase(Helper.replaceAll(i[j], '_', ' '))
							});


							routes.push({
								route: i[j],
								template: 'common/templates/list',
								controller: i[j]
							});
							routes.push({
								route: i[j] + '/new',
								template: 'common/templates/new',
								controller: i[j]
							});
							routes.push({
								route: i[j] + '/:id',
								template: 'common/templates/edit',
								controller: i[j]
							});

							GLOBALS.menu.controllers.push(i[j]);

							var auto = true;

							(function($controllerProvider, route, auto) {
								$controllerProvider.register(route + 'ControllerBase', ControllerFactory(route));

								$controllerProvider.register(route + 'Controller', function($scope, $controller, H) {
									//Copy all scope variables from Base Controller
									$controller(route + 'ControllerBase', {
										$scope: $scope
									});
									try {
										$controller(route + 'ControllerExtension', {
											$scope: $scope
										});
									} catch (ex) {
										console.log(ex);
									}


									if (auto) {
										$scope.initTextResourcesAuto();
									} else {
										$scope.initTextResourcesEasy();
									}

									//$scope.setListHeaders(headers);

								});
							})($controllerProvider, i[j], auto)

							//RegisterEasyController(i[j],null,null,true/*, data[easyRoutes[i]].headers*/);

						}
					}
				});
			}, function(e) {});
		}



		for (var i = 0; i < routes.length; i++) {
			var r = routes[i];
			$routeProvider.when('/' + r.route, {
				templateUrl: 'app/modules/' + r.template + '.html',
				controller: r.controller + 'Controller'
			});
		}

		$httpProvider.interceptors.push('httpRequestInterceptor');
	});

app.run(function($rootScope, $location, $cookies, H) {
	$rootScope.SETTINGS = H.SETTINGS;
	$rootScope.S = H.SETTINGS;
	$rootScope.M = H.MESSAGES;

	$rootScope.fieldTypes = H.SETTINGS.fieldTypes;

	$rootScope.openRoutes = H.getOpenRoutes();

	$rootScope.$on("$locationChangeStart", function(event, next, current) {
		if (!$rootScope.currentUser) {

			var cookie = $cookies.get(H.getCookieKey());
			if (!cookie) {

				if ($rootScope.openRoutes.indexOf($location.path()) > -1) {} else {
					$location.path('/sign-in');
				}
			} else {
				var cu = JSON.parse(cookie);
				$rootScope.currentUser = typeof cu === 'string' ? JSON.parse(cu) : cu;
                
				$rootScope.currentTheme = {
					bg : ( H.S.theme.background || 'light'),
					col : ( H.S.theme.color || 'black'),
					alt : ( H.S.theme.alternate || 'light'),
					cont : ( H.S.theme.contrast || 'grey')
				}
                                            
				if (next && current) {
					$rootScope.$emit("buildMenu");
				}

			}
		}
	});

	$rootScope.$on("loginRequired", function(event, next, current) {
		// GLOBALS.registry.sideNavStatus = false;
		// $('.all-nav').hide(); //CUSTOM
		// $('.menu-static').show();
  //      $('.menu-loading').hide();
		GLOBALS.methods.logout();
        
		$cookies.remove(H.getCookieKey());
		delete $rootScope.currentUser;
		$location.path('/sign-in');
	});

	$rootScope.$on("outOfService", function(event, next, current) {
		$cookies.remove(H.getCookieKey());
		delete $rootScope.currentUser;
		$location.path('/out-of-service');
	});

	$rootScope.$on("buildMenu", function(event, next, current) {
		GLOBALS.methods.sideNavDelayed(H.S.menu);
		// var timeout = 2500;
		// if (Settings.get().autoMasters) {
		// 	timeout = 2500;
		// 	// setTimeout(function(){
		// 	// 	for(k in GLOBALS.menu.controllers){
		// 	// 		var c = GLOBALS.menu.controllers[k];
		// 	// 		RegisterEasyController(c,null,null,true/*, data[easyRoutes[i]].headers*/);	
		// 	// 	}
		// 	// }, timeout);
		// }
	});


});
//ControllerFactory helps wrap basic CRUD operations for any API resource
function ControllerFactory(resourceName, options, extras) {
	return function($scope, $rootScope, $http, $routeParams, $location, Popup, H, M, S, R) {
		//Get resource by name. Usually it would be you API i.e. generated magically from your database table.

		$scope.resourceName = resourceName;
		var Resource = H.R.get(resourceName);

		$http.get(S.baseUrl + '/metadata/table?id=' + resourceName).then(function(r) {
			$scope.metadata = r.data;
			$scope.buildSingleHeaders();
            
			setTimeout(function(){
				$scope.data.onuploadCallbacks = []
				$scope.data.singleKeys.forEach(function(i){
					if((i.endsWith('_file') || i.endsWith('_image') || i.endsWith('_photo') || i.endsWith('_video') || i.endsWith('_sound') || i.endsWith('_music') || i.endsWith('_audio') || i.endsWith('_attachment') || i.endsWith('file') || i.endsWith('attachment') || i.endsWith('image'))){
				    	$scope.data.onuploadCallbacks[i] = function(r){
					    	$scope.data.single[i] = r.data.file;
						}
			    	}

				});	
			}, 300);
            
		}, function(e) {});

		//Scope variables
		$scope.data = {};
		$scope.data.single = new Resource();
		$scope.data.list = [];
		$scope.data.limit = 10;
		$scope.data.currentPage = 1;
		$scope.data.pages = [];
		$scope.errors = [];
		$scope.MODES = {
			'view': 'view',
			'edit': 'edit',
			'add': 'add'
		};
		$scope.mode = $scope.MODES.view;
		$scope.locked = true;
		$scope.forms = {};
		$scope.H = H;
		$scope.M = M;
        $scope.templates = {};
        
        $scope.data.permissions = H.S.defaultPermissions;

		//Set currentRoute
		$scope.currentRoute = (function() {
			var route = $location.path().substring(1);
			var slash = route.indexOf('/');
			if (slash > -1) {
				route = route.substring(0, slash);
			}
			return route;
		})();

		$scope.currentRouteHref = "#!" + $scope.currentRoute;
		$scope.newRouteHref = "#!" + $scope.currentRoute + "/new";
		$scope.editRouteHref = "#!" + $scope.currentRoute + "/:id";

		//Default error handler
		var errorHandler = function(error) {
			if (error && error.status) {
				switch (error.status) {
					case 404:
						$scope.errors.push({
							message: H.MESSAGES.E404
						});
						break;
					case 422:
						$scope.errors.push({
							message: H.MESSAGES.E422
						});
						break;
					case 405:
						$scope.errors.push({
							message: H.MESSAGES.E405
						});
						break;
					case 400:
						$scope.errors.push({
							message: H.MESSAGES.E400
						});
						break;
					case 500:
						$scope.errors.push({
							message: H.MESSAGES.E500
						});
						break;
					case 401:
						$rootScope.$emit('loginRequired');
					case 403:
						$location.path('unauthorized');
					default:
						$scope.errors.push({
							message: H.MESSAGES.E500
						});
						break;
				}
			}
		};

		//Initializa new single objetc
		$scope.initSingle = function() {
			$scope.data.single = new Resource();
            $scope.data.selectedForeignKeys = [];
			//$scope.buildSingleHeaders();
		};

		//Get all rows from your API/table. Provide a query filter in case you want reduced dataset.
		$scope.query = function(q, callback) {
			if (!q) {
				q = {};
			}
			Resource.query(q, function(result) {
				if (result) {
					$scope.data.list = result;
				}
				if (callback) {
					callback(result);
				}
			}, function(error) {
				errorHandler(error);
				if (callback) {
					callback(error);
				}
			});
		};

		//Get specific record
		$scope.count = function(query, callback) {
			query = query || {
				count: true
			};
			if (!query['count']) query['count'] = true;
			Resource.query(query, function(result) {
				$scope.data.records = result[0].count;
				if (callback) {
					callback(result);
				}
			}, function(error) {
				errorHandler(error);
				if (callback) {
					callback(error);
				}
			});
		};


		//Get specific record
		$scope.get = function(id, callback) {
			Resource.get({
				id: id
			}, function(result) {
				$scope.data.single = result;
				//$scope.buildSingleHeaders();
				if (callback) {
					callback(result);
				}
			}, function(error) {
				errorHandler(error);
				if (callback) {
					callback(error);
				}
			});
		};

		//Delete specific record
		$scope.delete = function(obj, callback) {
			if (obj && obj.$delete) {
				if (S.legacyMode) {
					$http.post(S.baseUrl + "/" + resourceName + "/delete/", obj).then(function(r) {
						if (callback && r.data) {
							callback(r.data);
						}
					}, function(e) {
						errorHandler(e);
						if (callback) {
							callback(e);
						}
					});
				} else {
					obj.$delete(function(r) {
						if (callback) {
							callback(r);
						}
					}, function(e) {
						errorHandler(e);
						if (callback) {
							callback(e);
						}
					});
				}

			} else if (!isNaN(obj)) {
				$scope.get(obj, function(result) {
					if (result && result.$delete) {
						result.$delete();
						if (callback) {
							callback();
						}
					}
				});
			}
		};

		$scope.deleteMany = function(resource, obj, callback) {
			if (obj) {
				var r = resource || resourceName;
				var url = H.SETTINGS.baseUrl + "/" + r + "/";
				if (H.S.legacyMode) url = url + "delete/";
				if (Array.isArray(obj)) {
					url = url + "?id=" + JSON.stringify(obj);
				} else {
					if (obj.id) {
						url = url + obj.id;
					}
				}
				if (H.S.legacyMode) {
					return $http.post(url, []).then(function(r) {
						if (callback) {
							callback(r.data);
						}
						return r.data;
					}, function(e) {
						errorHandler(e);
						if (callback) {
							callback(e.data);
						}
						return e.data;
					});
				} else {
					return $http.delete(url).then(function(r) {
						if (callback) {
							callback(r.data);
						}
						return r.data;
					}, function(e) {
						errorHandler(e);
						if (callback) {
							callback(e.data);
						}
						return e.data;
					});
				}
			}

		}

		//Save a record
		$scope.save = function(obj, callback) {
			if (obj && obj.$save) {
				var promise = obj.$save();
				promise.then(function(r) {
					if (callback) {
						callback(r);
					}
				}, function(e) {
					errorHandler(e);
					if (callback) {
						callback(e);
					}
				});
			} else if ($scope.data.single) {
				var promise = $scope.data.single.$save();
				promise.then(function(r) {
					if (callback) {
						callback(r);
					}
				}, function(e) {
					errorHandler(e);
					if (callback) {
						callback(e);
					}
				});
			}
		};

		$scope.post = function(resource, arr, callback) {
			var r = resource || resourceName;
			var url = H.SETTINGS.baseUrl + "/" + r;
			if (arr) {
				if (H.SETTINGS.enableSaaS) {
					arr.map(function(p) {
						if (!p.secret) p.secret = $rootScope.currentUser.secret;
					});
				}
				return $http.post(url, arr)
					.then((function(data, status, headers, config) {
						if (callback) {
							callback(data.data);
						}
						return data.data;
					}), (function(e) {
						errorHandler(e);
						if (callback) {
							callback(e.data);
						}
						return e.data;
					}));
			}

		}

		$scope.update = function(obj, callback) {
			var url = H.SETTINGS.baseUrl + "/" + resourceName;

			if (H.S.legacyMode) {
				return $http.post(url + "/update", obj)
					.then((function(data, status, headers, config) {
						if (callback) {
							callback(data.data);
						}
						return data.data;
					}), (function(e) {
						errorHandler(e);
						if (callback) {
							callback(e.data);
						}
						return e.data;
					}));
			} else {
				return $http.put(url, obj)
					.then((function(data, status, headers, config) {
						if (callback) {
							callback(data.data);
						}
						return data.data;
					}), (function(e) {
						errorHandler(e.data);
						if (callback) {
							callback(e.data);
						}
						return e.data;
					}));

			}

		};

		//Clear errors
		$scope.clearErrors = function() {
			$scope.errors = [];
		};

		//Refresh data
		$scope.refreshData = function() {
			$scope.listAll();
		};
        
		$scope.data.sortCache = {};
        
		$scope.applySort = function(h){
			$scope.data.queryOptions = $scope.data.queryOptions || {};
			$scope.data.viewOptions = $scope.data.viewOptions || {};
			$scope.data.viewOptions.rawData = $scope.data.viewOptions.rawDataTemp;
			$scope.data.queryOptions.orderBy = h;
			if($scope.data.sortCache[h] && $scope.data.sortCache[h] == "asc"){
				$scope.data.sortCache[h] = "desc";
			} else {
				$scope.data.sortCache[h] = "asc";
			}
			var orderDirections = { "asc" : { title: "Ascending", key: "asc"}, "desc": { title: "Descending", key: "desc"}};
			$scope.data.queryOptions.orderDirection = orderDirections[$scope.data.sortCache[h]];
			$scope.refreshData();
		}
        
		$scope.applyOptions = function(){
			$scope.data.viewOptions = $scope.data.viewOptions || {};
			$scope.data.viewOptions.rawData = $scope.data.viewOptions.rawDataTemp;
			$scope.refreshData();
		}
        
		$scope.setActive = function(i) {
			return ($rootScope.currentPage == i) ? 'active' : 'waves-effect';
		};

		$scope.mergeQueryOptions = function(query){
			if(query && $scope.data.queryOptions){
				if($scope.data.queryOptions.searchField && $scope.data.queryOptions.search){
					query[$scope.data.queryOptions.searchField + '[in]'] = $scope.data.queryOptions.search;
				}
				if($scope.data.queryOptions.orderBy){
					query.order = $scope.data.queryOptions.orderBy; 
				}
				if($scope.data.queryOptions.orderDirection && $scope.data.queryOptions.orderDirection.key && ['asc', 'desc'].indexOf($scope.data.queryOptions.orderDirection.key) > -1){
					query.orderType = $scope.data.queryOptions.orderDirection.key; 
				}
				if($scope.data.queryOptions.limit){
					$scope.data.limit = $scope.data.queryOptions.limit;
				}                
			}
			return query;
			
		}
        
		//Load all entries on initialization
		$scope.listAll = async function(currentPage) {
			if (!$scope.beforeLoadAll) $scope.beforeLoadAll = async function(query) {
				return query;
			};
			var countQueryParam = {
				count: false
			};
            countQueryParam = $scope.mergeQueryOptions(countQueryParam);            
			var countQuery = await $scope.beforeLoadAll(countQueryParam) || countQueryParam;

			//$scope.loading = true;
			$scope.count(countQuery, async function() {
				$scope.loading = true;
				$scope.data.pagesCount = parseInt(($scope.data.records - 1) / $scope.data.limit) + 1;
				$scope.data.pages = [];
				for (var i = 0; i < $scope.data.pagesCount; i++) {
					$scope.data.pages.push(i + 1);
				}
				if (!currentPage) {
					if (!($scope.data.pages.indexOf($rootScope.currentPage) > -1)) {
						if ($rootScope.currentPage > 0) {
							$rootScope.currentPage = $scope.data.pages[$scope.data.pagesCount - 1];
						} else {
							$rootScope.currentPage = 1;
						}
					}
				} else {
					$rootScope.currentPage = currentPage;
				}
				var dataQueryParam = {
					limit: $scope.data.limit,
					offset: ($rootScope.currentPage - 1) * $scope.data.limit
				};
                dataQueryParam = $scope.mergeQueryOptions(dataQueryParam);                
				var dataQuery = await $scope.beforeLoadAll(dataQueryParam) || dataQueryParam;

				$scope.query(dataQuery, function(r) {
					$scope.loading = false;
                    
					setTimeout(function(){
						if(!$scope.loadedOnce){
							$scope.loadedOnce = true;
							$("table").tableExport();
						}
					}, 500);
                    
					if (r && r.length > 0) {
						// var headers = Object.getOwnPropertyNames(r[0]);
						// $scope.data.listHeadersRaw = headers;
						// if(headers.indexOf("id") > -1) headers.splice(headers.indexOf("id"), 1);
						// if(headers.indexOf("secret") > -1) headers.splice(headers.indexOf("secret"), 1);
						// headers = headers.filter(function(p){ return (p.slice(-3) !== "_id")});
						// if($scope.removeListHeaders){
						// 	var removeHeaders = $scope.removeListHeaders();
						// 	for (var i = 0; i < removeHeaders.length; i++) {
						// 		var h = removeHeaders[i];
						// 		if(headers.indexOf(h) > -1) headers.splice(headers.indexOf(h), 1);
						// 	}
						// }
						// $scope.data.listKeys = headers;
						// headers = headers.map(function(p){ return H.toTitleCase(H.replaceAll(p, '_', ' '))});

						$scope.data.listKeys = $scope.data.singleKeys.map(function(p){ return p; });
						var headers = $scope.data.singleKeys.map(function(p) {
							return $scope.data.singleKeysInfo[p].title;
						});
						
						if($scope.removeListHeaders){
							var removeHeaders = $scope.removeListHeaders();
							for (var i = 0; i < removeHeaders.length; i++) {
								var h = removeHeaders[i];
								if(headers.indexOf(h) > -1) {
									var ind = headers.indexOf(h);
									headers.splice(ind, 1);
									$scope.data.listKeys.splice(ind, 1);
								}
							}
						}
                        
						$scope.setListHeaders(headers);
						setTimeout(function(){
							try{
								$('.tableexport-caption').detach();
								$('table').tableExport();
							} catch(ex){
								
							}
							
						}, 1000);                        
					}
                    
                    if(dataQuery.order && dataQuery.orderType) $scope.data.sortCache[dataQuery.order] = dataQuery.orderType;
                    
					if ($scope.onLoadAll) $scope.onLoadAll(r);
				});

			});
		};

		$scope.listAllPrev = function() {
			if (($scope.currentPage - 1) > 0) {
				$scope.listAll($scope.currentPage - 1);
			}
		}

		$scope.listAllNext = function() {
			if (($scope.currentPage + 1) <= $scope.data.pages.length) {
				$scope.listAll($scope.currentPage + 1);
			}
		}

		//Load entry on initialization
		$scope.loadSingle = async function(callback) {
			//$scope.loading = true;
			$scope.get($routeParams.id, async function(r) {
				if ($scope.onLoad) await $scope.onLoad(r);
				if (callback) callback(r);
				GLOBALS.methods.autoFocus();
				//$scope.loading = false;
			});
		};


		//Toggle Visibility
		$scope.toggleVisibility = function(item) {
			item.visible = !item.visible;
		};

		//Toggle lock
		$scope.toggleLock = function() {
			$scope.locked = !$scope.locked;
			if(!$scope.locked){
                $scope.mode = $scope.MODES.edit;
				GLOBALS.methods.autoFocus();
			}            
		};

		//Update a single record
		$scope.updateSingle = function(callback) {
			//$scope.loading = true;
            $scope.saveClicked = true;
			if ($scope.beforeUpdate) {
				$scope.beforeUpdate($scope.data.single, function(r) {
					var update = true;
					if ($scope.beforeUpdateBase) update = $scope.beforeUpdateBase();
					if (update) {
						$scope.update($scope.data.single, function(r) {
							$scope.locked = true;

							if (r && r.error) {
								if ($scope.onError) {
									$scope.onError(r.error, function(e) {
										if ($scope.onErrorBase) $scope.onErrorBase(e);
										return;
									});
									return;
								} else {
									if ($scope.onErrorBase) $scope.onErrorBase(r.error);
									return;
								}
							}

							if ($scope.onUpdate) {
								$scope.onUpdate(r, function(r) {
									if ($scope.onUpdateBase) $scope.onUpdateBase(r);
								});
							} else {
								if ($scope.onUpdateBase) $scope.onUpdateBase(r);
							}

							if (callback) callback(r);
							//$scope.loading = false;
						});
					}

				});
			} else {
				var update = true;
				if ($scope.beforeUpdateBase) update = $scope.beforeUpdateBase();
				if (update) {
					$scope.update($scope.data.single, function(r) {
						$scope.locked = true;

						if (r && r.error) {
							if ($scope.onError) {
								$scope.onError(r.error, function(e) {
									if ($scope.onErrorBase) $scope.onErrorBase(e);
									return;
								});
								return;
							} else {
								if ($scope.onErrorBase) $scope.onErrorBase(r.error);
								return;
							}
						}

						if ($scope.onUpdate) {
							$scope.onUpdate(r, function(r) {
								if ($scope.onUpdateBase) $scope.onUpdateBase(r);
							});
						} else {
							if ($scope.onUpdateBase) $scope.onUpdateBase(r);
						}

						if (callback) callback(r);
						//$scope.loading = false;
					});
				}
			}
		};
		//Initialize a single record
		$scope.newSingle = async function(callback) {
			$scope.locked = false;
            $scope.mode = $scope.MODES.add;
			$scope.initSingle();
			if ($scope.onInit) await $scope.onInit($scope.data.single);
			if (callback) callback();
		};

		//Save a new single record
		$scope.saveSingle = function(callback) {
			//$scope.loading = true;
            $scope.saveClicked = true;
			if ($scope.beforeSave) {
				$scope.beforeSave($scope.data.single, function(r) {
					var save = true;
					if ($scope.beforeSaveBase) save = $scope.beforeSaveBase();
					if (save) {
						$scope.save($scope.data.single, function(r) {
							$scope.locked = true;

							if ((r && r.error) || (r && r.data && r.data.error)) {
								if ($scope.onError) {
									$scope.onError(r.error, function(e) {
										if ($scope.onErrorBase) $scope.onErrorBase(e);
										return;
									});
									return;
								} else {
									if ($scope.onErrorBase) $scope.onErrorBase(r.data.error);
									return;
								}
							}

							if ($scope.onSave) {
								$scope.onSave(r, function(r) {
									if ($scope.onSaveBase) $scope.onSaveBase(r);
								});
							} else {
								if ($scope.onSaveBase) $scope.onSaveBase(r);
							}

							if (callback) callback(r);
							//$scope.loading = false;
						});
					}
				});
			} else {
				var save = true;
				if ($scope.beforeSaveBase) save = $scope.beforeSaveBase();
				if (save) {
					$scope.save($scope.data.single, function(r) {
						$scope.locked = true;

						if ((r && r.error) || (r && r.data && r.data.error)) {
							if ($scope.onError) {
								$scope.onError(r.error, function(e) {
									if ($scope.onErrorBase) $scope.onErrorBase(e);
									return;
								});
								return;
							} else {
								if ($scope.onErrorBase) $scope.onErrorBase(r.data.error);
								return;
							}
						}

						if ($scope.onSave) {
							$scope.onSave(r, function(r) {
								if ($scope.onSaveBase) $scope.onSaveBase(r);
							});
						} else {
							if ($scope.onSaveBase) $scope.onSaveBase(r);
						}

						if (callback) callback(r);
						//$scope.loading = false;
					});
				}
			}

		};

		//Change a property in single
		$scope.changeSingle = function(property, value) {
			this.data.single[property] = value;
		};


		/*Define options
			init:true -> Load all records when the controller loads
		*/
		if (options) {
			$scope.options = options;
			if ($scope.options.init) {
				$scope.query();
			}
		}

		//Any extra stuff you might want to merge into the data object
		if (extras) {
			for (var e in extras) {
				$scope.data[e] = extras[e];
			}
		}


		//Localized resources
		$scope.textResources = {
			title: {
				single: '',
				list: ''
			},
			templates: {
				edit: '',
				create: '',
				list: ''
			}
		};

		$scope.initTextResources = function(listTitle, singleTitle, listTemplate, listItemTemplate, listHeaderTemplate, listFooterTemplate, newTemplate, editTemplate, singleHeaderTemplate, singleFooterTemplate) {
			$scope.textResources.title.list = listTitle;
			$scope.textResources.title.single = singleTitle;
			$scope.textResources.templates.list = listTemplate;
			$scope.textResources.templates.listItem = listItemTemplate;
			$scope.textResources.templates.listHeader = listHeaderTemplate;
			$scope.textResources.templates.listFooter = listFooterTemplate;
			$scope.textResources.templates.create = newTemplate;
			$scope.textResources.templates.edit = editTemplate;
			$scope.textResources.templates.singleHeader = singleHeaderTemplate;
			$scope.textResources.templates.singleFooter = singleFooterTemplate;
		};

		$scope.initTextResourcesEasy = function(route, singular) {
			if (!route || route == '') {
				route = $scope.currentRoute;
			}
			var plural = route.toUpperCase();
			
            //if (!singular || singular == '') singular = plural.substring(0, plural.length - 1);
			if (!singular || singular == '') singular = H.toSingular(plural).toUpperCase();

            var listTemplate = 'app//modules/' + route + '/list.html';
			var listItemTemplate = 'app/modules/' + route + '/list-item.html';
			var listHeaderTemplate = 'app/modules/' + route + '/list-header.html';
			var listFooterTemplate = 'app/modules/' + route + '/list-footer.html';
			var singleTemplate = 'app/modules/' + route + '/single.html';
			var singleHeaderTemplate = 'app/modules/' + route + '/single-header.html';
			var singleFooterTemplate = 'app/modules/' + route + '/single-footer.html';

			$scope.initTextResources(plural, singular, listTemplate, listItemTemplate, listHeaderTemplate, listFooterTemplate, singleTemplate, singleTemplate, singleHeaderTemplate, singleFooterTemplate);
		};


		$scope.initTextResourcesAuto = function(route, singular) {
			if (!route || route == '') {
				route = $scope.currentRoute;
			}
			var plural = route.toUpperCase();

            //if (!singular || singular == '') singular = plural.substring(0, plural.length - 1);
			if (!singular || singular == '') singular = H.toSingular(plural).toUpperCase();;

			var common = "common/templates";


			var listTemplate = 'app/modules/' + common + '/list-extra.html';
			var listItemTemplate = 'app/modules/' + common + '/list-item.html';
			var listHeaderTemplate = 'app/modules/' + common + '/list-header.html';
			var listFooterTemplate = 'app/modules/' + common + '/list-footer.html';
			var singleTemplate = 'app/modules/' + common + '/single.html';
			var singleHeaderTemplate = 'app/modules/' + common + '/single-header.html';
			var singleFooterTemplate = 'app/modules/' + common + '/single-footer.html';

			$scope.initTextResources(plural, singular, listTemplate, listItemTemplate, listHeaderTemplate, listFooterTemplate, singleTemplate, singleTemplate, singleHeaderTemplate, singleFooterTemplate);
		};

		$scope.setTitle = function(t, v) {
			$scope.textResources.title[t] = v;
		};

		$scope.getTitle = function(t) {
			switch (t) {
				case 'single':
					if ($scope.getSingularTitle) return $scope.getSingularTitle();
					return $scope.textResources.title.single;
				case 'list':
					return $scope.textResources.title.list;
				default:
					return $scope.textResources.title.list;
			}
		};

		$scope.getTemplate = function(t) {
			switch (t) {
				case 'edit':
					return $scope.textResources.templates.edit;
				case 'new':
					return $scope.textResources.templates.create;
				case 'list':
					return $scope.textResources.templates.list;
				case 'list-item':
					return $scope.textResources.templates.listItem;
				case 'list-header':
					return $scope.textResources.templates.listHeader;
				case 'list-footer':
					return $scope.textResources.templates.listFooter;
				case 'single-header':
					return $scope.textResources.templates.singleHeader;
				case 'single-footer':
					return $scope.textResources.templates.singleFooter;
				default:
					return '';
			}

		};
        
		$scope.setTemplate = function(key, value){
			$scope.templates[key] = value;
		}

		$scope.getTableHeaders = function() {
			var headers = [];
			if ($scope.data.list && $scope.data.list.length > 0 && $scope.data.list[0]) {
				headers = Object.getOwnPropertyNames($scope.data.list[0]);
			}
			return headers;
		};

		$scope.setListHeaders = function(headers) {
			$scope.data.listHeaders = headers;
		};

		$scope.changeListHeaders = function(header, replacement) {
			if ($scope.data.listHeaders && $scope.data.listHeaders.indexOf(header) > -1) {
				$scope.data.listHeaders[$scope.data.listHeaders.indexOf(header)] = replacement;
			}
		};

		$scope.buildSingleHeaders = function() {
			$scope.data.singleKeys = [] //Object.getOwnPropertyNames($scope.data.single).filter(function(p){ return !(p.startsWith('$') || p == 'secret'); });
			$scope.data.foreignKeys = {};
			$scope.data.foreignKeysResources = {};
			$scope.data.singleKeysInfo = {};
			for (i in $scope.metadata) {
				var o = JSON.parse(JSON.stringify($scope.metadata[i]));
				var k = o.Field;
				if (k == "secret") continue;
				$scope.data.singleKeys.push(k);
				var type = "text";
				var required = o.Null == 'NO';
				var title = H.toTitleCase(H.replaceAll(k, '_', ' '));
				if(title.endsWith(' Id')) title = title.substring(0,title.length - 3);
				if (o.Key == "MUL"){
					type = "fkey";
					//fkeyTable = title.replace(' ', '_').toLowerCase() + 's';
					fkeyTable = H.toPlural(title.replace(' ', '_').toLowerCase());					
					$scope.data.foreignKeysResources[fkeyTable] = R.get(fkeyTable);
					
					(function(fkeyTable){
						$scope.data.foreignKeysResources[fkeyTable].query({}, function(r){
							$scope.data.foreignKeys[fkeyTable] = r;
						}, function(e){
						});
					})(fkeyTable);
				} else if (k.startsWith("is_") || o.Type == "tinyint(1)") {
					type = "bool";
				} else if (o.Type.startsWith("int") || o.Type.startsWith("bigint") || o.Type.startsWith("mediumint") || o.Type.startsWith("smallint") || o.Type.startsWith("float") || o.Type.startsWith("double") || o.Type.startsWith("tinyint")) {
					type = "number";
				} else if (o.Type == "date"){
					type = "date";
				} else if (o.Type == "datetime"){
					type = "datetime";
				} else if (k.endsWith("email")) {
					type = "email";
				} else if (k.indexOf("password") > -1) {
					type = "password";
				} else if (o.Type == "text") {
					type = "textarea";
				} else {
					type = "text";
				}
				$scope.data.singleKeysInfo[k] = {
					type: type,
					title: title,
					required: required
				};
			}

		}

		$scope.showDialog = function(ev, title, content, okText = "OK", cancelText = "Cancel", okHandler, cancelHandler, closeHandler) {
			Popup.show({
					title: title,
					body: content,
					buttons: [{
						text: okText,
						theme: 'success',
						click: function(callback, btn, data) {
							if (okHandler) okHandler();
							if (callback) callback(btn);
						},
						cleanup: function(data) {

						}
					}, {
						text: cancelText,
						theme: 'warning',
						click: function(callback, btn, data) {
							if (cancelHandler) cancelHandler();
						}
					}],
					scope: $scope,
					spinner: true,
					close: closeHandler || function(data) {

					}
				})
				// var confirm = $mdDialog.confirm()
				//       .title(title)
				//       .textContent(content)
				//       .ariaLabel('')
				//       .targetEvent(ev)
				//       .ok(okText)
				//       .cancel(cancelText);

			// $mdDialog.show(confirm).then(function() {
			//   if(okHandler) okHandler();
			// }, function() {
			//   if(cancelHandler) cancelHandler();
			// });
		};

		$scope.onErrorBase = function(obj) {
			$scope.showDialog(null, M.ERROR_TITLE, M.SAVED_ERROR, M.SAVED_OK, M.SAVED_CANCEL, function() {
				$scope.locked = false;
			}, function() {
				$location.path($scope.currentRoute);
			}, function(){ 
				$scope.locked = false; 
			});
		};

		$scope.onSaveBase = function(obj) {
			$scope.showDialog(null, M.SAVED_TITLE, M.SAVED_MESSAGE, M.SAVED_OK, M.SAVED_CANCEL, function() {
				$scope.newSingle();
			}, function() {
				$location.path($scope.currentRoute);
			}, function() {
                $scope.mode = $scope.MODES.view;
            });
		};

		$scope.onUpdateBase = function(obj) {
			$scope.showDialog(null, M.SAVED_TITLE, M.SAVED_MESSAGE, M.SAVED_OK, M.SAVED_CANCEL, function() {}, function() {
				$location.path($scope.currentRoute);
			});
		};

		$scope.beforeSaveBase = $scope.beforeUpdateBase = function(obj) {
			return (!Object.keys($scope.forms[$scope.currentRoute + "Form"].$error).length);
		};

		$scope.goToEdit = function() {
			$location.path($scope.currentRoute + "/" + $scope.data.single.id);
		};

		$scope.goToNew = function() {
			$location.path($scope.currentRoute + "/" + "new");
		};

		$scope.initLaunched = false;
		$scope.launchInit = async function(){
			if(!$scope.initLaunched){
				if($scope.init) await $scope.init();
				$scope.initLaunched = true;	
			}
		}
		
		$scope.$watch('init', function(n, o){
			$scope.launchInit();
		});
        
		
		GLOBALS.methods.autoFocus();

	};
}
/*global app, ControllerFactory, RegisterRoutes, RegisterData*/
function RegisterEasyController(route, headers, controller, auto = false) {
	app.controller(route + 'ControllerBase', ControllerFactory(route));

	app.controller(route + 'Controller', function($scope, $controller, H) {
		//Copy all scope variables from Base Controller
		$controller(route + 'ControllerBase', {
			$scope: $scope
		});
		try {
			$controller(route + 'ControllerExtension', {
				$scope: $scope
			});
		} catch (ex) {
			console.log(ex);
		}


		if (auto) {
			$scope.initTextResourcesAuto();
		} else {
			$scope.initTextResourcesEasy();
		}


		//$scope.setListHeaders(headers);

	});
}

//Register Easy Routes
(function() {
	var easyRoutes = RegisterRoutes().easyRoutes || [];
	//var data = RegisterData();

	for (var i = 0; i < easyRoutes.length; i++) {
		RegisterEasyController(easyRoutes[i] /*, data[easyRoutes[i]].headers*/ );
	}
})();

//Register Auto Routes
(function() {
	var autoRoutes = RegisterRoutes().autoRoutes || [];
	//var data = RegisterData();

	for (var i = 0; i < autoRoutes.length; i++) {
		RegisterEasyController(autoRoutes[i], null, null, true /*, data[easyRoutes[i]].headers*/ );
	}
})();
/*global app*/
//The name of the controller should be plural that matches with your API, ending with ControllerExtension. 
//Example: your API is http://localhost:8080/api/tasks then the name of the controller is tasksControllerExtension.
//To register this controller, just go to app/config/routes.js and add 'tasks' in 'easyRoutes' or 'autoRoutes' array.
//
//The main difference in 'easyRoutes' and 'autoRoutes' is that 'autoRoutes' generates complete CRUD pages, where as in 'easyRoutes'
//you need to provide templates inside 'app/modules/tasks' folder. If you want to keep your templates somewhere else, you can pick
//'autoRoutes' and then override the templates using setTemplate function.
//Note that for 'autoRoutes', it is not even required to write Controller Extensions unless you want to modify the behaviour.
app.controller('tasksControllerExtension', function($scope, $controller, $rootScope, $http, $location, Popup, H, M,$filter) {
    
    //This function is called when you need to make changes to the new single object.
    $scope.onInit = async function(obj){
        //$scope.data.single is available here. 'obj' refers to the same. It is the new instance of your 'tasks' resource that matches the structure of your 'tasks' API.
       // obj.is_active = 1;
    };
    
    //This function is called when you are in edit mode. i.e. after a call has returned from one of your API that returns a single object. e.g http://localhost:8080/api/tasks/1
    $scope.onLoad = async function(obj){
        //$scope.data.single is available here. 'obj' refers to the same. It represents the object you are trying to edit.
        
    };
    
    //This function is called when you are in list mode. i.e. before a call has been placed to one of your API that returns a the paginated list of all objects matching your API.
    $scope.beforeLoadAll = async function(query){
        //This is where you can modify your query parameters.    
        //query.is_active = 1;
        //return query;
    };

    //This function is called when you are in list mode. i.e. after a call has returned from one of your API that returns a the paginated list of all objects matching your API.
    $scope.onLoadAll = async function(obj){
        //$scope.data.list is available here. 'obj' refers to the same. It represents the object you are trying to edit.
        
        //You can call $scope.setListHeaders(['column1','column2',...]) in case the auto generated column names are not what you wish to display.
        //or You can call $scope.changeListHeaders('current column name', 'new column name') to change the display text of the headers;
    };
    
    //This function is called before the create (POST) request goes to API
    $scope.beforeSave = async function(obj, next){
        //You can choose not to call next(), thus rejecting the save request. This can be used for extra validations.
        next();
    };

    //This function is called after the create (POST) request is returned from API
    $scope.onSave = async function (obj, next){
        //You can choose not to call next(), thus preventing the page to display the popup that confirms the object has been created.
        next();
    };
    
    //This function is called before the update (PUT) request goes to API
    $scope.beforeUpdate = async function(obj, next){
        //You can choose not to call next(), thus rejecting the update request. This can be used for extra validations.
        next();
    };

    //This function is called after the update (PUT) request is returned from API
    $scope.onUpdate = async function (obj, next){
        //You can choose not to call next(), thus preventing the page to display the popup that confirms the object has been updated.
        next();
    };
    
    //This function will be called whenever there is an error during save/update operations.
    $scope.onError = async function (obj, next){
        //You can choose not to call next(), thus preventing the page to display the popup that confirms there has been an error.
        next();
    };
    var date = new Date();
    
  $scope.dtmax = $filter('date')(new Date(), 'yyyy-MM-dd');
  console.log($scope.dtmax);
    // If the singular of your title is having different spelling then you can define it as shown below.
    // $scope.getSingularTitle = function(){
    //     return "TASK";
    // }

    // If you want don't want to display certain columns in the list view you can remove them by defining the function below.
    // $scope.removeListHeaders = function(){
    //     return ['is_active'];
    // }

    // If you want to refresh the data loaded in grid, you can call the following method
    // $scope.refreshData();
    
    // If you are using autoRoutes, and you want to override any templates, you may use the following function
    // $scope.setTemplate('list-item', 'app/your-path/your-template.html');
    // $scope.setTemplate('single', 'app/your-path/your-template.html');
    
    // list-item.html template uses the 'td' element which will be rendered inside a 'table' & 'tr'. 
    // If you don't like the layout, and you want to replace it with your own, you can use the following method.
    // Note that if you override the 'list-items', then you have to use ng-repeat or any other mechanism to iterate over your data that is available in $scope.data.list.
    // $scope.setTemplate('list-items', 'app/your-path/your-template.html');
    

});
function RegisterMenuItems(){
    return [
        {
            header: '',
            showHeader: false,
            showSeparator: false,
            items: [
        	    {action: '', icon: 'home', color: 'blue', text: 'Home'}
	        ],
	        allowedRoles: ['user', 'admin', 'superadmin']
        },
        {
            header: '',
            showHeader: false,
            showSeparator: false,
            items: [
        	    {action: 'tasks', icon: 'assignment_turned_in', color: 'green', text: 'Tasks'},
        	    {action: 'search', icon: 'search', color: 'brown', text: 'Search'},
        	    {action: 'reports', icon: 'pie_chart', color: 'purple', text: 'Reports',
        	    	items: [
        	    			{action: 'reports/1', icon: 'pie_chart', color: 'red', text: 'Sample Report #1'},
        	    			{action: 'reports/2', icon: 'pie_chart', color: 'green', text: 'Sample Report #2'},
        	    		]
        	    },
        	    {action: 'alerts', icon: 'alarm', color: 'red', text: 'Alerts'}
	        ],
	        allowedRoles: ['user', 'admin']
        },
        {
            header: 'Administration',
            showHeader: true,
            showSeparator: true,
            items: [
        	    {action: 'settings', icon: 'settings', color: '', text: 'Settings'},
        	    {action: 'categories', icon: 'list', color: 'orange', text: 'Categories'},
        	    {action: 'users', icon: 'person', color: 'blue', text: 'Users'},
        	    {action: 'groups', icon: 'group', color: 'green', text: 'Groups'}
	        ],
	        allowedRoles: ['admin']
        },
        {
            header: 'Customer Management',
            showHeader: false,
            showSeparator: false,
            items: [
        	    {action: 'organizations', icon: 'people_outline', color: '', text: 'Organizations'}
	        ],
	        allowedRoles: ['superadmin']
        }
    ];
}/*global app*/
app.service('M', function($http) {
	return {
		"E404": "The resource you are trying to access does not exist!",
		"E422": "Invalid parameters!",
		"E405": "Invalid operation!",
		"E400": "Bad request!",
		"E500": "An error accured!",
		"OUT_OF_SERVICE": "The system is under unscheduled maintenance! We'll be back soon.",
		"LOGIN_API_UNAVAILABLE": "Please contact the administrator. It seems that the login services are not enabled!",
		"REGISTER_API_UNAVAILABLE": "Please contact the administrator. It seems that the registration services are not enabled!",
		"SAAS_API_UNAVAILABLE": "Please contact the administrator. It seems that the SaaS services are not enabled!",
		"REQUIRED": "This field is required!",
		"INVALID_EMAIL": "Invalid email!",
		"UNAUTHORIZED_AREA": "You are not authorized to access this area!",
		"NA": "N/A",
		"SAVED_TITLE": "Item Saved!",
		"SAVED_MESSAGE": "You have successfully saved this record!",
		"SAVED_OK": "Stay Here",
		"SAVED_CANCEL": "Go Back To Listing",
		"ERROR_TITLE": "Error!",
		"SAVED_ERROR": "An error occured while trying to save the object.",
		"RECOVERY_EMAIL_SENT": "We have sent instructions to your registered e-mail address. Please check your spam folder.",
		"REGISTRATION_EMAIL_SENT": "We have sent your request for approval. This usually takes upto 72 hours, but usually our approval panel is very quick to respond. You will soon get an activation email. Please keep checking your spam folder.",
		"PROFILE_SAVED": "Profile information updated successfully!",
		"PROFILE_SAVE_ERROR": "Could not save profile!",
		"PASSWORD_CHANGED": "Changed password successfully!",
		"PASSWORD_CHANGE_ERROR": "Could not change password!",
		"ADMIN_PASSWORD_REQUIRED": "Admin Password is required!",
		"PASSWORD_REQUIRED": "Password is required!",
		"PASSWORD_NOT_MATCHING": "Password and Confirm Password should match!",
		"TITLE_ADD_PREFIX": "ADD",
		"TITLE_EDIT_PREFIX": "EDIT",
		"TITLE_DASHBOARD": "DASHBOARD",
		"TITLE_LICENSE": "License",
		"TITLE_SETTINGS": "SETTINGS",
		"TITLE_ORGANIZATION_SETTINGS": "ORGANIZATION SETTINGS",
		"TITLE_MY_PROFILE": "MY PROFILE",
		"TITLE_BACK": "BACK",
		"TITLE_LISTING": "LISTING",
        "TITLE_OPTIONS": "OPTIONS",
		"BTN_SAVE": "Save",
		"BTN_UPDATE": "Update",
		"BTN_EDIT": "Edit",
		"BTN_SUBMIT": "Submit",
		"BTN_OK": "OK",
		"BTN_CANCEL": "Cancel",
		"BTN_LOGIN": "Login",
		"BTN_RECOVER": "Recover",
		"BTN_REGISTER": "Register",
		"BTN_SHOW": "Show",
		"BTN_CHANGE_LICENSE": "Change License",
		"BTN_SET_PASSWORD": "Set Password",
		"BTN_ACTIVATE": "Activate",
		"BTN_CLEAR": "Clear",
		"BTN_APPLY": "Apply",
		"BTN_EXPORT": "Export",
		"BTN_EXPORT_ALL": "Export All",        
		"HEADING_LOGIN": "Please, sign into your account",
		"HEADING_FORGOT_PASSWORD": "Forgot your password?",
		"HEADING_REGISTER": "Register now!",
		"LNK_REGISTER": "Register",
		"LNK_FORGOT_PASSWORD": "Forgot password?",
		"LNK_BACK_TO_LOGIN": "Back to Sign-in",
		"FIELD_EMAIL_ENTER": "Enter your email",
		"FIELD_PASSWORD_ENTER": "Enter your password",
		"FIELD_ORGANIZATION": "Organization",
		"FIELD_ROLE": "Role",
		"FIELD_EMAIL": "Email",
		"FIELD_USERNAME": "Username",
		"FIELD_PASSWORD": "Password",
		"FIELD_NEW_PASSWORD": "New Password",
		"FIELD_CONFIRM_PASSWORD": "Confirm Password",
		"FIELD_ADMIN_PASSWORD": "Admin Password",
		"FIELD_SUPERADMIN_PASSWORD": "Super Admin Password",
		"FIELD_CLIENT_SECRET": "Client Secret",
		"FIELD_VALIDITY": "Validity",
		"FIELD_LICENSE": "License",
		"FIELD_GROUPNAME": "Group Title",
		"FIELD_TITLE": "Title",
		"FIELD_DESCRIPTION": "Description",
		"FIELD_FIRST_NAME": "First Name",
		"FIELD_LAST_NAME": "Last Name",
		"FIELD_AGE": "Age",
		"FIELD_ADDR": "Address",
		"FIELD_ADDR1": "Address 1",
		"FIELD_ADDR2": "Address 2",
		"FIELD_GENDER": "Gender",
		"FIELD_ACTIVE": "Active",
		"FIELD_CATEGORY": "Category",
		"FIELD_PARENT_CATEGORY": "Parent Category",
		"FIELD_SEARCH": "Search",
		"FIELD_SEARCH_IN": "Search In",
		"FIELD_FILTER": "Filter",
		"FIELD_ORDER_BY": "Order By",
		"FIELD_ORDER_DIR": "Order Direction",   
		"FIELD_INITIAL_DATE":"Initial Date",
		"FIELD_DUE_DATE":"Due Date",
		"FIELD_STATUS":"Status",
		"FIELD_DESCRIPTION":"Description",
		"FIELD_ASSIGN_TO":"Assign To",
		"FIELD_UPDATED_AT":"Updated At",
		"FIELD_UPDATED_BY":"Updated By",
		"FIELD_USER_STORY":"User Story",
		"FIELD_PRIORITY":"Priority",
		"FIELD_ESTIMATED_HOURS":"Estimated Hours",
		"FIELD_ACTUAL_HOURS":"Actual Hours",
		"FIELD_DELETED":"Is Deleted"
		
		
	};
});
function RegisterRoutes() {
    return {
        customRoutes: [
            {route: '', template: 'home/template', controller: 'home'},
            {route: 'sign-in', template: 'auth/sign-in', controller: 'auth', auth: false},
            {route: 'forgot-password', template: 'auth/forgot-password', controller: 'auth', auth: false},
            {route: 'register', template: 'auth/register', controller: 'auth', auth: false},
            {route: 'profile', template: 'auth/profile', controller: 'profile'},
            {route: 'unauthorized', template: 'auth/unauthorized', controller: 'unauthorized'},
            {route: 'out-of-service', template: 'auth/out-of-service', controller: 'outOfService', auth: false},
            {route: 'settings', template: 'settings/template', controller: 'settings'}
        ], //customRoutes finds template inside app/modules
        easyRoutes: ['organizations', 'users', 'groups', 'categories', 'tasks'], // Provide the names of your tables here and make a copy of app/modules/tasks with the same name
        autoRoutes: [], // Either you can provide the names of your tables here, or you can excluded some of the routes below in autoRoutesExcludes
        autoRoutesExcluded: [] // If you don't specify autoRoutes, all of your tables except routes defined in customRoutes and easyRoutes will automatically have UI under Masters menu. You can exclude some of those tables here
    };
}
/*global app*/
class Settings{
	static get(){
		return {
		"baseUrl": "../../../../../api",
		"productName": "pRESTige",
		"supportEmail": "support@prestigeframework.com",
		"enableSaaS": true,
		"openRegistration": true,
		"legacyMode": false,
		"theme": {
			background: "primary",
			color: "white",
			alternate: "dodgerblue",
			contrast: "black"            
		},
		"menu": "expand", //expand or overlap,
		"autoMasters": false,
		"showMastersMenu": true,
		"defaultPermissions": {
				view: ['user', 'admin'],
				add: ['admin'],
				edit: ['admin'],
				remove: ['admin'],
				extract: ['admin']				
		}
		}
	}
}
app.service('S', function() {
	return Settings.get();
});
app.service('Alert', function() {
	return {
		success: function(message){
			this.show({ message: message, type: "success"});
		},
		danger: function(message){
			this.show({ message: message, type: "danger"});
		},
		warning: function(message){
			this.show({ message: message, type: "warning"});
		},
		info: function(message){
			this.show({ message: message, type: "info"});
		},
		primary: function(message){
			this.show({ message: message, type: "primary"});
		},
		secondary: function(message){
			this.show({ message: message, type: "secondary"});
		},
		show: function(options){
			
			// options = {
			// 	message: "Sample Popup",
			//  type: "primary",  //(optional)All bootstrap types - default, primary, secondary, danger, warning, success, info etc.
			//  el: "alerts-container"
			// }
			

		
		$(function(){
			
		var template=`
<div class="alert alert-` + options.type + ` alert-dismissible fade show" role="alert">
  ` + options.message + `
  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
</div>
		`;
		
		var selector = "." + (options.el ? options.el : "alerts-container");
		
		$('' + selector).html(template);

		});

		}
	};
});app.service("loginEventService",function($rootScope) {
    this.broadcast = function() {$rootScope.$broadcast("logged-in")};
    this.listen = function(callback) {$rootScope.$on("logged-in",callback)};
});/*global app, RegisterRoutes*/
app.service('H', function($location, $timeout, $http, md5, S, M, R, upload) {
	return {
		S: S,
		SETTINGS: S,
		M: M,
		MESSAGES: M,
		R: R,
		RESOURCES: R,
		getCookieKey: function(){
			var absUrl = $location.absUrl();
			Helper.getCookieKey(absUrl);
		},
		getHash: function(str){
    		return md5.createHash(str);
		},
		getAbsolutePath: Helper.getAbsolutePath,
		getRandomNumber: Helper.getRandomNumber,
		getUUID: Helper.getUUID,
		toDateTime: Helper.toDateTime,
		toMySQLDateTime: Helper.toMySQLDateTime,
		toMySQLDate: Helper.toMySQLDate,
		checkLicenseValidity: Helper.checkLicenseValidity,
		getOpenRoutes: function(){
			var openRoutes = RegisterRoutes().customRoutes.filter(function(p){ return p.auth === false});
			var openRouteNames = [];
			openRoutes.forEach(p => openRouteNames.push("/" + p.route));
			return openRouteNames;
		},
		toTitleCase: Helper.toTitleCase,
		replaceAll: Helper.replaceAll,
		deepCopy: Helper.deepCopy,
		upload: upload,
		goTo : function(newRoute) {                
            var waitForRender = function () {
                if ($http.pendingRequests.length > 0) {
                    $timeout(waitForRender);
                } else {
                    $location.path(newRoute);
                }
            };
            $timeout(waitForRender);
        },
        startsWithAnyOf: Helper.startsWithAnyOf,
        endsWithAnyOf: Helper.endsWithAnyOf,
        toPlural: Helper.toPlural,
        toSingular: Helper.toSingular        
	};
});

class Helper {

	constructor() {
	}

	static getCookieKey(absUrl) {
		var startIndex = absUrl.indexOf("//") + 2;
		var endIndex = absUrl.indexOf("#");
		var base = absUrl.substring(startIndex, endIndex);
		var pattern = /[\s:/!@#\$%\^\&*\)\(+=.-]/g;
		var key = base.replace(pattern, "_");
		return key;
	}
	
	static getAbsolutePath(href) {
		if(href == null) return "";
	    var link = document.createElement("a");
	    link.href = href;
	    return link.href;
	}

	static getRandomNumber(min, max) {
    	return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	static getUUID() {
	      var id = '', i;
	
	      for(i = 0; i < 36; i++)
	      {
	        if (i === 14) {
	          id += '4';
	        }
	        else if (i === 19) {
	          id += '89ab'.charAt(this.getRandomNumber(0,3));
	        }
	        else if(i === 8 || i === 13 || i === 18 || i === 23) {
	          id += '-';
	        }
	        else
	        {
	          id += '0123456789abcdef'.charAt(this.getRandomNumber(0, 15));
	        }
	      }
	      return id;
	}
	
	static toDateTime(str){
		// Split timestamp into [ Y, M, D, h, m, s ]
		var t = str.split(/[- :]/);
		
		// Apply each element to the Date function
		var d = new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]));
		
		return d;
	}
	
	static toMySQLDateTime(dt){
		return dt.getUTCFullYear() + "-" + Helper.twoDigits(1 + dt.getUTCMonth()) + "-" + Helper.twoDigits(dt.getUTCDate()) + " " + Helper.twoDigits(dt.getUTCHours()) + ":" + Helper.twoDigits(dt.getUTCMinutes()) + ":" + Helper.twoDigits(dt.getUTCSeconds());
	}


	static toMySQLDate(dt, offset){
		if(offset){
			
			var offsetNum = (0 - (new Date()).getTimezoneOffset()) * 2;
			var offsetH = Math.floor(offsetNum / 60);
			var offsetMN = offsetNum % 60;
			var offsetD = 0;
			var offsetM = 0;
			var offsetY = 0;
			var currentH = dt.getHours();
			var currentMN = dt.getMinutes();
			var currentD = dt.getDate();
			var currentM = dt.getMonth();
			var currentY = dt.getFullYear();
			
			var maxDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
			if(currentY % 4 == 0) maxDays[1] = 29;
			
			var projMN = currentMN + (offsetMN);
			if (projMN >= 60) {
				projMN -= 60;
				offsetH += 1;
			}
			var projH = currentH + (offsetH);
			if(projH >= 24){
				projH -= 24;
				offsetD += 1;
			}
			
			var projD = currentD + offsetD;
			if(projD > maxDays[currentM]){
				projD -= maxDays[currentM];
				offsetM += 1;
			}
			
			var projM = currentM + offsetM;
			if(projM > 12){
				projM -= 12;
				offsetY += 1;
			}
			
			var projY = currentY + offsetY;
			
			dt = new Date(projY, projM, projD, projH, projMN, 0);
			//console.log(dt);
			
			
			//dt = new Date(dt + (new Date()).getTimezoneOffset());
		}
		return dt.getUTCFullYear() + "-" + Helper.twoDigits(1 + dt.getUTCMonth()) + "-" + Helper.twoDigits(dt.getUTCDate());
	}

	
	static twoDigits(d) {
	    if(0 <= d && d < 10) return "0" + d.toString();
	    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
	    return d.toString();
	}
	
	static checkLicenseValidity(organization){
		return ((new Date() > Helper.toDateTime(organization.validity) && !(['basic', 'super'].indexOf(organization.license) > -1))  || !organization.is_active ) ? 'expired' : 'valid';
	}
	
	static toTitleCase(input){
		input = input || '';
		return input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	}
	
	static replaceAll(input, search, replacement){
		input = input || '';
		return input.replace(new RegExp(search, 'g'), replacement);
	}
	
	static deepCopy(input){
		return JSON.parse(JSON.stringify(input));
	}
    
	static startsWithAnyOf(str, arr){
		var vals = arr;
		if(typeof arr == 'string'){
			vals = arr.split("");
		}
		var result = false;
		for(var k in vals){
			var i = vals[k];
			if(str.startsWith(i)) {
				result = true;
				break;
			}
		}
		return result;
	}
	
	static endsWithAnyOf(str, arr){
		var vals = arr;
		if(typeof arr == 'string'){
			vals = arr.split("");
		}
		var result = false;
		for(var k in vals){
			var i = vals[k];
			if(str.endsWith(i)) {
				result = true;
				break;
			}
		}
		return result;
	}
	
	static toPlural(input){
        return pluralize.plural(input);
        /*
		var key = input.toLowerCase();
		var result = input;
		var secondLast = key[key.length - 2];
		var keyStripped = input.substring(0, input.length - 1);
		var keyStrippedTwo = input.substring(0, input.length - 2);
		if(Helper.endsWithAnyOf(key, ['s', 'ch', 'sh', 'x', 'z'])  ||  (key.endsWith('o') && !Helper.endsWithAnyOf(secondLast, 'aeiou')) ){
			result += 'es';	
		} else if (key.endsWith('y') && !Helper.endsWithAnyOf(secondLast, 'aeiou')){
			result = keyStripped + 'ies';
		} else if (key.endsWith('f')){
			result = keyStripped + 'ves';
		} else if (key.endsWith('fe')){
			result = keyStrippedTwo + 'ves';
		} else {
			result += 's';
		}
		return result;
        */
	}

	static toSingular(input){
        return pluralize.singular(input);
        /*
		var key = input.toLowerCase();
		var lastTwo = key.substring(key.length - 2, 2);
		var lastThree = key.substring(key.length - 3, 3);
		var keyStripped = input.substring(0, input.length - 1);
		var keyStrippedTwo = input.substring(0, input.length - 2);
		var keyStrippedThree = input.substring(0, input.length - 3);
		var result = keyStripped;
		if(key.endsWith('ves')){
			result = keyStrippedThree + 'f';
		} else if(key.endsWith('ies')){
			result = keyStrippedThree + 'y';
		} else if(key.endsWith('es')){
			result = keyStrippedTwo;
		} else {
			result = keyStripped;
		}
		return result;
        */
	}

    

}


/* global define */

(function (root, pluralize) {
  /* istanbul ignore else */
  if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
    // Node.
    module.exports = pluralize();
  } else if (typeof define === 'function' && define.amd) {
    // AMD, registers as an anonymous module.
    define(function () {
      return pluralize();
    });
  } else {
    // Browser global.
    root.pluralize = pluralize();
  }
})(this, function () {
  // Rule storage - pluralize and singularize need to be run sequentially,
  // while other rules can be optimized using an object for instant lookups.
  var pluralRules = [];
  var singularRules = [];
  var uncountables = {};
  var irregularPlurals = {};
  var irregularSingles = {};

  /**
   * Sanitize a pluralization rule to a usable regular expression.
   *
   * @param  {(RegExp|string)} rule
   * @return {RegExp}
   */
  function sanitizeRule (rule) {
    if (typeof rule === 'string') {
      return new RegExp('^' + rule + '$', 'i');
    }

    return rule;
  }

  /**
   * Pass in a word token to produce a function that can replicate the case on
   * another word.
   *
   * @param  {string}   word
   * @param  {string}   token
   * @return {Function}
   */
  function restoreCase (word, token) {
    // Tokens are an exact match.
    if (word === token) return token;

    // Lower cased words. E.g. "hello".
    if (word === word.toLowerCase()) return token.toLowerCase();

    // Upper cased words. E.g. "WHISKY".
    if (word === word.toUpperCase()) return token.toUpperCase();

    // Title cased words. E.g. "Title".
    if (word[0] === word[0].toUpperCase()) {
      return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
    }

    // Lower cased words. E.g. "test".
    return token.toLowerCase();
  }

  /**
   * Interpolate a regexp string.
   *
   * @param  {string} str
   * @param  {Array}  args
   * @return {string}
   */
  function interpolate (str, args) {
    return str.replace(/\$(\d{1,2})/g, function (match, index) {
      return args[index] || '';
    });
  }

  /**
   * Replace a word using a rule.
   *
   * @param  {string} word
   * @param  {Array}  rule
   * @return {string}
   */
  function replace (word, rule) {
    return word.replace(rule[0], function (match, index) {
      var result = interpolate(rule[1], arguments);

      if (match === '') {
        return restoreCase(word[index - 1], result);
      }

      return restoreCase(match, result);
    });
  }

  /**
   * Sanitize a word by passing in the word and sanitization rules.
   *
   * @param  {string}   token
   * @param  {string}   word
   * @param  {Array}    rules
   * @return {string}
   */
  function sanitizeWord (token, word, rules) {
    // Empty string or doesn't need fixing.
    if (!token.length || uncountables.hasOwnProperty(token)) {
      return word;
    }

    var len = rules.length;

    // Iterate over the sanitization rules and use the first one to match.
    while (len--) {
      var rule = rules[len];

      if (rule[0].test(word)) return replace(word, rule);
    }

    return word;
  }

  /**
   * Replace a word with the updated word.
   *
   * @param  {Object}   replaceMap
   * @param  {Object}   keepMap
   * @param  {Array}    rules
   * @return {Function}
   */
  function replaceWord (replaceMap, keepMap, rules) {
    return function (word) {
      // Get the correct token and case restoration functions.
      var token = word.toLowerCase();

      // Check against the keep object map.
      if (keepMap.hasOwnProperty(token)) {
        return restoreCase(word, token);
      }

      // Check against the replacement map for a direct word replacement.
      if (replaceMap.hasOwnProperty(token)) {
        return restoreCase(word, replaceMap[token]);
      }

      // Run all the rules against the word.
      return sanitizeWord(token, word, rules);
    };
  }

  /**
   * Check if a word is part of the map.
   */
  function checkWord (replaceMap, keepMap, rules, bool) {
    return function (word) {
      var token = word.toLowerCase();

      if (keepMap.hasOwnProperty(token)) return true;
      if (replaceMap.hasOwnProperty(token)) return false;

      return sanitizeWord(token, token, rules) === token;
    };
  }

  /**
   * Pluralize or singularize a word based on the passed in count.
   *
   * @param  {string}  word      The word to pluralize
   * @param  {number}  count     How many of the word exist
   * @param  {boolean} inclusive Whether to prefix with the number (e.g. 3 ducks)
   * @return {string}
   */
  function pluralize (word, count, inclusive) {
    var pluralized = count === 1
      ? pluralize.singular(word) : pluralize.plural(word);

    return (inclusive ? count + ' ' : '') + pluralized;
  }

  /**
   * Pluralize a word.
   *
   * @type {Function}
   */
  pluralize.plural = replaceWord(
    irregularSingles, irregularPlurals, pluralRules
  );

  /**
   * Check if a word is plural.
   *
   * @type {Function}
   */
  pluralize.isPlural = checkWord(
    irregularSingles, irregularPlurals, pluralRules
  );

  /**
   * Singularize a word.
   *
   * @type {Function}
   */
  pluralize.singular = replaceWord(
    irregularPlurals, irregularSingles, singularRules
  );

  /**
   * Check if a word is singular.
   *
   * @type {Function}
   */
  pluralize.isSingular = checkWord(
    irregularPlurals, irregularSingles, singularRules
  );

  /**
   * Add a pluralization rule to the collection.
   *
   * @param {(string|RegExp)} rule
   * @param {string}          replacement
   */
  pluralize.addPluralRule = function (rule, replacement) {
    pluralRules.push([sanitizeRule(rule), replacement]);
  };

  /**
   * Add a singularization rule to the collection.
   *
   * @param {(string|RegExp)} rule
   * @param {string}          replacement
   */
  pluralize.addSingularRule = function (rule, replacement) {
    singularRules.push([sanitizeRule(rule), replacement]);
  };

  /**
   * Add an uncountable word rule.
   *
   * @param {(string|RegExp)} word
   */
  pluralize.addUncountableRule = function (word) {
    if (typeof word === 'string') {
      uncountables[word.toLowerCase()] = true;
      return;
    }

    // Set singular and plural references for the word.
    pluralize.addPluralRule(word, '$0');
    pluralize.addSingularRule(word, '$0');
  };

  /**
   * Add an irregular word definition.
   *
   * @param {string} single
   * @param {string} plural
   */
  pluralize.addIrregularRule = function (single, plural) {
    plural = plural.toLowerCase();
    single = single.toLowerCase();

    irregularSingles[single] = plural;
    irregularPlurals[plural] = single;
  };

  /**
   * Irregular rules.
   */
  [
    // Pronouns.
    ['I', 'we'],
    ['me', 'us'],
    ['he', 'they'],
    ['she', 'they'],
    ['them', 'them'],
    ['myself', 'ourselves'],
    ['yourself', 'yourselves'],
    ['itself', 'themselves'],
    ['herself', 'themselves'],
    ['himself', 'themselves'],
    ['themself', 'themselves'],
    ['is', 'are'],
    ['was', 'were'],
    ['has', 'have'],
    ['this', 'these'],
    ['that', 'those'],
    // Words ending in with a consonant and `o`.
    ['echo', 'echoes'],
    ['dingo', 'dingoes'],
    ['volcano', 'volcanoes'],
    ['tornado', 'tornadoes'],
    ['torpedo', 'torpedoes'],
    // Ends with `us`.
    ['genus', 'genera'],
    ['viscus', 'viscera'],
    // Ends with `ma`.
    ['stigma', 'stigmata'],
    ['stoma', 'stomata'],
    ['dogma', 'dogmata'],
    ['lemma', 'lemmata'],
    ['schema', 'schemata'],
    ['anathema', 'anathemata'],
    // Other irregular rules.
    ['ox', 'oxen'],
    ['axe', 'axes'],
    ['die', 'dice'],
    ['yes', 'yeses'],
    ['foot', 'feet'],
    ['eave', 'eaves'],
    ['goose', 'geese'],
    ['tooth', 'teeth'],
    ['quiz', 'quizzes'],
    ['human', 'humans'],
    ['proof', 'proofs'],
    ['carve', 'carves'],
    ['valve', 'valves'],
    ['looey', 'looies'],
    ['thief', 'thieves'],
    ['groove', 'grooves'],
    ['pickaxe', 'pickaxes'],
    ['passerby', 'passersby']
  ].forEach(function (rule) {
    return pluralize.addIrregularRule(rule[0], rule[1]);
  });

  /**
   * Pluralization rules.
   */
  [
    [/s?$/i, 's'],
    [/[^\u0000-\u007F]$/i, '$0'],
    [/([^aeiou]ese)$/i, '$1'],
    [/(ax|test)is$/i, '$1es'],
    [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, '$1es'],
    [/(e[mn]u)s?$/i, '$1s'],
    [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, '$1'],
    [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1i'],
    [/(alumn|alg|vertebr)(?:a|ae)$/i, '$1ae'],
    [/(seraph|cherub)(?:im)?$/i, '$1im'],
    [/(her|at|gr)o$/i, '$1oes'],
    [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, '$1a'],
    [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, '$1a'],
    [/sis$/i, 'ses'],
    [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, '$1$2ves'],
    [/([^aeiouy]|qu)y$/i, '$1ies'],
    [/([^ch][ieo][ln])ey$/i, '$1ies'],
    [/(x|ch|ss|sh|zz)$/i, '$1es'],
    [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, '$1ices'],
    [/\b((?:tit)?m|l)(?:ice|ouse)$/i, '$1ice'],
    [/(pe)(?:rson|ople)$/i, '$1ople'],
    [/(child)(?:ren)?$/i, '$1ren'],
    [/eaux$/i, '$0'],
    [/m[ae]n$/i, 'men'],
    ['thou', 'you']
  ].forEach(function (rule) {
    return pluralize.addPluralRule(rule[0], rule[1]);
  });

  /**
   * Singularization rules.
   */
  [
    [/s$/i, ''],
    [/(ss)$/i, '$1'],
    [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, '$1fe'],
    [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, '$1f'],
    [/ies$/i, 'y'],
    [/(dg|ss|ois|lk|ok|wn|mb|th|ch|ec|oal|is|ec|ck|ix|sser|ts|wb)ies$/i, '$1ie'],
    [/\b(l|(?:neck|cross|hog|aun)?t|coll|faer|food|gen|goon|group|hipp|junk|vegg|(?:pork)?p|charl|calor|cut)ies$/i, '$1ie'],
    [/\b(mon|smil)ies$/i, '$1ey'],
    [/\b((?:tit)?m|l)ice$/i, '$1ouse'],
    [/(seraph|cherub)im$/i, '$1'],
    [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, '$1'],
    [/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i, '$1sis'],
    [/(movie|twelve|abuse|e[mn]u)s$/i, '$1'],
    [/(test)(?:is|es)$/i, '$1is'],
    [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1us'],
    [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, '$1um'],
    [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, '$1on'],
    [/(alumn|alg|vertebr)ae$/i, '$1a'],
    [/(cod|mur|sil|vert|ind)ices$/i, '$1ex'],
    [/(matr|append)ices$/i, '$1ix'],
    [/(pe)(rson|ople)$/i, '$1rson'],
    [/(child)ren$/i, '$1'],
    [/(eau)x?$/i, '$1'],
    [/men$/i, 'man']
  ].forEach(function (rule) {
    return pluralize.addSingularRule(rule[0], rule[1]);
  });

  /**
   * Uncountable rules.
   */
  [
    // Singular words with no plurals.
    'adulthood',
    'advice',
    'agenda',
    'aid',
    'aircraft',
    'alcohol',
    'ammo',
    'analytics',
    'anime',
    'athletics',
    'audio',
    'bison',
    'blood',
    'bream',
    'buffalo',
    'butter',
    'carp',
    'cash',
    'chassis',
    'chess',
    'clothing',
    'cod',
    'commerce',
    'cooperation',
    'corps',
    'debris',
    'diabetes',
    'digestion',
    'elk',
    'energy',
    'equipment',
    'excretion',
    'expertise',
    'firmware',
    'flounder',
    'fun',
    'gallows',
    'garbage',
    'graffiti',
    'hardware',
    'headquarters',
    'health',
    'herpes',
    'highjinks',
    'homework',
    'housework',
    'information',
    'jeans',
    'justice',
    'kudos',
    'labour',
    'literature',
    'machinery',
    'mackerel',
    'mail',
    'media',
    'mews',
    'moose',
    'music',
    'mud',
    'manga',
    'news',
    'only',
    'personnel',
    'pike',
    'plankton',
    'pliers',
    'police',
    'pollution',
    'premises',
    'rain',
    'research',
    'rice',
    'salmon',
    'scissors',
    'series',
    'sewage',
    'shambles',
    'shrimp',
    'software',
    'staff',
    'swine',
    'tennis',
    'traffic',
    'transportation',
    'trout',
    'tuna',
    'wealth',
    'welfare',
    'whiting',
    'wildebeest',
    'wildlife',
    'you',
    /pok[eé]mon$/i,
    // Regexes.
    /[^aeiou]ese$/i, // "chinese", "japanese"
    /deer$/i, // "deer", "reindeer"
    /fish$/i, // "fish", "blowfish", "angelfish"
    /measles$/i,
    /o[iu]s$/i, // "carnivorous"
    /pox$/i, // "chickpox", "smallpox"
    /sheep$/i
  ].forEach(pluralize.addUncountableRule);

  return pluralize;
});
app.service('Popup', function($uibModal) {
	return {
		simple: function(title, message){
			this.show({ title: title, body: message});
		},
		show: function(options){
			
			// options = {
			// 	title: "Sample Popup",
			// 	buttons: [
			// 		{
			// 			text: "OK",
			// 			theme: "primary",  //(optional)All bootstrap types - default, primary, danger, warning, success, info, lnk etc.
			//			class: "", //(optional)If you want to apply any custom class
			// 			click: function(callback, btn, data){ 
			// 				//do something
			// 				//call callback(btn) ifyou want to get your cleanup function to be called
			// 			},
			//			cleanup: function(data){ (optional)
			// 				//do something
			// 			},
			//			submits: "formName" //(optional) Name of the form this button submits. Converts it into a submit button.
			// 		}
			// 	],
			//  buttonPosition: "" // (optional) default, top,
			//	spinner: false //(optional) true - If you want to show progress while making http calls
			// 	body: "<p>Something</p>",
			// 	data: $scope.your_data (optional),
			//  watch: [{target:'data.variable', callback: function(newObj, oldObj){}}] (optional)
			// 	scope: $scope //(optional),
			//  close: function(data){}
			// }
			
		var templatePre=`
<div class="">
		<div class="modal-header">
            <h4 class="modal-title">
                {{options.title}}
            </h4>
        	<div class="controls">
            	<span ng-if="options.spinner"><spinner></spinner>&nbsp;</span>
            	<button ng-if='options.buttonPosition == "top"' ng-repeat="i in options.buttons" class="btn btn-{{i.theme}} {{i.class}}" type="button" ng-click="i.click(callback, i, data)">{{i.text}}</button>
            	<button ng-if='options.buttonPosition == "top"' class="btn btn-dark" type="{{ i.submits ? 'submit' : 'button'}}" ng-click="cancel()">Close</button>
        	</div>
        </div>
        <div class="modal-body">
        	<div class="custom-modal-content">
		`;
		var templatePost=`        		
        	</div>
		</div>	
		<div class="modal-footer" ng-if='!options.buttonPosition || options.buttonPosition == "" || options.buttonPosition == "default"' >
		    <button ng-repeat="i in options.buttons" class="btn btn-{{i.theme}} {{i.class}}" type="{{ i.submits ? 'submit' : 'button'}}" ng-click="i.click(callback, i, data)" form="{{ i.submits ? i.submits : ''}}">{{i.text}}</button>
		    <button class="btn btn-dark" type="button" ng-click="cancel()">Close</button>
		</div>		
</div>
		`;
		
		var template = templatePre + options.body + templatePost;
		
		var instance = $uibModal.open({
			template: template,
			//templateUrl: "app/services/popup.html",
			controller: function ($scope, $uibModalInstance, H, M, S, $rootScope) {
	      		$scope.options = options;
	        	$scope.data = options.data || {}
	        	
	        	$scope.close = function () {
	        		$uibModalInstance.dismiss($scope.data);
	        	};

	        	$scope.cancel = function () {
	        		$uibModalInstance.dismiss($scope.data);
	        	};
	        	
	        	$scope.callback = function(btn) {
	        		btn.data = $scope.data;
	        		$uibModalInstance.close(btn);
	        	}
	        	
	        	
	        	if(options.watch){
	        		for(i in options.watch){
	        			var w = options.watch[i];
	        			$scope.$watch(w.target, w.callback);	
	        		}
	        	}

			},
			scope : options.scope
    		});	
    	 
		instance.result.then(function(btn){
			//Get triggers when modal is closed
			if(btn && btn.cleanup) btn.cleanup(btn.data);
		}, function(data){
			//gets triggers when modal is dismissed.
			if(options && options.close) options.close(data);
		 });

		}
	};
});
/*global app*/
//Service for quickly getting the API Resource Object
app.service('R', function($resource, $http, S) {
	return {
		get: function(resourceName) {
			return $resource(S.baseUrl + '/' + resourceName + '/:id', {
				id: '@id'
			});
		},
		count: async function(resourceName, cb) {
			$http.get(S.baseUrl + '/' + resourceName + '/?count=true')
				.then(function(results) {
					if (results && results.data && results.data.length > 0)
						if (cb) cb(results.data[0].count);
				}, function(e) {});
		},
		query: async function(resourceName, q, cb){
			await $http.get(S.baseUrl + '/' + resourceName,  {params: q})
				.then(function(results) {
					if (results && results.data)
						if (cb) cb(results.data);
						return results.data;
				}, function(e) {
						if (cb) cb(e);
						return e;
            });			
		},
		submit: async function(resourceName, payload, cb){
			await $http.post(S.baseUrl + '/' + resourceName, payload)
				.then(function(results) {
					if (results && results.data)
						if (cb) cb(results.data);
						return results.data;
				}, function(e) {
						if (cb) cb(e);
						return e;
            });			
		},
		update: async function(resourceName, payload, cb){
			await $http.put(S.baseUrl + '/' + resourceName, payload)
				.then(function(results) {
					if (results && results.data)
						if (cb) cb(results.data);
						return results.data;
				}, function(e) {
						if (cb) cb(e);
						return e;
            });			
		},      
		remove: async function(resourceName, id, cb){
			await $http.delete(S.baseUrl + '/' + resourceName + '/' + id)
				.then(function(results) {
					if (results && results.data)
						if (cb) cb(results.data);
						return results.data;
				}, function(e) {
						if (cb) cb(e);
						return e;
            });			
		}
	};
});
/*global app*/
app.directive('focusOn', ['$timeout',
    function ($timeout) {
        var checkDirectivePrerequisites = function (attrs) {
          if (!attrs.focusOn && attrs.focusOn != "") {
                throw "FocusOn missing attribute to evaluate";
          }
        };

        return {            
            restrict: "A",
            link: function (scope, element, attrs, ctrls) {
                checkDirectivePrerequisites(attrs);

                scope.$watch(attrs.focusOn, function (currentValue, lastValue) {
                    if(currentValue == true) {
                        $timeout(function () {    
                            element.focus();
                        });
                    }
                });
            }
        };
    }
]);/*global app, Helper*/
app.filter('checkLicenseValidity', function() {
    return function(organization) {
        return Helper.checkLicenseValidity(organization);
        //return new Date();
    };
});/*global app*/
app.filter('lowerCase', function() {
    return function(input) {
      input = input || '';
      return input.replace(/\w\S*/g, function(txt){return txt.toLowerCase();});
    };
});  /*global app*/
app.filter('titleCase', function() {
    return function(input) {
      input = input || '';
      return input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    };
});/*global app, Helper*/
app.filter('toDateTime', function() {
    return function(str) {
        return Helper.toDateTime(str);
    };
});/*global app*/
app.filter('upperCase', function() {
    return function(input) {
      input = input || '';
      return input.replace(/\w\S*/g, function(txt){return txt.toUpperCase();});
    };
});app.directive('breadCrumb', function(){
	return {
	    scope: {
    	  args: '@',
    	  active: '@'
	    },

		restrict: 'EA',
    	templateUrl: 'app/components/bread-crumb/template.html'
	};
});

app.controller('breadCrumbController', function($scope) {
	
	var isString = function  (value) {
		return typeof value === 'string' || value instanceof String;
	}
	


	var args = $scope.args;
	var active = $scope.active;
	
	var isJSON = false;
	try{
		if(isString(args)){
			var argsJSON  = JSON.parse(args);
			args = argsJSON;
			isJSON = true;
		}
	} catch (ex){
		//console.log(ex);
	}

	if (isString(args) && !isJSON && args.indexOf(',') > -1){
		args = args.split(',');
	}


	var data = [];
	if(isString(args)){
		var text = args;
		// var activeClass = (active === true || active === "true" || active == args || active =="") ? "active" : "";
		var activeClass = (active === false || active ==="false") ? "" : "active";
		data = [{ text: text, active: activeClass }];
	} else if(Array.isArray(args)){

		if(args.length == 1){
			var text = (args[0].text) ? args[0].text : args[0]
			// var activeClass = (active === false || active === "false" || (active != "" && active != text) ) ? "" : "active";
			var activeClass = (active === false || active ==="false") ? "" : "active";
			data = [{ text: text, active: activeClass }];
		} else if (args.length > 1){
				var activeInArray = false;
				for(count = 0; count < args.length ; count++){
				
				var i = args[count];
				var text = "";
				var activeClass = "";
				var isLink = false;
				var link = "";
				
				if(isString(i)){
					text = i;
					if(active === true || active === "true"){
						if(i == args.length - 1){
							activeInArray = true;
							activeClass = "active";	
						}
					} else if(active === text) {
						activeInArray = true;
						activeClass = "active";	
					}
				} else {
					text = i.text;
					if(i.active){
						activeInArray = true;
						activeClass = "active";
					}
					if(i.link){
						isLink = true;
						link = i.link
					}
				}
				
				var item = {text: text, active: activeClass};
				if(isLink) item.link = link;
				
				data.push(item);
			}
			if(!activeInArray && !(active === false || active === "false")) { 
				data[data.length - 1].active = "active" 
			}
		} 
		
	} else {
		
		var activeClass = (active === false || active ==="false" || args.active === false || args.active === "false") ? "" : "active";
		args.active = activeClass;
		data = [args];
	} 
	
	$scope.data = data;
	
});
/*global app*/
app.directive('fileUpload', function (S, upload) {
    return {
        restrict: 'EA',
        scope: {
            id: '@',
            css: '@',
            label: '@',
            callback: '&',
            url: '@'
        },
        template: `
			<div class="{{containerClass}}">
			    <input type="file" class="{{containerClass}}-input" id="{{id}}_input" name="{{id}}_input">
			    <label class="{{containerClass}}-label" for="{{id}}_input">{{label || 'Choose a file'}}</label>
			</div>
        `,
        link: function (scope, element, attr) {
        	scope.id = scope.id || "input_" +  Math.floor(Math.random() * 1000);
        	scope.containerClass = scope.css || 'custom-file';
            element.bind('change', function () {
                var formData = new FormData();
                formData.append('file', element[0].children[0].children[0].files[0]);
                upload(scope.url || S.baseUrl + '/files', formData, function(r){
                	if(scope.callback) scope.callback()(r);
                });
            });

        }
    };
});
app.factory('upload', function($http) {
  return function(url, data, callback) {
    $http({
      url: url,
      method: "POST",
      data: data,
      headers: {
        'Content-Type': undefined
      }
    }).then(function(response) {
      if(callback) callback(response);
    }, function(e){
    	if(callback)  callback(e);
    });
  };
});
/*
app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);
*/
/*global app*/
app.component('infoBox', {
	templateUrl: 'app/components/infobox/template.html',
	controller: 'infoboxController',
	bindings: {
		options: '<',
	}
});

app.controller('infoboxController', function($scope){
	// $scope.options = {
	// 	title: 'options.title',
	// 	value: 'options.value',
	// 	icon: 'options.icon',
	// 	background: 'bgblueish',
	// 	color: 'white-text',
	// 	action: 'options.action'
	// };

	var self = this;
	self.$onInit = function(){
		if(self.options){
			$scope.options = self.options;
		}
	};
	
});/*global app, RegisterMenuItems*/
app.controller('navController', async function($scope, $http, S, H) {

	var masterMenu =   {
            header: 'Masters',
            showHeader: true,
            showSeparator: true,
            items: GLOBALS.menu.masterItems,
	        allowedRoles: ['admin']
    };
    
    var data = RegisterMenuItems();
    if(S.showMastersMenu && masterMenu) {
    	data.push(masterMenu);
    }
    
    
    for(var k in data){
        if(data.hasOwnProperty(k) && data[k].items && data[k].items.length > 0){
            for (var i = 0; i < data[k].items.length; i++) {
                if(!data[k].items[i].action.startsWith('#!')) data[k].items[i].action =  '#!' + data[k].items[i].action;
                if(data[k].items[i].color && !data[k].items[i].color.startsWith("col-")) data[k].items[i].color = "col-" + data[k].items[i].color;
                if(data[k].items[i].items && data[k].items[i].items.length > 0){
                    data[k].items[i].action = '';
                    for (var j = 0; j < data[k].items[i].items.length; j++) {
                        if(!data[k].items[i].items[j].action.startsWith('#!')) data[k].items[i].items[j].action = '#!' + data[k].items[i].items[j].action;
                        if(data[k].items[i].items[j].color  && !data[k].items[i].items[j].color.startsWith("col-")) data[k].items[i].items[j].color = "col-" + data[k].items[i].items[j].color;
                    }
                }
            }
        }
    }
    
    setTimeout(function(){
	    for(var k in data){
	        if(data.hasOwnProperty(k) && data[k].items && data[k].items.length > 0){
	            for (var i = 0; i < data[k].items.length; i++) {
	                if(!data[k].items[i].action.startsWith('#!')) data[k].items[i].action =  '#!' + data[k].items[i].action;
	                if(data[k].items[i].color && !data[k].items[i].color.startsWith("col-")) data[k].items[i].color = "col-" + data[k].items[i].color;
	                if(data[k].items[i].items && data[k].items[i].items.length > 0){
	                    data[k].items[i].action = '';
	                    for (var j = 0; j < data[k].items[i].items.length; j++) {
	                        if(!data[k].items[i].items[j].action.startsWith('#!')) data[k].items[i].items[j].action = '#!' + data[k].items[i].items[j].action;
	                        if(data[k].items[i].items[j].color  && !data[k].items[i].items[j].color.startsWith("col-")) data[k].items[i].items[j].color = "col-" + data[k].items[i].items[j].color;
	                    }
	                }
	            }
	        }
	    }    	
    }, 1000);
    
    
    $scope.data = data;
});
/*global app*/
// app.component('sideNav', {
// 	templateUrl: 'app/components/nav/side-nav.html',
// 	controller: 'navController',
// 	bindings: {
// 		options: '<',
// 	}
// });


app.directive('headerNav', function(){
	return {
		restrict: 'EA',
    	templateUrl: 'app/components/nav/header-nav.html'
	};
});


app.directive('sideNav', function(){
	return {
		restrict: 'EA',
    	templateUrl: 'app/components/nav/side-nav.html'
	};
});

app.directive('topNav', function(){
	return {
		restrict: 'EA',
    	templateUrl: 'app/components/nav/top-nav.html'
	};
});

app.directive('rightNav', function(){
	return {
    	templateUrl: 'app/components/nav/right-nav.html'
	};
});



/*global app*/
app.directive('spinner', function($rootScope) {
  return {
    scope: {
      size: '@'
    },
    restrict: 'EA',
    replace: true,
    template: '<img src="images/spinner.gif" ng-if="$root.loading" style="width:{{size || 13}}px;height:{{size || 13}}px; vertical-align: baseline;"></img>'
  };
});/*global app*/
app.component('time', {
	templateUrl: 'app/components/time/template.html',
	controller: 'timeController',
	bindings: {
		value: '<',
		label: '<'
	}
});

app.controller('timeController', function($scope){
	// $scope.options = {
	// 	title: 'options.title',
	// 	value: 'options.value',
	// 	icon: 'options.icon',
	// 	background: 'bgblueish',
	// 	color: 'white-text',
	// 	action: 'options.action'
	// };

	var self = this;
	self.$onInit = function(){
		if(self.value){
			$scope.value = self.value;
			$scope.hh = $scope.value.substring(1, 3);
			$scope.mm = $scope.value.substring(4);
		}
		else{
			$scope.hh = "00";
			$scope.mm = "00";
		}
		if(self.label){
			$scope.label = self.label;
		}
	};
	
});/*global app*/
app.controller('authController', function($scope, $rootScope, $http, $location, $cookies, loginEventService, H, M, S) {
	if($rootScope.currentUser){
		//$location.path('/');
	}
	
	$scope.forms = {};
	
	$scope.H = H;
	$scope.M = M;
	$scope.S = S;
	
	$scope.data = {};
	
	$scope.data.roles = [{id: 'user', title: 'User'}, {id: 'admin', title: 'Administrator'}];
	
	//$scope.loading = false;

	$scope.login = function(){
		//$scope.loading = true;
		// $('.menu-static').hide();
		// $('.menu-loading').show();
		GLOBALS.methods.sideNavLoading();
		
		$http.post(H.SETTINGS.baseUrl + '/users/login', {email: $scope.email, password: $scope.password})
			.then(function(r){
				$scope.error = "";
				if(!r.data.token){
					$scope.error = M.E500;
					//$scope.loading = false;
					return;
				}
				$rootScope.currentUser = r.data;
            
				$rootScope.currentTheme = {
				bg : ( H.S.theme.background || 'light'),
					col : ( H.S.theme.color || 'black'),
					alt : ( H.S.theme.alternate || 'light'),
					cont : ( H.S.theme.contrast || 'grey')
				}
            
				$cookies.putObject(H.getCookieKey(), JSON.stringify(r.data));
				GLOBALS.methods.sideNav(null, S.menu);
				$location.path('/');	

			}, function(e){
				if(e && e.data && e.data.error && e.data.error.status){
					if(e.data.error.code == 404 && e.data.error.message == "Not Found"){
						$scope.error = M.LOGIN_API_UNAVAILABLE;
					} else {
						$scope.error = e.data.error.message ? e.data.error.message : e.data.error.status;	
					}
					
				}

				GLOBALS.methods.logout();
				//$scope.loading = false;
			});
	};

	$scope.forgotPassword = function(){
		//$scope.loading = true;
		$http.post(H.SETTINGS.baseUrl + '/users/forgot-password', {email: $scope.email})
			.then(function(r){
				$scope.error = M.RECOVERY_EMAIL_SENT;
				//$scope.loading = false;
			}, function(e){
				if(e && e.data && e.data.error && e.data.error.status){
					if(e.data.error.code == 404 && e.data.error.message == "Not Found"){
						$scope.error = M.LOGIN_API_UNAVAILABLE;
					} else {
						$scope.error = e.data.error.message ? e.data.error.message : e.data.error.status;
					}
				}
				//$scope.loading = false;
			});
	};

	$scope.register = function(){
		var route = 'users';
		var data = {username: $scope.data.username, email: $scope.data.email, password: $scope.data.password};
		if(S.enableSaaS) {
			route = 'organizations'; 
			data = {organization: $scope.data.organization, email: $scope.data.email};
		}else{
			if($scope.data.password != $scope.data.confirmPassword){
				$scope.error = "Password and Confirm Password should match!";
				return;
			}
		}
		
		$http.post(H.SETTINGS.baseUrl + '/' + route +'/register', data)
			.then(function(r){
				$scope.error = M.REGISTRATION_EMAIL_SENT;
			}, function(e){
				if(e && e.data && e.data.error && e.data.error.status){
					if(e.data.error.code == 404 && e.data.error.message == "Not Found"){
						$scope.error = M.REGISTER_API_UNAVAILABLE;
					} else {
						$scope.error = e.data.error.message ? e.data.error.message : e.data.error.status;
					}
				}
			});
	};
	
	$scope.logout = function(){
		// GLOBALS.registry.sideNavStatus = false;
		// $('.all-nav').hide(); //CUSTOM
		// $('.menu-static').show();
		// $('.menu-loading').hide();
		GLOBALS.methods.logout();
		
		$cookies.remove(H.getCookieKey());
		delete $rootScope.currentUser;
		$location.path('/sign-in');
	};
	
	GLOBALS.methods.autoFocus();
});


/*global app*/
app.controller('outOfServiceController', function($scope, H){
	$scope.H = H;
	$scope.M = H.M;
});
/*global app*/
app.controller('profileController', function($scope, $rootScope, $http, $cookies, H, M){
	$scope.H = H;
	$scope.M = H.M;

	$scope.roleLocked = $rootScope.currentUser.organization.email == $rootScope.currentUser.email;
	$scope.currentUser = $rootScope.currentUser;

	$scope.locked = true;
	$scope.lockedClass = "hidden";
	$scope.editingClass = "";
	
	$scope.forms = {};
	$scope.userData = {};
	$scope.passwordData = {};
	$scope.roles = [{id: 'user', title: 'User'}, {id: 'admin', title: 'Administrator'}];

	$scope.disableEdit = function(){
		$scope.locked = true;
		$scope.lockedClass = "hidden";
		$scope.editingClass = "";
	}
	
	$scope.edit = function(){
		$scope.locked = false;
		$scope.editingClass = "float-left";
		$scope.lockedClass = "visible float-right formClass";
	
		$scope.userData.username = $rootScope.currentUser.username;
		$scope.userData.email = $rootScope.currentUser.email;
		$scope.userData.role = $rootScope.currentUser.role;
	};
	
	$scope.updateHandler = function(r){
				$scope.userData.message = H.M.PROFILE_SAVED;
				var user = r.data;
				user.password = $rootScope.currentUser.password;
				user.organization = $rootScope.currentUser.organization;
				$rootScope.currentUser = user;
				$cookies.putObject(H.getCookieKey(), JSON.stringify($rootScope.currentUser));
	}
	
	$scope.$watch('userData.email', function(newObj, oldObj){
		if($scope.userData && $scope.userData.username && $scope.userData.username.indexOf('@') > -1){
			$scope.userData.username = newObj;
		}
	});
	
	$scope.save = function(){
		$scope.userData.error = "";
		$scope.userData.message = "";
		$http.get(H.S.baseUrl + '/users/' + $rootScope.currentUser.id).then(function(res){
			var r = res.data;
			r.username = $scope.userData.username;
			r.email = $scope.userData.email;
			r.role = $scope.userData.role;
			
			if(H.S.legacyMode){
				$http.post(H.S.baseUrl + '/users/update', r).then(function(r){
					$scope.updateHandler(r);
				}, function(e){
					$scope.userData.error = H.M.PROFILE_SAVE_ERROR;
				});
			} else {
				$http.put(H.S.baseUrl + '/users', r).then(function(r){
					$scope.updateHandler(r);
				}, function(e){
					$scope.userData.error = H.M.PROFILE_SAVE_ERROR;
				});
			}
		},function(e){
			$scope.userData.error = H.M.PROFILE_SAVE_ERROR;
		});
	};
	
	$scope.changePassword = function(){
		$scope.passwordData.error = "";
		$scope.passwordData.message = "";
		if($scope.passwordData.newPassword != $scope.passwordData.confirmPassword){
			$scope.passwordData.error = M.PASSWORD_NOT_MATCHING;
			return;
		}
		var data = {
			email: $rootScope.currentUser.email,
			password: $scope.passwordData.password,
			new_password: $scope.passwordData.newPassword
		};
		$http.post(H.S.baseUrl + '/users/change-password', data).then(function(res){
			$scope.passwordData.message = H.M.PASSWORD_CHANGED;
		},function(e){
			$scope.passwordData.error = H.M.PASSWORD_CHANGE_ERROR + " " + e.data.error.message;
		});
	};	
});
/*global app*/
app.controller('unauthorizedController', function($scope, H){
	$scope.H = H;
	$scope.M = H.M;
});
/*global app*/
//The name of the controller should be plural that matches with your API, ending with ControllerExtension. 
//Example: your API is http://localhost:8080/api/categories then the name of the controller is categoriesControllerExtension.
//To register this controller, just go to app/config/routes.js and add 'categories' in 'easyRoutes' array.
app.controller('categoriesControllerExtension', function($scope, $controller, $rootScope, $http, $location, Popup, Alert, H, M) {
    
    
    //This function is called when you need to make changes to the new single object.
    $scope.onInit = function(obj){
        //$scope.data.single is available here. 'obj' refers to the same. It is the new instance of your 'categories' resource that matches the structure of your 'categories' API.
        obj.is_active = 1;
    };
    
    //This function is called when you are in edit mode. i.e. after a call has returned from one of your API that returns a single object. e.g http://localhost:8080/api/categories/1
    $scope.onLoad = function(obj){
        //$scope.data.single is available here. 'obj' refers to the same. It represents the object you are trying to edit.
    };
    
    //This function is called when you are in list mode. i.e. before a call has been placed to one of your API that returns a the paginated list of all objects matching your API.
    $scope.beforeLoadAll = function(query){
        //This is where you can modify your query parameters.    
        //query.is_active = 1;
        //return query;
    };


    //This function is called when you are in list mode. i.e. after a call has returned from one of your API that returns a the paginated list of all objects matching your API.
    $scope.onLoadAll = function(obj){
        //$scope.data.list is available here. 'obj' refers to the same. It represents the object you are trying to edit.
        
        //You can call $scope.setListHeaders(['column1','column2',...]) in case the auto generated column names are not what you wish to display.
        //or You can call $scope.changeListHeaders('current column name', 'new column name') to change the display text of the headers;
        $scope.changeListHeaders('Category', 'Parent Category');
        
        // console.log(parseInt(($scope.data.records - 1)/ $scope.data.limit));
    };
    
    //This function is called before the create (POST) request goes to API
    $scope.beforeSave = function(obj, next){
        //You can choose not to call next(), thus rejecting the save request. This can be used for extra validations.
        next();
    };

    //This function is called after the create (POST) request is returned from API
    $scope.onSave = function (obj, next){
        //You can choose not to call next(), thus preventing the page to display the popup that confirms the object has been created.
        next();
    };
    
    //This function is called before the update (PUT) request goes to API
    $scope.beforeUpdate = function(obj, next){
        if(obj.id == obj.category_id){
        	Alert.warning("Can not select self as parent");
        	return;
        }
        delete obj.category;
        //You can choose not to call next(), thus rejecting the update request. This can be used for extra validations.
        next();
    };

    //This function is called after the update (PUT) request is returned from API
    $scope.onUpdate = function (obj, next){
        //You can choose not to call next(), thus preventing the page to display the popup that confirms the object has been updated.
        next();
    };
    
    //This function will be called whenever there is an error during save/update operations.
    $scope.onError = function (obj, next){
        //You can choose not to call next(), thus preventing the page to display the popup that confirms there has been an error.
        next();
    };
    
    $scope.getSingularTitle = function(){
        return M.FIELD_CATEGORY.toUpperCase();
    };
    
    H.R.get('categories').query({}, function(r){
        $scope.data.categories = r;
    });
    
    

});/*global app*/
app.controller('titleController', function($scope, S){
   $scope.title =  S.productName;
});/*global app*/
//The name of the controller should be plural that matches with your API, ending with ControllerExtension. 
//Example: your API is http://localhost:8080/api/tasks then the name of the controller is tasksControllerExtension.
//To register this controller, just go to app/config/routes.js and add 'tasks' in 'easyRoutes' array.
app.controller('contactsControllerExtension', function($scope, $controller, $rootScope, $http, $location, Popup, H, M) {
    
    //This function is called when you need to make changes to the new single object.
    $scope.onInit = function(obj){
        //$scope.data.single is available here. 'obj' refers to the same. It is the new instance of your 'tasks' resource that matches the structure of your 'tasks' API.
        obj.is_active = 1;
    };
    
    //This function is called when you are in edit mode. i.e. after a call has returned from one of your API that returns a single object. e.g http://localhost:8080/api/tasks/1
    $scope.onLoad = function(obj){
        //$scope.data.single is available here. 'obj' refers to the same. It represents the object you are trying to edit.
        
    };
    
    //This function is called when you are in list mode. i.e. before a call has been placed to one of your API that returns a the paginated list of all objects matching your API.
    $scope.beforeLoadAll = function(query){
        //This is where you can modify your query parameters.    
        //query.is_active = 1;
        //return query;
    };

    //This function is called when you are in list mode. i.e. after a call has returned from one of your API that returns a the paginated list of all objects matching your API.
    $scope.onLoadAll = function(obj){
        //$scope.data.list is available here. 'obj' refers to the same. It represents the object you are trying to edit.
        
        //You can call $scope.setListHeaders(['column1','column2',...]) in case the auto generated column names are not what you wish to display.
        //or You can call $scope.changeListHeaders('current column name', 'new column name') to change the display text of the headers;
    };
    
    //This function is called before the create (POST) request goes to API
    $scope.beforeSave = function(obj, next){
        //You can choose not to call next(), thus rejecting the save request. This can be used for extra validations.
        next();
    };

    //This function is called after the create (POST) request is returned from API
    $scope.onSave = function (obj, next){
        //You can choose not to call next(), thus preventing the page to display the popup that confirms the object has been created.
        next();
    };
    
    //This function is called before the update (PUT) request goes to API
    $scope.beforeUpdate = function(obj, next){
        //You can choose not to call next(), thus rejecting the update request. This can be used for extra validations.
        next();
    };

    //This function is called after the update (PUT) request is returned from API
    $scope.onUpdate = function (obj, next){
        //You can choose not to call next(), thus preventing the page to display the popup that confirms the object has been updated.
        next();
    };
    
    //This function will be called whenever there is an error during save/update operations.
    $scope.onError = function (obj, next){
        //You can choose not to call next(), thus preventing the page to display the popup that confirms there has been an error.
        next();
    };
    
    // If the singular of your title is having different spelling then you can define it as shown below.
    // $scope.getSingularTitle = function(){
    //     return "TASK";
    // }

    // If you want don't want to display certain columns in the list view you can remove them by defining the function below.
    // $scope.removeListHeaders = function(){
    //     return ['is_active'];
    // }

    // If you want to refresh the data loaded in grid, you can call the following method
    // $scope.refreshData();

});
/*global angular, app, $*/
app.controller('groupsControllerExtension', function($scope, $controller, $rootScope, $http, $q, $location, Popup, H, M) {
    if(!(['admin', 'superadmin'].indexOf($rootScope.currentUser.role) > -1)){
        $location.path('unauthorized');
    }

    $scope.UserGroups = H.R.get('user_groups');
    $scope.Users = H.R.get('users');
    $scope.loadUsers = function(){
        $scope.Users.query({}, function(r){
            $scope.users = r;    
            var usersList = {};
            $scope.users.map(function(p){
                usersList[p.username] = "images/user.png";
            });
            $scope.data.usersList = usersList;
            $("#query").typeahead({ source:$scope.data.usersList });
        });
    };
    $scope.loadUserGroups = function(groupId, callback){
        $scope.UserGroups.query({group_id: groupId}, function(r){
            $scope.data.groupUsers = r;
            if(callback) callback();
        });
    };
    
    $scope.getUsers = function(searchText){
        return $http.get(H.S.baseUrl + '/users?username[in]=' + searchText)
            .then(function(r){
                return r.data;
            });
        //return $scope.data.users.filter(p => p.username.includes(searchText));
    };

    $scope.onInit = function(obj){
        obj.is_active = 1;
        $scope.loadUsers();
    };
    
    $scope.onLoad = function(obj){
        $scope.loadUsers();
        $scope.loadUserGroups(obj.id);
        
    };
    
    if(!$scope.data.groupUsersAdd) $scope.data.groupUsersAdd = [];
    if(!$scope.data.groupUsersRemove) $scope.data.groupUsersRemove = [];
    
    $scope.removeGroupUser = function(user){
        
        var justAdded = $scope.data.groupUsersAdd.filter(function(p){return p.user_id == user.user_id && p.group_id == user.group_id });
        if(justAdded.length == 1){
            var justAddedIndex = $scope.data.groupUsersAdd.indexOf(justAdded[0]);
            if(justAddedIndex > -1){
                $scope.data.groupUsersAdd.splice(justAddedIndex, 1);    
            }
        } else {
            $scope.data.groupUsersRemove.push(user);
        }
        var userIndex = $scope.data.groupUsers.indexOf(user);
        if(userIndex > -1){
            $scope.data.groupUsers.splice(userIndex, 1);    
        }
        // $scope.loading = true;
        // $scope.delete(item, function(r){
        //     $scope.loading = false;
        //     // $scope.UserGroups.query({group_id: $scope.data.single.id}, function(r){
        //     //     $scope.data.groupUsers = r;
        //     // });
        // });
    };
    
    $scope.addGroupUser = function(user){
        if($scope.data.single.id && user){
            var ug = new $scope.UserGroups();
            ug.user_id = user.id;
            ug.group_id = $scope.data.single.id;
            var ugl = new $scope.UserGroups();
            ugl.user_id = user.id;
            ugl.group_id = $scope.data.single.id;
            ugl.user = user;
            
            var notExistsInAdd = $scope.data.groupUsersAdd.filter(function(p) { return p.user_id == ug.user_id && p.group_id == ug.group_id}).length == 0;
            var notExistsInMain = $scope.data.groupUsers.filter(function(p) { return p.user_id == ug.user_id && p.group_id == ug.group_id }).length == 0;
            var removeMembers = $scope.data.groupUsersRemove.filter(function(p) { return p.user_id == ug.user_id && p.group_id == ug.group_id });
            var existsInRemove = removeMembers.length == 1;
            var notExistsInRemove = removeMembers.length == 0;
            
            if(notExistsInAdd && notExistsInMain && notExistsInRemove){
                $scope.data.groupUsersAdd.push(ug);
                $scope.data.groupUsers.push(ugl);
            } else {
                if(existsInRemove){
                    var removeIndex = $scope.data.groupUsersRemove.indexOf(removeMembers[0]);
                    if(removeIndex > -1){
                        $scope.data.groupUsersRemove.splice(removeIndex, 1);
                        $scope.data.groupUsers.push(ugl);
                    }
                }
            }
            // $scope.save(ug, function(r){
            //     if(!((r && r.data && r.data.error) || (r && r.error))){
            //         $scope.data.groupUsers.push(r);    
            //     }
            // });
        }
    };
    
    $scope.onUpdate = function(obj, next){
        var promises = [];
        if($scope.data.groupUsersAdd.length > 0){
            promises.push($scope.post('user_groups',$scope.data.groupUsersAdd));
        }
        if($scope.data.groupUsersRemove.length > 0){
            var ids = $scope.data.groupUsersRemove.map(function(p){ return p.id });
            promises.push($scope.deleteMany('user_groups', ids));
        }
        if(promises.length > 0){
            $q.all(promises).then(function(r){
                if(r.error){
                    $scope.onErrorBase(r.error);
                } else {
                    $scope.loadUserGroups(obj.id, function(){
                        $scope.data.groupUsersAdd = [];
                        $scope.data.groupUsersRemove = [];
                        next();    
                    });
                }
            });
        }
    };

    $scope.onSave = function(result, next){
        if(result && result.id){
            // var UserGroups = H.R.get('user_groups');
            // for (var i = 0; i < $scope.data.groupUsers.length; i++) {
            //     var ug = new $scope.UserGroups();
            //     ug.user_id = $scope.data.groupUsers[i].id;
            //     ug.group_id = result.id;
            //     $scope.save(ug);
                
            // }
                next();
        } else {
            next();
        }
        
    };
    
    GLOBALS.methods.autoFocus();
    
});
/*global app*/
app.controller('homeController', function ($scope, $rootScope, H, R) {

	// $controller('homeControllerBase', {
	// 	$rootScope:$rootScope
	// });

    // $('.collapsible').collapsible();
    

	$scope.H = H;
	$scope.M = H.M;

	$scope.data = {
		counters: {
			tasksCounter: {
				title: 'Tasks',
				value: '...',
				icon: 'assignment_turned_in',
				background: 'green',
				color: 'white',
				action: 'tasks',
				allowedRoles: ['user', 'admin']
			},
			usersCounter: {
				title: 'Users',
				value: '...',
				icon: 'person',
				background: 'purple',
				color: 'white',
				action: 'users',
				allowedRoles: ['admin']
			},
			groupsCounter: {
				title: 'Groups',
				value: '...',
				icon: 'group',
				background: 'pink',
				color: 'white',
				action: 'groups',
				allowedRoles: ['admin']
			},
			organizationsCounter: {
				title: 'Organizations',
				value: '...',
				icon: 'people_outline',
				background: 'green',
				color: 'white',
				action: 'organizations',
				allowedRoles: ['superadmin']
			}
		},
		bgColors: [
			"blue",
			"red",
			"teal",
			"orange",
			"cyan",
			"brown",
			"pink",
			"purple",
			"green"
			// "light-blue",
			// "amber",
			// "lime",
			// "yellow",
			// "indigo",
			// "grey",
		]

	};
	
	function getNextNumber(n) {
		var m = n % $scope.data.bgColors.length;
		return m;
	}
	
	function randomizeTileColors() {
		var count = 0;
		for(var key in $scope.data){
			if($scope.data.hasOwnProperty(key)){
				var val = $scope.data[key];
				if(val.hasOwnProperty('background')){
					val.background = $scope.data.bgColors[getNextNumber(count)];
				}
				count++;
			}
		}
	}
	
	function setCount(resourceName, counterName) {
		R.count(resourceName, function (result) {
			$scope.data.counters[counterName].value = result;
		});
	}
	
	function setCounts(resources) {
		for (var i = 0; i < resources.length; i++) {
			var resourceName = resources[i];
			var counterName = resourceName + 'Counter';
			setCount(resourceName, counterName);
		}
	}
	
	function setCountsDefault(){
		var resources = [];
		for (var k in $scope.data.counters) {
			var v = $scope.data.counters[k];
			if(v.allowedRoles.indexOf($rootScope.currentUser.role) > -1){
				resources.push(v.action);
			}
		}
		setCounts(resources);
	}
	
	$rootScope.currentPage = 1;
	
	
	//Random colors for each tile
	//randomizeTileColors();
	
	//Set counts for each tile
	//setCounts(["tasks", "users"]);
	
	//Set counts for each tile automatically, considering the name of the action and the path of the API is same
	setCountsDefault();


});
/*global angular, app*/
app.controller('organizationsControllerExtension', function($scope, $controller, $rootScope, $http, $location, $timeout, Popup, H, M) {

    if(!(['superadmin'].indexOf($rootScope.currentUser.role) > -1)){
        $location.path('unauthorized');
    }
    
    $scope.checkLicenceValidity = function(item){return H.checkLicenseValidity(item) == 'valid' ? true : false };

    $scope.onInit = function(){
        //$scope.newSingle(function(){
            $scope.data.single.org_secret = H.getUUID();  
            $scope.data.single.license = 'basic';
            $scope.data.single.validity = '0000-01-01 00:00:00';
        //})
    };
    
    $scope.onLoadAll = function(){
        $scope.setListHeaders(['Organization', 'Email', 'License', 'Validity', 'Client Secret']);
    }
    
    $scope.data.currentOrganization = {};
    $scope.data.newOrganizationValues = {};
    $scope.data.newUserValues = {};
    $scope.data.plans = [{id: 'basic', title: 'Basic'}, {id: 'standard', title: 'Standard'}, {id: 'pro', title: 'Professional'}];

    

    $scope.showSetPasswordDialog = function(ev, item) {
        $scope.data.currentOrganization = item;

        var body=`
<div id="set-password-form-container">
				    <form id="set-password-form">
					    <div flex="100" class="flex flex-col">
						    <div class="form-group row">
						      <label for="admin_password">{{M.FIELD_SUPERADMIN_PASSWORD}}</label>
						      <input class="form-control"  name="admin_password" ng-model="data.newUserValues.admin_password" type="password" required>
						    </div>
						    <div class="form-group row">
						      <label for="password">{{M.FIELD_PASSWORD}}</label>
						      <input class="form-control"  name="password" ng-model="data.newUserValues.password" type="password" required>
						    </div>
						    <div class="form-group row">
						      <label for="confirm_password">{{M.FIELD_CONFIRM_PASSWORD}}</label>
						      <input class="form-control"  name="confirm_password" ng-model="data.newUserValues.confirm_password" type="password" required>
						    </div>
						    <div class="form-group row">
								<textarea ng-model="data.newUserValues.error" type="text" disabled rows="1" style="color:red; background: white; font-size: small; border: 0; width: 100%; resize:none"></textarea>
								<textarea ng-model="data.newUserValues.success" type="text" disabled rows="1" style="color:green; background: white; font-size: small; border: 0; width: 100%; resize:none"></textarea>
						    </div>
					    </div>
				    </form>   
</div>        
        `;

    	
    	Popup.show({
    		title: M.BTN_SET_PASSWORD,
    		buttons: [{
    			text: M.BTN_SAVE,
    			theme: "success",
    			submits: "set-password-form",
    			click: $scope.setPassword
    		}],
			close: function(data){
			    $scope.data.currentOrganization = {};
			    $scope.data.newOrganizationValues = {};
			    $scope.data.newUserValues = {};
			},
    		// body: $('#set-password-form-container').html(),
    		body: body,
    		spinner: true,
    		scope: $scope
    	});
    	

    };    
    
    $scope.setPassword = async function(callback, btn, data) {
		var item = $scope.data.currentOrganization;
		var newItem = data.newUserValues;
		
		if(newItem && newItem.success)	delete newItem.success;
		
			if(!newItem){
	                newItem = { error: "Please fill in the required fields!" };
	                return;
			}
		
        if($rootScope.currentUser.role == 'superadmin'){
            if(newItem.admin_password == null || newItem.admin_password == ""){
                newItem.error = "Super Admin Password is required!";
                return;
            }
            if(newItem.password == null || newItem.password == ""){
                newItem.error = M.PASSWORD_REQUIRED;
                return;
            }
            if(newItem.password != newItem.confirm_password){
                newItem.error = M.PASSWORD_NOT_MATCHING;
                return;
            }
            var url = H.SETTINGS.baseUrl + '/users/set-password';
            newItem.admin_email = $rootScope.currentUser.email;
            newItem.secret = item.secret;
            newItem.email = item.email;

            await $http.post(url, newItem)
                .then(function(r){
                    // $scope.currentOrganization = {};
                    // $scope.newUserValues = {};
                    //$mdDialog.cancel();   
                    //$scope.loading = false;
                    delete newItem.error;
                    newItem.success = "Password changed successfully!";

                },function(e){
                	delete newItem.success;
                    if(e && e.data && e.data.error && e.data.error.status){
                        newItem.error = e.data.error.message ? e.data.error.message : e.data.error.status;    
                    }
                    //$scope.loading = false;
                    //$scope.currentOrganization = {};
                    //$scope.newUserValues = {};
                    //$mdDialog.cancel();   
                });
        }
        
        //if(callback) callback(btn);
    }; 
    

    
    $scope.showActivationDialog = function(ev, item) {
        $scope.data.currentOrganization = item;

        var body=`
<div id="activation-form-container">
				    <form id="activation-form">
					    <div flex="100" class="flex flex-col">
						    <div class="form-group row">
						    	<label for="license" class="active">{{M.FIELD_LICENSE}}:</label>
								<div class="dropdown">
								  <button class="btn btn-default dropdown-toggle" type="button" id="license" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								    {{data.newOrganizationValues.license}}
								  </button>
								  <div class="dropdown-menu" aria-labelledby="license">
								    <a class="dropdown-item" ng-repeat="u in data.plans"  href="" ng-click="data.newOrganizationValues.license = u.id;">{{u.title}}</a>
								  </div>
								</div>
						    </div>
						    <div class="form-group row">
								<label for="validity">{{M.FIELD_VALIDITY}}:</label>
								<datepicker date-format="yyyy-MM-dd">
									 <input type="text" 
											name="validity" 
								        	class="form-control" 
								        	ng-model="data.newOrganizationValues.validity">
								</datepicker>							        
							</div>
						    <div class="form-group row">
								<textarea ng-model="data.newOrganizationValues.error" type="text" disabled rows="1" style="color:red; background: white; font-size: small; border: 0; width: 100%; resize:none"></textarea>
								<textarea ng-model="data.newOrganizationValues.success" type="text" disabled rows="1" style="color:green; background: white; font-size: small; border: 0; width: 100%; resize:none"></textarea>
						    </div>
					    </div>
				    </form>   
</div>        
        `;
        
        var data = { newOrganizationValues: H.deepCopy(item), plans: $scope.data.plans }
        data.newOrganizationValues.validity = H.toMySQLDate(new Date(Date.parse(data.newOrganizationValues.validity)), true);

    	Popup.show({
    		title: M.BTN_ACTIVATE,
    		buttons: [{
    			text: M.BTN_SAVE,
    			theme: "success",
    			submits: "activation-form",
    			click: $scope.activate
    		}],
			close: function(data){
			    $scope.data.currentOrganization = {};
			    $scope.data.newOrganizationValues = {};
			    $scope.data.newUserValues = {};
			},
    		// body: $('#set-password-form-container').html(),
    		body: body,
    		data: data,
    		spinner: true,
    		scope: $scope
    	});
    	        
        
    };
    
    $scope.activate = function(callback, btn, data) {
		var item = $scope.data.currentOrganization;
		var newItem = data.newOrganizationValues;
    	
        if($rootScope.currentUser.role == 'superadmin'){
            //$scope.loading = true;
            var url = H.SETTINGS.baseUrl + '/organizations/activate';
            item.validity = (newItem.validity) ? H.toMySQLDateTime(new Date(newItem.validity)) : item.validity;
            item.license = (newItem.license) ? newItem.license : item.license;
            $http.post(url, item)
                .then(function(r){
                    $scope.refreshData();
                    $scope.data.newOrganizationValues = {};
                    $scope.data.currentOrganization = {};
                    delete newItem.error;
                    newItem.success = "License updated successfully!";
                    //$mdDialog.cancel();   
                    //$scope.loading = false;
                },function(e){
                	delete newItem.success;
                    if(e && e.data && e.data.error && e.data.error.message){
                        if(e.data.error.code == 404){
                            newItem.error =  M.SAAS_API_UNAVAILABLE;
                        } else {
                            newItem.error = e.data.error.message;
                        }
                    }
                    //$scope.newOrganizationValues = {};
                    //$scope.currentOrganization = {};
                    //$mdDialog.cancel();   
                    //$scope.loading = false;
                });
        }
    };
        

    //$scope.data.roles = [{id: 'user', title: 'User'}, {id: 'admin', title: 'Administrator'}];
    
    GLOBALS.methods.autoFocus();
    
});
/*global app*/
app.controller('settingsController', function($scope, $rootScope, $http, $cookies, Alert, H, M, S){
	
	$scope.H = H;
	$scope.M = H.M;
	
	
	$scope.locked = true;
	
	$scope.unlock = function(){
	    $scope.locked = false;
	};

	$scope.lock = function(){
	    $scope.locked = true;
	};

	$scope.forms = {};
	
	$scope.data = {
	    single: JSON.parse(JSON.stringify($rootScope.currentUser.organization))
	};
	
	$scope.reloadData = function(){
		$scope.data.single = JSON.parse(JSON.stringify($rootScope.currentUser.organization));
	}
	
	$scope.save = function(){
		if($rootScope.currentUser.organization.id){
			$http.put(S.baseUrl + '/organizations', $rootScope.currentUser.organization).then(function(r){
				Alert.success("Successfully updated the record!")	
				$rootScope.currentUser.organization = r.data;
				$scope.lock();
			}, function(e){
				Alert.danger("Error updating the record!")	
				$scope.reloadData();
				$scope.lock();
			});
			
		} else {
			Alert.warning("You are not authorized for updating this information!");
			$scope.reloadData();
			$scope.lock();
		}

	}
	
    GLOBALS.methods.autoFocus();

});
/*global app*/
//The name of the controller should be plural that matches with your API, ending with ControllerExtension. 
//Example: your API is http://localhost:8080/api/tasks then the name of the controller is tasksControllerExtension.
//To register this controller, just go to app/config/routes.js and add 'tasks' in 'easyRoutes' or 'autoRoutes' array.
//
//The main difference in 'easyRoutes' and 'autoRoutes' is that 'autoRoutes' generates complete CRUD pages, where as in 'easyRoutes'
//you need to provide templates inside 'app/modules/tasks' folder. If you want to keep your templates somewhere else, you can pick
//'autoRoutes' and then override the templates using setTemplate function.
//Note that for 'autoRoutes', it is not even required to write Controller Extensions unless you want to modify the behaviour.
app.controller('tasksControllerExtension', function($scope, $controller, $rootScope, $http, $location, Popup, H, M) {
    
    $scope.visible = false;
    if($rootScope.currentUser.role=='admin')
    {
    	$scope.visible=true;
    }
    
    //This function is called when you need to make changes to the new single object.
    $scope.onInit = async function(obj){
        //$scope.data.single is available here. 'obj' refers to the same. It is the new instance of your 'tasks' resource that matches the structure of your 'tasks' API.
        obj.is_active = 1;
    };
    
    //This function is called when you are in edit mode. i.e. after a call has returned from one of your API that returns a single object. e.g http://localhost:8080/api/tasks/1
    $scope.onLoad = async function(obj){
        //$scope.data.single is available here. 'obj' refers to the same. It represents the object you are trying to edit.
        
    };
    
    //This function is called when you are in list mode. i.e. before a call has been placed to one of your API that returns a the paginated list of all objects matching your API.
    $scope.beforeLoadAll = async function(query){
        //This is where you can modify your query parameters.    
        //query.is_active = 1;
        //return query;
        if($scope.errMessage)
        {
        	// $route.reload();
        	alert("Select Proper Date");
        	$route.reload();
        }
        query.is_deleted=0;
    };

    //This function is called when you are in list mode. i.e. after a call has returned from one of your API that returns a the paginated list of all objects matching your API.
    $scope.onLoadAll = async function(obj){
        //$scope.data.list is available here. 'obj' refers to the same. It represents the object you are trying to edit.
        
        //You can call $scope.setListHeaders(['column1','column2',...]) in case the auto generated column names are not what you wish to display.
        //or You can call $scope.changeListHeaders('current column name', 'new column name') to change the display text of the headers;
    };
    
    //This function is called before the create (POST) request goes to API
    $scope.beforeSave = async function(obj, next){
        //You can choose not to call next(), thus rejecting the save request. This can be used for extra validations.
    	delete obj.status_id;
    	delete obj.user_story_id;
    	delete obj.priority_id;
    	delete obj.updated_by;
		delete obj.assign_to;
		
        next();
    };

    //This function is called after the create (POST) request is returned from API
    $scope.onSave = async function (obj, next){
        //You can choose not to call next(), thus preventing the page to display the popup that confirms the object has been created.
        next();
    };
    
    //This function is called before the update (PUT) request goes to API
    $scope.beforeUpdate = async function(obj, next){
        //You can choose not to call next(), thus rejecting the update request. This can be used for extra validations.
        next();
    };

    //This function is called after the update (PUT) request is returned from API
    $scope.onUpdate = async function (obj, next){
        //You can choose not to call next(), thus preventing the page to display the popup that confirms the object has been updated.
        next();
    };
    
    //This function will be called whenever there is an error during save/update operations.
    $scope.onError = async function (obj, next){
        //You can choose not to call next(), thus preventing the page to display the popup that confirms there has been an error.
        
        next();
        
    };
    var date = new Date().getDate();
	var month = new Date().getMonth()+1;
	var year = new Date().getFullYear();
	// var pattern = /^([0-9]{2})-([0-9]{2})-([0-9]{4})$/;
	$scope.dtmax  = year+"-"+month+"-"+date+pattern;
	// $scope.dtmax  = date+"-"+month+"-"+year;
	// console.log($scope.dtmax);
	// $scope.data1 = function (initial_date,due_date)
	// 	{
	// 	//	$scope.abcd = initial_date;
	// 		// alert("hello");
 //           $scope.errMessage = '';
 //           if (initial_date > due_date)
 //           {
 //               $scope.errMessage = 'End Date should be greater than start date';
 //               return false;
 //           }
 //       };
  $scope.data1 = function (initial_date, due_date)
		{
			// var pattern = /^([0-9]{2})-([0-9]{2})-([0-9]{4})$/;
			// alert("hello");
            $scope.errMessage = '';
            if (initial_date > due_date )
            {
                $scope.errMessage = 'End Date should be greater than start date';
                return false;
            }
        };
  
  
  
  $scope.a=1
    $scope.remove=function(id){
        var data = {
                is_deleted:$scope.a
        };
        
        $http.put(H.S.baseUrl + '/tasks/' + id,data).then(function(res)
        {
            
                console.log(data);
                $route.reload();
        },
            function(e) {
                alert("... Error:" + e.data.error.message);
            });
    }
  
  
  
  
  
    // If the singular of your title is having different spelling then you can define it as shown below.
    // $scope.getSingularTitle = function(){
    //     return "TASK";
    // }

    // If you want don't want to display certain columns in the list view you can remove them by defining the function below.
    // if($rootScope.currentUser.role == 'user' || $rootScope.currentUser.role == 'admin')
    // {
    $scope.removeListHeaders = function(){
        return ['Is Deleted'];
    }
    //}

    // If you want to refresh the data loaded in grid, you can call the following method
    // $scope.refreshData();
    
    // If you are using autoRoutes, and you want to override any templates, you may use the following function
    // $scope.setTemplate('list-item', 'app/your-path/your-template.html');
    // $scope.setTemplate('single', 'app/your-path/your-template.html');
    
    // list-item.html template uses the 'td' element which will be rendered inside a 'table' & 'tr'. 
    // If you don't like the layout, and you want to replace it with your own, you can use the following method.
    // Note that if you override the 'list-items', then you have to use ng-repeat or any other mechanism to iterate over your data that is available in $scope.data.list.
    // $scope.setTemplate('list-items', 'app/your-path/your-template.html');
    

});
/*global angular, app*/
app.controller('usersControllerExtension', function($scope, $controller, $rootScope, $http, $location, $uibModal, H, M, Popup) {

    if(!(['admin', 'superadmin'].indexOf($rootScope.currentUser.role) > -1)){
        $location.path('unauthorized');
    }

    $scope.onInit = function(){
        //$scope.newSingle(function(){
        $scope.data.single.password = H.getHash('pRESTige');    
        //});
    };
    
    $scope.onLoadAll = function(){
        $scope.setListHeaders(['Username', 'Email', 'Last Lease', 'Role']);
    }
    
    $scope.onLoad = function(){
		$scope.roleLocked = $rootScope.currentUser.organization.email == $scope.data.single.email;
    }
    
    
    $scope.setPassword = async function(callback, btn, data){

			var item = $scope.data.clickedUser;
			var newItem = data.newUserValues;
			if(newItem && newItem.success)	delete newItem.success;
			
			if(!newItem){
	                newItem = { error: "Please fill in the required fields!" };
	                return;
			}

			
	        if(['admin', 'superadmin'].indexOf($rootScope.currentUser.role) > -1){
	        	
	            if(newItem.admin_password == null || newItem.admin_password == ""){
	                newItem.error = M.ADMIN_PASSWORD_REQUIRED;
	                return;
	            }

	            if(newItem.password == null || newItem.password == ""){
	                newItem.error = M.PASSWORD_REQUIRED;
	                return;
	            }

	            if(newItem.password != newItem.confirm_password){
	                newItem.error = M.PASSWORD_NOT_MATCHING;
	                return;
	            }

	            var url = H.SETTINGS.baseUrl + '/users/set-password';
	            newItem.admin_email = $rootScope.currentUser.email;
	            newItem.secret = item.secret;
	            newItem.email = item.email;
	            
	            await $http.post(url, newItem)
	                .then(function(r){
	                    //$scope.data.clickedUser = {};
	                    //$scope.data.newUserValues = {};
	                    
	                    delete newItem.error;
	                    newItem.success = "Password changed successfully!";
	                    
	                    //$uibModalInstance.close('save');
	                    //$scope.loading = false;
	                },function(e){
	                	delete newItem.success;
	                    if(e && e.data && e.data.error && e.data.error.status){
	                        newItem.error = e.data.error.message ? e.data.error.message : e.data.error.status;    
	                    }
	                    //$scope.loading = false;
	                });
	                
			}
			
			//if(callback) callback(btn);
			
			

	}
    
    $scope.showSetPasswordDialog = async function(ev, item) {
    	

    	$scope.data.clickedUser = item;
        $scope.data.newUserValues = {};
        
        var body=`
<div id="set-password-form-container">
				    <form id="set-password-form">
					    <div flex="100" class="flex flex-col">
						    <div class="form-group row">
						      <label for="admin_password">{{M.FIELD_ADMIN_PASSWORD}}</label>
						      <input class="form-control"  name="admin_password" ng-model="data.newUserValues.admin_password" type="password" required>
						    </div>
						    <div class="form-group row">
						      <label for="password">{{M.FIELD_PASSWORD}}</label>
						      <input class="form-control"  name="password" ng-model="data.newUserValues.password" type="password" required>
						    </div>
						    <div class="form-group row">
						      <label for="confirm_password">{{M.FIELD_CONFIRM_PASSWORD}}</label>
						      <input class="form-control"  name="confirm_password" ng-model="data.newUserValues.confirm_password" type="password" required>
						    </div>
						    <div class="form-group row">
								<textarea ng-model="data.newUserValues.error" type="text" disabled rows="1" style="color:red; background: white; font-size: small; border: 0; width: 100%; resize:none"></textarea>
								<textarea ng-model="data.newUserValues.success" type="text" disabled rows="1" style="color:green; background: white; font-size: small; border: 0; width: 100%; resize:none"></textarea>
						    </div>
					    </div>
				    </form>   
</div>        
        `;

    	
    	Popup.show({
    		title: M.BTN_SET_PASSWORD,
    		buttons: [{
    			text: M.BTN_SAVE,
    			theme: "success",
    			submits: "set-password-form",
    			click: $scope.setPassword
    		}],
			close: function(data){
		        	$scope.data.clickedUser = {};
		        	$scope.data.newUserValues = {};
			},
    		// body: $('#set-password-form-container').html(),
    		body: body,
    		spinner: true,
    		scope: $scope
    	});
    	

        
    };
    
    $scope.data.roles = [{id: 'user', title: 'User'}, {id: 'admin', title: 'Administrator'}];

});
