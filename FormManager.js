function getMyForm() {
  return FormApp.openById('1I8UJCjdycdO0ZBGoPDJtqUczUsy7JuoI4DpnvaC1PII') //this is the main form - in theory it doesn't need to change
}
function updateForm(currentORPStr) {
  var existingForm = getMyForm() //get the main form
  //var des=existingForm.getDescription()
  //Logger.log(des)
  
  var newDES= "This form is meant to replace input previously received on the ORP meeting TWiki. " +
              "Today's summary of information and pull request input area is available in its usual form at this link:\n\n" +
              "https://docs.google.com/spreadsheets/d/"+currentORPStr+"\n\n" +
              "If your comment regards a single PR (or a few of them), just make a comment in the corresponding comment field in " +
              "the release specific packages. " +
              "Use the form to make requests that do not fit into the single pull request section of the google doc. " +
              "Items entered here will be added to the correct part of the Google doc (assuming that all works as planned. " + 
              "Issues/problems, please contact me via email (David).\n\n" +
              "Past ORPs can be found from this page:\n\n" +
              "https://docs.google.com/spreadsheets/d/1rQTgHL0CLkERCq7zd-OCwQu9JChr7SvEFcHDlpN8cbE \n\n"+
              "(eventually to be updated back in time) \n";  

  existingForm.setDescription(newDES)

  //var checkDes=existingForm.getDescription()  
  //Logger.log(checkDes)
  
  var items = existingForm.getItems();
  var myQuest="Which CMSSW release"
  for ( var i in items) { 
    var title = items[i].getTitle()
    if ( title.length >= myQuest.length && title.substr(0,myQuest.length) == myQuest ) {
      Logger.log( title )
      Logger.log("Updating release list")
      var casted = items[i].asMultipleChoiceItem()
      casted.setChoiceValues(releaseList());
    }
  }
}

function testForm() {
  updateForm("14wMYzT47E__EW32GASiR2CaD7u5xeH5PefA_UggOLu0") 
}
