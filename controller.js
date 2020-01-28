var app=angular.module("mainApp", ["ngRoute", "ngCookies"]);
	app.config(function($routeProvider)
	{
		$routeProvider
		.when("/home",{
      templateUrl : "home.html"
    })
    .when('/login',{
      // controller : 'login1',
      templateUrl : 'blog.html',
      hideMenus : true
    })
    .when("/app",{
			templateUrl : "App.html"
		})
		.when("/blog",{
      controller: 'main',
			templateUrl : "blog.html"
		})
		.when("/about",{
			 templateUrl : "about.html"
		});
	});



   app.run(function($rootScope, $location, $cookieStore, $http) {
 // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; 
        }
 
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
            if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
                $location.path('/login');
            }
        });
   });

  
  app.controller("display",function($scope,$http,$route,$interval)
{
  $http.get("http://localhost:80/pRESTige-master/pRESTige-master/api/blogdata?api_key=632faeca-ef12-4d45-aecd-56ad35212953").then(

    function mySuccess(response)
    {
      $scope.response = response;
      console.log($scope.response.data);
    // $interval(5000);  
    },
    function myError(response)
    {
      // $scope.response = response.statusText;
    }

  );
  $scope.deletedata=function(id)
  {
     
    $http.delete("http://localhost:80/pRESTige-master/pRESTige-master/api/blogdata/"+id+"?api_key=ec24f475-cb0d-41ad-a0d7-7c9d2b177678").then(
    function successCallback(response)
    {
      // $interval(function(){$scope.success=false;},5000);
        $route.reload();
      //window.location.reload();
     alert("success");
    
     // $location.path('/blog');
    },
    function errorCallback(response){
      console.log("unsuccsess");
    }   
    );   
  }

 $scope.editdata=function(id)
  {
    $http.get("http://localhost:80/pRESTige-master/pRESTige-master/api/blogdata/"+id+"?api_key=632faeca-ef12-4d45-aecd-56ad35212953").then(
    function successCallback(response)
    {
        $scope.response=response;

console.log($scope.response.data);
        $scope.title1=$scope.response.data.title;
        $scope.description1=$scope.response.data.description;
        // console.log($scope.response.data);
        var model=document.getElementById("editmodel");
        model.style.display="block";

        var bttn=document.getElementById("bttn");
        bttn.onclick=function()
        {
          var model=document.getElementById("editmodel");
          model.style.display="none";
          window.location.reload();
        }
        var btnn = document.getElementById("editBtn");
        btnn.onclick=function()
        {
          var model = document.getElementById("editmodel");
          model.style.display="none";
          //window.location.reload();
          $route.reload();
        }
    },

    function errorCallback(response)
    {
      console.log("unsuccsess");
    }    
    );  
  }
   $scope.updatedata=function(id)
  {
    var data={
      title:$scope.title,
      description:$scope.description
    }
    // data.val();
    $http.put("http://localhost:80/pRESTige-master/pRESTige-master/api/blogdata/"+id+"?api_key=ec24f475-cb0d-41ad-a0d7-7c9d2b177678",data).then(
    function successCallback(response)
    {
        $scope.response=response;
        console.log($scope.response.data);
        // var model=document.getElementById("myeditmodel");
        // model.style.display="block";
        // window.location.reload();
        $route.reload();
           },

    function errorCallback(response)
    {
      console.log("unsuccsess");
    }    
    );  
  } 
});

 app.controller("login1",function($scope,$http,$location)
 {
     $scope.login = function(){
               
                // alert($scope.user);
                  var data={
                     email : $scope.user,
                    password : $scope.pass
                    }

$http.post("http://localhost:80/pRESTige-master/pRESTige-master/api/users/login?api_key=d8e80041-5f0a-4090-a284-01fbf0277aa0",data).then(

        function successCallback(response)
            {

                  $scope.response = response;
                  // console.log($scope.response.data.email);
                  console.log($scope.response.data.token);
                  // console.log(response.data);
                  // if($scope.response.data != 0)
                  // {
                  //       $rootScope.loggedIn = true;
                      // sessionStorage.setItem("email",data.email);


                      $location.path('/blog'); 
                  // }
                  // else
                  // {
                  //   alert("Login failed");
                    
                  // }
            },
        function errorCallback(response) 
            {
              console.log("POST-ing of data failed");
            }

            );
      }

});
//     $scope.login=function(){
//       // alert($scope.username);

//       var data={
//       email:$scope.user,
//       password:$scope.pass
//     }
//     console.log(data);
//     // alert(data.email);
//     // alert(data.password);
//         // console.log(username);
// $http.post("http://localhost:80/pRESTige-master/pRESTige-master/api/users/login?api_key=04d410b3-707d-4d17-8e4e-842aea78cd43",data).then(
      
//          function successCallback(response)
//          {
//           $scope.response=response
//           ;
//           console.log($scope.response.data.token);
//           $location.path('/blog');
          
//          }, 
//          function errorCallback(response)
//          {
//           console.log("wrong");
//          }
//         );
//       // console.log($scope.email,$scope.password);
// }
//  }); 
app.controller("insert",function($scope,$http,$route)
{
  $scope.AddData = function(){

      var data = {

                title:$scope.title,
                description: $scope.description
      }
   $http.post("http://localhost:80/pRESTige-master/pRESTige-master/api/blogdata?api_key=ec24f475-cb0d-41ad-a0d7-7c9d2b177678",data).then(
    function successCallback(response) {
  var modal = document.getElementById("myModal");
  modal.style.display="none";
  $route.reload();   

    console.log("success");
    },
    function errorCallback(response){
      console.log("unsuccsess");
    }   
    );
}

});


var modal = document.getElementById("myModal");
var btn = document.getElementById("myBtn");


app.controller("main",function($scope){

$scope.open = function() 
{
  var modal = document.getElementById("myModal");

  modal.style.display = "block";
}
var btn = document.getElementById("myBtn");
btn.onclick=function()
{
  var modal = document.getElementById("myModal");
  modal.style.display="none";
}
window.onclick = function(event)
 {
var modal = document.getElementById("myModal");

  if (event.target == modal) {
    modal.style.display = "none";
  }
}
});

 
