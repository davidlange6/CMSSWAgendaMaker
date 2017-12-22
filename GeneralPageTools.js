//number of content filled columns in general page
//eventually there is a 5th, but treated separeately
var nCols=4

//add cols to the general sheet referenced by sheet
//firstrow is a counter into sheet that defines where to add
//the content
function addRows(sheet, cols, firstRow) {

  for ( var c in cols ) {
    var col=cols[c]
    //These are all formmating options
    var text=col['cols']
    var fontSize=col['fontSize']
    var isBold=col['isBold']
    var mergeRest=col['merge']
    var forms=col['forms']
    
    var nFill=text.length //the number of columns to fill
    //this is column two because the first one is left empty for future purposes
    var range= sheet.getRange(firstRow+parseInt(c),2,1,nFill)
    range.setValues([text]) //its an array of arrays

    if ( forms != null ) { //instead of text, we may have formulas
      for ( var i in forms ) {
        var range2=sheet.getRange(firstRow+parseInt(c),2+parseInt(i))
        if (forms[i]!='') {
          range2.setFormula(forms[i])
        }
      }
    }
    
    if ( mergeRest == null || mergeRest== true) { // merge trailing columns when requested  
      if (nFill<nCols ) {
        // this is the range to merge - one row at a time
        var rangeBlank=sheet.getRange(firstRow+parseInt(c),1+nFill,1,5-nFill)
        rangeBlank.merge()
      }  
    }
    if ( fontSize != null ) range.setFontSize(fontSize) //update font size when requested
    if ( isBold != null ) range.setFontWeight(isBold)   //make bold when requested 
  } 
  
  return firstRow+cols.length //return the new length of the sheet
}
 
function addBlankRows(sheet,atts,firstRow) {
    var range= sheet.getRange(firstRow,2,atts['nRows'],nCols) //add 1 or more blank rows
    if ( atts['color'] != null ) {
      range.setBackground(atts['color'])
    }
    range.merge()
    return firstRow+atts['nRows'] //return the new length of the sheet
}

// main driver function to make the general page
// inputs are the sheet itself, the list of recently created releases
// and all the inputs saved from the prevoius ORP notes
function makeGeneralPage(sprSheet,recentReleases,oldORPDetails) {
  var milestones=releaseList()
  var pendingInfo=oldORPDetails['pending'] //these are the items left to add to the new meeting agenda
  
  var genSheet=sprSheet.getSheetByName("General") //get the right sheet
  genSheet.clear() //remove any content already there

  // generic header information
  var nRow=1
  nRow=addRows(genSheet,[{'cols' : ['Welcome to the CMSSW release meeting'], 'isBold':true, 'fontSize':18 }],nRow);
  nRow=addBlankRows(genSheet,{'nRows':2},nRow)
  nRow=addRows(genSheet,[{'cols' : ['General information'], 'isBold':true, 'fontSize':16 }],nRow);
  nRow=addRows(genSheet,[{'cols' : ['Viydo'], 
                          'forms' : ['=HYPERLINK("http://vidyoportal.cern.ch/flex.html?roomdirect.html&key=uFVZiCsN6DIb","(Vidyo: Weekly_Offline_Meetings room, Extension: 9226777)")'],
                          'fontSize':14 }],nRow);
  nRow=addBlankRows(genSheet,{'nRows':2},nRow)

  nRow=addRows(genSheet,[{'cols' : ['General topics'], 'fontSize':14 }],nRow);  

  //add in releases created since the last CMSSW release meeting - one per line
  //in case this is recreation of a meeting page, any descriptions are retained
  //via the existingReleases information from the old ORP (which is not old in this case)  
  nRow=addRows(genSheet,[{'cols' : ['Recent releases'], 'fontSize':14 }],nRow);
  nRow=addRows(genSheet,[{'cols' : ['Release name','Date created','Primary purpose'], 'fontSize': 12}],nRow);    
  var nRowReleaseStart=nRow //cache for where and how many releases there are - needed to create the existingReleases info next time
  var savedReleaseInfo=oldORPDetails['existingReleases']

  //See if there is some notes about the releases to save
    for ( var rel in recentReleases) {
    releaseComment="To fill in"
    for ( var i in savedReleaseInfo) {
      if ( i == recentReleases[rel][0] ) {
        releaseComment=savedReleaseInfo[recentReleases[rel][0]]
      }
    }
    //add a link to the release notes
    nRow=addRows(genSheet,[{'cols' : ['',readableDate(extractDate(recentReleases[rel][1])),releaseComment],
                            'forms':['=HYPERLINK("https://github.com/cms-sw/cmssw/releases/'+recentReleases[rel][0]+'","'+recentReleases[rel][0]+'")' ]}],nRow);
  }
  nRow=addBlankRows(genSheet,{'nRows':1},nRow)

  //list of general items for discussion (or items that don't fit elsewhere
  nRow=addRows(genSheet,[{'cols' : ['General items for discussion'], 'fontSize':14 }],nRow);
  var genRowTop=nRow
  if ( (pendingInfo['general'] != null) && (pendingInfo['general'].length > 0 )){
    for ( var i in pendingInfo['general']) {
      if ( pendingInfo['general'][i][1].substr(0,1) == "=" ) { //watch for hyperlinks that need to be treated separately
        nRow=addRows(genSheet,[{'cols': [pendingInfo['general'][i][0],''],
                                'forms': ['',pendingInfo['general'][i][1]],
                                'isBold':false, 'fontSize':10}],nRow)
      }
      else{ //handle hyperlinks
        nRow=addRows(genSheet,[{'cols': pendingInfo['general'][i], 'isBold':false, 'fontSize':10}],nRow)
      }
      genSheet.getRange(nRow-1,2).setFontSize(8)
    }
  }
  
  
  var genRow=nRow //cache for later
  nRow=nRow+1 //not sure why I did this - it seems to be the same as adding a blank line
    
  nRow=addBlankRows(genSheet,{'nRows':1},nRow)
  
  var saveRows=[]
  // now loop over the active releases and add a stanza in the agenda for each one
  for ( var r in milestones) {
    var m=milestones[r]
    var savedRow=[m]
    nRow=addBlankRows(genSheet,{'nRows':1,'color':'blue'},nRow)
    nRow=addRows(genSheet,[{'cols' : [m], 'isBold':true, 'fontSize':16 }],nRow); //title row
    savedRow.push(nRow)
    nRow=addRows(genSheet,[{'cols' : ['Pending issues'], 'isBold':true, 'fontSize':12 }],nRow); //Pending issues
    
    //now add the pending issues - watch for hyperlinks and handle them separately
    if ( (pendingInfo[m] != null) && (pendingInfo[m].length > 0 )){
      for ( var i in pendingInfo[m]) {
        if ( pendingInfo[m][i][1].substr(0,1) == "=" ) {
          nRow=addRows(genSheet,[{'cols': [pendingInfo[m][i][0],''],
                                  'forms': ['',pendingInfo[m][i][1]],
                                  'isBold':false, 'fontSize':10}],nRow)
        }
        else{
          nRow=addRows(genSheet,[{'cols': pendingInfo[m][i], 'isBold':false, 'fontSize':10}],nRow)
        }
        genSheet.getRange(nRow-1,2).setFontSize(8)
      }
    }
    savedRow.push(nRow)

    // Stanza for new external package requests for discussion
    nRow=addRows(genSheet,[{'cols' : ['External package requests'], 'isBold':true, 'fontSize':12 }],nRow);
    savedRow.push(nRow)

    // Stanza for new CMSSW requests for discussion
    nRow=addRows(genSheet,[{'cols' : ['CMSSW requests'], 'isBold':true, 'fontSize':12 }],nRow);
    savedRow.push(nRow)
    nRow=nRow+1
    
    saveRows.push(savedRow)
  }
  nRow=addBlankRows(genSheet,{'nRows':1,'color':'blue'},nRow)

  //done with release-by-release section. Finish with AOB section
  nRow=addRows(genSheet,[{'cols' : ['AOB'], 'fontSize':14 }],nRow);
  var aobRow=nRow
  saveRows.push(['Misc info',aobRow,genRow,genRowTop,recentReleases.length+" from "+nRowReleaseStart])
  nRow=nRow+1//buildAOBMenu(genSheet,nRow)
  nRow=addBlankRows(genSheet,{'nRows':1},nRow)

  //Done - now format sheet
  var range=genSheet.getRange(nRow,1,saveRows.length,5)
  range.setValues(saveRows)
  genSheet.getRange(1,1,genSheet.getLastRow(),5).setWrap(true)
  
  genSheet.hideRows(nRow,saveRows.length)
  nRow=nRow+saveRows.length
  Logger.log('Total general rows'+nRow)

  //hardwired column widths  
  var pixNums=[40,170,150,250,250]
  for ( var i=0; i<pixNums.length; i++) {
    genSheet.setColumnWidth(i+1,pixNums[i])
  }

  //trim off the extra rows and columns
  if ( genSheet.getMaxRows() > nRow) {
    genSheet.deleteRows(nRow,genSheet.getMaxRows()-(nRow-1))
  }
  if ( genSheet.getMaxColumns() > 5 ) {
    genSheet.deleteColumns(6,genSheet.getMaxColumns()-5)
  }
  
  //only "I" can edit this page
  var me = Session.getEffectiveUser();
  var protection = genSheet.protect().setDescription('Sample protected range');
  protection.addEditor(me);
  protection.removeEditors(protection.getEditors());
  if (protection.canDomainEdit()) {
    protection.setDomainEdit(false);
  }
  

  return genSheet  
}
