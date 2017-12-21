//Entry point to make or update a CMSSW release meeting google spreadsheet
function driver() {
  var isDevelopment = 0
  
  //get the last ORP information
  orpSummaryPage='1rQTgHL0CLkERCq7zd-OCwQu9JChr7SvEFcHDlpN8cbE'
  if ( isDevelopment == 1 ) { //can use this one for testing - eg, to manipulate a form not for/from an actual meeting
    orpSummaryPage='1EupTnQ4Lh5m6Z0rYJ8Nwizl0Nb1pnvOCRwBVWKCc_D8'
  } 
  var lastORPInfo = getORPInfo(orpSummaryPage,0) //retrieve the last ORP spreadsheet created and its date 
  var lastORPSheet= lastORPInfo[0]
  var lastORPDate = lastORPInfo[1]
  
  var lastORPDetails = getORPDetails(lastORPSheet) //get all the details from the ORP
  
  var today = new Date()
  var daysSince = days_between(today,lastORPDate)
  
  if ( daysSince > 0 ) { // its time to make a new ORP - the most recent ORP was in the past
    var githubDetails = getGitHubDetails(lastORPDate) // returns list of releases and list of issues from past
    var recentReleases = githubDetails[0] //list of new releases since the last ORP
    var issues = githubDetails[1] // all the issues known to GitHub for active release cycles
    var newOrpInfo = nextTuesday() // returns date object and string with ORP<date>
    var newORP = makeNewORP(issues,newOrpInfo[1],lastORPDetails,lastORPDate,recentReleases) //returns a Spreadsheet object
    //createSpreadsheetEditTriggerV2(newORP)
    updateListOfORPs(orpSummaryPage,newOrpInfo[0],newORP)
    updateForm(newORP.getId()) // update form for ORP
    Logger.log("New ORP URL "+newORP.getUrl())
    Logger.log("Form URL "+getMyForm().getPublishedUrl())
    
  }
  else{ // lets update the current ORP
    Logger.log("Updating the ORP agenda")
    var realLastORPInfo = getORPInfo(orpSummaryPage,1) //retrieve the last ORP spreadsheet created and its date 
    var realLastORPDate = realLastORPInfo[1]
    Logger.log(realLastORPDate)
    var githubDetails = getGitHubDetails(realLastORPDate)
    var recentReleases = githubDetails[0] //list of new releases since the last ORP
    var issues = githubDetails[1] // all the issues known to GitHub for active release cycles
 
    backupORP(lastORPSheet)
    updateORP(lastORPSheet,issues,lastORPDetails,recentReleases)   // for now this will just re-evaluate the issue status 
  }
}
