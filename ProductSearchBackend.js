/****
/** create app.get for respective function define te 
/** define the functionliry inside the function
/**  write code for handling query
/**
/**
**/


/*** All the requires here
**/
const express = require('express');
const request = require('request');
const searchEngId = "Your serach engine Id here";
const apiKey = "Your API key here";

const app = express()
var cors = require('cors');
const port = process.env.PORT || 3000;
app.use(cors());
////---------------------------------------------- variable for finding api Call-------------------------------//
const appID = "Your Ebay APP ID here";
var globalid = 'EBAY-US';
var endpoint = 'http://svcs.ebay.com/services/search/FindingService/v1?';
var version = '1.0.0';


////---------------------------------------------- variable for ItemDetail Call-------------------------------//
var s_endpoint = 'http://open.api.ebay.com/shopping';
var m_endpoint = 'http://svcs.ebay.com/MerchandisingService'; 
var s_version = '967';
var siteID = '0';
var responseEncoding = 'JSON';


var googleSearch_end = "https://www.googleapis.com/customsearch/v1?";

app.use(express.static('public'));

app.get('/searchProducts',function(req,res){
	var urlfilter = "";
	var keyw = req.query.keyword;
	if(req.query.Category){
		var safecat = encodeURI(req.query.Category);
	}
	if(req.query.givenZip){
	 var codesafe = encodeURI(req.query.givenZip);	
	}else
	 var codesafe = encodeURI(req.query.hereZip);
	var safequery = encodeURI(keyw);	
	
	
	var filterarray = [];

  	var keysArray = Object.keys(req.query);

  	var conditionval = [];
  	
  	for(var i=0;i<keysArray.length;i++){
          var temp = keysArray[i];
          
          if(temp==="New")
          {	
          	conditionval.push("New");

          }	
          if(temp=="Used"){
          	conditionval.push("Used");
          	
          }
          if(temp==="Unspecified"){
          	conditionval.push("Unspecified");
          	
          }

          if(temp==="FreeShippingOnly"){
          	var temp2 = {"name":"FreeShippingOnly",
  					 "value": "true",
  					  "paramName":"",
  					  "paramValue":""

  					}

			filterarray.push(temp2);
          }



          if(temp==="LocalPickupOnly"){
          	var temp2 = {"name":"LocalPickupOnly",
  					 "value": "true",
  					  "paramName":"",
  					  "paramValue":""

  					}

			filterarray.push(temp2);
          }

          if(temp==="dist"){

          	var temp2 = {"name":"MaxDistance",
  					 "value": req.query.dist,
  					  "paramName":"",
  					  "paramValue":""

  					}

			filterarray.push(temp2);

          }


  	}
  	

  	if(conditionval.length>0){

  		var temp = {"name":"Condition",
  					 "value":conditionval,
  					  "paramName":"",
  					  "paramValue":""

  					}

			filterarray.push(temp);


  	}

		function  buildURLArray() {
		  
		  for(var i=0; i<filterarray.length; i++) {
		   
		    var itemfilter = filterarray[i];
		    
		    for(var index in itemfilter) {
		     
		      if (itemfilter[index] !== "") {
		        if (itemfilter[index] instanceof Array) {
		          for(var r=0; r<itemfilter[index].length; r++) {
		          var value = itemfilter[index][r];
		          urlfilter += "&itemFilter\(" + i + "\)." + index + "\(" + r + "\)=" + value ;
		          }
		        }
		        else {
		          urlfilter += "&itemFilter\(" + i + "\)." + index + "=" + itemfilter[index];
		        }
		      }
		    }
		  }
		}
    buildURLArray();


    urlfilter += "&outputSelector\(" + 0 + "\)" + "=" + "SellerInfo";
    urlfilter += "&outputSelector\(" + 1 + "\)" + "=" + "StoreInfo";


	var apicall = endpoint;
		apicall += "OPERATION-NAME=findItemsAdvanced";
        apicall += "&SERVICE-VERSION="+version;
		apicall += "&SECURITY-APPNAME="+appID;
		apicall += "&GLOBAL-ID="+globalid;
		apicall += "&keywords="+safequery;
		if(codesafe){
			apicall+="&buyerPostalCode="+codesafe;
		}
		if(safecat){
			apicall+="&categoryId="+safecat;
		}
	    apicall += "&paginationInput.entriesPerPage=50";
		apicall += urlfilter;
		apicall += "&RESPONSE-DATA-FORMAT="+responseEncoding;
		console.log(apicall);
		var results= "";

		request(apicall, { json: true }, (err, response, body) => {
		  if (err) { return console.log(err); }
	 
		 	results =body;
		 	var jsonObjFull = results;
		 
		 	var intermediateJSON = jsonObjFull.findItemsAdvancedResponse[0];
		 	// error handling in case of error from ebay API
		 	if(intermediateJSON.ack[0]=="Failure"){
		 		console.log("i am  in failure");
      			var errortext = intermediateJSON.errorMessage[0].error[0].message[0];
      			var respCreated = {"type":"Failure",
		 						   "results": errortext
		  						  };
      			res.send(respCreated);
    		}else{
			 	var modifiedJSON = createJSON(jsonObjFull);
			 	if(modifiedJSON.length==0){
			 		var errortext="No records found";
			 		var respCreated = {"type":"Failure",
			 						   "results": errortext
			  						  };
	      			res.send(respCreated);
			 	}else{

				 	var respCreated = {"type":"Success",
				 						"results":modifiedJSON
				  	};
				 	res.send(respCreated);
			 }
		 }
		 	
		});

	function createJSON(jsonObjFull){
		var jsonObj = jsonObjFull.findItemsAdvancedResponse[0].searchResult[0];
		var resJSONArr=[];
		if(jsonObj){
			var rowData = jsonObj.item;
			if(rowData){
			for(var j=0;j<rowData.length;j++){
				var indexTxt="N/A";
				var itmID="N/A";
				var imageTxt="N/A";
				var titleTxt="N/A";
				var priceTxt="N/A";
				var shipTxt="N/A";
				var zipTxt ="N/A";
				var sellerTxt="N/A";

				var rowObj = rowData[j];
				indexTxt=j+1;

				itmID= rowObj.itemId;
				if(rowObj.galleryURL){
					imageTxt=rowObj.galleryURL[0];
				}
				if(rowObj.title)
					titleTxt = rowObj.title[0];
				if(rowObj.sellingStatus){
		                if(rowObj.sellingStatus[0].currentPrice)
		                  priceTxt =  "$"+rowObj.sellingStatus[0].currentPrice[0].__value__ ;
		          }

		      	if(rowObj.postalCode){
		      		zipTxt=rowObj.postalCode[0];
		      	}

		      	if(rowObj.shippingInfo){
		              var tempShip =  rowObj.shippingInfo[0].shippingServiceCost;//shippingInfo.shippingType;
		              if(tempShip){
		                if(tempShip[0].__value__ != "0.0")
		                  shipTxt= "$" + tempShip[0].__value__ ;
		                else
		                  shipTxt = "Free Shipping";

		              }          
		      	}

		      	if(rowObj.sellerInfo){
		      		if(rowObj.sellerInfo[0].sellerUserName){
		      			sellerTxt=rowObj.sellerInfo[0].sellerUserName[0];
		      		}
		      	}

			      var tempJSON = {
			      				 "index": indexTxt,
			  					 "image":imageTxt,
			  					  "title":titleTxt,
			  					  "itemid": itmID,
			  					  "shipping":shipTxt,
			  					  "price":priceTxt,
			  					  "zip":zipTxt,
			  					  "seller":sellerTxt,
			  					  "sellerInfo": rowObj.sellerInfo,
			  					  "shippingInfo":rowObj.shippingInfo

			  					}

			  		resJSONArr.push(tempJSON);

				}

			}

		}

				return resJSONArr;

			}


});
app.get('/getSimilarItems/:id',function(req,rest){


	var itemID = req.params.id;
	var apicallSim = m_endpoint+"?OPERATION-NAME=getSimilarItems"
       +"&SERVICE-VERSION=1.1.0"
       + "&CONSUMER-ID="+appID
       + "&itemId="+itemID
       + "&maxResults=20"  
       + "&RESPONSE-DATA-FORMAT="+responseEncoding;
	var simResults= "";
	console.log("apicall printinh--------");
	request(apicallSim, (err, response, body) => {
	  if (err) { return console.log(err); }
 
	 	simResults =body;
	 	console.log("printing responde--------");	
	 	rest.send(simResults);
		

	});



});

app.get('/getZipCodes/:startingchar',function(req,res){

var zipstart = req.params.startingchar;
var zipcodeapicall = "http://api.geonames.org/postalCodeSearchJSON?postalcode_startsWith="+zipstart+"&username=pankhurirastogi&country=US&maxRows=5";

request(zipcodeapicall, { json: true }, (err, response, body) => {
	  if (err) { return console.log(err); }
 
	 	results =body;
	 	res.send(results);
		

	});



});


app.get('/getItemDetail/:id',function(req,res){

	var itemID = req.params.id;
	var apiItmcall = s_endpoint+"?callname=GetSingleItem"
					 + "&version="+s_version
					 + "&siteid="+siteID
					 + "&appid="+appID
					 + "&ItemID="+itemID
			         +"&IncludeSelector=Description,Details,ItemSpecifics" 
			         +"&responseencoding="+responseEncoding;
	var results= "";
	console.log(apiItmcall);
	request(apiItmcall, { json: true }, (err, response, body) => {
	  if (err) { return console.log(err); }
 
	 	results =body;
	 	res.send(results);
		

	});



});

app.get('/getImages/:title',function(req,res){

	var imgTitle = encodeURI(req.params.title);
	var imgPhotosCall = googleSearch_end
					 + "key="+apiKey
					 + "&cx="+searchEngId
					 + "&q="+imgTitle
					 + "&searchType=image"
					 + "&imgType=news"
			         +"&imageSize=medium"   // need Details to get MyWorld info
			         +"&num=8";
	var imgResults= "";
	request(imgPhotosCall, { json: true }, (err, response, body) => {
	  if (err) { return console.log(err); }
 
	 	imgResults =body;
	 	res.send(imgResults);
		

	});



});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));