//return a parsed JSON from a URL (eg, for GitHub API calls)
function getJSONFromURL(urlToGet, options={}) {
  //var urlToSend = UrlFetchApp.getRequest(urlToGet,options);
  //Logger.log(urlToSend['url'])
  var response = UrlFetchApp.fetch(urlToGet,options);
  var json = response.getContentText();
  var data = JSON.parse(json);
  return data;
}

function days_between(date1, date2) {
  // thanks http://stackoverflow.com/questions/2627473/how-to-calculate-the-number-of-days-between-two-dates-using-javascript
    // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime()
    var date2_ms = date2.getTime()

    // Calculate the difference in milliseconds
    var difference_ms = (date1_ms - date2_ms)

    // Convert back to days and return
    return Math.round(difference_ms/ONE_DAY)
}

//pretty hacky code to get the date of the next meeting.
function nextTuesday() {
  var today = new Date()
  var day = today.getDay();
 
  var tuesday = today.getDate() - day //+ (day === 0 ? -6 : 2) +7;
  // now we are back to last Sunday - go up to Tuesday

  tuesday = tuesday +2
  if ( day> 2 ) { 
    tuesday = tuesday + 7
  }
  
  var closest = new Date(today.setDate(tuesday));
  var orpStr='ORP'+formatDate(today)

  return [closest,orpStr]
}

function formatDate(d) {
  var zDay=('00000'+d.getDate())
  zDay=zDay.substr(zDay.length-2,2)
  var zMon=('00000'+(1+d.getMonth()))
  
  zMon=zMon.substr(zMon.length-2,2)
  
  var retVal=(d.getYear()-2000)+zMon+zDay
  return retVal
}

function readableDate(d) {
  return d.toDateString()
}
