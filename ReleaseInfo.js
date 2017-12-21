function releaseList() {
  var l=["CMSSW_5_3_X","CMSSW_7_1_X","CMSSW_8_0_X","CMSSW_9_2_X","CMSSW_9_3_X","CMSSW_9_4_X","CMSSW_10_0_X"]
  return l
}

/*
function releaseListLast() {//ugly - sometimes the set of releases are updated - this should be determinable from the google doc itself, but..
  var l=["CMSSW_5_3_X","CMSSW_7_1_X","CMSSW_8_0_X","CMSSW_9_2_X","CMSSW_9_3_X","CMSSW_9_4_X","CMSSW_10_0_X"]
  return l
}
*/

// by hand list of milestones from GitHub
function milestoneList() {
  var milestones = []
  milestones['CMSSW_5_3_X'] = 20;
  milestones['CMSSW_7_1_X'] = 47;
  milestones['CMSSW_7_5_X'] = 51;
  milestones['CMSSW_7_6_X'] = 55;
  milestones['CMSSW_8_0_X'] = 57;
  milestones['CMSSW_8_1_X'] = 59;
  milestones['CMSSW_9_0_X'] = 64;
  milestones['CMSSW_9_1_X'] = 65;
  milestones['CMSSW_9_2_X'] = 66;
  milestones['CMSSW_9_3_X'] = 69;
  milestones['CMSSW_9_4_X'] = 71;
  milestones['CMSSW_10_0_X'] = 72;
  return milestones
}

