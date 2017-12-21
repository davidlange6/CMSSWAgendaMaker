function makeMilestonePage(sprSheet,milestone,issueList,lastORPDetails,lastORPDate) {
  var mileSheet=sprSheet.insertSheet(milestone)
  //Logger.log('Number of issues ',issueList.length)
  var nIssue=0
  for ( var pr in issueList) {
    nIssue=nIssue+1
    //Logger.log('Issue found '+pr)
  }
  Logger.log(nIssue)  
  
  var nRows=nIssue+1
  var nCols=7
  var range=mileSheet.getRange(1,1,nRows,nCols)
  var rangeD=mileSheet.getRange(1,2,nRows,nCols-1)
  if ( nRows>1 ) {
    var rangeF=mileSheet.getRange(2,1,nRows-1,1)
  }
  mileSheet.setActiveRange(range)
  mileSheet.deleteRows(nRows,1000-nRows)
  mileSheet.deleteColumns(nCols+1,26-nCols)
  
  var data=[]
  data.push( ['ReqDate','Title','Sigs so far','Pending sigs','Tests ok?','Requests/Comments'])
  var formulas=[]
//  formulas.push(['PR#'])
  for ( var i in issueList ) {
    var iss=issueList[i]
    var pr=iss['prNum']
    var sigInfo=parseSigInfo(iss['labels'])
    var approvedSigs=sigInfo[0]
    var pendingSigs=sigInfo[1]
    var testsPassed=sigInfo[2]
    var comments=saveComments(pr,lastORPDetails,lastORPDate)
    data.push( [ extractDate(iss['date']),iss['title'],approvedSigs,pendingSigs,testsPassed,comments] )
    formulas.push( ['=HYPERLINK("http://www.github.com/cms-sw/cmssw/pull/'+pr+'","'+pr+'")'] )
  }
  
  mileSheet.getRange('A1').setValue('PR#') //the formula setting method does not work
  rangeD.setValues(data)
  if ( nRows>1 ) {
    rangeF.setFormulas(formulas)
  }
  range.setWrap(true)
  
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

  if ( nRows>1 ) {
    var range=mileSheet.getRange(2,nCols,nRows-1,1)
    protection.setUnprotectedRanges([range])
  }
  Logger.log("PROTECTION")
  Logger.log(protection.getProtectionType())
  var checkRs=protection.getUnprotectedRanges()
  for ( var i in checkRs) {
    Logger.log(checkRs[i].getA1Notation())
  }
  
  var pixNums=[50,75,300,100,100,50,400]
  for ( var i=0; i<pixNums.length; i++) {
    mileSheet.setColumnWidth(i+1,pixNums[i])
  }
  if ( nRows>1) {
    mileSheet.setFrozenRows(1)
  }

  return mileSheet
}

function parseSigInfo(labels) {
  var approvedSigs=''
  var pendingSigs=''
  var testPassed='Pend'
  
  for ( var i in labels) {
    var sp = labels[i].split('-')
    if ( sp.length != 2 ) continue
    if ( sp[1] == 'pending') {
      if ( sp[0] != 'tests' && sp[0] != 'comparison' && sp[0] != 'orp' ) pendingSigs=pendingSigs+' '+(sp[0])      
    }
    if ( sp[1] == 'approved') {
      if ( sp[0] == 'tests' ) {
        testPassed='Yes'
      }
      else { 
        approvedSigs=approvedSigs+' '+sp[0]+'+'
      }
    }
    if ( sp[1] == 'rejected') {
      if ( sp[0] == 'tests' ) {
        testPassed='Failed'
      }
      else { 
        approvedSigs=approvedSigs+' '+sp[0]+'-'
      }
    }
  }
  
  return [approvedSigs,pendingSigs,testPassed]
}

function saveComments(pr,oldInfo,oldDate) {
  var retVal=''
  var preString='ORP'+formatDate(oldDate)
  if ( oldInfo==null ) return retVal
  var comment = oldInfo[pr]
  if ( comment==null ) return retVal
  var sp = comment.split('\n')
  for ( var i in sp) {
    if ( sp[i] == "" ) { continue}
    if ( sp[i].indexOf('ORP') == 0 ) {
      retVal=retVal+sp[i]
    }
    else{
      retVal=retVal+preString+': '+sp[i]
    }
    if ( i!= sp.length-1 ) {retVal=retVal+'\n'}
  }

  return retVal
}
