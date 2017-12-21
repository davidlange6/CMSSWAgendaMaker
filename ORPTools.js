// Creates new google spreadsheet, and fills it with the general sheet and release specific sheets
function makeNewORP(issues,orpName,lastORPDetails,lastORPDate,recentReleases) {
  var ssheet=makeNewSpreadsheet(orpName) //create the new doc
  var genSheet=makeGeneralPage(ssheet,recentReleases,lastORPDetails) // create the general sheet
  var relList = releaseList()
  for ( var r in relList ) { //loop over releases desired and make a sheet for each
    var m=relList[r]
    Logger.log('making milestone '+m+' '+r)
    var mileSheet=makeMilestonePage(ssheet,m,issues[m],lastORPDetails[m],lastORPDate)
  }
  return ssheet
}

function getORPDetails(orpSummarySheet) {
  var lastOrp={} // return object to fill
  var ss = SpreadsheetApp.open(DriveApp.getFileById(orpSummarySheet)) //open the google doc
  var relList = releaseList() //was Last

  //First get the release by release information
  for ( var r in  relList) { // get sheet corresponding to each release
    var m = relList[r]
    lastOrp[m]={}
    var sheet = ss.getSheetByName(m) //here is the sheet
    if ( sheet == null ) continue // it might not exist - eg, this is a new release cycle
    var data = sheet.getDataRange().getValues() // if it does, get all the data
    for ( var r in data ) {
      var prNum=data[r][0] //get the PR
      if ( prNum=="PR#" ) continue //but skip the title row
      var comments=data[r][6] //we want to preserve the comment column, the rest will get updated from gitHub
      if ( comments.length > 0 ) {
        lastOrp[m][prNum]=comments
        Logger.log('Last ORP comments for '+m+': '+prNum+' '+comments)
      }
    }
  }
  
  //now get the general sheet info as well
  var sheet = ss.getSheetByName("General")
  var genInfo = getGenInfo(sheet)[0]
  var allDataF = sheet.getRange(1,1,sheet.getLastRow(),sheet.getLastColumn()).getFormulas()
  var allData = sheet.getRange(1,1,sheet.getLastRow(),sheet.getLastColumn()).getValues()

  //data can be strings or formulas (eg, hyperlinks)  
  for ( var i in allData ) {
    for ( var j in allData[i]) {
      if ( allDataF[i][j] != '' ) {
        allData[i][j]=allDataF[i][j]
        //Logger.log('found a formula')
        //Logger.log(allData[i][j])
      }
    }
  }
  
  var pendingInfo={} // a dictionary of all the pending items for each release (or general news)
  //var releases=releaseListLast()  
  var releasesInOldSheet=genInfo['rels']
  for ( var r in releasesInOldSheet) {
	  var releaseNum=parseInt(r)// this would see to be var releaseNum=as_int(r)???
	  var pList=getAllPending(genInfo,allData,releaseNum)
      for ( var p in pList) {
        Logger.log(p+' '+pList[p])
      }
	  pendingInfo[releasesInOldSheet[r][0]]=pList
  }
  pendingInfo['general']=getAllPending(genInfo,allData,"general")
  lastOrp['pending']=pendingInfo
  
  //and harvest the "purposes" filled in for old releases
  Logger.log(genInfo['gen'])
  var existingReleaseInfoSaved=genInfo['gen'][2]//-numGeneralSheetHeaderRows()
  var nER=0
  var firstER=0
  if ( (existingReleaseInfoSaved) && (existingReleaseInfoSaved.split(' ').length>2)) {
    nER=parseInt(existingReleaseInfoSaved.split(' ')[0])
    firstER=parseInt(existingReleaseInfoSaved.split(' ')[2])
  }
  var existingReleaseInfo={}
  Logger.log("Looking for releases")
  if ( nER > 0) {
    Logger.log("Found some releases")
    var erData = sheet.getRange(firstER,2,nER,3).getValues()
    Logger.log(erData)
    for ( var i in erData ) {
      existingReleaseInfo[erData[i][0]]=erData[i][2]
    }
  }
  lastOrp['existingReleases']=existingReleaseInfo
  Logger.log("Check the existing release information")
  Logger.log(existingReleaseInfo)
    
  return lastOrp
}

//Create a new google doc, set the sharing to be correct, add the general sheet while removing the others
function makeNewSpreadsheet(orpName) {
  var sprSheet=SpreadsheetApp.create(orpName)
  var allSheets=sprSheet.getSheets()
  var genSheet=sprSheet.insertSheet('General')  
  for (var s in allSheets) {
    sprSheet.deleteSheet(allSheets[s])
  }
  sprF=DriveApp.getFileById(sprSheet.getId())
  sprF.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT)
  
  return sprSheet
}

//this retrieves the sheet containing all previous ORP google docs (well, a link to each one)
function getORPSheet(orpSummarySheet) {
  var ss = SpreadsheetApp.open(DriveApp.getFileById(orpSummarySheet))
  var sheet = ss.getSheetByName('ORPList')
  return sheet
}

function getORPInfo(orpSummarySheet,nSkip) { //skip the first N entries
  Logger.log("Skipping "+nSkip)
  var sheet=getORPSheet(orpSummarySheet) //get the list of old ORPs
  var myRange = sheet.getRange(2+nSkip,1,1,2); //get the last meeting information
  
  var data = myRange.getFormulas(); // URLs are formulas
  var lastURL = data[0][1] //get the link to the last meeting
  Logger.log('the formula is '+lastURL)
  var url = lastURL.match(/=hyperlink\("([^"]+)"/i)[1]; //parse it
  Logger.log('the url is '+url)
  
  var sheetId = url.split('/')[url.split('/').length-1] //the last bit is the google docs ID
  Logger.log(url.slice('/').length)
  Logger.log('the sheet id is '+sheetId)
  
  //data = myRange.getValues()
  var orpDate = sheet.getRange(2+nSkip,1).getValue() //Get the date in YYMMDD form
  
  Logger.log('date is '+orpDate)
  
  return [sheetId,orpDate];
}

//add the newly created ORP google doc to the google doc that tracks all ORPs
function updateListOfORPs(orpSummarySheet,newOrpDate,newORP) {
  var sheet=getORPSheet(orpSummarySheet)
  sheet.insertRowAfter(1) //add it in the first row to keep newest first
  sheet.getRange('A2').setValue(newOrpDate) //Date and link
  sheet.getRange('B2').setFormula('=HYPERLINK("https://docs.google.com/spreadsheets/d/'+newORP.getId()+'","Agenda")')

  //why is this needed each time and not just once?  
  var me = Session.getEffectiveUser(); //give only myself editing 
  var protection = sheet.protect().setDescription('This sheet is protected');
  protection.addEditor(me);
  protection.removeEditors(protection.getEditors());
  protection.addEditor(me);
  if (protection.canDomainEdit()) {
    protection.setDomainEdit(false);
  }
  
}

function getAllPending(genInfo,rangeInfo,rNum) {
    Logger.log('Release num '+rNum)
	var retVal=[]
	var labelDict={}
	var locOfPending=-1
	var locOfExt=-1
	var locOfCMSSW=-1
	if ( rNum == "general") {
		locOfPending=genInfo['gen'][1]-1
	}
	else{
		locOfPending=genInfo['pend'][rNum]
		locOfExt=genInfo['ext'][rNum]
		locOfCMSSW=genInfo['dis'][rNum]
	}
	Logger.log('Starting at '+locOfPending+' '+locOfExt+' '+locOfCMSSW)
	for ( var i=parseInt(locOfPending); i<100000;i++) {
		if ( rangeInfo[i][1] == '' ) {break;} //stop at a blank line
		if ( i == locOfExt-1) {continue;}
		if ( i == locOfCMSSW-1) {continue;}
		// ok - this is something of potential interest
		if ( rangeInfo[i][0]=="D") {continue;} // its resolved
		//now deal with labels and Ms
		if ( rangeInfo[i][0]=="" ) {
			retVal.push([rangeInfo[i][1],rangeInfo[i][2]])
		}
		else{
            Logger.log('str is '+rangeInfo[i][0])
            var t=String(rangeInfo[i][0])
			if ( t.substr(0,1)=="M") {
                
				var label=t.substr(1,t.length-1)
				retVal[labelDict[label]][1]=retVal[labelDict[label]][1]+"\n"+rangeInfo[i][2]
			}
			else{
				retVal.push([rangeInfo[i][1],rangeInfo[i][2]])
				labelDict[rangeInfo[i][0]]=retVal.length-1
			}
		}
	}
	return retVal
}

//Copies an existing google spreadsheet doc and dumps it onto my Drive 
function backupORP(ssheet) {
  var sprSheet=SpreadsheetApp.open(DriveApp.getFileById(ssheet))
  var newSheet=sprSheet.copy("BackupORP"+sprSheet.getName())
  Logger.log('backup existing sheet '+newSheet.getId())
}

function testGetDetails() {
	var d= getORPDetails("1zAzHQ_PK1EGSpQNBNBKV6EmW05uVTSbosB5FYNFamOQ")
    Logger.log('Ok - what did I harvest?')
    var pendingInfo=d['pending']
	for ( var i in pendingInfo) {
		Logger.log(i+' '+ pendingInfo[i].length)
	}
}
