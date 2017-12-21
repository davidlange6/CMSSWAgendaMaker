function getGenInfo(sheet ) { //parse general sheet of existing ORP

  var nrows=sheet.getLastRow()
  var offsetsAOBArr=sheet.getRange(nrows,2,1,4).getValues(); //the last row has indices for AOB and General info
  var offsetsAOB=offsetsAOBArr[0][0] //first the AOB offset
  var offsetsGen=offsetsAOBArr[0][1] //the end of general items list
  var offsetsGenOrig=offsetsAOBArr[0][2] //the start of the general items list
  var offsetsNNewRelease=offsetsAOBArr[0][3] //the start of the general items list
  var nrels = nrows-parseInt(offsetsAOB) -2 // one empty row, one misc row
  var rels = sheet.getRange(nrows-nrels+1-1,1,nrels).getValues(); //list of releases
  var offsets=sheet.getRange(nrows-nrels+1-1,5,nrels).getValues(); //-1 for AOB row at the end - this is the offset to where to add new CMSSW items
  var offsetsPend=sheet.getRange(nrows-nrels+1-1,2,nrels).getValues(); //the offset to the top of the pending items list
  var offsetsExt=sheet.getRange(nrows-nrels+1-1,3,nrels).getValues(); //the offset to the top of the externals request list (index where to add pending items)
  var offsetsDis=sheet.getRange(nrows-nrels+1-1,4,nrels).getValues(); //offset to the top of the CMSSW request list (index where to add new external items)
  
  // none of these numbers should be 0.
  if ( Math.min.apply(Math,offsets) == 0 || Math.min.apply(Math,offsetsPend) == 0 || Math.min.apply(Math,offsetsExt) == 0 || Math.min.apply(Math,offsetsAOBArr) == 0 ) {
     Logger.log('Bad input data ')
     Logger.log(offsets)
     Logger.log(offsetsPend)
     Logger.log(offsetsExt)
     Logger.log(offsetsAOBArr)
  }
  
  //make an ugly dictionary of these. - probably its better that these get keyed off of
  //the release name when its relevant - but that needs some reworking.
  offsetDict={}
  offsetDict['rels']=rels
  offsetDict['nom']=offsets
  offsetDict['pend']=offsetsPend
  offsetDict['ext']=offsetsExt
  offsetDict['dis']=offsetsDis
  offsetDict['aobarr']=offsetsAOBArr
  offsetDict['aob']=offsetsAOB
  offsetDict['gen']=[offsetsGen,offsetsGenOrig,offsetsNNewRelease]
  return [offsetDict,nrows] //there is really no reason to return both of these things...derive crows from offsetDict easily...
}

//this function updates the magic numbers at the end of the general sheet
//ONE line has been inserted at insLoc
//nrowsStart is the number of rows in the document before the insert was done
//This is obviously not needed but was put in to save time in google doc queries
function updateCountingInfo(sheet,insLoc,offsetDict,nrowsStart) { 
  Logger.log('Update counting')
  var nrels = offsetDict['nom'].length;
  var newOffsets=[]
  var nrows=nrowsStart+1
  
  for ( var i=0; i< nrels; i++) {
    newOffsets.push([parseInt(offsetDict['pend'][i]),
                     parseInt(offsetDict['ext'][i]),
                     parseInt(offsetDict['dis'][i]),
                     parseInt(offsetDict['nom'][i])])
    
    for ( var j=0; j<4; j++) { //>= puts the next issue on the bottom of the list.
      if ( newOffsets[i][j] >= parseInt(insLoc) ) { newOffsets[i][j]=newOffsets[i][j]+1}
    }
  }

  var newAOB=[[parseInt(offsetDict['aobarr'][0][0]),parseInt(offsetDict['aobarr'][0][1])]]
  for ( var i=0; i<2; i++) {
    if (newAOB[0][i] >= parseInt(insLoc) ) {
      newAOB[0][i]= newAOB[0][i]+1
    }
  }

  //now write the new values - nrows how long the sheet is
  sheet.getRange(nrows-nrels+1-1,2,nrels,4).setValues(newOffsets);
  sheet.getRange(nrows,2,1,2).setValues(newAOB);
}


function handleRequestFromSidebar(sheet,insLoc,message) {
  Logger.log('handling request')
  var d = new Date();
  var currentTime = d.toGMTString(); //document with timestamp
  var newCell=parseInt(insLoc);
  sheet.insertRowBefore(newCell);
  var trRange=sheet.getRange(newCell,2,1,4)//"B"+newCell+":E"+newCell)
  trRange.breakApart()
  trRange.clearDataValidations()
  var taRange=sheet.getRange(newCell,2)//"B"+newCell)
  taRange.setValue(currentTime);
  taRange.setFontSize(8);
  var tbRange=sheet.getRange(newCell,3,1,3)//"C"+newCell+":E"+newCell)
  tbRange.merge();
  tbRange.setValue(message);
  tbRange.setFontSize(10);    
};

function testMin() {
  var arrT=[1,2,5,9,3.2]
  var m= Math.min.apply(Math,arrT)
  Logger.log(m)
}

function testGetGenInfo() {
  var ss = SpreadsheetApp.open(DriveApp.getFileById("1h75xcj98EJs1wtOZqShtlaazl_gj_qfSP3wxbeDhP3Y"))
  var sheet = ss.getSheetByName("General")
  var output = getGenInfo(sheet)
  Logger.log(output[1])
  for ( var i in output[0]) {
    Logger.log("looking at "+i)
    Logger.log(output[0][i])
  }    
}
  