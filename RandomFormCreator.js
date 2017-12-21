function makeNewForm(title) {
  var form = FormApp.create(title);
  return form
}

function addMultipleChoice(form,question,options) {

  var q=  form.addMultipleChoiceItem().setTitle(question);
  
  var choiceList=[]
  for ( var i in options ) {
    var o = options[i]
    choiceList.push(q.createChoice(o,false))
  }
  
  q.setChoices(choiceList)
}

function testForm() {
  var form = makeNewForm("Clang tidy for CMSSW survey")

  var clingParams=["boost-use-to-string","cert-dcl50-cpp","cert-env33-c",
                   "cert-err34-c","cert-err52-cpp","cert-err58-cpp","cert-err60-cpp",
                   "cert-flp30-c","cert-msc50-cpp","clang-analyzer-apiModeling.google.GTest",
                   "clang-analyzer-core.CallAndMessage","clang-analyzer-core.DivideZero","clang-analyzer-core.DynamicTypePropagation",
                   "clang-analyzer-core.NonNullParamChecker","clang-analyzer-core.NullDereference","clang-analyzer-core.StackAddressEscape",
                   "clang-analyzer-core.UndefinedBinaryOperatorResult","clang-analyzer-core.VLASize","clang-analyzer-core.builtin.BuiltinFunctions",
                   "clang-analyzer-core.builtin.NoReturnFunctions","clang-analyzer-core.uninitialized.ArraySubscript",
                   "clang-analyzer-core.uninitialized.Assign","clang-analyzer-core.uninitialized.Branch",
                   "clang-analyzer-core.uninitialized.CapturedBlockVariable","clang-analyzer-core.uninitialized.UndefReturn",
                   "clang-analyzer-cplusplus.NewDelete","clang-analyzer-cplusplus.NewDeleteLeaks","clang-analyzer-cplusplus.SelfAssignment",
                   "clang-analyzer-deadcode.DeadStores","clang-analyzer-llvm.Conventions","clang-analyzer-nullability.NullPassedToNonnull",
                   "clang-analyzer-nullability.NullReturnedFromNonnull","clang-analyzer-nullability.NullableDereferenced",
                   "clang-analyzer-nullability.NullablePassedToNonnull","clang-analyzer-nullability.NullableReturnedFromNonnull",
                   "clang-analyzer-optin.cplusplus.VirtualCall","clang-analyzer-optin.mpi.MPI-Checker",
                   "clang-analyzer-optin.osx.cocoa.localizability.EmptyLocalizationContextChecker",
                   "clang-analyzer-optin.osx.cocoa.localizability.NonLocalizedStringChecker","clang-analyzer-optin.performance.Padding",
                   "clang-analyzer-osx.API","clang-analyzer-osx.NumberObjectConversion","clang-analyzer-osx.ObjCProperty",
                   "clang-analyzer-osx.SecKeychainAPI","clang-analyzer-osx.cocoa.AtSync","clang-analyzer-osx.cocoa.ClassRelease",
                   "clang-analyzer-osx.cocoa.Dealloc","clang-analyzer-osx.cocoa.IncompatibleMethodTypes","clang-analyzer-osx.cocoa.Loops",
                   "clang-analyzer-osx.cocoa.MissingSuperCall","clang-analyzer-osx.cocoa.NSAutoreleasePool","clang-analyzer-osx.cocoa.NSError",
                   "clang-analyzer-osx.cocoa.NilArg","clang-analyzer-osx.cocoa.NonNilReturnValue","clang-analyzer-osx.cocoa.ObjCGenerics",
                   "clang-analyzer-osx.cocoa.RetainCount","clang-analyzer-osx.cocoa.SelfInit","clang-analyzer-osx.cocoa.SuperDealloc",
                   "clang-analyzer-osx.cocoa.UnusedIvars","clang-analyzer-osx.cocoa.VariadicMethodTypes","clang-analyzer-osx.coreFoundation.CFError",
                   "clang-analyzer-osx.coreFoundation.CFNumber","clang-analyzer-osx.coreFoundation.CFRetainRelease",
                   "clang-analyzer-osx.coreFoundation.containers.OutOfBounds",
                   "clang-analyzer-osx.coreFoundation.containers.PointerSizedValues","clang-analyzer-security.FloatLoopCounter",
                   "clang-analyzer-security.insecureAPI.UncheckedReturn","clang-analyzer-security.insecureAPI.getpw",
                   "clang-analyzer-security.insecureAPI.gets","clang-analyzer-security.insecureAPI.mkstemp",
                   "clang-analyzer-security.insecureAPI.mktemp","clang-analyzer-security.insecureAPI.rand",
                   "clang-analyzer-security.insecureAPI.strcpy","clang-analyzer-security.insecureAPI.vfork",
                   "clang-analyzer-unix.API","clang-analyzer-unix.Malloc","clang-analyzer-unix.MallocSizeof",
                   "clang-analyzer-unix.MismatchedDeallocator","clang-analyzer-unix.StdCLibraryFunctions",
                   "clang-analyzer-unix.Vfork","clang-analyzer-unix.cstring.BadSizeArg","clang-analyzer-unix.cstring.NullArg",
                   "cppcoreguidelines-c-copy-assignment-signature","cppcoreguidelines-interfaces-global-init",
                   "cppcoreguidelines-no-malloc","cppcoreguidelines-pro-bounds-array-to-pointer-decay",
                   "cppcoreguidelines-pro-bounds-constant-array-index (has options)","cppcoreguidelines-pro-bounds-pointer-arithmetic",
                   "cppcoreguidelines-pro-type-const-cast","cppcoreguidelines-pro-type-cstyle-cast",
                   "cppcoreguidelines-pro-type-member-init (has options)","cppcoreguidelines-pro-type-reinterpret-cast",
                   "cppcoreguidelines-pro-type-static-cast-downcast","cppcoreguidelines-pro-type-union-access",
                   "cppcoreguidelines-pro-type-vararg","cppcoreguidelines-slicing","cppcoreguidelines-special-member-functions",
                   "google-build-explicit-make-pair","google-build-namespaces (has options)","google-build-using-namespace",
                   "google-default-arguments","google-explicit-constructor","google-global-names-in-headers (has options)",
                   "google-readability-casting",
                   "google-readability-todo",
                   "google-runtime-int (has options)","google-runtime-member-string-references","google-runtime-memset","google-runtime-operator",
                   "google-runtime-references (has options)","llvm-header-guard (has options)","llvm-include-order","llvm-namespace-comment (has options)","llvm-twine-local",
                   "misc-argument-comment (has options)","misc-assert-side-effect (has options)","misc-bool-pointer-implicit-conversion","misc-dangling-handle (has options)",
                   "misc-definitions-in-headers (has options)","misc-fold-init-type","misc-forward-declaration-namespace","misc-inaccurate-erase",
                   "misc-incorrect-roundings","misc-inefficient-algorithm","misc-macro-parentheses","misc-macro-repeated-side-effects",
                   "misc-misplaced-const","misc-misplaced-widening-cast (has options)","misc-move-const-arg","misc-move-constructor-init (has options)",
                   "misc-move-forwarding-reference","misc-multiple-statement-macro","misc-new-delete-overloads",
                   "misc-noexcept-move-constructor","misc-non-copyable-objects","misc-redundant-expression",
                   "misc-sizeof-container","misc-sizeof-expression","misc-static-assert","misc-string-compare",
                   "misc-string-constructor (has options)","misc-string-integer-assignment (has options)","misc-string-literal-with-embedded-nul",
                   "misc-suspicious-enum-usage (has options)","misc-suspicious-missing-comma","misc-suspicious-semicolon",
                   "misc-suspicious-string-compare (has options)","misc-swapped-arguments","misc-throw-by-value-catch-by-reference (has options)",
                   "misc-unconventional-assign-operator","misc-undelegated-constructor","misc-uniqueptr-reset-release",
                   "misc-unused-alias-decls","misc-unused-parameters","misc-unused-raii","misc-unused-using-decls",
                   "misc-use-after-move","misc-virtual-near-miss","modernize-avoid-bind","modernize-deprecated-headers",
                   "modernize-loop-convert","modernize-make-shared","modernize-make-unique","modernize-pass-by-value (has options)",
                   "modernize-raw-string-literal","modernize-redundant-void-arg","modernize-replace-auto-ptr (has options)",
                   "modernize-shrink-to-fit","modernize-use-auto (has options)","modernize-use-bool-literals","modernize-use-default-member-init (has options)",
                   "modernize-use-emplace (has options)","modernize-use-equals-default","modernize-use-equals-delete","modernize-use-nullptr (has options)",
                   "modernize-use-override","modernize-use-transparent-functors (has options)","modernize-use-using","mpi-buffer-deref",
                   "mpi-type-mismatch","performance-faster-string-find (has options)","performance-for-range-copy (has options)",
                   "performance-implicit-cast-in-loop","performance-inefficient-string-concatenation (has options)",
                   "performance-type-promotion-in-math-fn","performance-unnecessary-copy-initialization",
                   "performance-unnecessary-value-param (has options)","readability-avoid-const-params-in-decls",
                   "readability-braces-around-statements (has options)","readability-container-size-empty","readability-delete-null-pointer",
                   "readability-deleted-default","readability-else-after-return","readability-function-size (has options)",
                   "readability-identifier-naming","readability-implicit-bool-cast (has options)",
                   "readability-inconsistent-declaration-parameter-name","readability-misplaced-array-index",
                   "readability-named-parameter","readability-non-const-parameter","readability-redundant-control-flow",
                   "readability-redundant-declaration","readability-redundant-function-ptr-dereference",
                   "readability-redundant-member-init","readability-redundant-smasrtptr-get","readability-redundant-string-cstr",
                   "readability-redundant-string-init","readability-simplify-boolean-expr (has options)",
                   "readability-static-definition-in-anonymous-namespace","readability-uniqueptr-delete-release"]
                   
  //clingParams=['dud','diddddd']
  
  
  var item=form.addGridItem();
  var options=["Prefer to enable","Prefer to disable","No opinion"]
  var gridValidation = FormApp.createGridValidation().requireLimitOneResponsePerColumn().build();
  item.setTitle("Should we enable these options in cling-tidy").setRows(clingParams).setColumns(options).setValidation(gridValidation)
  
  var formResponse = form.createResponse();
  var items = form.getItems();
  var answers=[]
  for ( var i in clingParams) {
    answers.push("No opinion")
  }
  var response=items[0].asGridItem().createResponse(answers)
  formResponse.withItemResponse(response)
  Logger.log(formResponse.toPrefilledUrl())
  Logger.log(formResponse.toPrefilledUrl().length)
  
  form.addParagraphTextItem().setTitle("Comments about any of the answers")

  Logger.log(form.getPublishedUrl())
  var url1 = UrlShortener.Url.insert({
    longUrl: form.getPublishedUrl()
  });
  Logger.log('Shortened URL is "%s".', url1.id);

 
  
  Logger.log('Published URL: ' + form.getPublishedUrl());
  Logger.log('Editor URL: ' + form.getEditUrl());

  /*
  var urlTS=formResponse.toPrefilledUrl().split('&')
  Logger.log(urlTS.length)
  var urlTmp=''
  Logger.log("looping")
  var j=0
  for ( var i in urlTS) {
    Logger.log(urlTS[i])
    Logger.log(urlTmp.length)
    if ( i==0 ) { 
      urlTmp=urlTS[i] 
    }
    else{
      if ( j==0 ) {
        urlTmp=urlTmp+"?"+urlTS[i]
        j=j+1
      }
      else{
        urlTmp=urlTmp+"&"+urlTS[i]
        j=j+1
      }
    }
    Logger.log(urlTmp)
    if ( urlTmp.length>1900) {
      break
      var url3 = UrlShortener.Url.insert({
        longUrl: urlTmp
      });
      Logger.log('Shortened URL is "%s".', url3.id);
      urlTmp=url3.id
      j=0
    }
  }
  Logger.log(urlTmp)
  var url2 = UrlShortener.Url.insert({
    longUrl: urlTmp
  });
  Logger.log('Shortened URL is "%s".', url2.id);
*/

}

function getPrefilled() {
  var form = FormApp.openById('1zonWNlRqUM80MLBsaprDPWBKfwg2aRLy_NgvEj0y9KE');
  var formResponse = form.createResponse();
  var items = form.getItems();
  var answers=[]
  var item=items[1].asGridItem()
  
  for ( var i in item.getRows()) {
    answers.push("No opinion")
  }
  var response=item.createResponse(answers)
  formResponse.withItemResponse(response)
  Logger.log(formResponse.toPrefilledUrl())
}