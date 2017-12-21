//the setTrigger functions activite a trigger that calls in whenever someone submits
//a new entry in the meeting form. I have one for production and one for testing (in theory)

function setTriggerDev() { 

  var form = FormApp.openById('1J1ziKGmfP9oPEL26_cIoOvpheWd_O6MPUpSE11lVH3c');
  ScriptApp.newTrigger('parseFormInfoDev')
  .forForm(form)
  .onFormSubmit()
  .create();
}

function setTriggerProd() { 

  var form = FormApp.openById('1I8UJCjdycdO0ZBGoPDJtqUczUsy7JuoI4DpnvaC1PII');
  ScriptApp.newTrigger('parseFormInfoProd')
  .forForm(form)
  .onFormSubmit()
  .create();
}

//these functions are called whenever the forms are filled
//the only difference between prod/dev is the summary page used to 
//look up the current ORP list
function parseFormInfoDev(e) { 
  orpSummaryPage='1EupTnQ4Lh5m6Z0rYJ8Nwizl0Nb1pnvOCRwBVWKCc_D8'
  parseFormInfoAll(orpSummaryPage,e)
}

function parseFormInfoProd(e) { 
  orpSummaryPage='1rQTgHL0CLkERCq7zd-OCwQu9JChr7SvEFcHDlpN8cbE'
  parseFormInfoAll(orpSummaryPage,e)
}

//parseFormInfo* calls this function
//Depending on the request, items are added to the right part of the general page
function parseFormInfoAll(orpSummaryPage,e){
  var lastORPInfo = getORPInfo(orpSummaryPage) //gets info from most recent ORP (sheet, date)
  var ssheet=lastORPInfo[0]
  var sprSheet=SpreadsheetApp.open(DriveApp.getFileById(ssheet))  // Open the most recent ORP
   
  var sheet = sprSheet.getSheetByName("General") //general sheet of the most recent ORP
  
  Logger.log('Look, a new request')
  Logger.log(e)
  var answers = e.response.getItemResponses();
 
  var release=null
  var request=null
  var category=null
  
  for ( var i in answers) {
    var t=answers[i].getItem().getTitle()
    var r=answers[i].getResponse()
    
    //These are magic strings from the questions in the google form 
    //They need to be kept in sync if the form is updated
    if ( t.slice(0,12) == 'What kind of' ) {
      if ( r.slice(0,8)=='External') { category='External' } 
      if ( r.slice(0,3)=='AOB') { category='AOB' }
      if ( r.slice(0,7)=='General') { category='General' }
      if ( r.slice(0,5)=='CMSSW') { category='CMSSW' }
    }
    
    if ( t.slice(0,11) == 'Which CMSSW' ) {
      release=r
    }
    
    if ( t.slice(0,7) == 'What is' ) {
      request=r 
    }
  }
  
  
  Logger.log(category+' '+release)
  Logger.log(request)
  var glock = LockService.getScriptLock();
  if( !glock.tryLock(10000) ) {
    throwError('Spreadsheet is locked by another script for 10000 seconds. There is a problem.')
    return;
  }
  if ( category == 'External' ) {
    var relList=releaseList()
    var releaseNum=relList.indexOf(release)
    addExternalRequestForm(sheet,releaseNum,request)
  }
  if ( category == 'CMSSW' ) {
    var relList=releaseList()
    var releaseNum=relList.indexOf(release)
    addCMSSWRequestForm(sheet,releaseNum,request)
  }
  if ( category == 'General' ) {
    addGeneralRequestForm(sheet,request)
  }
  if ( category == 'AOB' ) {
    addAOBRequestForm(sheet,request)
  }
  glock.releaseLock();
}

function addCMSSWRequestForm(sheet,release,message) {
  var issueInfo=getGenInfo(sheet)
  var insLoc=issueInfo[0]['nom'][release] //magic to know where to add a line - can be done better
  handleRequestFromSidebar(sheet,insLoc,message) 
  updateCountingInfo(sheet,insLoc,issueInfo[0],issueInfo[1])

  Logger.log("Adding CMSSW Request")
}

function addExternalRequestForm(sheet,release,message) {
  var issueInfo=getGenInfo(sheet)
  var insLoc=issueInfo[0]['dis'][release]//magic to know where to add a line - can be done better
  handleRequestFromSidebar(sheet,insLoc,message) 
  updateCountingInfo(sheet,insLoc,issueInfo[0],issueInfo[1])
  Logger.log("Adding external Request")
}

function addGeneralRequestForm(sheet,message) {
  var issueInfo=getGenInfo(sheet)
  var insLoc=issueInfo[0]['gen'][0]//magic to know where to add a line - can be done better
  handleRequestFromSidebar(sheet,insLoc,message) 
  updateCountingInfo(sheet,insLoc,issueInfo[0],issueInfo[1])
  Logger.log("Adding general Request")
}

function addAOBRequestForm(sheet,message) {
  var issueInfo=getGenInfo(sheet)
  var insLoc=issueInfo[0]['aob']//magic to know where to add a line - can be done better
  handleRequestFromSidebar(sheet,insLoc,message) 
  updateCountingInfo(sheet,insLoc,issueInfo[0],issueInfo[1])
  Logger.log("Adding AOB Request")
}

function addPendingRequestForm(sheet,release,message) {
	  var issueInfo=getGenInfo(sheet)
	  var insLoc=issueInfo[0]['ext'][release]//magic to know where to add a line - can be done better
	  handleRequestFromSidebar(sheet,insLoc,message) 
	  updateCountingInfo(sheet,insLoc,issueInfo[0],issueInfo[1])
	  Logger.log("Adding external Request")
}

