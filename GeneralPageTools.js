var nCols=4



function addRows(sheet, cols, firstRow) {

  for ( var c in cols ) {
    var col=cols[c]
    var text=col['cols']
    var fontSize=col['fontSize']
    var isBold=col['isBold']
    var mergeRest=col['merge']
    var forms=col['forms']
    
    var nFill=text.length
    var range= sheet.getRange(firstRow+parseInt(c),2,1,nFill)
    range.setValues([text])

    if ( forms != null ) {
      for ( var i in forms ) {
        var range2=sheet.getRange(firstRow+parseInt(c),2+parseInt(i))
        if (forms[i]!='') {
          range2.setFormula(forms[i])
        }
      }
    }
    
    if ( mergeRest == null || mergeRest== true) {   
      if (nFill<nCols ) {
        var rangeBlank=sheet.getRange(firstRow+parseInt(c),1+nFill,1,5-nFill)
        rangeBlank.merge()
      }  
    }
    if ( fontSize != null ) range.setFontSize(fontSize)
    if ( isBold != null ) range.setFontWeight(isBold)    
  } 
  
  return firstRow+cols.length
}
 
function addBlankRows(sheet,atts,firstRow) {
    var range= sheet.getRange(firstRow,2,atts['nRows'],nCols)
    if ( atts['color'] != null ) {
      range.setBackground(atts['color'])
    }
    range.merge()
    return firstRow+atts['nRows'] //I think
}

function makeGeneralPage(sprSheet,recentReleases,oldORPDetails) {
  var milestones=releaseList()
  var pendingInfo=oldORPDetails['pending']
  
  var genSheet=sprSheet.getSheetByName("General")
  genSheet.clear()
  var nRow=1
  nRow=addRows(genSheet,[{'cols' : ['Welcome to the CMSSW release meeting'], 'isBold':true, 'fontSize':18 }],nRow);
  nRow=addBlankRows(genSheet,{'nRows':2},nRow)
  nRow=addRows(genSheet,[{'cols' : ['General information'], 'isBold':true, 'fontSize':16 }],nRow);
  nRow=addRows(genSheet,[{'cols' : ['Viydo'], 
                          'forms' : ['=HYPERLINK("http://vidyoportal.cern.ch/flex.html?roomdirect.html&key=uFVZiCsN6DIb","(Vidyo: Weekly_Offline_Meetings room, Extension: 9226777)")'],
                          'fontSize':14 }],nRow);
  nRow=addBlankRows(genSheet,{'nRows':2},nRow)

  nRow=addRows(genSheet,[{'cols' : ['General topics'], 'fontSize':14 }],nRow);  
  
  nRow=addRows(genSheet,[{'cols' : ['Recent releases'], 'fontSize':14 }],nRow);
  nRow=addRows(genSheet,[{'cols' : ['Release name','Date created','Primary purpose'], 'fontSize': 12}],nRow);    
  var nRowReleaseStart=nRow
  var savedReleaseInfo=oldORPDetails['existingReleases']
  
  for ( var rel in recentReleases) {
    releaseComment="To fill in"
    for ( var i in savedReleaseInfo) {
      if ( i == recentReleases[rel][0] ) {
        releaseComment=savedReleaseInfo[recentReleases[rel][0]]
      }
    }
    
    nRow=addRows(genSheet,[{'cols' : ['',readableDate(extractDate(recentReleases[rel][1])),releaseComment],
                            'forms':['=HYPERLINK("https://github.com/cms-sw/cmssw/releases/'+recentReleases[rel][0]+'","'+recentReleases[rel][0]+'")' ]}],nRow);
  }
  nRow=addBlankRows(genSheet,{'nRows':1},nRow)
  nRow=addRows(genSheet,[{'cols' : ['General items for discussion'], 'fontSize':14 }],nRow);
  var genRowTop=nRow
  if ( (pendingInfo['general'] != null) && (pendingInfo['general'].length > 0 )){
    for ( var i in pendingInfo['general']) {
      if ( pendingInfo['general'][i][1].substr(0,1) == "=" ) {
        nRow=addRows(genSheet,[{'cols': [pendingInfo['general'][i][0],''],
                                'forms': ['',pendingInfo['general'][i][1]],
                                'isBold':false, 'fontSize':10}],nRow)
      }
      else{
        nRow=addRows(genSheet,[{'cols': pendingInfo['general'][i], 'isBold':false, 'fontSize':10}],nRow)
      }
      genSheet.getRange(nRow-1,2).setFontSize(8)
    }
  }
  
  
  var genRow=nRow
  nRow=nRow+1
    
  nRow=addBlankRows(genSheet,{'nRows':1},nRow)
  
  var saveRows=[]
  
  for ( var r in milestones) {
    var m=milestones[r]
    var savedRow=[m]
    nRow=addBlankRows(genSheet,{'nRows':1,'color':'blue'},nRow)
    nRow=addRows(genSheet,[{'cols' : [m], 'isBold':true, 'fontSize':16 }],nRow);
    savedRow.push(nRow)
    nRow=addRows(genSheet,[{'cols' : ['Pending issues'], 'isBold':true, 'fontSize':12 }],nRow);
    

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
    
    nRow=addRows(genSheet,[{'cols' : ['External package requests'], 'isBold':true, 'fontSize':12 }],nRow);
    
    savedRow.push(nRow)
    nRow=addRows(genSheet,[{'cols' : ['CMSSW requests'], 'isBold':true, 'fontSize':12 }],nRow);
    
    savedRow.push(nRow)
    nRow=nRow+1//buildMenu(genSheet,nRow)    
    //nRow=addBlankRows(genSheet,{'nRows':2},nRow)
    
    saveRows.push(savedRow)
  }
  nRow=addBlankRows(genSheet,{'nRows':1,'color':'blue'},nRow)

  nRow=addRows(genSheet,[{'cols' : ['AOB'], 'fontSize':14 }],nRow);
  var aobRow=nRow
  saveRows.push(['Misc info',aobRow,genRow,genRowTop,recentReleases.length+" from "+nRowReleaseStart])
  nRow=nRow+1//buildAOBMenu(genSheet,nRow)
  nRow=addBlankRows(genSheet,{'nRows':1},nRow)
    
  var range=genSheet.getRange(nRow,1,saveRows.length,5)
  range.setValues(saveRows)
  genSheet.getRange(1,1,genSheet.getLastRow(),5).setWrap(true)
  
  genSheet.hideRows(nRow,saveRows.length)
  nRow=nRow+saveRows.length
  Logger.log('Total general rows'+nRow)
  
  var pixNums=[40,170,150,250,250]
  for ( var i=0; i<pixNums.length; i++) {
    genSheet.setColumnWidth(i+1,pixNums[i])
  }
  Logger.log("Looking at the capacities")
  Logger.log(genSheet.getMaxRows())
  Logger.log(genSheet.getMaxColumns())
  
  if ( genSheet.getMaxRows() > nRow) {
    genSheet.deleteRows(nRow,genSheet.getMaxRows()-(nRow-1))
  }
  if ( genSheet.getMaxColumns() > 5 ) {
    genSheet.deleteColumns(6,genSheet.getMaxColumns()-5)
  }
  var me = Session.getEffectiveUser();
  var protection = genSheet.protect().setDescription('Sample protected range');
  protection.addEditor(me);
  protection.removeEditors(protection.getEditors());
  if (protection.canDomainEdit()) {
    protection.setDomainEdit(false);
  }
  

  return genSheet  
}
