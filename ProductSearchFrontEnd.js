var app = angular.module("ProductSearchApp",['ngMaterial', 'ngAria', 'ngAnimate','ui.bootstrap','angular-svg-round-progressbar'])
app.controller("SearchController",['$scope','$http', '$timeout',function($scope,$http,$timeout){

  $scope.hereZip="";
  $scope.selectedItem="";
  $scope.selectedItemTitle="";
  $scope.showProgressBar=false;
  $scope.showItmProgressBar=false;
  $scope.showBackProgressBar=false;
  $scope.upperLimit=0;
  $scope.colorr="yellow";
  $scope.currentPage=1;
  $scope.wishListArray = [];
  $scope.itemClickedDis = true;
  $scope.displayContent='Results'
  $scope.NaveTarget="";
  $scope.selectedItmObj="";
  $scope.animateProgHide=true;

//----------------------------------- validation  of keyword and zip code -----------------------------//
  $scope.checkKeyword = function(){
    console.log("i have been pressed");
    console.log($scope.keyword);
    if(!$scope.keyword)
      $scope.invalidKeyword=true;
    else
      $scope.invalidKeyword=false;
    console.log($scope.invalidKeyword);

  }
  $scope.checkZip = function(searchText){
       if($scope.loc=="given"){
          if(searchText==" "){
            $scope.invalidZipCode=true;
          }else{
            if(searchText.length!=5){
              $scope.invalidZipCode=true;
            }else{
              if(!(/^\d+$/.test(searchText))){
                   $scope.invalidZipCode=true;
                 }else{
                   $scope.invalidZipCode=false;
                   $scope.givenZip=searchText;
                 }
            }
          }
        }else{
          $scope.invalidZipCode=false;
        }

    console.log($scope.invalidZipCode);

  }

  //===========================================event handler for change of radio buttons =======================//

  $scope.handleRadioChnageHere = function(){
    $scope.invalidZipCode=false;
  }


  $scope.handleRadioChange = function(){
    console.log("I am from given change");
    console.log($scope.loc);
  }

  $scope.tellData = function(){
    console.log($scope.keyword);
    console.log($scope.Category);
    console.log($scope.New);
    console.log($scope.loc);
    console.log($scope.hereZip);
    console.log($scope.givenZip);
  }


  $scope.checkIfPartOfWishlist = function(productId){
   
    if(localStorage.getItem("wishlistarr")){
      var arr = JSON.parse(localStorage.getItem("wishlistarr"));
     return arr.some(item => item.itemid[0] === productId);
     

    }

    return false;

  }

  $scope.extractDaysLeft= function(daysLeftRaw){
    var resIndex = daysLeftRaw.indexOf('D');
    return daysLeftRaw.substring(1, resIndex);

  }

   $scope.shareOnFacebook= function(){
      
      var stringToShare = "Buy"+$scope.selectedItemTitle + " at " + "$" + $scope.itemData.CurrentPrice.Value;
      var linkToShare = $scope.itemData.ViewItemURLForNaturalSearch;

      FB.ui({
      method: 'share',
      display: 'popup',
      quote: stringToShare,
      href: linkToShare,
    }, function(response){});

  }

  $scope.getTotalShoppingPrice= function(){
    if(localStorage.getItem("wishlistarr")){
      var arr = JSON.parse(localStorage.getItem("wishlistarr"));
      var sum =0.0;
      for(var i=0;i<arr.length;i++){
        sum+= parseFloat(arr[i].price.substring(1,arr[0].price.length))
      }
     return "$"+sum;
     

    }

  }

  $scope.addToWishList = function(x){

     // debugger;
    console.log($scope.wishListArray);

      $scope.wishListArray.push(x);
      if (typeof(Storage) !== "undefined"){

        console.log("printing inside");
         if(localStorage.getItem("wishlistarr")){
           $scope.displayWishArr = JSON.parse(localStorage.getItem("wishlistarr"));
           if($scope.displayWishArr){
            $scope.displayWishArr.push(x);
            localStorage.setItem("wishlistarr",JSON.stringify($scope.displayWishArr));
          }
      }else{
            localStorage.setItem("wishlistarr",JSON.stringify($scope.wishListArray));
      }

    }

  }

  $scope.displayWishList = function(){
        $scope.displayContent='WishList';
        if(localStorage.getItem("wishlistarr")){
        $scope.displayWishArr = JSON.parse(localStorage.getItem("wishlistarr"));


      }

  }

  $scope.removFrmWishList=function(x){
   var delItmId = x.itemid[0];
    console.log(x.itemid[0]); 
    console.log("before removing");
    console.log($scope.displayWishArr);
     if(localStorage.getItem("wishlistarr")){
        $scope.displayWishArr = JSON.parse(localStorage. getItem("wishlistarr"));
        $scope.displayWishArr= $scope.displayWishArr.filter(function( obj ) {

            console.log(obj.itemid[0]);
            return obj.itemid[0] != delItmId;
        });
        localStorage.setItem("wishlistarr",JSON.stringify($scope.displayWishArr));
       


      }
  }
  $scope.navigatetoItemDetails= function(){

    $scope.displayContent="itemResults";
    $scope.showContent="itemDetail";

  }

  $scope.getRequest = function(x,currentContent) {
    $('[data-toggle=tooltip]').tooltip('hide');
    console.log("this call is coming from");
    console.log(currentContent);
    $scope.animateProgHide=false;
    $scope.showItmProgressBar=true;
    $scope.NaveTarget=currentContent;
    $scope.selectedItem=x.itemid[0];
    $scope.selectedItmObj = x;
    $scope.showContent="itemDetail";
    if(currentContent=='Results')
      $scope.itemClickedDis = false;
    else
      $scope.itemWishClickedDis = false;
   
    $scope.selectedItemTitle = x.title;
    setupShippingDetails(x);
    console.log(x.itemid[0]);


    $http.get("/getItemDetail/"+x.itemid[0]).then(
      function successCallback(response) {
        
        var jsonItmObj = response.data;
        $scope.itemresp = response.data;
        if(response.data){
          if(jsonItmObj.Ack === "Failure"){
            console.log("i am here in this item failure");
            $scope.showItmProgressBar=false;
            $scope.animateProgHide=true;
            $scope.invalidItemErr = true;
            $scope.invalidItmErrMsg = jsonItmObj.Errors[0].LongMessage;
            $scope.displayContent = "itemResults";

          }else{
            $scope.itemData = response.data.Item;
            $scope.pictureURLArray = $scope.itemData.PictureURL;


            $timeout( function(){

                         $scope.showItmProgressBar=false;
                         $scope.animateProgHide=true;
                    }, 200 );
             $timeout( function(){
                         $scope.displayContent = "itemResults";
                    }, 400 );
            
          }
        }
      },
      function errorCallback(response) {
        console.log("Unable to perform get request");
      }
      );
  };

  $scope.getZipCodeSuggestions =function(srchtxt) {
      var getzipurl = "/getZipCodes/"+srchtxt;
      $http.get(getzipurl).then(
        function successCallback(response) {
          $scope.zipcodeitems = response.data;
          console.log( $scope.zipcodeitems.postalCodes);
          return $scope.zipcodeitems.postalCodes;
          
        },
        function errorCallback(response) {
          console.log("Unable to perform get request");
        }
        );

  }

  $scope.editURL=function(unformattedURL){
    if(unformattedURL){
      if(unformattedURL.length>35){

        if(unformattedURL.charAt(34)===' '){
          return unformattedURL.substring(0,34)+"...";

        }else{
          var lastWhitespace = unformattedURL.substring(0,34).lastIndexOf(' ');
          return unformattedURL.substring(0,lastWhitespace)+"...";

        }
      }else
      return unformattedURL
    }

  }
//========================================= code for calling similar items api -=================================//
  $scope.getSimilarItems = function() {

    $http.get("/getSimilarItems/"+$scope.selectedItem).then(
      function successCallback(response) {
        console.log(response.data.getSimilarItemsResponse);
        console.log(response.data.getSimilarItemsResponse);

        if(response.data.getSimilarItemsResponse){
          if(response.data.getSimilarItemsResponse.ack === "Failure"){
            console.log("i am in sim itm failure");
            $scope.simItmErr = true;
            $scope.simItmErrMsg = "No Similar Items found";

          }else{
           console.log("In success");
           console.log(response.data.getSimilarItemsResponse);
           if(response.data.getSimilarItemsResponse.itemRecommendations.item.length==0){

             $scope.simItmErr = true;
             $scope.simItmErrMsg = "No Similar Items found";
           }else{
           $scope.simItmRes = response.data.getSimilarItemsResponse;
           $scope.simItmRes.itemRecommendations.item = simRespJson($scope.simItmRes.itemRecommendations.item);
         }
           
          }
        }



      },
      function errorCallback(response) {
        console.log("Unable to perform get request");
      }
      );
  };


   $scope.querySearch = function(srchtxt) {

        return $http.get("/getZipCodes/" + srchtxt)
         .then(function(response) {

            var srchResul=[];

            try{
                for(var i=0;i<response.data.postalCodes.length;i++)
                   {
                       srchResul.push(response.data.postalCodes[i].postalCode);
                   }
            }
            catch(err)
                {

                }
           return srchResul;
         });
     }

  //------------------------------------------function for getting photos------------------------------------//
  $scope.getPhotos = function() {

   // console.log($scope.selectedItem);
   console.log($scope.selectedItemTitle);
   console.log("I am in getPhotos");

    $http.get("/getImages/"+$scope.selectedItemTitle).then(
      function successCallback(response) {
      $scope.ItmPhotos = $scope.matrixList(response.data.items,3);
      },
      function errorCallback(response) {
        console.log("Unable to perform get request");
      }
      );
  };

  $scope.navigateBack = function(){
  
   
    $scope.displayContent= $scope.NaveTarget; 
     $scope.showBackProgressBar = true; 
    $timeout( function(){

             $scope.showContent='products';  
             $scope.showBackProgressBar = false;
        }, 300 );

   
  }



//--------------------------------------------method for sending data to node for calling ebay API------------------------------------//
$scope.sendData =function() {


  console.log("I've been pressed!");
  $scope.showContent="products";
  $scope.displayContent='Results';
  $scope.showProgressBar=true;
  $http.get("/searchProducts"+getStringQuery()).then(
    function successCallback(response) {
      console.log("i am in response");
      console.log(response);
      if(response.data.type=="Success"){
        $scope.response = response.data.results;
        $scope.upperLimit=response.data.results.length;
      }else{
        $scope.prodErr= response.data.results;
      }

     // $scope.response = response.data;
      $scope.showProgressBar=false;
      
      console.log($scope.response);
     

    },
    function errorCallback(response) {
      console.log("Unable to perform get request");
    }
    );

  }

  $scope.matrixList = function(data, n) {
        var grid = [], i = 0, x = data.length, col, row = -1;
        for (var i = 0; i < x; i++) {
            col = i % n;
            if (col === 0) {
                grid[++row] = [];
            }
            grid[row][col] = data[i];
        }
        console.log(grid);
        return grid;
  };

$scope.onSubmit =function() {
   console.log($scope);

  }

//==================================================== reset method called for clearing and reseting the form===================//
  $scope.reset = function(){
    newForm();
    $scope.response=null;
    $scope.itemresp=null;
    $scope.prodErr=null;
    $scope.simItmErr=null;
    $scope.simItmRes = null;


  }



//----------------------------------------------can be used for ressetting the form to initial-----------------------------------------//
  var newForm = function() {
    $scope.keyword = "";
    $scope.Category ="";
    $scope.New = false;
    $scope.Used = false;
    $scope.Unspecified = false;
    $scope.FreeShippingOnly= false;
    $scope.LocalPickupOnly = false;
    $scope.loc="curr";
    $scope.dist = "10";
    $scope.givenZip="";
    $scope.invalidKeyword=false;
    $scope.invalidZipCode=false;
    $scope.wishListArray= [];
    $scope.itemClickedDis=true;
    $scope.itemWishClickedDis = true;
    $scope.selectedItem="";
    $scope.orderSelect="";
    //localStorage.clear(); //clearing local storage
    getLocation();
    
  }
  function loadJSON (url) {

      var xmlhttp = new XMLHttpRequest();
      xmlhttp.open("GET", url ,false); 
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 ) {
          if (xmlhttp.status == "200")
            jsonDoc=xmlhttp.responseText;
          else{
            jsonDoc="";

          }
        }
      };
      xmlhttp.send(); 

      return jsonDoc;
  }

  function getLocation(){
    jsonDoc=loadJSON("http://ip-api.com/json");
        if(jsonDoc!=""){
          document.getElementById("sub").disabled=false;
          locJSONObj =  JSON.parse (jsonDoc);
          $scope.hereZip = locJSONObj.zip;
        }
      
  }

//===========================================function for forming query string for calling node api=================================
function getStringQuery(){

    var strQuery = "";
    strQuery="?keyword="+$scope.keyword;
    strQuery+="&Category="+$scope.Category;
    if($scope.loc=="curr")
    strQuery+="&hereZip="+$scope.hereZip;
    else
    strQuery+="&givenZip="+$scope.givenZip;  
    if($scope.New)
    strQuery+="&New="+$scope.New;
    if($scope.Used)
    strQuery+="&Used="+$scope.Used;
    if($scope.Unspecified)
    strQuery+="&Unspecified="+$scope.Unspecified; 
    if($scope.FreeShippingOnly){
     strQuery+="&FreeShippingOnly="+$scope.FreeShippingOnly;  
    }
    if($scope.LocalPickupOnly){
     strQuery+="&LocalPickupOnly="+$scope.LocalPickupOnly;  
    }
    strQuery+="&dist="+$scope.dist;

    return strQuery;
}

function setupShippingDetails(x){
  console.log("printing shipping info");
  console.log(x);
  console.log(x.shippingInfo);
  $scope.shippingDetails= x.shippingInfo[0];

}

//------------------------------------------ function for modifying the similar item json Array------------------------//


function simRespJson(rawJSONArray){
  var processesJSON = [];
  for(var i=0;i<rawJSONArray.length;i++){
    var rawJSONObj = rawJSONArray[i];
    var tempJSON ={
      "title" : rawJSONObj.title ,
      "imageURL" : rawJSONObj.imageURL,
      "viewItemURL": rawJSONObj.viewItemURL,
      "price": parseFloat(rawJSONObj.buyItNowPrice.__value__) ,
      "shippingcost": parseFloat(rawJSONObj.shippingCost.__value__) ,
      "timeLeft": parseInt($scope.extractDaysLeft(rawJSONObj.timeLeft)) 

    }
    processesJSON.push(tempJSON);

  }
  return processesJSON;

}


newForm();

}])