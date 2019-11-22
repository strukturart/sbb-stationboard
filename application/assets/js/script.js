
$(document).ready(function() 
 {


	//Global Vars
	var windowOpen = false;
	var i = 0;
	var z = -1;
	var finderNav_tabindex = -1;
	var app_list_filter_arr = [];
	var list_all = false;
	var debug = true;
	var page = 0;
	var pos_focus = 0
	var selected_stationuages = [];
	var dir_level = 0;
	var window_stat;
	var items = 0;
	var selected_station;
	var stationId;
	var now;

	var station;
	var arrival_depateur;
	

	var request_url;

	var current_lng = 0;
	var current_lat = 0;

	var last_selected_station;




/////////////////////////////////////
//////////////////////////////////////


function showStationList()
{
	$("div#page-station-list").css("display","block")
	$("div#page-results").css("display","none")
	window_stat = "station-list"
	pos_focus = 0;
	$("form input#station-list").focus()
	$("form input#station-list").val("")
	 $("div#page-station-list div#bottom-bar").css("display","none")

}

function showResults()
{
	$("div#page-station-list").css("display","none")
	$("div#page-results").css("display","block")
	window_stat = "results"
	pos_focus = 0;
}



showStationList()






    var ac_selected_station = $('#station-list').autocomplete({
    serviceUrl: "http://transport.opendata.ch/v1/locations",
    minChars:1,
    showNoSuggestionNotice: true,
    paramName: 'query',
    transformResult: function(response) {
            var obj = $.parseJSON(response);
            return {
                    suggestions: $.map(obj.stations, function(dataItem) {
                        return{ value: dataItem.name, data: dataItem.id };
                       
                    })
                }
            
 
    },
    onSearchStart: function()
    {
    	//alert("search start")
    	
    },
    onSearchError: function (query, jqXHR, textStatus, errorThrown) 
    {
    	//alert("error: "+jqXHR)
    },
    onSelect: function (suggestion) {
      station = suggestion.value;
      stationId = suggestion.data;
      $("div#page-station-list div#bottom-bar").css("display","block")
      window_stat = "question"


    }


  
})
    




		
	







function set_tabindex()
{
		items = $('div#finder ul > li').length-1;
		for(var i =0; i < items; i++)
		{
			$(items[i]).attr('tabindex',i) 
			pos_focus = 0
			$('div#finder ul').find('li[tabindex=0]').focus();
		}

}




////////////////////////
//NAVIGATION
/////////////////////////



	function nav (move) {

		if(window_stat == "results")
		{

			if(move == "+1")
			{
				pos_focus++


				if(pos_focus <= items)
				{

					$('article[tabindex='+pos_focus+']').focus()
					
	   
				    $('html, body').animate({
				        scrollTop: $(':focus').offset().top + 'px'
				    }, 'fast');

				}	

				if(pos_focus > items)
				{
					pos_focus = 0;
					$('article[tabindex=0]').focus()
				}


			}

			if(move == "-1")
			{
				pos_focus--
				if( pos_focus >= 0)
				{
					
					$('article[tabindex='+pos_focus+']').focus()

					$('html, body').animate({
					scrollTop: $(':focus').offset().top + 'px'
					}, 'fast');

				}

				if(pos_focus == -1)
				{
					pos_focus = items;
					
					$('article[tabindex='+pos_focus+']').focus()

				}
			}
		}

	}





///////////////////
//AJAX REQUESTS///
/////////////////


function sendRequest_xml(param_station,param_arrdep)
{
	now = moment().format("YYYY-MM-DDTHH:mm:ss")
	request_url = "https://api.opentransportdata.swiss/trias?StopPointRef="+param_station+"&StopEventType="+param_arrdep
	var xhttp = new XMLHttpRequest({ mozSystem: true });

	xhttp.open('POST',request_url,true);
	xhttp.setRequestHeader("Authorization", "57c5dbbbf1fe4d0001000018567e98dee1574be2af76ddad8a0b78ff");
	xhttp.setRequestHeader("Content-Type", "application/xml");
	xhttp.withCredentials = true;

	xhttp.onload = function () 
	{
		
		if (xhttp.readyState === xhttp.DONE && xhttp.status === 200) 
		{
			//alert("status: "+xhttp.status);

			var data = xhttp.response;
			var xml = $.parseXML(data);
			showResults()
			var article 
			window_stat = "results"

			//alert($xml.length)
			$("div#result").empty()
		
  			 $(xml).find('StopEventResult').each(function(index){
  			 	var arrivalTime = $(this).find('ServiceArrival').children(":first").text();
  			 	var departureTime = $(this).find('ServiceDeparture').children(":first").text();
  			 	var bay = $(this).find('PlannedBay').children(":first").text();
  			 	var article;
  			 	if(param_arrdep == "arrival")
  			 	{
  			 		var station = $(this).find('OriginText').children(":first").text();
            		article = "<article  tabindex="+index+"><h1>"+station+"</h1><h1>"+moment.utc(arrivalTime).local().format("DD.MM.YYYY, HH:mm")+"</h1><h1>"+bay+"</h1></article>"
            	}

            	 if(param_arrdep == "departure")
  			 	{
  			 		var station = $(this).find('DestinationText').children(":first").text();
            		article = "<article  tabindex="+index+"><h1>"+station+"</h1><h1>"+moment.utc(departureTime).local().format("DD.MM.YYYY, HH:mm")+"</h1><h1>"+bay+"</h1></article>"
            	}

            	$("div#result").append(article);
				$('div#page-results div#result').find("article:first").focus()


				items = $("div#result article").length-1
				pos_focus = 0
           
        });

			
		}
	}

			

	if (xhttp.status === 404) 
	{
		alert("Url not found");
	}

	////Redirection
	if (xhttp.status === 301) 
	{
		alert("redirection");
	}

	



	xhttp.onerror = function () 
	{

		alert("status: "+xhttp.status);
		
	};

		var xmlbody ='\
	<?xml version="1.0" encoding="UTF-8"?>\
<Trias version="1.1" xmlns="http://www.vdv.de/trias" xmlns:siri="http://www.siri.org.uk/siri" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\
    <ServiceRequest>\
        <siri:RequestTimestamp>2016-06-27T13:34:00</siri:RequestTimestamp>\
        <siri:RequestorRef>EPSa</siri:RequestorRef>\
        <RequestPayload>\
            <StopEventRequest>\
                <Location>\
                    <LocationRef>\
                        <StopPointRef>'+stationId+'</StopPointRef>\
                    </LocationRef>\
                    <DepArrTime>'+now+'</DepArrTime>\
                </Location>\
                <Params>\
                    <NumberOfResults>20</NumberOfResults>\
                    <StopEventType>'+param_arrdep+'</StopEventType>\
                    <IncludePreviousCalls>false</IncludePreviousCalls>\
                    <IncludeOnwardCalls>false</IncludeOnwardCalls>\
                    <IncludeRealtimeData>false</IncludeRealtimeData>\
                </Params>\
            </StopEventRequest>\
        </RequestPayload>\
    </ServiceRequest>\
</Trias>'

	xhttp.send(xmlbody)
}






//////////////////////////
////KEYPAD TRIGGER////////////
/////////////////////////
function handleKeyDown(evt) 

{	

	switch (evt.key) 
	{
		case 'Enter':
			

			
			evt.preventDefault();

		break;

		case 'Backspace':
			window.close()
		break; 

		case 'SoftLeft':
			
			if(window_stat == "question")
			{
				sendRequest_xml(stationId,"arrival")
			}
			if(window_stat == "results")
			{
				showStationList()
			}			
		break; 

		case 'SoftRight':
			
			if(window_stat == "question")
			{
				//sendRequest(station,"depature")
				sendRequest_xml(stationId,"departure")

			}
		
		break; 
		
		case 'ArrowDown':
			nav("+1")
		break; 

		case 'ArrowUp':
			nav("-1")
		break; 

	}
}







	document.addEventListener('keydown', handleKeyDown);


	//////////////////////////
	////BUG OUTPUT////////////
	/////////////////////////

if(debug == true)
{
	$(window).on("error", function(evt) {

	console.log("jQuery error event:", evt);
	var e = evt.originalEvent; // get the javascript event
	console.log("original event:", e);
	if (e.message) { 
	    alert("Error:\n\t" + e.message + "\nLine:\n\t" + e.lineno + "\nFile:\n\t" + e.filename);
	} else {
	    alert("Error:\n\t" + e.type + "\nElement:\n\t" + (e.srcElement || e.target));
	}
	});

}




});

