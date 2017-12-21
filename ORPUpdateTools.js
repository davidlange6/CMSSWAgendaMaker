function updateORP(ssheet,issues,lastORPDetails,recentReleases) {
  var sprSheet=SpreadsheetApp.open(DriveApp.getFileById(ssheet))
  var genSheet=makeGeneralPage(sprSheet,recentReleases,lastORPDetails) 
  var releases=releaseList()
  for ( r in releases ) {
    var release=releases[r]
    var mileSheet=updateMilestonePage(sprSheet,release,issues[release])
  } 
}

function updateMilestonePage(sprSheet,milestone,issues) {

  var mileSheet=sprSheet.getSheetByName(milestone)
  if ( mileSheet == null ) return
  if ( mileSheet.getMaxRows() == 1 ) return // no PRs, nothing to do
  
  var range=mileSheet.getRange(2,1,mileSheet.getMaxRows()-1,6)
  var data=range.getValues()
  // 
  
  // otherwise, loop over the data and look for updates
  var foundPRs={}
  for ( var i in issues) {
    var iss = issues[i]
    var pr = iss['prNum']
    var sigInfo=parseSigInfo(iss['labels'])
    var approvedSigs=sigInfo[0]
    var pendingSigs=sigInfo[1]
    var testsPassed=sigInfo[2]
    
    //check this against the info we have from before
    
    for ( var row in data ) {
      if ( data[row][0] != pr ) {
        continue;
      }
      foundPRs[data[row][0]]=1

      //Logger.log("Found matching PR ",pr)
      // matching PRs
      if ( data[row][3] != approvedSigs ) {
        mileSheet.getRange(parseInt(row)+2,4).setValue(approvedSigs) //add one for 0->1 and one for the header row
        //Logger.log("updated signers "+pr)
      }
      if ( data[row][4] != pendingSigs ) {
        mileSheet.getRange(parseInt(row)+2,5).setValue(pendingSigs)
        //Logger.log("updated pending "+pr)
      }
      if ( data[row][5] != testsPassed ) {
        mileSheet.getRange(parseInt(row)+2,6).setValue(testsPassed)
        //Logger.log("updated test info "+pr)
      }
      break // no need to keep going
    }
    
  }

  //for ( var i in foundPRs ) { 
  //  Logger.log('found this '+i)
  //}
  
  // hide rows for PRs that are closed already
  for ( var row in data) {
    if ( foundPRs[data[row][0]] != 1 ) {
      mileSheet.hideRows(parseInt(row)+2)
      //Logger.log("It looks like a PR has already been closed. Hiding this row "+data[row][0])
    }
  }
  
  // now add new ones
  var data=[]
  var formulas=[]
  for ( var i in issues ) {
    var iss=issues[i]
    var pr=iss['prNum']
    if ( foundPRs[pr] == 1 ) {
      continue
    }

    var sigInfo=parseSigInfo(iss['labels'])
    var approvedSigs=sigInfo[0]
    var pendingSigs=sigInfo[1]
    var testsPassed=sigInfo[2]
    var comments=''
    data.push( [ extractDate(iss['date']),iss['title'],approvedSigs,pendingSigs,testsPassed,comments] )
    formulas.push( ['=HYPERLINK("http://www.github.com/cms-sw/cmssw/pull/'+pr+'","'+pr+'")'] )
  }
  
  var nCols=7
  var nNewRows=data.length
  if ( nNewRows > 0 ) {
    mileSheet.insertRowsAfter(1,nNewRows)
    var rangeD=mileSheet.getRange(2,2,nNewRows,nCols-1)
    var rangeF=mileSheet.getRange(2,1,nNewRows,1)
    rangeD.setValues(data)
    rangeF.setFormulas(formulas)
  }
  
  
  // Protect the active sheet, then remove all other users from the list of editors.
  var protection = mileSheet.protect().setDescription('Protected sheet');
  
  // Ensure the current user is an editor before removing others. Otherwise, if the user's edit
  // permission comes from a group, the script will throw an exception upon removing the group.
  var me = Session.getEffectiveUser();
  protection.addEditor(me);
  protection.removeEditors(protection.getEditors());
  if (protection.canDomainEdit()) {
    protection.setDomainEdit(false);
  }

  var nRows=mileSheet.getLastRow()
  if ( nRows>1 ) {
    var range=mileSheet.getRange(2,nCols,nRows-1,1)
    protection.setUnprotectedRanges([range])
  }
  mileSheet.getRange(1,1,nRows,nCols).setWrap(true)
  
}

